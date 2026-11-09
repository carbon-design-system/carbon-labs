/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export type Platform = 'mac' | 'other';

/**
 * One id per physical key. `mod` and `remove` are not keys: they resolve to
 * one of these per platform.
 */
export const keyIds = [
  'control',
  'alt',
  'shift',
  'meta',
  'enter',
  'backspace',
  'delete',
  'escape',
  'tab',
  'space',
  'caps-lock',
  'up',
  'down',
  'left',
  'right',
  'page-up',
  'page-down',
  'home',
  'end',
  'plus',
  'comma',
  'period',
  'slash',
  'backslash',
  'semicolon',
  'quote',
  'left-bracket',
  'right-bracket',
  'minus',
  'equals',
  'backtick',
] as const;

export type KeyId = (typeof keyIds)[number];

/**
 * The message ids `translateWithId` is called with: one for what a key shows
 * and one for its spoken name, `carbon.keyboard-shortcut.<key>.<label|name>`.
 */
export type KeyboardShortcutTranslationKey =
  `carbon.keyboard-shortcut.${KeyId}.${'label' | 'name'}`;

export const translationIds: KeyboardShortcutTranslationKey[] = keyIds.flatMap(
  (id) =>
    [
      `carbon.keyboard-shortcut.${id}.label`,
      `carbon.keyboard-shortcut.${id}.name`,
    ] as const
);

export interface KeyboardShortcutTranslationArgs {
  /** The platform the shortcut is rendered for. */
  platform: Platform;
}

/**
 * Mirrors Carbon's `TranslateWithId<MID, ARGS>` (types/common.ts), which a
 * labs package cannot import; at graduation this becomes that type.
 */
export interface TranslateWithId<MID = string, ARGS = Record<string, unknown>> {
  /**
   * Translates component strings using your i18n tool.
   *
   * @param messageId The translation ID for the string to translate.
   * @param [args] Arguments for string interpolation.
   * @returns The translated string.
   */
  translateWithId?(messageId: MID, args?: ARGS): string;
}

export type KeyboardShortcutTranslate = NonNullable<
  TranslateWithId<
    KeyboardShortcutTranslationKey,
    KeyboardShortcutTranslationArgs
  >['translateWithId']
>;

interface Face {
  label: string;
  name: string;
}

/**
 * The same label and name on both platforms.
 *
 * @param {string} label What is drawn on the key.
 * @param {string} name Its name in words.
 * @returns {{ mac: Face, other: Face }} The key's faces.
 */
const both = (label: string, name: string) => ({
  mac: { label, name },
  other: { label, name },
});

// English defaults, per platform. Glyphs on macOS, where they are printed on
// the keyboard and used in every menu; words elsewhere. Names are sentence
// case. A Mac keyboard labels its backspace key "delete", and VoiceOver users
// know it by that name.
const ENGLISH: Record<KeyId, { mac: Face; other: Face }> = {
  control: {
    mac: { label: '⌃', name: 'Control' },
    other: { label: 'Ctrl', name: 'Control' },
  },
  alt: {
    mac: { label: '⌥', name: 'Option' },
    other: { label: 'Alt', name: 'Alt' },
  },
  shift: {
    mac: { label: '⇧', name: 'Shift' },
    other: { label: 'Shift', name: 'Shift' },
  },
  meta: {
    mac: { label: '⌘', name: 'Command' },
    other: { label: 'Win', name: 'Windows' },
  },
  enter: {
    mac: { label: '↩', name: 'Return' },
    other: { label: 'Enter', name: 'Enter' },
  },
  backspace: {
    mac: { label: '⌫', name: 'Delete' },
    other: { label: 'Backspace', name: 'Backspace' },
  },
  delete: {
    mac: { label: '⌦', name: 'Forward delete' },
    other: { label: 'Del', name: 'Delete' },
  },
  escape: {
    mac: { label: '⎋', name: 'Escape' },
    other: { label: 'Esc', name: 'Escape' },
  },
  tab: {
    mac: { label: '⇥', name: 'Tab' },
    other: { label: 'Tab', name: 'Tab' },
  },
  space: both('Space', 'Space'),
  'caps-lock': {
    mac: { label: '⇪', name: 'Caps lock' },
    other: { label: 'Caps Lock', name: 'Caps lock' },
  },
  up: {
    mac: { label: '↑', name: 'Up arrow' },
    other: { label: 'Up', name: 'Up arrow' },
  },
  down: {
    mac: { label: '↓', name: 'Down arrow' },
    other: { label: 'Down', name: 'Down arrow' },
  },
  left: {
    mac: { label: '←', name: 'Left arrow' },
    other: { label: 'Left', name: 'Left arrow' },
  },
  right: {
    mac: { label: '→', name: 'Right arrow' },
    other: { label: 'Right', name: 'Right arrow' },
  },
  'page-up': {
    mac: { label: '⇞', name: 'Page up' },
    other: { label: 'PgUp', name: 'Page up' },
  },
  'page-down': {
    mac: { label: '⇟', name: 'Page down' },
    other: { label: 'PgDn', name: 'Page down' },
  },
  home: {
    mac: { label: '↖', name: 'Home' },
    other: { label: 'Home', name: 'Home' },
  },
  end: {
    mac: { label: '↘', name: 'End' },
    other: { label: 'End', name: 'End' },
  },
  // Punctuation is drawn as written and named in words, because a screen
  // reader at its default punctuation level skips `,` and `/` entirely.
  plus: both('+', 'Plus'),
  comma: both(',', 'Comma'),
  period: both('.', 'Period'),
  slash: both('/', 'Slash'),
  backslash: both('\\', 'Backslash'),
  semicolon: both(';', 'Semicolon'),
  quote: both("'", 'Quote'),
  'left-bracket': both('[', 'Left bracket'),
  'right-bracket': both(']', 'Right bracket'),
  minus: both('-', 'Minus'),
  equals: both('=', 'Equals'),
  backtick: both('`', 'Backtick'),
};

/**
 * The English text for a message id, used when no `translateWithId` is given
 * and for any id a translation leaves out.
 *
 * @param {KeyboardShortcutTranslationKey} messageId The message id.
 * @param {KeyboardShortcutTranslationArgs} [args] The platform.
 * @returns {string} The English label or name.
 */
export const defaultTranslateWithId: KeyboardShortcutTranslate = (
  messageId,
  args
) => {
  const [, , key, part] = messageId.split('.') as [
    string,
    string,
    KeyId,
    'label' | 'name',
  ];
  return ENGLISH[key]?.[args?.platform ?? 'other']?.[part] ?? messageId;
};

// Every spelling an author is likely to write, folded onto a key id. `mod` and
// `remove` are resolved per platform: the primary modifier (⌘ / Ctrl), and the
// key that removes a selection (⌫ on a Mac, Del elsewhere).
/**
 * @param {Platform} p The platform.
 * @returns {KeyId} The primary modifier: ⌘ on a Mac, Ctrl elsewhere.
 */
const mod = (p: Platform): KeyId => (p === 'mac' ? 'meta' : 'control');

/**
 * @param {Platform} p The platform.
 * @returns {KeyId} The key that removes a selection: ⌫ on a Mac, Del elsewhere.
 */
const remove = (p: Platform): KeyId => (p === 'mac' ? 'backspace' : 'delete');

const ALIASES: Record<string, KeyId | ((p: Platform) => KeyId)> = {
  mod,
  remove,
  ctrl: 'control',
  control: 'control',
  alt: 'alt',
  option: 'alt',
  opt: 'alt',
  shift: 'shift',
  meta: 'meta',
  cmd: 'meta',
  command: 'meta',
  win: 'meta',
  super: 'meta',
  enter: 'enter',
  return: 'enter',
  backspace: 'backspace',
  delete: 'delete',
  del: 'delete',
  escape: 'escape',
  esc: 'escape',
  tab: 'tab',
  space: 'space',
  capslock: 'caps-lock',
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right',
  arrowup: 'up',
  arrowdown: 'down',
  arrowleft: 'left',
  arrowright: 'right',
  pageup: 'page-up',
  pagedown: 'page-down',
  home: 'home',
  end: 'end',
  plus: 'plus',
  '+': 'plus',
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
};

// Platform order: ⌃⌥⇧⌘ on a Mac, Ctrl+Alt+Shift+Win elsewhere. Both are
// control, alt, shift, meta; `mod` lands in the right place because it is
// resolved to a key before sorting.
const MODIFIER_RANK: Partial<Record<KeyId, number>> = {
  control: 0,
  alt: 1,
  shift: 2,
  meta: 3,
};

export interface ResolvedKey {
  /** The physical key, or null for one with no id (a letter, F5). */
  id: KeyId | null;
  /** What is drawn on the key. */
  label: string;
  /** The key's name in words, for the accessible name. */
  name: string;
}

/**
 * Resolves one key token, as an author writes it, to what it shows and says on
 * a platform. Unknown tokens render as written; a single letter is upper-cased,
 * as it is printed on the key.
 *
 * @param {string} token The key as the author wrote it, such as `mod` or `K`.
 * @param {Platform} platform The platform to render for.
 * @param {KeyboardShortcutTranslate} [translate] Translates labels and names.
 * @returns {ResolvedKey} The key, what it shows, and its name in words.
 */
export function resolveKey(
  token: string,
  platform: Platform,
  translate: KeyboardShortcutTranslate = defaultTranslateWithId
): ResolvedKey {
  const alias = ALIASES[token.toLowerCase()];
  if (alias) {
    const id = typeof alias === 'function' ? alias(platform) : alias;
    /**
     * @param {'label' | 'name'} part Which text.
     * @returns {string} The translated text, or the English default.
     */
    const text = (part: 'label' | 'name') => {
      const messageId: KeyboardShortcutTranslationKey = `carbon.keyboard-shortcut.${id}.${part}`;
      return (
        translate(messageId, { platform }) ??
        defaultTranslateWithId(messageId, { platform })
      );
    };
    return { id, label: text('label'), name: text('name') };
  }
  const label =
    token.length === 1 || /^f([1-9]|1\d|2[0-4])$/i.test(token)
      ? token.toUpperCase()
      : token;
  return { id: null, label, name: label };
}

/**
 * Resolves a combination and puts its modifiers in platform order; every other
 * key follows, in the order written. A repeated modifier is shown once.
 *
 * @param {string[]} keys The keys as the author wrote them.
 * @param {Platform} platform The platform to render for.
 * @param {KeyboardShortcutTranslate} [translate] Translates labels and names.
 * @returns {ResolvedKey[]} The keys, in display order.
 */
export function resolveKeys(
  keys: string[],
  platform: Platform,
  translate?: KeyboardShortcutTranslate
): ResolvedKey[] {
  const resolved = keys
    .filter((key) => typeof key === 'string' && key !== '')
    .map((key) => resolveKey(key, platform, translate));
  /**
   * @param {ResolvedKey} key A key.
   * @returns {number | undefined} Its modifier rank, if it is a modifier.
   */
  const rank = (key: ResolvedKey) =>
    key.id === null ? undefined : MODIFIER_RANK[key.id];
  const modifiers = resolved
    .filter((key) => rank(key) !== undefined)
    .filter((key, i, all) => all.findIndex((k) => k.id === key.id) === i)
    .sort((a, b) => (rank(a) as number) - (rank(b) as number));
  const others = resolved.filter((key) => rank(key) === undefined);
  return [...modifiers, ...others];
}

/**
 * The platform, read from the browser. Only ever called on the client.
 * `userAgentData` first (Chromium), then the deprecated but universal
 * `navigator.platform`, then the user agent string. iPadOS reports `MacIntel`,
 * which is right: an iPad keyboard has ⌘.
 *
 * @param {Navigator} [nav] The browser's navigator; absent on a server.
 * @returns {Platform} `mac` on Apple platforms, `other` everywhere else.
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
