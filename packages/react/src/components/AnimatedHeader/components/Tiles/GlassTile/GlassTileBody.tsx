import React, { ElementType, ReactNode } from 'react';
import { usePrefix } from '@carbon-labs/utilities/es/index.js';
import { SkeletonPlaceholder } from '@carbon/react';

export type GlassTileBodyProps = {
  mainIcon?: ElementType | null;
  open?: boolean;
  secondaryIcon?: ElementType | null;
  subtitle?: string | null;
  title?: string | null;
  customContent?: ReactNode;
  isLoading?: boolean;
};

export const GlassTileBody = ({
  mainIcon: MainIcon,
  open,
  secondaryIcon: SecondaryIcon,
  subtitle,
  title,
  customContent,
  isLoading,
}: GlassTileBodyProps) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--animated-header__glass-tile`;
  const collapsed = `${blockClass}--collapsed`;

  if (isLoading) {
    return (
      <SkeletonPlaceholder className={`${blockClass}--loading-skeleton`} />
    );
  }

  return (
    <div className={`${blockClass}--body${!open ? ` ${collapsed}` : ''}`}>
      <div className={`${blockClass}--body-background`} />
      {customContent ? (
        <div className={`${blockClass}--custom-content`}>{customContent}</div>
      ) : (
        <>
          <div className={`${blockClass}--icons`}>
            {MainIcon && (
              <MainIcon fill={`var(--cds-icon-secondary)`} size={24} />
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
