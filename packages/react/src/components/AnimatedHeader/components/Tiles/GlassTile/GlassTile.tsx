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
import { GlassTileBody, GlassTileBodyProps } from './GlassTileBody';

export type GlassTileProps = {
  variant?: 'glass';
  tileId: string;
  href?: string | null;
  title?: string | null;
  subtitle?: string | null;
  disabledTaskLabel?: string | null;
  customContent?: React.ReactNode | null;
  primaryIcon?: ElementType | null;
  secondaryIcon?: ElementType | null;
  tagLabel?: string | null;
  tagType?: GlassTileBodyProps['tagType'];
  onClick?: ((event: React.MouseEvent<HTMLElement>) => void) | null;
  ariaLabel?: string;
  open?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
};

export const GlassTile: React.FC<GlassTileProps> = ({
  tileId,
  href,
  title,
  subtitle,
  disabledTaskLabel,
  customContent,
  primaryIcon: PrimaryIcon,
  secondaryIcon: SecondaryIcon,
  tagLabel,
  tagType,
  onClick: glassTileClickHandler,
  ariaLabel,
  open,
  isLoading,
  isDisabled,
}: GlassTileProps & GlassTileBodyProps) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--animated-header__glass-tile`;

  const body = (
    <GlassTileBody
      open={open}
      primaryIcon={PrimaryIcon}
      secondaryIcon={SecondaryIcon}
      title={title}
      subtitle={subtitle}
      customContent={customContent}
      tagLabel={tagLabel}
      tagType={tagType}
      isLoading={isLoading}
    />
  );

  // Non-interactive tile
  if (!href && !glassTileClickHandler) {
    return (
      <div
        className={`${prefix}--animated-header__tile ${blockClass}`}
        key={tileId}
        aria-label={ariaLabel ?? title ?? 'Glass Tile'}
        title={isDisabled ? disabledTaskLabel ?? '' : ''}
        tabIndex={-1}>
        {body}
      </div>
    );
  }

  return (
    <Link
      onClick={(event) => {
        glassTileClickHandler?.(event);
      }}
      className={`${prefix}--animated-header__tile ${blockClass}`}
      aria-label={ariaLabel ?? title ?? 'Glass Tile'}
      role="listitem"
      tabIndex={isDisabled || isLoading ? -1 : 0}
      key={tileId}
      href={href ?? undefined}
      disabled={isDisabled || isLoading}
      title={isDisabled ? disabledTaskLabel ?? '' : ''}>
      {body}
    </Link>
  );
};
