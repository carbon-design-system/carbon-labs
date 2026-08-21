/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';

interface NavigationHintProps {
  /** Whether to show the hint */
  show: boolean;
  /** Callback when hint is dismissed */
  onDismiss: () => void;
  /** Element to return focus to after dismissing */
  returnFocusTo?: HTMLElement | null;
}

export const NavigationHint: React.FC<NavigationHintProps> = ({ show, onDismiss, returnFocusTo }) => {
  const prefix = usePrefix();
  const [isVisible, setIsVisible] = useState(false);
  const previousFocusRef = React.useRef<HTMLElement | null>(returnFocusTo || null);

  useEffect(() => {
    if (show) {
      // Small delay to ensure the hint appears after focus
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show]);
  
  // Track where focus came from when it moves to the dialog
  const handleFocusIn = (event: React.FocusEvent) => {
    if (event.relatedTarget) {
      previousFocusRef.current = event.relatedTarget as HTMLElement;
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
      // Restore focus to the element that had focus before the dialog
      const elementToFocus = previousFocusRef.current || returnFocusTo;
      if (elementToFocus && document.contains(elementToFocus)) {
        elementToFocus.focus();
      }
    }, 300); // Wait for fade out animation
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' || event.key === 'Enter') {
      event.preventDefault();
      handleDismiss();
    }
  };

  if (!show) return null;

  return (
    <>
      {/* ARIA live region for screen reader announcement */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={`${prefix}--visually-hidden`}
      >
        {isVisible && 'Keyboard navigation hint: Press F6 to move between page regions, or Shift+F6 to move backwards. Press Escape to dismiss this message.'}
      </div>

      {/* Visual hint overlay */}
      <div
        className={`${prefix}--focus-region-hint ${isVisible ? `${prefix}--focus-region-hint--visible` : ''}`}
        role="dialog"
        aria-label="Navigation hint"
        aria-describedby="focus-region-hint-text"
        onFocusCapture={handleFocusIn}
      >
        <div className={`${prefix}--focus-region-hint__content`}>
          <p id="focus-region-hint-text" className={`${prefix}--focus-region-hint__text`}>
            <strong>Keyboard navigation:</strong> Press <kbd>F6</kbd> to move to the next region, 
            or <kbd>Shift+F6</kbd> to move to the previous region.
          </p>
          <button
            type="button"
            className={`${prefix}--focus-region-hint__dismiss`}
            onClick={handleDismiss}
            onKeyDown={handleKeyDown}
            aria-label="Dismiss navigation hint"
          >
            Got it
          </button>
        </div>
      </div>
    </>
  );
};

// Made with Bob