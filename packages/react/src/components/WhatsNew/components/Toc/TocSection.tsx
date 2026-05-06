/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

interface TocSectionProps {
  /**
   * The content to render inside the section.
   */
  children: React.ReactNode;

  /**
   * The component to render as the wrapper (e.g., Carbon Column).
   * When provided, this component wraps a <section> element and automatically
   * receives data-toc-section="true" for ToC tracking.
   * All other props are passed to this wrapper component.
   *
   * @example
   * ```tsx
   * import { Column } from '@carbon/react';
   *
   * <TocSection
   *   as={Column}
   *   sm={4}
   *   md={6}
   *   lg={12}
   *   xlg={8}
   * >
   *   <h2 id="intro">Introduction</h2>
   *   <p>Content...</p>
   * </TocSection>
   * ```
   */
  as?: React.ElementType;

  /**
   * Any additional props to pass to the wrapper component or section element.
   */
  [key: string]: unknown;
}

/**
 * TocSection - Individual content section in a table of contents
 *
 * Renders a section element that can be targeted by TocItem anchor links.
 * When the 'as' prop is provided, it wraps the section in that component
 * (e.g., Carbon Column) and automatically adds data-toc-section="true".
 *
 * @example
 * Basic usage (renders as <section> with data-toc-section):
 * ```tsx
 * <TocSection id="introduction">
 *   <h2 id="introduction">Introduction</h2>
 *   <p>Welcome to our guide...</p>
 * </TocSection>
 * ```
 *
 * @example
 * With Carbon Column wrapper (all props go to Column):
 * ```tsx
 * <TocSection
 *   as={Column}
 *   sm={4}
 *   md={6}
 *   lg={12}
 *   xlg={8}
 *   className="custom-class"
 * >
 *   <h2 id="introduction">Introduction</h2>
 *   <p>Welcome to our guide...</p>
 * </TocSection>
 * ```
 */

const TocSection = ({ as: Wrapper, children, ...props }: TocSectionProps) => {
  // If wrapper component is provided, use it and pass all props to it
  if (Wrapper) {
    return (
      <Wrapper {...props} data-toc-section="true">
        <section>{children}</section>
      </Wrapper>
    );
  }

  // Otherwise, render as section with data-toc-section
  return (
    <section {...props} data-toc-section="true">
      {children}
    </section>
  );
};

TocSection.displayName = 'TocSection';

export { TocSection };
export type { TocSectionProps };
