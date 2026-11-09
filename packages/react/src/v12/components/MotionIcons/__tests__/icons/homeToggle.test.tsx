/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HomeFilled, HomeToggle } from '../../icons/toggle/homeToggle';
import { Home } from '../../icons/navigation/navZoom';
import type { Shapes } from '../../utils/frameIcon';

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});

const STEPS = [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1];
const SIZES = [16, 20, 24, 32];
const BAD_NUMBER = /NaN|Infinity|undefined/;
const grid = STEPS.flatMap((h) =>
  STEPS.flatMap((p) => [
    { h, p, e: 0 },
    { h, p: 1, e: p },
  ])
);

describe('HomeToggle', () => {
  it('keeps the same shape keys at every frame and size', () => {
    const keys = Object.keys(HomeToggle.geo({ h: 0, p: 0, e: 0 }, 32)).sort();
    expect(keys).toEqual(['fill', 'house']);
    for (const size of SIZES) {
      for (const f of grid)
        expect(
          Object.keys(HomeToggle.geo(f, size)).sort(),
          `${JSON.stringify(f)} @${size}`
        ).toEqual(keys);
      for (const h of STEPS)
        expect(Object.keys(HomeFilled.geo({ h }, size)).sort()).toEqual(keys);
    }
  });

  it('never paints NaN or Infinity', () => {
    for (const size of SIZES) {
      for (const f of grid) {
        const shapes: Shapes = HomeToggle.geo(f, size);
        for (const [k, attrs] of Object.entries(shapes)) {
          for (const [a, v] of Object.entries(attrs))
            expect(
              BAD_NUMBER.test(String(v)),
              `${k}.${a} at ${JSON.stringify(f)} @${size}`
            ).toBe(false);
        }
      }
    }
  });

  it('is Home (and its hover) with no fill when off', () => {
    for (const size of SIZES) {
      for (const h of [0, 0.5, 1]) {
        const { fill, ...rest } = HomeToggle.geo({ h, p: 0, e: 0 }, size);
        expect(rest).toEqual(Home.geo({ h }, size));
        expect(fill.d).toBe('');
      }
    }
  });

  it('is HomeFilled when on', () => {
    for (const size of SIZES) {
      for (const h of STEPS)
        expect(HomeToggle.geo({ h, p: 1, e: 0 }, size)).toEqual(
          HomeFilled.geo({ h }, size)
        );
    }
  });

  it('fills the house with the door knocked out (one even-odd path)', () => {
    const { fill } = HomeFilled.geo({ h: 0 }, 32);
    expect(fill.fillRule).toBe('evenodd');
    // The inside to the walls' and roof's centreline, less the stepped-out
    // door frame's centreline: whole-pixel walls, base and door.
    expect(fill.d).toMatch(
      /^M5 27L5 [\d.]+L16(\.\d+)? [\d.]+L27 [\d.]+L27 27ZM12 16L20 16L20 27L12 27Z$/
    );
    // Fully emptied by the hole: each region drawn twice, which even-odd
    // cancels (the doorway is back to the outline's by then).
    const parts = String(HomeToggle.geo({ h: 0, p: 1, e: 1 }, 32).fill.d).split(
      'Z'
    );
    expect(parts).toHaveLength(5);
    expect([parts[0], parts[2]]).toEqual([parts[1], parts[3]]);
    expect(parts[2]).toBe('M13 17L19 17L19 27L13 27');
  });

  it('steps the door frame 1px out all round as it fills: doorway x 13–19, y 17–26', () => {
    const { house } = HomeFilled.geo({ h: 0 }, 32);
    // The doorway and the frame's outer edge, on the base.
    expect(house.d).toContain('ZM19 26L13 26L13 17L19 17ZM21 26L21 17A');
    expect(house.d).toContain(' 11 17L11 26L6 26');
    // Halfway (k = 0.5) at p = 0.5, and back to Home's geometry as the hole empties it.
    expect(HomeToggle.geo({ h: 0, p: 0.5, e: 0 }, 32).house.d).toContain(
      'ZM18.5 26L13.5 26L13.5 17.5L18.5 17.5Z'
    );
    expect(HomeToggle.geo({ h: 0, p: 1, e: 0.5 }, 32).house.d).toContain(
      'ZM18.5 26L13.5 26L13.5 17.5L18.5 17.5Z'
    );
  });

  it("hovers through Home's growth: filled, the doorway grows to x 12–20, y 13–26, and the fill follows the walls", () => {
    const { house, fill } = HomeFilled.geo({ h: 1 }, 32);
    expect(house.d).toContain('ZM20 26L12 26L12 13L20 13Z');
    // The fill's outline reaches the grown walls' and base's centreline, less the doorway's frame centreline.
    expect(fill.d).toMatch(
      /^M3 27L3 [\d.]+L16(\.\d+)? -?[\d.]+L29 [\d.]+L29 27ZM11 12L21 12L21 27L11 27Z$/
    );
  });

  describe.each([true, false])('animated=%s', (animated) => {
    it.each(['off', 'on'] as const)('renders with initial="%s"', (initial) => {
      const { container } = render(
        <HomeToggle
          initial={initial}
          animated={animated}
          size={32}
          aria-label="Home"
        />
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      const evenodd =
        container
          .querySelector('path[fill-rule="evenodd"]')
          ?.getAttribute('d') ?? '';
      if (initial === 'on') expect(evenodd.length).toBeGreaterThan(0);
      else expect(evenodd).toBe('');
      expect(container.querySelector('mask, clipPath')).toBeNull();
    });
  });

  it('renders HomeFilled', () => {
    const { container } = render(<HomeFilled size={20} aria-label="Home" />);
    expect(container.querySelectorAll('path')).toHaveLength(2);
  });
});
