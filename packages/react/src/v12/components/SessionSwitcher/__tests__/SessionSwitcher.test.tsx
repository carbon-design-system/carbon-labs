/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionSwitcher } from '../components/SessionSwitcher';

const sessions = [
  { id: 'invoice', label: 'Invoice reconciliation' },
  { id: 'vendor', label: 'Vendor consolidation' },
  { id: 'q3', label: 'Q3 close checklist' },
];

const open = async () =>
  userEvent.click(
    screen.getByRole('button', { name: /Invoice reconciliation/ })
  );

describe('SessionSwitcher', () => {
  it('names the current session on the trigger', () => {
    render(<SessionSwitcher sessions={sessions} currentId="invoice" />);
    expect(
      screen.getByRole('button', { name: /Invoice reconciliation/ })
    ).toHaveAttribute('aria-haspopup', 'menu');
  });

  // Trailing is MegaButton's default and it marks only the leading case with a
  // class, so this asserts the rendered order rather than a class name: the
  // chevron is inside the trigger and follows the label.
  it('carries the chevron inside the trigger, after the label', () => {
    const { container } = render(
      <SessionSwitcher sessions={sessions} currentId="invoice" />
    );
    const trigger = container.querySelector('.cds--session-switcher__trigger');
    expect(trigger).not.toHaveClass('cds--mega-button--icon-leading');
    const icon = trigger?.querySelector('svg');
    expect(icon).not.toBeNull();
    const label = screen.getByText('Invoice reconciliation');
    expect(
      label.compareDocumentPosition(icon as Node) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('opens on click and closes on Escape, returning focus', async () => {
    render(<SessionSwitcher sessions={sessions} currentId="invoice" />);
    const trigger = screen.getByRole('button', {
      name: /Invoice reconciliation/,
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await open();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  // The whole reason the sessions are a radio group: exactly one is current, so
  // the row that matches is marked selected rather than merely looking active
  // as the pointer passes over it.
  it('marks the current session selected, not merely active', async () => {
    render(<SessionSwitcher sessions={sessions} currentId="invoice" />);
    await open();
    const rows = screen.getAllByRole('menuitemradio');
    expect(rows).toHaveLength(3);
    expect(
      rows.find((r) => r.textContent?.includes('Invoice reconciliation'))
    ).toHaveAttribute('aria-checked', 'true');
    expect(
      rows.find((r) => r.textContent?.includes('Vendor consolidation'))
    ).toHaveAttribute('aria-checked', 'false');
  });

  it('reports the chosen session', async () => {
    const onSelect = jest.fn();
    render(
      <SessionSwitcher
        sessions={sessions}
        currentId="invoice"
        onSelect={onSelect}
      />
    );
    await open();
    await userEvent.click(
      screen.getByRole('menuitemradio', { name: /Vendor consolidation/ })
    );
    expect(onSelect).toHaveBeenCalledWith('vendor');
  });

  it('keeps the action apart from the sessions', async () => {
    const onClick = jest.fn();
    render(
      <SessionSwitcher
        sessions={sessions}
        currentId="invoice"
        action={{ label: 'New conversation', onClick }}
      />
    );
    await open();
    const action = screen.getByRole('menuitem', { name: 'New conversation' });
    expect(action).not.toHaveAttribute('aria-checked');
    await userEvent.click(action);
    expect(onClick).toHaveBeenCalled();
  });

  it('applies the cds prefix and a custom class name', () => {
    const { container } = render(
      <SessionSwitcher
        sessions={sessions}
        currentId="invoice"
        className="custom-class"
      />
    );
    expect(container.firstChild).toHaveClass('cds--session-switcher');
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('forwards a ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <SessionSwitcher ref={ref} sessions={sessions} currentId="invoice" />
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
