/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';
import { MicrophoneVoiceModeToggle } from '@carbon-labs/react-motion-icons';
import { Popover, PopoverContent } from '@carbon-labs/react-popover';
import { IconButton, type IconButtonSize } from '@carbon-labs/react-tooltip';
import './chat.scss';

/* ============================================================================
 * DictationButton: the prompt's microphone.
 *
 *   rest       a ghost IconButton on the rollover
 *   listening  the variant's fill with a brand glyph; the microphone turns
 *              into voice mode's bars, whose loop ripples while it listens
 *   status     DictationStatus: the kit's Popover in the opposite theme, as a
 *              toggletip, over the prompt's top edge, its end at the
 *              microphone's; it snaps from that point and folds back into it
 *   announce   the state alone, politely, in a region mounted before it speaks
 *   a11y       a toggle (`aria-pressed`) named by its action
 *   reduced    the motion icon holds still; the status is there and gone at once
 * ========================================================================== */

export interface DictationButtonProps {
  /** Default "Dictate". */
  dictateButtonLabel?: string;
  /** Default "Stop dictation". */
  stopDictationButtonLabel?: string;
  listening: boolean;
  onListeningChange: (listening: boolean) => void;
  size?: IconButtonSize;
  disabled?: boolean;
  className?: string;
}

export function DictationButton({
  dictateButtonLabel = 'Dictate',
  stopDictationButtonLabel = 'Stop dictation',
  listening,
  onListeningChange,
  size = 'sm',
  disabled,
  className,
}: DictationButtonProps) {
  return (
    <IconButton
      label={listening ? stopDictationButtonLabel : dictateButtonLabel}
      frame="ghost"
      size={size}
      corners="full"
      disabled={disabled}
      // A toggle: `isSelected` is its `aria-pressed`; chat.scss's listening look replaces the selected fill.
      isSelected={listening}
      className={[
        'cds-dictation',
        listening && 'cds-dictation--listening',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => onListeningChange(!listening)}>
      <MicrophoneVoiceModeToggle size={16} toggled={listening} disableToggle />
    </IconButton>
  );
}
DictationButton.displayName = 'DictationButton';

export interface DictationStatusProps {
  listening: boolean;
  /** The prompt it sits over, and its microphone (where its end lines up and it snaps from). */
  prompt: RefObject<HTMLElement | null>;
  microphone: () => HTMLElement | null;
  /** Before the first second. Default "Ready when you are." */
  dictationReadyText?: string;
  /** After it. Default "Listening". */
  dictationListeningText?: string;
  /** Slow motion for the snap. Default 1. */
  timeScale?: number;
}

const clock = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
/** Puts the status's anchor at the microphone's end, as it starts listening: a write to the DOM, no render. */
function DictationAnchor({
  listening,
  prompt,
  microphone,
}: Pick<DictationStatusProps, 'listening' | 'prompt' | 'microphone'>) {
  useLayoutEffect(() => {
    const root = prompt.current;
    const anchor = root?.querySelector<HTMLElement>(
      ':scope > .cds-dictation-anchor'
    );
    const m = microphone()?.getBoundingClientRect();
    if (!listening || !root || !anchor || !m) return;
    const p = root.getBoundingClientRect();
    const end =
      getComputedStyle(root).direction === 'rtl'
        ? m.left - p.left
        : p.right - m.right;
    anchor.style.setProperty('--dictation-end', `${Math.max(0, end)}px`);
    // As it starts listening only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening]);
  return null;
}

/** Dictation's status over the prompt: a zero-size anchor on its top edge, at the microphone's end. Inside the prompt's root. */
export function DictationStatus({
  listening,
  prompt,
  microphone,
  dictationReadyText = 'Ready when you are.',
  dictationListeningText = 'Listening',
  timeScale = 1,
}: DictationStatusProps) {
  const [seconds, setSeconds] = useState(0);
  // A new dictation starts the clock again.
  const [was, setWas] = useState(listening);
  if (listening !== was) {
    setWas(listening);
    if (listening) setSeconds(0);
  }
  // The time listening: a clock, not motion.
  useEffect(() => {
    if (!listening) return;
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [listening]);

  const state = seconds < 1 ? dictationReadyText : dictationListeningText;
  return (
    <>
      {/* Before the Popover, so its anchor is in place as the Popover places itself. */}
      <DictationAnchor
        listening={listening}
        prompt={prompt}
        microphone={microphone}
      />
      <Popover
        open={listening}
        align="top-end"
        autoAlign
        highContrast
        timeScale={timeScale}
        className="cds-dictation-anchor">
        <PopoverContent className="cds-dictation-status">
          {/* Seen, not read: the region below says the state, without the ticking time. */}
          <span className="cds-dictation-status__body" aria-hidden="true">
            <span className="cds-dictation-status__time">{clock(seconds)}</span>
            {/* Both states in one cell, the other hidden: its width holds, so its end stays at the microphone's. */}
            <span className="cds-dictation-status__text">
              <span data-shown={seconds < 1 || undefined}>
                {dictationReadyText}
              </span>
              <span data-shown={seconds >= 1 || undefined}>
                {dictationListeningText}
              </span>
            </span>
          </span>
        </PopoverContent>
      </Popover>
      <span
        className="cds-dictation-live"
        role="status"
        aria-live="polite"
        aria-atomic="true">
        {listening ? state : ''}
      </span>
    </>
  );
}
DictationStatus.displayName = 'DictationStatus';
