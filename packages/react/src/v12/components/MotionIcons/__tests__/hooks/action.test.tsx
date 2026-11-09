/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Actions in React: the ref handle's trigger() / stop(),
 * `actionKey`, `actionOn="click"`, `loop` and `actionThen`, on a hover icon
 * (TrashCan) and the status icons (Copy, Send, Notification, Renew):
 *  - it plays once and rests, and the promise resolves;
 *  - re-triggering mid-play restarts it;
 *  - loop / stop: a loop runs until stopped, finishing its pass;
 *  - the hand-off: `then` shows the status after the action, for `for` ms;
 *    `until` loops until it settles, then `then` or `failed`; a status
 *    prop arriving mid-loop waits for the turn to finish;
 *  - under reduced motion nothing plays and the status applies at once;
 *  - an icon without an action has the same API, and carries none of it:
 *    trigger() resolves at once and warns once, stop() does nothing, and
 *    a status icon hands off to nothing.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRef, type RefObject } from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import {
  manualScheduler,
  setScheduler,
} from '@carbon-labs/motion-icons-core/engine/animate';
import { motionTokens } from '@carbon-labs/motion-icons-core/tokens';
import {
  changed,
  DOM_LIMITS,
  domShapes,
  growthProblems,
  withoutTakeover,
} from '../../../../../../../v12-motion-icons-core/test/growCheck';
import {
  Add,
  BookmarkToggle,
  Copy,
  Download,
  Email,
  Launch,
  Notification,
  Printer,
  Redo,
  Renew,
  Restart,
  Rocket,
  Save,
  Send,
  Settings,
  Share,
  Subtract,
  TrashCan,
  Undo,
  Upload,
  type MotionIconHandle,
} from '../../index';

let clock: ReturnType<typeof manualScheduler>;
afterEach(() => {
  cleanup();
  setScheduler(null);
  vi.unstubAllGlobals();
});
function startClock() {
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
async function run(ms: number, each?: () => void) {
  for (let t = 0; t < ms; t += 1000 / 60) {
    clock.advance(1000 / 60);
    await act(async () => {
      await Promise.resolve();
    });
    each?.();
  }
}
const settle = () =>
  act(async () => {
    for (let i = 0; i < 6; i++) await Promise.resolve();
  });
const marks = (c: HTMLElement) =>
  [...c.querySelectorAll('[data-k^="status-"]')].filter((e) =>
    e.getAttribute('d')
  ).length;

/** trigger() through the ref: whether it resolved, and the drawings seen while it played. */
async function trigger(
  ref: RefObject<MotionIconHandle | null>,
  opts?: Parameters<MotionIconHandle['trigger']>[0],
  ms = 800
) {
  const svg = () => ref.current!.svg!;
  const rest = svg().innerHTML;
  let done = false;
  act(() => {
    void ref.current!.trigger(opts).then(() => (done = true));
  });
  const seen = new Set<string>();
  await run(ms, () => !done && seen.add(svg().innerHTML));
  await settle();
  return { done, seen, rest, end: svg().innerHTML };
}

describe.each([
  ['TrashCan', TrashCan],
  ['Copy', Copy],
  ['Send', Send],
  ['Notification', Notification],
  ['Renew', Renew],
  // Batch 1.
  ['Download', Download],
  ['Upload', Upload],
  ['Save', Save],
  ['Share', Share],
  ['Add', Add],
  ['Launch', Launch],
  ['Undo', Undo],
  ['Redo', Redo],
  ['Restart', Restart],
  ['Printer', Printer],
  ['Email', Email],
  ['Rocket', Rocket],
] as const)('%s: ref.trigger()', (_, Icon) => {
  it('plays once, rests where it started, and resolves', async () => {
    startClock();
    const ref = createRef<MotionIconHandle>();
    render(<Icon ref={ref} animated />);
    const r = await trigger(ref);
    expect(r.done).toBe(true);
    expect(r.seen.size).toBeGreaterThan(8);
    expect(r.end).toBe(r.rest);
  });

  it('under reduced motion: plays nothing, resolves at once', async () => {
    reduceMotion();
    startClock();
    const ref = createRef<MotionIconHandle>();
    render(<Icon ref={ref} />);
    const before = ref.current!.svg!.innerHTML;
    let done = false;
    act(() => {
      void ref.current!.trigger().then(() => (done = true));
    });
    await settle();
    expect(done).toBe(true);
    expect(ref.current!.svg!.innerHTML).toBe(before);
  });
});

describe('re-trigger, loop and stop', () => {
  it('a trigger mid-play restarts it (the first resolves at once, the second when it is over)', async () => {
    startClock();
    const ref = createRef<MotionIconHandle>();
    render(<Send ref={ref} animated />);
    const seen: boolean[] = [];
    act(() => void ref.current!.trigger().then(() => seen.push(true)));
    await run(100);
    act(() => void ref.current!.trigger().then(() => seen.push(true)));
    await settle();
    expect(seen).toEqual([true]);
    await run(150);
    expect(seen).toEqual([true]);
    await run(250);
    expect(seen).toEqual([true, true]);
  });

  it('Renew loops until stop(), finishes its turn, and rests', async () => {
    startClock();
    const ref = createRef<MotionIconHandle>();
    render(<Renew ref={ref} animated />);
    const rest = ref.current!.svg!.innerHTML;
    let done = false;
    act(
      () => void ref.current!.trigger({ loop: true }).then(() => (done = true))
    );
    await run(2000);
    expect(done).toBe(false);
    act(() => ref.current!.stop());
    await run(1400);
    await settle();
    expect(done).toBe(true);
    expect(ref.current!.svg!.innerHTML).toBe(rest);
  });

  it.each([
    ['Download', Download],
    ['Upload', Upload],
    ['Printer', Printer],
    ['Restart', Restart],
  ] as const)(
    'batch 1: %s does not loop (review rounds 2 and 3): a loop trigger plays one pass and rests',
    async (_, Icon) => {
      startClock();
      const ref = createRef<MotionIconHandle>();
      render(<Icon ref={ref} animated />);
      const rest = ref.current!.svg!.innerHTML;
      let done = false;
      act(
        () =>
          void ref.current!.trigger({ loop: true }).then(() => (done = true))
      );
      await run(400);
      await settle();
      expect(done).toBe(true);
      expect(ref.current!.svg!.innerHTML).toBe(rest);
    }
  );

  it.each([
    ['Rocket (passes)', Rocket],
    ['Undo (passes)', Undo],
  ] as const)(
    'batch 1: %s loops until stop(), runs out to rest',
    async (_, Icon) => {
      startClock();
      const ref = createRef<MotionIconHandle>();
      render(<Icon ref={ref} animated />);
      const rest = ref.current!.svg!.innerHTML;
      let done = false;
      const seen = new Set<string>();
      act(
        () =>
          void ref.current!.trigger({ loop: true }).then(() => (done = true))
      );
      await run(1800, () => seen.add(ref.current!.svg!.innerHTML));
      expect(done).toBe(false);
      expect(seen.size).toBeGreaterThan(8);
      act(() => ref.current!.stop());
      await run(2200);
      await settle();
      expect(done).toBe(true);
      expect(ref.current!.svg!.innerHTML).toBe(rest);
    }
  );
});

describe('the hand-off to a status', () => {
  it.each([
    ['Save', Save, 'success'],
    ['Printer', Printer, 'success'],
    ['Share', Share, 'success'],
    ['Email', Email, 'notification'],
  ] as const)(
    'batch 1: %s hands off to %s as it settles, and the mark clears after `for`',
    async (_, Icon, status) => {
      startClock();
      const ref = createRef<MotionIconHandle>();
      const { container } = render(<Icon ref={ref} animated />);
      act(() => void ref.current!.trigger({ then: { status, for: 1000 } }));
      await run(100);
      expect(marks(container)).toBe(0); // still acting, before the settle
      await run(700);
      expect(marks(container)).toBeGreaterThan(0);
      await act(() => new Promise((r) => setTimeout(r, 1100)));
      await run(1200);
      await settle();
      expect(marks(container)).toBe(0);
    }
  );

  it('batch 1 under reduced motion: Save’s hand-off applies at once', async () => {
    reduceMotion();
    startClock();
    const ref = createRef<MotionIconHandle>();
    const { container } = render(<Save ref={ref} />);
    await act(async () => {
      await ref.current!.trigger({ then: { status: 'success' } });
    });
    await settle();
    expect(marks(container)).toBeGreaterThan(0);
  });

  it('Copy: the action, then success for `for` ms, then the plain icon', async () => {
    startClock();
    const ref = createRef<MotionIconHandle>();
    const { container } = render(<Copy ref={ref} animated />);
    // `for` is wall-clock time (a timer), the motion runs on the manual clock: 1s leaves room for a loaded machine.
    act(
      () =>
        void ref.current!.trigger({ then: { status: 'success', for: 1000 } })
    );
    await run(120);
    expect(marks(container)).toBe(0); // still acting, before the settle (160ms)
    await run(700);
    expect(marks(container)).toBeGreaterThan(0); // the mark is in
    // Then the timer clears it, and the mark plays out on the animation clock.
    await act(() => new Promise((r) => setTimeout(r, 1100)));
    await run(1200);
    await settle();
    expect(marks(container)).toBe(0);
  });

  it('Renew: `until` loops while syncing, then success; `failed` when it rejects', async () => {
    for (const ok of [true, false]) {
      startClock();
      const ref = createRef<MotionIconHandle>();
      const { container, unmount } = render(<Renew ref={ref} animated />);
      let finish!: () => void;
      const sync = new Promise<void>(
        (res, rej) => (finish = ok ? res : () => rej(new Error('offline')))
      );
      act(
        () =>
          void ref.current!.trigger({
            until: sync,
            then: { status: 'success' },
            failed: { status: 'error' },
          })
      );
      await run(1500);
      expect(marks(container)).toBe(0);
      await act(async () => finish());
      await run(1600);
      await settle();
      const mark = container.querySelector(
        '[data-k^="status-"][d]:not([d=""])'
      );
      expect(mark, ok ? 'success' : 'error').not.toBeNull();
      unmount();
    }
  });

  it('a status prop arriving mid-loop waits for the turn to finish', async () => {
    startClock();
    const { container, rerender } = render(<Renew animated loop />);
    await run(1000);
    rerender(<Renew animated loop={false} status="success" />);
    await run(50);
    expect(marks(container)).toBe(0); // the turn finishes first
    await run(1600);
    await settle();
    expect(marks(container)).toBeGreaterThan(0);
  });

  it('under reduced motion the status applies at once', async () => {
    reduceMotion();
    startClock();
    const ref = createRef<MotionIconHandle>();
    const { container } = render(<Copy ref={ref} />);
    await act(async () => {
      await ref.current!.trigger({ then: { status: 'success' } });
    });
    await settle();
    expect(marks(container)).toBeGreaterThan(0);
  });
});

describe('declarative actions', () => {
  it('actionKey plays when it changes, not on mount', async () => {
    startClock();
    const { container, rerender } = render(<TrashCan animated actionKey={0} />);
    const rest = container.innerHTML;
    await run(100);
    expect(container.innerHTML).toBe(rest);
    rerender(<TrashCan animated actionKey={1} />);
    const seen = new Set<string>();
    await run(400, () => seen.add(container.innerHTML));
    expect(seen.size).toBeGreaterThan(5);
  });

  it('actionOn="click" plays on the icon’s click (and still calls onClick)', async () => {
    startClock();
    const onClick = vi.fn();
    const { container } = render(
      <Notification animated actionOn="click" onClick={onClick} />
    );
    const rest = container.innerHTML;
    fireEvent.click(container.querySelector('svg')!);
    expect(onClick).toHaveBeenCalled();
    const seen = new Set<string>();
    await run(300, () => seen.add(container.innerHTML));
    expect([...seen].some((s) => s !== rest)).toBe(true);
  });

  it('loop with actionThen: the turn finishes, then the status', async () => {
    startClock();
    const { container, rerender } = render(
      <Renew animated loop actionThen={{ status: 'success' }} />
    );
    await run(1000);
    rerender(
      <Renew animated loop={false} actionThen={{ status: 'success' }} />
    );
    await run(1600);
    await settle();
    expect(marks(container)).toBeGreaterThan(0);
  });
});

describe('the hand-off begins as the action settles', () => {
  it('Copy: the mark enters in the action’s last half, the pages still growing back under it', async () => {
    startClock();
    const ref = createRef<MotionIconHandle>();
    const { container } = render(<Copy ref={ref} animated />);
    const front = () =>
      container.querySelector('[data-k="front"]')?.getAttribute('d');
    const firstMark = async (limit = 1500) => {
      let ms = 0;
      while (!marks(container) && ms < limit) {
        await run(1000 / 60);
        ms += 1000 / 60;
      }
      return ms;
    };
    // How long a status set at rest takes to draw its mark (the cut opens first).
    const plain = render(<Copy animated />);
    plain.rerender(<Copy animated status="success" />);
    let d = 0;
    while (
      !plain.container.querySelector('[data-k^="status-"][d]:not([d=""])') &&
      d < 1500
    ) {
      await run(1000 / 60);
      d += 1000 / 60;
    }
    plain.unmount();
    let done = false;
    act(
      () =>
        void ref
          .current!.trigger({ then: { status: 'success' } })
          .then(() => (done = true))
    );
    // The cut opens at the settle (120ms), while the action's last half plays under it.
    await run(180);
    const mid = front();
    await run(34);
    expect(front()).not.toBe(mid);
    const at = 214 + (await firstMark());
    // The mark is in about d after the settle (120ms), not d after the end (240ms).
    expect(at - d).toBeLessThan(170);
    await run(600);
    await settle();
    expect(done).toBe(true);
    expect(marks(container)).toBeGreaterThan(0);
    const end = front();
    await run(100);
    expect(front()).toBe(end); // at rest under the mark
  });

  it('Renew: a stopped loop runs out to the next half turn and hands off to success as it settles', async () => {
    startClock();
    const ref = createRef<MotionIconHandle>();
    const { container } = render(<Renew ref={ref} animated />);
    let end!: () => void;
    const until = new Promise<void>((r) => (end = r));
    act(
      () => void ref.current!.trigger({ until, then: { status: 'success' } })
    );
    await run(2000);
    expect(marks(container)).toBe(0);
    await act(async () => end());
    // The run-out is at most 2 × 1.15 × a period (slow-02, 520ms); success begins in its last half.
    let ms = 0;
    while (!marks(container) && ms < 2500) {
      await run(1000 / 60);
      ms += 1000 / 60;
    }
    expect(marks(container)).toBeGreaterThan(0);
    expect(ms).toBeLessThan(
      2 * 1.15 * motionTokens.duration.slow02 * (1 / 2) + 100
    );
  });
});

describe('the hand-off’s cut grows from nothing', () => {
  // A twin plays the same action on the same clock without the hand-off: it draws the uncut base, frame for frame.
  it.each([
    ['Copy', Copy, 600, undefined],
    ['Renew', Renew, 1700, 600],
  ] as const)(
    '%s: the knockout grows as every status cut does (growCheck.ts)',
    async (name, Icon, ms, stopAt) => {
      startClock();
      const [r1, r2] = [
        createRef<MotionIconHandle>(),
        createRef<MotionIconHandle>(),
      ];
      const a = render(<Icon ref={r1} animated />);
      const b = render(<Icon ref={r2} animated />);
      let end1!: () => void;
      let end2!: () => void;
      const u1 = new Promise<void>((res) => (end1 = res));
      const u2 = new Promise<void>((res) => (end2 = res));
      act(() => {
        void r1.current!.trigger({
          ...(stopAt !== undefined && { until: u1 }),
          then: { status: 'success' },
        });
        void r2.current!.trigger(
          stopAt !== undefined ? { until: u2 } : undefined
        );
      });
      const removed: number[] = [];
      for (let t = 0; t <= ms; t += 1000 / 60) {
        if (stopAt !== undefined && Math.abs(t - stopAt) < 1000 / 120)
          await act(async () => (end1(), end2()));
        removed.push(changed(domShapes(b.container), domShapes(a.container)));
        await run(1000 / 60);
      }
      await settle();
      expect(removed.at(-1)!, name).toBeGreaterThan(1);
      expect(
        removed.findIndex((x) => x > 0.3),
        name
      ).toBeGreaterThan(0);
      expect(
        growthProblems(
          withoutTakeover(removed),
          'in',
          `${name} hand-off`,
          DOM_LIMITS
        ).join('\n')
      ).toBe('');
    }
  );
});

describe('an action blocks the hover', () => {
  /** The icon and a twin on one clock; `hover` gets the pointer events, the twin none. */
  function pair(Icon: typeof Download | typeof Save) {
    const [a, b] = [
      createRef<MotionIconHandle>(),
      createRef<MotionIconHandle>(),
    ];
    render(<Icon ref={a} animated />);
    render(<Icon ref={b} animated />);
    return {
      a,
      b,
      hover: (ev: 'mouseEnter' | 'mouseLeave') =>
        act(() => void fireEvent[ev](a.current!.svg!)),
    };
  }

  it.each([
    ['Download', Download],
    ['Save (hands off to success)', Save],
  ] as const)(
    '%s: pointer enter / leave during the action (and its hand-off) changes no frame',
    async (_, Icon) => {
      startClock();
      const { a, b, hover } = pair(Icon);
      const then = { status: 'success', for: 100000 };
      act(() => {
        void a.current!.trigger({ then });
        void b.current!.trigger({ then });
      });
      let f = 0;
      await run(400, () => {
        if (f === 2) hover('mouseEnter');
        if (f === 5) hover('mouseLeave');
        if (f === 8) hover('mouseEnter');
        // While the action plays (and, for Save, its hand-off and status): the same drawing as the twin's.
        if (f * (1000 / 60) < 220 || Icon === Save)
          expect(a.current!.svg!.innerHTML, `frame ${f}`).toBe(
            b.current!.svg!.innerHTML
          );
        f++;
      });
    }
  );

  it('Download: the pointer still over when it ends, the hover eases in from rest; gone, it stays at rest', async () => {
    for (const stay of [true, false]) {
      startClock();
      const { a, b, hover } = pair(Download);
      act(() => {
        void a.current!.trigger();
        void b.current!.trigger();
      });
      await run(50);
      hover('mouseEnter');
      if (!stay) hover('mouseLeave');
      await run(250);
      const [rest, end] = [
        b.current!.svg!.innerHTML,
        a.current!.svg!.innerHTML,
      ];
      // Over: it has eased into the hover since (not the rest drawing); gone: the rest drawing.
      if (stay) expect(end).not.toBe(rest);
      else expect(end).toBe(rest);
      cleanup();
    }
  });

  it.each([
    ['Download', Download, undefined],
    ['Save (hands off to success)', Save, { status: 'success', for: 100000 }],
  ] as const)(
    '%s: keyboard focus on its frame during the action changes no frame; still focused at the end, the hover eases in',
    async (_, Icon, then) => {
      // The same block as the pointer's, through the binding's other way in: focus on the marked frame (bindHover).
      // jsdom matches :focus-visible as :focus, so this focus is keyboard focus.
      for (const stay of [true, false]) {
        startClock();
        const [a, b] = [
          createRef<MotionIconHandle>(),
          createRef<MotionIconHandle>(),
        ];
        render(
          <button type="button" data-motion-icon-frame="" data-testid="frame">
            <Icon ref={a} animated />
          </button>
        );
        render(
          <button type="button" data-motion-icon-frame="">
            <Icon ref={b} animated />
          </button>
        );
        const frame = document.querySelector<HTMLButtonElement>(
          '[data-testid=frame]'
        )!;
        act(() => {
          void a.current!.trigger(then && { then });
          void b.current!.trigger(then && { then });
        });
        let f = 0;
        await run(400, () => {
          if (f === 2) act(() => frame.focus());
          if (f === 6 && !stay) act(() => frame.blur());
          // While the action plays (and, for Save, its hand-off and status): the twin's drawing, which had no focus.
          if (f * (1000 / 60) < 220 || then)
            expect(
              a.current!.svg!.innerHTML,
              `frame ${f}${stay ? '' : ', blurred'}`
            ).toBe(b.current!.svg!.innerHTML);
          f++;
        });
        // Download over: still focused, it has eased into the hover since; blurred, it rests as the twin.
        if (!then) {
          if (stay)
            expect(a.current!.svg!.innerHTML).not.toBe(
              b.current!.svg!.innerHTML
            );
          else
            expect(a.current!.svg!.innerHTML).toBe(b.current!.svg!.innerHTML);
        }
        cleanup();
      }
    }
  );

  it('a trigger while the hand-off status shows, under the pointer: the action plays at once', async () => {
    startClock();
    const ref = createRef<MotionIconHandle>();
    const { container } = render(<Save ref={ref} animated />);
    act(() => void fireEvent.mouseEnter(ref.current!.svg!));
    await run(200);
    act(() => void ref.current!.trigger({ then: { status: 'success' } }));
    await run(600);
    expect(marks(container)).toBeGreaterThan(0);
    const seen = new Set<string>();
    act(() => void ref.current!.trigger({ then: { status: 'success' } }));
    await run(300, () => seen.add(ref.current!.svg!.innerHTML));
    // The mark clears and the disk is pressed again: many drawings (it waited, hovered, until the pointer left).
    expect(seen.size).toBeGreaterThan(8);
  });
});

describe('icons without an action', () => {
  it('have trigger() and stop(): trigger() resolves at once and warns once per icon; nothing moves', async () => {
    startClock();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    for (const [name, C] of [
      ['Subtract', Subtract],
      ['BookmarkToggle', BookmarkToggle],
      ['Settings', Settings],
    ] as const) {
      const ref = createRef<MotionIconHandle>();
      const { container } = render(<C ref={ref} animated />);
      const before = container.innerHTML;
      let done = false;
      act(() => {
        void ref
          .current!.trigger({ then: { status: 'success' } })
          .then(() => (done = true));
        void ref.current!.trigger();
        ref.current!.stop();
      });
      await settle();
      expect(done, name).toBe(true);
      await run(600);
      // No motion, and no hand-off (a status icon without an action shows nothing).
      expect(container.innerHTML, name).toBe(before);
      expect(marks(container), name).toBe(0);
      expect(
        warn.mock.calls.filter(([m]) =>
          String(m).includes(`${name} has no action`)
        ),
        name
      ).toHaveLength(1);
      cleanup();
    }
    warn.mockRestore();
  });

  it('ignore the action props', async () => {
    startClock();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const onClick = vi.fn();
    const { container, rerender } = render(
      <Subtract
        animated
        actionKey={1}
        actionOn="click"
        loop
        onClick={onClick}
      />
    );
    const before = container.innerHTML;
    rerender(
      <Subtract
        animated
        actionKey={2}
        actionOn="click"
        loop
        onClick={onClick}
      />
    );
    fireEvent.click(container.querySelector('svg')!);
    await run(400);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(container.innerHTML).toBe(before);
    warn.mockRestore();
  });
});
