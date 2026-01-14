/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

interface Settings {
  /**
   * Stable prefix for Carbon Labs components
   * @default 'clabs'
   */
  stablePrefix: string;

  /**
   * Core Carbon prefix
   * @default 'cds'
   */
  prefix: string;
}

declare const settings: Settings;

export default settings;
