/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Accordion as CarbonAccordion, Column, Grid } from '@carbon/react';
import { clsx } from 'clsx';
import PropTypes from 'prop-types';
import React from 'react';

import { MdxComponent } from '../interfaces';
import { withPrefix } from '../utils';

export interface AccordionProps {
  className?: string | null;
}

/**
 * The `<Accordion>` and `<AccordionItem>` components are used together to display a list of content
 * sections that can be toggled open by clicking the respective title of each section.
 */
export const Accordion: MdxComponent<AccordionProps> = ({
  className,
  ...rest
}) => (
  <Grid narrow>
    <Column sm={4} md={8} lg={8}>
      <CarbonAccordion
        size="md"
        {...rest}
        className={clsx(className, withPrefix('accordion'))}
      />
    </Column>
  </Grid>
);

Accordion.propTypes = {
  /**
   * Optional class name on the accordion.
   */
  className: PropTypes.string,
};

export default Accordion;
