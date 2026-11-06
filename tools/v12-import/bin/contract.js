#!/usr/bin/env node
/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Writes docs/v12/motion-contract.md; with --check, fails when it isn't current.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONTRACT, writeContract } from '../src/contract.js';

const labs = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..'
);
const check = process.argv.includes('--check');
const current = await writeContract(labs, { check });
if (check && !current) {
  console.error(
    `${CONTRACT} is out of date: run yarn workspace @carbon-labs/v12-import contract`
  );
  process.exit(1);
}
console.log(check ? `${CONTRACT} is current` : `wrote ${CONTRACT}`);
