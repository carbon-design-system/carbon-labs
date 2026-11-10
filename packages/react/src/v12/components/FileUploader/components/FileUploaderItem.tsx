/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import { playContentSwap } from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import {
  Close,
  WarningFilled,
  type MotionIconHandle,
} from '@carbon-labs/react-motion-icons';
import {
  useDisclosureBody,
  useDisclosureMoves,
} from '@carbon-labs/react-disclosure';
import { ProgressRing } from '@carbon-labs/react-progress-ring';
import { IconButton, Tooltip } from '@carbon-labs/react-tooltip';
import { joinArrival, leaveWithCopy } from './arrival';
import { inertProps } from '@carbon-labs/react-util';
import './file-uploader.scss';

/* ============================================================================
 * FileUploaderItem — Carbon v11's FileUploaderItem (and its Filename status
 * slot) on the kit's surface and motion
 * ============================================================================
 *
 * v11's API: `name`, `status` ('uploading' | 'complete' | 'edit'),
 * `iconDescription`, `invalid`, `errorSubject`, `errorBody`, `size`
 * ('sm' | 'md' | 'lg'), `uuid`, `disabled`, `onDelete(evt, { uuid })`; the
 * rest of the props on the item's surface. v11's markup roles: the status
 * icon's name, the remove button named "<iconDescription> - <name>" and
 * described by the error, the error as an alert, a long name in a tooltip.
 *
 * The kit adds:
 *
 *   surface   the quiet surface (`--cds-surface`), 8px corners; invalid, a
 *             2px error ring inside the edge and the error under a
 *             `--cds-surface-divider` hairline
 *   arrive    the item opens its place in the list (a disclosure move: the
 *             travel's step, the content following from half the open), so
 *             what's below moves with it; items added together open on a
 *             stagger (arrival.ts). `arrive={false}`: it is simply there
 *   status    one slot, two faces. Uploading and complete are one mark, the
 *             kit's ProgressRing (16px): with `progress` (a known size) the
 *             ring fills by it; without, it is the kit's Spinner (an unknown
 *             size, v11's Filename). Complete is that mark changing in place:
 *             the ring completes, then the status hand-off: the ring (or the
 *             spinner) shrinks 4px, the success disc grows from 4px under its
 *             size, and the check draws on. The other face is the remove button
 *             (edit), with v11's warning mark before it when invalid. A
 *             change between the two faces is the content swap in place:
 *             the old face fades fully out, then the new fades in, no
 *             travel; the warning mark plays its motion-icon once it has
 *             landed
 *   error     the error opens under the name as its own disclosure body, so
 *             the item grows on the travel's step; the new face waits for
 *             that move to land (the swap defers to the layout transaction)
 *   leave     removed from the app's list, a copy holds its place and
 *             closes it, one step faster; several at once stagger out first
 *   reduced   no travel and no stagger; faces snap and marks don't beat
 * ========================================================================== */

export type FileUploaderItemStatus = 'uploading' | 'edit' | 'complete';
export type FileUploaderItemSize = 'sm' | 'md' | 'lg';

export interface FileUploaderItemProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children'
> {
  /** Specify whether file uploader item is disabled. */
  disabled?: boolean;
  /** Error message body for an invalid file upload. */
  errorBody?: string;
  /** Error message subject for an invalid file upload. */
  errorSubject?: string;
  /** Description of the status icon, and the start of the remove button's name. Default "Uploading file" (v11). */
  iconDescription?: string;
  /** Specify if the currently uploaded file is invalid. */
  invalid?: boolean;
  /** Name of the uploaded file. */
  name?: string;
  /** v11: accepted, not used by the item. */
  onAddFiles?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Called when the remove button is activated: `onDelete(evt, { uuid })`. */
  onDelete?: (
    event: SyntheticEvent<HTMLElement>,
    opts: { uuid: string }
  ) => void;
  /** 'sm' (32px), 'md' (40px) or 'lg' (48px, default). */
  size?: FileUploaderItemSize;
  /** Status of the file upload. Default 'uploading'. */
  status?: FileUploaderItemStatus;
  /** Unique identifier for the file object. */
  uuid?: string;
  /** Open its place in the list as it mounts (default true). False: it is simply there. */
  arrive?: boolean;
  /**
   * How much of the file has uploaded, 0–100, when its size is
   * known. The uploading mark is then a ring that fills by it; left out, it
   * is the spinner (an unknown size), as v11's.
   */
  progress?: number;
}

/** The slot's faces: the progress mark (uploading, then complete, one mark changing in place), or the remove button. */
type Face = 'progress' | 'edit' | 'edit-invalid';

const faceOf = (status: FileUploaderItemStatus, invalid: boolean): Face =>
  status === 'edit' ? (invalid ? 'edit-invalid' : 'edit') : 'progress';

/** The row's height by size, plus the 8px gap under it: the arrival stagger's pitch. */
const PITCH: Record<FileUploaderItemSize, number> = { sm: 40, md: 48, lg: 56 };

const noop = () => {};

/**
 * The content swap in place: the old face fades fully out, then the new
 * fades in, with no travel (`distance: 0`; a status changes where it is).
 * Reduced motion: a snap.
 */
function swapInPlace(
  out: HTMLElement | null,
  incoming: HTMLElement,
  timeScale: number,
  reduced: boolean
) {
  return playContentSwap({
    out,
    in: incoming,
    axis: 'y',
    direction: 1,
    distance: 0,
    timeScale,
    reduced,
  });
}

export function FileUploaderItem({
  uuid,
  name,
  status = 'uploading',
  iconDescription = 'Uploading file',
  onDelete = noop,
  onAddFiles: _onAddFiles,
  invalid = false,
  errorSubject,
  errorBody,
  size = 'lg',
  className,
  disabled = false,
  arrive = true,
  progress,
  ...other
}: FileUploaderItemProps) {
  void _onAddFiles;
  const { reduced, timeScale } = useFeedbackMotion();
  const generatedId = useId();
  const id = uuid || generatedId;
  const errorId = `${generatedId}-error`;

  /* ── the row's place: arriving, and leaving ─────────────────────────── */

  const rowRef = useRef<HTMLDivElement>(null);
  const listOf = useCallback((body: HTMLElement) => {
    // The row's own list, for the row and the error body inside it.
    const row = body.closest<HTMLElement>('[data-file-row]');
    return row?.parentElement ?? null;
  }, []);
  const moves = useDisclosureMoves(listOf, {
    reason: (n) => (n > 1 ? 'file-arrive-batch' : 'file-arrive'),
  });
  // Arriving: shut on the first render, opened by its batch.
  const [open, setOpen] = useState(() => !arrive || reduced);
  const row = useDisclosureBody(rowRef, open, moves, reduced);

  useLayoutEffect(() => {
    const el = rowRef.current;
    const list = el?.parentElement;
    let cancel = noop;
    if (el && list && !open) {
      cancel = joinArrival(list, el, () => setOpen(true), {
        pitch: PITCH[size],
        timeScale,
      });
    }
    return () => {
      cancel();
      // Leaving after it arrived: a copy closes its place.
      if (
        el &&
        el.hasAttribute('data-open') &&
        !el.hasAttribute('data-reduced')
      )
        leaveWithCopy(el, { timeScale });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- on mount: an item arrives once
  }, []);

  /* ── the error: its own body under the name ─────────────────────────── */

  const showError = invalid && !!errorSubject;
  const errorRef = useRef<HTMLDivElement>(null);
  const errorBodyState = useDisclosureBody(errorRef, showError, moves, reduced);
  // The words stay while the body closes over them.
  const [lastError, setLastError] = useState<{
    subject?: string;
    body?: string;
  }>({});
  if (
    showError &&
    (lastError.subject !== errorSubject || lastError.body !== errorBody)
  ) {
    setLastError({ subject: errorSubject, body: errorBody });
  }
  const errorShown = showError || errorBodyState.present;

  /* ── the status slot: one face at a time, out then in ───────────────── */

  const face = faceOf(status, invalid);
  const [faces, setFaces] = useState<{
    face: Face;
    leaving: Face | null;
    key: number;
  }>({
    face,
    leaving: null,
    key: 0,
  });
  if (faces.face !== face)
    setFaces({ face, leaving: faces.face, key: faces.key + 1 });

  const slotRef = useRef<HTMLSpanElement>(null);
  const warnRef = useRef<MotionIconHandle>(null);
  useLayoutEffect(() => {
    if (!faces.key) return;
    const slot = slotRef.current;
    const inEl = slot?.querySelector<HTMLElement>(
      `[data-face="${faces.face}"]`
    );
    if (!slot || !inEl) return;
    const outEl = faces.leaving
      ? slot.querySelector<HTMLElement>(`[data-face="${faces.leaving}"]`)
      : null;
    const swap = swapInPlace(outEl, inEl, timeScale, reduced);
    const key = faces.key;
    const done = () =>
      setFaces((f) => (f.key === key ? { ...f, leaving: null } : f));
    if (swap.outAnimation) swap.outAnimation.finished.then(done, noop);
    else done();
    // The warning mark's beat, once it has landed.
    if (faces.face === 'edit-invalid' && !reduced) {
      swap.inAnimation.finished.then(() => void warnRef.current?.play(), noop);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- per change of face
  }, [faces.key]);

  /* ── a long name: its tooltip (v11) ─────────────────────────────────── */

  const textRef = useRef<HTMLParagraphElement>(null);
  const [ellipsis, setEllipsis] = useState(false);
  useLayoutEffect(() => {
    const el = textRef.current;
    setEllipsis(!!el && el.offsetWidth < el.scrollWidth);
  }, [name, size]);

  const remove = (evt: SyntheticEvent<HTMLElement>) => {
    if (status === 'edit') onDelete(evt, { uuid: id });
  };

  const renderFace = (f: Face, leaving: boolean): ReactNode => {
    const common = {
      'data-face': f,
      className: 'cds-file__face',
      ...(leaving ? { 'aria-hidden': true, ...inertProps(true) } : {}),
    };
    if (f === 'progress')
      return (
        <span key={f} {...common}>
          <ProgressRing
            size={16}
            label={iconDescription}
            hideLabel
            value={progress}
            status={status === 'complete' ? 'finished' : 'active'}
            className="cds-file__ring"
          />
        </span>
      );
    return (
      <span key={f} {...common}>
        {f === 'edit-invalid' && (
          <span className="cds-file__invalid-mark">
            <WarningFilled ref={warnRef} size={16} />
          </span>
        )}
        <IconButton
          frame="ghost"
          size={size === 'sm' ? 'xs' : 'sm'}
          corners="full"
          align="bottom"
          className="cds-file__close"
          label={`${iconDescription} - ${name ?? ''}`}
          disabled={disabled}
          aria-describedby={invalid && errorSubject ? errorId : undefined}
          onClick={remove}>
          <Close size={16} />
        </IconButton>
      </span>
    );
  };

  const nameText = (
    <p ref={textRef} title={name} className="cds-file__name">
      {name}
    </p>
  );

  return (
    <div
      ref={rowRef}
      className="cds-disclosure__body cds-file__row"
      data-file-row=""
      {...row.bodyProps}>
      <div className="cds-disclosure__clip">
        <div className="cds-disclosure__content cds-file__row-content">
          <span
            {...other}
            className={[
              'cds-file__selected-file',
              `cds-file__selected-file--${size}`,
              invalid && 'cds-file__selected-file--invalid',
              disabled && 'cds-file__selected-file--disabled',
              className,
            ]
              .filter(Boolean)
              .join(' ')}>
            <span className="cds-file__name-cell">
              {ellipsis ? (
                <Tooltip
                  label={name}
                  align="bottom"
                  className="cds-file__name-tooltip">
                  <button type="button" className="cds-file__name-button">
                    {nameText}
                  </button>
                </Tooltip>
              ) : (
                nameText
              )}
            </span>
            <span ref={slotRef} className="cds-file__state">
              {faces.leaving && renderFace(faces.leaving, true)}
              {renderFace(faces.face, false)}
            </span>
            <div
              ref={errorRef}
              className="cds-disclosure__body cds-file__error-body"
              {...errorBodyState.bodyProps}>
              <div className="cds-disclosure__clip">
                <div className="cds-disclosure__content">
                  {errorShown && (
                    <div
                      className="cds-file__requirement"
                      role={showError ? 'alert' : undefined}
                      id={errorId}>
                      <div className="cds-file__requirement-title">
                        {lastError.subject}
                      </div>
                      {lastError.body && (
                        <p className="cds-file__requirement-supplement">
                          {lastError.body}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </span>
        </div>
      </div>
    </div>
  );
}
