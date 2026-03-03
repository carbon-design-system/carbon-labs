/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Grid } from '@carbon/react';

import { SquareCard } from './square-card';

const stories = {
  title: 'Components/MDX Components/Cards/SquareCard',
  component: SquareCard,
  argTypes: {
    children: {
      control: false,
    },
    className: {
      control: false,
    },
  },
};

export default stories;

const Template = (args) => (
  <div className="square-card-group">
    <Grid>
      <SquareCard
        title="Download Resources"
        bodyText="Templates and assets"
        href="/downloads"
        actionIcon="download"
        {...args}
      />
    </Grid>
  </div>
);

export const Default = Template.bind({});
Default.args = {};
