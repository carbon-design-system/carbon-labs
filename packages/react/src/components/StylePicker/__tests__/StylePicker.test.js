/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { StylePicker } from '../index';

describe('StylePicker', () => {
  it('should render', () => {
    render(<StylePicker />);
  });
});
