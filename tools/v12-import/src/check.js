/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The lane's own checks, over every folder the manifest records and the v12
// packages: the import's leak and motion-literal checks, and that motion comes
// only through the seam. CI runs it; an import runs the same checks per file.

import fs from 'node:fs';
import path from 'node:path';
import { CONFIG } from './config.js';
import { scanLeaks } from './doc.js';
import { motionLiterals } from './importer.js';

const SEAM_DIR = 'packages/v12-motion';
const SKIP = /(^|\/)(node_modules|es|lib|dist|scss|storybook-static)(\/|$)/;
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
 * @returns {{ kind: string, at: string, match: string }[]} The findings.
 */
export function checkLane(labs) {
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
  // A v12 package stays private until its publishable pull request.
  for (const { kind, dir } of unique) {
    const file = path.join(labs, dir, 'package.json');
    if (kind === 'styles' || !fs.existsSync(file)) {
      continue;
    }
    const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (pkg.private !== true) {
      findings.push({
        kind: 'not private',
        at: `${dir}/package.json`,
        match: pkg.name,
      });
    }
  }
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
        findings.push({
          kind: `leak (${leak.kind})`,
          at: `${at}:${leak.line}`,
          match: leak.match,
        });
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
          findings.push({
            kind: 'motion literal',
            at: `${at}:${l.line}`,
            match: l.match,
          });
        }
      }
      for (const { spec, line } of specifiersOf(text)) {
        if (!isPackage && DIRECT_MOTION.test(spec)) {
          findings.push({
            kind: 'motion not through the seam',
            at: `${at}:${line}`,
            match: spec,
          });
        }
      }
    }
  }
  return findings;
}
