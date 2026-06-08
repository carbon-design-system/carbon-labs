/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// TipTap core imports
import { Extension, Mark } from '@tiptap/core';
import type { Editor } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

// Lit imports
import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { ref } from 'lit/directives/ref.js';

// Carbon components
import '@carbon/web-components/es/components/search/index.js';

// Local imports
import { BASE_CLASS } from '../constants';
import type { ToolbarSize } from '../types.js';
import type { EditorComponent } from '../types';

// Instance-specific state management using WeakMap
interface SearchState {
  searchTerm: string;
  currentSearchTerm: string;
  matchCount: number;
  searchInputElement: any;
  cachedElements: {
    container?: Element;
    searchHighlight?: Element;
  };
}

const editorSearchState = new WeakMap<Editor, SearchState>();

/**
 * Gets or creates search state for an editor instance
 * @param {Editor} editor - The TipTap editor instance
 * @returns {SearchState} The search state for this editor
 */
const getSearchState = (editor: Editor): SearchState => {
  let state = editorSearchState.get(editor);
  if (!state) {
    state = {
      searchTerm: '',
      currentSearchTerm: '',
      matchCount: 0,
      searchInputElement: null,
      cachedElements: {},
    };
    editorSearchState.set(editor, state);
  }
  return state;
};

// Styles
const searchToolbarStyles = `
  .${BASE_CLASS}__toolbar-group--search {
    display: flex;
    align-items: center;
    flex: 1;
  }

  .${BASE_CLASS}__search {
    --cds-border-strong: transparent;
    min-inline-size: 12rem;
  }
`;

const searchOutlineStyles = `
  :host([expandable]:focus-within) .cds--search-magnifier {
    outline-offset: -2px;
  }
`;

/**
 * Custom Mark for search result highlighting.
 * Creates a <mark> element with search-highlight class.
 * @type {Mark}
 */
const SearchHighlight = Mark.create({
  name: 'searchHighlight',
  addOptions() {
    return {
      HTMLAttributes: {
        class: 'search-highlight',
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'mark.search-highlight',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['mark', { ...this.options.HTMLAttributes, ...HTMLAttributes }, 0];
  },
});

/**
 * Plugin key for search functionality.
 * @type {PluginKey}
 */
const searchPluginKey = new PluginKey('search');

/**
 * Creates a ProseMirror plugin for search highlighting with decorations.
 * @param {Editor} editor - The TipTap editor instance
 * @returns {Plugin} ProseMirror plugin instance
 */
const createSearchPlugin = (editor: Editor) => {
  return new Plugin({
    key: searchPluginKey,
    state: {
      init() {
        return DecorationSet.empty;
      },
      apply(tr, oldState) {
        return oldState.map(tr.mapping, tr.doc);
      },
    },
    props: {
      decorations(state) {
        const { doc } = state;
        const decorations: Decoration[] = [];
        const searchState = getSearchState(editor);

        if (!searchState.currentSearchTerm) {
          searchState.matchCount = 0;
          return DecorationSet.empty;
        }

        const searchRegex = new RegExp(
          searchState.currentSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          'gi'
        );

        let count = 0;
        doc.descendants((node, pos) => {
          if (node.isText && node.text) {
            let match;
            const text = node.text;
            searchRegex.lastIndex = 0;

            while ((match = searchRegex.exec(text)) !== null) {
              const from = pos + match.index;
              const to = from + match[0].length;
              decorations.push(
                Decoration.inline(from, to, {
                  class: 'search-highlight',
                })
              );
              count++;
            }
          }
        });

        searchState.matchCount = count;
        return DecorationSet.create(doc, decorations);
      },
    },
  });
};

/**
 * Injects custom styles into the search element's shadow root.
 * @param {Element} el - Search element
 * @returns {void}
 */
const injectSearchStyles = (el: Element) => {
  if (el.shadowRoot) {
    const style = el.shadowRoot.querySelector('style[data-search-outline]');
    if (!style) {
      const styleEl = document.createElement('style');
      styleEl.setAttribute('data-search-outline', '');
      styleEl.textContent = searchOutlineStyles;
      el.shadowRoot.appendChild(styleEl);
    }
  }
};

/**
 * Scrolls the first search highlight into view with caching.
 * @param {Editor} editor - The TipTap editor instance
 * @returns {void}
 */
const scrollToFirstMatch = (editor: Editor) => {
  const searchState = getSearchState(editor);
  const component = (editor as any)?.component as EditorComponent;

  // Use cached element if available and still in DOM
  let searchHighlight = searchState.cachedElements.searchHighlight;
  if (!searchHighlight || !searchHighlight.isConnected) {
    searchHighlight =
      component?.shadowRoot?.querySelector('.search-highlight') || undefined;
    searchState.cachedElements.searchHighlight = searchHighlight;
  }

  if (searchHighlight) {
    requestAnimationFrame(() => {
      try {
        searchHighlight?.scrollIntoView({
          block: 'start',
        });
      } catch (error) {
        console.warn('Failed to scroll to search match:', error);
      }
    });
  }
};

/**
 * Updates the editor view and triggers component re-render.
 * @param {Editor} editor - The TipTap editor instance
 * @returns {void}
 */
const updateEditorView = (editor: Editor) => {
  editor.view.updateState(editor.view.state);
  const component = (editor as any).component as EditorComponent;
  if (component && component.requestUpdate) {
    queueMicrotask(() => component.requestUpdate());
  }
};

/**
 * Focuses the search input and optionally sets its value.
 * @param {Editor} editor - The TipTap editor instance
 * @param {string} [value] - Optional value to set in the search input
 * @returns {void}
 */
const focusSearchForEditor = (editor: Editor, value?: string) => {
  const searchState = getSearchState(editor);
  if (searchState.searchInputElement) {
    if (value !== undefined) {
      searchState.searchInputElement.value = value;
      searchState.searchTerm = value;
      searchState.currentSearchTerm = value;
      searchState.searchInputElement.dispatchEvent(
        new Event('input', { bubbles: true })
      );
    }
    searchState.searchInputElement.focus();
  }
};

/**
 * Interface for the Search extension with toolbar rendering capability.
 * @extends {Extension<any>}
 */
export interface SearchExtension extends Extension<any> {
  /**
   * Renders the search toolbar controls.
   * @param {Editor | null} editor - The TipTap editor instance
   * @param {ToolbarSize} [toolbarSize='md'] - Size of the toolbar buttons
   * @returns {TemplateResult} Lit template for the search toolbar
   */
  toolbarRender: (
    editor: Editor | null,
    toolbarSize?: ToolbarSize
  ) => TemplateResult;
}

/**
 * Search extension for finding and highlighting text in the editor.
 * Provides a search input with live highlighting of matches and keyboard shortcuts.
 * @type {SearchExtension}
 */
export const Search = Extension.create({
  name: 'search',
  /**
   * Adds the SearchHighlight mark extension.
   * @returns {Array} Array containing the SearchHighlight extension
   */
  addExtensions() {
    return [SearchHighlight];
  },
  /**
   * Adds the search plugin for decoration-based highlighting.
   * @returns {Array} Array containing the search plugin
   */
  addProseMirrorPlugins() {
    return [createSearchPlugin(this.editor)];
  },
  /**
   * Cleanup when extension is destroyed
   * @returns {void}
   */
  onDestroy() {
    editorSearchState.delete(this.editor);
  },
  /**
   * Adds keyboard shortcuts for search functionality.
   * @returns {Object} Keyboard shortcut configuration
   */
  addKeyboardShortcuts() {
    return {
      /**
       * Handles Cmd/Ctrl+F keyboard shortcut to focus search.
       * If text is selected, it pre-fills the search input with the selection.
       * @returns {boolean} True to prevent default browser find behavior
       */
      'Mod-f': () => {
        const { state } = this.editor;
        const { from, to } = state.selection;
        const selectedText = state.doc.textBetween(from, to, ' ');

        if (selectedText) {
          focusSearchForEditor(this.editor, selectedText);
        } else {
          focusSearchForEditor(this.editor);
        }

        return true;
      },
    };
  },
}) as unknown as SearchExtension;

/**
 * Renders the search toolbar with search input and match count display.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {ToolbarSize} toolbarSize - Size of the toolbar buttons
 * @returns {TemplateResult} Lit template for the search toolbar
 */
Search.toolbarRender = (
  editor: Editor | null,
  toolbarSize: ToolbarSize = 'md'
) => {
  if (!editor) {
    return html``;
  }

  const searchState = getSearchState(editor);

  /**
   * Handles search input changes and updates highlights.
   * @param {Event} e - Input event
   * @returns {void}
   */
  const handleSearchInput = (e: Event) => {
    const value = (e.target as any).value;
    searchState.searchTerm = value;
    searchState.currentSearchTerm = value;
    updateEditorView(editor);
    scrollToFirstMatch(editor);
  };

  /**
   * Handles search input clear event.
   * @param {CustomEvent} e - Clear event
   * @returns {void}
   */
  const handleClear = (e: CustomEvent) => {
    const shouldClear = e.detail.value === '';
    if (shouldClear) {
      searchState.searchTerm = '';
      searchState.currentSearchTerm = '';
      updateEditorView(editor);
    }
  };

  /**
   * Handles search element reference to inject custom styles and store reference.
   * @param {Element | undefined} el - Search element
   * @returns {void}
   */
  const handleSearchRef = (el: Element | undefined) => {
    if (el) {
      searchState.searchInputElement = el;
      injectSearchStyles(el);
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
        .value=${searchState.searchTerm}
        @input=${handleSearchInput}
        @cds-search-input=${handleClear}>
      </cds-search>
      ${searchState.searchTerm
        ? html`
            <span
              style="font-size: 0.875rem; color: var(--cds-text-secondary, #525252); white-space: nowrap; padding-inline: 0.4rem;">
              ${searchState.matchCount}
            </span>
          `
        : ''}
    </div>
  `;
};
