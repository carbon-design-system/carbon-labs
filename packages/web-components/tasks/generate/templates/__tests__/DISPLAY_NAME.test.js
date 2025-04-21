/**
 * @license
 *
 * Copyright IBM Corp. FULL_YEAR
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, fixture, expect } from '@open-wc/testing';
import '@carbon-labs/wc-DISPLAY_NAME/es/index.js';

describe('clabs-DISPLAY_NAME', function () {
  it('should render with cds-button minimum attributes', async () => {
    const el = await fixture(
      html`<clabs-DISPLAY_NAME> button </clabs-DISPLAY_NAME>`
    );

    await expect(el).dom.to.equalSnapshot();
    await expect(el).shadowDom.to.be.accessible();
  });
});
