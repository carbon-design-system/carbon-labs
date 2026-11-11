/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import {
  clearJumpGlide,
  JUMP_GLIDE_ATTR,
  jumpRemaining,
  markJumpGlide,
} from '../components/engine';

/** A scroll box and an element in it, as far as the clock reads them. */
function scene() {
  const attrs = new Map<string, string>();
  const box = {
    setAttribute: (k: string, v: string) => void attrs.set(k, v),
    removeAttribute: (k: string) => void attrs.delete(k),
  };
  const inside = {
    closest: (sel: string) =>
      sel === `[${JUMP_GLIDE_ATTR}]` && attrs.has(JUMP_GLIDE_ATTR)
        ? (box as unknown as Element)
        : null,
  };
  return { box, inside, attrs };
}

describe('jumpRemaining', () => {
  it('is null where no jump moves the scroll', () => {
    const { inside } = scene();
    expect(jumpRemaining(inside, 0)).toBeNull();
    expect(jumpRemaining(null, 0)).toBeNull();
  });

  it("gives what is left of a jump's glide to what is in its box", () => {
    const { box, inside, attrs } = scene();
    markJumpGlide(box, 1000);
    expect(attrs.has(JUMP_GLIDE_ATTR)).toBe(true);
    expect(jumpRemaining(inside, 760)).toBe(240);
    // Its landing frame, and after: 0, never less.
    expect(jumpRemaining(inside, 1000)).toBe(0);
    expect(jumpRemaining(inside, 1016)).toBe(0);
  });

  it('is null again once the jump is over', () => {
    const { box, inside, attrs } = scene();
    markJumpGlide(box, 1000);
    clearJumpGlide(box);
    expect(attrs.has(JUMP_GLIDE_ATTR)).toBe(false);
    expect(jumpRemaining(inside, 900)).toBeNull();
  });
});
