/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createContext } from '@lit/context';
import { Kind, Size } from '../defs';

export interface StylePickerContextType {
  kind?: Kind;
  activeSection?: number;
  setActiveSection?: (moduleIndex: number) => void;
  size?: Size;
  setSize?: (_size?: Size) => void;
  enableSearch?: boolean;
  searchTerm?: string;
}

export const stylePickerContext = createContext<StylePickerContextType>(
  'style-picker-context'
);
