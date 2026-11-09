/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Actions in the web components, against React frame by frame: each pilot
 * icon's `el.trigger()` and the React ref's `trigger()` started at the same
 * instant on one fake clock paint the same drawings; then the loop / stop,
 * the hand-off (`then` and `until`), re-trigger, the attributes
 * (`action-key`, `action-on`, `loop`, `action-then`) and reduced motion.
 */
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import type React from 'react';
import { alignClock, diff, painted, setup, type Env } from './full/harness';
import {
  changed,
  DOM_LIMITS,
  domShapes,
  growthProblems,
  withoutTakeover,
} from '../../v12-motion-icons-core/test/growCheck';
import { OUT_BACK } from '../../v12-motion-icons-core/src/actionGeo';
import { motionTokens } from '../../v12-motion-icons-core/src/tokens';

/** A pass's length (ms): Save's out-and-back, Download's moderate-02, Renew's own half turn. */
const PASS = {
  Save: OUT_BACK * 1000,
  Download: motionTokens.duration.moderate02,
  Renew: 240,
} as const;

type Handle = {
  trigger(o?: object): Promise<void>;
  stop(): void;
  svg: SVGSVGElement | null;
};
type WC = HTMLElement & {
  updateComplete: Promise<unknown>;
  trigger(o?: object): Promise<void>;
  stop(): void;
};
const FRAME = 1000 / 60;
let e: Env;
beforeAll(async () => {
  e = await setup();
});
afterAll(() => vi.useRealTimers());
// Every test starts on the same phase of the fake clock, so any order (or subset) compares the same frames.
beforeEach(() => alignClock());

async function frames(ms: number, each: (t: number) => void) {
  for (let t = 0; t <= ms; t += FRAME) {
    each(t);
    e.act(() => vi.advanceTimersByTime(FRAME));
    await new Promise<void>((r) => setImmediate(r));
  }
}
const marks = (root: ParentNode) =>
  [...root.querySelectorAll('[data-k^="status-"]')].filter((x) =>
    x.getAttribute('d')
  ).length;

async function pair(
  name: string,
  tag: string,
  props: Record<string, unknown> = {}
) {
  const ref: { current: Handle | null } = { current: null };
  const C = e.lib[name] as React.FC<Record<string, unknown>>;
  const r = e.render(e.createElement(C, { ...props, animated: true, ref }));
  const el = document.createElement(tag) as WC;
  el.setAttribute('animated', '');
  for (const [k, v] of Object.entries(props)) el.setAttribute(k, String(v));
  document.body.append(el);
  await el.updateComplete;
  return { ref, r, el, unmount: () => (r.unmount(), el.remove()) };
}

describe.each([
  ['TrashCan', 'clabs-motion-icon-trash-can', 500],
  ['Copy', 'clabs-motion-icon-copy', 600],
  ['Send', 'clabs-motion-icon-send', 600],
  ['Notification', 'clabs-motion-icon-notification', 520],
  ['Renew', 'clabs-motion-icon-renew', 600],
  // Batch 1.
  ['Download', 'clabs-motion-icon-download', 420],
  ['Upload', 'clabs-motion-icon-upload', 420],
  ['Save', 'clabs-motion-icon-save', 400],
  ['Share', 'clabs-motion-icon-share', 420],
  ['Add', 'clabs-motion-icon-add', 400],
  ['Launch', 'clabs-motion-icon-launch', 400],
  ['Undo', 'clabs-motion-icon-undo', 400],
  ['Redo', 'clabs-motion-icon-redo', 400],
  ['Restart', 'clabs-motion-icon-restart', 420],
  ['Printer', 'clabs-motion-icon-printer', 420],
  ['Email', 'clabs-motion-icon-email', 420],
  ['Rocket', 'clabs-motion-icon-rocket', 500],
  // Brand.
  ['Bee', 'clabs-motion-icon-bee', 1000],
  // Piggy bank slot's coin drop (its hover is the action).
  ['PiggyBankSlot', 'clabs-motion-icon-piggy-bank-slot', 550],
  // Earth's turn (icons/earth-action).
  ['Earth', 'clabs-motion-icon-earth', 1100],
  ['EarthFilled', 'clabs-motion-icon-earth-filled', 1100],
] as const)('%s', (name, tag, ms) => {
  it('trigger() paints what React paints, frame by frame, and rests', async () => {
    for (const size of [16, 32]) {
      const p = await pair(name, tag, { size });
      const rest = painted(p.el.shadowRoot);
      e.act(() => {
        void p.ref.current!.trigger();
      });
      void p.el.trigger();
      await p.el.updateComplete;
      let moved = 0;
      await frames(ms, (t) => {
        const [w, r] = [painted(p.el.shadowRoot), painted(p.r.container)];
        const d = diff(w, r);
        expect(d, `${name} @${size} t=${t.toFixed(0)}`).toBeNull();
        if (JSON.stringify(w) !== JSON.stringify(rest)) moved++;
      });
      expect(moved).toBeGreaterThan(8);
      expect(painted(p.el.shadowRoot)).toEqual(rest);
      p.unmount();
    }
  });
});

it('Renew: loop then stop(), and the `until` hand-off to success, as React', async () => {
  const p = await pair('Renew', 'clabs-motion-icon-renew');
  let end!: () => void;
  const until = new Promise<void>((r) => (end = r));
  e.act(() => {
    void p.ref.current!.trigger({ until, then: { status: 'success' } });
  });
  void p.el.trigger({ until, then: { status: 'success' } });
  await p.el.updateComplete;
  await frames(1500, (t) =>
    expect(
      diff(painted(p.el.shadowRoot), painted(p.r.container)),
      `loop t=${t.toFixed(0)}`
    ).toBeNull()
  );
  await e.act(async () => end());
  await frames(1800, () => undefined);
  expect(marks(p.el.shadowRoot!)).toBeGreaterThan(0);
  expect(marks(p.r.container)).toBeGreaterThan(0);
  p.unmount();
});

it.each([
  ['Download', 'clabs-motion-icon-download'],
  ['Printer', 'clabs-motion-icon-printer'],
  ['Restart', 'clabs-motion-icon-restart'],
] as const)(
  'batch 1, %s: loop then stop() (one pass for those that do not loop), as React, frame by frame, to rest',
  async (name, tag) => {
    const p = await pair(name, tag);
    const rest = painted(p.el.shadowRoot);
    e.act(() => {
      void p.ref.current!.trigger({ loop: true });
    });
    void p.el.trigger({ loop: true });
    await p.el.updateComplete;
    await frames(1200, (t) =>
      expect(
        diff(painted(p.el.shadowRoot), painted(p.r.container)),
        `${name} loop t=${t.toFixed(0)}`
      ).toBeNull()
    );
    e.act(() => p.ref.current!.stop());
    p.el.stop();
    await frames(2100, (t) =>
      expect(
        diff(painted(p.el.shadowRoot), painted(p.r.container)),
        `${name} stopping t=${t.toFixed(0)}`
      ).toBeNull()
    );
    expect(painted(p.el.shadowRoot)).toEqual(rest);
    p.unmount();
  }
);

it.each([
  ['Save', 'clabs-motion-icon-save', 'success'],
  ['Printer', 'clabs-motion-icon-printer', 'success'],
  ['Share', 'clabs-motion-icon-share', 'success'],
  ['Email', 'clabs-motion-icon-email', 'notification'],
] as const)(
  'batch 1, %s: the hand-off to %s, as React, frame by frame',
  async (name, tag, status) => {
    const p = await pair(name, tag);
    e.act(() => {
      void p.ref.current!.trigger({ then: { status } });
    });
    void p.el.trigger({ then: { status } });
    await p.el.updateComplete;
    await frames(900, (t) =>
      expect(
        diff(painted(p.el.shadowRoot), painted(p.r.container)),
        `${name} t=${t.toFixed(0)}`
      ).toBeNull()
    );
    expect(marks(p.el.shadowRoot!)).toBeGreaterThan(0);
    expect(marks(p.r.container)).toBeGreaterThan(0);
    p.unmount();
  }
);

it('the hand-off begins as the action settles, its tail under the entering mark: the same as React, frame by frame', async () => {
  for (const [name, tag] of [
    ['Copy', 'clabs-motion-icon-copy'],
    ['Send', 'clabs-motion-icon-send'],
  ] as const) {
    const p = await pair(name, tag);
    e.act(() => {
      void p.ref.current!.trigger({ then: { status: 'success' } });
    });
    void p.el.trigger({ then: { status: 'success' } });
    await p.el.updateComplete;
    let first = -1;
    // React mounts its status engine on a render, which can fall a fraction of a frame off the clock: the frame it
    // takes the tail over on may show the tail a few ms behind (with the hand-off at half the pass). One such
    // frame, and every other the same.
    const off: string[] = [];
    await frames(900, (t) => {
      const [w, r] = [painted(p.el.shadowRoot), painted(p.r.container)];
      const d = diff(w, r);
      if (d) off.push(`${name} t=${t.toFixed(0)}: ${d}`);
      if (first < 0 && marks(p.el.shadowRoot!) > 0) first = t;
    });
    expect(off.length, off.join('\n')).toBeLessThanOrEqual(1);
    p.unmount();
    // The same status set at rest: how long its mark takes (the cut opens first).
    const q = await pair(name, tag);
    q.el.setAttribute('status', 'success');
    await q.el.updateComplete;
    let d = -1;
    await frames(900, (t) => {
      if (d < 0 && marks(q.el.shadowRoot!) > 0) d = t;
    });
    q.unmount();
    // The hand-off's mark is in about d after the settle (half the pass), not d after its end.
    const pass = 240; // Copy and Send
    expect(first - d, name).toBeLessThan(pass / 2 + 30);
  }
});

it.each([
  ['clabs-motion-icon-copy', 600, undefined],
  ['clabs-motion-icon-renew', 1700, 600],
] as const)(
  '%s: the hand-off’s knockout grows as every status cut does (growCheck.ts; a twin draws the uncut base)',
  async (tag, ms, stopAt) => {
    const make = async () => {
      const el = document.createElement(tag) as WC;
      el.setAttribute('animated', '');
      document.body.append(el);
      await el.updateComplete;
      return el;
    };
    const [hand, twin] = [await make(), await make()];
    let end1!: () => void;
    let end2!: () => void;
    const u1 = new Promise<void>((r) => (end1 = r));
    const u2 = new Promise<void>((r) => (end2 = r));
    void hand.trigger({
      ...(stopAt !== undefined && { until: u1 }),
      then: { status: 'success' },
    });
    void twin.trigger(stopAt !== undefined ? { until: u2 } : undefined);
    const removed: number[] = [];
    await frames(ms, (t) => {
      if (stopAt !== undefined && Math.abs(t - stopAt) < FRAME / 2) {
        end1();
        end2();
      }
      removed.push(
        changed(domShapes(twin.shadowRoot!), domShapes(hand.shadowRoot!))
      );
    });
    expect(removed.at(-1)!, tag).toBeGreaterThan(1);
    expect(
      growthProblems(
        withoutTakeover(removed),
        'in',
        `${tag} hand-off`,
        DOM_LIMITS
      ).join('\n')
    ).toBe('');
    hand.remove();
    twin.remove();
  }
);

it('Copy: action-on="click" and action-then hand off to success', async () => {
  const el = document.createElement('clabs-motion-icon-copy') as WC;
  el.setAttribute('animated', '');
  el.setAttribute('action-on', 'click');
  el.setAttribute('action-then', 'success');
  document.body.append(el);
  await el.updateComplete;
  el.click();
  await frames(150, () => undefined);
  expect(marks(el.shadowRoot!)).toBe(0);
  await frames(700, () => undefined);
  expect(marks(el.shadowRoot!)).toBeGreaterThan(0);
  el.remove();
});

it('action-key plays when it changes, not on the first value; loop / remove loop', async () => {
  const el = document.createElement('clabs-motion-icon-trash-can') as WC;
  el.setAttribute('animated', '');
  el.setAttribute('action-key', '0');
  document.body.append(el);
  await el.updateComplete;
  const rest = painted(el.shadowRoot);
  await frames(100, () => expect(painted(el.shadowRoot)).toEqual(rest));
  el.setAttribute('action-key', '1');
  await el.updateComplete;
  let moved = 0;
  await frames(
    400,
    () =>
      JSON.stringify(painted(el.shadowRoot)) !== JSON.stringify(rest) && moved++
  );
  expect(moved).toBeGreaterThan(5);
  el.remove();

  const renew = document.createElement(
    'clabs-motion-icon-renew'
  ) as unknown as WC & { controller: { acting: boolean } };
  renew.setAttribute('animated', '');
  renew.setAttribute('loop', '');
  document.body.append(renew);
  await renew.updateComplete;
  await frames(1000, () => undefined);
  expect(renew.controller.acting).toBe(true);
  renew.removeAttribute('loop');
  await renew.updateComplete;
  await frames(1400, () => undefined);
  expect(renew.controller.acting).toBe(false);
  renew.remove();
});

it('animated="false": nothing plays, the hand-off status applies at once', async () => {
  const el = document.createElement('clabs-motion-icon-copy') as WC;
  el.setAttribute('animated', 'false');
  document.body.append(el);
  await el.updateComplete;
  const before = el.shadowRoot!.innerHTML;
  await el.trigger();
  expect(el.shadowRoot!.innerHTML).toBe(before);
  await el.trigger({ then: { status: 'success' } });
  await el.updateComplete;
  expect(el.shadowRoot!.querySelector('[data-k^="status-"]')).not.toBeNull();
  el.remove();
});

it('elements without an action: trigger() resolves at once and warns once, stop() and the action attributes do nothing', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  for (const tag of [
    'clabs-motion-icon-subtract',
    'clabs-motion-icon-settings',
  ]) {
    const el = document.createElement(tag) as WC;
    el.setAttribute('animated', '');
    el.setAttribute('action-on', 'click');
    el.setAttribute('loop', '');
    document.body.append(el);
    await el.updateComplete;
    const before = el.shadowRoot!.innerHTML;
    await el.trigger({ then: { status: 'success' } });
    await el.trigger();
    el.stop();
    el.setAttribute('action-key', '2');
    el.click();
    await el.updateComplete;
    await frames(400, () => undefined);
    expect(el.shadowRoot!.innerHTML, tag).toBe(before);
    expect(marks(el.shadowRoot!), tag).toBe(0);
    expect(
      warn.mock.calls.filter(([m]) =>
        String(m).includes(`<${tag}> has no action`)
      ),
      tag
    ).toHaveLength(1);
    expect('actionKey' in el, tag).toBe(false);
    el.remove();
  }
  warn.mockRestore();
});

describe('an action blocks the hover: React and WC alike', () => {
  /** Pointer events on both: React's svg and the element. */
  const hoverBoth = (
    p: Awaited<ReturnType<typeof pair>>,
    ev: 'mouseEnter' | 'mouseLeave'
  ) => {
    e.act(() => {
      e.fireEvent[ev](p.r.container.querySelector('svg')!);
      p.el.dispatchEvent(new MouseEvent(ev.toLowerCase()));
    });
  };

  it.each([
    ['Download', 'clabs-motion-icon-download', undefined],
    ['Save', 'clabs-motion-icon-save', 'success'],
    ['Renew', 'clabs-motion-icon-renew', 'success'],
  ] as const)(
    '%s: hover during the action changes no frame (as a twin with none), and both settle alike after it',
    async (name, tag, status) => {
      const p = await pair(name, tag);
      const twin = await pair(name, tag);
      const o = status ? { then: { status } } : undefined;
      e.act(() => {
        void p.ref.current!.trigger(o);
        void twin.ref.current!.trigger(o);
      });
      void p.el.trigger(o);
      void twin.el.trigger(o);
      await p.el.updateComplete;
      let f = 0;
      const end = PASS[name];
      await frames(700, (t) => {
        // In, out, and in again before the hand-off (from half way through the pass): the pointer is over the icon as it hands off.
        if (f === 1) hoverBoth(p, 'mouseEnter');
        if (f === 3) hoverBoth(p, 'mouseLeave');
        if (f === 5) hoverBoth(p, 'mouseEnter');
        f++;
        // React and WC the same, every frame, through the action and the hover settling after it.
        expect(
          diff(painted(p.el.shadowRoot), painted(p.r.container)),
          `${name} t=${t.toFixed(0)}`
        ).toBeNull();
        // While it plays (and through a hand-off): the same drawing as the twin's, which saw no hover.
        if (t < end || status)
          expect(
            diff(painted(p.el.shadowRoot), painted(twin.el.shadowRoot)),
            `${name} vs twin t=${t.toFixed(0)}`
          ).toBeNull();
      });
      // Over, after a pass with no status: the hover has eased in since (the twin, never hovered, is at rest).
      if (!status)
        expect(
          diff(painted(p.el.shadowRoot), painted(twin.el.shadowRoot)),
          `${name} hovered after`
        ).not.toBeNull();
      p.unmount();
      twin.unmount();
    }
  );

  it.each([
    ['Download', 'clabs-motion-icon-download', undefined],
    ['Save', 'clabs-motion-icon-save', 'success'],
  ] as const)(
    '%s: keyboard focus on its frame during the action changes no frame (as a twin with none); still focused at the end, the hover eases in',
    async (name, tag, status) => {
      // The block through the binding's other way in: focus on the marked frame (bindHover). One element holds focus
      // at a time, so each binding is checked against its own twin (React's in hooks/action.test.tsx). jsdom matches
      // :focus-visible as :focus: this is keyboard focus.
      for (const stay of [true, false]) {
        const framed = async () => {
          const frame = document.createElement('button');
          frame.setAttribute('data-motion-icon-frame', '');
          const el = document.createElement(tag) as WC;
          el.setAttribute('animated', '');
          frame.append(el);
          document.body.append(frame);
          await el.updateComplete;
          return { frame, el };
        };
        const [a, b] = [await framed(), await framed()];
        const o = status ? { then: { status } } : undefined;
        void a.el.trigger(o);
        void b.el.trigger(o);
        await a.el.updateComplete;
        let f = 0;
        await frames(700, (t) => {
          if (f === 2) a.frame.focus();
          if (f === 6 && !stay) a.frame.blur();
          f++;
          // While it plays (and through a hand-off): the twin's drawing.
          if (t < PASS[name] || status)
            expect(
              diff(painted(a.el.shadowRoot), painted(b.el.shadowRoot)),
              `${name} t=${t.toFixed(0)}${stay ? '' : ', blurred'}`
            ).toBeNull();
        });
        // Download over: still focused, it has eased into the hover since; blurred, it rests as the twin.
        if (!status && stay)
          expect(
            diff(painted(a.el.shadowRoot), painted(b.el.shadowRoot)),
            `${name} focused after`
          ).not.toBeNull();
        if (!status && !stay)
          expect(
            diff(painted(a.el.shadowRoot), painted(b.el.shadowRoot)),
            `${name} blurred after`
          ).toBeNull();
        a.frame.remove();
        b.frame.remove();
      }
    }
  );

  it('Download looping: hover changes no frame until stop() has run out, React and WC alike', async () => {
    const p = await pair('Download', 'clabs-motion-icon-download');
    e.act(() => void p.ref.current!.trigger({ loop: true }));
    void p.el.trigger({ loop: true });
    await p.el.updateComplete;
    let f = 0;
    await frames(400, (t) => {
      if (f % 4 === 1) hoverBoth(p, f % 8 === 1 ? 'mouseEnter' : 'mouseLeave');
      f++;
      expect(
        diff(painted(p.el.shadowRoot), painted(p.r.container)),
        `t=${t.toFixed(0)}`
      ).toBeNull();
    });
    p.unmount();
  });
});
