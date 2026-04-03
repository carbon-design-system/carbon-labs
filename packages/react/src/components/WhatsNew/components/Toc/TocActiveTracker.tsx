/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import { useEffect } from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';

interface TocActiveTrackerProps {
  /**
   * Used in an IntersectionObserverInit object to customize behavior with the Table of contents.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver#rootmargin} for further information.
   * @default '-20% 0px -70% 0px'
   * */
  rootMargin?: string;

  /**
   * Used in an IntersectionObserverInit object to customize behavior with the Table of contents.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver#threshold} for further information.
   * @default 0.1
   * */
  threshold?: number | number[];

  /**
   * CSS selector to find the section elements.
   * Can be either:
   * - A container selector (e.g., '.clabs__toc-sections') - will find [id] elements inside
   * - A direct element selector (e.g., '.clabs__toc-sections section[id]') - will use these elements directly
   * @default '.clabs__toc-sections'
   * */
  containerSelector?: string;
}

/**
 * Client-side component that adds active state tracking to ToC navigation.
 * This component renders nothing and works as a sibling to the Toc component,
 * ensuring all ToC content remains server-side rendered.
 *
 * Uses IntersectionObserver to track which sections are visible in the viewport
 * and adds the 'clabs__toc-item-active' class to the corresponding navigation items.
 *
 * @example
 * ```tsx
 * <>
 *   <Toc>
 *     <TocList>
 *       <TocItem href="#section-1">Section 1</TocItem>
 *       <TocItem href="#section-2">Section 2</TocItem>
 *     </TocList>
 *     <TocSections>
 *       <TocSection id="section-1">Content 1</TocSection>
 *       <TocSection id="section-2">Content 2</TocSection>
 *     </TocSections>
 *   </Toc>
 *   <TocActiveTracker />
 * </>
 * ```
 */
export function TocActiveTracker({
  rootMargin = '-20% 0px -70% 0px',
  threshold = 0.1,
  containerSelector,
}: TocActiveTrackerProps = {}) {
  const labsPrefix = usePrefix();

  useEffect(() => {
    const defaultContainerSelector = `.${labsPrefix}__toc-sections`;
    const finalContainerSelector =
      containerSelector || defaultContainerSelector;

    console.log('[TocActiveTracker] Initializing with:', {
      labsPrefix,
      finalContainerSelector,
    });

    // Small delay to ensure DOM is fully rendered
    const initTimeout = setTimeout(() => {
      // Cache class names and DOM elements
      const tocListClass = `.${labsPrefix}__toc-list`;
      const activeClass = `${labsPrefix}__toc-item-active`;
      const tocList = document.querySelector(tocListClass);
      const activeBar = document.querySelector(
        `.${labsPrefix}__toc-active-bar`
      ) as HTMLElement;

      console.log('[TocActiveTracker] DOM elements:', {
        tocList: !!tocList,
        activeBar: !!activeBar,
        tocListClass,
      });

      if (!tocList || !activeBar) {
        console.warn('TocActiveTracker: Required elements not found', {
          tocList: !!tocList,
          activeBar: !!activeBar,
        });
        return;
      }

      // Find sections - look for elements with data-toc-section attribute
      const sections = document.querySelectorAll('[data-toc-section]');

      console.log('[TocActiveTracker] Sections found:', {
        count: sections?.length,
        selector: '[data-toc-section]',
      });

      if (!sections?.length) {
        console.warn('TocActiveTracker: No sections found');
        return;
      }

      // Filter sections with TOC items
      const sectionsWithTocItems = Array.from(sections).filter((section) => {
        const h2 = (section as HTMLElement).querySelector(
          'h2[id]'
        ) as HTMLElement;
        return h2?.id && tocList.querySelector(`a[href="#${h2.id}"]`);
      });

      console.log('[TocActiveTracker] Sections with TOC items:', {
        count: sectionsWithTocItems.length,
        ids: sectionsWithTocItems.map((s) => {
          const h2 = (s as HTMLElement).querySelector('h2[id]') as HTMLElement;
          return h2?.id;
        }),
      });

      if (!sectionsWithTocItems.length) {
        console.warn('TocActiveTracker: No sections with matching TOC items');
        return;
      }

      // State
      let isSmoothScrolling = false;
      let currentActiveId: string | null = null;

      // Unified function to set active section
      const setActiveSection = (targetId: string) => {
        if (currentActiveId === targetId) {
          return;
        }

        const navLink = tocList.querySelector(`a[href="#${targetId}"]`);
        const navItem = navLink?.parentElement;
        if (!navItem) {
          return;
        }

        // Remove all active classes and aria-current from previous active items
        tocList.querySelectorAll(`.${activeClass}`).forEach((el) => {
          el.classList.remove(activeClass);
          const link = el.querySelector('a');
          if (link) {
            link.removeAttribute('aria-current');
          }
        });

        // Set new active item with class and aria-current
        navItem.classList.add(activeClass);
        if (navLink) {
          navLink.setAttribute('aria-current', 'location');
        }
        currentActiveId = targetId;

        // Update active bar position
        const listRect = tocList.getBoundingClientRect();
        const itemRect = navItem.getBoundingClientRect();
        activeBar.style.transform = `translateY(${
          itemRect.top - listRect.top
        }px)`;
        activeBar.style.height = `${itemRect.height}px`;
        activeBar.style.opacity = '1';
      };

      // Handle initial hash on page load
      if (window.location.hash) {
        const targetId = window.location.hash.slice(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const offsetPosition =
            targetElement.getBoundingClientRect().top + window.scrollY - 128;
          window.scrollTo({ top: offsetPosition, behavior: 'auto' });
          setActiveSection(targetId);
        }
      }

      // Check visible sections and update active state
      const checkAllSections = () => {
        if (isSmoothScrolling) {
          console.log('[TocActiveTracker] Skipping check - smooth scrolling');
          return;
        }

        const viewportHeight = window.innerHeight;
        const topThreshold = viewportHeight * 0.2;
        const bottomThreshold = viewportHeight * 0.3;

        console.log('[TocActiveTracker] Checking sections:', {
          scrollY: window.scrollY,
          viewportHeight,
          topThreshold,
          bottomThreshold,
        });

        const visibleSections = sectionsWithTocItems
          .map((section) => {
            const h2 = (section as HTMLElement).querySelector(
              'h2[id]'
            ) as HTMLElement;
            if (!h2?.id) {
              return null;
            }
            const rect = (section as HTMLElement).getBoundingClientRect();
            const isVisible =
              rect.top < viewportHeight - bottomThreshold &&
              rect.bottom > topThreshold;
            console.log(`[TocActiveTracker] Section ${h2.id}:`, {
              top: rect.top,
              bottom: rect.bottom,
              isVisible,
            });
            return isVisible ? h2.id : null;
          })
          .filter((id): id is string => id !== null)
          .sort((a, b) => {
            const aEl = document.getElementById(a);
            const bEl = document.getElementById(b);
            return aEl && bEl
              ? aEl.getBoundingClientRect().top -
                  bEl.getBoundingClientRect().top
              : 0;
          });

        console.log('[TocActiveTracker] Visible sections:', visibleSections);

        // Determine active section
        const activeId =
          visibleSections[0] ||
          currentActiveId ||
          tocList
            .querySelector(`.${labsPrefix}__toc-item a`)
            ?.getAttribute('href')
            ?.slice(1);

        console.log('[TocActiveTracker] Setting active:', activeId);

        if (activeId) {
          setActiveSection(activeId);
        }
      };

      // Event handlers
      const handleSmoothScrollEnd = (e: Event) => {
        isSmoothScrolling = false;
        setActiveSection((e as CustomEvent).detail.targetId);
      };

      const handleTocItemClick = (e: Event) => {
        const href = (e.target as HTMLElement)
          .closest('a')
          ?.getAttribute('href');
        if (href?.startsWith('#')) {
          isSmoothScrolling = true;
          setActiveSection(href.slice(1));
        }
      };

      // Set up observers and listeners
      const observer = new IntersectionObserver(() => checkAllSections(), {
        rootMargin,
        threshold,
      });

      sectionsWithTocItems.forEach((section) => observer.observe(section));

      let scrollTimeout: NodeJS.Timeout;
      const handleScroll = () => {
        console.log('[TocActiveTracker] Scroll event fired');
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(checkAllSections, 50);
      };

      const handleSmoothScrollStart = () => {
        isSmoothScrolling = true;
      };

      console.log('[TocActiveTracker] Adding event listeners');
      tocList.addEventListener('click', handleTocItemClick);
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener(
        'toc-smooth-scroll-start',
        handleSmoothScrollStart
      );
      window.addEventListener('toc-smooth-scroll-end', handleSmoothScrollEnd);

      // Initial check
      setTimeout(checkAllSections, 200);

      // Cleanup
      return () => {
        observer.disconnect();
        clearTimeout(scrollTimeout);
        tocList.removeEventListener('click', handleTocItemClick);
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener(
          'toc-smooth-scroll-start',
          handleSmoothScrollStart
        );
        window.removeEventListener(
          'toc-smooth-scroll-end',
          handleSmoothScrollEnd
        );
      };
    }, 100);

    return () => clearTimeout(initTimeout);
  }, [rootMargin, threshold, containerSelector, labsPrefix]);

  return null;
}

TocActiveTracker.displayName = 'TocActiveTracker';
