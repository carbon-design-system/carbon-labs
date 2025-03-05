/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

// @ts-ignore
import styles from './empty-state.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class emptyState extends LitElement {
  static styles = styles;
  /**
   * Empty state heading
   */
  @property({ type: String })
  title;
  /**
   * Empty state subtext
   */
  @property({ type: String })
  subtitle;
  /**
   * Empty state subtext
   */
  @property()
  size: 'sm' | 'lg' = 'lg';
}
