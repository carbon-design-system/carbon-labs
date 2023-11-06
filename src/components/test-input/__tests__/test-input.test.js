/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  html,
  fixture,
  expect,
  elementUpdated,
  waitUntil,
} from '@open-wc/testing';
import '../../../../dist/test-input.js';

describe('c4ai-test-input', function () {
  it('should render with minimum attributes', async () => {
    const el = await fixture(html`<c4ai-test-input></c4ai-test-input>`);
    await expect(el).shadowDom.to.equalSnapshot();
    await expect(el).shadowDom.to.be.accessible();
  });

  it('should render with search results', async () => {
    const el = await fixture(html`<c4ai-test-input></c4ai-test-input>`);
    const root = el.shadowRoot;
    const input = root.querySelector('input');

    input.value = 're';
    input.dispatchEvent(new Event('input'));

    await elementUpdated(el);
    await waitUntil(
      () => root.querySelector('p'),
      'search results should be visible',
      { interval: 100, timeout: 10000 }
    );
    const results = root.querySelector('p');

    expect(results).to.exist;
    await expect(el).shadowDom.to.equalSnapshot();
  });
});
