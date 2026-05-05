/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import PlaneStack3D from '../index';
import { BLOCK_SIZES, FOUNDATION_RACK_STATES } from '../index';
import {
  mockPrimaryLayerNoColumnIndex,
  mockPrimaryLayerMinimal,
  mockPrimaryLayerMixedSizes,
} from '../src/data/mockAccountDataNoColumnIndex';
import '../src/styles/canvas.scss';

const meta = {
  title: 'Components/PlaneStack3D/Data Layouts',
  component: PlaneStack3D,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
These stories showcase different ways to organize and display data within the PlaneStack3D, demonstrating various block arrangements, overflow handling, and auto-placement behaviors.

## Layout Strategies

### Auto-Placement
When blocks don't have a \`columnIndex\` property, the component automatically distributes them across available columns in a balanced way. This is ideal for:
- Dynamic data where column assignment isn't predetermined
- Equal distribution across columns
- Simplified data models

### Manual Placement
Specify \`columnIndex\` for each block to control exact positioning. Useful for:
- Maintaining specific relationships between blocks
- Creating intentional visual groupings
- Preserving data hierarchy

### Overflow & Carousel
When blocks exceed the visible height, the carousel automatically activates (if \`enablePrimaryLayerCarousel={true}\`):
- Pagination controls appear at the bottom
- Users can navigate between pages
- Each page maintains the same column structure
- Keyboard navigation supported (arrow keys)

## Block Sizes

Blocks come in three sizes that affect vertical space:
- **Small** (\`BLOCK_SIZES.sm\`): Compact, fits more per column
- **Medium** (\`BLOCK_SIZES.md\`): Standard size for most use cases
- **Large** (\`BLOCK_SIZES.lg\`): Prominent, takes more vertical space

Mix sizes strategically to create visual hierarchy and optimize space usage.

## Key Stories

- **Random Top Blocks**: Demonstrates auto-placement with random distribution
- **Overflow Carousel**: Shows pagination when content exceeds viewport height
- **Size Variations**: Explores small, medium, and large block layouts
- **No Column Index**: Pure auto-placement without manual positioning
- **Mixed Sizes**: Combines different block sizes for visual variety
- **Minimal Blocks**: Sparse layout with few blocks
- **Carousel Disabled**: Shows behavior when pagination is turned off

## Best Practices

1. **Use auto-placement** for dynamic data where relationships aren't critical
2. **Mix block sizes** to create visual interest and hierarchy
3. **Enable carousel** for datasets that may overflow
4. **Test with varying data volumes** to ensure layouts scale appropriately
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

// Helper function to create blocks with random positions
const createRandomTopBlocks = (count, columnCount) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `random-${i}`,
    label: 'Block',
    hoverLabel: `Block ${i + 1}`,
    columnIndex: Math.floor(Math.random() * columnCount),
    size: [BLOCK_SIZES.sm, BLOCK_SIZES.md, BLOCK_SIZES.lg][
      Math.floor(Math.random() * 3)
    ],
  }));
};

// Helper function to create overflow blocks for carousel
const createOverflowBlocks = (columnCount) => {
  const blocks = [];
  let blockId = 0;

  // Add mix of small, medium, and large blocks to each column to ensure overflow
  // Pattern: lg, sm, md, sm, lg, md, sm to distribute sizes across pages
  for (let col = 0; col < columnCount; col++) {
    const pattern = [
      BLOCK_SIZES.lg,
      BLOCK_SIZES.sm,
      BLOCK_SIZES.md,
      BLOCK_SIZES.sm,
      BLOCK_SIZES.lg,
      BLOCK_SIZES.md,
      BLOCK_SIZES.sm,
    ];

    pattern.forEach((size) => {
      blocks.push({
        id: `overflow-${blockId++}`,
        label: 'Block',
        hoverLabel: `Block ${blockId}`,
        columnIndex: col,
        size: size,
      });
    });
  }

  return blocks;
};

// Helper function to create blocks of specific size
const createBlocksBySize = (size, count, columnCount) => {
  const sizeLabel = size.charAt(0).toUpperCase() + size.slice(1);
  return Array.from({ length: count }, (_, i) => ({
    id: `${size}-block-${i}`,
    label: sizeLabel,
    hoverLabel: `${sizeLabel} Block ${i + 1}`,
    columnIndex: i % columnCount,
    size: BLOCK_SIZES[size],
  }));
};

// Reusable story template
const Template = (args) => {
  const [focusedId, setFocusedId] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <PlaneStack3D
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
// Data Layout Stories
// ============================================================================

export const RandomTopBlocks = Template.bind({});
RandomTopBlocks.args = {
  primaryLayer: createRandomTopBlocks(20, 8),
  coreLayer: genericCoreLayer,
  foundationConfig: genericFoundationConfig,
  textBracket: {
    title: 'Random Distribution',
    sections: ['Blocks randomly placed in columns'],
  },
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
RandomTopBlocks.globals = { theme: 'g100' };

export const OverflowCarousel = Template.bind({});
OverflowCarousel.args = {
  primaryLayer: createOverflowBlocks(8),
  coreLayer: genericCoreLayer,
  foundationConfig: genericFoundationConfig,
  textBracket: {
    title: 'Carousel View',
    sections: ['Multiple pages of blocks', 'Use arrows to navigate'],
  },
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
OverflowCarousel.globals = { theme: 'g100' };

// Consolidated block size story with control
const BlockSizeTemplate = (args) => {
  const [focusedId, setFocusedId] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Generate blocks based on size
  const blockCount =
    args.blockSize === 'sm' ? 32 : args.blockSize === 'md' ? 16 : 12;
  const primaryLayer = createBlocksBySize(args.blockSize, blockCount, 8);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <PlaneStack3D
        primaryLayer={primaryLayer}
        coreLayer={args.coreLayer}
        foundationConfig={args.foundationConfig}
        textBracket={{
          title: `${args.blockSize.toUpperCase()} Blocks`,
          sections: [`All blocks are ${args.blockSize} size`],
        }}
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

export const BlockSizeVariants = BlockSizeTemplate.bind({});
BlockSizeVariants.args = {
  blockSize: 'md',
  coreLayer: genericCoreLayer,
  foundationConfig: genericFoundationConfig,
  lockColumnCount: false,
  primaryColumnCount: 8,
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
BlockSizeVariants.argTypes = {
  blockSize: {
    control: {
      type: 'select',
      labels: {
        sm: 'Small',
        md: 'Medium',
        lg: 'Large',
      },
    },
    options: ['sm', 'md', 'lg'],
    description: 'Size of all blocks in the primary layer',
  },
};
BlockSizeVariants.globals = { theme: 'g100' };

export const NoColumnIndex = Template.bind({});
NoColumnIndex.args = {
  primaryLayer: mockPrimaryLayerNoColumnIndex,
  coreLayer: genericCoreLayer,
  foundationConfig: genericFoundationConfig,
  textBracket: {
    title: 'Auto-Placement',
    sections: ['Blocks without columnIndex', 'Automatically distributed'],
  },
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
NoColumnIndex.globals = { theme: 'g100' };

export const MixedSizesAutoPlacement = Template.bind({});
MixedSizesAutoPlacement.args = {
  primaryLayer: mockPrimaryLayerMixedSizes,
  coreLayer: genericCoreLayer,
  foundationConfig: genericFoundationConfig,
  textBracket: {
    title: 'Mixed Sizes',
    sections: ['Auto-placed blocks', 'Various sizes'],
  },
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
MixedSizesAutoPlacement.globals = { theme: 'g100' };

export const MinimalBlocks = Template.bind({});
MinimalBlocks.args = {
  primaryLayer: mockPrimaryLayerMinimal,
  coreLayer: genericCoreLayer,
  foundationConfig: genericFoundationConfig,
  textBracket: {
    title: 'Minimal Setup',
    sections: ['Just 3 blocks'],
  },
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
MinimalBlocks.globals = { theme: 'g100' };

export const CarouselDisabled = Template.bind({});
CarouselDisabled.args = {
  primaryLayer: createOverflowBlocks(8),
  coreLayer: genericCoreLayer,
  foundationConfig: genericFoundationConfig,
  textBracket: {
    title: 'Carousel Disabled',
    sections: ['All blocks visible', 'No pagination'],
  },
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: false,
};
CarouselDisabled.globals = { theme: 'g100' };

export const LongBlockNames = Template.bind({});
LongBlockNames.args = {
  primaryLayer: Array.from({ length: 16 }, (_, i) => ({
    id: `long-name-${i}`,
    label: 'Very Long Block Name That Will Overflow',
    hoverLabel: `Block ${
      i + 1
    }: Very Long Block Name That Will Overflow and Show Ellipsis`,
    columnIndex: i % 8,
    size: [BLOCK_SIZES.sm, BLOCK_SIZES.md, BLOCK_SIZES.lg][i % 3],
  })),
  coreLayer: genericCoreLayer,
  foundationConfig: genericFoundationConfig,
  textBracket: {
    title: 'Long Block Names',
    sections: ['Text overflow with ellipsis', 'Demonstrates label truncation'],
  },
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
LongBlockNames.globals = { theme: 'g100' };
