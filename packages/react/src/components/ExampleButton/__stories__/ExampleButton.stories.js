import React from 'react';
import mdx from './ExampleButton.mdx';
import { ExampleButton } from '../components/ExampleButton';

export default {
  title: 'Components/ExampleButton',
  component: ExampleButton,
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

/**
 *
 */
export const Default = () => <ExampleButton />;
