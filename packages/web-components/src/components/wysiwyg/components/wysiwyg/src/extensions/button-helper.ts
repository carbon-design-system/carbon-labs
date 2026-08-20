/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import type { TemplateResult } from 'lit';
import type { Editor } from '@tiptap/core';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import {
  TOOLTIP_ENTER_DELAY_MS,
  TOOLTIP_LEAVE_DELAY_MS,
} from '../constants.js';
import type { ToolbarSize } from '../types.js';

/**
 * Options for the icon button helper
 */
export interface IconButtonOptions {
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button is selected/active */
  selected?: boolean;
  /** Tooltip text */
  tooltip: string;
  /** Button kind - defaults to 'ghost' */
  kind?: 'ghost' | 'danger-ghost';
  /** Whether to show a caret */
  caret?: boolean;
  /** Tab index for the icon */
  iconTabIndex?: string;
}

/**
 * Universal icon button helper with preset common props.
 * Reduces boilerplate by presetting all common button properties.
 *
 * @param {any} icon - Carbon icon to display
 * @param {Function} onClick - Click handler
 * @param {ToolbarSize} toolbarSize - Size of the button
 * @param {IconButtonOptions} options - Additional button options
 * @returns {TemplateResult} Lit template for the icon button
 *
 */
export const iconButton = (
  icon: any,
  onClick: (e: Event) => void,
  toolbarSize: ToolbarSize,
  options: IconButtonOptions
): TemplateResult => html`
  <cds-icon-button
    kind=${options.kind ?? 'ghost'}
    autoalign
    align="top"
    .size=${toolbarSize as any}
    enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
    leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
    ?disabled=${options.disabled ?? false}
    ?isselected=${options.selected ?? false}
    ?caret=${options.caret ?? false}
    @click=${onClick}>
    ${iconLoader(icon, {
      slot: 'icon',
      ...(options.iconTabIndex ? { tabIndex: options.iconTabIndex } : {}),
    })}
    <span slot="tooltip-content">${options.tooltip}</span>
  </cds-icon-button>
`;

/**
 * Options for the command button helper
 */
export interface CmdButtonOptions extends Omit<
  IconButtonOptions,
  'disabled' | 'selected'
> {
  /** isActive() query — mark/node name or attributes object */
  active?: string | object;
  /** Arguments passed to the editor command */
  args?: unknown[];
  /** Called after the command executes (e.g. to close a popover) */
  onDone?: () => void;
}

/**
 * Icon button wired to a TipTap editor command. Runs
 * `editor.chain().focus().<cmd>(...args).run()` on click, derives `disabled`
 * from `editor.can().<cmd>(...args)` and `selected` from `editor.isActive(active)`.
 *
 * @param {any} icon - Carbon icon to display
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {string} cmd - Editor command name
 * @param {ToolbarSize} toolbarSize - Size of the button
 * @param {CmdButtonOptions} options - Additional button options
 * @returns {TemplateResult} Lit template for the icon button
 */
export const cmdButton = (
  icon: any,
  editor: Editor | null,
  cmd: string,
  toolbarSize: ToolbarSize,
  { active, args = [], onDone, ...options }: CmdButtonOptions
): TemplateResult =>
  iconButton(
    icon,
    () => {
      (editor?.chain().focus() as any)?.[cmd](...args).run();
      onDone?.();
    },
    toolbarSize,
    {
      ...options,
      disabled: !(editor?.can() as any)?.[cmd](...args),
      selected: active ? editor?.isActive(active as any) : undefined,
    }
  );
