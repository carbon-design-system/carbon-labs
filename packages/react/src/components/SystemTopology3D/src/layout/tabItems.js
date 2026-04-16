import { isLongBlockRow } from "./utils";

export function buildTabItems(rows) {
  const items = [];
  rows.forEach((row, rowIndex) => {
    if (isLongBlockRow(row)) {
      // Long rows map to a single focusable item.
      const block = row[0][0];
      const blockId = block.id || `row-${rowIndex}-long`;
      items.push({
        id: blockId,
        label: block.text || `Row ${rowIndex + 1}`,
      });
      return;
    }
    row.forEach((columnBlocks, colIndex) => {
      // Reverse column so the top-most block is first in tab order.
      const reversed = [...columnBlocks].reverse();
      reversed.forEach((block, reverseIndex) => {
        const sourceIndex = columnBlocks.length - 1 - reverseIndex;
        // Use the block's actual ID if available, otherwise fall back to generated pattern
        const blockId =
          block.id || `row-${rowIndex}-col-${colIndex}-box-${sourceIndex}`;
        items.push({
          id: blockId,
          label: block.text || `Row ${rowIndex + 1} Column ${colIndex + 1}`,
        });
      });
    });
  });
  return items;
}
