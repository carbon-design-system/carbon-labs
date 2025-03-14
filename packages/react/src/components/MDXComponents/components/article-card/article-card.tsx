/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Theme } from '@carbon/react';
import {
  ArrowRight,
  Download,
  Email,
  Error,
  Launch,
} from '@carbon/react/icons';
import { clsx } from 'clsx';
import PropTypes from 'prop-types';
import React, { ReactNode } from 'react';

import { MdxComponent } from '../interfaces';
import { withPrefix } from '../utils';

type Color = 'light' | 'dark';
type ActionIcon = 'launch' | 'arrowRight' | 'download' | 'email' | 'disabled';

interface ArticleCardProps {
  children?: ReactNode;
  href?: string | null;
  title?: string | null;
  subTitle?: string | null;
  author?: string | null;
  date?: string | null;
  readTime?: string | null;
  color?: Color;
  disabled?: boolean | null;
  actionIcon?: ActionIcon | null;
  className?: string | null;
}

/**
 * The `<ArticleCard>` component should generally be used inside of
 * `<Grid narrow>` and`<Column>` components.
 *
 * ```
 * <Grid narrow>
 * <Column lg={4}>
 * <ArticleCard props>
 *
 * ![](img.png)
 *
 * </ArticleCard>
 * </Column>
 * </Grid>
 * ```
 */
export const ArticleCard: MdxComponent<ArticleCardProps> = (props) => {
  const {
    children,
    href,
    title,
    subTitle,
    author,
    date,
    readTime,
    color,
    disabled,
    actionIcon,
    className,
    ...rest
  } = props;

  const ArticleCardClassNames = clsx(className, withPrefix('article-card'), {
    [withPrefix('disabled')]: disabled,
  });

  const aspectRatioClassNames = clsx(
    'cds--aspect-ratio',
    'cds--aspect-ratio--2x1'
  );

  const cardContentClassNames = clsx('cds--tile', 'cds--tile--clickable');

  const cardContent = (
    <>
      <div className={withPrefix('img')}>{children}</div>
      <div className={aspectRatioClassNames}>
        <div className={clsx('cds--aspect-ratio--object', withPrefix('tile'))}>
          {subTitle && <h5 className={withPrefix('subtitle')}>{subTitle}</h5>}
          {title && <h4 className={withPrefix('title')}>{title}</h4>}
          <div className={withPrefix('info')}>
            {author && <p>{author}</p>}
            {date && <p>{date}</p>}
            {readTime && <p>{readTime}</p>}
          </div>
          <div className={withPrefix('icon-action')}>
            {actionIcon === 'launch' && !disabled && (
              <Launch size={20} aria-label="Open" />
            )}
            {actionIcon === 'arrowRight' && !disabled && (
              <ArrowRight size={20} aria-label="Open" />
            )}
            {actionIcon === 'download' && !disabled && (
              <Download size={20} aria-label="Download" />
            )}
            {actionIcon === 'email' && !disabled && (
              <Email size={20} aria-label="Email" />
            )}
            {actionIcon === 'disabled' ||
              (disabled === true && <Error size={20} aria-label="disabled" />)}
          </div>
        </div>
      </div>
    </>
  );

  let cardContainer;
  if (disabled === true) {
    cardContainer = <div className={cardContentClassNames}>{cardContent}</div>;
  } else {
    cardContainer = (
      <a href={href!} className={cardContentClassNames} {...rest}>
        {cardContent}
      </a>
    );
  }

  return (
    <Theme theme={color === 'dark' ? 'g100' : undefined}>
      <div className={ArticleCardClassNames}>{cardContainer}</div>
    </Theme>
  );
};

ArticleCard.defaultProps = {
  color: 'light',
  disabled: false,
};

ArticleCard.propTypes = {
  /**
   * Action icon
   */
  actionIcon: PropTypes.oneOf<ActionIcon>([
    'launch',
    'arrowRight',
    'download',
    'email',
    'disabled',
  ]),
  /**
   * Author
   */
  author: PropTypes.string,

  /**
   * Provide an image to display above card
   */
  children: PropTypes.element,

  /**
   * Specify a custom class
   */
  className: PropTypes.string,

  /**
   * set to "dark" for dark background card
   */
  color: PropTypes.oneOf<Color>(['light', 'dark']).isRequired,

  /**
   * date
   */
  date: PropTypes.string,

  /**
   * Use for disabled card
   */
  disabled: PropTypes.bool,

  /**
   * Set url for card
   */
  href: PropTypes.string,

  /**
   * Reat time of article
   */
  readTime: PropTypes.string,

  /**
   * sub title
   */
  subTitle: PropTypes.string,

  /**
   * Title
   */
  title: PropTypes.string,
};
