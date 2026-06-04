// TipTap core imports
import { Extension, Mark } from '@tiptap/core';
import type { Editor } from '@tiptap/core';

// Lit imports
import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import type { Ref } from 'lit/directives/ref.js';

// Carbon icons
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import TextColorIcon from '@carbon/icons/es/text--color/16.js';
import TextHighlight16 from '@carbon/icons/es/text--highlight/16.js';
import Subtract from '@carbon/icons/es/subtract/16.js';
import Add from '@carbon/icons/es/add/16.js';

// Carbon components
import '@carbon/web-components/es/components/button/index.js';
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
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';

/**
 * Custom Del mark for <del> tag (strikethrough/deletion).
 */
const Del = Mark.create({
  name: 'del',
  parseHTML() {
    return [{ tag: 'del' }];
  },
  renderHTML() {
    return ['del', 0];
  },
});

/**
 * Custom Ins mark for <ins> tag (insertion/underline).
 */
const Ins = Mark.create({
  name: 'ins',
  parseHTML() {
    return [{ tag: 'ins' }];
  },
  renderHTML() {
    return ['ins', 0];
  },
});

/**
 * Predefined text color groups with Carbon Design System tokens.
 * @constant
 */
export const TEXT_COLOR_GROUPS = [
  {
    label: 'Text',
    items: [
      { label: 'Primary Text', token: 'text-primary' },
      { label: 'Secondary Text', token: 'text-secondary' },
      { label: 'Placeholder', token: 'text-placeholder' },
      { label: 'Link', token: 'link-primary' },
    ],
  },
  {
    label: 'Status',
    items: [
      { label: 'Info', token: 'support-info' },
      { label: 'Success', token: 'support-success' },
      { label: 'Error', token: 'support-error' },
      { label: 'Warning', token: 'support-warning' },
      { label: 'Caution', token: 'support-caution-major' },
    ],
  },
] as const;

// Styles
const styles = `
  .${BASE_CLASS}__text-color-boxes {
    display: flex;
    flex-wrap: wrap;
    max-inline-size: 5.2rem;
    gap: var(--cds-spacing-03);
    padding: var(--cds-spacing-03);
  }
  
  .${BASE_CLASS}__text-color-box {
    inline-size: 1.4rem;
    block-size: 1.4rem;
    cursor: pointer;
  }
`;

/**
 * Interface for the TextColor extension with toolbar rendering capability.
 * @extends {Extension<any>}
 */
export interface TextColorExtension extends Extension<any> {
  /**
   * Renders the text color toolbar controls.
   * @param {Editor | null} editor - The TipTap editor instance
   * @param {string} [toolbarSize='md'] - Size of the toolbar buttons
   * @returns {TemplateResult} Lit template for the text color toolbar
   */
  toolbarRender: (
    editor: Editor | null,
    toolbarSize?: string
  ) => TemplateResult;
}

/**
 * TextColor extension for text color, highlighting, and text decorations.
 * Provides toolbar controls for text color, highlight, delete, and insert marks.
 * @type {TextColorExtension}
 */
export const TextColor = Extension.create({
  name: 'textColor',
  /**
   * Adds the text color, highlight, and mark extensions.
   * @returns {Array} Array of TipTap extensions
   */
  addExtensions: () => [
    TextStyle,
    Color,
    Highlight.configure({
      multicolor: false,
    }),
    Del,
    Ins,
  ],
}) as unknown as TextColorExtension;

/**
 * Applies a color token to selected text.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {string} token - Carbon Design System color token
 * @param {any} popoverRef - Popover reference to close
 * @returns {void}
 */
const applyColor = (editor: Editor | null, token: string, popoverRef: any) => {
  if (!editor) {
    return;
  }
  editor.chain().focus().setColor(`var(--cds-${token})`).run();
  if (popoverRef.value) {
    popoverRef.value.open = false;
  }
};

/**
 * Toggles highlight mark on selected text.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {any} popoverRef - Popover reference to close
 * @returns {void}
 */
const toggleMark = (editor: Editor | null, popoverRef: any) => {
  editor?.chain().focus().toggleHighlight().run();
  if (popoverRef.value) {
    popoverRef.value.open = false;
  }
};

/**
 * Toggles delete mark on selected text.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {any} popoverRef - Popover reference to close
 * @returns {void}
 */
const toggleDel = (editor: Editor | null, popoverRef: any) => {
  editor?.chain().focus().toggleMark('del').run();
  if (popoverRef.value) {
    popoverRef.value.open = false;
  }
};

/**
 * Toggles insert mark on selected text.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {any} popoverRef - Popover reference to close
 * @returns {void}
 */
const toggleIns = (editor: Editor | null, popoverRef: any) => {
  editor?.chain().focus().toggleMark('ins').run();
  if (popoverRef.value) {
    popoverRef.value.open = false;
  }
};

/**
 * Toggles the text color popover open/closed state.
 * @param {any} popoverRef - Popover reference
 * @returns {void}
 */
const toggleTextColorPopover = (popoverRef: any) => {
  if (popoverRef.value) {
    popoverRef.value.open = !popoverRef.value.open;
  }
};

/**
 * Toggles the highlight popover open/closed state.
 * @param {any} popoverRef - Popover reference
 * @returns {void}
 */
const toggleHighlightPopover = (popoverRef: any) => {
  if (popoverRef.value) {
    popoverRef.value.open = !popoverRef.value.open;
  }
};

/**
 * Renders the text color toolbar with color picker and text decoration controls.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {string} toolbarSize - Size of the toolbar buttons
 * @returns {TemplateResult} Lit template for the text color toolbar
 */
TextColor.toolbarRender = (editor: Editor | null, toolbarSize = 'md') => {
  const textColorPopoverRef: Ref<any> = createRef();
  const highlightPopoverRef: Ref<any> = createRef();

  // Get current color, default to text-primary
  const currentColor =
    editor?.getAttributes('textStyle')?.color || 'var(--cds-text-primary)';

  const isTextColorDisabled = !editor?.can().setColor('#000000');

  // Customize text color icon with current color on last path (only when not disabled)
  const customTextColorIcon = {
    ...TextColorIcon,
    content: TextColorIcon.content.map((item: any, index: number) =>
      index === TextColorIcon.content.length - 1 && !isTextColorDisabled
        ? { ...item, attrs: { ...item.attrs, fill: currentColor } }
        : item
    ),
  };

  return html`
    <style>
      ${styles}
    </style>
    <div class="${BASE_CLASS}__toolbar-group">
      <cds-layer>
        <cds-popover
          ${ref(textColorPopoverRef)}
          tabtip
          align="bottom"
          autoalign>
          <cds-icon-button
            kind="ghost"
            autoalign
            caret
            align="top"
            .size=${toolbarSize as any}
            enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
            leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
            ?disabled=${isTextColorDisabled}
            @click=${() => toggleTextColorPopover(textColorPopoverRef)}>
            ${iconLoader(customTextColorIcon, { slot: 'icon', tabIndex: '-1' })}
            <span slot="tooltip-content">Text Color</span>
          </cds-icon-button>
          <cds-popover-content slot="content">
            <div class="${BASE_CLASS}__text-color-boxes">
              ${TEXT_COLOR_GROUPS.reduce(
                (acc, group) => [...acc, ...group.items],
                [] as any[]
              ).map(
                (item) => html`
                  <div
                    class="${BASE_CLASS}__text-color-box"
                    style="background-color: var(--cds-${item.token})"
                    title="${item.label}"
                    @click=${() =>
                      applyColor(
                        editor,
                        item.token,
                        textColorPopoverRef
                      )}></div>
                `
              )}
            </div>
          </cds-popover-content>
        </cds-popover>
        <cds-popover
          ${ref(highlightPopoverRef)}
          tabtip
          align="bottom"
          autoalign>
          <cds-icon-button
            kind="ghost"
            autoalign
            caret
            align="top"
            .size=${toolbarSize as any}
            enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
            leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
            ?disabled=${!editor?.can().toggleHighlight()}
            @click=${() => toggleHighlightPopover(highlightPopoverRef)}>
            ${iconLoader(TextHighlight16, { slot: 'icon' })}
            <span slot="tooltip-content">Highlight</span>
          </cds-icon-button>
          <cds-popover-content slot="content">
            <cds-icon-button
              kind="ghost"
              autoalign
              align="top"
              .size=${toolbarSize as any}
              enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
              leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
              ?disabled=${!editor?.can().toggleHighlight()}
              ?selected=${editor?.isActive('highlight')}
              @click=${() => toggleMark(editor, highlightPopoverRef)}>
              ${iconLoader(TextHighlight16, { slot: 'icon' })}
              <span slot="tooltip-content">Mark</span>
            </cds-icon-button>
            <cds-icon-button
              kind="ghost"
              autoalign
              align="top"
              .size=${toolbarSize as any}
              enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
              leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
              ?disabled=${!editor?.can().toggleMark('del')}
              ?selected=${editor?.isActive('del')}
              @click=${() => toggleDel(editor, highlightPopoverRef)}>
              ${iconLoader(Subtract, { slot: 'icon' })}
              <span slot="tooltip-content">Delete</span>
            </cds-icon-button>
            <cds-icon-button
              kind="ghost"
              autoalign
              align="top"
              .size=${toolbarSize as any}
              enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
              leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
              ?disabled=${!editor?.can().toggleMark('ins')}
              ?selected=${editor?.isActive('ins')}
              @click=${() => toggleIns(editor, highlightPopoverRef)}>
              ${iconLoader(Add, { slot: 'icon' })}
              <span slot="tooltip-content">Insert</span>
            </cds-icon-button>
          </cds-popover-content>
        </cds-popover>
      </cds-layer>
    </div>
  `;
};
