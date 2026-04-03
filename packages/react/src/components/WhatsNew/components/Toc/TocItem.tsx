/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import cx from 'classnames';
import React, { HTMLProps } from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';

interface TocItemProps extends HTMLProps<HTMLLIElement> {
  children: React.ReactNode;
  /**
   * The href for the anchor link. Should match the id of the corresponding TocSection.
   * Example: "#section-1"
   */
  href: string;
  /**
   * Whether this item represents the current location in the document.
   * When true, adds aria-current="location" to the link for screen readers.
   * @default false
   */
  isActive?: boolean;
}

// Global state to track and cancel ongoing scroll detection
let activeScrollCleanup: (() => void) | null = null;

/**
 * TocItem - Individual navigation item in a table of contents
 *
 * Renders a list item with an anchor link that navigates to a section.
 * Uses native browser anchor navigation with smooth scrolling.
 * This component is SSR-compatible and does not use any React hooks.
 *
 * @example
 * ```tsx
 * <TocItem href="#introduction">Introduction</TocItem>
 * ```
 */
const TocItem = ({
  children,
  href,
  className,
  isActive = false,
  ...rest
}: TocItemProps) => {
  const labsPrefix = usePrefix();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);

    // Cancel any ongoing scroll detection from previous clicks
    if (activeScrollCleanup) {
      activeScrollCleanup();
      activeScrollCleanup = null;
    }

    if (targetElement) {
      // Dispatch event to signal smooth scroll start
      window.dispatchEvent(
        new CustomEvent('toc-smooth-scroll-start', {
          detail: { targetId },
        })
      );

      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      // Update URL hash without jumping
      window.history.pushState(null, '', href);

      // CRITICAL ACCESSIBILITY: Move focus to target for keyboard/screen reader users
      // This ensures screen readers announce the target content and keyboard users
      // can immediately interact with the content they navigated to
      const originalTabIndex = targetElement.getAttribute('tabindex');

      // Make target focusable if it's not already interactive
      // tabindex="-1" means focusable by script but not in natural tab order
      if (!targetElement.hasAttribute('tabindex')) {
        targetElement.setAttribute('tabindex', '-1');
      }

      // Detect when smooth scrolling has actually finished by monitoring scroll events
      let scrollTimeout: NodeJS.Timeout;
      let lastScrollY = window.scrollY;
      let scrollCheckStarted = false;
      let isCleanedUp = false;

      const cleanup = () => {
        if (isCleanedUp) {
          return;
        }
        isCleanedUp = true;

        window.removeEventListener('scroll', onScroll);
        clearTimeout(scrollTimeout);
        clearTimeout(fallbackTimeoutId);

        // Clear the global cleanup reference if it's this one
        if (activeScrollCleanup === cleanup) {
          activeScrollCleanup = null;
        }
      };

      const dispatchEnd = () => {
        cleanup();

        // Focus the target element after scroll completes
        // Use preventScroll since we already scrolled
        targetElement.focus({ preventScroll: true });

        // Clean up tabindex after focus to avoid polluting tab order
        // Restore original value or remove if it wasn't set
        if (originalTabIndex === null) {
          targetElement.removeAttribute('tabindex');
        } else {
          targetElement.setAttribute('tabindex', originalTabIndex);
        }

        window.dispatchEvent(
          new CustomEvent('toc-smooth-scroll-end', {
            detail: { targetId },
          })
        );
      };

      const checkScrollEnd = () => {
        const currentScrollY = window.scrollY;

        // If scroll position hasn't changed, scrolling has stopped
        if (Math.abs(currentScrollY - lastScrollY) < 1) {
          dispatchEnd();
        } else {
          lastScrollY = currentScrollY;
        }
      };

      const onScroll = () => {
        // Only start checking after scroll has actually begun
        if (!scrollCheckStarted) {
          scrollCheckStarted = true;
          lastScrollY = window.scrollY;
        }

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(checkScrollEnd, 150);
      };

      // Store cleanup function globally so it can be called by next click
      activeScrollCleanup = cleanup;

      // Start listening for scroll events after a brief delay to ensure
      // the smooth scroll animation has started and isSmoothScrolling is set
      setTimeout(() => {
        if (!isCleanedUp) {
          window.addEventListener('scroll', onScroll, { passive: true });
        }
      }, 50);

      // Fallback timeout in case scroll events don't fire (e.g., already at position)
      const fallbackTimeoutId = setTimeout(() => {
        if (!isCleanedUp) {
          dispatchEnd();
        }
      }, 2000);
    }
  };

  return (
    <li
      {...rest}
      className={cx(
        `${labsPrefix}__toc-item`,
        { [`${labsPrefix}__toc-item-active`]: isActive },
        className
      )}>
      <a
        href={href}
        onClick={handleClick}
        aria-current={isActive ? 'location' : undefined}>
        {children}
      </a>
    </li>
  );
};

TocItem.displayName = 'TocItem';

export { TocItem };
export type { TocItemProps };
