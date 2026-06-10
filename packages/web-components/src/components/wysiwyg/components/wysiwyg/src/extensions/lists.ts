/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/core';
import { html } from 'lit';
import type { TemplateResult } from 'lit';
import ListBulleted from '@carbon/icons/es/list--bulleted/16.js';
import ListNumbered from '@carbon/icons/es/list--numbered/16.js';
import ListChecked from '@carbon/icons/es/list--checked/16.js';
import IndentLess from '@carbon/icons/es/text--indent--less/16.js';
import IndentMore from '@carbon/icons/es/text--indent--more/16.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import { BASE_CLASS } from '../constants.js';
import type { ToolbarSize } from '../types.js';
import { iconButton } from './button-helper.js';
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

export interface ListsExtension extends Extension<any> {
  toolbarRender: (
    editor: Editor | null,
    toolbarSize?: ToolbarSize
  ) => TemplateResult;
}

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
}) as unknown as ListsExtension;

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
    ${iconButton(
      ListBulleted,
      () => editor?.chain().focus().toggleBulletList().run(),
      toolbarSize,
      {
        disabled: !editor?.can().toggleBulletList(),
        selected: editor?.isActive('bulletList'),
        tooltip: 'Bullet List',
      }
    )}
    ${iconButton(
      ListNumbered,
      () => editor?.chain().focus().toggleOrderedList().run(),
      toolbarSize,
      {
        disabled: !editor?.can().toggleOrderedList(),
        selected: editor?.isActive('orderedList'),
        tooltip: 'Numbered List',
      }
    )}
    ${iconButton(
      ListChecked,
      () => editor?.chain().focus().toggleTaskList().run(),
      toolbarSize,
      {
        disabled: !editor?.can().toggleTaskList(),
        selected: editor?.isActive('taskList'),
        tooltip: 'Task List',
      }
    )}
    ${iconButton(
      IndentLess,
      () => editor?.chain().focus().liftListItem('listItem').run(),
      toolbarSize,
      {
        disabled: !editor?.can().liftListItem('listItem'),
        tooltip: 'Indent Less',
      }
    )}
    ${iconButton(
      IndentMore,
      () => editor?.chain().focus().sinkListItem('listItem').run(),
      toolbarSize,
      {
        disabled: !editor?.can().sinkListItem('listItem'),
        tooltip: 'Indent More',
      }
    )}
  </div>
`;
