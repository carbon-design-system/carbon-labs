/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export type Item<T> = {
  value: string;
  label: string;
} & T;

export type Group<T> = {
  label: string;
  items: T[];
};

export type StylePickerModuleBase<T> = {
  items: Item<T>[] | Group<Item<T>>[];
  selectedItem: string;
  onChange: (value: string) => void;
  includeSearch?: boolean;
};
