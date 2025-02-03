/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom';

import AnimatedHeader from '../components/AnimatedHeader/AnimatedHeader';
jest.mock('../components/AnimatedHeader/animated-header.scss', () => ({}));
describe('AnimatedHeader', () => {
  describe('renders as expected - Component API', () => {
    it('should match snapshot', () => {
      const { container } = render(<AnimatedHeader />);
      expect(container).toMatchSnapshot();
    });
  });
});
