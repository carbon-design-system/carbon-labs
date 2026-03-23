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
import { settings } from '@carbon-labs/utilities';
const { stablePrefix: clabsPrefix } = settings;

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
   * disable header close button
   */
  @property({ type: Boolean, attribute: 'docking-enabled' })
  dockingEnabled;

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
   * html slug content to render
   */
  @property({ type: String, attribute: 'header-slug-content' })
  headerSlugContent;

  /**
   * custom labels injected from parent
   */
  @property({ type: Object, attribute: 'customLabels' })
  customLabels;

  /**
   * menuOpened - boolean to see if menu is opened
   */
  @state()
  menuOpened = false;

  /**
   * mouseHeldDown - check if mouse is down
   */
  @state()
  mouseHeldDown = false;

  /**
   * dragStart - check if drag is starting
   */
  @state()
  dragStart = false;

  /**
   * dragTimeout - drag event to make sure double clicks don't trigger drag
   */
  @state()
  dragTimeout;

  /**
   * useOverflowMenu - use carbon overflow
   */
  @state()
  useOverflowMenu = true;

  /**
   * menuContainerTarget
   */
  @state()
  menuContainerTarget;

  /**
   * count steps to accelerate movement
   */
  @state()
  dragAcceleration = 0;

  /**
   * track current direction
   */
  @state()
  dragDirection;

  /**
   * current Menu Item
   */
  @state()
  currentMenuItem = 0;

  /**
   * drag state
   */
  @state()
  _isDragging = false;

  /**
   * slug object dict
   */
  @property({ type: Object, attribute: 'headerSlugObject' })
  headerSlugObject;

  @state()
  slugOpened = false;

  @state()
  _useSlug = true;

  @state()
  _useAiLabel = false;

  /**
   * show slug on button click
   * @param {event} _event - click event when docking chat
   */
  _handleSlugClick(_event) {
    this.slugOpened = true;
  }

  /**
   * hide slug
   * @param {event} _event - click event when docking chat
   */
  _hideAISlug(_event) {
    this.slugOpened = false;
  }

  /**
   * docking event when popup button is clicked
   * @param {event} event - click event when docking chat
   */
  _handlePopup(event) {
    event.stopPropagation();
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
   * initial click event to check if dragging is initiated
   * @param {event} event - click event when chat is clicked
   */
  _handleHeaderMouseDown(event) {
    this.mouseHeldDown = true;
    if (this.mouseHeldDown) {
      this.dragTimeout = window.setTimeout(() => {
        if (this.mouseHeldDown) {
          this.initiateDragging(event);
        }
      }, 200);
    }
  }

  /**
   * LIT firstUpdated cycle to define initial parameters on first render
   */
  firstUpdated() {
    this.menuContainerTarget = this.shadowRoot?.querySelector(
      '#' + clabsPrefix + '--chat-header-container-target'
    );
  }

  /**
   * docking event when mouseup event happens to undo drag mode
   */
  _handleHeaderMouseUp() {
    this.mouseHeldDown = false;
    clearTimeout(this.dragTimeout);
    this.dragTimeout = null;
    this._isDragging = false;
    this.dragAcceleration = 0;

    const dragArea = this.shadowRoot?.querySelector(
      '.' + clabsPrefix + '--chat-header-drag-area'
    );
    if (dragArea instanceof HTMLElement) {
      dragArea.blur();
    }
    const dragEvent = new CustomEvent('on-header-drag-cancel', {
      detail: {
        action: 'user canceled drag event',
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(dragEvent);
  }

  /**
   * focusMenu - focus on menu item
   * @param {event} event - transfer event
   */
  _focusMenu(event) {
    /*const overflowMenu = this.shadowRoot?.querySelector('#'+clabsPrefix+'--chat-header-overflow-menu-unique');
    console.log(overflowMenu)
    if(overflowMenu instanceof HTMLElement){
      const subelem = overflowMenu.shadowRoot?.querySelector('#button');
      console.log(subelem)
        if (subelem instanceof HTMLElement) {
          subelem.focus();
        }
    }*/
    const lastKeyEvent = new CustomEvent('on-footer-escape', {
      detail: {
        action: 'FOOTER: user tabbed beyond chat',
        originalEvent: event,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(lastKeyEvent);
  }

  /** _handleDragAreaKeyup - move chat when arrow keys detected
   */
  _handleDragAreaKeyup() {
    this.dragAcceleration = 0;
  }

  /** handle user tab inputs, check if escapes chat
   * @param {event} event - lit event sent by the keyboard input
   **/
  _checkKeyboardEscape(event) {
    if (event.key === 'Tab' && event.shiftKey && this.enableFullscreen) {
      event.preventDefault();
      const lastKeyEvent = new CustomEvent('on-header-escape', {
        detail: {
          action: 'HEADER: user tabbed beyond chat',
          originalEvent: event,
        },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(lastKeyEvent);
    }
    if (event.key === 'Enter' || event.key === ' ') {
      this.currentMenuItem = 0;
    }
  }

  /** handle user tab inputs, check if escapes chat
   * @param {event} event - lit event sent by the keyboard input
   **/
  _checkKeyboardMenu(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      this._handleMenuItemSelected(event);
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      if (event.key === 'ArrowUp') {
        this.currentMenuItem--;
      }
      if (event.key === 'ArrowDown') {
        this.currentMenuItem++;
      }

      if (this.currentMenuItem >= this.menuItems.length) {
        this.currentMenuItem = 0;
      }
      if (this.currentMenuItem < 0) {
        this.currentMenuItem = this.menuItems.length - 1;
      }

      const targetItem =
        '.' +
        clabsPrefix +
        '--chat-header-overflow-menu-item-' +
        this.currentMenuItem;
      const menuItem = this.shadowRoot?.querySelector(targetItem);
      if (menuItem instanceof HTMLElement) {
        menuItem.focus();
      }
    }
  }

  /** _handleDragAreaKeydown - move chat when arrow keys detected
   * @param {event} event - key event
   */
  _handleDragAreaKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (this._isDragging) {
        this._handleHeaderMouseUp();
      } else {
        this.dragAcceleration = 0;
        this._handleHeaderMouseDown(event);
        this.initiateDragging(event);
      }
    }
    if (event.key === 'Escape' || event.key === 'Tab') {
      this._isDragging = false;
      if (event.key === 'Escape') {
        event.preventDefault();
      }
      if (event.key === 'Tab' && event.shiftKey) {
        event.preventDefault();
        this._focusMenu(event);
      }
      this._handleHeaderMouseUp();
    }
    if (
      event.key === 'ArrowUp' ||
      event.key === 'ArrowDown' ||
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight'
    ) {
      event.preventDefault();
      this._keyboardDragging(event.key);
    }
  }

  /**
   * handle when enter/tab is on overflow menu
   * @param {event} event - key event on menu items
   */
  _handleMenuKeyboardToggle(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      this._handleMenuItemSelected(event);
    }
  }

  /**
   * mousemove event to trigger drag is click is held
   * @param {event} event - mousemove on empty parts of header
   */
  _handleHeaderMouseMove(event) {
    if (this.mouseHeldDown) {
      this.initiateDragging(event);
    }
  }

  /**
   * drag trigger event if click held or click+mousemove happened
   * @param {event} event - click event when docking chat
   */
  initiateDragging(event) {
    const mouseX = event.clientX - this.getBoundingClientRect().left;
    const mouseY = event.clientY - this.getBoundingClientRect().top;
    this.dragAcceleration = 0;
    this.mouseHeldDown = false;
    this._isDragging = true;
    const dragEvent = new CustomEvent('on-header-drag-initiated', {
      detail: {
        action: 'user initiated drag event',
        offset: { x: mouseX, y: mouseY },
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(dragEvent);
  }

  /**
   * drag trigger event if arrow keys used
   * @param {string} keyCode - key event value when docking chat
   */
  _keyboardDragging(keyCode) {
    this._isDragging = true;
    if (this.dragDirection !== keyCode) {
      this.dragAcceleration = 0;
      this.dragDirection = keyCode;
    }
    this.dragAcceleration += 1;
    let mouseX = 0;
    let mouseY = 0;
    const dragStep = 6 + 4 * this.dragAcceleration;

    switch (keyCode) {
      case 'ArrowUp':
        mouseY = dragStep;
        break;
      case 'ArrowDown':
        mouseY = -dragStep;
        break;
      case 'ArrowLeft':
        mouseX = dragStep;
        break;
      case 'ArrowRight':
        mouseX = -dragStep;
        break;
    }

    const dragEvent = new CustomEvent('on-header-drag-keyboard-initiated', {
      detail: {
        action: 'user initiated drag event',
        offset: { x: mouseX, y: mouseY },
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(dragEvent);
  }

  /**
   * menu item selection event
   * @param {event} event - click event when item is chosen
   */
  _handleMenuItemSelected(event) {
    const targetElement = event?.target;
    const index = targetElement?.getAttribute('data-menuindex');
    if (index) {
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
  }

  /**
   * hide menu on button blur
   * @param {event} event - hide menu on open state
   */
  hideMenu(event) {
    event.preventDefault();
    this.menuOpened = false;
  }

  /**
   * undo docking mode when minimize is clicked
   * @param {event} event - click event when minimizing chat
   */
  _handleSubtract(event) {
    event.stopPropagation();
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
    event.stopPropagation();
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
    event.stopPropagation();
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
    event.stopPropagation();
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
   * menu toggling event when menu button is selected
   * @param {event} event - click event when toggling menu
   */
  _handleMenuToggle(event) {
    this.menuOpened = !this.menuOpened;
    event.preventDefault();
  }

  /**
   * menu toggling event when menu button is selected
   * @param {event} _event - click event when toggling menu
   */
  _handleMenuClosed(_event) {
    this.menuOpened = false;
  }

  /**
   * menu toggling event when menu button is selected
   * @param {event} _event - click event when toggling menu
   */
  _handleMenuOpened(_event) {
    this.menuOpened = true;
  }

  /**
   * _renderLabel - render default or custom label
   * @param {string} key - dictionary key for label
   */
  _renderLabel = (key) => {
    let customValue;
    const labels = this.customLabels || {};
    if (labels) {
      switch (key) {
        case 'header-close-chat':
          customValue = labels[key] || 'Close';
          break;
        case 'header-enable-fullscreen':
          customValue = labels[key] || 'Fullscreen';
          break;
        case 'header-disable-fullscreen':
          customValue = labels[key] || 'Exit fullscreen';
          break;
        case 'header-popout-chat':
          customValue = labels[key] || 'Pop out chat';
          break;
        case 'header-expand-chat':
          customValue = labels[key] || 'Expand chat';
          break;
        case 'header-move-chat':
          customValue = labels[key] || 'Move chat';
          break;
        case 'header-move-chat-done':
          customValue = labels[key] || 'Set chat';
          break;
        case 'header-open-menu':
          customValue = labels[key] || 'Open';
          break;
        case 'header-close-menu':
          customValue = labels[key] || 'Close';
          break;
        case 'header-open-slug':
          customValue = labels[key] || 'Open';
          break;
        case 'header-close-slug':
          customValue = labels[key] || 'Close';
          break;
        case 'header-move-start-button':
          customValue = labels[key] || 'Move chat';
          break;
        case 'header-move-end-button':
          customValue = labels[key] || 'Release';
          break;
      }
    }
    return customValue || key;
  };
}
