/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatsPanel } from '../components/ChatsPanel';

const sections = [
  {
    label: 'Pinned',
    items: [
      { id: 'invoice', label: 'Invoice reconciliation' },
      { id: 'vendor', label: 'Vendor consolidation' },
    ],
  },
  {
    label: 'Today',
    items: [{ id: 'q3', label: 'Q3 close checklist' }],
  },
];

const open = () =>
  userEvent.click(screen.getByRole('button', { name: 'Chats' }));

describe('ChatsPanel', () => {
  it('renders its children', () => {
    render(<ChatsPanel sections={sections}>Hello</ChatsPanel>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('starts closed, and the trigger says so', () => {
    const { container } = render(
      <ChatsPanel sections={sections}>Hello</ChatsPanel>
    );
    expect(screen.getByRole('button', { name: 'Chats' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    // `hidden` would be display:none, which cannot transition, so a closed
    // panel is marked with Carbon's surface state and made inert instead —
    // out of the tab order and the accessibility tree, still in the box.
    const panel = container.querySelector('.cds--chats-panel__panel');
    expect(panel).toHaveAttribute('data-carbon-surface-state', 'exit');
    expect(panel).toHaveAttribute('inert');
  });

  it('opens and closes from the same control', async () => {
    const { container } = render(
      <ChatsPanel sections={sections}>Hello</ChatsPanel>
    );
    const trigger = screen.getByRole('button', { name: 'Chats' });
    await open();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const panel = container.querySelector('.cds--chats-panel__panel');
    expect(panel).toHaveAttribute('data-carbon-surface-state', 'enter');
    expect(panel).not.toHaveAttribute('inert');
    await open();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  // The trigger names the panel it controls, which is what lets a screen
  // reader move to it rather than hunt for what just appeared.
  it('points the trigger at the panel it controls', () => {
    const { container } = render(
      <ChatsPanel sections={sections}>Hello</ChatsPanel>
    );
    const trigger = screen.getByRole('button', { name: 'Chats' });
    const panel = container.querySelector('.cds--chats-panel__panel');
    expect(trigger.getAttribute('aria-controls')).toBe(panel?.id);
  });

  it('groups the chats under their section titles', async () => {
    render(<ChatsPanel sections={sections}>Hello</ChatsPanel>);
    await open();
    expect(screen.getByRole('heading', { name: 'Pinned' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('leaves out a section with no chats', async () => {
    render(
      <ChatsPanel sections={[...sections, { label: 'Archived', items: [] }]}>
        Hello
      </ChatsPanel>
    );
    await open();
    expect(screen.queryByRole('heading', { name: 'Archived' })).toBeNull();
  });

  it('marks the current chat with aria-current', async () => {
    render(
      <ChatsPanel sections={sections} currentId="vendor">
        Hello
      </ChatsPanel>
    );
    await open();
    const current = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('aria-current'));
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent('Vendor consolidation');
  });

  it('reports the chosen chat', async () => {
    const onSelect = jest.fn();
    render(
      <ChatsPanel sections={sections} onSelect={onSelect}>
        Hello
      </ChatsPanel>
    );
    await open();
    await userEvent.click(
      screen.getByRole('link', { name: 'Q3 close checklist' })
    );
    expect(onSelect).toHaveBeenCalledWith('q3');
  });

  it('links a chat that carries a route', async () => {
    render(
      <ChatsPanel
        sections={[
          { label: 'Pinned', items: [{ id: 'a', label: 'A', href: '/c/a' }] },
        ]}>
        Hello
      </ChatsPanel>
    );
    await open();
    expect(screen.getByRole('link', { name: 'A' })).toHaveAttribute(
      'href',
      '/c/a'
    );
  });

  // The two presentations differ in one thing — whether the panel takes space
  // from the content or lies over it — and the scrim is how that reads.
  describe('presentation', () => {
    it('push keeps the content in place and dims nothing', async () => {
      const { container } = render(
        <ChatsPanel sections={sections} presentation="push">
          Hello
        </ChatsPanel>
      );
      await open();
      expect(container.querySelector('.cds--chats-panel')).toHaveClass(
        'cds--chats-panel--push'
      );
      expect(container.querySelector('.cds--chats-panel__scrim')).toBeNull();
    });

    it('overlay closes on a press outside it', async () => {
      // No scrim: this system separates a floating panel with a border and a
      // shadow, not by dimming part of a surface. The
      // dismiss stays.
      const { container } = render(
        <ChatsPanel sections={sections} presentation="overlay">
          Hello
        </ChatsPanel>
      );
      await open();
      expect(container.querySelector('.cds--chats-panel__scrim')).toBeNull();
      await userEvent.click(screen.getByText('Hello'));
      expect(screen.getByRole('button', { name: 'Chats' })).toHaveAttribute(
        'aria-expanded',
        'false'
      );
    });

    // A pushed panel has given the content its own column, so choosing a chat
    // does not have to dismiss it; an overlay is borrowing the space and gives
    // it back as soon as the choice is made.
    it('stays open after a choice when pushed, and closes when overlaid', async () => {
      const { rerender } = render(
        <ChatsPanel sections={sections} presentation="push">
          Hello
        </ChatsPanel>
      );
      await open();
      await userEvent.click(
        screen.getByRole('link', { name: 'Q3 close checklist' })
      );
      expect(screen.getByRole('button', { name: 'Chats' })).toHaveAttribute(
        'aria-expanded',
        'true'
      );

      rerender(
        <ChatsPanel sections={sections} presentation="overlay">
          Hello
        </ChatsPanel>
      );
      await userEvent.click(
        screen.getByRole('link', { name: 'Q3 close checklist' })
      );
      expect(screen.getByRole('button', { name: 'Chats' })).toHaveAttribute(
        'aria-expanded',
        'false'
      );
    });
  });

  // A keyboard user has to be able to leave an overlay, and land somewhere
  // when it goes: inert under a focused row would drop focus to <body>.
  describe('keyboard', () => {
    it('closes an overlay on Escape and returns focus to the trigger', async () => {
      render(
        <ChatsPanel sections={sections} presentation="overlay">
          Hello
        </ChatsPanel>
      );
      await open();
      screen.getByRole('link', { name: 'Q3 close checklist' }).focus();
      await userEvent.keyboard('{Escape}');
      const trigger = screen.getByRole('button', { name: 'Chats' });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveFocus();
    });

    it('returns focus to the trigger after a choice in an overlay', async () => {
      render(
        <ChatsPanel sections={sections} presentation="overlay">
          Hello
        </ChatsPanel>
      );
      await open();
      await userEvent.click(
        screen.getByRole('link', { name: 'Q3 close checklist' })
      );
      expect(screen.getByRole('button', { name: 'Chats' })).toHaveFocus();
    });

    it('leaves a pushed column open on Escape', async () => {
      render(
        <ChatsPanel sections={sections} presentation="push">
          Hello
        </ChatsPanel>
      );
      await open();
      await userEvent.keyboard('{Escape}');
      expect(screen.getByRole('button', { name: 'Chats' })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
    });

    it('closes on Escape from a control beside the trigger in the bar', async () => {
      render(
        <ChatsPanel
          sections={sections}
          presentation="overlay"
          bar={<button type="button">Switch conversation</button>}>
          Hello
        </ChatsPanel>
      );
      await open();
      screen.getByRole('button', { name: 'Switch conversation' }).focus();
      await userEvent.keyboard('{Escape}');
      expect(screen.getByRole('button', { name: 'Chats' })).toHaveAttribute(
        'aria-expanded',
        'false'
      );
    });

    // A menu in the bar renders in a portal, so its Escape bubbles here
    // through React without coming from inside this element.
    it('leaves an Escape from a portalled menu to the menu', async () => {
      render(
        <ChatsPanel
          sections={sections}
          presentation="overlay"
          bar={createPortal(
            <input aria-label="Menu in a portal" />,
            document.body
          )}>
          Hello
        </ChatsPanel>
      );
      await open();
      screen.getByRole('textbox', { name: 'Menu in a portal' }).focus();
      await userEvent.keyboard('{Escape}');
      expect(screen.getByRole('button', { name: 'Chats' })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
    });
  });

  // Below md there is no room for a column, so a push lies over the content.
  describe('narrow', () => {
    const matchMedia = window.matchMedia;
    afterEach(() => {
      window.matchMedia = matchMedia;
    });

    it('presents a push as an overlay below the md breakpoint', async () => {
      window.matchMedia = ((query: string) => ({
        matches: true,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      })) as unknown as typeof window.matchMedia;
      const { container } = render(
        <ChatsPanel sections={sections} presentation="push">
          Hello
        </ChatsPanel>
      );
      const root = container.querySelector('.cds--chats-panel');
      expect(root).toHaveClass('cds--chats-panel--overlay');
      expect(root).not.toHaveClass('cds--chats-panel--push');
      await open();
      await userEvent.keyboard('{Escape}');
      expect(screen.getByRole('button', { name: 'Chats' })).toHaveAttribute(
        'aria-expanded',
        'false'
      );
    });
  });

  it('renders whatever else the bar carries beside the trigger', () => {
    const { container } = render(
      <ChatsPanel sections={sections} bar={<span>Invoice reconciliation</span>}>
        Hello
      </ChatsPanel>
    );
    const bar = container.querySelector('.cds--chats-panel__bar');
    expect(bar).toHaveTextContent('Invoice reconciliation');
    expect(bar?.querySelector('.cds--chats-panel__trigger')).not.toBeNull();
  });

  // A card's header carries the side panels' toggles at its far end.
  it('renders what goes at the bar’s end after everything else', () => {
    const { container } = render(
      <ChatsPanel
        sections={sections}
        presentation="overlay"
        bar={<span>Session</span>}
        barEnd={<span>Toggles</span>}>
        Hello
      </ChatsPanel>
    );
    const bar = container.querySelector('.cds--chats-panel__bar');
    expect(bar?.lastElementChild).toHaveClass('cds--chats-panel__bar-end');
    expect(bar?.lastElementChild).toHaveTextContent('Toggles');
    expect(container.firstChild).toHaveClass('cds--chats-panel--in-card');
  });

  it('applies the cds prefix and a custom class name', () => {
    const { container } = render(
      <ChatsPanel sections={sections} className="custom-class">
        Hello
      </ChatsPanel>
    );
    expect(container.firstChild).toHaveClass('cds--chats-panel');
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('forwards a ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <ChatsPanel ref={ref} sections={sections}>
        Hello
      </ChatsPanel>
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('spreads additional props onto the root element', () => {
    render(
      <ChatsPanel sections={sections} data-testid="root">
        Hello
      </ChatsPanel>
    );
    expect(screen.getByTestId('root')).toHaveTextContent('Hello');
  });
});
