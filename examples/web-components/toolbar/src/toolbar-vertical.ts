/**
 * @license
 *
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, html } from 'lit';
import { property, customElement, query } from 'lit/decorators.js';
// Carbon components
import '@carbon/web-components/es/components/stack/index.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import '@carbon/web-components/es/components/dropdown/index.js';
import '@carbon/web-components/es/components/overflow-menu/index.js';
// Carbon icons
import ZoomIn from '@carbon/web-components/es/icons/zoom--in/16.js';
import ZoomOut from '@carbon/web-components/es/icons/zoom--out/16.js';
import RulerAlt from '@carbon/web-components/es/icons/ruler--alt/16.js';
import Pin from '@carbon/web-components/es/icons/pin/16.js';
import ColorPalette from '@carbon/web-components/es/icons/color-palette/16.js';
import Draggable from '@carbon/web-components/es/icons/draggable/16.js';
import TextCreation from '@carbon/web-components/es/icons/text--creation/16.js';
import OpenPanelLeft from '@carbon/web-components/es/icons/open-panel--left/16.js';
import OpenPanelRight from '@carbon/web-components/es/icons/open-panel--right/16.js';
import Move from '@carbon/web-components/es/icons/move/16.js';
import Rotate from '@carbon/web-components/es/icons/rotate/16.js';

import styles from './toolbar.scss?lit';

/**
 * ToolbarVertical pattern example.
 *
 * @element clabs-toolbar-vertical
 *
 */
@customElement('clabs-toolbar-vertical')
class ToolbarVertical extends LitElement {
  @property({ type: String, reflect: true }) orientation = 'horizontal';
  @query('cds-stack.toolbar') toolbarEl!: HTMLElement;

  /**
   * Lifecycle callback that is called after the element's DOM has been updated the first time.
   */
  async firstUpdated() {
    this.setAttribute('role', 'toolbar');
    this.addEventListener('keydown', this._handleKeydown);
    this._initializeFocusableElements();

    await this.updateComplete;
    // Remove dropdown border
    const dropdown = this.renderRoot.querySelector('cds-dropdown');
    const listBox = dropdown?.shadowRoot?.querySelector('.cds--list-box');
    if (listBox) {
      (listBox as HTMLElement).style.border = 'none';
    }
  }

  /**
   * Lifecycle callback that is called when the element is disconnected from the document's DOM.
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._handleKeydown);
  }

  /**
   * Initializes the focusable elements in the toolbar and sets their tabindex.
   */
  private _initializeFocusableElements() {
    const focusables = this._getFocusableElements();
    focusables.forEach((el, i) =>
      el.setAttribute('tabindex', i === 0 ? '0' : '-1')
    );
  }

  /**
   * Handles keyboard navigation for toolbar focus management.
   * @param {KeyboardEvent} event The keyboard event.
   */
  private _handleKeydown(event: KeyboardEvent) {
    const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'];
    if (!keys.includes(event.key)) {
      return;
    }

    const elements = this._getFocusableElements();

    const current = elements.findIndex(
      (btn) => btn.getAttribute('tabindex') === '0'
    );

    if (current === -1) {
      return;
    }

    event.preventDefault();
    const horizontal = this.orientation === 'horizontal';

    let next = current;
    if (event.key === 'ArrowRight' && horizontal) {
      next = (current + 1) % elements.length;
    }
    if (event.key === 'ArrowLeft' && horizontal) {
      next = (current - 1 + elements.length) % elements.length;
    }
    if (event.key === 'ArrowDown' && !horizontal) {
      next = (current + 1) % elements.length;
    }
    if (event.key === 'ArrowUp' && !horizontal) {
      next = (current - 1 + elements.length) % elements.length;
    }

    this._updateTabIndexes(elements, next);
    elements[next].focus();
  }

  /**
   *
   * @param {HTMLElement[]} elements - The list of focusable elements in the toolbar.
   * @param {number} activeIndex - The index of the element to set as active (tabindex=0).
   */
  private _updateTabIndexes(elements: HTMLElement[], activeIndex: number) {
    elements.forEach((el, i) =>
      el.setAttribute('tabindex', i === activeIndex ? '0' : '-1')
    );
  }

  /**
   * Gets all focusable elements within the toolbar.
   * @returns {HTMLElement[]} An array of focusable elements.
   */
  private _getFocusableElements(): HTMLElement[] {
    return Array.from(
      this.renderRoot.querySelectorAll<HTMLElement>(
        'cds-icon-button, cds-dropdown, cds-overflow-menu'
      )
    );
  }

  /**
   * Renders the toolbar template.
   */
  render() {
    return html`
      <cds-stack class="toolbar" orientation=${this.orientation}>
        <cds-stack class="toolbar-group" orientation=${this.orientation}>
          <cds-icon-button
          kind="ghost"
          enter-delay-ms="100"
            leave-delay-ms="100"
            align=${this.orientation === 'vertical' ? 'right' : 'top'}>
            ${Draggable({ slot: 'icon' })}
            <span slot="tooltip-content">Drag</span>
          </cds-icon-button>
        </cds-stack class="toolbar-group">
        <cds-stack class="toolbar-group" orientation=${this.orientation}>
          <cds-icon-button
          kind="ghost"
          enter-delay-ms="100"
            leave-delay-ms="100"
            align=${this.orientation === 'vertical' ? 'right' : 'top'}>
            ${RulerAlt({ slot: 'icon' })}
            <span slot="tooltip-content">Ruler</span>
          </cds-icon-button>
          <cds-icon-button
          kind="ghost"
          enter-delay-ms="100"
            leave-delay-ms="100"
            align=${this.orientation === 'vertical' ? 'right' : 'top'}>
            ${Pin({ slot: 'icon' })}
            <span slot="tooltip-content">Pin</span>
          </cds-icon-button>
          <cds-icon-button
          kind="ghost"
          enter-delay-ms="100"
            leave-delay-ms="100"
            caret
            align=${this.orientation === 'vertical' ? 'right' : 'top'}>
            ${ColorPalette({ slot: 'icon' })}
            <span slot="tooltip-content">Color palette</span>
          </cds-icon-button>
          <cds-icon-button
          kind="ghost"
          enter-delay-ms="100"
            leave-delay-ms="100"
            align=${this.orientation === 'vertical' ? 'right' : 'top'}>
            ${TextCreation({ slot: 'icon' })}
            <span slot="tooltip-content">Text creation</span>
          </cds-icon-button>
        </cds-stack class="toolbar-group">
        <cds-stack class="toolbar-group" orientation=${this.orientation}>
          <cds-icon-button
          kind="ghost"
          enter-delay-ms="100"
            leave-delay-ms="100"
            align=${this.orientation === 'vertical' ? 'right' : 'top'}>
            ${OpenPanelLeft({ slot: 'icon' })}
            <span slot="tooltip-content">Open panel left</span>
          </cds-icon-button>
          <cds-icon-button
          kind="ghost"
          enter-delay-ms="100"
            leave-delay-ms="100"
            align=${this.orientation === 'vertical' ? 'right' : 'top'}>
            ${OpenPanelRight({ slot: 'icon' })}
            <span slot="tooltip-content">Open panel right</span>
          </cds-icon-button>
        </cds-stack class="toolbar-group">
        <cds-stack class="toolbar-group" orientation=${this.orientation}>
          <cds-icon-button
          kind="ghost"
          enter-delay-ms="100"
            leave-delay-ms="100"
            align=${this.orientation === 'vertical' ? 'right' : 'top'}>
            ${Move({ slot: 'icon' })}
            <span slot="tooltip-content">Move</span>
          </cds-icon-button>
          <cds-icon-button
          kind="ghost"
          enter-delay-ms="100"
            leave-delay-ms="100"
            align=${this.orientation === 'vertical' ? 'right' : 'top'}>
            ${Rotate({ slot: 'icon' })}
            <span slot="tooltip-content">Rotate</span>
          </cds-icon-button>
        </cds-stack class="toolbar-group">
        <cds-stack class="toolbar-group" orientation=${this.orientation}>
          <cds-icon-button
          kind="ghost"
          enter-delay-ms="100"
            leave-delay-ms="100"
            align=${this.orientation === 'vertical' ? 'right' : 'top'}>
            ${ZoomIn({ slot: 'icon' })}
            <span slot="tooltip-content">Zoom in</span>
          </cds-icon-button>
          <cds-icon-button
          kind="ghost"
          enter-delay-ms="100"
            leave-delay-ms="100"
            align=${this.orientation === 'vertical' ? 'right' : 'top'}>
            ${ZoomOut({ slot: 'icon' })}
            <span slot="tooltip-content">Zoom out</span>
          </cds-icon-button>
        </cds-stack class="toolbar-group">
      </cds-stack class="toolbar">
    `;
  }

  static styles = styles;
}
export default ToolbarVertical;
