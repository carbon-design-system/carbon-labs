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

/** Update ARIA valuenow on a resizer handle based on adjacent sibling sizes. */
function updateResizerAria(handle, orientation) {
  const prev = handle?.previousElementSibling;
  const next = handle?.nextElementSibling;
  if (!prev || !next) return;
  const prevSize = orientation === 'horizontal' ? prev.offsetHeight : prev.offsetWidth;
  const nextSize = orientation === 'horizontal' ? next.offsetHeight : next.offsetWidth;
  const total = prevSize + nextSize;
  if (total > 0 && !isNaN(prevSize) && !isNaN(nextSize)) {
    handle.setAttribute('aria-valuenow', String(Math.round((prevSize / total) * 100)));
  }
}

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

const fileExplorerTpl = (onFileSelect) => html`
  <cds-tree-view hide-label size="xs" @cds-tree-node-selected=${onFileSelect}>
    <cds-tree-node id="src" label="src" value="src" is-expanded>
      <cds-tree-node id="app" label="App.tsx" value="App.tsx"></cds-tree-node>
      <cds-tree-node id="index" label="index.tsx" value="index.tsx"></cds-tree-node>
      <cds-tree-node id="components" label="components" value="components" is-expanded>
        <cds-tree-node id="header" label="Header.tsx" value="Header.tsx"></cds-tree-node>
        <cds-tree-node id="footer" label="Footer.tsx" value="Footer.tsx"></cds-tree-node>
      </cds-tree-node>
    </cds-tree-node>
  </cds-tree-view>
`;

const outlineViewTpl = () => html`
  <cds-tree-view hide-label size="xs">
    <cds-tree-node id="functions" label="Functions" value="Functions" is-expanded>
      <cds-tree-node id="handleClick" label="handleClick()" value="handleClick()"></cds-tree-node>
      <cds-tree-node id="render" label="render()" value="render()"></cds-tree-node>
    </cds-tree-node>
    <cds-tree-node id="components-outline" label="Components" value="Components" is-expanded>
      <cds-tree-node id="header-component" label="Header" value="Header"></cds-tree-node>
    </cds-tree-node>
  </cds-tree-view>
`;

/**
 * WebIDE example — a complete Web IDE-like interface with resizable panels.
* Demonstrates primary sidebar, secondary sidebar, and bottom panel resizers.
 * @param {object} args - Story arguments
 * @returns {HTMLElement} Story root element
 */
export const WebIDE = (args) => {
  if (!document.getElementById('web-ide-story-styles')) {
    const style = document.createElement('style');
    style.id = 'web-ide-story-styles';
    style.textContent = storyStyles;
    document.head.appendChild(style);
  }

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
      { id: 'index.tsx', label: 'index.tsx', content: FILE_CONTENTS['index.tsx'] },
      { id: 'Header.tsx', label: 'Header.tsx', content: FILE_CONTENTS['Header.tsx'] },
    ],
    selectedTabIndex: 0,
  };

  let primaryInitialWidth = 0;
  let secondaryInitialWidth = 0;
  let explorerInitialHeight = 0;
  let panelInitialHeight = 0;

  const root = document.createElement('div');
  root.className = 'web-ide';
  root.style.setProperty('--resizer-thickness', `${args['--resizer-thickness']}px`);
  root.style.setProperty('--resizer-grab-thickness', `${args['--resizer-grab-thickness']}px`);
  root.style.setProperty('--resizer-grab-color', args['--resizer-grab-color'] ? 'var(--cds-background-selected)' : 'transparent');

  // Build the bottom panel imperatively — cds-tabs requires panel siblings in
  // the same container and manages visibility via target IDs once connected.
  const panelTabsEl = document.createElement('cds-tabs');
  panelTabsEl.setAttribute('value', 'terminal');

  PANEL_TABS.forEach(({ id, target, label, value }) => {
    const tab = document.createElement('cds-tab');
    tab.id = id;
    tab.setAttribute('target', target);
    tab.setAttribute('value', value);
    tab.textContent = label;
    panelTabsEl.appendChild(tab);
  });

  const panelCloseBtnEl = document.createElement('cds-icon-button');
  panelCloseBtnEl.setAttribute('align', 'left');
  panelCloseBtnEl.setAttribute('kind', 'ghost');
  panelCloseBtnEl.setAttribute('size', 'md');
  const closeBtnIcon = document.createElement('span');
  closeBtnIcon.slot = 'icon';
  render(iconLoader(CloseIcon), closeBtnIcon);
  panelCloseBtnEl.appendChild(closeBtnIcon);
  const closeBtnTooltip = document.createElement('span');
  closeBtnTooltip.slot = 'tooltip-content';
  closeBtnTooltip.textContent = 'Close Panel';
  panelCloseBtnEl.appendChild(closeBtnTooltip);

  const panelTabsWrapperEl = document.createElement('div');
  panelTabsWrapperEl.className = 'web-ide__panel-tabs-wrapper';
  panelTabsWrapperEl.appendChild(panelTabsEl);
  panelTabsWrapperEl.appendChild(panelCloseBtnEl);

  const panelTabsContainerEl = document.createElement('div');
  panelTabsContainerEl.className = 'web-ide__panel-tabs';
  panelTabsContainerEl.appendChild(panelTabsWrapperEl);

  PANEL_TABS.forEach(({ id, target, content }) => {
    const panel = document.createElement('div');
    panel.id = target;
    panel.className = 'cds--tab-content';
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', id);
    panel.hidden = true;
    panel.innerHTML = `<div class="web-ide__panel-content">${content}</div>`;
    panelTabsContainerEl.appendChild(panel);
  });

  const panelEl = document.createElement('div');
  panelEl.className = 'web-ide__panel';
  panelEl.appendChild(panelTabsContainerEl);

  const panelResizerEl = document.createElement('clabs-resizer-handle');
  panelResizerEl.className = 'clabs__resizer--web-ide';
  panelResizerEl.setAttribute('aria-valuemin', '0');
  panelResizerEl.setAttribute('aria-valuemax', '100');
  panelResizerEl.setAttribute('aria-valuenow', '50');
  panelResizerEl.setAttribute('pivot', 'both');
  panelResizerEl.setAttribute('for-start', 'web-ide-primary-resizer');
  panelResizerEl.setAttribute('for-end', 'web-ide-secondary-resizer');

  // State mutations — all trigger a re-render
  const togglePanel = (key) => {
    state.collapsed[key] = !state.collapsed[key];
    rerender();
  };

  const handleViewToggle = (view) => {
    if (state.activeView === view && !state.collapsed.primarySidebar) {
      state.collapsed.primarySidebar = true;
    } else {
      state.activeView = view;
      state.collapsed.primarySidebar = false;
    }
    rerender();
  };

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

  const handleFileSelect = (e) => {
    const fileName = e.detail.value;
    if (!fileName.endsWith('.tsx')) return;
    const content =
      FILE_CONTENTS[fileName] ||
      `import React from 'react';\n\nexport const ${fileName.replace('.tsx', '')} = () => (\n  <div><h2>${fileName.replace('.tsx', '')} Component</h2></div>\n);`;
    openTab(fileName, content);
  };

  // Resizer event handlers
  const onPrimaryResizerStart = (e) => {
    const prev = e.target.previousElementSibling;
    if (prev) { primaryInitialWidth = prev.offsetWidth; prev.style.transition = 'none'; }
  };
  const onPrimaryResizerDrag = (e) => {
    const prev = e.target.previousElementSibling;
    if (prev && e.detail.delta !== undefined) {
      prev.style.inlineSize = `${Math.max(120, Math.min(primaryInitialWidth + e.detail.delta, window.innerWidth - 320))}px`;
    }
    updateResizerAria(e.target, 'vertical');
  };
  const onPrimaryResizerReset = (e) => {
    const prev = e.target.previousElementSibling;
    if (prev) { prev.style.transition = 'inline-size 180ms cubic-bezier(0.25, 0.9, 0.25, 1)'; prev.style.inlineSize = '16rem'; }
  };

  const onSecondaryResizerStart = (e) => {
    const next = e.target.nextElementSibling;
    if (next) { secondaryInitialWidth = next.offsetWidth; next.style.transition = 'none'; }
  };
  const onSecondaryResizerDrag = (e) => {
    const next = e.target.nextElementSibling;
    if (next && e.detail.delta !== undefined) {
      next.style.inlineSize = `${Math.max(120, Math.min(secondaryInitialWidth - e.detail.delta, window.innerWidth - 320))}px`;
    }
    updateResizerAria(e.target, 'vertical');
  };
  const onSecondaryResizerReset = (e) => {
    const next = e.target.nextElementSibling;
    if (next) { next.style.transition = 'inline-size 180ms cubic-bezier(0.25, 0.9, 0.25, 1)'; next.style.inlineSize = '16rem'; }
  };

  const onExplorerResizerStart = (e) => {
    const prev = e.target.previousElementSibling;
    if (prev) { explorerInitialHeight = prev.offsetHeight; prev.style.transition = 'none'; }
  };
  const onExplorerResizerDrag = (e) => {
    const prev = e.target.previousElementSibling;
    if (prev && e.detail.delta !== undefined) {
      prev.style.blockSize = `${Math.max(28, explorerInitialHeight + e.detail.delta)}px`;
    }
    updateResizerAria(e.target, 'horizontal');
  };
  const onExplorerResizerReset = (e) => {
    const prev = e.target.previousElementSibling;
    if (prev) { prev.style.transition = 'block-size 180ms cubic-bezier(0.25, 0.9, 0.25, 1)'; prev.style.blockSize = ''; }
  };

  const onPanelResizerStart = (e) => {
    const next = e.target.nextElementSibling;
    if (next) { panelInitialHeight = next.offsetHeight; next.style.transition = 'none'; }
  };
  const onPanelResizerDrag = (e) => {
    const next = e.target.nextElementSibling;
    if (next && e.detail.delta !== undefined) {
      next.style.blockSize = `${Math.max(40, panelInitialHeight - e.detail.delta)}px`;
    }
    updateResizerAria(e.target, 'horizontal');
  };
  const onPanelResizerReset = (e) => {
    const next = e.target.nextElementSibling;
    if (next) { next.style.transition = 'block-size 180ms cubic-bezier(0.25, 0.9, 0.25, 1)'; next.style.blockSize = 'calc(6 * var(--cds-spacing-08))'; }
  };

  panelResizerEl.addEventListener('resize-start', onPanelResizerStart);
  panelResizerEl.addEventListener('resize-drag', onPanelResizerDrag);
  panelResizerEl.addEventListener('resize-reset', onPanelResizerReset);
  panelCloseBtnEl.addEventListener('click', () => togglePanel('panel'));

  const buildTemplate = () => {
    const { collapsed, activeView, tabs, selectedTabIndex } = state;

    return html`
      <div class="web-ide__top-toolbar">
        <div class="web-ide__top-toolbar-left">
          <span class="web-ide__top-toolbar-title">Web IDE Demo</span>
        </div>
        <div class="web-ide__top-toolbar-right">
          ${TOOLBAR_BTNS.map(({ key, collapsedLabel, expandedLabel, CollapsedIcon, ExpandedIcon }) => {
      const isCollapsed = collapsed[key];
      return html`
              <cds-icon-button
                kind=${BUTTON_KIND.GHOST}
                size="md"
                align="bottom"
                ?isselected=${!isCollapsed}
                @click=${() => togglePanel(key)}>
                ${iconLoader(isCollapsed ? CollapsedIcon : ExpandedIcon, { slot: 'icon' })}
                <span slot="tooltip-content">${isCollapsed ? collapsedLabel : expandedLabel}</span>
              </cds-icon-button>
            `;
    })}
        </div>
      </div>

      <div class="web-ide__body">
        <div class="web-ide__activity-bar">
          <div class="web-ide__activity-bar-top">
            <cds-icon-button
              kind=${BUTTON_KIND.GHOST}
              align="right"
              size="md"
              ?isselected=${activeView === VIEWS.EXPLORER && !collapsed.primarySidebar}
              @click=${() => handleViewToggle(VIEWS.EXPLORER)}>
              ${iconLoader(FoldersIcon, { slot: 'icon' })}
              <span slot="tooltip-content">Explorer</span>
            </cds-icon-button>
            <cds-icon-button
              kind=${BUTTON_KIND.GHOST}
              align="right"
              size="md"
              ?isselected=${activeView === VIEWS.SEARCH && !collapsed.primarySidebar}
              @click=${() => handleViewToggle(VIEWS.SEARCH)}>
              ${iconLoader(SearchIcon, { slot: 'icon' })}
              <span slot="tooltip-content">Search</span>
            </cds-icon-button>
          </div>
          <div class="web-ide__activity-bar-bottom">
            <cds-overflow-menu size="md" kind="ghost" align="right" autoalign>
              ${iconLoader(SettingsAdjustIcon, { slot: 'icon', style: 'color: var(--cds-icon-primary)' })}
              <span slot="tooltip-content">Settings</span>
              <cds-overflow-menu-body direction="top">
                <cds-overflow-menu-item>Preferences</cds-overflow-menu-item>
                <cds-overflow-menu-item>Extensions</cds-overflow-menu-item>
                <cds-overflow-menu-item>Keyboard Shortcuts</cds-overflow-menu-item>
                <cds-overflow-menu-item>About</cds-overflow-menu-item>
              </cds-overflow-menu-body>
            </cds-overflow-menu>
          </div>
        </div>

        <div class="web-ide__primary-sidebar ${collapsed.primarySidebar ? 'web-ide__primary-sidebar--collapsed' : ''}">
          ${activeView === VIEWS.EXPLORER ? html`
            <div class="web-ide__section web-ide__section--explorer ${collapsed.explorer ? 'web-ide__section--collapsed' : ''}">
              ${sectionHeaderTpl('Explorer', collapsed.explorer, () => togglePanel('explorer'))}
              ${!collapsed.explorer ? html`
                <div class="web-ide__section-content">${fileExplorerTpl(handleFileSelect)}</div>
              ` : ''}
            </div>
            <clabs-resizer-handle
              class="clabs__resizer--web-ide"
              aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"
              @resize-start=${onExplorerResizerStart}
              @resize-drag=${onExplorerResizerDrag}
              @resize-reset=${onExplorerResizerReset}>
            </clabs-resizer-handle>
            <div class="web-ide__section web-ide__section--outline ${collapsed.outline ? 'web-ide__section--collapsed' : ''}">
              ${sectionHeaderTpl('Outline', collapsed.outline, () => togglePanel('outline'))}
              ${!collapsed.outline ? html`
                <div class="web-ide__section-content">${outlineViewTpl()}</div>
              ` : ''}
            </div>
          ` : activeView === VIEWS.SEARCH ? html`
            <div class="web-ide__section">
              <div class="web-ide__section-content">
                <cds-search label-text="Search" placeholder="Search in files" size="sm"></cds-search>
              </div>
            </div>
          ` : ''}
        </div>

        <clabs-resizer-handle
          id="web-ide-primary-resizer"
          class="clabs__resizer--web-ide ${collapsed.primarySidebar ? 'clabs__resizer--hidden' : ''}"
          orientation="horizontal"
          aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"
          @resize-start=${onPrimaryResizerStart}
          @resize-drag=${onPrimaryResizerDrag}
          @resize-reset=${onPrimaryResizerReset}>
        </clabs-resizer-handle>

        <div class="web-ide__main-content">
          <div class="web-ide__editor">
            ${tabs.length > 0 ? html`
              <cds-tabs
                selected-index=${selectedTabIndex}
                size="lg"
                type="contained"
                dismissable
                @cds-tab-closed=${(e) => closeTab(e.detail.index)}>
                ${tabs.map((tab, idx) => html`
                  <cds-tab id="editor-tab-${idx}" target="editor-panel-${idx}" value=${tab.id}>
                    ${tab.label}
                  </cds-tab>
                `)}
              </cds-tabs>
              ${tabs.map((tab, idx) => html`
                <div
                  id="editor-panel-${idx}"
                  class="cds--tab-content"
                  role="tabpanel"
                  aria-labelledby="editor-tab-${idx}"
                  hidden>
                  <pre class="web-ide__editor-content">${tab.content}</pre>
                </div>
              `)}
            ` : html`
              <div class="web-ide__empty-state">No files open</div>
            `}
          </div>
        </div>

        <clabs-resizer-handle
          id="web-ide-secondary-resizer"
          class="clabs__resizer--web-ide ${collapsed.secondarySidebar ? 'clabs__resizer--hidden' : ''}"
          orientation="horizontal"
          aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"
          @resize-start=${onSecondaryResizerStart}
          @resize-drag=${onSecondaryResizerDrag}
          @resize-reset=${onSecondaryResizerReset}>
        </clabs-resizer-handle>

        <div class="web-ide__secondary-sidebar ${collapsed.secondarySidebar ? 'web-ide__secondary-sidebar--collapsed' : ''}">
          <div class="web-ide__empty-state">Secondary Sidebar</div>
        </div>
      </div>
    `;
  };

  const rerender = () => {
    render(buildTemplate(), root);
    const mainContent = root.querySelector('.web-ide__main-content');
    if (mainContent && !mainContent.contains(panelResizerEl)) {
      mainContent.appendChild(panelResizerEl);
      mainContent.appendChild(panelEl);
    }
    panelEl.classList.toggle('web-ide__panel--collapsed', state.collapsed.panel);
    panelResizerEl.classList.toggle('clabs__resizer--hidden', state.collapsed.panel);
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
