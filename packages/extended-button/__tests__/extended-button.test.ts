/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, fixture, expect } from '@open-wc/testing';
import '@carbon-labs/ai-extended-button/es/components/extended-button/extended-button.js';
import CLABSExtendedButton from '../components/extended-button/extended-button.js';

describe('clabs-extended-button', function () {
  it('should render with cds-button minimum attributes', async () => {
    const el = await fixture<CLABSExtendedButton>(
      html`<clabs-extended-button> button </clabs-extended-button>`
    );

    await expect(el).dom.to.equalSnapshot();
    await expect(el).shadowDom.to.be.accessible();
  });
});
