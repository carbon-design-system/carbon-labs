/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it, vi } from 'vitest';
import { createTooltipHold } from '../components/hold';

describe('createTooltipHold', () => {
  it('is not held until it holds', () => {
    expect(createTooltipHold().held()).toBe(false);
  });

  it('calls each waiting trigger once, when it lands', () => {
    const h = createTooltipHold();
    h.hold();
    const a = vi.fn();
    const b = vi.fn();
    h.onLand(a);
    h.onLand(b);
    expect(h.held()).toBe(true);
    h.land();
    expect(h.held()).toBe(false);
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
    h.hold();
    h.land();
    expect(a).toHaveBeenCalledTimes(1);
  });

  it('drops a trigger that stopped waiting', () => {
    const h = createTooltipHold();
    h.hold();
    const a = vi.fn();
    const off = h.onLand(a);
    off();
    h.land();
    expect(a).not.toHaveBeenCalled();
  });

  it('a landing it never held for calls nothing', () => {
    const h = createTooltipHold();
    const a = vi.fn();
    h.onLand(a);
    h.land();
    expect(a).not.toHaveBeenCalled();
  });
});
