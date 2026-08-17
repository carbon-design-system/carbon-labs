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
import { allExtensions, customToolbarContent } from './story-helpers.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import Printer from '@carbon/icons/es/printer/16.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import { BASE_CLASS } from '../components/wysiwyg/src/constants.js';

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
    content: customToolbarContent,
  },
  decorators: [
    (story) => html`
      <style>
        #main-content {
          block-size: 100dvh;
          padding: 0;
        }
      </style>
      ${story()}
    `,
  ],
};

/**
 * Print a 1:1 snapshot of the editor (tokens + shadow CSS). `getHTML()` is not enough.
 * @param {import('@tiptap/core').Editor | null} editor - TipTap editor
 */
const printEditorDocument = (editor) => {
  const source = editor?.view?.dom;
  if (!source) {
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:absolute;width:0;height:0;border:0';
  document.body.appendChild(iframe);
  const { contentDocument: doc, contentWindow: win } = iframe;
  if (!doc || !win) {
    return;
  }
  const computed = getComputedStyle(source);
  const vars = [...computed]
    .filter((name) => name.startsWith('--'))
    .map((name) => `${name}:${computed.getPropertyValue(name)}`);
  const root = source.getRootNode();
  const sheets = [...(root.adoptedStyleSheets ?? [])].flatMap((sheet) =>
    [...sheet.cssRules].map((rule) => rule.cssText)
  );

  doc.head.innerHTML = `<style>
    :root { ${vars.join(';')} }
    body { margin: 0; font-family: ${computed.fontFamily}; background: var(--cds-layer); color: var(--cds-text-primary); }
    .${BASE_CLASS}__editor .ProseMirror { overflow: visible !important; block-size: auto !important; }
    * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    ${sheets.join('\n')}
  </style>`;
  doc.body.className = `${BASE_CLASS}__editor`;
  doc.body.append(source.cloneNode(true));
  win.addEventListener('afterprint', () => iframe.remove());
  win.print();
};

/**
 * Adds a Print button. Any object with `name` + `toolbarRender` is a valid extension.
 */
const PrintExtension = {
  name: 'print',
  /**
   * @param {object} ed - TipTap editor
   * @param {string} size - Toolbar button size
   * @returns {import('lit').TemplateResult} Toolbar control
   */
  toolbarRender: (ed, size = 'md') => html`
    <div class="${BASE_CLASS}__toolbar-group">
      <cds-icon-button
        kind="secondary"
        .size=${size}
        @click=${() => printEditorDocument(ed)}>
        ${iconLoader(Printer, { slot: 'icon' })}
        <span slot="tooltip-content">Print</span>
      </cds-icon-button>
    </div>
  `,
};

export const CustomToolbar = {
  /**
   * @param {object} args - Story args
   * @returns {import('lit').TemplateResult} Story
   */
  render: (args) => html`
    <clabs-wysiwyg
      .extensions=${[...allExtensions, PrintExtension]}
      .content=${args.content}
      @content-change=${(e) => {
        console.log('content-change', e);
      }}
      toolbar-size=${args.toolbarSize}>
    </clabs-wysiwyg>
  `,
};
