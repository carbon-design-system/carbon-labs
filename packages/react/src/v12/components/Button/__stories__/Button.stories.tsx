/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef, useState } from 'react';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { Add, ArrowRight, Save } from '@carbon-labs/react-motion-icons';
import {
  Button,
  ButtonFrames,
  ButtonGrid,
  ButtonGridCell,
  ButtonGridGroup,
  ButtonKinds,
  ButtonSet,
  ButtonSizes,
  ButtonSkeleton,
  ButtonTooltipAlignments,
  ButtonTooltipPositions,
  ButtonVariants,
} from '../index';
import type { ButtonProps } from '../index';
import mdx from './Button.mdx';

export default {
  title: 'V12/Button',
  component: Button,
  subcomponents: {
    ButtonSet,
    ButtonSkeleton,
    ButtonGrid,
    ButtonGridGroup,
    ButtonGridCell,
  },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'hover',
        'size',
        'press-and-release',
        'toned-steps',
        'icon',
        'busy',
        'focus',
      ],
      reduced: {
        hover: 'at-once',
        size: 'at-once',
        'press-and-release': 'at-once',
        'toned-steps': 'at-once',
        icon: 'at-once',
        busy: 'at-once',
      },
      states: ['rest', 'hover', 'press', 'focus', 'disabled', 'busy'],
    },
  },
  argTypes: {
    kind: { control: 'inline-radio', options: ButtonKinds },
    variant: { control: 'inline-radio', options: ButtonVariants },
    frame: { control: 'inline-radio', options: ButtonFrames },
    size: { control: 'inline-radio', options: ButtonSizes },
    corners: {
      control: 'inline-radio',
      options: ['full', 'rounded', 'square'],
    },
    tooltipPosition: {
      control: 'inline-radio',
      options: ButtonTooltipPositions,
    },
    tooltipAlignment: {
      control: 'inline-radio',
      options: ButtonTooltipAlignments,
    },
    renderIcon: { control: false },
    as: { control: false },
    children: { control: 'text' },
  },
};

const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};
const column = { display: 'grid', gap: 24 };
/** Room above icon-only buttons, so their tooltips are never clipped. */
const stage = { ...row, padding: '56px 16px 16px' };

/** One button. Hover it for the glow, press it for the release circle, and turn `busy` on and off for the spinner. */
export const Default = {
  args: {
    children: 'Add item',
    renderIcon: Add,
    iconDescription: 'Add',
    kind: 'primary',
    variant: 'filled',
    frame: 'inset',
    disabled: false,
    busy: false,
    hasIconOnly: false,
    isExpressive: false,
  },
};

/** The roles in each treatment and frame. Outlined and ghost hover and press in tints of their own color; tonal is always the neutral quiet fill. */
export const Kinds = {
  render: () => (
    <div style={column}>
      <div style={row}>
        {ButtonKinds.map((kind) => (
          <Button key={kind} kind={kind}>
            {`Filled ${kind}`}
          </Button>
        ))}
      </div>
      <div style={row}>
        <Button variant="outlined">Outlined</Button>
        <Button variant="outlined" kind="danger">
          Outlined danger
        </Button>
        <Button variant="tonal">Tonal</Button>
      </div>
      <div style={row}>
        <Button frame="ghost">Ghost</Button>
        <Button frame="ghost" kind="danger">
          Ghost danger
        </Button>
        <Button frame="none">Text button</Button>
      </div>
    </div>
  ),
};

/** The sizes, from xs to 2xl. */
export const Sizes = {
  render: () => (
    <div style={row}>
      {ButtonSizes.map((size) => (
        <Button key={size} size={size}>
          {`Size ${size}`}
        </Button>
      ))}
    </div>
  ),
};

/** A motion icon plays on the button's hover or keyboard focus. Icon-only buttons take their tooltip and name from `iconDescription`. */
export const Icons = {
  render: () => (
    <div style={column}>
      <div style={row}>
        <Button renderIcon={ArrowRight}>Continue</Button>
        <Button renderIcon={Add} variant="outlined">
          Add item
        </Button>
        <Button renderIcon={ArrowRight} frame="ghost">
          Next
        </Button>
      </div>
      <div style={stage}>
        <Button hasIconOnly renderIcon={Add} iconDescription="Add" />
        <Button
          hasIconOnly
          renderIcon={Add}
          iconDescription="Add"
          kind="secondary"
        />
        <Button
          hasIconOnly
          renderIcon={Add}
          iconDescription="Add"
          variant="outlined"
        />
        <Button
          hasIconOnly
          renderIcon={Add}
          iconDescription="Add"
          frame="ghost"
        />
        <Button
          hasIconOnly
          renderIcon={Add}
          iconDescription="Add"
          frame="ghost"
          isSelected
        />
      </div>
    </div>
  ),
};

/** Disabled: no hover or press. With `disabledReason` it stays focusable and shows the reason in a tooltip on hover and focus. */
export const Disabled = {
  render: () => (
    <div style={stage}>
      <Button disabled>Disabled</Button>
      <Button disabled variant="outlined">
        Disabled outlined
      </Button>
      <Button disabled disabledReason="Fill in every field to submit">
        Submit
      </Button>
    </div>
  ),
};

/** A button that is busy for two seconds after a click. */
function BusyButton({ children, ...props }: ButtonProps) {
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );
  return (
    <Button
      {...props}
      busy={busy}
      onClick={() => {
        setBusy(true);
        timer.current = setTimeout(() => setBusy(false), 2000);
      }}>
      {children}
    </Button>
  );
}

/** Click each one. The icon fades out and the spinner draws on; when the work ends, the spinner closes and the icon fades back. A label-only button's label takes the icon's turn. Save keeps its own pending motion. */
export const Busy = {
  render: () => (
    <div style={row}>
      <BusyButton renderIcon={Add}>Add item</BusyButton>
      <BusyButton variant="outlined">Refresh</BusyButton>
      <BusyButton renderIcon={Save} kind="secondary">
        Save
      </BusyButton>
    </div>
  ),
};

const SPEEDS = ['0.25×', '0.5×', '1×', '1.5×', '2×', '4×'];

/** ButtonSet, ButtonGrid and ButtonSkeleton. The grid's cells hover and press as the Button does, clipped to the cell; pick one to select it. The skeleton is the size of the button it stands for. */
export const Sets = {
  render: function SetsStory() {
    const [speed, setSpeed] = useState('1×');
    return (
      <div style={column}>
        <ButtonSet>
          <Button variant="outlined">Cancel</Button>
          <Button>Save</Button>
        </ButtonSet>
        <div style={{ maxInlineSize: 360 }}>
          <ButtonGrid label="Playback speed">
            {SPEEDS.map((s) => (
              <ButtonGridCell
                key={s}
                selected={s === speed}
                onClick={() => setSpeed(s)}>
                {s}
              </ButtonGridCell>
            ))}
          </ButtonGrid>
        </div>
        <div style={row}>
          <ButtonSkeleton label="Add item" hasIcon />
          <Button renderIcon={Add}>Add item</Button>
        </div>
      </div>
    );
  },
};
