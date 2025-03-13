/*
 * Copyright IBM Corp. 2022, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Grid as CarbonGrid } from '@carbon/react';
import { clsx } from 'clsx';
import PropTypes from 'prop-types';
import React, { ReactNode } from 'react';

import { MdxComponent } from '../interfaces';
import { withPrefix } from '../utils';

interface GridProps {
  children: ReactNode;
  className?: string | null;
}

/**
 * The Platform allows for easy use of the Carbon `<Grid>` and `<Column>`
 * components. See full docs in the Carbon React Storybook.
 * https://react.carbondesignsystem.com/?path=/story/elements-grid--default
 */
export const Grid: MdxComponent<GridProps> = ({
  children,
  className,
  ...props
}) => (
  <CarbonGrid {...props} className={clsx(withPrefix('grid'), className)}>
    {children}
  </CarbonGrid>
);

Grid.propTypes = {
  children: PropTypes.node as unknown as React.Validator<React.ReactNode>,
  className: PropTypes.string,
};
