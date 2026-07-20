/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, fixture, expect } from '@open-wc/testing';
import '../es/components/wysiwyg/wysiwyg.js';

describe('clabs-wysiwyg', function () {
  it('should render with minimum attributes', async () => {
    const el = await fixture(html`<clabs-wysiwyg></clabs-wysiwyg>`);

    expect(el).to.exist;
    expect(el.tagName.toLowerCase()).to.equal('clabs-wysiwyg');
  });

  it('should render with content and pass accessibility tests', async () => {
    const testContent = '<p>Test content</p>';
    const el = await fixture(
      html`<clabs-wysiwyg .content=${testContent}></clabs-wysiwyg>`
    );

    expect(el).to.exist;
    expect(el.content).to.equal(testContent);
    await expect(el).shadowDom.to.be.accessible();
  });
});
