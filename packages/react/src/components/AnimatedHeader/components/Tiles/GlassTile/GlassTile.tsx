/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Link } from '@carbon/react';
import { usePrefix } from '@carbon-labs/utilities/es/index.js';
import { GlassTileBody, GlassTileBodyProps } from './GlassTileBody';

/** Primary UI component for user interaction */

interface GlassTileProps {
  href?: string | null;
  id?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  disabledTaskLabel?: string;
  onClick?: (() => void) | null;
}

export const GlassTile: React.FC<GlassTileProps> = ({
  href,
  id,
  mainIcon,
  open,
  secondaryIcon,
  subtitle,
  title,
  customContent,
  isLoading,
  isDisabled,
  disabledTaskLabel,
  onClick: glassTileClickHandler,
}: GlassTileProps & GlassTileBodyProps) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--animated-header__glass-tile`;

  const body = (
    <GlassTileBody
      mainIcon={mainIcon}
      open={open}
      secondaryIcon={secondaryIcon}
      title={title}
      subtitle={subtitle}
      customContent={customContent}
      isLoading={isLoading}
    />
  );

  // Non-interactive tile
  if (!href && !glassTileClickHandler) {
    return (
      <div
        className={`${prefix}--animated-header__tile ${blockClass}`}
        key={id}>
        {body}
      </div>
    );
  }

  return (
    <Link
      onClick={() => {
        glassTileClickHandler?.();
      }}
      className={`${prefix}--animated-header__tile ${blockClass}`}
      key={id}
      href={href ?? undefined}
      disabled={isDisabled || isLoading}
      title={isDisabled ? disabledTaskLabel ?? '' : ''}>
      {body}
    </Link>
  );
};
