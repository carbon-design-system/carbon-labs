/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { POPOVER_ALIGNMENT } from '@carbon/web-components/es/components/popover/defs.js';
import { settings } from '@carbon-labs/utilities';
const { stablePrefix: clabsPrefix } = settings;

export type Kind = 'single' | 'flat' | 'disclosed';

export type Item<T> = {
  value: string;
  label: string;
} & T;

export type Group<T> = {
  label: string;
  items: T[];
};

export type Size = 'sm' | 'lg';

export const prefix = `${clabsPrefix}-style-picker`;

export const STYLE_PICKER_ALIGNMENT = POPOVER_ALIGNMENT;
