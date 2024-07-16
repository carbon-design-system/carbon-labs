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
   * disable header minimize button
   */
  @property({ type: Boolean, attribute: 'disable-header-minimize' })
  disableMinimize;

  /**
   * disable header minimize button
   */
  @property({ type: Boolean, attribute: 'disable-header-fullscreen' })
  disableFullscreen;

  /**
   * disable header close button
   */
  @property({ type: Boolean, attribute: 'disable-header-close' })
  disableClose;

  /**
   * header menu item list
   */
  @property({ type: Object, attribute: 'menuItems' })
  menuItems;

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
   * state value denoting docking mode, changed by button selection
   */
  @state()
  enableDocking = false;

  /**
   * disable header hamburger menu
   */
  @property({ type: Boolean, attribute: 'disable-header-buttons' })
  disableHeaderButtons;

  /**
   * menuOpened - boolean to see if menu is opened
   */
  @state()
  menuOpened = false;

  /**
   * docking event when popup button is clicked
   * @param {event} event - click event when docking chat
   */
  _handlePopup(event) {
    this.enableDocking = true;
    this.enableFullscreen = false;
    const dockingEvent = new CustomEvent('on-chat-docking-change', {
      detail: { docking: true, originalEvent: event },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(dockingEvent);
  }

  /**
   * menu item selection event
   * @param {event} event - click event when item is chosen
   */
  handleMenuItemSelected(event) {
    this.menuOpened = false;
    const index = event.detail - 1;
    if (this.menuItems[index]) {
      const menuSelectionEvent = new CustomEvent(
        'on-header-menu-item-selected',
        {
          detail: {
            index: index,
            menuItem: this.menuItems[index],
            originalEvent: event,
          },
          bubbles: true,
          composed: true,
        }
      );
      this.dispatchEvent(menuSelectionEvent);
    }
  }

  /**
   * hide menu on button blur
   */
  hideMenu() {
    this.menuOpened = false;
  }

  /**
   * undo docking mode when minimize is clicked
   * @param {event} event - click event when minimizing chat
   */
  _handleSubtract(event) {
    this.enableDocking = false;
    this.enableFullscreen = false;
    const minimizeEvent = new CustomEvent('on-chat-docking-change', {
      detail: { docking: false, originalEvent: event },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(minimizeEvent);
  }

  /**
   * fullscreen event when popup button is clicked
   * @param {event} event - click event when fullscreening chat
   */
  _handleMaximize(event) {
    this.enableFullscreen = true;
    this.enableDocking = false;
    const fullscreenEvent = new CustomEvent('on-chat-fullscreen-change', {
      detail: { fullscreen: true, originalEvent: event },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(fullscreenEvent);
  }

  /**
   * closing event when popup button is clicked
   * @param {event} event - click event when fullscreening chat
   */
  _handleClosed(event) {
    const closeEvent = new CustomEvent('on-chat-closed', {
      detail: { action: 'chat was closed', originalEvent: event },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(closeEvent);
  }

  /**
   * undo fullscreen mode when minimize is clicked
   * @param {event} event - click event when minimizing chat
   */
  _handleMinimize(event) {
    this.enableFullscreen = false;
    this.enableDocking = false;
    const minimizeEvent = new CustomEvent('on-chat-fullscreen-change', {
      detail: { fullscreen: false, originalEvent: event },
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
    event.preventDefault();
    this.menuOpened = !this.menuOpened;
  }
}
