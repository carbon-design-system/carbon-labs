/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Rule } from '../components/Rule';

describe('Rule', () => {
  it('renders an hr, which is a separator', () => {
    render(<Rule />);
    expect(screen.getByRole('separator').tagName).toBe('HR');
  });

  it('applies the cds prefix and a custom class name', () => {
    render(<Rule className="custom-class" />);
    const node = screen.getByRole('separator');
    expect(node).toHaveClass('cds--rule');
    expect(node).toHaveClass('custom-class');
  });

  it('forwards a ref to the root element', () => {
    const ref = React.createRef<HTMLHRElement>();
    render(<Rule ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLHRElement);
  });

  it('can be hidden from assistive technology where it only flanks text', () => {
    const { container } = render(<Rule aria-hidden="true" />);
    expect(container.querySelector('hr')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
    expect(screen.queryByRole('separator')).toBeNull();
  });
});
