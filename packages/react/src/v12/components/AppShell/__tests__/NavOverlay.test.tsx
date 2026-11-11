/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { NavOverlay } from '../components/NavOverlay';

// jsdom has no layout, no Web Animations and no fonts: stand-ins that finish.
beforeAll(() => {
  const done = {
    finished: Promise.resolve(),
    ready: Promise.resolve(),
    cancel() {},
    finish() {},
    play() {},
    pause() {},
    reverse() {},
    commitStyles() {},
    addEventListener() {},
    removeEventListener() {},
  };
  Element.prototype.getAnimations = () => [];
  Element.prototype.animate = () => done as unknown as Animation;
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { ready: Promise.resolve(), load: () => Promise.resolve([]) },
  });
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
});

function Shell({ onRequestClose }: { onRequestClose: () => void }) {
  const menu = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={menu} type="button">
        Menu
      </button>
      <NavOverlay
        open
        onRequestClose={onRequestClose}
        launcherButtonRef={menu}
        menuButtonRef={menu}>
        <a href="#home">Home</a>
        <a href="#reports">Reports</a>
      </NavOverlay>
    </>
  );
}

describe('NavOverlay', () => {
  it('asks to close on Escape, from inside the nav or from its menu button', async () => {
    const onRequestClose = jest.fn();
    render(<Shell onRequestClose={onRequestClose} />);
    await act(async () => {});
    act(() => screen.getByText('Reports').focus());
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(onRequestClose).toHaveBeenCalledTimes(1);
    act(() => screen.getByText('Menu').focus());
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(onRequestClose).toHaveBeenCalledTimes(2);
  });

  it('leaves an Escape that cancels a composition alone', async () => {
    const onRequestClose = jest.fn();
    render(<Shell onRequestClose={onRequestClose} />);
    await act(async () => {});
    act(() => screen.getByText('Home').focus());
    fireEvent.keyDown(document.activeElement!, {
      key: 'Escape',
      isComposing: true,
    });
    expect(onRequestClose).not.toHaveBeenCalled();
  });
});
