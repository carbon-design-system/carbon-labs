/**
 * @license
 *
 * Copyright IBM Corp. 2023, 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { action } from 'storybook/actions';
import mdx from './Checklist.mdx';
import { Checklist } from '../components/Checklist';
import '../components/checklist.scss';
import './storybook.scss';

/**
 * Log the clicked task to the Actions panel. The task's properties are passed
 * as the argument, e.g. `{ kind, label, onClick }`.
 * @param {object} task the clicked task
 */
const logTask = (task) => {
  action('task')(task);
};

const taskLists = [
  {
    title: 'Section label',
    tasks: [
      {
        kind: 'checked',
        label: 'Task name',
        onClick: logTask,
      },
      {
        kind: 'indeterminate',
        label: 'Task name',
        onClick: logTask,
      },
      {
        kind: 'unchecked',
        label: 'Task name',
        onClick: logTask,
      },
    ],
  },
];

export default {
  title: 'Components/Checklist',
  component: Checklist,
  parameters: {
    layout: 'padded',
    docs: {
      page: mdx,
    },
  },
  argTypes: {
    taskLists: {
      table: {
        type: {
          detail: `[{
            title: string,
            tasks: [{
              kind: 'unchecked' | 'indeterminate' | 'checked' | 'disabled' | 'error',
              label: string,
              onClick: func,
            }]
          }]`,
        },
      },
    },
    theme: {
      options: ['light', 'dark'],
      control: { type: 'radio' },
      table: {
        defaultValue: { summary: 'light' },
        type: { summary: "'light' | 'dark'" },
      },
    },
  },
};

/**
 * Template for Checklist
 * @param {object} args story args
 * @returns {React.ReactElement} the story
 */
const Template = (args) => {
  return (
    <div className="storybook--checklist-viewport">
      <Checklist {...args} />
    </div>
  );
};

/**
 * Default Checklist with a chart, title and "View all" button
 */
export const Default = Template.bind({});
Default.args = {
  /** Logs the "View all" click to the Actions panel. */
  onClickViewAll: () => {
    action('view all')();
  },
  /**
   * Logs the open/closed state to the Actions panel.
   * @param {boolean} isOpen whether the checklist is open
   */
  onToggle: (isOpen) => {
    action(`toggle ${isOpen ? 'open' : 'closed'}`)();
  },
  chartValue: 0.15,
  chartLabel: '15% complete',
  taskLists,
  theme: 'light',
  title: 'Get started checklist',
  viewAllLabel: 'View all (10)',
};

/**
 * Every task state: unchecked, indeterminate, checked, disabled and error,
 * each with and without an `onClick` callback
 */
export const TaskStates = Template.bind({});
TaskStates.args = {
  taskLists: [
    {
      title: 'Unchecked state',
      tasks: [
        { kind: 'unchecked', label: 'Task name', onClick: action('task') },
        { kind: 'unchecked', label: 'Task name' },
      ],
    },
    {
      title: 'Indeterminate state',
      tasks: [
        { kind: 'indeterminate', label: 'Task name', onClick: action('task') },
        { kind: 'indeterminate', label: 'Task name' },
      ],
    },
    {
      title: 'Checked state',
      tasks: [
        { kind: 'checked', label: 'Task name', onClick: action('task') },
        { kind: 'checked', label: 'Task name' },
      ],
    },
    {
      title: 'Disabled state',
      tasks: [
        { kind: 'disabled', label: 'Task name' },
        { kind: 'disabled', label: 'Task name', onClick: action('task') },
      ],
    },
    {
      title: 'Error state',
      tasks: [
        { kind: 'error', label: 'Task name' },
        { kind: 'error', label: 'Task name', onClick: action('task') },
      ],
    },
  ],
  theme: 'light',
};
