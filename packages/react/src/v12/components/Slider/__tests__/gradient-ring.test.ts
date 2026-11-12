/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The gradient knob's ring paints the fill's ramp at the track's size, shifted
// to the ring's place. A `background` shorthand anywhere in its rule would
// reset that size, position and origin, wherever the lint's order puts it.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = path.dirname(fileURLToPath(import.meta.url));
const scss = fs
  .readFileSync(path.resolve(here, '../components/slider.scss'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');

/** The body of the one rule that holds `marker`, from its `{` to its `}`. */
const ruleWith = (marker: string) => {
  const at = scss.indexOf(marker);
  expect(at, `${marker} is in the stylesheet`).toBeGreaterThan(-1);
  expect(scss.indexOf(marker, at + 1), `${marker} is there once`).toBe(-1);
  return scss.slice(scss.lastIndexOf('{', at) + 1, scss.indexOf('}', at));
};

describe('the gradient knob\u2019s ring', () => {
  const ring = ruleWith('background-size: 100cqi 100%;');

  it('keeps the track\u2019s size, its place on it and its origin', () => {
    expect(ring).toMatch(/background-origin: border-box;/);
    expect(ring).toMatch(/background-position-x: calc\(/);
    expect(ring).toMatch(/background-repeat: no-repeat;/);
  });

  it('takes the ramp as an image, never as the shorthand', () => {
    expect(ring).toMatch(/@include gradient-ramp;/);
    expect(ring).not.toMatch(/(^|[\s;])background:/);
    const mixin = ruleWith('var(--_ramp-to) in oklch,');
    expect(mixin).toMatch(/^\s*background-image: linear-gradient\(/);
    expect(mixin).not.toMatch(/(^|[\s;])background:/);
  });

  it('shares the fill\u2019s ramp, which clears the plain fill under it', () => {
    expect(scss.match(/@include gradient-ramp;/g)).toHaveLength(2);
    const fill = ruleWith('background-color: transparent;');
    expect(fill).toMatch(/@include gradient-ramp;/);
  });
});
