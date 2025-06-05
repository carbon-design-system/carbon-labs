/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, fixture, expect } from '@open-wc/testing';
import '@carbon-labs/wc-style-picker/es/index.js';

describe('clabs-style-picker', function () {
  it('should render with cds-button minimum attributes', async () => {
    const el = await fixture(
      html`<clabs-style-picker> button </clabs-style-picker>`
    );

    await expect(el).dom.to.equalSnapshot();
    await expect(el).shadowDom.to.be.accessible();
  });
});
