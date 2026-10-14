/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export type Platform = 'mac' | 'other';

/**
 * The message ids `translateWithId` is called with, one per spoken key name.
 * Exported so a consumer can build a complete translation table.
 */
export const translationIds = {
  command: 'command',
  control: 'control',
  option: 'option',
  alt: 'alt',
  shift: 'shift',
  meta: 'meta',
  return: 'return',
  enter: 'enter',
  backspace: 'backspace',
  delete: 'delete',
  'forward-delete': 'forward-delete',
  escape: 'escape',
  tab: 'tab',
  space: 'space',
  'caps-lock': 'caps-lock',
  'up-arrow': 'up-arrow',
  'down-arrow': 'down-arrow',
  'left-arrow': 'left-arrow',
  'right-arrow': 'right-arrow',
  'page-up': 'page-up',
  'page-down': 'page-down',
  home: 'home',
  end: 'end',
  comma: 'comma',
  period: 'period',
  slash: 'slash',
  backslash: 'backslash',
  semicolon: 'semicolon',
  quote: 'quote',
  'left-bracket': 'left-bracket',
  'right-bracket': 'right-bracket',
  minus: 'minus',
  equals: 'equals',
  backtick: 'backtick',
  plus: 'plus',
} as const;

export type TranslationId = keyof typeof translationIds;

/** The English names, read when no `translateWithId` is given. */
export const defaultTranslations: Record<TranslationId, string> = {
  command: 'Command',
  control: 'Control',
  option: 'Option',
  alt: 'Alt',
  shift: 'Shift',
  meta: 'Meta',
  return: 'Return',
  enter: 'Enter',
  // A Mac keyboard labels its backspace key "delete", and VoiceOver users
  // know it by that name, so the mac table below names ⌫ "Delete".
  backspace: 'Backspace',
  delete: 'Delete',
  'forward-delete': 'Forward Delete',
  escape: 'Escape',
  tab: 'Tab',
  space: 'Space',
  'caps-lock': 'Caps Lock',
  'up-arrow': 'Up Arrow',
  'down-arrow': 'Down Arrow',
  'left-arrow': 'Left Arrow',
  'right-arrow': 'Right Arrow',
  'page-up': 'Page Up',
  'page-down': 'Page Down',
  home: 'Home',
  end: 'End',
  comma: 'Comma',
  period: 'Period',
  slash: 'Slash',
  backslash: 'Backslash',
  semicolon: 'Semicolon',
  quote: 'Quote',
  'left-bracket': 'Left Bracket',
  'right-bracket': 'Right Bracket',
  minus: 'Minus',
  equals: 'Equals',
  backtick: 'Backtick',
  plus: 'Plus',
};

/** What one key shows and says, on one platform. */
interface KeyFace {
  /** What is drawn on the key. */
  label: string;
  /** The message id of its spoken name; absent when the label is already a word. */
  nameId?: TranslationId;
}

type KeyTable = Record<string, { mac: KeyFace; other: KeyFace }>;

/**
 * A key that looks and is named the same on every platform.
 *
 * @param {string} label What is drawn on the key.
 * @param {TranslationId} [nameId] The message id of its spoken name.
 * @returns The key's face on both platforms.
 */
const same = (label: string, nameId?: TranslationId) => ({
  mac: { label, nameId },
  other: { label, nameId },
});

// Named keys. Glyphs on macOS, where they are printed on the keyboard and used
// in every menu; words elsewhere, where Windows and Linux write them out.
const NAMED: KeyTable = {
  mod: {
    mac: { label: '⌘', nameId: 'command' },
    other: { label: 'Ctrl', nameId: 'control' },
  },
  meta: {
    mac: { label: '⌘', nameId: 'command' },
    other: { label: 'Meta', nameId: 'meta' },
  },
  ctrl: {
    mac: { label: '⌃', nameId: 'control' },
    other: { label: 'Ctrl', nameId: 'control' },
  },
  alt: {
    mac: { label: '⌥', nameId: 'option' },
    other: { label: 'Alt', nameId: 'alt' },
  },
  shift: {
    mac: { label: '⇧', nameId: 'shift' },
    other: { label: 'Shift', nameId: 'shift' },
  },
  enter: {
    mac: { label: '↵', nameId: 'return' },
    other: { label: 'Enter', nameId: 'enter' },
  },
  backspace: {
    mac: { label: '⌫', nameId: 'delete' },
    other: { label: 'Backspace', nameId: 'backspace' },
  },
  delete: {
    mac: { label: '⌦', nameId: 'forward-delete' },
    other: { label: 'Delete', nameId: 'delete' },
  },
  escape: {
    mac: { label: '⎋', nameId: 'escape' },
    other: { label: 'Esc', nameId: 'escape' },
  },
  tab: {
    mac: { label: '⇥', nameId: 'tab' },
    other: { label: 'Tab', nameId: 'tab' },
  },
  space: same('Space', 'space'),
  capslock: {
    mac: { label: '⇪', nameId: 'caps-lock' },
    other: { label: 'Caps Lock', nameId: 'caps-lock' },
  },
  up: {
    mac: { label: '↑', nameId: 'up-arrow' },
    other: { label: 'Up', nameId: 'up-arrow' },
  },
  down: {
    mac: { label: '↓', nameId: 'down-arrow' },
    other: { label: 'Down', nameId: 'down-arrow' },
  },
  left: {
    mac: { label: '←', nameId: 'left-arrow' },
    other: { label: 'Left', nameId: 'left-arrow' },
  },
  right: {
    mac: { label: '→', nameId: 'right-arrow' },
    other: { label: 'Right', nameId: 'right-arrow' },
  },
  pageup: {
    mac: { label: '⇞', nameId: 'page-up' },
    other: { label: 'PgUp', nameId: 'page-up' },
  },
  pagedown: {
    mac: { label: '⇟', nameId: 'page-down' },
    other: { label: 'PgDn', nameId: 'page-down' },
  },
  home: {
    mac: { label: '↖', nameId: 'home' },
    other: { label: 'Home', nameId: 'home' },
  },
  end: {
    mac: { label: '↘', nameId: 'end' },
    other: { label: 'End', nameId: 'end' },
  },
};

// Every spelling an author is likely to write, folded onto one entry.
const ALIASES: Record<string, string> = {
  cmd: 'meta',
  command: 'meta',
  control: 'ctrl',
  option: 'alt',
  opt: 'alt',
  return: 'enter',
  del: 'delete',
  esc: 'escape',
  arrowup: 'up',
  arrowdown: 'down',
  arrowleft: 'left',
  arrowright: 'right',
};

// Punctuation is drawn as written and named in words, because a screen reader
// at its default punctuation level skips `,` and `/` entirely.
const PUNCTUATION: Record<string, TranslationId> = {
  ',': 'comma',
  '.': 'period',
  '/': 'slash',
  '\\': 'backslash',
  ';': 'semicolon',
  "'": 'quote',
  '[': 'left-bracket',
  ']': 'right-bracket',
  '-': 'minus',
  '=': 'equals',
  '`': 'backtick',
  '+': 'plus',
};

export interface ResolvedKey {
  /** What is drawn on the key. */
  label: string;
  /** The key's name in words, for the accessible name. */
  name: string;
}

export type TranslateWithId = (
  messageId: TranslationId,
  args: { platform: Platform }
) => string;

/**
 * The English name of a key, used when no `translateWithId` is given.
 *
 * @param {TranslationId} id The message id.
 * @returns The English name.
 */
const defaultTranslate: TranslateWithId = (id) => defaultTranslations[id];

/**
 * Resolves one key token, as an author writes it, to what it shows and says on
 * a platform. Unknown tokens render as written; a single letter is upper-cased,
 * as it is printed on the key.
 *
 * @param {string} token The key as the author wrote it, such as `mod` or `K`.
 * @param {Platform} platform The platform to render for.
 * @param {TranslateWithId} [translate] Translates a key's spoken name.
 * @returns What the key shows, and its name in words.
 */
export function resolveKey(
  token: string,
  platform: Platform,
  translate: TranslateWithId = defaultTranslate
): ResolvedKey {
  /**
   * @param {TranslationId} id The message id of a key's spoken name.
   * @returns The name, translated where a translation is given.
   */
  const name = (id: TranslationId) =>
    translate(id, { platform }) ?? defaultTranslations[id];
  const lower = token.toLowerCase();
  const entry = NAMED[ALIASES[lower] ?? lower];

  if (entry) {
    const face = entry[platform];
    return {
      label: face.label,
      name: face.nameId ? name(face.nameId) : face.label,
    };
  }
  if (PUNCTUATION[token]) {
    return { label: token, name: name(PUNCTUATION[token]) };
  }
  if (/^f([1-9]|1\d|2[0-4])$/.test(lower)) {
    return { label: token.toUpperCase(), name: token.toUpperCase() };
  }
  const label = token.length === 1 ? token.toUpperCase() : token;
  return { label, name: label };
}

/**
 * The platform, read from the browser. Only ever called on the client.
 * `userAgentData` first (Chromium), then the deprecated but universal
 * `navigator.platform`, then the user agent string. iPadOS reports `MacIntel`,
 * which is right: an iPad keyboard has ⌘.
 *
 * @param {Navigator} [nav] The browser's navigator; absent on a server.
 * @returns `mac` on Apple platforms, `other` everywhere else.
 */
export function detectPlatform(nav?: Navigator): Platform {
  if (!nav) {
    return 'other';
  }
  const uaData = (nav as Navigator & { userAgentData?: { platform?: string } })
    .userAgentData;
  const source = uaData?.platform || nav.platform || nav.userAgent || '';
  return /mac|iphone|ipad|ipod/i.test(source) ? 'mac' : 'other';
}
