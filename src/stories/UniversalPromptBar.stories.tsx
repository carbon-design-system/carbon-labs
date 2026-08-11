/**
 * Copyright IBM Corp. 2025
 *
 * UniversalPromptBar stories.
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { UniversalPromptBar } from '../components/UniversalPromptBar/UniversalPromptBar';

const meta = {
  title: 'Components/UniversalPromptBar',
  component: UniversalPromptBar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'AI prompt input bar. Controlled input with a submit button that activates once text is entered. Submits on Enter (without Shift) or send-button click.',
      },
    },
  },
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when input is empty',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the entire bar',
    },
    label: {
      control: 'text',
      description: 'Accessible label for the input',
    },
  },
} satisfies Meta<typeof UniversalPromptBar>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled(
  props: React.ComponentProps<typeof UniversalPromptBar>,
) {
  const [value, setValue] = useState(props.value ?? '');
  return (
    <div style={{ width: '32rem', maxWidth: '100%' }}>
      <UniversalPromptBar
        {...props}
        value={value}
        onChange={setValue}
        onSubmit={(v) => { alert(`Submitted: ${v}`); setValue(''); }}
      />
    </div>
  );
}

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
  args: { placeholder: 'Ask anything…', disabled: false, label: 'Prompt' },
};

export const WithInitialValue: Story = {
  name: 'With pre-filled value',
  render: (args) => <Controlled {...args} />,
  args: {
    placeholder: 'Ask anything…',
    value: 'Explain skeleton loaders in one sentence',
    disabled: false,
    label: 'Prompt',
  },
};

export const Disabled: Story = {
  render: (args) => <Controlled {...args} />,
  args: { placeholder: 'Unavailable while loading…', disabled: true, label: 'Prompt' },
};

export const CustomPlaceholder: Story = {
  name: 'Custom placeholder',
  render: (args) => <Controlled {...args} />,
  args: {
    placeholder: 'Search the documentation…',
    disabled: false,
    label: 'Search',
  },
};
