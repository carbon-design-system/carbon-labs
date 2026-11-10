/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { watchTonal } from '@carbon-labs/v12-motion';
import {
  Continue,
  Copy,
  Renew,
  ThumbsDownToggle,
  ThumbsUpToggle,
} from '@carbon-labs/react-motion-icons';
import { AITextReveal } from '@carbon-labs/react-feedback';
import { useRovingFocus } from '@carbon-labs/react-selection-kit';
import {
  IconButton,
  TooltipGroup,
  type IconButtonSize,
} from '@carbon-labs/react-tooltip';
import { useChatVariant, type ChatVariant } from './context';
import { inertProps } from '@carbon-labs/react-util';
import './chat-surface.scss';

/* ============================================================================
 * ChatMessage: one turn of the conversation.
 *
 *   user       a bubble at the end of the column in the chat's variant
 *   assistant  full-width text streamed in by AITextReveal: its skeleton until
 *              the first words, which rise 4px as they land; then each
 *              sentence fades up in place
 *   actions    ChatActions in one TooltipGroup, always laid out: shown on the
 *              latest reply once complete, else on hover or focus
 *   reduced    AITextReveal's
 * ========================================================================== */

export type ChatRole = 'user' | 'assistant';
export type ChatRating = 'up' | 'down' | null;

/** ChatActions' words, each a prop with an English default. */
export interface ChatActionsWords {
  /** The toolbar's name. Default "Response actions". */
  toolbarLabel?: string;
  /** Default "Copy", then "Copied". */
  copyButtonLabel?: string;
  copiedButtonLabel?: string;
  /** Default "Continue". */
  continueButtonLabel?: string;
  /** Default "Retry". */
  retryButtonLabel?: string;
  /** Default "Good response" and "Bad response". */
  goodResponseButtonLabel?: string;
  badResponseButtonLabel?: string;
}

export interface ChatActionsProps extends ChatActionsWords {
  /** What Copy copies. */
  text: string;
  rating?: ChatRating;
  onRate?: (rating: ChatRating) => void;
  onRetry?: () => void;
  /** Continue a stopped reply from where it stopped (no Continue button without it). */
  onContinue?: () => void;
  /** After the text is on the clipboard. */
  onCopy?: () => void;
  /** Default `sm` (32px), the chat's icon button size. */
  size?: IconButtonSize;
}

/** A reply's actions: copy, continue, retry and the two ratings, a toolbar with one tab stop and arrow keys. */
export function ChatActions({
  text,
  rating = null,
  onRate,
  onRetry,
  onContinue,
  onCopy,
  size = 'sm',
  toolbarLabel = 'Response actions',
  copyButtonLabel = 'Copy',
  copiedButtonLabel = 'Copied',
  continueButtonLabel = 'Continue',
  retryButtonLabel = 'Retry',
  goodResponseButtonLabel = 'Good response',
  badResponseButtonLabel = 'Bad response',
}: ChatActionsProps) {
  // "Copied" until the pointer or focus leaves (no timer of its own).
  const [copied, setCopied] = useState(false);
  const rate = (r: Exclude<ChatRating, null>) =>
    onRate?.(rating === r ? null : r);
  const ref = useRef<HTMLDivElement>(null);
  useRovingFocus(ref, { items: '.cds-icon-btn' });
  return (
    <div
      ref={ref}
      className="cds-chat-actions"
      role="toolbar"
      aria-label={toolbarLabel}>
      <TooltipGroup align="bottom">
        <IconButton
          label={copied ? copiedButtonLabel : copyButtonLabel}
          frame="ghost"
          size={size}
          onClick={() => {
            void navigator.clipboard?.writeText(text).catch(() => {});
            setCopied(true);
            onCopy?.();
          }}
          onPointerLeave={() => setCopied(false)}
          onBlur={() => setCopied(false)}>
          <Copy size={16} />
        </IconButton>
        {onContinue && (
          <IconButton
            label={continueButtonLabel}
            frame="ghost"
            size={size}
            onClick={onContinue}>
            <Continue size={16} />
          </IconButton>
        )}
        {onRetry && (
          <IconButton
            label={retryButtonLabel}
            frame="ghost"
            size={size}
            onClick={onRetry}>
            <Renew size={16} />
          </IconButton>
        )}
        {onRate && (
          <>
            <IconButton
              label={goodResponseButtonLabel}
              frame="ghost"
              size={size}
              isSelected={rating === 'up'}
              onClick={() => rate('up')}>
              <ThumbsUpToggle
                size={16}
                toggled={rating === 'up'}
                disableToggle
              />
            </IconButton>
            <IconButton
              label={badResponseButtonLabel}
              frame="ghost"
              size={size}
              isSelected={rating === 'down'}
              onClick={() => rate('down')}>
              <ThumbsDownToggle
                size={16}
                toggled={rating === 'down'}
                disableToggle
              />
            </IconButton>
          </>
        )}
      </TooltipGroup>
    </div>
  );
}

export interface ChatMessageProps {
  role: ChatRole;
  /** A user turn's text. */
  children?: ReactNode;
  /** An assistant turn: what has been generated so far, in order (sentences). */
  chunks?: ReactNode[];
  /** An assistant turn: generation has finished. */
  done?: boolean;
  /** The lines the reply holds before its text arrives (the skeleton's lines). Default 3. */
  lineCount?: number;
  /** The action row under a reply (`ChatActions`). */
  actions?: ReactNode;
  /** `latest`: the actions show once the reply is complete. `hover` (default): on the turn's hover or focus. */
  actionsShown?: 'latest' | 'hover';
  /** The user's bubble: the selection family's look. Default the enclosing ChatShell's (`inverse`). */
  variant?: ChatVariant;
  /** An assistant turn's status row (`TurnStatus`), above the text; with it, the text holds no skeleton lines. */
  status?: ReactNode;
  className?: string;
}

export function ChatMessage({
  role,
  children,
  chunks = [],
  done = false,
  lineCount = 3,
  actions,
  actionsShown = 'hover',
  variant,
  status,
  className,
}: ChatMessageProps) {
  const look = useChatVariant(variant);
  // A tonal bubble takes its hue from where it sits (the core's tonal watcher, for the tonal look only).
  const userRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(
    () =>
      role === 'user' && look === 'tonal'
        ? watchTonal(userRef.current)
        : undefined,
    [role, look]
  );
  if (role === 'user') {
    return (
      <div
        ref={userRef}
        className={[
          'cds-chat-message',
          'cds-chat-message--user',
          `cds-chat-message--${look}`,
          className,
        ]
          .filter(Boolean)
          .join(' ')}>
        {children}
      </div>
    );
  }
  return (
    <div
      className={['cds-chat-message', 'cds-chat-message--assistant', className]
        .filter(Boolean)
        .join(' ')}
      data-done={done || undefined}
      data-actions={actionsShown}>
      {status}
      {/* A turn that ended before its first words (stopped, failed) has no text part. */}
      {!(status != null && done && chunks.length === 0) && (
        <AITextReveal
          chunks={chunks}
          done={done}
          mode="stream"
          overflow="grow"
          rise
          lineCount={status != null ? 0 : lineCount}
          className="cds-chat-message__text"
        />
      )}
      {actions != null && (
        // Laid out from the first frame, so it never moves the turns below.
        <div className="cds-chat-message__actions" {...inertProps(!done)}>
          {actions}
        </div>
      )}
    </div>
  );
}
ChatMessage.displayName = 'ChatMessage';
