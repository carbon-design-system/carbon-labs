/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { ReactNode } from 'react';
import { Link } from '@carbon/react';
import * as carbonIcons from '@carbon/icons-react';
import { usePrefix } from '@carbon-labs/utilities/es/index.js';

/** Primary UI component for user interaction */

interface GlassTileProps {
  href?: string;
  id?: string;
  mainIcon?: string;
  open?: boolean;
  secondaryIcon?: string;
  subtitle?: string;
  title?: string;
  customContent?: ReactNode;
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
}: GlassTileProps) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--animated-header__glass-tile`;
  const collapsed = `${blockClass}--collapsed`;

  const MainIcon = mainIcon ? carbonIcons[mainIcon] : null;
  const SecondaryIcon = secondaryIcon ? carbonIcons[secondaryIcon] : null;

  return (
    <Link
      className={`${prefix}--animated-header__tile ${blockClass}`}
      key={id}
      href={href}>
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
    </Link>
  );
};
