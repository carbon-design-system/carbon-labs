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
import Save from '@carbon/web-components/es/icons/save/16.js';
import Share from '@carbon/web-components/es/icons/share/16.js';
import Upload from '@carbon/web-components/es/icons/upload/16.js';
import Printer from '@carbon/web-components/es/icons/printer/16.js';
import Undo from '@carbon/web-components/es/icons/undo/16.js';
import Redo from '@carbon/web-components/es/icons/redo/16.js';
import ZoomIn from '@carbon/web-components/es/icons/zoom--in/16.js';
import ZoomOut from '@carbon/web-components/es/icons/zoom--out/16.js';
import Minimize from '@carbon/web-components/es/icons/minimize/16.js';
import AlignHorizontalCenter from '@carbon/web-components/es/icons/align--horizontal-center/16.js';
import RulerAlt from '@carbon/web-components/es/icons/ruler--alt/16.js';
import Pin from '@carbon/web-components/es/icons/pin/16.js';
import CopyFile from '@carbon/web-components/es/icons/copy--file/16.js';
import TextAlignCenter from '@carbon/web-components/es/icons/text--align--center/16.js';
import Table from '@carbon/web-components/es/icons/table/16.js';
import SettingsAdjust from '@carbon/web-components/es/icons/settings--adjust/16.js';
import OverflowMenuVertical from '@carbon/web-components/es/icons/overflow-menu--vertical/16.js';

import styles from './toolbar.scss?lit';

/**
 * Toolbar pattern example..
 *
 * @element clabs-toolbar
 *
 */
@customElement('clabs-toolbar')
class Toolbar extends LitElement {
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
            ${Save({ slot: 'icon' })}
            <span slot="tooltip-content">Save</span>
          </cds-icon-button>
          <cds-icon-button
            kind="ghost"
            enter-delay-ms="100"
            leave-delay-ms="100"
            align=${this.orientation === 'vertical' ? 'right' : 'top'}>
            ${Share({ slot: 'icon' })}
            <span slot="tooltip-content">Share</span>
          </cds-icon-button>
          <cds-icon-button
            kind="ghost"
            enter-delay-ms="100"
            leave-delay-ms="100"
            align=${this.orientation === 'vertical' ? 'right' : 'top'}>
            ${Upload({ slot: 'icon' })}
            <span slot="tooltip-content">Upload</span>
          </cds-icon-button>
          <cds-icon-button
            kind="ghost"
            enter-delay-ms="100"
            leave-delay-ms="100"
            align=${this.orientation === 'vertical' ? 'right' : 'top'}>
            ${Printer({ slot: 'icon' })}
            <span slot="tooltip-content">Print</span>
          </cds-icon-button>
        </cds-stack>
        <cds-stack class="toolbar-group" orientation=${this.orientation}>
          <cds-icon-button
            kind="ghost"
            enter-delay-ms="100"
            leave-delay-ms="100"
            align=${this.orientation === 'vertical' ? 'right' : 'top'}>
            ${Undo({ slot: 'icon' })}
            <span slot="tooltip-content">Undo</span>
          </cds-icon-button>
          <cds-icon-button
            kind="ghost"
            enter-delay-ms="100"
            leave-delay-ms="100"
            align=${this.orientation === 'vertical' ? 'right' : 'top'}>
            ${Redo({ slot: 'icon' })}
            <span slot="tooltip-content">Redo</span>
          </cds-icon-button>
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
          <cds-icon-button
            kind="ghost"
            enter-delay-ms="100"
            leave-delay-ms="100"
            align=${this.orientation === 'vertical' ? 'right' : 'top'}>
            ${Minimize({ slot: 'icon' })}
            <span slot="tooltip-content">Minimize</span>
          </cds-icon-button>
          <cds-icon-button
            class="toolbar-button-caret"
            kind="ghost"
            enter-delay-ms="100"
            leave-delay-ms="100"
            align=${this.orientation === 'vertical' ? 'right' : 'top'}>
            ${AlignHorizontalCenter({ slot: 'icon' })}
            <span slot="tooltip-content">Align center</span>
          </cds-icon-button>
        </cds-stack>
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
            align=${this.orientation === 'vertical' ? 'right' : 'top'}>
            ${CopyFile({ slot: 'icon' })}
            <span slot="tooltip-content">Copy file</span>
          </cds-icon-button>
        </cds-stack>
        <cds-stack class="toolbar-group" orientation=${this.orientation}>
          <cds-dropdown value="14" aria-label="font size">
            <cds-dropdown-item value="14">14</cds-dropdown-item>
            <cds-dropdown-item value="15">15</cds-dropdown-item>
            <cds-dropdown-item value="16">16</cds-dropdown-item>
            <cds-dropdown-item value="17">17</cds-dropdown-item>
          </cds-dropdown>
        </cds-stack>
        <cds-stack class="toolbar-group" orientation=${this.orientation}>
          <cds-icon-button
            kind="ghost"
            enter-delay-ms="100"
            leave-delay-ms="100"
            caret
            align=${this.orientation === 'vertical' ? 'right' : 'top'}>
            ${TextAlignCenter({
              slot: 'icon',
              class: '.cds--btn--icon-only',
            })}
            <span slot="tooltip-content">Text align center</span>
          </cds-icon-button>
        </cds-stack>
        <cds-stack class="toolbar-group" orientation=${this.orientation}>
          <div data-floating-menu-container style="position: relative;">
            <cds-overflow-menu enter-delay-ms="100" leave-delay-ms="100">
              ${OverflowMenuVertical({
                class: 'cds--overflow-menu__icon',
                slot: 'icon',
              })}
              <span slot="tooltip-content"> Options </span>
              <cds-overflow-menu-body
                ?flipped=${this.orientation === 'horizontal'}>
                <cds-overflow-menu-item>Color palette</cds-overflow-menu-item>
                <cds-overflow-menu-item>Text creation</cds-overflow-menu-item>
                <cds-overflow-menu-item>Bulleted list</cds-overflow-menu-item>
                <cds-overflow-menu-item divider danger
                  >Delete app</cds-overflow-menu-item
                >
              </cds-overflow-menu-body>
            </cds-overflow-menu>
          </div>
        </cds-stack>
        <cds-stack class="toolbar-group" orientation=${this.orientation}>
          <cds-icon-button
            kind="ghost"
            enter-delay-ms="100"
            leave-delay-ms="100"
            align=${this.orientation === 'vertical' ? 'right' : 'top'}>
            ${Table({ slot: 'icon' })}
            <span slot="tooltip-content">Table</span>
          </cds-icon-button>
          <cds-icon-button
            kind="ghost"
            enter-delay-ms="100"
            leave-delay-ms="100"
            align=${this.orientation === 'vertical' ? 'right' : 'top'}>
            ${SettingsAdjust({ slot: 'icon' })}
            <span slot="tooltip-content">Settings</span>
          </cds-icon-button>
        </cds-stack>
      </cds-stack>
    `;
  }

  static styles = styles;
}
export default Toolbar;
