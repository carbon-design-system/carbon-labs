/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Button } from '@carbon-labs/react-button';
import React from 'react';
import { DefinitionTooltip, IconButton, Tooltip, TooltipGroup } from '../index';
import type { TooltipAlign, TooltipProps } from '../index';
import mdx from './Tooltip.mdx';

const ALIGNMENTS: TooltipAlign[] = [
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
  title: 'V12/Tooltip',
  component: Tooltip,
  subcomponents: { IconButton, DefinitionTooltip, TooltipGroup },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'in',
        'from-the-keyboard',
        'fade',
        'warm',
        'moving-on',
        'drift',
        'out',
        'leave-delay',
        'interrupted',
        'stillness',
      ],
      reduced: {
        in: 'at-once',
        'from-the-keyboard': 'at-once',
        fade: 'at-once',
        warm: 'at-once',
        'moving-on': 'at-once',
        drift: 'at-once',
        out: 'at-once',
        'leave-delay': 'full',
        interrupted: 'at-once',
        stillness: 'full',
      },
      states: ['hidden', 'shown', 'warm'],
    },
  },
  argTypes: {
    align: { control: 'select', options: ALIGNMENTS },
    as: { control: false },
    children: { control: false },
  },
};

/** Room around the triggers, so the tooltips are never clipped. */
const stage = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 16,
  flexWrap: 'wrap' as const,
  padding: '72px 120px',
};

/** A 16px glyph for the icon buttons. */
const Glyph = ({ d }: { d: string }) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true">
    <path d={d} />
  </svg>
);

const ADD = 'M7.5 3h1v4.5H13v1H8.5V13h-1V8.5H3v-1h4.5z';
const REMOVE = 'M3 7.5h10v1H3z';
const CLOSE =
  'M4.7 4 4 4.7 7.3 8 4 11.3l.7.7L8 8.7l3.3 3.3.7-.7L8.7 8 12 4.7 11.3 4 8 7.3z';
const MENU = 'M2 3.5h12v1H2zm0 4h12v1H2zm0 4h12v1H2z';

/** Hover or focus the button: after 100ms the tooltip grows from the pointer, or from the button from the keyboard. */
export const Default = {
  args: {
    description: 'Copies a link to this page',
    align: 'top',
    autoAlign: false,
    enterDelayMs: 100,
    leaveDelayMs: 300,
    closeOnActivation: false,
    outline: false,
    exitFade: true,
  },
  render: (args: TooltipProps) => (
    <div style={stage}>
      <Tooltip {...args}>
        <Button size="sm" variant="outlined">
          Copy link
        </Button>
      </Tooltip>
    </div>
  ),
};

/** The four sides, each a label, as the icon buttons' are: one padding on every side. Move from one to the next within 400ms: the next is there at once, with no delay and no snap. */
export const Sides = {
  render: () => (
    <div style={{ ...stage, gap: 24 }}>
      {(['top', 'right', 'bottom', 'left'] as TooltipAlign[]).map((align) => (
        <Tooltip key={align} align={align} label={`Opens on the ${align}`}>
          <Button size="sm" variant="outlined">
            {align}
          </Button>
        </Tooltip>
      ))}
    </div>
  ),
};

/** IconButton: its label is its tooltip and its name, leaving after 120ms. A disabled one shows only a reason. */
export const IconButtons = {
  render: () => (
    <div style={stage}>
      <IconButton label="Add">
        <Glyph d={ADD} />
      </IconButton>
      <IconButton label="Remove" kind="secondary">
        <Glyph d={REMOVE} />
      </IconButton>
      <IconButton label="Menu" variant="outlined">
        <Glyph d={MENU} />
      </IconButton>
      <IconButton label="Close" frame="ghost">
        <Glyph d={CLOSE} />
      </IconButton>
      <IconButton
        label="Remove"
        kind="danger"
        disabled
        disabledReason="Select an item to remove it">
        <Glyph d={REMOVE} />
      </IconButton>
    </div>
  ),
};

/** TooltipGroup: one tooltip for the row. Once it shows, it moves to the next button at once, its text changing in place. */
export const Group = {
  render: () => (
    <div style={stage}>
      <TooltipGroup align="bottom">
        <IconButton label="Add" frame="ghost">
          <Glyph d={ADD} />
        </IconButton>
        <IconButton label="Remove" frame="ghost">
          <Glyph d={REMOVE} />
        </IconButton>
        <IconButton label="Menu" frame="ghost">
          <Glyph d={MENU} />
        </IconButton>
        <IconButton label="Close" frame="ghost">
          <Glyph d={CLOSE} />
        </IconButton>
      </TooltipGroup>
    </div>
  ),
};

/** DefinitionTooltip: a term whose definition opens on click, Enter, Space and keyboard focus; `openOnHover` adds hover. */
export const Definition = {
  render: () => (
    <div style={{ ...stage, display: 'block', maxInlineSize: 560 }}>
      <p style={{ margin: 0 }}>
        Each node keeps a{' '}
        <DefinitionTooltip definition="A copy of the data held on another node, kept in step with the first.">
          replica
        </DefinitionTooltip>{' '}
        of the data on a neighbor, and serves reads from it when the{' '}
        <DefinitionTooltip
          openOnHover
          definition="The node that takes every write for a range of keys.">
          leader
        </DefinitionTooltip>{' '}
        is busy.
      </p>
    </div>
  ),
};
