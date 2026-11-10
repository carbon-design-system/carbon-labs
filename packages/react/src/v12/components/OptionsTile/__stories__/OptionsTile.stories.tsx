/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { Toggle } from '@carbon-labs/react-toggle';
import { OptionsTile } from '../index';
import type { OptionsTileProps } from '../index';
import mdx from './OptionsTile.mdx';

export default {
  title: 'V12/OptionsTile',
  component: OptionsTile,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'open-and-shut',
        'settings-in',
        'sheet',
        'summary-fade',
        'summary-words',
        'rollover',
        'switch',
      ],
      reduced: {
        'open-and-shut': 'at-once',
        'settings-in': 'shorter-clock',
        'summary-fade': 'at-once',
        'summary-words': 'at-once',
        rollover: 'at-once',
        switch: 'shorter-clock',
      },
      states: ['shut', 'open', 'invalid', 'warn', 'locked'],
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['lg', 'xl'] },
    title: { control: 'text' },
    summary: { control: 'text' },
    invalidText: { control: 'text' },
    warnText: { control: 'text' },
    lockedText: { control: 'text' },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    enabled: { control: false },
    children: { control: false },
  },
};

const stack = { display: 'grid', gap: 16, maxInlineSize: 560 };
const row = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};
const settings = { display: 'grid', gap: 16, justifyItems: 'start' };
const text = { margin: 0 };

/** The settings a tile opens to. */
function NotificationSettings({ prefix }: { prefix: string }) {
  return (
    <div style={settings}>
      <Toggle id={`${prefix}-email`} labelText="Email" defaultToggled />
      <Toggle id={`${prefix}-push`} labelText="Push" />
      <Toggle id={`${prefix}-digest`} labelText="Daily digest" defaultToggled />
    </div>
  );
}

/** Press the heading: the summary fades out, then the settings open as the summary's line shuts, as one motion. Shut, the summary fades back once the heading has landed. */
export const Default = {
  args: {
    title: 'Notifications',
    summary: 'Email and daily digest',
    size: 'lg',
    open: false,
    invalid: false,
    invalidText: 'Choose at least one channel',
    warn: false,
    warnText: 'Digests go to every member',
    locked: false,
    lockedText: 'Set by your administrator',
    timeScale: 1,
  },
  render: (args: OptionsTileProps) => (
    <div style={stack}>
      <OptionsTile {...args}>
        <NotificationSettings prefix="options-tile-default" />
      </OptionsTile>
    </div>
  ),
};

/** `enabled`: a switch over the heading's end turns the group on or off. It is controlled; `onChange` hears it. The summary's words follow the knob when the switch changes them. */
export const WithSwitch = {
  render: function WithSwitchStory() {
    const [enabled, setEnabled] = useState(true);
    return (
      <div style={stack}>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setEnabled((e) => !e)}>
            {enabled ? 'Turn off from outside' : 'Turn on from outside'}
          </Button>
        </div>
        <OptionsTile
          title="Backups"
          summary={enabled ? 'Every night at midnight' : 'Off'}
          enabled={enabled}
          onChange={(value) => setEnabled(value)}>
          <div style={settings}>
            <Toggle id="options-tile-switch-weekends" labelText="Weekends" />
            <Toggle
              id="options-tile-switch-versions"
              labelText="Keep old versions"
              defaultToggled
            />
          </div>
        </OptionsTile>
      </div>
    );
  },
};

const FREQUENCIES = ['Daily', 'Weekly', 'Monthly'];

/** A group of tiles: open or shut each one, or all at once. A new summary swaps out, then in. */
export const Group = {
  render: function GroupStory() {
    const [open, setOpen] = useState([false, false, false]);
    const [alerts, setAlerts] = useState(true);
    const [frequency, setFrequency] = useState(0);
    const setOne = (i: number) => (next: boolean) =>
      setOpen((prev) => prev.map((o, j) => (j === i ? next : o)));
    return (
      <div style={stack}>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setOpen([true, true, true])}>
            Open all
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setOpen([false, false, false])}>
            Shut all
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setFrequency((f) => (f + 1) % FREQUENCIES.length)}>
            Change the frequency
          </Button>
        </div>
        <OptionsTile
          title="Alerts"
          summary={alerts ? `${FREQUENCIES[frequency]} summary` : 'Off'}
          enabled={alerts}
          onChange={(value) => setAlerts(value)}
          open={open[0]}
          onToggle={setOne(0)}>
          <NotificationSettings prefix="options-tile-group-alerts" />
        </OptionsTile>
        <OptionsTile
          title="Storage"
          summary="12 GB of 50 GB used"
          open={open[1]}
          onToggle={setOne(1)}>
          <div style={settings}>
            <p style={text}>Files older than a year move to the archive.</p>
            <Toggle
              id="options-tile-group-archive"
              labelText="Archive old files"
              defaultToggled
            />
          </div>
        </OptionsTile>
        <OptionsTile
          title="Sharing"
          summary="Members of the team"
          locked
          lockedText="Set by your administrator"
          enabled
          open={open[2]}
          onToggle={setOne(2)}>
          <p style={text}>Only an administrator can change who can see it.</p>
        </OptionsTile>
      </div>
    );
  },
};

/** A status takes the summary's place, and stays while the tile is open: invalid, else warn, else locked. Locked makes the switch read-only. */
export const Statuses = {
  render: () => (
    <div style={stack}>
      <OptionsTile
        title="Channels"
        summary="None"
        invalid
        invalidText="Choose at least one channel">
        <NotificationSettings prefix="options-tile-invalid" />
      </OptionsTile>
      <OptionsTile
        title="Digest"
        summary="Daily"
        warn
        warnText="Digests go to every member">
        <NotificationSettings prefix="options-tile-warn" />
      </OptionsTile>
      <OptionsTile
        title="Retention"
        summary="One year"
        locked
        lockedText="Set by your administrator"
        enabled>
        <p style={text}>Only an administrator can change it.</p>
      </OptionsTile>
    </div>
  ),
};

/** The heading's height: `lg` 48px (default) and `xl` 64px. */
export const Sizes = {
  render: () => (
    <div style={stack}>
      <OptionsTile title="Large" summary="The default heading" size="lg">
        <NotificationSettings prefix="options-tile-lg" />
      </OptionsTile>
      <OptionsTile title="Extra large" summary="A taller heading" size="xl">
        <NotificationSettings prefix="options-tile-xl" />
      </OptionsTile>
    </div>
  ),
};

/** Without children the tile doesn't open, and its heading is plain text. */
export const Static = {
  render: function StaticStory() {
    const [enabled, setEnabled] = useState(false);
    return (
      <div style={stack}>
        <OptionsTile
          title="Usage reports"
          summary={enabled ? 'Sent every week' : 'Off'}
          enabled={enabled}
          onChange={(value) => setEnabled(value)}
        />
      </div>
    );
  },
};
