/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
// @ts-ignore
import styles from './header.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class header extends LitElement {
  static styles = styles;

  /**
   * disable header hamburger menu
   */
  @property({ type: Boolean, attribute: 'disable-header-menu' })
  disableMenu;

  /**
   * provided title string to display in header
   */
  @property({ type: String, attribute: 'title' })
  title;

  /**
   * state value denoting fullscreen mode, changed by button selection
   */
  @state()
  enableFullscreen = false;

  /**
   * fullscreen event when popup button is clicked
   * @param {event} event - click event when fullscreening chat
   */
  _handlePopup(event) {
    console.log(event);
    this.enableFullscreen = true;
    const fullscreenEvent = new CustomEvent('on-chat-fullscreen-change', {
      detail: { fullscreen: true },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(fullscreenEvent);
  }

  /**
   * undo fullscreen mode when minimize is clicked
   * @param {event} event - click event when minimizing chat
   */
  _handleSubtract(event) {
    console.log(event);
    this.enableFullscreen = false;
    const minimizeEvent = new CustomEvent('on-chat-fullscreen-change', {
      detail: { fullscreen: false },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(minimizeEvent);
  }

  /**
   * menu toggling event when meny button is selected
   * @param {event} event - click event when toggling menu
   */
  _handleMenuToggle(event) {
    console.log(event);
  }
}
