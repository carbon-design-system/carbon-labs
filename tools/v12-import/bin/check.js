#!/usr/bin/env node
/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The lane's checks: a manifest row for every component folder, leaks, motion
// literals and motion from anywhere but the seam, over every v12 folder.
// Prints every finding; exits 1 on an error, never on a warning alone.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkLane } from '../src/check.js';

const labs = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..'
);
const findings = checkLane(labs);
const errors = findings.filter((f) => f.level === 'error');
const warnings = findings.filter((f) => f.level !== 'error');
for (const f of warnings) {
  console.warn(`${f.at}: warning: ${f.kind}: ${f.match}`);
}
for (const f of errors) {
  console.error(`${f.at}: ${f.kind}: ${f.match}`);
}
console.log(
  `v12 check: ${errors.length} error(s), ${warnings.length} warning(s)`
);
process.exit(errors.length ? 1 : 0);
