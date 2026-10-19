/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { forwardRef, useState, useEffect } from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import { useFocusRegion, F6_NAVIGATION_COMPLETE_EVENT } from '../hooks/useFocusRegion';
import { NavigationHint } from './NavigationHint';


export interface FocusRegionProps {
  /** Child elements to render within the focus region */
  children: React.ReactNode;
  
  /** Unique identifier for this region */
  id: string;
  
  /** Optional group ID for modal behavior. When a modal is active, only regions
   * with the active group ID can receive focus via F6 navigation. */
  groupId?: string;
  
  /** ARIA role for the region. Defaults to 'region'. Common values include:
   * 'main', 'navigation', 'banner', 'contentinfo', 'complementary', 'search', 'form' */
  role?: string;
  
  /** ARIA label for the region. Required for accessibility when role is 'region' */
  'aria-label'?: string;
  
  /** ARIA labelledby for the region. Alternative to aria-label */
  'aria-labelledby'?: string;
  
  /** Whether this region should receive focus on page load (only one should be default) */
  defaultFocus?: boolean;
  
  /** Whether this region is enabled. When false, it cannot receive focus via F6 */
  enabled?: boolean;
  
  /** Show navigation hint on first focus. The hint explains F6 navigation and is dismissed after first viewing. */
  showNavigationHint?: boolean;
  
  /** Additional CSS class names */
  className?: string;
  
  /** Additional inline styles */
  style?: React.CSSProperties;
}

export const FocusRegion = forwardRef<HTMLElement, FocusRegionProps>(
  (
    {
      children,
      id,
      groupId,
      role = 'region',
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      defaultFocus = false,
      enabled = true,
      showNavigationHint = false,
      className,
      style,
    },
    ref
  ) => {
    const prefix = usePrefix();
    const containerRef = React.useRef<HTMLElement>(null);
    const [showHint, setShowHint] = useState(false);
    const focusedElementRef = React.useRef<HTMLElement | null>(null);
    
    // Check session storage immediately to determine if hint has been shown
    const hasShownHintInitial = React.useMemo(() => {
      if (typeof window !== 'undefined') {
        return sessionStorage.getItem('focus-region-hint-shown') === 'true';
      }
      return false;
    }, []);
    
    const [hasShownHint, setHasShownHint] = useState(hasShownHintInitial);
    const hasShownHintRef = React.useRef(hasShownHintInitial);
    
    // Convert groupId to array format expected by hook (memoized to prevent effect re-runs)
    const groupIds = React.useMemo(() => groupId ? [groupId] : [], [groupId]);
    
    // Callback to dismiss hint - defined early for use in handleF6Navigation
    const handleDismissHint = React.useCallback(() => {
      // Before dismissing, ensure we're not losing track of the actual focused element
      // The hint is outside the region, so focus should still be on an element inside the region
      const currentFocus = document.activeElement as HTMLElement;
      const regionElement = containerRef.current;
      
      // If focus is somehow on the hint button, move it back to the region
      if (regionElement && currentFocus && !regionElement.contains(currentFocus)) {
        // Focus is outside the region (probably on the hint button)
        // Don't do anything - let the normal flow handle it
      }
      
      setShowHint(false);
      setHasShownHint(true);
      hasShownHintRef.current = true;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('focus-region-hint-shown', 'true');
      }
    }, []);
    
    const { regionId } = useFocusRegion(
      containerRef,
      enabled,
      groupIds,
      defaultFocus,
      role
    );
    
    // Listen for F6 navigation completion to dismiss hint
    // Any F6 navigation dismisses the hint, regardless of which region it came from
    useEffect(() => {
      if (!showHint) return;
      
      const handleF6Navigation = () => {
        handleDismissHint();
      };
      
      document.addEventListener(F6_NAVIGATION_COMPLETE_EVENT, handleF6Navigation);
      return () => document.removeEventListener(F6_NAVIGATION_COMPLETE_EVENT, handleF6Navigation);
    }, [showHint, handleDismissHint]);


    // Show hint on first keyboard focus (not mouse click)
    useEffect(() => {
      if (!showNavigationHint) return;

      const element = containerRef.current;
      if (!element) return;

      let focusHandled = false;

      const handleFocus = (event: FocusEvent) => {
        // Use ref to get current value, not closure value
        if (focusHandled || hasShownHintRef.current) return;
        
        // Check sessionStorage in case another region dismissed the hint
        if (typeof window !== 'undefined' && sessionStorage.getItem('focus-region-hint-shown') === 'true') {
          hasShownHintRef.current = true;
          return;
        }

        // Check if this is keyboard focus by seeing if the element matches :focus-visible
        const target = event.target as HTMLElement;
        
        // Save the focused element for potential focus restoration
        focusedElementRef.current = target;
        
        // Use a small timeout to let the browser apply :focus-visible
        setTimeout(() => {
          // Check sessionStorage again in case it was set during the timeout
          if (typeof window !== 'undefined' && sessionStorage.getItem('focus-region-hint-shown') === 'true') {
            hasShownHintRef.current = true;
            return;
          }
          
          if (!hasShownHintRef.current && (target.matches(':focus-visible') || element.matches(':focus-visible'))) {
            focusHandled = true;
            setShowHint(true);
            // Set sessionStorage immediately when hint is shown so other regions won't show it
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('focus-region-hint-shown', 'true');
            }
            hasShownHintRef.current = true;
          }
        }, 0);
      };

      element.addEventListener('focusin', handleFocus);

      return () => {
        element.removeEventListener('focusin', handleFocus);
      };
    }, [showNavigationHint]);


    // Merge refs if external ref is provided
    const mergedRef = React.useCallback(
      (node: HTMLElement | null) => {
        // Set the internal ref
        (containerRef as React.MutableRefObject<HTMLElement | null>).current = node;

        // Set the external ref
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLElement | null>).current = node;
        }
      },
      [ref]
    );

    // Validate aria-label requirement for role="region"
    if (process.env.NODE_ENV === 'development') {
      if (role === 'region' && !ariaLabel && !ariaLabelledby) {
        console.warn(
          `[FocusRegion] Region with id="${id}" has role="region" but no aria-label or aria-labelledby. ` +
          `This is required for accessibility.`
        );
      }
    }

    // Map role to semantic element
    const ElementType = (() => {
      switch (role) {
        case 'main': return 'main';
        case 'navigation': return 'nav';
        case 'complementary': return 'aside';
        case 'banner': return 'header';
        case 'contentinfo': return 'footer';
        default: return 'section';
      }
    })() as any;

    return (
      <>
        <ElementType
          ref={mergedRef}
          data-focus-region={regionId}
          data-focus-region-id={regionId}
          data-focus-region-group={groupId || ''}
          role={role}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          className={className ? `${prefix}--focus-region ${className}` : `${prefix}--focus-region`}
          style={style}
          tabIndex={-1}
        >
          {children}
        </ElementType>
        {showNavigationHint && (
          <NavigationHint
            show={showHint}
            onDismiss={handleDismissHint}
            returnFocusTo={focusedElementRef.current}
          />
        )}
      </>
    );
  }
);

FocusRegion.displayName = 'FocusRegion';


