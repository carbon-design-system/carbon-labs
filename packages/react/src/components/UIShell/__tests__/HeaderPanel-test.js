/**
 * Copyright IBM Corp. 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { HeaderPanel } from '../components/HeaderPanel';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('HeaderPanel', () => {
  describe('renders as expected - Component API', () => {
    it('should spread extra props onto outermost element', () => {
      const { container } = render(
        <HeaderPanel aria-label="aria-label" data-testid="test-id" />
      );

      expect(container.firstChild).toHaveAttribute('data-testid', 'test-id');
    });

    it('should respect aria-label prop', () => {
      const { container } = render(<HeaderPanel aria-label="test-aria" />);

      expect(container.firstChild).toHaveAttribute('aria-label', 'test-aria');
    });

    it('should respect aria-labelledby prop', () => {
      const { container } = render(
        <HeaderPanel aria-labelledby="test-aria-labelledby" />
      );

      expect(container.firstChild).toHaveAttribute(
        'aria-labelledby',
        'test-aria-labelledby'
      );
    });

    it('should support a custom `className` prop on the outermost element', () => {
      const { container } = render(
        <HeaderPanel aria-label="test-aria" className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should respect expanded prop', () => {
      const { container } = render(
        <HeaderPanel aria-label="test-aria" expanded />
      );

      expect(container.firstChild).toHaveClass('cds--header-panel--expanded');
    });

    it('should render children as expected', () => {
      render(
        <HeaderPanel aria-label="test-aria">
          <div className="child">Test</div>
          <div className="child">Test</div>
        </HeaderPanel>
      );

      const childrenArray = screen.getAllByText('Test');
      expect(childrenArray.length).toEqual(2);
    });

    it('should not error when `onHeaderPanelFocus` is not defined', async () => {
      render(
        <HeaderPanel>
          <button type="button">Test</button>
        </HeaderPanel>
      );

      await expect(async () => {
        screen.getByRole('button', { name: 'Test' }).focus();
        await userEvent.keyboard('{Escape}');
      }).not.toThrow();
    });

    it('should handle onBlur', async () => {
      const onBlur = jest.fn();

      render(
        <HeaderPanel href="#" expanded onHeaderPanelFocus={onBlur}>
          <div>Panel Content</div>
        </HeaderPanel>
      );

      const panel = screen.getByText('Panel Content').parentElement;
      fireEvent.blur(panel, {
        relatedTarget: null,
      });

      expect(onBlur).toHaveBeenCalled();
    });
  });
});
