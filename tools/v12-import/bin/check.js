#!/usr/bin/env node
/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The lane's checks: leaks, motion literals and motion from anywhere but the
// seam, over every v12 folder. Exits 1 on a finding.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkLane } from '../src/check.js';

const labs = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..'
);
const findings = checkLane(labs);
for (const f of findings) {
  console.error(`${f.at}: ${f.kind}: ${f.match}`);
}
console.log(`v12 check: ${findings.length} finding(s)`);
process.exit(findings.length ? 1 : 0);
