/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Icon refs: every icon takes a `ref` whose handle is a
 * MotionIconHandle. `play()` is usePlayHover's play for that one icon (in
 * then out; a no-op under reduced motion, in a disabled frame, or while a
 * hover shows) and resolves when it's over; `svg` is the rendered svg.
 * Attaching a ref changes neither the markup nor the number of renders.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRef, Profiler, type ComponentType, type RefObject } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import {
  manualScheduler,
  setScheduler,
} from '@carbon-labs/motion-icons-core/engine/animate';
import {
  Add,
  BookmarkToggle,
  CheckboxStateToggle,
  ChevronDownUpToggle,
  Notification,
  PlayPauseToggle,
  Save,
  Settings,
  SidePanelFilledToggle,
  SkillLevelToggle,
  StatusPip,
  VolumeLevelToggle,
  type MotionIconHandle,
} from '../../index';

let clock: ReturnType<typeof manualScheduler>;
afterEach(() => {
  cleanup();
  setScheduler(null);
  vi.unstubAllGlobals();
});
function useClock() {
  clock = manualScheduler();
  setScheduler(clock);
}
const reduceMotion = () =>
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('reduce'),
    media: q,
    addEventListener() {},
    removeEventListener() {},
  }));

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
/** Let pending promise reactions run. */
const settle = () =>
  act(async () => {
    for (let i = 0; i < 5; i++) await Promise.resolve();
  });

/** play() through the ref: whether it has resolved, and every drawing seen until it did. */
async function playThrough(ref: RefObject<MotionIconHandle | null>, ms = 1000) {
  const svg = ref.current!.svg!;
  const rest = svg.innerHTML;
  let done = false;
  let p!: Promise<void>;
  act(() => {
    p = ref.current!.play();
  });
  void p.then(() => (done = true));
  const seen = new Set<string>();
  let doneAt: string | undefined;
  await run(ms, () => {
    if (!done) seen.add(svg.innerHTML);
    else doneAt ??= svg.innerHTML;
  });
  return { rest, seen, done, doneAt, end: svg.innerHTML };
}

describe('an icon ref', () => {
  it('a hover icon: svg is its <svg>; play() plays in and out, resolving back at rest', async () => {
    useClock();
    const ref = createRef<MotionIconHandle>();
    const { container } = render(<Settings ref={ref} />);
    expect(ref.current!.svg).toBe(container.querySelector('svg'));
    const r = await playThrough(ref);
    expect(r.seen.size, 'it moved').toBeGreaterThan(3);
    expect(r.done, 'resolved').toBe(true);
    expect(r.doneAt, 'resolved at rest').toBe(r.rest);
    // Again, from rest: it plays again.
    const again = await playThrough(ref);
    expect(again.seen.size).toBeGreaterThan(3);
    expect(again.done).toBe(true);
  });

  it('plays only its own icon, not its neighbours', async () => {
    useClock();
    const ref = createRef<MotionIconHandle>();
    const { container } = render(
      <span data-motion-icon-frame="">
        <Add ref={ref} />
        <Add />
      </span>
    );
    const other = container.querySelectorAll('svg')[1];
    const before = other.innerHTML;
    const seen = new Set<string>();
    act(() => void ref.current!.play());
    await run(800, () => seen.add(other.innerHTML));
    expect([...seen]).toEqual([before]);
  });

  it('a toggle: plays its hover without changing state; asButton: svg is the svg in the button', async () => {
    useClock();
    const ref = createRef<MotionIconHandle>();
    const onChange = vi.fn();
    const { container, unmount } = render(
      <BookmarkToggle ref={ref} onChange={onChange} />
    );
    expect(ref.current!.svg).toBe(container.querySelector('svg'));
    const r = await playThrough(ref);
    expect(r.seen.size).toBeGreaterThan(3);
    expect(r.done).toBe(true);
    expect(r.doneAt).toBe(r.rest);
    expect(onChange).not.toHaveBeenCalled();
    unmount();
    const button = render(
      <BookmarkToggle ref={ref} asButton aria-label="Bookmark" />
    ).container.querySelector('button')!;
    expect(ref.current!.svg).toBe(button.querySelector('svg'));
    expect(ref.current!.svg!.parentElement).toBe(button);
    const b = await playThrough(ref);
    expect(b.seen.size).toBeGreaterThan(3);
    expect(b.done).toBe(true);
  });

  it('a status icon: plays as its plain icon; while a status shows, play() is a no-op (the icon holds still)', async () => {
    useClock();
    const ref = createRef<MotionIconHandle>();
    const { container, rerender } = render(<Save ref={ref} />);
    expect(ref.current!.svg).toBe(container.querySelector('svg'));
    const plain = await playThrough(ref);
    expect(plain.seen.size).toBeGreaterThan(3);
    expect(plain.done).toBe(true);
    expect(plain.doneAt).toBe(plain.rest);

    rerender(<Save ref={ref} status="success" />);
    await run(800);
    const svg = container.querySelector('svg');
    expect(ref.current!.svg, 'the status drawing').toBe(svg);
    const marked = await playThrough(ref, 600);
    expect(
      [...marked.seen].every((s) => s === marked.rest),
      'nothing moved'
    ).toBe(true);
    expect(marked.done).toBe(true);

    // A count (the notification icons): the same.
    const n = createRef<MotionIconHandle>();
    const c = render(<Notification ref={n} count={3} />);
    expect(n.current!.svg).toBe(c.container.querySelector('svg'));
    let done = false;
    act(() => void n.current!.play().then(() => (done = true)));
    await settle();
    expect(done).toBe(true);
  });

  it('under reduced motion, or animated={false}, play() resolves at once and nothing moves; svg is the still drawing', async () => {
    useClock();
    reduceMotion();
    for (const [Icon, props] of [
      [Settings, {}],
      [BookmarkToggle, {}],
      [Save, {}],
      [Save, { status: 'success' }],
    ] as [ComponentType<{ ref?: React.Ref<MotionIconHandle> }>, object][]) {
      const ref = createRef<MotionIconHandle>();
      const { container, unmount } = render(<Icon ref={ref} {...props} />);
      const svg = container.querySelector('svg')!;
      expect(ref.current!.svg).toBe(svg);
      const rest = svg.innerHTML;
      let done = false;
      act(() => void ref.current!.play().then(() => (done = true)));
      await settle();
      expect(done).toBe(true);
      await run(300);
      expect(svg.innerHTML).toBe(rest);
      unmount();
    }
    vi.unstubAllGlobals();
    // animated={false}: Carbon's art (a hover icon's static, a toggle's state) or the still status drawing.
    for (const el of [
      <Settings animated={false} />,
      <Add animated={false} />,
      <BookmarkToggle animated={false} />,
      <BookmarkToggle animated={false} asButton />,
      <Save animated={false} status="error" />,
    ]) {
      const ref = createRef<MotionIconHandle>();
      const { container, unmount } = render(
        <el.type {...el.props} ref={ref} />
      );
      expect(ref.current!.svg).toBe(container.querySelector('svg'));
      let done = false;
      act(() => void ref.current!.play().then(() => (done = true)));
      await settle();
      expect(done).toBe(true);
      unmount();
    }
  });

  it('inside a disabled button frame, play() resolves at once and nothing moves', async () => {
    useClock();
    const ref = createRef<MotionIconHandle>();
    const { container } = render(
      <button type="button" disabled data-motion-icon-frame="">
        <Settings ref={ref} size={20} /> Settings
      </button>
    );
    const svg = container.querySelector('svg')!;
    const rest = svg.innerHTML;
    let done = false;
    act(() => void ref.current!.play().then(() => (done = true)));
    await settle();
    expect(done).toBe(true);
    const seen = new Set<string>();
    await run(400, () => seen.add(svg.innerHTML));
    expect([...seen]).toEqual([rest]);
  });

  it("while a hover shows, play() resolves at once and doesn't restart it; a pointer arriving mid-play ends the play", async () => {
    useClock();
    const ref = createRef<MotionIconHandle>();
    const { container } = render(<Settings ref={ref} />);
    const svg = container.querySelector('svg')!;
    const rest = svg.innerHTML;
    fireEvent.mouseEnter(svg);
    await run(400);
    const hovered = svg.innerHTML;
    let done = false;
    act(() => void ref.current!.play().then(() => (done = true)));
    await settle();
    expect(done, 'no-op').toBe(true);
    const seen = new Set<string>();
    await run(400, () => seen.add(svg.innerHTML));
    expect([...seen]).toEqual([hovered]);
    fireEvent.mouseLeave(svg);
    await run(800);
    expect(svg.innerHTML).toBe(rest);

    // Mid-play the pointer arrives: the play is over once the hover-in lands, and the icon stays hovered.
    done = false;
    act(() => void ref.current!.play().then(() => (done = true)));
    await run(50);
    fireEvent.mouseEnter(svg);
    await run(600);
    expect(done).toBe(true);
    expect(svg.innerHTML).toBe(hovered);
  });

  it('unmounted mid-play, the play resolves', async () => {
    useClock();
    const ref = createRef<MotionIconHandle>();
    const { unmount } = render(<Settings ref={ref} />);
    const handle = ref.current!;
    let done = false;
    act(() => void handle.play().then(() => (done = true)));
    await run(50);
    unmount();
    await settle();
    expect(done).toBe(true);
    expect(ref.current).toBeNull();
    expect(handle.svg).toBeNull();
    await expect(handle.play()).resolves.toBeUndefined();
  });

  it('every kind takes one: variants, state icons, aliases, the boolean state shorthand, StatusPip', async () => {
    useClock();
    const icons = [
      <PlayPauseToggle key="v" />,
      <PlayPauseToggle key="vf" variant="outline" filled />,
      <VolumeLevelToggle key="s" />,
      <CheckboxStateToggle key="cs" />,
      <ChevronDownUpToggle key="a" />,
      <SidePanelFilledToggle key="af" />,
      <SkillLevelToggle key="b" toggled />,
      <StatusPip key="p" count={3} />,
    ];
    for (const el of icons) {
      const ref = createRef<MotionIconHandle>();
      const { container, unmount } = render(
        <el.type {...el.props} ref={ref} />
      );
      expect(ref.current!.svg, el.type.displayName).toBe(
        container.querySelector('svg')
      );
      unmount();
    }
    // A variant plays its drawing's hover.
    const ref = createRef<MotionIconHandle>();
    render(<PlayPauseToggle ref={ref} />);
    const r = await playThrough(ref);
    expect(r.seen.size).toBeGreaterThan(3);
    expect(r.done).toBe(true);
    // StatusPip has no hover: play() resolves at once.
    const pip = createRef<MotionIconHandle>();
    render(<StatusPip ref={pip} count={2} />);
    let done = false;
    act(() => void pip.current!.play().then(() => (done = true)));
    await settle();
    expect(done).toBe(true);
  });

  it('a callback ref gets the handle once, and keeps it across re-renders', () => {
    const calls: (MotionIconHandle | null)[] = [];
    const cb = (h: MotionIconHandle | null) => void calls.push(h);
    const { rerender, unmount } = render(<BookmarkToggle ref={cb} />);
    rerender(<BookmarkToggle ref={cb} toggled />);
    rerender(<BookmarkToggle ref={cb} toggled={false} />);
    expect(calls).toHaveLength(1);
    expect(typeof calls[0]!.play).toBe('function');
    unmount();
    expect(calls).toEqual([calls[0], null]);
  });
});

describe('the binding follows the svg', () => {
  it("asButton false → true → false on a mounted toggle: pointer hover and ref play() work each time, with a fresh render's markup", async () => {
    useClock();
    const ref = createRef<MotionIconHandle>();
    const { container, rerender } = render(
      <BookmarkToggle ref={ref} aria-label="Bookmark" />
    );
    for (const asButton of [false, true, false]) {
      rerender(
        <BookmarkToggle ref={ref} aria-label="Bookmark" asButton={asButton} />
      );
      await run(100);
      const svg = container.querySelector('svg')!;
      expect(ref.current!.svg, `asButton=${asButton}`).toBe(svg);
      expect(!!container.querySelector('button'), `asButton=${asButton}`).toBe(
        asButton
      );
      // The same markup a fresh render draws.
      const fresh = render(
        <BookmarkToggle aria-label="Bookmark" asButton={asButton} />
      );
      expect(container.innerHTML).toBe(fresh.container.innerHTML);
      fresh.unmount();
      const rest = svg.innerHTML;
      // Pointer hover, on the new svg.
      fireEvent.mouseEnter(svg);
      await run(400);
      expect(svg.innerHTML, `pointer hovers, asButton=${asButton}`).not.toBe(
        rest
      );
      fireEvent.mouseLeave(svg);
      await run(600);
      expect(svg.innerHTML).toBe(rest);
      // Ref play(), on the new svg.
      const r = await playThrough(ref);
      expect(r.seen.size, `play() moves, asButton=${asButton}`).toBeGreaterThan(
        3
      );
      expect(r.done).toBe(true);
      expect(r.doneAt).toBe(rest);
    }
  });

  it('swapped mid-hover, the icon plays back out rather than resting hovered', async () => {
    useClock();
    const { container, rerender } = render(
      <BookmarkToggle aria-label="Bookmark" />
    );
    const rest = container.querySelector('svg')!.innerHTML;
    fireEvent.mouseEnter(container.querySelector('svg')!);
    await run(400);
    rerender(<BookmarkToggle aria-label="Bookmark" asButton />);
    await run(800);
    expect(container.querySelector('svg')!.innerHTML).toBe(rest);
  });
});

describe('a status icon handing back', () => {
  it('play() during the hand-back resolves when the hover-out lands, not when it starts', async () => {
    useClock();
    const ref = createRef<MotionIconHandle>();
    const { container, rerender } = render(<Save ref={ref} status="success" />);
    await run(600);
    const svg = container.querySelector('svg')!;
    // The pointer on it while the status clears: once the mark's exit has played, the base hovers in.
    fireEvent.mouseEnter(svg);
    rerender(<Save ref={ref} />);
    await run(1200);
    expect(ref.current!.svg, 'still the status drawing').toBe(svg);
    // The pointer leaves; one frame into the hover-out (the plain icon takes over only at rest), play().
    fireEvent.mouseLeave(svg);
    await run(16);
    let done = false;
    let p!: Promise<void>;
    act(() => {
      p = ref.current!.play();
    });
    void p.then(() => (done = true));
    const frames: { done: boolean; d: string }[] = [];
    await run(1500, () =>
      frames.push({ done, d: container.querySelector('svg')!.innerHTML })
    );
    const at = frames.findIndex((f) => f.done);
    expect(at, 'resolved').toBeGreaterThan(0);
    // It moved before resolving; from the frame it resolved on, nothing moves (it is back at rest).
    expect(new Set(frames.slice(0, at).map((f) => f.d)).size).toBeGreaterThan(
      3
    );
    expect(
      new Set(frames.slice(at).map((f) => f.d)).size,
      'nothing moves after it resolves'
    ).toBe(1);
  });
});

describe('a ref changes nothing else', () => {
  const cases: [
    string,
    ComponentType<Record<string, unknown>>,
    Record<string, unknown>,
  ][] = [
    ['hover', Settings as never, {}],
    ['hover, still', Add as never, { animated: false }],
    ['toggle', BookmarkToggle as never, { toggled: true }],
    [
      'toggle asButton',
      BookmarkToggle as never,
      { asButton: true, 'aria-label': 'Bookmark' },
    ],
    ['toggle, still', BookmarkToggle as never, { animated: false }],
    ['variant', PlayPauseToggle as never, { variant: 'outline' }],
    ['state', VolumeLevelToggle as never, {}],
    ['status', Save as never, { status: 'pending' }],
    ['count', Notification as never, { count: 12 }],
    ['pip', StatusPip as never, { count: 5 }],
  ];

  it.each(cases)('%s: the same markup, server and client', (_, Icon, props) => {
    const ref = createRef<MotionIconHandle>();
    expect(renderToStaticMarkup(<Icon {...props} ref={ref} />)).toBe(
      renderToStaticMarkup(<Icon {...props} />)
    );
    const a = render(<Icon {...props} />).container.innerHTML;
    cleanup();
    const b = render(<Icon {...props} ref={ref} />).container.innerHTML;
    expect(b).toBe(a);
    expect(ref.current!.svg).not.toBeNull();
  });

  it.each(cases)(
    '%s: no extra renders (mount and a re-render)',
    (_, Icon, props) => {
      const count = (withRef: boolean) => {
        let n = 0;
        const ref = createRef<MotionIconHandle>();
        const tree = (p: Record<string, unknown>) => (
          <Profiler id="icon" onRender={() => void n++}>
            <Icon {...p} {...(withRef ? { ref } : {})} />
          </Profiler>
        );
        const { rerender, unmount } = render(tree(props));
        rerender(tree({ ...props, className: 'x' }));
        unmount();
        return n;
      };
      expect(count(true)).toBe(count(false));
    }
  );

  it('play() renders no more than a pointer passing over does', async () => {
    useClock();
    let n = 0;
    const ref = createRef<MotionIconHandle>();
    const { container } = render(
      <Profiler id="icon" onRender={() => void n++}>
        <Settings ref={ref} />
      </Profiler>
    );
    const svg = container.querySelector('svg')!;
    n = 0;
    fireEvent.mouseEnter(svg);
    await run(400);
    fireEvent.mouseLeave(svg);
    await run(600);
    const pointer = n;
    n = 0;
    act(() => void ref.current!.play());
    await run(1000);
    expect(n).toBeLessThanOrEqual(pointer);
  });
});
