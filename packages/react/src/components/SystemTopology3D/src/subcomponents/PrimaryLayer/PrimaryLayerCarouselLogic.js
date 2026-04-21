/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable jsdoc/require-jsdoc, jsdoc/require-param, jsdoc/require-param-type, jsdoc/require-param-description */

import { useMemo, useState } from 'react';
import { BLOCK_HEIGHTS } from '../../constants';

const PRIMARY_LAYER_GAP_REM = 0.25;
const MAX_PRIMARY_LAYER_COLUMN_HEIGHT_REM = 14;

/**
 *
 * @param size
 */
function getPrimaryBlockHeightRem(size) {
  return BLOCK_HEIGHTS[size] ?? BLOCK_HEIGHTS.md;
}

/**
 * Calculate columns for blocks with a given max column height.
 * Uses first-fit bin-packing strategy.
 * @param blocks
 * @param maxColumnHeight
 */
function calculateColumnsWithHeight(blocks, maxColumnHeight) {
  const columns = [];
  const columnHeights = [];

  blocks.forEach((block) => {
    const blockHeight = getPrimaryBlockHeightRem(block.size);
    let targetColumnIndex = -1;

    // Find first column that can fit this block (first-fit strategy)
    for (let i = 0; i < columns.length; i++) {
      const currentHeight = columnHeights[i];
      const heightNeeded =
        columns[i].length === 0
          ? blockHeight
          : currentHeight + PRIMARY_LAYER_GAP_REM + blockHeight;

      if (heightNeeded <= maxColumnHeight) {
        targetColumnIndex = i;
        break; // Use first fit, not best fit
      }
    }

    // If no column fits, create new column
    if (targetColumnIndex === -1) {
      targetColumnIndex = columns.length;
      columns[targetColumnIndex] = [];
      columnHeights[targetColumnIndex] = 0;
    }

    // Add block to column
    columns[targetColumnIndex].push(block);

    // Update column height
    const heightToAdd =
      columns[targetColumnIndex].length === 1
        ? blockHeight
        : PRIMARY_LAYER_GAP_REM + blockHeight;
    columnHeights[targetColumnIndex] += heightToAdd;
  });

  return columns;
}

/**
 * Optimize column distribution for a single page by progressively reducing max height.
 * Tries to maximize columns (up to 8) while maintaining array order.
 * Based on CSS version algorithm from packages/ui/src/canvas/src/VisualizationCanvas.tsx
 * @param blocks
 * @param maxColumnsPerPage
 */
function optimizeColumnsForPage(blocks, maxColumnsPerPage = 8) {
  const MIN_COLUMN_HEIGHT = 1.5; // At least one small block
  const HEIGHT_REDUCTION_STEP = 0.5; // Reduce by 0.5rem increments

  const targetColumns = Math.min(blocks.length, maxColumnsPerPage);
  let maxColumnHeight = MAX_PRIMARY_LAYER_COLUMN_HEIGHT_REM;
  let columns = calculateColumnsWithHeight(blocks, maxColumnHeight);
  let columnCount = columns.length;

  // Keep reducing height until we achieve target columns or reach minimum height
  while (columnCount < targetColumns && maxColumnHeight > MIN_COLUMN_HEIGHT) {
    maxColumnHeight -= HEIGHT_REDUCTION_STEP;
    const testColumns = calculateColumnsWithHeight(blocks, maxColumnHeight);
    const testColumnCount = testColumns.length;

    // Only accept if we get more columns without exceeding target
    if (testColumnCount > columnCount && testColumnCount <= maxColumnsPerPage) {
      columns = testColumns;
      columnCount = testColumnCount;
    } else if (testColumnCount > maxColumnsPerPage) {
      // We've gone too far, stop here
      break;
    }
  }

  return columns;
}

/**
 *
 * @param columns
 */
function flattenColumns(columns) {
  const pageBlocks = [];

  columns.forEach((column, columnIndex) => {
    column.forEach((block) => {
      pageBlocks.push({
        ...block,
        columnIndex,
      });
    });
  });

  return pageBlocks;
}

/**
 * Apply bin-packing and pagination to blocks without columnIndex.
 * Returns array of pages, where each page is an array of blocks.
 * Based on CSS version algorithm from packages/ui/src/canvas/src/VisualizationCanvas.tsx
 * @param primaryLayer
 * @param maxColumnsPerPage
 * @param paginate
 */
function applyBinPackingAndPagination(
  primaryLayer,
  maxColumnsPerPage = 8,
  paginate = true,
) {
  if (!Array.isArray(primaryLayer) || primaryLayer.length === 0) {
    return [[]];
  }

  // Check if any block is missing columnIndex
  const needsBinPacking = primaryLayer.some(
    (block) => block.columnIndex === undefined || block.columnIndex === null,
  );

  if (!needsBinPacking) {
    return null; // Will use old pagination logic
  }

  // First pass: optimize all blocks together to get initial column distribution
  const allColumns = optimizeColumnsForPage(primaryLayer, maxColumnsPerPage);

  if (!paginate) {
    return [flattenColumns(allColumns)];
  }

  // Split columns into pages
  const pages = [];
  for (let i = 0; i < allColumns.length; i += maxColumnsPerPage) {
    const pageColumns = allColumns.slice(i, i + maxColumnsPerPage);

    // If this is not a full page, re-optimize just these blocks
    let finalPageColumns;
    if (pageColumns.length < maxColumnsPerPage && pageColumns.length > 0) {
      const pageBlocks = pageColumns.flat();
      finalPageColumns = optimizeColumnsForPage(pageBlocks, maxColumnsPerPage);
    } else {
      finalPageColumns = pageColumns;
    }

    pages.push(flattenColumns(finalPageColumns));
  }

  return pages.length > 0 ? pages : [[]];
}

/**
 *
 * @param primaryLayer
 */
function paginatePrimaryLayerByColumnHeight(primaryLayer) {
  if (!Array.isArray(primaryLayer) || primaryLayer.length === 0) {
    return [[]];
  }

  const blocksByColumn = primaryLayer.reduce((acc, block) => {
    const columnIndex = Math.max(0, Number(block.columnIndex ?? 0));
    if (!acc.has(columnIndex)) {
      acc.set(columnIndex, []);
    }
    acc.get(columnIndex).push(block);
    return acc;
  }, new Map());

  const sortedColumnIndices = [...blocksByColumn.keys()].sort((a, b) => a - b);
  const pagesByColumn = new Map();

  for (const columnIndex of sortedColumnIndices) {
    const columnBlocks = blocksByColumn.get(columnIndex) ?? [];
    const columnPages = [];
    const pageHeights = [];

    for (const block of columnBlocks) {
      const blockHeight = getPrimaryBlockHeightRem(block.size);
      let targetPageIndex = 0;

      while (targetPageIndex <= columnPages.length) {
        const currentHeight = pageHeights[targetPageIndex] ?? 0;
        const nextHeight =
          currentHeight === 0
            ? blockHeight
            : currentHeight + PRIMARY_LAYER_GAP_REM + blockHeight;

        if (
          nextHeight <= MAX_PRIMARY_LAYER_COLUMN_HEIGHT_REM ||
          currentHeight === 0
        ) {
          if (!columnPages[targetPageIndex]) {
            columnPages[targetPageIndex] = [];
          }
          columnPages[targetPageIndex].push(block);
          pageHeights[targetPageIndex] = nextHeight;
          break;
        }

        targetPageIndex += 1;
      }
    }

    pagesByColumn.set(columnIndex, columnPages);
  }

  const totalPages = Math.max(
    1,
    ...[...pagesByColumn.values()].map((columnPages) => columnPages.length),
  );

  return Array.from({ length: totalPages }, (_, pageIndex) =>
    sortedColumnIndices.flatMap(
      (columnIndex) => pagesByColumn.get(columnIndex)?.[pageIndex] ?? [],
    ),
  );
}

/**
 *
 * @param primaryLayer
 * @param enabled
 * @param maxColumnsPerPage
 */
export function usePrimaryLayerCarousel(
  primaryLayer,
  enabled = true,
  maxColumnsPerPage = 8,
) {
  const [pageIndex, setPageIndex] = useState(0);

  const paginatedPrimaryLayer = useMemo(() => {
    // Try bin-packing placement first for blocks without columnIndex.
    const binPackedPages = applyBinPackingAndPagination(
      primaryLayer,
      maxColumnsPerPage,
      enabled,
    );
    if (binPackedPages !== null) {
      return binPackedPages;
    }

    if (!enabled) {
      return [primaryLayer];
    }

    // Fall back to old pagination logic (for blocks with explicit columnIndex)
    return paginatePrimaryLayerByColumnHeight(primaryLayer);
  }, [enabled, maxColumnsPerPage, primaryLayer]);
  const pageCount = paginatedPrimaryLayer.length;
  const activePageIndex = Math.min(Math.max(0, pageIndex), pageCount - 1);
  const primaryLayerForRender = useMemo(
    () => paginatedPrimaryLayer[activePageIndex] ?? [],
    [activePageIndex, paginatedPrimaryLayer],
  );
  const hasPages = pageCount > 0;
  /**
   *
   * @param index
   */
  const wrapIndex = (index) => {
    if (!hasPages) {return 0;}
    return ((index % pageCount) + pageCount) % pageCount;
  };

  return {
    pages: paginatedPrimaryLayer,
    primaryLayerForRender,
    pageCount,
    activePageIndex,
    /**
     *
     */
    goToPreviousPage: () => setPageIndex((prev) => wrapIndex(prev - 1)),
    /**
     *
     */
    goToNextPage: () => setPageIndex((prev) => wrapIndex(prev + 1)),
    /**
     *
     * @param nextPageIndex
     */
    goToPage: (nextPageIndex) => setPageIndex(wrapIndex(nextPageIndex)),
  };
}
