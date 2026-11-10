/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MotionProvider } from '@carbon-labs/v12-motion';
import {
  useReducedGetter,
  type ReducedOverride,
} from '../components/reducedMotion';

type Level = 'full' | 'reduced' | 'none' | 'system';

/** Renders the hook (under a provider at `level`, or none) and hands back its getter. */
function getterFor(override: ReducedOverride, level?: Level): () => boolean {
  let got: (() => boolean) | undefined;
  function Probe() {
    got = useReducedGetter(override);
    return null;
  }
  renderToStaticMarkup(
    level ? (
      <MotionProvider level={level}>
        <Probe />
      </MotionProvider>
    ) : (
      <Probe />
    )
  );
  return got!;
}

describe('useReducedGetter', () => {
  it('follows the OS with no provider and no override (off when rendered on the server)', () => {
    expect(getterFor(undefined)()).toBe(false);
  });

  it('takes the provider over the OS', () => {
    expect(getterFor(undefined, 'reduced')()).toBe(true);
    expect(getterFor(undefined, 'none')()).toBe(true);
    expect(getterFor(undefined, 'full')()).toBe(false);
    expect(getterFor(undefined, 'system')()).toBe(false);
  });

  it('takes the override over the provider, either way', () => {
    expect(getterFor(true, 'full')()).toBe(true);
    expect(getterFor(false, 'reduced')()).toBe(false);
    expect(getterFor(true)()).toBe(true);
  });

  it('reads a getter override on each call, and defers to the provider when it gives undefined', () => {
    let value: boolean | undefined = true;
    const get = getterFor(() => value, 'reduced');
    expect(get()).toBe(true);
    value = false;
    expect(get()).toBe(false);
    value = undefined;
    expect(get()).toBe(true);
  });
});
