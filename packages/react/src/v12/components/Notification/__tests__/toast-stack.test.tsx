/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { setReducedMotion } from '../../../vitest.dom';
import { ToastStack, useToasts, type Toasts } from '../index';

setReducedMotion(true);

/** Gives a test the stack's API. */
function setup(props: Partial<React.ComponentProps<typeof ToastStack>> = {}) {
  const ref: { api: Toasts } = { api: null as never };
  function Grab() {
    ref.api = useToasts();
    return null;
  }
  render(
    <ToastStack {...props}>
      <Grab />
    </ToastStack>
  );
  return ref;
}

const cards = () =>
  Array.from(document.querySelectorAll<HTMLElement>('[data-stack-item]'));
const titles = () =>
  cards().map((c) => c.querySelector('.fb-n__title')?.textContent);
const polite = () => document.querySelector('[role="status"].fb-stack__live')!;
const assertive = () =>
  document.querySelector('[role="alert"].fb-stack__live')!;

describe('ToastStack landmarks and live regions', () => {
  it('has two live regions from the start: polite and assertive, both empty', () => {
    setup();
    expect(polite()).toBeTruthy();
    expect(assertive()).toBeTruthy();
    expect(polite().textContent).toBe('');
    expect(assertive().textContent).toBe('');
  });

  it('is a region named "Notifications" only while it holds toasts', async () => {
    const ref = setup();
    expect(screen.queryByRole('region', { name: 'Notifications' })).toBeNull();
    act(() => {
      ref.api.show({ kind: 'info', title: 'Saved', timeout: 0 });
    });
    expect(screen.getByRole('region', { name: 'Notifications' })).toBeTruthy();
  });

  it('gives the cards no live role of their own', () => {
    const ref = setup();
    act(() => {
      ref.api.show({ kind: 'info', title: 'Saved', timeout: 0 });
    });
    expect(cards()[0]!.getAttribute('role')).toBeNull();
    expect(
      cards()[0]!.querySelector('[role="status"], [role="alert"]')
    ).toBeNull();
  });

  it('throws from `useToasts` outside a stack', () => {
    function Bare() {
      useToasts();
      return null;
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // jsdom reports an error a render throws; the test catches it, so it stays quiet.
    const quiet = (e: Event) => e.preventDefault();
    window.addEventListener('error', quiet);
    expect(() => render(<Bare />)).toThrow(/ToastStack/);
    window.removeEventListener('error', quiet);
    spy.mockRestore();
  });
});

describe('ToastStack stacking order', () => {
  it('shows a toast with its title and subtitle, and `show` returns its id', () => {
    const ref = setup();
    let id = '';
    act(() => {
      id = ref.api.show({
        kind: 'info',
        title: 'Saved',
        subtitle: 'All changes',
        timeout: 0,
      });
    });
    expect(id).toBeTruthy();
    expect(screen.getByText('Saved')).toBeTruthy();
    expect(screen.getByText('All changes')).toBeTruthy();
  });

  it('puts the newest in front, the one before it behind, newest first in the DOM', () => {
    const ref = setup();
    act(() => {
      ref.api.show({ kind: 'info', title: 'First', timeout: 0 });
    });
    act(() => {
      ref.api.show({ kind: 'info', title: 'Second', timeout: 0 });
    });
    act(() => {
      ref.api.show({ kind: 'info', title: 'Third', timeout: 0 });
    });
    expect(titles()).toEqual(['Third', 'Second', 'First']);
    expect(cards().map((c) => c.dataset.deck)).toEqual([
      'front',
      'peek',
      'peek',
    ]);
    const z = cards().map((c) => Number(c.style.zIndex));
    expect(z[0]).toBeGreaterThan(z[1]!);
    expect(z[1]).toBeGreaterThan(z[2]!);
  });

  it('dims each card further back, and insets it', () => {
    const ref = setup();
    act(() => {
      ref.api.show({ kind: 'info', title: 'First', timeout: 0 });
    });
    act(() => {
      ref.api.show({ kind: 'info', title: 'Second', timeout: 0 });
    });
    const [front, behind] = cards();
    expect(front!.style.getPropertyValue('--deck-dim')).toBe('0%');
    expect(behind!.style.getPropertyValue('--deck-dim')).toBe('40%');
    expect(behind!.style.getPropertyValue('--deck-inset')).toBe('6px');
  });

  it('keeps the newest `cap` cards: one more pushes the oldest out', async () => {
    const ref = setup({ cap: 2 });
    for (const t of ['A', 'B', 'C']) {
      act(() => {
        ref.api.show({ kind: 'info', title: t, timeout: 0 });
      });
    }
    await waitFor(() => expect(titles()).toEqual(['C', 'B']));
  });

  it('never pushes out an error or an action to make room: the cap takes one that can wait', async () => {
    const ref = setup({ cap: 2 });
    act(() => {
      ref.api.show({ kind: 'error', title: 'Failed', timeout: 0 });
    });
    for (const t of ['B', 'C']) {
      act(() => {
        ref.api.show({ kind: 'info', title: t, timeout: 0 });
      });
    }
    await waitFor(() => expect(titles()).toEqual(['C', 'Failed']));
  });

  it('a toast shown with an id already showing updates it in place', () => {
    const ref = setup();
    act(() => {
      ref.api.show({
        id: 'upload',
        kind: 'info',
        title: 'Uploading',
        timeout: 0,
      });
    });
    act(() => {
      ref.api.show({
        id: 'upload',
        kind: 'success',
        title: 'Uploaded',
        timeout: 0,
      });
    });
    expect(cards()).toHaveLength(1);
    expect(titles()).toEqual(['Uploaded']);
  });

  it('a toast shown with a group merges into the one showing, counting it', () => {
    const ref = setup();
    act(() => {
      ref.api.show({
        group: 'mail',
        kind: 'info',
        title: 'New mail',
        timeout: 0,
      });
    });
    act(() => {
      ref.api.show({
        group: 'mail',
        kind: 'info',
        title: 'New mail',
        timeout: 0,
      });
    });
    expect(cards()).toHaveLength(1);
    expect(cards()[0]).toHaveTextContent('2');
  });
});

describe('ToastStack dismiss', () => {
  const close = (card: HTMLElement) =>
    card.querySelector<HTMLButtonElement>('.fb-n__close button')!;

  it('closes a toast with its close button, and the others stay', async () => {
    const ref = setup();
    act(() => {
      ref.api.show({ kind: 'info', title: 'First', timeout: 0 });
    });
    act(() => {
      ref.api.show({ kind: 'info', title: 'Second', timeout: 0 });
    });
    fireEvent.click(close(cards()[0]!));
    await waitFor(() => expect(titles()).toEqual(['First']));
  });

  it('closes a toast through the API, by id', async () => {
    const ref = setup();
    let id = '';
    act(() => {
      id = ref.api.show({ kind: 'info', title: 'Saved', timeout: 0 });
    });
    act(() => ref.api.close(id));
    await waitFor(() => expect(cards()).toHaveLength(0));
    expect(screen.queryByRole('region', { name: 'Notifications' })).toBeNull();
  });

  it('a toast the person closes is not counted as missed', async () => {
    const onMissed = vi.fn();
    const ref = setup({ onMissed });
    act(() => {
      ref.api.show({ kind: 'info', title: 'Saved', timeout: 0 });
    });
    fireEvent.click(close(cards()[0]!));
    await waitFor(() => expect(cards()).toHaveLength(0));
    expect(onMissed).not.toHaveBeenCalled();
  });

  it('a toast that times out is counted as missed, with its id and count', async () => {
    const onMissed = vi.fn();
    const ref = setup({ onMissed });
    act(() => {
      ref.api.show({ id: 'quick', kind: 'info', title: 'Quick', timeout: 60 });
    });
    await waitFor(() => expect(onMissed).toHaveBeenCalledTimes(1));
    expect(onMissed).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'quick', title: 'Quick', count: 1 })
    );
    await waitFor(() => expect(cards()).toHaveLength(0));
  });

  it('a toast pushed past the cap is counted as missed', async () => {
    const onMissed = vi.fn();
    const ref = setup({ cap: 1, onMissed });
    act(() => {
      ref.api.show({ id: 'old', kind: 'info', title: 'Old', timeout: 0 });
    });
    act(() => {
      ref.api.show({ id: 'new', kind: 'info', title: 'New', timeout: 0 });
    });
    await waitFor(() => expect(onMissed).toHaveBeenCalledTimes(1));
    expect(onMissed).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'old' })
    );
  });

  it('closing the focused toast hands focus to the next card', async () => {
    const ref = setup();
    act(() => {
      ref.api.show({ id: 'a', kind: 'info', title: 'First', timeout: 0 });
    });
    act(() => {
      ref.api.show({ id: 'b', kind: 'info', title: 'Second', timeout: 0 });
    });
    // Focus in the stack opens the deck, and the card behind is then reachable.
    const front = close(cards()[0]!);
    act(() => front.focus());
    fireEvent.click(front);
    await waitFor(() => expect(titles()).toEqual(['First']));
    await waitFor(() =>
      expect(cards()[0]!.contains(document.activeElement)).toBe(true)
    );
  });

  it('closing the last focused toast gives focus back to where it came from', async () => {
    function Page() {
      return <button>Page control</button>;
    }
    const ref: { api: Toasts } = { api: null as never };
    function Grab() {
      ref.api = useToasts();
      return null;
    }
    render(
      <ToastStack>
        <Grab />
        <Page />
      </ToastStack>
    );
    const control = screen.getByText('Page control');
    control.focus();
    act(() => {
      ref.api.show({ kind: 'info', title: 'Saved', timeout: 0 });
    });
    const x = cards()[0]!.querySelector<HTMLButtonElement>(
      '.fb-n__close button'
    )!;
    act(() => x.focus());
    fireEvent.click(x);
    await waitFor(() => expect(cards()).toHaveLength(0));
    expect(control).toHaveFocus();
  });
});

describe('ToastStack announcements', () => {
  it('reads a toast once, in the polite region, title then subtitle', async () => {
    const ref = setup();
    act(() => {
      ref.api.show({
        kind: 'success',
        title: 'Saved',
        subtitle: 'All changes',
        timeout: 0,
      });
    });
    await waitFor(() =>
      expect(polite().textContent).toBe('Saved. All changes')
    );
    expect(assertive().textContent).toBe('');
  });

  it('reads an `alert` toast in the assertive region', async () => {
    const ref = setup();
    act(() => {
      ref.api.show({
        kind: 'error',
        title: 'Failed',
        role: 'alert',
        timeout: 0,
      });
    });
    await waitFor(() => expect(assertive().textContent).toBe('Failed'));
    expect(polite().textContent).toBe('');
  });

  it('reads toasts shown together as one announcement', async () => {
    const ref = setup();
    act(() => {
      ref.api.show({ kind: 'info', title: 'One', timeout: 0 });
      ref.api.show({ kind: 'info', title: 'Two', timeout: 0 });
    });
    await waitFor(() => expect(polite().textContent).toBe('One Two'));
  });

  it('says nothing for an update that says the same thing', async () => {
    const ref = setup();
    act(() => {
      ref.api.show({ id: 'x', kind: 'info', title: 'Syncing', timeout: 0 });
    });
    await waitFor(() => expect(polite().textContent).toBe('Syncing'));
    // Emptied and refilled only on a change: spy on the node's text.
    const node = polite();
    const writes = vi.spyOn(node, 'textContent', 'set');
    act(() => {
      ref.api.show({ id: 'x', kind: 'info', title: 'Syncing', timeout: 0 });
    });
    await new Promise((r) => setTimeout(r, 300));
    expect(writes).not.toHaveBeenCalled();
  });

  it('reads an update by id when its words change', async () => {
    const ref = setup();
    act(() => {
      ref.api.show({ id: 'x', kind: 'info', title: 'Syncing', timeout: 0 });
    });
    await waitFor(() => expect(polite().textContent).toBe('Syncing'));
    act(() => {
      ref.api.show({ id: 'x', kind: 'success', title: 'Synced', timeout: 0 });
    });
    await waitFor(() => expect(polite().textContent).toBe('Synced'));
  });
});
