/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { forwardRef, Fragment } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { usePrefix } from '@carbon/react';
import { usePlatform } from '../internal/usePlatform';
import {
  resolveKeys,
  type KeyboardShortcutTranslate,
  type Platform,
} from '../internal/keys';

export type KeyboardShortcutKind = 'keycap' | 'plain';

export interface KeyboardShortcutProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'children'
> {
  /**
   * Provide an optional class to be applied to the outer `<kbd>`
   */
  className?: string;

  /**
   * The keys of the combination. Named keys are case-insensitive: `mod` is ⌘
   * on macOS and Ctrl elsewhere; `remove` is ⌫ on macOS and Del elsewhere;
   * `ctrl`, `alt`, `shift`, `meta`, `enter`, `backspace`, `delete`, `escape`,
   * `tab`, `space`, `capslock`, the arrows, `pageup`, `pagedown`, `home`, `end`
   * and punctuation are mapped per platform. Modifiers are shown in platform
   * order (⌃⌥⇧⌘, Ctrl+Alt+Shift+Win) whatever order they are written in; other
   * keys follow in the order written. Anything else renders as written; a
   * single letter is upper-cased. It only displays the shortcut: it never
   * listens for the keys.
   */
  keys: string[];

  /**
   * `keycap` draws each key as a small key; `plain` is text only, and matches
   * the shortcut hint of a Carbon `MenuItem` so it can sit in a menu.
   */
  kind?: KeyboardShortcutKind;

  /**
   * The platform to render for. `auto` detects it in the browser; a server
   * render assumes `other` until hydration. Pass `mac` or `other` when the
   * platform is known, for example from the request's User-Agent on the server.
   */
  platform?: Platform | 'auto';

  /**
   * Translates what each named key shows ("Ctrl" → "Strg") and its spoken
   * name ("Control" → "Steuerung"). Called with a message id from
   * `translationIds` (`carbon.keyboard-shortcut.<key>.<label|name>`) and
   * `{ platform }`. Ids it does not translate fall back to English.
   */
  translateWithId?: KeyboardShortcutTranslate;
}

export const KeyboardShortcut = forwardRef<HTMLElement, KeyboardShortcutProps>(
  function KeyboardShortcut(
    {
      className,
      keys,
      kind = 'keycap',
      platform = 'auto',
      translateWithId,
      ...rest
    },
    ref
  ) {
    const prefix = usePrefix();
    const resolvedPlatform = usePlatform(platform);
    const resolved = resolveKeys(keys ?? [], resolvedPlatform, translateWithId);

    // Text keys are joined with `+` off macOS (Ctrl+K) and written together on
    // it (⌘K), as each platform's own menus do. Keycaps need no separator:
    // each key is already its own shape. Joined with `+`, the Plus key is
    // written as its name, so Ctrl and Plus read "Ctrl+Plus", not "Ctrl++".
    const separator =
      kind === 'plain' && resolvedPlatform === 'other' ? '+' : null;
    const shown = (key: (typeof resolved)[number]) =>
      separator && key.id === 'plus' ? key.name : key.label;

    return (
      <kbd
        ref={ref}
        className={cx(
          `${prefix}--keyboard-shortcut`,
          `${prefix}--keyboard-shortcut--${kind}`,
          className
        )}
        {...rest}>
        {/*
         * The accessible name, in words. A <kbd> maps to the generic role,
         * which ARIA 1.2 forbids naming, so aria-label on it is dropped or
         * read inconsistently. Visually hidden text is read everywhere, and
         * becomes part of a parent's name from content ("Copy Command C").
         */}
        <span className={`${prefix}--keyboard-shortcut__label`}>
          {resolved.map((key) => key.name).join(' ')}
        </span>
        {resolved.map((key, index) => (
          // Keys may repeat (Shift Shift), so the index is part of the key.
          <Fragment key={`${index}-${key.label}`}>
            {separator && index > 0 && (
              <span
                aria-hidden="true"
                className={`${prefix}--keyboard-shortcut__separator`}>
                {separator}
              </span>
            )}
            {/* The glyphs are hidden from assistive technology, which reads
                the words above instead of guessing at "⌘". */}
            <kbd
              aria-hidden="true"
              className={`${prefix}--keyboard-shortcut__key`}>
              {shown(key)}
            </kbd>
          </Fragment>
        ))}
      </kbd>
    );
  }
);

KeyboardShortcut.displayName = 'KeyboardShortcut';

KeyboardShortcut.propTypes = {
  /**
   * Provide an optional class to be applied to the outer `<kbd>`
   */
  className: PropTypes.string,

  /**
   * The keys of the combination. Named keys are case-insensitive: `mod` is ⌘
   * on macOS and Ctrl elsewhere; `remove` is ⌫ on macOS and Del elsewhere;
   * `ctrl`, `alt`, `shift`, `meta`, `enter`, `backspace`, `delete`, `escape`,
   * `tab`, `space`, `capslock`, the arrows, `pageup`, `pagedown`, `home`, `end`
   * and punctuation are mapped per platform. Modifiers are shown in platform
   * order (⌃⌥⇧⌘, Ctrl+Alt+Shift+Win) whatever order they are written in; other
   * keys follow in the order written. Anything else renders as written; a
   * single letter is upper-cased. It only displays the shortcut: it never
   * listens for the keys.
   */
  keys: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,

  /**
   * `keycap` draws each key as a small key; `plain` is text only, and matches
   * the shortcut hint of a Carbon `MenuItem` so it can sit in a menu.
   */
  kind: PropTypes.oneOf(['keycap', 'plain'] as const),

  /**
   * The platform to render for. `auto` detects it in the browser; a server
   * render assumes `other` until hydration. Pass `mac` or `other` when the
   * platform is known, for example from the request's User-Agent on the server.
   */
  platform: PropTypes.oneOf(['mac', 'other', 'auto'] as const),

  /**
   * Translates what each named key shows ("Ctrl" → "Strg") and its spoken
   * name ("Control" → "Steuerung"). Called with a message id from
   * `translationIds` (`carbon.keyboard-shortcut.<key>.<label|name>`) and
   * `{ platform }`. Ids it does not translate fall back to English.
   */
  translateWithId: PropTypes.func,
};
