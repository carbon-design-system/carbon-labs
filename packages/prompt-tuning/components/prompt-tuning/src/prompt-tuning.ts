/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

// @ts-ignore
import styles from './prompt-tuning.scss?inline';
/**
 * Input component using search typeahead api
 */
export class PromptTuning extends LitElement {
  static styles = styles;

  /**
   * Text inside the prompt-tuning
   */
  @property({ attribute: 'text', type: String })
  text;
}
