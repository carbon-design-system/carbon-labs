/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, fixture, expect } from '@open-wc/testing';
import '@carbon-labs/wc-file-uploader-button/es/index.js';

describe('clabs-file-uploader-button', function () {
  it('should render with default attributes', async () => {
    const el = await fixture(
      html`<clabs-file-uploader-button></clabs-file-uploader-button>`
    );

    await expect(el).dom.to.equalSnapshot();
    await expect(el).shadowDom.to.be.accessible();
  });

  it('should pass through minimal file input attributes', async () => {
    const el = await fixture(html`
      <clabs-file-uploader-button
        accept=".png,.jpg"
        autofocus
        capture="environment"
        disabled
        form="upload-form"
        name="attachments"
        required
        multiple
        webkitdirectory
        aria-label="Upload supporting files"
        button-text="Upload files">
      </clabs-file-uploader-button>
    `);

    const input = el.shadowRoot.querySelector('input');

    expect(input.getAttribute('accept')).to.equal('.png,.jpg');
    expect(input.getAttribute('capture')).to.equal('environment');
    expect(input.hasAttribute('disabled')).to.be.true;
    expect(input.getAttribute('form')).to.equal('upload-form');
    expect(input.hasAttribute('autofocus')).to.be.true;
    expect(input.getAttribute('name')).to.equal('attachments');
    expect(input.hasAttribute('required')).to.be.true;
    expect(input.hasAttribute('multiple')).to.be.true;
    expect(input.hasAttribute('webkitdirectory')).to.be.true;
    expect(input.getAttribute('aria-label')).to.equal(
      'Upload supporting files'
    );
  });
});
