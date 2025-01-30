/**
 * Copyright IBM Corp. 2016, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

export const PrefixContext = React.createContext('cds');

/**
 * A React hook to get the prefix for the component library.
 * @returns The prefix for the component library.
 */
export function usePrefix() {
  return React.useContext(PrefixContext);
}
