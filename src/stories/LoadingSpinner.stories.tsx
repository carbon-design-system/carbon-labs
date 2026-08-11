/**
 * Copyright IBM Corp. 2025
 *
 * LoadingSpinner stories.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { LoadingSpinner } from '../components/LoadingSpinner/LoadingSpinner';

const meta = {
  title: 'Components/LoadingSpinner',
  component: LoadingSpinner,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Indeterminate circular spinner. The fill arc rotates continuously using a CSS animation driven by --cmw-spinner-spin-duration. Respects prefers-reduced-motion via the token layer.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Visual size',
    },
    description: {
      control: 'text',
      description: 'Accessible screen-reader label',
    },
  },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Medium: Story = {
  args: { size: 'md', description: 'Loading' },
};

export const Small: Story = {
  args: { size: 'sm', description: 'Loading' },
};

export const Large: Story = {
  args: { size: 'lg', description: 'Loading data' },
};

export const CustomDescription: Story = {
  name: 'Custom accessible description',
  args: { size: 'md', description: 'Uploading files, please wait' },
};
