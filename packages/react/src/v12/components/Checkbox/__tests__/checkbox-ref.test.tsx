/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */
// @vitest-environment jsdom

import { createRef } from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Checkbox } from '../components/Checkbox';

afterEach(cleanup);

describe('Checkbox ref', () => {
  it('is the input, as Carbon’s', () => {
    const ref = createRef<HTMLInputElement>();
    const { unmount } = render(
      <Checkbox ref={ref} id="terms" labelText="I agree" />
    );
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe('checkbox');
    expect(ref.current?.id).toBe('terms');
    unmount();
    expect(ref.current).toBeNull();
  });

  it('keeps the mixed state on the input it points at', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} id="all" labelText="All" indeterminate />);
    expect(ref.current?.indeterminate).toBe(true);
  });
});
