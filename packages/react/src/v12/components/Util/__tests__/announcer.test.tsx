/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */
// @vitest-environment jsdom

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAnnouncer, useAnnouncer } from '../components/announcer';

beforeEach(() => {
  vi.useFakeTimers({
    toFake: ['requestAnimationFrame', 'cancelAnimationFrame'],
  });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

/** Runs the frame the announcer waits for. */
const nextFrame = () => vi.advanceTimersToNextFrame();

describe('createAnnouncer', () => {
  const regions = () => {
    const polite = document.createElement('span');
    const assertive = document.createElement('span');
    const a = createAnnouncer((p) => (p === 'polite' ? polite : assertive));
    return { a, polite, assertive };
  };

  it('writes the message on the next frame, in its region', () => {
    const { a, polite, assertive } = regions();
    a.announce('Saved');
    expect(polite.textContent).toBe('');
    nextFrame();
    expect(polite.textContent).toBe('Saved');
    expect(assertive.textContent).toBe('');
    a.announce('Upload failed', 'assertive');
    nextFrame();
    expect(assertive.textContent).toBe('Upload failed');
  });

  it('empties the region first, so the same words again are a change', () => {
    const { a, polite } = regions();
    a.announce('Copied');
    nextFrame();
    a.announce('Copied');
    expect(polite.textContent).toBe('');
    nextFrame();
    expect(polite.textContent).toBe('Copied');
  });

  it('reads messages from the same frame as one', () => {
    const { a, polite } = regions();
    a.announce('3 results.');
    a.announce('Filter applied.');
    nextFrame();
    expect(polite.textContent).toBe('3 results. Filter applied.');
  });

  it('ignores an empty message, and clear and dispose cancel what waits', () => {
    const { a, polite } = regions();
    a.announce('   ');
    a.announce('Gone');
    a.clear();
    nextFrame();
    expect(polite.textContent).toBe('');
    a.announce('Also gone');
    a.dispose();
    nextFrame();
    expect(polite.textContent).toBe('');
  });
});

describe('useAnnouncer', () => {
  it('renders a polite and an assertive region, and announces into them', () => {
    let say: ReturnType<typeof useAnnouncer>['announce'] = () => {};
    function Probe() {
      const { announce, regions } = useAnnouncer();
      say = announce;
      return <div>{regions}</div>;
    }
    const { container } = render(<Probe />);
    const [polite, assertive] = container.querySelectorAll('[aria-live]');
    expect(polite.getAttribute('aria-live')).toBe('polite');
    expect(assertive.getAttribute('aria-live')).toBe('assertive');
    expect(polite.getAttribute('aria-atomic')).toBe('true');
    act(() => {
      say('Two files added');
      nextFrame();
    });
    expect(polite.textContent).toBe('Two files added');
  });
});
