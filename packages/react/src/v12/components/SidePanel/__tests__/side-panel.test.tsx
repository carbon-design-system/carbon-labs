/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @vitest-environment jsdom
/** @jsxRuntime automatic */

import { useRef, useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '../../../vitest.setup';
import { press, setReducedMotion } from '../../../vitest.dom';
import { SidePanel } from '../index';

setReducedMotion(true);

const root = () => document.documentElement;
const overlay = () =>
  document.querySelector('.cds-side-panel__overlay') as HTMLElement;

function Harness(props: Partial<React.ComponentProps<typeof SidePanel>> = {}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <SidePanel
        title="Details"
        {...props}
        open={open}
        onRequestClose={(e) => {
          props.onRequestClose?.(e);
          setOpen(false);
        }}>
        <button>First</button>
        <button data-pick>Last</button>
      </SidePanel>
    </>
  );
}

describe('SidePanel', () => {
  it('is a dialog named by its title', () => {
    render(<SidePanel open title="Details" />);
    expect(screen.getByRole('dialog', { name: 'Details' })).toBeTruthy();
  });

  it('is modal with an overlay, and not without one', () => {
    const { rerender } = render(<SidePanel open title="Details" />);
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-modal');
    rerender(<SidePanel open title="Details" includeOverlay />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  describe('focus', () => {
    it('moves in on open: the first tab stop in its body', () => {
      render(<Harness />);
      fireEvent.click(screen.getByText('Open'));
      expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
    });

    it('moves to `selectorPrimaryFocus` when it is given', () => {
      render(<Harness selectorPrimaryFocus="[data-pick]" />);
      fireEvent.click(screen.getByText('Open'));
      expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus();
    });

    it('returns to what had it, as it starts to leave', () => {
      render(<Harness />);
      const opener = screen.getByText('Open');
      opener.focus();
      fireEvent.click(opener);
      fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
      expect(opener).toHaveFocus();
    });

    it('returns to `launcherButtonRef` when it is given', () => {
      function Launched() {
        const [open, setOpen] = useState(true);
        const ref = useRef<HTMLButtonElement>(null);
        return (
          <>
            <button ref={ref}>Launcher</button>
            <SidePanel
              open={open}
              title="Details"
              launcherButtonRef={ref}
              onRequestClose={() => setOpen(false)}>
              <button>Inside</button>
            </SidePanel>
          </>
        );
      }
      render(<Launched />);
      fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
      expect(screen.getByText('Launcher')).toHaveFocus();
    });
  });

  describe('focus trap', () => {
    it('with an overlay, Tab wraps inside it, both ways', () => {
      render(<Harness includeOverlay />);
      fireEvent.click(screen.getByText('Open'));
      const dialog = screen.getByRole('dialog');
      const stops = Array.from(dialog.querySelectorAll<HTMLElement>('button'));
      const first = stops[0]!;
      const last = stops[stops.length - 1]!;
      last.focus();
      fireEvent.keyDown(last, { key: 'Tab' });
      expect(first).toHaveFocus();
      fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
      expect(last).toHaveFocus();
    });

    it('with an overlay, focus that goes to the page is brought back', () => {
      render(<Harness includeOverlay />);
      fireEvent.click(screen.getByText('Open'));
      screen.getByText('Open').focus();
      expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(
        true
      );
    });

    it('without an overlay, focus may leave: the page stays usable beside it', () => {
      render(<Harness />);
      fireEvent.click(screen.getByText('Open'));
      screen.getByText('Open').focus();
      expect(screen.getByText('Open')).toHaveFocus();
    });
  });

  describe('Escape', () => {
    it('asks to close', () => {
      const onRequestClose = vi.fn();
      render(<Harness onRequestClose={onRequestClose} />);
      fireEvent.click(screen.getByText('Open'));
      fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
      expect(onRequestClose).toHaveBeenCalledTimes(1);
    });

    it('closes only the topmost of two panels', () => {
      const lower = vi.fn();
      const upper = vi.fn();
      render(
        <>
          <SidePanel open title="Lower" onRequestClose={lower} />
          <SidePanel open title="Upper" onRequestClose={upper} />
        </>
      );
      fireEvent.keyDown(document.body, { key: 'Escape' });
      expect(upper).toHaveBeenCalledTimes(1);
      expect(lower).not.toHaveBeenCalled();
    });
  });

  describe('press outside', () => {
    it('on the overlay asks to close', () => {
      const onRequestClose = vi.fn();
      render(<SidePanel open includeOverlay onRequestClose={onRequestClose} />);
      press(overlay());
      expect(onRequestClose).toHaveBeenCalledTimes(1);
    });

    it('does nothing with `preventCloseOnClickOutside`', () => {
      const onRequestClose = vi.fn();
      render(
        <SidePanel
          open
          includeOverlay
          preventCloseOnClickOutside
          onRequestClose={onRequestClose}
        />
      );
      press(overlay());
      expect(onRequestClose).not.toHaveBeenCalled();
    });

    it('needs the press to start and end on the overlay', () => {
      const onRequestClose = vi.fn();
      render(<SidePanel open includeOverlay onRequestClose={onRequestClose} />);
      const panel = screen.getByRole('dialog');
      press(overlay(), { over: panel });
      press(panel, { over: overlay() });
      expect(onRequestClose).not.toHaveBeenCalled();
    });

    it('has no overlay to press without `includeOverlay`', () => {
      render(<SidePanel open title="Details" />);
      expect(overlay()).toBeNull();
    });
  });

  describe('scroll lock', () => {
    it('with an overlay, holds the page while open and lets go once it has left', async () => {
      render(<Harness includeOverlay />);
      expect(root().style.overflow).toBe('');
      fireEvent.click(screen.getByText('Open'));
      expect(root().style.overflow).toBe('hidden');
      fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
      await waitFor(() => expect(root().style.overflow).toBe(''));
    });

    it('without an overlay, leaves the page scrolling', () => {
      render(<Harness />);
      fireEvent.click(screen.getByText('Open'));
      expect(root().style.overflow).toBe('');
    });

    it('lets go when it unmounts while open', () => {
      const { unmount } = render(<SidePanel open includeOverlay title="x" />);
      expect(root().style.overflow).toBe('hidden');
      unmount();
      expect(root().style.overflow).toBe('');
    });
  });

  describe('steps and actions', () => {
    it('shows a back button past step 0, and asks `onNavigationBack`', () => {
      const onNavigationBack = vi.fn();
      render(
        <SidePanel
          open
          title="Details"
          currentStep={1}
          onNavigationBack={onNavigationBack}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Back' }));
      expect(onNavigationBack).toHaveBeenCalledTimes(1);
    });

    it('hands focus to the close button when the back button leaves with it', () => {
      function Steps() {
        const [step, setStep] = useState(2);
        return (
          <SidePanel
            open
            title="Details"
            currentStep={step}
            onNavigationBack={() => setStep((s) => s - 1)}
          />
        );
      }
      render(<Steps />);
      const back = screen.getByRole('button', { name: 'Back' });
      back.focus();
      // Still past the first step: the button stays, and keeps the focus.
      fireEvent.click(back);
      expect(document.activeElement).toBe(back);
      fireEvent.click(back);
      expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Close' })
      );
    });

    it('leaves focus where it is when the back button leaves without it', () => {
      function Steps() {
        const [step, setStep] = useState(1);
        return (
          <>
            <button onClick={() => setStep(0)}>Start over</button>
            <SidePanel open title="Details" currentStep={step} />
          </>
        );
      }
      render(<Steps />);
      const again = screen.getByRole('button', { name: 'Start over' });
      again.focus();
      fireEvent.click(again);
      expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
      expect(document.activeElement).toBe(again);
    });

    it('closes through its close button', () => {
      const onRequestClose = vi.fn();
      render(
        <SidePanel open title="Details" onRequestClose={onRequestClose} />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(onRequestClose).toHaveBeenCalledTimes(1);
    });
  });
});
