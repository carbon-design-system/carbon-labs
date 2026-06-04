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

// Styles
const styles = `
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

/** Plugin key for search functionality */
const searchPluginKey = new PluginKey('search');

/** Current search term */
let currentSearchTerm = '';
/** Number of search matches found */
let matchCount = 0;

/**
 * Creates a ProseMirror plugin for search highlighting.
 * @returns {Plugin} ProseMirror plugin instance
 */
function createSearchPlugin() {
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

        if (!currentSearchTerm) {
          matchCount = 0;
          return DecorationSet.empty;
        }

        const searchRegex = new RegExp(
          currentSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
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

        matchCount = count;
        return DecorationSet.create(doc, decorations);
      },
    },
  });
}

/**
 * Interface for the Search extension with toolbar rendering capability.
 * @extends {Extension<any>}
 */
export interface SearchExtension extends Extension<any> {
  /**
   * Renders the search toolbar controls.
   * @param {Editor | null} editor - The TipTap editor instance
   * @param {string} [toolbarSize='md'] - Size of the toolbar buttons
   * @returns {TemplateResult} Lit template for the search toolbar
   */
  toolbarRender: (
    editor: Editor | null,
    toolbarSize?: string
  ) => TemplateResult;
}

/** Current search term in the UI */
let searchTerm = '';

/**
 * Search extension for finding and highlighting text.
 * Provides a search input with live highlighting of matches.
 * @type {SearchExtension}
 */
export const Search = Extension.create({
  name: 'search',

  addExtensions() {
    return [SearchHighlight];
  },

  addProseMirrorPlugins() {
    return [createSearchPlugin()];
  },
}) as unknown as SearchExtension;

/**
 * Renders the search toolbar with search input and match count.
 * @param {Editor | null} editor - The TipTap editor instance
 * @param {string} toolbarSize - Size of the toolbar buttons
 * @returns {TemplateResult} Lit template for the search toolbar
 */
Search.toolbarRender = (editor: Editor | null, toolbarSize = 'md') => {
  /**
   * Handles search input changes and updates highlights.
   * @param {Event} e - Input event
   * @returns {void}
   */
  const handleSearchInput = (e: Event) => {
    const value = (e.target as any).value;
    searchTerm = value;
    currentSearchTerm = value;

    // Force update of decorations
    if (editor) {
      editor.view.updateState(editor.view.state);
      // Trigger re-render of the component
      const component = (editor as any).component;
      if (component && component.requestUpdate) {
        component.requestUpdate();
      }
    }
  };

  /**
   * Handles search input clear event.
   * @param {CustomEvent} e - Clear event
   * @returns {void}
   */
  const handleClear = (e: CustomEvent) => {
    const shouldClear = e.detail.value === '';
    if (shouldClear) {
      searchTerm = '';
      currentSearchTerm = '';
      if (editor) {
        editor.view.updateState(editor.view.state);
        const component = (editor as any).component;
        if (component && component.requestUpdate) {
          component.requestUpdate();
        }
      }
    }
  };

  /**
   * Handles search element reference to inject custom styles.
   * @param {Element | undefined} el - Search element
   * @returns {void}
   */
  const handleSearchRef = (el: Element | undefined) => {
    if (el && el.shadowRoot) {
      // Add style to shadow root for outline offset
      const style = el.shadowRoot.querySelector('style[data-search-outline]');
      if (!style) {
        const styleEl = document.createElement('style');
        styleEl.setAttribute('data-search-outline', '');
        styleEl.textContent = searchOutlineStyles;
        el.shadowRoot.appendChild(styleEl);
      }
    }
  };

  return html`
    <style>
      ${styles}
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
        .value=${searchTerm}
        @input=${handleSearchInput}
        @cds-search-input=${handleClear}>
      </cds-search>
      ${searchTerm
        ? html`
            <span
              style="font-size: 0.875rem; color: var(--cds-text-secondary, #525252); white-space: nowrap; padding-inline: 0.4rem;">
              ${matchCount}
            </span>
          `
        : ''}
    </div>
  `;
};
