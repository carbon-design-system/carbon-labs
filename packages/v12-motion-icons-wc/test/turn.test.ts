/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The compositor turn in the web components (branch icons/cleanup-turn),
 * with Web Animations stubbed on the engine's clock (jsdom has none; the
 * real browsers are apps/wc-harness/tests/turn.spec.ts):
 *  - a status icon that takes pending stacks the spinner's layer (an svg in
 *    the same grid cell); others draw exactly as before;
 *  - pending: one turn of the layer, the arc there and empty in the icon's
 *    drawing; reduced motion on and off at runtime, off screen, hover,
 *    pending → success → pending, a size change, disconnect and reconnect;
 *  - Renew's `loop`: one turn of the icon's own svg in the steady stretch;
 *    `loop` removed, none, and it lands on the rest drawing.
 */
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  manualScheduler,
  setScheduler,
} from '@carbon-labs/motion-icons-core/engine';
import { waapi } from '../../v12-motion-icons-core/test/waapiStub';

type IconEl = HTMLElement & { updateComplete: Promise<unknown>; loop: boolean };

class FakeIO {
  static all: FakeIO[] = [];
  constructor(
    private cb: (
      entries: { target: Element; isIntersecting: boolean }[]
    ) => void
  ) {
    FakeIO.all.push(this);
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  show(els: Element[], on: boolean) {
    this.cb(els.map((target) => ({ target, isIntersecting: on })));
  }
}

const query = { matches: false, listeners: new Set<() => void>() };
const setReduced = (on: boolean) => {
  query.matches = on;
  query.listeners.forEach((l) => l());
};

let clock = manualScheduler();
const w = waapi(() => clock.time());
let uninstall: () => void;

beforeAll(async () => {
  vi.stubGlobal('IntersectionObserver', FakeIO);
  vi.stubGlobal('matchMedia', (q: string) => ({
    get matches() {
      return q.includes('reduce') && query.matches;
    },
    media: q,
    addEventListener: (_: string, l: () => void) => query.listeners.add(l),
    removeEventListener: (_: string, l: () => void) =>
      query.listeners.delete(l),
  }));
  uninstall = w.install();
  await import('../src/define-all');
});
afterAll(() => uninstall());

const made: Element[] = [];
afterEach(() => {
  made.splice(0).forEach((e) => e.remove());
  setScheduler(null);
  setReduced(false);
});

const flush = async () => {
  for (let i = 0; i < 4; i++) {
    await new Promise<void>((r) => setTimeout(r, 0));
  }
};
async function step(ms: number) {
  for (let t = 0; t < ms; t += 1000 / 60) {
    clock.advance(1000 / 60);
    for (let i = 0; i < 4; i++) {
      await Promise.resolve();
    }
  }
}

async function mount(html: string): Promise<IconEl> {
  clock = manualScheduler();
  setScheduler(clock);
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  made.push(root);
  const el = root.firstElementChild as IconEl;
  await el.updateComplete;
  await flush();
  return el;
}

const q = (el: Element, sel: string) => el.shadowRoot!.querySelector(sel);
const layer = (el: Element) => q(el, 'svg[data-turn]')!;
const icon = (el: Element) => q(el, 'svg[part="svg"]')!;
const arcIn = (svg: Element) =>
  svg.querySelector('[data-k="status-spin"]')?.getAttribute('d') ?? null;
const turnsOf = (target: Element) => w.live(target);

describe('the spinner’s layer', () => {
  it('a status icon that takes pending stacks it in one grid cell; a notification icon draws as before', async () => {
    const renew = await mount(
      '<clabs-motion-icon-renew></clabs-motion-icon-renew>'
    );
    const stack = q(renew, '.stack')!;
    expect(
      [...stack.children].map(
        (c) =>
          c.getAttribute('part') ?? (c.hasAttribute('data-turn') ? 'turn' : '')
      )
    ).toEqual(['svg', 'turn']);
    expect(layer(renew).getAttribute('viewBox')).toBe('0 0 32 32');
    expect(layer(renew).getAttribute('width')).toBe('32');
    const bell = await mount(
      '<clabs-motion-icon-notification></clabs-motion-icon-notification>'
    );
    expect(q(bell, '.stack')).toBeNull();
    expect(q(bell, 'svg[data-turn]')).toBeNull();
  });

  it('pending: one turn of the layer, the arc there and empty in the icon’s drawing', async () => {
    const el = await mount(
      '<clabs-motion-icon-renew status="pending" size="24"></clabs-motion-icon-renew>'
    );
    await step(50);
    expect(turnsOf(layer(el))).toHaveLength(1);
    expect(turnsOf(icon(el))).toHaveLength(0);
    expect(arcIn(icon(el))).toBe('');
    expect(arcIn(layer(el))).not.toBe('');
    // While it turns, only the swing repaints: the layer's arc changes length, the icon's drawing holds.
    const [drawn, arc] = [icon(el).innerHTML, arcIn(layer(el))];
    await step(40);
    expect(icon(el).innerHTML).toBe(drawn);
    expect(arcIn(layer(el))).not.toBe(arc);
    expect(turnsOf(layer(el))).toHaveLength(1);
  });

  it('reduced motion on at runtime: no turn, the still dots; off again: one turn', async () => {
    const el = await mount(
      '<clabs-motion-icon-copy status="pending"></clabs-motion-icon-copy>'
    );
    await step(50);
    const first = turnsOf(layer(el))[0];
    setReduced(true);
    await el.updateComplete;
    await flush();
    expect(first.playState).toBe('idle');
    expect(
      w.live().filter((a) => el.shadowRoot!.contains(a.target as Node))
    ).toHaveLength(0);
    expect(q(el, '[data-k="status-dots"]')!.getAttribute('d')).not.toBe('');
    setReduced(false);
    await el.updateComplete;
    await flush();
    await step(50);
    expect(turnsOf(layer(el))).toHaveLength(1);
  });

  it('off screen it holds; back on screen it runs', async () => {
    const el = await mount(
      '<clabs-motion-icon-save status="pending"></clabs-motion-icon-save>'
    );
    await step(50);
    const io = FakeIO.all.at(-1)!;
    io.show([el], false);
    expect(turnsOf(layer(el))[0].playState).toBe('paused');
    io.show([el], true);
    expect(turnsOf(layer(el))[0].playState).toBe('running');
  });

  it('hover during pending: still one turn, running', async () => {
    const el = await mount(
      '<clabs-motion-icon-renew status="pending"></clabs-motion-icon-renew>'
    );
    await step(50);
    el.dispatchEvent(new MouseEvent('mouseenter'));
    await step(200);
    expect(turnsOf(layer(el)).map((a) => a.playState)).toEqual(['running']);
  });

  it('pending → success: it turns through the exit, then none and no arc; success → pending: one again', async () => {
    const el = await mount(
      '<clabs-motion-icon-renew status="pending"></clabs-motion-icon-renew>'
    );
    await step(100);
    el.setAttribute('status', 'success');
    await el.updateComplete;
    await step(1000 / 60);
    expect(turnsOf(layer(el))).toHaveLength(1);
    await step(400);
    expect(turnsOf(layer(el))).toHaveLength(0);
    expect(arcIn(layer(el))).toBeNull();
    expect(arcIn(icon(el))).toBe('');
    el.setAttribute('status', 'pending');
    await el.updateComplete;
    await step(50);
    expect(turnsOf(layer(el))).toHaveLength(1);
  });

  it('a size change: the old turn goes, one new turn about the scaled centre', async () => {
    const el = await mount(
      '<clabs-motion-icon-renew status="pending" size="32"></clabs-motion-icon-renew>'
    );
    await step(50);
    const before = turnsOf(layer(el))[0];
    el.setAttribute('size', '16');
    await el.updateComplete;
    await step(50);
    expect(before.playState).toBe('idle');
    const now = turnsOf(layer(el));
    expect(now).toHaveLength(1);
    expect(String(now[0].keyframes[0].transform)).not.toBe(
      String(before.keyframes[0].transform)
    );
  });

  it('disconnect: its turn is cancelled; reconnect: exactly one', async () => {
    const el = await mount(
      '<clabs-motion-icon-renew status="pending"></clabs-motion-icon-renew>'
    );
    await step(50);
    const parent = el.parentNode!;
    el.remove();
    expect(
      w.live().filter((a) => el.shadowRoot!.contains(a.target as Node))
    ).toHaveLength(0);
    parent.appendChild(el);
    await el.updateComplete;
    await step(50);
    expect(
      w.live().filter((a) => el.shadowRoot!.contains(a.target as Node))
    ).toHaveLength(1);
  });
});

describe('Renew’s loop', () => {
  it('one turn of the icon’s own svg in the steady stretch; `loop` removed, none, and it lands on the rest drawing', async () => {
    const rest = await mount(
      '<clabs-motion-icon-renew></clabs-motion-icon-renew>'
    );
    const restDrawing = q(rest, 'g[data-mc-ink]')!.innerHTML;
    const el = await mount(
      '<clabs-motion-icon-renew loop></clabs-motion-icon-renew>'
    );
    await step(300);
    expect(turnsOf(icon(el))).toHaveLength(0);
    await step(400);
    expect(turnsOf(icon(el))).toHaveLength(1);
    expect(turnsOf(layer(el))).toHaveLength(0);
    el.removeAttribute('loop');
    await el.updateComplete;
    await flush();
    expect(turnsOf(icon(el))).toHaveLength(0);
    await step(1500);
    expect(q(el, 'g[data-mc-ink]')!.innerHTML).toBe(restDrawing);
  });

  it('stopped with action-then: the hand-off follows from where the turn was', async () => {
    const el = await mount(
      '<clabs-motion-icon-renew loop action-then="success"></clabs-motion-icon-renew>'
    );
    await step(800);
    expect(turnsOf(icon(el))).toHaveLength(1);
    el.removeAttribute('loop');
    await el.updateComplete;
    await step(1200);
    expect(turnsOf(icon(el))).toHaveLength(0);
    expect(q(el, '[data-k="status-check"]')!.getAttribute('d')).not.toBe('');
  });
});
