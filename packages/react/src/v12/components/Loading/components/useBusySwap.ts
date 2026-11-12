/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { CONTENT_SWAP, easingCss } from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import { SPINNER_MOTION, spinnerMs } from '@carbon-labs/react-feedback';

/* ============================================================================
 * useBusySwap — a control's busy state as the spinner's start and stop: out,
 * then in. For the busy
 * Button and ComboButton: what rests in the spinner's place (the icon, or a
 * label-only button's label) and the spinner take turns.
 *
 *   busy on   the rest leaves (fade only, `fast-01`, exit), then the spinner
 *             mounts and draws on (`moderate-01`, the Spinner's start)
 *   busy off  the spinner closes (`fast-02`, the Spinner's stop), then the
 *             rest returns (fade, `fast-02`, entrance)
 *   changed   mid-way, each turns round from where it is: the rest's fade is
 *             a CSS transition, the spinner's arc its own animation
 *   reduced   every swap at once; the spinner is its still dots
 *   first     busy from the start: the spinner is there, the rest hidden
 *
 * The host hides its rest while `restHidden` and fades it on the `vars`
 * (`--cds-busy-out`, `--cds-busy-in` and their curves), mounts the Spinner
 * while `spinner`, and passes `spinning` as its `active`.
 * ========================================================================== */

type Phase = 'rest' | 'out' | 'busy' | 'closing';

export interface BusySwap {
  /** The rest (icon or label) is hidden, or fading out. */
  restHidden: boolean;
  /** The spinner is mounted. */
  spinner: boolean;
  /** The spinner's `active`: false while it closes. */
  spinning: boolean;
  /** The rest's fade clocks, for the host's CSS. */
  vars: CSSProperties;
}

const curve = (name: 'entrance-productive' | 'exit-productive') =>
  easingCss(name);

export function useBusySwap(busy: boolean): BusySwap {
  const { reduced, timeScale } = useFeedbackMotion();
  const [phase, setPhase] = useState<Phase>(busy ? 'busy' : 'rest');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const outMs = spinnerMs(CONTENT_SWAP.out.duration, timeScale);
  const stopMs = spinnerMs(SPINNER_MOTION.stop, timeScale);
  const inMs = spinnerMs(CONTENT_SWAP.in.duration, timeScale);

  const now = useRef<Phase>(phase);
  useLayoutEffect(() => {
    const go = (next: Phase) => {
      now.current = next;
      setPhase(next);
    };
    const clear = () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = null;
    };
    const later = (ms: number, next: Phase) => {
      clear();
      timer.current = setTimeout(() => {
        timer.current = null;
        go(next);
      }, ms);
    };
    const p = now.current;
    if (busy) {
      if (p === 'rest') {
        if (reduced) {
          go('busy');
        } else {
          go('out');
          later(outMs, 'busy');
        }
      } else if (p === 'closing') {
        clear();
        go('busy');
      }
    } else if (p === 'busy') {
      if (reduced) {
        go('rest');
      } else {
        go('closing');
        later(stopMs, 'rest');
      }
    } else if (p === 'out') {
      clear();
      go('rest');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per change of busy
  }, [busy]);
  useLayoutEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    []
  );

  const at = (ms: number) => `${reduced ? 0 : ms}ms`;
  return {
    restHidden: phase !== 'rest',
    spinner: phase === 'busy' || phase === 'closing',
    spinning: phase === 'busy',
    vars: {
      '--cds-busy-out': at(outMs),
      '--cds-busy-in': at(inMs),
      '--cds-busy-exit': curve('exit-productive'),
      '--cds-busy-entrance': curve('entrance-productive'),
    } as CSSProperties,
  };
}
