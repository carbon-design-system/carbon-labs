/**
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

export const PrefixContext = React.createContext('clabs');

/**
 * Sets the prefix context
 * @returns context value
 */
export function usePrefix() {
  return React.useContext(PrefixContext);
}
