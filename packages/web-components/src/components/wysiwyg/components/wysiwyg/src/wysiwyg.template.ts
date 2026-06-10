/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { Editor } from '@tiptap/core';
import { createRef, ref } from 'lit/directives/ref.js';
import type { Ref } from 'lit/directives/ref.js';
/* @ts-ignore */
import styles from './wysiwyg.scss?inline';
import { BASE_CLASS } from './constants.js';
import './roving-tabindex.js';
import type { ExtensionWithToolbar, ToolbarSize } from './types.js';

// Required TipTap base extensions
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';

// Carbon components
import '@carbon/web-components/es/components/layer/index.js';

/**
 * WYSIWYG editor component
 */
class Wysiwyg extends LitElement {
  static styles = styles;

  @property({ type: String, reflect: true })
  content = '';

  @property({ type: Array })
  extensions: ExtensionWithToolbar[] = [];

  @property({ type: String, reflect: true, attribute: 'toolbar-size' })
  toolbarSize: ToolbarSize = 'md';

  public editor: Editor | null = null;
  private editorRef: Ref<HTMLDivElement> = createRef();
  private toolbarRef: Ref<HTMLDivElement> = createRef();

  /**
   * Initializes the editor after the component is first rendered.
   */
  firstUpdated() {
    if (this.editorRef.value) {
      this.editor = new Editor({
        element: this.editorRef.value,
        extensions: [Document, Paragraph, Text, ...this.extensions],
        content: this.content,
        editorProps: {
          attributes: {
            'aria-label': 'Rich text editor',
          },
        },
        /** Updates component state when editor content changes. */
        onUpdate: () => {
          this.dispatchEvent(
            new CustomEvent('content-change', {
              detail: {
                editor: this.editor,
              },
              bubbles: true,
              composed: true,
            })
          );
        },
        /** Requests a re-render when the editor selection changes. */
        onSelectionUpdate: () => {
          queueMicrotask(() => this.requestUpdate());
        },
      });

      // Store reference to component in editor for extensions to access
      (this.editor as any).component = this;

      // Request update to render toolbar with initialized editor
      this.requestUpdate();
    }
  }

  /**
   * Cleans up the editor when the component is removed.
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this.editor?.destroy();
  }

  /**
   * Renders the editor and toolbar.
   */
  render() {
    return html`
      <cds-layer>
        <div class="${BASE_CLASS}__container">
          <div
            class="${BASE_CLASS}__toolbar"
            data-floating-menu-container
            ${ref(this.toolbarRef)}>
            <clabs-roving-tabindex>
              ${this.extensions.map((ext) =>
                ext.toolbarRender?.(this.editor, this.toolbarSize)
              )}
            </clabs-roving-tabindex>
          </div>
          <cds-layer>
            <div class="${BASE_CLASS}__editor" ${ref(this.editorRef)}></div>
          </cds-layer>
        </div>
      </cds-layer>
    `;
  }
}

export default Wysiwyg;
