/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { action } from '@storybook/addon-actions';
import mdx from './SplitPanel.mdx';
import { SplitPanel } from '../components/SplitPanel';
import '../components/split-panel.scss';

export default {
  title: 'Components/SplitPanel',
  component: SplitPanel,
  parameters: {
    docs: {
      page: mdx,
    },
  },
  argTypes: {
    // foo is the property we want to remove from the UI
    childrenBeforeSplit: {
      control: false,
    },
    childrenAfterSplit: {
      control: false,
    },
    onChange: {
      control: false,
    },
  },
};

const actionSplitValue = action('split value');
const actionSplitValueA = action('Panel A split value');
const actionSplitValueB = action('Panel B split value');

/**
 * Default story for SplitPanel
 *
 * @param {any} args - props from story controls
 */
export const Default = (args) => (
  <div>
    <SplitPanel
      style={{
        height: '400px',
        width: '600px',
        margin: '16px',
      }}
      onChange={(splitValue) => actionSplitValue(splitValue)}
      childrenBeforeSplit={
        <div>
          <h2>Children before split</h2>
          <ul>
            <li>One</li>
            <li>Two</li>
            <li>Three</li>
          </ul>
        </div>
      }
      childrenAfterSplit={
        <div>
          <h2>Children after split</h2>
          <ul>
            <li>Apple</li>
            <li>Banana</li>
            <li>Pear</li>
          </ul>
        </div>
      }
      {...args}
    />
  </div>
);

/**
 * Horizontal example story for SplitPanel
 *
 * @param {any} args - props from story controls
 */
export const Horizontal = (args) => (
  <SplitPanel
    orientation="horizontal"
    style={{
      height: '400px',
      width: '600px',
      margin: '16px',
    }}
    onChange={(splitValue) => actionSplitValue(splitValue)}
    childrenBeforeSplit={
      <div>
        <h2>Children before split</h2>
        <ul>
          <li>One</li>
          <li>Two</li>
          <li>Three</li>
        </ul>
      </div>
    }
    childrenAfterSplit={
      <div>
        <h2>Children after split</h2>
        <ul>
          <li>Apple</li>
          <li>Banana</li>
          <li>Pear</li>
        </ul>
      </div>
    }
    {...args}
  />
);

/**
 * Vertical story for SplitPanel
 *
 * @param {any} args - props from story controls
 */
export const Vertical = (args) => (
  <SplitPanel
    orientation="vertical"
    style={{
      height: '400px',
      width: '600px',
      margin: '16px',
    }}
    onChange={(splitValue) => actionSplitValue(splitValue)}
    childrenBeforeSplit={
      <div>
        <h2>Children before split</h2>
        <ul>
          <li>One</li>
          <li>Two</li>
          <li>Three</li>
        </ul>
      </div>
    }
    childrenAfterSplit={
      <div>
        <h2>Children after split</h2>
        <ul>
          <li>Apple</li>
          <li>Banana</li>
          <li>Pear</li>
        </ul>
      </div>
    }
    {...args}
  />
);

/**
 * Nested story for SplitPanel
 *
 * @param {any} args - props from story controls
 */
export const Nested = (args) => (
  <SplitPanel
    orientation="horizontal"
    style={{
      height: '400px',
      width: '600px',
      margin: '16px',
    }}
    onChange={(splitValue) => actionSplitValueA(splitValue)}
    splitMin={10}
    splitMax={90}
    defaultSplitValue={25}
    childrenBeforeSplit={
      <SplitPanel
        orientation="vertical"
        style={{
          height: '100%',
          width: '100%',
        }}
        onChange={(splitValue) => actionSplitValueB(splitValue)}
        splitMin={10}
        splitMax={90}
        defaultSplitValue={25}
        childrenBeforeSplit={
          <div>
            <h2>Children top left</h2>
            <ul>
              <li>One</li>
              <li>Two</li>
              <li>Three</li>
            </ul>
          </div>
        }
        childrenAfterSplit={
          <div>
            <h2>Children bottom left</h2>
            <ul>
              <li>Apple</li>
              <li>Banana</li>
              <li>Pear</li>
            </ul>
          </div>
        }
      />
    }
    childrenAfterSplit={
      <div>
        <h2>Children right</h2>
        <ul>
          <li>Apple</li>
          <li>Banana</li>
          <li>Pear</li>
        </ul>
      </div>
    }
    {...args}
  />
);
