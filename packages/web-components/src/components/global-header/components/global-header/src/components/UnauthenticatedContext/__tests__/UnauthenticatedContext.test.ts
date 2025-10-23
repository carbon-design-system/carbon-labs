/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, fixture, expect } from '@open-wc/testing';
import '../UnauthenticatedContext';

describe('Unauthenticated Component', () => {
  it('renders default unauthenticated buttons', async () => {
    const el = await fixture(html`
      <clabs-global-header-unauthenticated-context></clabs-global-header-unauthenticated-context>
    `);
    const buttons = el.shadowRoot?.querySelectorAll('[role="listitem"]');

    expect(buttons).to.not.be.null;
    expect(buttons?.length).to.equal(2);
    expect(buttons?.[0].textContent?.trim()).to.equal('Docs');
    expect(buttons?.[1].textContent?.trim()).to.equal('Log in');
  });

  it('renders prop unauthenticated buttons', async () => {
    const el = await fixture(html`
      <clabs-global-header-unauthenticated-context
        .noAuthHeaderLinks="${[
          {
            text: 'Test Link',
            href: '/test-link',
            carbonIcon: 'Document',
            arialLabel: 'Test Link',
          },
        ]}"></clabs-global-header-unauthenticated-context>
    `);
    const buttons = el.shadowRoot?.querySelectorAll('[role="listitem"]');

    expect(buttons).to.not.be.null;
    expect(buttons?.length).to.equal(1);
    expect(buttons?.[0].textContent?.trim()).to.equal('Test Link');
  });
});
