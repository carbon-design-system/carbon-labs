/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { motionTokens } from '@carbon-labs/v12-motion';
import { Close, Edit } from '@carbon-labs/react-motion-icons';
import {
  SelectItem,
  SelectItemDivider,
  SelectList,
} from '@carbon-labs/react-select-list';
import type { SelectionSize } from '@carbon-labs/react-selection-kit';
import { IconButton } from '@carbon-labs/react-tooltip';
import { useChatVariant, type ChatVariant } from './context';
import './chat-surface.scss';
import { isComposing } from '@carbon-labs/react-util';

/* ============================================================================
 * FollowUpCard: a follow-up question above the prompt.
 *
 *   choices  numbered SelectList rows with no value; keys 1 to n choose from
 *            anywhere in the card; the mark lands, then the choice is handed on
 *   other    a row that is a text field; Enter sends what's typed
 *   corners  concentric from the rows out: 8, 12, 16px
 *   arrival  the dock's: out, one layout move, then in
 *   reduced  the selection kit's
 * ========================================================================== */

export interface FollowUpCardProps {
  /** The question. */
  question: ReactNode;
  /** The choices, numbered 1–n (keys 1–9 choose). */
  choices: string[];
  /** Called with the chosen choice, once its mark has landed. */
  onChoose: (choice: string, index: number) => void;
  /** The "Something else" field's placeholder; `false` for no field. Default "Something else". */
  otherLabel?: string | false;
  /** Enter in the "Something else" field, with text. */
  onOther?: (text: string) => void;
  /** Skip (no Skip link without it). */
  onSkip?: () => void;
  /** The close × (none without it). */
  onClose?: () => void;
  /** The close button's name. Default "Close". */
  closeButtonLabel?: string;
  /** Skip's words. Default "Skip". */
  skipButtonText?: string;
  /** Focus the first choice as the card mounts, so keys 1–n work at once. Default false. */
  autoFocus?: boolean;
  /** The rows' control size (the kit's). Default `lg`: 40px rows. */
  size?: SelectionSize;
  /** The selector's look, the kit's. Default the enclosing ChatShell's (`inverse`). */
  variant?: ChatVariant;
  /** Multiplies every duration (a lab's slow motion). Default 1. */
  timeScale?: number;
  className?: string;
}

/** A row's number key, in the row's icon slot (one component per number, so `renderIcon` stays stable). */
const KEYS = new Map<number, ElementType>();
function keyIcon(n: number): ElementType {
  let K = KEYS.get(n);
  if (!K) {
    K = function NumberKey() {
      return (
        <span className="cds-followup__key" aria-hidden="true">
          {n}
        </span>
      );
    };
    KEYS.set(n, K);
  }
  return K;
}

export function FollowUpCard({
  question,
  choices,
  onChoose,
  otherLabel = 'Something else',
  onOther,
  onSkip,
  onClose,
  closeButtonLabel = 'Close',
  skipButtonText = 'Skip',
  autoFocus = false,
  size = 'lg',
  variant,
  timeScale = 1,
  className,
}: FollowUpCardProps) {
  const look = useChatVariant(variant);
  const titleId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const fieldRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState<number | null>(null);
  const [other, setOther] = useState('');
  const [focus, setFocus] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const row = (i: number) =>
    rootRef.current?.querySelector<HTMLElement>(
      `.cds-followup__choices .sel__item[data-index="${i}"]`
    ) ?? null;

  useLayoutEffect(() => {
    if (autoFocus) row(0)?.focus({ preventScroll: true });
    // As it mounts only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = (i: number) => {
    if (value != null) return;
    setValue(i);
    window.clearTimeout(timer.current);
    // Handed on once the mark has landed (its arrival's clock).
    timer.current = window.setTimeout(
      () => onChoose(choices[i]!, i),
      motionTokens.duration['fast-02'] * timeScale
    );
  };

  const onKeyDownCapture = (e: KeyboardEvent<HTMLElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const inField = e.target === fieldRef.current;
    if (inField) {
      const empty = other.length === 0;
      if (e.key === 'Enter' && other.trim()) {
        e.preventDefault();
        onOther?.(other.trim());
      } else if (e.key === 'ArrowUp' && empty) {
        e.preventDefault();
        row(choices.length - 1)?.focus();
      } else if (e.key === 'Escape' && !isComposing(e)) {
        e.preventDefault();
        if (empty) row(choices.length - 1)?.focus();
        else setOther('');
      }
      return;
    }
    // 1–n choose from anywhere else in the card (before the list's typeahead sees them).
    const n = /^[1-9]$/.test(e.key) ? Number(e.key) : 0;
    if (n && n <= choices.length) {
      e.preventDefault();
      e.stopPropagation();
      row(n - 1)?.focus();
      choose(n - 1);
      return;
    }
    // ↓ past the last choice: the field.
    const at = (e.target as Element).closest<HTMLElement>(
      '.cds-followup__choices .sel__item'
    );
    if (
      e.key === 'ArrowDown' &&
      at &&
      Number(at.dataset.index) === choices.length - 1 &&
      fieldRef.current
    ) {
      e.preventDefault();
      e.stopPropagation();
      fieldRef.current.focus();
    }
  };

  return (
    <section
      ref={rootRef}
      className={['cds-followup', className].filter(Boolean).join(' ')}
      aria-labelledby={titleId}
      onKeyDownCapture={onKeyDownCapture}>
      <div className="cds-followup__head">
        <h3 id={titleId} className="cds-followup__title">
          {question}
        </h3>
        {onClose && (
          <IconButton
            label={closeButtonLabel}
            frame="ghost"
            size="sm"
            className="cds-followup__close"
            onClick={onClose}>
            <Close size={16} />
          </IconButton>
        )}
      </div>
      <SelectList
        className="cds-followup__choices"
        aria-labelledby={titleId}
        activation="manual"
        fit="fill"
        size={size}
        variant={look}
        selectedWeight={false}
        motion={{ timeScale, drag: false }}
        value={value}
        onChange={({ index }) => choose(index)}>
        {choices.flatMap((c, i) => [
          ...(i > 0 ? [<SelectItemDivider key={`d${i}`} />] : []),
          <SelectItem
            key={`c${i}`}
            value={i}
            text={c}
            renderIcon={keyIcon(i + 1)}
          />,
        ])}
      </SelectList>
      {otherLabel !== false && (
        <>
          <div className="cds-followup__divider" role="none" />
          <div
            className={`cds-followup__other cds-followup__other--${size}`}
            data-focus={focus || undefined}
            data-filled={other ? '' : undefined}
            data-motion-icon-frame=""
            // A press anywhere on the row but Skip puts the caret in the field.
            onMouseDown={(e) => {
              if ((e.target as Element).closest('button, input')) return;
              e.preventDefault();
              fieldRef.current?.focus();
            }}>
            <Edit
              size={16}
              aria-hidden="true"
              className="cds-followup__other-icon"
            />
            <input
              ref={fieldRef}
              className="cds-followup__field"
              aria-label={otherLabel}
              placeholder={otherLabel}
              value={other}
              onChange={(e) => setOther(e.target.value)}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
            />
            {onSkip && (
              <button
                type="button"
                className="cds-text-button cds-followup__skip"
                onClick={onSkip}>
                {skipButtonText}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
FollowUpCard.displayName = 'FollowUpCard';
