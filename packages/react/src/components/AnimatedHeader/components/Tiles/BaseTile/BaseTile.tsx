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
import { SkeletonPlaceholder } from '@carbon/react';

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
  isLoading,
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

  if (isLoading) {
    return <SkeletonPlaceholder />;
  }

  if (id === 'ai-tile') {
    return <AIPromptTile {...props}></AIPromptTile>;
  }

  return <GlassTile {...props}></GlassTile>;
};
