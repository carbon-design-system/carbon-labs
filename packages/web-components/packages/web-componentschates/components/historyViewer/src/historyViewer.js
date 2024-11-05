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
import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
const {
  stablePrefix: clabsPrefix
} = settings;
// @ts-ignore
// @ts-ignore
import styles from "./historyViewer.css.js";
/**
 * Input component using search typeahead api
 */ /**
     * Input component using search typeahead api
     */
class historyViewer extends LitElement {
  constructor() {
    super(...arguments);
    this.debug = false;
    /** _renderMessageTree - render tree as selectable viewer
     * @param {number} id - msg id
     * @param {number} depth - tree leaf depth
     */
    this._renderMessageTree = (id, depth = 0) => {
      const currentMessage = this.historyTree.find(message => message.id === id);
      const children = currentMessage.children || [];
      return html`
      <div
        class="${clabsPrefix + '--chat-history-viewer-block'}"
        style="margin-left: ${depth * 40}px;">
        <div
          class="${clabsPrefix + '--chat-history-viewer-block-content-' + (currentMessage.userSubmitted ? 'user' : 'bot')}">
          ${currentMessage.userSubmitted ? 'user' : 'bot'}:
          ${currentMessage.content}
        </div>
        ${children.map(child => this._renderMessageTree(child, depth + 1))}
      </div>
    `;
    };
  }
  /** detect when component is rendered to process visualization specification object
   */
  firstUpdated() {
    if (this.historyTree !== null) {
      console.log(this.historyTree);
      //this._prepareHistoryViewer();
    }
  }
  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  async updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('historyTree')) {
      await this._renderHistoryViewer();
    }
  }
  /**
   * Prepare table object for rendering from content string
   */
  _prepareHistoryViewer() {
    this.rootMessages = this.historyTree.filter(message => message.parentId === null);
  }
  /**
   * Prepare table object for rendering from content string
   */
  async _renderHistoryViewer() {
    /*const targetDiv = this.shadowRoot?.querySelector(
      '.' + clabsPrefix + '--chat-history-viewer-container'
    );*/
    const columns = {};
    const branchTaken = {};
    const branchingIndices = {};
    for (const msg of this.historyTree) {
      if (!columns[msg.branchId]) {
        columns[msg.branchId] = {};
      }
      if (!branchingIndices[msg.parentId]) {
        branchingIndices[msg.parentId] = 1;
      }
      if (!branchTaken[msg.branchId]) {
        branchingIndices[msg.parentId]++;
        branchTaken[msg.branchId] = msg.branchId;
      }
      columns[msg.branchId][msg.parentId === null ? -1 : msg.parentId] = msg;
    }
    const branches = Object.keys(columns).sort((a, b) => parseInt(a) - parseInt(b));
    const allParents = new Set();
    branches.forEach(branchId => {
      Object.keys(columns[branchId]).forEach(parentId => {
        allParents.add(parentId);
      });
    });
    const sortedParents = Array.from(allParents);
    /*.sort((a, b) => {
      return parseInt(a) - parseInt(b);
    });*/
    this.style.setProperty('--chat-history-viewer-branch-percentage', 100 / branches.length + '%');
    console.log(100 / branches.length + '%');
    this.branchingIndices = branchingIndices;
    this.sortedParents = sortedParents;
    this.columns = columns;
    this.branches = branches;
  }
}
historyViewer.styles = styles;
export default historyViewer;
__decorate([property({
  type: Object,
  attribute: 'historyTree',
  reflect: true
})], historyViewer.prototype, "historyTree", void 0);
__decorate([state()], historyViewer.prototype, "rootMessages", void 0);
__decorate([state()], historyViewer.prototype, "sortedParents", void 0);
__decorate([state()], historyViewer.prototype, "columns", void 0);
__decorate([state()], historyViewer.prototype, "branches", void 0);
__decorate([state()], historyViewer.prototype, "branchingIndices", void 0);
__decorate([state()], historyViewer.prototype, "debug", void 0);
//# sourceMappingURL=historyViewer.js.map
