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
import { stub } from 'sinon';
import '@carbon-labs/ai-test-input/es/test-input.js';
import C4AITestInput from '../components/test-input/test-input.js';

describe('c4ai-test-input', function () {
  it('should render with minimum attributes', async () => {
    const el = await fixture<C4AITestInput>(
      html`<c4ai-test-input></c4ai-test-input>`
    );
    await expect(el).shadowDom.to.equalSnapshot();
    await expect(el).shadowDom.to.be.accessible();
  });

  it('should render with search results', async () => {
    const res = [
      'red',
      'red hat',
      'redbooks',
      'resilient',
      'redhat',
      'redbook',
      'redbooks ibm',
      'redbook drug pricing',
      'retiree benefits',
      'report',
    ];

    const el = await fixture<C4AITestInput>(
      html`<c4ai-test-input></c4ai-test-input>`
    );
    stub(el, 'getResults').returns(Promise.resolve(res));
    el.requestUpdate();
    await el.updateComplete;

    const root = el.shadowRoot;

    if (root) {
      const input = root.querySelector('input');
      if (input) {
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
      }
    }
  });
});
