/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export { ActivityFeed } from './components/ActivityFeed';
export type {
  ActivityEvent,
  ActivityEventAction,
  ActivityFeedCategory,
  ActivityFeedProps,
} from './components/ActivityFeed';
export type { RelativeTimeWords } from './components/relativeTime';

// The names other v12 packages take from this package's files.
export { relativeTimeText, useMinuteClock } from './components/relativeTime';
