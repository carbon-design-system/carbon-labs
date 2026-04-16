import React, { memo } from 'react';
import {
  DEFAULT_A11Y_COPY,
  SR_ONLY_STYLE,
  resolveI18nMessage,
} from './messages';

/**
 * CarouselA11yControls Component
 * Screen reader accessible controls for the primary layer carousel
 * Provides keyboard navigation for carousel pages
 */
function CarouselA11yControls({
  enableA11y,
  enableCarousel,
  pageCount,
  activePageIndex,
  i18n,
  onPrevious,
  onNext,
  onGoToPage,
  onAuxiliaryControlFocus,
  onCarouselKeyboardFocusChange,
}) {
  if (!enableA11y || !enableCarousel || pageCount <= 1) {
    return null;
  }

  return (
    <div
      style={SR_ONLY_STYLE}
      role="group"
      aria-label={resolveI18nMessage(
        i18n,
        'primaryCarouselGroupLabel',
        DEFAULT_A11Y_COPY.primaryCarouselGroupLabel
      )}>
      <button
        type="button"
        onClick={onPrevious}
        onFocus={() => {
          onAuxiliaryControlFocus();
          onCarouselKeyboardFocusChange({ type: 'prev' });
        }}
        onBlur={() => onCarouselKeyboardFocusChange(null)}
        aria-label={resolveI18nMessage(
          i18n,
          'primaryCarouselPreviousLabel',
          DEFAULT_A11Y_COPY.primaryCarouselPreviousLabel
        )}>
        Previous page
      </button>
      <button
        type="button"
        onClick={onNext}
        onFocus={() => {
          onAuxiliaryControlFocus();
          onCarouselKeyboardFocusChange({ type: 'next' });
        }}
        onBlur={() => onCarouselKeyboardFocusChange(null)}
        aria-label={resolveI18nMessage(
          i18n,
          'primaryCarouselNextLabel',
          DEFAULT_A11Y_COPY.primaryCarouselNextLabel
        )}>
        Next page
      </button>
      {Array.from({ length: pageCount }, (_, index) => (
        <button
          key={`primary-carousel-a11y-dot-${index}`}
          type="button"
          onClick={() => onGoToPage(index)}
          onFocus={() => {
            onAuxiliaryControlFocus();
            onCarouselKeyboardFocusChange({ type: 'dot', index });
          }}
          onBlur={() => onCarouselKeyboardFocusChange(null)}
          aria-label={resolveI18nMessage(
            i18n,
            'primaryCarouselPageLabel',
            DEFAULT_A11Y_COPY.primaryCarouselPageLabel,
            {
              index,
              position: index + 1,
              total: pageCount,
            }
          )}
          aria-current={index === activePageIndex ? 'page' : undefined}>
          {`Page ${index + 1}`}
        </button>
      ))}
    </div>
  );
}

export default memo(CarouselA11yControls);

// Made with Bob
