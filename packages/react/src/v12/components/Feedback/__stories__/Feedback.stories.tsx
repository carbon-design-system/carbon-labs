/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Checkbox } from '@carbon/react';
import { Button } from '@carbon-labs/react-button';
import {
  CountPill,
  SPINNER_SIZES,
  SkeletonOf,
  SkeletonPlaceholder,
  SkeletonText,
  Spinner,
  StatusMark,
} from '../index';
import type { StatusMarkKind } from '../index';
import mdx from './Feedback.mdx';

export default {
  title: 'V12/Feedback',
  component: Spinner,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: ['spinner', 'status-handoff', 'skeleton-wave', 'count'],
      reduced: {},
      states: ['pending', 'settled', 'loading', 'loaded'],
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: SPINNER_SIZES },
    variant: { control: 'inline-radio', options: ['neutral', 'hero'] },
  },
};

const row = {
  display: 'flex',
  gap: 24,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

/** The loader: it draws on, turns while `active`, and draws off when it stops. */
export const SpinnerDefault = {
  name: 'Spinner',
  args: { size: 32, variant: 'neutral', active: true, description: 'Loading' },
};

/** The six sizes; the stroke follows the size. */
export const SpinnerSizes = {
  render: () => (
    <div style={row}>
      {SPINNER_SIZES.map((size) => (
        <Spinner key={size} size={size} description={`Loading, ${size}px`} />
      ))}
    </div>
  ),
};

const KINDS: StatusMarkKind[] = [
  'error',
  'warning',
  'warning-alt',
  'success',
  'info',
  'info-square',
  'not-started',
  'paused',
  'unknown',
  'pending',
];

/** Each status kind, at 20px. */
export const StatusMarks = {
  render: () => (
    <div style={row}>
      {KINDS.map((kind) => (
        <StatusMark key={kind} kind={kind} size={20} description={kind} />
      ))}
    </div>
  ),
};

/** Pending to a result: the spinner hands off to the result's mark. */
export const StatusHandoff = {
  render: function Handoff() {
    const [kind, setKind] = useState<StatusMarkKind>('pending');
    const [from, setFrom] = useState<StatusMarkKind | undefined>(undefined);
    const go = (next: StatusMarkKind) => {
      setFrom(kind);
      setKind(next);
    };
    return (
      <div style={row}>
        <StatusMark kind={kind} from={from} size={24} description={kind} />
        <Button size="sm" variant="outlined" onClick={() => go('pending')}>
          Pending
        </Button>
        <Button size="sm" variant="outlined" onClick={() => go('success')}>
          Success
        </Button>
        <Button size="sm" variant="outlined" onClick={() => go('error')}>
          Error
        </Button>
      </div>
    );
  },
};

/** A count: the digits that change roll to the new value. */
export const Count = {
  render: function CountStory() {
    const [value, setValue] = useState(3);
    return (
      <div style={row}>
        <CountPill value={value} label={`${value} new`} />
        <Button
          size="sm"
          variant="outlined"
          onClick={() => setValue((v) => v + 1)}>
          Add one
        </Button>
        <Button
          size="sm"
          variant="outlined"
          onClick={() => setValue((v) => Math.max(0, v - 1))}>
          Remove one
        </Button>
      </div>
    );
  },
};

/** Skeleton text and a placeholder block, pulsing on the skeleton wave. */
export const Skeletons = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 360 }}>
      <SkeletonText heading width="60%" />
      <SkeletonText paragraph lineCount={3} />
      <SkeletonPlaceholder style={{ inlineSize: 120, blockSize: 80 }} />
    </div>
  ),
};

/** A component as its own skeleton: the parts `blocks` names become blocks of their own box. */
export const ComponentAsSkeleton = {
  render: function Of() {
    const [loading, setLoading] = useState(true);
    const card = (
      <div
        style={{
          display: 'grid',
          gap: 8,
          padding: 16,
          maxWidth: 320,
          border: '1px solid var(--cds-border-subtle-01)',
        }}>
        <strong className="card-title">Quarterly report</strong>
        <span className="card-meta">Updated 2 hours ago</span>
        <Button size="sm" variant="outlined" className="card-action">
          Open
        </Button>
      </div>
    );
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <Checkbox
          id="feedback-loading"
          labelText="Loading"
          checked={loading}
          onChange={(_e, { checked }) => setLoading(checked)}
        />
        {loading ? (
          <SkeletonOf blocks=".card-title, .card-meta, .card-action">
            {card}
          </SkeletonOf>
        ) : (
          card
        )}
      </div>
    );
  },
};
