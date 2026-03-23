/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities';
const { stablePrefix: clabsPrefix } = settings;

// @ts-ignore
import styles from './historyViewer.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class historyViewer extends LitElement {
  static styles = styles;
  /**
   * Array of subelements parsed from API reply
   */
  @property({ type: Object, attribute: 'historyTree', reflect: true })
  historyTree;

  @state()
  rootMessages;

  @state()
  sortedParents;

  @state()
  columns;

  @state()
  branches;

  @state()
  branchingIndices;

  @state()
  debug = false;

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
    this.rootMessages = this.historyTree.filter(
      (message) => message.parentId === null
    );
  }

  /** _renderMessageTree - render tree as selectable viewer
   * @param {number} id - msg id
   * @param {number} depth - tree leaf depth
   */
  _renderMessageTree = (id, depth = 0) => {
    const currentMessage = this.historyTree.find(
      (message) => message.id === id
    );
    const children = currentMessage.children || [];
    return html`
      <div
        class="${clabsPrefix + '--chat-history-viewer-block'} ${clabsPrefix +
        '--chat-history-viewer-block-depth-' +
        depth}">
        <div
          class="${clabsPrefix +
          '--chat-history-viewer-block-content-' +
          (currentMessage.userSubmitted ? 'user' : 'bot')}">
          ${currentMessage.userSubmitted ? 'user' : 'bot'}:
          ${currentMessage.content}
        </div>
        ${children.map((child) => this._renderMessageTree(child, depth + 1))}
      </div>
    `;
  };

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

    const branches = Object.keys(columns).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );
    const allParents = new Set();
    branches.forEach((branchId) => {
      Object.keys(columns[branchId]).forEach((parentId) => {
        allParents.add(parentId);
      });
    });
    const sortedParents = Array.from(allParents);
    /*.sort((a, b) => {
      return parseInt(a) - parseInt(b);
    });*/
    this.style.setProperty(
      '--chat-history-viewer-branch-percentage',
      100 / branches.length + '%'
    );
    this.branchingIndices = branchingIndices;
    this.sortedParents = sortedParents;
    this.columns = columns;
    this.branches = branches;
  }
}
