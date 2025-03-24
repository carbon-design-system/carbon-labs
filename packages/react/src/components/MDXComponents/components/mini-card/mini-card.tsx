/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Column } from '@carbon/react';
import {
  ArrowRight,
  Calendar,
  Download,
  Email,
  Launch,
} from '@carbon/react/icons';
import { clsx } from 'clsx';
import PropTypes from 'prop-types';
import React, { ReactNode } from 'react';

import { MdxComponent } from '../interfaces';
import { withPrefix } from '../utils';

type ActionIcon = 'arrowRight' | 'download' | 'email' | 'calendar' | 'launch';

interface MiniCardProps {
  children?: ReactNode | null;
  href?: string | null;
  title: string | null;
  actionIcon?: ActionIcon | null;
  linkProps?: object | null;
  className?: string | null;
}

const getIcon = ({ actionIcon }: { actionIcon: ActionIcon }) => {
  switch (actionIcon) {
    case 'arrowRight':
      return <ArrowRight size={20} aria-label="Open resource" />;
    case 'download':
      return <Download size={20} aria-label="Download" />;
    case 'email':
      return <Email size={20} aria-label="Email" />;
    case 'calendar':
      return <Calendar size={20} aria-label="Calendar" />;
    default:
      return <Launch size={20} aria-label="Open resource" />;
  }
};

/**
 *The `<MiniCard>` component can be used in place of a `<ResourceCard>` if your content
 allows it. Unless it is sitting beside your main content, it should always be wrapped
 inside of a `<CardGroup>`. This allows the correct gutter and border placement between
 a group of cards
*
 Although the mini-resource card has a similar geometry to the button component, they
 should not be used in place of a button. Buttons encourage action from the user and
 affect the website's front-end or back-end. The resource cards, both large and mini
 are essentially links. They are used for navigation and actions that do not affect
 the website.
 **/
export const MiniCard: MdxComponent<MiniCardProps> = ({
  children,
  href,
  title,
  actionIcon,
  className,
  linkProps,
  ...rest
}) => {
  const cardContent = (
    <div className={clsx(className, withPrefix('mini-card'))}>
      <div className={withPrefix('wrapper')}>
        <div className={withPrefix('title')}>{title}</div>
        {children === undefined && actionIcon && (
          <div className={withPrefix('icon')}>{getIcon({ actionIcon })}</div>
        )}
        {children !== undefined && (
          <div className={withPrefix('image')}>{children}</div>
        )}
      </div>
    </div>
  );

  return (
    <Column md={4} lg={4} sm={4} {...rest}>
      <a href={href!} className={'cds--tile--clickable'} {...linkProps}>
        {cardContent}
      </a>
    </Column>
  );
};

MiniCard.propTypes = {
  /**
   * Action icon to render.
   */
  actionIcon: PropTypes.oneOf<ActionIcon>([
    'arrowRight',
    'download',
    'email',
    'calendar',
    'launch',
  ]),
  /**
   * Use 32x32 image as child, will display in right-hand corner of the card
   */
  children: PropTypes.element,
  /**
   * Optional container class name.
   */
  className: PropTypes.string,
  /**
   * url to link to on click
   */
  href: PropTypes.string,
  /**
   * Props to pass onto Link component.
   */
  linkProps: PropTypes.object,
  /**
   * Provide the title of your `Card`.
   */
  title: PropTypes.string.isRequired,
};
