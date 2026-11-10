/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Add } from '@carbon/icons-react';
import {
  ChatPanels,
  ChatPanelToggles,
  ChatPanelArea,
  type ChatPanelsProps,
  type ChatPanelAreaProps,
} from '../components/ChatPanels';

const setup = (
  props: Partial<ChatPanelsProps> = {},
  area: Partial<ChatPanelAreaProps> = {}
) =>
  render(
    <ChatPanels {...props}>
      <ChatPanelToggles />
      <ChatPanelArea {...area}>
        <p>The conversation</p>
      </ChatPanelArea>
    </ChatPanels>
  );

const toggle = (name: string) => screen.getByRole('button', { name });

describe('ChatPanels', () => {
  it('shows the shell’s five toggles, in the header’s order', () => {
    setup();
    const order = ['Knowledge', 'Code', 'Files', 'Settings', 'Canvas'].map(
      toggle
    );
    order.slice(1).forEach((button, i) => {
      expect(
        order[i].compareDocumentPosition(button) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });
  });

  it('starts closed, every toggle saying so', () => {
    setup();
    for (const name of ['Knowledge', 'Canvas']) {
      expect(toggle(name)).toHaveAttribute('aria-expanded', 'false');
    }
    expect(screen.queryByRole('region')).toBeNull();
  });

  // A toggle names the panel it controls, so a screen reader can move to it.
  it('points each toggle at its own panel', async () => {
    setup();
    await userEvent.click(toggle('Code'));
    const region = screen.getByRole('region', { name: 'Code' });
    expect(toggle('Code').getAttribute('aria-controls')).toBe(region.id);
    expect(toggle('Files').getAttribute('aria-controls')).not.toBe(region.id);
  });

  it('opens one panel at a time, and its own toggle closes it', async () => {
    setup();
    await userEvent.click(toggle('Code'));
    expect(toggle('Code')).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(toggle('Files'));
    expect(toggle('Code')).toHaveAttribute('aria-expanded', 'false');
    expect(toggle('Files')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('region')).toHaveLength(1);
    await userEvent.click(toggle('Files'));
    expect(toggle('Files')).toHaveAttribute('aria-expanded', 'false');
  });

  // aria-pressed would announce the control as a switch as well as a
  // disclosure; it says one thing.
  it('never sets aria-pressed on a toggle', async () => {
    setup();
    await userEvent.click(toggle('Canvas'));
    expect(toggle('Canvas')).not.toHaveAttribute('aria-pressed');
  });

  it('shows a placeholder until a panel is given content', async () => {
    setup({}, { panelContent: { code: <p>Generated code</p> } });
    await userEvent.click(toggle('Settings'));
    expect(
      screen.getByText('Settings is not designed yet.')
    ).toBeInTheDocument();
    await userEvent.click(toggle('Code'));
    expect(screen.getByText('Generated code')).toBeInTheDocument();
  });

  it('closes from the panel’s own close button and returns focus', async () => {
    setup();
    await userEvent.click(toggle('Files'));
    await userEvent.click(screen.getByRole('button', { name: 'Close files' }));
    expect(toggle('Files')).toHaveAttribute('aria-expanded', 'false');
    expect(toggle('Files')).toHaveFocus();
  });

  it('reports what opened and what closed', async () => {
    const onOpenChange = jest.fn();
    setup({ onOpenChange });
    await userEvent.click(toggle('Knowledge'));
    await userEvent.click(toggle('Knowledge'));
    expect(onOpenChange.mock.calls).toEqual([['knowledge'], [null]]);
  });

  it('takes a panel defined in full', async () => {
    setup({ panels: ['code', { id: 'tasks', label: 'Tasks', icon: Add }] });
    await userEvent.click(toggle('Tasks'));
    expect(screen.getByRole('region', { name: 'Tasks' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Canvas' })).toBeNull();
  });

  describe('presentation', () => {
    it('leaves a pushed panel open on Escape', async () => {
      setup({ defaultOpenId: 'code' }, { presentation: 'push' });
      screen.getByRole('button', { name: 'Close code' }).focus();
      await userEvent.keyboard('{Escape}');
      expect(toggle('Code')).toHaveAttribute('aria-expanded', 'true');
    });

    // From the panel's content. On the close button the first Escape is its
    // tooltip's, as Carbon's Tooltip takes it.
    it('closes an overlay on Escape and returns focus to its toggle', async () => {
      setup(
        { defaultOpenId: 'code' },
        {
          presentation: 'overlay',
          panelContent: { code: <button type="button">Copy</button> },
        }
      );
      screen.getByRole('button', { name: 'Copy' }).focus();
      await userEvent.keyboard('{Escape}');
      expect(toggle('Code')).toHaveAttribute('aria-expanded', 'false');
      expect(toggle('Code')).toHaveFocus();
    });

    it('closes an overlay on a press outside it', async () => {
      setup({ defaultOpenId: 'files' }, { presentation: 'overlay' });
      await userEvent.click(screen.getByText('The conversation'));
      expect(toggle('Files')).toHaveAttribute('aria-expanded', 'false');
    });

    it('presents a push as an overlay below the md breakpoint', () => {
      const matchMedia = window.matchMedia;
      window.matchMedia = ((query: string) => ({
        matches: true,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      })) as unknown as typeof window.matchMedia;
      const { container } = setup({}, { presentation: 'push' });
      expect(container.querySelector('.cds--chat-panel-area')).toHaveClass(
        'cds--chat-panel-area--overlay'
      );
      window.matchMedia = matchMedia;
    });
  });

  it('refuses a toggle row outside ChatPanels', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ChatPanelToggles />)).toThrow(
      'ChatPanelToggles must be inside ChatPanels'
    );
    (console.error as jest.Mock).mockRestore();
  });

  it('forwards a ref to the area’s root', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <ChatPanels>
        <ChatPanelArea ref={ref} />
      </ChatPanels>
    );
    expect(ref.current).toHaveClass('cds--chat-panel-area');
  });
});
