/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import {
  Button,
  Menu,
  MenuItem,
  MenuItemDivider,
  Tile,
  Tooltip,
} from '@carbon/react';
import { KeyboardShortcut } from '../components/KeyboardShortcut';
import '../components/keyboard-shortcut.scss';
import mdx from './KeyboardShortcut.mdx';

const meta: Meta<typeof KeyboardShortcut> = {
  title: 'V12/KeyboardShortcut',
  tags: ['squad', 'incubating'],
  component: KeyboardShortcut,
  parameters: {
    docs: {
      page: mdx,
    },
  },
  args: {
    keys: ['mod', 'K'],
    kind: 'keycap',
    platform: 'auto',
  },
  argTypes: {
    keys: { control: 'object' },
    kind: { control: 'inline-radio', options: ['keycap', 'plain'] },
    platform: {
      control: 'inline-radio',
      options: ['auto', 'mac', 'other'],
    },
    translateWithId: { control: false },
    className: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof KeyboardShortcut>;

/**
 * Keycaps, with the platform detected in the browser.
 */
export const Default: Story = {};

/**
 * Text only, matching the shortcut hint of a Carbon `MenuItem`.
 */
export const Plain: Story = {
  args: { kind: 'plain' },
};

/**
 * Forced to macOS: glyphs, written together.
 */
export const PlatformMac: Story = {
  args: { keys: ['mod', 'shift', 'P'], platform: 'mac' },
};

/**
 * Forced to Windows and Linux: words.
 */
export const PlatformOther: Story = {
  args: { keys: ['mod', 'shift', 'P'], platform: 'other' },
};

/**
 * Five keys, to show how a long combination holds together on one line.
 */
export const LongCombination: Story = {
  args: { keys: ['ctrl', 'alt', 'shift', 'mod', 'backspace'] },
};

/**
 * One named key on its own.
 */
export const SingleKey: Story = {
  args: { keys: ['escape'] },
};

/**
 * Modifiers written out of order are shown in platform order: ⇧⌘P, not ⌘⇧P.
 */
export const ModifierOrder: Story = {
  args: { keys: ['mod', 'shift', 'P'] },
};

/**
 * A digit, to show the keycap's slashed zero (⌘0, reset zoom).
 */
export const Digits: Story = {
  args: { keys: ['mod', '0'] },
};

/**
 * In a right-to-left page the combination still reads in the platform's order,
 * left to right, as on the keyboard.
 */
export const RightToLeft: Story = {
  args: { keys: ['mod', 'shift', 'P'] },
  globals: { dir: 'rtl' },
  render: (args) => (
    <p dir="rtl">
      اضغط <KeyboardShortcut {...args} /> للبحث
    </p>
  ),
};

/**
 * Keycaps inside a Carbon Tooltip, which uses the inverse surface.
 */
export const InTooltip: Story = {
  args: { keys: ['mod', 'K'] },
  render: (args) => (
    <div>
      <Tooltip
        align="bottom"
        defaultOpen
        label={
          <>
            Search <KeyboardShortcut {...args} />
          </>
        }>
        <Button kind="tertiary">Search</Button>
      </Tooltip>
    </div>
  ),
};

/**
 * Keycaps on a Carbon Tile ($layer-01) with no Layer around it, so the keycap's
 * contextual $layer is the same token as the tile.
 */
export const OnTile: Story = {
  args: { keys: ['mod', 'K'] },
  render: (args) => (
    <Tile>
      Press <KeyboardShortcut {...args} /> to search
    </Tile>
  ),
};

/**
 * Left: Carbon's `MenuItem` with its own `shortcut` strings, as Carbon's Menu
 * story writes them. Right: the same items with `KeyboardShortcut kind="plain"`
 * in the `shortcut` slot. The type and colour should be identical, at rest and
 * on hover.
 *
 * `MenuItem.shortcut` is typed `string` today, so the right-hand menu casts and
 * logs one prop-type warning. Widening it is a graduation-time proposal, not
 * part of this component.
 */
export const InsideMenu: Story = {
  args: { kind: 'plain', platform: 'mac' },
  argTypes: { keys: { control: false } },
  render: ({ kind, platform }) => {
    // @carbon-proposal api: menu-item-shortcut-node — MenuItem.shortcut is typed string, so a KeyboardShortcut cannot be its hint. TBD
    const shortcut = (keys: string[]) =>
      (
        <KeyboardShortcut keys={keys} kind={kind} platform={platform} />
      ) as unknown as string;
    return (
      <div>
        <Menu label="Carbon MenuItem.shortcut" open x={16} y={16} mode="basic">
          <MenuItem label="Cut" shortcut="⌘X" />
          <MenuItem label="Copy" shortcut="⌘C" />
          <MenuItem label="Paste" shortcut="⌘V" />
          <MenuItem label="Rename" shortcut="⌘R" disabled />
          <MenuItemDivider />
          <MenuItem label="Delete" shortcut="⌫" kind="danger" />
        </Menu>
        <Menu label="KeyboardShortcut" open x={288} y={16} mode="basic">
          <MenuItem label="Cut" shortcut={shortcut(['mod', 'X'])} />
          <MenuItem label="Copy" shortcut={shortcut(['mod', 'C'])} />
          <MenuItem label="Paste" shortcut={shortcut(['mod', 'V'])} />
          <MenuItem label="Rename" shortcut={shortcut(['mod', 'R'])} disabled />
          <MenuItemDivider />
          <MenuItem
            label="Delete"
            shortcut={shortcut(['remove'])}
            kind="danger"
          />
        </Menu>
      </div>
    );
  },
};
