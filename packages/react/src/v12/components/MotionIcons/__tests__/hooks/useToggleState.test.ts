/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useToggleState } from '../../hooks/useToggleState';

const STATES = ['default', 'active', 'complete'] as const;
type States = (typeof STATES)[number];

describe('useToggleState — uncontrolled', () => {
  it('starts at the first state when no initial given', () => {
    const { result } = renderHook(() => useToggleState({ states: STATES }));
    expect(result.current.currentState).toBe('default');
  });

  it('starts at initial when provided', () => {
    const { result } = renderHook(() =>
      useToggleState({ states: STATES, initial: 'active' })
    );
    expect(result.current.currentState).toBe('active');
  });

  it('transition() with no arg cycles to next state', () => {
    const { result } = renderHook(() => useToggleState({ states: STATES }));

    act(() => result.current.transition());
    expect(result.current.currentState).toBe('active');

    act(() => result.current.transition());
    expect(result.current.currentState).toBe('complete');

    // Wraps around
    act(() => result.current.transition());
    expect(result.current.currentState).toBe('default');
  });

  it('transition("active") jumps directly to named state', () => {
    const { result } = renderHook(() => useToggleState({ states: STATES }));

    act(() => result.current.transition('active'));
    expect(result.current.currentState).toBe('active');
  });
});

describe('useToggleState — controlled', () => {
  it('onChange fires with next state; currentState follows value prop', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }: { value: States }) =>
        useToggleState({ states: STATES, value, onChange }),
      { initialProps: { value: 'default' as States } }
    );

    expect(result.current.currentState).toBe('default');

    act(() => result.current.transition());
    expect(onChange).toHaveBeenCalledWith('active');

    // Simulate parent updating value prop
    rerender({ value: 'active' });
    expect(result.current.currentState).toBe('active');
  });

  it('transition("complete") fires onChange with "complete"', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useToggleState({ states: STATES, value: 'default', onChange })
    );

    act(() => result.current.transition('complete'));
    expect(onChange).toHaveBeenCalledWith('complete');
  });
});
