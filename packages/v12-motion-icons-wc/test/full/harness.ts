/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Web components vs React, frame by frame, across every generated element
 * (src/elements.json): the element and the React component of the same
 * name, mounted side by side on one fake clock, put through the same
 * changes, compared after every frame.
 *
 * What is compared: the painted shapes (`[data-k]`, the same keys in the
 * same order, the same attributes, numbers within 0.01); with
 * `animated={false}`, the still drawing (Carbon's art: every element under
 * the svg, attribute for attribute, and the viewBox).
 *
 * Per kind (props from the element's own spec):
 *  - every icon: rest at 16, 20, 24 and 32, animated and still;
 *  - hover: in, out mid-way, in again, out (16 and 32);
 *  - toggles (each drawing: `filled`, `variant`): rest in every state, then
 *    click, click mid-way, click (16 and 32), and a hover;
 *  - status icons: each status in and out, a count rolling (16 and 32);
 *    status aliases (Carbon's static status names): at rest, toned, hovered.
 */
import { expect, vi } from 'vitest';
import type React from 'react';
import type {
  DrawingSpec,
  IconSpec,
  StatusIconDataSpec,
} from '@carbon-labs/motion-icons-core/engine';
import elements from '../../src/elements.json';

export type El = (typeof elements)[number];
type Props = Record<string, unknown>;
type WC = HTMLElement & { updateComplete: Promise<unknown> };
type Painted = { k: string; attrs: Record<string, string> }[];

export interface Env {
  render: typeof import('@testing-library/react').render;
  act: typeof import('react').act;
  fireEvent: typeof import('@testing-library/react').fireEvent;
  createElement: typeof import('react').createElement;
  lib: Record<string, React.FC<Props>>;
  classes: Record<string, { spec: IconSpec }>;
}

const FRAME = 1000 / 60;
let env: Env | null = null;
/** The fake clock's start (its `Date.now()` when installed): the fake rAF ticks on a 16ms grid from here. */
let epoch = 0;

export async function setup(): Promise<Env> {
  if (env) {
    return env;
  }
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
  epoch = Date.now();
  const tl = await import('@testing-library/react');
  const react = await import('react');
  const lib =
    (await import('../../../react/src/v12/components/MotionIcons/index')) as unknown as Record<
      string,
      React.FC<Props>
    >;
  const classes = (await import('../../src/elements')) as unknown as Record<
    string,
    { spec: IconSpec }
  >;
  await import('../../src/define-all');
  env = {
    render: tl.render,
    act: react.act,
    fireEvent: tl.fireEvent,
    createElement: react.createElement,
    lib,
    classes,
  };
  return env;
}

/**
 * Move the fake clock on to where it stood when it was installed, as to the
 * frame grids: call before each test so its frames fall the same way whatever
 * ran before it (any order, any subset).
 *
 * The fake rAF ticks every 16ms from the clock's start; a test advances it
 * 1000/60ms a frame. The two grids meet every 400ms (25 ticks, 24 frames), so
 * one advance in 24 holds two ticks, and which frame of a test that is depends
 * on the clock's phase when the test began. React commits a state change in a
 * real macrotask after the advance, the element's engine on the tick itself:
 * when an engine starts on the first of two ticks in one advance (the hand-off
 * mark of Save, Printer, Share), the element has painted a frame React will
 * paint on the next one. Before this, each test began wherever the last left
 * the clock, so the order of the file decided which frames compared one apart.
 *
 * Two steps: the sub-millisecond remainder (1000/60 isn't a whole number of
 * nanoseconds, so it builds up) to zero, then on to the next 400ms from the start.
 */
export function alignClock(): void {
  const PERIOD = 400;
  const ns = Math.round((performance.now() % 1) * 1e6) % 1e6;
  // + half a nanosecond: the clock floors a step's nanoseconds.
  if (ns) {
    vi.advanceTimersByTime((1e6 - ns + 0.5) / 1e6);
  }
  const ms = (Date.now() - epoch) % PERIOD;
  if (ms) {
    vi.advanceTimersByTime(PERIOD - ms);
  }
}

export const shard = <T>(xs: T[], i: number, n: number) =>
  xs.filter((_, j) => j % n === i);
export const list = () => elements;

// ── Reading drawings ─────────────────────────────────────────────────────────

export function painted(root: ParentNode | null | undefined): Painted {
  if (!root) {
    return [];
  }
  return [...root.querySelectorAll('[data-k]')].map((el) => ({
    k: el.getAttribute('data-k')!,
    attrs: Object.fromEntries(
      [...el.attributes]
        .filter((a) => a.name !== 'data-k')
        .map((a) => [a.name, a.value])
    ),
  }));
}
/** A still drawing: the svg's viewBox, then every element under it. */
function stillOf(svg: Element | null | undefined): Painted {
  if (!svg) {
    return [];
  }
  return [
    { k: 'svg', attrs: { viewBox: svg.getAttribute('viewBox') ?? '' } },
    ...[...svg.querySelectorAll('*')].map((el, i) => ({
      k: `${i}:${el.tagName.toLowerCase()}`,
      attrs: Object.fromEntries(
        [...el.attributes].map((a) => [a.name, a.value])
      ),
    })),
  ];
}

const NUM = /[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g;
function sameValue(a: string, b: string, tol = 0.01): boolean {
  if (a === b) {
    return true;
  }
  const [na, nb] = [a.match(NUM) ?? [], b.match(NUM) ?? []];
  if (a.replace(NUM, '#') !== b.replace(NUM, '#') || na.length !== nb.length) {
    return false;
  }
  return na.every((x, i) => Math.abs(Number(x) - Number(nb[i])) <= tol);
}
/** Values that draw the same as the attribute being absent (React leaves attributes a frame stopped setting). */
const NEUTRAL: Record<string, string> = {
  'stroke-dasharray': 'none',
  stroke: 'none',
  fill: 'currentColor',
  'fill-rule': 'nonzero',
  opacity: '1',
};

/** React hands back to the plain icon a commit later (see the core's harness): its empty marks draw nothing. */
function dropEmptyMarks(wc: Painted, react: Painted): Painted {
  if (wc.some((p) => p.k.startsWith('status-'))) {
    return react;
  }
  const marks = react.filter((p) => p.k.startsWith('status-'));
  return marks.length && marks.every((p) => !p.attrs.d)
    ? react.filter((p) => !p.k.startsWith('status-'))
    : react;
}

/**
 * The status layer reads a <circle> as its ink and paints it as the same
 * circle in arcs: at the hand-back to the plain icon (a React commit, a frame
 * either side of the element's) one side may draw the circle, the other the
 * arcs. The same drawing (the core's old-vs-new harness allows the same).
 */
function circleAsArcs(
  x: Painted[number],
  other: Painted[number] | undefined
): Painted[number] {
  const { cx, cy, r, ...rest } = x.attrs;
  if (
    cx === undefined ||
    r === undefined ||
    !other ||
    other.attrs.d === undefined ||
    other.attrs.cx !== undefined
  ) {
    return x;
  }
  return {
    k: x.k,
    attrs: {
      ...rest,
      d: `M${+cx - +r} ${cy}A${r} ${r} 0 1 0 ${+cx + +r} ${cy}A${r} ${r} 0 1 0 ${+cx - +r} ${cy}Z`,
    },
  };
}

export function diff(wcIn: Painted, reactIn: Painted): string | null {
  const react0 = dropEmptyMarks(wcIn, reactIn);
  const wc0 = dropEmptyMarks(react0, wcIn);
  const wc = wc0.map((x, i) => circleAsArcs(x, react0[i]));
  const react = react0.map((x, i) => circleAsArcs(x, wc0[i]));
  const [kw, kr] = [
    wc.map((p) => p.k).join(','),
    react.map((p) => p.k).join(','),
  ];
  if (kw !== kr) {
    return `keys differ: wc [${kw.slice(0, 300)}] react [${kr.slice(0, 300)}]`;
  }
  for (let i = 0; i < wc.length; i++) {
    const [a, b] = [wc[i].attrs, react[i].attrs];
    for (const n of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (
        (a[n] === undefined && NEUTRAL[n] === b[n]) ||
        (b[n] === undefined && NEUTRAL[n] === a[n])
      ) {
        continue;
      }
      if (a[n] === undefined || b[n] === undefined) {
        return `${wc[i].k}: ${n}="${a[n] ?? b[n]}" only on ${a[n] === undefined ? 'react' : 'wc'}`;
      }
      if (!sameValue(a[n], b[n])) {
        return `${wc[i].k}.${n}:\n  wc    ${a[n].slice(0, 300)}\n  react ${b[n].slice(0, 300)}`;
      }
    }
  }
  return null;
}

export interface Tally {
  frames: number;
  failures: string[];
}
export const tally = (): Tally => ({ frames: 0, failures: [] });

// ── Mounting a pair ──────────────────────────────────────────────────────────

const toAttr = (k: string) => k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
/** Attributes where "false" is a value (three-way: unset is the icon's default). */
const THREE_WAY = new Set(['animated', 'filled']);
function setAttrs(el: HTMLElement, props: Props) {
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === false) {
      if (THREE_WAY.has(k) && v === false) {
        el.setAttribute(k, 'false');
      } else {
        el.removeAttribute(toAttr(k));
      }
    } else {
      el.setAttribute(toAttr(k), v === true ? '' : String(v));
    }
  }
}

interface Pair {
  react: ReturnType<Env['render']>;
  el: WC;
  props: Props;
  rerender(p: Props): Promise<void>;
  unmount(): void;
}

async function mount(e: Env, x: El, props: Props): Promise<Pair> {
  const C = e.lib[x.name];
  const react = e.render(e.createElement(C, props));
  const el = document.createElement(x.tag) as WC;
  setAttrs(el, props);
  document.body.append(el);
  await el.updateComplete;
  const pair: Pair = {
    react,
    el,
    props,
    async rerender(p) {
      e.act(() => react.rerender(e.createElement(C, p)));
      setAttrs(el, {
        ...Object.fromEntries(
          Object.keys(this.props).map((k) => [k, undefined])
        ),
        ...p,
      });
      this.props = p;
      await el.updateComplete;
    },
    unmount() {
      react.unmount();
      el.remove();
    },
  };
  return pair;
}

function compare(p: Pair, what: string, t: Tally) {
  t.frames++;
  const still = p.props.animated === false;
  const reactSvg = p.react.container.querySelector('svg');
  const wcSvg = p.el.shadowRoot?.querySelector('svg');
  const wcDrawn = painted(p.el.shadowRoot);
  const [a, b] =
    still && !wcDrawn.length
      ? [stillOf(wcSvg), stillOf(reactSvg)]
      : [wcDrawn, painted(p.react.container)];
  if (!a.length) {
    t.failures.push(`${what}: the element drew nothing`);
    return;
  }
  const d = diff(a, b);
  if (d) {
    t.failures.push(`${what}: ${d}`);
  }
}

/** Between frames: microtasks, then a real macrotask (React's scheduler runs there). */
const turn = () => new Promise<void>((r) => setImmediate(r));

/**
 * `fromFirstFrame`: skip the instant of a hover event. The React component
 * may re-render on it, which paints the hover's new direction (`entering`)
 * at once; the engine (and so the element) paints it on the next frame. One
 * frame, on icons whose geometry moves one way only, from React's render;
 * every frame after it is compared.
 */
async function frames(
  e: Env,
  p: Pair,
  ms: number,
  what: string,
  t: Tally,
  fromFirstFrame = false
) {
  if (!fromFirstFrame) {
    compare(p, `${what} t=0`, t);
  }
  for (let ms0 = FRAME; ms0 <= ms + 1e-6; ms0 += FRAME) {
    e.act(() => vi.advanceTimersByTime(FRAME));
    await turn();
    compare(p, `${what} t=${ms0.toFixed(0)}`, t);
  }
}

/** Settle any tween left running (a test's last frames) before the next pair mounts. */
async function settle(e: Env) {
  for (let i = 0; i < 40; i++) {
    e.act(() => vi.advanceTimersByTime(FRAME));
    await turn();
  }
}

const target = (c: ParentNode) =>
  (c.querySelector('button') ?? c.querySelector('svg')) as Element;
function hoverBoth(e: Env, p: Pair, ev: 'mouseEnter' | 'mouseLeave') {
  e.act(() => {
    e.fireEvent[ev](target(p.react.container));
    p.el.dispatchEvent(new MouseEvent(ev.toLowerCase()));
  });
}
async function clickBoth(e: Env, p: Pair) {
  e.act(() => e.fireEvent.click(target(p.react.container)));
  p.el.click();
  await p.el.updateComplete;
}

// ── Scenarios ────────────────────────────────────────────────────────────────

const SIZES = [16, 20, 24, 32];

async function rest(e: Env, x: El, props: Props, t: Tally) {
  for (const size of SIZES) {
    for (const animated of [true, false]) {
      const p = await mount(e, x, { ...props, size, animated });
      compare(
        p,
        `${x.name} rest ${JSON.stringify({ ...props, size, animated })}`,
        t
      );
      p.unmount();
    }
  }
}

async function hover(e: Env, x: El, props: Props, size: number, t: Tally) {
  const p = await mount(e, x, { ...props, size, animated: true });
  const k = `${x.name} ${JSON.stringify(props)} @${size}`;
  hoverBoth(e, p, 'mouseEnter');
  await frames(e, p, 300, `enter ${k}`, t, true);
  hoverBoth(e, p, 'mouseLeave');
  await frames(e, p, 70, `leave (interrupted) ${k}`, t, true);
  hoverBoth(e, p, 'mouseEnter');
  await frames(e, p, 120, `re-enter ${k}`, t, true);
  hoverBoth(e, p, 'mouseLeave');
  await frames(e, p, 300, `leave ${k}`, t, true);
  p.unmount();
  await settle(e);
}

/** A toggle element's drawings: its props for each (`filled`, the variant names its pick tests for). */
function drawingProps(spec: IconSpec): Props[] {
  if (spec.kind !== 'variant') {
    return [{}];
  }
  const names = [
    ...String(spec.pick).matchAll(/variant\s*===\s*['"]([^'"]+)['"]/g),
  ].map((m) => m[1]);
  const out: Props[] = [];
  const seen = new Set<unknown>();
  for (const variant of [undefined, ...names]) {
    for (const filled of [undefined, true, false]) {
      const d = spec.pick({ filled, variant });
      if (seen.has(d)) {
        continue;
      }
      seen.add(d);
      out.push({
        ...(filled !== undefined ? { filled } : {}),
        ...(variant ? { variant } : {}),
      });
    }
  }
  return out;
}

async function toggle(e: Env, x: El, spec: IconSpec, t: Tally) {
  for (const props of drawingProps(spec)) {
    const d = (
      spec.kind === 'variant' ? spec.pick(props) : spec
    ) as DrawingSpec;
    const states = d.kind === 'hover' ? [] : (d.states as readonly string[]);
    for (const value of states) {
      await rest(e, x, { ...props, value }, t);
    }
    for (const size of [16, 32]) {
      const p = await mount(e, x, { ...props, size, animated: true });
      const k = `${x.name} ${JSON.stringify(props)} @${size}`;
      await clickBoth(e, p);
      await frames(e, p, 300, `click 1 ${k}`, t);
      await clickBoth(e, p);
      await frames(e, p, 60, `click 2 (interrupted) ${k}`, t);
      await clickBoth(e, p);
      await frames(e, p, 400, `click 3 ${k}`, t);
      p.unmount();
      await settle(e);
    }
    await hover(e, x, props, 32, t);
  }
}

async function status(e: Env, x: El, spec: StatusIconDataSpec, t: Tally) {
  await rest(e, x, {}, t);
  for (const s of spec.statuses as readonly string[]) {
    await rest(e, x, { status: s }, t);
  }
  if (spec.count) {
    await rest(e, x, { count: 3 }, t);
  }
  for (const size of [16, 32]) {
    const steps: Props[] = [
      {},
      ...(spec.statuses as readonly string[]).flatMap((s) => [{ status: s }]),
      ...(spec.count ? [{ count: 3 }, { count: 12 }, { count: 2 }] : []),
      {},
    ];
    const p = await mount(e, x, { ...steps[0], size, animated: true });
    for (let i = 1; i < steps.length; i++) {
      await p.rerender({ ...steps[i], size, animated: true });
      await frames(
        e,
        p,
        450,
        `${x.name} step ${JSON.stringify(steps[i])} @${size}`,
        t
      );
    }
    p.unmount();
    await settle(e);
  }
  for (const size of [16, 32]) {
    await hover(e, x, {}, size, t);
  }
}

/** A status alias (Carbon's static status names): its base with the status fixed. At rest, toned, with a status passed (ignored), and hovered (inert). */
async function statusAlias(e: Env, x: El, t: Tally) {
  await rest(e, x, {}, t);
  await rest(e, x, { tone: true }, t);
  await rest(e, x, { status: 'success' }, t);
  for (const size of [16, 32]) {
    await hover(e, x, {}, size, t);
  }
}

/** Every scenario for one element; returns its tally. */
export async function run(e: Env, x: El): Promise<Tally> {
  const t = tally();
  const spec = e.classes[x.className].spec;
  if (spec.kind === 'hover') {
    await rest(e, x, {}, t);
    for (const size of [16, 32]) {
      await hover(e, x, {}, size, t);
    }
  } else if (spec.kind === 'status') {
    await status(e, x, spec as StatusIconDataSpec, t);
  } else if (
    spec.kind === 'alias' &&
    (spec as { target: IconSpec }).target.kind === 'status'
  ) {
    await statusAlias(e, x, t);
  } else {
    await toggle(e, x, spec, t);
  }
  return t;
}

/** Runs a shard and fails with the first differences per element. */
export async function runShard(i: number, n: number) {
  const e = await setup();
  let frames = 0;
  const failed: string[] = [];
  for (const x of shard(list(), i, n)) {
    const t = await run(e, x);
    frames += t.frames;
    if (t.failures.length) {
      failed.push(
        `${x.name} (${t.failures.length} of ${t.frames}): ${t.failures[0]}`
      );
    }
  }
  console.log(
    `wc parity shard ${i}/${n}: ${shard(list(), i, n).length} elements, ${frames} drawings compared, ${failed.length} with differences`
  );
  for (const f of failed) {
    console.log(`  ${f.slice(0, 700)}`);
  }
  expect(failed, failed.slice(0, 12).join('\n')).toEqual([]);
}
