/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import { attachRollover } from '@carbon-labs/v12-motion';
import {
  DURATION_FLOOR_MS,
  animateLayout,
  durationStepForDistance,
  motionTokens,
  usePrefersReducedMotion,
  useStagger,
} from '@carbon-labs/v12-motion';
import type { SurfaceAlignment } from '@carbon-labs/v12-motion';
import { Button } from '@carbon-labs/react-button';
import { BURST_MS, useFilterPresence } from '@carbon-labs/react-contained-list';
import { Modal } from '@carbon-labs/react-modal';
import { Popover } from '@carbon-labs/react-popover';
import { RollText } from '@carbon-labs/react-roll-text';
import { useLatest } from '@carbon-labs/react-selection-kit';
import {
  DismissibleTag,
  Tag,
  type DismissibleTagProps,
  type TagCorners,
  type TagProps,
  type TagSize,
} from '@carbon-labs/react-tag';
import { TAG_STAGGER_MS, tagSnapIn, tagSnapOut } from '@carbon-labs/react-tag';
import { TextInput } from '@carbon-labs/react-text-input';
import {
  TAG_KIT,
  TAG_SIZES,
  useDefaultSize,
  useKitProps,
} from '@carbon-labs/react-kit-defaults';
import './tag-set.scss';
import { cx } from '@carbon-labs/react-util';
import { useReducedGetter } from '@carbon-labs/react-util';
import { inertProps } from '@carbon-labs/react-util';

/* ============================================================================
 * TagSet — Carbon for IBM Products' TagSet, on the kit's Tag and motion.
 * The tags that fit the container's width show; the rest go
 * into an overflow, a "+N" tag that opens them in a popover, with a "View
 * all tags" link to a modal listing every tag, searchable.
 *
 *   fit        the tags are measured once (a hidden copy) and as many as fit
 *              show, leaving room for the "+N"; `maxVisible` caps them;
 *              `multiline` wraps them instead (only `maxVisible` overflows).
 *              The width is the container's (`containingElementRef`, else
 *              the set's own), less `measurementOffset`
 *   reflow     when the width changes and tags move into or out of the
 *              overflow, out then in. A tag is a mark, and so is the "+N":
 *              each snaps as the Tag does (`tag/tag-snap.ts`). The tags
 *              leaving snap out where they are; the "+N" slides to its new
 *              place (`animateLayout`), its clock from its travel, while its
 *              count rolls (RollText) on the same clock; then the tags
 *              coming back snap in, staggered (`useStagger`). The "+N"
 *              arriving snaps in, leaving snaps out first. Changes closer
 *              than 200ms land at once
 *   dismiss    a tag with `onClose` is a DismissibleTag. Removing a tag
 *              from `tags` (its close, or anything else) is one motion: it
 *              snaps out where it was (a copy, the Tag's out: down to its
 *              scale, fading). When several leave at once (clear all, the
 *              filter summary's Clear), they stagger 20ms apart; once the
 *              last has started, the gap closes in one move (the productive
 *              standard curve), its clock from its travel; a tag added or
 *              back from the overflow snaps in once the gap has closed.
 *              Reduced motion: at once, the tag gone and the
 *              others in place, a tag added simply there
 *   overflow   the "+N" is a control: the selectable tag's outline pill with
 *              the rollover. It opens the kit's Popover (its anchored form) on
 *              the snap: the frame grows from the press point, the content
 *              slides out of it on y; it leaves by folding back into it. It
 *              is placed by `overflowAlign`, flipping to stay on screen, in
 *              the trigger's theme. `overflowType="tag"` lists the overflow
 *              as tags, `default` as text. Escape and a press outside close
 *              it
 *   view all   more than `allTagsModalSearchThreshold` (10) in the overflow:
 *              the popover shows that many and a "View all tags" text button,
 *              which opens the kit's Modal with every tag and a search; the
 *              search filters them with the kit's list presence (out, one
 *              reflow, staggered in: `useFilterPresence`)
 *   reduced    no slide, roll or snap: the tags and the "+N" change at once
 *
 * Carbon for IBM Products' props: `tags` (`label` and the Tag's props),
 * `maxVisible`, `multiline`, `overflowAlign`, `overflowType`,
 * `overflowClassName`, `allTagsModalTitle`, `allTagsModalSearchLabel`,
 * `allTagsModalSearchPlaceholderText`, `allTagsModalSearchThreshold`,
 * `allTagsModalTarget` (accepted; the kit's Modal portals itself),
 * `showAllTagsLabel`, `onOverflowTagChange`, `containingElementRef`,
 * `measurementOffset`, `className`. The kit adds `size` (the kit Tag's)
 * and `timeScale` (slow motion). The "+N" takes the KitDefaults corners as
 * the tags do (`TAG_KIT`): the pill, or the tag's 2px or square.
 * ========================================================================== */

const bezier = (name: keyof typeof motionTokens.easing) =>
  `cubic-bezier(${motionTokens.easing[name].join(', ')})`;

export interface TagSetTag
  extends
    Omit<TagProps, 'children' | 'show' | 'size' | 'ref'>,
    Pick<
      DismissibleTagProps,
      | 'onClose'
      | 'dismissTooltipLabel'
      | 'dismissTooltipAlignment'
      | 'renderIcon'
      | 'tagTitle'
      | 'decorator'
      | 'disabled'
    > {
  /** The tag's text. */
  label: ReactNode;
  /** A stable id (the React key). Default its index. */
  id?: string;
}

/** Where a tag is in the row, for the dismissal's reflow: its id, else its text, else its index. */
const keyOf = (t: TagSetTag, i: number) =>
  t.id ?? (typeof t.label === 'string' ? t.label : String(i));
/** The "+N" in the row's reflow. */
const MORE_KEY = 'cds-tag-set-more';
const KEY_ATTR = 'data-tag-key';

/** A box relative to the set's own, so a parent's move isn't read as a reflow. */
interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

const boxIn = (el: Element, root: Element): Box => {
  const r = el.getBoundingClientRect();
  const o = root.getBoundingClientRect();
  return {
    left: r.left - o.left,
    top: r.top - o.top,
    right: r.right - o.left,
    bottom: r.bottom - o.top,
    width: r.width,
    height: r.height,
  };
};

interface RowItem {
  box: Box;
  clone: HTMLElement;
}

/** The row as it is on screen: each tag's (and the "+N"'s) box, and a copy to leave behind if it goes. */
function captureRow(row: HTMLElement, root: HTMLElement): Map<string, RowItem> {
  const out = new Map<string, RowItem>();
  row.querySelectorAll<HTMLElement>(`:scope > [${KEY_ATTR}]`).forEach((el) => {
    const clone = el.cloneNode(true) as HTMLElement;
    clone.removeAttribute(KEY_ATTR);
    clone.removeAttribute('data-tag-index');
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    clone.setAttribute('aria-hidden', 'true');
    clone.setAttribute('inert', '');
    clone.classList.add('cds-tag-set__leaving');
    out.set(el.getAttribute(KEY_ATTR)!, { box: boxIn(el, root), clone });
  });
  return out;
}

/** Carbon for IBM Products' alignments, and the kit's surface alignments. */
export type TagSetOverflowAlign =
  | SurfaceAlignment
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'left'
  | 'right';

export type TagSetOverflowType = 'default' | 'tag';

export interface TagSetProps extends HTMLAttributes<HTMLDivElement> {
  tags?: TagSetTag[];
  /** At most this many tags show; the rest overflow. */
  maxVisible?: number;
  /** Wrap the tags onto more lines instead of overflowing (only `maxVisible` overflows). */
  multiline?: boolean;
  /** Where the overflow popover opens. Default `bottom`. */
  overflowAlign?: TagSetOverflowAlign;
  /** `default`: the overflow listed as text; `tag`: as tags. */
  overflowType?: TagSetOverflowType;
  overflowClassName?: string;
  /** The modal's title. Default "All tags". */
  allTagsModalTitle?: string;
  allTagsModalSearchLabel?: string;
  allTagsModalSearchPlaceholderText?: string;
  /** More overflow tags than this: the popover shows this many and "View all tags". Default 10. */
  allTagsModalSearchThreshold?: number;
  /** Accepted: the kit's Modal portals itself, in its launcher's theme. */
  allTagsModalTarget?: HTMLElement;
  /** The popover's link to the modal. Default "View all tags". */
  showAllTagsLabel?: string;
  /** Called with the overflow's tags whenever they change. */
  onOverflowTagChange?: (overflowTags: TagSetTag[]) => void;
  /** Measure this element's width instead of the set's own. */
  containingElementRef?: RefObject<HTMLElement | null>;
  /** px taken off the measured width. */
  measurementOffset?: number;
  /** The tags' size (the kit Tag's). Default `md`. */
  size?: TagSize;
  /** Slow motion. Default 1. */
  timeScale?: number;
}

/** IBM Products' alignments onto the kit's floating surfaces' (below or above, start / center / end). */
/** The measured widths (px) of each tag and of a two-digit "+N", and the row's gap. */
function measureWidths(m: HTMLElement | null, row: HTMLElement | null) {
  const tagW = Array.from(
    m?.querySelectorAll<HTMLElement>('[data-measure-tag]') ?? []
  ).map((el) => el.getBoundingClientRect().width);
  const over =
    m
      ?.querySelector<HTMLElement>('[data-measure-overflow]')
      ?.getBoundingClientRect().width ?? 0;
  const gap = row ? parseFloat(getComputedStyle(row).columnGap) || 0 : 0;
  return { tagW, over, gap };
}

function surfaceAlign(a: TagSetOverflowAlign): SurfaceAlignment {
  switch (a) {
    case 'top-left':
      return 'top-start';
    case 'top-right':
      return 'top-end';
    case 'bottom-left':
      return 'bottom-start';
    case 'bottom-right':
      return 'bottom-end';
    case 'left':
    case 'right':
      return 'bottom';
    default:
      return a;
  }
}

export function TagSet({
  tags = [],
  maxVisible,
  multiline = false,
  overflowAlign = 'bottom',
  overflowType = 'default',
  overflowClassName,
  allTagsModalTitle = 'All tags',
  allTagsModalSearchLabel = 'Search all tags',
  allTagsModalSearchPlaceholderText = 'Search all tags',
  allTagsModalSearchThreshold = 10,
  allTagsModalTarget: _target,
  showAllTagsLabel = 'View all tags',
  onOverflowTagChange,
  containingElementRef,
  measurementOffset = 0,
  size: sizeProp,
  timeScale = 1,
  className,
  ...rest
}: TagSetProps) {
  // KitDefaults: the provider's size (the tag's own scale) when none is given.
  const size = useDefaultSize(sizeProp, TAG_SIZES, 'md');
  // The "+N"'s corners: the provider's, as the tags resolve theirs (TAG_KIT).
  const { corners: moreCorners = 'full' } = useKitProps<
    TagSize,
    TagCorners,
    never
  >({}, TAG_KIT);
  const moreShape = moreCorners !== 'full' && `cds-tag--${moreCorners}`;
  const n = tags.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  /** The "+N", as state: the popover is placed from it and takes its theme. */
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const setTrigger = useCallback((el: HTMLButtonElement | null) => {
    triggerRef.current = el;
    setAnchor(el);
  }, []);
  const reduced = usePrefersReducedMotion();
  const rolloverReduced = useReducedGetter();

  /* A tag removed (dismissed, or taken out of `tags`) or added: during the
     render that changes it, the row is read as it is on screen (React hasn't
     committed yet), once per change; the difference plays after the commit.
     Read only: a discarded render leaves a snapshot the next commit
     replaces. */
  const keys = tags.map(keyOf);
  const keysSig = keys.join('\u0001');
  const committedKeys = useRef<string[] | null>(null);
  const dismissBefore = useRef<Map<string, RowItem> | null>(null);
  /** The "+N" count the last commit showed. */
  const committedMore = useRef(0);
  /* The count held while a dismissal waits to play: it rolls when the
     dismissal knows its clock, so the event runs on one clock. */
  const [heldMore, setHeldMore] = useState<number | null>(null);
  /* eslint-disable react-hooks/refs -- the snapshot, read during render (above) */
  const was = committedKeys.current;
  if (
    was &&
    was.join('\u0001') !== keysSig &&
    !dismissBefore.current &&
    rowRef.current &&
    rootRef.current
  ) {
    const now = new Set(keys);
    const had = new Set(was);
    if (was.some((k) => !now.has(k)) || keys.some((k) => !had.has(k))) {
      dismissBefore.current = captureRow(rowRef.current, rootRef.current);
      setHeldMore(committedMore.current);
    }
  }
  /* eslint-enable react-hooks/refs */

  /** How many tags the width allows (the target), and how many show (it lags while tags leave). */
  const [target, setTarget] = useState(() => Math.min(n, maxVisible ?? n));
  const [shown, setShown] = useState(target);
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const measured = useRef(false);
  const latest = useLatest({
    n,
    maxVisible,
    multiline,
    containingElementRef,
    measurementOffset,
    timeScale,
    reduced,
  });

  /* ── the reflows' state (fitting reads it) ────────────────────────────── */

  const outTimer = useRef(0);
  const outAnims = useRef<Animation[]>([]);
  const lastChange = useRef(-Infinity);
  const atOnce = useRef(false);
  /** Set by the commit: where the move starts from. */
  const pending = useRef<{
    from: number;
    triggerX: number | null;
    moveMs: number;
  } | null>(null);
  /** The move's clock (a reflow's or a dismissal's), for the count's roll (RollText's own clock is moderate-01). */
  const [rollScale, setRollScale] = useState(timeScale);
  /** What a dismissal's reflow has running. */
  const dismissRun = useRef<Animation[]>([]);
  /** A staggered dismissal's timer for the count's roll; cleared by `cut` and on unmount. */
  const gapTimer = useRef(0);
  /** The count the last fit settled on: a dismissal plays once the row shows it. */
  const fitCount = useRef(-1);

  /** Stops every reflow where it is: its animations cancelled, a dismissal's copies gone. */
  const cut = useCallback(() => {
    window.clearTimeout(outTimer.current);
    outTimer.current = 0;
    window.clearTimeout(gapTimer.current);
    gapTimer.current = 0;
    outAnims.current.forEach((a) => a.cancel());
    outAnims.current = [];
    pending.current = null;
    rowRef.current
      ?.querySelectorAll<HTMLElement>('[data-tag-index]')
      .forEach((el) => {
        el.getAnimations().forEach((a) => a.cancel());
      });
    triggerRef.current?.getAnimations().forEach((a) => a.cancel());
    dismissRun.current.forEach((a) => a.cancel());
    dismissRun.current = [];
    rootRef.current
      ?.querySelectorAll(':scope > .cds-tag-set__leaving')
      .forEach((c) => c.remove());
  }, []);

  /* ── fitting ──────────────────────────────────────────────────────────── */

  const fit = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const {
      n: total,
      maxVisible: cap = total,
      multiline: wrap,
      measurementOffset: off,
    } = latest.current;
    let count = total;
    if (!wrap) {
      const box = latest.current.containingElementRef?.current ?? root;
      const W = box.clientWidth - off;
      const { tagW, over, gap } = measureWidths(
        measureRef.current,
        rowRef.current
      );
      count = 0;
      let used = 0;
      for (let i = 0; i < tagW.length; i++) {
        const next = used + (i ? gap : 0) + tagW[i]!;
        const rest = tagW.length - (i + 1);
        if (next + (rest > 0 ? gap + over : 0) > W + 0.5) break;
        count = i + 1;
        used = next;
      }
    }
    count = Math.min(count, cap);
    fitCount.current = count;
    if (!measured.current) {
      // The first fit is the set as it is: no motion (principle 3).
      measured.current = true;
      setTarget(count);
      setShown(count);
      return;
    }
    if (dismissBefore.current) {
      // A dismissal: the row lands on its new count in this commit, and the
      // dismissal's reflow (below) takes it there as one motion.
      cut();
      setTarget(count);
      setShown(count);
      return;
    }
    setTarget(count);
  }, [latest, cut]);

  const tagsSig = tags
    .map((t, i) => `${t.id ?? i}:${typeof t.label === 'string' ? t.label : ''}`)
    .join('|');
  useLayoutEffect(() => {
    fit();
  }, [fit, tagsSig, maxVisible, multiline, size, measurementOffset]);

  const stagger = useStagger({ count: Math.max(1, n), size: 64 });
  const staggerRef = useLatest(stagger.delay);

  // The dismissal, once the row shows the fit's count: the tag that went
  // snaps out where it was while the rest close the gap, and the "+N"'s
  // count, held till now, rolls on the gap's clock (one event, one clock).
  useLayoutEffect(() => {
    committedKeys.current = keys;
    const prev = dismissBefore.current;
    const root = rootRef.current;
    const row = rowRef.current;
    if (!prev || !root || !row) {
      if (!prev) setHeldMore(null);
      return;
    }
    if (fitCount.current !== shown) return; // the fit's re-render comes next
    dismissBefore.current = null;
    const { timeScale: ts, reduced: red } = latest.current;
    const { running, gapTimer: timer } = playDismiss(root, row, prev, {
      timeScale: ts,
      reduced: red,
      staggerDelay: staggerRef.current,
      onGapStart: (moveMs) => {
        setRollScale(
          moveMs ? moveMs / motionTokens.duration['moderate-01'] : ts
        );
        setHeldMore(null);
      },
    });
    dismissRun.current = running;
    gapTimer.current = timer;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- on a new row
  }, [keysSig, shown]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => fit());
    ro.observe(containingElementRef?.current ?? root);
    if (measureRef.current) ro.observe(measureRef.current);
    return () => ro.disconnect();
  }, [fit, containingElementRef]);

  /* ── the reflow: out, the "+N" slides (its count rolls), in ───────────── */

  useLayoutEffect(() => {
    if (target === shown && outTimer.current === 0) return;
    const now = performance.now();
    const burst = now - lastChange.current < BURST_MS;
    lastChange.current = now;
    const { timeScale: ts, reduced: red, n: total } = latest.current;
    setRollScale(ts);
    if (burst) {
      cut();
      atOnce.current = true;
      setShown(target);
      return;
    }
    cut();
    let wait = 0;
    // Out (reduced motion: at once): the tags going into the overflow snap
    // out where they are, and the "+N", when nothing will overflow, with them.
    const outs: HTMLElement[] = [];
    for (let i = target; i < shown; i++) {
      const el = rowRef.current?.querySelector<HTMLElement>(
        `[data-tag-index="${i}"]`
      );
      if (el) outs.push(el);
    }
    const trigger = triggerRef.current;
    if (trigger && target >= total) outs.push(trigger);
    for (const el of red ? [] : outs) {
      const out = snapOut(el, ts);
      outAnims.current.push(out);
      wait = Math.max(wait, Number(out.effect?.getTiming().duration ?? 0));
    }
    const commit = () => {
      outTimer.current = 0;
      const t = triggerRef.current;
      const stays = !!t && target < total;
      // The move's travel: the widths of the tags between the two counts.
      const { tagW, gap } = measureWidths(measureRef.current, rowRef.current);
      let travel = 0;
      for (let i = Math.min(shown, target); i < Math.max(shown, target); i++)
        travel += tagW[i]! + gap;
      const moveMs =
        stays && !red && travel > 0.5
          ? Math.max(
              DURATION_FLOOR_MS,
              motionTokens.duration[durationStepForDistance(travel)] * ts
            )
          : 0;
      setRollScale(moveMs ? moveMs / motionTokens.duration['moderate-01'] : ts);
      pending.current = {
        from: shown,
        triggerX: stays ? t!.getBoundingClientRect().left : null,
        moveMs,
      };
      setShown(target);
    };
    if (wait <= 0) commit();
    else outTimer.current = window.setTimeout(commit, wait);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- on a new target
  }, [target]);

  // Committed: the "+N" slides from where it was; then the tags arriving
  // fade in, staggered, and a "+N" arriving snaps in.
  useLayoutEffect(() => {
    const p = pending.current;
    pending.current = null;
    outAnims.current = [];
    if (atOnce.current) {
      atOnce.current = false;
      return;
    }
    if (!p) return;
    const { timeScale: ts, reduced: red, n: total } = latest.current;
    // Reduced motion: the tags and the "+N" are simply in their places.
    if (red) return;
    const trigger = triggerRef.current;
    const root = rootRef.current;
    let after = 0;
    if (trigger && root && p.triggerX !== null && p.moveMs > 0) {
      const dx = p.triggerX - trigger.getBoundingClientRect().left;
      if (Math.abs(dx) > 0.5) {
        animateLayout(
          root,
          trigger,
          [{ translate: `${dx}px 0` }, { translate: '0 0' }],
          {
            ms: p.moveMs,
            easing: bezier('standard-productive'),
            reason: 'tag-set-reflow',
            reduced: red,
          }
        );
        after = p.moveMs;
      }
    }
    // In: the tags coming back snap in, staggered, and the "+N" arriving
    // (nothing overflowed before) with the first of them.
    for (let i = p.from; i < shown; i++) {
      const el = rowRef.current?.querySelector<HTMLElement>(
        `[data-tag-index="${i}"]`
      );
      if (el) snapIn(el, ts, after + staggerRef.current(i - p.from) * ts);
    }
    if (trigger && p.from >= total && shown < total) snapIn(trigger, ts, after);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- after a commit only
  }, [shown]);

  useEffect(
    () => () => {
      window.clearTimeout(outTimer.current);
      window.clearTimeout(gapTimer.current);
    },
    []
  );

  /* ── the overflow ────────────────────────────────────────────────────── */

  const overflow = tags.slice(shown);
  /** The count the "+N" shows: held while a dismissal waits to play. */
  const more = heldMore ?? overflow.length;
  useLayoutEffect(() => {
    committedMore.current = more;
  });
  const overflowSig = overflow.map((t, i) => t.id ?? shown + i).join('|');
  const onOverflowRef = useLatest(onOverflowTagChange);
  useEffect(() => {
    if (measured.current) onOverflowRef.current?.(tags.slice(shown));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- when the overflow changes
  }, [overflowSig]);

  // Nothing left to show in it: the popover goes.
  if (open && overflow.length === 0) setOpen(false);

  // The "+N"'s hover and press: the rollover.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return attachRollover(root, {
      selector: '.cds-tag-set__overflow',
      timeScale,
      reduced: rolloverReduced,
    });
  }, [timeScale, rolloverReduced]);

  return (
    <div
      {...rest}
      ref={rootRef}
      className={cx(
        'cds-tag-set',
        multiline && 'cds-tag-set--multiline',
        `cds-tag-set--${size}`,
        className
      )}>
      <div ref={rowRef} className="cds-tag-set__row">
        {tags.slice(0, shown).map((t, i) =>
          renderTag(t, {
            key: t.id ?? i,
            size,
            timeScale,
            className: cx('cds-tag-set__tag', t.className),
            'data-tag-index': i,
            [KEY_ATTR]: keyOf(t, i),
          })
        )}
        {overflow.length > 0 && (
          <button
            ref={setTrigger}
            {...{ [KEY_ATTR]: MORE_KEY }}
            type="button"
            className={cx(
              'cds-tag',
              `cds-tag--${size}`,
              moreShape,
              'cds-tag--selectable',
              'cds-tag-set__overflow',
              overflowClassName
            )}
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-label={`${overflow.length} more ${overflow.length === 1 ? 'tag' : 'tags'}`}
            onPointerDown={(e) => setOrigin({ x: e.clientX, y: e.clientY })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setOrigin(null);
            }}
            onClick={() => setOpen((o) => !o)}>
            <RollText text={`+${more}`} order={more} timeScale={rollScale} />
          </button>
        )}
      </div>

      {/* The tags as they'd show, measured once: hidden, out of the flow. */}
      <div
        ref={measureRef}
        className="cds-tag-set__measure"
        aria-hidden="true"
        {...inertProps(true)}>
        {tags.map((t, i) =>
          renderTag(t, { key: t.id ?? i, size, 'data-measure-tag': '' })
        )}
        <span
          data-measure-overflow=""
          className={cx(
            'cds-tag',
            `cds-tag--${size}`,
            moreShape,
            'cds-tag--selectable',
            'cds-tag-set__overflow'
          )}>
          +88
        </span>
      </div>

      <Popover
        open={open && overflow.length > 0}
        anchor={anchor}
        origin={origin}
        align={surfaceAlign(overflowAlign)}
        label={`${overflow.length} more ${overflow.length === 1 ? 'tag' : 'tags'}`}
        timeScale={timeScale}
        onClose={() => setOpen(false)}
        className="cds-tag-set__popover">
        <div className="cds-tag-set__popover-content">
          <ul
            className={cx(
              'cds-tag-set__overflow-list',
              `cds-tag-set__overflow-list--${overflowType}`
            )}>
            {(overflow.length > allTagsModalSearchThreshold
              ? overflow.slice(0, allTagsModalSearchThreshold)
              : overflow
            ).map((t, i) => (
              <li
                key={t.id ?? shown + i}
                className="cds-tag-set__overflow-item">
                {overflowType === 'tag'
                  ? renderTag(t, { size, timeScale })
                  : t.label}
              </li>
            ))}
          </ul>
          {overflow.length > allTagsModalSearchThreshold && (
            <div className="cds-tag-set__show-all">
              <Button
                frame="none"
                timeScale={timeScale}
                onClick={() => {
                  setOpen(false);
                  setModalOpen(true);
                }}>
                {showAllTagsLabel}
              </Button>
            </div>
          )}
        </div>
      </Popover>

      <Modal
        open={modalOpen}
        passiveModal
        size="sm"
        modalHeading={allTagsModalTitle}
        onRequestClose={() => setModalOpen(false)}
        timeScale={timeScale}
        launcherButtonRef={triggerRef}
        selectorPrimaryFocus=".cds-tag-set__all input">
        <AllTags
          tags={tags}
          size={size}
          searchLabel={allTagsModalSearchLabel}
          placeholder={allTagsModalSearchPlaceholderText}
          timeScale={timeScale}
        />
      </Modal>
    </div>
  );
}
TagSet.displayName = 'TagSet';

/* ── the modal's list: every tag, searchable ───────────────────────────── */

function AllTags({
  tags,
  size,
  searchLabel,
  placeholder,
  timeScale,
}: {
  tags: TagSetTag[];
  size: TagSize;
  searchLabel: string;
  placeholder: string;
  timeScale: number;
}) {
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const searchId = `cds-tag-set-search-${useId().replace(/:/g, '')}`;
  const q = query.trim().toLowerCase();
  const matches = tags.filter(
    (t) => !q || String(t.label).toLowerCase().includes(q)
  );
  const elements: ReactElement[] = matches.map((t) => {
    const i = tags.indexOf(t);
    const key = t.id ?? String(i);
    return renderTag(t, { key, size, timeScale, 'data-cds-key': key });
  });
  const stagger = useStagger({ count: Math.max(1, elements.length), size: 32 });
  const shown = useFilterPresence(rootRef, boxRef, elements, {
    timeScale,
    reduced,
    staggerDelay: stagger.delay,
  });
  return (
    <div ref={rootRef} className="cds-tag-set__all">
      <TextInput
        id={searchId}
        type="search"
        size="md"
        corners="rounded"
        labelText={searchLabel}
        hideLabel
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div
        ref={boxRef}
        className="cds-tag-set__all-tags"
        role="list"
        aria-label="Tags">
        {shown}
      </div>
    </div>
  );
}

/* ── a tag of the set: a Tag, or a DismissibleTag when it has `onClose` ─── */

interface TagExtra {
  key?: string | number;
  size: TagSize;
  timeScale?: number;
  className?: string;
  [data: `data-${string}`]: string | number;
}

/** One of the set's tags. They don't snap in on their own (`arrive={false}`): the set's reflow owns their arrival. */
function renderTag(t: TagSetTag, { key, ...extra }: TagExtra): ReactElement {
  const {
    label,
    id: _id,
    onClose,
    dismissTooltipLabel,
    dismissTooltipAlignment,
    renderIcon,
    tagTitle,
    decorator,
    disabled,
    title,
    ...props
  } = t;
  if (onClose)
    return (
      <DismissibleTag
        key={key}
        {...props}
        {...extra}
        arrive={false}
        text={label}
        onClose={onClose}
        title={title}
        dismissTooltipLabel={dismissTooltipLabel}
        dismissTooltipAlignment={dismissTooltipAlignment}
        renderIcon={renderIcon}
        tagTitle={tagTitle}
        decorator={decorator}
        disabled={disabled}
      />
    );
  return (
    <Tag key={key} {...props} {...extra} title={title} arrive={false}>
      {label}
    </Tag>
  );
}

/** A tag's snap out, as the Tag's (`tag-snap.ts`): down to its scale from below, fading over the last part; held at the end. The scale's animation (the whole clock). */
function snapOut(el: HTMLElement, ts: number): Animation {
  return tagSnapOut(el, { timeScale: ts })[0];
}

/** A tag's snap in, as the Tag's (`tag-snap.ts`): from a few px below its size up to 1, fading up, after `delay`, unseen until then. */
function snapIn(el: HTMLElement, ts: number, delay: number): Animation[] {
  return tagSnapIn(el, { timeScale: ts, delay });
}

/**
 * A dismissal's reflow: each tag that went snaps out where it was (a copy)
 * while the rest close the gap together; a tag the room brings back snaps in
 * once the gap has closed. Returns its animations and the count's timer
 * (0: none) to cancel; `onGapStart` rolls the count as the gap moves.
 */
function playDismiss(
  root: HTMLElement,
  row: HTMLElement,
  prev: Map<string, RowItem>,
  o: {
    timeScale: number;
    reduced: boolean;
    staggerDelay: (i: number) => number;
    onGapStart: (moveMs: number) => void;
  }
): { running: Animation[]; gapTimer: number } {
  const { timeScale: ts, reduced } = o;
  const running: Animation[] = [];
  const items = Array.from(
    row.querySelectorAll<HTMLElement>(`:scope > [${KEY_ATTR}]`)
  );
  const here = new Set<string>();
  const moves: { el: HTMLElement; dx: number; dy: number }[] = [];
  const arriving: HTMLElement[] = [];
  // A pure add: only the new tags snap in; the others are where they were.
  const now = new Set(items.map((el) => el.getAttribute(KEY_ATTR)!));
  const pureAdd = [...prev.keys()].every((k) => now.has(k));
  let travel = 0;
  for (const el of items) {
    const k = el.getAttribute(KEY_ATTR)!;
    here.add(k);
    const b = prev.get(k)?.box;
    if (!b) {
      arriving.push(el);
      continue;
    }
    if (pureAdd) continue;
    const a = boxIn(el, root);
    const dx = b.left - a.left;
    const dy = b.top - a.top;
    // The largest edge travel (a "+N" whose count changes moves its edges apart).
    travel = Math.max(
      travel,
      Math.abs(dx),
      Math.abs(dy),
      Math.abs(b.right - a.right),
      Math.abs(b.bottom - a.bottom)
    );
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) moves.push({ el, dx, dy });
  }
  const leaving = [...prev].filter(([k]) => !here.has(k)).map(([, v]) => v);
  if (!leaving.length && !moves.length && !arriving.length) {
    o.onGapStart(0);
    return { running, gapTimer: 0 };
  }

  const moveMs =
    reduced || !moves.length
      ? 0
      : Math.max(
          DURATION_FLOOR_MS,
          motionTokens.duration[durationStepForDistance(travel)] * ts
        );
  const easing = bezier('standard-productive');

  // Out: a copy of each tag that went, staggered in a group; the gap waits for
  // the last. Reduced: gone at once, with no fade over the tags in its place.
  const staggerOut = !reduced && leaving.length > 1 ? TAG_STAGGER_MS * ts : 0;
  const gapDelay = staggerOut * Math.max(0, leaving.length - 1);
  for (let i = 0; i < (reduced ? 0 : leaving.length); i++) {
    const { box, clone } = leaving[i]!;
    Object.assign(clone.style, {
      position: 'absolute',
      margin: '0',
      boxSizing: 'border-box',
      left: `${box.left - root.clientLeft + root.scrollLeft}px`,
      top: `${box.top - root.clientTop + root.scrollTop}px`,
      width: `${box.width}px`,
      height: `${box.height}px`,
      pointerEvents: 'none',
    });
    root.appendChild(clone);
    const [out, fade] = tagSnapOut(clone, {
      timeScale: ts,
      delay: i * staggerOut,
    });
    running.push(out!, fade!);
    const done = () => clone.remove();
    out!.finished.then(done, done);
  }

  // The gap: one move per tag, from its old place. Delayed, its first
  // keyframe fills backwards, so it waits at the old place from this frame.
  if (moveMs > 0) {
    for (const { el, dx, dy } of moves) {
      const kf = [
        { transform: `translate(${dx}px, ${dy}px)` },
        { transform: 'none' },
      ];
      running.push(
        gapDelay > 0
          ? el.animate(kf, {
              duration: moveMs,
              delay: gapDelay,
              easing,
              fill: 'backwards',
            })
          : animateLayout(root, el, kf, {
              ms: moveMs,
              easing,
              reason: 'tag-set-dismiss',
            }).animation
      );
    }
  }
  // Arrivals snap in once the gap has closed, unseen until then.
  if (!reduced) {
    arriving.forEach((el, i) =>
      running.push(
        ...snapIn(el, ts, gapDelay + moveMs + o.staggerDelay(i) * ts)
      )
    );
  }
  // The count rolls as the gap moves.
  if (gapDelay <= 0) {
    o.onGapStart(moveMs);
    return { running, gapTimer: 0 };
  }
  return {
    running,
    gapTimer: window.setTimeout(() => o.onGapStart(moveMs), gapDelay),
  };
}
