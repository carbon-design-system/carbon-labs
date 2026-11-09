/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { escapeRegExp } from '../src/rewrite.js';

describe('escapeRegExp', () => {
  it('matches a package name as written, and nothing like it', () => {
    const re = new RegExp(`^${escapeRegExp('@carbon-next/kit.v2')}$`);
    expect(re.test('@carbon-next/kit.v2')).toBe(true);
    expect(re.test('@carbon-next/kitxv2')).toBe(false);
  });

  it('escapes the backslash and every special character', () => {
    const text = String.raw`a\b^$.*+?()[]{}|/c`;
    expect(new RegExp(`^${escapeRegExp(text)}$`).test(text)).toBe(true);
  });

  it('writes a name as the config source did before', () => {
    expect(escapeRegExp('@carbon-motion/core')).toBe(
      String.raw`@carbon-motion\/core`
    );
  });
});
