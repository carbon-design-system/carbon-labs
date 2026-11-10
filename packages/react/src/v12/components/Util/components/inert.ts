/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { version } from 'react';

/** React 19 takes a boolean `inert`; React 18 drops a boolean (with a warning) and takes a string. */
const BOOLEAN_INERT = Number.parseInt(version, 10) >= 19;

/** Inert or not, on React 18 and 19: `<div {...inertProps(!open)}>`. Off, no attribute. */
export function inertProps(on: boolean | undefined): { inert?: boolean } {
  if (!on) {
    return {};
  }
  return { inert: (BOOLEAN_INERT ? true : '') as boolean };
}
