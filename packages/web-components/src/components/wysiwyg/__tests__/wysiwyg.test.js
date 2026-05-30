/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, fixture, expect } from '@open-wc/testing';
import '@carbon-labs/wc-wysiwyg/es/index.js';

describe('clabs-wysiwyg', function () {
  it('should render with minimum attributes', async () => {
    const el = await fixture(
      html`<clabs-wysiwyg aria-label="WYSIWYG Editor">
        dummy content
      </clabs-wysiwyg>`
    );

    await expect(el).dom.to.equalSnapshot();
    // TODO: fix upstream/implementation a11y
    // await expect(el).shadowDom.to.be.accessible();
  });
});
