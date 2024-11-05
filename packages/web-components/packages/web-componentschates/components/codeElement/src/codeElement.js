/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
var __decorate = this && this.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import hljs from 'highlightjs';
// @ts-ignore
// @ts-ignore
import styles from "./codeElement.css.js";
/**
 * Input component using search typeahead api
 */ /**
     * Input component using search typeahead api
     */
class codeElement extends LitElement {
  constructor() {
    super(...arguments);
    /**
     * Set tab size flag int
     */
    this.tabSize = 3;
    /**
     * Editable boolean flag to let users know lines can be changed
     */
    this.disableCopyButton = false;
    /**
     * Editable boolean flag to let users know lines can be changed
     */
    this.disableEditButton = true;
    /**
     * _currentEditIndex - target line index
     */
    this._currentEditIndex = 0;
    /**
     * currentlyEdited - flag if any content was changed
     */
    this._currentlyEdited = false;
    /**
     * currentlyFullyEdited - flag if any content was changed
     */
    this._currentlyFullyEdited = false;
    /**
     * _fullEditMode - use one singular text area to edit
     */
    this._fullEditMode = true;
    /**
     * _updateOnEdit - send event on every edit
     */
    this._updateOnEdit = true;
    /**
     * prerender with highlight
     */
    this._preRender = true;
    /**
     * Array of lines parsed from content attribute
     */
    this._renderedLines = [];
    /**
     * Copied array of lines when edited
     */
    this._editedLines = [];
    /**
     * Original array of lines from content field
     */
    this._originalLines = [];
    /**
     * _renderLabel - render default or custom label
     * @param {string} key - target
     */
    this._renderLabel = key => {
      let customValue;
      const labels = this.customLabels || {};
      if (labels) {
        switch (key) {
          case 'code-copypaste-button':
            customValue = labels[key] || 'Copy code';
            break;
          case 'code-copypaste-success':
            customValue = labels[key] || 'Copieddddd!';
            break;
        }
      }
      return customValue || key;
    };
  }
  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('content')) {
      if (!this._originalContent) {
        this._originalContent = this.content;
      }
      if (this.streaming) {
        this._formatCode(false);
      } else {
        this._formatCode(false);
      }
    }
    if (changedProperties.has('disableLineTicks')) {
      this._formatCode(this.editable);
    }
    if (changedProperties.has('_editedContent')) {
      this._formatCode(true);
    }
  }
  /**
   * _clearCode - get code type if it exists and remove backticks
   * @param {string} content - content code string
   */
  _clearCode(content) {
    const match = content.match(/^```(\w+)?\n([\s\S]*?)\n```$/);
    if (match) {
      const [, lang, codeContent] = match;
      return {
        language: lang || null,
        codeContent
      };
    }
    return {
      language: null,
      codeContent: content
    };
  }
  /** detect when component is rendered to process code object
   */
  firstUpdated() {
    if (this.hasAttribute('max-height')) {
      this.style.setProperty('--chat-code-height', this.maxHeight);
    }
    if (this.editable) {
      this.disableLineTicks = false;
      /*if (!this.disableLineTicks) {
        this.style.setProperty('--chat-code-tick-offset', '16px');
      }*/
    }
    if (this.content !== undefined) {
      const codeAnalysis = this._clearCode(this.content);
      if (codeAnalysis.language) {
        this.content = codeAnalysis.codeContent;
        this.language = codeAnalysis.language;
      }
      this._editedContent = this.content;
      this._originalContent = this.content;
      this._formatCode(false);
    } else {
      this._renderedLines = [{
        content: 'CodeElement ERROR: content is empty',
        type: '',
        paddingLeft: '8px'
      }];
    }
    if (!this.disableAutoCompacting) {
      this.resizeObserver = new ResizeObserver(async () => {
        this._handleScroll();
      });
      this.resizeObserver.observe(this);
    }
  }
  /** _handleScroll
   */
  _handleScroll() {
    var _a, _b;
    const textArea = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('.clabs--chat-code-edit-area');
    const editArea = (_b = this.shadowRoot) === null || _b === void 0 ? void 0 : _b.querySelector('.clabs--chat-code-color-area');
    if (editArea instanceof HTMLElement && textArea instanceof HTMLElement && this.editable) {
      editArea.scrollTop = textArea.scrollTop;
      setTimeout(() => {
        if (Math.abs(textArea.scrollHeight - editArea.scrollHeight) > 10) {
          this._formatCode(true);
        }
      }, 100);
    }
  }
  /**
   * _handleResize - resize handler to check code container size
   * @param {event} _event - resize event
   */
  _handleResize(_event) {
    /*if(!this.disableLineTicks){
      this.disableLineTicks = (this.clientWidth < 300);
    }*/
    this._handleScroll();
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
  /**
   * _getTheme - find current theme by checking parent background color
   */
  _getTheme() {
    if (this.parentElement instanceof HTMLElement) {
      const parentStyle = getComputedStyle(this.parentElement);
      const backgroundColor = parentStyle.getPropertyValue('--cds-background');
      const darkMode = backgroundColor.startsWith('#') && parseInt(backgroundColor.replace('#', ''), 16) < 0xffffff / 2;
      this.theme = darkMode ? 'g100' : 'white';
    } else {
      const parentStyle = getComputedStyle(this);
      const backgroundColor = parentStyle.getPropertyValue('--cds-background');
      const darkMode = backgroundColor.startsWith('#') && parseInt(backgroundColor.replace('#', ''), 16) < 0xffffff / 2;
      this.theme = darkMode ? 'g100' : 'white';
    }
  }
  /** _controlTabbing - block tab event in typing
   * @param {event} event - key event
   */
  _controlTabbing(event) {
    //const newLines = event?.target?.value;
    if ((event === null || event === void 0 ? void 0 : event.key) === 'Tab') {
      event === null || event === void 0 ? void 0 : event.preventDefault();
      /*let start = this.selectionStart;
      let end = this.selectionEnd;
      let tabbedline = newLines;
             // set textarea value to: text before caret + tab + text after caret
      tabbedline = tabbedline.substring(0, start) +"dksjfjkdkdjsl" + tabbedline.substring(end);
             this.selectionStart = this.selectionEnd = start + 1;
             if(event?.target?.value){
        event.target.value = tabbedline;
      }*/
    }
    setTimeout(() => {
      this._handleScroll();
    }, 100);
  }
  /**
   * _handleFullCodeEdit - textarea input event to record and feedback edits to content
   * @param {event} event - textarea input event
   */
  _handleFullCodeEdit(event) {
    var _a;
    const newLines = (_a = event === null || event === void 0 ? void 0 : event.target) === null || _a === void 0 ? void 0 : _a.value;
    if (this._updateOnEdit) {
      this._editedContent = newLines;
      const codeEditedEvent = new CustomEvent('on-code-edit-change', {
        detail: {
          previousLineData: this.content,
          newLineText: newLines
        },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(codeEditedEvent);
    }
    if (this._editedContent === this._originalContent) {
      this._currentlyEdited = false;
    } else {
      this._currentlyEdited = true;
    }
    this._handleScroll();
  }
  /**
   * _startFullEdit - textarea input event to record and feedback edits to content
   */
  _startFullEdit() {
    if (!this._currentlyEdited) {
      this._editedContent = this.content;
    }
    this._currentlyEdited = true;
  }
  /**
   * _handleCodeEdit - textarea input event to record and feedback edits to content
   * @param {event} event - textarea input event
   */
  _handleCodeEdit(event) {
    this._currentlyEdited = true;
    const targetElement = event === null || event === void 0 ? void 0 : event.target;
    const codeIndex = targetElement.getAttribute('data-codeindex');
    if (codeIndex) {
      const key = event.code;
      const lineIndex = parseInt(codeIndex);
      const editedValue = targetElement.value;
      this._editedLines[lineIndex]['content'] = editedValue;
      if (key == 'deleteContentBackward' || key == 'Backspace') {
        if (editedValue.length < 1) {
          event.preventDefault();
          this._editedLines.splice(lineIndex, 1);
        }
      } else if (key == 'Enter') {
        event.preventDefault();
        const newLineObject = {
          content: '',
          type: '',
          paddingLeft: this._editedLines[lineIndex].paddingLeft
        };
        this._editedLines.splice(lineIndex + 1, 0, newLineObject);
      }
    }
    this._renderedLines = [...this._editedLines];
  }
  /**
   * _packageSpecFromArray
   */
  _packageSpecFromArray() {
    return this._editedLines.map(line => line.content).join('\n');
  }
  /**
   * _setCurrentIndex
   * @param {event} event - textarea click event
   */
  _setCurrentIndex(event) {
    if (this._fullEditMode) {
      if (!this._currentlyFullyEdited) {
        this._editedContent = this.content;
      }
      this._currentlyFullyEdited = true;
    }
    const targetElement = event === null || event === void 0 ? void 0 : event.target;
    const codeIndex = targetElement === null || targetElement === void 0 ? void 0 : targetElement.getAttribute('data-codeindex');
    if (codeIndex) {
      this._currentEditIndex = codeIndex;
    }
  }
  /**
   * _handleEditValidation - button event when user confirms edit of code
   */
  _handleEditValidation() {
    //this.content = this._editedContent;
    const codeEditedEvent = new CustomEvent('on-code-edit-validation', {
      detail: {
        previousLineData: this._renderedLines,
        newLineData: this._editedLines,
        newLineText: this._editedContent //this._packageSpecFromArray(),
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(codeEditedEvent);
    //this._renderedLines = [...this._editedLines];
    //this._originalLines = [...this._editedLines];
    this.content = this._editedContent;
    this._currentlyEdited = false;
    this.requestUpdate();
  }
  /**
   * _handleCancellation - button event when user aborts edit of code
   */
  _handleEditCancellation() {
    this._editedContent = this._originalContent;
    this._currentlyEdited = false;
    const codeEditedEvent = new CustomEvent('on-code-edit-change', {
      detail: {
        previousLineData: this._originalContent,
        newLineText: this._originalContent,
        action: 'user canceled latest edit'
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(codeEditedEvent);
    this._formatCode(true);
  }
  /** _highlightLine - run code coloring system
   * @param {string} code - single code line
   * @param {string} lang - language to render
   */
  _highlightLine(code, lang) {
    return hljs.highlight(lang, code, true).value;
  }
  /** format code to properly display in HTML
   * @param {boolean} edited - whether to render edited or not
   */
  _formatCode(edited) {
    var _a;
    this._getTheme();
    this._currentlyEdited = false;
    const formattedText = edited ? this._editedContent : this.content;
    const htmlSafeText = formattedText.replace(/```/g, '');
    try {
      if (!this.language) {
        const detection = hljs.highlightAuto(htmlSafeText);
        this.language = detection.language;
      }
    } catch (e) {
      this.language = 'javascript';
    }
    const lines = htmlSafeText.trim().split('\n');
    const tabWidth = 24;
    const paddingLeft = 8;
    let textValues = [];
    const highlightMode = true;
    if (highlightMode) {
      const highlightedCode = hljs.highlightAuto(htmlSafeText).value;
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = highlightedCode;
      const codeLines = [];
      let currentLine = '';
      for (let i = 0; i < tempDiv.childNodes.length; i++) {
        const node = tempDiv.childNodes[i];
        if (node.nodeType === Node.TEXT_NODE) {
          const lines = (_a = node.textContent) === null || _a === void 0 ? void 0 : _a.split('\n');
          if (lines) {
            for (let k = 0; k < lines.length; k++) {
              if (k > 0) {
                codeLines.push(currentLine.replace(/\t/g, '&nbsp;&nbsp;&nbsp;'));
                currentLine = '';
              }
              currentLine += lines[k];
            }
          }
        } else {
          const element = node;
          currentLine += element.outerHTML;
        }
      }
      if (currentLine) {
        codeLines.push(currentLine.replace(/\t/g, '&nbsp;&nbsp;&nbsp;'));
      }
      textValues = codeLines.map(line => ({
        content: line,
        type: '',
        paddingLeft: '0px'
      }));
    } else {
      for (let i = 0; i < lines.length; i++) {
        const lineType = '';
        /*const trimmedLine = lines[i].replace(/\t/g, '');
        if (trimmedLine.startsWith('#') || trimmedLine.startsWith('//')) {
        lineType = 'clabs--chat-code-line-comment';
        }*/
        let tabOffset = paddingLeft;
        const tabMatch = lines[i].match(/^\t*/);
        if (tabMatch) {
          tabOffset += tabMatch[0].length * tabWidth;
        }
        tabOffset = 0;
        if (!lines[i].trim()) {
          continue;
        }
        textValues.push({
          content: lines[i].trim().replace(/\t/g, ''),
          type: lineType,
          paddingLeft: tabOffset.toString() + 'px'
        });
      }
    }
    this._editedLines = JSON.parse(JSON.stringify(textValues));
    this._originalLines = JSON.parse(JSON.stringify(textValues));
    this._renderedLines = JSON.parse(JSON.stringify(textValues));
    const tickWidth = 13 * textValues.length.toString().length;
    this.style.setProperty('--chat-code-tick-width', tickWidth.toString() + 'px');
  }
}
codeElement.styles = styles;
export default codeElement;
__decorate([property({
  type: String,
  attribute: 'content',
  reflect: true
})], codeElement.prototype, "content", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'editable',
  reflect: true
})], codeElement.prototype, "editable", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'enable-coloring'
})], codeElement.prototype, "enableColoring", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'enable-language-display'
})], codeElement.prototype, "enableLanguageDisplay", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'disable-line-ticks'
})], codeElement.prototype, "disableLineTicks", void 0);
__decorate([property({
  type: String,
  attribute: 'max-height'
})], codeElement.prototype, "maxHeight", void 0);
__decorate([property({
  type: Number,
  attribute: 'tab-size'
})], codeElement.prototype, "tabSize", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'disable-copy-button',
  reflect: true
})], codeElement.prototype, "disableCopyButton", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'disable-edit-button',
  reflect: true
})], codeElement.prototype, "disableEditButton", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'streaming'
})], codeElement.prototype, "streaming", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'disable-auto-compacting'
})], codeElement.prototype, "disableAutoCompacting", void 0);
__decorate([state()], codeElement.prototype, "_originalContent", void 0);
__decorate([state()], codeElement.prototype, "_editedContent", void 0);
__decorate([state()], codeElement.prototype, "_currentEditIndex", void 0);
__decorate([state()], codeElement.prototype, "_currentlyEdited", void 0);
__decorate([state()], codeElement.prototype, "_currentlyFullyEdited", void 0);
__decorate([state()], codeElement.prototype, "_fullEditMode", void 0);
__decorate([state()], codeElement.prototype, "_updateOnEdit", void 0);
__decorate([state()], codeElement.prototype, "language", void 0);
__decorate([state()], codeElement.prototype, "_preRender", void 0);
__decorate([state()], codeElement.prototype, "_renderedLines", void 0);
__decorate([state()], codeElement.prototype, "_editedLines", void 0);
__decorate([state()], codeElement.prototype, "_originalLines", void 0);
__decorate([property({
  type: Object,
  attribute: 'customLabels'
})], codeElement.prototype, "customLabels", void 0);
__decorate([state()], codeElement.prototype, "theme", void 0);
//# sourceMappingURL=codeElement.js.map
