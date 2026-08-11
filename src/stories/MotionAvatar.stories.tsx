/**
 * Copyright IBM Corp. 2025
 *
 * MotionAvatar stories.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { MotionAvatar } from '../components/MotionAvatar/MotionAvatar';

const meta = {
  title: 'Components/MotionAvatar',
  component: MotionAvatar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Animated presence indicator for AI interaction states. Idles with a gentle pulse, shifts to an orbiting ring while thinking, and emits a wave ripple while responding.',
      },
    },
  },
  argTypes: {
    state: {
      control: 'select',
      options: ['idle', 'thinking', 'responding'],
      description: 'Current AI presence state',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Visual size',
    },
    label: {
      control: 'text',
      description: 'Accessible label (overrides the default state label)',
    },
  },
} satisfies Meta<typeof MotionAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: { state: 'idle', size: 'md' },
};

export const Thinking: Story = {
  args: { state: 'thinking', size: 'md' },
};

export const Responding: Story = {
  args: { state: 'responding', size: 'md' },
};

export const AllStates: Story = {
  name: 'All states — side by side',
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <MotionAvatar state="idle" size="lg" />
        <span style={{ fontSize: '0.75rem' }}>Idle</span>
      </div>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <MotionAvatar state="thinking" size="lg" />
        <span style={{ fontSize: '0.75rem' }}>Thinking</span>
      </div>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <MotionAvatar state="responding" size="lg" />
        <span style={{ fontSize: '0.75rem' }}>Responding</span>
      </div>
    </div>
  ),
};

export const Small: Story = {
  args: { state: 'thinking', size: 'sm' },
};

export const Large: Story = {
  args: { state: 'responding', size: 'lg' },
};
