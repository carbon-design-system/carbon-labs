/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Button } from '@carbon-labs/react-button';
import {
  Toggletip,
  ToggletipActions,
  ToggletipButton,
  ToggletipContent,
  ToggletipLabel,
} from '../index';
import type { ToggletipProps } from '../index';
import mdx from './Toggletip.mdx';

type Alignment = NonNullable<ToggletipProps['align']>;

const ALIGNMENTS: Alignment[] = [
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
  title: 'V12/Toggletip',
  component: Toggletip,
  subcomponents: {
    ToggletipButton,
    ToggletipContent,
    ToggletipActions,
    ToggletipLabel,
  },
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
        'rollover',
        'motion-icon',
      ],
      reduced: {
        snap: 'at-once',
        out: 'at-once',
        fade: 'at-once',
        interrupted: 'at-once',
        'soft-edge': 'at-once',
        rollover: 'at-once',
      },
      states: ['closed', 'open'],
    },
  },
  argTypes: {
    align: { control: 'select', options: ALIGNMENTS },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    as: { control: false },
    autoAlignBoundary: { control: false },
  },
};

/** Room around the button, so the panel is never clipped. */
const stage = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  gap: 24,
  flexWrap: 'wrap' as const,
  padding: '200px 180px 240px',
};

const prevent = (e: React.MouseEvent) => e.preventDefault();

/** Press the button: the panel grows from the press. Press again while it leaves to turn it round. */
export const Default = {
  args: {
    align: 'bottom',
    autoAlign: false,
    exitFade: true,
    timeScale: 1,
  },
  render: (args: ToggletipProps) => (
    <div style={stage}>
      <ToggletipLabel>Storage</ToggletipLabel>
      <Toggletip {...args}>
        <ToggletipButton label="Show storage information" />
        <ToggletipContent>
          <p>
            Storage counts every file, its older versions and the trash. Older
            versions are removed after 30 days.
          </p>
          <ToggletipActions>
            <a href="#storage" onClick={prevent}>
              Learn more
            </a>
            <Button size="sm" variant="outlined">
              Manage storage
            </Button>
          </ToggletipActions>
        </ToggletipContent>
      </Toggletip>
    </div>
  ),
};

/** Opened from the start, with no gesture, the panel is there with no motion. */
export const Open = {
  render: () => (
    <div style={stage}>
      <ToggletipLabel>Retention</ToggletipLabel>
      <Toggletip defaultOpen align="bottom-start">
        <ToggletipButton label="Show retention information" />
        <ToggletipContent>
          <p>Deleted items stay in the trash for 30 days.</p>
        </ToggletipContent>
      </Toggletip>
    </div>
  ),
};

/** Four sides. Open each one: the panel sits 4px off the button. */
export const Alignments = {
  render: () => (
    <div style={stage}>
      {(['top', 'bottom', 'left', 'right'] as const).map((align) => (
        <span
          key={align}
          style={{ display: 'inline-flex', alignItems: 'center' }}>
          <ToggletipLabel>{align}</ToggletipLabel>
          <Toggletip align={align}>
            <ToggletipButton label={`Show information, ${align}`} />
            <ToggletipContent>
              <p>Aligned to the {align} of the button.</p>
            </ToggletipContent>
          </Toggletip>
        </span>
      ))}
    </div>
  ),
};

/** In a line of text: the button keeps a 16px box, so the line keeps its height. */
export const InText = {
  render: () => (
    <div style={{ padding: '32px 160px 200px', maxInlineSize: 720 }}>
      <p style={{ margin: 0 }}>
        Each bucket keeps 30 days of versions{' '}
        <Toggletip align="bottom">
          <ToggletipButton label="Show version information" />
          <ToggletipContent>
            A version is saved each time a file changes.
          </ToggletipContent>
        </Toggletip>{' '}
        unless its policy says otherwise.
      </p>
    </div>
  ),
};
