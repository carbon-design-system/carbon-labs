/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { scrolledPast } from '../components/softEdge';

const box = (o: Partial<Parameters<typeof scrolledPast>[0]>) => ({
  scrollTop: 0,
  scrollLeft: 0,
  scrollHeight: 400,
  scrollWidth: 200,
  clientHeight: 200,
  clientWidth: 200,
  ...o,
});
const y = { x: false, y: true };

describe('scrolledPast (the scroll soft edge)', () => {
  it('at the top: no top edge, a bottom edge while more remains', () => {
    expect(scrolledPast(box({}), y, 16)).toEqual({
      top: 0,
      right: 0,
      bottom: 16,
      left: 0,
    });
  });

  it('grows over the first 16px scrolled and closes over the last', () => {
    expect(scrolledPast(box({ scrollTop: 6 }), y, 16).top).toBe(6);
    expect(scrolledPast(box({ scrollTop: 100 }), y, 16)).toMatchObject({
      top: 16,
      bottom: 16,
    });
    expect(scrolledPast(box({ scrollTop: 190 }), y, 16).bottom).toBe(10);
    expect(scrolledPast(box({ scrollTop: 200 }), y, 16)).toMatchObject({
      top: 16,
      bottom: 0,
    });
  });

  it('nothing when nothing overflows, or only by rounding', () => {
    expect(scrolledPast(box({ scrollHeight: 200 }), y, 16)).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
    expect(scrolledPast(box({ scrollHeight: 200.5 }), y, 16).bottom).toBe(0);
  });

  it('only the axes that scroll', () => {
    const wide = box({ scrollWidth: 500, scrollLeft: 40 });
    expect(scrolledPast(wide, y, 16)).toMatchObject({ left: 0, right: 0 });
    expect(scrolledPast(wide, { x: true, y: false }, 16)).toEqual({
      top: 0,
      bottom: 0,
      left: 16,
      right: 16,
    });
  });

  it('RTL: scrollLeft runs negative from the right', () => {
    const atStart = box({ scrollWidth: 500, scrollLeft: 0 });
    expect(
      scrolledPast(atStart, { x: true, y: false }, 16, true)
    ).toMatchObject({ right: 0, left: 16 });
    const atEnd = box({ scrollWidth: 500, scrollLeft: -300 });
    expect(scrolledPast(atEnd, { x: true, y: false }, 16, true)).toMatchObject({
      right: 16,
      left: 0,
    });
  });
});
