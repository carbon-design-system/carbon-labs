/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  html,
  fixture,
  expect,
  oneEvent,
  elementUpdated,
} from '@open-wc/testing';
import '@carbon-labs/wc-checklist/es/index.js';

const clabsPrefix = 'clabs';
const blockClass = `${clabsPrefix}--checklist`;

// ─── clabs-checklist ─────────────────────────────────────────────────────────

describe('clabs-checklist', function () {
  let el;

  beforeEach(async () => {
    el = await fixture(html`
      <clabs-checklist
        title="Test Title"
        chart-label="5 out of 10 tasks completed"
        chart-value="0.5"
        toggle-label="Toggle"
        toggle-label-align="top"
        toggle-aria-label="Toggle checklist"
        view-all-label="View All"
        open>
      </clabs-checklist>
    `);
  });

  it('renders the title', () => {
    expect(el.shadowRoot.textContent).to.include('Test Title');
  });

  it('renders the chart label', () => {
    expect(el.shadowRoot.textContent).to.include('5 out of 10 tasks completed');
  });

  it('renders the progress chart sub-component', () => {
    const chart = el.shadowRoot.querySelector(`clabs-checklist-chart`);
    expect(chart).to.exist;
  });

  it('renders the toggle button', () => {
    const toggleButton = el.shadowRoot.querySelector(`.${blockClass}__toggle`);
    expect(toggleButton).to.exist;
  });

  it('is open when the `open` attribute is set', () => {
    expect(el.open).to.be.true;
    const aside = el.shadowRoot.querySelector('aside');
    expect(aside.classList.contains(`${blockClass}__closed`)).to.be.false;
  });

  it('is closed when the `open` attribute is not set', async () => {
    const closed = await fixture(html`
      <clabs-checklist title="Test" chart-value="0.25"></clabs-checklist>
    `);
    expect(closed.open).to.be.false;
    const aside = closed.shadowRoot.querySelector('aside');
    expect(aside.classList.contains(`${blockClass}__closed`)).to.be.true;
  });

  it('toggles open state and fires clabs-checklist-toggle event', async () => {
    const toggleButton = el.shadowRoot.querySelector(`.${blockClass}__toggle`);
    expect(el.open).to.be.true;
    setTimeout(() => toggleButton.click());
    const ev = await oneEvent(el, 'clabs-checklist-toggle');
    expect(ev).to.exist;
    expect(el.open).to.be.false;
  });

  it('fires clabs-checklist-view-all when the "View all" link is clicked', async () => {
    const link = el.shadowRoot.querySelector('cds-link');
    expect(link).to.exist;
    setTimeout(() => link.click());
    const ev = await oneEvent(el, 'clabs-checklist-view-all');
    expect(ev).to.exist;
  });

  it('hides the toggle button when disable-toggle is set', async () => {
    const noToggle = await fixture(html`
      <clabs-checklist title="No toggle" chart-value="0.1" disable-toggle>
      </clabs-checklist>
    `);
    await elementUpdated(noToggle);
    const btn = noToggle.shadowRoot.querySelector(`.${blockClass}__toggle`);
    expect(btn).to.be.null;
  });

  it('does not render the chart sub-component when chart-value is not provided', async () => {
    const noChart = await fixture(html`
      <clabs-checklist title="No chart"></clabs-checklist>
    `);
    const chart = noChart.shadowRoot.querySelector('clabs-checklist-chart');
    expect(chart).to.not.exist;
  });
});

// ─── clabs-checklist-group ───────────────────────────────────────────────────

describe('clabs-checklist-group', function () {
  it('renders the group title', async () => {
    const el = await fixture(html`
      <clabs-checklist-group title="Group Title"></clabs-checklist-group>
    `);
    const h3 = el.shadowRoot.querySelector(`.${blockClass}__list-title`);
    expect(h3).to.exist;
    expect(h3.textContent.trim()).to.equal('Group Title');
  });

  it('renders the ordered list', async () => {
    const el = await fixture(html`
      <clabs-checklist-group title="Group"></clabs-checklist-group>
    `);
    const ol = el.shadowRoot.querySelector('ol');
    expect(ol).to.exist;
  });

  it('exposes slotted checklist items', async () => {
    const el = await fixture(html`
      <clabs-checklist-group title="Group">
        <clabs-checklist-item
          label="task 1"
          status="completed"></clabs-checklist-item>
        <clabs-checklist-item
          label="task 2"
          status="in progress"></clabs-checklist-item>
        <clabs-checklist-item
          label="task 3"
          status="not started"></clabs-checklist-item>
      </clabs-checklist-group>
    `);
    await elementUpdated(el);
    const slot = el.shadowRoot.querySelector('slot');
    const items = slot
      .assignedElements()
      .filter((e) => e.tagName.toLowerCase() === 'clabs-checklist-item');
    expect(items).to.have.length(3);
  });

  it('does not render a title element when title is absent', async () => {
    const el = await fixture(html`
      <clabs-checklist-group></clabs-checklist-group>
    `);
    const h3 = el.shadowRoot.querySelector(`.${blockClass}__list-title`);
    expect(h3).to.be.null;
  });
});

// ─── clabs-checklist-item ────────────────────────────────────────────────────

describe('clabs-checklist-item', function () {
  it('renders the label', async () => {
    const el = await fixture(html`
      <clabs-checklist-item
        label="My task"
        status="not started"></clabs-checklist-item>
    `);
    const labelEl = el.shadowRoot.querySelector(`.${blockClass}__label`);
    expect(labelEl).to.exist;
    expect(labelEl.textContent.trim()).to.equal('My task');
  });

  it('applies the clickable class when clickable is set', async () => {
    const el = await fixture(html`
      <clabs-checklist-item
        label="My task"
        status="in progress"
        clickable></clabs-checklist-item>
    `);
    const labelEl = el.shadowRoot.querySelector(`.${blockClass}__label`);
    expect(labelEl.classList.contains(`${blockClass}__label--clickable`)).to.be
      .true;
  });

  it('applies the disabled class for disabled status', async () => {
    const el = await fixture(html`
      <clabs-checklist-item
        label="My task"
        status="disabled"></clabs-checklist-item>
    `);
    const labelEl = el.shadowRoot.querySelector(`.${blockClass}__label`);
    expect(labelEl.classList.contains(`${blockClass}__label--disabled`)).to.be
      .true;
  });

  it('fires clabs-checklist-item-clicked when a clickable item is clicked', async () => {
    const el = await fixture(html`
      <clabs-checklist-item
        label="Click me"
        status="not started"
        clickable></clabs-checklist-item>
    `);
    const labelEl = el.shadowRoot.querySelector(
      `.${blockClass}__label--clickable`
    );
    setTimeout(() => labelEl.click());
    const ev = await oneEvent(el, 'clabs-checklist-item-clicked');
    expect(ev).to.exist;
  });

  it('renders a checklist-icon sub-component', async () => {
    const el = await fixture(html`
      <clabs-checklist-item
        label="My task"
        status="completed"></clabs-checklist-item>
    `);
    const icon = el.shadowRoot.querySelector('clabs-checklist-icon');
    expect(icon).to.exist;
  });
});

// ─── clabs-checklist-chart ───────────────────────────────────────────────────

describe('clabs-checklist-chart', function () {
  it('sets the CSS custom property on connectedCallback', async () => {
    const el = await fixture(html`
      <clabs-checklist-chart value="0.5"></clabs-checklist-chart>
    `);
    const degrees = el.style.getPropertyValue(`--${clabsPrefix}-num-degrees`);
    expect(degrees).to.equal('180deg');
  });

  it('updates the CSS custom property when value changes', async () => {
    const el = await fixture(html`
      <clabs-checklist-chart value="0.25"></clabs-checklist-chart>
    `);
    el.value = 0.75;
    await elementUpdated(el);
    const degrees = el.style.getPropertyValue(`--${clabsPrefix}-num-degrees`);
    expect(degrees).to.equal('270deg');
  });

  it('clamps the chart value to a maximum of 360 degrees', async () => {
    const el = await fixture(html`
      <clabs-checklist-chart value="2"></clabs-checklist-chart>
    `);
    const degrees = el.style.getPropertyValue(`--${clabsPrefix}-num-degrees`);
    expect(degrees).to.equal('360deg');
  });
});
