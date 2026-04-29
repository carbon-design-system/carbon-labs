/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, html } from 'lit';
// @ts-ignore
import styles from './resizer-handle-pivot.scss?inline';

/** Public interface of <resize-handle> */
interface ResizerHandle extends HTMLElement {
  startDrag(e: PointerEvent): void;
  resetSizes(e: MouseEvent): void;
  setSyntheticHoverState(isHovered: boolean): void;
  setSyntheticActiveState(isActive: boolean): void;
}

/**
 * Resizer handle pivot component for corner resizing
 */
class ResizerHandlePivotTemplate extends LitElement {
  static styles = styles;

  private _cachedHandle: ResizerHandle | null = null;

  /**
   * Get the sibling resizer handle controlled by this pivot
   * @returns {ResizerHandle | null} The sibling resizer handle
   */
  private getHandle(): ResizerHandle | null {
    // Return cached handle if available
    if (this._cachedHandle) {
      return this._cachedHandle;
    }
    // Get the vertical handle that contains this pivot
    const verticalHandle = this.parentElement;
    if (!verticalHandle) {
      return null;
    }

    // Get the inner grid that contains the vertical handle
    const innerGrid = verticalHandle.closest('clabs-resizer-grid');
    if (!innerGrid) {
      return null;
    }

    // Get the panel that contains the inner grid
    const panel = innerGrid.closest('clabs-resizer-panel');
    if (!panel) {
      return null;
    }

    // Get the outer grid that contains the panel
    const outerGrid = panel.closest('clabs-resizer-grid');
    if (!outerGrid) {
      return null;
    }

    // Find the horizontal handle in the outer grid
    const horizontalHandle = outerGrid.querySelector(
      'clabs-resizer-handle[slot="handle-horizontal"]'
    ) as ResizerHandle | null;

    // Cache the handle for later use (e.g., in disconnectedCallback)
    this._cachedHandle = horizontalHandle;
    return horizontalHandle;
  }

  /**
   * Connected callback
   */
  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('slot', 'pivot');
    this.addEventListener('pointerdown', this.handlePointerDown);
    this.addEventListener('pointerenter', this.handlePointerEnter);
    this.addEventListener('pointerleave', this.handlePointerLeave);
    this.addEventListener('dblclick', this.resetSizes);
    this.setAttribute('position', (this.parentElement as any).pivot);
  }

  /**
   * Disconnected callback
   */
  disconnectedCallback(): void {
    // Use cached handle since DOM traversal may not work after disconnection
    const handle = this._cachedHandle || this.getHandle();
    handle?.setSyntheticHoverState(false);
    handle?.setSyntheticActiveState(false);
    this._cachedHandle = null;
    super.disconnectedCallback();
  }

  /**
   * Reset sizes handler
   * @param {MouseEvent} e - Mouse event
   */
  private resetSizes = (e: MouseEvent) => {
    this.getHandle()?.resetSizes(e);
  };

  /**
   * Handle pointer down event
   * @param {PointerEvent} e - Pointer event
   */
  private handlePointerDown = (e: PointerEvent) => {
    const handle = this.getHandle();

    if (handle) {
      handle.setSyntheticActiveState(true);
      handle.startDrag(e);
    }
  };

  /**
   * Mirror hover state onto the controlled handle
   */
  private handlePointerEnter = () => {
    this.getHandle()?.setSyntheticHoverState(true);
  };

  /**
   * Clear mirrored hover and active state from the controlled handle
   */
  private handlePointerLeave = () => {
    const handle = this.getHandle();

    if (handle) {
      handle.setSyntheticHoverState(false);
      handle.setSyntheticActiveState(false);
    }
  };

  /**
   * Render the component
   * @returns {TemplateResult} The template result
   */
  render() {
    return html``;
  }
}

export default ResizerHandlePivotTemplate;
