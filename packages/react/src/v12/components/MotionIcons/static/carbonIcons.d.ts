/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @carbon/icons ships its per-icon modules without types. Each one
// (`@carbon/icons/es/<name>/<size>.js`) default-exports a descriptor.
declare module '@carbon/icons/es/*' {
  const descriptor: import('./svg').IconDescriptor;
  export default descriptor;
}
