/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import { ProgressBar } from '../index';
import type { ProgressBarStatus } from '../index';
import mdx from './ProgressBar.mdx';

export default {
  title: 'V12/ProgressBar',
  component: ProgressBar,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'duration-by-travel',
        'burst-throttle',
        'indeterminate-loop',
        'shared-phase',
        'loop-and-value',
        'pulse',
        'finished',
        'error',
        'content-swap',
      ],
      reduced: {
        'duration-by-travel': 'at-once',
        'loop-and-value': 'at-once',
        'content-swap': 'at-once',
      },
      states: ['active', 'indeterminate', 'finished', 'error'],
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['big', 'small'] },
    status: {
      control: 'inline-radio',
      options: ['active', 'finished', 'error'],
    },
    type: {
      control: 'inline-radio',
      options: ['default', 'inline', 'indented'],
    },
    variant: { control: 'inline-radio', options: ['neutral', 'hero'] },
  },
};

const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};
const stack = { display: 'grid', gap: 32, maxWidth: 480 };

/** One bar: change `value` to see the fill travel, or clear it for the loop. */
export const Default = {
  args: {
    label: 'Uploading files',
    helperText: '40 of 100 MB',
    value: 40,
    max: 100,
    status: 'active',
    type: 'default',
    variant: 'neutral',
    hideLabel: false,
    pulse: false,
    mark: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 480 }}>
      <ProgressBar {...args} />
    </div>
  ),
};

/** The fill travels to each new value, its clock from the distance; at the end it turns finished. */
export const Advancing = {
  render: function AdvancingStory() {
    const [value, setValue] = useState(10);
    const done = value >= 100;
    return (
      <div style={stack}>
        <ProgressBar
          label="Uploading files"
          value={value}
          status={done ? 'finished' : 'active'}
          helperText={done ? 'Upload complete' : `${value} of 100 MB`}
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
          <Button size="sm" variant="outlined" onClick={() => setValue(100)}>
            Finish
          </Button>
          <Button size="sm" variant="outlined" onClick={() => setValue(10)}>
            Reset
          </Button>
        </div>
      </div>
    );
  },
};

/** Many updates a second: each one retargets the running tween, so the fill moves on without stops. */
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
        <ProgressBar
          label="Syncing"
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

type LoopState = 'loop' | 'value' | 'error';

/** No value: the segment loops. A value picks up from the segment's live edges; an error with no value sends the segment off the end. */
export const Indeterminate = {
  render: function IndeterminateStory() {
    const [state, setState] = useState<LoopState>('loop');
    const status: ProgressBarStatus = state === 'error' ? 'error' : 'active';
    const helper = {
      loop: 'Preparing',
      value: '60 of 100 MB',
      error: 'Could not prepare the upload',
    }[state];
    return (
      <div style={stack}>
        <ProgressBar
          label="Uploading files"
          value={state === 'value' ? 60 : undefined}
          status={status}
          helperText={helper}
        />
        <div style={row}>
          <Button size="sm" variant="outlined" onClick={() => setState('loop')}>
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
            onClick={() => setState('error')}>
            Error
          </Button>
        </div>
      </div>
    );
  },
};

/** Active, finished and error. An error stays where it failed. */
export const Statuses = {
  render: () => (
    <div style={stack}>
      <ProgressBar label="Active" value={60} helperText="60 of 100 MB" />
      <ProgressBar label="Finished" status="finished" helperText="Done" />
      <ProgressBar
        label="Error"
        value={45}
        status="error"
        helperText="Failed at 45 MB"
      />
      <ProgressBar label="Indeterminate" helperText="Preparing" />
    </div>
  ),
};

/** Big and small, in each type: default, inline and indented. */
export const SizesAndTypes = {
  render: () => (
    <div style={stack}>
      {(['big', 'small'] as const).map((size) =>
        (['default', 'inline', 'indented'] as const).map((type) => (
          <ProgressBar
            key={`${size}-${type}`}
            label={`${size}, ${type}`}
            size={size}
            type={type}
            value={50}
            helperText="Helper text"
          />
        ))
      )}
    </div>
  ),
};

/** `pulse`: a highlight resolves along the filled part to the leading edge, while the bar is active with a value. */
export const Pulse = {
  render: () => (
    <div style={stack}>
      <ProgressBar label="Neutral" value={55} pulse helperText="Working" />
      <ProgressBar
        label="Hero"
        value={55}
        pulse
        variant="hero"
        helperText="Working"
      />
    </div>
  ),
};
