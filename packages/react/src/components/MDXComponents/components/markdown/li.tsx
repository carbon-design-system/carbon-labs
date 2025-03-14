/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ListItem } from '@carbon/react';
import { clsx } from 'clsx';
import PropTypes from 'prop-types';
import React, { ReactNode } from 'react';

import { MdxComponent } from '../interfaces';
import { withPrefix } from '../utils';
const { Provider, Consumer: LiConsumer } = React.createContext<LiContext>({
  hasListItemParent: false,
});

interface LiProps {
  children: ReactNode;
  className?: string | null;
  [otherProp: string]: unknown;
}

interface LiContext {
  hasListItemParent: boolean;
}

export const LI: MdxComponent<LiProps> = ({ children, className, ...rest }) => (
  <ListItem className={clsx(className, withPrefix('list-item'))} {...rest}>
    <Provider value={{ hasListItemParent: true }}>{children}</Provider>
  </ListItem>
);

LI.propTypes = {
  /**
   * String title for Header
   */
  children: PropTypes.node as unknown as React.Validator<React.ReactNode>,
  /**
   * Specify optional className for container element
   */
  className: PropTypes.string,
};

export type { LiProps };
export { LiConsumer };
