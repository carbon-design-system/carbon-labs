/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, fixture, expect } from '@open-wc/testing';
import { WideSideNav } from '../WideSideNav';

describe('WideSideNav tests', () => {
  it('renders with no props', async () => {
    const el = await fixture<WideSideNav>(
      html`<clabs-global-header-wide-side-nav></clabs-global-header-wide-side-nav>`
    );
    expect(el).not.to.be.null;
  });
});
