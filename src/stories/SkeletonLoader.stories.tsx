/**
 * Copyright IBM Corp. 2025
 *
 * SkeletonLoader stories.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { SkeletonLoader } from '../components/SkeletonLoader/SkeletonLoader';

const meta = {
  title: 'Components/SkeletonLoader',
  component: SkeletonLoader,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Progressively-revealed skeleton placeholder. Blocks animate in with a staggered fade and pulse continuously while content loads. Mirrors the Figma exploration for Carbon v12 skeleton behavior.',
      },
    },
  },
  argTypes: {
    layout: {
      control: 'select',
      options: ['hero', 'cards-3', 'cards-4'],
      description: 'Layout variant to render',
    },
    aiVariant: {
      control: 'boolean',
      description: 'Activates the blue-tint AI skeleton variant',
    },
    cornerRadius: {
      control: 'boolean',
      description: 'Apply 8 px corner radius to all skeleton blocks',
    },
  },
} satisfies Meta<typeof SkeletonLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hero: Story = {
  name: 'Hero layout',
  args: { layout: 'hero', aiVariant: false, cornerRadius: false },
};

export const Cards3: Story = {
  name: '3-up cards',
  args: { layout: 'cards-3', aiVariant: false, cornerRadius: false },
};

export const Cards4: Story = {
  name: '4-up cards',
  args: { layout: 'cards-4', aiVariant: false, cornerRadius: false },
};

export const HeroRounded: Story = {
  name: 'Hero — rounded corners',
  args: { layout: 'hero', aiVariant: false, cornerRadius: true },
};

export const HeroAI: Story = {
  name: 'Hero — AI variant',
  args: { layout: 'hero', aiVariant: true, cornerRadius: false },
};
