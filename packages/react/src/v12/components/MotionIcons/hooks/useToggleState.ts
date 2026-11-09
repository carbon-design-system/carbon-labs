/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useState } from 'react';
import { knownState } from '@carbon-labs/motion-icons-core/engine/frame';

interface UseToggleStateOptions<S extends string> {
  states: readonly S[];
  initial?: S;
  value?: S; // controlled mode
  onChange?: (next: S) => void;
  /** The icon's name, for the warning a value outside `states` gives. */
  name?: string;
}

interface UseToggleStateResult<S extends string> {
  currentState: S;
  transition: (to?: S) => void; // if no arg, cycles to next state
}

export function useToggleState<S extends string>({
  states,
  initial,
  value,
  onChange,
  name = 'This icon',
}: UseToggleStateOptions<S>): UseToggleStateResult<S> {
  // A state the icon doesn't have (`value="typo"`) is ignored, with a warning once: the icon keeps its drawing.
  const [internalState, setInternalState] = useState<S>(
    () => knownState(name, states, initial) ?? states[0]
  );

  // Controlled mode: currentState follows the `value` prop; a value outside `states` keeps the last one it named.
  const known = knownState(name, states, value);
  const [kept, setKept] = useState<S | undefined>(known);
  if (known !== undefined && known !== kept) {
    setKept(known);
  }
  const controlled = value === undefined ? undefined : (known ?? kept);
  const isControlled = controlled !== undefined;
  const currentState = isControlled ? controlled : internalState;

  function transition(to?: S): void {
    let next: S;

    if (to !== undefined) {
      next = to;
    } else {
      const currentIndex = states.indexOf(currentState);
      const nextIndex = (currentIndex + 1) % states.length;
      next = states[nextIndex];
    }

    if (isControlled) {
      onChange?.(next);
    } else {
      setInternalState(next);
      onChange?.(next);
    }
  }

  return { currentState, transition };
}
