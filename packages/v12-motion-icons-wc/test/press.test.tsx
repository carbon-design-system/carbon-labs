/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The press in the web components (the core's press.ts), on the parity harness's fake clock, against React where it
 * has an equivalent:
 *  - which elements press: `as-button`, `action-on="click"`, a frame marked
 *    `"press"`; not inside a rollover button (a frame) or `cds-icon-button`,
 *    nor status, hover-only or decorative icons; `press` / `press="none"`;
 *  - the pointer (mouse, touch), Space and Enter (a held key's repeats press
 *    nothing more);
 *  - during an action; reduced motion; disabled;
 *  - with hover, a toggle, Renew's turn and the spinner's layer;
 *  - the scale per size (1px a side);
 *  - React and the web components press alike, frame by frame.
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
import { waapi } from '../../v12-motion-icons-core/test/waapiStub';

type WC = HTMLElement & {
  updateComplete: Promise<unknown>;
  trigger(o?: object): Promise<void>;
};
const FRAME = 1000 / 60;
let e: Env;
beforeAll(async () => {
  e = await setup();
});
afterAll(() => vi.useRealTimers());
beforeEach(() => {
  alignClock();
  document.body.replaceChildren();
});

async function frame(n = 1) {
  for (let i = 0; i < n; i++) {
    e.act(() => vi.advanceTimersByTime(FRAME));
    await new Promise<void>((r) => setImmediate(r));
  }
}
async function mount(html: string): Promise<{ root: HTMLElement; el: WC }> {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  const el = root.querySelector<WC>('[data-icon]')!;
  await el.updateComplete;
  await frame();
  return { root, el };
}
const groups = (el: Element) => [
  ...el.shadowRoot!.querySelectorAll('g[data-mc-ink]'),
];
const tf = (el: Element) => groups(el)[0].getAttribute('transform');
const scaleOf = (t: string | null) =>
  Number(/scale\(([^)]+)\)/.exec(t ?? '')?.[1] ?? 1);
function pointer(el: Element, type: string, pointerType = 'mouse') {
  const ev = new MouseEvent(type, {
    bubbles: type !== 'pointerleave' && type !== 'pointerenter',
    composed: true,
    button: 0,
  });
  Object.defineProperty(ev, 'pointerType', { value: pointerType });
  el.dispatchEvent(ev);
}
const key = (
  el: Element,
  type: 'keydown' | 'keyup',
  k: string,
  repeat = false
) =>
  el.dispatchEvent(
    new KeyboardEvent(type, { key: k, repeat, bubbles: true, composed: true })
  );

describe('which elements press', () => {
  // [markup (the icon is [data-icon]), presses, where the pointer goes down (else the icon)]
  const CASES: [string, boolean, string?][] = [
    [
      '<clabs-motion-icon-bookmark-toggle data-icon as-button aria-label="Bookmark"></clabs-motion-icon-bookmark-toggle>',
      true,
    ],
    [
      '<clabs-motion-icon-star-toggle data-icon as-button aria-label="Star"></clabs-motion-icon-star-toggle>',
      true,
    ],
    [
      '<clabs-motion-icon-copy data-icon action-on="click"></clabs-motion-icon-copy>',
      true,
    ],
    [
      '<clabs-motion-icon-save data-icon action-on="click"></clabs-motion-icon-save>',
      true,
    ],
    [
      '<clabs-motion-icon-bookmark-toggle data-icon></clabs-motion-icon-bookmark-toggle>',
      false,
    ],
    ['<clabs-motion-icon-copy data-icon></clabs-motion-icon-copy>', false],
    [
      '<clabs-motion-icon-settings data-icon></clabs-motion-icon-settings>',
      false,
    ],
    [
      '<clabs-motion-icon-checkmark-filled-warning data-icon></clabs-motion-icon-checkmark-filled-warning>',
      false,
    ],
    [
      '<clabs-motion-icon-copy data-icon status="success"></clabs-motion-icon-copy>',
      false,
    ],
    // Inside something that presses: a rollover button (its frame), cds-icon-button, a tab, a menu item.
    [
      '<button class="rollover" data-motion-icon-frame><clabs-motion-icon-copy data-icon action-on="click"></clabs-motion-icon-copy></button>',
      false,
      'button',
    ],
    [
      '<cds-icon-button><clabs-motion-icon-copy data-icon slot="icon" action-on="click"></clabs-motion-icon-copy></cds-icon-button>',
      false,
    ],
    [
      '<cds-icon-button data-motion-icon-frame><clabs-motion-icon-bookmark-toggle data-icon slot="icon" as-button></clabs-motion-icon-bookmark-toggle></cds-icon-button>',
      false,
      'cds-icon-button',
    ],
    [
      '<div role="tab" data-motion-icon-frame><clabs-motion-icon-view-toggle data-icon></clabs-motion-icon-view-toggle></div>',
      false,
      '[role="tab"]',
    ],
    [
      '<div role="menuitem"><clabs-motion-icon-copy data-icon action-on="click"></clabs-motion-icon-copy></div>',
      false,
    ],
    // A frame that asks for it; the author's `press` either way.
    [
      '<button data-motion-icon-frame="press"><clabs-motion-icon-settings data-icon></clabs-motion-icon-settings></button>',
      true,
      'button',
    ],
    [
      '<clabs-motion-icon-settings data-icon press></clabs-motion-icon-settings>',
      true,
    ],
    [
      '<button data-motion-icon-frame><clabs-motion-icon-copy data-icon press></clabs-motion-icon-copy></button>',
      true,
      'button',
    ],
    [
      '<clabs-motion-icon-bookmark-toggle data-icon as-button aria-label="Bookmark" press="none"></clabs-motion-icon-bookmark-toggle>',
      false,
    ],
    [
      '<clabs-motion-icon-copy data-icon action-on="click" press="none"></clabs-motion-icon-copy>',
      false,
    ],
  ];
  it.each(CASES)('%s → %s', async (html, presses, at) => {
    const { root, el } = await mount(html);
    const target = at ? root.querySelector(at)! : el;
    pointer(target, 'pointerdown');
    await frame();
    expect(tf(el) !== null).toBe(presses);
    pointer(target, 'pointerup');
    await frame(10);
    expect(tf(el)).toBeNull();
  });
});

describe('a frame that turns "press" after mount', () => {
  it('presses with no update of the icon; turned back, it doesn’t', async () => {
    const { root, el } = await mount(
      '<button data-motion-icon-frame><clabs-motion-icon-settings data-icon></clabs-motion-icon-settings></button>'
    );
    const button = root.querySelector('button')!;
    button.setAttribute('data-motion-icon-frame', 'press');
    pointer(button, 'pointerdown');
    await frame();
    expect(tf(el)).not.toBeNull();
    pointer(button, 'pointerup');
    await frame(10);
    expect(tf(el)).toBeNull();
    key(button, 'keydown', 'Enter');
    await frame();
    expect(tf(el), 'Enter on the frame').not.toBeNull();
    key(button, 'keyup', 'Enter');
    await frame(10);
    button.setAttribute('data-motion-icon-frame', '');
    pointer(button, 'pointerdown');
    await frame();
    expect(tf(el)).toBeNull();
    pointer(button, 'pointerup');
  });
});

describe('input', () => {
  const BOOKMARK =
    '<clabs-motion-icon-bookmark-toggle data-icon as-button aria-label="Bookmark" size="32"></clabs-motion-icon-bookmark-toggle>';

  it('mouse and touch: down presses on the next frame, up releases over fast-02', async () => {
    for (const type of ['mouse', 'touch']) {
      const { el } = await mount(BOOKMARK);
      pointer(el, 'pointerdown', type);
      expect(tf(el), 'not before the frame').toBeNull();
      await frame();
      expect(tf(el), type).toBe('translate(1 1) scale(0.9375)');
      pointer(el, 'pointerup', type);
      pointer(el, 'pointerleave', type);
      const out: number[] = [];
      for (let i = 0; i < 8; i++) {
        await frame();
        out.push(scaleOf(tf(el)));
      }
      expect(out.at(-1)).toBe(1);
      expect(out.every((s, i) => s >= (out[i - 1] ?? 0.9375))).toBe(true);
      expect(
        out.filter((s) => s < 1).length,
        'fast-02 of release'
      ).toBeGreaterThanOrEqual(5);
    }
  });

  it('Space and Enter: keydown presses, keyup releases; a held key presses once and toggles once', async () => {
    for (const k of [' ', 'Enter']) {
      const { el } = await mount(BOOKMARK);
      const writes: string[] = [];
      const mo = new MutationObserver((rs) =>
        rs.forEach((r) =>
          writes.push(String((r.target as Element).getAttribute('transform')))
        )
      );
      mo.observe(groups(el)[0], {
        attributes: true,
        attributeFilter: ['transform'],
      });
      el.focus();
      key(el, 'keydown', k);
      await frame();
      for (let i = 0; i < 6; i++) {
        key(el, 'keydown', k, true);
        await frame();
      }
      expect(writes, k).toEqual(['translate(1 1) scale(0.9375)']);
      expect(el.getAttribute('aria-pressed'), 'one change').toBe('true');
      key(el, 'keyup', k);
      await frame(10);
      expect(tf(el)).toBeNull();
      mo.disconnect();
    }
  });

  it('a quick tap: one pressed frame, then the release', async () => {
    const { el } = await mount(BOOKMARK);
    pointer(el, 'pointerdown', 'touch');
    pointer(el, 'pointerup', 'touch');
    await frame();
    expect(scaleOf(tf(el))).toBe(0.9375);
    await frame();
    expect(scaleOf(tf(el))).toBeGreaterThan(0.9375);
  });

  it('during an action: the press plays (hover waits, the press doesn’t)', async () => {
    const { el } = await mount(
      '<clabs-motion-icon-copy data-icon action-on="click" size="32"></clabs-motion-icon-copy>'
    );
    pointer(el, 'pointerdown');
    pointer(el, 'pointerup');
    el.click();
    await frame(3);
    const before = JSON.stringify(painted(el.shadowRoot));
    pointer(el, 'pointerdown');
    await frame();
    expect(tf(el)).toBe('translate(1 1) scale(0.9375)');
    await frame(2);
    expect(
      JSON.stringify(painted(el.shadowRoot)),
      'the action plays on under it'
    ).not.toBe(before);
    pointer(el, 'pointerup');
    await frame(10);
    expect(tf(el)).toBeNull();
  });

  it('reduced motion, animated="false", disabled: no press', async () => {
    for (const html of [
      '<clabs-motion-icon-bookmark-toggle data-icon as-button aria-label="B" animated="false"></clabs-motion-icon-bookmark-toggle>',
      '<clabs-motion-icon-bookmark-toggle data-icon as-button aria-label="B" disabled></clabs-motion-icon-bookmark-toggle>',
      '<clabs-motion-icon-copy data-icon action-on="click" animated="false"></clabs-motion-icon-copy>',
    ]) {
      const { el } = await mount(html);
      pointer(el, 'pointerdown');
      key(el, 'keydown', ' ');
      await frame();
      expect(el.shadowRoot!.querySelector('[transform]'), html).toBeNull();
    }
    const { root, el } = await mount(
      '<button disabled data-motion-icon-frame="press"><clabs-motion-icon-settings data-icon></clabs-motion-icon-settings></button>'
    );
    pointer(root.querySelector('button')!, 'pointerdown');
    await frame();
    expect(tf(el)).toBeNull();
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'),
      media: q,
      addEventListener() {},
      removeEventListener() {},
    }));
    try {
      const { el: reduced } = await mount(BOOKMARK_REDUCED);
      pointer(reduced, 'pointerdown');
      await frame();
      expect(tf(reduced)).toBeNull();
    } finally {
      vi.unstubAllGlobals();
    }
  });
  const BOOKMARK_REDUCED =
    '<clabs-motion-icon-bookmark-toggle data-icon as-button aria-label="B"></clabs-motion-icon-bookmark-toggle>';
});

describe('composition: the press has its own attribute on its own element', () => {
  /** Hover in, a click mid-hover (a toggle change), with or without a press held throughout: the shapes, frame by frame. */
  async function run(pressed: boolean) {
    alignClock();
    const { el } = await mount(
      '<clabs-motion-icon-bookmark-toggle data-icon as-button aria-label="Bookmark" size="32"></clabs-motion-icon-bookmark-toggle>'
    );
    const shapes: string[] = [];
    const transforms = new Set<string | null>();
    pointer(el, 'pointerenter');
    if (pressed) pointer(el, 'pointerdown');
    for (let i = 0; i < 24; i++) {
      if (i === 6) el.click();
      await frame();
      shapes.push(JSON.stringify(painted(el.shadowRoot)));
      transforms.add(tf(el));
    }
    return { shapes, transforms };
  }

  it('hover and a toggle change under a held press: the same shapes, the group scaled', async () => {
    const plain = await run(false);
    const pressed = await run(true);
    expect(pressed.shapes).toEqual(plain.shapes);
    expect(new Set(plain.shapes).size, 'it moved').toBeGreaterThan(6);
    expect([...plain.transforms]).toEqual([null]);
    expect([...pressed.transforms]).toEqual(['translate(1 1) scale(0.9375)']);
  });

  it('Renew’s loop turns the svg, the press scales the group', async () => {
    const w = waapi(() => performance.now());
    const undo = w.install();
    try {
      const { el } = await mount(
        '<clabs-motion-icon-renew data-icon loop press size="32"></clabs-motion-icon-renew>'
      );
      await frame(40);
      const svg = el.shadowRoot!.querySelector('svg[part="svg"]')!;
      expect(w.live(svg), 'the turn').toHaveLength(1);
      pointer(el, 'pointerdown');
      await frame();
      expect(svg.getAttribute('transform')).toBeNull();
      expect(tf(el)).toBe('translate(1 1) scale(0.9375)');
      expect(w.live(svg)).toHaveLength(1);
      pointer(el, 'pointerup');
      await frame(10);
      expect(tf(el)).toBeNull();
      expect(w.live(svg), 'still turning').toHaveLength(1);
    } finally {
      undo();
    }
  });

  it('pending: the icon scales, the spinner’s layer doesn’t (its compositor turn is about the mark: no wobble)', async () => {
    const { el } = await mount(
      '<clabs-motion-icon-copy data-icon status="pending" press size="32"></clabs-motion-icon-copy>'
    );
    expect(groups(el)).toHaveLength(2);
    pointer(el, 'pointerdown');
    await frame();
    expect(groups(el).map((g) => g.getAttribute('transform'))).toEqual([
      'translate(1 1) scale(0.9375)',
      null,
    ]);
    expect(
      el.shadowRoot!.querySelector('svg[data-turn]')!.getAttribute('transform')
    ).toBeNull();
  });
});

describe('the scale per size', () => {
  it('1px a side at 16, 20, 24, 32', async () => {
    const seen: number[] = [];
    for (const size of [16, 20, 24, 32]) {
      const { el } = await mount(
        `<clabs-motion-icon-bookmark-toggle data-icon as-button aria-label="B" size="${size}"></clabs-motion-icon-bookmark-toggle>`
      );
      pointer(el, 'pointerdown');
      await frame();
      seen.push(scaleOf(tf(el)));
    }
    expect(seen).toEqual([0.875, 0.9, 0.9167, 0.9375]);
  });
});

describe('React and the web components press alike', () => {
  async function pair(
    name: string,
    tag: string,
    props: Record<string, unknown>,
    attrs: string
  ) {
    const C = e.lib[name] as React.FC<Record<string, unknown>>;
    const r = e.render(e.createElement(C, { ...props, animated: true }));
    const host = document.createElement('div');
    host.innerHTML = `<${tag} data-icon animated ${attrs}></${tag}>`;
    document.body.append(host);
    const el = host.firstElementChild as WC;
    await el.updateComplete;
    await frame();
    const reactG = () => r.container.querySelector('svg > g[data-mc-ink]')!;
    return {
      r,
      el,
      reactG,
      reactTarget: (r.container.querySelector('button') ??
        r.container.querySelector('svg'))!,
    };
  }

  it.each([
    [
      'BookmarkToggle',
      'clabs-motion-icon-bookmark-toggle',
      { asButton: true, 'aria-label': 'Bookmark' },
      'as-button aria-label="Bookmark"',
    ],
    [
      'Copy',
      'clabs-motion-icon-copy',
      { actionOn: 'click' },
      'action-on="click"',
    ],
    [
      'Save',
      'clabs-motion-icon-save',
      { actionOn: 'click', size: 16 },
      'action-on="click" size="16"',
    ],
    [
      'ViewToggle',
      'clabs-motion-icon-view-toggle',
      { asButton: true, 'aria-label': 'Show', size: 20 },
      'as-button aria-label="Show" size="20"',
    ],
  ] as const)(
    '%s: the same transform every frame (press, hold, release, a quick tap, Space)',
    async (name, tag, props, attrs) => {
      const p = await pair(name, tag, props, attrs);
      const both: [string | null, string | null][] = [];
      const sample = async (n: number) => {
        for (let i = 0; i < n; i++) {
          await frame();
          both.push([tf(p.el), p.reactG().getAttribute('transform')]);
        }
      };
      const on = (type: string, pt = 'mouse') => {
        pointer(p.el, type, pt);
        e.act(() => pointer(p.reactTarget, type, pt));
      };
      on('pointerdown');
      await sample(4);
      on('pointerup');
      await sample(10);
      on('pointerdown', 'touch');
      on('pointerup', 'touch');
      await sample(10);
      if ('asButton' in props) {
        key(p.el, 'keydown', ' ');
        e.act(() => void key(p.reactTarget, 'keydown', ' '));
        await sample(3);
        key(p.el, 'keyup', ' ');
        e.act(() => void key(p.reactTarget, 'keyup', ' '));
        await sample(10);
      }
      expect(
        both.filter(([w]) => w !== null).length,
        'it pressed'
      ).toBeGreaterThan(8);
      expect(both.map(([w]) => w)).toEqual(both.map(([, r]) => r));
      p.r.unmount();
    }
  );
});

describe('no hover replay on release', () => {
  /** React's drawing and the element's, mounted side by side with the same props. */
  async function both(
    name: string,
    tag: string,
    props: Record<string, unknown>,
    attrs: string
  ) {
    const C = e.lib[name] as React.FC<Record<string, unknown>>;
    const r = e.render(e.createElement(C, { ...props, animated: true }));
    const host = document.createElement('div');
    host.innerHTML = `<${tag} data-icon animated ${attrs}></${tag}>`;
    document.body.append(host);
    const el = host.firstElementChild as WC;
    await el.updateComplete;
    await frame();
    const svg = () =>
      (r.container.querySelector('button') ??
        r.container.querySelector('svg'))!;
    const drawn = () => [painted(el.shadowRoot), painted(r.container)] as const;
    const on = (type: string) => {
      pointer(el, type);
      e.act(() => pointer(svg(), type));
    };
    const click = () => {
      el.click();
      e.act(
        () =>
          void svg().dispatchEvent(new MouseEvent('click', { bubbles: true }))
      );
    };
    return { r, el, drawn, on, click };
  }

  it.each([
    [
      'Save',
      'clabs-motion-icon-save',
      { actionOn: 'click' },
      'action-on="click"',
      60,
    ],
    [
      'Copy',
      'clabs-motion-icon-copy',
      { actionOn: 'click' },
      'action-on="click"',
      60,
    ],
    [
      'Send',
      'clabs-motion-icon-send',
      { actionOn: 'click' },
      'action-on="click"',
      60,
    ],
    // The hand-off: the status shows, clears, and the plain icon is back at rest under the pointer.
    [
      'Save',
      'clabs-motion-icon-save',
      { actionOn: 'click', actionThen: { status: 'success', for: 300 } },
      'action-on="click" action-then="success 300"',
      120,
    ],
    [
      'Copy',
      'clabs-motion-icon-copy',
      { actionOn: 'click', actionThen: { status: 'success', for: 300 } },
      'action-on="click" action-then="success 300"',
      120,
    ],
  ] as const)(
    '%s (%s): hovered, pressed and clicked, the pointer staying: at rest after the action until it leaves and comes back',
    async (name, tag, props, attrs, n) => {
      const p = await both(name, tag, props, attrs);
      const rest = p.drawn();
      p.on('pointerenter');
      await frame(20);
      const hovered = p.drawn();
      expect(diff(hovered[0], rest[0])).not.toBeNull();
      p.on('pointerdown');
      await frame(2);
      p.on('pointerup');
      p.click();
      await frame(n);
      // Over (and the status gone): the rest drawing, and it stays there: no hover easing back in.
      for (let i = 0; i < 20; i++) {
        await frame();
        // (The status layer's empty marks, while it hands back, draw nothing: diff drops them.)
        const [w, r] = p.drawn();
        expect(diff(w, rest[0]), `${name} wc, frame ${i} after`).toBeNull();
        expect(diff(r, rest[1]), `${name} react, frame ${i} after`).toBeNull();
      }
      // Leaves and comes back: the hover plays.
      p.on('pointerleave');
      await frame(10);
      p.on('pointerenter');
      await frame(20);
      const [w, r] = p.drawn();
      expect(diff(w, hovered[0])).toBeNull();
      expect(diff(r, hovered[1])).toBeNull();
      p.r.unmount();
    }
  );

  it.each([
    [
      'bookmark',
      '<clabs-motion-icon-bookmark-toggle data-icon as-button aria-label="B"></clabs-motion-icon-bookmark-toggle>',
    ],
    [
      'star',
      '<clabs-motion-icon-star-toggle data-icon as-button aria-label="S"></clabs-motion-icon-star-toggle>',
    ],
    [
      'view',
      '<clabs-motion-icon-view-toggle data-icon as-button aria-label="V"></clabs-motion-icon-view-toggle>',
    ],
    [
      'locked',
      '<clabs-motion-icon-locked-toggle data-icon as-button aria-label="L"></clabs-motion-icon-locked-toggle>',
    ],
  ])(
    '%s as-button: hovered, pressed and clicked twice: the hover never dips and comes back',
    async (_, html) => {
      const { el } = await mount(html);
      const h = () =>
        (el as unknown as { controller: { frame: { h: number } } }).controller
          .frame.h;
      pointer(el, 'pointerenter');
      await frame(20);
      const hs: number[] = [];
      for (let c = 0; c < 2; c++) {
        pointer(el, 'pointerdown');
        await frame(2);
        pointer(el, 'pointerup');
        el.click();
        for (let i = 0; i < 40; i++) {
          await frame();
          hs.push(h());
        }
      }
      // Held hovered, or dropped to rest by a holdAfter and held there: never down and back up.
      const low = hs.findIndex((x) => x < 1 - 1e-6);
      if (low >= 0)
        expect(
          hs.slice(low).every((x, i, a) => i === 0 || x <= a[i - 1] + 1e-9)
        ).toBe(true);
    }
  );
});
