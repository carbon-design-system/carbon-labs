/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

import { FocusRegion } from '../components/FocusRegion';
jest.mock('./focus-region.scss', () => ({}));
describe('FocusRegion', () => {
  describe('renders as expected - Component API', () => {
    it('should match snapshot', () => {
      const { container } = render(<FocusRegion />);
      expect(container).toMatchSnapshot();
    });
  });
});
