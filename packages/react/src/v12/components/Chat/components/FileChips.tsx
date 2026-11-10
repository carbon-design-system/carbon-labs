/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { bezierEase } from '@carbon-labs/v12-motion';
import {
  animateLayout,
  durationStepForDistance,
  motionTokens,
  playSoftEdge,
  stepDown,
  toEasing,
} from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import { Document } from '@carbon-labs/react-motion-icons';
import { useLatest, useRovingFocus } from '@carbon-labs/react-selection-kit';
import { disclosureArrival } from '@carbon-labs/react-disclosure';
import { TagSet, type TagSetTag } from '@carbon-labs/react-tag-set';
import './chat.scss';

/* ============================================================================
 * FileChips: the prompt's attachments, a TagSet of DismissibleTags.
 *
 *   arrive   a chip opens its space sideways by travel, entrance-productive, its
 *            content moving with the opening under a soft edge; the first chip
 *            opens the row in the same move
 *   leave    the TagSet's dismissal; the last chip closes the row with it
 *   focus    one tab stop, arrows between the closes
 *   reduced  no travel: a chip fades in and goes at once
 * ========================================================================== */

export interface ChipFile {
  id: string;
  name: string;
}

/** FileChips' words, each a prop with an English default. */
export interface FileChipsWords {
  /** The row's accessible name. Default "Attachments". */
  attachmentsLabel?: string;
  /** A chip's close button. Default "Remove". */
  removeFileButtonLabel?: string;
  /** A chip's close button's tooltip when its name is cut short. Default "Remove file". */
  removeFileTooltipLabel?: string;
}

export interface FileChipsProps extends FileChipsWords {
  files: ChipFile[];
  onRemove?: (id: string) => void;
  className?: string;
  /** Where focus goes once the last chip is removed by keyboard. */
  onEmptied?: () => void;
  /** Slow motion. Default 1. */
  timeScale?: number;
}

/** How far the row tucks under the field while it's shut (its margin), px. */
const ROW_TUCK = 12;
const D = motionTokens.duration;
const ease = (name: 'entrance' | 'exit') =>
  `cubic-bezier(${toEasing({ name, mode: 'productive' }).join(',')})`;
const curve = (name: 'entrance' | 'exit') =>
  bezierEase(toEasing({ name, mode: 'productive' }));
/** A chip on screen: the set's own, not its measuring copy or a dismissed chip's copy (both inert). */
const CHIP = '[data-file-id]:not([inert], [inert] *)';

/** The row's soft bottom edge while its height moves (`min(16px, h, H − h)`, H its open height): the clip's. */
function clipRow(row: HTMLElement, open: number) {
  row.style.overflow = 'hidden';
  row.style.maskImage = `linear-gradient(to bottom, #000 calc(100% - min(var(--cds-motion-soft-edge, 16px), 100%, ${open}px - 100%)), transparent)`;
}
function unclipRow(row: HTMLElement) {
  row.style.removeProperty('overflow');
  row.style.removeProperty('mask-image');
}

// A chip opening its space, `w` px and its `gap`, over `ms`: its end margin from −(w + gap) to 0 under
// a soft trailing edge, its content arriving as the disclosure's does.
function openChip(
  el: HTMLElement,
  w: number,
  gap: number,
  ms: number,
  timeScale: number
) {
  const fn = curve('entrance');
  el.animate(
    { marginInlineEnd: [`${-(w + gap)}px`, '0px'] },
    { duration: ms, easing: ease('entrance') }
  );
  const arrive = disclosureArrival(el, ms, { timeScale });
  el.animate(
    [{ transform: `translateX(${-arrive.distance}px)` }, { transform: 'none' }],
    {
      duration: arrive.duration,
      delay: arrive.delay,
      easing: arrive.easing,
      fill: 'backwards',
    }
  );
  const offset = (t: number) =>
    -arrive.distance *
    (1 - fn(Math.min(1, Math.max(0, (t - arrive.delay) / arrive.duration))));
  const total = Math.max(ms, arrive.delay + arrive.duration);
  playSoftEdge(el, total, { w, h: el.offsetHeight }, (q) => {
    const t = q * total;
    // The chip's part of the opened space (the gap opens first).
    const shown = Math.max(0, (w + gap) * fn(Math.min(1, t / ms)) - gap);
    return [
      {
        side: 'right',
        pos: shown - offset(t),
        d: Math.min(w - shown, shown),
        extent: w,
      },
    ];
  });
}

export function FileChips({
  files,
  onRemove,
  onEmptied,
  attachmentsLabel = 'Attachments',
  removeFileButtonLabel = 'Remove',
  removeFileTooltipLabel = 'Remove file',
  timeScale = 1,
  className,
}: FileChipsProps) {
  const { reduced } = useFeedbackMotion();
  // The row stays while its last chip leaves: it closes with it.
  const [present, setPresent] = useState(files.length > 0);
  if (files.length > 0 && !present) setPresent(true);
  if (files.length === 0 && present && reduced) setPresent(false);
  const rowRef = useRef<HTMLDivElement>(null);
  /** The chips that have arrived (or were there at the first paint). */
  const entered = useRef(new Set(files.map((f) => f.id)));
  /** The row's open height, read while it has chips: where its close starts. */
  const openH = useRef(0);
  /** The row is opening from this height (px): the next chips' arrival opens it too, on one clock. */
  const rowFrom = useRef<number | null>(null);
  const live = useLatest({
    timeScale,
    reduced,
    count: files.length,
    onRemove,
    onEmptied,
  });

  // The chips that have just come in: each opens its space; the row too, if it is opening.
  // It reads only refs, so it's one function for the component's life.
  const arrivals = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    const { timeScale: k, reduced: red } = live.current;
    const fresh = Array.from(row.querySelectorAll<HTMLElement>(CHIP)).filter(
      (el) => !entered.current.has(el.dataset.fileId!)
    );
    fresh.forEach((el) => entered.current.add(el.dataset.fileId!));
    const from = rowFrom.current;
    rowFrom.current = null;
    if (red || (!fresh.length && from === null)) return;
    // The set's own fade-in gives way to the opening.
    fresh.forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
    const sizes = fresh.map((el) => {
      const prev = el.previousElementSibling;
      const gap =
        prev && prev.matches(CHIP)
          ? parseFloat(getComputedStyle(el.parentElement!).columnGap) || 0
          : 0;
      return { el, w: el.getBoundingClientRect().width, gap };
    });
    const rowH = row.getBoundingClientRect().height;
    // One motion on one clock: the step of the farthest travel in it.
    const travel = Math.max(
      0,
      ...sizes.map((s) => s.w + s.gap),
      from !== null ? rowH + ROW_TUCK - from : 0
    );
    const ms = D[durationStepForDistance(travel)] * k;
    if (from !== null) {
      const root = (row.closest('.cds-prompt') as HTMLElement | null) ?? row;
      clipRow(row, rowH);
      const tuck = (h: number) => `${-ROW_TUCK * (1 - h / rowH)}px`;
      const { animation } = animateLayout(
        root,
        row,
        {
          blockSize: [`${from}px`, `${rowH}px`],
          marginBlockEnd: [tuck(from), '0px'],
        },
        { ms, easing: ease('entrance'), reason: 'attachments' }
      );
      animation.finished.then(
        () => unclipRow(row),
        () => {}
      );
    }
    for (const s of sizes) openChip(s.el, s.w, s.gap, ms, k);
  }, [live]);

  // A chip the set adds later (after its own reflow): seen as it lands, before the paint.
  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!present || !row || typeof MutationObserver === 'undefined') return;
    const mo = new MutationObserver(() => arrivals());
    mo.observe(row, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [present, arrivals]);

  // The row: opened by the first chip, closed by the last.
  const wasOpen = useRef(files.length > 0);
  useLayoutEffect(() => {
    const row = rowRef.current;
    const open = files.length > 0;
    const ids = new Set(files.map((f) => f.id));
    entered.current.forEach((id) => !ids.has(id) && entered.current.delete(id));
    const was = wasOpen.current;
    wasOpen.current = open;
    if (!row) return;
    if (open) {
      if (!was) {
        // Opening: from shut, or from where its closing had got to.
        const running = row.getAnimations().length > 0;
        const from = running ? row.getBoundingClientRect().height : 0;
        row.getAnimations().forEach((a) => a.cancel());
        row.style.removeProperty('block-size');
        row.style.removeProperty('margin-block-end');
        unclipRow(row);
        rowFrom.current = from;
        arrivals();
      }
      openH.current = row.getBoundingClientRect().height;
      return;
    }
    if (!was || reduced) return;
    // Closing with its last chip, one step faster, exit-productive.
    const h = openH.current;
    const root = (row.closest('.cds-prompt') as HTMLElement | null) ?? row;
    const ms = D[stepDown(durationStepForDistance(h + ROW_TUCK))] * timeScale;
    clipRow(row, h);
    const { animation } = animateLayout(
      root,
      row,
      {
        blockSize: [`${h}px`, '0px'],
        marginBlockEnd: ['0px', `${-ROW_TUCK}px`],
      },
      { ms, easing: ease('exit'), reason: 'attachments' }
    );
    animation.finished.then(
      () => {
        // Held shut until React drops it (no full-height frame between).
        row.style.blockSize = '0px';
        row.style.marginBlockEnd = `${-ROW_TUCK}px`;
        setPresent(false);
      },
      () => {}
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- on the files only
  }, [files]);

  // One tab stop, ← / → between the chips' closes, Home / End.
  useRovingFocus(rowRef, { items: `${CHIP} button` });

  if (!present) return null;
  const tags: TagSetTag[] = files.map((f) => ({
    id: f.id,
    label: f.name,
    renderIcon: Document,
    title: removeFileButtonLabel,
    dismissTooltipLabel: removeFileTooltipLabel,
    dismissTooltipAlignment: 'top',
    onClose: (e) => {
      // By keyboard: Delete, Backspace, or Enter / Space on the close (a click with no pointer).
      const byKeyboard = e.type === 'keydown' || e.detail === 0;
      if (byKeyboard && live.current.count === 1) live.current.onEmptied?.();
      live.current.onRemove?.(f.id);
    },
    ...{ 'data-file-id': f.id },
  }));
  return (
    <div
      ref={rowRef}
      className={['cds-file-chips', className].filter(Boolean).join(' ')}
      role="group"
      aria-label={attachmentsLabel}>
      <TagSet multiline tags={tags} timeScale={timeScale} />
    </div>
  );
}
FileChips.displayName = 'FileChips';
