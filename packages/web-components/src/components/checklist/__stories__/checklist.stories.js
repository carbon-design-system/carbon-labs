/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../components/checklist/checklist.js';
import '../components/checklist/checklist-group.js';
import '../components/checklist/checklist-item.js';
import '../components/checklist/checklist-icon.js';
import '../components/checklist/checklist-chart.js';
import { html } from 'lit';
import { action } from 'storybook/actions';

export default {
  title: 'Components/Checklist',
  component: 'clabs-checklist',
  parameters: {
    layout: 'padded',
  },
};

const sharedArgs = {
  title: 'Checklist header',
  chartLabel: '15% complete',
  chartValue: 0.15,
  groupTitle: 'Section label',
  toggleLabel: 'Toggle',
  toggleLabelAlign: 'top',
  toggleAriaLabel: 'Checklist toggle',
  viewAllLabel: 'View all (10)',
};

const sharedArgTypes = {
  title: { control: 'text', description: 'Main heading of the checklist.' },
  chartLabel: {
    control: 'text',
    description: 'Label next to the progress chart.',
  },
  chartValue: {
    control: { type: 'number', min: 0, max: 1, step: 0.01 },
    description: 'Progress value between 0 and 1.',
  },
  groupTitle: { control: 'text', description: 'Section group heading.' },
  toggleLabel: {
    control: 'text',
    description: 'Tooltip text for the toggle button.',
  },
  toggleAriaLabel: {
    control: 'text',
    description: 'Accessible label for the toggle button.',
  },
  viewAllLabel: {
    control: 'text',
    description: 'Label for the "View all" footer link.',
  },
};

/**
 * Renders the default checklist story.
 * @param {object} args Storybook args
 * @returns {import('lit').TemplateResult} Rendered template
 */
const renderDefault = (args) => {
  const {
    title,
    chartLabel,
    chartValue,
    groupTitle,
    toggleLabel,
    toggleLabelAlign,
    toggleAriaLabel,
    viewAllLabel,
  } = args;

  return html`
    <div style="max-inline-size: 20rem; min-inline-size: 20rem;">
      <clabs-checklist
        title=${title}
        chart-label=${chartLabel}
        chart-value=${chartValue}
        toggle-label=${toggleLabel}
        toggle-label-align=${toggleLabelAlign}
        toggle-aria-label=${toggleAriaLabel}
        open
        view-all-label=${viewAllLabel}
        @clabs-checklist-view-all=${action('clabs-checklist-view-all')}
        @clabs-checklist-toggle=${action('clabs-checklist-toggle')}>
        <clabs-checklist-group title=${groupTitle}>
          <clabs-checklist-item
            label="Task name"
            status="completed"></clabs-checklist-item>
          <clabs-checklist-item
            label="Task name"
            status="error"
            ?clickable=${true}
            @clabs-checklist-item-clicked=${action(
              'clabs-checklist-item-clicked'
            )}></clabs-checklist-item>
          <clabs-checklist-item
            label="Task name"
            status="in progress"
            ?clickable=${true}
            @clabs-checklist-item-clicked=${action(
              'clabs-checklist-item-clicked'
            )}></clabs-checklist-item>
          <clabs-checklist-item
            label="Task name"
            status="not started"
            ?clickable=${true}
            @clabs-checklist-item-clicked=${action(
              'clabs-checklist-item-clicked'
            )}></clabs-checklist-item>
          <clabs-checklist-item
            label="Task name"
            status="disabled"></clabs-checklist-item>
        </clabs-checklist-group>
      </clabs-checklist>
    </div>
  `;
};

/**
 * Renders the all task states story.
 * @param {object} args Storybook args
 * @returns {import('lit').TemplateResult} Rendered template
 */
const renderTaskStates = (args) => {
  const { toggleLabel, toggleLabelAlign, toggleAriaLabel, viewAllLabel } = args;

  return html`
    <div style="max-inline-size: 20rem; min-inline-size: 20rem;">
      <clabs-checklist
        title="All task states"
        toggle-label=${toggleLabel}
        toggle-label-align=${toggleLabelAlign}
        toggle-aria-label=${toggleAriaLabel}
        view-all-label=${viewAllLabel}
        @clabs-checklist-view-all=${action('clabs-checklist-view-all')}
        open>
        <clabs-checklist-group title="Not started / In progress / Completed">
          <clabs-checklist-item
            label="Not started"
            status="not started"></clabs-checklist-item>
          <clabs-checklist-item
            label="In progress (clickable)"
            status="in progress"
            ?clickable=${true}
            @clabs-checklist-item-clicked=${action(
              'clabs-checklist-item-clicked'
            )}></clabs-checklist-item>
          <clabs-checklist-item
            label="Completed"
            status="completed"></clabs-checklist-item>
        </clabs-checklist-group>
        <clabs-checklist-group title="Disabled / Error">
          <clabs-checklist-item
            label="Disabled"
            status="disabled"></clabs-checklist-item>
          <clabs-checklist-item
            label="Error (clickable)"
            status="error"
            ?clickable=${true}
            @clabs-checklist-item-clicked=${action(
              'clabs-checklist-item-clicked'
            )}></clabs-checklist-item>
        </clabs-checklist-group>
      </clabs-checklist>
    </div>
  `;
};

export const Default = {
  args: sharedArgs,
  argTypes: sharedArgTypes,
  render: renderDefault,
};

export const TaskStates = {
  args: sharedArgs,
  argTypes: sharedArgTypes,
  render: renderTaskStates,
};
