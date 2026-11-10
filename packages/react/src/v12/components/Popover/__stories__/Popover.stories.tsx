/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Button, Checkbox, TextInput } from '@carbon/react';
import { Popover, PopoverContent } from '../index';
import type { PopoverAlignment, PopoverProps } from '../index';
import mdx from './Popover.mdx';

const ALIGNMENTS: PopoverAlignment[] = [
  'top',
  'top-start',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
  'right',
  'right-start',
  'right-end',
];

export default {
  title: 'V12/Popover',
  component: Popover,
  subcomponents: { PopoverContent },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'snap',
        'out',
        'fade',
        'interrupted',
        'soft-edge',
        'cast-shadow',
        'timing-by-size',
      ],
      reduced: {
        snap: 'at-once',
        out: 'at-once',
        fade: 'at-once',
        interrupted: 'at-once',
        'soft-edge': 'at-once',
        'cast-shadow': 'at-once',
        'timing-by-size': 'at-once',
      },
      states: ['closed', 'open'],
    },
  },
  argTypes: {
    align: { control: 'select', options: ALIGNMENTS },
    variant: {
      control: 'inline-radio',
      options: ['outlined', 'tonal', 'inverse'],
    },
    corners: { control: 'inline-radio', options: ['rounded', 'square'] },
    backgroundToken: {
      control: 'inline-radio',
      options: ['layer', 'background'],
    },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    anchor: { control: false },
    origin: { control: false },
    as: { control: false },
    autoAlignBoundary: { control: false },
  },
};

/** Room around the trigger, so the surface is never clipped. */
const stage = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  gap: 24,
  flexWrap: 'wrap' as const,
  padding: '32px 160px 200px',
};

/** Popovers have no padding of their own: the host pads 16px. */
const body = { display: 'block', padding: 16, maxInlineSize: 240 };

/** Open and close with the `open` control. Opened from the start, it is there at once. */
export const Default = {
  args: {
    open: true,
    align: 'bottom',
    autoAlign: false,
    variant: 'outlined',
    corners: 'rounded',
    exitFade: true,
    timeScale: 1,
  },
  render: (args: PopoverProps) => (
    <div style={stage}>
      <Popover {...args}>
        <Button size="sm" kind="tertiary">
          Filters
        </Button>
        <PopoverContent>
          <span style={body}>
            Show items updated in the last 30 days, from every team.
          </span>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

/** Open it from the trigger: it grows from the press. Press again while it leaves to turn it round. */
export const Toggle = {
  args: { align: 'bottom-start', exitFade: true, timeScale: 1 },
  render: function ToggleStory(args: Omit<PopoverProps, 'open'>) {
    const [open, setOpen] = useState(false);
    return (
      <div style={stage}>
        <Popover {...args} open={open} onRequestClose={() => setOpen(false)}>
          <Button
            size="sm"
            kind="tertiary"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}>
            Settings
          </Button>
          <PopoverContent>
            <span style={body}>
              <Checkbox
                id="popover-story-hidden"
                labelText="Show hidden files"
                defaultChecked
              />
              <Checkbox id="popover-story-group" labelText="Group by type" />
            </span>
          </PopoverContent>
        </Popover>
      </div>
    );
  },
};

const VARIANTS: NonNullable<PopoverProps['variant']>[] = [
  'outlined',
  'tonal',
  'inverse',
];

/** The three looks, and square corners with the cast shadow. */
export const Variants = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 280px)',
        rowGap: 120,
        padding: '32px 32px 120px',
      }}>
      {VARIANTS.map((variant) => (
        <Popover key={variant} open align="bottom-start" variant={variant}>
          <Button size="sm" kind="tertiary">
            {variant}
          </Button>
          <PopoverContent>
            <span style={body}>The {variant} surface.</span>
          </PopoverContent>
        </Popover>
      ))}
      <Popover open align="bottom-start" corners="square" shadow>
        <Button size="sm" kind="tertiary">
          square, shadow
        </Button>
        <PopoverContent>
          <span style={body}>Square corners and the cast shadow.</span>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

/** The anchored form: portalled, a dialog that takes focus. Escape returns focus to the trigger. */
export const Anchored = {
  render: function AnchoredStory() {
    const [open, setOpen] = useState(false);
    const [trigger, setTrigger] = useState<HTMLElement | null>(null);
    return (
      <div style={stage}>
        <Button
          size="sm"
          kind="tertiary"
          ref={setTrigger}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}>
          Rename
        </Button>
        <Popover
          open={open}
          anchor={trigger}
          label="Rename"
          onClose={() => setOpen(false)}>
          <form
            style={{ display: 'grid', gap: 8, padding: 16, inlineSize: 240 }}
            onSubmit={(e) => {
              e.preventDefault();
              setOpen(false);
            }}>
            <TextInput
              id="popover-story-name"
              labelText="Name"
              defaultValue="Quarterly report"
            />
            <Button size="sm" kind="tertiary" type="submit">
              Save
            </Button>
          </form>
        </Popover>
      </div>
    );
  },
};
