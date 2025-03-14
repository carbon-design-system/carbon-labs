/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { clsx } from 'clsx';
import PropTypes from 'prop-types';
import React from 'react';

import { MdxComponent } from '../interfaces';
import { withPrefix } from '../utils';

interface BlockquoteProps {
  className?: string | null;
  [otherProp: string]: unknown;
}

/**
 * For MDX files, steer away from using JSX components
 * for blockquote in favor of standard markdown syntax.
 *
 *```
 * > Without aesthetic, design is either the humdrum repetition of familiar clichés
 * > or a wild scramble for novelty. Without aesthetic, the computer is but a
 * > mindless speed machine, producing effects without substance, form without
 * > relevant content, or content without meaningful form.
 * >
 * > <cite>– Paul Rand</cite>
 * ```
 */
export const Blockquote: MdxComponent<BlockquoteProps> = ({
  className,
  ...rest
}) => (
  <blockquote className={clsx(className, withPrefix('blockquote'))} {...rest} />
);

Blockquote.propTypes = {
  /**
   * Specify optional className for container element
   */
  className: PropTypes.string,
};
