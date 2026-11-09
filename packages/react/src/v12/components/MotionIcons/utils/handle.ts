/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  version,
} from 'react';
import {
  noAction,
  type ActionOptions,
} from '@carbon-labs/motion-icons-core/engine/action';
import { playIconHover } from '../hooks/useHover';
import type { MotionIconHandle } from '../types';

/**
 * Icon refs: every icon component takes a `ref`, and the
 * ref gets a MotionIconHandle (`play()`, `trigger()`, `stop()` and `svg`),
 * not the DOM node.
 *
 * React 19 hands a function component its `ref` as a prop; React 18 strips
 * it unless the component is a `forwardRef`. `withRef` makes the component
 * the way the running React wants it: a plain function on 19 (the idiomatic
 * form there), a forwardRef on 18 (the package's peer is `react >=18`).
 * Either way the render gets `(props, ref)`, `ref` taken out of `props`.
 */

/** What a part of an icon reports to its handle: its svg, or the handle of the icon it renders in its place. */
export type SvgRef = ((el: SVGSVGElement | MotionIconHandle | null) => void) & {
  /** The icon's handle (for the icon's own code: declarative actions, a status icon's hand-off). */
  readonly handle: MotionIconHandle;
};

const isHandle = (x: SVGSVGElement | MotionIconHandle): x is MotionIconHandle =>
  !('nodeType' in x);

/** Whether the running React passes `ref` to function components as a prop (19 and later). */
const refIsProp = () => Number.parseInt(version, 10) >= 19;

/**
 * A component taking a `ref`, from a render that gets it as its second
 * argument. `name` is its displayName (default: the render's name).
 */
/* @__NO_SIDE_EFFECTS__ */
export function withRef<P extends object, H>(
  name: string | undefined,
  render: (props: P, ref: React.Ref<H> | undefined) => React.ReactNode
): React.FC<P & { ref?: React.Ref<H> }> {
  let C: React.FC<P & { ref?: React.Ref<H> }>;
  if (refIsProp()) {
    C = (props) => {
      const { ref, ...rest } = props as P & { ref?: React.Ref<H> };
      return render(rest as P, ref);
    };
  } else {
    C = forwardRef<H, P>(function WithRef(props, ref) {
      return render(props as P, ref ?? undefined);
    }) as unknown as React.FC<P & { ref?: React.Ref<H> }>;
  }
  C.displayName = name ?? render.name;
  return C;
}

/** How an icon plays its action (the action kit's, ../actions.ts: only icons with an action have one). */
export interface HandleActions {
  trigger(o?: ActionOptions): Promise<void>;
  stop(): void;
}

/**
 * The icon's handle, given to `ref` (nothing re-renders: it is made once,
 * and reads the svg and the hover binding when asked). Returns the setter
 * its parts pass as their svg's ref (an svg, or the handle of an icon drawn
 * in its place, such as a status icon's plain icon), with the handle on it.
 *
 * `actions` (an icon with an action: the kit's, made once for the handle)
 * plays `trigger` / `stop`. Without it they go to the icon drawn in its
 * place, or, with none, `trigger()` resolves at once and warns once that
 * `name` has no action: the API is the same on every icon, the code that
 * plays one only in the icons that have one.
 */
export function useIconHandle(
  ref: React.Ref<MotionIconHandle> | undefined,
  actions?: (handle: MotionIconHandle) => HandleActions,
  name?: string
): SvgRef {
  const [h] = useState(() => {
    let el: SVGSVGElement | MotionIconHandle | null = null;
    const svgOf = () => (el && isHandle(el) ? el.svg : el);
    const handle: MotionIconHandle = {
      get svg() {
        return svgOf();
      },
      play: () => (el && isHandle(el) ? el.play() : playIconHover(el)),
      trigger: (o?: ActionOptions) =>
        acts
          ? acts.trigger(o)
          : el && isHandle(el)
            ? el.trigger(o)
            : noAction(name),
      stop: () =>
        acts ? acts.stop() : el && isHandle(el) ? el.stop() : undefined,
    };
    // Made once, for this handle (its methods above read it only when called).
    const acts: HandleActions | undefined = actions?.(handle);
    const set = Object.assign(
      (x: SVGSVGElement | MotionIconHandle | null) => {
        el = x;
      },
      { handle }
    ) as SvgRef;
    return { handle, set };
  });
  useImperativeHandle(ref, () => h.handle, [h]);
  return h.set;
}
