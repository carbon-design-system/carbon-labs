/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef } from 'react';
import { useTocSectionsContext } from './TocSections';
import { PolymorphicProps } from '../../types/common';

interface TocSectionBaseProps {
  index?: number;
}

type TocSectionProps<T extends React.ElementType> = PolymorphicProps<
  T,
  TocSectionBaseProps
>;

const TocSection = <E extends React.ElementType = 'section'>({
  as,
  index = Infinity,
  ...props
}: TocSectionProps<E>) => {
  const Component = as || 'section';
  const { registerRef } = useTocSectionsContext();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerRef(index, ref);
  }, [index, registerRef]);

  if (!isFinite(index)) {
    return null;
  }
  return <Component {...props} ref={ref} data-index={index} />;
};

TocSection.displayName = 'TocSection';

export { TocSection };
export type { TocSectionProps };
