/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useRef, useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { press, setReducedMotion } from '../../../vitest.dom';
import { AboutModal } from '../index';

setReducedMotion(true);

const root = () => document.documentElement;
const overlay = () =>
  document.querySelector('.cds-modal__overlay') as HTMLElement;

describe('AboutModal', () => {
  it('is a modal dialog named by its title', () => {
    render(<AboutModal open title="Carbon" content="Version 12" />);
    const dialog = screen.getByRole('dialog', { name: 'Carbon' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Version 12')).toBeTruthy();
  });

  it('takes `modalAriaLabel` for its name', () => {
    render(<AboutModal open modalAriaLabel="About this app" />);
    expect(screen.getByRole('dialog', { name: 'About this app' })).toBeTruthy();
  });

  it('renders nothing before it opens', () => {
    render(<AboutModal title="Carbon" />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('draws its logo, links and copyright', () => {
    render(
      <AboutModal
        open
        title="Carbon"
        logo={<span>Logo</span>}
        links={[
          <a key="a" href="#a">
            Terms
          </a>,
          <a key="b" href="#b">
            Privacy
          </a>,
        ]}
        copyrightText="Copyright 2026"
      />
    );
    expect(screen.getByText('Logo')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Terms' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Privacy' })).toBeTruthy();
    expect(screen.getByText('Copyright 2026')).toBeTruthy();
  });

  it('shows one additional item under the body, and several as tabs', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <AboutModal
        open
        title="Carbon"
        additionalInfo={[{ label: 'Build', content: 'abc123' }]}
      />
    );
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.getByText('Build')).toBeTruthy();
    rerender(
      <AboutModal
        open
        title="Carbon"
        additionalInfo={[
          { label: 'Build', content: 'abc123' },
          { label: 'Licences', content: 'Apache-2.0' },
        ]}
      />
    );
    expect(
      screen.getByRole('tablist', { name: 'Additional information' })
    ).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Build' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await user.click(screen.getByRole('tab', { name: 'Licences' }));
    expect(screen.getByRole('tab', { name: 'Licences' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  describe('focus', () => {
    it('moves in on open: the close button, as it has no other control', () => {
      render(<AboutModal open title="Carbon" />);
      expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    });

    it('wraps Tab inside it, both ways', () => {
      render(
        <AboutModal
          open
          title="Carbon"
          links={[
            <a key="a" href="#a">
              Terms
            </a>,
          ]}
        />
      );
      const dialog = screen.getByRole('dialog');
      const stops = Array.from(
        dialog.querySelectorAll<HTMLElement>('button, a[href]')
      );
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
          <AboutModal open title="Carbon" />
        </>
      );
      screen.getByText('Outside').focus();
      expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(
        true
      );
    });

    it('returns to what had it before it opened', () => {
      function Harness() {
        const [open, setOpen] = useState(false);
        return (
          <>
            <button onClick={() => setOpen(true)}>Open</button>
            <AboutModal
              open={open}
              title="Carbon"
              onClose={() => {
                setOpen(false);
                return false;
              }}
            />
          </>
        );
      }
      render(<Harness />);
      const opener = screen.getByText('Open');
      opener.focus();
      fireEvent.click(opener);
      fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
      expect(opener).toHaveFocus();
    });

    it('returns to `launcherButtonRef` when it is given', () => {
      function Harness() {
        const [open, setOpen] = useState(true);
        const ref = useRef<HTMLButtonElement>(null);
        return (
          <>
            <button ref={ref}>Launcher</button>
            <AboutModal
              open={open}
              title="Carbon"
              launcherButtonRef={ref}
              onClose={() => {
                setOpen(false);
                return false;
              }}
            />
          </>
        );
      }
      render(<Harness />);
      fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
      expect(screen.getByText('Launcher')).toHaveFocus();
    });
  });

  describe('closing', () => {
    it('asks `onClose` on Escape, and closes itself unless it returns false', async () => {
      const onClose = vi.fn();
      render(<AboutModal open title="Carbon" onClose={onClose} />);
      fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });

    it('stays open when `onClose` returns false', () => {
      const onClose = vi.fn(() => false);
      render(<AboutModal open title="Carbon" onClose={onClose} />);
      fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    it('closes only the topmost layer on Escape', () => {
      const lower = vi.fn(() => false);
      const upper = vi.fn(() => false);
      render(
        <>
          <AboutModal open title="Lower" onClose={lower} />
          <AboutModal open title="Upper" onClose={upper} />
        </>
      );
      fireEvent.keyDown(document.body, { key: 'Escape' });
      expect(upper).toHaveBeenCalledTimes(1);
      expect(lower).not.toHaveBeenCalled();
    });

    it('closes on a press outside: it is passive', () => {
      const onClose = vi.fn(() => false);
      render(<AboutModal open title="Carbon" onClose={onClose} />);
      press(overlay());
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when the press starts or ends inside', () => {
      const onClose = vi.fn(() => false);
      render(<AboutModal open title="Carbon" onClose={onClose} />);
      const surface = screen.getByRole('dialog');
      press(overlay(), { over: surface });
      press(surface, { over: overlay() });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('closes through its close button', () => {
      const onClose = vi.fn(() => false);
      render(<AboutModal open title="Carbon" onClose={onClose} />);
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('scroll lock', () => {
    it('holds the page while open and lets go once it has left', async () => {
      const { rerender } = render(<AboutModal open title="Carbon" />);
      expect(root().style.overflow).toBe('hidden');
      rerender(<AboutModal open={false} title="Carbon" />);
      await waitFor(() => expect(root().style.overflow).toBe(''));
    });

    it('lets go when it unmounts while open', () => {
      const { unmount } = render(<AboutModal open title="Carbon" />);
      expect(root().style.overflow).toBe('hidden');
      unmount();
      expect(root().style.overflow).toBe('');
    });
  });
});
