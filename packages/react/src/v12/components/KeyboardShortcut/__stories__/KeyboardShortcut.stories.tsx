/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Menu, MenuItem, MenuItemDivider } from '@carbon/react';
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
          <MenuItemDivider />
          <MenuItem label="Delete" shortcut="⌫" />
        </Menu>
        <Menu label="KeyboardShortcut" open x={288} y={16} mode="basic">
          <MenuItem label="Cut" shortcut={shortcut(['mod', 'X'])} />
          <MenuItem label="Copy" shortcut={shortcut(['mod', 'C'])} />
          <MenuItem label="Paste" shortcut={shortcut(['mod', 'V'])} />
          <MenuItemDivider />
          <MenuItem label="Delete" shortcut={shortcut(['backspace'])} />
        </Menu>
      </div>
    );
  },
};
