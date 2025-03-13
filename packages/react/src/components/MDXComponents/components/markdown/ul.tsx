/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Column, Grid, UnorderedList } from '@carbon/react';
import { clsx } from 'clsx';
import PropTypes from 'prop-types';
import React, { ReactElement } from 'react';

import { MdxComponent } from '../interfaces';
import { withPrefix } from '../utils';
import { LiConsumer } from './li';

interface UlProps {
  children: ReactElement | ReactElement[]; // This is how the types would be in TypeScript
  className?: string | null;
  [otherProp: string]: unknown;
}

/**
 * For MDX files, steer away from using JSX components
 * for lists in favor of standard markdown syntax.
 *
 *```
 * - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * - dolore magna aliqua. Pharetra massa massa ultricies mi quis.
 * - Massa eget egestas purus viverra accumsan in nisl nisi.
 * - Dolor sit amet consectetur adipiscing.
 * ```
 */
export const UL: MdxComponent<UlProps> = ({ children, className, ...rest }) => {
  return (
    <LiConsumer>
      {(value) => {
        if (value.hasListItemParent) {
          return (
            <UnorderedList
              isExpressive
              className={clsx(className, withPrefix('list'), withPrefix('ul'))}
              nested
              {...rest}>
              {children}
            </UnorderedList>
          );
        } else {
          return (
            <Grid className={withPrefix('list-container')}>
              <Column sm={4} md={8} lg={8}>
                <UnorderedList
                  isExpressive
                  className={clsx(
                    className,
                    withPrefix('list'),
                    withPrefix('ul')
                  )}
                  {...rest}>
                  {children}
                </UnorderedList>
              </Column>
            </Grid>
          );
        }
      }}
    </LiConsumer>
  );
};

UL.propTypes = {
  /**
   * Child LI elements
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element.isRequired).isRequired,
    PropTypes.element.isRequired,
  ]).isRequired,
  /**
   * Specify optional className for container element
   */
  className: PropTypes.string,
};
