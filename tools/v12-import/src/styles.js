/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Plans the import of the kit's shared styles: `styles/_<name>.scss`
// partials into the shared styles package, with the partials they use.

import fs from 'node:fs';
import path from 'node:path';
import { CONFIG } from './config.js';
import { scanLeaks } from './doc.js';
import { listDir, readAt, resolveRef } from './git.js';
import {
  UsageError,
  fixWritten,
  isOneOf,
  motionLiterals,
  namesFrom,
  recordManifest,
  seamTokens,
  sourcePointers,
} from './importer.js';
import {
  dropTokenFallbacks,
  licenseHeader,
  parseImports,
  replaceSpecifiers,
  rewritePrefix,
} from './rewrite.js';

const posix = path.posix;

/**
 * The partial a Sass specifier names among the kit's shared styles, tried as
 * Sass resolves it: `_name.scss`, `name.scss`, then a folder's index.
 *
 * @param {string} spec The specifier, relative to the styles folder.
 * @param {Set<string>} files The styles folder's files.
 * @returns {string | null} The file.
 */
function partialFile(spec, files) {
  const dir = posix.dirname(spec);
  const base = posix.basename(spec).replace(/\.scss$/, '');
  const at = dir === '.' ? '' : `${dir}/`;
  const tries = [
    `${at}_${base.replace(/^_/, '')}.scss`,
    `${at}${base}.scss`,
    `${spec}/_index.scss`,
  ];
  return tries.find((t) => files.has(t)) ?? null;
}

/**
 * The plan for importing shared styles: each partial asked for, and every
 * partial they use, with its rewrites, warnings and findings.
 *
 * @param {object} opts The options.
 * @param {string[]} opts.styles The partials' names (`rollover` for `_rollover.scss`).
 * @param {string} opts.from The source repository.
 * @param {string} opts.ref The source commit.
 * @param {string} opts.labs The carbon-labs checkout.
 * @param {string[]} [opts.names] More names that never go public.
 * @param {number} [opts.year] The license year.
 * @returns {object} The plan.
 */
export function planStyles(opts) {
  const cfg = CONFIG;
  const { from } = opts;
  const year = opts.year ?? new Date().getFullYear();
  const sha = resolveRef(from, opts.ref);
  if (!sha) {
    throw new UsageError(`${opts.ref} is not a commit in ${from}`);
  }
  const folder = `${cfg.source.kitRoot}/${cfg.styles.folder}`;
  const files = new Set(listDir(from, sha, folder));
  const names = [
    ...namesFrom(readAt(from, sha, cfg.source.names)),
    ...(opts.names ?? []),
  ];
  const plan = {
    kind: 'styles',
    source: { repo: cfg.source.name, ref: sha },
    target: cfg.styles.dir,
    partials: [],
    rewrites: { imports: {}, prefix: {}, license: {}, tokenFallbacks: {} },
    warnings: [],
    findings: [],
    outputs: [],
    manifest: [],
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
   * @param {number} [n] How many.
   */
  function bump(counts, key, n = 1) {
    counts[key] = (counts[key] ?? 0) + n;
  }

  const tokens = seamTokens(opts.labs);
  const queue = [];
  for (const n of opts.styles) {
    const file = partialFile(n, files);
    if (!file) {
      throw new UsageError(
        `${folder}/_${n}.scss is empty or missing at ${sha.slice(0, 7)}`
      );
    }
    queue.push({ file, pulledBy: null });
  }
  const seen = new Set();
  while (queue.length) {
    const { file, pulledBy } = queue.shift();
    if (seen.has(file)) {
      continue;
    }
    seen.add(file);
    const name = file.replace(/^_/, '').replace(/\.scss$/, '');
    const target = `${cfg.styles.src}/${file}`;
    let text = readAt(from, sha, `${folder}/${file}`) ?? '';
    const partial = { name, from: file, to: target, pulledBy, imports: [] };

    const imports = parseImports(text, 'scss');
    for (const imp of imports) {
      const s = imp.spec;
      const where = `${target}:${text.slice(0, imp.start).split('\n').length}`;
      let kind;
      if (s.startsWith('sass:')) {
        kind = 'unchanged (Sass module)';
      } else if (cfg.seam.from.some((re) => re.test(s))) {
        imp.to = cfg.seam.scss;
        kind = 'motion Sass → seam';
      } else if (isOneOf(s, cfg.passthrough)) {
        kind = 'unchanged';
      } else if (
        s.startsWith(`${cfg.source.kitPackage}/${cfg.styles.folder}/`)
      ) {
        const rest = s.slice(cfg.source.kitPackage.length + 1);
        const hit = partialFile(
          rest.slice(cfg.styles.folder.length + 1),
          files
        );
        if (!hit) {
          finding('unresolved import', where, s);
          continue;
        }
        imp.to = hit.replace(/^_/, '').replace(/\.scss$/, '');
        queue.push({ file: hit, pulledBy: name });
        kind = 'inside the shared styles';
      } else if (!s.startsWith('@') && !/^[a-z]+:/.test(s)) {
        // A relative partial: another of the shared styles, or a kit file
        // outside them (which this mode doesn't bring).
        const resolved = posix.normalize(s);
        if (resolved.startsWith('../')) {
          finding(
            'import outside the shared styles',
            where,
            `${s} (a kit file outside ${cfg.styles.folder}/: bring it in by hand)`
          );
          continue;
        }
        const hit = partialFile(resolved, files);
        if (!hit) {
          finding('unresolved import', where, s);
          continue;
        }
        queue.push({ file: hit, pulledBy: name });
        kind = 'inside the shared styles';
      } else {
        finding('unmapped import', where, s);
        continue;
      }
      bump(plan.rewrites.imports, kind);
      partial.imports.push({ from: s, to: imp.to ?? s, kind });
    }
    text = replaceSpecifiers(text, imports);

    const prefixed = rewritePrefix(text, 'scss', cfg.classPrefix);
    text = prefixed.text;
    for (const [k, n] of Object.entries(prefixed.counts)) {
      bump(plan.rewrites.prefix, k, n);
    }
    const licensed = licenseHeader(text, 'scss', year);
    text = licensed.text;
    bump(plan.rewrites.license, licensed.action);
    const fallbacks = dropTokenFallbacks(text, 'scss', tokens);
    text = fallbacks.text;
    if (fallbacks.dropped) {
      bump(plan.rewrites.tokenFallbacks, 'dropped', fallbacks.dropped);
    }

    const literals = motionLiterals(text, 'scss', false);
    for (const l of literals.found) {
      finding('motion literal', `${target}:${l.line}`, l.match);
    }
    if (literals.zeros) {
      plan.warnings.push(
        `${target}: ${literals.zeros} zero duration(s) left as they are (not a timing)`
      );
    }
    const { pointers, docRefs } = sourcePointers(text, 'scss');
    if (pointers || docRefs) {
      plan.warnings.push(
        `${target}: comments name the source repo ${pointers}× and its docs ${docRefs}×`
      );
    }
    for (const leak of scanLeaks(text, names)) {
      finding(`leak (${leak.kind})`, `${target}:${leak.line}`, leak.match);
    }

    plan.partials.push(partial);
    plan.outputs.push({ path: target, content: text });
    plan.manifest.push({
      id: `styles/${name}`,
      kind: 'styles',
      path: `${cfg.styles.dir}/${target}`,
      labsStatus: cfg.package.labsStatus,
      publishable: false,
      source: { repo: cfg.source.name, ref: sha },
    });
  }
  return plan;
}

/**
 * Writes a styles plan's partials into the shared styles package and records
 * each in the manifest: in the repo, or under `out` (`<out>/v12-styles`, the
 * manifest beside it).
 *
 * @param {object} plan The plan.
 * @param {object} opts The options.
 * @param {string} opts.labs The carbon-labs checkout.
 * @param {string} [opts.out] Another directory to write to.
 * @returns {{ dir: string, manifest: string }} Where it wrote.
 */
export function writeStyles(plan, { labs, out }) {
  const dir = out
    ? path.join(out, path.basename(plan.target))
    : path.join(labs, plan.target);
  if (!out) {
    const there = plan.outputs.filter((o) =>
      fs.existsSync(path.join(dir, o.path))
    );
    if (there.length) {
      throw new UsageError(
        `${there.map((o) => `${plan.target}/${o.path}`).join(', ')} exists: remove it or import with --out`
      );
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
  for (const entry of plan.manifest) {
    recordManifest(manifest, entry);
  }
  return { dir, manifest };
}
