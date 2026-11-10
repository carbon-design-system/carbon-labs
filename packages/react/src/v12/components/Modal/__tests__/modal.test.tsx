/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useRef, useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { press, setReducedMotion } from '../../../vitest.dom';
import { ComposedModal, Modal, ModalBody, ModalHeader } from '../index';

setReducedMotion(true);

/** A launcher and a modal it opens; the modal asks to close through `onRequestClose`. */
function Harness(props: Partial<React.ComponentProps<typeof Modal>> = {}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={ref} onClick={() => setOpen(true)}>
        Open
      </button>
      <Modal
        modalHeading="Delete file"
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
        {...props}
        open={open}
        onRequestClose={(e) => {
          props.onRequestClose?.(e);
          setOpen(false);
        }}>
        <input aria-label="Reason" />
      </Modal>
    </>
  );
}

const root = () => document.documentElement;

describe('Modal', () => {
  it('is a dialog, modal, named by its heading', () => {
    render(<Modal open modalHeading="Delete file" primaryButtonText="Go" />);
    const dialog = screen.getByRole('dialog', { name: 'Delete file' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('is an alertdialog with `alert`', () => {
    render(<Modal open alert modalAriaLabel="Sure?" primaryButtonText="Go" />);
    expect(screen.getByRole('alertdialog', { name: 'Sure?' })).toBeTruthy();
  });

  it('renders nothing before it opens', () => {
    render(<Harness />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('moves focus in on open: the primary button, v11’s order', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus();
  });

  it('starts on the secondary button when danger', () => {
    render(<Harness danger />);
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });

  it('starts on `selectorPrimaryFocus` when it is given', () => {
    render(<Harness selectorPrimaryFocus="input" />);
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByLabelText('Reason')).toHaveFocus();
  });

  describe('focus trap', () => {
    it('wraps Tab from the last stop to the first, and Shift+Tab back', () => {
      render(<Harness />);
      fireEvent.click(screen.getByText('Open'));
      const dialog = screen.getByRole('dialog');
      const stops = Array.from(
        dialog.querySelectorAll<HTMLElement>('button, input')
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
      render(<Harness />);
      fireEvent.click(screen.getByText('Open'));
      screen.getByText('Open').focus();
      expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(
        true
      );
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

    it('closes only the topmost of two modals', () => {
      const lower = vi.fn();
      const upper = vi.fn();
      render(
        <>
          <Modal open modalHeading="Lower" onRequestClose={lower} />
          <Modal open modalHeading="Upper" onRequestClose={upper} />
        </>
      );
      fireEvent.keyDown(document.body, { key: 'Escape' });
      expect(upper).toHaveBeenCalledTimes(1);
      expect(lower).not.toHaveBeenCalled();
    });

    it('lets the one below have it once the one above is gone', async () => {
      const lower = vi.fn();
      const upper = vi.fn();
      const { rerender } = render(
        <>
          <Modal open modalHeading="Lower" onRequestClose={lower} />
          <Modal open modalHeading="Upper" onRequestClose={upper} />
        </>
      );
      rerender(
        <>
          <Modal open modalHeading="Lower" onRequestClose={lower} />
          <Modal open={false} modalHeading="Upper" onRequestClose={upper} />
        </>
      );
      fireEvent.keyDown(document.body, { key: 'Escape' });
      expect(lower).toHaveBeenCalledTimes(1);
      expect(upper).not.toHaveBeenCalled();
    });

    it('is left alone when something inside already handled it', () => {
      const onRequestClose = vi.fn();
      render(
        <Modal open modalHeading="Menu" onRequestClose={onRequestClose} />
      );
      const handled = (e: KeyboardEvent) => e.preventDefault();
      document.body.addEventListener('keydown', handled);
      fireEvent.keyDown(document.body, { key: 'Escape' });
      document.body.removeEventListener('keydown', handled);
      // The listener on the document runs after the body's: it sees the default prevented.
      expect(onRequestClose).not.toHaveBeenCalled();
    });
  });

  describe('press outside', () => {
    const overlay = () =>
      document.querySelector('.cds-modal__overlay') as HTMLElement;

    it('closes a passive modal', () => {
      const onRequestClose = vi.fn();
      render(<Modal open passiveModal onRequestClose={onRequestClose} />);
      press(overlay());
      expect(onRequestClose).toHaveBeenCalledTimes(1);
    });

    it('does not close one with a footer (v11)', () => {
      const onRequestClose = vi.fn();
      render(
        <Modal open primaryButtonText="Go" onRequestClose={onRequestClose} />
      );
      press(overlay());
      expect(onRequestClose).not.toHaveBeenCalled();
    });

    it('closes one with a footer when `preventCloseOnClickOutside` is false', () => {
      const onRequestClose = vi.fn();
      render(
        <Modal
          open
          primaryButtonText="Go"
          preventCloseOnClickOutside={false}
          onRequestClose={onRequestClose}
        />
      );
      press(overlay());
      expect(onRequestClose).toHaveBeenCalledTimes(1);
    });

    it('does not close a passive modal with `preventCloseOnClickOutside`', () => {
      const onRequestClose = vi.fn();
      render(
        <Modal
          open
          passiveModal
          preventCloseOnClickOutside
          onRequestClose={onRequestClose}
        />
      );
      press(overlay());
      expect(onRequestClose).not.toHaveBeenCalled();
    });

    it('needs the press to start and end on the overlay', () => {
      const onRequestClose = vi.fn();
      render(<Modal open passiveModal onRequestClose={onRequestClose} />);
      const surface = screen.getByRole('dialog');
      press(overlay(), { over: surface });
      press(surface, { over: overlay() });
      expect(onRequestClose).not.toHaveBeenCalled();
    });

    it('ignores a press that is not the main button', () => {
      const onRequestClose = vi.fn();
      render(<Modal open passiveModal onRequestClose={onRequestClose} />);
      press(overlay(), { button: 2 });
      expect(onRequestClose).not.toHaveBeenCalled();
    });

    it('is the topmost modal’s alone', () => {
      const lower = vi.fn();
      const upper = vi.fn();
      render(
        <>
          <Modal
            open
            passiveModal
            modalHeading="Lower"
            onRequestClose={lower}
          />
          <Modal
            open
            passiveModal
            modalHeading="Upper"
            onRequestClose={upper}
          />
        </>
      );
      const [first, second] = Array.from(
        document.querySelectorAll<HTMLElement>('.cds-modal__overlay')
      );
      press(first!);
      expect(lower).not.toHaveBeenCalled();
      press(second!);
      expect(upper).toHaveBeenCalledTimes(1);
    });
  });

  describe('scroll lock', () => {
    it('stops the page scrolling while open, and lets go once it has left', async () => {
      render(<Harness />);
      expect(root().style.overflow).toBe('');
      fireEvent.click(screen.getByText('Open'));
      expect(root().style.overflow).toBe('hidden');
      fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
      await waitFor(() => expect(root().style.overflow).toBe(''));
    });

    it('holds until the last of two modals is gone', async () => {
      const { rerender } = render(
        <>
          <Modal open modalHeading="A" />
          <Modal open modalHeading="B" />
        </>
      );
      expect(root().style.overflow).toBe('hidden');
      rerender(
        <>
          <Modal open modalHeading="A" />
          <Modal open={false} modalHeading="B" />
        </>
      );
      await Promise.resolve();
      expect(root().style.overflow).toBe('hidden');
      rerender(
        <>
          <Modal open={false} modalHeading="A" />
          <Modal open={false} modalHeading="B" />
        </>
      );
      await waitFor(() => expect(root().style.overflow).toBe(''));
    });

    it('lets go when it unmounts while open', () => {
      const { unmount } = render(<Modal open modalHeading="A" />);
      expect(root().style.overflow).toBe('hidden');
      unmount();
      expect(root().style.overflow).toBe('');
    });
  });

  describe('focus returns', () => {
    it('to what had it before it opened, as it starts to leave', () => {
      render(<Harness />);
      const opener = screen.getByText('Open');
      opener.focus();
      fireEvent.click(opener);
      expect(opener).not.toHaveFocus();
      fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
      expect(opener).toHaveFocus();
    });

    it('to `launcherButtonRef` when it is given', () => {
      function Launched() {
        const [open, setOpen] = useState(true);
        const ref = useRef<HTMLButtonElement>(null);
        return (
          <>
            <button ref={ref}>Launcher</button>
            <button>Other</button>
            <Modal
              open={open}
              launcherButtonRef={ref}
              modalHeading="X"
              primaryButtonText="Go"
              onRequestClose={() => setOpen(false)}
            />
          </>
        );
      }
      render(<Launched />);
      fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
      expect(screen.getByText('Launcher')).toHaveFocus();
    });

    it('closes through the close button, and the footer’s secondary asks too', () => {
      const onRequestClose = vi.fn();
      render(<Harness onRequestClose={onRequestClose} />);
      fireEvent.click(screen.getByText('Open'));
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onRequestClose).toHaveBeenCalledTimes(1);
    });
  });
});

describe('ComposedModal', () => {
  it('follows `open`, and `onClose` returning false keeps it open', async () => {
    const onClose = vi.fn(() => false);
    render(
      <ComposedModal open onClose={onClose} aria-label="Composed">
        <ModalHeader title="Composed" />
        <ModalBody>Body</ModalBody>
      </ComposedModal>
    );
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('dialog', { name: 'Composed' })).toBeTruthy();
  });

  it('closes itself when `onClose` does not say no', async () => {
    const onClose = vi.fn();
    render(
      <ComposedModal open onClose={onClose} aria-label="Composed">
        <ModalHeader title="Composed" />
        <ModalBody>Body</ModalBody>
      </ComposedModal>
    );
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    await waitFor(() => expect(root().style.overflow).toBe(''));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
