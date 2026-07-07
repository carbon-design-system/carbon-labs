/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef } from 'react';
import { IconButton, Tooltip } from '@carbon/react';
import { ChevronLeft, ChevronRight } from '@carbon/icons-react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import type { HeaderCarouselConfig } from './header-carousel.types';
import type { AriaLabels } from '../AnimatedHeader/types';

interface HeaderCarouselProps {
  /** 0-based index of the currently active page */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Called with the new 0-based page index on prev / next / dot interaction */
  onPageChange: (page: number) => void;
  /** Whether the header is expanded — hides the control when collapsed */
  headerExpanded: boolean;
  /** Carousel configuration */
  config: HeaderCarouselConfig;
  /** Optional aria label overrides */
  ariaLabels?: AriaLabels;
}

const HeaderCarousel: React.FC<HeaderCarouselProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  headerExpanded,
  config,
  ariaLabels,
}) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--animated-header__carousel`;

  const prevLabel =
    config.prevButtonLabel ?? ariaLabels?.carouselPrevButton ?? 'Previous page';
  const nextLabel =
    config.nextButtonLabel ?? ariaLabels?.carouselNextButton ?? 'Next page';

  const dotLabelTemplate = ariaLabels?.carouselDot ?? 'Page {n}';

  // Live region ref — announce page change to screen readers
  const liveRef = useRef<HTMLSpanElement>(null);
  const prevPageRef = useRef<number>(currentPage);

  useEffect(() => {
    if (prevPageRef.current !== currentPage && liveRef.current) {
      liveRef.current.textContent = `Page ${currentPage + 1} of ${totalPages}`;
    }
    prevPageRef.current = currentPage;
  }, [currentPage, totalPages]);

  return (
    <div
      className={blockClass}
      aria-label={config.ariaLabel}
      data-expanded={headerExpanded}
      aria-hidden={!headerExpanded}>
      {/* Visually hidden live region for screen reader announcements */}
      <span
        ref={liveRef}
        aria-live="polite"
        aria-atomic="true"
        className={`${blockClass}__live-region`}
      />

      {/* Previous page button */}
      <IconButton
        kind="ghost"
        size="xs"
        label={prevLabel}
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}>
        <ChevronLeft />
      </IconButton>

      {/* Dot indicators */}
      <div className={`${blockClass}__dots`} role="group" aria-label="Pages">
        {Array.from({ length: totalPages }).map((_, i) => {
          const isActive = i === currentPage;
          const dotLabel = dotLabelTemplate.replace('{n}', String(i + 1));
          return (
            <Tooltip key={i} label={dotLabel} align="top">
              <button
                type="button"
                className={`${blockClass}__dot${isActive ? ` ${blockClass}__dot--active` : ''}`}
                aria-pressed={isActive}
                onClick={() => onPageChange(i)}
              />
            </Tooltip>
          );
        })}
      </div>

      {/* Next page button */}
      <IconButton
        kind="ghost"
        size="xs"
        label={nextLabel}
        disabled={currentPage === totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}>
        <ChevronRight />
      </IconButton>
    </div>
  );
};

HeaderCarousel.displayName = 'HeaderCarousel';

export default HeaderCarousel;
