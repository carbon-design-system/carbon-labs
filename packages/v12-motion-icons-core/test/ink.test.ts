/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Ink's first read: new inks are read together once
 * the browser has resolved the frame's style (a ResizeObserver made at the
 * next frame hears of them after style and layout, before paint), every read
 * before any write, so attaching N icons forces no style recalc. Without
 * ResizeObserver (jsdom) it reads and writes at once, as before; so does an
 * svg attached after the frame's pass has run (it would paint a frame
 * without its ink otherwise).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { attachInk } from '../src/ink';
import { manualScheduler, nextFrame, setScheduler } from '../src/engine';

const SVG = 'http://www.w3.org/2000/svg';
function icon(fill = 'red') {
  const svg = document.createElementNS(SVG, 'svg') as SVGSVGElement;
  svg.style.fill = fill;
  const g = document.createElementNS(SVG, 'g');
  g.setAttribute('data-mc-ink', '');
  svg.append(g);
  document.body.append(svg);
  return { svg, ink: g as SVGGElement };
}

/** A ResizeObserver the test notifies, as a browser does after a frame's layout. */
class FakeRO {
  static made: FakeRO[] = [];
  observed = new Set<Element>();
  constructor(private cb: (entries: ResizeObserverEntry[], o: FakeRO) => void) {
    FakeRO.made.push(this);
  }
  observe(el: Element) {
    this.observed.add(el);
  }
  unobserve(el: Element) {
    this.observed.delete(el);
  }
  disconnect() {
    this.observed.clear();
  }
  /** The first notice of everything it observes. */
  notify() {
    const entries = [...this.observed].map(
      (target) => ({ target }) as ResizeObserverEntry
    );
    if (entries.length) {
      this.cb(entries, this);
    }
  }
}

/** The next task: a frame's pass is over once one runs (the frame has painted). */
const nextTask = () => new Promise<void>((r) => setTimeout(r, 0));

let clock: ReturnType<typeof manualScheduler>;
beforeEach(async () => {
  await nextTask();
  clock = manualScheduler();
  setScheduler(clock);
});
afterEach(() => {
  setScheduler(null);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  FakeRO.made = [];
  document.body.replaceChildren();
});

describe('ink without ResizeObserver (a test DOM)', () => {
  it('reads and writes at attach', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    const { svg, ink } = icon();
    const off = attachInk(svg);
    expect(ink.style.color).toBe('red');
    expect(svg.style.transition).toContain('fill 1ms');
    off();
    expect(svg.style.transition).toBe('');
  });
});

describe('ink with ResizeObserver', () => {
  beforeEach(() => vi.stubGlobal('ResizeObserver', FakeRO));

  it('reads every new svg before it writes any, once the frame is styled', () => {
    const icons = [icon(), icon(), icon()];
    const reads: string[][] = [];
    const cs = window.getComputedStyle;
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el, p) => {
      // What is already written when each read happens.
      reads.push(icons.map(({ ink }) => ink.style.color));
      return cs.call(window, el, p);
    });
    icons.forEach(({ svg }) => attachInk(svg));
    // Nothing read or written at attach, nor observed before the frame.
    expect(reads).toEqual([]);
    expect(icons.map(({ ink }) => ink.style.color)).toEqual(['', '', '']);
    expect(FakeRO.made).toHaveLength(0);
    clock.advance(1000 / 60);
    expect(FakeRO.made).toHaveLength(1);
    expect(FakeRO.made[0].observed.size).toBe(3);
    FakeRO.made[0].notify();
    expect(reads).toEqual([
      ['', '', ''],
      ['', '', ''],
      ['', '', ''],
    ]);
    expect(icons.map(({ ink }) => ink.style.color)).toEqual([
      'red',
      'red',
      'red',
    ]);
    expect(
      icons.every(({ svg }) => svg.style.transition === 'fill 1ms linear')
    ).toBe(true);
    // Each is read once, then let go.
    expect(FakeRO.made[0].observed.size).toBe(0);
  });

  it('a later batch waits on an observer of its own (made after the page’s, so it hears after them)', async () => {
    attachInk(icon().svg);
    clock.advance(1000 / 60);
    FakeRO.made[0].notify();
    await nextTask();
    const { svg, ink } = icon('blue');
    attachInk(svg);
    clock.advance(1000 / 60);
    expect(FakeRO.made).toHaveLength(2);
    FakeRO.made[1].notify();
    expect(ink.style.color).toBe('blue');
  });

  it('detached before the browser has styled it: never read or written; after: its transition restored', () => {
    const a = icon();
    const offA = attachInk(a.svg);
    offA();
    clock.advance(1000 / 60);
    expect(FakeRO.made[0]?.observed.size ?? 0).toBe(0);
    expect(a.ink.style.color).toBe('');
    expect(a.svg.style.transition).toBe('');

    const b = icon();
    b.svg.style.transition = 'opacity 0s';
    const offB = attachInk(b.svg);
    clock.advance(1000 / 60);
    FakeRO.made.at(-1)!.notify();
    expect(b.svg.style.transition).toContain('fill 1ms');
    offB();
    expect(b.svg.style.transition).toBe('opacity 0s');
  });

  it('a fill equal to the colour leaves the ink unset', () => {
    const { svg, ink } = icon('');
    attachInk(svg);
    clock.advance(1000 / 60);
    FakeRO.made[0].notify();
    expect(ink.style.color).toBe('');
    expect(svg.style.transition).toContain('fill 1ms');
  });
});

describe('ink attached after the frame’s pass (before that frame paints)', () => {
  beforeEach(() => vi.stubGlobal('ResizeObserver', FakeRO));

  it('in a later frame callback or an observer’s callback: read and written at once', async () => {
    const early = icon();
    attachInk(early.svg);
    clock.advance(1000 / 60);
    // Still in that frame: the pass has run, the observers haven't heard yet.
    const late = icon('blue');
    attachInk(late.svg);
    expect(late.ink.style.color).toBe('blue');
    expect(late.svg.style.transition).toContain('fill 1ms');
    expect(FakeRO.made[0].observed.has(late.svg)).toBe(false);
    // Inside the observers' callbacks (the batch's own included): at once too.
    const inside = icon('green');
    const other = new FakeRO(() => attachInk(inside.svg));
    other.observe(document.body);
    other.notify();
    expect(inside.ink.style.color).toBe('green');
    FakeRO.made[0].notify();
    expect(early.ink.style.color).toBe('red');
    // The next task: the frame has painted, so new svgs wait for the next frame again.
    await nextTask();
    const next = icon();
    attachInk(next.svg);
    expect(next.ink.style.color).toBe('');
  });

  it('inside the pass itself (a render flushed in a frame callback): at once', () => {
    const { svg, ink } = icon();
    nextFrame(() => attachInk(svg));
    clock.advance(1000 / 60);
    expect(ink.style.color).toBe('red');
    expect(FakeRO.made.some((o) => o.observed.has(svg))).toBe(false);
  });
});
