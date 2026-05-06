/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Column, Theme } from '@carbon/react';
import {
  ArrowRight,
  Download,
  Email,
  Error,
  Launch,
} from '@carbon/react/icons/index.js';
import { clsx } from 'clsx';
import PropTypes from 'prop-types';
import React, { ReactNode } from 'react';

import { MdxComponent } from '../interfaces';
import { withPrefix } from '../utils';

type Color = 'light' | 'dark';
type ActionIcon = 'launch' | 'arrowRight' | 'download' | 'email' | 'disabled';

interface SquareCardProps {
  children?: ReactNode | null;
  href?: string | null;
  title?: string | null;
  smallTitle?: boolean | null;
  actionIcon?: ActionIcon | null;
  disabled?: boolean | null;
  bodyText?: string | null;
  helperText?: string | null;
  color?: Color | null;
  className?: string | null;
  [otherProp: string]: unknown;
}

export const SquareCard: MdxComponent<SquareCardProps> = ({
  children,
  href,
  title,
  smallTitle,
  disabled,
  bodyText,
  helperText,
  className,
  actionIcon,
  color,
  ...rest
}) => {
  // Determine if this is an internal link (starts with /)
  const isInternalLink = href?.charAt(0) === '/';

  const squareCardClassNames = clsx(className, withPrefix('square-card'), {
    [withPrefix('disabled')]: disabled,
    [withPrefix('dark-mode')]: color === 'dark',
  });

  const titleClassNames = clsx(withPrefix('square-card-title'), {
    [withPrefix('square-card-title-small')]: smallTitle,
  });

  const carbonTileClassNames = clsx('cds--tile', 'cds--tile--clickable');

  const aspectRatioClassNames = clsx(
    'cds--aspect-ratio',
    'cds--aspect-ratio--1x1'
  );

  const cardContent = (
    <>
      {title && <h2 className={titleClassNames}>{title}</h2>}
      {bodyText && <p className={withPrefix('square-card-body')}>{bodyText}</p>}
      {helperText && (
        <p className={withPrefix('square-card-helper-text')}>{helperText}</p>
      )}
      {children && (
        <div className={withPrefix('square-card-helper-icon')}>{children}</div>
      )}
      <div className={withPrefix('square-card-action-icon')}>
        {!disabled &&
          actionIcon &&
          {
            launch: <Launch size={20} aria-label="Open resource" />,
            arrowRight: <ArrowRight size={20} aria-label="Open resource" />,
            download: <Download size={20} aria-label="Download" />,
            email: <Email size={20} aria-label="Email" />,
            disabled: <Error size={20} aria-label="disabled" />,
          }[actionIcon]}
        {disabled === true && <Error size={20} aria-label="disabled" />}
      </div>
    </>
  );

  let cardContainer;
  if (disabled === true || href === undefined) {
    cardContainer = <div className={carbonTileClassNames}>{cardContent}</div>;
  } else if (isInternalLink) {
    cardContainer = (
      <a href={href} className={carbonTileClassNames} {...rest}>
        {cardContent}
      </a>
    );
  } else {
    cardContainer = (
      <a href={href ?? undefined} className={carbonTileClassNames} {...rest}>
        {cardContent}
      </a>
    );
  }

  return (
    <Theme theme={color === 'dark' ? 'g100' : 'g10'}>
      <Column sm={4} md={4} lg={4} className={squareCardClassNames}>
        <div className={aspectRatioClassNames}>
          <div className="cds--aspect-ratio--object">{cardContainer}</div>
        </div>
      </Column>
    </Theme>
  );
};

SquareCard.propTypes = {
  /**
   * Action icon, default is arrowRight
   */
  actionIcon: PropTypes.oneOf<ActionIcon>([
    'launch',
    'arrowRight',
    'download',
    'email',
    'disabled',
  ]),
  /**
   * Body text
   */
  bodyText: PropTypes.string,
  /**
   * Use to set a pictogram or icon
   */
  children: PropTypes.node as unknown as React.Validator<React.ReactNode>,
  /**
   * Specify a custom class
   */
  className: PropTypes.string,
  /**
   * set to "dark" for dark background card
   */
  color: PropTypes.oneOf<Color>(['light', 'dark']),
  /**
   * Use for disabled card
   */
  disabled: PropTypes.bool,
  /**
   * Helper text
   */
  helperText: PropTypes.string,
  /**
   * Set url for card
   */
  href: PropTypes.string,
  /**
   * Use to enable the smaller heading
   */
  smallTitle: PropTypes.bool,
  /**
   * Large heading
   */
  title: PropTypes.string,
};

SquareCard.defaultProps = {
  color: 'light',
  disabled: false,
  smallTitle: false,
  actionIcon: 'arrowRight',
};
