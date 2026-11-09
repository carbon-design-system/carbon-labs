/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useToggleAnimation } from '../../hooks/useToggleAnimation';

const STATES = ['off', 'on'] as const;
type States = (typeof STATES)[number];

describe('useToggleAnimation — uncontrolled', () => {
  it('starts at the first state when no initial given', () => {
    const { result } = renderHook(() => useToggleAnimation({ states: STATES }));
    expect(result.current.currentState).toBe('off');
  });

  it('starts at initial when provided', () => {
    const { result } = renderHook(() =>
      useToggleAnimation({ states: STATES, initial: 'on' })
    );
    expect(result.current.currentState).toBe('on');
  });

  it('transition() cycles currentState through the states array', () => {
    const { result } = renderHook(() => useToggleAnimation({ states: STATES }));

    act(() => result.current.transition());
    expect(result.current.currentState).toBe('on');

    // Wraps back around
    act(() => result.current.transition());
    expect(result.current.currentState).toBe('off');
  });
});

describe('useToggleAnimation — controlled', () => {
  it('currentState follows the value prop; onChange is called with next state', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }: { value: States }) =>
        useToggleAnimation({ states: STATES, value, onChange }),
      { initialProps: { value: 'off' as States } }
    );

    expect(result.current.currentState).toBe('off');

    act(() => result.current.transition());
    expect(onChange).toHaveBeenCalledWith('on');

    // Internal state does not change — parent must update value prop
    expect(result.current.currentState).toBe('off');

    // Simulate parent updating value prop
    rerender({ value: 'on' });
    expect(result.current.currentState).toBe('on');
  });

  it('internal state does not change without parent re-render', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useToggleAnimation({ states: STATES, value: 'off', onChange })
    );

    act(() => result.current.transition());
    expect(onChange).toHaveBeenCalledWith('on');
    // Still 'off' because parent never updated value
    expect(result.current.currentState).toBe('off');
  });
});

describe('useToggleAnimation — disabled hover', () => {
  it('onEnter and onLeave are never called when disabled=true, even if svgRef element fires mouseenter/mouseleave', () => {
    const onEnter = vi.fn();
    const onLeave = vi.fn();

    const { result } = renderHook(() =>
      useToggleAnimation({ states: STATES, onEnter, onLeave, disabled: true })
    );

    // Manually dispatch mouse events on the svgRef element
    const el = result.current.svgRef.current;
    if (el) {
      el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    }

    expect(onEnter).not.toHaveBeenCalled();
    expect(onLeave).not.toHaveBeenCalled();
  });
});

describe('useToggleAnimation — onStateChange', () => {
  it('does not fire on mount', () => {
    const onStateChange = vi.fn();
    renderHook(() =>
      useToggleAnimation({ states: STATES, initial: 'on', onStateChange })
    );
    expect(onStateChange).not.toHaveBeenCalled();
  });

  it('fires with (prev, next) after an uncontrolled transition', () => {
    const onStateChange = vi.fn();
    const { result } = renderHook(() =>
      useToggleAnimation({ states: STATES, onStateChange })
    );
    act(() => result.current.transition());
    expect(onStateChange).toHaveBeenCalledTimes(1);
    expect(onStateChange).toHaveBeenCalledWith('off', 'on');
  });

  it('fires when the controlled value changes without any click', () => {
    const onStateChange = vi.fn();
    const { rerender } = renderHook(
      ({ value }: { value: States }) =>
        useToggleAnimation({ states: STATES, value, onStateChange }),
      { initialProps: { value: 'off' as States } }
    );
    rerender({ value: 'on' });
    expect(onStateChange).toHaveBeenCalledWith('off', 'on');
  });

  it('does not fire when a controlled parent ignores the requested change', () => {
    const onStateChange = vi.fn();
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useToggleAnimation({
        states: STATES,
        value: 'off',
        onChange,
        onStateChange,
      })
    );
    act(() => result.current.transition());
    expect(onChange).toHaveBeenCalledWith('on');
    expect(onStateChange).not.toHaveBeenCalled();
  });
});
