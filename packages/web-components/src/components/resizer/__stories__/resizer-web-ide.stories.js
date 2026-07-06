// cspell:ignore resizer
/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../index';
import { html, render } from 'lit';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import FoldersIcon from '@carbon/icons/es/folders/16.js';
import SearchIcon from '@carbon/icons/es/search/16.js';
import SettingsAdjustIcon from '@carbon/icons/es/settings--adjust/16.js';
import OpenPanelBottomIcon from '@carbon/icons/es/open-panel--bottom/16.js';
import OpenPanelFilledBottomIcon from '@carbon/icons/es/open-panel--filled--bottom/16.js';
import OpenPanelFilledLeftIcon from '@carbon/icons/es/open-panel--filled--left/16.js';
import OpenPanelLeftIcon from '@carbon/icons/es/open-panel--left/16.js';
import OpenPanelFilledRightIcon from '@carbon/icons/es/open-panel--filled--right/16.js';
import OpenPanelRightIcon from '@carbon/icons/es/open-panel--right/16.js';
import CloseIcon from '@carbon/icons/es/close/16.js';
import ChevronDownIcon from '@carbon/icons/es/chevron--down/16.js';
import ChevronUpIcon from '@carbon/icons/es/chevron--up/16.js';

import '@carbon/web-components/es/components/button/index.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import '@carbon/web-components/es/components/overflow-menu/index.js';
import '@carbon/web-components/es/components/search/index.js';
import '@carbon/web-components/es/components/tabs/index.js';
import '@carbon/web-components/es/components/tree-view/index.js';
import '@carbon/web-components/es/components/layer/index.js';
import storyStyles from './resizer-web-ide.stories.scss?inline';

import { BUTTON_KIND } from '@carbon/web-components/es/components/button/defs.js';

export default {
  title: 'Components/Resizer/Examples',
  parameters: { layout: 'fullscreen' },
};

const VIEWS = { EXPLORER: 'explorer', SEARCH: 'search' };

const FILE_CONTENTS = {
  'App.tsx': `import React from 'react';
import { Resizer } from '@carbon/ibm-products';

const App = () => {
  return (
    <div className="app">
      <h1>Hello World</h1>
      <p>This is a resizable layout demo</p>
    </div>
  );
};

export default App;`,
  'index.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
  'Header.tsx': `import React from 'react';

export const Header = () => {
  return (
    <header>
      <h1>My Application</h1>
    </header>
  );
};`,
  'Footer.tsx': `import React from 'react';

export const Footer = () => {
  return (
    <footer>
      <p>&copy; Copyright IBM Corp. 2026</p>
    </footer>
  );
};`,
};

const PANEL_TABS = [
  {
    id: 'panel-tab-0',
    target: 'panel-content-0',
    label: 'Problems',
    value: 'problems',
    content: `<div>No problems detected</div>`,
  },
  {
    id: 'panel-tab-1',
    target: 'panel-content-1',
    label: 'Output',
    value: 'output',
    content: `
      <div>$ npm run build</div>
      <div class="web-ide__panel-text--secondary">&gt; my-app@1.0.0 build</div>
      <div class="web-ide__panel-text--secondary">&gt; tsc &amp;&amp; vite build</div>
      <div class="web-ide__panel-line--spaced">vite v5.0.0 building for production...</div>
      <div class="web-ide__panel-text--success">&#x2713; 127 modules transformed.</div>
      <div class="web-ide__panel-line">dist/index.html 0.45 kB | gzip: 0.30 kB</div>
      <div>dist/assets/index-a1b2c3d4.css 2.15 kB | gzip: 0.89 kB</div>
      <div>dist/assets/index-e5f6g7h8.js 143.21 kB | gzip: 46.33 kB</div>
      <div class="web-ide__panel-text--success web-ide__panel-line--spaced">&#x2713; built in 2.34s</div>`,
  },
  {
    id: 'panel-tab-2',
    target: 'panel-content-2',
    label: 'Debug Console',
    value: 'debug',
    content: `<div class="web-ide__panel-text--secondary">Debug console output will appear here...</div>`,
  },
  {
    id: 'panel-tab-3',
    target: 'panel-content-3',
    label: 'Terminal',
    value: 'terminal',
    content: `
      <div>$ npm start</div>
      <div class="web-ide__panel-text--secondary">&gt; my-app@1.0.0 start</div>
      <div class="web-ide__panel-text--secondary">&gt; vite</div>
      <div class="web-ide__panel-line--spaced">VITE v5.0.0 ready in 423 ms</div>
      <div class="web-ide__panel-line">&#10140; Local: <span class="web-ide__panel-text--link">http://localhost:5173/</span></div>
      <div>&#10140; Network: use --host to expose</div>
      <div class="web-ide__panel-line--spaced">&#10140; press h + enter to show help</div>`,
  },
];

const TOOLBAR_BTNS = [
  {
    key: 'primarySidebar',
    collapsedLabel: 'Show Primary Sidebar',
    expandedLabel: 'Hide Primary Sidebar',
    CollapsedIcon: OpenPanelLeftIcon,
    ExpandedIcon: OpenPanelFilledLeftIcon,
  },
  {
    key: 'panel',
    collapsedLabel: 'Show Panel',
    expandedLabel: 'Hide Panel',
    CollapsedIcon: OpenPanelBottomIcon,
    ExpandedIcon: OpenPanelFilledBottomIcon,
  },
  {
    key: 'secondarySidebar',
    collapsedLabel: 'Show Secondary Sidebar',
    expandedLabel: 'Hide Secondary Sidebar',
    CollapsedIcon: OpenPanelRightIcon,
    ExpandedIcon: OpenPanelFilledRightIcon,
  },
];

/**
 * Update ARIA valuenow on a resizer handle based on adjacent sibling sizes.
 * @param {Element} handle - The resizer handle element
 * @param {'horizontal'|'vertical'} orientation - Orientation of the resizer
 */
function updateResizerAria(handle, orientation) {
  const prev = handle?.previousElementSibling;
  const next = handle?.nextElementSibling;
  if (!prev || !next) {
    return;
  }
  const prevSize =
    orientation === 'horizontal' ? prev.offsetHeight : prev.offsetWidth;
  const nextSize =
    orientation === 'horizontal' ? next.offsetHeight : next.offsetWidth;
  const total = prevSize + nextSize;
  if (total > 0 && !isNaN(prevSize) && !isNaN(nextSize)) {
    handle.setAttribute(
      'aria-valuenow',
      String(Math.round((prevSize / total) * 100))
    );
  }
}

/**
 * Renders a collapsible section header.
 * @param {string} title - Section title text
 * @param {boolean} collapsed - Whether the section is currently collapsed
 * @param {Function} onToggle - Callback to toggle collapsed state
 */
const sectionHeaderTpl = (title, collapsed, onToggle) => html`
  <div
    class="web-ide__section-header"
    role="button"
    tabindex="0"
    aria-expanded=${!collapsed}
    aria-label="${collapsed ? 'Expand' : 'Collapse'} ${title}"
    @click=${onToggle}
    @keydown=${(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggle();
      }
    }}>
    <span>${title}</span>
    ${collapsed ? iconLoader(ChevronDownIcon) : iconLoader(ChevronUpIcon)}
  </div>
`;

/**
 * Renders the file explorer tree view.
 * @param {Function} onFileSelect - Callback fired when a file node is selected
 */
const fileExplorerTpl = (onFileSelect) => html`
  <cds-tree-view hide-label size="xs" @cds-tree-node-selected=${onFileSelect}>
    <cds-tree-node id="src" label="src" value="src" is-expanded>
      <cds-tree-node id="app" label="App.tsx" value="App.tsx"></cds-tree-node>
      <cds-tree-node
        id="index"
        label="index.tsx"
        value="index.tsx"></cds-tree-node>
      <cds-tree-node
        id="components"
        label="components"
        value="components"
        is-expanded>
        <cds-tree-node
          id="header"
          label="Header.tsx"
          value="Header.tsx"></cds-tree-node>
        <cds-tree-node
          id="footer"
          label="Footer.tsx"
          value="Footer.tsx"></cds-tree-node>
      </cds-tree-node>
    </cds-tree-node>
  </cds-tree-view>
`;

/**
 * Renders the outline tree view showing functions and components in the active file.
 */
const outlineViewTpl = () => html`
  <cds-tree-view hide-label size="xs">
    <cds-tree-node
      id="functions"
      label="Functions"
      value="Functions"
      is-expanded>
      <cds-tree-node
        id="handleClick"
        label="handleClick()"
        value="handleClick()"></cds-tree-node>
      <cds-tree-node
        id="render"
        label="render()"
        value="render()"></cds-tree-node>
    </cds-tree-node>
    <cds-tree-node
      id="components-outline"
      label="Components"
      value="Components"
      is-expanded>
      <cds-tree-node
        id="header-component"
        label="Header"
        value="Header"></cds-tree-node>
    </cds-tree-node>
  </cds-tree-view>
`;

/**
 * Factory that returns event-handler objects for a resizer handle.
 * All handlers share a single `initialSize` closure variable.
 *
 * @param {object} cfg - Handler configuration
 * @param {'prev'|'next'} cfg.sibling - Which adjacent element to resize
 * @param {'inline'|'block'} cfg.axis - CSS logical axis to mutate
 * @param {1|-1} cfg.deltaSign - Sign to apply to drag delta
 * @param {number} cfg.min - Minimum size in px
 * @param {(() => number)|undefined} cfg.max - Optional max size in px (as a function for live viewport reads)
 * @param {string} cfg.resetValue - CSS value to restore on reset (empty string clears the property)
 * @returns {{ onStart: Function, onDrag: Function, onEnd: Function, onReset: Function }}
 */
function makeResizerHandlers({
  sibling,
  axis,
  deltaSign,
  min,
  max,
  resetValue,
}) {
  const prop = axis === 'inline' ? 'inlineSize' : 'blockSize';
  const ariaOrientation = axis === 'inline' ? 'vertical' : 'horizontal';
  const transition = `${axis === 'inline' ? 'inline-size' : 'block-size'} 180ms cubic-bezier(0.25, 0.9, 0.25, 1)`;
  let initialSize = 0;

  /**
   * Returns the sibling element to resize relative to the given target.
   * @param {Element} target - The resizer handle element that fired the event
   */
  const getEl = (target) =>
    sibling === 'prev'
      ? target.previousElementSibling
      : target.nextElementSibling;

  /**
   * Handles the resize-start event: captures the initial element size.
   * @param {CustomEvent} e - The resize-start custom event
   */
  const onStart = (e) => {
    const el = getEl(e.target);
    if (el) {
      initialSize = axis === 'inline' ? el.offsetWidth : el.offsetHeight;
      el.style.transition = 'none';
    }
  };

  /**
   * Handles the resize-drag event: updates the element size on each drag tick.
   * @param {CustomEvent} e - The resize-drag custom event carrying a delta value
   */
  const onDrag = (e) => {
    const el = getEl(e.target);
    if (el && e.detail.delta !== undefined) {
      const raw = initialSize + deltaSign * e.detail.delta;
      const clamped = max
        ? Math.min(Math.max(raw, min), max())
        : Math.max(raw, min);
      el.style[prop] = `${clamped}px`;
    }
    updateResizerAria(e.target, ariaOrientation);
  };

  /**
   * Handles the resize-end event: restores CSS transition on the resized element.
   * @param {CustomEvent} e - The resize-end custom event
   */
  const onEnd = (e) => {
    const el = getEl(e.target);
    if (el) {
      el.style.transition = '';
    }
  };

  /**
   * Handles the resize-reset event: animates the element back to its default size.
   * @param {CustomEvent} e - The resize-reset custom event
   */
  const onReset = (e) => {
    const el = getEl(e.target);
    if (el) {
      el.style.transition = transition;
      el.style[prop] = resetValue;
    }
  };

  return { onStart, onDrag, onEnd, onReset };
}

/**
 * WebIDE example — a complete Web IDE-like interface with resizable panels.
 * Demonstrates primary sidebar, secondary sidebar, and bottom panel resizers.
 * @param {object} args - Story arguments
 * @returns {HTMLElement} Story root element
 */
export const WebIDE = (args) => {
  const state = {
    collapsed: {
      primarySidebar: false,
      secondarySidebar: false,
      panel: false,
      explorer: false,
      outline: false,
    },
    activeView: VIEWS.EXPLORER,
    tabs: [
      { id: 'App.tsx', label: 'App.tsx', content: FILE_CONTENTS['App.tsx'] },
      {
        id: 'index.tsx',
        label: 'index.tsx',
        content: FILE_CONTENTS['index.tsx'],
      },
      {
        id: 'Header.tsx',
        label: 'Header.tsx',
        content: FILE_CONTENTS['Header.tsx'],
      },
    ],
    selectedTabIndex: 0,
  };

  const root = document.createElement('div');
  root.className = 'web-ide';
  root.style.setProperty(
    '--resizer-thickness',
    `${args['--resizer-thickness']}px`
  );
  root.style.setProperty(
    '--resizer-grab-thickness',
    `${args['--resizer-grab-thickness']}px`
  );
  root.style.setProperty(
    '--resizer-grab-color',
    args['--resizer-grab-color']
      ? 'var(--cds-background-selected)'
      : 'transparent'
  );

  // Inject story-scoped styles into the root element (not document.head).
  const styleEl = document.createElement('style');
  styleEl.textContent = storyStyles;
  root.appendChild(styleEl);

  /**
   * Toggles the collapsed state of the named panel and triggers a re-render.
   * @param {string} key - Key of the panel in state.collapsed to toggle
   */
  const togglePanel = (key) => {
    state.collapsed[key] = !state.collapsed[key];
    rerender();
  };

  /**
   * Activates a view in the primary sidebar, collapsing it if already active.
   * @param {string} view - View identifier (e.g. VIEWS.EXPLORER)
   */
  const handleViewToggle = (view) => {
    if (state.activeView === view && !state.collapsed.primarySidebar) {
      state.collapsed.primarySidebar = true;
    } else {
      state.activeView = view;
      state.collapsed.primarySidebar = false;
    }
    rerender();
  };

  /**
   * Opens or focuses an editor tab for the given file.
   * @param {string} fileName - File name used as the tab identifier and label
   * @param {string} content - Source code content to display in the editor tab
   */
  const openTab = (fileName, content) => {
    const existing = state.tabs.findIndex((t) => t.id === fileName);
    if (existing !== -1) {
      state.selectedTabIndex = existing;
    } else {
      state.tabs.push({ id: fileName, label: fileName, content });
      state.selectedTabIndex = state.tabs.length - 1;
    }
    rerender();
  };

  /**
   * Closes the editor tab at the given index and adjusts the selected tab.
   * @param {number} idx - Zero-based index of the tab to close
   */
  const closeTab = (idx) => {
    state.tabs = state.tabs.filter((_, i) => i !== idx);
    if (state.tabs.length === 0) {
      state.selectedTabIndex = 0;
    } else if (state.selectedTabIndex >= state.tabs.length) {
      state.selectedTabIndex = state.tabs.length - 1;
    } else if (idx < state.selectedTabIndex) {
      state.selectedTabIndex -= 1;
    }
    rerender();
  };

  /**
   * Handles tree-node selection in the file explorer, opening .tsx files as tabs.
   * @param {CustomEvent} e - The cds-tree-node-selected event carrying a detail.value
   */
  const handleFileSelect = (e) => {
    const fileName = e.detail.value;
    if (!fileName.endsWith('.tsx')) {
      return;
    }
    const content =
      FILE_CONTENTS[fileName] ||
      `import React from 'react';\n\nexport const ${fileName.replace('.tsx', '')} = () => (\n  <div><h2>${fileName.replace('.tsx', '')} Component</h2></div>\n);`;
    openTab(fileName, content);
  };

  /** Returns the maximum inline size allowed for a sidebar (viewport minus reserved space). */
  const maxSidebarSize = () => window.innerWidth - 320;

  // Resizer event handlers — one object per handle, built by a shared factory.
  const primaryHandlers = makeResizerHandlers({
    sibling: 'prev',
    axis: 'inline',
    deltaSign: 1,
    min: 120,
    max: maxSidebarSize,
    resetValue: '16rem',
  });

  const secondaryHandlers = makeResizerHandlers({
    sibling: 'next',
    axis: 'inline',
    deltaSign: -1,
    min: 120,
    max: maxSidebarSize,
    resetValue: '16rem',
  });

  const explorerHandlers = makeResizerHandlers({
    sibling: 'prev',
    axis: 'block',
    deltaSign: 1,
    min: 28,
    resetValue: '',
  });

  const panelHandlers = makeResizerHandlers({
    sibling: 'next',
    axis: 'block',
    deltaSign: -1,
    min: 40,
    resetValue: 'calc(6 * var(--cds-spacing-08))',
  });

  /**
   * Builds and returns the full IDE lit-html template for the current state.
   */
  const buildTemplate = () => {
    const { collapsed, activeView, tabs, selectedTabIndex } = state;

    return html`
      <div class="web-ide__top-toolbar">
        <div class="web-ide__top-toolbar-left">
          <span class="web-ide__top-toolbar-title">Web IDE Demo</span>
        </div>
        <div class="web-ide__top-toolbar-right">
          ${TOOLBAR_BTNS.map(
            ({
              key,
              collapsedLabel,
              expandedLabel,
              CollapsedIcon,
              ExpandedIcon,
            }) => {
              const isCollapsed = collapsed[key];
              return html`
                <cds-icon-button
                  kind=${BUTTON_KIND.GHOST}
                  size="md"
                  align="bottom"
                  ?isselected=${!isCollapsed}
                  @click=${() => togglePanel(key)}>
                  ${iconLoader(isCollapsed ? CollapsedIcon : ExpandedIcon, {
                    slot: 'icon',
                  })}
                  <span slot="tooltip-content"
                    >${isCollapsed ? collapsedLabel : expandedLabel}</span
                  >
                </cds-icon-button>
              `;
            }
          )}
        </div>
      </div>

      <div class="web-ide__body">
        <div class="web-ide__activity-bar">
          <div class="web-ide__activity-bar-top">
            <cds-icon-button
              kind=${BUTTON_KIND.GHOST}
              align="right"
              size="md"
              ?isselected=${activeView === VIEWS.EXPLORER &&
              !collapsed.primarySidebar}
              @click=${() => handleViewToggle(VIEWS.EXPLORER)}>
              ${iconLoader(FoldersIcon, { slot: 'icon' })}
              <span slot="tooltip-content">Explorer</span>
            </cds-icon-button>
            <cds-icon-button
              kind=${BUTTON_KIND.GHOST}
              align="right"
              size="md"
              ?isselected=${activeView === VIEWS.SEARCH &&
              !collapsed.primarySidebar}
              @click=${() => handleViewToggle(VIEWS.SEARCH)}>
              ${iconLoader(SearchIcon, { slot: 'icon' })}
              <span slot="tooltip-content">Search</span>
            </cds-icon-button>
          </div>
          <div class="web-ide__activity-bar-bottom">
            <cds-overflow-menu size="md" kind="ghost" align="right" autoalign>
              ${iconLoader(SettingsAdjustIcon, {
                slot: 'icon',
                style: 'color: var(--cds-icon-primary)',
              })}
              <span slot="tooltip-content">Settings</span>
              <cds-overflow-menu-body direction="top">
                <cds-overflow-menu-item>Preferences</cds-overflow-menu-item>
                <cds-overflow-menu-item>Extensions</cds-overflow-menu-item>
                <cds-overflow-menu-item
                  >Keyboard Shortcuts</cds-overflow-menu-item
                >
                <cds-overflow-menu-item>About</cds-overflow-menu-item>
              </cds-overflow-menu-body>
            </cds-overflow-menu>
          </div>
        </div>

        <div
          class="web-ide__primary-sidebar ${collapsed.primarySidebar
            ? 'web-ide__primary-sidebar--collapsed'
            : ''}">
          ${activeView === VIEWS.EXPLORER
            ? html`
                <div
                  class="web-ide__section web-ide__section--explorer ${collapsed.explorer
                    ? 'web-ide__section--collapsed'
                    : ''}">
                  ${sectionHeaderTpl('Explorer', collapsed.explorer, () =>
                    togglePanel('explorer')
                  )}
                  ${!collapsed.explorer
                    ? html`<div class="web-ide__section-content">
                        ${fileExplorerTpl(handleFileSelect)}
                      </div>`
                    : ''}
                </div>
                <clabs-resizer-handle
                  class="clabs__resizer--web-ide"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow="50"
                  @resize-start=${explorerHandlers.onStart}
                  @resize-drag=${explorerHandlers.onDrag}
                  @resize-end=${explorerHandlers.onEnd}
                  @resize-reset=${explorerHandlers.onReset}>
                </clabs-resizer-handle>
                <div
                  class="web-ide__section web-ide__section--outline ${collapsed.outline
                    ? 'web-ide__section--collapsed'
                    : ''}">
                  ${sectionHeaderTpl('Outline', collapsed.outline, () =>
                    togglePanel('outline')
                  )}
                  ${!collapsed.outline
                    ? html`<div class="web-ide__section-content">
                        ${outlineViewTpl()}
                      </div>`
                    : ''}
                </div>
              `
            : activeView === VIEWS.SEARCH
              ? html`
                  <div class="web-ide__section">
                    <div class="web-ide__section-content">
                      <cds-search
                        label-text="Search"
                        placeholder="Search in files"
                        size="sm"></cds-search>
                    </div>
                  </div>
                `
              : ''}
        </div>

        <clabs-resizer-handle
          id="web-ide-primary-resizer"
          class="clabs__resizer--web-ide ${collapsed.primarySidebar
            ? 'clabs__resizer--hidden'
            : ''}"
          orientation="horizontal"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="50"
          @resize-start=${primaryHandlers.onStart}
          @resize-drag=${primaryHandlers.onDrag}
          @resize-end=${primaryHandlers.onEnd}
          @resize-reset=${primaryHandlers.onReset}>
        </clabs-resizer-handle>

        <div class="web-ide__main-content">
          <div class="web-ide__editor">
            ${tabs.length > 0
              ? html`
                  <cds-tabs
                    selected-index=${selectedTabIndex}
                    size="lg"
                    type="contained"
                    dismissable
                    @cds-tab-closed=${(e) => closeTab(e.detail.index)}>
                    ${tabs.map(
                      (tab, idx) => html`
                        <cds-tab
                          id="editor-tab-${idx}"
                          target="editor-panel-${idx}"
                          value=${tab.id}>
                          ${tab.label}
                        </cds-tab>
                      `
                    )}
                  </cds-tabs>
                  ${tabs.map(
                    (tab, idx) => html`
                      <div
                        id="editor-panel-${idx}"
                        class="cds--tab-content"
                        role="tabpanel"
                        aria-labelledby="editor-tab-${idx}"
                        hidden>
                        <pre class="web-ide__editor-content">
${tab.content}</pre
                        >
                      </div>
                    `
                  )}
                `
              : html`<div class="web-ide__empty-state">No files open</div>`}
          </div>

          <clabs-resizer-handle
            class="clabs__resizer--web-ide ${collapsed.panel
              ? 'clabs__resizer--hidden'
              : ''}"
            pivot="both"
            for-start="web-ide-primary-resizer"
            for-end="web-ide-secondary-resizer"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow="50"
            @resize-start=${panelHandlers.onStart}
            @resize-drag=${panelHandlers.onDrag}
            @resize-end=${panelHandlers.onEnd}
            @resize-reset=${panelHandlers.onReset}>
          </clabs-resizer-handle>

          <div
            class="web-ide__panel ${collapsed.panel
              ? 'web-ide__panel--collapsed'
              : ''}">
            <div class="web-ide__panel-tabs">
              <div class="web-ide__panel-tabs-wrapper">
                <cds-tabs value="terminal">
                  ${PANEL_TABS.map(
                    ({ id, target, label, value }) => html`
                      <cds-tab id=${id} target=${target} value=${value}
                        >${label}</cds-tab
                      >
                    `
                  )}
                </cds-tabs>
                <cds-icon-button
                  align="left"
                  kind="ghost"
                  size="md"
                  @click=${() => togglePanel('panel')}>
                  ${iconLoader(CloseIcon, { slot: 'icon' })}
                  <span slot="tooltip-content">Close Panel</span>
                </cds-icon-button>
              </div>
              ${PANEL_TABS.map(
                ({ id, target, content }) => html`
                  <div
                    id=${target}
                    class="cds--tab-content"
                    role="tabpanel"
                    aria-labelledby=${id}
                    hidden>
                    <div
                      class="web-ide__panel-content"
                      .innerHTML=${content}></div>
                  </div>
                `
              )}
            </div>
          </div>
        </div>

        <clabs-resizer-handle
          id="web-ide-secondary-resizer"
          class="clabs__resizer--web-ide ${collapsed.secondarySidebar
            ? 'clabs__resizer--hidden'
            : ''}"
          orientation="horizontal"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="50"
          @resize-start=${secondaryHandlers.onStart}
          @resize-drag=${secondaryHandlers.onDrag}
          @resize-end=${secondaryHandlers.onEnd}
          @resize-reset=${secondaryHandlers.onReset}>
        </clabs-resizer-handle>

        <div
          class="web-ide__secondary-sidebar ${collapsed.secondarySidebar
            ? 'web-ide__secondary-sidebar--collapsed'
            : ''}">
          <div class="web-ide__empty-state">Secondary Sidebar</div>
        </div>
      </div>
    `;
  };

  /**
   * Re-renders the IDE template into the root element.
   */
  const rerender = () => {
    render(buildTemplate(), root);
  };

  rerender();
  return root;
};

WebIDE.argTypes = {
  '--resizer-thickness': {
    control: { type: 'range', min: 1, max: 16, step: 1 },
    description: 'Thickness of the resizer handle',
    table: { defaultValue: { summary: '1px' } },
  },
  '--resizer-grab-thickness': {
    control: { type: 'range', min: 0, max: 32, step: 1 },
    description: 'Additional grab area thickness',
    table: { defaultValue: { summary: '17px' } },
  },
  '--resizer-grab-color': {
    control: { type: 'boolean' },
    description: 'Show grab area highlight (uses --cds-background-selected)',
    table: { defaultValue: { summary: 'false' } },
  },
};

WebIDE.args = {
  '--resizer-thickness': 1,
  '--resizer-grab-thickness': 17,
  '--resizer-grab-color': false,
};
