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

/**
 * More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
 */
export default {
  title: 'Components/Wysiwyg',
  tags: ['squad', 'incubating'],
  component: 'clabs-wysiwyg',
  parameters: {
    layout: 'fullscreen',
    docs: {
      source: {
        type: 'code',
        code: `<clabs-wysiwyg aria-label="WYSIWYG editor"></clabs-wysiwyg>`,
      },
    },
  },
};

/**
 * More on writing stories with args: https://storybook.js.org/docs/web-components/writing-stories/args
 *
 * @type {{args: {label: string}, render: (function(*): TemplateResult<1>)}}
 */
const demoContent = `
  <h1>WYSIWYG demo content</h1>
  <p>
    This paragraph includes <strong>bold</strong>, <em>italic</em>,
    <u>underline</u>, <s>strikethrough</s>, and inline <code>code</code>.
    It also includes a <a href="https://carbondesignsystem.com" target="_blank" rel="noopener noreferrer">link</a>.
  </p>
  <h2>Headings</h2>
  <p>This is a standard paragraph under a secondary heading.</p>
  <h3>Lists</h3>
  <ul>
    <li>Bullet item one</li>
    <li>Bullet item two with <strong>mixed formatting</strong></li>
    <li>Bullet item three</li>
  </ul>
  <ol>
    <li>Numbered item one</li>
    <li>Numbered item two</li>
    <li>Numbered item three</li>
  </ol>
  <h3>Alignment</h3>
  <p style="text-align: left;">Left aligned text sample.</p>
  <p style="text-align: center;">Center aligned text sample.</p>
  <p style="text-align: right;">Right aligned text sample.</p>
  <h3>Blockquote</h3>
  <blockquote>
    Great editing experiences make structured content easier to create.
  </blockquote>
  <h3>Code block</h3>
  <pre><code>function greet(name) {
  return \`Hello, \${name}!\`;
}</code></pre>
  <h3>Image</h3>
  <p>
    <img
      src="https://placehold.co/640x240/png"
      alt="Placeholder image for WYSIWYG story" />
  </p>
  <h3>Table</h3>
  <table>
    <thead>
      <tr>
        <th>Syntax</th>
        <th>Status</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Bold</td>
        <td>Supported</td>
        <td>Rendered with strong tag</td>
      </tr>
      <tr>
        <td>Lists</td>
        <td>Supported</td>
        <td>Ordered and unordered</td>
      </tr>
      <tr>
        <td>Tables</td>
        <td>Supported</td>
        <td>Editable via toolbar menu</td>
      </tr>
    </tbody>
  </table>
`;

export const Default = {
  args: {
    content: '',
  },

  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: (args) => {
    /**
     * Injects kitchen sink demo content into the editor instance.
     * @param {Event} event Click event from the story action button
     */
    const setKitchenSinkContent = (event) => {
      const button = event.currentTarget;
      // Find the editor in the same container as the button
      const container =
        button.closest('.wysiwyg-story-container') || button.parentElement;
      const editor = container?.querySelector('clabs-wysiwyg');

      if (!editor) {
        console.warn('Could not find clabs-wysiwyg element');
        return;
      }

      const shouldReset = button.dataset.state === 'kitchen-sink';
      const nextContent = shouldReset ? '' : demoContent;

      editor.content = nextContent;
      button.dataset.state = shouldReset ? 'empty' : 'kitchen-sink';
      button.textContent = shouldReset ? 'Set kitchen sink content' : 'Reset';
    };

    return html`<div class="wysiwyg-story-container">
      <cds-button
        type="button"
        data-state="empty"
        kind="secondary"
        size="xs"
        style="position: absolute; left: 0; top: 0; z-index: 1;"
        @click=${setKitchenSinkContent}>
        Set kitchen sink content
      </cds-button>
      <clabs-wysiwyg
        aria-label="WYSIWYG editor"
        .content=${args.content}></clabs-wysiwyg>
    </div>`;
  },
};
