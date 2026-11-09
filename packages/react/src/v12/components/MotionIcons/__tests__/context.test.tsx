/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MotionIconProvider } from '../context/MotionIconProvider';
import { useMotionContext } from '../hooks/useMotionContext';

// Helper component to expose context value
function ContextReader(): React.ReactElement {
  const { animated } = useMotionContext();
  return <div data-testid="animated">{String(animated)}</div>;
}

describe('MotionIconProvider', () => {
  beforeEach(() => {
    // Default: no reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children', () => {
    render(
      <MotionIconProvider>
        <span data-testid="child">hello</span>
      </MotionIconProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('defaults animated to true when no prop given and no reduced motion', () => {
    render(
      <MotionIconProvider>
        <ContextReader />
      </MotionIconProvider>
    );
    expect(screen.getByTestId('animated').textContent).toBe('true');
  });

  it('sets animated to false when animated={false} prop is given', () => {
    render(
      <MotionIconProvider animated={false}>
        <ContextReader />
      </MotionIconProvider>
    );
    expect(screen.getByTestId('animated').textContent).toBe('false');
  });
});

describe('useMotionContext outside provider', () => {
  beforeEach(() => {
    // No reduced motion — outside a provider the hook reads matchMedia directly.
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns { animated: true } when outside provider', () => {
    render(<ContextReader />);
    expect(screen.getByTestId('animated').textContent).toBe('true');
  });
});
