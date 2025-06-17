/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, fixture, expect } from '@open-wc/testing';
import { BUTTON_KIND } from '@carbon/web-components/es/components/button/defs.js';
import { POPOVER_ALIGNMENT } from '@carbon/web-components/es/components/popover/defs.js';
import ColorPalette16 from '@carbon/web-components/es/icons/color-palette/16.js';
import '@carbon-labs/wc-style-picker/es/index.js';
import { colors } from '../__stories__/_placeholders';

const defaultProps = {
  align: POPOVER_ALIGNMENT.BOTTOM,
  open: true,
  title: 'Choose color',
};

/**
 *
 * @param {object} props - Default props for test component
 * @returns {TemplateResult} The Lit template result.
 */
const template = (props = defaultProps) => html`
  <clabs-style-picker
    .align=${props.align}
    ?open=${props.open}
    .title=${props.title}>
    <cds-icon-button slot="trigger" .kind=${BUTTON_KIND.GHOST}>
      ${ColorPalette16({ slot: 'icon' })}
      <span slot="tooltip-content">Color palette</span>
    </cds-icon-button>
    <clabs-style-picker-modules slot="modules">
      <clabs-style-picker-color-module
        .title=${'Color'}
        .size=${'sm'}
        .items=${colors}
        .selectedItem=${'blue-60'}></clabs-style-picker-color-module>
    </clabs-style-picker-modules>
  </clabs-style-picker>
`;

describe('clabs-style-picker', function () {
  it('should render single variant color picker module', async () => {
    const el = await fixture(template());

    await expect(el).dom.to.equalSnapshot();
    await expect(el).shadowDom.to.be.accessible();
  });
});
