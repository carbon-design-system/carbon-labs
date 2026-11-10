/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { seamExports, usersOf, writeContract } from '../src/contract.js';

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

  it('counts a re-export, the folders that import it from the lane package, and the tools', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'v12-contract-'));
    /**
     * Writes a fixture file.
     *
     * @param {string} rel Its path in the fixture.
     * @param {string} text Its contents.
     */
    const write = (rel, text) => {
      fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
      fs.writeFileSync(path.join(root, rel), text);
    };
    const lane = 'packages/react/src/v12/components';
    write(`${lane}/Kit/package.json`, JSON.stringify({ name: '@x/react-kit' }));
    write(
      `${lane}/Kit/index.ts`,
      "export { useEngine } from '@carbon-labs/v12-motion';\nexport * from '@carbon-labs/v12-motion/selection';\n"
    );
    write(
      `${lane}/Menu/components/Menu.tsx`,
      "import { useEngine } from '@x/react-kit';\n"
    );
    write(
      'tools/bench/src/clock.ts',
      "import { tokens, type Draft } from '@carbon-labs/v12-motion';\n"
    );
    const { names, entries } = usersOf(root);
    fs.rmSync(root, { recursive: true, force: true });
    expect([...names].map(([n, at]) => `${n}: ${[...at].sort()}`)).toEqual([
      'useEngine: Kit,Menu',
      'tokens: tools/bench',
      'Draft: tools/bench',
    ]);
    expect([...entries.get('@carbon-labs/v12-motion/selection')]).toEqual([
      'Kit',
    ]);
  });

  it('is current with the seam and the lane', async () => {
    expect(await writeContract(labs, { check: true })).toBe(true);
  });
});
