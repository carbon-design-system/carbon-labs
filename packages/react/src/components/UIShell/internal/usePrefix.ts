/* eslint-disable jsdoc/require-jsdoc */
/**
 * Copyright IBM Corp. 2016, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

export const PrefixContext = React.createContext('cds');

/**
 * An internal function to return the prefix used in components and styles.
 *
 * @returns a react context including the prefix
 */
export function usePrefix() {
  return React.useContext(PrefixContext);
}
