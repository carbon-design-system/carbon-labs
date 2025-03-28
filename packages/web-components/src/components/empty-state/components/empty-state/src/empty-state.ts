/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';

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
  @property({ type: String, reflect: true })
  title;
  /**
   * Empty state subtext
   */
  @property({ type: String, reflect: true })
  subtitle;
  /**
   * Empty state subtext
   */
  @property({ type: String, reflect: true })
  size: 'sm' | 'lg' = 'lg';
  /**
   * Determines which predefined illustration will be displayed
   */
  @property()
  kind?:
    | 'error'
    | 'noData'
    | 'noTags'
    | 'notFound'
    | 'notifications'
    | 'unauthorized';
  /**
   * Empty state illustration theme variations. To ensure you use the correct themed illustrations, you can conditionally specify light or dark based on your app's current theme value.
   */
  @property({ type: String, reflect: true })
  illustrationTheme?: 'light' | 'dark';

  @state()
  hasIllustration?: boolean;
}
