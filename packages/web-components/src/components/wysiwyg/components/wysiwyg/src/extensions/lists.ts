/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/core';
import { html } from 'lit';
import ListBulleted from '@carbon/icons/es/list--bulleted/16.js';
import ListNumbered from '@carbon/icons/es/list--numbered/16.js';
import ListChecked from '@carbon/icons/es/list--checked/16.js';
import IndentLess from '@carbon/icons/es/text--indent--less/16.js';
import IndentMore from '@carbon/icons/es/text--indent--more/16.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import { BASE_CLASS } from '../constants.js';
import type { ExtensionWithToolbar, ToolbarSize } from '../types.js';
import { cmdButton } from './button-helper.js';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

const styles = `
  .${BASE_CLASS}__editor .ProseMirror {
    ul[data-type='taskList'] {
      list-style: none;
      padding-inline-start: 0;
    }

    ul[data-type='taskList'] li {
      display: flex;
      align-items: flex-start;
      margin-inline-start: 0;
      padding-inline-start: 0;
    }
    
    ul[data-type='taskList'] li p {
      margin-block: 2px;
    }

    ul[data-type='taskList'] li[data-checked='true'] > div {
      color: var(--cds-text-secondary, #525252);
      text-decoration: line-through;
    }
  }
`;

export const Lists = Extension.create({
  name: 'lists',
  /** Adds the list extensions (bullet, ordered, task lists) */
  addExtensions: () => [
    BulletList,
    OrderedList,
    ListItem,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
  ],
}) as unknown as ExtensionWithToolbar;

const BUTTONS = [
  [ListBulleted, 'toggleBulletList', 'bulletList', 'Bullet List'],
  [ListNumbered, 'toggleOrderedList', 'orderedList', 'Numbered List'],
  [ListChecked, 'toggleTaskList', 'taskList', 'Task List'],
] as const;

/**
 * Renders the lists toolbar with list type and indentation controls.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {ToolbarSize} toolbarSize - Size of the toolbar buttons
 */
Lists.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md'
) => html`
  <style>
    ${styles}
  </style>
  <div class="${BASE_CLASS}__toolbar-group">
    ${BUTTONS.map(([icon, cmd, active, tooltip]) =>
      cmdButton(icon, editor, cmd, toolbarSize, { active, tooltip })
    )}
    ${cmdButton(IndentLess, editor, 'liftListItem', toolbarSize, {
      args: ['listItem'],
      tooltip: 'Indent Less',
    })}
    ${cmdButton(IndentMore, editor, 'sinkListItem', toolbarSize, {
      args: ['listItem'],
      tooltip: 'Indent More',
    })}
  </div>
`;
