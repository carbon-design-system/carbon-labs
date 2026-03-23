/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export * from './settings/index.js';
// Note: usePrefix is not exported from main index to avoid pulling React into web components
// React components should import directly: import { usePrefix } from '@carbon-labs/utilities/es/usePrefix.js'
