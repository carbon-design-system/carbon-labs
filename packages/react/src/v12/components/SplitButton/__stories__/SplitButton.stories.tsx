/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { MenuItem } from '@carbon-labs/react-menu';
import { SplitButton } from '../index';
import type { SplitButtonProps } from '../index';
import mdx from './SplitButton.mdx';

export default {
  title: 'V12/SplitButton',
  component: SplitButton,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'hover',
        'press-and-release',
        'chevron',
        'menu',
        'busy',
        'focus',
      ],
      reduced: {
        hover: 'at-once',
        'press-and-release': 'at-once',
        chevron: 'at-once',
        menu: 'at-once',
        busy: 'at-once',
      },
      states: ['rest', 'hover', 'press', 'focus', 'open', 'disabled', 'busy'],
    },
  },
  argTypes: {
    kind: { control: 'inline-radio', options: ['primary', 'secondary'] },
    variant: {
      control: 'inline-radio',
      options: ['filled', 'outlined', 'tonal'],
    },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    corners: {
      control: 'inline-radio',
      options: ['rounded', 'full', 'square'],
    },
    menuAlignment: {
      control: 'select',
      options: ['top-start', 'top-end', 'bottom-start', 'bottom-end'],
    },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    children: { control: false },
    motion: { control: false },
    menuTarget: { control: false },
  },
};

/** Room below the buttons, so their menus are never clipped. */
const stage = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  gap: 24,
  flexWrap: 'wrap' as const,
  padding: '32px 120px 200px',
};

/** Press the action, or the chevron for the related actions. ↓, Enter or Space on the chevron open the menu on its first row, ↑ on its last. */
export const Default = {
  args: {
    label: 'Save',
    kind: 'primary',
    variant: 'filled',
    size: 'lg',
    disabled: false,
    busy: false,
  },
  render: (args: SplitButtonProps) => (
    <div style={stage}>
      <SplitButton {...args}>
        <MenuItem label="Save as draft" />
        <MenuItem label="Save and close" />
        <MenuItem label="Save a copy" />
      </SplitButton>
    </div>
  ),
};

/** Primary and secondary, filled, outlined and tonal. The seam between the cells follows the look. */
export const Looks = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      {(['primary', 'secondary'] as const).map((kind) => (
        <div key={kind} style={{ ...stage, padding: '16px 120px' }}>
          {(['filled', 'outlined', 'tonal'] as const).map((variant) => (
            <SplitButton
              key={variant}
              label="Save"
              kind={kind}
              variant={variant}
              size="md">
              <MenuItem label="Save as draft" />
              <MenuItem label="Save and close" />
            </SplitButton>
          ))}
        </div>
      ))}
    </div>
  ),
};

/** xs 24, sm 32, md 40 and lg 48. An xs button opens an sm menu. */
export const Sizes = {
  render: () => (
    <div style={stage}>
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <SplitButton key={size} label="Save" size={size}>
          <MenuItem label="Save as draft" />
          <MenuItem label="Save and close" />
        </SplitButton>
      ))}
    </div>
  ),
};

/** Click Save: the action shows a spinner while it runs, and the chevron is disabled. */
export const Busy = {
  render: function BusyStory() {
    const [busy, setBusy] = useState(false);
    useEffect(() => {
      if (!busy) {
        return;
      }
      const t = window.setTimeout(() => setBusy(false), 1500);
      return () => window.clearTimeout(t);
    }, [busy]);
    return (
      <div style={stage}>
        <SplitButton label="Save" busy={busy} onClick={() => setBusy(true)}>
          <MenuItem label="Save as draft" />
          <MenuItem label="Save and close" />
          <MenuItem label="Save a copy" />
        </SplitButton>
      </div>
    );
  },
};
