/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import '../components/wysiwyg/wysiwyg';
import {
  allExtensions,
  contextMenuStyles,
  createContextMenuManager,
  customToolbarContent,
} from './story-helpers.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import Table from '@carbon/icons/es/table/16.js';
import { BASE_CLASS } from '../components/wysiwyg/src/constants.js';

// Get the base tables extension
const baseTablesExtension = allExtensions.find((ext) => ext.name === 'tables');

/**
 * Custom table toolbar extension with context menu
 * @type {object}
 */
const CustomTable = {
  ...baseTablesExtension,
  /**
   * Custom toolbar render for tables
   * @param {object} ed - Editor instance
   * @param {string} size - Button size
   * @returns {TemplateResult} Template
   */
  toolbarRender: (ed, size = 'md') => {
    CustomTable.editor = ed;

    return html`
      <div class="${BASE_CLASS}__toolbar-group">
        <cds-icon-button
          kind="secondary"
          .size=${size}
          ?disabled=${!ed?.can().insertTable()}
          @click=${() =>
            ed
              ?.chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()}>
          ${iconLoader(Table, { slot: 'icon' })}
          <span slot="tooltip-content">Insert Table</span>
        </cds-icon-button>
      </div>
    `;
  },
};

/**
 * Render context menu template
 * @param {Function} runAction - Action handler
 * @returns {TemplateResult} Template
 *
 * TODO: replace with menu once https://github.com/carbon-design-system/carbon/pull/22392 gets merged
 */
const renderContextMenu = (runAction) => html`
  <div class="context-menu">
    <button @click=${(e) => runAction(e, 'addRowBefore')}>
      Add Row Before
    </button>
    <button @click=${(e) => runAction(e, 'addRowAfter')}>Add Row After</button>
    <button data-delete @click=${(e) => runAction(e, 'deleteRow')}>
      Delete Row
    </button>
    <hr />
    <button @click=${(e) => runAction(e, 'addColumnBefore')}>
      Add Column Before
    </button>
    <button @click=${(e) => runAction(e, 'addColumnAfter')}>
      Add Column After
    </button>
    <button data-delete @click=${(e) => runAction(e, 'deleteColumn')}>
      Delete Column
    </button>
    <hr data-divider />
    <button data-action="merge" @click=${(e) => runAction(e, 'mergeCells')}>
      Merge Cells
    </button>
    <button data-action="split" @click=${(e) => runAction(e, 'splitCell')}>
      Split Cell
    </button>
    <hr data-divider />
    <button data-delete @click=${(e) => runAction(e, 'deleteTable')}>
      Delete Table
    </button>
  </div>
`;

export default {
  title: 'Components/Wysiwyg/Customizations',
  tags: ['squad', 'incubating'],
  component: 'clabs-wysiwyg',
  argTypes: {
    toolbarSize: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Toolbar button size',
    },
    content: {
      control: 'text',
      description: 'Initial content of the editor',
    },
  },
  args: {
    toolbarSize: 'md',
    content: customToolbarContent,
  },
  decorators: [
    (story) => html`
      <style>
        #main-content {
          block-size: 100dvh;
        }
        ${contextMenuStyles}
      </style>
      ${story()}
    `,
  ],
};

export const CustomTableToolbar = {
  /**
   * Render story
   * @param {object} args - Story args
   * @returns {TemplateResult} Template
   */
  render: (args) => {
    // Create extensions with custom table toolbar
    const extensions = allExtensions.map((ext) =>
      ext.name === 'tables' ? CustomTable : ext
    );

    // Setup context menu after render
    requestAnimationFrame(() => {
      const menu = document.querySelector('.context-menu');
      const wysiwyg = document.querySelector('clabs-wysiwyg');
      const editorEl = wysiwyg?.shadowRoot?.querySelector('.ProseMirror');

      if (
        !editorEl ||
        !menu ||
        !CustomTable.editor ||
        editorEl.dataset.contextMenu
      ) {
        return;
      }

      editorEl.dataset.contextMenu = 'initialized';
      const menuManager = createContextMenuManager(CustomTable.editor, menu);

      // Handle right-click on tables
      editorEl.addEventListener('contextmenu', (evt) => {
        if (!evt.target.closest('table')) {
          return;
        }
        evt.preventDefault();
        menuManager.showMenu(evt.pageX, evt.pageY);
      });

      // Close menu on click outside
      document.addEventListener('click', () => menu.classList.remove('open'));

      // Store for context menu buttons
      CustomTable.menuManager = menuManager;
    });

    return html`
      <clabs-wysiwyg
        .extensions=${extensions}
        .content=${args.content}
        @content-change=${(e) => {
          console.log('content-change', e);
        }}
        toolbar-size=${args.toolbarSize}></clabs-wysiwyg>
      ${renderContextMenu((e, action) =>
        CustomTable.menuManager?.runAction(e, action)
      )}
    `;
  },
};
