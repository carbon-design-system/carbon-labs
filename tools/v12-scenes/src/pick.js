/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The picker: which stories a change touches. A changed file inside a v12
// component folder picks that folder and, one level up the import graph, every
// folder whose package declares it as a workspace dependency. A change to what
// every story is built on (the Storybook configuration, the lane's shared
// packages, the workbench, this tool, the dependencies) picks everything.

import fs from 'node:fs';
import path from 'node:path';

export const COMPONENTS = 'packages/react/src/v12/components';

/** Changes under these run every story. */
const EVERYTHING = [
  /^packages\/react\/\.storybook\//,
  /^packages\/react\/package\.json$/,
  /^packages\/v12-[^/]+\//,
  /^tools\/v12-workbench\//,
  /^tools\/v12-scenes\//,
  /^package\.json$/,
  /^yarn\.lock$/,
];

/** Tools whose changes show in one of the v12 Storybook's own folders. */
const TOOL_UNITS = { 'tools/v12-review/': 'review' };

/**
 * Folders of the v12 Storybook whose stories host components: a change to
 * a component they import picks them too.
 */
const HOST_UNITS = ['scenes'];

/**
 * The host folders and the component packages their stories import, read
 * from the import statements of their source files.
 *
 * @param {string} root The carbon-labs checkout.
 * @returns {{ unit: string, deps: string[] }[]} Each host folder that exists.
 */
export function readHosts(root) {
  const out = [];
  for (const unit of HOST_UNITS) {
    const base = path.join(root, 'packages/react/src/v12', unit);
    if (!fs.existsSync(base)) {
      continue;
    }
    const deps = new Set();
    const walk = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const file = path.join(dir, e.name);
        if (e.isDirectory()) {
          walk(file);
        } else if (/\.(js|jsx|ts|tsx)$/.test(e.name)) {
          const text = fs.readFileSync(file, 'utf8');
          for (const m of text.matchAll(
            /(?:from|import)\s*['"](@carbon-labs\/react-[^/'"]+)/g
          )) {
            deps.add(m[1]);
          }
        }
      }
    };
    walk(base);
    out.push({ unit, deps: [...deps].sort() });
  }
  return out;
}

/**
 * The lane's component folders, each with its package name and the workspace
 * packages it declares (dependencies, peer and development dependencies: a
 * story may import any of them).
 *
 * @param {string} root The carbon-labs checkout.
 * @returns {{ dir: string, name: string, deps: string[] }[]} The folders.
 */
export function readLane(root) {
  const base = path.join(root, COMPONENTS);
  const out = [];
  for (const dir of fs.existsSync(base) ? fs.readdirSync(base).sort() : []) {
    const file = path.join(base, dir, 'package.json');
    if (!fs.existsSync(file)) {
      continue;
    }
    const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
    const deps = new Set();
    for (const field of [
      'dependencies',
      'peerDependencies',
      'devDependencies',
    ]) {
      for (const [name, range] of Object.entries(pkg[field] ?? {})) {
        if (
          name.startsWith('@carbon-labs/react-') &&
          String(range).startsWith('workspace:')
        ) {
          deps.add(name);
        }
      }
    }
    out.push({ dir, name: pkg.name, deps: [...deps].sort() });
  }
  return out;
}

/**
 * The units a set of changed files touches. A unit is a component folder
 * (`components/<Folder>`) or another folder of the v12 Storybook (`catalog`,
 * `experiences`, `review`, `workbench`).
 *
 * A host folder (`readHosts`) is picked when a component it imports
 * changes.
 *
 * @param {string[]} files Changed paths, relative to the checkout.
 * @param {{ dir: string, name: string, deps: string[] }[]} lane From `readLane`.
 * @param {{ unit: string, deps: string[] }[]} [hosts] From `readHosts`.
 * @returns {{ all: boolean, why: string[], units: string[] }} What to run, and
 *   for each unit or for everything the reason it was picked.
 */
export function pickUnits(files, lane, hosts = []) {
  const why = [];
  const everything = files.filter((f) => EVERYTHING.some((re) => re.test(f)));
  if (everything.length) {
    why.push(`everything: ${everything.slice(0, 5).join(', ')}`);
    return { all: true, why, units: [] };
  }
  const changed = new Set();
  const others = new Set();
  for (const f of files) {
    const m = f.match(/^packages\/react\/src\/v12\/components\/([^/]+)\//);
    if (m) {
      changed.add(m[1]);
      continue;
    }
    const o = f.match(/^packages\/react\/src\/v12\/([^/]+)\//);
    if (o) {
      others.add(o[1]);
      continue;
    }
    for (const [prefix, unit] of Object.entries(TOOL_UNITS)) {
      if (f.startsWith(prefix)) {
        others.add(unit);
      }
    }
  }
  const byDir = new Map(lane.map((c) => [c.dir, c]));
  const hostWhy = new Map();
  const picked = new Map();
  for (const dir of changed) {
    picked.set(dir, 'changed');
  }
  for (const dir of changed) {
    const name = byDir.get(dir)?.name;
    if (!name) {
      continue;
    }
    for (const c of lane) {
      if (!picked.has(c.dir) && c.deps.includes(name)) {
        picked.set(c.dir, `imports ${dir}`);
      }
    }
  }
  for (const h of hosts) {
    if (others.has(h.unit)) {
      continue;
    }
    const by = [...changed]
      .filter((dir) => h.deps.includes(byDir.get(dir)?.name))
      .sort();
    if (by.length) {
      others.add(h.unit);
      hostWhy.set(h.unit, `imports ${by.join(', ')}`);
    }
  }
  const units = [];
  for (const [dir, reason] of [...picked].sort()) {
    units.push(`components/${dir}`);
    why.push(`components/${dir}: ${reason}`);
  }
  for (const o of [...others].sort()) {
    units.push(o);
    why.push(`${o}: ${hostWhy.get(o) ?? 'changed'}`);
  }
  return { all: false, why, units };
}

/**
 * The unit a story belongs to, from its import path in the Storybook index.
 *
 * @param {string} importPath As `index.json` records it
 *   (`./src/v12/components/Button/__stories__/Button.stories.tsx`).
 * @returns {string | null} The unit, or null for a story outside the lane.
 */
export function unitOf(importPath) {
  const p = String(importPath).replace(/^\.\//, '');
  const c = p.match(/^src\/v12\/components\/([^/]+)\//);
  if (c) {
    return `components/${c[1]}`;
  }
  const o = p.match(/^src\/v12\/([^/]+)\//);
  return o ? o[1] : null;
}

/**
 * The plan: the stories of the picked units, from the built Storybook's
 * index, and the `Matrix` stories among them.
 *
 * @param {{ entries: Record<string, { type: string, id: string, name: string, title: string, importPath: string }> }} index
 *   The built Storybook's `index.json`.
 * @param {{ all: boolean, units: string[] }} pick From `pickUnits`.
 * @returns {{ unit: string, stories: { id: string, name: string }[], matrix: string[] }[]}
 *   One row per unit with stories, in unit order.
 */
export function planOf(index, pick) {
  const wanted = new Set(pick.units);
  const rows = new Map();
  for (const e of Object.values(index.entries ?? {})) {
    if (e.type !== 'story') {
      continue;
    }
    const unit = unitOf(e.importPath);
    if (!unit || (!pick.all && !wanted.has(unit))) {
      continue;
    }
    if (!rows.has(unit)) {
      rows.set(unit, { unit, stories: [], matrix: [] });
    }
    const row = rows.get(unit);
    row.stories.push({ id: e.id, name: e.name });
    if (e.name === 'Matrix' || e.id.endsWith('--matrix')) {
      row.matrix.push(e.id);
    }
  }
  return [...rows.values()].sort((a, b) => a.unit.localeCompare(b.unit));
}
