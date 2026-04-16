import { isFramedRow, isLongBlockRow } from "./utils";

function getBlockId(block, rowIndex, colIndex, itemIndex, layer) {
  if (block?.id) return block.id;
  if (layer === "core") return `row-${rowIndex}-long`;
  if (layer === "foundation") return `row-${rowIndex}-rack-${colIndex}`;
  return `row-${rowIndex}-col-${colIndex}-box-${itemIndex}`;
}

function getFallbackLabel({ layer, rowIndex, colIndex, itemIndex }) {
  if (layer === "core") return `Core row ${rowIndex + 1}`;
  if (layer === "foundation") return `Rack ${colIndex + 1}`;
  return `Row ${rowIndex + 1} Column ${colIndex + 1} Item ${itemIndex + 1}`;
}

export function buildA11yItems(rows) {
  const allItems = [];
  const primaryItems = [];
  const coreItems = [];
  const foundationItems = [];

  rows.forEach((row, rowIndex) => {
    if (isLongBlockRow(row)) {
      const block = row[0][0];
      const id = getBlockId(block, rowIndex, 0, 0, "core");
      const label =
        block?.text ||
        getFallbackLabel({ layer: "core", rowIndex, colIndex: 0, itemIndex: 0 });
      const item = { id, label, layer: "core" };
      coreItems.push(item);
      allItems.push(item);
      return;
    }

    if (isFramedRow(row)) {
      row.forEach((column, colIndex) => {
        const block = column[0];
        const id = getBlockId(block, rowIndex, colIndex, 0, "foundation");
        const label =
          block?.text ||
          getFallbackLabel({
            layer: "foundation",
            rowIndex,
            colIndex,
            itemIndex: 0,
          });
        const item = { id, label, layer: "foundation" };
        foundationItems.push(item);
        allItems.push(item);
      });
      return;
    }

    row.forEach((columnBlocks, colIndex) => {
      const topDown = [...columnBlocks].reverse();
      topDown.forEach((block, topIndex) => {
        if (block?.isLoadingScaffold) return;

        const sourceIndex = columnBlocks.length - 1 - topIndex;
        const id = getBlockId(block, rowIndex, colIndex, sourceIndex, "primary");
        const label =
          block?.text ||
          getFallbackLabel({
            layer: "primary",
            rowIndex,
            colIndex,
            itemIndex: sourceIndex,
          });
        const item = {
          id,
          label,
          layer: "primary",
          columnIndex: colIndex,
          rowIndex: topIndex,
        };
        primaryItems.push(item);
        allItems.push(item);
      });
    });
  });

  return { allItems, primaryItems, coreItems, foundationItems };
}

export default buildA11yItems;
