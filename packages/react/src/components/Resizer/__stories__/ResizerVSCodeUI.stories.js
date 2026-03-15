// cspell:ignore resizer
/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useCallback } from 'react';
import { action } from 'storybook/actions';
import { Resizer } from '../components/Resizer';
import '../components/resizer.scss';
import {
  ChevronDown,
  ChevronUp,
  Folders,
  Search,
  SettingsAdjust,
} from '@carbon/react/icons';
import {
  Search as SearchComponent,
  Layer,
  OverflowMenu,
  OverflowMenuItem,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  IconButton,
  TreeView,
  TreeNode,
} from '@carbon/react';
import {
  previewCandidate__Toolbar as Toolbar,
  previewCandidate__ToolbarButton as ToolbarButton,
  previewCandidate__ToolbarGroup as ToolbarGroup,
} from '@carbon/ibm-products';
import './ResizerVSCodeUI.scss';

const VIEWS = {
  EXPLORER: 'explorer',
  SEARCH: 'search',
};

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

/**
 * Custom hook to manage tab state
 * @param {Array} initialTabs - Initial tabs array
 * @returns {object} Tab management functions and state
 */
const useTabs = (initialTabs = []) => {
  const [tabs, setTabs] = useState(initialTabs);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openTab = useCallback((fileName, content) => {
    setTabs((prevTabs) => {
      const existingIndex = prevTabs.findIndex((tab) => tab.label === fileName);

      if (existingIndex !== -1) {
        setSelectedIndex(existingIndex);
        return prevTabs;
      }

      const newTabs = [...prevTabs, { label: fileName, content }];
      setSelectedIndex(newTabs.length - 1);
      return newTabs;
    });
  }, []);

  const closeTab = useCallback(
    (index) => {
      setTabs((prevTabs) => {
        const newTabs = prevTabs.filter((_, i) => i !== index);

        if (newTabs.length === 0) {
          setSelectedIndex(0);
        } else if (selectedIndex >= newTabs.length) {
          setSelectedIndex(newTabs.length - 1);
        } else if (index < selectedIndex) {
          setSelectedIndex(selectedIndex - 1);
        }

        return newTabs;
      });
    },
    [selectedIndex]
  );

  const selectTab = useCallback(({ selectedIndex: newIndex }) => {
    setSelectedIndex(newIndex);
  }, []);

  return {
    tabs,
    selectedIndex,
    openTab,
    closeTab,
    selectTab,
  };
};

/**
 * Custom hook to manage panel collapse state
 * @returns {object} Panel state and toggle function
 */
const usePanelState = () => {
  const [collapsed, setCollapsed] = useState({
    leftPanel: false,
    terminal: false,
    explorer: false,
    outline: false,
  });

  const togglePanel = useCallback((panelName) => {
    setCollapsed((prev) => ({
      ...prev,
      [panelName]: !prev[panelName],
    }));
  }, []);

  return { collapsed, togglePanel };
};

/**
 * Collapsible section header component
 * @param {object} props - Component props
 * @param {string} props.title - Section title
 * @param {boolean} props.collapsed - Whether section is collapsed
 * @param {Function} props.onToggle - Toggle handler
 * @returns {React.ReactElement} Section header element
 */
const SectionHeader = ({ title, collapsed, onToggle }) => (
  <Layer>
    <div
      className="vscode-ui__section-header"
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      role="button"
      tabIndex={0}
      aria-expanded={!collapsed}
      aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${title}`}>
      <span>{title}</span>
      {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
    </div>
  </Layer>
);

/**
 * File explorer tree component
 * @param {object} props - Component props
 * @param {Function} props.onFileSelect - File selection handler
 * @returns {React.ReactElement} File explorer tree
 */
const FileExplorer = ({ onFileSelect }) => (
  <TreeView label="File Explorer" hideLabel size="xs" onSelect={onFileSelect}>
    <TreeNode id="src" label="src" value="src" isExpanded>
      <TreeNode id="app" label="App.tsx" value="App.tsx" />
      <TreeNode id="index" label="index.tsx" value="index.tsx" />
      <TreeNode
        id="components"
        label="components"
        value="components"
        isExpanded>
        <TreeNode id="header" label="Header.tsx" value="Header.tsx" />
        <TreeNode id="footer" label="Footer.tsx" value="Footer.tsx" />
      </TreeNode>
    </TreeNode>
  </TreeView>
);

/**
 * Code outline tree component
 * @returns {React.ReactElement} Outline tree view
 */
const OutlineView = () => (
  <TreeView label="Outline" hideLabel size="xs">
    <TreeNode id="functions" label="Functions" value="Functions" isExpanded>
      <TreeNode id="handleClick" label="handleClick()" value="handleClick()" />
      <TreeNode id="render" label="render()" value="render()" />
    </TreeNode>
    <TreeNode
      id="components-outline"
      label="Components"
      value="Components"
      isExpanded>
      <TreeNode id="header-component" label="Header" value="Header" />
    </TreeNode>
  </TreeView>
);

/**
 * Vertical toolbar component
 * @param {object} props - Component props
 * @param {string} props.activeView - Currently active view
 * @param {Function} props.onViewChange - View change handler
 * @param {boolean} props.leftPanelCollapsed - Whether left panel is collapsed
 * @returns {React.ReactElement} Vertical toolbar
 */
const VerticalToolbar = ({ activeView, onViewChange, leftPanelCollapsed }) => (
  <div className="vscode-ui__toolbar">
    <Toolbar vertical>
      <ToolbarGroup>
        <ToolbarButton
          label="Explorer"
          iconDescription="Explorer"
          renderIcon={(props) => <Folders {...props} />}
          onClick={() => onViewChange(VIEWS.EXPLORER)}
          selected={activeView === VIEWS.EXPLORER && !leftPanelCollapsed}
        />
        <ToolbarButton
          label="Search"
          iconDescription="Search"
          renderIcon={(props) => <Search {...props} />}
          onClick={() => onViewChange(VIEWS.SEARCH)}
          selected={activeView === VIEWS.SEARCH && !leftPanelCollapsed}
        />
      </ToolbarGroup>
    </Toolbar>
    <Toolbar vertical>
      <ToolbarGroup>
        <OverflowMenu
          direction="top"
          aria-label="Settings"
          align="right"
          renderIcon={(props) => <SettingsAdjust {...props} />}
          iconDescription="Settings">
          <OverflowMenuItem
            itemText="Preferences"
            onClick={action('Preferences clicked')}
          />
          <OverflowMenuItem
            itemText="Extensions"
            onClick={action('Extensions clicked')}
          />
          <OverflowMenuItem
            itemText="Keyboard Shortcuts"
            onClick={action('Keyboard Shortcuts clicked')}
          />
          <OverflowMenuItem
            hasDivider
            itemText="About"
            onClick={action('About clicked')}
          />
        </OverflowMenu>
      </ToolbarGroup>
    </Toolbar>
  </div>
);

/**
 * Left panel with explorer and search views
 * @param {object} props - Component props
 * @param {string} props.activeView - Currently active view
 * @param {boolean} props.collapsed - Whether panel is collapsed
 * @param {boolean} props.explorerCollapsed - Whether explorer is collapsed
 * @param {boolean} props.outlineCollapsed - Whether outline is collapsed
 * @param {Function} props.onToggleExplorer - Explorer toggle handler
 * @param {Function} props.onToggleOutline - Outline toggle handler
 * @param {Function} props.onFileSelect - File selection handler
 * @param {object} props.resizerProps - Props to pass to Resizer
 * @returns {React.ReactElement} Left panel with resizer
 */
const LeftPanel = ({
  activeView,
  collapsed,
  explorerCollapsed,
  outlineCollapsed,
  onToggleExplorer,
  onToggleOutline,
  onFileSelect,
  resizerProps,
}) => (
  <>
    <div
      className={`vscode-ui__left-panel ${
        collapsed ? 'vscode-ui__left-panel--collapsed' : ''
      }`}>
      {activeView === VIEWS.EXPLORER && (
        <>
          <div
            className={`vscode-ui__section ${
              explorerCollapsed ? 'vscode-ui__section--collapsed' : ''
            }`}
            style={{ height: explorerCollapsed ? undefined : '100%' }}>
            <SectionHeader
              title="Explorer"
              collapsed={explorerCollapsed}
              onToggle={onToggleExplorer}
            />
            {!explorerCollapsed && (
              <div className="vscode-ui__section-content">
                <FileExplorer onFileSelect={onFileSelect} />
              </div>
            )}
          </div>

          <Resizer {...resizerProps} orientation="horizontal" thickness={1} />

          <div
            className={`vscode-ui__section ${
              outlineCollapsed ? 'vscode-ui__section--collapsed' : ''
            }`}
            style={{ height: outlineCollapsed ? undefined : '150px' }}>
            <SectionHeader
              title="Outline"
              collapsed={outlineCollapsed}
              onToggle={onToggleOutline}
            />
            {!outlineCollapsed && (
              <div className="vscode-ui__section-content">
                <OutlineView />
              </div>
            )}
          </div>
        </>
      )}

      {activeView === VIEWS.SEARCH && (
        <div className="vscode-ui__section">
          <div className="vscode-ui__section-content">
            <Layer>
              <SearchComponent
                labelText="Search"
                placeholder="Search in files"
                size="sm"
              />
            </Layer>
          </div>
        </div>
      )}
    </div>

    <Resizer
      {...resizerProps}
      orientation="vertical"
      thickness={1}
      style={{ display: collapsed ? 'none' : 'block' }}
    />
  </>
);

/**
 * Code editor component
 * @param {object} props - Component props
 * @param {Array} props.tabs - Array of open tabs
 * @param {number} props.selectedIndex - Currently selected tab index
 * @param {Function} props.onTabChange - Tab change handler
 * @param {Function} props.onTabClose - Tab close handler
 * @returns {React.ReactElement} Code editor with tabs
 */
const CodeEditor = ({ tabs, selectedIndex, onTabChange, onTabClose }) => (
  <div className="vscode-ui__editor">
    {tabs.length > 0 ? (
      <Tabs
        selectedIndex={selectedIndex}
        onChange={onTabChange}
        size="sm"
        dismissable
        onTabCloseRequest={onTabClose}>
        <TabList contained>
          {tabs.map((tab, index) => (
            <Tab key={index}>{tab.label}</Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabs.map((tab, index) => (
            <TabPanel key={index}>
              <pre
                className="vscode-ui__editor-content"
                contentEditable
                suppressContentEditableWarning>
                {tab.content}
              </pre>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    ) : (
      <div className="vscode-ui__editor-empty">No files open</div>
    )}
  </div>
);

/**
 * Terminal panel component
 * @param {object} props - Component props
 * @param {boolean} props.collapsed - Whether terminal is collapsed
 * @param {Function} props.onToggle - Toggle handler
 * @param {object} props.resizerProps - Props to pass to Resizer
 * @returns {React.ReactElement} Terminal panel with tabs
 */
const TerminalPanel = ({ collapsed, onToggle, resizerProps }) => {
  const [terminalTabIndex, setTerminalTabIndex] = useState(0);

  return (
    <div
      className={`vscode-ui__terminal-panel ${
        collapsed ? 'vscode-ui__terminal-panel--collapsed' : ''
      }`}>
      <Resizer {...resizerProps} orientation="horizontal" thickness={1} />

      <div className="vscode-ui__terminal-tabs">
        <Tabs
          selectedIndex={terminalTabIndex}
          onChange={({ selectedIndex: newIndex }) =>
            setTerminalTabIndex(newIndex)
          }>
          <div className="vscode-ui__terminal-tabs-wrapper">
            <TabList aria-label="Terminal tabs">
              <Tab>Problems</Tab>
              <Tab>Output</Tab>
              <Tab>Debug Console</Tab>
              <Tab>Terminal</Tab>
            </TabList>
            <IconButton
              label={collapsed ? 'Expand' : 'Collapse'}
              align="left"
              kind="ghost"
              size="md"
              onClick={onToggle}>
              {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </IconButton>
          </div>
          {!collapsed && (
            <TabPanels>
              <TabPanel>
                <div className="vscode-ui__terminal-content">
                  <div>⚠️ No problems detected</div>
                </div>
              </TabPanel>
              <TabPanel>
                <div className="vscode-ui__terminal-content">
                  <div>$ npm run build</div>
                  <div className="vscode-ui__terminal-text--secondary">
                    {'>'} my-app@1.0.0 build
                  </div>
                  <div className="vscode-ui__terminal-text--secondary">
                    {'>'} tsc && vite build
                  </div>
                  <div className="vscode-ui__terminal-line--spaced">
                    vite v5.0.0 building for production...
                  </div>
                  <div className="vscode-ui__terminal-text--success">
                    ✓ 127 modules transformed.
                  </div>
                  <div className="vscode-ui__terminal-line">
                    dist/index.html 0.45 kB │ gzip: 0.30 kB
                  </div>
                  <div>
                    dist/assets/index-a1b2c3d4.css 2.15 kB │ gzip: 0.89 kB
                  </div>
                  <div>
                    dist/assets/index-e5f6g7h8.js 143.21 kB │ gzip: 46.33 kB
                  </div>
                  <div className="vscode-ui__terminal-text--success vscode-ui__terminal-line--spaced">
                    ✓ built in 2.34s
                  </div>
                </div>
              </TabPanel>
              <TabPanel>
                <div className="vscode-ui__terminal-content">
                  <div className="vscode-ui__terminal-text--secondary">
                    Debug console output will appear here...
                  </div>
                </div>
              </TabPanel>
              <TabPanel>
                <div className="vscode-ui__terminal-content">
                  <div>$ npm start</div>
                  <div className="vscode-ui__terminal-text--secondary">
                    {'>'} my-app@1.0.0 start
                  </div>
                  <div className="vscode-ui__terminal-text--secondary">
                    {'>'} vite
                  </div>
                  <div className="vscode-ui__terminal-line--spaced">
                    VITE v5.0.0 ready in 423 ms
                  </div>
                  <div className="vscode-ui__terminal-line">
                    ➜ Local:{' '}
                    <span className="vscode-ui__terminal-text--link">
                      http://localhost:5173/
                    </span>
                  </div>
                  <div>➜ Network: use --host to expose</div>
                  <div className="vscode-ui__terminal-line--spaced">
                    ➜ press h + enter to show help
                  </div>
                </div>
              </TabPanel>
            </TabPanels>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default {
  title: 'Components/Resizer/Examples',
  component: Resizer,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    orientation: {
      control: false,
    },
    children: {
      control: false,
    },
  },
};

// eslint-disable-next-line jsdoc/require-param
/**
 * VSCodeUI example - A complete VSCode-like interface with resizable panels
 */
export const VSCodeUI = (args) => {
  // State management using custom hooks
  const { collapsed, togglePanel } = usePanelState();
  const [activeView, setActiveView] = useState(VIEWS.EXPLORER);
  const { tabs, selectedIndex, openTab, closeTab, selectTab } = useTabs([
    { label: 'App.tsx', content: FILE_CONTENTS['App.tsx'] },
    { label: 'index.tsx', content: FILE_CONTENTS['index.tsx'] },
    { label: 'Header.tsx', content: FILE_CONTENTS['Header.tsx'] },
  ]);

  // Memoized handlers
  const handleViewToggle = useCallback(
    (view) => {
      if (activeView === view && !collapsed.leftPanel) {
        togglePanel('leftPanel');
      } else {
        setActiveView(view);
        if (collapsed.leftPanel) {
          togglePanel('leftPanel');
        }
      }
    },
    [activeView, collapsed.leftPanel, togglePanel]
  );

  const handleFileSelect = useCallback(
    (event, node) => {
      const fileName = node.value;
      if (!fileName.endsWith('.tsx')) {
        return;
      }

      const content =
        FILE_CONTENTS[fileName] ||
        `import React from 'react';\n\nexport const ${fileName.replace(
          '.tsx',
          ''
        )} = () => {\n  return (\n    <div>\n      <h2>${fileName.replace(
          '.tsx',
          ''
        )} Component</h2>\n    </div>\n  );\n};`;

      openTab(fileName, content);
    },
    [openTab]
  );

  return (
    <div className="vscode-ui">
      <VerticalToolbar
        activeView={activeView}
        onViewChange={handleViewToggle}
        leftPanelCollapsed={collapsed.leftPanel}
      />

      <LeftPanel
        activeView={activeView}
        collapsed={collapsed.leftPanel}
        explorerCollapsed={collapsed.explorer}
        outlineCollapsed={collapsed.outline}
        onToggleExplorer={() => togglePanel('explorer')}
        onToggleOutline={() => togglePanel('outline')}
        onFileSelect={handleFileSelect}
        resizerProps={args}
      />

      <div className="vscode-ui__right-container">
        <CodeEditor
          tabs={tabs}
          selectedIndex={selectedIndex}
          onTabChange={selectTab}
          onTabClose={closeTab}
        />

        <TerminalPanel
          collapsed={collapsed.terminal}
          onToggle={() => togglePanel('terminal')}
          resizerProps={args}
        />
      </div>
    </div>
  );
};
