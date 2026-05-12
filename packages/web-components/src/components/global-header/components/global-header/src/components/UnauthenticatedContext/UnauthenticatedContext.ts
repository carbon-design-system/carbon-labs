/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint jsdoc/require-jsdoc: 0 */

import { css, html, LitElement, nothing, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities';
import { NoAuthHeaderLinks } from '../../types/Header.types';
import { renderCarbonIcon } from '../../globals/utils';
import '@carbon/web-components/es-custom/components/ui-shell/index.js';

/* c8 ignore next */
import cx from 'classnames';
import {
  AUTOMATION_NAMESPACE_PREFIX,
  DEFAULT_NO_AUTH_HEADER_LINKS,
  HEADER_NAVIGATION_ACTION,
} from '../../constant';
import styles from '../_index.scss?inline';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Content to show when not logged in
 */
@customElement(`${clabsPrefix}-global-header-unauthenticated-context`)
export class UnauthenticatedContext extends LitElement {
  static styles = css`
    ${unsafeCSS(styles)}
  `;
  @property({ type: Array }) noAuthHeaderLinks: NoAuthHeaderLinks[] = [
    ...DEFAULT_NO_AUTH_HEADER_LINKS,
  ];

  render() {
    return html` <cds-custom-header-nav
      aria-label="Navigation"
      class="${cx(
        AUTOMATION_NAMESPACE_PREFIX,
        `${HEADER_NAVIGATION_ACTION}__menu`
      )}">
      ${this.noAuthHeaderLinks &&
      this.noAuthHeaderLinks.map((headerLink: NoAuthHeaderLinks) => {
        return html`
          <cds-custom-header-nav-item
            aria-label="${headerLink?.arialLabel}"
            href="${headerLink?.href}"
            class="${`${HEADER_NAVIGATION_ACTION}__menu-item`}">
            ${headerLink?.text}
            ${headerLink?.carbonIcon
              ? html`<span
                  >${renderCarbonIcon(headerLink.carbonIcon, 16)}</span
                >`
              : nothing}
          </cds-custom-header-nav-item>
        `;
      })}
    </cds-custom-header-nav>`;
  }
}
