#!/usr/bin/env node
/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Places the marks the departures registry asks for
// (packages/react/src/v12/departures.json). Lists each mark it would place
// and each place it can't mark; with --write, places them.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { planDepartures, writeDepartures } from '../src/departures.js';

const labs = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..'
);
const write = process.argv.includes('--write');
const { placements, missing } = planDepartures(labs);
for (const p of placements) {
  console.log(`${p.file}:${p.line}: ${p.entry.id}`);
}
for (const m of missing) {
  console.warn(`${m.place}: can't mark ${m.entry.id}: ${m.reason}`);
}
if (write) {
  const files = writeDepartures(labs, placements);
  console.log(
    `placed ${placements.length} mark(s) in ${files.length} file(s); ${missing.length} place(s) can't be marked`
  );
} else {
  console.log(
    `${placements.length} mark(s) to place, ${missing.length} place(s) can't be marked; --write places them`
  );
}
