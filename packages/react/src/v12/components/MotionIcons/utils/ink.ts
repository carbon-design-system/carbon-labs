/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useCallback, useRef } from 'react';
import { attachInk } from '@carbon-labs/motion-icons-core/ink';

/**
 * Ink (strokes follow a consumer's `fill`) lives in `@carbon-labs/motion-icons-core`
 * (`attachInk`, refactor stage 1); this path re-exports it and keeps the React hook.
 */
export * from '@carbon-labs/motion-icons-core/ink';

/**
 * Callback ref for an SVG that isn't already managed by useHover (static
 * renders): ink attaches to each svg it is given and detaches on null or
 * when another svg takes its place (an icon whose still drawing appears
 * after mount: hydration, reduced motion or `animated` changing). Stable
 * across renders.
 */
export function useInk<T extends SVGSVGElement = SVGSVGElement>(): (
  el: T | null
) => void {
  const bound = useRef<{ el: T; detach: () => void } | null>(null);
  return useCallback((el: T | null) => {
    if (bound.current?.el === el) {
      return;
    }
    bound.current?.detach();
    bound.current = el ? { el, detach: attachInk(el) } : null;
  }, []);
}
