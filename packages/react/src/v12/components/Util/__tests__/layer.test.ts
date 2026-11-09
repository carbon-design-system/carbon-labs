/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  enterLayer,
  isTopLayer,
  leaveLayer,
  openLayers,
} from '../components/layer';

describe('the page layers: one stack', () => {
  it('a panel opened from a modal is above it; the modal is the top again when it closes', () => {
    const modal = {};
    const panel = {};
    enterLayer(modal);
    expect(isTopLayer(modal)).toBe(true);
    enterLayer(panel);
    expect(isTopLayer(panel)).toBe(true);
    expect(isTopLayer(modal)).toBe(false);
    leaveLayer(panel);
    expect(isTopLayer(modal)).toBe(true);
    leaveLayer(modal);
    expect(openLayers()).toEqual([]);
  });

  it('two modals and a panel: one entry each, the last opened on top', () => {
    const a = {};
    const b = {};
    const p = {};
    enterLayer(p);
    enterLayer(a);
    enterLayer(a);
    enterLayer(b);
    expect(openLayers()).toEqual([p, a, b]);
    expect([p, a, b].map(isTopLayer)).toEqual([false, false, true]);
    leaveLayer(b);
    leaveLayer(a);
    expect(isTopLayer(p)).toBe(true);
    leaveLayer(p);
    leaveLayer(p);
    expect(openLayers()).toEqual([]);
  });
});

describe('layer.ts is a leaf', () => {
  it('imports no component (a SidePanel-only app does not load the modal)', () => {
    const src = readFileSync(
      new URL('../components/layer.ts', import.meta.url),
      'utf8'
    );
    const imports = [...src.matchAll(/from '([^']+)'/g)].map((m) => m[1]);
    expect(imports.every((s) => !s.startsWith('.'))).toBe(true);
  });
});
