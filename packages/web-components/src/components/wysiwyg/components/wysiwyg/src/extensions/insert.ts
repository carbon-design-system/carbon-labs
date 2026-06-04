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
import LinkIcon from '@carbon/icons/es/link/16.js';
import ImageIcon from '@carbon/icons/es/image/16.js';
import SaveIcon from '@carbon/icons/es/checkmark/16.js';
import TrashCanIcon from '@carbon/icons/es/trash-can/16.js';

// Carbon components
import '@carbon/web-components/es/components/icon-button/index.js';
import '@carbon/web-components/es/components/popover/index.js';
import '@carbon/web-components/es/components/text-input/index.js';
import '@carbon/web-components/es/components/layer/index.js';

// Local imports
import { BASE_CLASS } from '../constants';
import {
  TOOLTIP_ENTER_DELAY_MS,
  TOOLTIP_LEAVE_DELAY_MS,
} from '../constants.js';

// TipTap extensions
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';

// Constants
const IMAGE_CONFIG = {
  inline: true,
  allowBase64: true,
  HTMLAttributes: {
    class: 'editor-image',
  },
  resize: {
    enabled: true,
    directions: [
      'top',
      'bottom',
      'left',
      'right',
      'top-left',
      'top-right',
      'bottom-left',
      'bottom-right',
    ],
    minWidth: 50,
    minHeight: 50,
    alwaysPreserveAspectRatio: true,
  },
};

// Styles
const styles = `
  .${BASE_CLASS}__insert-popover-content {
    display: flex;
    min-inline-size: 20rem;
  }

  .${BASE_CLASS}__insert-popover-content cds-text-input {
    --cds-border-strong: transparent;
    flex: 1;
  }

  .${BASE_CLASS}__editor .ProseMirror [data-resize-wrapper] {
    position: relative;
    display: inline-block;
  }

  .${BASE_CLASS}__editor .ProseMirror [data-resize-wrapper] img {
    display: block;
    block-size: auto;
    max-inline-size: 100%;
  }

  .${BASE_CLASS}__editor .ProseMirror [data-resize-wrapper] [data-resize-handle] {
    position: absolute;
    z-index: 10;
    background: var(--cds-border-interactive, #0f62fe);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
  }

  @media screen and (prefers-reduced-motion: reduce) {
    .${BASE_CLASS}__editor .ProseMirror [data-resize-wrapper] [data-resize-handle] {
      transition: none;
    }
  }

  .${BASE_CLASS}__editor .ProseMirror [data-resize-wrapper]:hover [data-resize-handle],
  .${BASE_CLASS}__editor .ProseMirror [data-resize-wrapper]:has(img.ProseMirror-selectednode) [data-resize-handle] {
    opacity: 1;
    pointer-events: auto;
  }

  .${BASE_CLASS}__editor .ProseMirror [data-resize-wrapper] [data-resize-handle='top'],
  .${BASE_CLASS}__editor .ProseMirror [data-resize-wrapper] [data-resize-handle='bottom'] {
    height: 2px;
    left: 0;
    right: 0;
  }

  .${BASE_CLASS}__editor .ProseMirror [data-resize-wrapper] [data-resize-handle='left'],
  .${BASE_CLASS}__editor .ProseMirror [data-resize-wrapper] [data-resize-handle='right'] {
    width: 2px;
    top: 0;
    bottom: 0;
  }

  .${BASE_CLASS}__editor .ProseMirror [data-resize-wrapper] [data-resize-handle='top-left'],
  .${BASE_CLASS}__editor .ProseMirror [data-resize-wrapper] [data-resize-handle='top-right'],
  .${BASE_CLASS}__editor .ProseMirror [data-resize-wrapper] [data-resize-handle='bottom-left'],
  .${BASE_CLASS}__editor .ProseMirror [data-resize-wrapper] [data-resize-handle='bottom-right'] {
    width: 8px;
    height: 8px;
  }

  .${BASE_CLASS}__editor .ProseMirror [data-resize-wrapper] [data-resize-handle='top'] {
    top: 0;
    cursor: n-resize;
  }

  .${BASE_CLASS}__editor .ProseMirror [data-resize-wrapper] [data-resize-handle='bottom'] {
    bottom: 0;
    cursor: s-resize;
  }

  .${BASE_CLASS}__editor .ProseMirror [data-resize-wrapper] [data-resize-handle='left'] {
    left: 0;
    cursor: w-resize;
  }

  .${BASE_CLASS}__editor .ProseMirror [data-resize-wrapper] [data-resize-handle='right'] {
    right: 0;
    cursor: e-resize;
  }

  .${BASE_CLASS}__editor .ProseMirror [data-resize-wrapper] [data-resize-handle='top-left'] {
    top: 0;
    left: 0;
    cursor: nw-resize;
  }

  .${BASE_CLASS}__editor .ProseMirror [data-resize-wrapper] [data-resize-handle='top-right'] {
    top: 0;
    right: 0;
    cursor: ne-resize;
  }

  .${BASE_CLASS}__editor .ProseMirror [data-resize-wrapper] [data-resize-handle='bottom-left'] {
    bottom: 0;
    left: 0;
    cursor: sw-resize;
  }

  .${BASE_CLASS}__editor .ProseMirror [data-resize-wrapper] [data-resize-handle='bottom-right'] {
    bottom: 0;
    right: 0;
    cursor: se-resize;
  }
`;

/**
 * Converts a URL string to an absolute URL with protocol.
 * @param {string} value - The URL string to convert
 * @returns {string | null} Absolute URL or null if invalid
 */
const toAbsoluteUrl = (value: string): string | null => {
  const href = /^https?:\/\//.test(value) ? value : `https://${value}`;
  try {
    new URL(href);
    return href;
  } catch {
    return null;
  }
};

/**
 * Extracts and converts URL from input element.
 * @param {Object} [input] - Input element with value property
 * @param {string} [input.value] - The input value
 * @returns {string | null} Absolute URL or null
 */
const urlFromInput = (input?: { value?: string }) =>
  toAbsoluteUrl(input?.value?.trim() ?? '');

/**
 * Creates a keyboard event handler that executes on Enter key.
 * @param {Function} fn - Function to execute on Enter
 * @returns {Function} Keyboard event handler
 */
const onEnterKey = (fn: () => void) => (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    fn();
  }
};

/**
 * Interface for the Insert extension with toolbar rendering capability.
 * @extends {Extension<any>}
 */
export interface InsertExtension extends Extension<any> {
  /**
   * Renders the insert toolbar controls.
   * @param {Editor | null} editor - The TipTap editor instance
   * @param {string} [toolbarSize='md'] - Size of the toolbar buttons
   * @returns {TemplateResult} Lit template for the insert toolbar
   */
  toolbarRender: (
    editor: Editor | null,
    toolbarSize?: string
  ) => TemplateResult;
}

/**
 * Insert extension for links and images.
 * Provides toolbar controls for inserting links and images with URL popovers.
 * @type {InsertExtension}
 */
export const Insert = Extension.create({
  name: 'insert',
  /**
   * Adds the Link and Image extensions.
   * @returns {Array} Array of TipTap extensions
   */
  addExtensions: () => [
    Link.configure({
      openOnClick: false,
      autolink: false,
      defaultProtocol: 'https',
    }),
    Image.configure(IMAGE_CONFIG as any),
  ],
}) as unknown as InsertExtension;

/**
 * Options for rendering a URL popover.
 * @typedef {Object} UrlPopoverOptions
 * @property {any} icon - Icon to display
 * @property {string} tooltip - Tooltip text
 * @property {string} placeholder - Input placeholder
 * @property {string} size - Button size
 * @property {Ref<any>} popoverRef - Popover reference
 * @property {Ref<any>} inputRef - Input reference
 * @property {boolean} [selected] - Whether button is selected
 * @property {boolean} [disabled] - Whether button is disabled
 * @property {string} [value] - Input value
 * @property {Function} onSave - Save callback
 * @property {Function} [onDelete] - Delete callback
 */
type UrlPopoverOptions = {
  icon: any;
  tooltip: string;
  placeholder: string;
  size: string;
  popoverRef: Ref<any>;
  inputRef: Ref<any>;
  selected?: boolean;
  disabled?: boolean;
  value?: string;
  onSave: () => void;
  onDelete?: () => void;
};

/**
 * Renders a URL input popover for links or images.
 * @param {UrlPopoverOptions} options - Popover configuration options
 * @returns {TemplateResult} Lit template for the URL popover
 */
const renderUrlPopover = ({
  icon,
  tooltip,
  placeholder,
  size,
  popoverRef,
  inputRef,
  selected = false,
  disabled = false,
  value = '',
  onSave,
  onDelete,
}: UrlPopoverOptions) => html`
  <cds-popover ${ref(popoverRef)} align="bottom-end" autoalign tabtip>
    <cds-icon-button
      kind="ghost"
      autoalign
      caret
      align="top"
      .size=${size as any}
      enter-delay-ms="${TOOLTIP_ENTER_DELAY_MS}"
      leave-delay-ms="${TOOLTIP_LEAVE_DELAY_MS}"
      ?selected=${selected}
      ?disabled=${disabled}
      @click=${() => {
        if (popoverRef.value) {
          popoverRef.value.open = !popoverRef.value.open;
        }
      }}>
      ${iconLoader(icon, { slot: 'icon' })}
      <span slot="tooltip-content">${tooltip}</span>
    </cds-icon-button>

    <cds-popover-content slot="content">
      <div class="${BASE_CLASS}__insert-popover-content">
        <cds-text-input
          ${ref(inputRef)}
          hide-label
          label=${tooltip}
          .size=${size as any}
          placeholder=${placeholder}
          .value=${value}
          @keydown=${onEnterKey(onSave)}></cds-text-input>

        <cds-icon-button
          kind="ghost"
          align="top"
          .size=${size as any}
          @click=${onSave}>
          ${iconLoader(SaveIcon, { slot: 'icon' })}
          <span slot="tooltip-content">Insert</span>
        </cds-icon-button>

        ${onDelete
          ? html` <cds-icon-button
              kind="danger-ghost"
              align="top"
              .size=${size as any}
              @click=${onDelete}>
              ${iconLoader(TrashCanIcon, { slot: 'icon' })}
              <span slot="tooltip-content">Delete</span>
            </cds-icon-button>`
          : ''}
      </div>
    </cds-popover-content>
  </cds-popover>
`;

/**
 * Closes a popover by reference.
 * @param {Ref<any>} r - Popover reference
 * @returns {void}
 */
const closePopover = (r: Ref<any>) => {
  if (r.value) {
    r.value.open = false;
  }
};

/**
 * Sets a link on the selected text.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {Ref<any>} linkInput - Link input reference
 * @param {Ref<any>} linkPopover - Link popover reference
 * @returns {void}
 */
const setLink = (
  editor: Editor | null,
  linkInput: Ref<any>,
  linkPopover: Ref<any>
) => {
  if (!editor || editor.state.selection.empty) {
    return;
  }
  const href = urlFromInput(linkInput.value);
  if (!href) {
    return;
  }
  editor.chain().focus().setLink({ href }).run();
  closePopover(linkPopover);
};

/**
 * Removes a link from the selected text.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {Ref<any>} linkPopover - Link popover reference
 * @returns {void}
 */
const unsetLink = (editor: Editor | null, linkPopover: Ref<any>) => {
  if (!editor?.isActive('link')) {
    return;
  }
  editor.chain().focus().extendMarkRange('link').unsetLink().run();
  closePopover(linkPopover);
};

/**
 * Inserts an image at the cursor position.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {Ref<any>} imageInput - Image input reference
 * @param {Ref<any>} imagePopover - Image popover reference
 * @returns {void}
 */
const setImage = (
  editor: Editor | null,
  imageInput: Ref<any>,
  imagePopover: Ref<any>
) => {
  if (!editor) {
    return;
  }
  const src = urlFromInput(imageInput.value);
  if (!src) {
    return;
  }
  editor.chain().focus().setImage({ src }).run();
  closePopover(imagePopover);
};

/**
 * Renders the insert toolbar with link and image controls.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {string} toolbarSize - Size of the toolbar buttons
 * @returns {TemplateResult} Lit template for the insert toolbar
 */
Insert.toolbarRender = (editor: Editor | null, toolbarSize = 'md') => {
  const linkPopover = createRef<any>(),
    linkInput = createRef<any>();
  const imagePopover = createRef<any>(),
    imageInput = createRef<any>();

  return html`
    <style>
      ${styles}
    </style>
    <div class="${BASE_CLASS}__toolbar-group">
      <cds-layer>
        ${renderUrlPopover({
          icon: LinkIcon,
          tooltip: 'Link',
          placeholder: 'Paste link',
          size: toolbarSize,
          popoverRef: linkPopover,
          inputRef: linkInput,
          disabled: !editor || editor.state.selection.empty,
          selected: editor?.isActive('link'),
          value: editor?.getAttributes('link').href ?? '',
          /** Saves the link */
          onSave: () => {
            setLink(editor, linkInput, linkPopover);
          },
          /** Deletes the link */
          onDelete: () => {
            unsetLink(editor, linkPopover);
          },
        })}
        ${renderUrlPopover({
          icon: ImageIcon,
          tooltip: 'Image',
          placeholder: 'Paste image URL',
          size: toolbarSize,
          popoverRef: imagePopover,
          inputRef: imageInput,
          /** Saves the image */
          onSave: () => {
            setImage(editor, imageInput, imagePopover);
          },
        })}
      </cds-layer>
    </div>
  `;
};
