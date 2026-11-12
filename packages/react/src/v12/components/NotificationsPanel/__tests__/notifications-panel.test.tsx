/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useRef } from 'react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { press, setReducedMotion } from '../../../vitest.dom';
import {
  NotificationsPanel,
  type NotificationsPanelData,
  type NotificationsPanelProps,
} from '../index';

setReducedMotion(true);

// One fixed noon, so "today" and "yesterday" never straddle a midnight.
beforeAll(() => {
  vi.setSystemTime(new Date(2026, 5, 15, 12, 0));
});
afterAll(() => {
  vi.useRealTimers();
});

const BUILD: NotificationsPanelData = {
  id: 'build',
  type: 'error',
  title: 'Build failed',
  description: 'The pipeline stopped at the test stage.',
  timestamp: new Date(2026, 5, 15, 11, 55),
};
const BACKUP: NotificationsPanelData = {
  id: 'backup',
  type: 'success',
  title: 'Backup complete',
  timestamp: new Date(2026, 5, 14, 9, 30),
};
const QUOTA: NotificationsPanelData = {
  id: 'quota',
  type: 'warning',
  title: 'Quota at 90%',
  timestamp: new Date(2026, 5, 5, 9, 30),
};
const DATA = [BUILD, BACKUP, QUOTA];

/** An open panel on its trigger, beside a control that is neither. */
function Page(props: Partial<NotificationsPanelProps>) {
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button type="button" ref={trigger}>
        Open notifications
      </button>
      <button type="button">Elsewhere</button>
      <NotificationsPanel
        open
        data={DATA}
        triggerButtonRef={trigger}
        {...props}
      />
    </>
  );
}

const panel = (name = 'Notifications') => screen.getByRole('dialog', { name });
const button = (name: string) => screen.getByRole('button', { name });

describe('NotificationsPanel: the panel', () => {
  it('is a dialog named by its title while open, and takes focus as it opens', async () => {
    const { rerender } = render(<Page open={false} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByText('Build failed')).toBeNull();

    rerender(<Page />);
    expect(
      within(panel()).getByRole('heading', { name: 'Notifications' })
    ).toBeInTheDocument();
    await waitFor(() => expect(panel()).toHaveFocus());

    rerender(<Page title="Alerts" />);
    expect(
      within(panel('Alerts')).getByRole('heading', { name: 'Alerts' })
    ).toBeInTheDocument();
  });

  it('files each notification under Today, Yesterday or Previous', () => {
    render(<Page />);
    const group = (name: string) =>
      within(screen.getByRole('region', { name }));
    expect(group('Today').getByText('Build failed')).toBeInTheDocument();
    expect(group('Today').getByText('5 minutes ago')).toBeInTheDocument();
    expect(group('Today').queryByText('Backup complete')).toBeNull();
    expect(group('Yesterday').getByText('Backup complete')).toBeInTheDocument();
    expect(group('Previous').getByText('Quota at 90%')).toBeInTheDocument();
    expect(group('Previous').getByText('10 days ago')).toBeInTheDocument();
  });

  it('shows the empty state’s text, and no "Dismiss all", with nothing to list', () => {
    const { rerender } = render(
      <Page data={[]} onDismissAllNotifications={() => {}} />
    );
    expect(
      within(panel()).getByText('You do not have any notifications')
    ).toBeInTheDocument();
    expect(screen.queryByRole('region')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Dismiss all' })).toBeNull();

    rerender(<Page data={[]} emptyStateLabel="All caught up" />);
    expect(within(panel()).getByText('All caught up')).toBeInTheDocument();
  });
});

describe('NotificationsPanel: dismissing', () => {
  it('names each row’s dismiss button with the row’s title', () => {
    render(<Page />);
    for (const n of DATA) {
      expect(button(`Dismiss ${n.title}`)).toBeInTheDocument();
    }
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();
  });

  it('uses the plain label for a row with no title, and the caller’s label', () => {
    render(
      <Page
        data={[{ ...BUILD, title: '' }, BACKUP]}
        dismissSingleNotificationIconDescription="Remove"
      />
    );
    expect(button('Remove')).toBeInTheDocument();
    expect(button('Remove Backup complete')).toBeInTheDocument();
  });

  it('hands the handler the notification of the row dismissed, and no row click', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    const onRow = vi.fn();
    render(
      <Page
        data={DATA.map((n) => ({ ...n, onNotificationClick: onRow }))}
        onDismissSingleNotification={onDismiss}
      />
    );
    await user.click(button('Dismiss Backup complete'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'backup', title: 'Backup complete' })
    );
    expect(onRow).not.toHaveBeenCalled();
  });

  it('moves focus to the next row’s dismiss button, or the one before the last', async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(button('Dismiss Build failed'));
    expect(button('Dismiss Backup complete')).toHaveFocus();

    await user.click(button('Dismiss Quota at 90%'));
    expect(button('Dismiss Backup complete')).toHaveFocus();
  });

  it('calls "Dismiss all"’s handler and puts focus on the panel', async () => {
    const user = userEvent.setup();
    const onDismissAll = vi.fn();
    const { rerender } = render(<Page />);
    expect(screen.queryByRole('button', { name: 'Dismiss all' })).toBeNull();

    rerender(<Page onDismissAllNotifications={onDismissAll} />);
    await user.click(button('Dismiss all'));
    expect(onDismissAll).toHaveBeenCalledTimes(1);
    expect(panel()).toHaveFocus();
  });
});

describe('NotificationsPanel: a row that is a control', () => {
  it('has its title as a button that hands the handler its notification', async () => {
    const user = userEvent.setup();
    const onRow = vi.fn();
    render(<Page data={[{ ...BUILD, onNotificationClick: onRow }, BACKUP]} />);
    expect(
      screen.queryByRole('button', { name: 'Backup complete' })
    ).toBeNull();
    await user.click(button('Build failed'));
    expect(onRow).toHaveBeenCalledTimes(1);
    expect(onRow).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'build' })
    );
  });
});

describe('NotificationsPanel: closing', () => {
  it('asks to close on Escape with focus inside, and returns focus to its trigger', async () => {
    const user = userEvent.setup();
    const onClickOutside = vi.fn();
    render(<Page onClickOutside={onClickOutside} />);
    act(() => button('Dismiss Build failed').focus());
    await user.keyboard('{Escape}');
    expect(onClickOutside).toHaveBeenCalledTimes(1);
    expect(button('Open notifications')).toHaveFocus();
  });

  it('leaves Escape alone with focus on a control outside it', async () => {
    const user = userEvent.setup();
    const onClickOutside = vi.fn();
    render(<Page onClickOutside={onClickOutside} />);
    act(() => button('Elsewhere').focus());
    await user.keyboard('{Escape}');
    expect(onClickOutside).not.toHaveBeenCalled();
    expect(button('Elsewhere')).toHaveFocus();
  });

  it('asks to close on a press outside, not on one inside or on its trigger', () => {
    const onClickOutside = vi.fn();
    render(<Page onClickOutside={onClickOutside} />);
    press(screen.getByText('Build failed'));
    press(button('Open notifications'));
    expect(onClickOutside).not.toHaveBeenCalled();
    press(button('Elsewhere'));
    expect(onClickOutside).toHaveBeenCalledTimes(1);
  });
});
