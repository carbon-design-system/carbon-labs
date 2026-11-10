/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Slider } from '@carbon-labs/react-slider';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import {
  Copy,
  Cut,
  Download,
  Link,
  ListBulleted,
  ListNumbered,
  Paste,
  Redo,
  Share,
  TextAlignCenter,
  TextAlignLeft,
  TextAlignRight,
  TextBold,
  TextItalic,
  TextUnderline,
  TrashCan,
  Undo,
  ZoomIn,
  ZoomOut,
} from '@carbon-labs/react-motion-icons';
import {
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarGroup,
  ToolbarToggle,
  ToolbarToggleGroup,
} from '../index';
import type { ToolbarProps } from '../index';
import mdx from './Toolbar.mdx';

const SIZES = ['xs', 'sm', 'md', 'lg'] as const;
const VARIANTS = ['inverse', 'tonal', 'outlined', 'hero'] as const;

export default {
  title: 'V12/Toolbar',
  component: Toolbar,
  subcomponents: {
    ToolbarButton,
    ToolbarToggle,
    ToolbarToggleGroup,
    ToolbarGroup,
    ToolbarDivider,
  },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'rollover',
        'selection-glide',
        'pressed-fill',
        'tooltip',
        'snap-mark',
        'overflow',
      ],
      reduced: {
        'pressed-fill': 'full',
        tooltip: 'at-once',
        'snap-mark': 'at-once',
      },
      states: ['rest', 'hover', 'pressed', 'disabled', 'overflowed'],
    },
  },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
    },
    size: { control: 'inline-radio', options: SIZES },
    variant: { control: 'inline-radio', options: VARIANTS },
    corners: {
      control: 'inline-radio',
      options: ['full', 'rounded', 'square'],
    },
    interaction: {
      control: 'inline-radio',
      options: ['preview', 'lightness'],
    },
    outlinedFill: { control: 'inline-radio', options: ['subtle', 'raised'] },
    groupFrame: { control: 'inline-radio', options: ['inset', 'ghost'] },
    overflow: { control: 'inline-radio', options: ['menu', 'none'] },
    surface: {
      control: 'inline-radio',
      options: ['none', 'filled', 'outlined'],
    },
    tooltipAlign: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    overflowLabel: { control: 'text' },
    motion: { control: false },
    children: { control: false },
  },
};

const stack = {
  display: 'grid',
  gap: 24,
  justifyItems: 'start',
  paddingBlockEnd: 48,
};

/** An editor's controls: actions, a multiple group, an exclusive group and a toggle. An array, so each is a unit of the row. */
const editorControls = () => [
  <ToolbarGroup key="history" label="History">
    <ToolbarButton label="Undo" renderIcon={Undo} />
    <ToolbarButton label="Redo" renderIcon={Redo} />
  </ToolbarGroup>,
  <ToolbarDivider key="d1" />,
  <ToolbarToggleGroup key="style" type="multiple" label="Text style">
    <ToolbarToggle label="Bold" renderIcon={TextBold} />
    <ToolbarToggle label="Italic" renderIcon={TextItalic} />
    <ToolbarToggle label="Underline" renderIcon={TextUnderline} />
  </ToolbarToggleGroup>,
  <ToolbarDivider key="d2" />,
  <ToolbarToggleGroup key="align" type="single" label="Alignment">
    <ToolbarToggle label="Align left" renderIcon={TextAlignLeft} />
    <ToolbarToggle label="Align center" renderIcon={TextAlignCenter} />
    <ToolbarToggle label="Align right" renderIcon={TextAlignRight} />
  </ToolbarToggleGroup>,
  <ToolbarDivider key="d3" />,
  <ToolbarToggle key="link" label="Link" renderIcon={Link} />,
  <ToolbarGroup key="lists" label="Lists">
    <ToolbarToggle label="Bulleted list" renderIcon={ListBulleted} />
    <ToolbarToggle label="Numbered list" renderIcon={ListNumbered} />
  </ToolbarGroup>,
];

/** A row of controls with one tab stop. Tab in, then use the arrow keys. */
export const Default = {
  args: {
    'aria-label': 'Text formatting',
    orientation: 'horizontal',
    size: 'md',
    variant: 'inverse',
    corners: 'full',
    groupFrame: 'inset',
    overflow: 'menu',
    overflowLabel: 'More',
    surface: 'none',
    wrap: false,
  },
  render: (args: ToolbarProps) => (
    <div style={stack}>
      <Toolbar {...args}>{editorControls()}</Toolbar>
    </div>
  ),
};

/** Toggles: a multiple group's fills fade in and out; an exclusive group's selector glides. Press and drag it. */
export const Groups = {
  render: function GroupsStory() {
    const [styles, setStyles] = useState<string[]>(['Bold']);
    const [align, setAlign] = useState('left');
    return (
      <div style={stack}>
        <Toolbar aria-label="Text formatting">
          <ToolbarToggleGroup
            type="multiple"
            label="Text style"
            value={styles}
            onChange={setStyles}>
            <ToolbarToggle label="Bold" renderIcon={TextBold} />
            <ToolbarToggle label="Italic" renderIcon={TextItalic} />
            <ToolbarToggle label="Underline" renderIcon={TextUnderline} />
          </ToolbarToggleGroup>
          <ToolbarDivider />
          <ToolbarToggleGroup
            type="single"
            label="Alignment"
            value={align}
            onChange={setAlign}>
            <ToolbarToggle
              label="Align left"
              value="left"
              renderIcon={TextAlignLeft}
            />
            <ToolbarToggle
              label="Align center"
              value="center"
              renderIcon={TextAlignCenter}
            />
            <ToolbarToggle
              label="Align right"
              value="right"
              renderIcon={TextAlignRight}
            />
          </ToolbarToggleGroup>
        </Toolbar>
        <p style={{ margin: 0 }}>
          Style: {styles.length ? styles.join(', ') : 'none'}. Alignment:{' '}
          {align}.
        </p>
        <Toolbar aria-label="Alignment, no track" groupFrame="ghost">
          <ToolbarToggleGroup type="single" label="Alignment">
            <ToolbarToggle label="Align left" renderIcon={TextAlignLeft} />
            <ToolbarToggle label="Align center" renderIcon={TextAlignCenter} />
            <ToolbarToggle label="Align right" renderIcon={TextAlignRight} />
          </ToolbarToggleGroup>
        </Toolbar>
      </div>
    );
  },
};

/** Narrow the container: trailing controls move into the More menu, and the More button snaps in. A choice in the menu changes the row. */
export const Overflow = {
  render: function OverflowStory() {
    const [width, setWidth] = useState(220);
    return (
      <div style={{ ...stack, paddingBlockEnd: 320 }}>
        <div style={{ maxInlineSize: 320 }}>
          <Slider
            labelText="Width (px)"
            hideTextInput
            min={120}
            max={640}
            step={10}
            value={width}
            onChange={({ value }) => setWidth(value)}
          />
        </div>
        <div style={{ inlineSize: width }}>
          <Toolbar aria-label="Text formatting">{editorControls()}</Toolbar>
        </div>
      </div>
    );
  },
};

/** A column, as a side toolbar. Tooltips sit to its right; ↑ and ↓ move between controls. */
export const Vertical = {
  render: () => (
    <div style={stack}>
      <Toolbar aria-label="Canvas tools" orientation="vertical">
        <ToolbarButton label="Zoom in" renderIcon={ZoomIn} />
        <ToolbarButton label="Zoom out" renderIcon={ZoomOut} />
        <ToolbarDivider />
        <ToolbarToggleGroup type="single" label="Alignment">
          <ToolbarToggle label="Align left" renderIcon={TextAlignLeft} />
          <ToolbarToggle label="Align center" renderIcon={TextAlignCenter} />
          <ToolbarToggle label="Align right" renderIcon={TextAlignRight} />
        </ToolbarToggleGroup>
        <ToolbarDivider />
        <ToolbarButton label="Delete" renderIcon={TrashCan} />
      </Toolbar>
    </div>
  ),
};

/** The four sizes: xs 24, sm 32, md 40 and lg 48px. */
export const Sizes = {
  render: () => (
    <div style={stack}>
      {SIZES.map((size) => (
        <Toolbar key={size} aria-label={`Size ${size}`} size={size}>
          <ToolbarButton label="Cut" renderIcon={Cut} />
          <ToolbarButton label="Copy" renderIcon={Copy} />
          <ToolbarButton label="Paste" renderIcon={Paste} />
          <ToolbarDivider />
          <ToolbarToggleGroup type="single" label="Alignment">
            <ToolbarToggle label="Align left" renderIcon={TextAlignLeft} />
            <ToolbarToggle label="Align center" renderIcon={TextAlignCenter} />
            <ToolbarToggle label="Align right" renderIcon={TextAlignRight} />
          </ToolbarToggleGroup>
        </Toolbar>
      ))}
    </div>
  ),
};

/** The variants: inverse, tonal, outlined and hero. Press the toggles to see each pressed fill. */
export const Variants = {
  render: () => (
    <div style={stack}>
      {VARIANTS.map((variant) => (
        <Toolbar key={variant} aria-label={variant} variant={variant}>
          <ToolbarToggleGroup
            type="multiple"
            label="Text style"
            defaultValue={['Bold']}>
            <ToolbarToggle label="Bold" renderIcon={TextBold} />
            <ToolbarToggle label="Italic" renderIcon={TextItalic} />
            <ToolbarToggle label="Underline" renderIcon={TextUnderline} />
          </ToolbarToggleGroup>
          <ToolbarDivider />
          <ToolbarToggleGroup type="single" label="Alignment">
            <ToolbarToggle label="Align left" renderIcon={TextAlignLeft} />
            <ToolbarToggle label="Align center" renderIcon={TextAlignCenter} />
            <ToolbarToggle label="Align right" renderIcon={TextAlignRight} />
          </ToolbarToggleGroup>
        </Toolbar>
      ))}
    </div>
  ),
};

/** A surface of its own, filled or outlined, and buttons that show their labels. */
export const Surfaces = {
  render: () => (
    <div style={stack}>
      {(['filled', 'outlined'] as const).map((surface) => (
        <Toolbar
          key={surface}
          aria-label={`${surface} surface`}
          surface={surface}>
          <ToolbarButton label="Share" renderIcon={Share} showLabel />
          <ToolbarButton label="Download" renderIcon={Download} showLabel />
          <ToolbarDivider />
          <ToolbarButton label="Copy" renderIcon={Copy} />
          <ToolbarButton label="Delete" renderIcon={TrashCan} disabled />
        </Toolbar>
      ))}
    </div>
  ),
};
