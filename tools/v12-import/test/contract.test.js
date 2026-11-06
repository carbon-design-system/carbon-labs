/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { seamExports, writeContract } from '../src/contract.js';

const labs = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..'
);

describe('the motion contract', () => {
  it('reads named, type, namespace and whole-module exports', () => {
    const text = `export { motionTokens, attachRollover } from 'a';
export type {
  Draft,
  type Leads,
} from 'a';
export { useStagger } from 'b';
export * as placement from 'c';
export * from 'd';
`;
    expect(
      seamExports(text, 'seam').map((e) => `${e.name}:${e.kind}:${e.from}`)
    ).toEqual([
      'motionTokens:tokens:a',
      'attachRollover:function:a',
      'Draft:type:a',
      'Leads:type:a',
      'useStagger:hook:b',
      'placement:namespace:c',
      '*:module:d',
    ]);
  });

  it('is current with the seam and the lane', async () => {
    expect(await writeContract(labs, { check: true })).toBe(true);
  });
});
