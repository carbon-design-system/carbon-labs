/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../components/wysiwyg/wysiwyg';
import { html } from 'lit';
import {
  generateToolbarOptions,
  demoContent,
  isContentEmpty,
  updateButtonVisibility,
} from './story-utils';

export default {
  title: 'Components/Wysiwyg',
  component: 'clabs-wysiwyg',
  parameters: {
    docs: {
      story: {
        name: 'Default',
      },
    },
  },
};

/**
 * Default story showcasing the WYSIWYG editor with full functionality
 */
export const Default = {
  args: {
    content: '',
    toolbarOptions: generateToolbarOptions(), // only adding for showing controls to play with. not needed if we want to render everything.
  },
  argTypes: {
    toolbarOptions: {
      control: 'object',
      description:
        'Toolbar configuration. Pass undefined for all groups, [] for no toolbar, or custom array for specific groups.',
      table: {
        type: { summary: 'ToolbarOptions | undefined' },
        defaultValue: { summary: 'undefined' },
      },
    },
  },

  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: (args) => {
    /**
     * Handles editor content changes and updates button visibility
     * @param {CustomEvent} event Content change event from the editor
     */
    const handleContentChange = (event) => {
      // console.log('clabs-wysiwyg-on-change event:', {
      //   content: event.detail.content,
      //   contentLength: event.detail.content.length,
      //   editor: event.detail.editor,
      // });

      const editor = event.target;
      const form = editor.closest('form');
      if (!form) {
        return;
      }

      const isEmpty = isContentEmpty(event.detail.content);
      updateButtonVisibility(form, isEmpty);
    };

    /**
     * Injects kitchen sink demo content into the editor instance.
     * @param {Event} event Click event from the story action button
     */
    const setKitchenSinkContent = (event) => {
      const button = event.currentTarget;
      // Find the editor in the same container as the button
      const form = button.closest('form');
      const editor = form?.querySelector('clabs-wysiwyg');

      if (!editor) {
        console.warn('Could not find clabs-wysiwyg element');
        return;
      }

      // Set kitchen sink content
      editor.content = demoContent;
      // Button visibility will be updated by content-change event
    };

    /**
     * Handles send button click and logs the payload.
     * @param {Event} event Click event
     */
    const handleSubmit = (event) => {
      const button = event.currentTarget;
      const form = button.closest('form');
      const editor = form?.querySelector('clabs-wysiwyg');

      if (!editor) {
        console.warn('Could not find clabs-wysiwyg element');
        return;
      }

      // Create payload with editor content and attached files
      const payload = {
        content: editor.content,
        files: editor.files || [],
        timestamp: new Date().toISOString(),
        contentLength: editor.content.length,
        fileCount: editor.files?.length || 0,
      };

      console.log('Form submitted with payload:', payload);

      // Reset to initial state after a delay
      setTimeout(() => {
        editor.content = '';
        editor.files = [];
        // Button visibility will be updated by content-change event
      }, 2000);
    };

    /**
     * Discards the editor content and resets to initial state.
     * @param {Event} event Click event from the discard button
     */
    const discardContent = (event) => {
      const button = event.currentTarget;
      const form = button.closest('form');
      const editor = form?.querySelector('clabs-wysiwyg');

      if (!editor) {
        console.warn('Could not find clabs-wysiwyg element');
        return;
      }

      // Reset editor content - button visibility will be updated by content-change event
      editor.content = '';
      editor.files = [];
    };

    return html`<div class="wysiwyg-story-container">
      <form
        @submit=${handleSubmit}
        style="display: flex; flex-direction: column; gap: 2rem;">
        <clabs-wysiwyg
          aria-label="WYSIWYG editor"
          .content=${args.content}
          .toolbarOptions=${args.toolbarOptions}
          @clabs-wysiwyg-on-change=${handleContentChange}></clabs-wysiwyg>
        <div style="display: flex; gap: 1rem;">
          <cds-button
            type="button"
            data-action="set-content"
            kind="primary"
            size="md"
            @click=${setKitchenSinkContent}>
            Set Data
          </cds-button>
          <cds-button
            type="button"
            data-action="send"
            kind="primary"
            size="md"
            style="display: none;"
            @click=${handleSubmit}>
            Send
          </cds-button>
          <cds-button
            type="button"
            data-action="discard"
            kind="secondary"
            size="md"
            style="display: none;"
            @click=${discardContent}>
            Discard
          </cds-button>
        </div>
      </form>
    </div>`;
  },
};
