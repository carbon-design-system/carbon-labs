/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom';

import { TextHighlighter } from '../components/TextHighlighter';
jest.mock('./button.scss', () => ({}));
describe('TextHighlighter', () => {
  describe('renders as expected - Component API', () => {
    it('should match snapshot', () => {
      const { container } = render(<TextHighlighter />);
      expect(container).toMatchSnapshot();
    });

    it('renders a button element', () => {
      render(<TextHighlighter />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with default text "Button"', () => {
      render(<TextHighlighter />);
      expect(screen.getByRole('button')).toHaveTextContent(/^Button$/);
    });

    it('supports a custom class name', () => {
      const { container } = render(<TextHighlighter className="test" />);
      expect(container.firstChild.firstChild).toHaveClass('test');
    });

    it('supports additional props', () => {
      render(<TextHighlighter data-testid="test-button" />);
      expect(screen.getByRole('button')).toHaveAttribute(
        'data-testid',
        'test-button'
      );
    });

    it('supports disabled state', () => {
      render(<TextHighlighter disabled />);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('behaves as expected', () => {
    it('calls onClick handler when clicked', async () => {
      const onClick = jest.fn();
      render(<TextHighlighter onClick={onClick} />);

      expect(onClick).toHaveBeenCalledTimes(0);
      await userEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
