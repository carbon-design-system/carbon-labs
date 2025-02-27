/* eslint-disable jsx-a11y/anchor-is-valid */
/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useToc } from './Toc';
import { usePrefix } from '@carbon-labs/utilities/es/index.js';
import cx from 'classnames';
import React, { useEffect, useRef } from 'react';
import { useTocListContext } from './TocList';

interface TocItemProps {
  isActive?: boolean;
  children: React.ReactNode;
  index?: number;
}

const TocItem = (props: TocItemProps) => {
  const prefix = usePrefix();
  const { isActive, children, index = Infinity } = props;
  const { scrollToSection } = useToc();
  const { registerRef, handleKeyDown } = useTocListContext();
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    registerRef(index, ref);
  }, [index, registerRef]);

  if (!isFinite(index)) {
    return null;
  }

  return (
    <li
      className={cx({
        [`${prefix}--whats-new__toc-item`]: true,
        [`${prefix}--whats-new__toc-item-active`]: isActive,
      })}
      data-index={index}>
      <a
        role="button"
        onKeyDown={handleKeyDown}
        ref={ref}
        tabIndex={isActive ? 0 : -1}
        href="#"
        onClick={(e) => {
          e.preventDefault();
          scrollToSection(index);
        }}>
        {children}
      </a>
    </li>
  );
};

TocItem.displayName = 'TocItem';

export { TocItem };
export type { TocItemProps };
