/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import type { SelectionMoveInfo } from '@carbon-labs/v12-motion';
import { Toggle, ToggleSkeleton } from '../index';
import type { ToggleProps } from '../index';
import mdx from './Toggle.mdx';

type Variant = NonNullable<ToggleProps['variant']>;
type Corners = NonNullable<ToggleProps['corners']>;

const VARIANTS: Variant[] = ['inverse', 'tonal', 'outlined', 'hero', 'status'];
const CORNERS: Corners[] = ['full', 'rounded', 'square'];

export default {
  title: 'V12/Toggle',
  component: Toggle,
  subcomponents: { ToggleSkeleton },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: ['glide', 'color', 'mark', 'press', 'drag', 'state-text'],
      reduced: {
        glide: 'shorter-clock',
        color: 'at-once',
        'state-text': 'at-once',
      },
      states: ['off', 'on', 'disabled', 'readOnly'],
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    variant: { control: 'inline-radio', options: VARIANTS },
    corners: { control: 'inline-radio', options: CORNERS },
    mark: { control: 'inline-radio', options: [true, 'status', false] },
    labelText: { control: 'text' },
    labelA: { control: 'text' },
    labelB: { control: 'text' },
    disabledReason: { control: 'text' },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    motion: { control: false },
  },
};

const column = { display: 'grid', gap: 24, justifyItems: 'start' };
const row = {
  display: 'flex',
  gap: 24,
  alignItems: 'flex-end',
  flexWrap: 'wrap' as const,
};

/** One switch: press it, or drag the knob. Space and Enter flip it too. */
export const Default = {
  args: {
    id: 'toggle-default',
    labelText: 'Notifications',
    labelA: 'Off',
    labelB: 'On',
    size: 'md',
    defaultToggled: false,
    hideLabel: false,
    disabled: false,
    readOnly: false,
    corners: 'full',
    variant: 'inverse',
    mark: true,
    timeScale: 1,
  },
  render: (args: ToggleProps) => <Toggle {...args} />,
};

/** `md` (48×24, default) and `sm` (32×16). The md track also shrinks on a press; the sm one doesn't. */
export const Sizes = {
  render: () => (
    <div style={row}>
      <Toggle id="toggle-size-md" labelText="Medium" size="md" />
      <Toggle id="toggle-size-sm" labelText="Small" size="sm" />
    </div>
  ),
};

/** With and without text: a label and state text; a hidden label; no state text; state text of other widths, which share one cell so the row never changes width. */
export const Labels = {
  render: () => (
    <div style={column}>
      <Toggle id="toggle-label-both" labelText="Auto-save" defaultToggled />
      <Toggle id="toggle-label-hidden" labelText="Auto-save" hideLabel />
      <Toggle
        id="toggle-label-no-state"
        labelText="Auto-save"
        labelA=""
        labelB=""
      />
      <Toggle
        id="toggle-label-custom"
        labelText="Preview pane"
        labelA="Hidden"
        labelB="Shown"
      />
    </div>
  ),
};

/** Controlled: `toggled` comes from state and `onToggle` sets it. The buttons set it from outside, and the knob glides there. `onMove` reports each glide. */
export const Controlled = {
  render: function ControlledStory() {
    const [on, setOn] = useState(false);
    const [move, setMove] = useState<SelectionMoveInfo | null>(null);
    return (
      <div style={column}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="sm" variant="outlined" onClick={() => setOn(false)}>
            Turn off
          </Button>
          <Button size="sm" variant="outlined" onClick={() => setOn(true)}>
            Turn on
          </Button>
          <Button size="sm" variant="outlined" onClick={() => setOn((o) => !o)}>
            Flip
          </Button>
        </div>
        <Toggle
          id="toggle-controlled"
          labelText="Dark mode"
          toggled={on}
          onToggle={(checked) => setOn(checked)}
          onMove={setMove}
        />
        <p style={{ margin: 0 }}>
          {on ? 'On' : 'Off'}
          {move
            ? `. Last glide: ${Math.round(move.travel)}px on ${move.token}, ${Math.round(move.ms)}ms.`
            : '.'}
        </p>
      </div>
    );
  },
};

/** `variant`: the neutral track's looks (inverse, tonal, outlined), and the colored tracks (hero, status). */
export const Variants = {
  render: () => (
    <div style={row}>
      {VARIANTS.map((variant) => (
        <Toggle
          key={variant}
          id={`toggle-variant-${variant}`}
          labelText={variant}
          variant={variant}
          defaultToggled
        />
      ))}
    </div>
  ),
};

/** `mark`: the status dot at the stop the knob isn't on. Gray by default, red off and green on with `status`, none with `false`. */
export const Marks = {
  render: () => (
    <div style={row}>
      <Toggle id="toggle-mark-gray" labelText="Gray mark" />
      <Toggle id="toggle-mark-status" labelText="Status mark" mark="status" />
      <Toggle id="toggle-mark-none" labelText="No mark" mark={false} />
    </div>
  ),
};

/** `corners`: full (default), rounded (8px) or square. */
export const Corners = {
  render: () => (
    <div style={row}>
      {CORNERS.map((corners) => (
        <Toggle
          key={corners}
          id={`toggle-corners-${corners}`}
          labelText={corners}
          corners={corners}
        />
      ))}
    </div>
  ),
};

/** Off, on, disabled and read-only. */
export const States = {
  render: () => (
    <div style={row}>
      <Toggle id="toggle-state-off" labelText="Off" />
      <Toggle id="toggle-state-on" labelText="On" defaultToggled />
      <Toggle id="toggle-state-disabled" labelText="Disabled" disabled />
      <Toggle
        id="toggle-state-disabled-on"
        labelText="Disabled, on"
        disabled
        defaultToggled
      />
      <Toggle id="toggle-state-readonly" labelText="Read-only" readOnly />
      <Toggle
        id="toggle-state-readonly-on"
        labelText="Read-only, on"
        readOnly
        defaultToggled
      />
    </div>
  ),
};

/** `disabledReason`: the switch stays focusable and says why it is disabled in a tooltip on hover and focus. */
export const DisabledReason = {
  render: () => (
    <Toggle
      id="toggle-disabled-reason"
      labelText="Sync files"
      disabled
      disabledReason="Sync needs a storage plan"
    />
  ),
};

/** ToggleSkeleton: the label as itself, the track as a block. */
export const Skeleton = {
  render: () => (
    <div style={row}>
      <ToggleSkeleton labelText="Notifications" />
      <ToggleSkeleton labelText="Notifications" size="sm" />
    </div>
  ),
};
