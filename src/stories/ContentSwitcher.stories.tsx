/**
 * Copyright IBM Corp. 2025
 *
 * ContentSwitcher stories.
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ContentSwitcher } from '../components/ContentSwitcher/ContentSwitcher';

const THEME_OPTIONS = [
  { label: 'G100', value: 'g100' },
  { label: 'G10',  value: 'g10' },
  { label: 'G10 AI', value: 'g10ai' },
];

const VIEW_OPTIONS = [
  { label: 'List',    value: 'list' },
  { label: 'Tile',    value: 'tile' },
  { label: 'Gallery', value: 'gallery' },
];

const meta = {
  title: 'Components/ContentSwitcher',
  component: ContentSwitcher,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Segmented control for mutually exclusive options. Supports keyboard navigation (arrow keys, Home, End) and exposes onChange for controlled usage.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Visual size',
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the group',
    },
  },
} satisfies Meta<typeof ContentSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled(
  props: React.ComponentProps<typeof ContentSwitcher>,
) {
  const [value, setValue] = useState(props.options[0]?.value ?? '');
  return (
    <ContentSwitcher
      {...props}
      value={value}
      onChange={setValue}
    />
  );
}

export const ThemeSwitcher: Story = {
  name: 'Theme switcher (3 options)',
  render: (args) => <Controlled {...args} />,
  args: { options: THEME_OPTIONS, value: 'g100', onChange: () => {} },
};

export const ViewSwitcher: Story = {
  name: 'View switcher (3 options)',
  render: (args) => <Controlled {...args} />,
  args: { options: VIEW_OPTIONS, value: 'list', onChange: () => {} },
};

export const Small: Story = {
  render: (args) => <Controlled {...args} />,
  args: { options: VIEW_OPTIONS, value: 'list', onChange: () => {}, size: 'sm' },
};

export const Large: Story = {
  render: (args) => <Controlled {...args} />,
  args: { options: VIEW_OPTIONS, value: 'list', onChange: () => {}, size: 'lg' },
};

export const WithDisabledOption: Story = {
  name: 'With disabled option',
  render: (args) => <Controlled {...args} />,
  args: {
    options: [
      { label: 'List', value: 'list' },
      { label: 'Tile', value: 'tile', disabled: true },
      { label: 'Gallery', value: 'gallery' },
    ],
    value: 'list',
    onChange: () => {},
  },
};
