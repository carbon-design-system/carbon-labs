/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { render, screen, renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { MotionIconProvider } from '../context/MotionIconProvider';
import { useMotionContext } from '../hooks/useMotionContext';

function mockMatchMedia(matches: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
}

function ContextReader(): React.ReactElement {
  const { animated } = useMotionContext();
  return <div data-testid="animated">{String(animated)}</div>;
}

describe('useReducedMotion', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true when matchMedia reports reduced motion', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('returns false when matchMedia reports no reduced motion', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });
});

describe('MotionIconProvider + reduced motion', () => {
  beforeEach(() => {
    mockMatchMedia(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sets animated to false when reduced motion is active and no explicit prop', () => {
    render(
      <MotionIconProvider>
        <ContextReader />
      </MotionIconProvider>
    );
    expect(screen.getByTestId('animated').textContent).toBe('false');
  });

  it('keeps animated=true when explicit animated={true} overrides reduced motion', () => {
    render(
      <MotionIconProvider animated={true}>
        <ContextReader />
      </MotionIconProvider>
    );
    expect(screen.getByTestId('animated').textContent).toBe('true');
  });
});

describe('useMotionContext outside a provider + reduced motion', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves animated=false under reduced motion with no provider', () => {
    mockMatchMedia(true);
    render(<ContextReader />);
    expect(screen.getByTestId('animated').textContent).toBe('false');
  });

  it('resolves animated=true with no provider and no reduced motion', () => {
    mockMatchMedia(false);
    render(<ContextReader />);
    expect(screen.getByTestId('animated').textContent).toBe('true');
  });

  it('does not subscribe to media query changes per consumer', () => {
    // Shared across every matchMedia() call so we can count subscriptions.
    const addEventListener = vi.fn();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener,
        removeEventListener: vi.fn(),
      })),
    });

    render(
      <>
        <ContextReader />
        <ContextReader />
        <ContextReader />
      </>
    );
    // One shared subscription for every consumer, not one each.
    expect(addEventListener).toHaveBeenCalledTimes(1);
  });

  it('re-renders bare icons when the OS setting changes', () => {
    let matches = false;
    let onChange: (() => void) | undefined;
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        get matches() {
          return matches;
        },
        media: query,
        addEventListener: (_: string, cb: () => void) => {
          onChange = cb;
        },
        removeEventListener: vi.fn(),
      })),
    });

    render(<ContextReader />);
    expect(screen.getByTestId('animated').textContent).toBe('true');

    matches = true;
    act(() => onChange?.());
    expect(screen.getByTestId('animated').textContent).toBe('false');
  });
});

describe('SSR hydration under reduced motion', () => {
  it('hydrates without a mismatch when the client prefers reduced motion', async () => {
    const { renderToString } = await import('react-dom/server');
    const { hydrateRoot } = await import('react-dom/client');
    const { Search } = await import('../icons/operations');
    // A real server has no matchMedia: it can only render the animated markup.
    mockMatchMedia(false);
    const html = renderToString(<Search size={32} aria-label="Search" />);
    mockMatchMedia(true);
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    const onRecoverableError = vi.fn();
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, <Search size={32} aria-label="Search" />, {
        onRecoverableError,
      });
    });
    expect(onRecoverableError).not.toHaveBeenCalled();
    // Unmounted, so its reduced-motion subscription goes with it (the suites run in any order).
    act(() => root?.unmount());
    container.remove();
  });
});
