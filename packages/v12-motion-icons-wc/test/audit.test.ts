/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The elements' lifecycle and robustness checks, each against its probe:
 *  - disconnected, an element stops every frame (a pending spinner, a
 *    looping action, a hover in flight) and its hand-off timer; connected
 *    again (moved, into another shadow root) it works, at rest, with no
 *    stuck hover;
 *  - `size` set as a property is never markup;
 *  - a bare element is hidden from assistive tech from its first update;
 *  - a value outside the icon's states is ignored, with a warning;
 *  - the server output's attribute names, aria-hidden and as-button;
 *  - `name="toString"`, `action-then` and `max` out of range, a held Space.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  manualScheduler,
  setScheduler,
  type Scheduler,
} from '@carbon-labs/motion-icons-core/engine';

type IconEl = HTMLElement & {
  updateComplete: Promise<unknown>;
  play(): void;
  trigger(o?: object): Promise<void>;
  value?: string;
  toggled?: boolean;
  size?: unknown;
  status?: string;
  actionThen?: unknown;
  internals?: ElementInternals & { ariaHidden?: string | null };
};

beforeAll(async () => {
  await import('../src/define-all');
  await import('../src/motion-icon');
});

const made: Element[] = [];
afterEach(() => {
  made.splice(0).forEach((e) => e.remove());
  setScheduler(null);
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/** The manual clock, counting the frames it runs. */
function countingClock() {
  const c = manualScheduler();
  const s = {
    ticks: 0,
    now: c.now,
    cancel: c.cancel,
    request(cb: (t: number) => void) {
      return c.request((t) => {
        s.ticks++;
        cb(t);
      });
    },
    advance: c.advance,
  };
  setScheduler(s as Scheduler);
  return s;
}

async function mount(
  html: string,
  into: ParentNode = document.body
): Promise<HTMLElement> {
  const root = document.createElement('div');
  root.innerHTML = html;
  into.append(root);
  made.push(root);
  await Promise.all(
    [...root.querySelectorAll<IconEl>('*')].map((e) => e.updateComplete)
  );
  return root;
}

const flush = async () => {
  for (let i = 0; i < 4; i++) {
    await Promise.resolve();
  }
};
const drawing = (el: Element) => el.shadowRoot!.querySelector('svg')!.innerHTML;

async function frames(
  clock: { advance(ms: number): void },
  ms: number,
  el?: Element
): Promise<string[]> {
  const seen: string[] = [];
  for (let t = 0; t < ms; t += 1000 / 60) {
    clock.advance(1000 / 60);
    await flush();
    if (el) {
      seen.push(drawing(el));
    }
  }
  return seen;
}

describe('disconnect and reconnect', () => {
  it('disconnected, nothing keeps the frame loop running: a pending spinner, a looping action, a hover in flight', async () => {
    const clock = countingClock();
    const root = await mount(
      '<clabs-motion-icon-settings status="pending"></clabs-motion-icon-settings><clabs-motion-icon-renew loop></clabs-motion-icon-renew><clabs-motion-icon-trash-can loop></clabs-motion-icon-trash-can>' +
        '<button data-motion-icon-frame><clabs-motion-icon-add></clabs-motion-icon-add></button>'
    );
    root.querySelector('button')!.dispatchEvent(new MouseEvent('mouseenter'));
    await frames(clock, 50);
    expect(clock.ticks, 'running while connected').toBeGreaterThan(0);
    root.remove();
    await flush();
    const before = clock.ticks;
    await frames(clock, 1000);
    expect(
      clock.ticks - before,
      'frames after every icon left the document'
    ).toBe(0);
  });

  it("disconnected, the hand-off's clearing timer is cleared", async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const root = await mount(
      '<clabs-motion-icon-copy animated="false"></clabs-motion-icon-copy>'
    );
    const el = root.firstElementChild as IconEl;
    await el.trigger({ then: { status: 'success', for: 5000 } });
    expect(vi.getTimerCount()).toBe(1);
    root.remove();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('moved (into another shadow root too): it animates again, keeps its state and its loop', async () => {
    const clock = countingClock();
    const root = await mount(
      '<clabs-motion-icon-settings status="pending"></clabs-motion-icon-settings><clabs-motion-icon-bookmark-toggle value="on"></clabs-motion-icon-bookmark-toggle><clabs-motion-icon-renew loop></clabs-motion-icon-renew>'
    );
    const [spin, bookmark, renew] = [...root.children] as IconEl[];
    const host = document.createElement('div');
    document.body.append(host);
    made.push(host);
    const shadow = host.attachShadow({ mode: 'open' });
    const onDrawing = drawing(bookmark);
    for (const el of [spin, bookmark, renew]) {
      shadow.append(el);
    }
    await flush();
    expect(
      new Set(await frames(clock, 300, spin)).size,
      'the spinner turns again'
    ).toBeGreaterThan(3);
    expect(
      new Set(await frames(clock, 300, renew)).size,
      'the loop plays again'
    ).toBeGreaterThan(3);
    expect(drawing(bookmark), 'the toggle keeps its state').toBe(onDrawing);
    // The hover binds to the new place.
    const frame = document.createElement('button');
    frame.setAttribute('data-motion-icon-frame', '');
    shadow.append(frame);
    frame.append(bookmark);
    await flush();
    frame.dispatchEvent(new MouseEvent('mouseenter'));
    expect(
      new Set(await frames(clock, 300, bookmark)).size,
      'it hovers in its new frame'
    ).toBeGreaterThan(3);
  });

  it('re-attached while hovered, it is at rest (no stuck hover)', async () => {
    const clock = countingClock();
    const root = await mount(
      '<button data-motion-icon-frame><clabs-motion-icon-settings></clabs-motion-icon-settings></button>'
    );
    const frame = root.querySelector('button')!;
    const el = frame.firstElementChild as IconEl;
    const rest = drawing(el);
    frame.dispatchEvent(new MouseEvent('mouseenter'));
    const hovered = (await frames(clock, 400, el)).at(-1);
    expect(hovered).not.toBe(rest);
    el.remove();
    root.append(el);
    await flush();
    expect((await frames(clock, 400, el)).at(-1)).toBe(rest);
  });
});

describe('size as a property', () => {
  it('is never markup: the still draws at a size it supports', async () => {
    const root = await mount(
      '<clabs-motion-icon-add animated="false"></clabs-motion-icon-add>'
    );
    const el = root.firstElementChild as IconEl;
    el.size = '16"><img src="x:" onerror="window.__xss=1">';
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('img')).toBeNull();
    expect((window as { __xss?: number }).__xss).toBeUndefined();
    expect(el.shadowRoot!.querySelector('svg')!.getAttribute('width')).toBe(
      '32'
    );
    el.size = 20;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('svg')!.getAttribute('width')).toBe(
      '20'
    );
  });
});

describe('a bare element', () => {
  it('is hidden from assistive tech from its first update', async () => {
    const root = await mount('<clabs-motion-icon-add></clabs-motion-icon-add>');
    const el = root.firstElementChild as IconEl;
    const internals = (
      el as unknown as { internals?: { ariaHidden?: string | null } }
    ).internals;
    expect(
      el.getAttribute('aria-hidden') === 'true' ||
        internals?.ariaHidden === 'true'
    ).toBe(true);
  });
});

describe('a value outside the states', () => {
  it('on a toggle: ignored with a warning, the drawing and toggled kept', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const root = await mount(
      '<clabs-motion-icon-bookmark-toggle as-button></clabs-motion-icon-bookmark-toggle><clabs-motion-icon-bookmark-toggle value="on"></clabs-motion-icon-bookmark-toggle>'
    );
    const [el, onRef] = [...root.children] as IconEl[];
    const off = drawing(el);
    el.value = 'typo';
    await el.updateComplete;
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"typo"'));
    expect(drawing(el)).toBe(off);
    expect(drawing(el)).not.toBe(drawing(onRef));
    expect([el.value, el.toggled, el.getAttribute('aria-pressed')]).toEqual([
      'off',
      false,
      'false',
    ]);
    // In the HTML: the default state.
    const html = await mount(
      '<clabs-motion-icon-bookmark-toggle value="typo"></clabs-motion-icon-bookmark-toggle>'
    );
    expect(drawing(html.firstElementChild!)).toBe(off);
  });

  it('on VolumeLevelToggle: no throw, the level kept', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const errors: unknown[] = [];
    const onError = (e: ErrorEvent) => errors.push(e.error);
    window.addEventListener('error', onError);
    const root = await mount(
      '<clabs-motion-icon-volume-level-toggle value="loud"></clabs-motion-icon-volume-level-toggle>'
    );
    const el = root.firstElementChild as IconEl;
    const loud = drawing(el);
    el.value = 'typo';
    await el.updateComplete;
    window.removeEventListener('error', onError);
    expect(errors).toEqual([]);
    expect(el.value).toBe('loud');
    expect(drawing(el)).toBe(loud);
    expect(warn).toHaveBeenCalled();
  });
});

describe('the server output', () => {
  it('drops attribute names that are not names', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { renderIconHTML } = await import('../src/ssr');
    const { ClabsMotionIconAdd } = await import('../src/index');
    const html = renderIconHTML(ClabsMotionIconAdd, {
      'x onmouseover=alert(1) y': 'v',
      'data-ok': 'yes',
    });
    expect(html).not.toContain('onmouseover');
    expect(html).toContain(' data-ok="yes"');
    expect(warn).toHaveBeenCalled();
  });

  it("never writes a second aria-hidden (or role) over the author's", async () => {
    const { renderIconHTML } = await import('../src/ssr');
    const { ClabsMotionIconAdd } = await import('../src/index');
    const open = (html: string) => html.slice(0, html.indexOf('>'));
    expect(
      open(
        renderIconHTML(ClabsMotionIconAdd, { 'aria-hidden': 'false' })
      ).match(/aria-hidden=/g)
    ).toHaveLength(1);
    expect(
      open(
        renderIconHTML(ClabsMotionIconAdd, {
          'aria-label': 'Add',
          role: 'presentation',
        })
      ).match(/role=/g)
    ).toHaveLength(1);
  });

  it('an as-button toggle is a button, as the element makes itself on upgrade', async () => {
    const { renderIconHTML } = await import('../src/ssr');
    const { ClabsMotionIconBookmarkToggle } = await import('../src/index');
    for (const value of ['off', 'on']) {
      const html = renderIconHTML(ClabsMotionIconBookmarkToggle, {
        'as-button': true,
        'aria-label': 'Bookmark',
        value,
      });
      const open = html.slice(0, html.indexOf('>'));
      const root = await mount(
        `<clabs-motion-icon-bookmark-toggle as-button aria-label="Bookmark" value="${value}"></clabs-motion-icon-bookmark-toggle>`
      );
      const el = root.firstElementChild!;
      for (const a of ['role', 'tabindex', 'aria-pressed']) {
        expect(open, a).toContain(` ${a}="${el.getAttribute(a)}"`);
      }
      expect(open).not.toContain('aria-hidden');
      expect(open).not.toContain('role="img"');
    }
  });
});

describe('robustness', () => {
  it('clabs-motion-icon name="toString" draws nothing, and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const errors: unknown[] = [];
    const onError = (e: PromiseRejectionEvent) => errors.push(e.reason);
    window.addEventListener('unhandledrejection', onError);
    const root = await mount(
      '<clabs-motion-icon name="toString"></clabs-motion-icon>'
    );
    await vi.waitFor(() => expect(warn).toHaveBeenCalled());
    window.removeEventListener('unhandledrejection', onError);
    expect(errors).toEqual([]);
    expect(
      (root.firstElementChild as HTMLElement & { icon?: HTMLElement }).icon
    ).toBeUndefined();
  });

  it('action-then: blank is no hand-off, a time below 0 or not a number is ignored (with a warning)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const root = await mount(
      '<clabs-motion-icon-copy action-then="  "></clabs-motion-icon-copy><clabs-motion-icon-copy action-then="success -1"></clabs-motion-icon-copy><clabs-motion-icon-copy action-then="success 1500"></clabs-motion-icon-copy>'
    );
    const [blank, negative, ok] = [...root.children] as IconEl[];
    expect(blank.actionThen).toBeUndefined();
    expect(negative.actionThen).toEqual({ status: 'success' });
    expect(ok.actionThen).toEqual({ status: 'success', for: 1500 });
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('max out of range is clamped to 9 or 99', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const root = await mount(
      '<clabs-motion-icon-notification count="8" max="7"></clabs-motion-icon-notification><clabs-motion-icon-notification count="8" max="9"></clabs-motion-icon-notification>' +
        '<clabs-motion-icon-notification count="120" max="500"></clabs-motion-icon-notification><clabs-motion-icon-notification count="120" max="99"></clabs-motion-icon-notification>'
    );
    const [seven, nine, big, ninetyNine] = [...root.children];
    expect(drawing(seven)).toBe(drawing(nine));
    expect(drawing(big)).toBe(drawing(ninetyNine));
  });

  it('a held Space toggles an as-button once', async () => {
    const root = await mount(
      '<clabs-motion-icon-bookmark-toggle as-button></clabs-motion-icon-bookmark-toggle>'
    );
    const el = root.firstElementChild as IconEl;
    el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    await el.updateComplete;
    expect(el.value).toBe('on');
    for (let i = 0; i < 5; i++) {
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: ' ', repeat: true, bubbles: true })
      );
      await el.updateComplete;
    }
    expect(el.value).toBe('on');
  });
});

describe('names and disabled', () => {
  const role = (el: Element) =>
    el.getAttribute('role') ?? (el as IconEl).internals?.role ?? null;
  const open = (h: string) => h.slice(0, h.indexOf('>'));

  it('aria-labelledby or title is an accessible name: role="img", not hidden; on the server too', async () => {
    const { renderIconHTML } = await import('../src/ssr');
    const { ClabsMotionIconAdd } = await import('../src/index');
    for (const [k, v] of [
      ['aria-label', 'Add'],
      ['aria-labelledby', 'x'],
      ['title', 'Add'],
    ]) {
      const root = await mount(
        `<span id="x">Add</span><clabs-motion-icon-add ${k}="${v}"></clabs-motion-icon-add>`
      );
      const el = root.querySelector<IconEl>(
        '[aria-label], [aria-labelledby], [title]'
      )!;
      expect(role(el), k).toBe('img');
      expect(el.getAttribute('aria-hidden'), k).toBeNull();
      expect(open(renderIconHTML(ClabsMotionIconAdd, { [k]: v })), k).toContain(
        'role="img"'
      );
      expect(
        open(renderIconHTML(ClabsMotionIconAdd, { [k]: v })),
        k
      ).not.toContain('aria-hidden');
    }
    // A name set later: the role follows.
    const root = await mount('<clabs-motion-icon-add></clabs-motion-icon-add>');
    const el = root.firstElementChild as IconEl;
    el.setAttribute('title', 'Add');
    await el.updateComplete;
    expect(role(el)).toBe('img');
  });

  it('an as-button with no accessible name warns, once per element', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const named = () =>
      warn.mock.calls.filter(([m]) => String(m).includes('no accessible name'));
    await mount(
      '<clabs-motion-icon-star-toggle as-button></clabs-motion-icon-star-toggle><clabs-motion-icon-star-toggle as-button></clabs-motion-icon-star-toggle>'
    );
    expect(named()).toHaveLength(1);
    warn.mockClear();
    await mount(
      '<clabs-motion-icon-pin-toggle as-button title="Pin"></clabs-motion-icon-pin-toggle>'
    );
    expect(named()).toHaveLength(0);
  });

  it('disabled on an as-button: no tab stop, no toggling by click or key, aria-disabled; enabled again, back', async () => {
    const root = await mount(
      '<clabs-motion-icon-bookmark-toggle as-button aria-label="Bookmark" disabled></clabs-motion-icon-bookmark-toggle>'
    );
    const el = root.firstElementChild as IconEl & { disabled: boolean };
    expect(el.hasAttribute('tabindex')).toBe(false);
    expect(el.getAttribute('aria-disabled')).toBe('true');
    el.click();
    el.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    );
    await el.updateComplete;
    expect(el.value ?? 'off').toBe('off');
    el.disabled = false;
    await el.updateComplete;
    expect([
      el.getAttribute('tabindex'),
      el.getAttribute('aria-disabled'),
    ]).toEqual(['0', null]);
    el.click();
    await el.updateComplete;
    expect(el.value).toBe('on');
    // The server output matches.
    const { renderIconHTML } = await import('../src/ssr');
    const { ClabsMotionIconBookmarkToggle } = await import('../src/index');
    const html = open(
      renderIconHTML(ClabsMotionIconBookmarkToggle, {
        'as-button': true,
        'aria-label': 'Bookmark',
        disabled: true,
      })
    );
    expect(html).toContain('aria-disabled="true"');
    expect(html).not.toContain('tabindex');
  });

  it('a disabled as-button does not hover', async () => {
    const clock = countingClock();
    const root = await mount(
      '<clabs-motion-icon-bookmark-toggle as-button aria-label="b" disabled></clabs-motion-icon-bookmark-toggle>'
    );
    const el = root.firstElementChild as IconEl;
    const rest = drawing(el);
    el.dispatchEvent(new MouseEvent('mouseenter'));
    expect(new Set(await frames(clock, 300, el))).toEqual(new Set([rest]));
  });
});

describe('tones under forced colors', () => {
  it("every element's shadow styles carry the forced-colors rules; the server output too", async () => {
    const root = await mount(
      '<clabs-motion-icon-settings status="warning" tone></clabs-motion-icon-settings>'
    );
    const el = root.firstElementChild as IconEl;
    const sheets =
      [...(el.shadowRoot!.adoptedStyleSheets ?? [])]
        .map((s) => [...s.cssRules].map((r) => r.cssText).join('\n'))
        .join('\n') +
      [...el.shadowRoot!.querySelectorAll('style')]
        .map((s) => s.textContent)
        .join('\n');
    expect(sheets).toContain('forced-colors');
    const { renderIconHTML } = await import('../src/ssr');
    const { ClabsMotionIconSettings } = await import('../src/index');
    expect(
      renderIconHTML(ClabsMotionIconSettings, { status: 'warning', tone: true })
    ).toContain('forced-colors');
  });

  it('the toned warning is filled like Carbon: the "!" a dark path in a hole of the fill, which forced colors drops', async () => {
    const root = await mount(
      '<clabs-motion-icon-settings status="warning" tone size="16"></clabs-motion-icon-settings>'
    );
    const el = root.firstElementChild as IconEl;
    const warn = el.shadowRoot!.querySelector('[data-k="status-warn"]')!;
    const bang = el.shadowRoot!.querySelector('[data-k="status-bang"]')!;
    expect(warn.getAttribute('fill')).toBe(
      'var(--cds-support-warning, #f1c21b)'
    );
    expect(warn.getAttribute('fill-rule')).toBe('evenodd');
    expect(bang.getAttribute('fill')).toBe('#000000');
    expect(bang.getAttribute('d')).not.toBe('');
    expect(warn.getAttribute('d')!.endsWith(bang.getAttribute('d')!)).toBe(
      true
    );
    const sheets =
      [...(el.shadowRoot!.adoptedStyleSheets ?? [])]
        .map((s) => [...s.cssRules].map((r) => r.cssText).join('\n'))
        .join('\n') +
      [...el.shadowRoot!.querySelectorAll('style')]
        .map((s) => s.textContent)
        .join('\n');
    expect(sheets).toContain('[data-k$="-bang"] { fill: none; }');
    const { renderIconHTML } = await import('../src/ssr');
    const { ClabsMotionIconSettings } = await import('../src/index');
    const html = renderIconHTML(ClabsMotionIconSettings, {
      status: 'warning',
      tone: true,
    });
    expect(html).toMatch(/data-k="status-bang" d="M[^"]+" fill="#000000"/);
    expect(html).toContain('[data-k$="-bang"] { fill: none; }');
    // Untoned (and the -warning aliases): the outline in currentColor, no "!".
    expect(
      renderIconHTML(ClabsMotionIconSettings, { status: 'warning' })
    ).toMatch(/data-k="status-bang" d="" fill="#000000"/);
  });
});
