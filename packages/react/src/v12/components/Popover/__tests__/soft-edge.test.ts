/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { insetsOf, softEdgeFor, softEdges } from '../components/soft-edge';

describe('the popover soft edge, min(16px, h, H − h) per side', () => {
  it('is the token while the content runs well past the clip', () => {
    expect(softEdgeFor(16, 200, 40)).toBe(16);
  });

  it('closes up over the last px the content is clipped by, and is 0 at rest', () => {
    expect(softEdgeFor(16, 200, 5)).toBe(5);
    expect(softEdgeFor(16, 200, 0)).toBe(0);
    expect(softEdgeFor(16, 200, -3)).toBe(0);
  });

  it('is never wider than the open extent', () => {
    expect(softEdgeFor(16, 10, 40)).toBe(10);
  });

  it('opening below its trigger: the content slid up under the edge that holds still gets one too', () => {
    // A 300 × 200 surface, its frame 60% wide and 75% tall from the top edge's middle;
    // the content shifted 30px up toward the origin.
    const clip = { t: 0, r: 240, b: 150, l: 60 };
    const content = { t: -30, r: 300, b: 170, l: 0 };
    expect(softEdges(16, clip, content)).toEqual([16, 16, 16, 16]);
  });

  it('closing: only the far edge, as the clip passes over content that holds still', () => {
    const clip = { t: 0, r: 300, b: 190, l: 0 };
    const content = { t: 0, r: 300, b: 200, l: 0 };
    expect(softEdges(16, clip, content)).toEqual([0, 0, 10, 0]);
  });
});

describe('the clip, read from the snap’s clip-path', () => {
  it('reads one to four lengths, with or without a radius', () => {
    expect(insetsOf('inset(1px 2px 3px 4px round 16px)')).toEqual([1, 2, 3, 4]);
    expect(insetsOf('inset(0px round 16px)')).toEqual([0, 0, 0, 0]);
    expect(insetsOf('inset(5px 10px)')).toEqual([5, 10, 5, 10]);
    expect(insetsOf('inset(1.5px 2px 3px)')).toEqual([1.5, 2, 3, 2]);
  });

  it('is null for anything else', () => {
    expect(insetsOf('none')).toBeNull();
    expect(insetsOf('circle(50%)')).toBeNull();
  });
});
