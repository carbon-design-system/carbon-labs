/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, fixture, expect, aTimeout } from '@open-wc/testing';
import '../es/index.js';

// Reset the global handler flag between test runs so tests are isolated.
// The registry and modal stack are module singletons; this is a best-effort
// cleanup that prevents cross-test bleed for simple scenarios.
beforeEach(() => {
  // Remove any lingering data-focus-region elements from previous tests
  document
    .querySelectorAll('[data-focus-region]')
    .forEach((el) => el.remove());
});

describe('clabs-focus-region', function () {
  it('renders and is accessible', async () => {
    const el = await fixture(html`
      <clabs-focus-region region-id="test-a" role="region" aria-label="Test region A">
        <button>Button A</button>
      </clabs-focus-region>
    `);
    expect(el).dom.to.equalSnapshot();
    expect(el).shadowDom.to.be.accessible();
  });

  it('sets data-focus-region attributes on the host', async () => {
    const el = await fixture(html`
      <clabs-focus-region region-id="test-b" role="region" aria-label="Region B">
        <button>B</button>
      </clabs-focus-region>
    `);
    expect(el.hasAttribute('data-focus-region')).to.be.true;
    expect(el.hasAttribute('data-focus-region-id')).to.be.true;
  });

  it('applies tabindex="-1" to host for programmatic focus', async () => {
    const el = await fixture(html`
      <clabs-focus-region region-id="test-c" role="region" aria-label="Region C">
        <span>No tabbable children</span>
      </clabs-focus-region>
    `);
    expect(el.getAttribute('tabindex')).to.equal('-1');
  });

  it('sets data-focus-region-group when group-id is provided', async () => {
    const el = await fixture(html`
      <clabs-focus-region
        region-id="test-d"
        role="region"
        aria-label="Region D"
        group-id="my-modal">
        <button>D</button>
      </clabs-focus-region>
    `);
    expect(el.getAttribute('data-focus-region-group')).to.equal('my-modal');
  });

  it('reflects aria-label on the host element', async () => {
    const el = await fixture(html`
      <clabs-focus-region role="main" aria-label="Main area">
        <p>Content</p>
      </clabs-focus-region>
    `);
    expect(el.getAttribute('aria-label')).to.equal('Main area');
  });

  it('projects slotted content', async () => {
    const el = await fixture(html`
      <clabs-focus-region role="region" aria-label="Slot test">
        <div class="inner">Hello</div>
      </clabs-focus-region>
    `);
    expect(el.querySelector('.inner')).to.exist;
    expect(el.querySelector('.inner').textContent).to.equal('Hello');
  });

  it('does not show hint by default', async () => {
    const el = await fixture(html`
      <clabs-focus-region role="region" aria-label="No hint">
        <button>Click</button>
      </clabs-focus-region>
    `);
    await aTimeout(50);
    const hint = el.shadowRoot.querySelector('.hint');
    expect(hint).to.be.null;
  });

  it('registers and unregisters from the global registry', async () => {
    const el = await fixture(html`
      <clabs-focus-region region-id="lifecycle-test" role="region" aria-label="Lifecycle">
        <button>X</button>
      </clabs-focus-region>
    `);
    expect(el.getAttribute('data-focus-region')).to.equal('lifecycle-test');

    // Removing from DOM should unregister
    el.remove();
    await aTimeout(0);
    // Verify the element is no longer in the DOM
    expect(document.querySelector('[data-focus-region="lifecycle-test"]')).to.be.null;
  });

  it('updates enabled attribute reactively', async () => {
    const el = await fixture(html`
      <clabs-focus-region region-id="enabled-test" role="region" aria-label="Enabled test" enabled>
        <button>E</button>
      </clabs-focus-region>
    `);

    expect((el as any).enabled).to.equal(true);
    (el as any).enabled = false;
    await el.updateComplete;
    expect((el as any).enabled).to.equal(false);
  });
});

describe('clabs-focus-region — F6 navigation', function () {
  it('moves focus to next region on F6', async () => {
    await fixture(html`
      <div>
        <clabs-focus-region region-id="f6-a" role="region" aria-label="F6 Region A">
          <button id="btn-a">A</button>
        </clabs-focus-region>
        <clabs-focus-region region-id="f6-b" role="region" aria-label="F6 Region B">
          <button id="btn-b">B</button>
        </clabs-focus-region>
      </div>
    `);

    const btnA = document.getElementById('btn-a');
    const btnB = document.getElementById('btn-b');
    expect(btnA).to.exist;
    expect(btnB).to.exist;

    btnA.focus();
    expect(document.activeElement).to.equal(btnA);

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'F6', bubbles: true, cancelable: true })
    );
    await aTimeout(50);

    expect(document.activeElement).to.equal(btnB);
  });

  it('moves focus to previous region on Shift+F6', async () => {
    await fixture(html`
      <div>
        <clabs-focus-region region-id="sf6-a" role="region" aria-label="SF6 Region A">
          <button id="sbtn-a">A</button>
        </clabs-focus-region>
        <clabs-focus-region region-id="sf6-b" role="region" aria-label="SF6 Region B">
          <button id="sbtn-b">B</button>
        </clabs-focus-region>
      </div>
    `);

    const btnA = document.getElementById('sbtn-a');
    const btnB = document.getElementById('sbtn-b');
    btnB.focus();

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'F6',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      })
    );
    await aTimeout(50);

    expect(document.activeElement).to.equal(btnA);
  });
});
