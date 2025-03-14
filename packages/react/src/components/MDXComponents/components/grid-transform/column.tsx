/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Column as CarbonColumn } from '@carbon/react';
import { clsx } from 'clsx';
import PropTypes from 'prop-types';
import React, { ReactNode } from 'react';

import { MdxComponent } from '../interfaces';
import { withPrefix } from '../utils';

interface ColumnProps {
  children: ReactNode;
  className?: string | null;
  colSm?: number | null;
  colMd?: number | null;
  colLg?: number | null;
  colXl?: number | null;
  colMax?: number | null;
  offsetSm?: number | null;
  offsetMd?: number | null;
  offsetLg?: number | null;
  offsetXl?: number | null;
  offsetMax?: number | null;
  [otherProp: string]: unknown;
}

export const Column: MdxComponent<ColumnProps> = ({
  children,
  className,
  colSm,
  colMd,
  colLg,
  colXl,
  colMax,
  offsetSm,
  offsetMd,
  offsetLg,
  offsetXl,
  offsetMax,
  ...props
}) => {
  const colSizes = {
    sm: offsetSm ? { span: colSm, offset: offsetSm } : colSm,
    md: offsetMd ? { span: colMd, offset: offsetMd } : colMd,
    lg: offsetLg ? { span: colLg, offset: offsetLg } : colLg,
    xlg: offsetXl ? { span: colXl, offset: offsetXl } : colXl,
    max: offsetMax ? { span: colMax, offset: offsetMax } : colMax,
  };

  // remove 'noGutter' props to avoid react console error
  for (const key in Object.keys(props)) {
    if (key.startsWith('noGutter')) {
      delete props[key];
    }
  }

  return (
    // @ts-ignore -- TS thinks this is null
    <CarbonColumn
      {...colSizes}
      {...props}
      className={clsx(withPrefix('column'), className)}>
      {children}
    </CarbonColumn>
  );
};

Column.defaultProps = {
  colSm: 4,
  colMd: 8,
  colLg: 12,
};

Column.propTypes = {
  children: PropTypes.node as unknown as React.Validator<React.ReactNode>,
  className: PropTypes.string,
  colLg: PropTypes.number.isRequired,
  colMax: PropTypes.number,
  colMd: PropTypes.number.isRequired,
  colSm: PropTypes.number.isRequired,
  colXl: PropTypes.number,
  offsetLg: PropTypes.number,
  offsetMax: PropTypes.number,
  offsetMd: PropTypes.number,
  offsetSm: PropTypes.number,
  offsetXl: PropTypes.number,
};
