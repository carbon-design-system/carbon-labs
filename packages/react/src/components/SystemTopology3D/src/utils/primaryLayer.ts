import type { PrimaryLayerBlock } from "../types/visualization-config";

export function hasMissingColumnIndex(
  primaryLayer: PrimaryLayerBlock[] | undefined,
) {
  return (
    Array.isArray(primaryLayer) &&
    primaryLayer.some(
      (block) => block.columnIndex === undefined || block.columnIndex === null,
    )
  );
}
