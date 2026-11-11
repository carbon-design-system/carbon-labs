/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */
// @vitest-environment jsdom

import { useRef } from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { inlineKey, isRtl, useDirection } from '../components/direction';

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('dir');
});

describe('isRtl', () => {
  it('reads the nearest dir attribute', () => {
    const outer = document.createElement('div');
    outer.dir = 'rtl';
    const inner = document.createElement('span');
    outer.append(inner);
    document.body.append(outer);
    expect(isRtl(inner)).toBe(true);
    outer.dir = 'ltr';
    expect(isRtl(inner)).toBe(false);
    outer.remove();
  });

  it('is false for no element', () => {
    expect(isRtl(null)).toBe(false);
    expect(isRtl(undefined)).toBe(false);
  });
});

describe('inlineKey', () => {
  it('keeps every key left to right', () => {
    expect(inlineKey('ArrowLeft', 'ltr')).toBe('ArrowLeft');
    expect(inlineKey('ArrowRight', false)).toBe('ArrowRight');
  });

  it('swaps the horizontal arrows right to left', () => {
    expect(inlineKey('ArrowLeft', 'rtl')).toBe('ArrowRight');
    expect(inlineKey('ArrowRight', true)).toBe('ArrowLeft');
  });

  it('leaves the other keys alone', () => {
    for (const key of ['ArrowUp', 'ArrowDown', 'Home', 'End', 'a']) {
      expect(inlineKey(key, 'rtl')).toBe(key);
    }
  });

  it('reads an element’s direction', () => {
    const el = document.createElement('div');
    el.dir = 'rtl';
    document.body.append(el);
    expect(inlineKey('ArrowLeft', el)).toBe('ArrowRight');
    el.dir = 'ltr';
    expect(inlineKey('ArrowLeft', el)).toBe('ArrowLeft');
    el.remove();
  });
});

describe('useDirection', () => {
  function Probe() {
    const ref = useRef<HTMLDivElement>(null);
    const dir = useDirection(ref);
    return <div ref={ref} data-dir={dir} />;
  }

  it('follows a dir attribute that changes on the page', async () => {
    const { container } = render(<Probe />);
    const probe = container.querySelector('[data-dir]')!;
    expect(probe.getAttribute('data-dir')).toBe('ltr');
    await act(async () => {
      document.documentElement.setAttribute('dir', 'rtl');
      // The observer reports after the change, in a microtask.
      await Promise.resolve();
    });
    expect(probe.getAttribute('data-dir')).toBe('rtl');
  });
});
