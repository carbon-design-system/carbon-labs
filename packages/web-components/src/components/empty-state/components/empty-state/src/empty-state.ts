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
  @property()
  illustrationTheme?: 'light' | 'dark';

  /**
   * Source for the illustration image if you choose to use your own custom image. Passing an illustration prop will supersede the kind option.
   */
  @property({ type: String })
  illustration?;
}
