/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Plans one component's import from a source commit, and writes it when
// nothing refuses.

import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { CONFIG } from './config.js';
import {
  flattenLinks,
  motionParams,
  parseDoc,
  scanLeaks,
  sortSections,
  stripPointers,
} from './doc.js';
import { grepFiles, listDir, listFiles, readAt, resolveRef } from './git.js';
import {
  mdxSource,
  packageJson,
  pascal,
  storySource,
  targetPath,
  tsconfigJson,
  vitestConfig,
} from './layout.js';
import { exportedNames } from './exports.js';
import { importPlacements, insertMarks, readRegistry } from './departures.js';
import {
  CODE,
  COMMENT,
  STRING,
  langOf,
  lineOf,
  regions,
  withoutComments,
} from './regions.js';
import {
  dropTokenFallbacks,
  escapeRegExp,
  licenseHeader,
  parseImports,
  replaceSpecifiers,
  rewritePrefix,
  tokenValues,
} from './rewrite.js';

const posix = path.posix;

/** A path that names a style sheet. */
const STYLE_FILE = /\.s?css$/;

/** A problem with how the tool was called, not with the component. */
export class UsageError extends Error {}

/**
 * Adds to a count.
 *
 * @param {Record<string, number>} counts The counts.
 * @param {string} key The key.
 * @param {number} n How many.
 */
function bump(counts, key, n = 1) {
  counts[key] = (counts[key] ?? 0) + n;
}

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
 * Whether a specifier names one of these packages or a subpath of one.
 *
 * @param {string} spec The specifier.
 * @param {string[]} names The packages.
 * @returns {boolean} Whether it does.
 */
export function isOneOf(spec, names) {
  return names.some((n) => spec === n || spec.startsWith(`${n}/`));
}

/**
 * A kit folder's lane package name: the prefix and the folder, or the name
 * the config gives it.
 *
 * @param {string} id The kit folder.
 * @returns {string} The package name.
 */
export function laneName(id) {
  return `${CONFIG.target.labsPrefix}${CONFIG.target.laneNames?.[id] ?? id}`;
}

/**
 * A kit folder's lane folder: its name in PascalCase, or the folder the
 * config gives it.
 *
 * @param {string} id The kit folder.
 * @returns {string} The lane folder.
 */
export function laneFolder(id) {
  return CONFIG.target.laneFolders?.[id] ?? pascal(id);
}

/**
 * The names the content check keeps out of public text, read from the source
 * at the commit.
 *
 * @param {string | null} src The content check's source.
 * @returns {string[]} The names.
 */
export function namesFrom(src) {
  const m = src && /export const NAMES\s*=\s*\[([^\]]*)\]/.exec(src);
  if (!m) {
    return [];
  }
  return [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map((x) => x[1]);
}

/**
 * The seam's exports: plain names, namespaces, and the modules it forwards
 * whole.
 *
 * @param {string | null} src The seam's index.
 * @returns {{ names: Set<string>, wildcards: Set<string> } | null} The exports, or null when there is no seam.
 */
function seamExports(src) {
  if (src === null) {
    return null;
  }
  const names = new Set();
  const wildcards = new Set();
  for (const m of src.matchAll(
    /export\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g
  )) {
    for (const part of m[1].split(',')) {
      const bits = part
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/);
      const name = (bits[1] ?? bits[0]).trim();
      if (name) {
        names.add(name);
      }
    }
  }
  for (const m of src.matchAll(/export\s+\*\s+as\s+([\w$]+)\s+from/g)) {
    names.add(m[1]);
  }
  for (const m of src.matchAll(/export\s+\*\s+from\s*['"]([^'"]+)['"]/g)) {
    wildcards.add(m[1]);
  }
  return { names, wildcards };
}

/**
 * The seam's token values, from the first token CSS the checkout has.
 *
 * @param {string} labs The carbon-labs checkout.
 * @returns {Map<string, string>} The values, by property (empty without one).
 */
export function seamTokens(labs) {
  for (const rel of CONFIG.seam.tokensCss) {
    const file = path.join(labs, rel);
    if (fs.existsSync(file)) {
      return tokenValues(fs.readFileSync(file, 'utf8'));
    }
  }
  return new Map();
}

/**
 * The seam's subpaths that forward a carbon-motion module whole: each
 * `./name` export whose `src/name.ts` has `export * from '<module>'`.
 *
 * @param {string} labs The carbon-labs checkout.
 * @returns {Map<string, string>} The seam subpath, by the module it forwards.
 */
export function seamSubpaths(labs) {
  const subpaths = new Map();
  const file = path.join(labs, CONFIG.seam.packageJson);
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return subpaths;
  }
  for (const key of Object.keys(pkg.exports ?? {})) {
    const m = /^\.\/([\w-]+)$/.exec(key);
    const src = m && path.join(path.dirname(file), 'src', `${m[1]}.ts`);
    if (!src || !fs.existsSync(src)) {
      continue;
    }
    const text = fs.readFileSync(src, 'utf8');
    for (const w of text.matchAll(/export\s+\*\s+from\s*['"]([^'"]+)['"]/g)) {
      subpaths.set(w[1], `${CONFIG.seam.js}/${m[1]}`);
    }
  }
  return subpaths;
}

/**
 * Reads the files in a directory by their path in it.
 *
 * @param {string} dir The directory.
 * @returns {(p: string) => string | null} The reader: a file's text, or null.
 */
function dirReader(dir) {
  /**
   * Reads one file.
   *
   * @param {string} p The file, in the directory.
   * @returns {string | null} Its text, or null when there is none.
   */
  function read(p) {
    const file = path.join(dir, p);
    return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  }
  return read;
}

/**
 * The lane's packages, read from its folders.
 *
 * @param {string} laneDir The lane's directory.
 * @returns {Map<string, string>} Each package's folder, by its name.
 */
function lanePackages(laneDir) {
  const names = new Map();
  if (!fs.existsSync(laneDir)) {
    return names;
  }
  for (const dir of fs.readdirSync(laneDir)) {
    const file = path.join(laneDir, dir, 'package.json');
    if (fs.existsSync(file)) {
      try {
        names.set(
          JSON.parse(fs.readFileSync(file, 'utf8')).name,
          path.join(laneDir, dir)
        );
      } catch {
        // A broken package.json is someone else's finding.
      }
    }
  }
  return names;
}

/**
 * The lane packages the manifest records, by their folders. Without a
 * manifest, every lane package counts.
 *
 * @param {Map<string, string>} lane The lane's packages, as `lanePackages` reads them.
 * @param {string} labs The carbon-labs checkout.
 * @param {string} manifestFile The manifest.
 * @returns {Map<string, string>} The packages imported from the kit.
 */
export function importedOnly(lane, labs, manifestFile) {
  let items;
  try {
    items = JSON.parse(fs.readFileSync(manifestFile, 'utf8')).items ?? [];
  } catch {
    return lane;
  }
  // A row of the lane's own (its source is carbon-labs) is not from the kit.
  const dirs = new Set(
    items
      .filter((i) => !i.source || i.source.repo === CONFIG.source.name)
      .map((i) => path.resolve(labs, i.path))
  );
  return new Map([...lane].filter(([, dir]) => dirs.has(path.resolve(dir))));
}

/**
 * Whether a lane package depends on another, directly or through other lane
 * packages, by their runtime dependencies (`dependencies` and peers; dev
 * dependencies don't make a build order).
 *
 * @param {Map<string, string>} lane The lane's packages, as `lanePackages` reads them.
 * @param {string} from The package to start from.
 * @param {string} to The package looked for.
 * @returns {boolean} Whether `from` reaches `to`.
 */
export function laneReaches(lane, from, to) {
  const seen = new Set();
  const queue = [from];
  while (queue.length) {
    const name = queue.shift();
    if (name === to) {
      return true;
    }
    if (seen.has(name) || !lane.has(name)) {
      continue;
    }
    seen.add(name);
    let json;
    try {
      json = JSON.parse(
        fs.readFileSync(path.join(lane.get(name), 'package.json'), 'utf8')
      );
    } catch {
      continue;
    }
    for (const dep of Object.keys({
      ...json.dependencies,
      ...json.peerDependencies,
    })) {
      if (lane.has(dep) || dep === to) {
        queue.push(dep);
      }
    }
  }
  return false;
}

/**
 * Every workspace package in the checkout, read from the root's
 * `workspaces` globs (each `*` one folder level).
 *
 * @param {string} labs The carbon-labs checkout.
 * @returns {Map<string, string>} Each package's folder, relative, by its name.
 */
function workspacePackages(labs) {
  const names = new Map();
  let globs = [];
  try {
    const root = JSON.parse(
      fs.readFileSync(path.join(labs, 'package.json'), 'utf8')
    );
    globs = Array.isArray(root.workspaces)
      ? root.workspaces
      : (root.workspaces?.packages ?? []);
  } catch {
    return names;
  }
  for (const glob of globs) {
    let dirs = [''];
    for (const seg of glob.split('/')) {
      dirs = dirs.flatMap((d) => {
        if (seg !== '*') {
          return [posix.join(d, seg)];
        }
        const abs = path.join(labs, d);
        return fs.existsSync(abs)
          ? fs
              .readdirSync(abs, { withFileTypes: true })
              .filter((e) => e.isDirectory() && e.name !== 'node_modules')
              .map((e) => posix.join(d, e.name))
          : [];
      });
    }
    for (const d of dirs) {
      try {
        const { name } = JSON.parse(
          fs.readFileSync(path.join(labs, d, 'package.json'), 'utf8')
        );
        if (name && !names.has(name)) {
          names.set(name, d);
        }
      } catch {
        // No package here, or a broken one: someone else's finding.
      }
    }
  }
  return names;
}

/**
 * A test file's source with its test titles blanked: the first string given
 * to `describe`, `it` or `test` (and their `.each(...)`, `.only` and so on).
 *
 * @param {string} code The source.
 * @param {Uint8Array} kinds Its regions.
 * @returns {string} The source.
 */
function withoutTestTitles(code, kinds) {
  const chars = code.split('');
  const call =
    /\b(?:describe|it|test)(?:\.(?:only|skip|todo|concurrent))*(?:\.each\s*\([^()]*\))?\s*\(\s*/g;
  for (const m of code.matchAll(call)) {
    if (kinds[m.index] !== CODE) {
      continue;
    }
    for (let i = m.index + m[0].length; kinds[i] === STRING; i += 1) {
      if (chars[i] !== '\n') {
        chars[i] = ' ';
      }
    }
  }
  return chars.join('');
}

/**
 * The motion literals in a source: a duration or an easing written out. A
 * test's title is prose, not a timing; a curve whose arguments are
 * interpolated is built from a token; a zero duration is not a timing.
 *
 * @param {string} text The source.
 * @param {'ts' | 'scss' | 'other'} lang The language.
 * @param {boolean} isTest Whether it is a test.
 * @returns {{ found: { line: number, match: string }[], zeros: number }} The literals, and how many zeros were passed.
 */
export function motionLiterals(text, lang, isTest) {
  const textKinds = regions(text, lang);
  let code = withoutComments(text, textKinds);
  if (isTest) {
    code = withoutTestTitles(code, textKinds);
  }
  const literals = [
    ...code.matchAll(/(?<![\w.$-])(\d*\.?\d+)ms\b/g),
    ...code.matchAll(/cubic-bezier\s*\((?!\s*[$#]\{)/g),
    ...code.matchAll(
      /\b(?:transition|animation)(?:-duration|-delay)?\s*:[^;{}]*?(?<![\w.$-])(\d*\.?\d+)s\b/g
    ),
  ];
  const found = [];
  let zeros = 0;
  for (const m of literals) {
    if (m[1] !== undefined && Number(m[1]) === 0) {
      zeros += 1;
      continue;
    }
    found.push({ line: lineOf(code, m.index), match: m[0].slice(-40) });
  }
  return { found, zeros };
}

/**
 * How often a source's comments name the source repository and its docs.
 *
 * @param {string} text The source.
 * @param {'ts' | 'scss' | 'other'} lang The language.
 * @returns {{ pointers: number, docRefs: number }} The counts.
 */
export function sourcePointers(text, lang) {
  const kinds = regions(text, lang);
  const comments = text
    .split('')
    .filter((_, i) => kinds[i] === COMMENT)
    .join('');
  return {
    pointers: (comments.match(/\bCarbon Next\b/g) ?? []).length,
    docRefs: (comments.match(/\bdocs\/[\w./-]+\.md\b/g) ?? []).length,
  };
}

/**
 * Resolves a relative import to a file in the component, trying the
 * extensions and partial names the kit uses.
 *
 * @param {string} resolved The import, relative to the component folder.
 * @param {Set<string>} files The component's files.
 * @param {'ts' | 'scss' | 'other'} lang The importing file's language.
 * @returns {string | null} The file.
 */
function resolveInside(resolved, files, lang) {
  const dir = posix.dirname(resolved);
  const base = posix.basename(resolved);
  /**
   * A name in the import's folder.
   *
   * @param {string} name The name.
   * @returns {string} The path.
   */
  function join(name) {
    return dir === '.' ? name : `${dir}/${name}`;
  }
  const tries =
    lang === 'scss'
      ? [
          resolved,
          join(`${base}.scss`),
          join(`_${base}.scss`),
          join(`_${base}`),
          `${resolved}/_index.scss`,
          `${resolved}/index.scss`,
        ]
      : [
          resolved,
          `${resolved}.ts`,
          `${resolved}.tsx`,
          `${resolved}.js`,
          `${resolved}/index.ts`,
          `${resolved}/index.tsx`,
        ];
  return tries.find((t) => files.has(t)) ?? null;
}

/**
 * A relative specifier from one package file to another, in the importing
 * file's style: extensions kept only when the original had one.
 *
 * @param {string} fromTarget The importing file's path in the package.
 * @param {string} toTarget The imported file's path in the package.
 * @param {string} original The original specifier.
 * @param {'ts' | 'scss' | 'other'} lang The language.
 * @returns {string} The specifier.
 */
function relativeSpec(fromTarget, toTarget, original, lang) {
  let to = toTarget;
  const hadExt = /\.[a-z]+$/i.test(posix.basename(original));
  if (lang === 'scss') {
    to = to.replace(/(^|\/)_([^/]+)$/, '$1$2');
    if (!hadExt) {
      to = to.replace(/\.s?css$/, '');
    }
  } else if (!hadExt) {
    to = to.replace(/\.(tsx?|js)$/, '').replace(/\/index$/, '');
  }
  let rel = posix.relative(posix.dirname(fromTarget), to);
  if (!rel.startsWith('.')) {
    rel = `./${rel}`;
  }
  return rel;
}

/**
 * The plan for one import: every file it would write and every rewrite,
 * mark, dependency, warning and finding.
 *
 * @param {object} opts The options.
 * @param {string} opts.id The component's folder name in the kit.
 * @param {string} opts.from The source repository.
 * @param {string} opts.ref The source commit.
 * @param {string} opts.labs The carbon-labs checkout.
 * @param {string[]} [opts.names] More names that never go public.
 * @param {number} [opts.year] The license year.
 * @returns {object} The plan.
 */
export function planImport(opts) {
  const cfg = CONFIG;
  const { id, from, labs } = opts;
  const year = opts.year ?? new Date().getFullYear();
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
    throw new UsageError(`"${id}" is not a kit folder name`);
  }
  const sha = resolveRef(from, opts.ref);
  if (!sha) {
    throw new UsageError(`${opts.ref} is not a commit in ${from}`);
  }
  const kitTop = new Set(listDir(from, sha, cfg.source.kitRoot));
  // A kit folder, or a file at the kit's root (`props.ts`) with its test:
  // either one becomes its own lane package.
  let folder = `${cfg.source.kitRoot}/${id}`;
  let sourceFiles = listFiles(from, sha, folder);
  const single = !sourceFiles.length && id !== 'index';
  if (single) {
    const own = new RegExp(`^${id}(\\.test|\\.stories)?\\.(tsx?|js|scss)$`);
    sourceFiles = [...kitTop]
      .filter((n) => own.test(n))
      .map((n) => `${cfg.source.kitRoot}/${n}`);
    folder = cfg.source.kitRoot;
  }
  if (!sourceFiles.length) {
    throw new UsageError(
      `${cfg.source.kitRoot}/${id} is empty or missing at ${sha.slice(0, 7)}`
    );
  }
  const rels = sourceFiles.map((f) => f.slice(folder.length + 1));
  const relSet = new Set(rels);
  const name = pascal(id);
  const folderName = laneFolder(id);
  const dir = `${cfg.target.lane}/${folderName}`;
  const names = [
    ...namesFrom(readAt(from, sha, cfg.source.names)),
    ...(opts.names ?? []),
  ];
  const seam = seamExports(
    fs.existsSync(path.join(labs, cfg.target.seamIndex))
      ? fs.readFileSync(path.join(labs, cfg.target.seamIndex), 'utf8')
      : null
  );
  // The lane's packages the tool imported: a package the manifest doesn't
  // record (carbon-labs' own, of the same name) is not the kit folder.
  const inLane = importedOnly(
    lanePackages(path.join(labs, cfg.target.lane)),
    labs,
    path.join(labs, cfg.target.manifest)
  );
  const tokens = seamTokens(labs);
  const subpaths = seamSubpaths(labs);

  const plan = {
    id,
    name,
    source: { repo: cfg.source.name, ref: sha },
    target: dir,
    files: [],
    skipped: [],
    testsWaiting: [],
    indexAdded: [],
    rewrites: { imports: {}, prefix: {}, license: {}, tokenFallbacks: {} },
    marks: { placed: [], unplaced: [] },
    dependencies: { kit: [], styles: [], external: [], seamGaps: [] },
    motion: [],
    story: null,
    doc: null,
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
  // The package's name must be its own: yarn refuses two workspaces of one
  // name, and the lane's would shadow a package outside it.
  const pkgName = laneName(id);
  const taken = workspacePackages(labs).get(pkgName);
  if (taken && taken !== dir) {
    finding('package name taken', 'package.json', `${pkgName} is ${taken}`);
  }
  const kitDeps = new Map();
  const styleDeps = new Set();
  const externals = new Set();
  // Each keyed by what it is, with the files that need it: a test held back
  // takes its needs with it.
  const testExternals = new Map();
  const motionUsed = new Map();
  // The packages the tool brings whole, by their lane name.
  const laneDeps = new Map();
  const seamGaps = new Map();
  /**
   * Notes that a file needs something.
   *
   * @param {Map<string, Set<string>>} map The needs.
   * @param {string} key What it needs.
   * @param {string} target The file.
   */
  function need(map, key, target) {
    map.set(key, (map.get(key) ?? new Set()).add(target));
  }
  /**
   * Notes the names a file takes from another kit folder, and from which of
   * its files: the import maps to the package root, so its index must
   * export them.
   *
   * @param {{ taken: Map<string, { users: Set<string>, subpaths: Set<string> }> }} dep The dependency.
   * @param {{ names: string[] }} imp The import.
   * @param {string} subpath The file in the folder (`ease` in `../snap/ease`), or ''.
   * @param {string} target The importing file.
   */
  function take(dep, imp, subpath, target) {
    for (const n of imp.names.filter((x) => x !== '*')) {
      const t = dep.taken.get(n) ?? { users: new Set(), subpaths: new Set() };
      t.users.add(target);
      if (subpath) {
        t.subpaths.add(subpath);
      }
      dep.taken.set(n, t);
    }
  }

  // Departure marks: the lane's registry, for the entries that apply to this
  // folder, placed in the sources as they come.
  const marks = importPlacements(
    rels
      .filter((rel) => /^components\//.test(targetPath(rel) ?? ''))
      .map((rel) => ({
        file: rel,
        // As the lane writes it: the registry names the lane's classes.
        text: rewritePrefix(
          readAt(from, sha, `${folder}/${rel}`),
          langOf(rel),
          cfg.classPrefix
        ).text,
      })),
    readRegistry(labs),
    folderName
  );
  for (const u of marks.missing) {
    plan.marks.unplaced.push({
      name: u.entry.id,
      kind: u.entry.status,
      place: u.place,
      reason: u.reason,
    });
  }

  for (const rel of rels) {
    const target = targetPath(rel);
    if (!target) {
      plan.skipped.push(rel);
      continue;
    }
    const lang = langOf(rel);
    let text = readAt(from, sha, `${folder}/${rel}`);
    const file = { from: rel, to: target, marks: [], imports: [], prefix: {} };

    const mine = marks.placements.filter((x) => x.file === rel);
    if (mine.length) {
      text = insertMarks(text, mine);
      for (const p of mine) {
        plan.marks.placed.push({
          file: target,
          line: p.line + mine.filter((x) => x.line < p.line).length,
          name: p.entry.id,
        });
      }
    }

    const imports = parseImports(text, lang);
    const isTest = target.startsWith('__tests__/');
    for (const imp of imports) {
      const s = imp.spec;
      const where = `${target}:${lineOf(text, imp.start)}`;
      let kind;
      if (s.startsWith('.')) {
        const resolved = posix.normalize(posix.join(posix.dirname(rel), s));
        const hit = resolved.startsWith('../')
          ? null
          : resolveInside(resolved, relSet, lang);
        // A file read by URL must be one of the component's own.
        if (imp.form === 'url' && !hit) {
          finding('unresolved import', where, s);
          continue;
        }
        // A file package sits at the kit's root: what it doesn't hold is
        // another kit folder.
        if (hit || (!single && !resolved.startsWith('../'))) {
          const hitTarget = hit && targetPath(hit);
          if (!hitTarget) {
            finding('unresolved import', where, s);
            continue;
          }
          imp.to = relativeSpec(target, hitTarget, s, lang);
          kind = 'inside the component';
        } else {
          const kitRel = single
            ? resolved
            : posix.normalize(posix.join(id, resolved));
          if (kitRel.startsWith('../')) {
            finding('import outside the kit', where, s);
            continue;
          }
          const [seg, ...rest] = kitRel.split('/');
          const restPath = rest.join('/');
          if (seg === cfg.styles.folder) {
            imp.to = restPath
              ? `${cfg.styles.scss}/${restPath}`
              : cfg.styles.scss;
            styleDeps.add(restPath || '(index)');
            kind = 'kit styles → v12-styles';
          } else {
            const depId = seg.replace(/\.(tsx?|js|scss)$/, '');
            const pkg = laneName(depId);
            // A style file keeps its path, from a script too: the package's root
            // is its script, not its styles.
            imp.to =
              lang === 'scss' || STYLE_FILE.test(restPath)
                ? `${pkg}/scss/${restPath}`
                : pkg;
            const dep = kitDeps.get(depId) ?? {
              id: depId,
              package: pkg,
              source: kitTop.has(`${seg}/`) ? `${seg}/` : seg,
              symbols: new Set(),
              usedBy: new Set(),
              taken: new Map(),
            };
            imp.names
              .filter((n) => n !== 'default')
              .forEach((n) => dep.symbols.add(n));
            if (lang !== 'scss') {
              take(dep, imp, restPath, target);
            }
            if (lang === 'scss' || imp.form === 'side-effect') {
              dep.symbols.add(
                `(${lang === 'scss' ? 'styles' : 'side effect'}: ${restPath || seg})`
              );
            }
            dep.usedBy.add(target);
            kitDeps.set(depId, dep);
            kind = 'kit relative → labs package';
          }
        }
      } else if (
        s === cfg.source.kitPackage ||
        s.startsWith(`${cfg.source.kitPackage}/`)
      ) {
        const sub = s.slice(cfg.source.kitPackage.length + 1);
        if (!sub) {
          finding(
            'unmapped import',
            where,
            `${s} (the kit's barrel: import from a component's subpath)`
          );
          continue;
        }
        const [seg, ...rest] = sub.split('/');
        if (seg === cfg.styles.folder || seg === 'styles.scss') {
          imp.to = rest.length
            ? `${cfg.styles.scss}/${rest.join('/')}`
            : cfg.styles.scss;
          styleDeps.add(rest.join('/') || '(index)');
          kind = 'kit styles → v12-styles';
        } else {
          const depId = seg.replace(/\.scss$/, '');
          const pkg = laneName(depId);
          imp.to =
            rest.length && (lang === 'scss' || STYLE_FILE.test(rest.join('/')))
              ? `${pkg}/scss/${rest.join('/')}`
              : pkg;
          const dep = kitDeps.get(depId) ?? {
            id: depId,
            package: pkg,
            source: `${depId}/`,
            symbols: new Set(),
            usedBy: new Set(),
            taken: new Map(),
          };
          imp.names
            .filter((n) => n !== 'default')
            .forEach((n) => dep.symbols.add(n));
          if (lang !== 'scss') {
            take(dep, imp, rest.join('/'), target);
          }
          dep.usedBy.add(target);
          kitDeps.set(depId, dep);
          kind = 'kit package → labs package';
        }
      } else if (lang === 'scss' && s.startsWith('sass:')) {
        kind = 'unchanged (Sass module)';
      } else if (
        lang !== 'scss' &&
        imp.names.includes('*') &&
        cfg.seam.from.some((re) => re.test(s)) &&
        (subpaths.has(s) || imp.wildcard)
      ) {
        // A motion module taken whole: from the seam subpath that forwards
        // it. An `export *` from the seam's root would re-export all of it.
        if (!subpaths.has(s)) {
          finding(
            'unmapped import',
            where,
            `export * from ${s} (the seam has no subpath for it; its root would re-export the whole seam)`
          );
          continue;
        }
        imp.to = subpaths.get(s);
        kind = 'motion → seam subpath';
        for (const n of imp.names.filter((x) => x !== '*')) {
          need(motionUsed, n, target);
        }
      } else if (cfg.seam.from.some((re) => re.test(s))) {
        imp.to = lang === 'scss' ? cfg.seam.scss : cfg.seam.js;
        kind = lang === 'scss' ? 'motion Sass → seam' : 'motion → seam';
        for (const n of imp.names) {
          if (n !== '*' && n !== 'default') {
            need(motionUsed, n, target);
          }
          const covered =
            seam &&
            (seam.names.has(n) || seam.wildcards.has(s)) &&
            n !== '*' &&
            n !== 'default';
          if (seam && !covered) {
            const key = `${n} from ${s}`;
            const gap = seamGaps.get(key) ?? {
              name: n,
              from: s,
              typeOnly: imp.typeOnly,
              usedBy: new Set(),
            };
            gap.usedBy.add(target);
            seamGaps.set(key, gap);
          }
        }
      } else if (cfg.packageMap[packageOf(s)]) {
        const to = cfg.packageMap[packageOf(s)];
        imp.to = to + s.slice(packageOf(s).length);
        need(laneDeps, to, target);
        kind = 'source package → lane package';
      } else if (
        isOneOf(s, cfg.passthrough) ||
        cfg.passthroughPrefixes.some((p) => s.startsWith(p))
      ) {
        externals.add(packageOf(s));
        kind = 'unchanged';
      } else if (s.startsWith('node:')) {
        // Tests run in Node; a component file runs in the browser.
        if (!isTest) {
          finding(
            'unmapped import',
            where,
            `${s} (a Node built-in, in a component file)`
          );
          continue;
        }
        kind = 'unchanged (Node built-in, test)';
      } else if (isOneOf(s, cfg.testOnly)) {
        if (!isTest) {
          finding(
            'unmapped import',
            where,
            `${s} (test-only, in a component file)`
          );
          continue;
        }
        need(testExternals, packageOf(s), target);
        kind = 'unchanged (test)';
      } else {
        finding('unmapped import', where, s);
        continue;
      }
      bump(plan.rewrites.imports, kind);
      file.imports.push({ from: s, to: imp.to ?? s, kind });
    }
    text = replaceSpecifiers(text, imports);

    const prefixed = rewritePrefix(text, lang, cfg.classPrefix);
    text = prefixed.text;
    file.prefix = prefixed.counts;
    for (const [k, n] of Object.entries(prefixed.counts)) {
      bump(plan.rewrites.prefix, k, n);
    }

    const licensed = licenseHeader(text, lang, year);
    text = licensed.text;
    bump(plan.rewrites.license, licensed.action);

    const fallbacks = dropTokenFallbacks(text, lang, tokens);
    text = fallbacks.text;
    if (fallbacks.dropped) {
      bump(plan.rewrites.tokenFallbacks, 'dropped', fallbacks.dropped);
    }

    const literals = motionLiterals(text, lang, isTest);
    for (const l of literals.found) {
      const ok = (cfg.kitLiterals[id] ?? []).find(
        (a) => a.file.test(target) && a.match.test(l.match)
      );
      if (ok) {
        plan.warnings.push(
          `${target}:${l.line}: allowed literal ${l.match} (${ok.why})`
        );
      } else {
        finding('motion literal', `${target}:${l.line}`, l.match);
      }
    }
    if (literals.zeros) {
      plan.warnings.push(
        `${target}: ${literals.zeros} zero duration(s) left as they are (not a timing)`
      );
    }

    // What points back into the source repo, for a reviewer to rewrite.
    const { pointers, docRefs } = sourcePointers(text, lang);
    if (pointers || docRefs) {
      plan.warnings.push(
        `${target}: comments name the source repo ${pointers}× and its docs ${docRefs}×`
      );
    }

    plan.files.push(file);
    plan.outputs.push({ path: target, content: text });
  }

  // Tests waiting on kit folders. A kit folder only tests import is not a
  // dependency of the package; while it is not in the lane, the tests that
  // import it are held back and listed (a skipped suite still loads its
  // imports, and an import of a package that doesn't exist fails the file and
  // `yarn install`). They come over with the last folder they need. A test
  // whose folder depends back on this one is held too: its dev dependency
  // would close a cycle, and the workspace would not build in any order.
  /**
   * Whether a package file is a test.
   *
   * @param {string} t The file.
   * @returns {boolean} Whether it is.
   */
  function isTestFile(t) {
    return t.startsWith('__tests__/');
  }
  const held = new Map();
  for (const dep of kitDeps.values()) {
    const users = [...dep.usedBy];
    if (dep.id === id || !users.every(isTestFile)) {
      continue;
    }
    if (
      inLane.has(dep.package) &&
      !laneReaches(inLane, dep.package, laneName(id))
    ) {
      continue;
    }
    for (const t of users) {
      held.set(t, (held.get(t) ?? new Set()).add(dep.id));
    }
  }
  plan.testsWaiting = [...held.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([t, deps]) => ({
      file: t,
      from: plan.files.find((f) => f.to === t).from,
      waitingOn: [...deps].sort(),
    }));
  /**
   * Whether a finding is in a held-back test.
   *
   * @param {string} where The file and line.
   * @returns {boolean} Whether it is.
   */
  function isHeld(where) {
    return held.has(where.replace(/:\d+$/, ''));
  }
  if (held.size) {
    plan.outputs = plan.outputs.filter((o) => !held.has(o.path));
    plan.files = plan.files.filter((f) => !held.has(f.to));
    plan.findings = plan.findings.filter((f) => !isHeld(f.where));
    plan.warnings = plan.warnings.filter(
      (w) => ![...held.keys()].some((t) => w.startsWith(`${t}:`))
    );
    for (const map of [motionUsed, testExternals, laneDeps]) {
      for (const [key, users] of map) {
        held.forEach((_, t) => users.delete(t));
        if (!users.size) {
          map.delete(key);
        }
      }
    }
    for (const [key, gap] of seamGaps) {
      held.forEach((_, t) => gap.usedBy.delete(t));
      if (!gap.usedBy.size) {
        seamGaps.delete(key);
      }
    }
    for (const [key, dep] of kitDeps) {
      held.forEach((_, t) => dep.usedBy.delete(t));
      for (const [n, t] of dep.taken) {
        held.forEach((_, f) => t.users.delete(f));
        if (!t.users.size) {
          dep.taken.delete(n);
        }
      }
      if (!dep.usedBy.size) {
        kitDeps.delete(key);
      }
    }
  }

  // The package index: the component's own, or one that re-exports each file.
  const index = plan.outputs.find((o) => /^index\.tsx?$/.test(o.path));
  if (!index) {
    const exports = plan.outputs
      .filter((o) => /^components\/[^/]+\.tsx?$/.test(o.path))
      .map((o) => `export * from './${o.path.replace(/\.tsx?$/, '')}';`);
    plan.outputs.push({
      path: 'index.ts',
      content: `${licenseHeader('', 'ts', year).text.trimEnd()}\n\n${exports.join('\n')}\n`,
    });
    plan.warnings.push(
      'the component has no index.ts; one re-exports each file'
    );
  }
  if (!single) {
    addTakenExports(plan, { from, sha, id, folder, relSet });
  }
  const indexText = plan.outputs.find((o) =>
    /^index\.tsx?$/.test(o.path)
  ).content;
  const exported = new RegExp(`\\b${name}\\b`).test(indexText);

  // The doc.
  const docSrc = readAt(from, sha, `${cfg.source.docs}/${id}.md`);
  let params = { motion: [], reduced: {}, todo: ['the component has no doc'] };
  if (docSrc) {
    const doc = parseDoc(docSrc);
    const { kept, dropped } = sortSections(doc.sections, cfg.docSections);
    let pointersRemoved = [];
    let linksFlattened = 0;
    const out = kept.map((s) => {
      let body = s.body;
      if (s.heading === 'Summary') {
        const stripped = stripPointers(body, cfg.pointerWords);
        body = stripped.text;
        pointersRemoved = stripped.removed;
      }
      const flat = flattenLinks(body);
      linksFlattened += flat.count;
      const prefixed = rewritePrefix(flat.text, 'other', cfg.classPrefix);
      for (const [k, n] of Object.entries(prefixed.counts)) {
        bump(plan.rewrites.prefix, k, n);
      }
      return { heading: s.heading, body: prefixed.text };
    });
    params = motionParams(doc.sections);
    plan.doc = {
      kept: kept.map((s) => s.heading),
      dropped,
      pointersRemoved,
      linksFlattened,
    };
    // Import examples in the doc's code name the lane's packages.
    const kitSub = new RegExp(
      `(['"])${escapeRegExp(cfg.source.kitPackage)}/([\\w-]+)\\1`,
      'g'
    );
    plan.outputs.push({
      path: `__stories__/${folderName}.mdx`,
      content: mdxSource({
        name,
        file: folderName,
        title: doc.title,
        sections: out,
      }).replace(kitSub, (_, q, seg) => `${q}${laneName(seg)}${q}`),
    });
  } else {
    plan.warnings.push(`no doc at ${cfg.source.docs}/${id}.md`);
    plan.outputs.push({
      path: `__stories__/${folderName}.mdx`,
      content: mdxSource({
        name,
        file: folderName,
        title: name,
        sections: [],
      }),
    });
  }
  plan.story = params;
  const header = licenseHeader('', 'ts', year).text;
  plan.outputs.push({
    path: `__stories__/${folderName}.stories.tsx`,
    content: storySource({
      name,
      file: folderName,
      header,
      exported,
      params,
    }),
  });

  // Dependencies.
  const pkgs = [];
  for (const file of cfg.versionsFrom) {
    try {
      pkgs.push(JSON.parse(fs.readFileSync(path.join(labs, file), 'utf8')));
    } catch {
      // Versions fall back to "*".
    }
  }
  /**
   * A package's version range, as the repository root has it.
   *
   * @param {string} pkg The package.
   * @returns {string} The range.
   */
  function versionOf(pkg) {
    for (const p of pkgs) {
      const v =
        p.dependencies?.[pkg] ??
        p.devDependencies?.[pkg] ??
        p.resolutions?.[pkg];
      if (v) {
        return v;
      }
    }
    return '*';
  }
  const dependencies = {
    [cfg.seam.js]: 'workspace:*',
    '@ibm/telemetry-js': '^1.10.2',
  };
  const peers = {};
  if (styleDeps.size) {
    dependencies[cfg.styles.package] = 'workspace:*';
  }
  // A kit folder only the tests import is a dev dependency (it is in the
  // lane, or the tests were held back above).
  const testDeps = {};
  for (const dep of kitDeps.values()) {
    if (dep.id === id) {
      continue;
    }
    if ([...dep.usedBy].every(isTestFile)) {
      testDeps[dep.package] = 'workspace:*';
    } else {
      dependencies[dep.package] = 'workspace:*';
    }
  }
  for (const [name, users] of laneDeps) {
    if ([...users].every(isTestFile)) {
      testDeps[name] = 'workspace:*';
    } else {
      dependencies[name] = 'workspace:*';
    }
  }
  for (const ext of externals) {
    if (ext === 'react' || ext === 'react-dom') {
      peers[ext] = '^18.2.0 || ^19.0.0';
    } else if (!ext.startsWith('@carbon-labs/')) {
      dependencies[ext] = versionOf(ext);
    }
  }
  /**
   * The names a file takes from a lane package that its index doesn't
   * export. A package not in the lane yet is not checked.
   *
   * @param {{ package: string, taken: Map<string, { users: Set<string>, subpaths: Set<string> }> }} dep The dependency.
   * @returns {{ name: string, subpaths: string[], users: string[] }[]} The names missing.
   */
  function missingFrom(dep) {
    const dir = inLane.get(dep.package);
    if (!dir || dep.id === id) {
      return [];
    }
    const read = dirReader(dir);
    const index = ['index.ts', 'index.tsx'].find((f) => read(f) !== null);
    const exp = index ? exportedNames(read, index) : null;
    if (exp?.open) {
      return [];
    }
    // A name taken from one of the package's files is its own, so the index
    // names it; one taken from the root may come through a package it
    // forwards whole.
    return [...dep.taken.entries()]
      .filter(
        ([n, t]) =>
          !exp?.names.has(n) && (t.subpaths.size || !exp?.external.length)
      )
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([n, t]) => ({
        name: n,
        subpaths: [...t.subpaths].sort(),
        users: [...t.users].sort(),
      }));
  }
  plan.dependencies.kit = [...kitDeps.values()]
    .sort((a, b) => (a.id < b.id ? -1 : 1))
    .map((d) => ({
      id: d.id,
      package: d.package,
      source: `${cfg.source.kitRoot}/${d.source}`,
      symbols: [...d.symbols].sort(),
      usedBy: [...d.usedBy].sort(),
      inLane: inLane.has(d.package),
      testOnly: [...d.usedBy].every(isTestFile),
      missingExports: missingFrom(d),
    }));
  plan.dependencies.styles = [...styleDeps].sort();
  plan.dependencies.external = [...externals].sort();
  plan.dependencies.seamGaps = [...seamGaps.values()].map((g) => ({
    name: g.name,
    from: g.from,
    typeOnly: g.typeOnly,
  }));
  if (!seam) {
    plan.warnings.push(
      `no seam at ${cfg.target.seamIndex}: motion exports unchecked`
    );
  }
  for (const d of plan.dependencies.kit) {
    for (const m of d.missingExports) {
      plan.warnings.push(
        `${d.package}'s index does not export ${m.name} (taken${m.subpaths.length ? ` from ${m.subpaths.map((p) => `${d.id}/${p}`).join(', ')}` : ''} by ${m.users.join(', ')}): add it to that package's index`
      );
    }
  }
  for (const d of plan.dependencies.kit.filter((k) => !k.inLane)) {
    plan.warnings.push(
      `depends on ${d.package}, not in the lane yet: import ${d.id} first`
    );
  }
  plan.motion = [...motionUsed.keys()].sort();

  // Tests run with vitest, in the package.
  const tests = plan.outputs.some((o) => o.path.startsWith('__tests__/'));
  const devDependencies = {};
  if (tests) {
    Object.assign(devDependencies, cfg.testRunner);
    Object.assign(devDependencies, testDeps);
    for (const ext of testExternals.keys()) {
      if (!(ext in devDependencies)) {
        devDependencies[ext] = versionOf(ext);
      }
    }
    plan.outputs.push({
      path: 'vitest.config.ts',
      content: vitestConfig(header),
    });
  }
  plan.outputs.push({
    path: 'package.json',
    content: packageJson({
      name,
      id,
      dir,
      labsPrefix: cfg.target.labsPrefix,
      packageName: laneName(id),
      dependencies,
      peers,
      devDependencies,
      tests,
      pkg: cfg.package,
    }),
  });
  plan.outputs.push({ path: 'tsconfig.json', content: tsconfigJson() });
  const telemetryFile = path.join(labs, cfg.target.telemetry);
  plan.outputs.push({
    path: 'telemetry.yml',
    content: fs.existsSync(telemetryFile)
      ? fs.readFileSync(telemetryFile, 'utf8')
      : 'projectId: TODO\nversion: 1\nendpoint: https://www-api.ibm.com/ibm-telemetry/v1/metrics\ncollect:\n  - npm\n  - jsx\n',
  });

  // Leaks in anything that travels. The docs also may not point back at the
  // source repository: its package name, its name, or its folders.
  const SOURCE_REF =
    /@carbon-next\/[\w/-]*|\bCarbon Next\b|\bapps\/prototypes\b|\bpackages\/kit\b/g;
  for (const o of plan.outputs) {
    for (const leak of scanLeaks(o.content, names, {
      code: /\.[cm]?[jt]sx?$/.test(o.path),
    })) {
      finding(`leak (${leak.kind})`, `${o.path}:${leak.line}`, leak.match);
    }
    if (/\.mdx?$/.test(o.path)) {
      for (const m of o.content.matchAll(SOURCE_REF)) {
        const line = o.content.slice(0, m.index).split('\n').length;
        finding('leak (source repository)', `${o.path}:${line}`, m[0]);
      }
    }
  }

  plan.manifest = {
    id,
    kind: 'component',
    path: dir,
    labsStatus: cfg.package.labsStatus,
    publishable: false,
    motion: plan.motion,
    source: { repo: cfg.source.name, ref: sha },
    ...(plan.testsWaiting.length
      ? {
          testsWaiting: plan.testsWaiting.map((t) => ({
            file: t.from,
            waitingOn: t.waitingOn,
          })),
        }
      : {}),
  };
  return plan;
}

/**
 * Adds to a package's index the names other kit folders take from its files.
 * Their imports (`../snap/ease`) map to the package root, so its index must
 * export each name; a name the index lacks is added from the file that
 * declares it, and one that file doesn't export is a warning.
 *
 * @param {object} plan The plan, its index among its outputs.
 * @param {object} o Where the package comes from.
 * @param {string} o.from The source repository.
 * @param {string} o.sha The source commit.
 * @param {string} o.id The package's kit folder.
 * @param {string} o.folder The folder's path in the source.
 * @param {Set<string>} o.relSet The folder's files.
 */
function addTakenExports(plan, { from, sha, id, folder, relSet }) {
  const cfg = CONFIG;
  const kitPkg = cfg.source.kitPackage;
  const root = cfg.source.kitRoot;
  const users = grepFiles(
    from,
    sha,
    `['"](\\.\\./)+${id}/|${kitPkg}/${id}/`,
    root
  ).filter((f) => !f.startsWith(`${folder}/`) && /\.(tsx?|js)$/.test(f));
  const wanted = new Map();
  for (const f of users) {
    const rel = f.slice(root.length + 1);
    for (const imp of parseImports(readAt(from, sha, f) ?? '', 'ts')) {
      let kitRel = null;
      if (imp.spec.startsWith('.')) {
        kitRel = posix.normalize(posix.join(posix.dirname(rel), imp.spec));
      } else if (imp.spec.startsWith(`${kitPkg}/`)) {
        kitRel = imp.spec.slice(kitPkg.length + 1);
      }
      if (!kitRel?.startsWith(`${id}/`)) {
        continue;
      }
      const hit = resolveInside(kitRel.slice(id.length + 1), relSet, 'ts');
      const to = hit && targetPath(hit);
      if (!to || /^index\.tsx?$/.test(to) || to.startsWith('__tests__/')) {
        continue;
      }
      for (const n of imp.names.filter((x) => x !== '*' && x !== 'default')) {
        const w = wanted.get(n) ?? {
          file: to,
          users: new Set(),
          typeOnly: true,
        };
        w.users.add(rel.split('/')[0]);
        w.typeOnly &&= imp.typeOnly;
        wanted.set(n, w);
      }
    }
  }
  if (!wanted.size) {
    return;
  }
  const index = plan.outputs.find((o) => /^index\.tsx?$/.test(o.path));
  /**
   * Reads one of the plan's outputs.
   *
   * @param {string} p Its path in the package.
   * @returns {string | null} Its text, or null when there is none.
   */
  function readOut(p) {
    return plan.outputs.find((o) => o.path === p)?.content ?? null;
  }
  const has = exportedNames(readOut, index.path);
  if (has.open) {
    return;
  }
  const byFile = new Map();
  for (const [n, w] of [...wanted.entries()].sort(([a], [b]) =>
    a < b ? -1 : 1
  )) {
    if (has.names.has(n)) {
      continue;
    }
    const own = exportedNames(readOut, w.file);
    if (!own.names.has(n)) {
      plan.warnings.push(
        `${n}, which ${[...w.users].sort().join(', ')} take from ${id}/${w.file.replace(/^components\//, '')}, is not exported there: the index can't add it`
      );
      continue;
    }
    const type = own.types.has(n) || w.typeOnly;
    const group = byFile.get(w.file) ?? { values: [], types: [] };
    group[type ? 'types' : 'values'].push(n);
    byFile.set(w.file, group);
    plan.indexAdded.push({
      name: n,
      file: w.file,
      type,
      usedBy: [...w.users].sort(),
    });
  }
  if (!byFile.size) {
    return;
  }
  const lines = [
    '',
    "// The names other v12 packages take from this package's files.",
  ];
  for (const [file, g] of byFile) {
    const spec = `./${file.replace(/\.(tsx?|js)$/, '')}`;
    if (g.values.length) {
      lines.push(`export { ${g.values.join(', ')} } from '${spec}';`);
    }
    if (g.types.length) {
      lines.push(`export type { ${g.types.join(', ')} } from '${spec}';`);
    }
  }
  index.content = `${index.content.trimEnd()}\n${lines.join('\n')}\n`;
}

/**
 * Adds or replaces an item in the manifest.
 *
 * @param {string} file The manifest file.
 * @param {object} entry The item.
 */
export function recordManifest(file, entry) {
  let manifest = { items: [] };
  if (fs.existsSync(file)) {
    manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
    manifest.items = manifest.items ?? [];
  }
  manifest.items = manifest.items.filter((i) => i.id !== entry.id);
  manifest.items.push(entry);
  manifest.items.sort((a, b) => (a.id < b.id ? -1 : 1));
  fs.writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
}

/**
 * Writes a plan's package, and records it in the manifest: in the repo, or
 * under `out` (the package in `<out>/<Name>`, the manifest beside it).
 *
 * @param {object} plan The plan.
 * @param {object} opts The options.
 * @param {string} opts.labs The carbon-labs checkout.
 * @param {string} [opts.out] Another directory to write to.
 * @returns {{ dir: string, manifest: string }} Where it wrote.
 */
export function writePlan(plan, { labs, out }) {
  const dir = out ? path.join(out, plan.name) : path.join(labs, plan.target);
  // Once in the lane, a component is changed there: the source no longer
  // carries the lane's fixes, so a second import would undo them.
  const recorded = path.join(labs, CONFIG.target.manifest);
  if (
    !out &&
    plan.manifest?.kind === 'component' &&
    fs.existsSync(recorded) &&
    (JSON.parse(fs.readFileSync(recorded, 'utf8')).items ?? []).some(
      (i) => i.id === plan.manifest.id
    )
  ) {
    throw new UsageError(
      `${plan.manifest.id} is in the lane: change it there (--out to compare)`
    );
  }
  if (!out && fs.existsSync(dir)) {
    throw new UsageError(
      `${plan.target} exists: remove it or import with --out`
    );
  }
  fs.rmSync(dir, { recursive: true, force: true });
  for (const o of plan.outputs) {
    const file = path.join(dir, o.path);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, o.content);
  }
  fixWritten(
    labs,
    plan.outputs.map((o) => path.join(dir, o.path))
  );
  const manifest = path.join(out ?? labs, CONFIG.target.manifest);
  recordManifest(manifest, plan.manifest);
  return { dir, manifest };
}

/**
 * Formats the written files the repository formats (its `format` script's
 * extensions) with its own Prettier, so an import passes `format:diff` as it
 * is written. Without Prettier in the checkout, the files stay as written.
 *
 * @param {string} labs The carbon-labs checkout.
 * @param {string[]} files The files written.
 * @returns {boolean} Whether they were formatted.
 */
export function formatWritten(labs, files) {
  const bin = path.join(
    labs,
    'node_modules',
    'prettier',
    'bin',
    'prettier.cjs'
  );
  // And plain CSS, which stylelint reads but its fixer can't lay out.
  const targets = files.filter((f) => /\.(js|md|s?css|ts|tsx)$/.test(f));
  if (!fs.existsSync(bin) || !targets.length) {
    return false;
  }
  execFileSync(
    process.execPath,
    [bin, '--write', '--log-level', 'warn', ...targets],
    {
      cwd: labs,
      stdio: ['ignore', 'ignore', 'inherit'],
    }
  );
  return true;
}

/**
 * Rules the source kit's lint has and the lane's plugins lack. A disable
 * comment naming only one of them is an error in the lane ("definition for
 * rule not found") and disables nothing there, so the line is dropped.
 */
const LANE_UNKNOWN_RULES = ['react-hooks/refs', 'react-hooks/immutability'];

/**
 * Drops the disable comments that name only a rule the lane lacks.
 *
 * @param {string} src The source.
 * @returns {string} The source without them.
 */
export function dropUnknownDisables(src) {
  const rules = LANE_UNKNOWN_RULES.map((r) => r.replace('/', '\\/')).join('|');
  const only = new RegExp(
    `^[ \\t]*//\\s*eslint-disable(?:-next-line|-line)?\\s+(?:${rules})(?:\\s+--.*)?\\r?\\n`,
    'gm'
  );
  return src.replace(only, '');
}

/**
 * Runs one of the repository's own linters with `--fix` on files, and returns
 * what it still reports (empty when the checkout lacks the linter or all pass).
 *
 * @param {string} labs The carbon-labs checkout.
 * @param {string} name The linter: `eslint` or `stylelint`.
 * @param {string[]} files The files.
 * @returns {string[]} The lines of what still fails.
 */
function fixWith(labs, name, files) {
  const bin = path.join(labs, 'node_modules', '.bin', name);
  if (!fs.existsSync(bin) || !files.length) {
    return [];
  }
  const res = spawnSync(bin, ['--fix', ...files], {
    cwd: labs,
    encoding: 'utf8',
  });
  if (res.status === 0) {
    return [];
  }
  return `${res.stdout}${res.stderr}`
    .split('\n')
    .map((l) => l.trimEnd())
    .filter(Boolean);
}

/**
 * Formats what an import wrote, then applies the repository's own fixers
 * (`eslint --fix` for braces, `stylelint --fix` for property order and empty
 * lines), then formats again, so the files pass `lint`, `lint:styles` and
 * `format:diff` as written. What a fixer cannot fix is reported as a warning
 * on stderr. A checkout without the linters leaves the files as formatted.
 *
 * @param {string} labs The carbon-labs checkout.
 * @param {string[]} files The files written.
 * @returns {string[]} The lines of what still fails.
 */
export function fixWritten(labs, files) {
  // The linters' config applies by path: files written elsewhere (`--out`)
  // are formatted only.
  const inside = files.filter((f) => !path.relative(labs, f).startsWith('..'));
  // The repository's `lint` script covers .js and .ts only.
  const code = inside.filter((f) => /\.(js|ts)$/.test(f));
  const styles = inside.filter((f) => /\.(css|scss)$/.test(f));
  for (const f of code) {
    const src = fs.readFileSync(f, 'utf8');
    const out = dropUnknownDisables(src);
    if (out !== src) {
      fs.writeFileSync(f, out);
    }
  }
  formatWritten(labs, files);
  // stylelint's property order can take two passes to settle (a reordered
  // multi-line value moves what the rest is checked against), and a pass
  // exits 0 either way: the second pass reports what is left.
  fixWith(labs, 'stylelint', styles);
  const remaining = [
    ...fixWith(labs, 'eslint', code),
    ...fixWith(labs, 'stylelint', styles),
  ];
  formatWritten(labs, files);
  if (remaining.length) {
    console.error(
      `warning: lint still fails on what was written:\n${remaining.join('\n')}`
    );
  }
  return remaining;
}
