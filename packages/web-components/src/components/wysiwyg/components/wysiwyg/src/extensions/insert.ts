/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/core';
import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import LinkIcon from '@carbon/icons/es/link/16.js';
import ImageIcon from '@carbon/icons/es/image/16.js';
import SaveIcon from '@carbon/icons/es/checkmark/16.js';
import TrashCanIcon from '@carbon/icons/es/trash-can/16.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import '@carbon/web-components/es/components/popover/index.js';
import '@carbon/web-components/es/components/text-input/index.js';
import '@carbon/web-components/es/components/layer/index.js';
import { BASE_CLASS } from '../constants.js';
import type { ExtensionWithToolbar, ToolbarSize } from '../types.js';
import { iconButton } from './button-helper.js';
import {
  setupPopoverContent,
  togglePopover,
  closePopover,
} from './popover-utils.js';
import '../roving-tabindex.js';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';

const styles = `
  .${BASE_CLASS}__insert-popover-content[open]::part(content) {
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
 * Normalizes and validates a user-entered URL.
 * Prepends https:// when no protocol is present.
 * @param {string | undefined} value - Raw input value
 * @returns {string | null} The normalized URL, or null if empty/invalid
 */
const normalizeUrl = (value?: string): string | null => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }
  const url = /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    new URL(url);
    return url;
  } catch {
    return null;
  }
};

/**
 * Wraps an apply callback so it runs on Enter.
 * @param {Function} apply - Callback to run
 * @returns {Function} Keydown handler
 */
const onEnter = (apply: () => void) => (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    apply();
  }
};

export const Insert = Extension.create({
  name: 'insert',
  /** Adds the Link and Image extensions */
  addExtensions: () => [
    Link.configure({
      openOnClick: false,
      autolink: false,
      defaultProtocol: 'https',
    }),
    Image.configure({
      inline: true,
      allowBase64: true,
      HTMLAttributes: { class: 'editor-image' },
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
    } as any),
  ],
}) as unknown as ExtensionWithToolbar;

/**
 * Renders the insert toolbar with link and image controls.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {ToolbarSize} toolbarSize - Size of the toolbar buttons
 */
Insert.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md'
) => {
  const linkPopover = createRef<any>();
  const linkInput = createRef<any>();
  const imagePopover = createRef<any>();
  const imageInput = createRef<any>();

  /** Sets a link on the current selection from the link input value */
  const applyLink = () => {
    const href = normalizeUrl(linkInput.value?.value);
    if (!href || !editor || editor.state.selection.empty) {
      return;
    }
    editor.chain().focus().setLink({ href }).run();
    closePopover(linkPopover);
  };

  /** Inserts an image from the image input value */
  const applyImage = () => {
    const src = normalizeUrl(imageInput.value?.value);
    if (!src || !editor) {
      return;
    }
    editor.chain().focus().setImage({ src }).run();
    closePopover(imagePopover);
  };

  return html`
    <style>
      ${styles}
    </style>
    <div class="${BASE_CLASS}__toolbar-group">
      <cds-layer>
        <cds-popover ${ref(linkPopover)} align="bottom-end" autoalign tabtip>
          ${iconButton(
            LinkIcon,
            () => togglePopover(linkPopover),
            toolbarSize,
            {
              selected: editor?.isActive('link'),
              disabled:
                !editor?.can().setLink({ href: '' }) ||
                editor.state.selection.empty,
              tooltip: 'Link',
              caret: true,
            }
          )}
          <cds-popover-content
            class="${BASE_CLASS}__insert-popover-content"
            slot="content"
            ${ref((el: Element | undefined) =>
              setupPopoverContent(el, 'cds-text-input')
            )}>
            <clabs-roving-tabindex>
              <cds-text-input
                ${ref(linkInput)}
                hide-label
                label="Link"
                .size=${toolbarSize as any}
                placeholder="Paste link"
                .value=${editor?.getAttributes('link').href ?? ''}
                @keydown=${onEnter(applyLink)}></cds-text-input>
              ${iconButton(SaveIcon, applyLink, toolbarSize, {
                tooltip: 'Insert',
              })}
              ${iconButton(
                TrashCanIcon,
                () => {
                  if (editor?.isActive('link')) {
                    editor
                      .chain()
                      .focus()
                      .extendMarkRange('link')
                      .unsetLink()
                      .run();
                    closePopover(linkPopover);
                  }
                },
                toolbarSize,
                { tooltip: 'Delete', kind: 'danger-ghost' }
              )}
            </clabs-roving-tabindex>
          </cds-popover-content>
        </cds-popover>
        <cds-popover ${ref(imagePopover)} align="bottom-end" autoalign tabtip>
          ${iconButton(
            ImageIcon,
            () => togglePopover(imagePopover),
            toolbarSize,
            {
              tooltip: 'Image',
              caret: true,
            }
          )}
          <cds-popover-content
            class="${BASE_CLASS}__insert-popover-content"
            slot="content"
            ${ref((el: Element | undefined) =>
              setupPopoverContent(el, 'cds-text-input')
            )}>
            <clabs-roving-tabindex>
              <cds-text-input
                ${ref(imageInput)}
                hide-label
                label="Image"
                .size=${toolbarSize as any}
                placeholder="Paste image URL"
                @keydown=${onEnter(applyImage)}></cds-text-input>
              ${iconButton(SaveIcon, applyImage, toolbarSize, {
                tooltip: 'Insert',
              })}
            </clabs-roving-tabindex>
          </cds-popover-content>
        </cds-popover>
      </cds-layer>
    </div>
  `;
};
