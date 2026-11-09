/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The frames' disabled state is watched by one MutationObserver per document
 * (engine/env.ts `watchDisabled`), not one per icon: a SideNav of ~200 icons
 * kept ~200.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindHover, watchDisabled } from '../src/engine/env';

const tick = () => new Promise((r) => setTimeout(r, 40));

describe('watchDisabled', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('serves every frame with one observer, calls each frame once per batch, and stops on unwatch', async () => {
    const Real = window.MutationObserver;
    let made = 0;
    window.MutationObserver = class extends Real {
      constructor(cb: MutationCallback) {
        super(cb);
        made++;
      }
    };
    const frames = Array.from({ length: 50 }, () =>
      document.body.appendChild(document.createElement('button'))
    );
    const calls = frames.map(() => vi.fn());
    const unwatch = frames.map((f, i) => watchDisabled(f, calls[i]));
    // Two icons on one frame (a selection row's two faces): both hear it.
    const twin = vi.fn();
    const unTwin = watchDisabled(frames[0], twin);
    expect(made).toBeLessThanOrEqual(1);
    window.MutationObserver = Real;
    frames[0].setAttribute('disabled', '');
    frames[0].setAttribute('aria-disabled', 'true');
    frames[1].setAttribute('aria-disabled', 'true');
    frames[2].setAttribute('title', 'not watched');
    await tick();
    expect(calls[0]).toHaveBeenCalledTimes(1);
    expect(twin).toHaveBeenCalledTimes(1);
    expect(calls[1]).toHaveBeenCalledTimes(1);
    expect(calls[2]).not.toHaveBeenCalled();
    unwatch[0]();
    frames[0].removeAttribute('disabled');
    await tick();
    expect(calls[0]).toHaveBeenCalledTimes(1);
    expect(twin).toHaveBeenCalledTimes(2);
    unTwin();
    unwatch.forEach((u) => u());
    frames[1].removeAttribute('aria-disabled');
    await tick();
    expect(calls[1]).toHaveBeenCalledTimes(1);
  });

  it('still settles a hovered icon whose frame turns disabled', async () => {
    const frame = document.body.appendChild(document.createElement('button'));
    frame.setAttribute('data-motion-icon-frame', '');
    const icon = frame.appendChild(
      document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    );
    const enter = vi.fn();
    const leave = vi.fn();
    const unbind = bindHover(icon, { enter, leave });
    frame.dispatchEvent(new Event('mouseenter'));
    expect(enter).toHaveBeenCalledTimes(1);
    frame.setAttribute('disabled', '');
    await tick();
    expect(leave).toHaveBeenCalledTimes(1);
    unbind();
  });
});

describe('a binding made under the pointer', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });
  const hoveredFrame = (disabled = false) => {
    const frame = document.body.appendChild(document.createElement('button'));
    frame.setAttribute('data-motion-icon-frame', '');
    if (disabled) {
      frame.setAttribute('disabled', '');
    }
    const matches = frame.matches.bind(frame);
    frame.matches = (s: string) => s === ':hover' || matches(s);
    return {
      frame,
      icon: frame.appendChild(
        document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      ),
    };
  };

  it('starts hovered when its frame is already under a mouse (an icon mounted late), once, just after binding', async () => {
    const { frame, icon } = hoveredFrame();
    const enter = vi.fn();
    const leave = vi.fn();
    const unbind = bindHover(icon, { enter, leave });
    expect(enter).not.toHaveBeenCalled();
    await tick();
    expect(enter).toHaveBeenCalledTimes(1);
    frame.dispatchEvent(new Event('mouseleave'));
    expect(leave).toHaveBeenCalledTimes(1);
    unbind();
  });

  it("doesn't on a disabled frame, nor when unbound before it settles", async () => {
    const enter = vi.fn();
    const a = hoveredFrame(true);
    const ua = bindHover(a.icon, { enter, leave: vi.fn() });
    const b = hoveredFrame();
    bindHover(b.icon, { enter, leave: vi.fn() })();
    await tick();
    expect(enter).not.toHaveBeenCalled();
    ua();
  });
});
