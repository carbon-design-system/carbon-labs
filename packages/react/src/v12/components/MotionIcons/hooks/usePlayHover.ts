/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useCallback, useRef } from 'react';
import type React from 'react';
import { playHover } from '@carbon-labs/motion-icons-core/engine/env';

export interface UsePlayHoverResult<T extends Element> {
  /** Attach to the icon's frame, or to any element around the icons to play. */
  ref: React.RefObject<T | null>;
  /**
   * Play the hover once, in then out, on every motion icon inside `ref`'s
   * element (or whose frame it is). Returns how many icons it asked.
   */
  play: () => number;
}

/**
 * Play a motion icon's hover from the app: for hover-only
 * icons on touch, where nothing hovers, or for emphasis (a new item, a
 * saved setting).
 *
 * ```tsx
 * const { ref, play } = usePlayHover<HTMLButtonElement>();
 * <button ref={ref} data-motion-icon-frame onClick={save}><Save /> Save</button>
 * // later: play();
 * ```
 *
 * `play()` reaches every icon inside the element. To play one icon,
 * give it a ref instead: `<Save ref={icon} />`, then `icon.current.play()`
 * (a MotionIconHandle; its play() returns a promise for the end of the
 * play). It is the same `play()` as the web components' `el.play()`:
 *  - no restart: an icon already hovered (pointer, keyboard focus, or a
 *    play in flight) is left alone;
 *  - a pointer or focus arriving mid-play keeps the icon hovered until they
 *    end too;
 *  - under reduced motion (or `animated={false}`) icons draw still, with
 *    no hover binding, so nothing plays;
 *  - in a disabled button frame (`disabled`, `aria-disabled="true"`, or
 *    Carbon's `disabled` on cds-button / cds-icon-button) nothing plays.
 */
export function usePlayHover<
  T extends Element = HTMLElement,
>(): UsePlayHoverResult<T> {
  const ref = useRef<T | null>(null);
  const play = useCallback(
    () => (ref.current ? playHover(ref.current) : 0),
    []
  );
  return { ref, play };
}

export { playHover };
