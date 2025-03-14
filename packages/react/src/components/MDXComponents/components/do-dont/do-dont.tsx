/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Column, Theme } from '@carbon/react';
import { CheckmarkFilled, Misuse } from '@carbon/react/icons';
import { clsx } from 'clsx';
import PropTypes from 'prop-types';
import React, { ReactNode } from 'react';

import { MdxComponent } from '../interfaces';
import { withPrefix } from '../utils';

interface DoDontProps {
  children: ReactNode;
  caption?: string | null;
  captionTitle?: string | null;
  text?: string | null;
  aspectRatio?: string | null;
  color?: string | null;
  type: 'do' | 'dont';
  className?: string | null;
  colLg?: number | null;
  colMd?: number | null;
}

/**
 * The `<DoDont>` component includes built in columns and is used within
 * the `<DoDontRow>` component. You can provide an image or video as children,
 * or text using the `text` prop.
 */
export const DoDont: MdxComponent<DoDontProps> = ({
  children,
  caption,
  captionTitle,
  text,
  aspectRatio,
  color,
  type,
  className,
  colLg,
  colMd,
}) => {
  const iconClassNames = clsx(withPrefix('icon'), {
    [withPrefix('icon-correct')]: type === 'do',
    [withPrefix('icon-incorrect')]: type === 'dont',
  });

  const aspectRatios = ['1:1', '2:1', '1:2', '4:3', '3:4', '9:16', '16:9'];

  const wrapperClassNames = clsx(className, withPrefix('example'), {
    [withPrefix('correct')]: type === 'do',
    [withPrefix('incorrect')]: type === 'dont',
    [withPrefix('ratio')]: aspectRatio && aspectRatios.includes(aspectRatio),
    [withPrefix('ratio1x1')]: aspectRatio === '1:1',
    [withPrefix('ratio2x1')]: aspectRatio === '2:1',
    [withPrefix('ratio1x2')]: aspectRatio === '1:2',
    [withPrefix('ratio4x3')]: aspectRatio === '4:3',
    [withPrefix('ratio3x4')]: aspectRatio === '3:4',
    [withPrefix('ratio9x16')]: aspectRatio === '9:16',
    [withPrefix('ratio16x9')]: aspectRatio === '16:9',
  });

  let colLarge = 4;
  if (colLg) colLarge = Number(colLg);

  let colMedium = 4;
  if (colMd) colMedium = Number(colMd);

  const renderCaption = (
    caption?: string | null,
    captionTitle?: string | null
  ) => {
    if (caption || captionTitle) {
      return (
        <div className={withPrefix('caption')}>
          {captionTitle && (
            <p className={withPrefix('title')}>{captionTitle}</p>
          )}
          {caption && <p className={withPrefix('description')}>{caption}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <Column sm={4} md={colMedium} lg={colLarge}>
      <Theme theme={color === 'dark' ? 'g100' : undefined}>
        <div className={withPrefix('do-dont')}>
          <div className={wrapperClassNames}>
            <div className={withPrefix('card')}>
              <div className={withPrefix('card-content')}>
                {type === 'do' && (
                  <CheckmarkFilled size={24} className={iconClassNames} />
                )}
                {type !== 'do' && (
                  <Misuse size={24} className={iconClassNames} />
                )}
                <div className={withPrefix('content')}>
                  {children}
                  {text ? <p className={withPrefix('text')}>{text}</p> : null}
                </div>
              </div>
            </div>
            {renderCaption(caption, captionTitle)}
          </div>
        </div>
      </Theme>
    </Column>
  );
};

DoDont.defaultProps = {
  colLg: 4,
  colMd: 4,
  color: 'light',
};

DoDont.propTypes = {
  /** Set the aspect ratio */
  aspectRatio: PropTypes.oneOf([
    '2:1',
    '1:1',
    '1:2',
    '16:9',
    '9:16',
    '4:3',
    '3:4',
  ]),
  /** caption (optional) */
  caption: PropTypes.string,
  /** title for the card caption (optional) */
  captionTitle: PropTypes.string,
  /** Provide the contents of the DoDont, can be an image or video */
  children: PropTypes.node as unknown as React.Validator<React.ReactNode>,
  /** set optional custom class */
  className: PropTypes.string,
  /** set how many columns wide at large breakpoint  */
  colLg: PropTypes.number,
  /** set how many columns wide at medium breakpoint  */
  colMd: PropTypes.number,
  /** set to "dark" for dark background card */
  color: PropTypes.oneOf(['light', 'dark']),
  /** text displayed in the example card */
  text: PropTypes.string,
  /** set card type */
  type: PropTypes.oneOf<DoDontProps['type']>(['do', 'dont']).isRequired,
};
