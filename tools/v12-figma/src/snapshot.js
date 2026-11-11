/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Writes the code side of the sync, `figma-sync/<kind>.code.json`, or with
// `check` says whether the committed files are current. The files hold
// only facts read from code: no commit, no time, nothing about a design
// file, so the same tree always writes the same bytes.

import fs from 'node:fs';
import path from 'node:path';
import { buildComponents } from './components.js';
import { KINDS, SYNC_DIR } from './config.js';
import { buildDocs } from './docs.js';
import { buildMotion } from './motion.js';
import { buildTokens } from './tokens.js';

/**
 * A snapshot's file, from the root.
 *
 * @param {string} kind The kind.
 * @returns {string} The path.
 */
export const fileOf = (kind) => `${SYNC_DIR}/${kind}.code.json`;

/**
 * A snapshot as its file holds it.
 *
 * @param {object} snapshot The snapshot.
 * @returns {string} The text.
 */
export const serialize = (snapshot) => `${JSON.stringify(snapshot, null, 2)}\n`;

/**
 * One kind's snapshot and what its sources got wrong.
 *
 * @param {string} root The repository's root.
 * @param {string} kind The kind.
 * @returns {Promise<{ snapshot: object, errors: string[], missing: string[] }>} The result.
 */
export async function build(root, kind) {
  switch (kind) {
    case 'tokens':
      return { snapshot: await buildTokens(root), errors: [], missing: [] };
    case 'components':
      return buildComponents(root);
    case 'motion': {
      const { snapshot, errors } = await buildMotion(root);
      return { snapshot, errors, missing: [] };
    }
    case 'docs':
      return { snapshot: await buildDocs(root), errors: [], missing: [] };
    default:
      throw new Error(`no snapshot "${kind}": use ${KINDS.join(', ')}`);
  }
}

/**
 * Writes the snapshots, or checks them.
 *
 * @param {string} root The repository's root.
 * @param {{ kinds?: string[], check?: boolean }} [options] Which, and whether to only check.
 * @returns {Promise<{ written: string[], stale: string[], errors: string[], missing: string[] }>} What happened.
 */
export async function runSnapshot(root, { kinds = KINDS, check = false } = {}) {
  const written = [];
  const stale = [];
  const errors = [];
  const missing = new Set();
  for (const kind of kinds) {
    const result = await build(root, kind);
    errors.push(...result.errors);
    result.missing.forEach((m) => missing.add(m));
    const file = path.join(root, fileOf(kind));
    const text = serialize(result.snapshot);
    if (check) {
      if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== text) {
        stale.push(fileOf(kind));
      }
    } else {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, text);
      written.push(fileOf(kind));
    }
  }
  return {
    written,
    stale,
    errors: [...new Set(errors)],
    missing: [...missing].sort(),
  };
}
