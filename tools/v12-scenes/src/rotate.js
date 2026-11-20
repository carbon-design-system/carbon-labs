/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Which components a night's behavior run takes: the next few in turn, kept
// in an index file between nights, and every component the change touched.

import fs from 'node:fs';
import path from 'node:path';

/**
 * The next `n` components in turn, from `index`, wrapping round.
 *
 * @param {string[]} components Every component with scenarios, sorted.
 * @param {number} n How many.
 * @param {number} index Where the last run stopped.
 * @returns {{ picked: string[], next: number }} The components and the next
 *   run's index.
 */
export function rotate(components, n, index = 0) {
  const total = components.length;
  if (!total || n <= 0) {
    return { picked: [], next: index };
  }
  const start = ((index % total) + total) % total;
  const count = Math.min(n, total);
  const picked = [];
  for (let k = 0; k < count; k++) {
    picked.push(components[(start + k) % total]);
  }
  return { picked, next: (start + count) % total };
}

/**
 * The components a change touched, among those with scenarios: the lane
 * folders the picker chose (src/pick.js).
 *
 * @param {{ all: boolean, units: string[] }} pick From `pickUnits`.
 * @param {string[]} components Every component with scenarios.
 * @returns {string[]} The touched ones, in the components' order.
 */
export function touched(pick, components) {
  if (!pick || pick.all) {
    return [];
  }
  const units = new Set(
    pick.units
      .filter((u) => u.startsWith('components/'))
      .map((u) => u.slice('components/'.length).toLowerCase())
  );
  return components.filter((c) => units.has(c.toLowerCase()));
}

/**
 * Reads the rotation's index file.
 *
 * @param {string} file The file.
 * @returns {number} The index, 0 when there is none.
 */
export function readIndex(file) {
  try {
    return Number(JSON.parse(fs.readFileSync(file, 'utf8')).next) || 0;
  } catch {
    return 0;
  }
}

/**
 * Writes the rotation's index file.
 *
 * @param {string} file The file.
 * @param {number} next The next run's index.
 * @param {string[]} picked What this run took.
 */
export function writeIndex(file, next, picked) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(
    file,
    `${JSON.stringify({ next, last: picked }, null, 1)}\n`
  );
}
