/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  resolveKey,
  type KeyId,
  type Platform,
} from '@carbon-labs/react-keyboard-shortcut';

// aria-keyshortcuts names keys as KeyboardEvent.key does, and modifiers as
// Alt, Control, Shift and Meta, written first.
const ARIA_NAMES: Record<KeyId, string> = {
  control: 'Control',
  alt: 'Alt',
  shift: 'Shift',
  meta: 'Meta',
  enter: 'Enter',
  backspace: 'Backspace',
  delete: 'Delete',
  escape: 'Escape',
  tab: 'Tab',
  space: 'Space',
  'caps-lock': 'CapsLock',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  'page-up': 'PageUp',
  'page-down': 'PageDown',
  home: 'Home',
  end: 'End',
  plus: 'Plus',
  comma: ',',
  period: '.',
  slash: '/',
  backslash: '\\',
  semicolon: ';',
  quote: "'",
  'left-bracket': '[',
  'right-bracket': ']',
  minus: '-',
  equals: '=',
  backtick: '`',
};

const MODIFIERS: KeyId[] = ['alt', 'control', 'meta', 'shift'];

/**
 * One chord for one platform, as aria-keyshortcuts writes it.
 *
 * @param {string[]} keys The keys, as KeyboardShortcut's `keys` takes them.
 * @param {Platform} platform The platform `mod` and `remove` resolve for.
 * @returns {string} The chord, such as `Control+Shift+K`.
 */
function chord(keys: string[], platform: Platform): string {
  const resolved = keys.map((key) => resolveKey(key, platform));
  const modifiers = resolved
    .filter((key) => key.id && MODIFIERS.includes(key.id))
    .map((key) => ARIA_NAMES[key.id as KeyId]);
  const rest = resolved
    .filter((key) => !key.id || !MODIFIERS.includes(key.id))
    .map((key) => (key.id ? ARIA_NAMES[key.id] : key.label));
  return [...modifiers, ...rest].join('+');
}

/**
 * The value of `aria-keyshortcuts` for a key command. `mod` and `remove`
 * differ by platform and the markup cannot know which one it runs on, so both
 * chords are listed when they differ (`Meta+S Control+S`), which the
 * attribute allows.
 *
 * @param {string[]} keys The keys, as KeyboardShortcut's `keys` takes them.
 * @returns {string} One chord, or two separated by a space.
 */
export function toAriaKeyShortcuts(keys: string[]): string {
  const mac = chord(keys, 'mac');
  const other = chord(keys, 'other');
  return mac === other ? mac : `${mac} ${other}`;
}
