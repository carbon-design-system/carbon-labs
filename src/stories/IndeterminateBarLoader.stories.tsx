/**
 * Copyright IBM Corp. 2025
 *
 * IndeterminateBarLoader stories.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { IndeterminateBarLoader } from '../components/IndeterminateBarLoader/IndeterminateBarLoader';

const meta = {
  title: 'Components/IndeterminateBarLoader',
  component: IndeterminateBarLoader,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Linear indeterminate progress bar. A filled segment slides across the track continuously. Typically used below a heading or above content that is loading.',
      },
    },
  },
  argTypes: {
    active: {
      control: 'boolean',
      description: 'Whether the bar is actively animating',
    },
    label: {
      control: 'text',
      description: 'Accessible label (also shown below the bar unless hideLabel is set)',
    },
    hideLabel: {
      control: 'boolean',
      description: 'Hide the label visually',
    },
  },
} satisfies Meta<typeof IndeterminateBarLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { active: true, label: 'Loading', hideLabel: false },
  decorators: [(Story) => <div style={{ width: '20rem' }}><Story /></div>],
};

export const FullWidth: Story = {
  name: 'Full width',
  args: { active: true, label: 'Fetching results', hideLabel: false },
  decorators: [(Story) => <div style={{ width: '100%' }}><Story /></div>],
};

export const HiddenLabel: Story = {
  name: 'Hidden label',
  args: { active: true, label: 'Loading', hideLabel: true },
  decorators: [(Story) => <div style={{ width: '20rem' }}><Story /></div>],
};

export const Inactive: Story = {
  name: 'Inactive (no animation)',
  args: { active: false, label: 'Idle', hideLabel: false },
  decorators: [(Story) => <div style={{ width: '20rem' }}><Story /></div>],
};
