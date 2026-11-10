/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Button } from '@carbon/react';
import React, { useState } from 'react';
import {
  ProgressIndicator,
  ProgressIndicatorSkeleton,
  ProgressStep,
  useProgressReach,
} from '../index';
import mdx from './ProgressIndicator.mdx';

export default {
  title: 'V12/ProgressIndicator',
  component: ProgressIndicator,
  subcomponents: { ProgressStep },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'stretch',
        'reach',
        'one-clock',
        'icon-state-change',
        'rollover',
      ],
      reduced: {
        stretch: 'shorter-clock',
        reach: 'at-once',
        'one-clock': 'at-once',
        'icon-state-change': 'at-once',
      },
      states: ['incomplete', 'current', 'complete', 'invalid', 'disabled'],
    },
  },
  argTypes: {
    currentIndex: { control: { type: 'number', min: 0, max: 3 } },
  },
};

const STEPS = [
  { label: 'Account', secondaryLabel: 'Name and email' },
  { label: 'Plan', secondaryLabel: 'Pick a tier' },
  { label: 'Payment', secondaryLabel: 'Card details' },
  { label: 'Review', secondaryLabel: 'Confirm and submit' },
];

const steps = () =>
  STEPS.map((s) => (
    <ProgressStep
      key={s.label}
      label={s.label}
      secondaryLabel={s.secondaryLabel}
    />
  ));

const row = { display: 'flex', gap: 16, alignItems: 'center' };

/** Four steps, the second current. Change `currentIndex` to move the bar and the fill. */
export const Default = {
  args: { currentIndex: 1, spaceEqually: false, vertical: false },
  render: (args) => <ProgressIndicator {...args}>{steps()}</ProgressIndicator>,
};

/** A flow: Back and Next reach the bar toward their step on press. With `onChange`, a press on a step reaches toward it too. */
export const Flow = {
  render: function FlowStory() {
    const [current, setCurrent] = useState(0);
    const reach = useProgressReach();
    const last = STEPS.length - 1;
    return (
      <div style={{ display: 'grid', gap: 24 }}>
        <ProgressIndicator
          currentIndex={current}
          onChange={setCurrent}
          reach={reach}>
          {steps()}
        </ProgressIndicator>
        <div style={row}>
          <Button
            size="sm"
            kind="tertiary"
            disabled={current === 0}
            {...reach.press(Math.max(0, current - 1))}
            onClick={() => setCurrent((i) => Math.max(0, i - 1))}>
            Back
          </Button>
          <Button
            size="sm"
            disabled={current === last}
            {...reach.press(Math.min(last, current + 1))}
            onClick={() => setCurrent((i) => Math.min(last, i + 1))}>
            Next
          </Button>
        </div>
      </div>
    );
  },
};

/** Steps in a column; the line and the bar run down the column's start. */
export const Vertical = {
  render: function VerticalStory() {
    const [current, setCurrent] = useState(2);
    return (
      <ProgressIndicator vertical currentIndex={current} onChange={setCurrent}>
        {steps()}
      </ProgressIndicator>
    );
  },
};

/** The step states: complete, current, invalid, disabled, and a step after the current one marked complete. */
export const States = {
  render: () => (
    <ProgressIndicator currentIndex={1}>
      <ProgressStep label="Complete" secondaryLabel="Done" />
      <ProgressStep label="Current" secondaryLabel="In progress" />
      <ProgressStep
        label="Invalid"
        secondaryLabel="Needs a fix"
        invalid
        description="Invalid"
      />
      <ProgressStep label="Disabled" disabled />
      <ProgressStep label="Complete ahead" complete />
    </ProgressIndicator>
  ),
};

/** `spaceEqually`: the steps share the width. */
export const SpaceEqually = {
  render: () => (
    <ProgressIndicator currentIndex={2} spaceEqually>
      {steps()}
    </ProgressIndicator>
  ),
};

/** The skeleton: each label a bar; the marks and the current step's bar wait. */
export const Skeleton = {
  render: () => <ProgressIndicatorSkeleton count={4} />,
};
