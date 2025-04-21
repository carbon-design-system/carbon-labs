/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Column, Grid } from '@carbon/react';
import { clsx } from 'clsx';
import PropTypes from 'prop-types';
import React, { ReactNode } from 'react';

import { MdxComponent } from '../interfaces';
import { withPrefix } from '../utils';

interface H4Props {
  autolink?: boolean | null;
  children: ReactNode;
  className?: string | null;
  headingClassName?: string | null;
  [otherProp: string]: unknown;
}

export const H4: MdxComponent<H4Props> = ({
  autolink = true,
  children,
  className,
  headingClassName,
  ...rest
}) => {
  const Component = autolink ? 'h4' : 'p';

  return (
    <Grid
      className={clsx(
        withPrefix('header'),
        withPrefix('h4-container'),
        className
      )}
      {...rest}>
      <Column sm={4} md={8} lg={8}>
        <Component className={clsx(withPrefix('h4'), headingClassName)}>
          {children}
        </Component>
      </Column>
    </Grid>
  );
};

H4.propTypes = {
  autolink: PropTypes.bool,
  /**
   * String title for Header
   */
  children: PropTypes.node as unknown as React.Validator<React.ReactNode>,
  /**
   * Specify optional className for container element
   */
  className: PropTypes.string,
  /**
   * Specify optional className for header element
   */
  headingClassName: PropTypes.string,
};
