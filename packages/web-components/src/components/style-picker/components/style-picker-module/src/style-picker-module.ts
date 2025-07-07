/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { consume } from '@lit/context';
import { CSSResultGroup, LitElement, TemplateResult } from 'lit';
import {
  stylePickerContext,
  StylePickerContextType,
} from '../../../context/style-picker-context';
// @ts-ignore
import styles from './style-picker-module.scss?inline';
import { property, query } from 'lit/decorators.js';
import { Group, Item, Size } from '../../../defs/style-picker-module.types';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
import CLABSStylePickerModule from '../style-picker-module';

const { stablePrefix: clabsPrefix } = settings;

/**
 * The base component for different modules eg: color, icon, pictogram, etc.
 *
 * @fires clabs-style-picker-module-option-change - fired when an option is selected/changed.
 */
class StylePickerModule<T> extends LitElement {
  static styles: CSSResultGroup = [styles];

  @query('cds-accordion-item') accordionItem;

  /**
   * Consume style-picker-context
   */
  @consume({ context: stylePickerContext, subscribe: true })
  _stylePickerContext?: StylePickerContextType;

  @property({ type: Array })
  items: Item<T>[] | Group<Item<T>>[] = [];

  @property({ type: String, reflect: true, attribute: 'selected-item' })
  selectedItem = '';

  @property({ type: String, reflect: true, attribute: 'heading' })
  heading = '';

  @property({ type: String, reflect: true, attribute: 'size' })
  size: Size | undefined;

  @property({ attribute: false })
  renderItem?: (item: Item<T>) => TemplateResult;

  @property({ type: Number, reflect: true, attribute: 'slot-index' })
  slotIndex?: number;

  /**
   * @param {string} triggeredBy - the element that triggered the change.
   * @param {Item} item - selected item.
   */
  protected handleOptionChange = (
    triggeredBy: EventTarget | null,
    item: Item<T>
  ) => {
    const init = {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {
        triggeredBy,
        item,
      },
    };
    const newEvent = new CustomEvent(
      (this.constructor as typeof CLABSStylePickerModule).eventOptionChange,
      init
    );

    this.dispatchEvent(newEvent);
  };

  /**
   * Lifecycle method called after the component is updated.
   * @param changedProperties
   */
  protected updated(changedProperties) {
    if (this._stylePickerContext?.activeModule !== this.slotIndex) {
      this.accordionItem?.removeAttribute('open');
    }

    if (changedProperties.has('size')) {
      // Update the module size in the context
      this._stylePickerContext?.setModuleSize?.(this.size);
    }
  }

  /**
   * The name of the custom event fired after an option is changed in the module.
   */
  static get eventOptionChange() {
    return `${clabsPrefix}-style-picker-module-option-change`;
  }
}

export default StylePickerModule;
