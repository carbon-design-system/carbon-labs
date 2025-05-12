/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

import { Resizer } from '../components/Resizer';
jest.mock('./resizer.scss', () => ({}));
describe('Resizer', () => {
  describe('renders as expected - Component API', () => {
    it('should match snapshot', () => {
      const { container } = render(
        <>
          <div></div>
          <Resizer />
          <div></div>
        </>
      );
      expect(container).toMatchSnapshot();
    });
  });
});
