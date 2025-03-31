/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createContext, useContext } from 'react';
import { iViewStackContext } from './types';

const ViewStackContext = createContext<iViewStackContext | undefined>(
  undefined
);

const useViewStackContext = () => {
  const ctx = useContext(ViewStackContext);
  if (!ctx) {
    throw new Error(`Component must be a child of ViewStack`);
  }
  return ctx;
};

export { ViewStackContext, useViewStackContext };
