/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * MicrophoneListeningToggle: the element and the React component on one fake
 * clock, frame by frame through a click on (the microphone leaving, the dots
 * opening into pills), the loop following a level, and a click off. Then the
 * element's `level`: the attribute, and a function read each frame.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type React from 'react';

type WC = HTMLElement & { updateComplete: Promise<unknown> };
const FRAME = 1000 / 60;
const TAG = 'clabs-motion-icon-microphone-listening-toggle';
let R: {
  render: typeof import('@testing-library/react').render;
  act: typeof import('react').act;
  fireEvent: typeof import('@testing-library/react').fireEvent;
  createElement: typeof import('react').createElement;
  Toggle: React.FC<Record<string, unknown>>;
  Provider: React.FC<{ animated?: boolean; children: React.ReactNode }>;
};

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
  const mod =
    await import('../../react/src/v12/components/MotionIcons/icons/toggle/micListening');
  const provider =
    await import('../../react/src/v12/components/MotionIcons/context/MotionIconProvider');
  await import('../src/define-all');
  R = {
    render: tl.render,
    act: react.act,
    fireEvent: tl.fireEvent,
    createElement: react.createElement,
    Toggle: mod.MicrophoneListeningToggle as never,
    Provider: provider.MotionIconProvider as never,
  };
});
afterAll(() => vi.useRealTimers());

const painted = (root: ParentNode | null | undefined) =>
  [...(root?.querySelectorAll('[data-k]') ?? [])]
    .map((el) => `${el.getAttribute('data-k')}:${el.getAttribute('d') ?? ''}`)
    .join('|');
/** Path data equal number for number within 0.01. */
const NUM = /[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g;
function same(a: string, b: string) {
  if (a === b) return true;
  const [na, nb] = [a.match(NUM) ?? [], b.match(NUM) ?? []];
  return (
    a.replace(NUM, '#') === b.replace(NUM, '#') &&
    na.length === nb.length &&
    na.every((x, i) => Math.abs(Number(x) - Number(nb[i])) <= 0.01)
  );
}

async function mount(value: string, size: number, level?: number) {
  const r = R.render(
    R.createElement(R.Provider, {
      animated: true,
      children: R.createElement(R.Toggle, { size, initial: value, level }),
    })
  );
  const el = document.createElement(TAG) as WC;
  el.setAttribute('size', String(size));
  el.setAttribute('value', value);
  if (level !== undefined) el.setAttribute('level', String(level));
  document.body.append(el);
  await el.updateComplete;
  return {
    r,
    el,
    react: () => painted(r.container),
    wc: () => painted(el.shadowRoot),
  };
}
async function frames(
  m: Awaited<ReturnType<typeof mount>>,
  ms: number,
  what: string
) {
  const seen = new Set<string>();
  for (let t = 0; t <= ms; t += FRAME) {
    const [w, r] = [m.wc(), m.react()];
    expect(w.length, `${what}: nothing painted`).toBeGreaterThan(0);
    if (!same(w, r))
      throw new Error(
        `${what} t=${t.toFixed(0)}:\n  wc    ${w.slice(0, 300)}\n  react ${r.slice(0, 300)}`
      );
    seen.add(w);
    R.act(() => vi.advanceTimersByTime(FRAME));
    await Promise.resolve();
  }
  return seen.size;
}

describe('MicrophoneListeningToggle', () => {
  it('the same frames as React: click on, the change, the loop at a level, click off', async () => {
    for (const size of [16, 32]) {
      const m = await mount('off', size, 0.7);
      R.act(() => R.fireEvent.click(m.r.container.querySelector('svg')!));
      m.el.click();
      await m.el.updateComplete;
      expect(await frames(m, 400 + 1200 * 1.5, `on @${size}`)).toBeGreaterThan(
        40
      );
      R.act(() => R.fireEvent.click(m.r.container.querySelector('svg')!));
      m.el.click();
      await m.el.updateComplete;
      await frames(m, 400, `off @${size}`);
      m.r.unmount();
      m.el.remove();
    }
  });

  it('follows `level`: the attribute, and a function read each frame', async () => {
    const m = await mount('listening', 32, 0);
    m.r.unmount();
    const step = async (n: number) => {
      for (let i = 0; i < n; i++) {
        R.act(() => vi.advanceTimersByTime(FRAME));
        await Promise.resolve();
      }
      return painted(m.el.shadowRoot);
    };
    // In silence, once the loop has eased in, it holds still.
    const quiet = await step(60);
    expect(await step(10)).toBe(quiet);
    m.el.setAttribute('level', '1');
    await m.el.updateComplete;
    const loud = await step(30);
    expect(loud).not.toBe(quiet);
    let level = 0;
    (m.el as unknown as { level: () => number }).level = () => level;
    await m.el.updateComplete;
    const fallen = await step(60);
    expect(fallen).not.toBe(loud);
    level = 1;
    expect(await step(30)).not.toBe(fallen);
    m.el.remove();
  });
});
