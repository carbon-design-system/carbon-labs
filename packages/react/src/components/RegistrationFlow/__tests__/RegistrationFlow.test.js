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

import { RegistrationFlow } from '../components/RegistrationFlow';
jest.mock('./registration-flow.scss', () => ({}));
describe('RegistrationFlow', () => {
  describe('renders as expected - Component API', () => {
    it('should match snapshot', () => {
      const { container } = render(<RegistrationFlow />);
      expect(container).toMatchSnapshot();
    });
  });
});
