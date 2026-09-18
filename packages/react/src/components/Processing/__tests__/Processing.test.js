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

jest.mock('./processing.scss', () => ({}));

describe('Processing', () => {
  describe('renders as expected - Component API', () => {
    it('should match snapshot', () => {
      const { container } = render(<Processing />);
      expect(container).toMatchSnapshot();
    });

    it('should render with custom className and aria-label', () => {
      const { container } = render(
        <Processing className="custom-class" label="Custom loading state" />
      );
      const statusElement = container.querySelector('[role="status"]');
      expect(statusElement).toHaveClass('custom-class');
      expect(statusElement).toHaveAttribute(
        'aria-label',
        'Custom loading state'
      );
    });

    it('should apply data-ai attribute when ai prop is true', () => {
      const { container } = render(<Processing ai />);
      const statusElement = container.querySelector('[role="status"]');
      expect(statusElement).toHaveAttribute('data-ai');
    });

    it('exposes imperative handle methods via ref', () => {
      const ref = React.createRef();
      render(<Processing ref={ref} />);
      expect(typeof ref.current.triggerTriangle).toBe('function');
      expect(typeof ref.current.triggerSquare).toBe('function');
      expect(typeof ref.current.triggerWiggle).toBe('function');
      expect(typeof ref.current.triggerOut).toBe('function');
    });

    it('renders visible static dots where the Web Animations API is unavailable', () => {
      const { container } = render(<Processing />);
      const radii = [...container.querySelectorAll('circle')].map((c) =>
        c.getAttribute('r')
      );
      expect(radii).toEqual(['0.875px', '0.875px', '0.875px', '0']);
    });
  });

  describe('animation sequencing', () => {
    let now;
    let animations;

    /**
     * Whether an animation moves a dot (a formation).
     * @param {object} a - recorded animation
     * @returns {boolean} true when its keyframes animate `cx`
     */
    const isMove = (a) => a.keyframes.some((k) => 'cx' in k);
    /**
     * Whether an animation only moves dots vertically (a wiggle).
     * @param {object} a - recorded animation
     * @returns {boolean} true when its keyframes animate `cy` alone
     */
    const isWiggle = (a) => a.keyframes.every((k) => 'cy' in k && !('cx' in k));

    /**
     * Advance the fake timeline and timers together, flushing effects.
     * @param {number} ms - milliseconds to advance
     */
    const advance = async (ms) => {
      await act(async () => {
        now += ms;
        jest.advanceTimersByTime(ms);
      });
    };

    beforeEach(() => {
      jest.useFakeTimers();
      now = 0;
      animations = [];
      Object.defineProperty(document, 'timeline', {
        configurable: true,
        value: {
          get currentTime() {
            return now;
          },
        },
      });
      Element.prototype.animate = jest.fn(
        /**
         * Record the keyframes and return a minimal Animation stand-in.
         * @param {Keyframe[]} keyframes - keyframes passed to animate()
         * @returns {object} Animation stand-in
         */
        function (keyframes) {
          const anim = {
            keyframes,
            startTime: null,
            // Never settles, so pulse chains stop after one cycle.
            finished: new Promise(() => {}),
            cancel: jest.fn(),
            commitStyles: jest.fn(),
            effect: {
              /**
               * @returns {Keyframe[]} the recorded keyframes
               */
              getKeyframes: () => keyframes,
            },
          };
          animations.push(anim);
          return anim;
        }
      );
      Element.prototype.getAnimations = jest.fn(() => []);
    });

    afterEach(() => {
      jest.useRealTimers();
      delete Element.prototype.animate;
      delete Element.prototype.getAnimations;
      delete document.timeline;
      delete window.matchMedia;
    });

    it('forms a square after load-in when mode="square"', async () => {
      render(<Processing mode="square" />);
      expect(animations.filter(isMove)).toHaveLength(0);
      await advance(1500);
      expect(animations.filter(isMove)).toHaveLength(4);
    });

    it('wiggles once after load-in when mode="wiggle"', async () => {
      render(<Processing mode="wiggle" />);
      await advance(1500);
      expect(animations.filter(isWiggle)).toHaveLength(3);
    });

    it('does not resume a previous mode after the mode changes', async () => {
      const { rerender } = render(<Processing mode="triangle" />);
      await advance(500);
      rerender(<Processing mode="loading" />);
      await advance(2000);
      expect(animations.filter(isMove)).toHaveLength(0);
    });

    it('paints static end states and never animates under reduced motion', () => {
      window.matchMedia = jest.fn(() => ({
        matches: true,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));
      const { container } = render(<Processing mode="triangle" />);
      const [first] = container.querySelectorAll('circle');
      expect(Element.prototype.animate).not.toHaveBeenCalled();
      expect(first.getAttribute('r')).toBe('0.875px');
      expect(first.getAttribute('cx')).not.toBe('8');
    });
  });
});
