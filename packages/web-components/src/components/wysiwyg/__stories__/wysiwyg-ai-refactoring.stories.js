/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { Mark, mergeAttributes } from '@tiptap/core';
import '../components/wysiwyg/wysiwyg';
import { allExtensions, processWithAI } from './story-helpers.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import '@carbon/web-components/es/components/popover/index.js';
import '@carbon/web-components/es/components/text-input/index.js';
import '@carbon/web-components/es/components/layer/index.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import AiGenerate from '@carbon/icons/es/ai-generate/16.js';
import Checkmark from '@carbon/icons/es/checkmark/16.js';

/**
 * Custom Mark-AI extension for AI processing indicator.
 * Renders as <span class="ai-processing"> and doesn't save to history.
 * Used for AI-highlighted content in the editor during processing.
 */
const MarkAI = Mark.create({
  name: 'markAI',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'ai-processing',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span.ai-processing',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      /**
       * Set mark-ai on selected text (doesn't save to history)
       * @returns {Function} Command function
       */
      setMarkAI:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name, undefined, {
            addToHistory: false,
          });
        },
      /**
       * Remove mark-ai from selected text (doesn't save to history)
       * @returns {Function} Command function
       */
      unsetMarkAI:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name, { addToHistory: false });
        },
    };
  },
});

/**
 * AI refactoring extension
 * @type {object}
 */
const AIRefactoring = {
  name: 'ai-refactoring',
  /**
   * Custom toolbar for AI refactoring
   * @param {object} ed - Editor
   * @param {string} size - Size
   * @returns {TemplateResult} Template
   */
  toolbarRender: (ed, size = 'md') => {
    if (!ed || ed.state.selection.empty) {
      return html``;
    }

    const popoverRef = createRef();
    const inputRef = createRef();

    /**
     * Handle AI transformation
     */
    const handleSubmit = async () => {
      if (popoverRef.value) {
        popoverRef.value.open = false;
      }

      const { from, to } = ed.state.selection;
      const selectedText = ed.state.doc.textBetween(from, to, ' ');

      if (!selectedText.trim()) {
        return;
      }

      // Apply mark-ai highlight using direct transaction (without saving to history)
      const markTr = ed.state.tr;
      markTr.addMark(from, to, ed.schema.marks.markAI.create());
      markTr.setMeta('addToHistory', false);
      markTr.setMeta('preventUpdate', false);
      ed.view.dispatch(markTr);

      // Move cursor to the end of the selection immediately
      ed.commands.setTextSelection(to);
      ed.commands.focus();

      // Process with AI
      const result = await processWithAI(selectedText);

      // Remove the mark-ai mark (don't save this step)
      const removeTr = ed.state.tr;
      removeTr.removeMark(from, to, ed.schema.marks.markAI);
      removeTr.setMeta('addToHistory', false);
      ed.view.dispatch(removeTr);

      // Now replace with new content using insertContent (this WILL save to history)
      // insertContent properly parses HTML
      ed.chain()
        .focus()
        .setTextSelection({ from, to })
        .deleteSelection()
        .insertContent(result)
        .run();

      // Move cursor to the end of the inserted content
      const newPos = ed.state.selection.to;
      ed.commands.setTextSelection(newPos);

      if (inputRef.value) {
        inputRef.value.value = '';
      }
    };

    /**
     * Toggle popover and focus input when opened
     */
    const togglePopover = () => {
      if (popoverRef.value) {
        const wasOpen = popoverRef.value.open;
        popoverRef.value.open = !wasOpen;

        // Focus input when opening popover
        if (!wasOpen && inputRef.value) {
          // Use setTimeout to ensure popover is rendered before focusing
          setTimeout(() => {
            inputRef.value?.focus();
          }, 0);
        }
      }
    };

    return html`
      <style>
        .ai-prompt-popover {
          display: flex;
        }
        .ai-prompt-popover cds-text-input {
          --cds-border-strong: transparent;
          flex: 1;
        }
      </style>
      <div class="clabs-wysiwyg__toolbar-group">
        <cds-layer level="1">
          <cds-popover ${ref(popoverRef)} tabtip align="bottom" autoalign>
            <cds-icon-button
              kind="ghost"
              caret
              autoalign
              .size=${size}
              @click=${togglePopover}>
              ${iconLoader(AiGenerate, { slot: 'icon', tabIndex: '-1' })}
              <span slot="tooltip-content">AI Generate</span>
            </cds-icon-button>
            <cds-popover-content slot="content">
              <div class="ai-prompt-popover">
                <cds-text-input
                  .size=${size}
                  hide-label
                  ${ref(inputRef)}
                  placeholder="Enter prompt"
                  @keydown=${(e) => {
                    if (e.key === 'Enter') {
                      handleSubmit();
                    }
                  }}>
                </cds-text-input>
                <cds-icon-button
                  kind="primary"
                  .size=${size}
                  @click=${handleSubmit}>
                  ${iconLoader(Checkmark, { slot: 'icon' })}
                  <span slot="tooltip-content">Apply</span>
                </cds-icon-button>
              </div>
            </cds-popover-content>
          </cds-popover>
        </cds-layer>
      </div>
    `;
  },
};

export default {
  title: 'Components/Wysiwyg/Customizations',
  tags: ['squad', 'incubating'],
  component: 'clabs-wysiwyg',
  argTypes: {
    toolbarSize: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
  args: {
    toolbarSize: 'md',
    content: `
      <h2>AI-Powered Editing</h2>
      <p>Select text and click the AI button to transform it.</p>
      <h3>Example: Plain Text to List</h3>
      <p>Benefits of cloud computing: scalability, cost efficiency, flexibility, automatic updates, disaster recovery, security, collaboration, competitive edge</p>
      <h3>Example: Text Enhancement</h3>
      <p>The quick brown fox jumps over the lazy dog.</p>
      <br>
      <hr>
      <p><strong>Note:</strong> This is a simulated story for demonstration purposes and does not require a prompt. In a real product implementation, the prompt, selected text, and the entire content can be sent to your backend AI service to generate a real AI response.</p>
      <p>This example demonstrates simplified custom extension. See also: <a target="_blank" rel="noopener noreferrer" href="https://tiptap.dev/docs/content-ai/getting-started/overview">Build AI-powered editors</a></p>
    `,
  },
  decorators: [
    (story) => html`
      <style>
        #main-content {
          block-size: 100dvh;
        }
      </style>
      ${story()}
    `,
  ],
};

export const AIPoweredEditing = {
  /**
   * Render story
   * @param {object} args - Story args
   * @returns {TemplateResult} Template
   */
  render: (args) => {
    const extensions = [...allExtensions, MarkAI, AIRefactoring];

    return html`
      <clabs-wysiwyg
        .extensions=${extensions}
        .content=${args.content}
        toolbar-size=${args.toolbarSize}
        @content-change=${(e) => {
          console.log('content-change', e);
        }}></clabs-wysiwyg>
    `;
  },
};
