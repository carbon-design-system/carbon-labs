import React, { useMemo } from 'react';
import RowLayout from './RowLayout';
import {
  BLOCK_DEPTH,
  COLUMN_GAP,
  COLUMN_SPACING,
  LOAD_TIMINGS_MS,
  ROW_GAP,
} from '../constants';
import { LayoutTextBracket } from '../subcomponents/shared/TextBracket';
import {
  getMaxColumns,
  getRowHeight,
  isFramedRow,
  isLongBlockRow,
} from './utils';

/**
 * Determines if a row contains primary layer blocks
 */
function isPrimaryLayerRow(rowData) {
  if (!rowData || rowData.length === 0) return false;
  // Primary layer rows are not long blocks (core) and not framed (foundation)
  return !isLongBlockRow(rowData) && !isFramedRow(rowData);
}

// Lays out all rows with vertical stacking and spacing.
function MultiRowStack({
  rows,
  rowGap = ROW_GAP,
  textBracket,
  focusedId,
  focusedGroupLayer = null,
  primaryColumnCount,
  skeletonLoader = false,
  skipPrimaryEnterAnimation = false,
  onBlockClick,
}) {
  // Use primaryColumnCount if provided, otherwise calculate from rows
  const maxColumns = useMemo(
    () => primaryColumnCount || getMaxColumns(rows),
    [primaryColumnCount, rows]
  );

  // Dynamic vertical padding based on which layers are present:
  // - Primary layer: 4 units (needs more space for visual hierarchy)
  // - Core layer only: 0.5 units (minimal spacing)
  // - Foundation layer only: 0.5 units (minimal spacing)
  const VERTICAL_PADDING = useMemo(() => {
    const hasPrimaryLayer = rows.some((rowData) => isPrimaryLayerRow(rowData));
    const hasCoreLayer = rows.some((rowData) => isLongBlockRow(rowData));
    const hasFoundationLayer = rows.some((rowData) => isFramedRow(rowData));

    if (hasPrimaryLayer) {
      return 4;
    } else if (hasCoreLayer || hasFoundationLayer) {
      return 0.5;
    }
    return 0.5;
  }, [rows]);
  const rowAnimationMeta = useMemo(() => {
    // First pass: count total core layers
    const totalCoreLayers = rows.filter((rowData) =>
      isLongBlockRow(rowData)
    ).length;

    let foundationOrdinal = 0;
    let coreIndex = 0;
    let primaryOrdinal = 0;

    return rows.map((rowData) => {
      if (isFramedRow(rowData)) {
        return { rowType: 'foundation', rowTypeOrdinal: foundationOrdinal++ };
      }
      if (isLongBlockRow(rowData)) {
        // Reverse the ordinal: last core layer gets ordinal 0, first gets highest
        const rowTypeOrdinal = totalCoreLayers - 1 - coreIndex;
        coreIndex++;
        return { rowType: 'core', rowTypeOrdinal };
      }
      return { rowType: 'primary', rowTypeOrdinal: primaryOrdinal++ };
    });
  }, [rows]);
  const rowStartIndices = useMemo(() => {
    if (!rows || rows.length === 0) return [];
    const counts = rows.map((rowData) => {
      if (isLongBlockRow(rowData)) return 1;
      return rowData.reduce((sum, column) => sum + column.length, 0);
    });
    const startIndices = new Array(rows.length).fill(0);
    let running = 0;
    for (let i = rows.length - 1; i >= 0; i -= 1) {
      startIndices[i] = running;
      running += counts[i];
    }
    return startIndices;
  }, [rows]);
  const rowsForRender = useMemo(() => {
    const reversedRows = rows
      .map((rowData, index) => ({ rowData, sourceIndex: index }))
      .reverse();

    const rowPositions = [];
    for (const row of reversedRows) {
      // Stack from the bottom up so row 0 ends up at the top visually.
      // Start with negative padding to push content down
      const previousY =
        rowPositions.length > 0
          ? rowPositions[rowPositions.length - 1].nextY
          : -VERTICAL_PADDING;
      const rowHeight = getRowHeight(row.rowData);
      rowPositions.push({
        rowData: row.rowData,
        sourceIndex: row.sourceIndex,
        yPos: previousY,
        rowHeight,
        nextY: previousY + rowHeight + rowGap,
      });
    }

    // Flip back to original order for rendering keys and focus ids.
    return rowPositions.reverse();
  }, [rows, rowGap]);
  const bracketTitle = textBracket?.title || '';
  const bracketSections = textBracket?.sections || [];
  const shouldRenderTextBracket = !!bracketTitle || bracketSections.length > 0;
  const bottomRow = rowsForRender[rowsForRender.length - 1] ?? null;
  const bottomRowSourceIndex = bottomRow?.sourceIndex ?? -1;
  const bottomRowData = bottomRow?.rowData ?? null;
  const bottomRowMeta =
    bottomRowSourceIndex >= 0 ? rowAnimationMeta[bottomRowSourceIndex] : null;
  const bracketWidth = maxColumns * COLUMN_SPACING - COLUMN_GAP;
  const bracketCenterX = ((maxColumns - 1) * COLUMN_SPACING) / 2;
  const bracketY = (bottomRow?.yPos ?? 0) - 0.44;
  const bracketZ = BLOCK_DEPTH / 2 + 0.05;
  const bracketEnterDelayMs = useMemo(() => {
    if (!bottomRowData || !bottomRowMeta) return 0;

    if (isFramedRow(bottomRowData)) {
      const columnsPerRack = 2;
      const numRacksToRender = Math.floor(maxColumns / columnsPerRack);
      return (
        LOAD_TIMINGS_MS.foundationBase +
        bottomRowMeta.rowTypeOrdinal * LOAD_TIMINGS_MS.foundationRowStep +
        numRacksToRender * LOAD_TIMINGS_MS.foundationItemStep
      );
    }

    if (isLongBlockRow(bottomRowData)) {
      return (
        LOAD_TIMINGS_MS.coreBase +
        bottomRowMeta.rowTypeOrdinal * LOAD_TIMINGS_MS.coreRowStep +
        320
      );
    }

    return (
      LOAD_TIMINGS_MS.primaryBase +
      bottomRowMeta.rowTypeOrdinal * LOAD_TIMINGS_MS.primaryRowGroupStep +
      320
    );
  }, [bottomRowData, bottomRowMeta, maxColumns]);

  return (
    <group>
      {rowsForRender.map((row) => (
        <RowLayout
          key={row.sourceIndex}
          rowData={row.rowData}
          yPosition={row.yPos}
          totalColumns={maxColumns}
          rowIndex={row.sourceIndex}
          rowStartIndex={rowStartIndices[row.sourceIndex] ?? 0}
          focusedId={focusedId}
          focusedGroupLayer={focusedGroupLayer}
          rowTypeOrdinal={
            rowAnimationMeta[row.sourceIndex]?.rowTypeOrdinal ?? 0
          }
          skeletonLoader={skeletonLoader}
          skipPrimaryEnterAnimation={skipPrimaryEnterAnimation}
          onBlockClick={onBlockClick}
        />
      ))}
      {shouldRenderTextBracket && bottomRow ? (
        <LayoutTextBracket
          position={[bracketCenterX, bracketY, bracketZ]}
          width={bracketWidth}
          title={bracketTitle}
          sections={bracketSections}
          enterDelayMs={bracketEnterDelayMs}
        />
      ) : null}
    </group>
  );
}

export default MultiRowStack;
