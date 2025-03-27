/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { H1 } from './h1';
import { H2 } from './h2';
import { H3 } from './h3';
import { H4 } from './h4';
import { H5 } from './h5';
import { H6 } from './h6';

export default {
  title: 'MDX Components/Markdown/Headings',
  component: H1,
  argTypes: {
    children: {
      control: false
    },
    className: {
      control: false
    },
    headingClassName: {
      control: false
    }
  }
}

const H1Template = (args) => (
  <>
    <H1 {...args}>This is a Heading 1</H1>
    <H2 {...args}>This is a Heading 2</H2>
    <H3 {...args}>This is a Heading 3</H3>
    <H4 {...args}>This is a Heading 4</H4>
    <H5 {...args}>This is a Heading 5</H5>
    <H6 {...args}>This is a Heading 6</H6>
  </>
)

export const Default = H1Template.bind({})
Default.args = {}
