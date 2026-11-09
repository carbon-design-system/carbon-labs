/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Parity: the web components paint the same SVG as the React components, at
 * rest and frame by frame through hover, toggle and status changes.
 *
 * Both run on ONE fake clock (both packages tween on the core's `animate`,
 * which reads rAF / performance.now when it runs). A test starts the same change on both
 * at the same fake instant (React: a DOM event or a rerender inside act;
 * the element: the same DOM event, or an attribute plus `updateComplete`),
 * then advances the clock frame by frame and compares every painted element
 * (`[data-k]`): the same keys in the same order, the same attributes, and
 * path data equal number for number within 0.01.
 *
 * These are the spike's targeted scenarios (controlled toggles, drawing
 * swaps, status runs, the pip); test/full/ runs every element.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type React from 'react';

type Painted = { k: string; attrs: Record<string, string> }[];

// ── Loaded after the fake clock is installed ────────────────────────────────
let R: {
  render: typeof import('@testing-library/react').render;
  act: typeof import('react').act;
  fireEvent: typeof import('@testing-library/react').fireEvent;
  createElement: typeof import('react').createElement;
  Settings: React.FC<Record<string, unknown>>;
  Notification: React.FC<Record<string, unknown>>;
  BookmarkToggle: React.FC<Record<string, unknown>>;
  PlayPauseToggle: React.FC<Record<string, unknown>>;
  MenuToggle: React.FC<Record<string, unknown>>;
  CopyToggle: React.FC<Record<string, unknown>>;
  ProgressStep: React.FC<Record<string, unknown>>;
  SortDirection: React.FC<Record<string, unknown>>;
  StatusPip: React.FC<Record<string, unknown>>;
  MotionIconProvider: React.FC<{
    animated?: boolean;
    children: React.ReactNode;
  }>;
};
const FRAME = 1000 / 60;

beforeAll(async () => {
  vi.useFakeTimers({
    toFake: [
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'performance',
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'Date',
    ],
  });
  const tl = await import('@testing-library/react');
  const react = await import('react');
  const status =
    await import('../../react/src/v12/components/MotionIcons/icons/statusIcons');
  const toggles =
    await import('../../react/src/v12/components/MotionIcons/icons/toggle/opsFillToggles');
  const playback =
    await import('../../react/src/v12/components/MotionIcons/icons/controls/playback');
  const menu =
    await import('../../react/src/v12/components/MotionIcons/icons/toggle/menuToggle');
  const copy =
    await import('../../react/src/v12/components/MotionIcons/icons/toggle/copyToggle');
  const step =
    await import('../../react/src/v12/components/MotionIcons/icons/status/progressStep');
  const sort =
    await import('../../react/src/v12/components/MotionIcons/icons/toggle/sortDirection');
  const layer =
    await import('../../react/src/v12/components/MotionIcons/utils/statusLayer');
  const provider =
    await import('../../react/src/v12/components/MotionIcons/context/MotionIconProvider');
  await import('../src/define-all');
  R = {
    render: tl.render,
    act: react.act,
    fireEvent: tl.fireEvent,
    createElement: react.createElement,
    Settings: status.Settings as never,
    Notification: status.Notification as never,
    BookmarkToggle: toggles.BookmarkToggle as never,
    PlayPauseToggle: playback.PlayPauseToggle as never,
    MenuToggle: menu.MenuToggle as never,
    CopyToggle: copy.CopyToggle as never,
    ProgressStep: step.ProgressStep as never,
    SortDirection: sort.SortDirection as never,
    StatusPip: layer.StatusPip as never,
    MotionIconProvider: provider.MotionIconProvider as never,
  };
});
afterAll(() => {
  vi.useRealTimers();
  console.log(`parity: ${compared} drawings compared`);
});

// ── Reading and comparing drawings ──────────────────────────────────────────

function painted(root: ParentNode | null | undefined): Painted {
  if (!root) return [];
  return [...root.querySelectorAll('[data-k]')].map((el) => ({
    k: el.getAttribute('data-k')!,
    attrs: Object.fromEntries(
      [...el.attributes]
        .filter((a) => a.name !== 'data-k')
        .map((a) => [a.name, a.value])
    ),
  }));
}

const NUM = /[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g;
function sameValue(a: string, b: string, tol = 0.01): boolean {
  if (a === b) return true;
  const [na, nb] = [a.match(NUM) ?? [], b.match(NUM) ?? []];
  if (a.replace(NUM, '#') !== b.replace(NUM, '#') || na.length !== nb.length)
    return false;
  return na.every((x, i) => Math.abs(Number(x) - Number(nb[i])) <= tol);
}
/** Values that draw the same as the attribute being absent (inside an svg whose fill is currentColor). */
const NEUTRAL: Record<string, string> = {
  'stroke-dasharray': 'none',
  stroke: 'none',
  fill: 'currentColor',
  'fill-rule': 'nonzero',
  opacity: '1',
};

/**
 * Handing back to the plain icon: React does it with a state update from
 * the tween's completion callback (a microtask, outside the test's act), so its
 * commit lands on React's own schedule; until then it still shows the status
 * engine with every mark empty, which draws exactly the plain icon. Those
 * empty marks are dropped; a mark that draws anything is not.
 */
function dropEmptyMarks(wc: Painted, react: Painted): Painted {
  if (wc.some((p) => p.k.startsWith('status-'))) return react;
  const marks = react.filter((p) => p.k.startsWith('status-'));
  return marks.every((p) => !p.attrs.d)
    ? react.filter((p) => !p.k.startsWith('status-'))
    : react;
}

function diff(wc: Painted, reactIn: Painted): string | null {
  const react = dropEmptyMarks(wc, reactIn);
  const [kw, kr] = [
    wc.map((p) => p.k).join(','),
    react.map((p) => p.k).join(','),
  ];
  if (kw !== kr) return `keys differ: wc [${kw}] react [${kr}]`;
  for (let i = 0; i < wc.length; i++) {
    const [a, b] = [wc[i].attrs, react[i].attrs];
    const names = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const n of names) {
      // The React engine paints imperatively, so an attribute a frame stops setting stays in its DOM (React never
      // rendered it, so never removes it); the element removes it. Those leftovers are the cut's explicit neutral
      // values (`stroke-dasharray="none"`, `fill="currentColor"`, …), which draw the same as no attribute.
      if (
        (a[n] === undefined && NEUTRAL[n] === b[n]) ||
        (b[n] === undefined && NEUTRAL[n] === a[n])
      )
        continue;
      if (a[n] === undefined || b[n] === undefined)
        return `${wc[i].k}: attribute ${n}="${a[n] ?? b[n]}" only on ${a[n] === undefined ? 'react' : 'wc'} (wc ${JSON.stringify(a).slice(0, 300)} | react ${JSON.stringify(b).slice(0, 300)})`;
      if (!sameValue(a[n], b[n]))
        return `${wc[i].k}.${n}:\n  wc    ${a[n].slice(0, 400)}\n  react ${b[n].slice(0, 400)}`;
    }
  }
  return null;
}
let compared = 0;
const expectSame = (wc: Painted, react: Painted, what: string) => {
  compared++;
  expect(wc.length, `${what}: nothing painted`).toBeGreaterThan(0);
  const d = diff(wc, react);
  if (d) throw new Error(`${what}: ${d}`);
};

// ── Mounting both ───────────────────────────────────────────────────────────

const toAttr = (k: string) => k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

async function mountWC(tag: string, props: Record<string, unknown>) {
  const el = document.createElement(tag) as HTMLElement & {
    updateComplete: Promise<unknown>;
  };
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === false) continue;
    el.setAttribute(toAttr(k), v === true ? '' : String(v));
  }
  document.body.append(el);
  await el.updateComplete;
  return el;
}
async function setWC(
  el: HTMLElement & { updateComplete: Promise<unknown> },
  props: Record<string, unknown>
) {
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === false) el.removeAttribute(toAttr(k));
    else el.setAttribute(toAttr(k), v === true ? '' : String(v));
  }
  await el.updateComplete;
}
const wcPaint = (el: Element) => painted(el.shadowRoot);

function mountReact(
  C: React.FC<Record<string, unknown>>,
  props: Record<string, unknown>
) {
  const r = R.render(
    R.createElement(R.MotionIconProvider, {
      animated: true,
      children: R.createElement(C, props),
    })
  );
  return {
    svg: () => r.container.querySelector('svg')!,
    paint: () => painted(r.container),
    rerender: (p: Record<string, unknown>) =>
      R.act(() =>
        r.rerender(
          R.createElement(R.MotionIconProvider, {
            animated: true,
            children: R.createElement(C, p),
          })
        )
      ),
    unmount: () => r.unmount(),
  };
}

/**
 * Advance both on the shared clock, comparing every frame for `ms`. Each
 * frame ends with a microtask turn, as in a browser: motion caches its clock
 * until the next microtask, so without one a later change would start from a
 * stale time.
 */
async function sampleFrames(ms: number, compare: (t: number) => void) {
  for (let t = 0; t <= ms; t += FRAME) {
    compare(t);
    R.act(() => vi.advanceTimersByTime(FRAME));
    await Promise.resolve();
  }
}

const SIZES = [16, 20, 24, 32] as const;

// ── Rest ─────────────────────────────────────────────────────────────────────

describe('at rest, the element paints what the React component renders', () => {
  const cases: [
    string,
    (
      | React.FC<Record<string, unknown>>
      | (() => React.FC<Record<string, unknown>>)
    ),
    string,
    Record<string, unknown>,
  ][] = [];
  const add = (
    name: string,
    C: () => React.FC<Record<string, unknown>>,
    tag: string,
    variants: Record<string, unknown>[]
  ) =>
    variants.forEach((v) =>
      cases.push([`${name} ${JSON.stringify(v)}`, C, tag, v])
    );
  add('Settings', () => R.Settings, 'clabs-motion-icon-settings', [
    {},
    { status: 'success' },
    { status: 'warning' },
    { status: 'error' },
    { status: 'pending' },
    { status: 'error', tone: true },
    { status: 'warning', tone: true },
  ]);
  add('Notification', () => R.Notification, 'clabs-motion-icon-notification', [
    {},
    { status: 'notification' },
    { count: 3 },
    { count: 12 },
    { count: 120, max: 99 },
    { count: 3, countPlacement: 'inside' },
    { status: 'notification', tone: true },
  ]);
  add(
    'BookmarkToggle',
    () => R.BookmarkToggle,
    'clabs-motion-icon-bookmark-toggle',
    [{ value: 'off' }, { value: 'on' }, { toggled: true }]
  );
  add(
    'PlayPauseToggle',
    () => R.PlayPauseToggle,
    'clabs-motion-icon-play-pause-toggle',
    [
      { value: 'play' },
      { value: 'pause' },
      { filled: true },
      { filled: true, value: 'pause' },
      { variant: 'outline' },
      { variant: 'outline', value: 'pause' },
      { variant: 'outline', filled: true },
      { variant: 'outline', filled: true, value: 'pause' },
    ]
  );
  add('MenuToggle', () => R.MenuToggle, 'clabs-motion-icon-menu-toggle', [
    { value: 'menu' },
    { value: 'close' },
  ]);
  add('CopyToggle', () => R.CopyToggle, 'clabs-motion-icon-copy-toggle', [
    { value: 'copy' },
    { value: 'checkmark' },
  ]);
  add('ProgressStep', () => R.ProgressStep, 'clabs-motion-icon-progress-step', [
    { value: 'incomplete' },
    { value: 'current' },
    { value: 'complete' },
    { value: 'invalid' },
  ]);
  add(
    'SortDirection',
    () => R.SortDirection,
    'clabs-motion-icon-sort-direction',
    [{ value: 'none' }, { value: 'ascending' }, { value: 'descending' }]
  );
  add('StatusPip', () => R.StatusPip, 'clabs-motion-status-pip', [
    { count: 1 },
    { count: 7 },
    { count: 42 },
    { count: 9, max: 9 },
    { count: 3, tone: 'error' },
  ]);

  for (const [name, C, tag, props] of cases) {
    it(name, async () => {
      for (const size of SIZES) {
        // React's toggles take `value` controlled; `initial` would do the same at rest.
        const react = mountReact(
          (C as () => React.FC<Record<string, unknown>>)(),
          { ...props, size }
        );
        const el = await mountWC(tag, { ...props, size });
        expectSame(wcPaint(el), react.paint(), `${name} @${size}`);
        react.unmount();
        el.remove();
      }
    });
  }
});

// ── Hover ────────────────────────────────────────────────────────────────────

describe('hover, frame by frame', () => {
  const hoverCases: [
    string,
    () => React.FC<Record<string, unknown>>,
    string,
    Record<string, unknown>,
  ][] = [
    ['Settings', () => R.Settings, 'clabs-motion-icon-settings', {}],
    [
      'Notification',
      () => R.Notification,
      'clabs-motion-icon-notification',
      {},
    ],
    [
      'BookmarkToggle off',
      () => R.BookmarkToggle,
      'clabs-motion-icon-bookmark-toggle',
      { value: 'off' },
    ],
    [
      'BookmarkToggle on',
      () => R.BookmarkToggle,
      'clabs-motion-icon-bookmark-toggle',
      { value: 'on' },
    ],
    [
      'PlayPauseToggle outline filled',
      () => R.PlayPauseToggle,
      'clabs-motion-icon-play-pause-toggle',
      { variant: 'outline', filled: true },
    ],
    [
      'MenuToggle menu',
      () => R.MenuToggle,
      'clabs-motion-icon-menu-toggle',
      { value: 'menu' },
    ],
    [
      'MenuToggle close',
      () => R.MenuToggle,
      'clabs-motion-icon-menu-toggle',
      { value: 'close' },
    ],
    [
      'CopyToggle copy',
      () => R.CopyToggle,
      'clabs-motion-icon-copy-toggle',
      { value: 'copy' },
    ],
    [
      'CopyToggle checkmark',
      () => R.CopyToggle,
      'clabs-motion-icon-copy-toggle',
      { value: 'checkmark' },
    ],
  ];
  for (const [name, C, tag, props] of hoverCases) {
    it(name, async () => {
      for (const size of [16, 32]) {
        const react = mountReact(C(), { ...props, size });
        const el = await mountWC(tag, { ...props, size });
        R.act(() => {
          R.fireEvent.mouseEnter(react.svg());
          el.dispatchEvent(new MouseEvent('mouseenter'));
        });
        await sampleFrames(200, (t) =>
          expectSame(
            wcPaint(el),
            react.paint(),
            `${name} enter t=${t.toFixed(0)} @${size}`
          )
        );
        // Leave mid-way through a fresh enter: the interruption reverses from where it is.
        R.act(() => {
          R.fireEvent.mouseLeave(react.svg());
          el.dispatchEvent(new MouseEvent('mouseleave'));
        });
        await sampleFrames(140, (t) =>
          expectSame(
            wcPaint(el),
            react.paint(),
            `${name} leave t=${t.toFixed(0)} @${size}`
          )
        );
        R.act(() => {
          R.fireEvent.mouseEnter(react.svg());
          el.dispatchEvent(new MouseEvent('mouseenter'));
        });
        await sampleFrames(200, (t) =>
          expectSame(
            wcPaint(el),
            react.paint(),
            `${name} re-enter t=${t.toFixed(0)} @${size}`
          )
        );
        react.unmount();
        el.remove();
      }
    });
  }
});

// ── Toggle ───────────────────────────────────────────────────────────────────

describe('toggle, frame by frame', () => {
  const toggleCases: [
    string,
    () => React.FC<Record<string, unknown>>,
    string,
    Record<string, unknown>,
  ][] = [
    [
      'BookmarkToggle',
      () => R.BookmarkToggle,
      'clabs-motion-icon-bookmark-toggle',
      {},
    ],
    [
      'PlayPauseToggle',
      () => R.PlayPauseToggle,
      'clabs-motion-icon-play-pause-toggle',
      {},
    ],
    [
      'PlayPauseToggle filled',
      () => R.PlayPauseToggle,
      'clabs-motion-icon-play-pause-toggle',
      { filled: true },
    ],
    [
      'PlayPauseToggle outline',
      () => R.PlayPauseToggle,
      'clabs-motion-icon-play-pause-toggle',
      { variant: 'outline' },
    ],
    [
      'PlayPauseToggle outline filled',
      () => R.PlayPauseToggle,
      'clabs-motion-icon-play-pause-toggle',
      { variant: 'outline', filled: true },
    ],
    ['MenuToggle', () => R.MenuToggle, 'clabs-motion-icon-menu-toggle', {}],
    ['CopyToggle', () => R.CopyToggle, 'clabs-motion-icon-copy-toggle', {}],
  ];
  for (const [name, C, tag, props] of toggleCases) {
    it(`${name}: click on, click off mid-way, click on again (uncontrolled)`, async () => {
      for (const size of [16, 24, 32]) {
        const react = mountReact(C(), { ...props, size });
        const el = await mountWC(tag, { ...props, size });
        const clickBoth = async () => {
          R.act(() => R.fireEvent.click(react.svg()));
          el.click();
          await (el as unknown as { updateComplete: Promise<unknown> })
            .updateComplete;
        };
        await clickBoth();
        await sampleFrames(200, (t) =>
          expectSame(
            wcPaint(el),
            react.paint(),
            `${name} on t=${t.toFixed(0)} @${size}`
          )
        );
        await clickBoth();
        await sampleFrames(50, (t) =>
          expectSame(
            wcPaint(el),
            react.paint(),
            `${name} off t=${t.toFixed(0)} @${size}`
          )
        );
        await clickBoth();
        await sampleFrames(200, (t) =>
          expectSame(
            wcPaint(el),
            react.paint(),
            `${name} on again t=${t.toFixed(0)} @${size}`
          )
        );
        react.unmount();
        el.remove();
      }
    });
  }

  it('BookmarkToggle while hovered: hover and toggle compose on separate channels', async () => {
    const react = mountReact(R.BookmarkToggle, { size: 32 });
    const el = await mountWC('clabs-motion-icon-bookmark-toggle', { size: 32 });
    R.act(() => {
      R.fireEvent.mouseEnter(react.svg());
      el.dispatchEvent(new MouseEvent('mouseenter'));
    });
    await sampleFrames(60, () => undefined);
    R.act(() => R.fireEvent.click(react.svg()));
    el.click();
    await (el as unknown as { updateComplete: Promise<unknown> })
      .updateComplete;
    await sampleFrames(250, (t) =>
      expectSame(wcPaint(el), react.paint(), `hover+toggle t=${t.toFixed(0)}`)
    );
    react.unmount();
    el.remove();
  });

  it('controlled: a canceled request does not move; setting value animates as a React value change', async () => {
    const react = mountReact(R.BookmarkToggle, { value: 'off', size: 32 });
    const el = await mountWC('clabs-motion-icon-bookmark-toggle', {
      value: 'off',
      size: 32,
    });
    const seen: string[] = [];
    el.addEventListener('clabs-motion-icon-beingchanged', (e) => {
      seen.push((e as CustomEvent).detail.value);
      e.preventDefault();
    });
    el.click();
    await (el as unknown as { updateComplete: Promise<unknown> })
      .updateComplete;
    expect(seen).toEqual(['on']);
    expect(el.getAttribute('value')).toBe('off');
    react.rerender({ value: 'on', size: 32 });
    await setWC(el as never, { value: 'on' });
    await sampleFrames(200, (t) =>
      expectSame(wcPaint(el), react.paint(), `controlled on t=${t.toFixed(0)}`)
    );
    react.unmount();
    el.remove();
  });

  it('filled / variant change redraws at the current state, at rest', async () => {
    const react = mountReact(R.PlayPauseToggle, { value: 'pause', size: 32 });
    const el = await mountWC('clabs-motion-icon-play-pause-toggle', {
      value: 'pause',
      size: 32,
    });
    react.rerender({
      value: 'pause',
      size: 32,
      filled: true,
      variant: 'outline',
    });
    await setWC(el as never, { filled: true, variant: 'outline' });
    expectSame(wcPaint(el), react.paint(), 'after swap');
    react.unmount();
    el.remove();
  });
});

// ── Status ───────────────────────────────────────────────────────────────────

describe('status, frame by frame', () => {
  const runs: [
    string,
    () => React.FC<Record<string, unknown>>,
    string,
    Record<string, unknown>[],
  ][] = [
    [
      'Settings: none → success → pending → error → none',
      () => R.Settings,
      'clabs-motion-icon-settings',
      [
        {},
        { status: 'success' },
        { status: 'pending' },
        { status: 'error' },
        {},
      ],
    ],
    [
      'Settings toned: none → warning → success',
      () => R.Settings,
      'clabs-motion-icon-settings',
      [
        { tone: true },
        { tone: true, status: 'warning' },
        { tone: true, status: 'success' },
      ],
    ],
    // The toned warning filled like Carbon: its fill and "!" in, swapped both ways, and out.
    [
      'Settings toned: none → warning → error → warning → none',
      () => R.Settings,
      'clabs-motion-icon-settings',
      [
        { tone: true },
        { tone: true, status: 'warning' },
        { tone: true, status: 'error' },
        { tone: true, status: 'warning' },
        { tone: true },
      ],
    ],
    [
      'Notification: none → pip → 3 → 4 → 12 (9+) → 2 → none',
      () => R.Notification,
      'clabs-motion-icon-notification',
      [
        {},
        { status: 'notification' },
        { count: 3 },
        { count: 4 },
        { count: 12 },
        { count: 2 },
        {},
      ],
    ],
    [
      'Notification inside, toned: none → 5 → pip',
      () => R.Notification,
      'clabs-motion-icon-notification',
      [
        { countPlacement: 'inside', tone: true },
        { countPlacement: 'inside', tone: true, count: 5 },
        { countPlacement: 'inside', tone: true, status: 'notification' },
      ],
    ],
  ];
  for (const [name, C, tag, steps] of runs) {
    it(name, async () => {
      for (const size of [16, 32]) {
        const react = mountReact(C(), { ...steps[0], size });
        const el = await mountWC(tag, { ...steps[0], size });
        expectSame(wcPaint(el), react.paint(), `${name} start @${size}`);
        for (let i = 1; i < steps.length; i++) {
          // Clear the previous step's attributes, then set this one's.
          const clear = Object.fromEntries(
            Object.keys(steps[i - 1]).map((k) => [k, undefined])
          );
          react.rerender({ ...steps[i], size });
          await setWC(el as never, { ...clear, ...steps[i] });
          await sampleFrames(450, (t) =>
            expectSame(
              wcPaint(el),
              react.paint(),
              `${name} step ${i} ${JSON.stringify(steps[i])} t=${t.toFixed(0)} @${size}`
            )
          );
        }
        react.unmount();
        el.remove();
      }
    });
  }

  it('StatusPip: 1 → 2 → 10 → 9 → 0 rolls frame by frame', async () => {
    const react = mountReact(R.StatusPip, { count: 1, size: 32 });
    const el = await mountWC('clabs-motion-status-pip', { count: 1, size: 32 });
    for (const count of [2, 10, 9, 0]) {
      react.rerender({ count, size: 32 });
      await setWC(el as never, { count });
      await sampleFrames(200, (t) =>
        expectSame(wcPaint(el), react.paint(), `pip ${count} t=${t.toFixed(0)}`)
      );
    }
    react.unmount();
    el.remove();
  });
});

// ── ProgressStep: driven by value only ──────────────────────────────────────

describe('ProgressStep, value by value', () => {
  // Every change the kit makes, forward, back, into and out of invalid, and the jumps.
  const path = [
    'incomplete',
    'current',
    'complete',
    'current',
    'incomplete',
    'invalid',
    'current',
    'invalid',
    'complete',
    'invalid',
    'incomplete',
    'complete',
    'incomplete',
  ];
  it('paints what the React component paints, frame by frame, through every transition', async () => {
    for (const size of [16, 32]) {
      const react = mountReact(R.ProgressStep, { value: path[0], size });
      const el = await mountWC('clabs-motion-icon-progress-step', {
        value: path[0],
        size,
      });
      for (const value of path.slice(1)) {
        react.rerender({ value, size });
        await setWC(el as never, { value });
        await sampleFrames(300, (t) =>
          expectSame(
            wcPaint(el),
            react.paint(),
            `${value} t=${t.toFixed(0)} @${size}`
          )
        );
      }
      // A change mid-way (current, then complete before it lands): both reverse from where they are.
      react.rerender({ value: 'current', size });
      await setWC(el as never, { value: 'current' });
      await sampleFrames(60, () => undefined);
      react.rerender({ value: 'complete', size });
      await setWC(el as never, { value: 'complete' });
      await sampleFrames(300, (t) =>
        expectSame(
          wcPaint(el),
          react.paint(),
          `interrupted t=${t.toFixed(0)} @${size}`
        )
      );
      react.unmount();
      el.remove();
    }
  });

  it('is an indicator: its clicks never change it, and it has no accessible name of its own', async () => {
    const el = await mountWC('clabs-motion-icon-progress-step', {
      value: 'current',
      size: 16,
    });
    const asked: unknown[] = [];
    el.addEventListener('clabs-motion-icon-beingchanged', (e) => asked.push(e));
    el.click();
    await (el as unknown as { updateComplete: Promise<unknown> })
      .updateComplete;
    expect(asked).toEqual([]);
    expect(el.getAttribute('value')).toBe('current');
    expect(el.getAttribute('role')).not.toBe('button');
    el.remove();
  });
});

// ── SortDirection: driven by value only ─────────────────────────────────────

describe('SortDirection, value by value', () => {
  // All six changes: the header's cycle both ways round, then the jumps.
  const path = [
    'none',
    'ascending',
    'descending',
    'none',
    'descending',
    'ascending',
    'none',
  ];
  it('paints what the React component paints, frame by frame, through every transition', async () => {
    for (const size of [16, 32]) {
      const react = mountReact(R.SortDirection, { value: path[0], size });
      const el = await mountWC('clabs-motion-icon-sort-direction', {
        value: path[0],
        size,
      });
      for (const value of path.slice(1)) {
        react.rerender({ value, size });
        await setWC(el as never, { value });
        await sampleFrames(300, (t) =>
          expectSame(
            wcPaint(el),
            react.paint(),
            `${value} t=${t.toFixed(0)} @${size}`
          )
        );
      }
      // A change mid-way (ascending, then descending before it lands): both carry on from where they are.
      react.rerender({ value: 'ascending', size });
      await setWC(el as never, { value: 'ascending' });
      await sampleFrames(60, () => undefined);
      react.rerender({ value: 'descending', size });
      await setWC(el as never, { value: 'descending' });
      await sampleFrames(300, (t) =>
        expectSame(
          wcPaint(el),
          react.paint(),
          `interrupted t=${t.toFixed(0)} @${size}`
        )
      );
      react.unmount();
      el.remove();
    }
  });

  it('is an indicator: its clicks never change it, and it has no accessible name of its own', async () => {
    const el = await mountWC('clabs-motion-icon-sort-direction', {
      value: 'ascending',
      size: 16,
    });
    const asked: unknown[] = [];
    el.addEventListener('clabs-motion-icon-beingchanged', (e) => asked.push(e));
    el.click();
    await (el as unknown as { updateComplete: Promise<unknown> })
      .updateComplete;
    expect(asked).toEqual([]);
    expect(el.getAttribute('value')).toBe('ascending');
    expect(el.getAttribute('role')).not.toBe('button');
    el.remove();
  });
});

// ── Reduced motion / animated=false ─────────────────────────────────────────

describe('still (animated=false): status icons draw the React still frame', () => {
  for (const props of [
    { status: 'pending' },
    { status: 'success' },
    { count: 3 },
  ]) {
    it(JSON.stringify(props), async () => {
      const C = 'count' in props ? R.Notification : R.Settings;
      const tag =
        'count' in props
          ? 'clabs-motion-icon-notification'
          : 'clabs-motion-icon-settings';
      const r = R.render(
        R.createElement(R.MotionIconProvider, {
          animated: false,
          children: R.createElement(C, { ...props, size: 24 }),
        })
      );
      const el = await mountWC(tag, { ...props, size: 24, animated: 'false' });
      expectSame(wcPaint(el), painted(r.container), 'still');
      r.unmount();
      el.remove();
    });
  }
});
