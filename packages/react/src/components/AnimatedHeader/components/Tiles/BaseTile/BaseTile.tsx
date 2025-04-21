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
  href?: string;
  mainIcon?: string;
  secondaryIcon?: string;
  title?: string;
  subtitle?: string;
  productName?: string;
  customContent?: ReactNode;
}

export const BaseTile: React.FC<BaseTileProps> = ({
  id,
  open,
  href,
  mainIcon,
  secondaryIcon,
  title,
  subtitle,
  productName,
  customContent,
}: BaseTileProps) => {
  const props = {
    id,
    open,
    href,
    mainIcon,
    secondaryIcon,
    title,
    subtitle,
    productName,
    customContent,
  };
  const tile =
    id === 'ai-tile' ? (
      <AIPromptTile {...props}></AIPromptTile>
    ) : (
      <GlassTile {...props}></GlassTile>
    );

  return tile;
};
