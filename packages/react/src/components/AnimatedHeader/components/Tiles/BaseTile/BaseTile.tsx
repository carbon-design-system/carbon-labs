/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { ReactNode } from 'react';
import { AIPromptTile } from '../AIPromptTile/AIPromptTile';
import { GlassTile } from '../GlassTile/GlassTile';

/** Base Tile */

interface BaseTileProps {
  id?: string;
  open?: boolean;
  href?: string | null;
  mainIcon?: string | null;
  secondaryIcon?: string | null;
  title?: string | null;
  subtitle?: string | null;
  productName?: string;
  customContent?: ReactNode;
  isLoading?: boolean;
  isDisabled?: boolean;
  disabledTaskLabel?: string;
  onClick?: () => void;
}

export const BaseTile: React.FC<BaseTileProps> = (props: BaseTileProps) => {
  if (props.id === 'ai-tile') {
    return <AIPromptTile {...props}></AIPromptTile>;
  }

  return <GlassTile {...props}></GlassTile>;
};
