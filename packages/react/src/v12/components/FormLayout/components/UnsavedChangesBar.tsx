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
  useState,
  type ReactNode,
} from 'react';
import {
  distanceTokens,
  durationStepForDistance,
  motionTokens,
  SNAP_FRAME,
  stepDown,
  usePrefersReducedMotion,
  useSnapSurface,
  type SnapOrigin,
  type SnapProfile,
} from '@carbon-labs/v12-motion';
import { Button } from '@carbon-labs/react-button';
import { StatusMark } from '@carbon-labs/react-feedback';
import { SwapSlot } from '@carbon-labs/react-feedback';
import { RollText } from '@carbon-labs/react-roll-text';
import { snapEntranceContentMs } from '@carbon-labs/react-side-panel';
import './unsaved-changes-bar.scss';
import { cx } from '@carbon-labs/react-util';
import { isComposing } from '@carbon-labs/react-util';

/* ============================================================================
 * UnsavedChangesBar: Save and Discard, joined to the bottom of the page or
 * panel while a form has changes.
 *
 *   in       the snap from its bottom edge, opaque from 4px (the sliver guard)
 *   content  8px up into place from the first frame, a token past the bar
 *   out      its top edge folds back down; the content holds still
 *   swap     the message and actions swap in place (confirm, error)
 *   still    it arrives on the first change and holds still after
 *   reduced  the snap's reduced fade; swaps snap
 *
 * API: dirty, onSave, onDiscard, saving, changes, confirmDiscardFrom, error.
 * ========================================================================== */

export interface UnsavedChangesBarProps {
  /** The form has changes: the bar shows. */
  dirty: boolean;
  /** Save pressed. */
  onSave: () => void;
  /** Discard pressed (or Escape), after the confirm when there is one. */
  onDiscard: () => void;
  /** A save is running: the bar holds, Save busy, until it ends. */
  saving?: boolean;
  /** How many fields changed: the message counts them. */
  changes?: number;
  /** Discard and Escape ask first from this many changes. Default: never ask. */
  confirmDiscardFrom?: number;
  /** A failed save's message: shown in place of the count; the bar holds. */
  error?: ReactNode;
  /** Focus moves to Save as the bar arrives. Default false. */
  focusSave?: boolean;
  /** Escape in the form discards. Default true. */
  escapeDiscards?: boolean;
  /** The region's name. Default "Unsaved changes". */
  label?: string;
  saveText?: string;
  discardText?: string;
  /** Slow motion: the snap at 1 / timeScale. Default 1. */
  timeScale?: number;
  className?: string;
}

/** The bar's snap: its height from nothing at its bottom edge, full width, folding back down; the sliver guard. */
export function unsavedChangesBarProfile(
  bar: HTMLElement | null,
  leaving = false
): SnapProfile {
  const h = bar?.offsetHeight || 56;
  const tin = durationStepForDistance(h);
  const tout = stepDown(tin);
  return {
    from: 1,
    fromX: 1,
    fromY: 0,
    toOutX: 1,
    in: tin,
    out: tout,
    ease: 'entrance-productive',
    exitEase: 'exit-productive',
    // Joined to the bottom edge: opaque from 4px, so no sliver shows.
    sliver: true,
    blinkOff: false,
    exitMode: 'collapse',
    collapseAxis: 'y',
    contentAxis: 'y',
    // In: the content travels 8px, landing just after the bar; out, it holds still.
    contentOffset: leaving ? 0 : (2 * distanceTokens.sm) / h,
    contentIn: snapEntranceContentMs(motionTokens.duration[tin]),
  };
}

export function UnsavedChangesBar({
  dirty,
  onSave,
  onDiscard,
  saving = false,
  changes,
  confirmDiscardFrom,
  error,
  focusSave = false,
  escapeDiscards = true,
  label = 'Unsaved changes',
  saveText = 'Save',
  discardText = 'Discard',
  timeScale = 1,
  className,
}: UnsavedChangesBarProps) {
  const open = dirty || saving;
  const [present, setPresent] = useState(open);
  // What sent it away, for the announcement; cleared as it comes back.
  const [last, setLast] = useState<'save' | 'discard' | null>(null);
  if (open && !present) {
    setPresent(true);
    setLast(null);
  }
  const [confirming, setConfirming] = useState(false);
  if (!open && confirming) setConfirming(false);

  const dock = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const save = useRef<HTMLElement>(null);
  const keep = useRef<HTMLElement>(null);
  const discardBtn = useRef<HTMLElement>(null);
  // Where focus came from into the bar: it goes back there when the bar leaves.
  const returnTo = useRef<HTMLElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const leaving = useRef(false);
  const surface = useSnapSurface(bar, {
    profile: () => unsavedChangesBarProfile(bar.current, leaving.current),
    reduced,
    timeScale,
  });
  const origin = (): SnapOrigin => {
    const el = bar.current;
    return { x: (el?.offsetWidth ?? 0) / 2, y: el?.offsetHeight ?? 0 };
  };

  // What the snap last played: a repeat of the same effect (a remount check) plays nothing.
  const shown = useRef<boolean | null>(null);
  useLayoutEffect(() => {
    const el = bar.current;
    if (!el || shown.current === open) return;
    const first = shown.current === null;
    shown.current = open;
    if (first) {
      surface.set(open);
      return;
    }
    if (open) {
      leaving.current = false;
      surface.open({ origin: origin() });
      if (focusSave) save.current?.focus({ preventScroll: true });
      return;
    }
    leaving.current = true;
    if (el.contains(document.activeElement)) {
      const back = returnTo.current;
      if (back?.isConnected) back.focus({ preventScroll: true });
      else (document.activeElement as HTMLElement | null)?.blur();
    }
    let live = true;
    void surface.close({ origin: origin() }).then((done) => {
      if (done && live) setPresent(false);
    });
    return () => {
      live = false;
    };
    // The snap reads its options when it plays.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const discard = () => {
    if (saving) return;
    if (
      !confirming &&
      confirmDiscardFrom != null &&
      (changes ?? 1) >= confirmDiscardFrom
    ) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    setLast('discard');
    onDiscard();
  };
  const doSave = () => {
    if (saving) return;
    setLast('save');
    onSave();
  };

  // Asking: focus goes to Keep editing, the safe answer; answered, back to Discard.
  const asked = useRef(false);
  useLayoutEffect(() => {
    if (confirming) {
      asked.current = true;
      keep.current?.focus({ preventScroll: true });
    } else if (asked.current) {
      asked.current = false;
      if (open && bar.current?.contains(document.activeElement))
        discardBtn.current?.focus({ preventScroll: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirming]);

  // Escape in the form that no field handled: ask, or discard. Asking: keep editing.
  const latest = useRef({ discard, confirming, open, escapeDiscards, saving });
  useLayoutEffect(() => {
    latest.current = { discard, confirming, open, escapeDiscards, saving };
  });
  useEffect(() => {
    const doc = dock.current?.ownerDocument;
    if (!doc) return;
    // On the document, bubbling: after React's own dispatch, so a field's preventDefault is seen.
    const onKey = (e: KeyboardEvent) => {
      const l = latest.current;
      // While saving there is nothing to discard: the key is left alone for anything else.
      if (
        e.key !== 'Escape' ||
        e.defaultPrevented ||
        isComposing(e) ||
        !l.open ||
        !l.escapeDiscards ||
        l.saving
      )
        return;
      const scope = dock.current?.parentElement;
      const t = e.target instanceof Element ? e.target : null;
      if (!scope || !t || !scope.contains(t)) return;
      if (
        t.closest(
          '[aria-expanded="true"], [role="listbox"], [role="menu"], [role="dialog"]'
        )
      )
        return;
      e.preventDefault();
      if (l.confirming) setConfirming(false);
      else l.discard();
    };
    doc.addEventListener('keydown', onKey);
    return () => doc.removeEventListener('keydown', onKey);
  }, []);

  const mode = confirming ? 'confirm' : error ? 'error' : 'edit';
  const n = changes ?? 0;
  const counted =
    changes != null ? `${n} ${n === 1 ? 'change' : 'changes'}` : 'changes';
  // One polite line for where it stands; read as it changes.
  const announce = confirming
    ? `Discard ${counted}? Keep editing or discard.`
    : saving
      ? 'Saving.'
      : error
        ? typeof error === 'string'
          ? error
          : 'Not saved.'
        : open
          ? `${label}. ${saveText} or ${discardText}.`
          : last === 'save'
            ? 'Changes saved.'
            : last === 'discard'
              ? 'Changes discarded.'
              : '';
  const message =
    mode === 'confirm' ? (
      `Discard ${counted}?`
    ) : mode === 'error' ? (
      <span className="cds-unsaved-bar__error">
        <StatusMark kind="error" size={16} description="Error" />
        <span>{error}</span>
      </span>
    ) : changes != null ? (
      <span className="cds-unsaved-bar__count">
        <RollText text={String(n)} order={n} timeScale={timeScale} />{' '}
        <RollText
          text={n === 1 ? 'unsaved change' : 'unsaved changes'}
          order={n}
          timeScale={timeScale}
        />
      </span>
    ) : (
      label
    );

  return (
    <>
      <div
        ref={dock}
        className={cx('cds-unsaved-bar-dock', className)}
        hidden={!present}
        onFocusCapture={(e) => {
          const from = e.relatedTarget;
          if (from instanceof HTMLElement && !bar.current?.contains(from))
            returnTo.current = from;
        }}>
        <div
          ref={bar}
          className="cds-unsaved-bar"
          role="region"
          aria-label={label}
          data-mode={mode}>
          <span {...SNAP_FRAME} className="cds-unsaved-bar__frame" />
          <div className="cds-unsaved-bar__content">
            <SwapSlot swapKey={mode} className="cds-unsaved-bar__message">
              {message}
            </SwapSlot>
            <SwapSlot
              swapKey={confirming ? 'confirm' : 'edit'}
              className="cds-unsaved-bar__actions">
              {confirming ? (
                <span className="cds-unsaved-bar__buttons">
                  <Button
                    ref={keep}
                    kind="secondary"
                    frame="ghost"
                    size="md"
                    onClick={() => setConfirming(false)}>
                    Keep editing
                  </Button>
                  <Button kind="danger" size="md" onClick={discard}>
                    {discardText}
                  </Button>
                </span>
              ) : (
                <span className="cds-unsaved-bar__buttons">
                  <Button
                    ref={discardBtn}
                    kind="secondary"
                    frame="ghost"
                    size="md"
                    onClick={discard}
                    disabled={saving}>
                    {discardText}
                  </Button>
                  <Button
                    ref={save}
                    kind="primary"
                    size="md"
                    onClick={doSave}
                    busy={saving}>
                    {saveText}
                  </Button>
                </span>
              )}
            </SwapSlot>
          </div>
        </div>
      </div>
      {/* Outside the dock: it is still read once the bar has gone. */}
      <span className="cds-unsaved-bar__live" role="status" aria-live="polite">
        {announce}
      </span>
    </>
  );
}
