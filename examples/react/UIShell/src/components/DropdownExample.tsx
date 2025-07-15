/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Dropdown } from '@carbon/react';

export const DropdownExample = () => (
  <Dropdown
    aria-label="Choose an option"
    id="default"
    size="sm"
    itemToString={(item) => (item ? item.text : '')}
    items={[{ text: 'Option 1' }, { text: 'Option 2' }, { text: 'Option 3' }]}
    label="Choose an option"
    titleText={''}
  />
);
