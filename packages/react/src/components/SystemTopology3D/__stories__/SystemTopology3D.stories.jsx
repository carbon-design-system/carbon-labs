/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import SystemTopology3D from '../index';
import {
  mockPrimaryLayer,
  mockCoreLayer,
  mockFoundationConfig,
  mockTextBracket,
  BLOCK_SIZES,
  FOUNDATION_RACK_STATES,
} from '../index';
import '../src/styles/canvas.scss';
import mdx from './SystemTopology3D.mdx';

const meta = {
  title: 'Components/SystemTopology3D',
  component: SystemTopology3D,
  parameters: {
    docs: {
      page: mdx,
    },
    layout: 'fullscreen',
  },
  argTypes: {
    primaryLayer: {
      control: 'object',
      description: 'Array of blocks for the top layer of the visualization',
      table: {
        type: { summary: 'PrimaryLayerBlock[]' },
        category: 'Data',
      },
    },
    coreLayer: {
      control: 'object',
      description:
        'Array of core service blocks rendered beneath the primary layer',
      table: {
        type: { summary: 'CoreLayerConfig[]' },
        category: 'Data',
      },
    },
    foundationConfig: {
      control: 'object',
      description: 'Rack and drawer configuration for the foundation layer',
      table: {
        type: { summary: 'FoundationConfig' },
        category: 'Data',
      },
    },
    textBracket: {
      control: 'object',
      description:
        'Optional title and supporting copy rendered beside the scene',
      table: {
        type: { summary: 'TextBracketConfig' },
        category: 'Data',
      },
    },
    focusedId: {
      control: 'text',
      description:
        'Controlled focused item id used by keyboard navigation and focus styling',
      table: {
        type: { summary: 'string | null' },
        category: 'Interaction',
      },
    },
    onFocusedIdChange: {
      action: 'focusedIdChanged',
      description:
        'Called when the focused item changes through canvas interaction or a11y navigation',
      table: {
        type: { summary: '(id: string | null) => void' },
        category: 'Interaction',
      },
    },
    hoveredItem: {
      control: 'object',
      description:
        'Controlled hovered item state shared with the canvas interaction context',
      table: {
        type: { summary: 'CanvasHoveredItem | null' },
        category: 'Interaction',
      },
    },
    onHoveredItemChange: {
      action: 'hoveredItemChanged',
      description:
        'Called when pointer or keyboard hover state changes inside the canvas',
      table: {
        type: { summary: '(item: CanvasHoveredItem | null) => void' },
        category: 'Interaction',
      },
    },
    onBlockClick: {
      action: 'blockClicked',
      description: 'Called when a clickable block in any layer is activated',
      table: {
        type: { summary: '(id?: string) => void' },
        category: 'Interaction',
      },
    },
    onViewChange: {
      action: 'viewChanged',
      description: 'Called when the camera/view state changes',
      table: {
        type: { summary: '(info: unknown) => void' },
        category: 'Interaction',
      },
    },
    canvasKey: {
      control: 'text',
      description:
        'Intentionally remounts the React Three Fiber canvas when changed',
      table: {
        type: { summary: 'string | number' },
        category: 'Layout',
      },
    },
    enablePrimaryLayerCarousel: {
      control: 'boolean',
      description:
        'Enables paged carousel behavior for the primary layer when it overflows',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
        category: 'Layout',
      },
    },
    lockColumnCount: {
      control: 'boolean',
      description:
        'Keeps primaryColumnCount fixed instead of automatically using the responsive 2/4/6/8 column count',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
        category: 'Layout',
      },
    },
    primaryColumnCount: {
      control: { type: 'number', min: 1, max: 16, step: 1 },
      description:
        'Explicit number of primary columns to render when column locking is enabled',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '8' },
        category: 'Layout',
      },
    },
    skeletonLoader: {
      control: 'boolean',
      description:
        'Shows loading scaffolds in the primary layer when data has not loaded yet',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
        category: 'Layout',
      },
    },
    responsiveColumnBreakpoints: {
      control: 'object',
      description:
        'Optional responsive width thresholds for switching between 2, 4, 6, and 8 columns',
      table: {
        type: { summary: 'ResponsiveColumnBreakpoints' },
        category: 'Layout',
      },
    },
    onResponsiveColumnCountChange: {
      action: 'responsiveColumnCountChanged',
      description:
        'Optional notification when the responsive primary column count changes',
      table: {
        type: { summary: '(count: number) => void' },
        category: 'Layout',
      },
    },
    theme: {
      control: { type: 'select', options: ['light', 'dark'] },
      description: 'Theme mode for the visualization',
      table: {
        type: { summary: "'light' | 'dark'" },
        defaultValue: { summary: "'dark'" },
        category: 'Theme',
      },
    },
    enableA11y: {
      control: 'boolean',
      description:
        'Enables accessibility helpers, focus management, and off-canvas controls',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
        category: 'Accessibility',
      },
    },
    i18n: {
      control: 'object',
      description: 'Optional accessibility and UI copy overrides',
      table: {
        type: { summary: 'object' },
        category: 'Accessibility',
      },
    },
  },
};

export default meta;

// Generic mock data for non-demo stories
const genericPrimaryLayer = Array.from({ length: 18 }, (_, i) => ({
  id: `block-${i}`,
  label: 'Block',
  hoverLabel: `Block ${i + 1}`,
  columnIndex: i % 8,
  size: [BLOCK_SIZES.sm, BLOCK_SIZES.md, BLOCK_SIZES.lg][i % 3],
}));

// Responsive primary layer - blocks distributed across fewer columns for better remapping
const responsivePrimaryLayer = Array.from({ length: 16 }, (_, i) => ({
  id: `block-${i}`,
  label: 'Block',
  hoverLabel: `Block ${i + 1}`,
  size: [BLOCK_SIZES.sm, BLOCK_SIZES.md, BLOCK_SIZES.lg][i % 3],
}));

const genericCoreLayer = [
  {
    id: 'core-1',
    label: 'Core Service',
    hoverLabel: 'Core Layer',
    size: BLOCK_SIZES.lg,
  },
];

const genericFoundationConfig = {
  id: 'foundation-1',
  label: 'Foundation',
  racks: [
    {
      id: 'rack-1',
      slots: 4,
      variant: FOUNDATION_RACK_STATES.open,
      status: 'green',
    },
    {
      id: 'rack-2',
      slots: 4,
      variant: FOUNDATION_RACK_STATES.open,
      status: 'green',
    },
    {
      id: 'rack-3',
      slots: 4,
      variant: FOUNDATION_RACK_STATES.open,
      status: 'green',
    },
    {
      id: 'rack-4',
      slots: 4,
      variant: FOUNDATION_RACK_STATES.open,
      status: 'green',
    },
  ],
};

const genericTextBracket = {
  title: 'System Topology 3D',
  sections: ['Multiple layers', 'Interactive blocks'],
};

// Reusable story template
const Template = (args) => {
  const [focusedId, setFocusedId] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [viewInfo, setViewInfo] = useState(null);

  const handleBlockClick = (blockId) => {
    console.log('Block clicked:', blockId);
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <SystemTopology3D
        primaryLayer={args.primaryLayer}
        coreLayer={args.coreLayer}
        foundationConfig={args.foundationConfig}
        textBracket={args.textBracket}
        focusedId={focusedId}
        onFocusedIdChange={setFocusedId}
        hoveredItem={hoveredItem}
        onHoveredItemChange={setHoveredItem}
        onBlockClick={handleBlockClick}
        onViewChange={setViewInfo}
        lockColumnCount={args.lockColumnCount}
        primaryColumnCount={args.primaryColumnCount}
        skeletonLoader={args.skeletonLoader}
        theme={args.theme}
        enablePrimaryLayerCarousel={args.enablePrimaryLayerCarousel}
      />
    </div>
  );
};

// ============================================================================
// Overview & Demo Stories
// ============================================================================

export const ProductDemo = Template.bind({});
ProductDemo.args = {
  primaryLayer: mockPrimaryLayer,
  coreLayer: mockCoreLayer,
  foundationConfig: mockFoundationConfig,
  textBracket: mockTextBracket,
  lockColumnCount: false,
  primaryColumnCount: undefined,
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
ProductDemo.globals = {
  theme: 'g100',
};
ProductDemo.parameters = {
  docs: {
    description: {
      story: `
**Full-Featured Product Demonstration**

This story showcases a complete SystemTopology3D implementation with IBM Sovereign Core branding, demonstrating all three layers working together in a production-ready configuration.

**Features Demonstrated:**
- All three layers (Primary, Core, Foundation) fully populated
- Responsive column layout adapting to screen size
- Carousel pagination for overflow content
- Dark theme with g100 Carbon theme
- Interactive hover states and click handlers
- Text bracket with product information
- Real-world data structure and organization

**Use this story to:**
- See the component in a realistic production context
- Understand how all features work together
- Test interaction patterns and behaviors
- Demonstrate the component to stakeholders
      `,
    },
  },
};

export const LightTheme = Template.bind({});
LightTheme.args = {
  primaryLayer: genericPrimaryLayer,
  coreLayer: genericCoreLayer,
  foundationConfig: genericFoundationConfig,
  textBracket: genericTextBracket,
  lockColumnCount: false,
  primaryColumnCount: undefined,
  skeletonLoader: false,
  theme: 'light',
  enablePrimaryLayerCarousel: true,
};
LightTheme.globals = {
  theme: 'g10',
};
LightTheme.parameters = {
  docs: {
    description: {
      story: `
**Light Theme Variant**

Demonstrates the SystemTopology3D in light mode with the Carbon g10 theme, ideal for applications with light backgrounds or when matching light-themed interfaces.

**Key Characteristics:**
- Light color palette optimized for readability on white backgrounds
- Subtle shadows and borders for depth
- High contrast text for accessibility
- Matches Carbon Design System g10 theme tokens

**When to Use Light Theme:**
- Applications with predominantly light interfaces
- Print or export scenarios requiring light backgrounds
- User preference for light mode
- Environments with bright ambient lighting
- Accessibility requirements for high contrast on light backgrounds

**Theme Integration:**
The \`theme="light"\` prop works in conjunction with Storybook's global theme setting (\`g10\`) to ensure consistent styling across the entire visualization and surrounding UI.
      `,
    },
  },
};

export const DarkTheme = Template.bind({});
DarkTheme.args = {
  primaryLayer: genericPrimaryLayer,
  coreLayer: genericCoreLayer,
  foundationConfig: genericFoundationConfig,
  textBracket: genericTextBracket,
  lockColumnCount: false,
  primaryColumnCount: undefined,
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
DarkTheme.globals = {
  theme: 'g100',
};
DarkTheme.parameters = {
  docs: {
    description: {
      story: `
**Dark Theme Variant**

Demonstrates the SystemTopology3D in dark mode with the Carbon g100 theme, providing an immersive visualization experience ideal for data-intensive applications and low-light environments.

**Key Characteristics:**
- Dark color palette reducing eye strain in low-light conditions
- Vibrant colors that pop against dark backgrounds
- Optimized contrast ratios for accessibility
- Matches Carbon Design System g100 theme tokens

**When to Use Dark Theme:**
- Data visualization and analytics dashboards
- Applications used in low-light environments
- User preference for dark mode
- Reducing screen glare and eye fatigue
- Creating focus on data with minimal UI distraction
- Modern, professional aesthetic

**Theme Integration:**
The \`theme="dark"\` prop works in conjunction with Storybook's global theme setting (\`g100\`) to ensure consistent styling across the entire visualization and surrounding UI.

**Performance Note:**
Dark themes can improve battery life on OLED displays and reduce power consumption, making them ideal for mobile or energy-conscious applications.
      `,
    },
  },
};

export const ResponsiveColumns = Template.bind({});
ResponsiveColumns.args = {
  primaryLayer: responsivePrimaryLayer,
  coreLayer: genericCoreLayer,
  foundationConfig: genericFoundationConfig,
  textBracket: {
    title: 'Responsive Layout',
    sections: [
      'Columns adapt to container width',
      'Resize browser to see changes',
      '< 672px: 2 columns',
      '672-1056px: 4 columns',
      '1056-1312px: 6 columns',
      '≥ 1312px: 8 columns',
    ],
  },
  lockColumnCount: false,
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
ResponsiveColumns.globals = { theme: 'g100' };
ResponsiveColumns.parameters = {
  docs: {
    description: {
      story: `
**Responsive Column Behavior**

This story demonstrates the automatic responsive column layout that adapts to container width using Carbon Design System breakpoints. Resize your browser window to see the columns dynamically adjust.

**Responsive Breakpoints:**
- **< 672px (Mobile)**: 2 columns - Optimized for small screens
- **672px - 1056px (Tablet)**: 4 columns - Balanced for medium screens
- **1056px - 1312px (Desktop)**: 6 columns - Dense layout for large screens
- **≥ 1312px (Large Desktop)**: 8 columns - Maximum density for wide displays

**How It Works:**
When \`lockColumnCount={false}\` (the default), the component uses a ResizeObserver to monitor container width and automatically selects the appropriate column count. Blocks are intelligently redistributed across columns when the layout changes.

**Key Features:**
- Smooth transitions between column counts
- Blocks maintain their relative positions during resize
- Carousel pagination adjusts to new layout
- No manual configuration required
- Follows Carbon Design System grid principles

**Customization:**
Override default breakpoints using the \`responsiveColumnBreakpoints\` prop:
\`\`\`jsx
responsiveColumnBreakpoints={{
  twoColumns: 672,   // Width for 2 columns
  fourColumns: 1056, // Width for 4 columns
  sixColumns: 1312,  // Width for 6 columns
}}
\`\`\`

**When to Use:**
- Applications that run on multiple device sizes
- Dashboards that need to adapt to different screen resolutions
- Responsive web applications
- When you want automatic layout optimization

**When NOT to Use:**
- Fixed-width designs requiring specific column counts
- Print layouts needing consistent structure
- When precise column control is required (use \`lockColumnCount={true}\` instead)
      `,
    },
  },
};

// Made with Bob
