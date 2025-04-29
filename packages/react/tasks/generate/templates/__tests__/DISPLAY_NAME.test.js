/**
 * @license
 *
 * Copyright IBM Corp. FULL_YEAR
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

import { DISPLAY_NAME } from '../components/DISPLAY_NAME';
jest.mock('./STYLE_NAME.scss', () => ({}));
describe('DISPLAY_NAME', () => {
  describe('renders as expected - Component API', () => {
    it('should match snapshot', () => {
      const { container } = render(<DISPLAY_NAME />);
      expect(container).toMatchSnapshot();
    });
  });
});
