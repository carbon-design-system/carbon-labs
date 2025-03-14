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

interface PageDescriptionProps {
  children: ReactNode;
  className?: string | null;
}

/**
 * The `<PageDescription>` component is generally used for intro text at the top
 * of the page using the type token `fluid-heading-03`.
 */
export const PageDescription: MdxComponent<PageDescriptionProps> = ({
  children,
  className,
  ...rest
}) => (
  <Grid>
    <Column
      sm={4}
      md={8}
      lg={8}
      className={clsx(withPrefix('page-description'), className)}
      {...rest}>
      {children}
    </Column>
  </Grid>
);

PageDescription.propTypes = {
  /**
   * Provide the contents of PageDescription
   */
  children: PropTypes.node as unknown as React.Validator<React.ReactNode>,
  /**
   * Optional class name.
   */
  className: PropTypes.string,
};
