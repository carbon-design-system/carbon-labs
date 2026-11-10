/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Plans the import of a whole package (`--package <id>`): its tree as it is,
// with the same license, leak and motion checks as a component, its imports
// of the source's packages renamed, and a package.json, tsconfig and vitest
// config of its own.

import fs from 'node:fs';
import path from 'node:path';
import { CONFIG } from './config.js';
import {
  escapeMdx,
  flattenLinks,
  parseDoc,
  scanLeaks,
  sortSections,
  stripPointers,
} from './doc.js';
import { listFiles, readAt, resolveRef } from './git.js';
import {
  UsageError,
  fixWritten,
  isOneOf,
  motionLiterals,
  namesFrom,
  recordManifest,
  sourcePointers,
} from './importer.js';
import { langOf, lineOf } from './regions.js';
import {
  escapeRegExp,
  licenseHeader,
  parseImports,
  replaceSpecifiers,
} from './rewrite.js';

const posix = path.posix;

/**
 * The package a bare specifier names.
 *
 * @param {string} spec The specifier.
 * @returns {string} The package name.
 */
function packageOf(spec) {
  const parts = spec.split('/');
  return spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

/**
 * Whether a specifier matches one of these: a package (or a subpath of it)
 * or a pattern.
 *
 * @param {string} spec The specifier.
 * @param {(string | RegExp)[]} list The packages and patterns.
 * @returns {boolean} Whether it does.
 */
function matches(spec, list) {
  return list.some((x) =>
    typeof x === 'string' ? isOneOf(spec, [x]) : x.test(spec)
  );
}

/**
 * The file a relative import names among the package's files, tried with the
 * extensions TypeScript resolves.
 *
 * @param {string} resolved The import, relative to the package.
 * @param {Set<string>} files The package's files.
 * @returns {string | null} The file.
 */
function resolveFile(resolved, files) {
  const tries = [
    resolved,
    `${resolved}.ts`,
    `${resolved}.tsx`,
    `${resolved}.js`,
    `${resolved}.d.ts`,
    `${resolved}/index.ts`,
    `${resolved}/index.tsx`,
  ];
  if (/\.js$/.test(resolved)) {
    tries.push(
      resolved.replace(/\.js$/, '.ts'),
      resolved.replace(/\.js$/, '.tsx')
    );
  }
  return tries.find((t) => files.has(t)) ?? null;
}

/**
 * The seam's range for a carbon-motion package, from another folder: a
 * `portal:` path re-rooted there, or the range as it is.
 *
 * @param {string} labs The carbon-labs checkout.
 * @param {string} name The package.
 * @param {string} to The importing package's folder in the checkout.
 * @returns {string} The range.
 */
function seamRange(labs, name, to) {
  const file = path.join(labs, CONFIG.seam.packageJson);
  let range;
  try {
    range = JSON.parse(fs.readFileSync(file, 'utf8')).dependencies?.[name];
  } catch {
    range = undefined;
  }
  const m = range && /^(portal|link|file):(.+)$/.exec(range);
  if (!m) {
    return range ?? '*';
  }
  const target = path.resolve(path.dirname(file), m[2]);
  return `${m[1]}:${path.relative(path.join(labs, to), target)}`;
}

/**
 * A package's version range, as the checkout's root or React package has it.
 *
 * @param {string} labs The carbon-labs checkout.
 * @param {string} name The package.
 * @returns {string} The range.
 */
function versionOf(labs, name) {
  for (const rel of CONFIG.versionsFrom) {
    try {
      const p = JSON.parse(fs.readFileSync(path.join(labs, rel), 'utf8'));
      const v = p.dependencies?.[name] ?? p.devDependencies?.[name];
      if (v) {
        return v;
      }
    } catch {
      // The next one.
    }
  }
  return '*';
}

/**
 * Where a file of another package the tool brings lands in the checkout,
 * when it travels.
 *
 * @param {string} file The file, as a source repository path.
 * @param {string} from The source repository.
 * @param {string} sha The source commit.
 * @returns {string | null} Its path in the checkout.
 */
function elsewhere(file, from, sha) {
  for (const other of Object.values(CONFIG.packages)) {
    for (const [root, to] of Object.entries(other.roots)) {
      const dir = `${other.from}/${root}`;
      if (!file.startsWith(`${dir}/`)) {
        continue;
      }
      const inRoot = file.slice(dir.length + 1);
      const hit = [inRoot, `${inRoot}.ts`, `${inRoot}.tsx`, `${inRoot}.js`]
        .map((r) => ({ r, rel: `${root}/${r}` }))
        .find(
          ({ rel }) =>
            readAt(from, sha, `${other.from}/${rel}`) !== null &&
            !other.skip.some((re) => re.test(rel))
        );
      if (hit) {
        return posix.join(other.to, to ? `${to}/${hit.r}` : hit.r);
      }
    }
  }
  return null;
}

/**
 * Where a source folder or file of a package the tool brings lands in the
 * checkout: under its target, by its root.
 *
 * @param {string} p The path, in the source repository.
 * @returns {string | null} Its path in the checkout.
 */
function landsAt(p) {
  for (const other of Object.values(CONFIG.packages)) {
    for (const [root, to] of Object.entries(other.roots)) {
      const dir = `${other.from}/${root}`;
      if (p === dir || p.startsWith(`${dir}/`)) {
        const rest = p.slice(dir.length + 1);
        return posix.join(other.to, to, rest);
      }
    }
  }
  return null;
}

/**
 * A test's other specifiers: the modules its mocks name (`vi.mock`,
 * `vi.importActual` and the like), renamed as its imports are, and the paths
 * it reads that reach into another package the tool brings, re-rooted at
 * that package's target.
 *
 * @param {string} text The test's source.
 * @param {{ source: string, to: string }} f The file.
 * @param {object} o What the rewrite needs.
 * @param {string} o.from The source repository.
 * @param {string} o.sha The source commit.
 * @param {object} o.spec The package's config.
 * @param {(kind: string, where: string, detail: string) => void} o.finding Records a finding.
 * @param {(kind: string) => void} o.bump Counts a rewrite.
 * @returns {string} The source.
 */
function testSpecifiers(text, f, { spec, finding, bump }) {
  const mock =
    /\bvi\.(?:mock|doMock|unmock|doUnmock|importActual|importMock)\s*(?:<[^>]*>)?\(\s*(['"])([^'"\n]+)\1/g;
  let out = text.replace(mock, (m, q, s, at) => {
    const pkg = packageOf(s);
    if (s.startsWith('.') || !pkg.startsWith('@carbon-next/')) {
      return m;
    }
    const to = CONFIG.packageMap[pkg];
    if (!to) {
      finding(
        'unmapped import',
        `${f.to}:${lineOf(text, at)}`,
        `${s} (in a mock)`
      );
      return m;
    }
    bump('source package → lane package (mock)');
    return m.replace(`${q}${s}${q}`, `${q}${to}${s.slice(pkg.length)}${q}`);
  });
  // A path out of the package, as a string: re-rooted when it lands in one
  // the tool brings.
  out = out.replace(/(['"])((?:\.\.\/){2,}[\w./-]+)\1/g, (m, q, s) => {
    const repo = posix.normalize(posix.join(posix.dirname(f.source), s));
    if (repo.startsWith(`${spec.from}/`) || repo.startsWith('../')) {
      return m;
    }
    const target = landsAt(repo);
    if (!target) {
      return m;
    }
    const rel = posix.relative(
      posix.dirname(posix.join(spec.to, f.to)),
      target
    );
    bump('another lane package, by path');
    return `${q}${rel}${q}`;
  });
  return out;
}

/**
 * A relative specifier from one file to another in the target, in the
 * original's style: its extension, or none, and a folder's index named only
 * when it was.
 *
 * @param {string} from The importing file, in the target.
 * @param {string} to The imported file, in the target.
 * @param {string} original The original specifier.
 * @returns {string} The specifier.
 */
function relativeTo(from, to, original) {
  let rel = posix.relative(posix.dirname(from), to);
  if (!/\.(tsx?|jsx?|mjs|json|s?css)$/.test(original)) {
    rel = rel.replace(/\.(tsx?|js)$/, '');
    if (!/\/index$/.test(original)) {
      rel = rel.replace(/(^|\/)index$/, '$1').replace(/\/$/, '') || '.';
    }
  }
  return rel.startsWith('.') ? rel : `./${rel}`;
}

/**
 * A source's other mentions of the source's packages (in strings, code
 * samples and comments) by their lane names.
 *
 * @param {string} text The source.
 * @param {() => void} count Counts one.
 * @returns {string} The source.
 */
function renamePackages(text, count) {
  // The source's own packages, and carbon-motion's by their published names.
  const map = { ...CONFIG.seam.published, ...CONFIG.packageMap };
  const names = Object.keys(map).sort((a, b) => b.length - a.length);
  const re = new RegExp(
    `(${names.map((n) => escapeRegExp(n)).join('|')})(?![\\w-])`,
    'g'
  );
  return text.replace(re, (m) => {
    count();
    return map[m];
  });
}

/**
 * A source with the web components' names as the lane has them, when the
 * package's config asks (`renames: 'elements'`).
 *
 * @param {string} text The source.
 * @param {object} spec The package's config.
 * @param {(kind: string) => void} count Counts a rename.
 * @returns {string} The source.
 */
function renameElements(text, spec, count) {
  if (spec.renames !== 'elements') {
    return text;
  }
  let out = text;
  for (const [re, to] of CONFIG.elementRenames) {
    out = out.replace(re, (...m) => {
      count('element name renamed');
      return to.replace(/\$(\d)/g, (_, i) => m[Number(i)]);
    });
  }
  return out;
}

/**
 * A story file as the lane has its stories: its title under the package's,
 * and tagged `alpha`.
 *
 * @param {string} text The story's source.
 * @param {object} spec The package's config.
 * @returns {string} The source.
 */
function laneStory(text, spec) {
  const tagged = /\btags:/.test(text);
  // The meta's title, on its own line or inline (`{ title: '…' }`).
  return text.replace(
    /^(\s*)title:\s*(['"])([^'"]+)\2,\n|(\btitle:\s*)(['"])([^'"]+)\5/m,
    (m, indent, q, title, inline, q2, title2) => {
      const own =
        (title ?? title2).split('/').slice(1).join('/') || (title ?? title2);
      const to = `${spec.stories.title}/${own}`;
      if (inline !== undefined) {
        return `${inline}${q2}${to}${q2}${tagged ? '' : `, tags: ['alpha']`}`;
      }
      return `${indent}title: ${q}${to}${q},\n${tagged ? '' : `${indent}tags: ['alpha'],\n`}`;
    }
  );
}

/**
 * The package's docs page from its component doc: the sections that travel,
 * the opening text without its pointers into the source.
 *
 * @param {string} md The doc.
 * @param {object} spec The package's config.
 * @returns {string} The MDX.
 */
function docsPage(md, spec) {
  const cfg = CONFIG;
  const doc = parseDoc(md);
  const { kept } = sortSections(doc.sections, cfg.docSections);
  const parts = [
    `import { Meta } from '@storybook/addon-docs/blocks';`,
    '',
    `<Meta title="${spec.stories.title}/Overview" />`,
    '',
    `# ${escapeMdx(doc.title)}`,
  ];
  for (const sec of kept) {
    let body = sec.body;
    if (sec.heading === 'Summary') {
      body = stripPointers(body, cfg.pointerWords).text;
    }
    body = flattenLinks(body).text;
    parts.push('');
    if (sec.heading !== 'Summary') {
      parts.push(`## ${escapeMdx(sec.heading)}`, '');
    }
    parts.push(escapeMdx(body));
  }
  return `${parts.join('\n')}\n`;
}

/**
 * The plan for importing one whole package.
 *
 * @param {object} opts The options.
 * @param {string} opts.id The package's id in the config.
 * @param {string} opts.from The source repository.
 * @param {string} opts.ref The source commit.
 * @param {string} opts.labs The carbon-labs checkout.
 * @param {string[]} [opts.names] More names that never go public.
 * @param {number} [opts.year] The license year.
 * @returns {object} The plan.
 */
export function planPackage(opts) {
  const cfg = CONFIG;
  const { id, from, labs } = opts;
  const spec = cfg.packages[id];
  if (!spec) {
    throw new UsageError(
      `"${id}" is not a package the tool brings: ${Object.keys(cfg.packages).join(', ')}`
    );
  }
  const year = opts.year ?? new Date().getFullYear();
  const sha = resolveRef(from, opts.ref);
  if (!sha) {
    throw new UsageError(`${opts.ref} is not a commit in ${from}`);
  }
  const names = [
    ...namesFrom(readAt(from, sha, cfg.source.names)),
    ...(opts.names ?? []),
  ];

  // Every file under the package's roots, by its path in the target.
  const all = [];
  for (const [root, to] of Object.entries(spec.roots)) {
    const dir = `${spec.from}/${root}`;
    for (const f of listFiles(from, sha, dir)) {
      const rel = f.slice(spec.from.length + 1);
      const inRoot = f.slice(dir.length + 1);
      // Stories and what only they render go to `__stories__/`, flat.
      const story = (spec.stories?.files ?? []).some((re) => re.test(rel));
      all.push({
        source: f,
        rel,
        to: story
          ? `__stories__/${posix.basename(inRoot)}`
          : to
            ? `${to}/${inRoot}`
            : inRoot,
        story,
      });
    }
  }
  if (!all.length) {
    throw new UsageError(
      `${spec.from} has no files under ${Object.keys(spec.roots).join(', ')} at ${sha.slice(0, 7)}`
    );
  }
  // Story files from another of the source's folders, into `__stories__/`.
  for (const extra of spec.stories?.extra ?? []) {
    for (const file of listFiles(from, sha, extra.from)) {
      const name = posix.basename(file);
      if (extra.files.some((re) => re.test(name))) {
        all.push({
          source: file,
          rel: file,
          to: `__stories__/${name}`,
          story: true,
          extra,
        });
      }
    }
  }
  const travels = all.filter((f) => !spec.skip.some((re) => re.test(f.rel)));
  const files = new Set(travels.map((f) => f.to));
  // Relative imports resolve among the source's files, then point at where
  // those land.
  const bySource = new Map(travels.map((f) => [f.rel, f.to]));
  const sourceFiles = new Set(bySource.keys());
  const skippedFiles = new Set(
    all.filter((f) => !files.has(f.to)).map((f) => f.rel)
  );

  const plan = {
    kind: 'package',
    id,
    name: spec.name,
    source: { repo: cfg.source.name, ref: sha, path: spec.from },
    target: spec.to,
    files: travels.length,
    skipped: all.filter((f) => !files.has(f.to)).map((f) => f.rel),
    rewrites: { imports: {}, license: {} },
    dependencies: { packages: [], external: [], test: [] },
    warnings: [],
    findings: [],
    outputs: [],
    manifest: null,
  };
  /**
   * Records something that refuses the write.
   *
   * @param {string} kind The kind.
   * @param {string} where The file and line.
   * @param {string} detail What it is.
   */
  function finding(kind, where, detail) {
    plan.findings.push({ kind, where, detail });
  }
  /**
   * Adds to a count.
   *
   * @param {Record<string, number>} counts The counts.
   * @param {string} key The key.
   */
  function bump(counts, key) {
    counts[key] = (counts[key] ?? 0) + 1;
  }
  /**
   * Counts one import rewrite.
   *
   * @param {string} kind The kind.
   */
  function countImport(kind) {
    bump(plan.rewrites.imports, kind);
  }
  /**
   * Whether a file in the target is a test or a test's helper.
   *
   * @param {string} to The file.
   * @returns {boolean} Whether it is.
   */
  function isTest(to) {
    return (
      spec.tests.some((p) => to.startsWith(p)) || /\.test\.(tsx?|js)$/.test(to)
    );
  }

  const packages = new Set();
  const devPackages = new Set();
  const external = new Set();
  const testExternal = new Set();
  const testOnly = [...cfg.testOnly, ...cfg.packageTestOnly];
  const allowed = {};
  let pointers = 0;
  let docRefs = 0;
  for (const f of travels) {
    let text = readAt(from, sha, f.source) ?? '';
    const lang = langOf(f.to);
    const test = isTest(f.to);
    const dev = test || f.story;
    if (lang === 'ts') {
      const imports = parseImports(text, lang);
      for (const imp of imports) {
        const s = imp.spec;
        const where = `${f.to}:${lineOf(text, imp.start)}`;
        let kind;
        const mapped = f.extra?.imports.find(([re]) => re.test(s));
        if (mapped) {
          imp.to = s.replace(mapped[0], mapped[1]);
          devPackages.add(packageOf(imp.to));
          bump(plan.rewrites.imports, "another package's file, by its export");
          continue;
        }
        if (s.startsWith('.')) {
          const resolved = posix.normalize(posix.join(posix.dirname(f.rel), s));
          if (resolved.startsWith('../')) {
            // Another package the tool brings: the path between their targets.
            const other = elsewhere(
              posix.normalize(posix.join(posix.dirname(f.source), s)),
              from,
              sha
            );
            if (!other) {
              finding('import outside the package', where, s);
              continue;
            }
            const rel = posix.relative(
              posix.dirname(posix.join(spec.to, f.to)),
              other.replace(/\.(tsx?|js)$/, '')
            );
            imp.to = rel.startsWith('.') ? rel : `./${rel}`;
            kind = 'another lane package, by path';
            bump(plan.rewrites.imports, kind);
            continue;
          }
          const hit = resolveFile(resolved, sourceFiles);
          if (!hit) {
            const left = resolveFile(resolved, skippedFiles);
            finding(
              left
                ? 'import of a file that does not travel'
                : 'unresolved import',
              where,
              left ? `${s} (${left})` : s
            );
            continue;
          }
          const moved = relativeTo(f.to, bySource.get(hit), s);
          if (moved !== s) {
            imp.to = moved;
            kind = 'inside the package, moved';
          } else {
            kind = 'inside the package';
          }
        } else if (cfg.packageMap[packageOf(s)]) {
          const to = cfg.packageMap[packageOf(s)];
          imp.to = to + s.slice(packageOf(s).length);
          (dev ? devPackages : packages).add(to);
          kind = 'source package → lane package';
        } else if (
          spec.kind === 'lane' &&
          cfg.seam.from.some((re) => re.test(s))
        ) {
          // A lane package reaches carbon-motion through the seam.
          imp.to = cfg.seam.js;
          (dev ? devPackages : packages).add(cfg.seam.js);
          kind = 'motion → seam';
        } else if (cfg.seam.published?.[packageOf(s)]) {
          // carbon-motion, by its published name.
          const to = cfg.seam.published[packageOf(s)];
          imp.to = to + s.slice(packageOf(s).length);
          (dev ? testExternal : external).add(to);
          kind = 'motion, by its published name';
        } else if (matches(s, Object.keys(cfg.packageDependencies))) {
          (dev ? testExternal : external).add(packageOf(s));
          kind = 'unchanged (dependency)';
        } else if (s === 'react' || s.startsWith('react/')) {
          (test ? testExternal : external).add('react');
          kind = 'unchanged';
        } else if (isOneOf(s, cfg.passthrough)) {
          (dev ? testExternal : external).add(packageOf(s));
          kind = 'unchanged';
        } else if (f.story && /^@storybook\//.test(s)) {
          // The repository's Storybook provides it.
          kind = 'unchanged (story)';
        } else if (test && packageOf(s) in (spec.testOnly ?? {})) {
          testExternal.add(packageOf(s));
          kind = 'unchanged (test)';
        } else if (matches(s, testOnly)) {
          if (!test) {
            finding(
              'unmapped import',
              where,
              `${s} (test-only, in a package file)`
            );
            continue;
          }
          if (!s.startsWith('node:')) {
            testExternal.add(packageOf(s));
          }
          kind = 'unchanged (test)';
        } else {
          finding('unmapped import', where, s);
          continue;
        }
        bump(plan.rewrites.imports, kind);
      }
      text = replaceSpecifiers(text, imports);
      text = renamePackages(text, () =>
        bump(plan.rewrites.imports, 'source package named in text')
      );
      if (f.story) {
        text = laneStory(text, spec);
      }
      if (test) {
        text = testSpecifiers(text, f, {
          from,
          sha,
          spec,
          finding,
          bump: countImport,
        });
      }
      const literals = motionLiterals(text, lang, test);
      for (const l of literals.found) {
        const ok = (spec.literals ?? []).find(
          (a) => a.file.test(f.to) && a.match.test(l.match)
        );
        if (ok) {
          bump(allowed, `${f.to}: ${l.match} (${ok.why})`);
        } else {
          finding('motion literal', `${f.to}:${l.line}`, l.match);
        }
      }
      const p = sourcePointers(text, lang);
      pointers += p.pointers;
      docRefs += p.docRefs;
    }
    if (lang !== 'ts') {
      text = renamePackages(text, () =>
        countImport('source package named in text')
      );
    }
    text = renameElements(text, spec, countImport);
    const licensed = licenseHeader(text, lang, year);
    text = licensed.text;
    bump(plan.rewrites.license, licensed.action);
    for (const leak of scanLeaks(text, names)) {
      finding(`leak (${leak.kind})`, `${f.to}:${leak.line}`, leak.match);
    }
    plan.outputs.push({ path: f.to, content: text });
  }
  for (const [k, n] of Object.entries(allowed)) {
    plan.warnings.push(`allowed literal ×${n}: ${k}`);
  }
  if (pointers || docRefs) {
    plan.warnings.push(
      `comments name the source repo ${pointers}× and its docs ${docRefs}×`
    );
  }

  // Files at the package's root that travel as they are, renamed.
  for (const file of spec.rootFiles ?? []) {
    const src = readAt(from, sha, `${spec.from}/${file}`);
    if (src === null) {
      finding('unresolved import', file, `${spec.from}/${file} is missing`);
      continue;
    }
    const text = renameElements(
      renamePackages(src, () => {}),
      spec,
      countImport
    );
    for (const leak of scanLeaks(text, names)) {
      finding(`leak (${leak.kind})`, `${file}:${leak.line}`, leak.match);
    }
    plan.outputs.push({ path: file, content: text });
  }

  // The package's own files.
  const generated = plan.outputs.length;
  const header = licenseHeader('', 'ts', year).text.trimEnd();
  const dependencies = {};
  for (const name of [...packages].sort()) {
    dependencies[name] = 'workspace:*';
  }
  for (const name of [...external].sort()) {
    if (name === 'react') {
      continue;
    }
    const range = cfg.packageDependencies[name] ?? versionOf(labs, name);
    dependencies[name] =
      range === 'seam' ? seamRange(labs, name, spec.to) : range;
  }
  const peers = external.has('react')
    ? { react: '^18.2.0 || ^19.0.0', 'react-dom': '^18.2.0 || ^19.0.0' }
    : {};
  // A package's tests run in jsdom, as they do in the source.
  const devDependencies = { ...cfg.testRunner, jsdom: '^26.0.0' };
  for (const name of [...devPackages].sort()) {
    if (!(name in dependencies)) {
      devDependencies[name] = 'workspace:*';
    }
  }
  for (const name of [...testExternal, 'typescript', 'rimraf'].sort()) {
    if (!(name in devDependencies) && !(name in dependencies)) {
      const range = spec.testOnly?.[name] ?? cfg.packageDependencies[name];
      devDependencies[name] =
        range && range !== 'seam' ? range : versionOf(labs, name);
    }
  }
  if (testExternal.has('react') || external.has('react')) {
    for (const name of ['react', 'react-dom']) {
      devDependencies[name] = versionOf(labs, name);
    }
  }
  plan.dependencies = {
    packages: [...packages].sort(),
    external: [...external].sort(),
    test: [...testExternal].sort(),
  };
  plan.outputs.push(
    {
      path: 'package.json',
      content: packageJsonFor(spec, { dependencies, peers, devDependencies }),
    },
    { path: 'tsconfig.json', content: tsconfigFor(spec) },
    { path: 'vitest.config.ts', content: vitestFor(spec, header) }
  );
  if (spec.stories?.doc) {
    const md = readAt(from, sha, spec.stories.doc);
    if (md) {
      plan.outputs.push({
        path: `__stories__/${spec.stories.name}.mdx`,
        content: docsPage(md, spec),
      });
    } else {
      plan.warnings.push(`no doc at ${spec.stories.doc}`);
    }
  }
  if (spec.kind === 'core') {
    plan.outputs.push(
      { path: 'tsconfig.build.json', content: tsconfigBuild() },
      { path: 'scripts/extensions.js', content: extensionsScript(header) }
    );
  } else {
    const telemetry = path.join(labs, cfg.target.telemetry);
    if (fs.existsSync(telemetry)) {
      plan.outputs.push({
        path: 'telemetry.yml',
        content: fs.readFileSync(telemetry, 'utf8'),
      });
    } else {
      plan.warnings.push(`no telemetry config at ${cfg.target.telemetry}`);
    }
  }
  // A docs page may not point back at the source repository either.
  const SOURCE_REF =
    /@carbon-next\/[\w/-]*|\bCarbon Next\b|\bapps\/prototypes\b|\bpackages\/kit\b/g;
  for (const o of plan.outputs.slice(generated)) {
    for (const leak of scanLeaks(o.content, names)) {
      finding(`leak (${leak.kind})`, `${o.path}:${leak.line}`, leak.match);
    }
    if (/\.mdx?$/.test(o.path)) {
      for (const m of o.content.matchAll(SOURCE_REF)) {
        finding(
          'leak (source repository)',
          `${o.path}:${lineOf(o.content, m.index)}`,
          m[0]
        );
      }
    }
  }

  plan.manifest = {
    id: `package/${id}`,
    kind: 'package',
    path: spec.to,
    labsStatus: cfg.package.labsStatus,
    publishable: false,
    source: { repo: cfg.source.name, ref: sha, path: spec.from },
  };
  return plan;
}

/**
 * An object with its keys in order.
 *
 * @param {Record<string, string>} o The object.
 * @returns {Record<string, string>} The sorted object.
 */
function sorted(o) {
  return Object.fromEntries(
    Object.entries(o).sort(([a], [b]) => (a < b ? -1 : 1))
  );
}

/**
 * The package's package.json, `private` and `draft` until it is usable. A
 * core package is one ES module per source module under `es/`, every module
 * a subpath; a lane package builds as the lane's packages do.
 *
 * @param {object} spec The package's config.
 * @param {object} deps The dependencies.
 * @param {Record<string, string>} deps.dependencies The dependencies.
 * @param {Record<string, string>} deps.peers The peer dependencies.
 * @param {Record<string, string>} deps.devDependencies The dev dependencies.
 * @returns {string} The JSON.
 */
export function packageJsonFor(spec, { dependencies, peers, devDependencies }) {
  const pkg = CONFIG.package;
  const base = {
    name: spec.name,
    version: '0.0.0',
    private: pkg.private,
    type: 'module',
    description: spec.description,
    labs: {
      status: pkg.labsStatus,
      title: spec.title,
      ...(spec.entries?.length ? { entries: spec.entries } : {}),
    },
    license: 'Apache-2.0',
    repository: {
      type: 'git',
      url: 'https://github.com/carbon-design-system/carbon-labs',
      directory: spec.to,
    },
  };
  const json =
    spec.kind === 'core'
      ? {
          ...base,
          main: './es/index.js',
          module: './es/index.js',
          types: './es/index.d.ts',
          sideEffects: spec.sideEffects ?? false,
          ...(spec.customElements
            ? { customElements: spec.customElements }
            : {}),
          exports: spec.exports
            ? {
                '.': { types: './es/index.d.ts', default: './es/index.js' },
                ...Object.fromEntries(
                  Object.entries(spec.exports).map(([k, v]) => [
                    k,
                    /\.js$/.test(v)
                      ? { types: v.replace(/\.js$/, '.d.ts'), default: v }
                      : v,
                  ])
                ),
                './package.json': './package.json',
              }
            : {
                '.': { types: './es/index.d.ts', default: './es/index.js' },
                './engine': {
                  types: './es/engine/index.d.ts',
                  default: './es/engine/index.js',
                },
                './package.json': './package.json',
                './*': { types: './es/*.d.ts', default: './es/*.js' },
              },
          files: ['es', ...(spec.rootFiles ?? [])],
          scripts: {
            build: [
              'yarn clean',
              'tsc -p tsconfig.build.json',
              'node scripts/extensions.js',
              ...(spec.assets?.length
                ? [`cp ${spec.assets.join(' ')} es/`]
                : []),
            ].join(' && '),
            clean: 'rimraf es',
            test: 'vitest run',
          },
        }
      : {
          ...base,
          types: './es/index.d.ts',
          sideEffects: false,
          exports: {
            '.': { import: './es/index.js', require: './lib/index.js' },
            ...Object.fromEntries(
              (spec.entries ?? []).map((e) => {
                const n = e.replace(/\.tsx?$/, '');
                return [
                  `./${n}`,
                  {
                    types: `./es/${n}.d.ts`,
                    import: `./es/${n}.js`,
                    require: `./lib/${n}.js`,
                  },
                ];
              })
            ),
            './es/*': './es/*',
            './lib/*': './lib/*',
          },
          files: ['es', 'lib', 'telemetry.yml'],
          scripts: {
            build: 'node ../../../../tasks/build.js',
            clean: 'rimraf es lib',
            postinstall: 'ibmtelemetry --config=telemetry.yml',
            test: 'vitest run',
          },
        };
  if (spec.kind !== 'core') {
    dependencies = { '@ibm/telemetry-js': '^1.10.2', ...dependencies };
  }
  json.dependencies = sorted(dependencies);
  if (Object.keys(peers).length) {
    json.peerDependencies = sorted(peers);
  }
  json.devDependencies = sorted(devDependencies);
  return `${JSON.stringify(json, null, 2)}\n`;
}

/**
 * The package's tsconfig: strict, bundler resolution, the automatic JSX
 * runtime, the links to carbon-motion kept by their linked path; tests and
 * stories are left to their runners, which check them as they run.
 *
 * @param {object} spec The package's config.
 * @returns {string} The JSON.
 */
export function tsconfigFor(spec) {
  // A core package compiles with tsc alone, as the seam does; a lane package
  // takes the lane's base, which its build reads.
  const json = {
    ...(spec.kind === 'core'
      ? {}
      : { extends: 'typescript-config-carbon/tsconfig.base.json' }),
    compilerOptions: {
      target: 'ES2022',
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      jsx: 'react-jsx',
      strict: true,
      noImplicitAny: true,
      skipLibCheck: true,
      moduleResolution: 'bundler',
      preserveSymlinks: true,
      resolveJsonModule: true,
      isolatedModules: true,
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      ...spec.compilerOptions,
    },
    include: spec.kind === 'core' ? ['src'] : ['**/*.ts', '**/*.tsx'],
    exclude: [
      '**/__tests__/**',
      '**/__stories__/**',
      '**/*.test.ts',
      '**/*.test.tsx',
      'vitest.config.ts',
      'node_modules',
      'es',
      'lib',
    ],
  };
  return `${JSON.stringify(json, null, 2)}\n`;
}

/**
 * A core package's build tsconfig: JavaScript and declarations, one module
 * per source module, under `es/`.
 *
 * @returns {string} The JSON.
 */
function tsconfigBuild() {
  const json = {
    extends: './tsconfig.json',
    compilerOptions: {
      noEmit: false,
      declaration: true,
      rootDir: 'src',
      outDir: 'es',
    },
    include: ['src'],
  };
  return `${JSON.stringify(json, null, 2)}\n`;
}

/**
 * A core package's step after tsc: each relative import in `es/` names its
 * file (`./x.js`, `./x/index.js`), so the modules load in Node as well as in
 * a bundler; tsc keeps the source's extensionless specifiers.
 *
 * @param {string} header The license header.
 * @returns {string} The source.
 */
function extensionsScript(header) {
  return `${header}

// Gives each relative import in es/ its file, after tsc: \`./x\` is \`./x.js\`,
// or \`./x/index.js\` for a folder. Declarations too, so their types resolve
// the same way.

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? 'es');
const SPEC = /(\\bfrom\\s*|\\bimport\\s*\\(\\s*|\\bimport\\s+)(['"])(\\.{1,2}\\/[^'"]+)\\2/g;

/**
 * Every file under a folder.
 *
 * @param {string} dir The folder.
 * @returns {string[]} The files.
 */
function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory()
        ? walk(path.join(dir, e.name))
        : [path.join(dir, e.name)]
    );
}

/**
 * A relative specifier with its file named, or as it is when it names one.
 *
 * @param {string} file The importing file.
 * @param {string} spec The specifier.
 * @returns {string} The specifier.
 */
function named(file, spec) {
  if (/\\.(js|json|css)$/.test(spec)) {
    return spec;
  }
  const at = path.resolve(path.dirname(file), spec);
  if (fs.existsSync(\`\${at}.js\`)) {
    return \`\${spec}.js\`;
  }
  if (fs.existsSync(path.join(at, 'index.js'))) {
    return \`\${spec}/index.js\`;
  }
  throw new Error(\`\${path.relative(root, file)}: no module for \${spec}\`);
}

let changed = 0;
for (const file of walk(root).filter((f) => /\\.(js|d\\.ts)$/.test(f))) {
  const src = fs.readFileSync(file, 'utf8');
  const out = src.replace(SPEC, (m, lead, q, spec) => {
    const to = named(file, spec);
    return to === spec ? m : \`\${lead}\${q}\${to}\${q}\`;
  });
  if (out !== src) {
    fs.writeFileSync(file, out);
    changed += 1;
  }
}
console.log(\`extensions: \${changed} files\`);
`;
}

/**
 * The package's vitest config, from its settings in the config.
 *
 * @param {object} spec The package's config.
 * @param {string} header The license header.
 * @returns {string} The source.
 */
function vitestFor(spec, header) {
  // The packages the tool brings, and the motion packages, run inline with
  // the tests.
  const inline = [
    '/@carbon-labs\\/motion-/',
    ...Object.values(CONFIG.packageMap).map((n) => `/${escapeRegExp(n)}/`),
  ];
  const test = {
    environment: 'jsdom',
    ...spec.vitest,
    server: { deps: { inline: ['@@INLINE@@'] } },
  };
  const body = JSON.stringify(test, null, 2)
    .replace(/"([A-Za-z_$][\w$]*)":/g, '$1:')
    .replace(/"/g, "'")
    .replace("'@@INLINE@@'", inline.join(', '))
    .replace(/\n/g, '\n  ');
  return `${header}

import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Lane packages are workspace links; they, and the motion packages
  // behind the seam, run inline.
  resolve: { preserveSymlinks: true },
  test: ${body},
});
`;
}

/**
 * Writes a package plan into the checkout, or under `out` (`<out>/<folder>`,
 * the manifest beside it), and records it in the manifest. A package already
 * there is replaced only with `replace`: it is a re-import.
 *
 * @param {object} plan The plan.
 * @param {object} opts The options.
 * @param {string} opts.labs The carbon-labs checkout.
 * @param {string} [opts.out] Another directory to write to.
 * @param {boolean} [opts.replace] Replace a package already there.
 * @returns {{ dir: string, manifest: string }} Where it wrote.
 */
export function writePackage(plan, { labs, out, replace = false }) {
  const dir = out
    ? path.join(out, path.basename(plan.target))
    : path.join(labs, plan.target);
  if (!out && !replace && fs.existsSync(dir)) {
    throw new UsageError(
      `${plan.target} exists: re-import with --replace, or import with --out`
    );
  }
  // A re-import replaces the source's files; what the lane built stays.
  for (const name of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
    if (!['node_modules', 'es', 'lib'].includes(name)) {
      fs.rmSync(path.join(dir, name), { recursive: true, force: true });
    }
  }
  const written = [];
  for (const o of plan.outputs) {
    const file = path.join(dir, o.path);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, o.content);
    written.push(file);
  }
  fixWritten(labs, written);
  const manifest = path.join(out ?? labs, CONFIG.target.manifest);
  recordManifest(manifest, plan.manifest);
  return { dir, manifest };
}
