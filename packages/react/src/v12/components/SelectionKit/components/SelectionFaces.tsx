/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { memo, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  MotionIconProvider,
  useMotionContext,
} from '@carbon-labs/react-motion-icons';
import { registerTwin } from '@carbon-labs/v12-motion';

/**
 * An item's two faces: the unselected face (in flow, the selector's rect cut
 * out of it) and the selected face (on top, clipped to the selector's rect),
 * so a label takes its selected color and weight exactly where the selector
 * covers it, mid-glide. The selected face is hidden from assistive tech.
 *
 * The selected face's motion icons are still (`animated={false}`: Carbon's
 * art, no engine, no hover binding) except on the items the selector rests
 * on, is moving to or covers (twins.ts), so a list binds about one row's
 * icons twice, not every row's. Turning still and back remounts an icon, so
 * a toggle in a face takes its state from props (`toggled` / `value`), as
 * both faces get the same element; an uncontrolled toggle would start over.
 *
 * `onFace`: the selected face's own content, when the same element can't be
 * rendered twice (a form control with an `id`: the listbox's check column).
 */
export function SelectionFaces({
  children,
  onFace,
}: {
  children: ReactNode;
  onFace?: ReactNode;
}) {
  const twinRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(false);
  // What the icons would be without this face's say: a provider's choice, or the reduced-motion preference.
  const { animated } = useMotionContext();
  // Whether the twin face wants its icons animated (twins.ts says so as the
  // selector or a pointer reaches its item). A face with no icon has nothing
  // to turn animated: it isn't re-rendered for it (the engine renders this at
  // once, inside the pointerover, on every row a pointer crosses).
  // Its wish is kept, and taken up once an icon is there.
  const wanted = useRef(false);
  const hasIcon = () => !!twinRef.current?.querySelector('svg');
  useLayoutEffect(() => {
    const twin = twinRef.current;
    if (!twin) return;
    return registerTwin(twin, (on) => {
      wanted.current = on;
      if (on === false || hasIcon()) setActive(on);
    });
  }, []);
  // Content that gains an icon while its item is active: animated now.
  useLayoutEffect(() => {
    if (wanted.current && !active && hasIcon()) setActive(true);
  }, [active, children, onFace]);
  // An icon turned animated or still is a new svg: it takes the pixel snap's
  // nudge (useIconPixelSnap) from its copy in the other face, which sits in
  // the same place.
  useLayoutEffect(() => {
    const twin = twinRef.current;
    const face = twin?.previousElementSibling;
    if (!twin || !face) return;
    const from = face.querySelectorAll<SVGElement>('svg');
    const to = twin.querySelectorAll<SVGElement>('svg');
    if (from.length !== to.length) return;
    to.forEach((svg, i) => {
      const t = from[i]!.style.translate;
      if (svg.style.translate !== t) svg.style.translate = t;
    });
  }, [active]);
  return (
    <>
      <span className="sel__face">{children}</span>
      <span
        ref={twinRef}
        className="sel__face sel__face--on"
        aria-hidden="true">
        <MotionIconProvider animated={active && animated}>
          {onFace ?? children}
        </MotionIconProvider>
      </span>
    </>
  );
}

/**
 * The marker layers every selection root renders first: the reduced-motion
 * ghost, then the selector. No props: it renders once (memo), not with every
 * render of its list.
 */
export const SelectionMarker = memo(function SelectionMarker() {
  return (
    <>
      <span className="sel__ghost" data-selection-ghost="" aria-hidden="true" />
      <span
        className="sel__indicator"
        data-selection-indicator=""
        aria-hidden="true"
      />
    </>
  );
});
