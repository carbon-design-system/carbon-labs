/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * `@carbon-labs/motion-icons-core`: the framework-free core of Motion Icons
 * (refactor stage 1). No React, no DOM at import.
 *
 *  - geometry: geometry, paint, ease, cut, off, slash, kick, magnifier, liveD
 *  - tokens: the motion tokens the icons use (from @carbon-labs/motion-core)
 *  - ink: strokes follow a consumer's `fill` (attachInk)
 *  - status (deep import `@carbon-labs/motion-icons-core/status`; it shares
 *    names with `off`): the status layer's geometry, marks, frames and plan
 *  - engine: the tween, painting, the frame engine (FrameController) and the
 *    status engines
 *
 * Deep imports (`@carbon-labs/motion-icons-core/geometry`, `…/engine`) keep
 * a consumer's bundle to what it uses.
 */
export * from './geometry';
export * from './paint';
export * from './ease';
export * from './cut';
export * from './off';
export * from './slash';
export * from './kick';
export * from './magnifier';
export * from './liveD';
export * from './tokens';
export * from './ink';
export * from './engine/index';
// Both off and the status layer have a cutAway: the root barrel's is off's; the status layer's is the engine's (deep import).
export { cutAway } from './off';
