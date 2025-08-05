/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @ts-ignore
import { property, query, state } from 'lit/decorators.js';
import styles from './style-picker-section.scss?inline';
import { LitElement, PropertyValues } from 'lit';
import { consume, provide } from '@lit/context';
import {
  stylePickerContext,
  StylePickerContextType,
} from '../../../context/style-picker-context';
import { prefix, Size } from '../../../defs';
import HostListener from '@carbon/web-components/es/globals/decorators/host-listener.js';
import HostListenerMixin from '@carbon/web-components/es/globals/mixins/host-listener.js';

/**
 * style-picker-section extends LitElement.
 */
class StylePickerSection extends HostListenerMixin(LitElement) {
  static styles = styles;

  @query('cds-accordion-item') _accordionItem?: HTMLElement;

  /**
   * Consume style-picker-context
   */
  @consume({ context: stylePickerContext, subscribe: true })
  _stylePickerContext?: StylePickerContextType;

  /**
   * Provide style-picker-context
   */
  @provide({ context: stylePickerContext })
  _sectionContext: StylePickerContextType = {
    /**
     * Set the size of the section. So preceding options and groups could use this size.
     * @param {Size} _size - The size to be set for the options.
     * @returns {void}
     */
    setSize: (_size?: Size) => {
      this._sectionContext = {
        ...this._sectionContext,
        size: _size,
      };
    },

    /**
     * Update enable search in the Section's context.
     *
     * @param {boolean} _isEnable - Enable or disable search.
     */
    setEnableSearch: (_isEnable?: boolean) => {
      this._sectionContext = {
        ...this._sectionContext,
        enableSearch: _isEnable,
      };
    },

    /**
     * Update searchTerm in the Section's context.
     *
     * @param {string} _text - Search term.
     */
    setSearchTerm: (_text: string) => {
      this._sectionContext = {
        ...this._sectionContext,
        searchTerm: _text,
      };
    },
  };

  @property({ type: String, reflect: true, attribute: 'heading' })
  heading = '';

  @property({ type: String, reflect: true, attribute: 'size' })
  size?: Size = 'sm';

  /**
   * Indicates whether the section has a group of items.
   * This is set to true if there are any `clabs-style-picker-group` elements inside the section.
   */
  @state()
  hasGroup = false;

  /**
   * Stores the number options in the section after search.
   */
  @state()
  itemsCount = 0;

  /**
   * @param {KeyboardEvent} event Keyboard event object.
   */
  @HostListener('keydown', { capture: true })
  handleKeydown(event: KeyboardEvent) {
    const navKeys = [
      'ArrowLeft',
      'ArrowUp',
      'ArrowRight',
      'ArrowDown',
      'Home',
      'End',
    ];

    if (!navKeys.includes(event.key)) {
      return;
    }

    const options = Array.from(
      this.querySelectorAll(
        `${prefix}-option:not([hidden])`
      ) as NodeListOf<HTMLElement>
    );

    if (!options.length) {
      return;
    }

    const currentIndex = options.findIndex(
      (el) => el === document.activeElement
    );
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = Math.max(0, currentIndex - 1);
        break;

      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = Math.min(options.length - 1, currentIndex + 1);
        break;

      case 'Home':
        nextIndex = 0;
        break;

      case 'End':
        nextIndex = options.length - 1;
        break;
    }

    if (nextIndex !== currentIndex) {
      options[nextIndex]?.focus();
      options[nextIndex].setAttribute('tabindex', '0');

      if (currentIndex !== -1) {
        options[currentIndex].setAttribute('tabindex', '-1');
      }
    }
  }

  /**
   * Handle search term changes.
   */
  _handleSearch() {
    const _searchTerm = this._stylePickerContext?.searchTerm
      ?.trim()
      ?.toLowerCase();

    const options = this.querySelectorAll(`${prefix}-option`);
    let _optionsCount = 0;

    options.forEach((_option) => {
      // Reset all tabindex
      _option.setAttribute('tabindex', '-1');

      const _optionLabel = _option.getAttribute('label')?.toLowerCase();
      const _show = _optionLabel?.includes?.(_searchTerm ?? '');

      _option.toggleAttribute('hidden', !_show);
      if (_show) {
        _optionsCount++;
      }
    });

    this.itemsCount = _optionsCount;
    if (this.hidden !== !_optionsCount) {
      this.hidden = !_optionsCount;
    }

    this._stylePickerContext?.onSectionVisibilityChange?.();

    const visibleOptions = Array.from(options).filter(
      (el) => !el.hasAttribute('hidden')
    );

    if (visibleOptions.length > 0) {
      const selectedIndex = visibleOptions.findIndex((el) =>
        el.hasAttribute('selected')
      );

      const focusable = selectedIndex >= 0 ? selectedIndex : 0;
      visibleOptions[focusable].setAttribute('tabindex', '0');
    }
  }

  /**
   * Lifecycle method called when the component is first updated.
   */
  protected firstUpdated() {
    if (this.querySelectorAll(`${prefix}-group`).length > 0) {
      this.hasGroup = true;
    }
  }

  /**
   * Lifecycle method called after the component is updated.
   * @param {object} changedProperties - Properties that have changed since the last update.
   */
  protected updated(changedProperties: PropertyValues): void {
    if (
      this._stylePickerContext?.kind === 'disclosed' &&
      !this.hasAttribute('open')
    ) {
      this._accordionItem?.removeAttribute('open');
    }

    if (changedProperties.has('size')) {
      // Update the options size in the context
      this._sectionContext?.setSize?.(this.size);
    }

    if (
      this._stylePickerContext?.enableSearch &&
      this._sectionContext?.searchTerm !== this._stylePickerContext?.searchTerm
    ) {
      this._handleSearch();
    }

    if (
      this._sectionContext?.searchTerm !== this._stylePickerContext?.searchTerm
    ) {
      this._sectionContext?.setSearchTerm?.(
        this._stylePickerContext?.searchTerm || ''
      );
    }

    if (
      this._sectionContext?.enableSearch !==
      this._stylePickerContext?.enableSearch
    ) {
      this._sectionContext?.setEnableSearch?.(
        !!this._stylePickerContext?.enableSearch
      );
    }
  }

  /**
   * Getter for the slot index from the custom attribute set in the parent module.
   */
  get slotIndex() {
    return Number(this.getAttribute('data-slot-index'));
  }
}

export default StylePickerSection;
