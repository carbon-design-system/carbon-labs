/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, fixture, expect, oneEvent, aTimeout } from '@open-wc/testing';
import '../es/index.js';
import sinon from 'sinon';

describe('clabs-resizer-grid', function () {
  it('should render clabs-resizer-grid', async () => {
    const grid = await fixture(html`
      <clabs-resizer-grid>
        <clabs-resizer-panel slot="left">Left panel</clabs-resizer-panel>
        <clabs-resizer-panel slot="right">Right panel</clabs-resizer-panel>
      </clabs-resizer-grid>
    `);
    expect(grid).dom.to.equalSnapshot();
    expect(grid).shadowDom.to.be.accessible();
  });

  it('should render all slot elements', async () => {
    const grid = await fixture(html`
      <clabs-resizer-grid>
        <clabs-resizer-panel slot="left">Left</clabs-resizer-panel>
        <clabs-resizer-panel slot="right">Right</clabs-resizer-panel>
        <clabs-resizer-panel slot="top">Top</clabs-resizer-panel>
        <clabs-resizer-panel slot="bottom">Bottom</clabs-resizer-panel>
        <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>
        <clabs-resizer-handle slot="handle-vertical"></clabs-resizer-handle>
      </clabs-resizer-grid>
    `);

    const shadowRoot = grid.shadowRoot;
    const slots = shadowRoot.querySelectorAll('slot');

    expect(slots.length).to.equal(6);
    expect(shadowRoot.querySelector('slot[name="left"]')).to.exist;
    expect(shadowRoot.querySelector('slot[name="right"]')).to.exist;
    expect(shadowRoot.querySelector('slot[name="top"]')).to.exist;
    expect(shadowRoot.querySelector('slot[name="bottom"]')).to.exist;
    expect(shadowRoot.querySelector('slot[name="handle-horizontal"]')).to.exist;
    expect(shadowRoot.querySelector('slot[name="handle-vertical"]')).to.exist;
  });

  it('should accept custom CSS properties for panel sizing', async () => {
    const grid = await fixture(html`
      <clabs-resizer-grid
        style="--start-element-size: 2fr; --end-element-size: 1fr;">
        <clabs-resizer-panel slot="left">Left</clabs-resizer-panel>
        <clabs-resizer-panel slot="right">Right</clabs-resizer-panel>
      </clabs-resizer-grid>
    `);

    const computedStyle = getComputedStyle(grid);
    expect(
      computedStyle.getPropertyValue('--start-element-size').trim()
    ).to.equal('2fr');
    expect(
      computedStyle.getPropertyValue('--end-element-size').trim()
    ).to.equal('1fr');
  });
});

describe('clabs-resizer-panel', function () {
  it('should render clabs-resizer-panel', async () => {
    const panel = await fixture(html`
      <clabs-resizer-panel>Panel content</clabs-resizer-panel>
    `);
    expect(panel).dom.to.equalSnapshot();
    expect(panel).shadowDom.to.be.accessible();
  });

  it('should render slotted content', async () => {
    const panel = await fixture(html`
      <clabs-resizer-panel>
        <div class="test-content">Test content</div>
      </clabs-resizer-panel>
    `);

    const slottedContent = panel.querySelector('.test-content');
    expect(slottedContent).to.exist;
    expect(slottedContent.textContent).to.equal('Test content');
  });

  it('should accept slot attribute', async () => {
    const panel = await fixture(html`
      <clabs-resizer-panel slot="left">Left panel</clabs-resizer-panel>
    `);

    expect(panel.getAttribute('slot')).to.equal('left');
  });
});

describe('clabs-resizer-handle', function () {
  it('should render clabs-resizer-handle', async () => {
    const handle = await fixture(html`
      <clabs-resizer-handle></clabs-resizer-handle>
    `);
    // Manually set ARIA attributes for standalone usage
    handle.setAttribute('aria-valuenow', '50');
    handle.setAttribute('aria-valuemin', '0');
    handle.setAttribute('aria-valuemax', '100');
    await handle.updateComplete;

    expect(handle).dom.to.equalSnapshot();
    await expect(handle).shadowDom.to.be.accessible();
  });

  it('should set accessibility attributes on connect', async () => {
    const handle = await fixture(html`
      <clabs-resizer-handle></clabs-resizer-handle>
    `);

    expect(handle.getAttribute('role')).to.equal('separator');
    expect(handle.getAttribute('tabindex')).to.equal('0');
    expect(handle.hasAttribute('aria-orientation')).to.be.true;
    expect(handle.getAttribute('aria-live')).to.equal('assertive');
  });

  it('should set horizontal orientation for handle-horizontal slot', async () => {
    const handle = await fixture(html`
      <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>
    `);

    expect(handle.getAttribute('aria-orientation')).to.equal('vertical');
  });

  it('should set vertical orientation for handle-vertical slot', async () => {
    const handle = await fixture(html`
      <clabs-resizer-handle slot="handle-vertical"></clabs-resizer-handle>
    `);

    expect(handle.getAttribute('aria-orientation')).to.equal('horizontal');
  });

  it('should render icon slot', async () => {
    const handle = await fixture(html`
      <clabs-resizer-handle>
        <svg slot="icon" width="16" height="16"></svg>
      </clabs-resizer-handle>
    `);

    const icon = handle.querySelector('[slot="icon"]');
    expect(icon).to.exist;
    expect(icon.tagName.toLowerCase()).to.equal('svg');
  });

  it('should render screen reader text', async () => {
    const handle = await fixture(html`
      <clabs-resizer-handle></clabs-resizer-handle>
    `);

    const srText = handle.shadowRoot.querySelector('.sr-only');
    expect(srText).to.exist;
    expect(srText.textContent).to.include('Use arrow keys to resize');
  });

  it('should emit resize-start event on pointer down', async () => {
    const handle = await fixture(html`
      <clabs-resizer-handle></clabs-resizer-handle>
    `);

    setTimeout(() => {
      const event = new PointerEvent('pointerdown', {
        bubbles: true,
        clientX: 100,
        clientY: 100,
      });
      handle.dispatchEvent(event);
    });

    const { detail } = await oneEvent(handle, 'resize-start');
    expect(detail).to.exist;
    expect(detail.axis).to.exist;
    expect(detail.startPosition).to.exist;
    expect(detail.startPosition.x).to.equal(100);
    expect(detail.startPosition.y).to.equal(100);
  });

  it('should emit resize-drag event during pointer move', async () => {
    const handle = await fixture(html`
      <clabs-resizer-handle></clabs-resizer-handle>
    `);

    const startEvent = new PointerEvent('pointerdown', {
      bubbles: true,
      clientX: 100,
      clientY: 100,
    });
    handle.dispatchEvent(startEvent);

    setTimeout(() => {
      const moveEvent = new PointerEvent('pointermove', {
        bubbles: true,
        clientX: 150,
        clientY: 100,
      });
      window.dispatchEvent(moveEvent);
    });

    const { detail } = await oneEvent(handle, 'resize-drag');
    expect(detail).to.exist;
    expect(detail.axis).to.exist;
    expect(detail.delta).to.exist;
    expect(detail.position).to.exist;
  });

  it('should emit resize-end event on pointer up', async () => {
    const handle = await fixture(html`
      <clabs-resizer-handle></clabs-resizer-handle>
    `);

    const startEvent = new PointerEvent('pointerdown', {
      bubbles: true,
      clientX: 100,
      clientY: 100,
    });
    handle.dispatchEvent(startEvent);

    setTimeout(() => {
      const upEvent = new PointerEvent('pointerup', {
        bubbles: true,
        clientX: 150,
        clientY: 100,
      });
      window.dispatchEvent(upEvent);
    });

    const { detail } = await oneEvent(handle, 'resize-end');
    expect(detail).to.exist;
    expect(detail.axis).to.exist;
    expect(detail.delta).to.be.a('number');
  });

  it('should emit resize-reset event on double tap', async () => {
    const handle = await fixture(html`
      <clabs-resizer-handle></clabs-resizer-handle>
    `);

    // First tap
    const firstTap = new PointerEvent('pointerdown', {
      bubbles: true,
      clientX: 100,
      clientY: 100,
    });
    handle.dispatchEvent(firstTap);

    // Second tap within 300ms
    setTimeout(() => {
      const secondTap = new PointerEvent('pointerdown', {
        bubbles: true,
        clientX: 100,
        clientY: 100,
      });
      handle.dispatchEvent(secondTap);
    }, 100);

    const event = await oneEvent(handle, 'resize-reset');
    expect(event).to.exist;
  });

  it('should handle keyboard navigation with ArrowRight', async () => {
    const handle = await fixture(html`
      <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>
    `);

    setTimeout(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
      });
      handle.dispatchEvent(event);
    });

    const { detail } = await oneEvent(handle, 'resize-drag');
    expect(detail.delta).to.equal(5);
  });

  it('should handle keyboard navigation with ArrowLeft', async () => {
    const handle = await fixture(html`
      <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>
    `);

    setTimeout(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
      });
      handle.dispatchEvent(event);
    });

    const { detail } = await oneEvent(handle, 'resize-drag');
    expect(detail.delta).to.equal(-5);
  });

  it('should handle keyboard navigation with ArrowDown', async () => {
    const handle = await fixture(html`
      <clabs-resizer-handle slot="handle-vertical"></clabs-resizer-handle>
    `);

    setTimeout(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
      });
      handle.dispatchEvent(event);
    });

    const { detail } = await oneEvent(handle, 'resize-drag');
    expect(detail.delta).to.equal(5);
  });

  it('should handle keyboard navigation with ArrowUp', async () => {
    const handle = await fixture(html`
      <clabs-resizer-handle slot="handle-vertical"></clabs-resizer-handle>
    `);

    setTimeout(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        bubbles: true,
      });
      handle.dispatchEvent(event);
    });

    const { detail } = await oneEvent(handle, 'resize-drag');
    expect(detail.delta).to.equal(-5);
  });

  it('should use larger step with Shift key', async () => {
    const handle = await fixture(html`
      <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>
    `);

    setTimeout(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        shiftKey: true,
        bubbles: true,
      });
      handle.dispatchEvent(event);
    });

    const { detail } = await oneEvent(handle, 'resize-drag');
    expect(detail.delta).to.equal(25);
  });

  it('should handle Home key in grid context', async () => {
    const grid = await fixture(html`
      <clabs-resizer-grid>
        <clabs-resizer-panel slot="left" style="width: 200px;"
          >Left</clabs-resizer-panel
        >
        <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>
        <clabs-resizer-panel slot="right">Right</clabs-resizer-panel>
      </clabs-resizer-grid>
    `);

    const handle = grid.querySelector('clabs-resizer-handle');
    await aTimeout(100);

    setTimeout(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'Home',
        bubbles: true,
      });
      handle.dispatchEvent(event);
    });

    const { detail } = await oneEvent(handle, 'resize-drag');
    expect(detail.delta).to.be.lessThan(0);
  });

  it('should handle End key in grid context', async () => {
    const grid = await fixture(html`
      <clabs-resizer-grid>
        <clabs-resizer-panel slot="left">Left</clabs-resizer-panel>
        <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>
        <clabs-resizer-panel slot="right" style="width: 200px;"
          >Right</clabs-resizer-panel
        >
      </clabs-resizer-grid>
    `);

    const handle = grid.querySelector('clabs-resizer-handle');
    await aTimeout(100);

    setTimeout(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'End',
        bubbles: true,
      });
      handle.dispatchEvent(event);
    });

    const { detail } = await oneEvent(handle, 'resize-drag');
    expect(detail.delta).to.be.greaterThan(0);
  });

  it('should not handle non-navigation keys', async () => {
    const handle = await fixture(html`
      <clabs-resizer-handle></clabs-resizer-handle>
    `);

    const spy = sinon.spy();
    handle.addEventListener('resize-drag', spy);

    const event = new KeyboardEvent('keydown', {
      key: 'a',
      bubbles: true,
    });
    handle.dispatchEvent(event);

    await aTimeout(100);
    expect(spy.called).to.be.false;
  });

  it('should set synthetic hover state', async () => {
    const handle = await fixture(html`
      <clabs-resizer-handle></clabs-resizer-handle>
    `);

    handle.setSyntheticHoverState(true);
    expect(handle.hasAttribute('data-synthetic-hover')).to.be.true;

    handle.setSyntheticHoverState(false);
    expect(handle.hasAttribute('data-synthetic-hover')).to.be.false;
  });

  it('should set synthetic active state', async () => {
    const handle = await fixture(html`
      <clabs-resizer-handle></clabs-resizer-handle>
    `);

    handle.setSyntheticActiveState(true);
    expect(handle.hasAttribute('data-synthetic-active')).to.be.true;

    handle.setSyntheticActiveState(false);
    expect(handle.hasAttribute('data-synthetic-active')).to.be.false;
  });

  it('should render pivot slot at start position', async () => {
    const panel = await fixture(html`
      <clabs-resizer-panel slot="right">
        <clabs-resizer-handle>
          <clabs-resizer-handle-pivot slot="pivot"></clabs-resizer-handle-pivot>
        </clabs-resizer-handle>
      </clabs-resizer-panel>
    `);

    const handle = panel.querySelector('clabs-resizer-handle');
    const pivotSlot = handle.shadowRoot.querySelector('slot[name="pivot"]');
    expect(pivotSlot).to.exist;
  });

  it('should render pivot slot at end position', async () => {
    const panel = await fixture(html`
      <clabs-resizer-panel slot="left">
        <clabs-resizer-handle>
          <clabs-resizer-handle-pivot slot="pivot"></clabs-resizer-handle-pivot>
        </clabs-resizer-handle>
      </clabs-resizer-panel>
    `);

    const handle = panel.querySelector('clabs-resizer-handle');
    const pivotSlot = handle.shadowRoot.querySelector('slot[name="pivot"]');
    expect(pivotSlot).to.exist;
  });

  it('should update grid CSS properties during drag', async () => {
    const grid = await fixture(html`
      <clabs-resizer-grid>
        <clabs-resizer-panel slot="left" style="width: 300px;"
          >Left</clabs-resizer-panel
        >
        <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>
        <clabs-resizer-panel slot="right" style="width: 300px;"
          >Right</clabs-resizer-panel
        >
      </clabs-resizer-grid>
    `);

    const handle = grid.querySelector('clabs-resizer-handle');
    await aTimeout(100);

    const startEvent = new PointerEvent('pointerdown', {
      bubbles: true,
      clientX: 300,
      clientY: 100,
    });
    handle.dispatchEvent(startEvent);

    const moveEvent = new PointerEvent('pointermove', {
      bubbles: true,
      clientX: 350,
      clientY: 100,
    });
    window.dispatchEvent(moveEvent);

    await aTimeout(100);

    const startSize = grid.style.getPropertyValue('--start-element-size');
    const endSize = grid.style.getPropertyValue('--end-element-size');

    expect(startSize).to.not.be.empty;
    expect(endSize).to.not.be.empty;
  });

  it('should remove transition during drag', async () => {
    const grid = await fixture(html`
      <clabs-resizer-grid>
        <clabs-resizer-panel slot="left" style="width: 300px;"
          >Left</clabs-resizer-panel
        >
        <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>
        <clabs-resizer-panel slot="right" style="width: 300px;"
          >Right</clabs-resizer-panel
        >
      </clabs-resizer-grid>
    `);

    const handle = grid.querySelector('clabs-resizer-handle');
    await aTimeout(100);

    const startEvent = new PointerEvent('pointerdown', {
      bubbles: true,
      clientX: 300,
      clientY: 100,
    });
    handle.dispatchEvent(startEvent);

    const moveEvent = new PointerEvent('pointermove', {
      bubbles: true,
      clientX: 350,
      clientY: 100,
    });
    window.dispatchEvent(moveEvent);

    await aTimeout(50);
    expect(grid.style.transition).to.equal('none');
  });
});

describe('clabs-resizer-handle-pivot', function () {
  it('should render clabs-resizer-handle-pivot', async () => {
    const pivot = await fixture(html`
      <clabs-resizer-handle-pivot></clabs-resizer-handle-pivot>
    `);
    expect(pivot).dom.to.equalSnapshot();
    expect(pivot).shadowDom.to.be.accessible();
  });

  it('should set slot attribute to pivot on connect', async () => {
    const pivot = await fixture(html`
      <clabs-resizer-handle-pivot></clabs-resizer-handle-pivot>
    `);

    expect(pivot.getAttribute('slot')).to.equal('pivot');
  });

  it('should trigger handle drag on pointer down', async () => {
    const grid = await fixture(html`
      <clabs-resizer-grid>
        <clabs-resizer-panel slot="left">Left</clabs-resizer-panel>
        <clabs-resizer-handle slot="handle-horizontal">
          <clabs-resizer-handle-pivot slot="pivot"></clabs-resizer-handle-pivot>
        </clabs-resizer-handle>
        <clabs-resizer-panel slot="right">Right</clabs-resizer-panel>
      </clabs-resizer-grid>
    `);

    const handle = grid.querySelector('clabs-resizer-handle');
    const pivot = grid.querySelector('clabs-resizer-handle-pivot');
    await Promise.all([handle.updateComplete, pivot.updateComplete]);

    setTimeout(() => {
      const event = new PointerEvent('pointerdown', {
        bubbles: true,
        clientX: 100,
        clientY: 100,
      });
      pivot.dispatchEvent(event);
    }, 50);

    const { detail } = await oneEvent(handle, 'resize-start');
    expect(detail).to.exist;
  });

  it('should set synthetic hover state on pointer enter', async () => {
    const grid = await fixture(html`
      <clabs-resizer-grid>
        <clabs-resizer-panel slot="left">
          <clabs-resizer-grid>
            <clabs-resizer-panel slot="left">Inner Left</clabs-resizer-panel>
            <clabs-resizer-handle slot="handle-horizontal">
              <clabs-resizer-handle-pivot
                slot="pivot"></clabs-resizer-handle-pivot>
            </clabs-resizer-handle>
            <clabs-resizer-panel slot="right">Inner Right</clabs-resizer-panel>
          </clabs-resizer-grid>
        </clabs-resizer-panel>
        <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>
        <clabs-resizer-panel slot="right">Right</clabs-resizer-panel>
      </clabs-resizer-grid>
    `);

    const outerHandle = grid.querySelector(
      'clabs-resizer-handle[slot="handle-horizontal"]'
    );
    const pivot = grid.querySelector('clabs-resizer-handle-pivot');
    await Promise.all([outerHandle.updateComplete, pivot.updateComplete]);

    const event = new PointerEvent('pointerenter', {
      bubbles: true,
    });
    pivot.dispatchEvent(event);

    await outerHandle.updateComplete;
    expect(outerHandle.hasAttribute('data-synthetic-hover')).to.be.true;
  });

  it('should clear synthetic hover state on pointer leave', async () => {
    const grid = await fixture(html`
      <clabs-resizer-grid>
        <clabs-resizer-panel slot="left">
          <clabs-resizer-grid>
            <clabs-resizer-panel slot="left">Inner Left</clabs-resizer-panel>
            <clabs-resizer-handle slot="handle-horizontal">
              <clabs-resizer-handle-pivot
                slot="pivot"></clabs-resizer-handle-pivot>
            </clabs-resizer-handle>
            <clabs-resizer-panel slot="right">Inner Right</clabs-resizer-panel>
          </clabs-resizer-grid>
        </clabs-resizer-panel>
        <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>
        <clabs-resizer-panel slot="right">Right</clabs-resizer-panel>
      </clabs-resizer-grid>
    `);

    const outerHandle = grid.querySelector(
      'clabs-resizer-handle[slot="handle-horizontal"]'
    );
    const pivot = grid.querySelector('clabs-resizer-handle-pivot');
    await Promise.all([outerHandle.updateComplete, pivot.updateComplete]);

    const enterEvent = new PointerEvent('pointerenter', {
      bubbles: true,
    });
    pivot.dispatchEvent(enterEvent);

    await outerHandle.updateComplete;
    expect(outerHandle.hasAttribute('data-synthetic-hover')).to.be.true;

    const leaveEvent = new PointerEvent('pointerleave', {
      bubbles: true,
    });
    pivot.dispatchEvent(leaveEvent);

    await outerHandle.updateComplete;
    expect(outerHandle.hasAttribute('data-synthetic-hover')).to.be.false;
  });

  it('should trigger reset on double click', async () => {
    const grid = await fixture(html`
      <clabs-resizer-grid>
        <clabs-resizer-panel slot="left">
          <clabs-resizer-grid>
            <clabs-resizer-panel slot="left">Inner Left</clabs-resizer-panel>
            <clabs-resizer-handle slot="handle-horizontal">
              <clabs-resizer-handle-pivot
                slot="pivot"></clabs-resizer-handle-pivot>
            </clabs-resizer-handle>
            <clabs-resizer-panel slot="right">Inner Right</clabs-resizer-panel>
          </clabs-resizer-grid>
        </clabs-resizer-panel>
        <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>
        <clabs-resizer-panel slot="right">Right</clabs-resizer-panel>
      </clabs-resizer-grid>
    `);

    const outerHandle = grid.querySelector(
      'clabs-resizer-handle[slot="handle-horizontal"]'
    );
    const pivot = grid.querySelector('clabs-resizer-handle-pivot');
    await Promise.all([outerHandle.updateComplete, pivot.updateComplete]);

    setTimeout(() => {
      const event = new MouseEvent('dblclick', {
        bubbles: true,
      });
      pivot.dispatchEvent(event);
    }, 50);

    const event = await oneEvent(outerHandle, 'resize-reset');
    expect(event).to.exist;
  });

  it('should set position attribute from parent pivot property', async () => {
    const panel = await fixture(html`
      <clabs-resizer-panel slot="left">
        <clabs-resizer-handle>
          <clabs-resizer-handle-pivot slot="pivot"></clabs-resizer-handle-pivot>
        </clabs-resizer-handle>
      </clabs-resizer-panel>
    `);

    const pivot = panel.querySelector('clabs-resizer-handle-pivot');
    await aTimeout(100);

    expect(pivot.hasAttribute('position')).to.be.true;
  });

  it('should clean up synthetic states on disconnect', async () => {
    const grid = await fixture(html`
      <clabs-resizer-grid>
        <clabs-resizer-panel slot="left">
          <clabs-resizer-grid>
            <clabs-resizer-panel slot="left">Inner Left</clabs-resizer-panel>
            <clabs-resizer-handle slot="handle-horizontal">
              <clabs-resizer-handle-pivot
                slot="pivot"></clabs-resizer-handle-pivot>
            </clabs-resizer-handle>
            <clabs-resizer-panel slot="right">Inner Right</clabs-resizer-panel>
          </clabs-resizer-grid>
        </clabs-resizer-panel>
        <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>
        <clabs-resizer-panel slot="right">Right</clabs-resizer-panel>
      </clabs-resizer-grid>
    `);

    const outerHandle = grid.querySelector(
      'clabs-resizer-handle[slot="handle-horizontal"]'
    );
    const pivot = grid.querySelector('clabs-resizer-handle-pivot');
    await Promise.all([outerHandle.updateComplete, pivot.updateComplete]);

    const enterEvent = new PointerEvent('pointerenter', {
      bubbles: true,
    });
    pivot.dispatchEvent(enterEvent);

    await outerHandle.updateComplete;
    expect(outerHandle.hasAttribute('data-synthetic-hover')).to.be.true;

    pivot.remove();
    await Promise.all([pivot.updateComplete, outerHandle.updateComplete]);

    expect(outerHandle.hasAttribute('data-synthetic-hover')).to.be.false;
  });

  it('should handle missing handle gracefully', async () => {
    const pivot = await fixture(html`
      <clabs-resizer-handle-pivot></clabs-resizer-handle-pivot>
    `);

    const event = new PointerEvent('pointerdown', {
      bubbles: true,
      clientX: 100,
      clientY: 100,
    });

    // Should not throw error
    expect(() => pivot.dispatchEvent(event)).to.not.throw();
  });
});

describe('Integration tests', function () {
  it('should work with complete grid layout', async () => {
    const grid = await fixture(html`
      <clabs-resizer-grid>
        <clabs-resizer-panel slot="left">
          <div style="padding: 16px;">Left Panel</div>
        </clabs-resizer-panel>
        <clabs-resizer-handle slot="handle-horizontal">
          <svg slot="icon" width="16" height="16"></svg>
        </clabs-resizer-handle>
        <clabs-resizer-panel slot="right">
          <div style="padding: 16px;">Right Panel</div>
        </clabs-resizer-panel>
      </clabs-resizer-grid>
    `);

    expect(grid).to.exist;
    expect(grid.querySelectorAll('clabs-resizer-panel').length).to.equal(2);
    expect(grid.querySelector('clabs-resizer-handle')).to.exist;
  });

  it('should work with vertical layout', async () => {
    const grid = await fixture(html`
      <clabs-resizer-grid>
        <clabs-resizer-panel slot="top">Top Panel</clabs-resizer-panel>
        <clabs-resizer-handle slot="handle-vertical"></clabs-resizer-handle>
        <clabs-resizer-panel slot="bottom">Bottom Panel</clabs-resizer-panel>
      </clabs-resizer-grid>
    `);

    const handle = grid.querySelector('clabs-resizer-handle');
    expect(handle.getAttribute('aria-orientation')).to.equal('horizontal');
  });

  it('should work with pivot handles', async () => {
    const grid = await fixture(html`
      <clabs-resizer-grid>
        <clabs-resizer-panel slot="left">
          <clabs-resizer-handle>
            <clabs-resizer-handle-pivot
              slot="pivot"></clabs-resizer-handle-pivot>
          </clabs-resizer-handle>
        </clabs-resizer-panel>
        <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>
        <clabs-resizer-panel slot="right">Right Panel</clabs-resizer-panel>
      </clabs-resizer-grid>
    `);

    const pivot = grid.querySelector('clabs-resizer-handle-pivot');
    expect(pivot).to.exist;
    expect(pivot.getAttribute('slot')).to.equal('pivot');
  });

  it('should handle resize across full workflow', async () => {
    const grid = await fixture(html`
      <clabs-resizer-grid>
        <clabs-resizer-panel slot="left" style="width: 300px;"
          >Left</clabs-resizer-panel
        >
        <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>
        <clabs-resizer-panel slot="right" style="width: 300px;"
          >Right</clabs-resizer-panel
        >
      </clabs-resizer-grid>
    `);

    const handle = grid.querySelector('clabs-resizer-handle');
    await aTimeout(100);

    const events = [];
    handle.addEventListener('resize-start', () => events.push('start'));
    handle.addEventListener('resize-drag', () => events.push('drag'));
    handle.addEventListener('resize-end', () => events.push('end'));

    // Start drag
    const startEvent = new PointerEvent('pointerdown', {
      bubbles: true,
      clientX: 300,
      clientY: 100,
    });
    handle.dispatchEvent(startEvent);

    await aTimeout(50);

    // Move
    const moveEvent = new PointerEvent('pointermove', {
      bubbles: true,
      clientX: 350,
      clientY: 100,
    });
    window.dispatchEvent(moveEvent);

    await aTimeout(50);

    // End
    const upEvent = new PointerEvent('pointerup', {
      bubbles: true,
      clientX: 350,
      clientY: 100,
    });
    window.dispatchEvent(upEvent);

    await aTimeout(50);

    expect(events).to.include('start');
    expect(events).to.include('drag');
    expect(events).to.include('end');
  });
});
