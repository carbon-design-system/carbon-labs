/**
 * @license
 *
 * Copyright IBM Corp. FULL_YEAR
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { DISPLAY_NAME } from '../components/DISPLAY_NAME';

describe('DISPLAY_NAME', () => {
  it('renders its children', () => {
    render(<DISPLAY_NAME>Hello</DISPLAY_NAME>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('applies the cds prefix and a custom class name', () => {
    render(<DISPLAY_NAME className="custom-class">Hello</DISPLAY_NAME>);
    expect(screen.getByText('Hello')).toHaveClass(
      'cds--STYLE_NAME',
      'custom-class'
    );
  });

  it('forwards a ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<DISPLAY_NAME ref={ref}>Hello</DISPLAY_NAME>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
