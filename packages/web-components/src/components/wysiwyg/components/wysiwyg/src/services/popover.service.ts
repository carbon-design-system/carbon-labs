/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { PopoverState } from '../types/editor.types.js';

/**
 * Service class for managing popover state
 */
export class PopoverService {
  public static readonly initialState: PopoverState = {
    showLinkPopover: false,
    showImagePopover: false,
    linkUrl: '',
    imageUrl: '',
    imageAlt: '',
    imageTitle: '',
  };

  /**
   * Create initial popover state.
   */
  public static createInitialState(): PopoverState {
    return { ...this.initialState };
  }

  /**
   * Merge partial updates into the current popover state.
   * @param {PopoverState} currentState - Current popover state.
   * @param {Partial<PopoverState>} updates - Partial state updates to merge.
   * @returns {PopoverState} Updated popover state.
   */
  public static update(
    currentState: PopoverState,
    updates: Partial<PopoverState>
  ): PopoverState {
    return { ...currentState, ...updates };
  }

  /**
   * Reset selected keys back to their initial values.
   * @param {PopoverState} currentState - Current popover state.
   * @param {...Array<keyof PopoverState>} keys - State keys to reset.
   * @returns {PopoverState} Updated popover state.
   */
  public static reset(
    currentState: PopoverState,
    ...keys: Array<keyof PopoverState>
  ): PopoverState {
    return this.update(
      currentState,
      keys.reduce(
        (updates, key) => ({ ...updates, [key]: this.initialState[key] }),
        {} as Partial<PopoverState>
      )
    );
  }
}
