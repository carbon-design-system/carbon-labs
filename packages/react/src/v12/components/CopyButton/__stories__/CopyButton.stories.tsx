/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { TooltipMotion } from '@carbon-labs/v12-motion';
import type { TooltipAlign } from '@carbon-labs/react-tooltip';
import { CopyButton } from '../index';
import type { CopyButtonProps } from '../index';
import mdx from './CopyButton.mdx';

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

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

export default {
  title: 'V12/CopyButton',
  component: CopyButton,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'rollover',
        'copied-mark',
        'icon-hover',
        'tooltip',
        'feedback-roll',
        're-placing',
        'slow-motion',
      ],
      reduced: {
        rollover: 'at-once',
        'copied-mark': 'at-once',
        'icon-hover': 'at-once',
        'feedback-roll': 'at-once',
      },
      states: ['rest', 'hover', 'press', 'focus', 'copied', 'disabled'],
    },
  },
  argTypes: {
    align: { control: 'select', options: ALIGNMENTS },
    kind: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'danger'],
    },
    variant: { control: 'inline-radio', options: ['filled', 'outlined'] },
    frame: { control: 'inline-radio', options: ['ghost', 'inset'] },
    size: { control: 'inline-radio', options: SIZES },
  },
};

/** Room around the buttons, so their tooltips are never clipped. */
const stage = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 16,
  flexWrap: 'wrap' as const,
  padding: '72px 120px',
};

/** Writes text to the clipboard: the button itself doesn't. */
const copyText = (text: string) => {
  navigator.clipboard?.writeText(text).catch(() => {});
};

/** Click it: the icon closes into a checkmark, and the tooltip's text moves sideways to the feedback; both go back after `feedbackTimeout`. */
export const Default = {
  args: {
    iconDescription: 'Copy to clipboard',
    feedback: 'Copied',
    feedbackTimeout: 2000,
    align: 'bottom',
    frame: 'ghost',
    size: 'md',
    disabled: false,
  },
  render: (args: CopyButtonProps) => (
    <div style={stage}>
      <CopyButton {...args} onClick={() => copyText('Copied text')} />
    </div>
  ),
};

/** The ghost frame and the inset frame, at each size. The icon is 16px, and 20px from lg. */
export const FramesAndSizes = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      {(['ghost', 'inset'] as const).map((frame) => (
        <div key={frame} style={{ ...stage, padding: '16px 120px 56px' }}>
          {SIZES.map((size) => (
            <CopyButton
              key={size}
              frame={frame}
              size={size}
              onClick={() => copyText(`${frame} ${size}`)}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

const SNIPPET = 'npm install @carbon/react';

/** A command beside its copy button. Click twice in a row: each copy plays the action again and restarts the timeout. */
export const WithText = {
  render: () => (
    <div style={stage}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          paddingInlineStart: 16,
          background: 'var(--cds-layer-01)',
        }}>
        <code>{SNIPPET}</code>
        <CopyButton
          iconDescription="Copy command"
          feedback="Command copied"
          onClick={() => copyText(SNIPPET)}
        />
      </div>
    </div>
  ),
};

/** Slow motion: `TooltipMotion`'s `timeScale` reaches the tooltip, the rollover and the feedback roll. Here they run at a quarter speed. */
export const SlowMotion = {
  render: () => (
    <TooltipMotion timeScale={4}>
      <div style={stage}>
        <CopyButton onClick={() => copyText('Copied text')} />
        <CopyButton frame="inset" onClick={() => copyText('Copied text')} />
      </div>
    </TooltipMotion>
  ),
};
