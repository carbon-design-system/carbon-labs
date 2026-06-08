/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// TipTap core imports
import { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/core';

// Lit imports
import { html } from 'lit';
import type { TemplateResult } from 'lit';

// Carbon icons
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import ListBulleted from '@carbon/icons/es/list--bulleted/16.js';
import ListNumbered from '@carbon/icons/es/list--numbered/16.js';
import ListChecked from '@carbon/icons/es/list--checked/16.js';
import IndentLess from '@carbon/icons/es/text--indent--less/16.js';
import IndentMore from '@carbon/icons/es/text--indent--more/16.js';

// Carbon components
import '@carbon/web-components/es/components/icon-button/index.js';

// Local imports
import { BASE_CLASS } from '../constants.js';
import type { ToolbarSize } from '../types.js';
import {
  TOOLTIP_ENTER_DELAY_MS,
  TOOLTIP_LEAVE_DELAY_MS,
} from '../constants.js';

// TipTap extensions
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

// Styles
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

/**
 * Interface for the Lists extension with toolbar rendering capability.
 * @extends {Extension<any>}
 */
export interface ListsExtension extends Extension<any> {
  /**
   * Renders the lists toolbar controls.
   * @param {Editor | null} editor - The TipTap editor instance
   * @param {ToolbarSize} [toolbarSize='md'] - Size of the toolbar buttons
   * @returns {TemplateResult} Lit template for the lists toolbar
   */
  toolbarRender: (
    editor: Editor | null,
    toolbarSize?: ToolbarSize
  ) => TemplateResult;
}

/**
 * Lists extension for bullet lists, numbered lists, and task lists.
 * Provides toolbar controls for list formatting and indentation.
 * @type {ListsExtension}
 */
export const Lists = Extension.create({
  name: 'lists',
  /**
   * Adds the list extensions (bullet, ordered, task lists).
   * @returns {Array} Array of TipTap extensions
   */
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
 * @returns {TemplateResult} Lit template for the lists toolbar
 */
Lists.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md'
) => {
  /**
   * Toggles bullet list formatting.
   * @returns {void}
   */
  const toggleBulletList = () => {
    editor?.chain().focus().toggleBulletList().run();
  };

  /**
   * Toggles numbered list formatting.
   * @returns {void}
   */
  const toggleOrderedList = () => {
    editor?.chain().focus().toggleOrderedList().run();
  };

  /**
   * Toggles task list formatting.
   * @returns {void}
   */
  const toggleTaskList = () => {
    editor?.chain().focus().toggleTaskList().run();
  };

  /**
   * Increases list item indentation.
   * @returns {void}
   */
  const sinkListItem = () => {
    editor?.chain().focus().sinkListItem('listItem').run();
  };

  /**
   * Decreases list item indentation.
   * @returns {void}
   */
  const liftListItem = () => {
    editor?.chain().focus().liftListItem('listItem').run();
  };

  return html`
    <style>
      ${styles}
    </style>
    <div class="${BASE_CLASS}__toolbar-group">
      <cds-icon-button
        kind="ghost"
        autoalign
        align="top"
        .size=${toolbarSize as any}
        enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
        leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
        ?disabled=${!editor?.can().toggleBulletList()}
        ?isselected=${editor?.isActive('bulletList')}
        @click=${toggleBulletList}>
        ${iconLoader(ListBulleted, { slot: 'icon' })}
        <span slot="tooltip-content">Bullet List</span>
      </cds-icon-button>
      <cds-icon-button
        kind="ghost"
        autoalign
        align="top"
        .size=${toolbarSize as any}
        enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
        leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
        ?disabled=${!editor?.can().toggleOrderedList()}
        ?isselected=${editor?.isActive('orderedList')}
        @click=${toggleOrderedList}>
        ${iconLoader(ListNumbered, { slot: 'icon' })}
        <span slot="tooltip-content">Numbered List</span>
      </cds-icon-button>
      <cds-icon-button
        kind="ghost"
        autoalign
        align="top"
        .size=${toolbarSize as any}
        enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
        leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
        ?disabled=${!editor?.can().toggleTaskList()}
        ?isselected=${editor?.isActive('taskList')}
        @click=${toggleTaskList}>
        ${iconLoader(ListChecked, { slot: 'icon' })}
        <span slot="tooltip-content">Task List</span>
      </cds-icon-button>
      <cds-icon-button
        kind="ghost"
        autoalign
        align="top"
        .size=${toolbarSize as any}
        enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
        leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
        ?disabled=${!editor?.can().liftListItem('listItem')}
        @click=${liftListItem}>
        ${iconLoader(IndentLess, { slot: 'icon' })}
        <span slot="tooltip-content">Indent Less</span>
      </cds-icon-button>
      <cds-icon-button
        kind="ghost"
        autoalign
        align="top"
        .size=${toolbarSize as any}
        enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
        leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
        ?disabled=${!editor?.can().sinkListItem('listItem')}
        @click=${sinkListItem}>
        ${iconLoader(IndentMore, { slot: 'icon' })}
        <span slot="tooltip-content">Indent More</span>
      </cds-icon-button>
    </div>
  `;
};
