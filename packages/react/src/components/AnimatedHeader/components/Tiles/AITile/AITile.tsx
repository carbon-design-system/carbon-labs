/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { ElementType } from 'react';
import { Link } from '@carbon/react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import {
  AITileBody,
  AITileBodyProps,
  AITileLabelVariant,
} from '../AITile/AITileBody';
import { AutotrackDataAttributes } from '../../types';
import { extractAutotrackAttributes } from '../../utils';

export type AITileProps = {
  variant: 'ai';
  tileId: string;
  href?: string | null;
  title?: string | null;
  subtitle?: string | null;
  disabledTaskLabel?: string | null;
  customContent?: React.ReactNode | null;
  primaryIcon?: ElementType | null;
  secondaryIcon?: ElementType | null;
  aiLabelVariant?: AITileLabelVariant;
  aiLabelText?: string;
  aiLabelTagType?: AITileBodyProps['aiLabelTagType'];
  onClick?: ((event: React.MouseEvent<HTMLElement>) => void) | null;
  ariaLabel?: string;
  open?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
} & AutotrackDataAttributes;

export const AITile: React.FC<AITileProps> = ({
  tileId,
  href,
  title,
  subtitle,
  disabledTaskLabel,
  customContent,
  primaryIcon: PrimaryIcon,
  secondaryIcon: SecondaryIcon,
  aiLabelVariant,
  aiLabelText,
  aiLabelTagType,
  onClick: aiTileClickHandler,
  ariaLabel,
  open,
  isLoading,
  isDisabled,
  ...rest
}: AITileProps & AITileBodyProps) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--animated-header__ai-tile`;

  const body = (
    <AITileBody
      open={open}
      primaryIcon={PrimaryIcon}
      secondaryIcon={SecondaryIcon}
      title={title}
      subtitle={subtitle}
      customContent={customContent}
      aiLabelVariant={aiLabelVariant}
      aiLabelText={aiLabelText}
      aiLabelTagType={aiLabelTagType}
      isLoading={isLoading}
    />
  );

  // Extract data attributes from rest props
  const dataAttributes = extractAutotrackAttributes(rest);

  // Non-interactive tile
  if (!href && !aiTileClickHandler) {
    return (
      <div
        className={`${prefix}--animated-header__tile ${blockClass}`}
        key={tileId}
        aria-label={ariaLabel ?? title ?? 'AI Tile'}
        title={isDisabled ? disabledTaskLabel ?? '' : ''}
        tabIndex={-1}
        {...dataAttributes}>
        {body}
      </div>
    );
  }

  return (
    <Link
      onClick={(event) => {
        aiTileClickHandler?.(event);
      }}
      className={`${prefix}--animated-header__tile ${blockClass}`}
      aria-label={ariaLabel ?? title ?? 'AI Tile'}
      role="listitem"
      tabIndex={isDisabled || isLoading ? -1 : 0}
      key={tileId}
      href={href ?? undefined}
      disabled={isDisabled || isLoading}
      title={isDisabled ? disabledTaskLabel ?? '' : ''}
      {...dataAttributes}>
      {body}
    </Link>
  );
};

export default AITile;
