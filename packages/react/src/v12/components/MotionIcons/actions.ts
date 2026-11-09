/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The action kit: what an icon with an action plays it with. That covers
 * the handle's `trigger()` / `stop()` on the controller drawing its svg,
 * the declarative props (`actionKey`, `actionOn`, `loop`, `actionThen`),
 * and on status icons the hand-off status and a status arriving mid-action
 * waiting for it.
 *
 * The sequencing is the core's, as the web components': `HandOff` (the
 * triggers in order, the hand-off, a trigger waiting for the plain icon)
 * and `waitForAction`. The hooks here keep only React's own state: the
 * status to show, and when the plain icon is back after a render.
 *
 * Only the generated mirrors of icons with an action import it, as
 * `reactHover(CopySpec, actions)` or
 * `reactStatus(CopySpec, { base: CopyPlain, actions })`. An icon without
 * one carries none of this. Its handle's `trigger()` resolves at once with
 * a warning, and the action props do nothing.
 */
import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import {
  actionPlayerOf,
  actionTarget,
  HandOff,
  registerActionTarget,
  type ActionHolder,
} from '@carbon-labs/motion-icons-core/engine/actionPlayer';
import {
  handingOff,
  waitForAction,
  type ActionOptions,
  type ActionTail,
} from '@carbon-labs/motion-icons-core/engine/action';
import { useActionProps } from './hooks/useActionProps';
import { useMotionMode } from './utils/motionMode';
import { useIconHandle, type HandleActions, type SvgRef } from './utils/handle';
import type { ActionProps, MotionIconHandle } from './types';

/** What a status icon's hand-off hook gives its render. */
export interface StatusHandOff<P> {
  svgRef: SvgRef;
  /** The props without the action props, `onClick` wrapped for `actionOn`. */
  props: P;
  /** The status the last trigger handed off to (shown when there is no `status` prop). */
  handOff: string | undefined;
  /** Its tail: the action's last stretch, which the status layer finishes under the entering mark. */
  tail?: ActionTail;
  /** A trigger waits for the plain icon: the status hands back at rest even under the pointer (an action blocks the hover). */
  release?: boolean;
  /** Shared with `useStatusWait` (the kit's own state). */
  live?: unknown;
}

export interface ActionKit {
  /** A hover icon's controller (its action's player), registered on its svg (`null` to unregister). */
  register(el: Element, ctl: ActionHolder | null): void;
  /** A hover icon's handle actions: the controller drawing its svg. */
  handle(handle: MotionIconHandle): HandleActions;
  /** A hover icon's declarative actions; returns the onClick to use. */
  useProps: typeof useActionProps;
  /** A status icon's handle, its action props and its hand-off status. */
  useStatusHandOff<
    P extends ActionProps & {
      onClick?: React.MouseEventHandler<SVGSVGElement>;
    },
  >(
    ref: React.Ref<MotionIconHandle> | undefined,
    props: P,
    name: string
  ): StatusHandOff<P>;
  /**
   * A status arriving mid-action waits for it (a loop finishes its pass): true
   * while the plain icon still acts, so the mark doesn't enter yet.
   */
  useStatusWait(
    h: StatusHandOff<unknown>,
    waiting: boolean,
    on: boolean,
    engine: 'rest' | 'enter' | null,
    own: boolean
  ): boolean;
}

/** A status icon's state between renders, for its HandOff (read when it triggers). */
interface Live {
  on: boolean;
  engine: 'rest' | 'enter' | null;
  own: boolean;
  /** Triggers waiting for the plain icon (released once a render shows it). */
  plainWaiters: (() => void)[];
  handOff?: HandOff;
}

export const actions: ActionKit = {
  register: (el, ctl) =>
    registerActionTarget(el, actionPlayerOf(ctl ?? undefined) ?? null),

  handle(h) {
    const handOff = new HandOff({ target: () => actionTarget(h.svg) });
    return {
      trigger: (o?: ActionOptions) => handOff.trigger(o),
      stop: () => actionTarget(h.svg)?.stop(),
    };
  },

  useProps: useActionProps,

  useStatusHandOff(ref, props, name) {
    const live = useRef<Live>({
      on: true,
      engine: null,
      own: false,
      plainWaiters: [],
    });
    const [hand, setHand] = useState<{
      status?: string;
      tail?: ActionTail;
      release?: boolean;
    }>({});
    // Unmounted (or hidden): the hand-off's clearing timer goes, and the status it would have cleared with it.
    useEffect(() => {
      const l = live.current;
      return () => {
        if (l.handOff?.clearTimers()) {
          setHand({});
        }
      };
    }, []);
    // Its trigger() plays the plain icon's action and hands off to a status (`then`), shown here until `for` ends.
    const svgRef = useIconHandle(
      ref,
      (h) => {
        const l = live.current;
        const handOff = (l.handOff = new HandOff({
          target: () => (l.on && !l.engine ? actionTarget(h.svg) : undefined),
          setStatus: (status, tail) => setHand({ status, tail }),
          handedOff: () => l.own,
          // The status goes and the engine hands back at rest (`release`); useStatusWait says when the plain icon is back.
          release: () => {
            setHand({ release: true });
            return new Promise<void>((r) => l.plainWaiters.push(r)).then(() =>
              setHand((x) => (x.release ? {} : x))
            );
          },
        }));
        return {
          trigger: (o?: ActionOptions) => handOff.trigger(o),
          stop: () => actionTarget(h.svg)?.stop(),
        };
      },
      name
    );
    const { actionKey, actionOn, loop, actionThen, ...rest } = props;
    // Whether the icon moves (a loop starts again when motion comes back).
    const moving =
      useMotionMode((props as { animated?: boolean }).animated) === 'on';
    // Before the loop's effect (effects run in order): a loop starting again as motion comes back plays at once.
    useEffect(() => {
      live.current.on = moving;
    }, [moving]);
    const onClick = useActionProps(
      svgRef.handle,
      { actionKey, actionOn, loop, actionThen },
      rest.onClick,
      moving
    );
    return {
      svgRef,
      props: { ...rest, onClick } as unknown as typeof props,
      handOff: hand.status,
      ...(hand.tail && { tail: hand.tail }),
      ...(hand.release && { release: true }),
      live: live.current,
    };
  },

  useStatusWait(h, waiting, on, engine, own) {
    // The action's own hand-off doesn't wait: its tail finishes under the entering mark.
    const t =
      engine === null && !handingOff(h.tail)
        ? actionTarget(h.svgRef.handle.svg)
        : undefined;
    const plainActing = !!t?.acting;
    const [, wake] = useState(0);
    useEffect(() => {
      if (!waiting) {
        return;
      }
      const wait = waitForAction(actionTarget(h.svgRef.handle.svg), h.tail);
      if (!wait) {
        return;
      }
      let live = true;
      void wait.then(() => live && wake((n) => n + 1));
      return () => {
        live = false;
      };
    });
    useEffect(() => {
      const l = h.live as Live;
      l.on = on;
      l.engine = engine;
      l.own = own;
      if (engine === null || !on) {
        const w = l.plainWaiters;
        l.plainWaiters = [];
        w.forEach((r) => r());
      }
    });
    return plainActing;
  },
};
