/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { DURATION_FLOOR_MS } from '@carbon-labs/v12-motion';
import {
  clearJumpGlide,
  JUMP_GLIDE_ATTR,
  markJumpGlide,
} from '@carbon-labs/react-jump-to';
import { jumpClock } from '../components/PageHeader';

/** A scroll box a jump can glide, and the header in it. */
function scene() {
  let gliding = false;
  const box = {
    setAttribute: () => void (gliding = true),
    removeAttribute: () => void (gliding = false),
  };
  const header = {
    closest: (sel: string) =>
      sel === `[${JUMP_GLIDE_ATTR}]` && gliding
        ? (box as unknown as Element)
        : null,
  };
  return { box, header };
}

describe('jumpClock', () => {
  it('leaves the header its own clock when no jump scrolls it', () => {
    expect(jumpClock(scene().header, 0)).toBeNull();
  });

  it("runs a change a jump causes on what is left of the jump's glide", () => {
    const { box, header } = scene();
    markJumpGlide(box, 500);
    expect(jumpClock(header, 200)).toBe(300);
    clearJumpGlide(box);
  });

  it('lands a change at once when the jump has landed, or all but', () => {
    const { box, header } = scene();
    markJumpGlide(box, 500);
    expect(jumpClock(header, 500)).toBe(0);
    expect(jumpClock(header, 500 - DURATION_FLOOR_MS / 2)).toBe(0);
    clearJumpGlide(box);
    expect(jumpClock(header, 500)).toBeNull();
  });
});
