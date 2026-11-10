/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Button } from '@carbon/react';
import { InlineLoading, Loading } from '../index';
import type { InlineLoadingStatus } from '../index';
import mdx from './Loading.mdx';

export default {
  title: 'V12/Loading',
  component: Loading,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: ['spinner', 'status-handoff', 'loading-gate'],
      reduced: {},
      states: ['active', 'stopping', 'inactive', 'finished', 'error'],
    },
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['neutral', 'hero'] },
  },
};

const row = { display: 'flex', gap: 16, alignItems: 'center' };

/** The page loader: toggle `active` to see the start and the stop. */
export const Default = {
  args: {
    active: true,
    small: false,
    withOverlay: false,
    description: 'Loading',
    variant: 'neutral',
  },
};

/** The loading gate: nothing for 300ms, then the spinner, kept at least 500ms once it shows. */
export const Gate = {
  render: function GateStory() {
    const [active, setActive] = useState(false);
    return (
      <div style={row}>
        <Button size="sm" kind="tertiary" onClick={() => setActive((v) => !v)}>
          {active ? 'Stop' : 'Start'}
        </Button>
        <Loading
          active={active}
          small
          withOverlay={false}
          delay={300}
          minDuration={500}
          description="Loading"
        />
      </div>
    );
  },
};

const STATUSES: InlineLoadingStatus[] = [
  'inactive',
  'active',
  'finished',
  'error',
];

/** InlineLoading: the mark changes in place, by the status hand-off, and the text swaps out then in. */
export const Inline = {
  render: function InlineStory() {
    const [status, setStatus] = useState<InlineLoadingStatus>('active');
    const text = {
      inactive: 'Save',
      active: 'Saving',
      finished: 'Saved',
      error: 'Could not save',
    }[status];
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={row}>
          {STATUSES.map((s) => (
            <Button
              size="sm"
              kind="tertiary"
              key={s}
              onClick={() => setStatus(s)}>
              {s}
            </Button>
          ))}
        </div>
        <InlineLoading status={status} description={text} />
      </div>
    );
  },
};
