/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useState } from 'react';
import { MicrophoneListeningToggle } from '@carbon-labs/react-motion-icons';
import { Spinner } from '@carbon-labs/react-feedback';
import { useBusySwap } from '@carbon-labs/react-loading';
import { IconButton, type IconButtonSize } from '@carbon-labs/react-tooltip';
import './chat.scss';

/* ============================================================================
 * DictationButton: the prompt's microphone, a toggle.
 *
 *   rest        a ghost IconButton on the rollover
 *   connecting  `connecting`, from the press until the host has the
 *               microphone: the kit's Spinner in the icon's place, out then
 *               in, as a busy Button's (`aria-busy`)
 *   listening   the variant's fill, the glyph in the brand; the microphone
 *               leaves, then three pills open and follow `level`
 *   stop        a press while connecting or listening
 *   announce    the state, politely, in a region mounted before it speaks
 *   a11y        a toggle (`aria-pressed`) named by its action
 *   reduced     the swap and the icon's change land at once; the pills hold
 *               still; the spinner is its still dots
 * ========================================================================== */

export interface DictationButtonProps {
  /** Default "Dictate". */
  dictateButtonLabel?: string;
  /** Default "Stop dictation". */
  stopDictationButtonLabel?: string;
  /** Announced as listening starts. Default "Listening". */
  dictationListeningText?: string;
  /** Announced as it stops. Default "Dictation stopped". */
  dictationStoppedText?: string;
  /** Listening has started (controlled). */
  listening: boolean;
  /** A press: `true` to start, `false` to stop, or to cancel while connecting. */
  onListeningChange: (listening: boolean) => void;
  /** Pressed, waiting for the microphone: the spinner. Wins over `listening`. */
  connecting?: boolean;
  /** The input level, 0 to 1, or a function read each frame: what the pills follow. */
  level?: number | (() => number);
  size?: IconButtonSize;
  disabled?: boolean;
  className?: string;
}

export function DictationButton({
  dictateButtonLabel = 'Dictate',
  stopDictationButtonLabel = 'Stop dictation',
  dictationListeningText = 'Listening',
  dictationStoppedText = 'Dictation stopped',
  listening,
  onListeningChange,
  connecting = false,
  level,
  size = 'sm',
  disabled,
  className,
}: DictationButtonProps) {
  const on = listening || connecting;
  const live = listening && !connecting;
  const swap = useBusySwap(connecting);

  // The region says a change, never the first state: stopped only after listening.
  const [said, setSaid] = useState('');
  const [was, setWas] = useState(live);
  if (live !== was) {
    setWas(live);
    setSaid(live ? dictationListeningText : dictationStoppedText);
  }

  return (
    <>
      <IconButton
        label={on ? stopDictationButtonLabel : dictateButtonLabel}
        frame="ghost"
        size={size}
        corners="full"
        disabled={disabled}
        // A toggle: `isSelected` is its `aria-pressed`; chat.scss's listening look replaces the selected fill.
        isSelected={on}
        aria-busy={connecting || undefined}
        style={swap.vars}
        className={[
          'cds-dictation',
          live && 'cds-dictation--listening',
          swap.restHidden && 'cds-dictation--swapped',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => onListeningChange(!on)}>
        {/* Toggled once listening: hidden under the spinner, the microphone has left by the time it shows.
            The fade is on a wrapper: the icon writes its own transition. */}
        <span className="cds-dictation__icon">
          <MicrophoneListeningToggle
            size={16}
            toggled={live}
            disableToggle
            level={level}
          />
        </span>
        {swap.spinner && (
          <Spinner
            className="cds-dictation__spinner"
            size={16}
            variant="neutral"
            active={swap.spinning}
          />
        )}
      </IconButton>
      <span
        className="cds-dictation-live"
        role="status"
        aria-live="polite"
        aria-atomic="true">
        {said}
      </span>
    </>
  );
}
DictationButton.displayName = 'DictationButton';
