/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @vitest-environment jsdom

import React from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ChatActions } from '../components/ChatMessage';
import { FileChips } from '../components/FileChips';

type Frames = Keyframe[] | PropertyIndexedKeyframes | null;

/** Every keyframe set the parts played, in order. */
const played: Frames[] = [];

// jsdom has no layout, no Web Animations, no fonts and no CSS namespace:
// stand-ins.
beforeAll(() => {
  const done = {
    finished: Promise.resolve(),
    ready: Promise.resolve(),
    cancel() {},
    finish() {},
    play() {},
    pause() {},
    commitStyles() {},
    addEventListener() {},
    removeEventListener() {},
  };
  Element.prototype.getAnimations = () => [];
  Element.prototype.animate = (frames: Frames) => {
    played.push(frames);
    return done as unknown as Animation;
  };
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { ready: Promise.resolve(), load: () => Promise.resolve([]) },
  });
  vi.stubGlobal('CSS', {
    escape: (s: string) => s.replace(/[^\w-]/g, (c) => `\\${c}`),
    supports: () => false,
  });
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});
afterEach(() => {
  cleanup();
  played.length = 0;
});

const FILES = [
  { id: 'a', name: 'alpha.pdf' },
  { id: 'b', name: 'beta.pdf' },
  { id: 'c', name: 'gamma.pdf' },
];

/** A reply's actions in a page running `dir`: its buttons, in DOM order. */
function actions(dir: 'ltr' | 'rtl') {
  const { container } = render(
    <div dir={dir}>
      <ChatActions text="Hello" onRetry={() => {}} onRate={() => {}} />
    </div>
  );
  return [...container.querySelectorAll<HTMLElement>('.cds-icon-btn')];
}

/** The attachments in a page running `dir`: the chips' closes, in DOM order. */
function chips(dir: 'ltr' | 'rtl') {
  const { container } = render(
    <div dir={dir}>
      <FileChips files={FILES} />
    </div>
  );
  return [
    ...container.querySelectorAll<HTMLElement>(
      '[data-file-id]:not([inert], [inert] *) button'
    ),
  ];
}

const press = (el: HTMLElement | undefined, key: string) => {
  if (!el) {
    throw new Error('no such item');
  }
  act(() => el.focus());
  fireEvent.keyDown(el, { key });
};

describe.each([
  ['the reply’s actions', actions],
  ['the file chips', chips],
])('%s, the arrows by direction', (_name, row) => {
  it('→ is the next and ← the previous, left to right', () => {
    const els = row('ltr');
    expect(els.length).toBeGreaterThan(2);
    press(els[0], 'ArrowRight');
    expect(document.activeElement).toBe(els[1]);
    press(els[1], 'ArrowLeft');
    expect(document.activeElement).toBe(els[0]);
  });

  it('← is the next and → the previous, right to left', () => {
    const els = row('rtl');
    press(els[0], 'ArrowLeft');
    expect(document.activeElement).toBe(els[1]);
    press(els[1], 'ArrowLeft');
    expect(document.activeElement).toBe(els[2]);
    press(els[2], 'ArrowRight');
    expect(document.activeElement).toBe(els[1]);
  });

  it('stops at the ends, and Home and End keep their ends, right to left', () => {
    const els = row('rtl');
    press(els[0], 'ArrowRight');
    expect(document.activeElement).toBe(els[0]);
    press(els[0], 'End');
    expect(document.activeElement).toBe(els.at(-1));
    press(els.at(-1), 'ArrowLeft');
    expect(document.activeElement).toBe(els.at(-1));
    press(els.at(-1), 'Home');
    expect(document.activeElement).toBe(els[0]);
  });
});

describe('a file chip’s arrival', () => {
  /** The travel (px) a chip added to a row running `dir` starts from. */
  async function arrivalFrom(dir: 'ltr' | 'rtl') {
    const { rerender } = render(
      <div dir={dir}>
        <FileChips files={FILES.slice(0, 1)} />
      </div>
    );
    played.length = 0;
    rerender(
      <div dir={dir}>
        <FileChips files={FILES.slice(0, 2)} />
      </div>
    );
    // The row sees the new chip from its observer.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    const moves = played.flatMap((frames) =>
      Array.isArray(frames) ? frames.map((f) => String(f.transform ?? '')) : []
    );
    const from = moves.find((t) => t.startsWith('translateX(')) ?? '';
    return parseFloat(from.slice('translateX('.length));
  }

  it('comes from the left, left to right', async () => {
    expect(await arrivalFrom('ltr')).toBeLessThan(0);
  });

  it('comes from the right, right to left', async () => {
    expect(await arrivalFrom('rtl')).toBeGreaterThan(0);
  });
});
