/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import { PROGRESS_RING_SIZES, ProgressRing } from '../index';
import type { ProgressRingProps, ProgressRingStatus } from '../index';
import mdx from './ProgressRing.mdx';

export default {
  title: 'V12/ProgressRing',
  component: ProgressRing,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'draw-on',
        'duration-by-travel',
        'burst-throttle',
        'hand-off-from-turning',
        'status-hand-off',
        'back-to-active',
        'value-removed',
      ],
      reduced: {
        'draw-on': 'at-once',
        'duration-by-travel': 'at-once',
        'burst-throttle': 'at-once',
        'hand-off-from-turning': 'at-once',
        'status-hand-off': 'at-once',
        'back-to-active': 'at-once',
        'value-removed': 'at-once',
      },
      states: ['active', 'indeterminate', 'finished', 'error'],
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: PROGRESS_RING_SIZES },
    status: {
      control: 'inline-radio',
      options: ['active', 'finished', 'error'],
    },
    variant: { control: 'inline-radio', options: ['neutral', 'hero'] },
    motion: { control: false },
  },
};

const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};
const stack = { display: 'grid', gap: 24, maxWidth: 480 };

/** One ring: change `value` to see the arc travel, or clear it for the Spinner. */
export const Default = {
  args: {
    label: 'Uploading report.pdf',
    helperText: '40 of 100 MB',
    value: 40,
    max: 100,
    size: 16,
    status: 'active',
    variant: 'neutral',
    hideLabel: false,
  },
  render: (args: ProgressRingProps) => <ProgressRing {...args} />,
};

/** The arc's end travels to each new value. Finished and error hand off to their mark; Reset fades the mark out and the ring draws on again. */
export const Advancing = {
  render: function AdvancingStory() {
    const [value, setValue] = useState(10);
    const [status, setStatus] = useState<ProgressRingStatus>('active');
    const helper = {
      active: `${value} of 100 MB`,
      finished: 'Upload complete',
      error: `Failed at ${value} MB`,
    }[status];
    return (
      <div style={stack}>
        <ProgressRing
          label="Uploading report.pdf"
          size={24}
          value={value}
          status={status}
          helperText={helper}
        />
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setValue((v) => Math.min(100, v + 10))}>
            Add 10
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setValue((v) => Math.min(100, v + 40))}>
            Add 40
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => {
              setValue(100);
              setStatus('finished');
            }}>
            Finish
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setStatus('error')}>
            Error
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => {
              setValue(10);
              setStatus('active');
            }}>
            Reset
          </Button>
        </div>
      </div>
    );
  },
};

type TurnState = 'none' | 'value' | 'finished' | 'error';

/** No value: the Spinner turns. A value hands off from the turn in one move; taking the value away closes the ring and the Spinner draws on. */
export const Indeterminate = {
  render: function IndeterminateStory() {
    const [state, setState] = useState<TurnState>('none');
    const status: ProgressRingStatus =
      state === 'finished' || state === 'error' ? state : 'active';
    const helper = {
      none: 'Preparing',
      value: '60 of 100 MB',
      finished: 'Upload complete',
      error: 'Could not prepare the upload',
    }[state];
    return (
      <div style={stack}>
        <ProgressRing
          label="Uploading report.pdf"
          size={24}
          value={state === 'value' ? 60 : undefined}
          status={status}
          helperText={helper}
        />
        <div style={row}>
          <Button size="sm" variant="outlined" onClick={() => setState('none')}>
            No value
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setState('value')}>
            Value 60
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setState('finished')}>
            Finish
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setState('error')}>
            Error
          </Button>
        </div>
      </div>
    );
  },
};

/** Many updates a second: each one inside the burst window retargets the running tween, so the arc moves on without stops. */
export const Burst = {
  render: function BurstStory() {
    const [value, setValue] = useState(0);
    const [running, setRunning] = useState(false);
    useEffect(() => {
      if (!running) {
        return;
      }
      const id = setInterval(() => {
        setValue((v) => Math.min(100, v + 1.5));
      }, 40);
      return () => clearInterval(id);
    }, [running]);
    useEffect(() => {
      if (value >= 100) {
        setRunning(false);
      }
    }, [value]);
    const done = value >= 100;
    return (
      <div style={stack}>
        <ProgressRing
          label="Syncing"
          size={32}
          value={value}
          status={done ? 'finished' : 'active'}
          helperText={done ? 'Synced' : `${Math.round(value)}%`}
        />
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => {
              setValue(0);
              setRunning(true);
            }}>
            Start
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setRunning(false)}>
            Pause
          </Button>
        </div>
      </div>
    );
  },
};

/** Active, finished and error, with and without a value. An error with a value keeps it. */
export const Statuses = {
  render: () => (
    <div style={stack}>
      <ProgressRing label="Active" value={60} helperText="60 of 100 MB" />
      <ProgressRing label="Indeterminate" helperText="Preparing" />
      <ProgressRing label="Finished" status="finished" helperText="Done" />
      <ProgressRing
        label="Error"
        value={45}
        status="error"
        helperText="Failed at 45 MB"
      />
      <ProgressRing
        label="Error, no value"
        status="error"
        helperText="Could not start"
      />
    </div>
  ),
};

/** The four sizes, neutral and hero. The line grows with the value, inward. */
export const SizesAndVariants = {
  render: () => (
    <div style={stack}>
      {(['neutral', 'hero'] as const).map((variant) => (
        <div key={variant} style={row}>
          {PROGRESS_RING_SIZES.map((size) => (
            <ProgressRing
              key={size}
              label={`${size}px`}
              helperText={variant}
              size={size}
              variant={variant}
              value={70}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};
