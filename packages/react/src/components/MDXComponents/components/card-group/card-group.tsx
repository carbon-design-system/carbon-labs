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
import { mediaQueries, useMatchMedia, withPrefix } from '../utils';

interface CardGroupProps {
  children: ReactNode;
  className?: string | null;
}

/**
 * The `<CardGroup>` component is used in lieu of a  `<Grid>` container
 * when laying out a set of `<ResourceCard>` components on a page. It
 * allows the cards to align in a grid at 8 columns at medium and
 * above breakpoints, and set the grid to condensed at the small
 * breakpoint.
 */
export const CardGroup: MdxComponent<CardGroupProps> = ({
  children,
  className,
  ...rest
}) => {
  const isSm = useMatchMedia(mediaQueries.sm);

  return (
    <Grid
      className={clsx(className, withPrefix('card-group'))}
      condensed={isSm}
      {...rest}>
      <Column lg={8} md={8} sm={4}>
        <Grid condensed>{children}</Grid>
      </Column>
    </Grid>
  );
};

CardGroup.propTypes = {
  /**
   * Provide the contents of your `Card`.
   */
  children: PropTypes.node as unknown as React.Validator<React.ReactNode>,
  /**
   * Optional container class name.
   */
  className: PropTypes.string,
};
