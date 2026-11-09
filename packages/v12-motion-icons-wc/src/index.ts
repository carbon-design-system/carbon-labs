/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * `@carbon-labs/wc-motion-icons`: Motion Icons as web components (Lit).
 *
 * Pure exports: every class is exported unregistered, so importing this
 * barrel defines nothing. Register an icon in one of three ways:
 *  - import its entry point (`…/icons/settings`), which defines it on
 *    import, as Carbon's component entry points do;
 *  - call `defineCustomElement`, for a custom tag or a scoped registry;
 *  - import `…/define`, which defines every icon at once.
 * `<clabs-motion-icon name>` (`…/motion-icon`) is the opt-in generic element.
 */
export {
  defineCustomElement,
  prefix,
  type DefineOptions,
} from './globals/register';
export {
  MotionIconElement,
  animatedConverter,
} from './base/motion-icon-element';
export { HoverIconElement } from './base/hover-icon-element';
export {
  ToggleIconElement,
  type ChangeDetail,
  type ToggleElementSpec,
} from './base/toggle-icon-element';
export { StatusIconElement } from './base/status-icon-element';
export { ActionHoverIconElement } from './base/action-hover-icon-element';
export { ActionStatusIconElement } from './base/action-status-icon-element';
export { StatusPipElement as ClabsMotionStatusPip } from './base/status-pip-element';
export * from './elements';
