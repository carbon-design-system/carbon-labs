import React, { memo, useMemo } from 'react';
import PrimaryLayer from '../subcomponents/PrimaryLayer';
import { BLOCK_DIMENSIONS, BLOCK_GAP } from '../constants';
import { BLOCK_SIZES } from '../types';

// Renders a vertical stack of blocks within one column.
function StackedColumn({
  blocks,
  gap = BLOCK_GAP,
  xPosition = 0,
  zPosition = 0,
  columnIndex = 0,
  rowIndex = 0,
  rowStartIndex = 0,
  columnStartIndex = 0,
  focusedId,
  primaryEnterBaseMs = 0,
  primaryColumnStepMs = 160,
  primaryItemStepMs = 80,
  skeletonLoader = false,
  loadingCycleKey = 0,
  loadingPhase = 'in',
  skipEnterAnimation = false,
  onBlockClick,
}) {
  const cubesForRender = useMemo(() => {
    // Reverse the blocks array to flip the order in the column
    const reversedBlocks = [...blocks].reverse();

    // If loading, generate dummy blocks instead of using real data
    // Randomize blocks on each cycle using loadingCycleKey as seed
    const blocksToProcess = skeletonLoader
      ? (() => {
          // Seeded random helper - matches RowLayout logic
          const seededRandom = (seed) => {
            const x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
          };

          // Simple seeded random using loadingCycleKey and columnIndex
          const baseSeed = loadingCycleKey * 1000 + columnIndex;

          // Random block count (1-3)
          const blocksInColumn = Math.floor(seededRandom(baseSeed) * 3) + 1;
          const sizes = [BLOCK_SIZES.sm, BLOCK_SIZES.md, BLOCK_SIZES.lg];

          return Array.from({ length: blocksInColumn }, (_, i) => {
            // Use different seed for each block's size
            const blockSeed = baseSeed + i * 100;
            const sizeIndex = Math.floor(
              seededRandom(blockSeed) * sizes.length
            );

            return {
              size: sizes[sizeIndex],
              id: `loading-${loadingCycleKey}-${columnIndex}-${i}`,
            };
          });
        })()
      : reversedBlocks;

    const totalBlocksInColumn = blocksToProcess.length;
    const cubePositions = blocksToProcess.reduce(
      (acc, block, index) => {
        const blockDimensions =
          BLOCK_DIMENSIONS[block.size] || BLOCK_DIMENSIONS.md;
        // Place each block on top of the previous one with a fixed gap.
        const yPosition = acc.yCursor + blockDimensions.height / 2;
        // Use block's unique ID if available, otherwise generate one
        const id =
          block.id || `row-${rowIndex}-col-${columnIndex}-box-${index}`;
        const enterIndex = rowStartIndex + columnStartIndex + index;
        const enterDelayMs =
          primaryEnterBaseMs +
          columnIndex * primaryColumnStepMs +
          index * primaryItemStepMs;

        // For exit animation, reverse the item delay within the column
        // Keep column delay the same, but reverse item order (top leaves first)
        const exitDelayMs =
          primaryEnterBaseMs +
          columnIndex * primaryColumnStepMs +
          (totalBlocksInColumn - 1 - index) * primaryItemStepMs;

        return {
          yCursor: acc.yCursor + blockDimensions.height + gap,
          items: [
            ...acc.items,
            {
              ...block,
              id,
              dimensions: blockDimensions,
              yPosition,
              position: [0, yPosition, 0],
              enterIndex,
              enterDelayMs,
              exitDelayMs,
            },
          ],
        };
      },
      { yCursor: 0, items: [] }
    ).items;

    // Render from top to bottom so higher blocks are processed last.
    return cubePositions.reverse();
  }, [
    blocks,
    columnIndex,
    columnStartIndex,
    gap,
    primaryColumnStepMs,
    primaryEnterBaseMs,
    primaryItemStepMs,
    rowIndex,
    rowStartIndex,
    skeletonLoader,
    loadingCycleKey,
  ]);

  return (
    <group position={[xPosition, 0, zPosition]}>
      {cubesForRender.map((cube) => (
        <PrimaryLayer
          key={cube.id}
          position={cube.position}
          dimensions={cube.dimensions}
          color={cube.color}
          leftColor={cube.leftColor}
          topColor={cube.topColor}
          text={cube.text}
          hoverText={cube.hoverText}
          textColor={cube.textColor}
          enterIndex={cube.enterIndex}
          enterDelayMs={cube.enterDelayMs}
          exitDelayMs={cube.exitDelayMs}
          isFocused={focusedId === cube.id}
          skeletonLoader={skeletonLoader}
          loadingCycleKey={loadingCycleKey}
          loadingPhase={loadingPhase}
          skipEnterAnimation={skipEnterAnimation}
          onBlockClick={onBlockClick}
          blockId={cube.id}
        />
      ))}
    </group>
  );
}

function areStackedColumnPropsEqual(prev, next) {
  if (prev.blocks !== next.blocks) return false;
  if (prev.gap !== next.gap) return false;
  if (prev.xPosition !== next.xPosition) return false;
  if (prev.zPosition !== next.zPosition) return false;
  if (prev.columnIndex !== next.columnIndex) return false;
  if (prev.rowIndex !== next.rowIndex) return false;
  if (prev.rowStartIndex !== next.rowStartIndex) return false;
  if (prev.columnStartIndex !== next.columnStartIndex) return false;
  if (prev.primaryEnterBaseMs !== next.primaryEnterBaseMs) return false;
  if (prev.primaryColumnStepMs !== next.primaryColumnStepMs) return false;
  if (prev.primaryItemStepMs !== next.primaryItemStepMs) return false;
  if (prev.skeletonLoader !== next.skeletonLoader) return false;
  if (prev.loadingCycleKey !== next.loadingCycleKey) return false;
  if (prev.loadingPhase !== next.loadingPhase) return false;
  if (prev.skipEnterAnimation !== next.skipEnterAnimation) return false;
  if (prev.focusedId === next.focusedId) return true;

  // Check if any block in this column matches the focused ID
  const hasMatchingBlock = (focusedId) => {
    if (!focusedId) return false;
    return next.blocks.some((block) => block.id === focusedId);
  };

  const prevRelevant = hasMatchingBlock(prev.focusedId);
  const nextRelevant = hasMatchingBlock(next.focusedId);
  return !prevRelevant && !nextRelevant;
}

export default memo(StackedColumn, areStackedColumnPropsEqual);
