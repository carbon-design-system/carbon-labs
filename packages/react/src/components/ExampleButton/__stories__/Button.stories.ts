import type { Meta, StoryObj } from '@storybook/react';
import mdx from './Accordion.mdx';
import { ExampleButton } from '../components/ExampleButton';

const meta = {
  title: 'Example/ExampleButton',
  component: ExampleButton,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
    docs: {
      page: mdx,
    },
  },
} satisfies Meta<typeof ExampleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedIn: Story = {
  args: {
    user: {
      name: 'Jane Doe',
    },
  },
};
