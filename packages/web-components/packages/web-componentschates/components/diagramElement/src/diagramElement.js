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
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
const {
  stablePrefix: clabsPrefix
} = settings;
import mermaid from 'mermaid';
// @ts-ignore
// @ts-ignore
import styles from "./diagramElement.css.js";
/**
 * Input component using search typeahead api
 */ /**
     * Input component using search typeahead api
     */
class diagramElement extends LitElement {
  constructor() {
    super(...arguments);
    /**
     * is the component hovered upon
     */
    this.isHovered = false;
    /**
     * renderSuccessful - flag when a render operation has succeeded to begin post-hoc editing
     */
    this.renderSuccessful = false;
    /**
     * loading - initial state to show loading icon until error or successful render occurs
     */
    this.loading = true;
  }
  /** detect when component is rendered to process visualization specification object
   */
  firstUpdated() {
    this.generateUniqueId();
    this._getTheme();
    const options = this._buildOptions();
    this._diagramRenderer = mermaid.initialize(options);
    if (this.width) {
      this.style.setProperty('--chat-diagram-width', this.width + 'px');
    }
    if (this.height) {
      this.style.setProperty('--chat-diagram-height', this.height + 'px');
    }
    this.mutationObserver = new MutationObserver(() => {
      this._getTheme();
    });
    this.mutationObserver.observe(this.parentElement, {
      childList: false
    });
  }
  /** _buildOptions
   * @param {String} mode - fullscreen, test or default
   */
  _buildOptions() {
    const whiteTheme = {
      primaryColor: '#a6c8ff',
      primaryBorderColor: '#0f62fe',
      primaryTextColor: '#161616',
      secondaryColor: '#f4f4f4',
      secondaryBorderColor: '#e0e0e0',
      secondaryTextColor: '#525252',
      edgeColor: '#8d8d8d',
      edgeTextColor: '#525252',
      background: '#ffffff',
      nodeBackgroundColor: '#ffffff',
      nodeBorderColor: '#e0e0e0',
      nodeTextColor: '#161616',
      fontFamily: "'IBM Plex Sans', sans-serif",
      fontSize: '16px',
      textColor: '#161616',
      noteBkgColor: '#be95ff',
      noteBorderColor: '#e0e0e0',
      noteTextColor: '#161616'
    };
    const g100Theme = {
      primaryColor: '#4589ff',
      primaryBorderColor: '#0f62fe',
      primaryTextColor: '#f4f4f4',
      secondaryColor: '#262626',
      secondaryBorderColor: '#6f6f6f',
      secondaryTextColor: '#c6c6c6',
      edgeColor: '#a8a8a8',
      edgeTextColor: '#c6c6c6',
      background: '#161616',
      nodeBackgroundColor: '#161616',
      nodeBorderColor: '#6f6f6f',
      nodeTextColor: '#f4f4f4',
      fontFamily: "'IBM Plex Sans', sans-serif",
      fontSize: '16px',
      textColor: '#f4f4f4',
      noteBkgColor: '#8a3ffc',
      noteBorderColor: '#6f6f6f',
      noteTextColor: '#f4f4f4'
    };
    const currentTheme = this.theme == 'light' ? whiteTheme : g100Theme;
    const mainTheme = 'base';
    return {
      startOnLoad: false,
      theme: mainTheme,
      themeVariables: currentTheme,
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true
      },
      sequenceDiagram: {
        useMaxWidth: true,
        htmlLabels: true
      }
    };
  }
  /**
   * generateUniqueId - create random string to give the target visualization div
   */
  generateUniqueId() {
    const randomString = Math.random().toString(36).substr(2, 9);
    this._uniqueID = randomString;
  }
  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  async updated(changedProperties) {
    if (changedProperties.has('_uniqueID')) {
      await this._prepareDiagram();
    }
    if (changedProperties.has('theme')) {
      await this._prepareDiagram();
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
      this.theme = darkMode ? 'dark' : 'light';
    }
  }
  /**
   * _scrollStreamArea - scroll div to display latest token added
   */
  _scrollStreamArea() {
    var _a;
    const textArea = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('.clabs--chat-diagram-stream-text-content');
    if (textArea instanceof HTMLElement) {
      textArea.scrollLeft = textArea.scrollWidth;
    }
  }
  /**
   * _openFullscreenView -
   */
  _openFullscreenView() {
    this.fullscreenMode = true;
    window.setTimeout(() => {
      this._prepareDiagram();
    }, 200);
  }
  /**
   * _openFullscreenView -
   */
  _closeFullscreenView() {
    this.fullscreenMode = false;
    //this._preparediagram("default");
  }
  /**
   * _handleMouseOut - see if component lost mouse content
   */
  _handleMouseOut() {
    this.isHovered = false;
  }
  /**
   * _handleMouseOut - see if component lost mouse content
   */
  _handleMouseOver() {
    this.isHovered = true;
  }
  /**
   * Prepare diagram object for rendering from content string
   * @param {String} mode - which mode to render with smilesDrawer
   */
  async _prepareDiagram() {
    var _a;
    const diagramDef = this.definition.replace(/```/g, '');
    //const preID = clabsPrefix + '--chat-diagram-previz-id-' + this._uniqueID;
    const targetID = clabsPrefix + '--chat-diagram-container-id-' + this._uniqueID;
    const target = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.getElementById(targetID);
    //const preTarget = this.shadowRoot?.getElementById(preID);
    if (target instanceof HTMLElement) {
      try {
        //const type = mermaid.detectType(diagramDef);
        //await this._renderDiagram(type,diagramDef,targetID,target);
        const {
          svg
        } = await mermaid.render(targetID, diagramDef);
        this.renderedSVG = svg;
        //target.innerHTML = svg;
        //mermaid.run({nodes:[preTarget]})
      } catch (error) {
        console.log('type fail');
        console.error(error);
      }
    }
  }
}
diagramElement.styles = styles;
export default diagramElement;
__decorate([property({
  type: String,
  attribute: 'definition'
})], diagramElement.prototype, "definition", void 0);
__decorate([property({
  type: String,
  attribute: 'title'
})], diagramElement.prototype, "title", void 0);
__decorate([property({
  type: Number,
  attribute: 'width'
})], diagramElement.prototype, "width", void 0);
__decorate([property({
  type: Number,
  attribute: 'height'
})], diagramElement.prototype, "height", void 0);
__decorate([property({
  type: String,
  attribute: 'theme'
})], diagramElement.prototype, "theme", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'streaming'
})], diagramElement.prototype, "streaming", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'thumbnail-mode'
})], diagramElement.prototype, "thumbNailMode", void 0);
__decorate([state()], diagramElement.prototype, "isHovered", void 0);
__decorate([state()], diagramElement.prototype, "_uniqueID", void 0);
__decorate([state()], diagramElement.prototype, "renderSuccessful", void 0);
__decorate([state()], diagramElement.prototype, "loading", void 0);
__decorate([state()], diagramElement.prototype, "renderedSVG", void 0);
__decorate([state()], diagramElement.prototype, "_diagramRenderer", void 0);
__decorate([state()], diagramElement.prototype, "fullscreenMode", void 0);
//# sourceMappingURL=diagramElement.js.map
