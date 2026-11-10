/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** Loading and InlineLoading — Carbon v11's, on the kit's motion: an arc that turns on the loading clock, a status that hands off in place. */
export { Loading } from './components/Loading';
export type { LoadingProps } from './components/Loading';
export { InlineLoading } from './components/InlineLoading';
export type {
  InlineLoadingProps,
  InlineLoadingStatus,
} from './components/InlineLoading';
export { LOADER_GROWTH, loaderGrowth } from './components/growth';
export { useBusySwap } from './components/useBusySwap';
export type { BusySwap } from './components/useBusySwap';
export { createLoadingGate, LOADING_GATE } from './components/gate';
export type {
  GateClock,
  LoadingGate,
  LoadingGateOptions,
  LoadingView,
} from './components/gate';
export { useLoadingGate } from './components/useLoadingGate';
export type {
  LoadingGateState,
  LoadingGateTimings,
} from './components/useLoadingGate';
