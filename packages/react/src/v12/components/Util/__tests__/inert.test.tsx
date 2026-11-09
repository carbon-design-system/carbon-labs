/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { inertProps } from '../components/inert';

afterEach(() => vi.restoreAllMocks());

describe('inertProps', () => {
  it('writes the attribute when on, and nothing when off, without a warning', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(renderToStaticMarkup(<div id="a" {...inertProps(true)} />)).toBe(
      '<div id="a" inert=""></div>'
    );
    expect(renderToStaticMarkup(<div id="a" {...inertProps(false)} />)).toBe(
      '<div id="a"></div>'
    );
    expect(
      renderToStaticMarkup(<div id="a" {...inertProps(undefined)} />)
    ).toBe('<div id="a"></div>');
    expect(error).not.toHaveBeenCalled();
  });
});
