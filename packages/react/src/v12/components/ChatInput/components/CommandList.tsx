/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import cx from 'classnames';
import { Theme, usePrefix } from '@carbon/react';
import type { CarbonTheme } from '../internal/useInverseTheme';
import type { ChatInputCommand } from './ChatInput';

/**
 * The commands matching what follows the slash: names that start with it
 * first, then names or descriptions that contain it.
 *
 * @param {ChatInputCommand[]} commands Every command.
 * @param {string} query What was typed after the slash.
 * @returns {ChatInputCommand[]} The matches, best first.
 */
export function filterCommands(
  commands: ChatInputCommand[],
  query: string
): ChatInputCommand[] {
  const q = query.toLowerCase();
  if (!q) {
    return commands;
  }
  const starts = commands.filter((c) => c.name.toLowerCase().startsWith(q));
  const contains = commands.filter(
    (c) =>
      !starts.includes(c) &&
      (c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q))
  );
  return [...starts, ...contains];
}

export interface CommandListProps {
  id: string;
  open: boolean;
  theme: CarbonTheme;
  commands: ChatInputCommand[];
  activeIndex: number;
  onActivate: (index: number) => void;
  onChoose: (command: ChatInputCommand) => void;
}

/**
 * The `/` command list: a listbox the prompt drives through
 * `aria-activedescendant`, so focus never leaves the prompt. It is drawn like
 * the menus (Carbon's menu row, inverse) because it sits where they do.
 */
export function CommandList({
  id,
  open,
  theme,
  commands,
  activeIndex,
  onActivate,
  onChoose,
}: CommandListProps) {
  const prefix = usePrefix();
  const block = `${prefix}--chat-input`;
  if (!open) {
    return null;
  }
  return (
    <Theme theme={theme} className={`${block}__commands`}>
      {commands.length > 0 ? (
        <ul
          id={id}
          role="listbox"
          aria-label="Commands"
          className={`${block}__command-list`}>
          {commands.map((command, index) => (
            // The keyboard chooses through the prompt (aria-activedescendant);
            // focus never reaches an option, so it has no key handler.
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <li
              key={command.id}
              id={`${id}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={cx(`${block}__command`, {
                [`${block}__command--active`]: index === activeIndex,
              })}
              onPointerMove={() => onActivate(index)}
              // Keep focus in the prompt; a click still chooses.
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => onChoose(command)}>
              <span className={`${block}__command-name`}>/{command.name}</span>
              {command.description ? (
                <span className={`${block}__command-description`}>
                  {command.description}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className={`${block}__command-empty`} role="status">
          No matching commands
        </p>
      )}
    </Theme>
  );
}
