/**
 * Copyright IBM Corp. 2025
 *
 * Processing stories.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Processing } from '../components/Processing/Processing';

const meta = {
  title: 'Components/Processing',
  component: Processing,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'In-progress state indicator with animated ring (active), checkmark (complete), and error cross (error) states. Designed to pair with async operations.',
      },
    },
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['active', 'complete', 'error'],
      description: 'Current processing status',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Visual size',
    },
    label: {
      control: 'text',
      description: 'Accessible label describing what is being processed',
    },
    hideLabel: {
      control: 'boolean',
      description: 'Hide the label visually (still read by screen readers)',
    },
  },
} satisfies Meta<typeof Processing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: { status: 'active', label: 'Processing payment', size: 'md' },
};

export const Complete: Story = {
  args: { status: 'complete', label: 'Payment complete', size: 'md' },
};

export const Error: Story = {
  args: { status: 'error', label: 'Payment failed', size: 'md' },
};

export const SmallActive: Story = {
  name: 'Small — active',
  args: { status: 'active', label: 'Loading', size: 'sm' },
};

export const LargeComplete: Story = {
  name: 'Large — complete',
  args: { status: 'complete', label: 'Upload complete', size: 'lg' },
};

export const HiddenLabel: Story = {
  name: 'Hidden label (icon-only)',
  args: { status: 'active', label: 'Uploading file', size: 'md', hideLabel: true },
};
