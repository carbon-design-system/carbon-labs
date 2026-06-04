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
import type { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { createRef, ref } from 'lit/directives/ref.js';
import type { Ref } from 'lit/directives/ref.js';
/* @ts-ignore */
import styles from './wysiwyg.scss?inline';
import { BASE_CLASS } from './constants.js';

// Carbon components
import '@carbon/web-components/es/components/layer/index.js';

export interface ExtensionWithToolbar extends Extension<any> {
  toolbarRender?: (editor: Editor | null, toolbarSize?: string) => any;
}

/**
 * WYSIWYG editor component
 */
class Wysiwyg extends LitElement {
  static styles = styles;

  @property({ type: String })
  content = '';

  @property({ type: Array })
  extensions: ExtensionWithToolbar[] = [];

  @property({ type: String, reflect: true, attribute: 'toolbar-size' })
  toolbarSize = 'md';

  private editor: Editor | null = null;
  private editorRef: Ref<HTMLDivElement> = createRef();

  /**
   * Dispatches the current editor content.
   */
  public dispatchContentChange() {
    if (this.editor) {
      this.content = this.editor.getHTML();
      this.dispatchEvent(
        new CustomEvent('content-change', {
          detail: {
            content: this.content,
          },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  /**
   * Initializes the editor after the component is first rendered.
   */
  firstUpdated() {
    if (this.editorRef.value) {
      this.editor = new Editor({
        element: this.editorRef.value,
        extensions: [StarterKit, ...this.extensions],
        content: this.content,
        /** Updates component state when editor content changes. */
        onUpdate: () => {
          this.dispatchContentChange();
        },
        /** Requests a re-render when the editor selection changes. */
        onSelectionUpdate: () => this.requestUpdate(),
      });

      // Store reference to component in editor for extensions to access
      (this.editor as any).component = this;
    }
  }

  /**
   * Syncs external content changes into the editor instance.
   *
   * @param {Map<string, unknown>} changedProperties - The properties changed in the current update.
   */
  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('content') && this.editor) {
      if (this.content !== this.editor.getHTML()) {
        this.editor.commands.setContent(this.content, { emitUpdate: false });
      }
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
          <div class="${BASE_CLASS}__toolbar" data-floating-menu-container>
            ${this.extensions.map((ext) =>
              ext.toolbarRender?.(this.editor, this.toolbarSize)
            )}
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
