/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Dropdown, ComboBox, MultiSelect and FilterableMultiSelect: v11's, on the
 * kit's text field and the selection family's floating list.
 */
export { Dropdown } from './components/Dropdown';
export type { DropdownProps } from './components/Dropdown';
export { ComboBox } from './components/ComboBox';
export type { ComboBoxProps } from './components/ComboBox';
export { MultiSelect } from './components/MultiSelect';
export type { MultiSelectProps } from './components/MultiSelect';
export { FilterableMultiSelect } from './components/FilterableMultiSelect';
export type { FilterableMultiSelectProps } from './components/FilterableMultiSelect';
export {
  defaultCompareItems,
  defaultSortItems,
  isSelectAllItem,
} from './components/multiSelection';
export type {
  CompareItems,
  SelectionFeedback,
  SortItemsOptions,
} from './components/multiSelection';
export { TYPING_BURST_MS } from './components/ListboxSurface';
export type { ListboxSize } from './components/FieldFrame';
export {
  ComboBoxSkeleton,
  DropdownSkeleton,
  MultiSelectSkeleton,
} from './components/DropdownSkeleton';
export type {
  ComboBoxSkeletonProps,
  DropdownSkeletonProps,
  MultiSelectSkeletonProps,
} from './components/DropdownSkeleton';

// The names other v12 packages take from this package's files.
export { FieldFrame } from './components/FieldFrame';
export { ListboxSurface, optionId } from './components/ListboxSurface';
export type { ListboxActive, ListboxOption } from './components/ListboxSurface';
