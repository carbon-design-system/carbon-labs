/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useRef } from 'react';
import type React from 'react';
import type { ActionProps, MotionIconHandle } from '../types';

/**
 * The declarative actions (`actionKey`, `actionOn`, `loop`, `actionThen`),
 * played through the icon's own handle (MotionIconHandle.trigger):
 *  - `actionKey` plays the action whenever it changes (not on mount);
 *  - `actionOn="click"` plays it on the icon's click (returned: the onClick to use);
 *  - `loop` loops it while true; turning false lets the pass in flight
 *    finish, then the `actionThen` hand-off follows.
 */
export function useActionProps(
  handle: MotionIconHandle,
  { actionKey, actionOn, loop, actionThen }: ActionProps,
  onClick?: React.MouseEventHandler<SVGSVGElement>,
  moving = true
): React.MouseEventHandler<SVGSVGElement> | undefined {
  const thenRef = useRef(actionThen);
  useEffect(() => {
    thenRef.current = actionThen;
  });

  // Plays when the key changes (not on mount, nor on a StrictMode re-run).
  const lastKey = useRef(actionKey);
  useEffect(() => {
    if (Object.is(lastKey.current, actionKey)) {
      return;
    }
    lastKey.current = actionKey;
    void handle.trigger({ then: thenRef.current });
  }, [actionKey, handle]);

  // `loop`: a trigger looping until the prop goes false. Motion turning off or back on (`moving`: reduced motion,
  // `animated`) starts it again on the drawing shown now; the new trigger takes over, so the old one hands nothing off.
  useEffect(() => {
    if (!loop) {
      return;
    }
    let end!: () => void;
    const until = new Promise<void>((r) => (end = r));
    void handle.trigger({ loop: true, until, then: thenRef.current });
    return end;
  }, [loop, handle, moving]);

  if (actionOn !== 'click') {
    return onClick;
  }
  return (e) => {
    onClick?.(e);
    void handle.trigger({ then: thenRef.current });
  };
}
