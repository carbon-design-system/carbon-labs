/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Launch } from '@carbon/react/icons';
import PropTypes from 'prop-types';
import React, { ReactNode } from 'react';

import { MdxComponent } from '../interfaces';
import { withPrefix } from '../utils';

interface PathProps {
  src?: string | null;
  path?: string | null;
  children: ReactNode;
}

export const Path: MdxComponent<PathProps> = ({ src, path }) => {
  if (!path) return null;
  return (
    <div className={withPrefix('path-container')}>
      <span className={withPrefix('path')}>{path}</span>

      {src && (
        <a
          target="_blank"
          rel="noopener noreferrer"
          title="View source"
          className={withPrefix('icon')}
          href={src}>
          <Launch title="View source" />
        </a>
      )}
    </div>
  );
};

Path.propTypes = {
  children: PropTypes.node as unknown as React.Validator<React.ReactNode>,
  /** Provide path */
  path: PropTypes.string,
  /** Provide src link */
  src: PropTypes.string,
};
