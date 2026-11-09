/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useHover } from '../../hooks/useHover';

function HoverTarget({
  onEnter,
  onLeave,
  disabled,
}: {
  onEnter?: () => void;
  onLeave?: () => void;
  disabled?: boolean;
}): React.ReactElement {
  const { ref, isHovering } = useHover({ onEnter, onLeave, disabled });
  return (
    <svg ref={ref} data-testid="svg" role="img">
      <text data-testid="hovering">{String(isHovering)}</text>
    </svg>
  );
}

describe('useHover', () => {
  it('calls onEnter on mouseenter', () => {
    const onEnter = vi.fn();
    render(<HoverTarget onEnter={onEnter} />);
    fireEvent.mouseEnter(screen.getByTestId('svg'));
    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it('calls onLeave on mouseleave', () => {
    const onLeave = vi.fn();
    render(<HoverTarget onLeave={onLeave} />);
    fireEvent.mouseEnter(screen.getByTestId('svg'));
    fireEvent.mouseLeave(screen.getByTestId('svg'));
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it('isHovering is true after mouseenter and false after mouseleave', () => {
    render(<HoverTarget />);
    const svg = screen.getByTestId('svg');
    const hovering = screen.getByTestId('hovering');

    expect(hovering.textContent).toBe('false');
    fireEvent.mouseEnter(svg);
    expect(hovering.textContent).toBe('true');
    fireEvent.mouseLeave(svg);
    expect(hovering.textContent).toBe('false');
  });

  it('does not fire callbacks when disabled=true', () => {
    const onEnter = vi.fn();
    const onLeave = vi.fn();
    render(<HoverTarget onEnter={onEnter} onLeave={onLeave} disabled={true} />);
    const svg = screen.getByTestId('svg');
    fireEvent.mouseEnter(svg);
    fireEvent.mouseLeave(svg);
    expect(onEnter).not.toHaveBeenCalled();
    expect(onLeave).not.toHaveBeenCalled();
  });

  // ── Interactive frame — ancestor button coverage ──────────────────────────
  //
  // Mirrors Shell.tsx's real-world arrangement: a bare SVG (asButton={false})
  // nested inside a caller-supplied <button> that is larger than the SVG's
  // own box (e.g. Carbon's HeaderGlobalAction), opted in with
  // data-motion-icon-frame. See useHover.ts's "Interactive frame" comment.

  function FramedHoverTarget({
    onEnter,
    onLeave,
    onFrameClickRef,
  }: {
    onEnter?: () => void;
    onLeave?: () => void;
    onFrameClickRef?: (
      ref: React.MutableRefObject<((e?: React.MouseEvent) => void) | null>
    ) => void;
  }): React.ReactElement {
    const { ref, frameClickRef } = useHover({ onEnter, onLeave });
    onFrameClickRef?.(frameClickRef);
    return (
      <button type="button" data-testid="frame" data-motion-icon-frame="">
        <span data-testid="padding">padding</span>
        <svg ref={ref} data-testid="svg" role="presentation" />
      </button>
    );
  }

  it('fires onEnter/onLeave for the ancestor button box, not just the nested SVG', () => {
    const onEnter = vi.fn();
    const onLeave = vi.fn();
    render(<FramedHoverTarget onEnter={onEnter} onLeave={onLeave} />);

    // The pointer entering/leaving the BUTTON (which is larger than the SVG,
    // e.g. HeaderGlobalAction's padding) must drive the hover animation —
    // this is the bug: previously only the tiny SVG box triggered it.
    fireEvent.mouseEnter(screen.getByTestId('frame'));
    expect(onEnter).toHaveBeenCalledTimes(1);

    fireEvent.mouseLeave(screen.getByTestId('frame'));
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it('forwards a click landing in the ancestor frame outside the SVG to frameClickRef', () => {
    let frameClickRef: React.MutableRefObject<
      ((e?: React.MouseEvent) => void) | null
    > | null = null;
    const handleToggle = vi.fn();

    render(
      <FramedHoverTarget
        onFrameClickRef={(ref) => {
          frameClickRef = ref;
          ref.current = handleToggle;
        }}
      />
    );

    // A click on the padding area (inside the button, outside the SVG) —
    // previously dead space — must now trigger the icon's own click handler.
    fireEvent.click(screen.getByTestId('padding'));
    expect(handleToggle).toHaveBeenCalledTimes(1);
    expect(frameClickRef).not.toBeNull();
  });

  it('does not double-fire when the click lands directly on the SVG', () => {
    const handleToggle = vi.fn();

    render(
      <FramedHoverTarget
        onFrameClickRef={(ref) => {
          ref.current = handleToggle;
        }}
      />
    );

    // A click on the SVG itself already bubbles to the SVG's own onClick in
    // the real component (not exercised by this bare hook test) — the
    // ancestor-frame fallback must stay silent here so it never fires twice.
    fireEvent.click(screen.getByTestId('svg'));
    expect(handleToggle).not.toHaveBeenCalled();
  });

  it('falls back to the SVG itself when there is no interactive ancestor (bare icon, unchanged behavior)', () => {
    const onEnter = vi.fn();
    render(<HoverTarget onEnter={onEnter} />);
    // No wrapping button exists — hover must still work directly on the SVG,
    // exactly as before this fix.
    fireEvent.mouseEnter(screen.getByTestId('svg'));
    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  // ── Interactive frame — links and data-motion-icon-frame ──────────────────

  function LinkFrameTarget({
    onEnter,
    onLeave,
  }: {
    onEnter?: () => void;
    onLeave?: () => void;
  }) {
    const { ref } = useHover({ onEnter, onLeave });
    return (
      <a href="#tile" data-testid="frame" data-motion-icon-frame="">
        <span>tile content</span>
        <svg ref={ref} data-testid="svg" role="presentation" />
      </a>
    );
  }

  it('treats a marked ancestor link as the frame', () => {
    const onEnter = vi.fn();
    const onLeave = vi.fn();
    render(<LinkFrameTarget onEnter={onEnter} onLeave={onLeave} />);
    fireEvent.mouseEnter(screen.getByTestId('frame'));
    expect(onEnter).toHaveBeenCalledTimes(1);
    fireEvent.mouseLeave(screen.getByTestId('frame'));
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  function MarkedFrameTarget({ onEnter }: { onEnter?: () => void }) {
    const { ref } = useHover({ onEnter });
    return (
      <div>
        <p data-motion-icon-frame="" data-testid="frame">
          <svg ref={ref} data-testid="svg" role="presentation" />
          3.5% below plan
        </p>
      </div>
    );
  }

  it('treats an ancestor marked data-motion-icon-frame as the frame', () => {
    const onEnter = vi.fn();
    render(<MarkedFrameTarget onEnter={onEnter} />);
    fireEvent.mouseEnter(screen.getByTestId('frame'));
    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  // Opt-in: an unmarked interactive ancestor must NOT become the frame — a
  // toggle inside a clickable card/row would otherwise toggle on any click
  // anywhere in it.
  function UnmarkedAncestor({
    as,
    onEnter,
    clickRef,
  }: {
    as: 'button' | 'link' | 'role';
    onEnter?: () => void;
    clickRef?: (
      r: React.MutableRefObject<((e?: React.MouseEvent) => void) | null>
    ) => void;
  }) {
    const { ref, frameClickRef } = useHover({ onEnter });
    clickRef?.(frameClickRef);
    const inner = (
      <>
        <span data-testid="padding">row content</span>
        <svg ref={ref} data-testid="svg" role="presentation" />
      </>
    );
    if (as === 'button')
      return (
        <button type="button" data-testid="frame">
          {inner}
        </button>
      );
    if (as === 'link')
      return (
        <a href="#row" data-testid="frame">
          {inner}
        </a>
      );
    return (
      <div role="button" tabIndex={0} data-testid="frame">
        {inner}
      </div>
    );
  }

  it.each(['button', 'link', 'role'] as const)(
    'ignores an unmarked %s ancestor',
    (as) => {
      const onEnter = vi.fn();
      const toggle = vi.fn();
      render(
        <UnmarkedAncestor
          as={as}
          onEnter={onEnter}
          clickRef={(r) => {
            r.current = toggle;
          }}
        />
      );
      fireEvent.mouseEnter(screen.getByTestId('frame'));
      fireEvent.click(screen.getByTestId('padding'));
      expect(onEnter).not.toHaveBeenCalled();
      expect(toggle).not.toHaveBeenCalled();
      // …and hover still works on the icon itself.
      fireEvent.mouseEnter(screen.getByTestId('svg'));
      expect(onEnter).toHaveBeenCalledTimes(1);
    }
  );
});
