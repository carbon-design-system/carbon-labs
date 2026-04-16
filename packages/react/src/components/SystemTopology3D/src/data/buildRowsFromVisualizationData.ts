import {
  type CanvasRows,
  type CoreLayerConfig,
  type FoundationConfig,
  type PrimaryLayerBlock,
  createCoreBlock,
  createFoundationRackBlock,
  FOUNDATION_RACK_STATES,
  FOUNDATION_RACK_STATUS,
} from '../types/visualization-config';
import { getBlockColorTheme, isColorToken } from '../types/color-tokens';

interface BuildRowsInput {
  primaryLayer?: PrimaryLayerBlock[];
  coreLayer?: CoreLayerConfig[];
  foundationConfig?: FoundationConfig;
}

export function buildRowsFromVisualizationData(
  input: BuildRowsInput = {}
): CanvasRows {
  const primaryLayer = Array.isArray(input.primaryLayer)
    ? input.primaryLayer
    : [];
  const coreLayer = Array.isArray(input.coreLayer) ? input.coreLayer : [];
  const foundationConfig = input.foundationConfig;

  // Calculate max columnIndex, treating undefined/null as 0
  const maxColumnIndex = primaryLayer.reduce(
    (max, block) => Math.max(max, Number(block.columnIndex ?? 0)),
    -1
  );
  const primaryColumnCount = Math.max(0, maxColumnIndex + 1);
  const primaryColumns: any[][] = Array.from(
    { length: primaryColumnCount },
    () => []
  );

  // Distribute blocks into columns based on columnIndex (defaults to 0 if undefined)
  for (const block of primaryLayer) {
    const colIndex = Math.max(0, Number(block.columnIndex ?? 0));
    if (!primaryColumns[colIndex]) primaryColumns[colIndex] = [];

    // Default to blue color theme if no color is specified
    const colorTheme =
      block.color && isColorToken(block.color)
        ? getBlockColorTheme(block.color)
        : getBlockColorTheme('blue');

    primaryColumns[colIndex].push({
      id: block.id,
      text: block.label,
      hoverText: block.hoverLabel,
      size: block.size,
      isLoadingScaffold: block.isLoadingScaffold,
      ...colorTheme,
      ...(block.textColor && { textColor: block.textColor }),
    });
  }

  const rows: CanvasRows = [];

  if (primaryColumns.length > 0) {
    rows.push(primaryColumns);
  }

  for (const core of coreLayer) {
    rows.push([
      [
        createCoreBlock({
          id: core.id,
          text: core.label,
          hoverText: core.hoverLabel,
          size: core.size,
          ...(core.color && { color: core.color }),
          ...(core.textColor && { textColor: core.textColor }),
        }),
      ],
    ]);
  }

  if (foundationConfig?.racks?.length) {
    rows.push(
      foundationConfig.racks.map((rack) => [
        createFoundationRackBlock(rack.variant || FOUNDATION_RACK_STATES.open, {
          id: rack.id,
          status:
            rack.status &&
            Object.values(FOUNDATION_RACK_STATUS).includes(rack.status)
              ? rack.status
              : FOUNDATION_RACK_STATUS.green,
          drawerCount: Math.min(4, Math.max(0, Number(rack.slots ?? 4))),
        }),
      ])
    );
  }

  return rows;
}

export default buildRowsFromVisualizationData;
