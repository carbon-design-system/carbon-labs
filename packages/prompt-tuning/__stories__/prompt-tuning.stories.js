/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import '../components/prompt-tuning/prompt-tuning';
import { html } from 'lit';
import { action } from '@storybook/addon-actions';

import '@carbon/web-components/es/components/button/index.js';
import semantic_search_view from './semantic_search_view.json';

export default {
  title: 'Components/Prompt Tuning/Prompt Tuning',
  component: 'clabs-prompt-tuning',
};

const defaultArgs = {
  text: ' ',
  promptSamples: semantic_search_view.samples,
  viewName: 'semantic_search_view',
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
  viewContextVariables: ['table_ids'],
  viewParameters: ['mode', 'question', 'table_ids'],
  onSaveRename: action('save-rename'),
  onCloseTag: action('close-tag'),
  onAddContextVariable: action('add-context-variable'),
  onAddParameter: action('add-parameter'),
  onSavePrompt: action('save-prompt'),
  onDeletePrompt: action('delete-prompt'),
  onChangeView: action('change-view'),
};

/* Default controls */
const defaultControls = {
  text: {
    control: { type: 'text' },
    description: 'Text inside the prompt-tuning',
  },
  promptSamples: {
    control: { type: 'object' },
    description: 'Current view data',
  },
  viewName: {
    control: { type: 'text' },
    description: 'Name of the current view',
  },
  viewList: {
    control: { type: 'object' },
    description: 'List of views',
  },
  viewContextVariables: {
    control: { type: 'array' },
    description: 'View context variables',
  },
  viewParameters: {
    control: { type: 'array' },
    description: 'View parameters',
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
    text,
    promptSamples,
    viewName,
    viewList,
    viewContextVariables,
    viewParameters,
    onSaveRename,
    onCloseTag,
    onAddContextVariable,
    onAddParameter,
    onSavePrompt,
    onDeletePrompt,
    onChangeView,
  }) =>
    html` <cds-button id="modal-open-button"> Tune prompts </cds-button>

      <clabs-prompt-tuning
        .promptSamples=${promptSamples}
        .viewName=${viewName}
        .viewList=${viewList}
        .viewContextVariables=${viewContextVariables}
        .viewParameters=${viewParameters}
        @save-rename=${onSaveRename}
        @close-tag=${onCloseTag}
        @add-context-variable=${onAddContextVariable}
        @add-parameter=${onAddParameter}
        @save-prompt=${onSavePrompt}
        @delete-prompt=${onDeletePrompt}
        @change-view=${onChangeView}
        >${text}</clabs-prompt-tuning
      >

      <script type="text/javascript">
        const button = document.getElementById('modal-open-button');
        const component = document.getElementsByTagName(
          'clabs-prompt-tuning'
        )[0];
        button.addEventListener('click', () => {
          component.isListModalOpen = true;
        });
      </script>`,
};
