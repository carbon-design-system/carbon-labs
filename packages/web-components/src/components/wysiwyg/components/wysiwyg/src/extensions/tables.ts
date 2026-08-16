/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';
import { html } from 'lit';
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
import '@carbon/web-components/es/components/menu/index.js';
import { BASE_CLASS } from '../constants.js';
import type { ExtensionWithToolbar, ToolbarSize } from '../types.js';
import { setupPopoverContent, togglePopover } from './popover-utils.js';
import { cmdButton, iconButton } from './button-helper.js';
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
}) as unknown as ExtensionWithToolbar;

const TABLE_ACTIONS = [
  [ColumnInsert, 'addColumnBefore', 'Add Column Before', 'ghost'],
  [ColumnInsert, 'addColumnAfter', 'Add Column After', 'ghost'],
  [ColumnDelete, 'deleteColumn', 'Delete Column', 'danger-ghost'],
  [TableSplit, 'mergeCells', 'Merge Cells', 'ghost'],
  [RowInsert, 'addRowBefore', 'Add Row Before', 'ghost'],
  [RowInsert, 'addRowAfter', 'Add Row After', 'ghost'],
  [RowDelete, 'deleteRow', 'Delete Row', 'danger-ghost'],
  [TableSplit, 'splitCell', 'Split Cell', 'ghost'],
] as const;

/** Context menu items. `null` is a divider. Third value is Carbon `kind`. */
const TABLE_CONTEXT_MENU = [
  ['addRowBefore', 'Add Row Before'],
  ['addRowAfter', 'Add Row After'],
  ['deleteRow', 'Delete Row', 'danger'],
  null,
  ['addColumnBefore', 'Add Column Before'],
  ['addColumnAfter', 'Add Column After'],
  ['deleteColumn', 'Delete Column', 'danger'],
  null,
  ['mergeCells', 'Merge Cells'],
  ['splitCell', 'Split Cell'],
  null,
  ['deleteTable', 'Delete Table', 'danger'],
] as const;

/** Replace the previous contextmenu listener when toolbarRender re-runs. */
const _ctxListeners = new WeakMap<Element, EventListener>();
/** Document listener that closes the table context menu on outside click. */
let _ctxDocClose: EventListener | null = null;

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
  const menuRef = createRef<any>();

  /** Close popover */
  const close = () => popover.value?.toggleAttribute('open', false);

  /** Insert a 3×3 table with header row, replacing any selection */
  const insertTable = () => {
    editor
      ?.chain()
      .focus()
      .deleteSelection()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .command(({ tr, state, dispatch }) => {
        // Ensure a paragraph exists after the table so the cursor can exit.
        const end = state.selection.$from.after(1);
        if (!tr.doc.nodeAt(end)) {
          tr.insert(end, state.schema.nodes.paragraph.create());
        }
        dispatch?.(tr);
        return true;
      })
      .run();
    close();
  };

  /**
   * Close the context menu and drop the outside-click listener.
   */
  const closeCtxMenu = () => {
    if (menuRef.value) {
      menuRef.value.open = false;
    }
    if (_ctxDocClose) {
      document.removeEventListener('pointerdown', _ctxDocClose, true);
      _ctxDocClose = null;
    }
  };

  /**
   * Close the menu, then run a TipTap table command.
   * @param {string} action - TipTap chain method name
   */
  const ctxRunAction = (action: string) => {
    closeCtxMenu();
    // Defer so the menu can close before the editor takes focus.
    setTimeout(() => (editor as any)?.chain().focus()[action]().run(), 0);
  };

  /**
   * Bind a right-click listener on the editor so table cells open cds-menu.
   * @param {Element | undefined} el - Toolbar group (mount hook)
   */
  const setupContextMenu = (el: Element | undefined) => {
    if (!el || !editor?.view?.dom) {
      return;
    }

    const editorDom = editor.view.dom;

    /**
     * Open the menu at the pointer. Keep a multi-cell selection so Merge stays available.
     * @param {Event} evt - contextmenu event
     */
    const handleContextMenu = (evt: Event) => {
      const { clientX, clientY } = evt as MouseEvent;
      if (
        !(evt.composedPath() as EventTarget[]).some(
          (node) => node instanceof HTMLTableElement
        )
      ) {
        return;
      }
      evt.preventDefault();
      const menu = menuRef.value;
      if (!menu) {
        return;
      }

      const canMerge = editor.can().mergeCells();
      if (!canMerge) {
        const view = editor.view;
        const coords = view.posAtCoords({ left: clientX, top: clientY });
        if (coords) {
          const pos = coords.inside > -1 ? coords.inside : coords.pos;
          view.dispatch(
            view.state.tr.setSelection(
              TextSelection.near(view.state.doc.resolve(pos))
            )
          );
        }
      }

      (menu.querySelector('[data-action="mergeCells"]') as any).disabled =
        !canMerge;
      (menu.querySelector('[data-action="splitCell"]') as any).disabled =
        !editor.can().splitCell();
      menu.x = clientX;
      menu.y = clientY;
      menu.open = true;

      if (_ctxDocClose) {
        document.removeEventListener('pointerdown', _ctxDocClose, true);
      }
      /**
       * Close when the next pointerdown is outside the menu.
       * @param {Event} downEvt - pointerdown event
       */
      _ctxDocClose = (downEvt: Event) => {
        if (!menuRef.value || downEvt.composedPath().includes(menuRef.value)) {
          return;
        }
        closeCtxMenu();
      };
      document.addEventListener('pointerdown', _ctxDocClose, true);
    };

    const prev = _ctxListeners.get(editorDom);
    if (prev) {
      editorDom.removeEventListener('contextmenu', prev);
    }
    editorDom.addEventListener('contextmenu', handleContextMenu);
    _ctxListeners.set(editorDom, handleContextMenu);
  };

  return html`
    <style>
      ${styles}
    </style>
    <div class="${BASE_CLASS}__toolbar-group" ${ref(setupContextMenu)}>
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
                    ${TABLE_ACTIONS.map(([icon, cmd, tooltip, kind]) =>
                      cmdButton(icon, editor, cmd, toolbarSize, {
                        tooltip,
                        kind,
                        onDone: close,
                      })
                    )}
                    ${iconButton(TableAdd, insertTable, toolbarSize, {
                      tooltip: 'Insert Table',
                      kind: 'ghost',
                    })}
                    ${cmdButton(TrashCan, editor, 'deleteTable', toolbarSize, {
                      tooltip: 'Delete Table',
                      kind: 'danger-ghost',
                      onDone: close,
                    })}
                  </clabs-roving-tabindex>
                </cds-popover-content>
              </cds-popover>
            `
          : iconButton(TableAdd, insertTable, toolbarSize, {
              tooltip: 'Insert Table',
            })}
      </cds-layer>
      <cds-menu
        ${ref(menuRef)}
        size="xs"
        @cds-menu-closed=${closeCtxMenu}>
        ${TABLE_CONTEXT_MENU.map((item) =>
          item === null
            ? html`<cds-menu-item-divider></cds-menu-item-divider>`
            : html`
                <cds-menu-item
                  label=${item[1]}
                  data-action=${item[0]}
                  .kind=${item[2]}
                  @click=${() => ctxRunAction(item[0])}>
                </cds-menu-item>
              `
        )}
      </cds-menu>
    </div>
  `;
};
