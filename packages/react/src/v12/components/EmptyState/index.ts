/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** EmptyState — what a region shows when it has nothing: first use, no results, an error, no access. Each kind has a placeholder line illustration in the Full page error's style. */
export {
  EmptyState,
  EmptyStateContexts,
  EmptyStateKinds,
  resolveEmptyStateContext,
} from './components/EmptyState';
export type {
  EmptyStateAction,
  EmptyStateContext,
  EmptyStateIllustrationPosition,
  EmptyStateKind,
  EmptyStateLink,
  EmptyStateProps,
  EmptyStateSize,
} from './components/EmptyState';
export { EmptyStateArt } from './components/illustrations';
export type { EmptyStateArtKind } from './components/illustrations';
