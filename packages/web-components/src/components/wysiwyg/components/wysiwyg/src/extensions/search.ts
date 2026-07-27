/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Extension, Mark } from '@tiptap/core';
import type { Editor } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';
import '@carbon/web-components/es/components/search/index.js';
import '@carbon/web-components/es/components/tag/index.js';
import { BASE_CLASS } from '../constants.js';
import type {
  EditorComponent,
  ExtensionWithToolbar,
  ToolbarSize,
} from '../types.js';

interface SearchState {
  searchTerm: string;
  currentSearchTerm: string;
  matchCount: number;
  searchInputElement: any;
}

const EMPTY_SEARCH_STATE: SearchState = {
  searchTerm: '',
  currentSearchTerm: '',
  matchCount: 0,
  searchInputElement: null,
};

const editorSearchState = new WeakMap<Editor, SearchState>();

/**
 * Gets (or lazily creates) the search state for an editor.
 * @param {Editor} editor - Editor instance
 * @returns {SearchState} The search state
 */
const getState = (editor: Editor): SearchState => {
  let state = editorSearchState.get(editor);
  if (!state) {
    state = { ...EMPTY_SEARCH_STATE };
    editorSearchState.set(editor, state);
  }
  return state;
};

const searchToolbarStyles = `
  .${BASE_CLASS}__toolbar-group--search {
    display: flex;
    align-items: center;
    flex: 1;
    position: relative;
  }
  .${BASE_CLASS}__search {
    --cds-border-strong: transparent;
    min-inline-size: 12rem;
  }
  .${BASE_CLASS}__search--count {
    position: absolute;
    inset-inline-end: var(--cds-spacing-05);
    inset-block-end: 0;
    transform: translateY(var(--cds-spacing-07));
    z-index: 99;
  }
`;

const searchOutlineStyles = `
  :host([expandable]:focus-within) .cds--search-magnifier {
    outline-offset: -2px;
  }
`;

const SearchHighlight = Mark.create({
  name: 'searchHighlight',
  addOptions() {
    return { HTMLAttributes: { class: 'search-highlight' } };
  },
  parseHTML() {
    return [{ tag: 'mark.search-highlight' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['mark', { ...this.options.HTMLAttributes, ...HTMLAttributes }, 0];
  },
});

const searchPluginKey = new PluginKey('search');

/**
 * Creates search plugin
 * @param {Editor} editor - Editor instance
 */
const createSearchPlugin = (editor: Editor) =>
  new Plugin({
    key: searchPluginKey,
    state: {
      /** Initialize decorations */
      init: () => DecorationSet.empty,
      /**
       * Apply transaction
       * @param {any} tr - Transaction
       * @param {DecorationSet} oldState - Old state
       */
      apply: (tr, oldState) => oldState.map(tr.mapping, tr.doc),
    },
    props: {
      decorations({ doc }) {
        const state = getState(editor);

        if (!state.currentSearchTerm) {
          state.matchCount = 0;
          return DecorationSet.empty;
        }

        const decorations: Decoration[] = [];
        const regex = new RegExp(
          state.currentSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          'gi'
        );
        let count = 0;

        doc.descendants((node, pos) => {
          if (!node.isText || !node.text) {
            return;
          }
          regex.lastIndex = 0;
          let match;
          while ((match = regex.exec(node.text))) {
            decorations.push(
              Decoration.inline(
                pos + match.index,
                pos + match.index + match[0].length,
                {
                  class: 'search-highlight',
                }
              )
            );
            count++;
          }
        });

        state.matchCount = count;
        return DecorationSet.create(doc, decorations);
      },
    },
  });

export const Search = Extension.create({
  name: 'search',
  /** Add extensions */
  addExtensions: () => [SearchHighlight],
  addProseMirrorPlugins() {
    return [createSearchPlugin(this.editor)];
  },
  onDestroy() {
    editorSearchState.delete(this.editor);
  },
  addKeyboardShortcuts() {
    return {
      /** Focus search on Mod-f */
      'Mod-f': () => {
        const { state } = this.editor;
        const { from, to } = state.selection;
        const selectedText = state.doc.textBetween(from, to, ' ');
        const s = getState(this.editor);
        if (!s.searchInputElement) {
          return true;
        }
        if (selectedText) {
          s.searchInputElement.value =
            s.searchTerm =
            s.currentSearchTerm =
              selectedText;
          s.searchInputElement.dispatchEvent(
            new Event('input', { bubbles: true })
          );
        }
        s.searchInputElement.focus();
        return true;
      },
    };
  },
}) as unknown as ExtensionWithToolbar;

/**
 * Render search toolbar
 * @param {Editor | null} editor - Editor instance
 * @param {ToolbarSize} toolbarSize - Toolbar size
 */
Search.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md'
) => {
  if (!editor) {
    return html``;
  }

  const state = getState(editor);
  const component = (editor as any).component as EditorComponent | undefined;

  /**
   * Applies a new search term and re-renders the editor and toolbar
   * @param {string} term - Search term
   */
  const setTerm = (term: string) => {
    state.searchTerm = state.currentSearchTerm = term;
    editor.view.updateState(editor.view.state);
    component?.requestUpdate?.();
  };

  /**
   * Handle search input
   * @param {Event} e - Input event
   */
  const handleSearchInput = (e: Event) => {
    setTerm((e.target as any).value);
    const highlight = component?.shadowRoot?.querySelector('.search-highlight');
    highlight &&
      requestAnimationFrame(() => highlight.scrollIntoView({ block: 'start' }));
  };

  /**
   * Handle clear
   * @param {CustomEvent} e - Clear event
   */
  const handleClear = (e: CustomEvent) => {
    if (e.detail.value === '') {
      setTerm('');
    }
  };

  /**
   * Handle search ref
   * @param {Element | undefined} el - Search element
   */
  const handleSearchRef = (el: Element | undefined) => {
    if (!el) {
      return;
    }
    state.searchInputElement = el;
    const { shadowRoot } = el;
    if (shadowRoot && !shadowRoot.querySelector('style[data-search-outline]')) {
      const style = document.createElement('style');
      style.setAttribute('data-search-outline', '');
      style.textContent = searchOutlineStyles;
      shadowRoot.appendChild(style);
    }
  };

  return html`
    <style>
      ${searchToolbarStyles}
    </style>
    <div
      class="${BASE_CLASS}__toolbar-group ${BASE_CLASS}__toolbar-group--search">
      <cds-search
        ${ref(handleSearchRef)}
        class="${BASE_CLASS}__search"
        size=${toolbarSize as any}
        placeholder="Search"
        label-text="Search"
        close-button-label-text="Clear search input"
        .value=${state.searchTerm}
        @input=${handleSearchInput}
        @cds-search-input=${handleClear}>
      </cds-search>
      ${state.searchTerm
        ? html`
            <cds-tag class="${BASE_CLASS}__search--count" type="high-contrast">
              ${state.matchCount}
            </cds-tag>
          `
        : ''}
    </div>
  `;
};
