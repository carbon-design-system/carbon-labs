/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export {
  Tag,
  type TagProps,
  type TagCorners,
  type TagSize,
  type TagType,
} from './components/Tag';
export {
  SelectableTag,
  type SelectableTagProps,
  type SelectableTagType,
} from './components/SelectableTag';
export {
  DismissibleTag,
  type DismissibleTagProps,
} from './components/DismissibleTag';
export { TagSkeleton, type TagSkeletonProps } from './components/TagSkeleton';

// The names other v12 packages take from this package's files.
export { TAG_STAGGER_MS, tagSnapIn, tagSnapOut } from './components/tag-snap';
