import { BLOCK_GAP, BLOCK_HEIGHTS } from "../constants";
import { BLOCK_SIZES } from "../types";

export function isLongBlockRow(rowData) {
  const block = rowData?.[0]?.[0];
  return (
    rowData.length === 1 && rowData[0].length === 1 && block?.fullWidth === true
  );
}

export function isFramedRow(rowData) {
  return (
    Array.isArray(rowData) &&
    rowData.length > 0 &&
    rowData.every(
      (column) =>
        Array.isArray(column) &&
        column.length === 1 &&
        column[0].size === BLOCK_SIZES.framed,
    )
  );
}

export function getBlockHeight(size, blockHeights = BLOCK_HEIGHTS) {
  return blockHeights[size] ?? blockHeights.md;
}

export function getColumnHeight(
  columnBlocks,
  blockHeights = BLOCK_HEIGHTS,
  blockGap = BLOCK_GAP,
) {
  if (columnBlocks.length === 0) return 0;
  const total = columnBlocks.reduce(
    (sum, block) => sum + getBlockHeight(block.size, blockHeights) + blockGap,
    0,
  );
  return Math.max(0, total - blockGap);
}

export function getRowHeight(
  rowData,
  blockHeights = BLOCK_HEIGHTS,
  blockGap = BLOCK_GAP,
) {
  if (isLongBlockRow(rowData)) {
    return getBlockHeight(rowData[0][0].size, blockHeights);
  }
  if (isFramedRow(rowData)) {
    return getBlockHeight(rowData[0][0].size, blockHeights);
  }
  if (rowData.length === 0) return 0;
  return Math.max(
    ...rowData.map((col) => getColumnHeight(col, blockHeights, blockGap)),
  );
}

export function getMaxColumns(rows) {
  if (!rows || rows.length === 0) return 1;
  const max = Math.max(
    ...rows.map((row) =>
      isLongBlockRow(row) || isFramedRow(row) ? 0 : row.length,
    ),
  );
  return Math.max(1, max);
}
