/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { CodeSnippet } from '@carbon/react';
import { clsx } from 'clsx';
import PropTypes from 'prop-types';
import React, { ReactElement, ReactPortal } from 'react';

import { MdxComponent, NonScalarNode } from '../interfaces';
import { withPrefix } from '../utils';

interface CodeProps {
  children: Exclude<NonScalarNode, Array<ReactElement | ReactPortal>>;
}
/**
 *
 * For MDX files, steer away from using JSX components
 * for code in favor of standard markdown syntax.
 *
 *````
 * ```
 * const a = 16;
 * ```
 *````
 */
export const InlineCode: MdxComponent<CodeProps> = ({ children }) => {
  const language = children?.props?.className || 'language-plain';

  return (
    <CodeSnippet
      type="inline"
      feedback="Copied!"
      className={clsx(withPrefix('code'), language)}>
      {children}
    </CodeSnippet>
  );
};

InlineCode.propTypes = {
  /** Provide the contents of Code */
  children: PropTypes.element.isRequired,
};
