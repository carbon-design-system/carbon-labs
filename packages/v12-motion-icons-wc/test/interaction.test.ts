/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The elements' hover sources, through the core's
 * bindHover: `el.play()`, keyboard focus on the frame or an `as-button`
 * host, and how they combine with the pointer. The drawing is read from the
 * shadow root, frame by frame, on the core's manual clock.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  manualScheduler,
  setScheduler,
} from '@carbon-labs/motion-icons-core/engine';
import ELEMENTS from '../src/elements.json';

type IconEl = HTMLElement & {
  play(): void;
  updateComplete: Promise<unknown>;
  animated?: boolean;
};

beforeAll(async () => {
  await import('../src/define-all');
});

let clock: ReturnType<typeof manualScheduler>;
const made: Element[] = [];
afterEach(() => {
  made.splice(0).forEach((e) => e.remove());
  setScheduler(null);
  vi.restoreAllMocks();
});

async function mount(
  html: string
): Promise<{ root: HTMLElement; icon: IconEl }> {
  clock = manualScheduler();
  setScheduler(clock);
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  made.push(root);
  const icon = root.querySelector<IconEl>('[data-icon]')!;
  await icon.updateComplete;
  return { root, icon };
}

/** What the icon draws (frames, or its still with animated="false"). */
const drawing = (icon: IconEl) =>
  icon.shadowRoot!.querySelector('svg')!.innerHTML;

/** Advance frame by frame (completions run between frames), recording each drawing. */
async function run(icon: IconEl, ms: number): Promise<string[]> {
  const seen: string[] = [];
  for (let t = 0; t < ms; t += 1000 / 60) {
    clock.advance(1000 / 60);
    await Promise.resolve();
    await Promise.resolve();
    seen.push(drawing(icon));
  }
  return seen;
}

describe('el.play()', () => {
  it('plays a hover-only icon once, in then out, and rests', async () => {
    const { icon } = await mount(
      '<clabs-motion-icon-settings data-icon size="32"></clabs-motion-icon-settings>'
    );
    const rest = drawing(icon);
    icon.play();
    const seen = await run(icon, 800);
    expect(new Set(seen).size, 'it moved').toBeGreaterThan(3);
    expect(seen.at(-1), 'back at rest').toBe(rest);
  });

  it('is a no-op with animated="false" (reduced motion: test/reduced-motion.test.ts)', async () => {
    const { icon } = await mount(
      '<clabs-motion-icon-settings data-icon size="32" animated="false"></clabs-motion-icon-settings>'
    );
    const rest = drawing(icon);
    icon.play();
    expect(new Set(await run(icon, 400))).toEqual(new Set([rest]));
  });

  it('mid-hover it does not restart; the icon leaves when the pointer does', async () => {
    const { root, icon } = await mount(
      '<button data-motion-icon-frame><clabs-motion-icon-bookmark-toggle data-icon size="32"></clabs-motion-icon-bookmark-toggle></button>'
    );
    const frame = root.querySelector('button')!;
    const rest = drawing(icon);
    frame.dispatchEvent(new MouseEvent('mouseenter'));
    const hovered = (await run(icon, 400)).at(-1)!;
    expect(hovered).not.toBe(rest);
    icon.play();
    expect(
      new Set(await run(icon, 600)),
      'still hovered, nothing restarted'
    ).toEqual(new Set([hovered]));
    frame.dispatchEvent(new MouseEvent('mouseleave'));
    expect((await run(icon, 600)).at(-1)).toBe(rest);
  });

  it('before it is connected, it does nothing', () => {
    const icon = document.createElement('clabs-motion-icon-settings') as IconEl;
    expect(() => icon.play()).not.toThrow();
  });
});

describe('a disabled button frame', () => {
  for (const [what, html] of [
    [
      'a disabled <button>',
      '<button disabled data-motion-icon-frame><clabs-motion-icon-settings data-icon></clabs-motion-icon-settings></button>',
    ],
    [
      'aria-disabled="true"',
      '<button aria-disabled="true" data-motion-icon-frame><clabs-motion-icon-settings data-icon></clabs-motion-icon-settings></button>',
    ],
    [
      "Carbon's disabled attribute (a custom-element button)",
      '<x-icon-button disabled data-motion-icon-frame><clabs-motion-icon-bookmark-toggle data-icon></clabs-motion-icon-bookmark-toggle></x-icon-button>',
    ],
  ] as const) {
    it(`${what}: pointer hover, keyboard focus and play() draw nothing new`, async () => {
      const { root, icon } = await mount(html);
      const frame = root.querySelector(
        '[data-motion-icon-frame]'
      ) as HTMLElement;
      frame.tabIndex = 0;
      const rest = drawing(icon);
      frame.dispatchEvent(new MouseEvent('mouseenter'));
      frame.focus();
      icon.play();
      expect(new Set(await run(icon, 500))).toEqual(new Set([rest]));
    });
  }

  it('enabled again (pointer still over it), the hover plays', async () => {
    const { root, icon } = await mount(
      '<x-icon-button disabled data-motion-icon-frame><clabs-motion-icon-settings data-icon></clabs-motion-icon-settings></x-icon-button>'
    );
    const frame = root.querySelector('x-icon-button')!;
    const rest = drawing(icon);
    frame.dispatchEvent(new MouseEvent('mouseenter'));
    const matches = Element.prototype.matches;
    vi.spyOn(Element.prototype, 'matches').mockImplementation(function (
      this: Element,
      s: string
    ) {
      return s === ':hover' ? this === frame : matches.call(this, s);
    });
    frame.removeAttribute('disabled');
    expect((await run(icon, 400)).at(-1)).not.toBe(rest);
  });
});

describe('keyboard focus', () => {
  it('focus on the frame plays the hover; blur plays it back', async () => {
    const { root, icon } = await mount(
      '<button data-motion-icon-frame><clabs-motion-icon-settings data-icon size="20"></clabs-motion-icon-settings> Settings</button>'
    );
    const frame = root.querySelector('button')!;
    const rest = drawing(icon);
    frame.focus();
    expect((await run(icon, 400)).at(-1)).not.toBe(rest);
    frame.blur();
    expect((await run(icon, 600)).at(-1)).toBe(rest);
  });

  it('an as-button host is its own frame: keyboard focus plays it', async () => {
    const { icon } = await mount(
      '<clabs-motion-icon-bookmark-toggle data-icon as-button aria-label="Bookmark"></clabs-motion-icon-bookmark-toggle>'
    );
    const rest = drawing(icon);
    icon.focus();
    expect(document.activeElement).toBe(icon);
    expect((await run(icon, 400)).at(-1)).not.toBe(rest);
    icon.blur();
    expect((await run(icon, 600)).at(-1)).toBe(rest);
  });

  it('pointer and focus together: one hover, out only when both have ended', async () => {
    const { root, icon } = await mount(
      '<button data-motion-icon-frame><clabs-motion-icon-settings data-icon></clabs-motion-icon-settings></button>'
    );
    const frame = root.querySelector('button')!;
    const rest = drawing(icon);
    frame.dispatchEvent(new MouseEvent('mouseenter'));
    const hovered = (await run(icon, 400)).at(-1)!;
    frame.focus();
    frame.dispatchEvent(new MouseEvent('mouseleave'));
    expect(new Set(await run(icon, 400)), 'focus holds it').toEqual(
      new Set([hovered])
    );
    frame.blur();
    expect((await run(icon, 600)).at(-1)).toBe(rest);
  });
});

/**
 * Chrome makes an svg focusable once it has a focus listener (a click then
 * focuses it and draws the UA's `:focus` outline). The elements bind to the
 * host, so their shadow svg never gets one; this pins that down for every
 * element, bare and as a button.
 */
describe('no focus listener on an svg', () => {
  const FOCUS = ['focus', 'blur', 'focusin', 'focusout'];

  it('every element, bare and with as-button', async () => {
    const add = EventTarget.prototype.addEventListener;
    const added: string[] = [];
    vi.spyOn(EventTarget.prototype, 'addEventListener').mockImplementation(
      function (this: EventTarget, type: string, ...rest) {
        if (this instanceof SVGElement && FOCUS.includes(type)) {
          added.push(
            `${(this.getRootNode() as ShadowRoot).host?.localName} ${type}`
          );
        }
        return add.call(this, type, ...(rest as [EventListener]));
      }
    );
    expect(ELEMENTS.length, 'the whole package').toBeGreaterThan(50);
    const html = ELEMENTS.map(
      ({ tag }) =>
        `<${tag} data-icon></${tag}><${tag} as-button aria-label="x"></${tag}>`
    ).join('');
    const { root } = await mount(html);
    const icons = [...root.querySelectorAll<IconEl>('*')];
    await Promise.all(icons.map((i) => i.updateComplete));
    expect(
      icons
        .filter((i) => !i.shadowRoot?.querySelector('svg'))
        .map((i) => i.localName)
    ).toEqual([]);
    expect(added).toEqual([]);
  });
});
