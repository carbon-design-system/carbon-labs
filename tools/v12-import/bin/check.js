#!/usr/bin/env node
/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The lane's checks: a manifest row for every component folder, leaks, motion
// literals and motion from anywhere but the seam, over every v12 folder; and,
// as warnings, the motion rules, the prop vocabulary and the departures
// registry's marks. Prints every finding
// and the warnings' count by rule; exits 1 on an error, never on a warning.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkLane } from '../src/check.js';

const labs = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..'
);
const findings = checkLane(labs);
const errors = findings.filter((f) => f.level === 'error');
const warnings = findings.filter((f) => f.level === 'warning');
const allowed = findings.filter((f) => f.level === 'allowed');
for (const f of warnings) {
  console.warn(`${f.at}: warning: ${f.kind}: ${f.match}`);
}
for (const f of errors) {
  console.error(`${f.at}: ${f.kind}: ${f.match}`);
}
// Warnings by rule, so a count that moves is seen.
const byRule = new Map();
for (const f of warnings) {
  byRule.set(f.kind, (byRule.get(f.kind) ?? 0) + 1);
}
for (const [kind, n] of [...byRule].sort()) {
  console.log(`  ${String(n).padStart(4)}  ${kind}`);
}
console.log(
  `v12 check: ${errors.length} error(s), ${warnings.length} warning(s), ${allowed.length} allowed by comment`
);
process.exit(errors.length ? 1 : 0);
