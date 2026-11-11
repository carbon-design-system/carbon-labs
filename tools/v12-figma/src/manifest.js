/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The manifest's `figma` block: the logical key a row is known by in the
// design library, and how far it is mapped. The block holds names only;
// anything that identifies a design file or a node stays out of this
// repository, and the check refuses it.

import fs from 'node:fs';
import path from 'node:path';
import {
  ALLOWED_STATUSES,
  CODE_ONLY,
  FIGMA_STATUSES,
  SOURCES,
} from './config.js';

const KEY = /^v12\/[a-z0-9]+(?:[-/][a-z0-9]+)*$/;
const FIELDS = new Set([
  'key',
  'status',
  'page',
  'set',
  'props',
  'rename',
  'slots',
  'stateFrom',
  'stories',
  'subcomponents',
]);
// A node's id (two numbers joined by a colon) or a URL's node parameter.
const NODE_ID = /\b\d+:\d+\b|node.id\s*=/i;

/**
 * The manifest's rows.
 *
 * @param {string} root The repository's root.
 * @returns {object[]} The rows.
 */
export function readManifest(root) {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(root, SOURCES.manifest), 'utf8')
  );
  return Array.isArray(manifest) ? manifest : (manifest.items ?? []);
}

/**
 * The block a row has when its manifest row gives none: code-only for
 * styles and the rows `CODE_ONLY` lists, unmapped for the rest.
 *
 * @param {{ id: string, kind: string }} row The row.
 * @returns {{ key: string, status: string }} The block.
 */
export function defaultBlock(row) {
  const codeOnly = row.kind === 'styles' || CODE_ONLY.includes(row.id);
  return { key: `v12/${row.id}`, status: codeOnly ? 'code-only' : 'unmapped' };
}

/**
 * Every string inside a value.
 *
 * @param {unknown} value The value.
 * @returns {string[]} The strings.
 */
function stringsIn(value) {
  if (typeof value === 'string') {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap(stringsIn);
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => [k, ...stringsIn(v)]);
  }
  return [];
}

/**
 * Checks each row's `figma` block and gives every row its effective block.
 *
 * @param {object[]} rows The manifest's rows.
 * @param {{ statuses?: string[] }} [options] The statuses allowed yet.
 * @returns {{ blocks: Map<string, object>, errors: string[], missing: string[] }} Each row's block by id, what is wrong, and the rows with no block.
 */
export function validateFigmaBlocks(
  rows,
  { statuses = ALLOWED_STATUSES } = {}
) {
  const blocks = new Map();
  const errors = [];
  const missing = [];
  const keys = new Map();
  for (const row of rows) {
    const at = `${row.id}: figma`;
    const block = row.figma;
    if (block === undefined) {
      missing.push(row.id);
      blocks.set(row.id, defaultBlock(row));
      continue;
    }
    if (!block || typeof block !== 'object' || Array.isArray(block)) {
      errors.push(`${at} is not an object`);
      continue;
    }
    for (const field of Object.keys(block)) {
      if (!FIELDS.has(field)) {
        errors.push(`${at}.${field} is not a field of the block`);
      }
    }
    if (typeof block.key !== 'string' || !KEY.test(block.key)) {
      errors.push(`${at}.key must be a logical key such as "v12/${row.id}"`);
    } else if (keys.has(block.key)) {
      errors.push(`${at}.key "${block.key}" is also ${keys.get(block.key)}'s`);
    } else {
      keys.set(block.key, row.id);
    }
    if (!FIGMA_STATUSES.includes(block.status)) {
      errors.push(`${at}.status must be one of ${FIGMA_STATUSES.join(', ')}`);
    } else if (!statuses.includes(block.status)) {
      errors.push(
        `${at}.status "${block.status}" needs an export to check it against; use ${statuses.join(' or ')}`
      );
    }
    if (
      block.status === 'code-only' &&
      Object.keys(block).some((f) => !['key', 'status'].includes(f))
    ) {
      errors.push(`${at}: a code-only row has only a key and a status`);
    }
    for (const list of ['props', 'stories', 'subcomponents']) {
      if (
        block[list] !== undefined &&
        !(
          Array.isArray(block[list]) &&
          block[list].every((s) => typeof s === 'string')
        )
      ) {
        errors.push(`${at}.${list} must be a list of names`);
      }
    }
    if (stringsIn(block).some((s) => NODE_ID.test(s))) {
      errors.push(
        `${at} holds a design file's node id; keep ids in the private id map`
      );
    }
    blocks.set(row.id, block);
  }
  return { blocks, errors, missing };
}
