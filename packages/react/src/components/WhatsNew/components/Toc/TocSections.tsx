/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import cx from 'classnames';
import React from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';

interface TocSectionsProps extends React.HTMLProps<HTMLDivElement> {
  /**
   * Children are expected to be TocSection elements.
   */
  children: React.ReactNode;
}

/**
 * TocSections - Container for table of contents sections
 *
 * Renders a scrollable container that holds TocSection components.
 * This component is SSR-compatible and does not use any React hooks.
 *
 * Note: The original IntersectionObserver-based active state tracking
 * has been removed as it's a client-side only feature. If active state
 * tracking is needed, it should be implemented as a separate client-side
 * enhancement wrapper.
 *
 * @example
 * ```tsx
 * <TocSections>
 *   <TocSection id="section-1">Content 1</TocSection>
 *   <TocSection id="section-2">Content 2</TocSection>
 * </TocSections>
 * ```
 */
const TocSections = ({ children, className, ...rest }: TocSectionsProps) => {
  const labsPrefix = usePrefix();

  return (
    <div {...rest} className={cx(className, `${labsPrefix}__toc-sections`)}>
      {children}
    </div>
  );
};

TocSections.displayName = 'TocSections';

export { TocSections };
export type { TocSectionsProps };
