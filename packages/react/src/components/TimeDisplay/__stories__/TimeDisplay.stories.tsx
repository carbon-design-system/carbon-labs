/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import mdx from './TimeDisplay.mdx';
import { TimeDisplay } from '../components/TimeDisplay';
import '../components/time-display.scss';
import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof TimeDisplay> = {
  title: 'Components/TimeDisplay',
  component: TimeDisplay,
  parameters: {
    layout: 'padded',
    docs: {
      page: mdx,
    },
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['count-up', 'count-down', 'duration'],
      description: 'Determines how the time value is calculated',
    },
    format: {
      control: 'select',
      options: ['split', 'boxed', 'colon', 'inline'],
      description: 'Visual layout of the time display',
    },
    units: {
      control: 'check',
      options: ['days', 'hours', 'minutes', 'seconds'],
      description: 'Which time units to show',
    },
    labelPosition: {
      control: 'radio',
      options: ['top', 'inline'],
    },
    announcementMode: {
      control: 'radio',
      options: ['off', 'threshold'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TimeDisplay>;

// ─── Count-up ────────────────────────────────────────────────────────────────

const jobStartTime = new Date(Date.now() - 3665000); // ~1 hour ago

export const CountUp: Story = {
  args: {
    mode: 'count-up',
    label: 'Job elapsed time',
    startTime: jobStartTime,
    format: 'split',
    helperText: 'Job is still running',
  },
};

// ─── Count-down ──────────────────────────────────────────────────────────────

const sessionEndTime = new Date(Date.now() + 305000); // ~5 minutes away

export const CountDown: Story = {
  render: (args) => {
    const [expired, setExpired] = useState(false);

    return (
      <TimeDisplay
        {...args}
        endTime={new Date(Date.now() + 305000)}
        onComplete={() => setExpired(true)}
        helperText={expired ? 'Session has expired' : 'Please save your work'}
      />
    );
  },
  args: {
    mode: 'count-down',
    label: 'Session expires in',
    format: 'split',
    completeLabel: 'Session expired',
    announcementMode: 'threshold',
    thresholds: [
      { value: 300, label: '5 minutes remaining' },
      { value: 60, label: '1 minute remaining' },
      { value: 0, label: 'Session expired' },
    ],
  },
};

// ─── Duration ────────────────────────────────────────────────────────────────

export const Duration: Story = {
  args: {
    mode: 'duration',
    label: 'Total runtime',
    duration: 45296, // 12 hr 34 min 56 sec
    format: 'split',
    helperText: 'Task completed successfully',
  },
};

// ─── All formats ─────────────────────────────────────────────────────────────

export const AllFormats: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
      {(['split', 'boxed', 'colon', 'inline'] as const).map((fmt) => (
        <div key={fmt}>
          <p
            style={{
              fontSize: '0.75rem',
              marginBlockEnd: '0.5rem',
              textTransform: 'capitalize',
            }}
          >
            {fmt}
          </p>
          <TimeDisplay
            mode="duration"
            label="Total runtime"
            duration={45296}
            format={fmt}
          />
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Boxed format ────────────────────────────────────────────────────────────

export const Boxed: Story = {
  args: {
    mode: 'count-up',
    label: 'Elapsed time',
    startTime: jobStartTime,
    format: 'boxed',
  },
};

// ─── Colon format ────────────────────────────────────────────────────────────

export const Colon: Story = {
  args: {
    mode: 'count-up',
    label: 'Elapsed time',
    startTime: jobStartTime,
    format: 'colon',
  },
};

// ─── Inline format ───────────────────────────────────────────────────────────

export const Inline: Story = {
  args: {
    mode: 'count-up',
    label: 'Elapsed time',
    startTime: jobStartTime,
    format: 'inline',
  },
};

// ─── Unit customisation ──────────────────────────────────────────────────────

export const MinutesAndSeconds: Story = {
  args: {
    mode: 'count-up',
    label: 'Elapsed time',
    startTime: new Date(Date.now() - 125000),
    format: 'split',
    units: ['minutes', 'seconds'],
  },
};

export const WithDays: Story = {
  args: {
    mode: 'duration',
    label: 'Duration',
    duration: 259200, // 3 days
    format: 'split',
    units: ['days', 'hours', 'minutes', 'seconds'],
  },
};

export const NoPadding: Story = {
  args: {
    mode: 'count-up',
    label: 'Elapsed time',
    startTime: new Date(Date.now() - 125000),
    format: 'split',
    padWithZero: false,
  },
};

// ─── Threshold callbacks ─────────────────────────────────────────────────────

export const ThresholdCallbacks: Story = {
  render: () => {
    const [endTime] = useState(() => new Date(Date.now() + 26000));

    return (
      <TimeDisplay
        mode="count-down"
        label="Time remaining"
        endTime={endTime}
        units={['seconds']}
        format="split"
        announcementMode="threshold"
        thresholds={[
          {
            value: 25,
            label: '25 seconds remaining',
            onReach: (v) => console.log(`[TimeDisplay] threshold reached: ${v}s — starting soon`),
          },
          {
            value: 20,
            label: '20 seconds remaining',
            onReach: (v) => console.log(`[TimeDisplay] threshold reached: ${v}s — getting closer`),
          },
          {
            value: 15,
            label: '15 seconds remaining',
            onReach: (v) => console.log(`[TimeDisplay] threshold reached: ${v}s — almost there`),
          },
          {
            value: 10,
            label: '10 seconds remaining',
            onReach: (v) => console.log(`[TimeDisplay] threshold reached: ${v}s — warning`),
          },
          {
            value: 5,
            label: '5 seconds remaining',
            onReach: (v) => console.log(`[TimeDisplay] threshold reached: ${v}s — critical`),
          },
        ]}
        onComplete={() => console.log('[TimeDisplay] onComplete — countdown reached zero')}
        helperText="Open the browser console to see threshold callbacks fire every 5 seconds"
      />
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── Hidden label ────────────────────────────────────────────────────────────

export const HiddenLabel: Story = {
  args: {
    mode: 'duration',
    label: 'Total runtime',
    duration: 45296,
    format: 'split',
    hideLabel: true,
  },
};
