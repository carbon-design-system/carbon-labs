/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import '../components/ux-control/ux-control';
import { html } from 'lit';
import { action } from '@storybook/addon-actions';

import '@carbon/web-components/es/components/button/index.js';
import semantic_search_view from './semantic_search_view.json';

export default {
  title: 'Components/UX Control/UX Control',
  component: 'clabs-ux-control',
};

const defaultArgs = {
  promptSamples: semantic_search_view.samples,
  viewList: [
    'task_view',
    'semantic_search_view',
    'collections_view',
    'semantic_querying_view',
    'table_details_view',
    'table_upload_view',
    'visualization_view',
    'table_expansion_view',
    'glossary_view',
    'table_comparison_view',
    'causal_interference_view',
  ],
  currentView: {
    name: 'semantic_search_view',
    contextVariables: ['table_ids'],
    parameters: ['mode', 'question', 'table_ids'],
  },
  onSaveRename: action('save-rename'),
  onCloseTag: action('close-tag'),
  onAddContextVariable: action('add-context-variable'),
  onAddParameter: action('add-parameter'),
  onSavePrompt: action('save-prompt'),
  onDeletePrompt: action('delete-prompt'),
  onChangeView: action('change-view'),
  onAddPrompt: action('add-prompt'),
  open: true,
};

/* Default controls */
const defaultControls = {
  open: {
    control: { type: 'boolean' },
    description: 'Whether the tuning prompts modal is open or not',
    table: {
      category: '',
      defaultValue: { summary: true },
    },
  },
  promptSamples: {
    control: { type: 'object' },
    description: 'Current view data',
    table: {
      defaultValue: {
        summary: 'Using a JSON example from semantic search view for storybook',
      },
    },
  },
  currentView: {
    control: { type: 'object' },
    description: 'Name, context variables, and parameters in the current view',
    table: {
      defaultValue: {
        summary: 'Using a JSON example with semantic search view for storybook',
      },
    },
  },
  viewList: {
    control: { type: 'object' },
    description: 'List of views',
    table: {
      defaultValue: {
        summary: 'Using an example of a list of views for storybook',
      },
    },
  },
  onAddContextVariable: {
    action: 'add-context-variable',
    description:
      'Fires when user saves new context variable for the current view',
    table: {
      category: 'Events',
      defaultValue: { summary: 'function' },
    },
  },
  onAddParameter: {
    action: 'add-parameter',
    description: 'Fires when user saves new parameter for the current view',
    table: {
      category: 'Events',
      defaultValue: { summary: 'function' },
    },
  },
  onChangeView: {
    action: 'change-view',
    description:
      'Fires when user chooses a different view in the select dropdown',
    table: {
      category: 'Events',
      defaultValue: { summary: 'function' },
    },
  },
  onCloseTag: {
    action: 'change-view',
    description:
      'Fires when user clicks the X for the current view context variable or parameter',
    table: {
      category: 'Events',
      defaultValue: { summary: 'function' },
    },
  },
  onDeletePrompt: {
    action: 'delete-prompt',
    description:
      'Fires when user clicks the trash icon next to a prompt table row',
    table: {
      category: 'Events',
      defaultValue: { summary: 'function' },
    },
  },
  onSavePrompt: {
    action: 'save-prompt',
    description: 'Fires when user edits a prompt and saves the changes',
    table: {
      category: 'Events',
      defaultValue: { summary: 'function' },
    },
  },
  onSaveRename: {
    action: 'save-rename',
    description: 'Fires when user renames the current view and saves changes',
    table: {
      category: 'Events',
      defaultValue: { summary: 'function' },
    },
  },
  onAddPrompt: {
    action: 'save-rename',
    description: 'Fires when user adds a new prompt',
    table: {
      category: 'Events',
      defaultValue: { summary: 'function' },
    },
  },

  isEditModalOpen: {
    table: {
      disable: true,
    },
  },
  text: {
    table: {
      disable: true,
    },
  },
};

/**
 * More on writing stories with args: https://storybook.js.org/docs/web-components/writing-stories/args
 *
 * @type {{args: {label: string}, render: (function(*): TemplateResult<1>)}}
 */
export const Default = {
  argTypes: defaultControls,
  args: defaultArgs,
  /**
   * Renders the template for Storybook
   * @param {string} args.content - content to generate from
   * @returns {TemplateResult<1>}
   */
  render: ({
    open,
    promptSamples,
    viewList,
    currentView,
    onSaveRename,
    onCloseTag,
    onAddContextVariable,
    onAddParameter,
    onSavePrompt,
    onDeletePrompt,
    onChangeView,
    onAddPrompt,
  }) =>
    html` <clabs-ux-control
      ?open=${open}
      .promptSamples=${promptSamples}
      .currentView=${currentView}
      .viewList=${viewList}
      @save-rename=${onSaveRename}
      @close-tag=${onCloseTag}
      @add-context-variable=${onAddContextVariable}
      @add-parameter=${onAddParameter}
      @save-prompt=${onSavePrompt}
      @delete-prompt=${onDeletePrompt}
      @change-view=${onChangeView}
      @add-prompt=${onAddPrompt}></clabs-ux-control>`,
};
