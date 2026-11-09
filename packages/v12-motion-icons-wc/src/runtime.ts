/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * What the generated element modules build on: the base classes, the tag
 * prefix and registration (their only import from this package).
 */
export {
  defineCustomElement,
  prefix,
  type DefineOptions,
} from './globals/register';
export { MotionIconElement } from './base/motion-icon-element';
export { HoverIconElement } from './base/hover-icon-element';
export {
  ToggleIconElement,
  type ChangeDetail,
  type ToggleElementSpec,
} from './base/toggle-icon-element';
export { StatusIconElement } from './base/status-icon-element';
// Icons with an action (their own modules: elements without one don't load them).
export { ActionHoverIconElement } from './base/action-hover-icon-element';
export { ActionStatusIconElement } from './base/action-status-icon-element';
