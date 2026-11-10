/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import { Checkbox } from '@carbon-labs/react-checkbox';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { IconButton } from '@carbon-labs/react-tooltip';
import { NotificationsBell, NotificationsPanel } from '../index';
import type {
  NotificationsBellProps,
  NotificationsPanelData,
  NotificationsPanelProps,
  NotificationsPanelType,
} from '../index';
import mdx from './NotificationsPanel.mdx';

const ALIGNMENTS: NonNullable<NotificationsPanelProps['align']>[] = [
  'top',
  'top-start',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-end',
];

const BELL_SIZES: NonNullable<NotificationsBellProps['size']>[] = [
  16, 20, 24, 32,
];

export default {
  title: 'V12/NotificationsPanel',
  component: NotificationsPanel,
  subcomponents: { NotificationsBell },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'snap-floating',
        'collapse',
        'layout-transaction',
        'stagger',
        'toggle-icons',
        'rolltext',
        'rollover',
      ],
      reduced: {
        'layout-transaction': 'at-once',
        stagger: 'shorter-clock',
        'toggle-icons': 'at-once',
        rolltext: 'at-once',
      },
      states: ['closed', 'open'],
    },
  },
  argTypes: {
    align: { control: 'select', options: ALIGNMENTS },
    shadow: { control: 'boolean' },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    open: { control: false },
    data: { control: false },
    triggerButtonRef: { control: false },
  },
};

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** A notification `ago` ms before now. */
function note(
  id: string,
  type: NotificationsPanelType,
  title: string,
  description: string,
  ago: number,
  extra: Partial<NotificationsPanelData> = {}
): NotificationsPanelData {
  return {
    id,
    type,
    title,
    description,
    timestamp: new Date(Date.now() - ago),
    unread: true,
    ...extra,
  };
}

function sample(): NotificationsPanelData[] {
  return [
    note(
      'build',
      'success',
      'Build finished',
      'The nightly build passed every check.',
      2 * MINUTE
    ),
    note(
      'storage',
      'warning',
      'Storage almost full',
      'The shared folder is at 92% of its quota. Older versions will be removed first when it is full, starting with drafts that have not been opened in the last 90 days. Free up space or ask for a larger quota.',
      40 * MINUTE,
      { link: { text: 'Manage storage', url: '#' } }
    ),
    note(
      'export',
      'error',
      'Export failed',
      'The report could not be exported. Try again.',
      3 * HOUR,
      { unread: false }
    ),
    note(
      'comment',
      'informational',
      'New comment',
      'A reply was posted on the design review.',
      DAY + HOUR,
      { unread: false }
    ),
    note(
      'invite',
      'informational',
      'Workspace invitation',
      'You were added to the Field Research workspace.',
      4 * DAY,
      { unread: false }
    ),
  ];
}

const ARRIVALS: [NotificationsPanelType, string, string][] = [
  ['informational', 'New comment', 'A reply was posted on your draft.'],
  ['success', 'Deploy complete', 'The preview is live.'],
  ['warning', 'Certificate expires soon', 'Renew it within 14 days.'],
  ['error', 'Sync failed', 'Check your connection and try again.'],
];

let arrivals = 0;

function arrival(): NotificationsPanelData {
  const [type, title, description] =
    ARRIVALS[arrivals % ARRIVALS.length] ?? ARRIVALS[0];
  arrivals++;
  return note(`arrival-${arrivals}`, type, title, description, 0);
}

/** Room below the header, so the panel never clips. */
const stage = {
  display: 'grid',
  gap: 16,
  alignContent: 'start',
  minBlockSize: 680,
};

const header = {
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: 8,
  blockSize: 48,
  paddingInline: 16,
  borderBlockEnd: '1px solid var(--cds-border-subtle-01)',
};

const row = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

/** The host: it owns `open`, the data and Do not disturb, and passes them to the bell and the panel. */
function usePanelHost(initial: () => NotificationsPanelData[]) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationsPanelData[]>(initial);
  const [dnd, setDnd] = useState(false);
  const trigger = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  // Clicking a row reads it.
  const rows = useMemo(() => {
    const read = (n: NotificationsPanelData) =>
      setData((d) =>
        d.map((x) => (x.id === n.id ? { ...x, unread: false } : x))
      );
    return data.map((n) => ({ ...n, onNotificationClick: read }));
  }, [data]);
  const add = () => setData((d) => [arrival(), ...d]);
  const unread = data.filter((n) => n.unread).length;
  const trig = (
    <IconButton
      ref={trigger}
      frame="ghost"
      align="bottom"
      label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
      aria-expanded={open}
      onClick={() => setOpen((o) => !o)}>
      <NotificationsBell count={unread} doNotDisturb={dnd} />
    </IconButton>
  );
  const panel: NotificationsPanelProps = {
    open,
    data: rows,
    triggerButtonRef: trigger,
    onClickOutside: () => setOpen(false),
    onDismissSingleNotification: (n) =>
      setData((d) => d.filter((x) => x.id !== n.id)),
    onDismissAllNotifications: () => setData([]),
    onDoNotDisturbChange: setDnd,
    doNotDisturbDefaultToggled: dnd,
    onViewAllClick: () => {},
    onSettingsClick: () => {},
  };
  return { trig, panel, add, setData, setOpen };
}

type PanelArgs = Partial<NotificationsPanelProps>;

/**
 * Open the panel from the bell. Click a row to read it: its dot goes and the
 * bell's count drops. Dismiss a row, or Dismiss all. Add a notification
 * while it is open to see its place open and its mark beat. Do not disturb
 * slashes the bell in the header and in the panel.
 */
export const Default = {
  args: {
    title: 'Notifications',
    dismissAllLabel: 'Dismiss all',
    doNotDisturbLabel: 'Do not disturb',
    emptyStateLabel: 'You do not have any notifications',
    readMoreLabel: 'Read more',
    readLessLabel: 'Read less',
    align: 'bottom-end',
    shadow: false,
    timeScale: 1,
  },
  render: function DefaultStory(args: PanelArgs) {
    const { trig, panel, add, setData } = usePanelHost(sample);
    return (
      <div style={stage}>
        <div style={header}>{trig}</div>
        <div style={row}>
          <Button size="sm" variant="outlined" onClick={add}>
            Add a notification
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setData(sample())}>
            Reset
          </Button>
        </div>
        <NotificationsPanel {...args} {...panel} />
      </div>
    );
  },
};

/** Notifications arrive on a timer while the panel is open: each opens its place at the top, then its mark plays its beat. */
export const Arrivals = {
  render: function ArrivalsStory() {
    const { trig, panel, setData } = usePanelHost(() => sample().slice(0, 2));
    const [live, setLive] = useState(true);
    useEffect(() => {
      if (!live) {
        return;
      }
      const id = window.setInterval(
        () => setData((d) => [arrival(), ...d].slice(0, 12)),
        3000
      );
      return () => window.clearInterval(id);
    }, [live, setData]);
    return (
      <div style={stage}>
        <div style={header}>{trig}</div>
        <Checkbox
          id="notifications-panel-live"
          labelText="Arrive every 3 seconds"
          checked={live}
          onChange={(_e, { checked }) => setLive(checked)}
        />
        <NotificationsPanel {...panel} />
      </div>
    );
  },
};

/** No notifications: the empty state. After Dismiss all, the list resizes to it, then it comes in. */
export const Empty = {
  render: function EmptyStory() {
    const { trig, panel, setData } = usePanelHost(() => []);
    return (
      <div style={stage}>
        <div style={header}>{trig}</div>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setData(sample())}>
            Fill the list
          </Button>
        </div>
        <NotificationsPanel {...panel} />
      </div>
    );
  },
};

/** View all as a link to a full page (`viewAllHref`); its count rolls as the list changes. */
export const ViewAllLink = {
  render: function ViewAllStory() {
    const { trig, panel, add } = usePanelHost(sample);
    return (
      <div style={stage}>
        <div style={header}>{trig}</div>
        <div style={row}>
          <Button size="sm" variant="outlined" onClick={add}>
            Add a notification
          </Button>
        </div>
        <NotificationsPanel
          {...panel}
          viewAllHref="#"
          onViewAllClick={(e) => e.preventDefault()}
        />
      </div>
    );
  },
};

/** The bell: its pip at each size (a count at 32px), and Do not disturb. Turned on, the slash draws in; turned off, it retracts and the bell rings. */
export const Bell = {
  name: 'NotificationsBell',
  render: function BellStory() {
    const [count, setCount] = useState(3);
    const [dnd, setDnd] = useState(false);
    return (
      <div style={{ display: 'grid', gap: 24 }}>
        <div style={{ ...row, gap: 32 }}>
          {BELL_SIZES.map((size) => (
            <NotificationsBell
              key={size}
              size={size}
              count={count}
              doNotDisturb={dnd}
            />
          ))}
        </div>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setCount((c) => c + 1)}>
            Add one
          </Button>
          <Button size="sm" variant="outlined" onClick={() => setCount(0)}>
            Read all
          </Button>
          <Button
            size="sm"
            variant="outlined"
            aria-pressed={dnd}
            onClick={() => setDnd((d) => !d)}>
            Do not disturb
          </Button>
        </div>
      </div>
    );
  },
};
