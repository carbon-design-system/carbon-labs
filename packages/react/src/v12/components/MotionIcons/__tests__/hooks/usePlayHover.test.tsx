/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * play() from the app: usePlayHover plays a rendered
 * icon's hover once, in then out; never under reduced motion; never
 * restarting a hover already showing.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRef, useImperativeHandle, type Ref } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import {
  manualScheduler,
  setScheduler,
} from '@carbon-labs/motion-icons-core/engine/animate';
import { usePlayHover } from '../../hooks/usePlayHover';
import { useHover } from '../../hooks/useHover';
import { Settings } from '../../icons/controls/Settings';

let clock: ReturnType<typeof manualScheduler>;
afterEach(() => {
  setScheduler(null);
  vi.unstubAllGlobals();
});

/** Advance `ms` frame by frame, letting completions (microtasks) run between frames as a browser does. */
async function run(ms: number, each?: () => void) {
  for (let t = 0; t < ms; t += 1000 / 60) {
    clock.advance(1000 / 60);
    await act(async () => {
      await Promise.resolve();
    });
    each?.();
  }
}

type Play = () => number;
const handle = createRef<Play>();
function Wrapped({
  animated,
  playRef = handle,
}: {
  animated?: boolean;
  playRef?: Ref<Play>;
}) {
  const { ref, play } = usePlayHover<HTMLSpanElement>();
  useImperativeHandle(playRef, () => play, [play]);
  return (
    <span ref={ref} data-testid="wrap" data-motion-icon-frame="">
      <Settings animated={animated} />
    </span>
  );
}
const drawing = () =>
  screen.getByTestId('wrap').querySelector('svg')!.innerHTML;

describe('usePlayHover', () => {
  it('plays the hover once: in to the hovered drawing, then back to rest, by itself', async () => {
    clock = manualScheduler();
    setScheduler(clock);
    render(<Wrapped />);
    const rest = drawing();
    const seen = new Set<string>();
    let played = 0;
    act(() => {
      played = handle.current!();
    });
    expect(played).toBe(1);
    await run(800, () => seen.add(drawing()));
    expect(seen.size, 'it moved').toBeGreaterThan(3);
    expect(drawing(), 'and came back to rest').toBe(rest);
  });

  it('mid-hover it does not restart, and the pointer keeps the icon hovered', async () => {
    clock = manualScheduler();
    setScheduler(clock);
    render(<Wrapped />);
    const rest = drawing();
    const frame = screen.getByTestId('wrap');
    fireEvent.mouseEnter(frame);
    await run(400);
    const hovered = drawing();
    expect(hovered).not.toBe(rest);
    const seen = new Set<string>();
    act(() => {
      handle.current!();
    });
    await run(800, () => seen.add(drawing()));
    expect([...seen], 'nothing moved: still hovered').toEqual([hovered]);
    fireEvent.mouseLeave(frame);
    await run(800);
    expect(drawing()).toBe(rest);
  });

  it('under reduced motion, or animated={false}, nothing plays', async () => {
    clock = manualScheduler();
    setScheduler(clock);
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'),
      media: q,
      addEventListener() {},
      removeEventListener() {},
    }));
    const { unmount } = render(<Wrapped />);
    const rest = drawing();
    let played = -1;
    act(() => {
      played = handle.current!();
    });
    expect(played, 'reduced: still drawing, no binding').toBe(0);
    await run(400);
    expect(drawing()).toBe(rest);
    unmount();
    vi.unstubAllGlobals();
    render(<Wrapped animated={false} />);
    act(() => {
      played = handle.current!();
    });
    expect(played, 'animated={false}: Carbon art, no binding').toBe(0);
  });

  it("useHover's own play() for a hand-built icon (its onEnter's promise says when the hover-in lands)", async () => {
    let land = () => {};
    const onEnter = vi.fn(() => new Promise<void>((r) => (land = r)));
    const onLeave = vi.fn();
    const playRef = createRef<() => void>();
    function Own() {
      const { ref, play } = useHover({ onEnter, onLeave });
      useImperativeHandle(playRef, () => play, [play]);
      return <svg ref={ref} />;
    }
    render(<Own />);
    act(() => void playRef.current!());
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onLeave).not.toHaveBeenCalled();
    await act(async () => {
      land();
      await Promise.resolve();
    });
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it("useHover's play() returns a promise for the end of the play: onLeave's promise, once it settles", async () => {
    let land = () => {};
    let out = () => {};
    const onEnter = () => new Promise<void>((r) => (land = r));
    const onLeave = () => new Promise<void>((r) => (out = r));
    const playRef = createRef<() => Promise<void>>();
    function Own() {
      const { ref, play } = useHover({ onEnter, onLeave });
      useImperativeHandle(playRef, () => play, [play]);
      return <svg ref={ref} />;
    }
    render(<Own />);
    let done = false;
    act(() => void playRef.current!().then(() => (done = true)));
    const flush = () =>
      act(async () => {
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
    await flush();
    expect(done, 'hover-in in flight').toBe(false);
    land();
    await flush();
    expect(done, 'hover-out in flight').toBe(false);
    out();
    await flush();
    expect(done, 'played out').toBe(true);
    // Played again, then asked again mid-play: the second resolves at once.
    done = false;
    act(() => void playRef.current!().then(() => (done = true)));
    let again = false;
    act(() => void playRef.current!().then(() => (again = true)));
    await flush();
    expect(again, 'a play in flight: no restart').toBe(true);
    expect(done).toBe(false);
  });
});
