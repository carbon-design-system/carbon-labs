/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The seam resolves: each re-export reaches a carbon-motion value.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import * as seam from '../index';

/**
 * The value names the seam's index re-exports, read from its source: every
 * `export { ... } from` and `export * as` line, without the type-only ones.
 */
function valueExports(): string[] {
  const src = readFileSync(
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../index.ts'),
    'utf8'
  );
  const names: string[] = [];
  for (const m of src.matchAll(/export\s+\{([^}]*)\}\s*from/g)) {
    for (const part of m[1].split(',')) {
      const name = part
        .trim()
        .split(/\s+as\s+/)
        .pop()
        ?.trim();
      if (name && !name.startsWith('type ')) {
        names.push(name);
      }
    }
  }
  for (const m of src.matchAll(/export\s+\*\s+as\s+([\w$]+)\s+from/g)) {
    names.push(m[1]);
  }
  return names;
}

describe('@carbon-labs/v12-motion', () => {
  it('re-exports the tokens', () => {
    expect(seam.motionTokens.duration['fast-02']).toBe(120);
    expect(typeof seam.DURATION_FLOOR_MS).toBe('number');
  });

  it('re-exports reduced motion', () => {
    expect(typeof seam.usePrefersReducedMotion).toBe('function');
    expect(typeof seam.reducedClock).toBe('function');
  });

  it('re-exports the primitives', () => {
    for (const fn of [
      seam.attachRollover,
      seam.playContentSwap,
      seam.staggerMsForSize,
      seam.durationStepForDistance,
      seam.animateLayout,
      seam.stepDown,
      seam.toEasing,
    ]) {
      expect(typeof fn).toBe('function');
    }
    expect(seam.staggerSteps).toBeDefined();
    expect(seam.CONTENT_SWAP).toBeDefined();
    expect(seam.SKELETON_WAVE).toBeDefined();
    expect(seam.LOADING_MOTION).toBeDefined();
  });

  it('re-exports the motion layer', () => {
    expect(typeof seam.FeedbackMotion).toBe('function');
    expect(Object.keys(seam.placement).length).toBeGreaterThan(0);
    expect(Object.keys(seam.shadow).length).toBeGreaterThan(0);
    expect(Object.keys(seam.selection).length).toBeGreaterThan(0);
  });

  it('re-exports what the workbench needs', () => {
    expect(typeof seam.MotionProvider).toBe('function');
    expect(typeof seam.applyDraft).toBe('function');
    expect(typeof seam.getDraft).toBe('function');
    expect(seam.tokens['duration-fast-02']).toBeDefined();
  });

  it('gives the selection layer whole at its own subpath', async () => {
    const sub = await import('../selection');
    const layer = await import('@carbon-labs/motion-react/motion/selection');
    expect(Object.keys(sub).sort()).toEqual(Object.keys(layer).sort());
    expect(Object.keys(sub).length).toBeGreaterThan(0);
    // Not the whole seam.
    expect(Object.keys(sub)).not.toContain('motionTokens');
    expect(Object.keys(sub).sort()).toEqual(Object.keys(seam.selection).sort());
  });

  it('resolves every value it re-exports', () => {
    const names = valueExports();
    expect(names.length).toBeGreaterThan(100);
    const missing = names.filter(
      (n) => (seam as Record<string, unknown>)[n] === undefined
    );
    expect(missing).toEqual([]);
  });
});
