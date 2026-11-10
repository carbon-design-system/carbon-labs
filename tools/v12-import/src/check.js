/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The lane's own checks, over every folder the manifest records and the v12
// packages: every component folder has a manifest row, the import's leak and
// motion-literal checks, and that motion comes only through the seam. CI runs
// it; an import runs the same checks per file. A finding is an error, or a
// warning when it is recorded as allowed; only errors fail the check.

import fs from 'node:fs';
import path from 'node:path';
import { CONFIG } from './config.js';
import { scanLeaks } from './doc.js';
import { motionLiterals } from './importer.js';

const SEAM_DIR = 'packages/v12-motion';
// Built output, and the changelog the release writes (dated, by design).
const SKIP =
  /(^|\/)(node_modules|es|lib|dist|scss|storybook-static)(\/|$)|(^|\/)CHANGELOG\.md$/;
// Motion from anywhere but the seam.
const DIRECT_MOTION =
  /^(?:@carbon-labs\/motion-(?:core|react)|@carbon-motion\/[\w-]+|@carbon\/motion|@carbon\/styles\/scss\/motion)(?:\/|$)/;

/**
 * The language the import's checks read a file as.
 *
 * @param {string} file The file.
 * @returns {'ts' | 'scss' | 'other' | null} The language, or null to skip it.
 */
function langOf(file) {
  if (/\.[cm]?[jt]sx?$/.test(file)) {
    return 'ts';
  }
  if (/\.scss$/.test(file)) {
    return 'scss';
  }
  return /\.(mdx?|css)$/.test(file) ? 'other' : null;
}

/**
 * Every checked file under a folder, by its path in the folder.
 *
 * @param {string} root The folder.
 * @returns {string[]} The files.
 */
function filesIn(root) {
  if (!fs.existsSync(root)) {
    return [];
  }
  if (fs.statSync(root).isFile()) {
    return langOf(root) ? [''] : [];
  }
  return fs
    .readdirSync(root, { recursive: true })
    .map((f) => f.split(path.sep).join('/'))
    .filter(
      (f) =>
        !SKIP.test(f) && langOf(f) && fs.statSync(path.join(root, f)).isFile()
    );
}

/**
 * The specifiers a source imports, with their lines.
 *
 * @param {string} text The source.
 * @returns {{ spec: string, line: number }[]} The specifiers.
 */
function specifiersOf(text) {
  const out = [];
  const re =
    /(?:\bfrom\s*|\bimport\s*\(?\s*|@(?:use|forward|import)\s+)['"]([^'"]+)['"]/g;
  for (const m of text.matchAll(re)) {
    out.push({ spec: m[1], line: text.slice(0, m.index).split('\n').length });
  }
  return out;
}

/**
 * The findings in the lane.
 *
 * @param {string} labs The carbon-labs checkout.
 * @param {{ directMotion?: { file: string, spec: string }[] }} [options] The
 *   recorded allowances, when not the configured ones.
 * @returns {{ kind: string, at: string, match: string, level: 'error' | 'warning' }[]} The findings.
 */
export function checkLane(labs, { directMotion = CONFIG.directMotion } = {}) {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(labs, 'v12.manifest.json'), 'utf8')
  );
  const items = Array.isArray(manifest) ? manifest : (manifest.items ?? []);
  const roots = [
    ...items
      .filter((i) => i.path)
      .map((i) => ({ id: i.id, kind: i.kind, dir: i.path })),
    ...fs
      .readdirSync(path.join(labs, 'packages'))
      .filter((d) => d.startsWith('v12-'))
      .map((d) => ({ id: null, kind: 'lane', dir: `packages/${d}` })),
    { id: null, kind: 'docs', dir: 'docs/v12' },
  ];
  // A folder once, as the manifest records it when it does.
  const unique = roots.filter(
    (r, k) => roots.findIndex((o) => o.dir === r.dir) === k
  );
  const findings = [];
  /**
   * Records a finding.
   *
   * @param {string} kind The rule.
   * @param {string} at The file and line.
   * @param {string} match What it found.
   * @param {'error' | 'warning'} [level] Whether it fails the check.
   */
  const report = (kind, at, match, level = 'error') =>
    findings.push({ kind, at, match, level });
  // Every component folder has a row, so every check below opens it.
  const components = path.join(labs, 'packages/react/src/v12/components');
  const folders = fs.existsSync(components) ? fs.readdirSync(components) : [];
  for (const d of folders) {
    const dir = `packages/react/src/v12/components/${d}`;
    if (
      fs.existsSync(path.join(labs, dir, 'package.json')) &&
      !unique.some((r) => r.dir === dir)
    ) {
      report('unlisted folder', dir, d);
    }
  }
  // A v12 package stays private until its publishable pull request; a row
  // marked publishable is a package carbon-labs already publishes.
  const publishable = new Set(
    items.filter((i) => i.publishable === true).map((i) => i.path)
  );
  for (const { kind, dir } of unique) {
    const file = path.join(labs, dir, 'package.json');
    if (kind === 'styles' || publishable.has(dir) || !fs.existsSync(file)) {
      continue;
    }
    const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (pkg.private !== true) {
      report('not private', `${dir}/package.json`, pkg.name);
    }
  }
  // A lane package the manifest doesn't record (a draft brought as its own
  // branch) is private too: the release publishes every package that isn't.
  for (const d of folders) {
    const dir = `packages/react/src/v12/components/${d}`;
    const file = path.join(labs, dir, 'package.json');
    if (unique.some((r) => r.dir === dir) || !fs.existsSync(file)) {
      continue;
    }
    const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (pkg.labs?.status === 'draft' && pkg.private !== true) {
      report('not private', `${dir}/package.json`, pkg.name);
    }
  }
  const used = new Set();
  for (const { id, kind, dir } of unique) {
    const isSeam = dir === SEAM_DIR;
    // A package brought whole keeps its own allowances and its own
    // dependency on carbon-motion, as the import does.
    const isPackage = kind === 'package';
    const allowances = isPackage
      ? (CONFIG.packages[id.replace(/^package\//, '')]?.literals ?? [])
      : (CONFIG.kitLiterals[id] ?? []);
    for (const rel of filesIn(path.join(labs, dir))) {
      const at = rel ? `${dir}/${rel}` : dir;
      const text = fs.readFileSync(path.join(labs, at), 'utf8');
      const lang = langOf(at);
      const isTest = /(^|\/)(__tests__|test)\/|\.test\.[jt]sx?$/.test(rel);
      for (const leak of scanLeaks(text, [], { code: lang === 'ts' })) {
        report(`leak (${leak.kind})`, `${at}:${leak.line}`, leak.match);
      }
      if (isSeam || lang === 'other') {
        continue;
      }
      // Literals: in source and in imported tests (titles aside), never in
      // stories, whose prose names timings; the lane's own tests assert the
      // values a build gives.
      const isStory = /(^|\/)__stories__\/|\.stories\.[jt]sx?$/.test(rel);
      const literals =
        isStory || (isTest && kind === 'lane')
          ? []
          : motionLiterals(text, lang, isTest).found;
      for (const l of literals) {
        const allowed = allowances.some(
          (a) => a.file.test(rel) && a.match.test(l.match)
        );
        if (!allowed) {
          report('motion literal', `${at}:${l.line}`, l.match);
        }
      }
      for (const { spec, line } of specifiersOf(text)) {
        if (!isPackage && DIRECT_MOTION.test(spec)) {
          const known = directMotion.findIndex(
            (a) => a.file === at && a.spec === spec
          );
          if (known >= 0) {
            used.add(known);
          }
          report(
            'motion not through the seam',
            `${at}:${line}`,
            spec,
            known >= 0 ? 'warning' : 'error'
          );
        }
      }
    }
  }
  // An allowance whose import is gone comes off the list.
  directMotion.forEach((a, k) => {
    if (!used.has(k)) {
      report('stale allowance', a.file, a.spec);
    }
  });
  return findings;
}
