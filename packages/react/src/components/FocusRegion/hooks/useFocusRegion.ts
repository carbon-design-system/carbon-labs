/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useRef, RefObject } from 'react';
import { getActiveGroupId } from './useFocusGroupModal';

interface FocusRegionRegistration {
  id: string;
  element: HTMLElement;
  enabled: boolean;
  groupIds: string[];
  focusLocation: HTMLElement | null;
}

/**
 * Global registry of all FocusRegion instances
 */
class FocusRegionRegistry {
  private regions: Map<string, FocusRegionRegistration> = new Map();
  private defaultRegionId: string | null = null;
  private hasWarnedMultipleDefaults = false;
  private singletonRoles = new Map<string, string>();

  register(
    id: string,
    element: HTMLElement,
    enabled: boolean,
    groupIds: string[],
    isDefault: boolean,
    role?: string
  ): void {
    // Preserve focus location if region already exists
    const existingRegion = this.regions.get(id);
    const focusLocation = existingRegion?.focusLocation || null;
    
    this.regions.set(id, {
      id,
      element,
      enabled,
      groupIds,
      focusLocation,
    });

    // Handle default region
    if (isDefault) {
      if (this.defaultRegionId === null) {
        this.defaultRegionId = id;
      } else if (!this.hasWarnedMultipleDefaults && process.env.NODE_ENV === 'development') {
        console.warn(
          '[FocusRegion] Multiple regions declared with isDefault={true}. ' +
          'Only the first region in DOM order will be used as the default.'
        );
        this.hasWarnedMultipleDefaults = true;
      }
    }

    // Check singleton roles
    if (role && ['main', 'banner', 'contentinfo'].includes(role)) {
      const existingId = this.singletonRoles.get(role);
      if (existingId && existingId !== id && process.env.NODE_ENV === 'development') {
        console.warn(
          `[FocusRegion] Multiple regions with singleton role="${role}" detected. ` +
          `This role should only appear once per page.`
        );
      }
      this.singletonRoles.set(role, id);
    }
  }

  unregister(id: string): void {
    const region = this.regions.get(id);
    if (region) {
      this.singletonRoles.forEach((regionId, role) => {
        if (regionId === id) {
          this.singletonRoles.delete(role);
        }
      });
    }

    this.regions.delete(id);

    if (this.defaultRegionId === id) {
      this.defaultRegionId = null;
      this.hasWarnedMultipleDefaults = false;
    }
  }

  update(id: string, enabled: boolean, groupIds: string[]): void {
    const region = this.regions.get(id);
    if (region) {
      region.enabled = enabled;
      region.groupIds = groupIds;
    }
  }

  setFocusLocation(id: string, element: HTMLElement | null): void {
    const region = this.regions.get(id);
    if (region) {
      region.focusLocation = element;
    }
  }

  getFocusLocation(id: string): HTMLElement | null {
    return this.regions.get(id)?.focusLocation || null;
  }

  getEnabledRegions(): FocusRegionRegistration[] {
    const activeGroupId = getActiveGroupId();
    
    return Array.from(this.regions.values())
      .filter((region) => {
        if (!region.enabled) return false;
        if (!activeGroupId) return true;
        return region.groupIds.includes(activeGroupId);
      })
      .sort((a, b) => {
        const position = a.element.compareDocumentPosition(b.element);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
      });
  }

  getDefaultRegionId(): string | null {
    return this.defaultRegionId;
  }

  getRegion(id: string): FocusRegionRegistration | undefined {
    return this.regions.get(id);
  }
}

const registry = new FocusRegionRegistry();

/**
 * Check if an element is visible and not inert
 */
function isElementVisible(element: HTMLElement): boolean {
  // Check if element or any ancestor has display: none or visibility: hidden
  if (element.hidden) return false;
  
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  
  // Check if element is in an inert subtree
  let current: HTMLElement | null = element;
  while (current) {
    if (current.hasAttribute('inert') || (current as any).inert === true) {
      return false;
    }
    current = current.parentElement;
  }
  
  return true;
}

/**
 * Get all tabbable elements in a container, including shadow DOM
 */
function getTabbableElements(container: HTMLElement): HTMLElement[] {
  const tabbableSelector = [
    'a[href]',
    'area[href]',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'iframe',
    'object',
    'embed',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]',
  ].join(',');

  const tabbable: HTMLElement[] = [];

  function traverse(root: HTMLElement | ShadowRoot) {
    const elements = root.querySelectorAll(tabbableSelector);
    
    for (const element of Array.from(elements)) {
      if (element instanceof HTMLElement && isElementVisible(element)) {
        tabbable.push(element);
      }
      
      // Traverse into shadow DOM if present
      if (element.shadowRoot) {
        traverse(element.shadowRoot);
      }
    }
  }

  traverse(container);
  
  // Also check if container itself has a shadow root
  if (container.shadowRoot) {
    traverse(container.shadowRoot);
  }

  return tabbable;
}

/**
 * Get first tabbable element in a container
 */
function getFirstTabbable(container: HTMLElement): HTMLElement | null {
  const tabbable = getTabbableElements(container);
  return tabbable.length > 0 ? tabbable[0] : null;
}

/**
 * Focus a region's focus location
 */
function focusRegion(region: FocusRegionRegistration): void {
  const focusLocation = region.focusLocation;
  
  // Try to focus the stored location
  if (focusLocation && region.element.contains(focusLocation) && document.body.contains(focusLocation)) {
    focusLocation.focus();
    return;
  }

  // Fall back to first tabbable
  const firstTabbable = getFirstTabbable(region.element);
  if (firstTabbable) {
    firstTabbable.focus();
    registry.setFocusLocation(region.id, firstTabbable);
  } else {
    // Empty region - focus the container
    region.element.focus();
  }
}

/**
 * Global F6 handler
 */
let globalF6HandlerAttached = false;

// Custom event for F6 navigation completion
const F6_NAVIGATION_EVENT = 'focus-region-f6-navigation';

function attachGlobalF6Handler() {
  if (globalF6HandlerAttached) return;
  globalF6HandlerAttached = true;

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key !== 'F6') return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const activeElement = document.activeElement as HTMLElement;
    if (!activeElement) return;

    // Find which region (if any) currently has focus
    const currentRegion = activeElement.closest('[data-focus-region]') as HTMLElement | null;
    const enabledRegions = registry.getEnabledRegions();
    
    if (enabledRegions.length === 0) return;

    let currentIndex = -1;
    let currentRegionId: string | null = null;
    if (currentRegion) {
      currentRegionId = currentRegion.getAttribute('data-focus-region-id');
      if (currentRegionId) {
        currentIndex = enabledRegions.findIndex((r) => r.id === currentRegionId);
      }
    }

    let targetRegion: FocusRegionRegistration;

    if (event.shiftKey) {
      // Shift+F6 - previous region (wraps to last)
      if (currentIndex > 0) {
        targetRegion = enabledRegions[currentIndex - 1];
      } else {
        targetRegion = enabledRegions[enabledRegions.length - 1];
      }
    } else {
      // F6 - next region (wraps to first)
      if (currentIndex >= 0 && currentIndex < enabledRegions.length - 1) {
        targetRegion = enabledRegions[currentIndex + 1];
      } else {
        targetRegion = enabledRegions[0];
      }
    }

    focusRegion(targetRegion);
    
    // Emit custom event after navigation completes, including the source region ID
    document.dispatchEvent(new CustomEvent(F6_NAVIGATION_EVENT, {
      detail: { sourceRegionId: currentRegionId }
    }));
  }, true);
}

/**
 * Export the event name for use in components
 */
export const F6_NAVIGATION_COMPLETE_EVENT = F6_NAVIGATION_EVENT;

/**
 * Hook to manage focus region behavior
 */
export function useFocusRegion(
  containerRef: RefObject<HTMLElement>,
  enabled: boolean,
  groupIds: string[],
  isDefault: boolean,
  role?: string
) {
  const regionId = useRef(`focus-region-${Math.random().toString(36).substr(2, 9)}`).current;

  // Register region
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Attach global F6 handler on first region mount
    attachGlobalF6Handler();

    // Set the region ID as a data attribute for lookup
    element.setAttribute('data-focus-region-id', regionId);

    registry.register(regionId, element, enabled, groupIds, isDefault, role);

    return () => {
      registry.unregister(regionId);
    };
  }, [containerRef, regionId, enabled, groupIds, isDefault, role]);

  // Update registration when props change
  useEffect(() => {
    registry.update(regionId, enabled, groupIds);
  }, [regionId, enabled, groupIds]);

  // Track focus location within region
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (!target || !element.contains(target)) return;

      // Check if target is directly in this region (not a nested child region)
      const closestRegion = target.closest('[data-focus-region]');
      if (closestRegion !== element) return;

      // Update focus location
      if (target !== element) {
        registry.setFocusLocation(regionId, target);
      }
    };

    document.addEventListener('focusin', handleFocus, true);
    return () => document.removeEventListener('focusin', handleFocus, true);
  }, [containerRef, regionId]);

  // Handle default region initial focus
  useEffect(() => {
    if (!isDefault) return;

    const element = containerRef.current;
    if (!element) return;

    const defaultId = registry.getDefaultRegionId();
    if (defaultId !== regionId) return;

    const timeoutId = setTimeout(() => {
      const firstTabbable = getFirstTabbable(element);
      if (firstTabbable) {
        firstTabbable.focus();
        registry.setFocusLocation(regionId, firstTabbable);
      } else {
        element.focus();
      }
    }, 0);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDefault, containerRef, regionId]);

  return {
    regionId,
    enabledRegionCount: registry.getEnabledRegions().length,
  };
}

