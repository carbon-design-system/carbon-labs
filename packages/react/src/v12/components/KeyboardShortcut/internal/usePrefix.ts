/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

// A local prefix context, as UIShell keeps one: the class names are `cds` today
// and move to core unchanged, where this import becomes
// '../../internal/usePrefix'. Labs's own usePrefix returns the labs prefix.
export const PrefixContext = React.createContext('cds');

/**
 * Returns the prefix used in class names and styles.
 */
export function usePrefix() {
  return React.useContext(PrefixContext);
}
