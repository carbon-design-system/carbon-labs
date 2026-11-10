/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, type RefObject } from 'react';
import { attachRollover } from '@carbon-labs/v12-motion';
import { useReducedGetter } from '@carbon-labs/react-util';

// One body driver for every chat control (`cds-chat-rollover`), as some live in portals. Reduced motion
// is per part: the innermost part whose roots hold the control answers; outside every part, the OS.

const SELECTOR = '.cds-chat-rollover:not(:disabled)';

interface Part {
  roots: readonly RefObject<HTMLElement | null>[];
  reduced: () => boolean;
}

const parts = new Set<Part>();
let detach: (() => void) | null = null;
/** The target of the last press or key: the release that reads `reduced` is on it. Down only, so a
 * release that slips outside the part still reads the part that took the press. */
let last: Element | null = null;

const track = (e: Event) => {
  last = e.target instanceof Element ? e.target : null;
};
const TRACKED = ['pointerdown', 'keydown'] as const;

function reduced(): boolean {
  const el = last?.closest(SELECTOR) ?? last;
  let owner: { part: Part; root: HTMLElement } | null = null;
  if (el) {
    for (const part of parts) {
      for (const ref of part.roots) {
        const root = ref.current;
        if (!root?.contains(el)) {
          continue;
        }
        // The innermost root wins (a notice inside a prompt).
        if (!owner || owner.root.contains(root)) {
          owner = { part, root };
        }
      }
    }
  }
  if (owner) {
    return owner.part.reduced();
  }
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  );
}

/** The chat rollover for one part; `roots` hold its controls, its portals included. */
export function useChatRollover(...roots: RefObject<HTMLElement | null>[]) {
  const reducedHere = useReducedGetter();
  useEffect(() => {
    const part: Part = { roots, reduced: reducedHere };
    if (parts.size === 0) {
      // Capture on the window: before the driver's own listeners read `reduced` on the same event.
      for (const t of TRACKED) {
        window.addEventListener(t, track, true);
      }
      detach = attachRollover(document.body, { selector: SELECTOR, reduced });
    }
    parts.add(part);
    return () => {
      parts.delete(part);
      if (parts.size === 0) {
        for (const t of TRACKED) {
          window.removeEventListener(t, track, true);
        }
        detach?.();
        detach = null;
        last = null;
      }
    };
    // The refs and the getter are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedHere]);
}
