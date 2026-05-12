/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities';
import CDSSideNav from '@carbon/web-components/es-custom/components/ui-shell/side-nav.js';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Extended width version of SideNav
 */
@customElement(`${clabsPrefix}-global-header-wide-side-nav`)
export class WideSideNav extends CDSSideNav {
  // Make wider than regular cds-side-nav to match React version
  static styles = css`
    ${CDSSideNav.styles}
    .cds-custom--side-nav--expanded {
      max-inline-size: 320px;
      inline-size: 320px;
    }
  `;
}
