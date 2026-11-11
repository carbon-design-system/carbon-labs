#!/usr/bin/env node
/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// yarn v12:figma snapshot [tokens|components|motion|docs ...] [--check]
//
// Writes the code side of the design sync to figma-sync/, or with --check
// writes nothing and exits 1 when a committed snapshot is out of date or a
// manifest row's `figma` block is wrong.

import { KINDS, ROOT } from '../src/config.js';
import { runSnapshot } from '../src/snapshot.js';

const USAGE = `usage: yarn v12:figma snapshot [${KINDS.join('|')} ...] [--check]`;

const [command, ...rest] = process.argv.slice(2);
if (command !== 'snapshot') {
  console.error(USAGE);
  process.exit(2);
}
const check = rest.includes('--check');
const named = rest.filter((a) => !a.startsWith('--'));
const unknown = named.filter((k) => !KINDS.includes(k));
if (unknown.length) {
  console.error(`no snapshot ${unknown.join(', ')}\n${USAGE}`);
  process.exit(2);
}
const kinds = named.length ? KINDS.filter((k) => named.includes(k)) : KINDS;

const { written, stale, errors, missing } = await runSnapshot(ROOT, {
  kinds,
  check,
});
for (const e of errors) {
  console.error(`error: ${e}`);
}
if (missing.length) {
  console.log(
    `${missing.length} manifest row(s) have no figma block yet and take the default (unmapped, or code-only for styles and shared kits)`
  );
}
for (const file of stale) {
  console.error(`${file} is out of date: run yarn v12:figma snapshot`);
}
for (const file of written) {
  console.log(`wrote ${file}`);
}
if (check && !stale.length && !errors.length) {
  console.log(`figma-sync: ${kinds.join(', ')} current`);
}
process.exit(stale.length || errors.length ? 1 : 0);
