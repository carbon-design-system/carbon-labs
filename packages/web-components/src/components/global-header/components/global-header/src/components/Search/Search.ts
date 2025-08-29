/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@carbon/web-components/es-custom/components/search/index.js';

import styles from './_index.scss?inline' assert { type: 'css' };
import { SearchConfigs } from '../../types/Header.types';

/**
 * Optional search box for the header
 */
@customElement('apaas-header-search')
export class Search extends LitElement {
  static styles = css`
    ${unsafeCSS([styles])}
  `;

  @state()
  searchValue = '';

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('cds-search-input', ((e: CustomEvent) =>
      this._handleSearchInput(e?.detail?.value)) as EventListener);
  }

  disconnectedCallback() {
    this.removeEventListener('cds-search-input', () => {});
    super.disconnectedCallback();
  }

  _handleKeydown(e: KeyboardEvent) {
    e.stopPropagation();
    if (
      (e.key === 'Enter' || e.code === 'Enter') &&
      this.props?.submitCallback
    ) {
      this.props.submitCallback(this.searchValue);
    }
  }

  _handleSearchInput(value: string) {
    this.searchValue = value;
    this.props.callback(value);
  }

  @property({ type: Object }) props: SearchConfigs = {
    callback: (value: string) => console.log(`value: ${value}`),
  };
  render() {
    return html`<cds-custom-search
      expandable
      size="lg"
      label-text="search"
      close-button-label-text="close search"
      @keydown="${this._handleKeydown}"
      .placeholder="${this.props?.placeholder}"></cds-custom-search>`;
  }
}
