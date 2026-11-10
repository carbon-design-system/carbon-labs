/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { box, HiddenLines, isoAt, type Layer } from '../components/tiles';

describe('HiddenLines', () => {
  it('works out a kind once and reuses it on every render', () => {
    const iso = isoAt(40, 40);
    let calls = 0;
    const draw = (kind: 'a' | 'b'): Layer[] => {
      calls++;
      return [box(iso, [-10, 10], [-10, 10], [0, kind === 'a' ? 5 : 10])];
    };
    const a1 = renderToStaticMarkup(<HiddenLines draw={draw} kind="a" />);
    const a2 = renderToStaticMarkup(<HiddenLines draw={draw} kind="a" />);
    expect(calls).toBe(1);
    expect(a2).toBe(a1);
    expect(a1).toContain('<path');
    const b = renderToStaticMarkup(<HiddenLines draw={draw} kind="b" />);
    expect(calls).toBe(2);
    expect(b).not.toBe(a1);
  });
});
