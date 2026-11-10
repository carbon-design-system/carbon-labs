/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import type { HTMLAttributes } from 'react';
import { Button } from '@carbon-labs/react-button';
import {
  InlineLoading,
  type InlineLoadingStatus,
} from '@carbon-labs/react-loading';
import './saving-status.scss';

/* ============================================================================
 * SavingStatus: where a form's save stands. "Saving…" with the spinner, then
 * "Saved" with a check and the time, or an error with Retry.
 *
 *   mark     the status hand-off: the spinner shrinks 4px, the disc grows in,
 *            the check or slash draws on. No fades
 *   label    swaps in place, out then in, on the content swap's clocks
 *   reduced  a snap: the mark and the label at once
 *
 * API: IBM Products' Saving: status, the four texts, onRequestSave; plus savedAt.
 * ========================================================================== */

export type SavingStatusStatus = 'default' | 'in-progress' | 'success' | 'fail';

export interface SavingStatusProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /** Default (nothing yet), in progress, success or fail. */
  status: SavingStatusStatus;
  /** Shown before any save. Default none. */
  defaultText?: string;
  /** Default "Saving…". */
  inProgressText?: string;
  /** Default "Saved". */
  successText?: string;
  /** Default "Not saved". */
  failText?: string;
  /** When the last save landed: shown after the success text. */
  savedAt?: Date | number;
  /** The time as shown. Default the hour and minute in the reader's locale. */
  formatTime?: (at: Date) => string;
  /** Retry after a failure: a Retry button shows when given. */
  onRequestSave?: () => void;
  /** Default "Retry". */
  retryText?: string;
}

const STATUS: Record<SavingStatusStatus, InlineLoadingStatus> = {
  default: 'inactive',
  'in-progress': 'active',
  success: 'finished',
  fail: 'error',
};

const shortTime = (at: Date) =>
  at.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

export function SavingStatus({
  status,
  defaultText,
  inProgressText = 'Saving…',
  successText = 'Saved',
  failText = 'Not saved',
  savedAt,
  formatTime = shortTime,
  onRequestSave,
  retryText = 'Retry',
  className,
  ...rest
}: SavingStatusProps) {
  const time = savedAt != null ? formatTime(new Date(savedAt)) : null;
  const text =
    status === 'in-progress'
      ? inProgressText
      : status === 'success'
        ? time
          ? `${successText} ${time}`
          : successText
        : status === 'fail'
          ? failText
          : (defaultText ?? '');
  return (
    <div
      {...rest}
      className={['cds-saving-status', className].filter(Boolean).join(' ')}
      data-status={status}>
      {/* Polite: a save's progress never interrupts. */}
      <InlineLoading
        className="cds-saving-status__state"
        status={STATUS[status]}
        description={text || undefined}
        iconDescription={
          status === 'in-progress'
            ? 'Saving'
            : status === 'success'
              ? 'Saved'
              : status === 'fail'
                ? 'Error'
                : undefined
        }
        aria-live="polite"
        role="status"
      />
      {status === 'fail' && onRequestSave && (
        <Button
          className="cds-saving-status__retry"
          kind="secondary"
          frame="ghost"
          size="sm"
          onClick={onRequestSave}>
          {retryText}
        </Button>
      )}
    </div>
  );
}
