/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { usePrefix } from '@carbon-labs/utilities/es/index.js';
import { CLABSStylePicker as CLABSStylePickerWC } from '../../../../../web-components/src/components/style-picker/react/style-picker';

export const StylePicker = () => {
  const prefix = usePrefix();
  return (
    <div className={`${prefix}--style-picker__container`}>
      <CLABSStylePickerWC />
    </div>
  );
};
