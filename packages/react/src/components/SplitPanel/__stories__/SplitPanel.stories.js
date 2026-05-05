/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { action } from 'storybook/actions';
import mdx from './SplitPanel.mdx';
import { SplitPanel } from '../components/SplitPanel';
import '../components/split-panel.scss';

export default {
  title: 'Deprecated/Components/SplitPanel',
  component: SplitPanel,
  parameters: {
    docs: {
      page: mdx,
    },
  },
  argTypes: {
    // foo is the property we want to remove from the UI
    childrenBeforeSplit: {
      control: false,
    },
    childrenAfterSplit: {
      control: false,
    },
    onChange: {
      control: false,
    },
  },
};

const actionSplitValue = action('split value');
const actionSplitValueA = action('Panel A split value');
const actionSplitValueB = action('Panel B split value');

/**
 * Default story for SplitPanel
 *
 * @param {any} args - props from story controls
 */
export const Default = (args) => (
  <div>
    <SplitPanel
      style={{
        height: '400px',
        width: '600px',
        margin: '16px',
      }}
      onChange={(splitValue) => actionSplitValue(splitValue)}
      childrenBeforeSplit={
        <div>
          <h2>Children before split</h2>
          <ul>
            <li>One</li>
            <li>Two</li>
            <li>Three</li>
          </ul>
        </div>
      }
      childrenAfterSplit={
        <div>
          <h2>Children after split</h2>
          <ul>
            <li>Apple</li>
            <li>Banana</li>
            <li>Pear</li>
          </ul>
        </div>
      }
      {...args}
    />
  </div>
);

/**
 * Horizontal example story for SplitPanel
 *
 * @param {any} args - props from story controls
 */
export const Horizontal = (args) => (
  <SplitPanel
    orientation="horizontal"
    style={{
      height: '400px',
      width: '600px',
      margin: '16px',
    }}
    onChange={(splitValue) => actionSplitValue(splitValue)}
    childrenBeforeSplit={
      <div>
        <h2>Children before split</h2>
        <ul>
          <li>One</li>
          <li>Two</li>
          <li>Three</li>
        </ul>
      </div>
    }
    childrenAfterSplit={
      <div>
        <h2>Children after split</h2>
        <ul>
          <li>Apple</li>
          <li>Banana</li>
          <li>Pear</li>
        </ul>
      </div>
    }
    {...args}
  />
);

/**
 * Vertical story for SplitPanel
 *
 * @param {any} args - props from story controls
 */
export const Vertical = (args) => (
  <SplitPanel
    orientation="vertical"
    style={{
      height: '400px',
      width: '600px',
      margin: '16px',
    }}
    onChange={(splitValue) => actionSplitValue(splitValue)}
    childrenBeforeSplit={
      <div>
        <h2>Children before split</h2>
        <ul>
          <li>One</li>
          <li>Two</li>
          <li>Three</li>
        </ul>
      </div>
    }
    childrenAfterSplit={
      <div>
        <h2>Children after split</h2>
        <ul>
          <li>Apple</li>
          <li>Banana</li>
          <li>Pear</li>
        </ul>
      </div>
    }
    {...args}
  />
);

/**
 * Nested story for SplitPanel
 *
 * @param {any} args - props from story controls
 */
export const Nested = (args) => (
  <SplitPanel
    orientation="horizontal"
    style={{
      height: '400px',
      width: '600px',
      margin: '16px',
    }}
    onChange={(splitValue) => actionSplitValueA(splitValue)}
    splitMin={10}
    splitMax={90}
    defaultSplitValue={25}
    childrenBeforeSplit={
      <SplitPanel
        orientation="vertical"
        style={{
          height: '100%',
          width: '100%',
        }}
        onChange={(splitValue) => actionSplitValueB(splitValue)}
        splitMin={10}
        splitMax={90}
        defaultSplitValue={25}
        childrenBeforeSplit={
          <div>
            <h2>Children top left</h2>
            <ul>
              <li>One</li>
              <li>Two</li>
              <li>Three</li>
            </ul>
          </div>
        }
        childrenAfterSplit={
          <div>
            <h2>Children bottom left</h2>
            <ul>
              <li>Apple</li>
              <li>Banana</li>
              <li>Pear</li>
            </ul>
          </div>
        }
        {...args}
      />
    }
    childrenAfterSplit={
      <div>
        <h2>Children right</h2>
        <ul>
          <li>Apple</li>
          <li>Banana</li>
          <li>Pear</li>
        </ul>
      </div>
    }
    {...args}
  />
);

// Migration stories showing how to use Resizer instead
// Import Resizer for migration examples
import { Resizer } from '../../Resizer/components/Resizer';
import '../../Resizer/components/resizer.scss';

/**
 * Migration: Vertically split with Resizer
 *
 * This story demonstrates how to migrate from SplitPanel orientation="horizontal" (vertically stacked panels)
 * to Resizer. Uses Resizer's orientation="horizontal" (horizontal divider line).
 */
export const MigrationVerticallySplitWithResizer = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      blockSize: '400px',
      inlineSize: '600px',
      margin: '16px',
    }}>
    <div
      style={{
        blockSize: '50%',
        backgroundColor: 'var(--cds-layer)',
        padding: 'var(--cds-spacing-05)',
        overflow: 'auto',
        minBlockSize: '48px',
        transition: 'all 150ms linear',
      }}>
      <h2>Top Panel (using Resizer)</h2>
      <ul>
        <li>One</li>
        <li>Two</li>
        <li>Three</li>
      </ul>
      <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
        {`SplitPanel orientation="horizontal" → Resizer orientation="horizontal"`}
      </p>
    </div>
    <Resizer orientation="horizontal" />
    <div
      style={{
        flex: 1,
        backgroundColor: 'var(--cds-layer)',
        padding: 'var(--cds-spacing-05)',
        overflow: 'auto',
      }}>
      <h2>Bottom Panel (using Resizer)</h2>
      <ul>
        <li>Apple</li>
        <li>Banana</li>
        <li>Pear</li>
      </ul>
    </div>
  </div>
);

MigrationVerticallySplitWithResizer.parameters = {
  docs: {
    description: {
      story:
        '⚠️ **Migration Example**: Replaces SplitPanel with orientation="horizontal" (vertically stacked panels). Uses Resizer with orientation="horizontal".',
    },
  },
};

/**
 * Migration: Horizontally split with Resizer
 *
 * This story demonstrates how to migrate from SplitPanel orientation="vertical" (horizontally split, side-by-side panels)
 * to Resizer. Uses Resizer's orientation="vertical" (vertical divider line).
 */
export const MigrationHorizontallySplitWithResizer = () => (
  <div
    style={{
      display: 'flex',
      blockSize: '400px',
      inlineSize: '600px',
      margin: '16px',
    }}>
    <div
      style={{
        inlineSize: '50%',
        backgroundColor: 'var(--cds-layer)',
        padding: 'var(--cds-spacing-05)',
        overflow: 'auto',
        minInlineSize: '48px',
        transition: 'all 150ms linear',
      }}>
      <h2>Left Panel (using Resizer)</h2>
      <ul>
        <li>One</li>
        <li>Two</li>
        <li>Three</li>
      </ul>
      <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
        {`SplitPanel orientation="vertical" → Resizer orientation="vertical"`}
      </p>
    </div>
    <Resizer orientation="vertical" />
    <div
      style={{
        flex: 1,
        backgroundColor: 'var(--cds-layer)',
        padding: 'var(--cds-spacing-05)',
        overflow: 'auto',
      }}>
      <h2>Right Panel (using Resizer)</h2>
      <ul>
        <li>Apple</li>
        <li>Banana</li>
        <li>Pear</li>
      </ul>
    </div>
  </div>
);

MigrationHorizontallySplitWithResizer.parameters = {
  docs: {
    description: {
      story:
        '⚠️ **Migration Example**: Replaces SplitPanel with orientation="vertical" (horizontally split, side-by-side panels). Uses Resizer with orientation="vertical".',
    },
  },
};

/**
 * Migration: With Gap Control
 *
 * This story demonstrates how to migrate SplitPanel's gap prop to Resizer.
 * SplitPanel had gap="default" | "narrow" | "none", which can be replicated with CSS gap.
 */
export const MigrationWithGap = () => {
  const [gapSize, setGapSize] = React.useState('default');

  const gapMap = {
    default: 'var(--cds-spacing-05)', // 1rem
    narrow: 'var(--cds-spacing-03)', // 0.5rem
    none: '0',
  };

  return (
    <div>
      <div style={{ marginBlockEnd: '1rem' }}>
        <label>
          Gap size:{' '}
          <select value={gapSize} onChange={(e) => setGapSize(e.target.value)}>
            <option value="default">Default</option>
            <option value="narrow">Narrow</option>
            <option value="none">None</option>
          </select>
        </label>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          blockSize: '400px',
          inlineSize: '600px',
          gap: gapMap[gapSize],
        }}>
        <div
          style={{
            blockSize: '50%',
            backgroundColor: 'var(--cds-layer)',
            padding: 'var(--cds-spacing-05)',
            overflow: 'auto',
            minBlockSize: '48px',
            transition: 'all 150ms linear',
          }}>
          <h2>Top Panel</h2>
          <p>Gap is controlled via CSS gap property on the parent container.</p>
        </div>
        <Resizer orientation="horizontal" />
        <div
          style={{
            flex: 1,
            backgroundColor: 'var(--cds-layer)',
            padding: 'var(--cds-spacing-05)',
            overflow: 'auto',
          }}>
          <h2>Bottom Panel</h2>
          <p>Current gap: {gapSize}</p>
        </div>
      </div>
    </div>
  );
};

MigrationWithGap.parameters = {
  docs: {
    description: {
      story:
        "⚠️ **Migration Example**: SplitPanel's `gap` prop can be replaced with CSS `gap` property. Use Carbon spacing tokens: default=spacing-05, narrow=spacing-03, none=0.",
    },
  },
};

/**
 * Migration: With onChange and Percentage Values
 *
 * This story demonstrates how to migrate SplitPanel's onChange callback and percentage-based values.
 * SplitPanel reported split values as percentages (0-100), which requires custom logic with Resizer.
 */
export const MigrationWithOnChange = () => {
  const containerRef = React.useRef(null);
  const topPanelRef = React.useRef(null);
  const [splitPercent, setSplitPercent] = React.useState(50);
  const [resizeCount, setResizeCount] = React.useState(0);

  // Calculate and update percentage during resize
  const updatePercentage = React.useCallback(() => {
    const container = containerRef.current;
    const topPanel = topPanelRef.current;
    if (!container || !topPanel) {
      return;
    }

    const totalHeight = container.offsetHeight - 4; // subtract resizer height
    const currentHeight = topPanel.clientHeight;

    // Calculate percentage
    const percent = (currentHeight / totalHeight) * 100;
    setSplitPercent(Math.round(percent * 10) / 10); // round to 1 decimal
  }, []);

  const handleResizeEnd = React.useCallback(() => {
    updatePercentage();
    setResizeCount((c) => c + 1);
  }, [updatePercentage]);

  // Update percentage on mount and when container size changes
  React.useEffect(() => {
    updatePercentage();

    const resizeObserver = new ResizeObserver(() => {
      updatePercentage();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [updatePercentage]);

  return (
    <div>
      <div
        style={{
          marginBlockEnd: '1rem',
          padding: 'var(--cds-spacing-05)',
          backgroundColor: 'var(--cds-layer)',
        }}>
        <p>
          <strong>Split Position:</strong> {splitPercent}%
        </p>
        <p>
          <strong>Resize Events:</strong> {resizeCount}
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
          {`Note: With Resizer, you control how to calculate and report values.
          This example shows percentage calculation similar to SplitPanel's
          onChange using onResizeEnd and ResizeObserver.`}
        </p>
      </div>
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          blockSize: '400px',
          inlineSize: '600px',
        }}>
        <div
          ref={topPanelRef}
          style={{
            blockSize: '50%',
            backgroundColor: 'var(--cds-layer)',
            padding: 'var(--cds-spacing-05)',
            overflow: 'auto',
            minBlockSize: '48px',
          }}>
          <h2>Top Panel</h2>
          <p>Resize to see percentage updates above in real-time.</p>
        </div>
        <Resizer orientation="horizontal" onResizeEnd={handleResizeEnd} />
        <div
          style={{
            flex: 1,
            backgroundColor: 'var(--cds-layer)',
            padding: 'var(--cds-spacing-05)',
            overflow: 'auto',
          }}>
          <h2>Bottom Panel</h2>
          <p>
            The onResizeEnd callback tracks resize events, while ResizeObserver
            updates the percentage display in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};

MigrationWithOnChange.parameters = {
  docs: {
    description: {
      story:
        "⚠️ **Migration Example**: SplitPanel's `onChange` callback can be replicated using Resizer's `onResizeEnd`. You have full control over how to calculate and report values (pixels, percentages, etc.).",
    },
  },
};

/**
 * Migration: With Min/Max Constraints
 *
 * This story demonstrates how to migrate SplitPanel's splitMin/splitMax props.
 * With Resizer, you implement constraints by handling the resize manually.
 */
export const MigrationWithConstraints = () => {
  const containerRef = React.useRef(null);
  const topPanelRef = React.useRef(null);
  const bottomPanelRef = React.useRef(null);
  const [splitPercent, setSplitPercent] = React.useState(50);
  const minPercent = 20;
  const maxPercent = 80;

  // Store initial sizes when resize starts
  const initialSizes = React.useRef({ top: 0, bottom: 0, total: 0 });

  React.useEffect(() => {
    const container = containerRef.current;
    const topPanel = topPanelRef.current;
    if (!container || !topPanel) {
      return;
    }

    // Initialize sizes
    const totalHeight = container.offsetHeight - 4;
    initialSizes.current = {
      top: topPanel.clientHeight,
      bottom: totalHeight - topPanel.clientHeight,
      total: totalHeight,
    };
  }, []);

  /**
   * Handle resize with constraints
   */
  const handleResize = React.useCallback(
    (event, delta) => {
      const topPanel = topPanelRef.current;
      const bottomPanel = bottomPanelRef.current;
      if (!topPanel || !bottomPanel) {
        return;
      }

      const totalHeight = initialSizes.current.total;
      const minHeight = (totalHeight * minPercent) / 100;
      const maxHeight = (totalHeight * maxPercent) / 100;

      // Calculate new height with delta
      const newTopHeight = initialSizes.current.top + delta;

      // Apply constraints
      const constrainedHeight = Math.max(
        minHeight,
        Math.min(maxHeight, newTopHeight)
      );
      const newBottomHeight = totalHeight - constrainedHeight;

      // Apply the constrained sizes
      topPanel.style.height = `${constrainedHeight}px`;
      bottomPanel.style.height = `${newBottomHeight}px`;

      // Update percentage display
      const percent = (constrainedHeight / totalHeight) * 100;
      setSplitPercent(Math.round(percent * 10) / 10);
    },
    [minPercent, maxPercent]
  );

  /**
   * Update initial sizes when resize ends
   */
  const handleResizeEnd = React.useCallback(() => {
    const container = containerRef.current;
    const topPanel = topPanelRef.current;
    if (!container || !topPanel) {
      return;
    }

    const totalHeight = container.offsetHeight - 4;
    initialSizes.current = {
      top: topPanel.clientHeight,
      bottom: totalHeight - topPanel.clientHeight,
      total: totalHeight,
    };
  }, []);

  return (
    <div>
      <div
        style={{
          marginBlockEnd: '1rem',
          padding: 'var(--cds-spacing-05)',
          backgroundColor: 'var(--cds-layer)',
        }}>
        <p>
          <strong>Split Position:</strong> {splitPercent}%
        </p>
        <p>
          <strong>Constraints:</strong> {minPercent}% - {maxPercent}%
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
          Try resizing - the split is constrained between {minPercent}% and{' '}
          {maxPercent}%. When you provide onResize, you must handle the DOM
          manipulation yourself.
        </p>
      </div>
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          blockSize: '400px',
          inlineSize: '600px',
        }}>
        <div
          ref={topPanelRef}
          style={{
            blockSize: '50%',
            backgroundColor: 'var(--cds-layer)',
            padding: 'var(--cds-spacing-05)',
            overflow: 'auto',
            minBlockSize: '48px',
          }}>
          <h2>Top Panel (Constrained)</h2>
          <p>
            This panel can only resize between {minPercent}% and {maxPercent}%
            of total height.
          </p>
        </div>
        <Resizer
          orientation="horizontal"
          onResize={handleResize}
          onResizeEnd={handleResizeEnd}
        />
        <div
          ref={bottomPanelRef}
          style={{
            flex: 1,
            backgroundColor: 'var(--cds-layer)',
            padding: 'var(--cds-spacing-05)',
            overflow: 'auto',
          }}>
          <h2>Bottom Panel</h2>
          <p>
            Constraints are implemented by manually applying sizes in the
            onResize handler.
          </p>
        </div>
      </div>
    </div>
  );
};

MigrationWithConstraints.parameters = {
  docs: {
    description: {
      story:
        "⚠️ **Migration Example**: SplitPanel's `splitMin` and `splitMax` props can be replicated by implementing constraints in your `onResize` handler. This gives you more flexibility in how constraints are applied.",
    },
  },
};

/**
 * Migration: With Default Split Value
 *
 * This story demonstrates how to migrate SplitPanel's defaultSplitValue prop.
 * With Resizer, you set initial sizes using CSS.
 */
export const MigrationWithDefaultValue = () => {
  const [initialSplit, setInitialSplit] = React.useState(30);

  return (
    <div>
      <div style={{ marginBlockEnd: '1rem' }}>
        <label>
          Initial split position:{' '}
          <input
            type="range"
            min="10"
            max="90"
            value={initialSplit}
            onChange={(e) => setInitialSplit(Number(e.target.value))}
          />{' '}
          {initialSplit}%
        </label>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--cds-text-secondary)',
            marginBlockStart: '0.5rem',
          }}>
          Change the value and refresh to see different initial split positions.
        </p>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          blockSize: '400px',
          inlineSize: '600px',
        }}>
        <div
          style={{
            blockSize: `${initialSplit}%`,
            backgroundColor: 'var(--cds-layer)',
            padding: 'var(--cds-spacing-05)',
            overflow: 'auto',
            minBlockSize: '48px',
            transition: 'all 150ms linear',
          }}>
          <h2>Top Panel</h2>
          <p>Initial height set to {initialSplit}% via CSS.</p>
        </div>
        <Resizer orientation="horizontal" />
        <div
          style={{
            flex: 1,
            backgroundColor: 'var(--cds-layer)',
            padding: 'var(--cds-spacing-05)',
            overflow: 'auto',
          }}>
          <h2>Bottom Panel</h2>
          <p>Takes remaining space with flex: 1.</p>
        </div>
      </div>
    </div>
  );
};

MigrationWithDefaultValue.parameters = {
  docs: {
    description: {
      story:
        "⚠️ **Migration Example**: SplitPanel's `defaultSplitValue` prop can be replaced by setting initial panel sizes with CSS (percentage, pixels, or flex values). This example uses percentage-based height.",
    },
  },
};
