/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// carbon-motion's selection layer as one module, at
// `@carbon-labs/v12-motion/selection`: for a component that re-exports it
// whole (`export * from`), where the seam's root would re-export everything.
// The root keeps it as the `selection` namespace and its named exports.
export * from '@carbon-labs/motion-react/motion/selection';
