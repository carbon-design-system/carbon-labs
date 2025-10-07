/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { AITile, type AITileProps } from '../AITile/AITile';
import {
  AIPromptTile,
  type AIPromptTileProps,
} from '../AIPromptTile/AIPromptTile';
import { GlassTile, type GlassTileProps } from '../GlassTile/GlassTile';

/** Base Tile router */
export type TileVariant = 'glass' | 'aiPrompt' | 'ai';

export type BaseTileProps =
  | ({ variant?: 'glass' } & GlassTileProps)
  | ({ variant: 'aiPrompt' } & AIPromptTileProps)
  | (({ variant: 'ai' } & AITileProps) & {
      id?: string;
      tileId: string;
    });

function inferVariant(props: BaseTileProps): TileVariant {
  if (props.variant) {
    return props.variant;
  }
  if (props.tileId === 'ai-tile') {
    return 'aiPrompt';
  }
  return 'glass';
}

export const BaseTile: React.FC<BaseTileProps> = (props) => {
  // Back-compat: alias legacy icon prop to the new name
  const normalizedProps = {
    ...props,
    primaryIcon: (props as any).primaryIcon ?? (props as any).mainIcon, // ← fallback
  };

  // strip legacy id, but flow it into tileId if needed
  const { id: legacyId, ...rest } = normalizedProps as BaseTileProps & {
    id?: string;
  };
  const forward = {
    ...rest,
    tileId: (rest as any).tileId ?? legacyId,
  };

  switch (inferVariant(props)) {
    case 'ai':
      return <AITile {...(forward as AITileProps)} />;
    case 'aiPrompt':
      return <AIPromptTile {...(forward as AIPromptTileProps)} />;
    case 'glass':
    default:
      return <GlassTile {...(forward as GlassTileProps)} />;
  }
};
