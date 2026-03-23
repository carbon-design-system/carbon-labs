/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { ElementType, ReactNode } from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import {
  AILabel,
  SkeletonPlaceholder,
  Tag,
  type TagProps,
} from '@carbon/react';

type TagTypeName = TagProps<'div'>['type'];

export type AITileLabelVariant = 'aiLabel' | 'tag';

export type AITileBodyProps = {
  open?: boolean;
  title?: string | null;
  subtitle?: string | null;
  customContent?: ReactNode;
  primaryIcon?: ElementType | null;
  secondaryIcon?: ElementType | null;
  aiLabelVariant?: AITileLabelVariant;
  aiLabelText?: string;
  aiLabelTagType?: TagTypeName;
  isLoading?: boolean;
};

export const AITileBody = ({
  open,
  title,
  subtitle,
  customContent,
  primaryIcon: PrimaryIcon,
  secondaryIcon: SecondaryIcon,
  aiLabelVariant = 'aiLabel',
  aiLabelText = 'AI',
  aiLabelTagType = 'gray',
  isLoading,
}: AITileBodyProps) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--animated-header__ai-tile`;

  if (isLoading) {
    return (
      <SkeletonPlaceholder className={`${blockClass}--loading-skeleton`} />
    );
  }

  return (
    <div className={`${blockClass}--body`} data-expanded={open}>
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
            {aiLabelVariant === 'tag' ? (
              <Tag
                size="sm"
                type={aiLabelTagType}
                className={`${blockClass}--tag`}
                decorator={<AILabel aiText="AI" size="xs" kind="inline" />}>
                {aiLabelText}
              </Tag>
            ) : (
              <AILabel autoAlign aiText={aiLabelText} size="xs" />
            )}
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
