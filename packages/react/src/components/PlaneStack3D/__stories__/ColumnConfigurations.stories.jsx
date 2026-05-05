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
import '../src/styles/canvas.scss';

const meta = {
  title: 'Components/PlaneStack3D/Column Configurations',
  component: PlaneStack3D,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
These stories demonstrate different fixed column layouts for the PlaneStack3D. Use \`lockColumnCount={true}\` with a specific \`primaryColumnCount\` to create fixed-width layouts that don't respond to container size changes.

## When to Use Fixed Columns

- **Consistent Layout**: When you need a predictable, unchanging column structure
- **Design Requirements**: When your design specifies an exact number of columns
- **Data Alignment**: When blocks need to align with specific columns for comparison
- **Print/Export**: When generating static visualizations for reports or presentations

## Available Configurations

- **2 Columns**: Minimal layout for simple comparisons or mobile-first designs
- **4 Columns**: Balanced layout suitable for medium-complexity data
- **6 Columns**: Dense layout for detailed visualizations
- **8 Columns**: Maximum density for comprehensive data displays

## Key Props

- \`lockColumnCount={true}\`: Disables responsive behavior
- \`primaryColumnCount={2|4|6|8}\`: Sets the fixed number of columns
- Blocks automatically distribute across the specified columns based on their \`columnIndex\` property

## Responsive Alternative

For layouts that adapt to screen size, see the "Responsive Columns" story in the main PlaneStack3D section, which uses \`lockColumnCount={false}\` to automatically switch between 2, 4, 6, and 8 columns based on Carbon Design System breakpoints.
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

// Helper function to create blocks of specific size
const createBlocksBySize = (size, count, columnCount) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${size}-block-${i}`,
    label: 'Block',
    hoverLabel: `${size.toUpperCase()} Block ${i + 1}`,
    columnIndex: i % columnCount,
    size: BLOCK_SIZES[size],
  }));
};

// ============================================================================
// Column Count Stories (Locked)
// ============================================================================

// Consolidated column configuration story with control
const LockedColumnsTemplate = (args) => {
  const [focusedId, setFocusedId] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Generate blocks based on column count
  const blockCount =
    args.primaryColumnCount *
    (args.primaryColumnCount === 2
      ? 4
      : args.primaryColumnCount === 4
      ? 4
      : args.primaryColumnCount === 6
      ? 4
      : 4);
  const primaryLayer = createBlocksBySize(
    'md',
    blockCount,
    args.primaryColumnCount
  );

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <PlaneStack3D
        primaryLayer={primaryLayer}
        coreLayer={args.coreLayer}
        foundationConfig={args.foundationConfig}
        textBracket={{
          title: `${args.primaryColumnCount} Columns`,
          sections: ['Locked column count'],
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

export const LockedColumns = LockedColumnsTemplate.bind({});
LockedColumns.args = {
  primaryColumnCount: 4,
  coreLayer: genericCoreLayer,
  foundationConfig: genericFoundationConfig,
  lockColumnCount: true,
  skeletonLoader: false,
  theme: 'dark',
  enablePrimaryLayerCarousel: true,
};
LockedColumns.argTypes = {
  primaryColumnCount: {
    control: {
      type: 'select',
      labels: {
        2: '2 Columns',
        4: '4 Columns',
        6: '6 Columns',
        8: '8 Columns',
      },
    },
    options: [2, 4, 6, 8],
    description: 'Number of columns to display',
  },
};
LockedColumns.globals = { theme: 'g100' };
