/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import StackGrid3D from '../index';
import { BLOCK_SIZES, FOUNDATION_RACK_STATES } from '../index';
import '../src/styles/canvas.scss';

const meta = {
  title: 'Components/StackGrid3D/Block Styling',
  component: StackGrid3D,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
These stories demonstrate the visual customization options for blocks in the StackGrid3D, including color variations, size combinations, and styling patterns.

## Color System

Blocks support a variety of color options to convey meaning, status, or categorization:

### Available Colors
- **Blue**: Default, neutral, or primary category
- **Green**: Success, healthy, active states
- **Red**: Errors, critical issues, alerts
- **Purple**: Special features, premium services
- **Teal**: Secondary category, alternative grouping
- **Magenta**: Tertiary category, distinct grouping

### Color Usage Guidelines

1. **Semantic Meaning**: Use colors consistently to represent status or category
   - Green for healthy/active
   - Red for errors/critical
   - Yellow/Orange for warnings

2. **Visual Hierarchy**: Use color to draw attention to important blocks
   - Bright colors for high-priority items
   - Muted colors for background/supporting items

3. **Accessibility**: Ensure sufficient contrast and don't rely solely on color
   - Combine with labels and hover text
   - Use patterns or icons when needed

4. **Consistency**: Maintain color meaning across your application
   - Document your color scheme
   - Use the same colors for the same meanings

## Block Properties

Each block can be customized with:

- **\`color\`**: String value for block color (e.g., 'blue', 'green', 'red')
- **\`label\`**: Text displayed on the block
- **\`hoverLabel\`**: Additional text shown on hover (can include status, details)
- **\`size\`**: Block height (\`BLOCK_SIZES.sm\`, \`BLOCK_SIZES.md\`, \`BLOCK_SIZES.lg\`)
- **\`id\`**: Unique identifier for interaction tracking

## Styling Patterns

### Monochromatic
All blocks use the same color for a unified, cohesive look. Best for:
- Simple visualizations
- When color doesn't convey meaning
- Minimalist designs

### Color-Coded Categories
Different colors represent different types or categories. Best for:
- Multi-category data
- Status indicators
- Service type differentiation

### Mixed Approach
Combine colors strategically with most blocks neutral and key blocks highlighted. Best for:
- Drawing attention to specific items
- Showing exceptions or special cases
- Balanced visual hierarchy

## Best Practices

1. **Limit Color Palette**: Use 3-5 colors maximum to avoid visual chaos
2. **Test Accessibility**: Verify color contrast meets WCAG standards
3. **Provide Context**: Use hover labels to explain color meanings
4. **Consider Color Blindness**: Don't rely solely on red/green distinctions
5. **Document Color Meanings**: Create a legend or documentation for your color scheme
6. **Combine with Size**: Use both color and size to create clear hierarchy

## Examples in This Section

- **Colored Blocks**: Mixed colors showing variety
- **Single Color Stories**: Blue, Green, Red, Purple, Teal, Magenta blocks
- Each story demonstrates how a single color looks across multiple blocks
        `,
      },
    },
  },
};

export default meta;

// Generic mock data
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

// Helper function to create blocks with different colors
const createColoredBlocks = (columnCount) => {
  const colors = ['blue', 'green', 'red', 'purple', 'teal', 'magenta'];
  return Array.from({ length: columnCount * 2 }, (_, i) => ({
    id: `colored-${i}`,
    label: 'Block',
    hoverLabel: `${colors[i % colors.length]} Block ${i + 1}`,
    columnIndex: i % columnCount,
    size: BLOCK_SIZES.md,
    color: colors[i % colors.length],
  }));
};

// Reusable story template
const Template = (args) => {
  const [focusedId, setFocusedId] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <StackGrid3D
        primaryLayer={args.primaryLayer}
        coreLayer={args.coreLayer}
        foundationConfig={args.foundationConfig}
        textBracket={args.textBracket}
        focusedId={focusedId}
        onFocusedIdChange={setFocusedId}
        hoveredItem={hoveredItem}
        onHoveredItemChange={setHoveredItem}
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
// Block Color Variations
// ============================================================================

export const ColoredBlocks = Template.bind({});
ColoredBlocks.args = {
  primaryLayer: createColoredBlocks(8),
  coreLayer: genericCoreLayer,
  foundationConfig: genericFoundationConfig,
  textBracket: {
    title: 'Colored Blocks',
    sections: ['Different block colors', 'Visual variety'],
  },
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
ColoredBlocks.globals = { theme: 'g100' };

export const BlueBlocks = Template.bind({});
BlueBlocks.args = {
  primaryLayer: Array.from({ length: 16 }, (_, i) => ({
    id: `blue-${i}`,
    label: 'Block',
    hoverLabel: `Blue Block ${i + 1}`,
    columnIndex: i % 8,
    size: BLOCK_SIZES.md,
    color: 'blue',
  })),
  coreLayer: genericCoreLayer,
  foundationConfig: genericFoundationConfig,
  textBracket: {
    title: 'Blue Theme',
    sections: ['All blue blocks'],
  },
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
BlueBlocks.globals = { theme: 'g100' };

export const GreenBlocks = Template.bind({});
GreenBlocks.args = {
  primaryLayer: Array.from({ length: 16 }, (_, i) => ({
    id: `green-${i}`,
    label: 'Block',
    hoverLabel: `Green Block ${i + 1}`,
    columnIndex: i % 8,
    size: BLOCK_SIZES.md,
    color: 'green',
  })),
  coreLayer: genericCoreLayer,
  foundationConfig: genericFoundationConfig,
  textBracket: {
    title: 'Green Theme',
    sections: ['All green blocks'],
  },
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
GreenBlocks.globals = { theme: 'g100' };

export const RedBlocks = Template.bind({});
RedBlocks.args = {
  primaryLayer: Array.from({ length: 16 }, (_, i) => ({
    id: `red-${i}`,
    label: 'Block',
    hoverLabel: `Red Block ${i + 1}`,
    columnIndex: i % 8,
    size: BLOCK_SIZES.md,
    color: 'red',
  })),
  coreLayer: genericCoreLayer,
  foundationConfig: genericFoundationConfig,
  textBracket: {
    title: 'Red Theme',
    sections: ['All red blocks'],
  },
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
RedBlocks.globals = { theme: 'g100' };

export const PurpleBlocks = Template.bind({});
PurpleBlocks.args = {
  primaryLayer: Array.from({ length: 16 }, (_, i) => ({
    id: `purple-${i}`,
    label: 'Block',
    hoverLabel: `Purple Block ${i + 1}`,
    columnIndex: i % 8,
    size: BLOCK_SIZES.md,
    color: 'purple',
  })),
  coreLayer: genericCoreLayer,
  foundationConfig: genericFoundationConfig,
  textBracket: {
    title: 'Purple Theme',
    sections: ['All purple blocks'],
  },
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
PurpleBlocks.globals = { theme: 'g100' };

export const TealBlocks = Template.bind({});
TealBlocks.args = {
  primaryLayer: Array.from({ length: 16 }, (_, i) => ({
    id: `teal-${i}`,
    label: 'Block',
    hoverLabel: `Teal Block ${i + 1}`,
    columnIndex: i % 8,
    size: BLOCK_SIZES.md,
    color: 'teal',
  })),
  coreLayer: genericCoreLayer,
  foundationConfig: genericFoundationConfig,
  textBracket: {
    title: 'Teal Theme',
    sections: ['All teal blocks'],
  },
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
TealBlocks.globals = { theme: 'g100' };

export const MagentaBlocks = Template.bind({});
MagentaBlocks.args = {
  primaryLayer: Array.from({ length: 16 }, (_, i) => ({
    id: `magenta-${i}`,
    label: 'Block',
    hoverLabel: `Magenta Block ${i + 1}`,
    columnIndex: i % 8,
    size: BLOCK_SIZES.md,
    color: 'magenta',
  })),
  coreLayer: genericCoreLayer,
  foundationConfig: genericFoundationConfig,
  textBracket: {
    title: 'Magenta Theme',
    sections: ['All magenta blocks'],
  },
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
MagentaBlocks.globals = { theme: 'g100' };

// Made with Bob
