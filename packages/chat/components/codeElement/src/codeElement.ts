/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';

// @ts-ignore
import styles from './codeElement.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class codeElement extends LitElement {
  static styles = styles;
  /**
   * Code string to be parsed into lines and displayed
   */
  @property({ type: String, attribute: 'content', reflect: true })
  content;

  /**
   * Editable boolean flag to let users know lines can be changed
   */
  @property({ type: Boolean, attribute: 'editable', reflect: true })
  editable;

  /**
   * Editable boolean flag to let users know lines can be changed
   */
  @property({ type: Boolean, attribute: 'disable-line-ticks' })
  disableLineTicks;

  /**
   * Editable boolean flag to let users know lines can be changed
   */
  @property({ type: Boolean, attribute: 'disable-copy-button', reflect: true })
  disableCopyButton = false;

  /**
   * Editable boolean flag to let users know lines can be changed
   */
  @property({ type: Boolean, attribute: 'disable-edit-button', reflect: true })
  disableEditButton = true;

  /**
   * Source content - save original code text content
   */
  @state()
  _originalContent;

  /**
   * Edited content - update edited code
   */
  @state()
  _editedContent;

  /**
   * Array of lines parsed from content attribute
   */
  @state()
  _renderLines: {
    content: string;
    type: string;
    paddingLeft: string;
    enableEditing: boolean;
  }[] = [];

  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('content')) {
      this._originalContent = this.content;
      this._formatCode();
      this.requestUpdate();
    }
  }

  /** detect when component is rendered to process code object
   */
  firstUpdated() {
    if (this.content !== undefined) {
      this._originalContent = this.content;
      this._formatCode();
      this.requestUpdate();
    } else {
      this._renderLines = [
        {
          content: 'CodeElement ERROR: content is empty',
          type: '',
          enableEditing: false,
          paddingLeft: '8px',
        },
      ];
    }
  }

  /** copy current code to clipboard when copy event is triggered
   */
  async _copyCode() {
    try {
      await navigator.clipboard.writeText(this._originalContent);
    } catch (error) {
      console.error('CodeElement ERROR:', error);
    }
  }

  /** format code to properly display in HTML
   */
  _formatCode() {
    const formattedText = this.content;
    const htmlSafeText = formattedText.replace(/```/g, '');
    //.replace(/</g, '&lt;')
    //.replace(/>/g, '&gt;');
    const lines = htmlSafeText.trim().split('\n');
    const tabWidth = 16;
    const paddingLeft = 8;
    const textValues: {
      content: string;
      type: string;
      paddingLeft: string;
      enableEditing: boolean;
    }[] = [];
    for (let i = 0; i < lines.length; i++) {
      let lineType = '';
      const trimmedLine = lines[i].replace(/\t/g, '');
      if (trimmedLine.startsWith('#') || trimmedLine.startsWith('//')) {
        lineType = 'clabs--chat-code-line-comment';
      }

      let tabOffset = paddingLeft;
      const tabMatch = lines[i].match(/^\t*/);
      if (tabMatch) {
        tabOffset += tabMatch[0].length * tabWidth;
      }

      textValues.push({
        content: lines[i].replace(/\t/g, '').replace(/\n/g, ''),
        type: lineType,
        enableEditing: false,
        paddingLeft: tabOffset.toString() + 'px',
      });
    }
    this._renderLines = textValues;
    const tickWidth = 13 * lines.length.toString().length;
    this.style.setProperty(
      '--chat-code-tick-width',
      tickWidth.toString() + 'px'
    );
  }
}
