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
import styles from './resizer-handle.scss?inline';
import type { Position } from '../../../src/types.js';
import {
  DOUBLE_TAP,
  KEYBOARD,
  ARIA,
  SELECTORS,
  SLOTS,
  EVENTS,
} from '../../../src/constants.js';
import {
  calculateFlexRatio,
  formatSplitRatio,
  isWithinDistance,
  createCustomEvent,
  safeClosest,
  safeQuerySelectorAll,
} from '../../../src/utils.js';

/**
 * Resizer handle component for resizing panels
 */
class ResizerHandleTemplate extends LitElement {
  static styles = styles;

  /**
   * Pivot position override. Renders a built-in pivot element without requiring
   * a child element. Works in both declarative (grid) and imperative mode.
   *
   * - `start`   — pivot at the start corner of the handle
   * - `end`     — pivot at the end corner of the handle
   * - `both`    — pivots at both corners
   * - `default` — derives position from the parent panel slot (declarative only)
   */
  @property({ type: String, reflect: true })
  pivot?: 'start' | 'end' | 'both' | 'default';

  /**
   * Explicit orientation override for standalone (non-grid) usage.
   * `horizontal` — handle resizes left/right (x axis).
   * `vertical`   — handle resizes up/down (y axis, default).
   */
  @property({ type: String, reflect: true })
  orientation?: 'horizontal' | 'vertical';

  /**
   * ID of the `clabs-resizer-handle` that ALL inline pivot elements control.
   * Overridden per-position by `for-start` / `for-end`.
   */
  @property({ type: String, reflect: true })
  for?: string;

  /**
   * ID of the handle controlled by the `start` pivot specifically.
   * Takes precedence over `for` for the start pivot.
   */
  @property({ type: String, attribute: 'for-start', reflect: true })
  forStart?: string;

  /**
   * ID of the handle controlled by the `end` pivot specifically.
   * Takes precedence over `for` for the end pivot.
   */
  @property({ type: String, attribute: 'for-end', reflect: true })
  forEnd?: string;

  private _isDragging = false;
  private _startNode?: HTMLElement;
  private _endNode?: HTMLElement;
  private _grid?: HTMLElement;
  private _lastTapTime = 0;
  private _lastTapPosition: Position = { x: 0, y: 0 };
  private _boundMove?: (e: PointerEvent) => void;
  private _boundStop?: (e: PointerEvent) => void;

  /**
   *
   */
  private get _isHorizontal(): boolean {
    if (this.orientation === 'horizontal') {
      return true;
    }
    if (this.orientation === 'vertical') {
      return false;
    }
    return this.getAttribute('slot') === SLOTS.HANDLE_HORIZONTAL;
  }

  /**
   * Sets or removes the synthetic hover attribute on the host element.
   * @param {boolean} isHovered - True to apply hover state, false to remove it
   */
  setSyntheticHoverState(isHovered: boolean): void {
    this.toggleAttribute('data-synthetic-hover', isHovered);
  }

  /**
   * Sets or removes the synthetic active attribute on the host element.
   * @param {boolean} isActive - True to apply active state, false to remove it
   */
  setSyntheticActiveState(isActive: boolean): void {
    this.toggleAttribute('data-synthetic-active', isActive);
  }

  /**
   *
   */
  connectedCallback() {
    super.connectedCallback();
    this._grid = safeClosest(this, SELECTORS.GRID) || undefined;

    if (this._grid) {
      const panels = safeQuerySelectorAll<HTMLElement>(
        this._grid,
        SELECTORS.PANEL
      );
      if (this._isHorizontal) {
        this._startNode = panels.find((p) => p.slot === SLOTS.LEFT);
        this._endNode = panels.find((p) => p.slot === SLOTS.RIGHT);
      } else {
        this._startNode = panels.find((p) => p.slot === SLOTS.TOP);
        this._endNode = panels.find((p) => p.slot === SLOTS.BOTTOM);
      }
    }

    this.setAttribute('role', ARIA.ROLE_SEPARATOR);
    this.setAttribute('tabindex', '0');
    this.setAttribute(
      'aria-orientation',
      this._isHorizontal ? 'vertical' : 'horizontal'
    );
    this.setAttribute('aria-live', ARIA.LIVE_ASSERTIVE);

    if (this._grid && this._startNode && this._endNode) {
      this.setAttribute('aria-valuenow', ARIA.VALUE_DEFAULT);
      this.setAttribute('aria-valuemin', ARIA.VALUE_MIN);
      this.setAttribute('aria-valuemax', ARIA.VALUE_MAX);
      this.setAttribute('aria-valuetext', formatSplitRatio(50));
    }

    this.addEventListener('pointerdown', this._handlePointerDown);
    this.addEventListener('keydown', this._handleKeyDown);
  }

  /**
   *
   */
  disconnectedCallback() {
    this.removeEventListener('pointerdown', this._handlePointerDown);
    this.removeEventListener('keydown', this._handleKeyDown);
    if (this._boundMove) {
      window.removeEventListener('pointermove', this._boundMove);
      this._boundMove = undefined;
    }
    if (this._boundStop) {
      window.removeEventListener('pointerup', this._boundStop);
      this._boundStop = undefined;
    }
    this.removeAttribute('data-synthetic-hover');
    this.removeAttribute('data-synthetic-active');
    this._isDragging = false;
    super.disconnectedCallback();
  }

  /**
   *
   */
  private _updateAriaAttributes(): void {
    if (!this._grid || !this._startNode || !this._endNode) {
      return;
    }
    const rectStart = this._startNode.getBoundingClientRect();
    const rectEnd = this._endNode.getBoundingClientRect();
    const startSize = this._isHorizontal ? rectStart.width : rectStart.height;
    const endSize = this._isHorizontal ? rectEnd.width : rectEnd.height;
    const totalSize = startSize + endSize;
    if (totalSize > 0) {
      const percentage = Math.round((startSize / totalSize) * 100);
      this.setAttribute('aria-valuenow', percentage.toString());
      this.setAttribute('aria-valuemin', ARIA.VALUE_MIN);
      this.setAttribute('aria-valuemax', ARIA.VALUE_MAX);
      this.setAttribute('aria-valuetext', formatSplitRatio(percentage));
    }
  }

  /**
   * Resets both panels to their default sizes and dispatches a resize-reset event.
   * @param {MouseEvent} e - The originating mouse event (double-click or equivalent)
   */
  resetSizes = (e: MouseEvent): void => {
    e.preventDefault();
    this.dispatchEvent(createCustomEvent(EVENTS.RESIZE_RESET));
    if (this._grid) {
      this._grid.style.removeProperty('--start-element-size');
      this._grid.style.removeProperty('--end-element-size');
      this._grid.addEventListener(
        'transitionend',
        () => this._updateAriaAttributes(),
        { once: true }
      );
    }
  };

  /**
   *
   */
  private get _resolvedPivot(): 'start' | 'end' | 'both' | undefined {
    if (
      this.pivot === 'start' ||
      this.pivot === 'end' ||
      this.pivot === 'both'
    ) {
      return this.pivot;
    }
    const panel = safeClosest(this, SELECTORS.PANEL);
    if (!panel) {
      return undefined;
    }
    const slot = panel.getAttribute('slot');
    if (slot === SLOTS.LEFT) {
      return 'end';
    }
    if (slot === SLOTS.RIGHT) {
      return 'start';
    }
    return undefined;
  }

  /**
   * Returns true if the pointer event forms a double-tap with the previous tap.
   * @param {PointerEvent} e - The current pointer-down event to evaluate
   */
  private _detectDoubleTap(e: PointerEvent): boolean {
    const now = Date.now();
    const dt = now - this._lastTapTime;
    const currentPos: Position = { x: e.clientX, y: e.clientY };
    if (
      dt < DOUBLE_TAP.MAX_TIME_MS &&
      isWithinDistance(
        currentPos,
        this._lastTapPosition,
        DOUBLE_TAP.MAX_DISTANCE_PX
      )
    ) {
      this.resetSizes(e as unknown as MouseEvent);
      this._lastTapTime = 0;
      return true;
    }
    this._lastTapTime = now;
    this._lastTapPosition = currentPos;
    return false;
  }

  /**
   * Public API for pivot component — delegates to the internal pointer-down handler.
   * @param {PointerEvent} e - The pointer-down event to begin dragging from
   */
  startDrag = (e: PointerEvent): void => {
    this._handlePointerDown(e);
  };

  /**
   * Handles pointerdown: starts drag tracking and wires up global move/up listeners.
   * @param {PointerEvent} e - The pointerdown event that initiated the drag
   */
  private _handlePointerDown = (e: PointerEvent): void => {
    if (this._detectDoubleTap(e)) {
      return;
    }

    e.preventDefault();
    this._isDragging = true;
    this.setSyntheticActiveState(true);

    const startValue = this._isHorizontal ? e.clientX : e.clientY;

    this.dispatchEvent(
      createCustomEvent(EVENTS.RESIZE_START, {
        startPosition: { x: e.clientX, y: e.clientY },
      })
    );

    let startSize = 0;
    let endSize = 0;
    if (this._grid && this._startNode && this._endNode) {
      const rectStart = this._startNode.getBoundingClientRect();
      const rectEnd = this._endNode.getBoundingClientRect();
      startSize = this._isHorizontal ? rectStart.width : rectStart.height;
      endSize = this._isHorizontal ? rectEnd.width : rectEnd.height;
    }

    /**
     * Pointermove handler — updates grid sizes on every drag tick.
     * @param {PointerEvent} ev - The pointermove event during an active drag
     */
    this._boundMove = (ev: PointerEvent) => {
      if (!this._isDragging) {
        return;
      }
      const delta = (this._isHorizontal ? ev.clientX : ev.clientY) - startValue;
      this.dispatchEvent(
        createCustomEvent(EVENTS.RESIZE_DRAG, {
          delta,
          position: { x: ev.clientX, y: ev.clientY },
        })
      );
      if (this._grid && this._startNode && this._endNode) {
        this._updateGridSizes(delta, startSize, endSize);
      }
    };

    /**
     * Pointerup handler — finalises the drag and removes global listeners.
     * @param {PointerEvent} ev - The pointerup event that ends the drag
     */
    this._boundStop = (ev: PointerEvent) => {
      const delta = (this._isHorizontal ? ev.clientX : ev.clientY) - startValue;
      this.dispatchEvent(
        createCustomEvent(EVENTS.RESIZE_END, {
          delta,
          position: { x: ev.clientX, y: ev.clientY },
        })
      );
      if (this._boundMove) {
        window.removeEventListener('pointermove', this._boundMove);
        this._boundMove = undefined;
      }
      if (this._boundStop) {
        window.removeEventListener('pointerup', this._boundStop);
        this._boundStop = undefined;
      }
      if (this._grid) {
        this._grid.style.removeProperty('transition');
      }
      this._isDragging = false;
      this.setSyntheticActiveState(false);
    };

    window.addEventListener('pointermove', this._boundMove);
    window.addEventListener('pointerup', this._boundStop);
  };

  /**
   * Applies new flex-ratio CSS custom properties to the grid based on a pixel delta.
   * @param {number} delta - Signed pixel offset since drag start
   * @param {number} startSize - Initial size of the start panel in pixels
   * @param {number} endSize - Initial size of the end panel in pixels
   */
  private _updateGridSizes(
    delta: number,
    startSize: number,
    endSize: number
  ): void {
    if (!this._grid) {
      return;
    }
    this._grid.style.transition = 'none';
    const start = startSize + delta;
    const end = endSize - delta;
    const total = start + end || 1;
    this._grid.style.setProperty(
      '--start-element-size',
      `${calculateFlexRatio(start, total)}fr`
    );
    this._grid.style.setProperty(
      '--end-element-size',
      `${calculateFlexRatio(end, total)}fr`
    );
    this._updateAriaAttributes();
  }

  /**
   * Handles keyboard events: moves the handle by a step or jumps to an extreme.
   * @param {KeyboardEvent} e - The keydown event fired on the handle element
   */
  private _handleKeyDown = (e: KeyboardEvent): void => {
    const allKeys = [
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
      'PageUp',
      'PageDown',
    ];
    if (!allKeys.includes(e.key)) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const step = e.shiftKey ? KEYBOARD.LARGE_STEP_PX : KEYBOARD.DEFAULT_STEP_PX;
    const isHorizontal = this._isHorizontal;
    let delta = 0;

    if (e.key === 'ArrowLeft' && isHorizontal) {
      delta = -step;
    } else if (e.key === 'ArrowRight' && isHorizontal) {
      delta = step;
    } else if (e.key === 'ArrowUp' && !isHorizontal) {
      delta = -step;
    } else if (e.key === 'ArrowDown' && !isHorizontal) {
      delta = step;
    } else if (e.key === 'Home' && this._grid && this._startNode) {
      const rect = this._startNode.getBoundingClientRect();
      delta = isHorizontal ? -rect.width : -rect.height;
    } else if (e.key === 'End' && this._grid && this._endNode) {
      const rect = this._endNode.getBoundingClientRect();
      delta = isHorizontal ? rect.width : rect.height;
    }

    if (delta === 0) {
      return;
    }

    this.dispatchEvent(
      createCustomEvent(EVENTS.RESIZE_START, { startPosition: { x: 0, y: 0 } })
    );

    if (this._grid && this._startNode && this._endNode) {
      const rectStart = this._startNode.getBoundingClientRect();
      const rectEnd = this._endNode.getBoundingClientRect();
      const startSize = isHorizontal ? rectStart.width : rectStart.height;
      const endSize = isHorizontal ? rectEnd.width : rectEnd.height;
      this._updateGridSizes(delta, startSize, endSize);
    }

    this.dispatchEvent(
      createCustomEvent(EVENTS.RESIZE_DRAG, { delta, position: { x: 0, y: 0 } })
    );
    this.dispatchEvent(
      createCustomEvent(EVENTS.RESIZE_END, { delta, position: { x: 0, y: 0 } })
    );
  };

  /**
   *
   */
  render() {
    const resolvedPivot = this._resolvedPivot;
    const showStart = resolvedPivot === 'start' || resolvedPivot === 'both';
    const showEnd = resolvedPivot === 'end' || resolvedPivot === 'both';
    return html`
      <div class="handle-content">
        <span class="sr-only">
          Use arrow keys to resize, hold Shift for larger steps. Double-click to
          reset.
        </span>
        <div>
          ${showStart
            ? html`<clabs-resizer-handle-pivot
                position="start"
                .for=${this.forStart ?? this.for}></clabs-resizer-handle-pivot>`
            : ''}
        </div>
        <div class="icon-container" part="icon-container">
          <slot name="${SLOTS.ICON}"></slot>
        </div>
        <div>
          ${showEnd
            ? html`<clabs-resizer-handle-pivot
                position="end"
                .for=${this.forEnd ?? this.for}></clabs-resizer-handle-pivot>`
            : ''}
        </div>
      </div>
    `;
  }
}

export default ResizerHandleTemplate;
