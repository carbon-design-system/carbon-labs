/**
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as React from 'react';

/**
 * For "as" props.  Creates an "as" property that supports native html tags such as 'span', 'a', 'button' as well as custom functional components
 * All native props for the supplied html tag/component are inferred as part of the base component props, allowing us to use props like `href` on an 'a' element etc
 */
export type PolymorphicProps<Element extends React.ElementType, Props> = Props &
  Omit<React.ComponentProps<Element>, 'as'> & {
    as?: Element;
  };
