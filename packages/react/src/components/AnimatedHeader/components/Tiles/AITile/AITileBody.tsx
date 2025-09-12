/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { ElementType, ReactNode } from 'react';
import { usePrefix } from '@carbon-labs/utilities/es/index.js';
import { AILabel, SkeletonPlaceholder } from '@carbon/react';

export type AITileBodyProps = {
  open?: boolean;
  title?: string | null;
  subtitle?: string | null;
  customContent?: ReactNode;
  primaryIcon?: ElementType | null;
  secondaryIcon?: ElementType | null;
  isLoading?: boolean;
};

export const AITileBody = ({
  open,
  title,
  subtitle,
  customContent,
  primaryIcon: PrimaryIcon,
  secondaryIcon: SecondaryIcon,
  isLoading,
}: AITileBodyProps) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--animated-header__ai-tile`;
  const collapsed = `${blockClass}--collapsed`;

  if (isLoading) {
    return (
      <SkeletonPlaceholder className={`${blockClass}--loading-skeleton`} />
    );
  }

  return (
    <div className={`${blockClass}--body${!open ? ` ${collapsed}` : ''}`}>
      <div className={`${blockClass}--body-background`} />
      <div className={`${blockClass}--body-gradient`} />
      {customContent ? (
        <div className={`${blockClass}--custom-content`}>{customContent}</div>
      ) : (
        <>
          <div className={`${blockClass}--icons`}>
            {PrimaryIcon && (
              <PrimaryIcon fill={`var(--cds-icon-secondary)`} size={24} />
            )}
            <AILabel autoAlign aiText="AI" size="xs" />
          </div>
          <div className={`${blockClass}--title`}>{title}</div>
          <div className={`${blockClass}--footer`}>
            {subtitle && (
              <div className={`${blockClass}--subtitle`}>{subtitle}</div>
            )}
            {SecondaryIcon && (
              <SecondaryIcon size={16} fill={`var(--cds-icon-secondary)`} />
            )}
          </div>
        </>
      )}
    </div>
  );
};
