/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The types of @carbon/icons' per-icon modules (it ships none). Referenced
// here, not just included by tsconfig, so a host app that compiles this
// package's source picks them up too.
// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- an ambient wildcard module can't be imported
/// <reference path="./carbonIcons.d.ts" />
/**
 * Carbon's own static art, drawn from `@carbon/icons` descriptors (no
 * `@carbon/icons-react`). `svg.ts` is framework-free (descriptor → tree →
 * markup); `carbonIcon` is the thin React wrapper.
 */
export { attrValue, iconTree, pickDrawing, svgAttributes, toSVG } from './svg';
export type {
  Attrs,
  AttrValue,
  IconDescriptor,
  IconNode,
  IconTree,
} from './svg';
export { carbonIcon } from './carbonIcon';
export type { CarbonStaticIcon, CarbonStaticIconProps } from './carbonIcon';
