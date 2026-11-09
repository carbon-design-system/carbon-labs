/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Skip (the core's engine/skip.ts; motion's skipAnimations through `/motion`,
 * or carbon-motion's level "none"): every animation jumps to its end.
 *  - a hover lands hovered on the next frame, and leaving lands at rest;
 *  - a toggle lands on its new state's drawing;
 *  - an action plays nothing (it is at its end, at rest) and its hand-off
 *    status applies at once;
 *  - a loop stays at rest, and one in flight stops there when skip turns on;
 *  - the pending spinner holds;
 *  - turning skip on mid-hover lands the hover at once.
 * Each against the same element's own end without skip.
 */
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  addSkipSource,
  manualScheduler,
  setScheduler,
} from '@carbon-labs/motion-icons-core/engine';

type IconEl = HTMLElement & {
  updateComplete: Promise<unknown>;
  trigger(o?: object): Promise<void>;
  toggled?: boolean;
  status?: string;
};

beforeAll(async () => {
  await import('../src/define-all');
});

let skip = false;
let tell: (() => void) | undefined;
const setSkip = (on: boolean) => {
  skip = on;
  tell?.();
};
// Each test its own source (the order is shuffled; one test removes it).
let removeSource = () => {};
beforeEach(() => {
  removeSource = addSkipSource({
    get: () => skip,
    subscribe: (cb) => ((tell = cb), () => (tell = undefined)),
  });
});

const made: Element[] = [];
let clock = manualScheduler();
afterEach(() => {
  made.splice(0).forEach((e) => e.remove());
  setSkip(false);
  removeSource();
  setScheduler(null);
});

async function mount(html: string): Promise<HTMLElement> {
  clock = manualScheduler();
  setScheduler(clock);
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
  for (let i = 0; i < 6; i++) {
    await Promise.resolve();
  }
};
/** What the icon draws: each shape's geometry and paint, by key (attribute order aside). */
const drawing = (el: Element) =>
  [...el.shadowRoot!.querySelectorAll('svg [data-k]')]
    .map(
      (p) =>
        `${p.getAttribute('data-k')} ${p.getAttribute('d')} ${p.getAttribute('fill')} ${p.getAttribute('transform')} ${p.getAttribute('opacity')}`
    )
    .join('\n');
async function frames(ms: number, el: Element): Promise<string[]> {
  const seen: string[] = [];
  for (let t = 0; t < ms; t += 1000 / 60) {
    clock.advance(1000 / 60);
    await flush();
    seen.push(drawing(el));
  }
  return seen;
}

describe('skip: every animation jumps to its end', () => {
  it('a hover lands hovered on the next frame, and leaving lands at rest', async () => {
    const root = await mount(
      '<button data-motion-icon-frame><clabs-motion-icon-settings></clabs-motion-icon-settings></button>'
    );
    const frame = root.firstElementChild!;
    const el = frame.firstElementChild!;
    const rest = drawing(el);
    frame.dispatchEvent(new MouseEvent('mouseenter'));
    const hovered = (await frames(600, el)).at(-1)!;
    frame.dispatchEvent(new MouseEvent('mouseleave'));
    await frames(600, el);
    expect(hovered).not.toBe(rest);

    setSkip(true);
    frame.dispatchEvent(new MouseEvent('mouseenter'));
    const inn = await frames(200, el);
    expect(inn[0], 'hovered on the first frame').toBe(hovered);
    expect(new Set(inn).size).toBe(1);
    frame.dispatchEvent(new MouseEvent('mouseleave'));
    const out = await frames(200, el);
    expect(out[0], 'at rest on the first frame').toBe(rest);
    expect(new Set(out).size).toBe(1);
  });

  it('turning skip on mid-hover lands the hover at once', async () => {
    const root = await mount(
      '<button data-motion-icon-frame><clabs-motion-icon-settings></clabs-motion-icon-settings></button>'
    );
    const frame = root.firstElementChild!;
    const el = frame.firstElementChild!;
    frame.dispatchEvent(new MouseEvent('mouseenter'));
    const end = (await frames(600, el)).at(-1)!;
    frame.dispatchEvent(new MouseEvent('mouseleave'));
    await frames(600, el);
    frame.dispatchEvent(new MouseEvent('mouseenter'));
    const part = await frames(50, el);
    expect(part.at(-1)).not.toBe(end);
    setSkip(true);
    await flush();
    expect(drawing(el)).toBe(end);
  });

  it('a toggle lands on its new state at once', async () => {
    const root = await mount(
      '<clabs-motion-icon-bookmark-toggle></clabs-motion-icon-bookmark-toggle><clabs-motion-icon-bookmark-toggle toggled></clabs-motion-icon-bookmark-toggle>'
    );
    const [el, ref] = [...root.children] as IconEl[];
    const onDrawing = drawing(ref);
    setSkip(true);
    el.toggled = true;
    await el.updateComplete;
    const seen = await frames(300, el);
    expect(seen[0]).toBe(onDrawing);
    expect(new Set(seen).size).toBe(1);
  });

  it('an action plays nothing and its hand-off status applies at once', async () => {
    const root = await mount(
      '<clabs-motion-icon-copy></clabs-motion-icon-copy><clabs-motion-icon-copy></clabs-motion-icon-copy>'
    );
    const [ref, el] = [...root.children] as IconEl[];
    // Without skip: the action, then the status, as it ends.
    const refPlayed = ref.trigger({ then: { status: 'success' } });
    const moving = await frames(1500, ref);
    await refPlayed;
    expect(new Set(moving).size).toBeGreaterThan(10);
    setSkip(true);
    const played = el.trigger({ then: { status: 'success' } });
    await flush();
    const seen = await frames(400, el);
    await played;
    expect(seen[0], 'the status shows on the first frame').toBe(moving.at(-1));
    expect(new Set(seen).size, 'and nothing moves').toBe(1);
  });

  it('a loop stays at rest, and one in flight stops there when skip turns on', async () => {
    const root = await mount(
      '<clabs-motion-icon-trash-can></clabs-motion-icon-trash-can>'
    );
    const el = root.firstElementChild as IconEl;
    const rest = drawing(el);
    setSkip(true);
    el.setAttribute('loop', '');
    await el.updateComplete;
    expect(new Set([rest, ...(await frames(600, el))])).toEqual(
      new Set([rest])
    );
    el.removeAttribute('loop');
    await el.updateComplete;
    setSkip(false);
    el.setAttribute('loop', '');
    await el.updateComplete;
    expect(
      new Set(await frames(600, el)).size,
      'looping without skip'
    ).toBeGreaterThan(3);
    setSkip(true);
    await flush();
    const after = await frames(300, el);
    expect(new Set(after)).toEqual(new Set([rest]));
  });

  it('the pending spinner holds while skipping, and turns again after', async () => {
    const root = await mount(
      '<clabs-motion-icon-settings status="pending"></clabs-motion-icon-settings>'
    );
    const el = root.firstElementChild as IconEl;
    expect(new Set(await frames(300, el)).size, 'turning').toBeGreaterThan(3);
    setSkip(true);
    await flush();
    expect(new Set(await frames(300, el)).size, 'held').toBe(1);
    setSkip(false);
    await flush();
    expect(
      new Set(await frames(300, el)).size,
      'turning again'
    ).toBeGreaterThan(3);
  });
});

it('removing the source ends skip', async () => {
  const root = await mount(
    '<button data-motion-icon-frame><clabs-motion-icon-settings></clabs-motion-icon-settings></button>'
  );
  const frame = root.firstElementChild!;
  setSkip(true);
  removeSource();
  frame.dispatchEvent(new MouseEvent('mouseenter'));
  expect(
    new Set(await frames(300, frame.firstElementChild!)).size
  ).toBeGreaterThan(3);
});
