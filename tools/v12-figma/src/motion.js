/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The motion snapshot: what a generated motion annotation would say. The
// seam's exports and each token's status, from the motion contract; each
// token's value at 1x, from carbon-motion's registry at the version the lane
// installs; and per row, its motion items (with the registry tokens each
// owns, as the workbench's Motion panel finds them), reduced behaviour and
// states from `parameters.v12`, and the seam names it imports.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { SOURCES } from './config.js';
import { storiesFacts, storyFilesOf } from './components.js';
import { readManifest, validateFigmaBlocks } from './manifest.js';
import { ModuleReader, workspacePackages } from './stories.js';
import { motionCustomProperties, versionOf } from './tokens.js';

/**
 * What the motion contract states: the carbon-motion version, each token's
 * status, and the seam's exports.
 *
 * @param {string} text The contract's Markdown.
 * @returns {{ version: string | null, statuses: Record<string, string>, exports: { name: string, kind: string, from: string, entry: string | null }[] }} The facts.
 */
export function readContract(text) {
  const flat = text.replace(/\s+/g, ' ');
  const version =
    /`@carbon-labs\/motion-react` \(([^)]+)\)/.exec(flat)?.[1] ?? null;
  const statuses = {};
  for (const m of text.matchAll(
    /^- `(\w+)` \(\d+\):([\s\S]*?)(?=^- `|^\s*$|^#)/gm
  )) {
    for (const name of m[2].matchAll(/`([^`]+)`/g)) {
      statuses[name[1]] = m[1];
    }
  }
  const exports = [];
  const section = text.split(/^## The exports\s*$/m)[1] ?? '';
  for (const line of section.split('\n')) {
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length < 3 || /^-+$/.test(cells[0]) || cells[0] === 'Export') {
      continue;
    }
    const named = /^`([^`]+)`(?: \(`([^`]+)`\))?$/.exec(cells[0]);
    const all = /^\(every export\)(?: \(`([^`]+)`\))?$/.exec(cells[0]);
    exports.push({
      name: named ? named[1] : '*',
      kind: cells[1],
      from: cells[2].replace(/`/g, ''),
      entry: (named ? named[2] : all?.[1]) ?? null,
    });
  }
  return { version, statuses, exports };
}

/**
 * The registry tokens a motion item owns: the token of that name, its
 * `pattern-*` parameters and its own family.
 *
 * @param {string} item The item.
 * @param {string[]} tokenNames The registry's names.
 * @returns {string[]} The names, sorted.
 */
export function tokensOfItem(item, tokenNames) {
  return tokenNames
    .filter(
      (n) =>
        n === item ||
        n.startsWith(`pattern-${item}`) ||
        n.startsWith(`${item}-`)
    )
    .sort();
}

/**
 * The motion snapshot.
 *
 * @param {string} root The repository's root.
 * @returns {Promise<{ snapshot: object, errors: string[] }>} The snapshot and what disagrees.
 */
export async function buildMotion(root) {
  const contract = readContract(
    fs.readFileSync(path.join(root, SOURCES.contract), 'utf8')
  );
  const { tokens } = await import(
    pathToFileURL(path.join(root, SOURCES.motionTokens)).href
  );
  const version = versionOf(root, SOURCES.motionPackage);
  const errors = [];
  if (contract.version !== version) {
    errors.push(
      `${SOURCES.contract} names carbon-motion ${contract.version}, the lane installs ${version}: run yarn v12:contract`
    );
  }
  const registry = Object.values(tokens)
    .filter((t) => t.visibility !== 'internal')
    .sort((a, b) => (a.name < b.name ? -1 : 1));
  for (const t of registry) {
    if (contract.statuses[t.name] !== t.status) {
      errors.push(
        `${SOURCES.contract} gives ${t.name} the status ${contract.statuses[t.name] ?? 'none'}, the registry ${t.status}: run yarn v12:contract`
      );
    }
  }
  const tokenNames = registry.map((t) => t.name);
  const declared = motionCustomProperties(root);
  const rows = readManifest(root);
  const { blocks } = validateFigmaBlocks(rows);
  const reader = new ModuleReader(
    root,
    workspacePackages(root, SOURCES.components)
  );
  const items = [];
  for (const row of [...rows].sort((a, b) => (a.id < b.id ? -1 : 1))) {
    const block = blocks.get(row.id);
    if (!block || row.kind === 'styles' || !row.path) {
      continue;
    }
    const facts = storiesFacts(reader, storyFilesOf(root, row.path).stories);
    const v12 = facts.v12 ?? {};
    const motion = Array.isArray(v12.motion)
      ? v12.motion.filter((m) => typeof m === 'string')
      : [];
    const reduced =
      v12.reduced && typeof v12.reduced === 'object' ? v12.reduced : {};
    if (!motion.length && !(row.motion ?? []).length) {
      continue;
    }
    items.push({
      key: block.key,
      id: row.id,
      title: facts.titles[0] ?? null,
      declared: Boolean(facts.v12),
      items: motion.map((item) => ({
        item,
        reduced: typeof reduced[item] === 'string' ? reduced[item] : null,
        tokens: tokensOfItem(item, tokenNames),
      })),
      states: Array.isArray(v12.states)
        ? v12.states.filter((s) => typeof s === 'string')
        : [],
      seam: [...(row.motion ?? [])].sort(),
    });
  }
  const snapshot = {
    schema: 'v12-figma/motion@1',
    side: 'code',
    source: { carbonMotion: version, contract: SOURCES.contract },
    levels: ['full', 'reduced', 'none'],
    tokens: registry.map((t) => ({
      name: t.name,
      css: declared.has(`--cds-motion-${t.name}`)
        ? `--cds-motion-${t.name}`
        : null,
      type: t.type,
      status: t.status,
      value: t.value ?? null,
    })),
    seam: contract.exports,
    items,
  };
  return { snapshot, errors };
}
