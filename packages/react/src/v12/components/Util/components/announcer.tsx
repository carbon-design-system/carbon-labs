/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactElement,
} from 'react';

/* ============================================================================
 * The announcer: messages for a screen reader, through two live regions the
 * component renders inside itself (so a modal's own content still reaches
 * the reader), one polite and one assertive.
 *
 *   announce   a message, polite unless it's an error that must interrupt.
 *              The region is emptied first and written on the next frame,
 *              so the same words twice are read twice; messages in the
 *              same frame are read as one
 *   clear      empties both regions (a status that no longer holds)
 *
 * `createAnnouncer` is the framework-free core; `useAnnouncer` gives a
 * component its `announce` and the `regions` to render.
 * ========================================================================== */

export type Politeness = 'polite' | 'assertive';

export interface Announcer {
  announce: (message: string, politeness?: Politeness) => void;
  clear: () => void;
  /** Cancels a message still waiting for its frame. */
  dispose: () => void;
}

type Frame = {
  request: (fn: () => void) => number;
  cancel: (id: number) => void;
};

const frame = (): Frame =>
  typeof requestAnimationFrame === 'function'
    ? {
        request: (fn) => requestAnimationFrame(fn),
        cancel: (id) => cancelAnimationFrame(id),
      }
    : {
        request: (fn) => setTimeout(fn, 0) as unknown as number,
        cancel: (id) => clearTimeout(id),
      };

/** An announcer over two live regions: `get` hands back each region as it is now. */
export function createAnnouncer(
  get: (politeness: Politeness) => HTMLElement | null
): Announcer {
  const { request, cancel } = frame();
  const pending: Record<Politeness, string[]> = { polite: [], assertive: [] };
  let id: number | null = null;

  const flush = () => {
    id = null;
    for (const p of ['assertive', 'polite'] as const) {
      const lines = pending[p];
      if (!lines.length) {
        continue;
      }
      pending[p] = [];
      const el = get(p);
      if (el) {
        el.textContent = lines.join(' ');
      }
    }
  };

  return {
    announce(message, politeness = 'polite') {
      const text = message.trim();
      if (!text) {
        return;
      }
      if (!pending[politeness].length) {
        // Emptied first, so the same words again are a change.
        const el = get(politeness);
        if (el) {
          el.textContent = '';
        }
      }
      pending[politeness].push(text);
      if (id === null) {
        id = request(flush);
      }
    },
    clear() {
      if (id !== null) {
        cancel(id);
        id = null;
      }
      pending.polite = [];
      pending.assertive = [];
      for (const p of ['polite', 'assertive'] as const) {
        const el = get(p);
        if (el) {
          el.textContent = '';
        }
      }
    },
    dispose() {
      if (id !== null) {
        cancel(id);
        id = null;
      }
      pending.polite = [];
      pending.assertive = [];
    },
  };
}

/** Hidden from sight, not from a screen reader. */
const HIDDEN: CSSProperties = {
  position: 'absolute',
  inlineSize: 1,
  blockSize: 1,
  margin: -1,
  padding: 0,
  border: 0,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
};

/** The component's `announce`, `clear`, and the two `regions` it renders once. */
export function useAnnouncer(): {
  announce: Announcer['announce'];
  clear: Announcer['clear'];
  regions: ReactElement;
} {
  const politeRef = useRef<HTMLSpanElement>(null);
  const assertiveRef = useRef<HTMLSpanElement>(null);
  const announcer = useRef<Announcer | null>(null);
  if (!announcer.current) {
    announcer.current = createAnnouncer((p) =>
      p === 'assertive' ? assertiveRef.current : politeRef.current
    );
  }
  useEffect(() => () => announcer.current?.dispose(), []);

  const announce = useCallback<Announcer['announce']>(
    (message, politeness) => announcer.current?.announce(message, politeness),
    []
  );
  const clear = useCallback(() => announcer.current?.clear(), []);
  const regions = useMemo(
    () => (
      <>
        <span
          ref={politeRef}
          style={HIDDEN}
          aria-live="polite"
          aria-atomic="true"
        />
        <span
          ref={assertiveRef}
          style={HIDDEN}
          aria-live="assertive"
          aria-atomic="true"
        />
      </>
    ),
    []
  );
  return { announce, clear, regions };
}
