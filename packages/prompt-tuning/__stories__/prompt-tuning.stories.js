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

import '@carbon/web-components/es/components/button/index.js';
import task_view from './task_view.json';
import semantic_search_view from './semantic_search_view.json';
import collections_view from './collections_view.json';

export default {
  title: 'Components/Prompt Tuning/Prompt Tuning',
  component: 'clabs-prompt-tuning',
};

const defaultArgs = {
  text: ' ',
  data: 'semantic_search_view',
  viewName: 'semantic_search_view',
  viewList: ['task_view', 'semantic_search_view', 'collections_view'],
};

/* Default controls */
const defaultControls = {
  text: {
    control: { type: 'text' },
    description: 'Text inside the prompt-tuning',
  },
  data: {
    control: { type: 'select' },
    options: ['task_view', 'semantic_search_view', 'collections_view'],
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
};

/**
 * Return view data from string
 * @param {string} str string of view name
 */
function getView(str) {
  switch (str) {
    case 'task_view':
      return task_view.samples;
    case 'semantic_search_view':
      return semantic_search_view.samples;
    case 'collections_view':
      return collections_view.samples;
    default:
      return semantic_search_view.samples;
  }
}
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
  render: ({ text, data, viewName, viewList }) =>
    html` <cds-button id="modal-open-button"> Tune prompts </cds-button>

      <clabs-prompt-tuning
        .data=${getView(data)}
        .viewName=${viewName}
        .viewList=${viewList}
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
