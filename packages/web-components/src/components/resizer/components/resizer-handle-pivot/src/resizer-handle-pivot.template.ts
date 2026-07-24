/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './resizer-handle-pivot.scss?inline';

/** Public interface of <clabs-resizer-handle> */
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

  /**
   * ID of the `clabs-resizer-handle` this pivot controls.
   * When set, the pivot drives that handle regardless of DOM structure —
   * works in both declarative (grid) and imperative layouts.
   */
  @property({ type: String, reflect: true })
  for?: string;

  private _cachedHandle: ResizerHandle | null = null;

  /**
   * Resolve the `clabs-resizer-handle` this pivot controls.
   *
   * Priority order:
   * 1. `for` attribute — explicit ID lookup on the document root.
   * 2. Inline shadow DOM — pivot rendered by `<clabs-resizer-handle pivot="…">`;
   *    walks the grid structure starting from the shadow host to find the paired
   *    horizontal handle in the outer grid (declarative mode only).
   * 3. Parent-element slot traversal — legacy child-slot path.
   *
   * @returns {ResizerHandle | null} The handle to control, or null.
   */
  private getHandle(): ResizerHandle | null {
    // Return cached handle if available
    if (this._cachedHandle) {
      return this._cachedHandle;
    }

    // 1. Explicit `for` attribute — highest priority, works everywhere.
    //    Search the immediate root first (ShadowRoot or Document), then fall
    //    back to the main document so pivots rendered inside a handle's own
    //    shadow root can still reach handles in the light DOM.
    if (this.for) {
      const root = this.getRootNode() as Document | ShadowRoot;
      const localTarget = (root as any).getElementById
        ? (root as Document).getElementById(this.for)
        : (root as ShadowRoot).querySelector(`#${CSS.escape(this.for)}`);
      const target =
        localTarget ??
        (root !== document ? document.getElementById(this.for) : null);
      if (target && target.tagName?.toLowerCase() === 'clabs-resizer-handle') {
        this._cachedHandle = target as ResizerHandle;
        return this._cachedHandle;
      }
    }

    // 2. Inline mode: pivot lives inside the handle's own shadow root
    const root = this.getRootNode();
    if (root instanceof ShadowRoot) {
      const host = root.host as ResizerHandle;
      if (host && host.tagName?.toLowerCase() === 'clabs-resizer-handle') {
        // Walk the grid structure from the host to find the outer horizontal handle
        const verticalHandle = host as HTMLElement;
        const innerGrid = verticalHandle.closest('clabs-resizer-grid');
        if (innerGrid) {
          const panel = innerGrid.closest('clabs-resizer-panel');
          if (panel) {
            const outerGrid = panel.closest('clabs-resizer-grid');
            if (outerGrid) {
              const horizontalHandle = outerGrid.querySelector(
                'clabs-resizer-handle[slot="handle-horizontal"]'
              ) as ResizerHandle | null;
              this._cachedHandle = horizontalHandle;
              return horizontalHandle;
            }
          }
        }
        // Imperative mode without grid context: return null — the pivot is an
        // extended grab area; the host's own pointerdown handles the drag.
        return null;
      }
    }

    // 3. Declarative / child-slot mode: pivot is a slotted child of the handle
    const verticalHandle = this.parentElement;
    if (!verticalHandle) {
      return null;
    }

    const innerGrid = verticalHandle.closest('clabs-resizer-grid');
    if (!innerGrid) {
      return null;
    }

    const panel = innerGrid.closest('clabs-resizer-panel');
    if (!panel) {
      return null;
    }

    const outerGrid = panel.closest('clabs-resizer-grid');
    if (!outerGrid) {
      return null;
    }

    const horizontalHandle = outerGrid.querySelector(
      'clabs-resizer-handle[slot="handle-horizontal"]'
    ) as ResizerHandle | null;

    this._cachedHandle = horizontalHandle;
    return horizontalHandle;
  }

  /**
   * Connected callback
   */
  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('pointerdown', this.handlePointerDown);
    this.addEventListener('pointerenter', this.handlePointerEnter);
    this.addEventListener('pointerleave', this.handlePointerLeave);
    this.addEventListener('dblclick', this.resetSizes);

    // Inline mode: rendered inside the handle's shadow DOM — no slot needed
    // and no `pivot` property to read from parentElement.
    const root = this.getRootNode();
    const isInlineShadow =
      root instanceof ShadowRoot &&
      (root.host as HTMLElement)?.tagName?.toLowerCase() ===
        'clabs-resizer-handle';

    if (!isInlineShadow) {
      // Declarative / child-slot mode
      this.setAttribute('slot', 'pivot');
      this.setAttribute('position', (this.parentElement as any)?.pivot ?? '');
    }
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
