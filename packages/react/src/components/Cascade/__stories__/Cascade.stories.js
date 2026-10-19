/**
 * @license
 *
 * Copyright IBM Corp. 2021, 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Column } from '@carbon/react';
import mdx from './Cascade.mdx';
import { Cascade } from '../components/Cascade';
import '../components/cascade.scss';
import './storybook.scss';

export default {
  title: 'Components/Cascade',
  component: Cascade,
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: mdx,
    },
  },
};

/**
 * Template for Cascade without grid support
 * @param {object} args story args
 * @returns {React.ReactElement} the story
 */
const DefaultTemplate = (args) => {
  return (
    <Cascade {...args}>
      <div className="box" />
      <div className="box" />
      <div className="box" />
      <div className="box" />
      <div className="box" />
      <div className="box" />
      <div className="box" />
      <div className="box" />
    </Cascade>
  );
};

/**
 * Template for Cascade with grid support
 * @param {object} args story args
 * @returns {React.ReactElement} the story
 */
const GridTemplate = (args) => {
  /**
   * Builds a row of columns
   * @param {string} rowKey unique key prefix for the row
   * @returns {React.ReactElement[]} the columns
   */
  const getBoxes = (rowKey) =>
    Array.from({ length: 4 }, (_, index) => (
      <Column lg={4} key={`${rowKey}-${index}`}>
        <div className="grid-box" />
      </Column>
    ));

  return (
    <Cascade {...args}>
      {getBoxes('first')}
      {getBoxes('second')}
    </Cascade>
  );
};

/**
 * Cascade without grid support
 */
export const WithoutGrid = DefaultTemplate.bind({});
WithoutGrid.args = {};

/**
 * Cascade with grid support
 */
export const WithGrid = GridTemplate.bind({});
WithGrid.args = {
  grid: true,
};
