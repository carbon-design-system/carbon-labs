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
import { Tearsheet, TearsheetNarrow } from '../index';

setReducedMotion(true);

const root = () => document.documentElement;
const overlay = () =>
  document.querySelector('.cds-tearsheet__overlay') as HTMLElement;

function Harness(props: Partial<React.ComponentProps<typeof Tearsheet>> = {}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Tearsheet title="Create" {...props} open={open}>
        <button>First</button>
        <button>Last</button>
      </Tearsheet>
    </>
  );
}

describe('Tearsheet', () => {
  it('is a modal dialog named by its title, or by `ariaLabel`', () => {
    const { unmount } = render(<Tearsheet open title="Create" />);
    const dialog = screen.getByRole('dialog', { name: 'Create' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    unmount();
    render(<Tearsheet open ariaLabel="Wizard" />);
    expect(screen.getByRole('dialog', { name: 'Wizard' })).toBeTruthy();
  });

  it('renders nothing while closed', () => {
    render(<Tearsheet title="Create" open={false} warm={false} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes itself on Escape, telling `onClose`', async () => {
    const onClose = vi.fn();
    render(<Tearsheet open title="Create" onClose={onClose} />);
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('stays open when `onClose` returns false', () => {
    const onClose = vi.fn(() => false);
    render(<Tearsheet open title="Create" onClose={onClose} />);
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  describe('focus', () => {
    it('moves in on open, once it has painted: the first tab stop in its main area', async () => {
      render(<Harness />);
      fireEvent.click(screen.getByText('Open'));
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'First' })).toHaveFocus()
      );
    });

    it('moves to `selectorPrimaryFocus` when it is given', async () => {
      render(
        <Tearsheet open title="Create" selectorPrimaryFocus="[data-pick]">
          <button>First</button>
          <button data-pick>Last</button>
        </Tearsheet>
      );
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus()
      );
    });

    it('goes to the close button when the main area has no tab stop', async () => {
      render(
        <Tearsheet open title="Create">
          No controls
        </Tearsheet>
      );
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus()
      );
    });

    it('returns to what had it before, as it starts to leave', async () => {
      render(<Harness />);
      const opener = screen.getByText('Open');
      opener.focus();
      fireEvent.click(opener);
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'First' })).toHaveFocus()
      );
      fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
      expect(opener).toHaveFocus();
    });

    it('returns to `launcherButtonRef` when it is given', async () => {
      function Launched() {
        const ref = useRef<HTMLButtonElement>(null);
        return (
          <>
            <button ref={ref}>Launcher</button>
            <Tearsheet open title="Create" launcherButtonRef={ref}>
              <button>Inside</button>
            </Tearsheet>
          </>
        );
      }
      render(<Launched />);
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Inside' })).toHaveFocus()
      );
      fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
      expect(screen.getByText('Launcher')).toHaveFocus();
    });
  });

  describe('focus trap', () => {
    it('wraps Tab from the last stop to the first, and Shift+Tab back', () => {
      render(
        <Tearsheet
          open
          title="Create"
          actions={[{ label: 'Cancel' }, { label: 'Save' }]}>
          <button>First</button>
        </Tearsheet>
      );
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

    it('brings focus back when it escapes to the page', () => {
      render(
        <>
          <button>Outside</button>
          <Tearsheet open title="Create">
            <button>Inside</button>
          </Tearsheet>
        </>
      );
      screen.getByText('Outside').focus();
      expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(
        true
      );
    });
  });

  describe('Escape', () => {
    it('closes only the topmost of two sheets', () => {
      const lower = vi.fn(() => false);
      const upper = vi.fn(() => false);
      render(
        <>
          <Tearsheet open title="Lower" onClose={lower} />
          <Tearsheet open title="Upper" onClose={upper} />
        </>
      );
      fireEvent.keyDown(document.body, { key: 'Escape' });
      expect(upper).toHaveBeenCalledTimes(1);
      expect(lower).not.toHaveBeenCalled();
    });
  });

  describe('press outside', () => {
    it('closes a passive sheet (no actions)', () => {
      const onClose = vi.fn(() => false);
      render(<Tearsheet open title="Create" onClose={onClose} />);
      press(overlay());
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not close one with actions', () => {
      const onClose = vi.fn(() => false);
      render(
        <Tearsheet
          open
          title="Create"
          onClose={onClose}
          actions={[{ label: 'Save' }]}
        />
      );
      press(overlay());
      expect(onClose).not.toHaveBeenCalled();
    });

    it('needs the press to start and end on the overlay', () => {
      const onClose = vi.fn(() => false);
      render(<Tearsheet open title="Create" onClose={onClose} />);
      const sheet = screen.getByRole('dialog');
      press(overlay(), { over: sheet });
      press(sheet, { over: overlay() });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('scroll lock', () => {
    it('holds the page while open and lets go once it has left', async () => {
      render(<Harness />);
      expect(root().style.overflow).toBe('');
      fireEvent.click(screen.getByText('Open'));
      await waitFor(() => expect(root().style.overflow).toBe('hidden'));
      fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
      await waitFor(() => expect(root().style.overflow).toBe(''));
    });

    it('lets go when it unmounts while open', async () => {
      const { unmount } = render(<Tearsheet open title="Create" />);
      await waitFor(() => expect(root().style.overflow).toBe('hidden'));
      unmount();
      expect(root().style.overflow).toBe('');
    });
  });

  describe('header and footer', () => {
    it('has a close button when there are no actions, and not when there are', () => {
      const { rerender } = render(<Tearsheet open title="Create" />);
      expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
      rerender(<Tearsheet open title="Create" actions={[{ label: 'Save' }]} />);
      expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
      expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
    });

    it('draws an influencer beside the main area', () => {
      render(
        <Tearsheet open title="Create" influencer={<p>Steps</p>}>
          Main
        </Tearsheet>
      );
      expect(screen.getByText('Steps')).toBeTruthy();
    });
  });
});

describe('TearsheetNarrow', () => {
  it('is a modal dialog too, closing on Escape', () => {
    const onClose = vi.fn(() => false);
    render(<TearsheetNarrow open title="Narrow" onClose={onClose} />);
    expect(screen.getByRole('dialog', { name: 'Narrow' })).toHaveAttribute(
      'aria-modal',
      'true'
    );
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
