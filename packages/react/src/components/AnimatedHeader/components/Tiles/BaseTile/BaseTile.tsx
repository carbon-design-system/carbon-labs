/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { AIPromptTile, GlassTile } from '../index';

/** Base Tile */

interface BaseTileProps {
  id?: string;
  open?: boolean;
  href?: string;
  mainIcon?: string;
  secondaryIcon?: string;
  title?: string;
  productName?: string;
  subtitle?: string;
}

export const BaseTile: React.FC<BaseTileProps> = ({
  id,
  open,
  href,
  mainIcon,
  secondaryIcon,
  title,
  productName,
  subtitle,
}: BaseTileProps) => {
  const props = {
    id,
    open,
    href,
    mainIcon,
    secondaryIcon,
    title,
    productName,
    subtitle,
  };
  const tile =
    id === 'ai-tile' ? (
      <AIPromptTile {...props}></AIPromptTile>
    ) : (
      <GlassTile {...props}></GlassTile>
    );

  return tile;
};
