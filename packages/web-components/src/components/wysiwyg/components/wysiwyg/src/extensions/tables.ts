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
import { createRef, ref } from 'lit/directives/ref.js';
import Table from '@carbon/icons/es/table/16.js';
import TableAdd from '@carbon/icons/es/table--add/16.js';
import TableSplit from '@carbon/icons/es/table--split/16.js';
import RowInsert from '@carbon/icons/es/row--insert/16.js';
import TrashCan from '@carbon/icons/es/trash-can/16.js';
import RowDelete from '@carbon/icons/es/row--delete/16.js';
import ColumnInsert from '@carbon/icons/es/column--insert/16.js';
import ColumnDelete from '@carbon/icons/es/column--delete/16.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import '@carbon/web-components/es/components/popover/index.js';
import '@carbon/web-components/es/components/layer/index.js';
import { BASE_CLASS } from '../constants.js';
import type { ToolbarSize } from '../types.js';
import { setupPopoverContent, togglePopover } from './popover-utils.js';
import { iconButton } from './button-helper.js';
import '../roving-tabindex.js';
import { Table as TiptapTable } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

const styles = `
  .${BASE_CLASS}__toolbar-group--table[open]::part(content) {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }
`;

export interface TablesExtension extends Extension<any> {
  toolbarRender: (
    editor: Editor | null,
    toolbarSize?: ToolbarSize
  ) => TemplateResult;
}

export const Tables = Extension.create({
  name: 'tables',
  /** Adds the table extensions (table, row, cell, header) */
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

/**
 * Renders the tables toolbar with table manipulation controls.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {ToolbarSize} toolbarSize - Size of the toolbar buttons
 */
Tables.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md'
) => {
  const popover = createRef<any>();
  /** Close popover */
  const close = () => popover.value?.toggleAttribute('open', false);
  return html`
    <style>
      ${styles}
    </style>
    <div class="${BASE_CLASS}__toolbar-group">
      <cds-layer>
        ${editor?.isActive('table')
          ? html`
              <cds-popover ${ref(popover)} align="bottom-end" tabtip autoalign>
                ${iconButton(Table, () => togglePopover(popover), toolbarSize, {
                  tooltip: 'Table',
                  caret: true,
                })}
                <cds-popover-content
                  class="${BASE_CLASS}__toolbar-group--table"
                  slot="content"
                  ${ref(setupPopoverContent)}>
                  <clabs-roving-tabindex>
                    ${iconButton(
                      ColumnInsert,
                      () => {
                        editor?.chain().focus().addColumnBefore().run();
                        close();
                      },
                      toolbarSize,
                      {
                        disabled: !editor?.can().addColumnBefore(),
                        tooltip: 'Add Column Before',
                        kind: 'ghost',
                      }
                    )}
                    ${iconButton(
                      ColumnInsert,
                      () => {
                        editor?.chain().focus().addColumnAfter().run();
                        close();
                      },
                      toolbarSize,
                      {
                        disabled: !editor?.can().addColumnAfter(),
                        tooltip: 'Add Column After',
                        kind: 'ghost',
                      }
                    )}
                    ${iconButton(
                      ColumnDelete,
                      () => {
                        editor?.chain().focus().deleteColumn().run();
                        close();
                      },
                      toolbarSize,
                      {
                        disabled: !editor?.can().deleteColumn(),
                        tooltip: 'Delete Column',
                        kind: 'danger-ghost',
                      }
                    )}
                    ${iconButton(
                      TableSplit,
                      () => {
                        editor?.chain().focus().mergeCells().run();
                        close();
                      },
                      toolbarSize,
                      {
                        disabled: !editor?.can().mergeCells(),
                        tooltip: 'Merge Cells',
                        kind: 'ghost',
                      }
                    )}
                    ${iconButton(
                      RowInsert,
                      () => {
                        editor?.chain().focus().addRowBefore().run();
                        close();
                      },
                      toolbarSize,
                      {
                        disabled: !editor?.can().addRowBefore(),
                        tooltip: 'Add Row Before',
                        kind: 'ghost',
                      }
                    )}
                    ${iconButton(
                      RowInsert,
                      () => {
                        editor?.chain().focus().addRowAfter().run();
                        close();
                      },
                      toolbarSize,
                      {
                        disabled: !editor?.can().addRowAfter(),
                        tooltip: 'Add Row After',
                        kind: 'ghost',
                      }
                    )}
                    ${iconButton(
                      RowDelete,
                      () => {
                        editor?.chain().focus().deleteRow().run();
                        close();
                      },
                      toolbarSize,
                      {
                        disabled: !editor?.can().deleteRow(),
                        tooltip: 'Delete Row',
                        kind: 'danger-ghost',
                      }
                    )}
                    ${iconButton(
                      TableSplit,
                      () => {
                        editor?.chain().focus().splitCell().run();
                        close();
                      },
                      toolbarSize,
                      {
                        disabled: !editor?.can().splitCell(),
                        tooltip: 'Split Cell',
                        kind: 'ghost',
                      }
                    )}
                    ${iconButton(
                      TableAdd,
                      () => {
                        editor
                          ?.chain()
                          .focus()
                          .deleteSelection()
                          .insertTable({
                            rows: 3,
                            cols: 3,
                            withHeaderRow: true,
                          })
                          .run();
                        close();
                      },
                      toolbarSize,
                      { tooltip: 'Insert Table', kind: 'ghost' }
                    )}
                    ${iconButton(
                      TrashCan,
                      () => {
                        editor?.chain().focus().deleteTable().run();
                        close();
                      },
                      toolbarSize,
                      {
                        disabled: !editor?.can().deleteTable(),
                        tooltip: 'Delete Table',
                        kind: 'danger-ghost',
                      }
                    )}
                  </clabs-roving-tabindex>
                </cds-popover-content>
              </cds-popover>
            `
          : iconButton(
              TableAdd,
              () =>
                editor
                  ?.chain()
                  .focus()
                  .deleteSelection()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run(),
              toolbarSize,
              { tooltip: 'Insert Table' }
            )}
      </cds-layer>
    </div>
  `;
};
