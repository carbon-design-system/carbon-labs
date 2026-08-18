/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html } from 'lit';
import '../components/wysiwyg/wysiwyg';
import { allExtensions } from './story-helpers.js';
import { Markdown } from '@tiptap/markdown';
import '@carbon/web-components/es/components/textarea/index.js';

/**
 * WYSIWYG Editor with Markdown support
 */
export default {
  title: 'Components/Wysiwyg/Customizations',
  tags: ['squad', 'incubating'],
  component: 'clabs-wysiwyg',
  argTypes: {
    toolbarSize: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Toolbar button size',
    },
    content: {
      control: 'text',
      description: 'Initial content of the editor',
    },
  },
  args: {
    toolbarSize: 'md',
    content: `<p>This editor includes the Markdown extension with live synchronization. Edit the content in the editor to see the Markdown update automatically, or edit the Markdown textarea to update the editor.</p>
<h3 style="text-align: left;">Markdown Limitations</h3>
<ul>
  <li>
    <p style="text-align: left;">Text colors are not preserved.</p>
  </li>
  <li>
    <p style="text-align: left;">Custom fonts are not preserved.</p>
  </li>
  <li>
    <p style="text-align: left;">Text alignment is not preserved.</p>
  </li>
  <li>
    <p style="text-align: left;"><code>del</code> and <code>ins</code> elements are not preserved.</p>
  </li>
  <li>
    <p style="text-align: left;">Table cell merging, nesting and custom column widths are not preserved.</p>
  </li>
  <li>
    <p style="text-align: left;">Blockquote citations are not preserved.</p>
  </li>
</ul>
<p style="text-align: left;">See also: <a target="_blank" rel="noopener noreferrer" href="https://www.markdownguide.org/hacks">Markdown Hacks</a></p>`,
  },
  decorators: [
    (story) => html`
      <style>
        #main-content {
          display: flex;
          block-size: 100dvh;
        }
        clabs-wysiwyg {
          flex: 2;
        }
        textarea {
          flex: 1;
          max-block-size: 100%;
          border-inline-end: 1px solid var(--cds-border-subtle);
          border-inline-start: none;
          border-block: 1px solid var(--cds-border-subtle);
          padding: 1rem;
          background-color: var(--cds-layer);
        }
        textarea:focus {
          outline: 2px solid var(--cds-focus);
          outline-offset: -2px;
        }
      </style>
      ${story()}
    `,
  ],
};

/**
 * Editor with Markdown extension - demonstrates markdown serialization support
 */
export const WithMarkdown = {
  /**
   * Render the WYSIWYG editor with Markdown extension
   * @param {object} args - Story arguments
   * @returns {TemplateResult} Template result
   */
  render: (args) => {
    // Create extensions array with Markdown extension added
    const extensionsWithMarkdown = [
      ...allExtensions,
      Markdown.configure({
        html: true,
        tightLists: true,
        tightListClass: 'tight',
        bulletListMarker: '-',
        linkify: false,
        breaks: false,
        transformPastedText: false,
        transformCopiedText: false,
      }),
    ];

    setTimeout(() => {
      const editorElement = document.querySelector('#markdown-wysiwyg');
      const markdownOutput = document.querySelector('#markdown-output');

      if (editorElement && !editorElement.dataset.listenerAttached) {
        editorElement.dataset.listenerAttached = 'true';

        // Wait for editor to be ready
        const checkEditor = setInterval(() => {
          const editor = editorElement.editor;
          if (editor) {
            clearInterval(checkEditor);

            // Initialize textarea with current markdown
            if (typeof editor.getMarkdown === 'function') {
              markdownOutput.value = editor.getMarkdown();
            }

            // Listen to editor updates and sync to textarea
            editor.on('update', () => {
              if (typeof editor.getMarkdown === 'function') {
                const markdown = editor.getMarkdown();
                // Only update if not currently editing the textarea to avoid cursor issues
                if (document.activeElement !== markdownOutput) {
                  markdownOutput.value = markdown;
                }
              }
            });

            // Listen to textarea changes and sync to editor
            let textareaTimeout;
            markdownOutput.addEventListener('input', () => {
              // Debounce textarea input to avoid excessive updates
              clearTimeout(textareaTimeout);
              textareaTimeout = setTimeout(() => {
                const markdownContent = markdownOutput.value;
                if (editor && markdownContent !== undefined) {
                  // Set content with contentType: 'markdown' to parse markdown input
                  editor.commands.setContent(markdownContent, {
                    contentType: 'markdown',
                  });
                }
              }, 300);
            });
          }
        }, 50);
      }
    }, 100);

    return html`
      <clabs-wysiwyg
        id="markdown-wysiwyg"
        .extensions=${extensionsWithMarkdown}
        .content=${args.content}
        toolbar-size=${args.toolbarSize}
        @content-change=${(e) => {
          console.log('content-change', e);
        }}>
      </clabs-wysiwyg>

      <textarea
        hide-label
        id="markdown-output"
        label="Live Markdown View:"
        rows="30"
        placeholder="Markdown will appear here automatically as you edit. You can also edit this textarea to update the editor.">
      </textarea>
    `;
  },
};
