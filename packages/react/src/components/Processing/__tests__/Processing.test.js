/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { act, render } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

import Processing from '../components/Processing';
import { createProcessingEngine } from '../components/processingEngine';

jest.mock('./processing.scss', () => ({}));

/**
 * Install a minimal Web Animations API on jsdom: a manual document timeline,
 * animations whose `finished` promise settles when that timeline passes their
 * end (or rejects on cancel), and per-element animation lists.
 * @returns {object} controls: `advance(ms)`, `animations()`, `uninstall()`
 */
function installFakeWaapi() {
  let now = 0;
  const all = new Set();

  /** Stand-in for Animation / KeyframeEffect. */
  class FakeAnimation {
    /**
     * @param {Element} target - animated element
     * @param {Keyframe[]} keyframes - keyframes
     * @param {object} options - timing options
     */
    constructor(target, keyframes, options = {}) {
      this.target = target;
      this.keyframes = keyframes;
      this.timing = {
        duration: options.duration ?? 0,
        iterations: options.iterations ?? 1,
        fill: options.fill ?? 'none',
      };
      this.startTime = null;
      this.createdAt = now;
      this.playState = 'running';
      this.finished = new Promise((resolve, reject) => {
        this.resolveFinished = resolve;
        this.rejectFinished = reject;
      });
      this.finished.catch(() => {});
      const timing = this.timing;
      this.effect = {
        /**
         * @returns {Keyframe[]} the keyframes
         */
        getKeyframes: () => keyframes,
        /**
         * @returns {object} the timing
         */
        getTiming: () => timing,
        /**
         * @returns {object} computed timing with `endTime`
         */
        getComputedTiming: () => ({
          endTime: timing.duration * timing.iterations,
        }),
        /**
         * @param {object} t - timing fields to change
         * @returns {object} the timing
         */
        updateTiming: (t) => Object.assign(timing, t),
      };
      all.add(this);
    }

    /** Settle when the timeline has passed the end. */
    tick() {
      if (this.playState !== 'running') {
        return;
      }
      const end =
        (this.startTime ?? this.createdAt) +
        this.timing.duration * this.timing.iterations;
      if (Number.isFinite(end) && now >= end) {
        this.playState = 'finished';
        this.resolveFinished(this);
      }
    }

    /** Cancel: drop the effect and reject `finished`. */
    cancel() {
      if (this.playState === 'idle') {
        return;
      }
      this.playState = 'idle';
      all.delete(this);
      this.rejectFinished(new Error('AbortError'));
    }

    /** No-op. */
    play() {}

    /** No-op. */
    updatePlaybackRate() {}
  }

  /**
   * @param {Keyframe[]} keyframes - keyframes
   * @param {object} options - timing options
   * @returns {FakeAnimation} the animation
   */
  Element.prototype.animate = function animate(keyframes, options) {
    return new FakeAnimation(this, keyframes, options);
  };
  /**
   * @returns {FakeAnimation[]} this element's live animations
   */
  Element.prototype.getAnimations = function getAnimations() {
    return [...all].filter((a) => a.target === this);
  };
  Object.defineProperty(document, 'timeline', {
    configurable: true,
    value: {
      /**
       * @returns {number} the fake timeline's current time
       */
      get currentTime() {
        return now;
      },
    },
  });

  /** Let promise chains run. */
  const flush = async () => {
    for (let i = 0; i < 20; i++) {
      await Promise.resolve();
    }
  };

  return {
    /**
     * Move the timeline forward in 16 ms frames, settling animations and
     * flushing promise chains after each.
     * @param {number} ms - milliseconds to advance
     */
    async advance(ms) {
      const end = now + ms;
      while (now < end) {
        now = Math.min(end, now + 16);
        [...all].forEach((a) => a.tick());
        await flush();
      }
    },
    /**
     * @returns {FakeAnimation[]} every live animation
     */
    animations: () => [...all],
    /** Remove the stand-in. */
    uninstall() {
      delete Element.prototype.animate;
      delete Element.prototype.getAnimations;
      delete document.timeline;
    },
  };
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Build the group and four dots the engine drives.
 * @returns {object} `group` and `dots`
 */
function makeDots() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  const group = document.createElementNS(SVG_NS, 'g');
  svg.appendChild(group);
  const dots = [8, 16, 24, 16].map((cx) => {
    const c = document.createElementNS(SVG_NS, 'circle');
    c.setAttribute('cx', `${cx}`);
    c.setAttribute('cy', '16');
    c.setAttribute('r', '0');
    group.appendChild(c);
    return c;
  });
  document.body.appendChild(svg);
  return { group, dots };
}

/**
 * A dot's settled position, rounded to 0.1 px.
 * @param {SVGCircleElement} d - dot
 * @returns {number[]} [cx, cy]
 */
const pos = (d) => [
  Math.round(+d.getAttribute('cx') * 10) / 10,
  Math.round(+d.getAttribute('cy') * 10) / 10,
];

/**
 * Whether a dot is drawn (non-zero radius attribute).
 * @param {SVGCircleElement} d - dot
 * @returns {boolean} visible
 */
const shown = (d) => parseFloat(d.getAttribute('r')) > 0;

/**
 * Whether an animation is an infinite loop (pulse or steady spin).
 * @param {object} a - animation
 * @returns {boolean} infinite
 */
const infinite = (a) => a.effect.getTiming().iterations === Infinity;

describe('Processing', () => {
  describe('renders as expected - Component API', () => {
    it('should match snapshot', () => {
      const { container } = render(<Processing />);
      expect(container).toMatchSnapshot();
    });

    it('renders the label as live-region text and forwards className', () => {
      const { container } = render(
        <Processing className="custom-class" label="Custom loading state" />
      );
      const status = container.querySelector('[role="status"]');
      expect(status).toHaveClass('custom-class');
      expect(status).toHaveTextContent('Custom loading state');
      expect(status).not.toHaveAttribute('aria-label');
    });

    it('should apply data-ai attribute when ai prop is true', () => {
      const { container } = render(<Processing ai />);
      expect(container.querySelector('[role="status"]')).toHaveAttribute(
        'data-ai'
      );
    });

    it('paints visible static dots where the Web Animations API is unavailable', () => {
      const { container } = render(<Processing mode="triangle" />);
      const dots = [...container.querySelectorAll('circle')];
      expect(dots.filter(shown)).toHaveLength(3);
      expect(pos(dots[2])).toEqual([16, 10]);
    });
  });

  describe('engine', () => {
    let waapi;
    let engine;
    let dots;
    let group;

    beforeEach(() => {
      waapi = installFakeWaapi();
      ({ group, dots } = makeDots());
      engine = createProcessingEngine(group, dots);
    });

    afterEach(() => {
      engine.destroy();
      waapi.uninstall();
      document.body.innerHTML = '';
    });

    it('loads in, then keeps each dot pulsing with one infinite animation', async () => {
      const loaded = engine.run('loading', true, false);
      await waapi.advance(1500);
      await expect(loaded).resolves.toBe(true);
      expect(dots.slice(0, 3).every(shown)).toBe(true);
      dots.slice(0, 3).forEach((d) => {
        expect(d.getAnimations().filter(infinite)).toHaveLength(1);
      });
    });

    it('forms a triangle and hands off to a steady spin', async () => {
      engine.run('loading', true, false);
      const formed = engine.toTriangle(); // queued until load-in lands
      await waapi.advance(2500);
      await expect(formed).resolves.toBe(true);
      expect(pos(dots[0])).toEqual([10.8, 19]);
      expect(pos(dots[1])).toEqual([21.2, 19]);
      expect(pos(dots[2])).toEqual([16, 10]);
      expect(group.getAnimations().filter(infinite)).toHaveLength(1);
    });

    it('queues requests made mid-transition; the latest wins', async () => {
      engine.run('loading', true, false);
      const triangle = engine.toTriangle();
      const loading = engine.toLoading();
      await waapi.advance(2500);
      await expect(triangle).resolves.toBe(false);
      await expect(loading).resolves.toBe(true);
      expect(group.getAnimations()).toHaveLength(0);
      expect(dots.slice(0, 3).map(pos)).toEqual([
        [8, 16],
        [16, 16],
        [24, 16],
      ]);
    });

    it('unwinds a triangle, handing the line roles to the best-placed dots', async () => {
      engine.run('loading', true, false);
      engine.toTriangle();
      await waapi.advance(2500);
      const unwound = engine.toLoading();
      await waapi.advance(600);
      await expect(unwound).resolves.toBe(true);
      // The 30° dot is best placed to take the left; the rest follow clockwise.
      expect(pos(dots[1])).toEqual([8, 16]);
      expect(pos(dots[2])).toEqual([16, 16]);
      expect(pos(dots[0])).toEqual([24, 16]);
      expect(group.getAnimations()).toHaveLength(0);
    });

    it('goes from triangle to square through the loading line', async () => {
      engine.run('loading', true, false);
      engine.toTriangle();
      await waapi.advance(2500);
      const square = engine.toSquare();
      await waapi.advance(450); // unwind lands at 420 ms
      expect(
        dots
          .filter(shown)
          .map(pos)
          .sort((a, b) => a[0] - b[0])
      ).toEqual([
        [8, 16],
        [16, 16],
        [24, 16],
      ]);
      await waapi.advance(1500);
      await expect(square).resolves.toBe(true);
      expect(dots.filter(shown)).toHaveLength(4);
    });

    it('only wiggles from the loading line', async () => {
      engine.run('triangle', true, false);
      await waapi.advance(2500);
      await expect(engine.wiggle()).resolves.toBe(false);
    });

    it('loads in again when asked for a state after out', async () => {
      engine.run('loading', true, false);
      await waapi.advance(1500);
      const out = engine.out();
      await waapi.advance(400);
      await expect(out).resolves.toBe(true);
      expect(dots.filter(shown)).toHaveLength(0);
      const triangle = engine.toTriangle();
      await waapi.advance(2500);
      await expect(triangle).resolves.toBe(true);
      expect(dots.filter(shown)).toHaveLength(3);
    });

    it('paints static end states without animating', async () => {
      await expect(engine.run('square', true, true)).resolves.toBe(true);
      expect(waapi.animations()).toHaveLength(0);
      expect(dots.filter(shown)).toHaveLength(4);
      await expect(engine.toLoading()).resolves.toBe(true);
      expect(dots.slice(0, 3).map(pos)).toEqual([
        [8, 16],
        [16, 16],
        [24, 16],
      ]);
    });
  });

  describe('component', () => {
    let waapi;

    beforeEach(() => {
      waapi = installFakeWaapi();
    });

    afterEach(() => {
      waapi.uninstall();
      delete window.matchMedia;
    });

    /**
     * Advance the fake timeline inside act().
     * @param {number} ms - milliseconds to advance
     */
    const advance = (ms) => act(() => waapi.advance(ms));

    it('animates mode changes instead of restarting, and reports each landing', async () => {
      const onTransitionEnd = jest.fn();
      const { rerender } = render(
        <Processing mode="loading" onTransitionEnd={onTransitionEnd} />
      );
      await advance(1500);
      expect(onTransitionEnd).toHaveBeenLastCalledWith('loading');
      rerender(
        <Processing mode="triangle" onTransitionEnd={onTransitionEnd} />
      );
      await advance(1200);
      expect(onTransitionEnd).toHaveBeenLastCalledWith('triangle');
      // No second load-in: the only strokeWidth animations were the first three.
      const loadIns = waapi
        .animations()
        .filter((a) => 'strokeWidth' in a.keyframes[0]);
      expect(loadIns).toHaveLength(0);
    });

    it('returns promises from the handle', async () => {
      const ref = React.createRef();
      render(<Processing ref={ref} />);
      let result;
      await act(async () => {
        const pending = ref.current.triggerSquare();
        await waapi.advance(2500);
        result = await pending;
      });
      expect(result).toBe(true);
    });

    it('paints static end states under reduced motion', () => {
      window.matchMedia = jest.fn(() => ({
        matches: true,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));
      const { container } = render(<Processing mode="triangle" />);
      expect(waapi.animations()).toHaveLength(0);
      const dots = [...container.querySelectorAll('circle')];
      expect(dots.filter(shown)).toHaveLength(3);
    });
  });
});
