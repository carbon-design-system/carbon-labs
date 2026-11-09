/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The press (engine/press.ts): which icons
 * press, the input that presses them, the channel's timing, the scale per
 * size (1px a side), and the press composing with hover and
 * Renew's turn (its own attribute on its own element).
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  bindPress,
  FrameController,
  fromHover,
  manualScheduler,
  paint,
  Press,
  pressesByDefault,
  pressScale,
  pressTransform,
  PRESS_IN,
  PRESS_OUT,
  setScheduler,
  startTurn,
  type PressOptions,
} from '../src/engine';
import { RenewSpec } from '../src/icons/operations/opsRotate';
import { cubicBezier } from '../src/ease';
import { motionTokens, toEasing } from '../src/tokens';
import { waapi } from './waapiStub';

const FRAME = 1000 / 60;
let clock: ReturnType<typeof manualScheduler>;
beforeEach(() => {
  clock = manualScheduler();
  setScheduler(clock);
});
afterEach(() => {
  setScheduler(null);
  document.body.replaceChildren();
});
/** Frames, each its own task (as in a browser: the engine's synced time is per task). */
const step = async (n = 1) => {
  for (let i = 0; i < n; i++) {
    clock.advance(FRAME);
    for (let j = 0; j < 4; j++) {
      await Promise.resolve();
    }
  }
};

const SVG = 'http://www.w3.org/2000/svg';
/** An icon as both bindings draw one: `<svg width=size><g data-mc-ink/></svg>`. */
function icon(size = 32, into: Element = document.body) {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('width', String(size));
  const g = document.createElementNS(SVG, 'g');
  g.setAttribute('data-mc-ink', '');
  svg.append(g);
  into.append(svg);
  return { svg, g };
}
function bind(el: Element, g: Element, o: Partial<PressOptions> = {}) {
  return bindPress(el, {
    force: () => undefined,
    own: () => true,
    animated: () => true,
    groups: () => [g],
    size: () => Number(el.getAttribute('width')) || 32,
    ...o,
  });
}
/** A pointer event (jsdom has no PointerEvent constructor everywhere): main button unless said. */
function pointer(
  el: Element,
  type: string,
  init: { button?: number; pointerType?: string } = {}
) {
  const e = new MouseEvent(type, {
    bubbles: type !== 'pointerleave',
    button: init.button ?? 0,
  });
  Object.defineProperty(e, 'pointerType', {
    value: init.pointerType ?? 'mouse',
  });
  el.dispatchEvent(e);
}
const key = (
  el: Element,
  type: 'keydown' | 'keyup',
  k: string,
  repeat = false
) =>
  el.dispatchEvent(new KeyboardEvent(type, { key: k, repeat, bubbles: true }));
const tf = (g: Element) => g.getAttribute('transform');
/** The scale a transform draws (1 at rest). */
const scaleOf = (g: Element) =>
  Number(/scale\(([^)]+)\)/.exec(tf(g) ?? '')?.[1] ?? 1);

describe('the scale per size', () => {
  it('pixel: 1px in on every side at 16, 20, 24 and 32 ((size − 2) / size)', async () => {
    expect([16, 20, 24, 32].map((s) => pressScale(s))).toEqual([
      0.875,
      0.9,
      22 / 24,
      0.9375,
    ]);
    for (const size of [16, 20, 24, 32]) {
      const s = pressScale(size);
      // The inset each side, in px: half the 32 grid's shrink, at size/32 px a unit.
      expect(((32 * (1 - s)) / 2) * (size / 32)).toBeCloseTo(1, 9);
    }
  });

  it('one scale about the 32 grid’s centre; nothing at rest', async () => {
    expect(pressTransform(0, 0.9375)).toBeNull();
    expect(pressTransform(1, 0.9375)).toBe('translate(1 1) scale(0.9375)');
    expect(pressTransform(1, 0.875)).toBe('translate(2 2) scale(0.875)');
    expect(pressTransform(0.5, 0.875)).toBe('translate(1 1) scale(0.9375)');
    // The centre stays put: 16 → t + 16s = 16.
    const t = pressTransform(1, 0.93)!;
    const [, tx, s] = /translate\(([^ ]+) [^)]+\) scale\(([^)]+)\)/
      .exec(t)!
      .map(Number);
    expect(tx + 16 * s).toBeCloseTo(16, 3);
  });
});

describe('the channel', () => {
  it('in at once (the next frame), out on fast-02 with the exit ease, no overshoot', async () => {
    expect(PRESS_IN.duration).toBe(0);
    expect(PRESS_OUT).toEqual({
      duration: motionTokens.duration.fast02 / 1000,
      ease: toEasing(motionTokens.easing.exit),
    });
    const seen: number[] = [];
    const p = new Press((v) => seen.push(v));
    p.set(true);
    expect(seen).toEqual([]);
    await step();
    expect(seen).toEqual([1]);
    await step(3);
    expect(seen).toEqual([1]);
    p.set(false);
    await step(10);
    const out = seen.slice(1);
    expect(out.at(-1)).toBe(0);
    // Falling all the way, never below 0 or back up; on the exit ease.
    out.forEach((v, i) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(i ? out[i - 1] : 1);
    });
    const exit = cubicBezier(...toEasing(motionTokens.easing.exit));
    const ms = motionTokens.duration.fast02;
    expect(out[0]).toBeCloseTo(1 - exit(Math.round(FRAME) / ms), 2);
    expect(out.length).toBe(Math.ceil(ms / FRAME));
  });

  it('a release before the pressed frame: one pressed frame, then the release', async () => {
    const seen: number[] = [];
    const p = new Press((v) => seen.push(v));
    p.set(true);
    p.set(false);
    await step();
    expect(seen).toEqual([1]);
    await step();
    expect(seen[1]).toBeLessThan(1);
    await step(8);
    expect(seen.at(-1)).toBe(0);
  });

  it('pressed again mid-release: back to pressed on the next frame', async () => {
    const seen: number[] = [];
    const p = new Press((v) => seen.push(v));
    p.set(true);
    await step();
    p.set(false);
    await step(3);
    const mid = seen.at(-1)!;
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
    p.set(true);
    await step();
    expect(seen.at(-1)).toBe(1);
  });

  it('destroy: at rest at once', async () => {
    const seen: number[] = [];
    const p = new Press((v) => seen.push(v));
    p.set(true);
    await step();
    p.destroy();
    expect(seen.at(-1)).toBe(0);
    await step(10);
    expect(seen.at(-1)).toBe(0);
  });
});

describe('which icons press (pressesByDefault)', () => {
  const wrap = (html: string) => {
    const host = document.createElement('div');
    host.innerHTML = html;
    document.body.append(host);
    return host;
  };

  it('its own control presses: alone, or as React’s asButton (its own button)', async () => {
    const { svg } = icon();
    expect(pressesByDefault(svg, true)).toBe(true);
    const own = wrap(
      '<button aria-pressed="false"></button>'
    ).firstElementChild!;
    const inside = icon(32, own).svg;
    expect(pressesByDefault(inside, true)).toBe(true);
  });

  it('not its own control: a status, hover-only or decorative icon doesn’t press', async () => {
    expect(pressesByDefault(icon().svg, false)).toBe(false);
  });

  it('inside something that presses: a rollover button (a frame), a button, a link, cds-icon-button, a menu item, a tab', async () => {
    for (const html of [
      '<button data-motion-icon-frame=""><i></i></button>',
      '<a href="#" class="rollover" data-motion-icon-frame><i></i></a>',
      '<button><i></i></button>',
      '<a href="#"><i></i></a>',
      '<cds-icon-button><i></i></cds-icon-button>',
      '<cds-icon-button data-motion-icon-frame><i></i></cds-icon-button>',
      '<cds-button><i></i></cds-button>',
      '<div role="menuitem"><i></i></div>',
      '<div role="menuitemcheckbox"><i></i></div>',
      '<div role="tab"><i></i></div>',
      '<div role="button"><i></i></div>',
    ]) {
      const el = wrap(html).querySelector('i')!;
      expect(pressesByDefault(el, true), html).toBe(false);
    }
  });

  it('a frame marked "press" presses its icon, whatever the icon is', async () => {
    const el = wrap(
      '<button data-motion-icon-frame="press"><i></i></button>'
    ).querySelector('i')!;
    expect(pressesByDefault(el, false)).toBe(true);
    expect(pressesByDefault(el, true)).toBe(true);
  });

  it('crossing shadow roots: an icon in a component’s shadow DOM inside a button', async () => {
    const button = wrap('<button><x-card></x-card></button>').querySelector(
      'x-card'
    )!;
    const root = button.attachShadow({ mode: 'open' });
    const el = document.createElement('i');
    root.append(el);
    expect(pressesByDefault(el, true)).toBe(false);
  });
});

describe('input (bindPress)', () => {
  it('a mouse: down presses, up releases; leave and cancel release; other buttons don’t press', async () => {
    const { svg, g } = icon(16);
    const off = bind(svg, g);
    pointer(svg, 'pointerdown');
    await step();
    expect(tf(g)).toBe('translate(2 2) scale(0.875)');
    pointer(svg, 'pointerup');
    await step(8);
    expect(tf(g)).toBeNull();
    for (const end of ['pointerleave', 'pointercancel']) {
      pointer(svg, 'pointerdown');
      await step();
      expect(scaleOf(g), end).toBe(0.875);
      pointer(svg, end);
      await step(8);
      expect(tf(g), end).toBeNull();
    }
    pointer(svg, 'pointerdown', { button: 2 });
    await step();
    expect(tf(g)).toBeNull();
    off();
  });

  it('touch and pen behave as the mouse', async () => {
    for (const pointerType of ['touch', 'pen']) {
      const { svg, g } = icon(32);
      const off = bind(svg, g);
      pointer(svg, 'pointerdown', { pointerType });
      await step();
      expect(scaleOf(g), pointerType).toBe(0.9375);
      pointer(svg, 'pointerup', { pointerType });
      // Touch: pointerleave follows pointerup; nothing more happens.
      pointer(svg, 'pointerleave', { pointerType });
      await step(8);
      expect(tf(g), pointerType).toBeNull();
      off();
    }
  });

  it('a quick tap still shows one pressed frame', async () => {
    const { svg, g } = icon(24);
    bind(svg, g);
    pointer(svg, 'pointerdown', { pointerType: 'touch' });
    pointer(svg, 'pointerup', { pointerType: 'touch' });
    await step();
    expect(scaleOf(g)).toBeCloseTo(22 / 24, 4);
    await step();
    expect(scaleOf(g)).toBeGreaterThan(22 / 24);
    await step(8);
    expect(tf(g)).toBeNull();
  });

  it('Space and Enter on the control: down presses, up releases; a held key’s repeats press nothing more', async () => {
    const button = document.createElement('button');
    button.setAttribute('aria-pressed', 'false');
    document.body.append(button);
    const { svg, g } = icon(32, button);
    const writes: (string | null)[] = [];
    const off = bindPress(svg, {
      force: () => undefined,
      own: () => true,
      animated: () => true,
      size: () => 32,
      groups: () => [
        {
          setAttribute: (_: string, v: string) => writes.push(v),
          removeAttribute: () => writes.push(null),
        } as unknown as Element,
        g,
      ],
    });
    for (const k of [' ', 'Enter']) {
      writes.length = 0;
      key(button, 'keydown', k);
      await step();
      expect(scaleOf(g), k).toBe(0.9375);
      for (let i = 0; i < 5; i++) {
        key(button, 'keydown', k, true);
        await step();
      }
      // One press: the pressed frame, then nothing until the key comes up.
      expect(writes, k).toEqual(['translate(1 1) scale(0.9375)']);
      key(button, 'keyup', k);
      await step(8);
      expect(tf(g), k).toBeNull();
    }
    // Other keys don't press; focus leaving releases a held key.
    key(button, 'keydown', 'a');
    await step();
    expect(tf(g)).toBeNull();
    key(button, 'keydown', ' ');
    await step();
    expect(scaleOf(g)).toBe(0.9375);
    button.dispatchEvent(new FocusEvent('focusout'));
    await step(8);
    expect(tf(g)).toBeNull();
    off();
  });

  it('pointer and key together: released when both have ended', async () => {
    const button = document.createElement('button');
    button.setAttribute('aria-pressed', 'false');
    document.body.append(button);
    const { svg, g } = icon(32, button);
    bind(svg, g);
    pointer(button, 'pointerdown');
    key(button, 'keydown', ' ');
    await step();
    pointer(button, 'pointerup');
    await step(8);
    expect(scaleOf(g)).toBe(0.9375);
    key(button, 'keyup', ' ');
    await step(8);
    expect(tf(g)).toBeNull();
  });

  it('a press frame: the frame’s pointer presses the icon', async () => {
    const frame = document.createElement('button');
    frame.setAttribute('data-motion-icon-frame', 'press');
    document.body.append(frame);
    const { svg, g } = icon(20, frame);
    bind(svg, g, { own: () => false });
    pointer(frame, 'pointerdown');
    await step();
    expect(scaleOf(g)).toBe(0.9);
  });

  it('inside a rollover button (a frame), cds-icon-button: no press; `press` true presses anyway, false never', async () => {
    const frame = document.createElement('cds-icon-button');
    frame.setAttribute('data-motion-icon-frame', '');
    document.body.append(frame);
    const { svg, g } = icon(16, frame);
    let force: boolean | undefined;
    bind(svg, g, { force: () => force });
    pointer(frame, 'pointerdown');
    await step();
    expect(tf(g)).toBeNull();
    pointer(frame, 'pointerup');
    force = true;
    pointer(frame, 'pointerdown');
    await step();
    expect(scaleOf(g)).toBe(0.875);
    pointer(frame, 'pointerup');
    await step(8);
    const alone = icon(16);
    force = false;
    bind(alone.svg, alone.g, { force: () => force });
    pointer(alone.svg, 'pointerdown');
    await step();
    expect(tf(alone.g)).toBeNull();
  });

  it('reduced motion, a disabled control: no press', async () => {
    const { svg, g } = icon();
    bind(svg, g, { animated: () => false });
    pointer(svg, 'pointerdown');
    await step();
    expect(tf(g)).toBeNull();
    for (const html of [
      '<button aria-pressed="false" disabled></button>',
      '<button aria-pressed="false" aria-disabled="true"></button>',
    ]) {
      const host = document.createElement('div');
      host.innerHTML = html;
      document.body.append(host);
      const b = host.firstElementChild!;
      const i = icon(32, b);
      bind(i.svg, i.g);
      pointer(b, 'pointerdown');
      key(b, 'keydown', ' ');
      await step();
      expect(tf(i.g), html).toBeNull();
    }
  });

  it('unbound mid-press: at rest', async () => {
    const { svg, g } = icon();
    const off = bind(svg, g);
    pointer(svg, 'pointerdown');
    await step();
    off();
    expect(tf(g)).toBeNull();
  });
});

describe('composition: its own attribute on its own element', () => {
  it('hover and the press: the hover’s shapes are the same pressed or not, the group carries the scale', async () => {
    const run = async (pressed: boolean) => {
      setScheduler((clock = manualScheduler()));
      const { svg, g } = icon(32);
      const c = new FrameController(
        fromHover(RenewSpec),
        (s) => paint(g, s),
        32,
        'rest'
      );
      bind(svg, g);
      c.repaint();
      c.enter();
      if (pressed) {
        pointer(svg, 'pointerdown');
      }
      await step(6);
      const out = { shapes: g.innerHTML, transform: tf(g) };
      c.destroy();
      svg.remove();
      return out;
    };
    const plain = await run(false);
    const pressed = await run(true);
    expect(pressed.shapes).toBe(plain.shapes);
    expect(plain.transform).toBeNull();
    expect(pressed.transform).toBe('translate(1 1) scale(0.9375)');
  });

  it('Renew’s turn: the root svg turns, the group scales; neither touches the other', async () => {
    const w = waapi(() => clock.time());
    const { svg, g } = icon(32);
    (svg as unknown as { animate: typeof w.animate }).animate = w.animate;
    const turn = startTurn(svg, [0, 0], 1000, clock.time())!;
    bind(svg, g);
    pointer(svg, 'pointerdown');
    await step();
    expect(w.live(svg)).toHaveLength(1);
    expect(w.live(svg)[0].keyframes[1].transform).toContain('rotate(1turn)');
    expect(svg.getAttribute('transform')).toBeNull();
    expect(tf(g)).toBe('translate(1 1) scale(0.9375)');
    turn.stop();
    expect(tf(g)).toBe('translate(1 1) scale(0.9375)');
  });
});
