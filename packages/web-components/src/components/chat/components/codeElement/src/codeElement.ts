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

import hljs from 'highlightjs';

// @ts-ignore
import styles from './codeElement.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class codeElement extends LitElement {
  static styles = styles;

  /**
   * resizeObserver - resize watcher of parent
   **/
  private resizeObserver;

  /**
   * Code string to be parsed into lines and displayed
   */
  @property({ type: String, attribute: 'content', reflect: true })
  content;

  /**
   * Code string to be parsed into lines and displayed
   */
  @property({ type: String, attribute: 'new-content', reflect: true })
  newContent;

  /**
   * Editable boolean flag to let users know lines can be changed
   */
  @property({ type: Boolean, attribute: 'editable', reflect: true })
  editable;

  /**
   * Automatically detect blocks based on curly brackets
   */
  @property({ type: Boolean, attribute: 'auto-detect-blocks', reflect: true })
  autoDetectBlocks;

  /**
   * character count render limit for coloring performance
   */
  @property({ type: Number, attribute: 'disable-coloring-char-threshold' })
  coloringCharacterThreshold;

  /**
   * line count render limit for coloring performance
   */
  @property({ type: Number, attribute: 'disable-coloring-line-threshold' })
  coloringLineThreshold;

  /**
   * add coloring with highlightJS
   */
  @property({ type: Boolean, attribute: 'disable-coloring' })
  disableColoring;

  /**
   * add coloring with highlightJS
   */
  @property({ type: Boolean, attribute: 'enable-language-display' })
  enableLanguageDisplay;

  /**
   * show differences when new content arrives
   */
  @property({ type: Boolean, attribute: 'show-content-differences' })
  showContentDifferences;

  /**
   * Editable boolean flag to let users know lines can be changed
   */
  @property({ type: Boolean, attribute: 'disable-line-ticks' })
  disableLineTicks;

  /**
   * Set max height for code piece
   */
  @property({ type: String, attribute: 'max-height' })
  maxHeight;

  /**
   * Set lang name
   */
  @property({ type: String, attribute: 'displayed-language' })
  assignedLanguage;

  /**
   * Set render language
   */
  @property({ type: String, attribute: 'render-language' })
  renderLanguage;

  /**
   * Show language guessed by hljs
   */
  @property({ type: Boolean, attribute: 'enable-estimated-language' })
  autoAssignLanguage;

  /**
   * Show line count
   */
  @property({ type: Boolean, attribute: 'display-line-count' })
  displayLineCount;

  /**
   * Set tab size flag int
   */
  @property({ type: Number, attribute: 'tab-size' })
  tabSize = 2;

  /**
   * Disable editing options
   */
  @property({ type: Boolean, attribute: 'disable-editing-options' })
  disableEditingOptions;

  /**
   * Debug editing mode
   */
  @property({ type: Boolean, attribute: 'debug-editing-mode' })
  debugEditingMode;

  /**
   * Editable boolean flag to let users know lines can be changed
   */
  @property({ type: Boolean, attribute: 'disable-copy-button', reflect: true })
  disableCopyButton = false;

  /**
   * Editable boolean flag to let users know lines can be changed
   */
  @property({ type: Boolean, attribute: 'enable-edit-button', reflect: true })
  enableEditButton;

  /**
   * streaming - flag to enable streaming mode
   */
  @property({ type: Boolean, attribute: 'streaming' })
  streaming;

  /**
   * Editable boolean flag to let users know lines can be changed
   */
  @property({ type: Boolean, attribute: 'enable-auto-compacting' })
  enableAutoCompacting = true;

  /**
   * compacting value
   */
  @property({ type: Number, attribute: 'auto-compacting-threshold' })
  autoCompactingThreshold = 300;

  /**
   * disable collapse
   */
  @property({ type: Boolean, attribute: 'enable-block-collapse' })
  enableBlockCollapse;

  /**
   * enable auto-indent
   */
  @property({ type: Boolean, attribute: 'auto-indent' })
  autoIndent;

  /**
   * displayed content string
   */
  @state()
  _displayedContent;

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

  @state()
  _tickWidth = 0;

  /**
   * _currentEditIndex - target line index
   */
  @state()
  _currentEditIndex = 0;

  /**
   * currentlyEdited - flag if any content was changed
   */
  @state()
  _currentlyEdited = false;

  /**
   * currentlyFullyEdited - flag if any content was changed
   */
  @state()
  _currentlyFullyEdited = false;

  /**
   * _fullEditMode - use one singular text area to edit
   */
  @state()
  _fullEditMode = true;

  /**
   * _updateOnEdit - send event on every edit
   */
  @state()
  _updateOnEdit = true;

  /**
   * language - identified language
   */
  @state()
  language;

  /**
   * prerender with highlight
   */
  @state()
  _preRender = true;

  /**
   * line count
   */
  @state()
  lineCount;

  /**
   * selection start index
   */
  @state()
  selectionStart;

  /**
   * selection end index
   */
  @state()
  selectionEnd;

  /**
   * line indices to collpase/open
   */
  @state()
  collapsedList: number[] = [];

  /**
   * total editing offset
   */
  @state()
  editAreaSpacing = 0;

  /**
   * Array of lines parsed from content attribute
   */
  @state()
  _renderedLines: {
    content: string;
    paddingLeft: string;
    indent: number;
    collapsable: boolean;
    hidden: boolean;
  }[] = [];

  /**
   * Copied array of lines when edited
   */
  @state()
  _editedLines: {
    content: string;
    paddingLeft: string;
    indent: number;
    collapsable: boolean;
    hidden: boolean;
  }[] = [];

  /**
   * Original array of lines from content field
   */
  @state()
  _originalLines: {
    content: string;
    paddingLeft: string;
    indent: number;
    collapsable: boolean;
    hidden: boolean;
  }[] = [];

  /**
   * custom label presets
   */
  @property({ type: Object, attribute: 'customLabels' })
  customLabels;

  /**
   * core theme
   */
  @state()
  theme;

  /**
   * comparison enabled
   */
  @state()
  comparisonEnabled = false;

  /** internal editing enabled boolean
   */
  @state()
  editingEnabled = false;

  /**
   * compacted
   */
  @state()
  compacted;

  /**
   * blockcollapsa check
   */
  @state()
  collapseAvailable = false;

  /**
   * contentDifferenceDetected
   */
  @state()
  contentDifferenceDetected = false;

  /**
   * _indented - indent analysis done
   */
  @state()
  _indented = false;

  /**
   * dict of line diff types by index
   */
  @state()
  _comparisonReference = {};

  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('content')) {
      this._editedContent = this.content;
      this._originalContent = this.content;
      this._displayedContent = this.content;

      if (this.streaming) {
        this._formatCode(false);
      } else {
        this._formatCode(false);
      }
    }
    if (
      changedProperties.has('disableLineTicks') ||
      changedProperties.has('editable') ||
      changedProperties.has('editingEnabled')
    ) {
      this._formatCode(this.editable);
    }

    if (changedProperties.has('_editedContent')) {
      this._formatCode(true);
    }

    if (changedProperties.has('maxHeight')) {
      this.style.setProperty('--chat-code-height', this.maxHeight);
    }

    if (changedProperties.has('editAreaSpacing')) {
      this.style.setProperty(
        '--chat-code-editing-area-offset',
        this.editAreaSpacing + 'px'
      );
    }
  }

  /** detect when component is rendered to process code object
   */
  firstUpdated() {
    if (this.debugEditingMode) {
      this.style.setProperty(
        '--chat-editing-layer-font-color',
        'rgba(255,0,0,0.7)'
      );
    }
    if (this.hasAttribute('render-language')) {
      //console.log('FIRST: ' + this.renderLanguage);
      this.language = this.renderLanguage;
    }
    if (this.renderLanguage === 'smiles') {
      hljs.registerLanguage('smiles', this._addSmilesStyling);
    }
    if (this.hasAttribute('max-height')) {
      this.style.setProperty('--chat-code-height', this.maxHeight);
    }

    if (this.enableLanguageDisplay || this.displayLineCount) {
      this.style.setProperty('--chat-code-info-offset', '46px');
    }

    if (this.content !== undefined) {
      const codeAnalysis = this._cleanCode(this.content);
      if (codeAnalysis.language) {
        this.language = codeAnalysis.language;
      }
      this.content = codeAnalysis.code;

      let autoIndentedCode;
      if (this.autoIndent) {
        autoIndentedCode = this._preIndentCode(this.content);
        //console.log(autoIndentedCode)
        //console.log(this.content)
        this.content = autoIndentedCode;
      }

      this._editedContent = autoIndentedCode || this.content;
      this._originalContent = autoIndentedCode || this.content;
      this._displayedContent = autoIndentedCode || this.content;
      this._formatCode(false);
    } else {
      this._renderedLines = [
        {
          content: 'CodeElement ERROR: content is empty',
          paddingLeft: '8px',
          indent: 0,
          collapsable: false,
          hidden: false,
        },
      ];
    }
    //if (!this.disableAutoCompacting) {
    this.resizeObserver = new ResizeObserver(async (_event) => {
      this._handleResize(_event);
    });

    this.resizeObserver.observe(this);
  }

  /**
   * calculateEditingOffset -  unite all options and find optimal padding for overlapping textarea
   */
  calculateEditingOffset() {
    let editingAreaOffset = 8;
    if (this.collapseAvailable) {
      editingAreaOffset += 20 + 8;
    }

    if (!this.disableLineTicks) {
      editingAreaOffset += this._tickWidth + 13 + 4;
    } else {
      editingAreaOffset += 0;
    }

    if (this.disableColoring) {
      editingAreaOffset += 0;
    }
    if (
      this.disableColoring &&
      !this.disableLineTicks &&
      this.collapseAvailable
    ) {
      editingAreaOffset -= 6;
    }
    if (this.disableLineTicks && !this.collapseAvailable) {
      editingAreaOffset += 8;
    }
    if (
      !this.disableLineTicks &&
      !this.disableColoring &&
      this.editable &&
      this.collapseAvailable
    ) {
      editingAreaOffset -= 8;
    }
    this.editAreaSpacing = editingAreaOffset;
  }

  /**
   * _clearCode - get code type if it exists and remove backticks
   * @param {string} content - content code string
   */
  _clearCode(content) {
    const match = content.match(new RegExp('^```(w+)?\\n([sS]*?)\\n```$'));
    if (match) {
      const [, lang, codeContent] = match;
      return { language: lang || null, codeContent };
    }
    return { language: null, codeContent: content };
  }

  /**
   * _cleanCode - remove backticks and retrieve language name i it exists
   * @param {string} content - content to analyze
   */
  _cleanCode(content) {
    let foundLanguage = null;
    const backtickCheck = new RegExp('^```(\\w+)?\\n|```$', 'g');
    const cleanCode = content.replace(backtickCheck, (_match, langString) => {
      if (langString) {
        foundLanguage = langString.trim();
      }
    });
    return { language: foundLanguage, code: cleanCode };
  }

  /** _handleScroll
   */
  _handleScroll() {
    const textArea = this.shadowRoot?.querySelector(
      '.clabs--chat-code-edit-area'
    );
    const editArea = this.shadowRoot?.querySelector(
      '.clabs--chat-code-color-area'
    );
    if (
      editArea instanceof HTMLElement &&
      textArea instanceof HTMLElement &&
      this.editable
    ) {
      editArea.scrollTop = textArea.scrollTop;
      /*setTimeout(() => {
        if (Math.abs(textArea.scrollHeight - editArea.scrollHeight) > 10) {
          this._formatCode(true);
        }
      }, 100);*/
    }
  }

  /**
   * _handleResize - resize handler to check code container size
   * @param {event} _event - resize event
   */
  _handleResize(_event) {
    if (this.enableAutoCompacting && !this.disableLineTicks) {
      const limiter = this.autoCompactingThreshold;
      this.compacted = this.clientWidth < limiter;
    }
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
      const darkMode =
        backgroundColor.startsWith('#') &&
        parseInt(backgroundColor.replace('#', ''), 16) < 0xffffff / 2;
      this.theme = darkMode ? 'g100' : 'white';
    } else {
      const parentStyle = getComputedStyle(this);
      const backgroundColor = parentStyle.getPropertyValue('--cds-background');
      const darkMode =
        backgroundColor.startsWith('#') &&
        parseInt(backgroundColor.replace('#', ''), 16) < 0xffffff / 2;
      this.theme = darkMode ? 'g100' : 'white';
    }
  }

  /** _collapseBlock - toggle blocks to show
   * @param {string} index -  index of slected line
   */
  _collapseBlock = (index) => {
    const toggleBlocks = !this.collapsedList.includes(index);
    if (toggleBlocks) {
      this.collapsedList.push(index);
    } else {
      this.collapsedList = this.collapsedList.filter((i) => i !== index);
    }

    //let lineBlocks = this.shadowRoot.querySelectorAll('.'+clabsPrefix+'--chat-code-line');
    const indentStart = this._renderedLines[index].indent;

    for (let l = index + 1; l < this._renderedLines.length; l++) {
      const line = this._renderedLines[l];
      if (line.indent > indentStart) {
        this._renderedLines[l].hidden = toggleBlocks;
      } else {
        this._renderedLines[l].hidden = false;
        break;
      }
    }

    const splitter = this._editedContent.split('\n');
    let newTextContent = '';
    for (let m = 0; m < splitter.length - 1; m++) {
      if (!this._renderedLines[m].hidden) {
        newTextContent += splitter[m] + '\n';
      }
    }
    this._displayedContent = newTextContent;
    this.requestUpdate();
  };

  /** _controlTabbing - block tab event in typing
   * @param {event} _event - key event
   */
  _controlTabbing(_event) {
    const newLines = _event?.target?.value;
    if (_event?.key === 'Tab') {
      _event?.preventDefault();
      const start = this.selectionStart;
      const end = this.selectionEnd;
      let tabbedline = newLines;

      // set textarea value to: text before caret + tab + text after caret
      tabbedline =
        tabbedline.substring(0, start) +
        'dksjfjkdkdjsl' +
        tabbedline.substring(end);

      this.selectionStart = this.selectionEnd = start + 1;

      if (_event?.target?.value) {
        _event.target.value = tabbedline;
      }
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
    const newLines = event?.target?.value;
    if (this._updateOnEdit) {
      this._editedContent = newLines;
      const codeEditedEvent = new CustomEvent('on-code-edit-change', {
        detail: {
          previousLineData: newLines,
          newLineText: newLines,
        },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(codeEditedEvent);
    }
    this._currentlyEdited = this._editedContent !== this._originalContent;
    this._displayedContent = this._editedContent;
    this._handleScroll();
  }

  /**
   * _startFullEdit - textarea input event to record and feedback edits to content
   */
  _startFullEdit() {
    if (!this._currentlyEdited) {
      this._displayedContent = this._originalContent;
      this._editedContent = this._originalContent;
    }
    this._currentlyEdited = true;
  }

  /**
   * _handleCodeEdit - textarea input event to record and feedback edits to content
   * @param {event} event - textarea input event
   */
  _handleCodeEdit(event) {
    this._currentlyEdited = true;

    const targetElement = event?.target;
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
          paddingLeft: this._editedLines[lineIndex].paddingLeft,
          hidden: false,
          collapsable: false,
          indent: 0,
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
    return this._editedLines.map((line) => line.content).join('\n');
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

    const targetElement = event?.target;
    const codeIndex = targetElement?.getAttribute('data-codeindex');
    if (codeIndex) {
      this._currentEditIndex = codeIndex;
    }
  }

  /**
   * _handleEditValidation - button event when user confirms edit of code
   */
  _handleEditValidation() {
    this._originalContent = this._editedContent;
    this._displayedContent = this._editedContent;
    this.newContent = this._editedContent;
    this.showContentDifferences = true;
    this.contentDifferenceDetected = true;
    const codeEditedEvent = new CustomEvent('on-code-edit-validation', {
      detail: {
        previousLineData: this._renderedLines,
        newLineData: this._editedLines,
        newLineText: this._editedContent, //this._packageSpecFromArray(),
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(codeEditedEvent);
    this._currentlyEdited = false;
    this._formatCode(false);
  }

  /**
   * _handleCancellation - button event when user aborts edit of code
   */
  _handleEditCancellation() {
    //this._editedContent = this.content;
    //this.content=this._originalContent
    this._editedContent = this._originalContent;
    this._displayedContent = this._originalContent;
    this._currentlyEdited = false;

    const codeEditedEvent = new CustomEvent('on-code-edit-cancel', {
      detail: {
        previousLineData: this._originalContent,
        newLineText: this._originalContent,
        action: 'user canceled latest edit',
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(codeEditedEvent);
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
    this._getTheme();
    let formattedText = edited ? this._displayedContent : this._originalContent;

    if (this.contentDifferenceDetected) {
      formattedText = this._editedContent;
    }

    //const formattedText = this._displayedContent;
    if (formattedText) {
      const htmlSafeText = formattedText.replace(new RegExp('```', 'g'), '');

      if (this.coloringCharacterThreshold) {
        if (formattedText.length > this.coloringCharacterThreshold) {
          this.disableColoring = true;
        }
      }

      const tabConversion = '&nbsp;';
      let tabHTML = '';
      if (this.tabSize) {
        tabHTML = tabConversion.repeat(this.tabSize);
      }
      const lines = htmlSafeText.split('\n');
      let textValues: {
        content: string;
        paddingLeft: string;
        indent: number;
        collapsable: boolean;
        hidden: boolean;
      }[] = [];

      this.lineCount = lines.length;

      if (!this.disableColoring) {
        try {
          if (!this.language && !this.streaming) {
            const detection = hljs.highlightAuto(htmlSafeText);
            this.language = detection.language;
          }
        } catch (e) {
          this.language = 'plaintext';
        }
      }

      if (this.coloringLineThreshold) {
        if (lines.length > this.coloringLineThreshold) {
          this.disableColoring = true;
        }
      }

      const checkEmptylines = false;
      const highlightMode = !this.disableColoring;
      if (highlightMode) {
        /*if (this.renderLanguage) {
        console.log(this.renderLanguage);
        highlightedCode = hljs.highlight(htmlSafeText, {
          language: this.renderLanguage,
        }).value;
      } else {*/
        const highlightedCode = hljs.highlightAuto(htmlSafeText).value;
        //}
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = highlightedCode;
        const codeLines: string[] = [];
        let currentLine = '';
        for (let i = 0; i < tempDiv.childNodes.length; i++) {
          const node = tempDiv.childNodes[i];
          if (node.nodeType === Node.TEXT_NODE) {
            const lines = node.textContent?.split('\n');
            if (lines) {
              for (let k = 0; k < lines.length; k++) {
                if (k > 0) {
                  codeLines.push(currentLine);
                  currentLine = '';
                }
                if (lines[k]) {
                  currentLine += lines[k];
                } else if (k < lines.length - 1 && checkEmptylines) {
                  currentLine += '&nbsp;';
                }
              }
            }
          } else {
            const element = node as Element;
            currentLine += element.outerHTML;
          }
        }

        if (currentLine) {
          codeLines.push(currentLine);
        }
        textValues = codeLines.map((line) => ({
          content: line,
          paddingLeft: '0px',
          indent: 0,
          collapsable: false,
          hidden: false,
        }));
      } else {
        for (let i = 0; i < lines.length; i++) {
          textValues.push({
            content: lines[i],
            paddingLeft: '0px',
            indent: 0,
            collapsable: false,
            hidden: false,
          });
        }
      }

      //const openBlock = new RegExp(/(\{|\[|\()/);
      //const closeBlock = new RegExp(/(\}|\]|\))/);
      this.collapseAvailable = false;
      //if (this.enableBlockCollapse) {
      let indentLevel = 0;
      for (let m = 0; m < textValues.length; m++) {
        const lineCheck = textValues[m];
        let tabCount = 0;
        if (this.autoDetectBlocks) {
          tabCount = 0;
        } else {
          tabCount = (lineCheck.content.match(new RegExp('^\\t+')) || [''])[0]
            .length;
        }
        if (!lineCheck.content.trim()) {
          textValues[m].indent = indentLevel;
        } else {
          textValues[m].indent = tabCount;
        }

        textValues[m].content = lineCheck.content.replace(
          /\t/g,
          this.editable ? tabHTML : ''
        );
        if (m > 1) {
          textValues[m - 1].collapsable = indentLevel < tabCount;
        }
        if (lineCheck.content) {
          indentLevel = tabCount;
        }
        if (tabCount > 1) {
          this.collapseAvailable = this.enableBlockCollapse;
        }
      }
      //}
      this._renderedLines = textValues;
      const tickWidth = 13 * textValues.length.toString().length;
      this.style.setProperty(
        '--chat-code-tick-width',
        tickWidth.toString() + 'px'
      );
      this._tickWidth = tickWidth;
    }
    this.calculateEditingOffset();
    this._handleScroll();
  }

  /**
   * _preIndentCode - check for and remove all 2/4 spaces, tabs and add new lines then prepend tabs
   * @param {string} content - text to check
   */
  _preIndentCode(content) {
    let code = content;
    let lines = code.split(/\r?\n/);
    let minIndent = Infinity;
    let isIndented = false;
    for (const line of lines) {
      const indentCheck = line.match(new RegExp('^( +|\\t+)'));
      if (indentCheck) {
        const indent = indentCheck[0];
        isIndented = true;
        if (indent.includes('\t')) {
          minIndent = Math.min(minIndent, indent.length);
        } else {
          minIndent = Math.min(
            minIndent,
            indent.length / (indent.includes('.   ') ? 4 : 2)
          );
        }
      }
    }
    if (!isIndented) {
      if (/;\s*/.test(code)) {
        code = code.replace(new RegExp(';', 'g'), ';\n');
      }
      if (/{\s*/.test(code)) {
        code = code
          .replace(new RegExp('{', 'g'), '{\n')
          .replace(new RegExp('}', 'g'), '\n}');
      }
      if (/:\\s*/.test(code)) {
        code = code.replace(new RegExp(':', 'g'), ':\n');
      }
      lines = code.split(/\r?\n/);
    }
    const formattedString = lines
      .map((line) => {
        const trimmedLine = line.replace(new RegExp('^\\s+'), '');
        const indentSize =
          (line.match(new RegExp('^\\s*'))[0] || '').length / minIndent;
        return '\t'.repeat(Math.max(0, Math.floor(indentSize))) + trimmedLine;
      })
      .join('\n');
    const concatenatedString = formattedString
      .replace(new RegExp('\\n', 'g'), '\\n')
      .replace(new RegExp('\\t', 'g'), '\\t');
    return concatenatedString;
  }

  /**
   * _preIndentCode2 - check for and remove all 2/4 spaces, tabs and add new lines then prepend tabs
   * @param {string} code - text to check
   */
  _preIndentCode2(code) {
    /*if(!this.language){
      const detected = hljs.highlightAuto(code);
      this.language = detection.language || "generic"
    }*/
    const indentMode = this._detectIndents(code);
    //const lowerCaseLang = this.language.toLowerCase();

    let normalizedCode = code
      .replace(new RegExp('\\s*{\\s*', 'g'), ' {\n' + indentMode)
      .replace(new RegExp('\\s*}\\s*', 'g'), '\n}')
      .replace(new RegExp(';\\s*', 'g'), ';\n' + indentMode)
      .replace(new RegExp(':\\s*$', 'gm'), ':\n' + indentMode)
      .replace(
        new RegExp(
          '\\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|JOIN|ON|AS|LIMIT|OFFSET|INSERT INTO|VALUES|UPDATE|SET|DELETE)\\b',
          'gi'
        ),
        '\n$1 '
      )
      .replace(new RegExp('>\\s*<', 'g'), '>\n<')
      .replace(new RegExp('\\s*(<\\/?.+?>)', 'gi'), '\n$1')
      .replace(new RegExp('\\s{2,}', 'g'), ' ')
      .replace(new RegExp('\\n{2,}', 'g'), '\n')
      .replace(new RegExp('\\s*\\n\\s*', 'g'), '\n')
      .trim();
    if (!normalizedCode.includes('\n')) {
      normalizedCode = normalizedCode.replace(new RegExp(' ', 'g'), '\n');
    }

    return normalizedCode
      .replace(new RegExp('\\n', 'g'), '\n')
      .replace(new RegExp('\\t', 'g'), '\t');
  }

  /**
   * _detectIndents - check if code is pre-indented
   * @param {string} rawContent - text to check
   * @returns {string} - backslash t for tabs or quad spaces
   */
  _detectIndents(rawContent) {
    const tabCheck = rawContent.match(new RegExp('^\\t+', 'gm')) || [];
    const spaceCheck = rawContent.match(new RegExp('^ +', 'gm')) || [];
    return tabCheck.length > spaceCheck.length ? '\t' : '    ';
  }

  /**
   * _showDiffs - compare and merge two different code pieces
   * @param {string} oldCode - previous code string
   * @param {string} newCode - updated code string
   */
  _showDiffs(oldCode, newCode) {
    const oldLines = oldCode.split('\n');
    if (!newCode) {
      newCode = oldCode;
    }
    const newLines = newCode.split('\n');
    const diffDict = {};
    let result = '';

    const wordDetect = false;
    if (!wordDetect) {
      const maxLen = Math.max(oldLines.length, newLines.length);
      for (let i = 0; i < maxLen; i++) {
        if (oldLines[i] === newLines[i]) {
          result += oldLines[i] + '\n';
        } else {
          result += oldLines[i] + '\n' + newLines[i] + '\n';
          diffDict[i] = 'removed';
          i++;
          diffDict[i] = 'added';
        }
      }
    } else {
      const maxLen = Math.max(oldLines.length, newLines.length);
      for (let i = 0; i < maxLen; i++) {
        const oldWords = oldLines[i]?.split(/\s+/) || [];
        const newWords = newLines[i]?.split(/\s+/) || [];
        let lineRes = '';

        if (!oldLines[i]) {
          diffDict[i] = 'added';
          result += newLines[i] + '\n';
          continue;
        }
        if (!newLines[i]) {
          diffDict[i] = 'removed';
          result += oldLines[i] + '\n';
          continue;
        }

        let lineChanged = false;
        let oldIndex = 0;
        let newIndex = 0;

        while (oldIndex < oldWords.length || newIndex < newWords.length) {
          if (
            oldWords[oldIndex] === newWords[newIndex] &&
            oldIndex < oldWords.length &&
            newIndex < newWords.length
          ) {
            lineRes += oldWords[oldIndex] + ' ';
            oldIndex++;
            newIndex++;
          } else if (
            newIndex < newWords.length &&
            !oldWords.includes(newWords[newIndex])
          ) {
            lineRes += newWords[newIndex] + ' ';
            lineChanged = true;
            newIndex++;
          } else if (
            oldIndex < oldWords.length &&
            !newWords.includes(oldWords[oldIndex])
          ) {
            lineRes += oldWords[oldIndex] + ' ';
            lineChanged = true;
            oldIndex++;
          } else {
            lineRes += oldWords[oldIndex] + ' ' + newWords[newIndex] + ' ';
            lineChanged = true;
            oldIndex++;
            newIndex++;
          }
        }

        if (lineChanged) {
          //diffDict[i] = 'edited';
        }
        lineChanged = false;
        result += lineRes.trim() + '\n';
      }
    }
    return { comparedString: result, comparisonLineTypes: diffDict };
  }

  /**
   * _handleEditingEnabled - check when edit button is toggled
   * @param {event} _event - icon button click event
   */
  _handleEditingEnabled(_event) {
    this.editingEnabled = !this.editingEnabled;
    this.editable = this.editingEnabled;
  }

  /**
   * _handleEditingEnabled - check when comparison button is toggled
   * @param {event} _event - icon button click event
   */
  _handleComparisonEnabled(_event) {
    this.comparisonEnabled = !this.comparisonEnabled;
    if (this.comparisonEnabled) {
      this.contentDifferenceDetected = this.newContent !== this.content;

      if (this.contentDifferenceDetected) {
        const { comparedString, comparisonLineTypes } = this._showDiffs(
          this.content,
          this.newContent
        );
        this.disableColoring = true;
        this._comparisonReference = comparisonLineTypes;
        this._editedContent = comparedString;
      }
    } else {
      this.disableColoring = false;
      this._comparisonReference = {};
      this._editedContent = this._originalContent;
    }
  }

  /**
   * _addSmilesStyling - custom styling for SMILES molecular code
   * @param {object} _HLJSContext - internal HLJS object
   */
  _addSmilesStyling(_HLJSContext: any) {
    return {
      name: 'SMILES',
      aliases: ['smiles'],
      case_insensitive: false,
      contains: [
        {
          className: 'atom-bracket',
          begin: new RegExp('\\[([^\\]]+)\\]'),
          relevance: 10,
        },
        {
          className: 'atom-br',
          begin: new RegExp('\\bBr'),
          relevance: 8,
        },
        {
          className: 'atom-cl',
          begin: new RegExp('\\bCl'),
          relevance: 8,
        },
        {
          className: 'atom-c',
          begin: new RegExp('\\bC\\b'),
          relevance: 5,
        },
        {
          className: 'atom-n',
          begin: new RegExp('\\bN\\b'),
          relevance: 5,
        },
        {
          className: 'atom-o',
          begin: new RegExp('\\bO\\b'),
          relevance: 5,
        },
        {
          className: 'atom-s',
          begin: new RegExp('\\bS\\b'),
          relevance: 5,
        },
        {
          className: 'atom-p',
          begin: new RegExp('\\bP\\b'),
          relevance: 5,
        },
        {
          className: 'atom-f',
          begin: new RegExp('\\bF\\b'),
          relevance: 5,
        },
        {
          className: 'atom-i',
          begin: new RegExp('\\bI\\b'),
          relevance: 5,
        },
        {
          className: 'atom-b',
          begin: new RegExp('\\bB\\b'),
          relevance: 5,
        },
        {
          className: 'atom-h',
          begin: new RegExp('\\bH\\b'),
          relevance: 5,
        },
        {
          className: 'atom-aromatic-c',
          begin: new RegExp('\\bc\\\b'),
          relevance: 2,
        },
        {
          className: 'atom-aromatic-n',
          begin: new RegExp('\\bn\\b'),
          relevance: 2,
        },
        {
          className: 'atom-aromatic-o',
          begin: new RegExp('\\bo\\b'),
          relevance: 2,
        },
        {
          className: 'atom-aromatic-s',
          begin: new RegExp('\\bs\\b'),
          relevance: 2,
        },
        {
          className: 'atom-aromatic-p',
          begin: new RegExp('\\bp\\b'),
          relevance: 2,
        },
        {
          className: 'bond',
          begin: new RegExp('(-|=|#|:|\\\\|\\/)'),
          relevance: 1,
        },
        {
          className: 'ring',
          begin: new RegExp('\\b[1-9][0-9]?\\b'),
          relevance: 1,
        },

        { className: 'branch', begin: new RegExp('[()]'), relevance: 0 },
      ],
    };
  }

  /**
   * _renderLabel - render default or custom label
   * @param {string} key - target
   */
  _renderLabel = (key) => {
    let customValue;
    const labels = this.customLabels || {};
    if (labels) {
      switch (key) {
        case 'code-copypaste-button':
          customValue = labels[key] || 'Copy code';
          break;
        case 'code-copypaste-success':
          customValue = labels[key] || 'Copied!';
          break;
        case 'code-estimated-warning':
          customValue = labels[key] || '(estimated)';
          break;
        case 'code-editing-validation':
          customValue = labels[key] || 'Save edits';
          break;
        case 'code-editing-cancelled':
          customValue = labels[key] || 'Revert edits';
          break;
        case 'code-line-descriptor':
          customValue = labels[key] || 'lines';
          break;
        case 'code-enable-editing':
          customValue = labels[key] || 'Enable editing';
          break;
        case 'code-disable-editing':
          customValue = labels[key] || 'Disable editing';
          break;
      }
    }
    return customValue || key;
  };
}
