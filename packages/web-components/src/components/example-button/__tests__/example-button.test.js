/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, fixture, expect } from '@open-wc/testing';
import '@carbon-labs/wc-example-button/es/index.js';

describe('clabs-example-button', function () {
  it('should render with cds-button minimum attributes', async () => {
    const el = await fixture(
      html`<clabs-example-button> button </clabs-example-button>`
    );

    await expect(el).dom.to.equalSnapshot();
    await expect(el).shadowDom.to.be.accessible();
  }).timeout(5000);
});
