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

import { TextHighlighter } from '../components/TextHighlighter';
jest.mock('./text-highlighter.scss', () => ({}));
describe('TextHighlighter', () => {
  describe('renders as expected - Component API', () => {
    it('should match snapshot', () => {
      const { container } = render(<TextHighlighter />);
      expect(container).toMatchSnapshot();
    });


  });
});
