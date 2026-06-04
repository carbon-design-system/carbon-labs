// TipTap core imports
import { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/core';

// Lit imports
import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import type { Ref } from 'lit/directives/ref.js';

// Carbon icons
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import Table from '@carbon/icons/es/table/16.js';
import TableAdd from '@carbon/icons/es/table--add/16.js';
import TableSplit from '@carbon/icons/es/table--split/16.js';
import RowInsert from '@carbon/icons/es/row--insert/16.js';
import TrashCan from '@carbon/icons/es/trash-can/16.js';
import RowDelete from '@carbon/icons/es/row--delete/16.js';
import ColumnInsert from '@carbon/icons/es/column--insert/16.js';
import ColumnDelete from '@carbon/icons/es/column--delete/16.js';

// Carbon components
import '@carbon/web-components/es/components/icon-button/index.js';
import '@carbon/web-components/es/components/popover/index.js';
import '@carbon/web-components/es/components/layer/index.js';

// Local imports
import { BASE_CLASS } from '../constants';
import {
  TOOLTIP_ENTER_DELAY_MS,
  TOOLTIP_LEAVE_DELAY_MS,
} from '../constants.js';

// TipTap extensions
import { Table as TiptapTable } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

// Styles
const styles = `
  .${BASE_CLASS}__toolbar-group--table {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }
`;

/**
 * Interface for the Tables extension with toolbar rendering capability.
 * @extends {Extension<any>}
 */
export interface TablesExtension extends Extension<any> {
  /**
   * Renders the tables toolbar controls.
   * @param {Editor | null} editor - The TipTap editor instance
   * @param {string} [toolbarSize='md'] - Size of the toolbar buttons
   * @returns {TemplateResult} Lit template for the tables toolbar
   */
  toolbarRender: (
    editor: Editor | null,
    toolbarSize?: string
  ) => TemplateResult;
}

/**
 * Tables extension for creating and manipulating tables.
 * Provides toolbar controls for table operations (insert, delete, add/remove rows/columns, merge/split cells).
 * @type {TablesExtension}
 */
export const Tables = Extension.create({
  name: 'tables',
  /**
   * Adds the table extensions (table, row, cell, header).
   * @returns {Array} Array of TipTap extensions
   */
  addExtensions: () => [
    TiptapTable.configure({
      resizable: true,
      HTMLAttributes: {
        class: 'tiptap-table',
      },
    }),
    TableRow,
    TableHeader,
    TableCell,
  ],
}) as unknown as TablesExtension;

/** Reference to the table popover element */
const tablePopoverRef: Ref<any> = createRef();

/**
 * Renders the tables toolbar with table manipulation controls.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {string} toolbarSize - Size of the toolbar buttons
 * @returns {TemplateResult} Lit template for the tables toolbar
 */
Tables.toolbarRender = (editor: Editor | null, toolbarSize = 'md') => {
  /**
   * Toggles the table popover open/closed state.
   * @returns {void}
   */
  const togglePopover = () => {
    if (tablePopoverRef.value) {
      tablePopoverRef.value.open = !tablePopoverRef.value.open;
    }
  };

  /**
   * Inserts a new table at cursor position.
   * @returns {void}
   */
  const insertTable = () => {
    // Delete selection if any, then insert table at cursor
    editor
      ?.chain()
      .focus()
      .deleteSelection()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
    if (tablePopoverRef.value) {
      tablePopoverRef.value.open = false;
    }
  };

  /**
   * Deletes the current table.
   * @returns {void}
   */
  const deleteTable = () => {
    editor?.chain().focus().deleteTable().run();
    if (tablePopoverRef.value) {
      tablePopoverRef.value.open = false;
    }
  };

  /**
   * Adds a column before the current column.
   * @returns {void}
   */
  const addColumnBefore = () => {
    editor?.chain().focus().addColumnBefore().run();
    if (tablePopoverRef.value) {
      tablePopoverRef.value.open = false;
    }
  };

  /**
   * Adds a column after the current column.
   * @returns {void}
   */
  const addColumnAfter = () => {
    editor?.chain().focus().addColumnAfter().run();
    if (tablePopoverRef.value) {
      tablePopoverRef.value.open = false;
    }
  };

  /**
   * Deletes the current column.
   * @returns {void}
   */
  const deleteColumn = () => {
    editor?.chain().focus().deleteColumn().run();
    if (tablePopoverRef.value) {
      tablePopoverRef.value.open = false;
    }
  };

  /**
   * Adds a row before the current row.
   * @returns {void}
   */
  const addRowBefore = () => {
    editor?.chain().focus().addRowBefore().run();
    if (tablePopoverRef.value) {
      tablePopoverRef.value.open = false;
    }
  };

  /**
   * Adds a row after the current row.
   * @returns {void}
   */
  const addRowAfter = () => {
    editor?.chain().focus().addRowAfter().run();
    if (tablePopoverRef.value) {
      tablePopoverRef.value.open = false;
    }
  };

  /**
   * Deletes the current row.
   * @returns {void}
   */
  const deleteRow = () => {
    editor?.chain().focus().deleteRow().run();
    if (tablePopoverRef.value) {
      tablePopoverRef.value.open = false;
    }
  };

  /**
   * Merges selected cells.
   * @returns {void}
   */
  const mergeCells = () => {
    editor?.chain().focus().mergeCells().run();
    if (tablePopoverRef.value) {
      tablePopoverRef.value.open = false;
    }
  };

  /**
   * Splits the current cell.
   * @returns {void}
   */
  const splitCell = () => {
    editor?.chain().focus().splitCell().run();
    if (tablePopoverRef.value) {
      tablePopoverRef.value.open = false;
    }
  };
  const isTableActive = editor?.isActive('table');

  return html`
    <style>
      ${styles}
    </style>
    <div class="${BASE_CLASS}__toolbar-group">
      <cds-layer>
        ${isTableActive
          ? html`
              <cds-popover
                ${ref(tablePopoverRef)}
                align="bottom"
                tabtip
                autoalign>
                <cds-icon-button
                  kind="ghost"
                  caret
                  autoalign
                  align="top"
                  .size=${toolbarSize as any}
                  enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
                  leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
                  @click=${togglePopover}>
                  ${iconLoader(Table, { slot: 'icon' })}
                  <span slot="tooltip-content">Table</span>
                </cds-icon-button>
                <cds-popover-content slot="content">
                  <div class="${BASE_CLASS}__toolbar-group--table">
                    <cds-icon-button
                      kind="ghost"
                      autoalign
                      align="top"
                      .size=${toolbarSize as any}
                      enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
                      leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
                      ?disabled=${!editor?.can().addColumnBefore()}
                      @click=${addColumnBefore}>
                      ${iconLoader(ColumnInsert, { slot: 'icon' })}
                      <span slot="tooltip-content">Add Column Before</span>
                    </cds-icon-button>
                    <cds-icon-button
                      kind="ghost"
                      autoalign
                      align="top"
                      .size=${toolbarSize as any}
                      enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
                      leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
                      ?disabled=${!editor?.can().addColumnAfter()}
                      @click=${addColumnAfter}>
                      ${iconLoader(ColumnInsert, { slot: 'icon' })}
                      <span slot="tooltip-content">Add Column After</span>
                    </cds-icon-button>
                    <cds-icon-button
                      kind="danger-ghost"
                      autoalign
                      align="top"
                      .size=${toolbarSize as any}
                      enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
                      leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
                      ?disabled=${!editor?.can().deleteColumn()}
                      @click=${deleteColumn}>
                      ${iconLoader(ColumnDelete, { slot: 'icon' })}
                      <span slot="tooltip-content">Delete Column</span>
                    </cds-icon-button>
                    <cds-icon-button
                      kind="ghost"
                      autoalign
                      align="top"
                      .size=${toolbarSize as any}
                      enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
                      leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
                      ?disabled=${!editor?.can().mergeCells()}
                      @click=${mergeCells}>
                      ${iconLoader(TableSplit, { slot: 'icon' })}
                      <span slot="tooltip-content">Merge Cells</span>
                    </cds-icon-button>
                    <cds-icon-button
                      kind="ghost"
                      autoalign
                      align="top"
                      .size=${toolbarSize as any}
                      enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
                      leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
                      ?disabled=${!editor?.can().addRowBefore()}
                      @click=${addRowBefore}>
                      ${iconLoader(RowInsert, { slot: 'icon' })}
                      <span slot="tooltip-content">Add Row Before</span>
                    </cds-icon-button>
                    <cds-icon-button
                      kind="ghost"
                      autoalign
                      align="top"
                      .size=${toolbarSize as any}
                      enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
                      leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
                      ?disabled=${!editor?.can().addRowAfter()}
                      @click=${addRowAfter}>
                      ${iconLoader(RowInsert, { slot: 'icon' })}
                      <span slot="tooltip-content">Add Row After</span>
                    </cds-icon-button>
                    <cds-icon-button
                      kind="danger-ghost"
                      autoalign
                      align="top"
                      .size=${toolbarSize as any}
                      enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
                      leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
                      ?disabled=${!editor?.can().deleteRow()}
                      @click=${deleteRow}>
                      ${iconLoader(RowDelete, { slot: 'icon' })}
                      <span slot="tooltip-content">Delete Row</span>
                    </cds-icon-button>
                    <cds-icon-button
                      kind="ghost"
                      autoalign
                      align="top"
                      .size=${toolbarSize as any}
                      enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
                      leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
                      ?disabled=${!editor?.can().splitCell()}
                      @click=${splitCell}>
                      ${iconLoader(TableSplit, { slot: 'icon' })}
                      <span slot="tooltip-content">Split Cell</span>
                    </cds-icon-button>
                    <cds-icon-button
                      kind="ghost"
                      autoalign
                      align="top"
                      .size=${toolbarSize as any}
                      enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
                      leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
                      @click=${insertTable}>
                      ${iconLoader(TableAdd, { slot: 'icon' })}
                      <span slot="tooltip-content">Insert Table</span>
                    </cds-icon-button>
                    <cds-icon-button
                      kind="danger-ghost"
                      autoalign
                      align="top"
                      .size=${toolbarSize as any}
                      enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
                      leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
                      ?disabled=${!editor?.can().deleteTable()}
                      @click=${deleteTable}>
                      ${iconLoader(TrashCan, { slot: 'icon' })}
                      <span slot="tooltip-content">Delete Table</span>
                    </cds-icon-button>
                  </div>
                </cds-popover-content>
              </cds-popover>
            `
          : html`
              <cds-icon-button
                kind="ghost"
                autoalign
                align="top"
                .size=${toolbarSize as any}
                enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
                leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
                @click=${insertTable}>
                ${iconLoader(TableAdd, { slot: 'icon' })}
                <span slot="tooltip-content">Insert Table</span>
              </cds-icon-button>
            `}
      </cds-layer>
    </div>
  `;
};
