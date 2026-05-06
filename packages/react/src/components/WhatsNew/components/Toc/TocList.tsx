/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import cx from 'classnames';
import React, { HTMLProps } from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';

interface TocListProps extends HTMLProps<HTMLElement> {
  /**
   * Children are expected to be TocItem elements.
   */
  children: React.ReactNode;
  /**
   * Accessible label for the navigation landmark.
   * Helps screen reader users identify this navigation region.
   * @default "Table of contents"
   */
  ariaLabel?: string;
  /**
   * The offset from the top of the viewport where the TOC should stick.
   * Accepts any valid CSS value (e.g., "128px", "8rem", "10vh").
   * @default Carbon spacing-11 + spacing-09 (128px)
   */
  stickyOffset?: string;
}

/**
 * TocList - Navigation container for table of contents items
 *
 * Renders a semantic <nav> element containing TocItem components.
 * Includes a fixed blue bar that moves to indicate the active item.
 * This component is SSR-compatible and does not use any React hooks.
 *
 * @example
 * ```tsx
 * <TocList>
 *   <TocItem href="#section-1">Section 1</TocItem>
 *   <TocItem href="#section-2">Section 2</TocItem>
 * </TocList>
 * ```
 */
const TocList = ({
  children,
  className,
  ariaLabel = 'Table of contents',
  stickyOffset,
  style,
  ...rest
}: TocListProps) => {
  const labsPrefix = usePrefix();

  return (
    <nav
      {...rest}
      aria-label={ariaLabel}
      className={cx(`${labsPrefix}__toc-list`, className)}
      // eslint-disable-next-line react/forbid-dom-props
      style={
        stickyOffset
          ? ({
              ...style,
              '--toc-sticky-offset': stickyOffset,
            } as React.CSSProperties)
          : style
      }>
      <div className={`${labsPrefix}__toc-active-bar`} aria-hidden="true" />
      {children}
    </nav>
  );
};

TocList.displayName = 'TocList';

export { TocList };
export type { TocListProps };
