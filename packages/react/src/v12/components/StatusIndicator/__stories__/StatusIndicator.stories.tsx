/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Button } from '@carbon/react';
import { STATUS_INDICATOR_KINDS, StatusIndicator } from '../index';
import type { StatusIndicatorKind } from '../index';
import mdx from './StatusIndicator.mdx';

export default {
  title: 'V12/StatusIndicator',
  component: StatusIndicator,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: ['status-handoff', 'label-swap'],
      reduced: {},
      states: STATUS_INDICATOR_KINDS,
    },
  },
  argTypes: {
    kind: { control: 'select', options: STATUS_INDICATOR_KINDS },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    labelSwap: { control: 'inline-radio', options: ['travel', 'in-place'] },
  },
};

/** One status: its mark and its label. */
export const Default = {
  args: { kind: 'success', label: 'Deployed', size: 'md' },
};

/** Every kind, at md. */
export const Kinds = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {STATUS_INDICATOR_KINDS.map((kind) => (
        <StatusIndicator key={kind} kind={kind} label={kind} />
      ))}
    </div>
  ),
};

const STEPS: { kind: StatusIndicatorKind; label: string }[] = [
  { kind: 'not-started', label: 'Not started' },
  { kind: 'pending', label: 'Deploying' },
  { kind: 'success', label: 'Deployed' },
  { kind: 'error', label: 'Failed' },
];

/** A status that changes: the mark hands off, and the label swaps out then in. */
export const Changing = {
  render: function ChangingStory() {
    const [i, setI] = useState(0);
    const step = STEPS[i];
    return (
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Button
          size="sm"
          kind="tertiary"
          onClick={() => setI((v) => (v + 1) % STEPS.length)}>
          Next status
        </Button>
        <StatusIndicator
          kind={step.kind}
          label={step.label}
          labels={STEPS.map((s) => s.label)}
        />
      </div>
    );
  },
};
