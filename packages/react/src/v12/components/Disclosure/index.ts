/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export {
  ARRIVAL_AT,
  disclosureArrival,
  disclosureContentMs,
  disclosureTiming,
  MULTI_BODY_CAP,
  moveDisclosure,
  retimeDisclosure,
  travelOf,
  useDisclosureBody,
  useDisclosureMoves,
  type DisclosureArrival,
  type DisclosureBody,
  type DisclosureKind,
  type DisclosureMoveOptions,
  type DisclosureMoves,
  type DisclosureRetimed,
  type DisclosureTiming,
} from './components/disclosure';

// The names other v12 packages take from this package's files.
export { HOLD_ID, tokenMs, transitionOf } from './components/disclosure';
export { openPlace, shutPlace } from './components/listPlace';
