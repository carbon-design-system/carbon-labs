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

/**
 * The `<Preview>` component is a simple wrapper for an `<iframe />` with
 * styling added to allow it to display responsively within the Platform.
 */
interface PreviewProps {
  className?: string | null;
  title?: string | null;
  height?: string | null;
  src?: string | null;
  style?: object | null;
}

export const Preview: MdxComponent<PreviewProps> = ({
  className,
  title,
  height,
  src,
  style,
}) => (
  <iframe
    src={src!}
    loading="lazy"
    title={title!}
    height={height!}
    frameBorder="no"
    className={clsx(className, withPrefix('preview'))}
    style={style!}
    sandbox="allow-forms allow-scripts allow-same-origin"
  />
);

Preview.propTypes = {
  /**
   * Specify a custom class
   */
  className: PropTypes.string,

  /**
   * Provide the height for the iframe
   */
  height: PropTypes.string,

  /**
   * Provide the url for the iframe
   */
  src: PropTypes.string,

  /**
   * Provide custom inline styles for the iframe
   */
  style: PropTypes.object,

  /**
   * Provide the title for the iframe
   */
  title: PropTypes.string,
};
