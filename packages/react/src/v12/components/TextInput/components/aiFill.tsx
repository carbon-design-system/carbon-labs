/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { Undo } from '@carbon-labs/react-motion-icons';
import { playContentSwap } from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import { IconButton } from '@carbon-labs/react-tooltip';
import { iconSizeFor } from '@carbon-labs/react-props';
import { IN_DEVELOPMENT } from '@carbon-labs/react-util';

/* ============================================================================
 * The AI fill state on a field: suggested, filled, edited.
 *
 *   suggested  the offered value in the message line, as helper text
 *   filled     the value arrives by the content swap, 8px up, clipped to the field; a
 *              password's old value leaves as dots. A new value while filled fills again
 *   edited     still; the revert stays
 *   revert     a ghost icon button at the trailing edge plays the swap back, 8px down;
 *              its room is kept whenever `onRevert` is given, so nothing re-wraps
 *   reduced    the swap snaps
 *   a11y       a hidden note in the description; a polite region on a fill, a suggestion
 *              and a revert; focus never moves, but a pressed revert hands it to the field
 *
 * API: `aiState`, `aiSuggestion`, `onRevert`, `aiText`.
 * ========================================================================== */

export type FieldAiState = 'suggested' | 'filled' | 'edited';

/** The words the state uses, for translation. */
export interface FieldAiText {
  /** The message line's lead in `suggested`. Default "Suggested". */
  suggested?: string;
  /** The note while `filled`. Default "Filled by AI". */
  filled?: string;
  /** The note while `edited`. Default "Edited after an AI fill". */
  edited?: string;
  /** The revert button's name and tooltip. Default "Undo AI fill". */
  revert?: string;
  /** Announced after a revert. Default "AI fill undone". */
  reverted?: string;
}

/** The props a field takes for the AI fill state. */
export interface FieldAiProps {
  /** The AI fill state: a value offered, set by the assistant, or changed by the person after. */
  aiState?: FieldAiState;
  /** `suggested`: the offered value, shown in the message line. */
  aiSuggestion?: string;
  /** Undo the fill: a revert button shows while `filled` or `edited`. Set the old value and clear `aiState`. */
  onRevert?: () => void;
  /** The state's words. */
  aiText?: FieldAiText;
}

const TEXT: Required<FieldAiText> = {
  suggested: 'Suggested',
  filled: 'Filled by AI',
  edited: 'Edited after an AI fill',
  revert: 'Undo AI fill',
  reverted: 'AI fill undone',
};

interface UseAiFillOptions extends FieldAiProps {
  id: string;
  /** What shows the value, and swaps: the `<input>`, `<textarea>` or `<select>`, or a trigger's value. */
  controlRef: RefObject<HTMLElement | null>;
  /** The field box the old value's face is laid over. */
  fieldRef: RefObject<HTMLElement | null>;
  /** What a revert hands focus to. Default the control. */
  focusRef?: RefObject<HTMLElement | null>;
  /** The value as shown. Default the control's `value`, else its text. */
  readValue?: (control: HTMLElement) => string;
  helperText?: ReactNode;
  size: 'xs' | 'sm' | 'md' | 'lg';
  disabled: boolean;
  readOnly: boolean;
}

export const filledish = (s: FieldAiState | undefined) =>
  s === 'filled' || s === 'edited';

const shownValue = (el: HTMLElement) =>
  el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
    ? el.value
    : (el.textContent ?? '');

interface Before {
  value: string;
  left: number;
  top: number;
}

/** The old value's face, laid exactly over the control's text, so the swap's out has something to fade. */
function faceOf(control: HTMLElement, field: HTMLElement, old: Before) {
  const cs = getComputedStyle(control);
  const r = control.getBoundingClientRect();
  const f = field.getBoundingClientRect();
  const face = document.createElement('span');
  face.className = 'cds-field-ai-face';
  face.setAttribute('aria-hidden', 'true');
  // A password's face is its dots: the old value never reaches the page.
  const secret =
    control instanceof HTMLInputElement && control.type === 'password';
  face.textContent = secret
    ? '\u2022'.repeat([...old.value].length)
    : old.value;
  if (secret) face.dataset.secret = '';
  const multi = control instanceof HTMLTextAreaElement;
  Object.assign(face.style, {
    left: `${r.left - f.left}px`,
    top: `${r.top - f.top}px`,
    width: `${r.width}px`,
    height: `${r.height}px`,
    padding: cs.padding,
    font: cs.font,
    letterSpacing: cs.letterSpacing,
    lineHeight: cs.lineHeight,
    direction: cs.direction,
    textAlign: cs.textAlign,
    whiteSpace: multi ? 'pre-wrap' : 'pre',
    overflowWrap: multi ? cs.overflowWrap : 'normal',
    display: multi ? 'block' : 'flex',
  });
  field.appendChild(face);
  face.scrollTop = old.top;
  face.scrollLeft = old.left;
  return face;
}

/** The AI fill state for a field: its message line, its note, its revert button and the swap.
 *  A field without the text input's shell names what shows its value and what takes focus. */
export function useAiFill({
  id,
  aiState,
  aiSuggestion,
  onRevert,
  aiText,
  controlRef,
  fieldRef,
  focusRef = controlRef,
  readValue = shownValue,
  helperText,
  size,
  disabled,
  readOnly,
}: UseAiFillOptions) {
  const t = { ...TEXT, ...aiText };
  const { timeScale, reduced } = useFeedbackMotion();

  // The value (and its scroll) before this commit: the swap's out shows it.
  const before = useRef<Before | null>(null);
  const prevState = useRef(aiState);
  const face = useRef<HTMLElement | null>(null);
  const swapping = useRef<object | null>(null);
  const liveRef = useRef<HTMLSpanElement>(null);
  const say = (text: string) => {
    const live = liveRef.current;
    if (!live) return;
    // Cleared first, so the same words twice (a second fill) are said again.
    live.textContent = '';
    if (text) requestAnimationFrame(() => void (live.textContent = text));
  };
  // Every commit, before the tracker below: a fill is `filled` arriving, or a new value while filled.
  useLayoutEffect(() => {
    const was = prevState.current;
    prevState.current = aiState;
    const control = controlRef.current;
    const field = fieldRef.current;
    const old = before.current ?? { value: '', left: 0, top: 0 };
    const changed = !!control && old.value !== readValue(control);
    const fill = aiState === 'filled' && (was !== 'filled' || changed);
    const revert = filledish(was) && !filledish(aiState);
    if (fill) say(t.filled);
    else if (revert) say(t.reverted);
    else if (was !== aiState)
      say(
        aiState === 'suggested'
          ? aiSuggestion
            ? `${t.suggested}: ${aiSuggestion}`
            : t.suggested
          : ''
      );
    if (fill && !changed && IN_DEVELOPMENT)
      console.warn(
        'aiState turned "filled" with the value unchanged: set the value and aiState in one update.'
      );
    if (!(fill || revert) || !changed || !control || !field) return;
    face.current?.remove();
    const out = old.value ? faceOf(control, field, old) : null;
    face.current = out;
    // Clipped while it plays: at xs, 8px of travel would carry the text past the outline.
    field.dataset.aiSwap = '';
    const token = {};
    swapping.current = token;
    // A fill comes up from below; a revert plays it back, down from above.
    const swap = playContentSwap({
      out,
      in: control,
      axis: 'y',
      direction: fill ? 1 : -1,
      timeScale,
      reduced,
    });
    const drop = () => {
      out?.remove();
      if (face.current === out) face.current = null;
    };
    if (swap.outAnimation) swap.outAnimation.finished.then(drop, drop);
    else drop();
    swap.inAnimation.finished.then(
      () => swapping.current === token && delete field.dataset.aiSwap,
      () => {}
    );
  });
  // The value on every commit; the scroll only from the control's scroll
  // events, which follow every move (typing, a value set, a clamp). Reading
  // it on each commit would lay the page out each time (a slider's drag).
  const scroll = useRef({ left: 0, top: 0 });
  const track = () => {
    const c = controlRef.current;
    before.current = c ? { value: readValue(c), ...scroll.current } : null;
  };
  useLayoutEffect(track);
  // Typing that doesn't re-render (an uncontrolled field), and scrolling, move what the swap starts from.
  useEffect(() => {
    const control = controlRef.current;
    if (!control) return;
    const onScroll = () => {
      scroll.current = { left: control.scrollLeft, top: control.scrollTop };
      track();
    };
    control.addEventListener('input', track);
    control.addEventListener('scroll', onScroll);
    return () => {
      control.removeEventListener('input', track);
      control.removeEventListener('scroll', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `track` reads refs and `readValue`, a pure reader
  }, [controlRef]);
  useEffect(() => () => face.current?.remove(), []);

  const noteId = `${id}-ai-note`;
  const noteText =
    aiState === 'filled' ? t.filled : aiState === 'edited' ? t.edited : null;
  const suggestion =
    aiState === 'suggested' && aiSuggestion
      ? `${t.suggested}: ${aiSuggestion}`
      : null;
  // The revert's room is kept whenever it can show, so it never re-wraps or moves the text.
  const reserved = !!onRevert && !disabled && !readOnly;
  const revertible = reserved && filledish(aiState);

  // A revert button holding focus as it leaves hands focus to the field.
  const revertFocused = useRef(false);
  useLayoutEffect(() => {
    if (revertible || !revertFocused.current) return;
    revertFocused.current = false;
    const active = document.activeElement;
    if (!active || active === document.body)
      focusRef.current?.focus({ preventScroll: true });
  }, [revertible, focusRef]);

  const revertButton = revertible ? (
    <IconButton
      className="cds-text-input__toggle cds-field-ai-revert"
      frame="ghost"
      size={size === 'lg' ? 'lg' : 'md'}
      label={t.revert}
      align="bottom-end"
      onFocus={() => void (revertFocused.current = true)}
      // A blur from the button's removal leaves the mark set: it is gone, not left.
      onBlur={(e) =>
        void (e.currentTarget.isConnected && (revertFocused.current = false))
      }
      onClick={() => {
        // The button leaves with the fill: a focused one hands focus to the field first.
        const target = focusRef.current;
        if (target && document.activeElement?.closest('.cds-field-ai-revert'))
          target.focus({ preventScroll: true });
        onRevert?.();
      }}>
      <Undo size={iconSizeFor(size)} />
    </IconButton>
  ) : null;
  const revert =
    revertButton ??
    (reserved ? (
      <span className="cds-field-ai-room" aria-hidden="true" />
    ) : null);

  const note = (
    <>
      {noteText && (
        <span id={noteId} className="cds-field-visually-hidden">
          {noteText}
        </span>
      )}
      <span
        ref={liveRef}
        className="cds-field-visually-hidden"
        aria-live="polite"
        aria-atomic="true"
      />
    </>
  );

  return {
    /** The message line's helper: the suggestion while suggested. */
    helperText: suggestion ?? helperText,
    /** Joined into the control's description. */
    describedBy: noteText ? noteId : undefined,
    note,
    /** The trailing control: the revert button, or its room while it isn't shown. */
    revert,
    /** The revert button alone, for a field that lays it over a room of its own. */
    revertButton,
    /** The revert's room is kept. */
    reserved,
  };
}
