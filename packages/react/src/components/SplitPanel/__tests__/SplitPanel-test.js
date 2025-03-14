/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

import { SplitPanel } from '../components/SplitPanel';
jest.mock('./split-panel.scss', () => ({}));
describe('SplitPanel', () => {
  describe('renders as expected - Component API', () => {
    it('should match snapshot', () => {
      const { container } = render(
        <SplitPanel
          childrenBeforeSplit={<div>before</div>}
          childrenAfterSplit={<div>after</div>}
        />
      );
      expect(container).toMatchSnapshot();
    });

    it('renders a expected parts', () => {
      render(
        <SplitPanel
          childrenBeforeSplit={<div>before</div>}
          childrenAfterSplit={<div>after</div>}
        />
      );

      screen.getByText('before');
      screen.getByText('after');
      screen.getByRole('separator');
    });

    it('supports a custom class name', () => {
      const { container } = render(
        <SplitPanel
          className="test"
          childrenBeforeSplit={<div>before</div>}
          childrenAfterSplit={<div>after</div>}
        />
      );
      expect(container.firstElementChild).toHaveClass('test');
    });

    it('supports additional props', () => {
      const { container } = render(
        <SplitPanel
          data-testid="test-button"
          childrenBeforeSplit={<div>before</div>}
          childrenAfterSplit={<div>after</div>}
        />
      );
      expect(
        // eslint-disable-next-line
        container.firstElementChild
      ).toHaveAttribute('data-testid', 'test-button');
    });
  });
});
