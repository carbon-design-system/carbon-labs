/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * useHover under touch, pen and mixed input: hover is
 * ignored on touch, decided per pointer event; the compatibility mouse events
 * a browser fires after a tap never start a hover; mouse and pen still hover.
 * Event orders are the ones Chromium and WebKit fire (recorded in
 * apps/wc-harness, tests/touch.spec.ts).
 */
import React, { useEffect } from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useHover } from '../../hooks/useHover';

/** A pointer event with a pointerType (jsdom may lack PointerEvent). */
function pointer(
  el: Element,
  type: string,
  pointerType: 'mouse' | 'pen' | 'touch'
) {
  const bubbles = type !== 'pointerenter' && type !== 'pointerleave';
  const e = new Event(type, { bubbles, cancelable: true, composed: true });
  Object.defineProperty(e, 'pointerType', { value: pointerType });
  act(() => {
    el.dispatchEvent(e);
  });
}

/** What Chromium and WebKit fire for a tap on `el`. */
function tap(el: Element) {
  pointer(el, 'pointerover', 'touch');
  pointer(el, 'pointerenter', 'touch');
  pointer(el, 'pointerdown', 'touch');
  pointer(el, 'pointerup', 'touch');
  pointer(el, 'pointerleave', 'touch');
  // The compatibility mouse events that follow the tap (no pointerType; WebKit's click says "mouse").
  fireEvent.mouseOver(el);
  fireEvent.mouseEnter(el);
  fireEvent.mouseMove(el);
  fireEvent.mouseDown(el);
  fireEvent.mouseUp(el);
  fireEvent.click(el);
}

function Bare({
  onEnter,
  onLeave,
  disabled,
}: {
  onEnter?: () => void;
  onLeave?: () => void;
  disabled?: boolean;
}) {
  const { ref, isHovering } = useHover({ onEnter, onLeave, disabled });
  return (
    <svg ref={ref} data-testid="svg" role="img">
      <text data-testid="hovering">{String(isHovering)}</text>
    </svg>
  );
}

function Framed({
  onEnter,
  onClick,
}: {
  onEnter?: () => void;
  onClick?: () => void;
}) {
  const { ref, frameClickRef, isHovering } = useHover({ onEnter });
  useEffect(() => {
    frameClickRef.current = onClick ?? null;
  }, [frameClickRef, onClick]);
  return (
    <button type="button" data-motion-icon-frame="" data-testid="frame">
      <span data-testid="padding">Bookmark</span>
      <svg ref={ref} data-testid="svg" role="presentation" />
      <i data-testid="hovering">{String(isHovering)}</i>
    </button>
  );
}

describe('useHover · touch', () => {
  it('a touch pointerenter followed by an emulated mouseenter starts no hover', () => {
    const onEnter = vi.fn();
    render(<Bare onEnter={onEnter} />);
    const svg = screen.getByTestId('svg');
    pointer(svg, 'pointerenter', 'touch');
    fireEvent.mouseEnter(svg);
    expect(onEnter).not.toHaveBeenCalled();
    expect(screen.getByTestId('hovering').textContent).toBe('false');
  });

  it('a whole tap (pointer events, then compat mouse events) starts no hover', () => {
    const onEnter = vi.fn();
    render(<Bare onEnter={onEnter} />);
    tap(screen.getByTestId('svg'));
    expect(onEnter).not.toHaveBeenCalled();
    expect(screen.getByTestId('hovering').textContent).toBe('false');
  });

  it('a tap on a frame starts no hover, and its click still reaches frameClickRef', () => {
    const onEnter = vi.fn();
    const onClick = vi.fn();
    render(<Framed onEnter={onEnter} onClick={onClick} />);
    tap(screen.getByTestId('padding'));
    // The tap's pointerenter / mouseenter land on the frame itself (enter/leave don't bubble).
    tap(screen.getByTestId('frame'));
    expect(onEnter).not.toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('a mouse pointerenter hovers once (its own mouseenter is not a second enter)', () => {
    const onEnter = vi.fn();
    const onLeave = vi.fn();
    render(<Bare onEnter={onEnter} onLeave={onLeave} />);
    const svg = screen.getByTestId('svg');
    pointer(svg, 'pointerover', 'mouse');
    pointer(svg, 'pointerenter', 'mouse');
    fireEvent.mouseOver(svg);
    fireEvent.mouseEnter(svg);
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('hovering').textContent).toBe('true');
    pointer(svg, 'pointerleave', 'mouse');
    fireEvent.mouseLeave(svg);
    expect(onLeave).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('hovering').textContent).toBe('false');
  });

  it('a pen hovers', () => {
    const onEnter = vi.fn();
    render(<Bare onEnter={onEnter} />);
    pointer(screen.getByTestId('svg'), 'pointerenter', 'pen');
    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it('mixed input: mouse hovers, a tap does not, the mouse hovers again', () => {
    const onEnter = vi.fn();
    render(<Framed onEnter={onEnter} />);
    const frame = screen.getByTestId('frame');
    pointer(frame, 'pointerenter', 'mouse');
    pointer(frame, 'pointerleave', 'mouse');
    expect(onEnter).toHaveBeenCalledTimes(1);
    tap(frame);
    expect(onEnter).toHaveBeenCalledTimes(1);
    pointer(frame, 'pointerover', 'mouse');
    pointer(frame, 'pointerenter', 'mouse');
    expect(onEnter).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('hovering').textContent).toBe('true');
  });

  it('disabled ignores pointer events too', () => {
    const onEnter = vi.fn();
    render(<Bare onEnter={onEnter} disabled />);
    pointer(screen.getByTestId('svg'), 'pointerenter', 'mouse');
    expect(onEnter).not.toHaveBeenCalled();
  });
});
