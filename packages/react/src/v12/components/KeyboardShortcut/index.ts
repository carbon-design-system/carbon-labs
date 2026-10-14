/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export { KeyboardShortcut } from './components/KeyboardShortcut';
export type {
  KeyboardShortcutProps,
  KeyboardShortcutKind,
} from './components/KeyboardShortcut';
export { translationIds, defaultTranslations } from './internal/keys';
export type { Platform, TranslationId, TranslateWithId } from './internal/keys';
