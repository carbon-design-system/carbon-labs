/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// A page change: the content swap, out then in (the lane's
// `playContentSwap`, its clocks by the distance the content travels). The
// page shown stays, inert, until it is out, leaving from where it was read;
// then the window goes back to the top, the new page mounts and comes in.
// A change during the out keeps that out and brings in the latest page; a
// change back to the page going out stops its out and keeps it.
// Reduced motion: the swap lands at once.
// What a page puts outside it (its floating settings button) learns that the
// page is going out (`PageLeavingContext`).

import React, { createContext, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  playContentSwap,
  usePrefersReducedMotion,
} from '@carbon-labs/v12-motion';

interface Page {
  id: string;
  node: ReactNode;
}

interface Swap extends Page {
  /** The page going out, drawn as it last was. */
  leaving: Page | null;
  /** The page shown hasn't come in yet. */
  arriving: boolean;
}

/** Whether the page round it is going out. */
export const PageLeavingContext = createContext(false);

/** The swap's travel: up, as a page that comes after. */
const SWAP = { axis: 'y', direction: 1 } as const;

/** Sets a page's `inert`: a page kept from going out is the same element, so it is cleared. */
function inertRef(inert: boolean) {
  return (el: HTMLDivElement | null) => {
    if (el) {
      el.inert = inert;
    }
  };
}

export function PageSwap({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const reduced = !!usePrefersReducedMotion();
  const host = useRef<HTMLDivElement>(null);
  const [swap, setSwap] = useState<Swap>({
    id,
    node: children,
    leaving: null,
    arriving: false,
  });
  // A new page: the one shown leaves, as it was drawn; a change during an out
  // keeps that out. Back to the page going out, its out stops and it stays:
  // the same element, so never two pages of one id.
  if (swap.id !== id && swap.leaving?.id === id) {
    setSwap({ id, node: children, leaving: null, arriving: false });
  } else if (swap.id !== id) {
    setSwap({
      id,
      node: children,
      leaving: swap.leaving ?? { id: swap.id, node: swap.node },
      arriving: true,
    });
  } else if (swap.node !== children) {
    setSwap({ ...swap, node: children });
  }
  const { leaving, arriving } = swap;

  // Out: the page shown leaves; once it is gone, the window is at the top for the new one.
  useLayoutEffect(() => {
    const out = host.current?.firstElementChild as HTMLElement | null;
    if (!leaving || !out) {
      return;
    }
    const { outAnimation } = playContentSwap({
      ...SWAP,
      out,
      // Its place: empty until the out ends.
      in: out.nextElementSibling as HTMLElement,
      reduced,
    });
    let landed = false;
    const land = () => {
      if (landed) {
        return;
      }
      landed = true;
      window.scrollTo({ top: 0 });
      setSwap((s) => (s.leaving === leaving ? { ...s, leaving: null } : s));
    };
    if (outAnimation && outAnimation.playState !== 'finished') {
      outAnimation.onfinish = land;
    } else {
      land();
    }
    return () => {
      if (outAnimation) {
        outAnimation.onfinish = null;
        // An out stopped before it ended: the page it held stays, as it was.
        if (!landed) {
          outAnimation.cancel();
        }
      }
    };
  }, [leaving, reduced]);

  // In: the new page, mounted at the top, comes in.
  useLayoutEffect(() => {
    const page = host.current?.lastElementChild as HTMLElement | null;
    if (leaving || !arriving || !page) {
      return;
    }
    playContentSwap({ ...SWAP, out: null, in: page, reduced, inDelay: 0 });
    setSwap((s) => ({ ...s, arriving: false }));
  }, [leaving, arriving, reduced]);

  return (
    <div ref={host} className="v12r-swap">
      {leaving ? (
        <div
          key={leaving.id}
          className="v12r-swap__page"
          aria-hidden="true"
          ref={inertRef(true)}>
          <PageLeavingContext.Provider value>
            {leaving.node}
          </PageLeavingContext.Provider>
        </div>
      ) : null}
      <div key={swap.id} className="v12r-swap__page" ref={inertRef(false)}>
        <PageLeavingContext.Provider value={false}>
          {leaving ? null : swap.node}
        </PageLeavingContext.Provider>
      </div>
    </div>
  );
}
