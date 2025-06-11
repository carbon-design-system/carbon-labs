/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { consume } from '@lit/context';
import {
  CSSResultGroup,
  LitElement,
  PropertyValues,
  TemplateResult,
} from 'lit';
import {
  stylePickerContext,
  StylePickerContextType,
} from '../../../context/style-picker-context';
import baseStyles from './style-picker-module.scss?inline';
import { property } from 'lit/decorators.js';
import { Group, Item } from '../../../defs/style-picker-module.types';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
import CLABSStylePickerModule from '../style-picker-module';
import { Size } from '../../../defs/style-picker-option.types';

const { stablePrefix: clabsPrefix } = settings;

/**
 * The base component for different modules eg: color, icon, pictogram, etc.
 *
 * @fires clabs-style-picker-module-option-change - fired when an option is selected/changed.
 */
class StylePickerModule<T> extends LitElement {
  static styles: CSSResultGroup = [baseStyles];

  /**
   * Consume style-picker-context
   */
  @consume({ context: stylePickerContext, subscribe: true })
  stylePickerContext?: StylePickerContextType;

  @property({ reflect: true })
  items: Item<T>[] | Group<Item<T>>[] = [];

  @property({ type: String, reflect: true })
  selectedItem = '';

  @property({ type: String, reflect: true })
  title = '';

  @property({ reflect: true })
  size: Size | undefined;

  @property({ type: Function })
  renderItem?: (item: Item<T>) => TemplateResult;

  /**
   * @param {string} triggeredBy - the element that triggered the change.
   */
  protected handleOptionChange(triggeredBy: EventTarget | null) {
    const init = {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {
        triggeredBy,
      },
    };
    const newEvent = new CustomEvent(
      (this.constructor as typeof CLABSStylePickerModule).eventOptionChange,
      init
    );

    this.dispatchEvent(newEvent);
  }

  /**
   * The name of the custom event fired after an option is changed in the module.
   */
  static get eventOptionChange() {
    return `${clabsPrefix}-style-picker-module-option-change`;
  }
}

export default StylePickerModule;
