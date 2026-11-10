/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useEffect, useRef, useState, type FocusEvent } from 'react';
import { motionTokens } from '@carbon-labs/v12-motion';
import { SelectItem, SelectList } from '@carbon-labs/react-select-list';
import type { SelectionSize } from '@carbon-labs/react-selection-kit';
import { useChatVariant, type ChatVariant } from './context';
import './chat-surface.scss';

/* ============================================================================
 * Suggestions: prompts to start from, under the prompt.
 *
 *   rows     a SelectList with no value: the rollover glow and a label step on
 *            hover; arrows, Home, End and typeahead move focus; Enter, Space or
 *            a click chooses
 *   choose   the selector grows in from the row's center, then the choice is
 *            handed on once it has landed
 *   reduced  the selection kit's
 * ========================================================================== */

export interface Suggestion {
  /** A key; default the text. */
  id?: string;
  /** The start, in primary text. */
  text: string;
  /** The rest, in secondary text, on the same line. */
  secondary?: string;
}

export interface SuggestionsProps {
  items: Suggestion[];
  /** Called with the chosen suggestion once its mark has landed: fill the prompt, or send it. */
  onChoose: (suggestion: Suggestion, index: number) => void;
  /** The list's accessible name. Default "Suggestions". */
  label?: string;
  /** The rows' control size (the kit's). Default `md`: 32px rows. */
  size?: SelectionSize;
  /** The selector's look, the kit's. Default the enclosing ChatShell's (`inverse`). */
  variant?: ChatVariant;
  /** Multiplies every duration (a lab's slow motion). Default 1. */
  timeScale?: number;
  className?: string;
}

export function Suggestions({
  items,
  onChoose,
  label = 'Suggestions',
  size = 'md',
  variant,
  timeScale = 1,
  className,
}: SuggestionsProps) {
  const look = useChatVariant(variant);
  const [value, setValue] = useState<number | null>(null);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // The mark goes when focus leaves for good — not while the list is on its
  // way out (the dock makes it inert, which drops focus).
  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    const to = e.relatedTarget as Node | null;
    if (to && e.currentTarget.contains(to)) return;
    if (e.currentTarget.closest('[inert]')) return;
    setValue(null);
  };

  return (
    <SelectList
      className={['cds-chat-suggestions', className].filter(Boolean).join(' ')}
      label={label}
      activation="manual"
      fit="fill"
      size={size}
      variant={look}
      selectedWeight={false}
      motion={{ timeScale, drag: false }}
      value={value}
      onChange={({ index }) => {
        setValue(index);
        window.clearTimeout(timer.current);
        // Handed on once the mark has landed (its arrival's clock).
        timer.current = window.setTimeout(
          () => onChoose(items[index]!, index),
          motionTokens.duration['fast-02'] * timeScale
        );
      }}
      onBlur={onBlur}>
      {items.map((s, i) => (
        <SelectItem
          key={s.id ?? s.text}
          value={i}
          text={s.text}
          secondaryLabel={s.secondary}
        />
      ))}
    </SelectList>
  );
}
Suggestions.displayName = 'Suggestions';
