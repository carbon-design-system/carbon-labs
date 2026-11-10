/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export {
  Scroller,
  WindowScroller,
  SCROLLER_REST_DEFAULT,
  SCROLLER_REST_THICKNESS,
} from './components/Scroller';
export type {
  ScrollerProps,
  WindowScrollerProps,
  ScrollerMotionProps,
  ScrollerAxisProp,
  ScrollerRest,
} from './components/Scroller';
export {
  lockPageScroll,
  isPageScrollLocked,
  subscribePageScrollLock,
} from './components/pageScrollLock';

// The names other v12 packages take from this package's files.
export { attachScrollSoftEdge } from './components/softEdge';
