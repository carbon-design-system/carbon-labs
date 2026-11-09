/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * What an element binds:
 *  - the press only where the icon may press (`press`, its own
 *    control, any frame: a frame may turn "press" later), following
 *    `press`; at rest it hears only what starts a press;
 *  - only icons with something to hold off screen (a loop, an action,
 *    a pending spinner) are observed; `<clabs-motion-icon name>` moved in the
 *    DOM keeps the icon it drew.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

type IconEl = HTMLElement & {
  updateComplete: Promise<unknown>;
  press?: boolean;
  icon?: HTMLElement;
};

// jsdom has no IntersectionObserver: a fake one records what is observed. (The core keeps the document's observer,
// so it is stubbed for the whole file.)
class FakeIO {
  static observed = new Set<Element>();
  observe(el: Element) {
    FakeIO.observed.add(el);
  }
  unobserve(el: Element) {
    FakeIO.observed.delete(el);
  }
  disconnect() {}
}
vi.stubGlobal('IntersectionObserver', FakeIO);

beforeAll(async () => {
  await import('../src/define-all');
  await import('../src/motion-icon');
});

const made: Element[] = [];
afterEach(() => {
  made.splice(0).forEach((e) => e.remove());
  vi.restoreAllMocks();
});

async function mount(html: string): Promise<HTMLElement> {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
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

/** The listeners on each element, as added and removed: each listener's type, sorted. */
function listeners() {
  const on = new Map<EventTarget, Map<string, number>>();
  const add = EventTarget.prototype.addEventListener;
  const remove = EventTarget.prototype.removeEventListener;
  const bump = (t: EventTarget, type: string, by: number) => {
    const m = on.get(t) ?? new Map<string, number>();
    on.set(t, m);
    m.set(type, (m.get(type) ?? 0) + by);
    if (!m.get(type)) {
      m.delete(type);
    }
  };
  vi.spyOn(EventTarget.prototype, 'addEventListener').mockImplementation(
    function (this: EventTarget, type, fn, o) {
      bump(this, type, 1);
      return add.call(this, type, fn, o);
    }
  );
  vi.spyOn(EventTarget.prototype, 'removeEventListener').mockImplementation(
    function (this: EventTarget, type, fn, o) {
      bump(this, type, -1);
      return remove.call(this, type, fn, o);
    }
  );
  return (el: EventTarget | null) =>
    [...(on.get(el!) ?? [])]
      .flatMap(([type, n]) => Array<string>(n).fill(type))
      .sort();
}

/** The press at rest: what starts one (hover listens for pointerdown too, so keydown is the press's own). */
const PRESS = ['keydown', 'pointerdown'];
/** What ends a press, heard only while one is held (its pointerleave too, but hover listens for that at rest). */
const ENDS = ['keyup', 'pointercancel', 'pointerup'];
const has = (types: string[], wanted: string[]) =>
  wanted.every((t) => types.includes(t));
const count = (types: string[], t: string) =>
  types.filter((x) => x === t).length;

describe('the press', () => {
  it('a hover icon in a frame binds the press’s start (the frame may turn "press"); in a plain button, nothing', async () => {
    const on = listeners();
    const root = await mount(
      '<button data-motion-icon-frame><clabs-motion-icon-edit></clabs-motion-icon-edit></button><button data-motion-icon-frame="press"><clabs-motion-icon-edit></clabs-motion-icon-edit></button><button><clabs-motion-icon-edit></clabs-motion-icon-edit></button>'
    );
    const [framed, pressing, plain] = [...root.querySelectorAll('button')];
    expect(has(on(framed), PRESS)).toBe(true);
    expect(has(on(pressing), PRESS)).toBe(true);
    expect(on(framed).filter((t) => ENDS.includes(t))).toEqual([]);
    const icon = plain.querySelector('clabs-motion-icon-edit')!;
    expect(count(on(icon), 'keydown')).toBe(0);
    expect(on(plain)).toEqual([]);
  });

  it('a held press hears its end, and lets go of it on release', async () => {
    const on = listeners();
    const root = await mount(
      '<button data-motion-icon-frame="press"><clabs-motion-icon-edit></clabs-motion-icon-edit></button>'
    );
    const button = root.querySelector('button')!;
    button.dispatchEvent(
      new MouseEvent('pointerdown', { bubbles: true, button: 0 })
    );
    expect(has(on(button), ENDS)).toBe(true);
    button.dispatchEvent(
      new MouseEvent('pointerup', { bubbles: true, button: 0 })
    );
    expect(on(button).filter((t) => ENDS.includes(t))).toEqual([]);
  });

  it('follows `press`, and its own control (`as-button`)', async () => {
    const on = listeners();
    const root = await mount(
      '<clabs-motion-icon-edit></clabs-motion-icon-edit><clabs-motion-icon-bookmark-toggle as-button aria-label="Bookmark"></clabs-motion-icon-bookmark-toggle>'
    );
    const [edit, toggle] = [...root.children] as IconEl[];
    expect(count(on(edit), 'keydown')).toBe(0);
    expect(has(on(toggle), PRESS)).toBe(true);
    // The toggle's own keydown (Space and Enter toggle it) and the press's.
    const toggleKeys = count(on(toggle), 'keydown');
    edit.setAttribute('press', '');
    await edit.updateComplete;
    expect(count(on(edit), 'keydown')).toBe(1);
    edit.setAttribute('press', 'none');
    await edit.updateComplete;
    expect(count(on(edit), 'keydown')).toBe(0);
    // Disconnected: nothing left on it.
    root.remove();
    expect(count(on(toggle), 'keydown')).toBe(toggleKeys - 1);
  });
});

describe('off screen', () => {
  it('observes only icons with something to hold: a loop, an action, a status', async () => {
    const root = await mount(
      '<clabs-motion-icon-edit></clabs-motion-icon-edit><clabs-motion-icon-bookmark-toggle></clabs-motion-icon-bookmark-toggle>' +
        '<clabs-motion-icon-renew></clabs-motion-icon-renew><clabs-motion-icon-settings status="pending"></clabs-motion-icon-settings><clabs-motion-icon-microphone-voice-mode-toggle></clabs-motion-icon-microphone-voice-mode-toggle>'
    );
    const seen = [...root.children].map((el) => FakeIO.observed.has(el));
    expect(seen).toEqual([false, false, true, true, true]);
    root.remove();
    expect([...root.children].some((el) => FakeIO.observed.has(el))).toBe(
      false
    );
  });

  it('`<clabs-motion-icon name>` moved keeps the icon it drew, and its attributes in step', async () => {
    const root = await mount(
      '<clabs-motion-icon name="edit" size="24"></clabs-motion-icon>'
    );
    const host = root.firstElementChild as IconEl;
    await vi.waitFor(() => expect(host.icon).toBeTruthy());
    const drawn = host.icon!;
    const other = document.createElement('div');
    document.body.append(other);
    made.push(other);
    host.remove();
    host.setAttribute('size', '16');
    other.append(host);
    await flush();
    expect(host.icon).toBe(drawn);
    expect(drawn.getAttribute('size')).toBe('16');
    // A new name still loads.
    host.setAttribute('name', 'add');
    await vi.waitFor(() => expect(host.icon).not.toBe(drawn));
  });
});
