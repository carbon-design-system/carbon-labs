/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import {
  CONTENT_SWAP,
  SNAP_FRAME,
  afterLayout,
  animateLayout,
  inLayout,
  motionTokens,
  snapAnimations,
  snapProfileFor,
  useSnapSurface,
  usePrefersReducedMotion,
  easingCss,
  cubicBezier,
} from '@carbon-labs/v12-motion';
import { placeOnAnchor, themeOf } from '@carbon-labs/v12-motion';
import type { SurfaceShadowOption } from '@carbon-labs/v12-motion';
import { useSurfaceShadow } from '@carbon-labs/react-kit-defaults';
import { KitPortal } from '@carbon-labs/react-kit-defaults';
import { iconSizeFor } from '@carbon-labs/react-props';
import { Checkmark } from '@carbon-labs/react-motion-icons';
import {
  SELECTION_KIT_MOTION,
  SelectionFaces,
  sameNode,
  SelectionMarker,
  resolveSelectionStyle,
  useLatest,
  useSelectionEngine,
  type SelectionMotion,
  type SelectionSize,
} from '@carbon-labs/react-selection-kit';
import { Checkbox } from '@carbon-labs/react-checkbox';
import { Scroller } from '@carbon-labs/react-scroller';
import { applyDrawnScale, cssPx, drawnScale } from '@carbon-labs/react-menu';
import { structureTiming } from '@carbon-labs/react-feedback';
import { playOuts, settleItems } from '@carbon-labs/react-contained-list';
import {
  useFloatingMount,
  useFloatingPresence,
  useKeptTheme,
} from '@carbon-labs/react-popover';
import { inertProps } from '@carbon-labs/react-util';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import '@carbon-labs/react-menu/scss/menu.scss';
import './dropdown.scss';

/* ============================================================================
 * The listbox surface — the floating list under a Dropdown, a ComboBox or a
 * MultiSelect. The Menu's surface, look
 * and highlight, for a `listbox` whose focus stays on its trigger
 * (`aria-activedescendant`).
 * ============================================================================
 *
 *   surface    the Menu's: the snap's container model from the trigger (the
 *              press point, or the field's center from the keyboard, clamped
 *              to the list's near edge), out by folding the far edge back
 *              into it (`snapProfileFor('menu')`); its frame and hairline
 *              (the cast shadow with `shadow`; none by default); portalled with the trigger's theme, kept while it
 *              leaves. The field's width; above the field with
 *              `direction="top"`, flipping when there's no room
 *   highlight  the kit's highlight mode: the pointer jumps it (hover is
 *              instant), keys glide it, the first arrival grows in and every
 *              later one is still. It stays where it is when the pointer
 *              leaves: it is the listbox's active option
 *   chosen     a trailing check on the selected option (the Menu's
 *              `mark="check"`); `multiple`: a leading check column, the
 *              kit's Checkbox (drawn in the marker's colors where the marker
 *              covers it), and `aria-multiselectable`
 *   content    when the options change while open (a filter, a reorder),
 *              out then in: the options leaving — and the options whose
 *              place in the order changed — fade out where they are; then,
 *              as ONE layout transaction on the surface, the list's height
 *              and the options that stay move to their new places; then the
 *              new (and moved) options fade in. The marker holds through it
 *              and comes back still on the active option — or, for a reorder
 *              the pointer set off (`followPointer`), on the option under
 *              the resting pointer, where a click would land
 *   typing     a change from a key inside a burst (`typing`: keys less than
 *              `TYPING_BURST_MS` apart) lands at once: whatever is running
 *              is cut to its end, the rows and the height are simply there,
 *              and the marker stays on the active option without moving or
 *              fading. So the sequence plays for a key after a pause (the
 *              first of a run, or a lone key), and a burst never waits on it
 *   reduced    the snap's reduced form (there, or gone); the content change
 *              as fades only, at half the clock, still out then in
 * ========================================================================== */

/**
 * Keys closer together than this are a burst of typing: the list changes at
 * once for each (no out, move, in). 200ms: the upper end of fluent typing's
 * gaps (60 wpm is 200ms a character; skilled typists run 100–180ms), so
 * nearly all continuous typing counts, while a key after a deliberate pause
 * (a look at the list, then the next letter) still gets the full sequence.
 * It's also about where the sequence's out ends and its move begins, so a
 * burst cuts the first key's sequence before most of it has played.
 */
export const TYPING_BURST_MS = 200;

/**
 * A typed field's burst detector: call `typed(event.timeStamp)` on each
 * keystroke that changes the text. `burst` is true while the latest key
 * came within `TYPING_BURST_MS` of the one before it; `settle()` ends it (a
 * change that isn't typing: a pick, a clear).
 */
export function useTypingBurst() {
  const last = useRef(-Infinity);
  const [burst, setBurst] = useState(false);
  const typed = useCallback((at: number) => {
    setBurst(at - last.current < TYPING_BURST_MS);
    last.current = at;
  }, []);
  const settle = useCallback(() => setBurst(false), []);
  return { burst, typed, settle };
}

export interface ListboxOption {
  /** Stable across filtering and sorting (the item's index in `items`). */
  key: string;
  /** The text (typeahead, and the row unless `content`). */
  label: string;
  content?: ReactNode;
  disabled?: boolean;
  selected?: boolean;
  /** `multiple`: the check column's mixed state (a select-all with some chosen). */
  indeterminate?: boolean;
  /** A divider follows this option (a select-all). */
  divider?: boolean;
}

/**
 * Why the active option moved: it decides how the marker gets there. `open`
 * arrives with the surface; `pointer` jumps; `key` glides; `repeat` (a held
 * key) jumps; `filter` is simply there once the content has changed.
 */
export type ListboxMoveCause = 'open' | 'pointer' | 'key' | 'repeat' | 'filter';

export interface ListboxActive {
  /** Index into `options`; -1 none. */
  index: number;
  how: ListboxMoveCause;
}

/** The `id` of an option's row, for the trigger's `aria-activedescendant`. */
export const optionId = (listId: string, key: string) =>
  `${listId}-option-${key}`;

export interface ListboxSurfaceProps {
  /** The listbox's id. */
  id: string;
  open: boolean;
  /** The field: placed under it at its width, its theme carried over. */
  anchor: HTMLElement | null;
  /** The label's id (`aria-labelledby`), else `label` as `aria-label`. */
  labelledBy?: string;
  label?: string;
  options: ListboxOption[];
  active: ListboxActive;
  /** The pointer moved onto an enabled option. */
  onHover: (index: number) => void;
  /** An enabled option was clicked. */
  onPick: (index: number) => void;
  /** The pointer left the row of the option `key` (for another row, the list's edge, or out). */
  onRowLeave?: (key: string) => void;
  /**
   * Once a change lands, the option under the resting pointer becomes active
   * (`onHover`): the rows moved under it, and the marker goes where a click
   * would land. Set for a reorder the pointer set off (a MultiSelect's held
   * pick going on top), never for typing.
   */
  followPointer?: boolean;
  size: SelectionSize;
  // @carbon-explore corners-prop — Corner mode is one `corners` prop (full, rounded or square) that a provider can set for a subtree, where `rounded` is the component's own radius. TBD
  /** `full`: the list of a pill field is a pill too, its rows and frame fully rounded. Otherwise the list's own 8px. */
  corners?: 'full';
  /** `bottom` (default) or `top`: the side it opens on, flipping when there's no room. */
  direction?: 'top' | 'bottom';
  /** The snap's origin, client px (the press that opened it); null: the field's center. */
  origin: { x: number; y: number } | null;
  /** Hug the options when they're wider than the field (an inline dropdown). */
  hug?: boolean;
  /** Shown when there are no options (a filter that matches nothing). */
  emptyText?: ReactNode;
  /** Many can be chosen: a leading check column, `aria-multiselectable`. */
  multiple?: boolean;
  /** This change of the options came from a key inside a burst of typing: it lands at once. */
  typing?: boolean;
  /** The surface's cast shadow: `true` (`floating`), an elevation, or `false`. Default: the kit's (`KitDefaults shadow`, none). */
  shadow?: SurfaceShadowOption;
  /** Slow motion (the lab). */
  timeScale?: number;
  className?: string;
}

/** Mounted while open and while it leaves; portalled with its trigger's theme. */
export function ListboxSurface(p: ListboxSurfaceProps) {
  const { present, exited } = useFloatingMount(p.open);
  // The trigger's theme, kept while the list leaves (as the Menu's: dropping
  // it in the exit's first frame flashed the page theme's colors).
  const theme = useKeptTheme(p.open ? themeOf(p.anchor) : undefined);
  if (!present || typeof document === 'undefined') return null;
  return (
    <KitPortal
      anchor={p.anchor}
      hold={!p.open}
      className={['cds-menu-portal', theme, theme && 'cds--layer-one']
        .filter(Boolean)
        .join(' ')}>
      <ListboxBody {...p} onExited={exited} />
    </KitPortal>
  );
}

const ROW = '[data-row]';
const EMPTY_KEY = '__empty';
/** A divider's row key: its option's, with this after it. */
const DIVIDER = '__divider';

interface Rendered extends ListboxOption {
  empty?: boolean;
}

const withEmpty = (
  options: ListboxOption[],
  emptyText: ReactNode
): Rendered[] =>
  options.length || emptyText == null
    ? options
    : [
        {
          key: EMPTY_KEY,
          label: '',
          content: emptyText,
          empty: true,
          disabled: true,
        },
      ];

/**
 * The check column: the kit's Checkbox, one per face (an input can't be
 * rendered twice). `inert`: the option is the control, so the box takes no
 * focus and no press and isn't read (no nested interactive in an option).
 */
function listboxCheck(
  r: Rendered,
  face: 'off' | 'on',
  listId: string,
  timeScale: number | undefined
) {
  return (
    <span
      className="cds-listbox__check"
      aria-hidden="true"
      {...inertProps(true)}>
      <Checkbox
        id={`${optionId(listId, r.key)}-check${face === 'on' ? '-on' : ''}`}
        labelText=""
        hideLabel
        checked={!!r.selected && !r.indeterminate}
        indeterminate={!!r.indeterminate}
        disabled={r.disabled}
        tabIndex={-1}
        timeScale={timeScale}
        onChange={() => {}}
      />
    </span>
  );
}

interface ListboxRowProps {
  r: Rendered;
  /** Leaving (filtered out or moved): shown, but no longer an option. */
  out: boolean;
  listId: string;
  multiple: boolean;
  iconPx: 16 | 20;
  timeScale?: number;
}

/**
 * One option. Memoized, as a selection list's rows are: the field
 * re-renders the surface on every highlight and
 * keystroke; an option re-renders only when its own props changed, its
 * `content` compared by `sameNode`. Its handlers are the list's (delegated).
 */
const ListboxRow = memo(
  function ListboxRow({
    r,
    out,
    listId,
    multiple,
    iconPx,
    timeScale,
  }: ListboxRowProps) {
    const text = <span className="sel__text">{r.content ?? r.label}</span>;
    return (
      <div
        id={out ? undefined : optionId(listId, r.key)}
        role={out ? 'presentation' : 'option'}
        aria-hidden={out || undefined}
        aria-selected={out ? undefined : !!r.selected}
        aria-checked={!out && r.indeterminate ? 'mixed' : undefined}
        aria-disabled={out ? undefined : r.disabled || undefined}
        data-row=""
        data-key={r.key}
        {...(out ? { 'data-out': '' } : null)}
        className="sel__item cds-menu__item"
        title={r.label}>
        {multiple ? (
          <SelectionFaces
            onFace={
              <>
                {listboxCheck(r, 'on', listId, timeScale)}
                {text}
              </>
            }>
            {listboxCheck(r, 'off', listId, timeScale)}
            {text}
          </SelectionFaces>
        ) : (
          <SelectionFaces>
            {text}
            {r.selected && (
              <span className="sel__accessory cds-menu__check">
                <Checkmark size={iconPx} animated={false} aria-hidden="true" />
              </span>
            )}
          </SelectionFaces>
        )}
      </div>
    );
  },
  (a, b) =>
    a.out === b.out &&
    a.listId === b.listId &&
    a.multiple === b.multiple &&
    a.iconPx === b.iconPx &&
    a.timeScale === b.timeScale &&
    (a.r === b.r ||
      (a.r.key === b.r.key &&
        a.r.label === b.r.label &&
        !!a.r.disabled === !!b.r.disabled &&
        !!a.r.selected === !!b.r.selected &&
        !!a.r.indeterminate === !!b.r.indeterminate &&
        sameNode(a.r.content, b.r.content)))
);

/** Every row's key in order, dividers included. */
const rowKeys = (rows: Rendered[]) =>
  rows.flatMap((o) => (o.divider ? [o.key, o.key + DIVIDER] : [o.key]));

/**
 * The rows that change place in a reorder: of the keys in both orders, those
 * outside the longest run that keeps its order. They go out and come back in
 * at their new place, as the family's out-then-in; the rest move.
 */
export function movedKeys(before: string[], after: string[]): Set<string> {
  const at = new Map(before.map((k, i) => [k, i]));
  const both = after.filter((k) => at.has(k));
  const seq = both.map((k) => at.get(k)!);
  // Longest increasing subsequence (patience), with its members.
  const tails: number[] = [];
  const prev = new Array<number>(seq.length).fill(-1);
  for (let i = 0; i < seq.length; i++) {
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (seq[tails[mid]!]! < seq[i]!) lo = mid + 1;
      else hi = mid;
    }
    if (lo > 0) prev[i] = tails[lo - 1]!;
    tails[lo] = i;
  }
  const stay = new Set<number>();
  for (
    let i = tails.length ? tails[tails.length - 1]! : -1;
    i >= 0;
    i = prev[i]!
  )
    stay.add(i);
  return new Set(both.filter((_, i) => !stay.has(i)));
}

const bezier = (name: keyof typeof motionTokens.easing) => easingCss(name);

function ListboxBody(p: ListboxSurfaceProps & { onExited: () => void }) {
  const { open, size } = p;
  const surfaceRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const latest = useLatest(p);
  const reduced = usePrefersReducedMotion();
  const timeScale = p.timeScale ?? 1;

  const m: SelectionMotion = {
    ...SELECTION_KIT_MOTION,
    drag: false,
    pressColor: false,
    timeScale,
  };
  const style = resolveSelectionStyle(
    {
      size,
      corners: p.corners,
      selectedWeight: false,
      orientation: 'vertical',
      highlight: true,
    },
    { drag: false, pressColor: false }
  );

  /* ── the rows on screen (they lag the options while content changes) ─── */

  const target = withEmpty(p.options, p.emptyText);
  const [rendered, setRendered] = useState<Rendered[]>(target);
  const byKey = new Map(target.map((o) => [o.key, o]));
  // A row still on screen takes the latest props; one leaving keeps its last.
  const rows = rendered.map((r) => byKey.get(r.key) ?? r);
  const targetSig = rowKeys(target).join('|');
  const renderedSig = rowKeys(rendered).join('|');
  const pending = targetSig !== renderedSig;

  /* ── the surface: its snap, and where it goes ─────────────────────── */

  const elevation = useSurfaceShadow(p.shadow);
  const surface = useSnapSurface(surfaceRef, {
    profile: () => snapProfileFor('menu'),
    reduced,
    timeScale,
    shadow: elevation,
  });

  /**
   * Under (or over) the field, at its width, on whole device px, and at the
   * field's drawn scale. The list is portalled to the page, so a field drawn
   * scaled (a screen shown smaller than its own width, as the Resource index
   * recipe's frame is) would have a list at full size under it: its text and
   * rows larger than the field's, its 10rem floor wider than the field. It takes the field's scale as
   * its `zoom`: its own lengths (left, top, width and everything in it) are
   * drawn at that scale, so they're written divided by it; the snap reads the
   * list's own (unzoomed) box, so it plays as at 1x. At 1x, no zoom.
   */
  const place = (el: HTMLElement) => {
    const a = latest.current.anchor;
    if (!a) return;
    // Reads first (the field's box and scale), and only what changed is
    // written, so a list re-placed at the width it has (a filter's key, a
    // scroll) reads its height in the same layout: one flush, not three.
    const r = a.getBoundingClientRect();
    const z = drawnScale(a);
    const dpr = window.devicePixelRatio || 1;
    const snap = (v: number) => Math.round(v * dpr) / dpr;
    const s = el.style;
    const zoom = z === 1 ? '' : String(z);
    if (s.zoom !== zoom) applyDrawnScale(el, z);
    let w = snap(r.width);
    if (latest.current.hug) {
      // Its natural width, unconstrained, at the viewport's origin.
      s.width = '';
      s.left = '0px';
      s.top = '0px';
      w = snap(Math.max(r.width, Math.ceil(el.getBoundingClientRect().width)));
    }
    const width = cssPx(w, z);
    if (s.width !== width) s.width = width;
    const h = el.getBoundingClientRect().height;
    const at = placeOnAnchor(
      r,
      { w, h },
      latest.current.direction === 'top' ? 'top-start' : 'bottom-start'
    );
    const left = cssPx(snap(at.left), z);
    const top = cssPx(snap(at.top), z);
    if (s.left !== left) s.left = left;
    if (s.top !== top) s.top = top;
  };

  /** Where the rows were (client px) and how tall the list was, read as the change commits. */
  const flip = useRef<{ tops: Map<string, number>; h: number } | null>(null);
  const outAnims = useRef(new Map<string, Animation>());
  /** The next commit lands at once (a key inside a burst). */
  const atOnce = useRef(false);

  // A change that lands at once (a key inside a burst of typing) is simply
  // placed, BEFORE the highlight's engine measures the new rows (its layout
  // effect is the next one): the place's reads come first in the commit's
  // one layout, and, written only where something changed, it leaves that
  // layout clean for the engine's (audit OV-2: two forced layouts a key).
  useLayoutEffect(() => {
    if (!atOnce.current) return;
    atOnce.current = false;
    flip.current = null;
    const el = surfaceRef.current;
    if (!el || !scrollerRef.current || !listRef.current) return;
    place(el);
    surface.syncShadow();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- after a commit only
  }, [renderedSig]);

  /* ── the highlight ─────────────────────────────────────────────────── */

  const selRef = useSelectionEngine({
    rootRef: listRef,
    itemSelector: '.sel__item',
    motion: m,
    reduced,
    getRest: () => null,
    layoutKey: `${renderedSig}/${size}`,
  });
  /** The key the marker is on (null: hidden). */
  const shownKey = useRef<string | null>(null);
  /** The marker has arrived once while open: later arrivals are still (stillness). */
  const arrived = useRef(false);
  /** A content change is fading its leaving options out: the marker waits. */
  const outTimer = useRef(0);

  const rowEl = (key: string) =>
    listRef.current?.querySelector<HTMLElement>(
      `${ROW}[data-key="${CSS.escape(key)}"]:not([data-out])`
    ) ?? null;

  const hideMarker = () => {
    const sel = selRef.current;
    const list = listRef.current;
    shownKey.current = null;
    if (!sel?.shown()) return;
    if (list) list.dataset.hiding = '';
    sel.hide();
  };

  /** Keep the row in the scroller's view (the keys, the open). `scrollerRef` is the Scroller's viewport. */
  const reveal = (el: HTMLElement) => {
    const sc = scrollerRef.current;
    const list = listRef.current;
    if (!sc || !list) return;
    const inset = parseFloat(getComputedStyle(list).paddingTop) || 0;
    const top = el.offsetTop - inset;
    const bottom = el.offsetTop + el.offsetHeight + inset;
    if (top < sc.scrollTop) sc.scrollTop = top;
    else if (bottom > sc.scrollTop + sc.clientHeight)
      sc.scrollTop = bottom - sc.clientHeight;
  };

  const highlight = (el: HTMLElement, how: ListboxMoveCause | 'still') => {
    const sel = selRef.current;
    const list = listRef.current;
    if (!sel || !list) return;
    // Hover is instant; keys glide (a step's direction is worth seeing);
    // the first arrival grows in, and every later one is simply there (the
    // Menu's rules). A content change's marker is
    // simply there too: the person is typing or choosing (stillness).
    const still =
      how === 'open' ||
      how === 'still' ||
      how === 'filter' ||
      (!sel.shown() && arrived.current) ||
      (sel.shown() && (how === 'pointer' || how === 'repeat'));
    arrived.current = true;
    delete list.dataset.hiding;
    shownKey.current = el.dataset.key ?? null;
    sel.show(el, { instant: still });
  };

  /* ── arrive and leave ──────────────────────────────────────────────── */

  // Its lifecycle (`useFloatingPresence`): open, close, and while open it
  // follows the field through scrolls and resizes, once a frame.
  useFloatingPresence(surface, {
    open,
    enter: () => {
      if (surfaceRef.current)
        surface.open({
          cause: latest.current.origin,
          trigger: latest.current.anchor,
          place,
        });
    },
    // Leaving: as it was — no pointer reaches it (`data-leaving`), the marker stays.
    leave: () => {
      if (!surfaceRef.current) return false;
      window.clearTimeout(outTimer.current);
      outTimer.current = 0;
    },
    onExited: () => latest.current.onExited(),
    follow: {
      // Its own list scrolling isn't the page moving.
      ignore: (e) => e.type === 'scroll' && e.target === scrollerRef.current,
      reflow: () => {
        const el = surfaceRef.current;
        if (el && !snapAnimations(el).length && !inLayout(el)) {
          place(el);
          surface.syncShadow();
        }
      },
    },
  });

  /* ── content changes: out, one layout move, then in ────────────────── */

  const commit = () => {
    outTimer.current = 0;
    const list = listRef.current;
    const sc = scrollerRef.current;
    if (list && sc) {
      const tops = new Map<string, number>();
      list
        .querySelectorAll<HTMLElement>(`${ROW}:not([data-out])`)
        .forEach((r) => {
          tops.set(r.dataset.key!, r.getBoundingClientRect().top);
        });
      flip.current = { tops, h: sc.getBoundingClientRect().height };
    }
    outAnims.current.clear();
    setRendered(withEmpty(latest.current.options, latest.current.emptyText));
  };

  /** Everything a change has running, cut to its end: the outs, the move, the ins. */
  const cut = () => {
    window.clearTimeout(outTimer.current);
    outTimer.current = 0;
    outAnims.current.forEach((a) => a.cancel());
    outAnims.current.clear();
    flip.current = null;
    const el = surfaceRef.current;
    const sc = scrollerRef.current;
    const list = listRef.current;
    settleOwn(el, sc, list);
    if (sc) sc.style.overflowY = '';
  };

  /**
   * The change's own animations cut (the surface's, but never its snap; the
   * scroller's; every row's), each read before any is cancelled: one style
   * flush, not one per row (`settleItems`).
   */
  const settleOwn = (
    el: HTMLElement | null,
    sc: HTMLElement | null,
    list: HTMLElement | null
  ) => {
    const snap = new Set(el ? snapAnimations(el) : []);
    settleItems(
      [el, sc, ...(list?.querySelectorAll<HTMLElement>(ROW) ?? [])],
      (a) => snap.has(a)
    );
  };

  useLayoutEffect(() => {
    const list = listRef.current;
    const running = outTimer.current !== 0 || outAnims.current.size > 0;
    if (targetSig === renderedSig && !running) return;
    // Leaving: it keeps what it shows (a ComboBox settling, a MultiSelect's
    // order for the next open) — nothing changes under the fold.
    if (!open) return;
    // Opening (the change is part of the entrance), or a key inside a burst
    // of typing (no sequence: the list is simply there): at once.
    const opening = !list || snapAnimations(surfaceRef.current).length > 0;
    if (opening || latest.current.typing) {
      cut();
      // The commit places it without a move (opening, the snap places it).
      atOnce.current = !opening && pending;
      setRendered(target);
      return;
    }
    const keep = new Set(rowKeys(target));
    // A reorder: the rows whose place changed go out and come back in.
    const moved = movedKeys(rowKeys(rendered), rowKeys(target));
    // Leaving (or changing place): it fades where it is (the marker goes with
    // it). Every row's opacity is read before any fade starts (`playOuts`).
    const wait = playOuts({
      items: [...list.querySelectorAll<HTMLElement>(ROW)],
      keyOf: (r) => r.dataset.key!,
      stays: (key) => keep.has(key) && !moved.has(key),
      running: outAnims.current,
      k: (reduced ? CONTENT_SWAP.reducedScale : 1) * timeScale,
      floor: 1,
      onLeave: (key) => {
        if (shownKey.current === key) hideMarker();
      },
    });
    window.clearTimeout(outTimer.current);
    outTimer.current = 0;
    // Only rows turning back: nothing to commit.
    if (targetSig === renderedSig) return;
    // Nothing leaving: straight to the move.
    if (wait <= 0) commit();
    else outTimer.current = window.setTimeout(commit, wait);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- on a change of the options' keys
  }, [targetSig, open]);

  // The change committed: the rows that stay and the list's height move as
  // one layout transaction; the new rows fade in after it. (At once, it is
  // simply placed, above.)
  useLayoutEffect(() => {
    const f = flip.current;
    flip.current = null;
    const el = surfaceRef.current;
    const sc = scrollerRef.current;
    const list = listRef.current;
    if (!el || !sc || !list || !f) return;
    const k = (reduced ? CONTENT_SWAP.reducedScale : 1) * timeScale;
    // Writes, then reads: every animation cut (a row that went out to change
    // place is back in the order), then every row's box and the list's height
    // in one layout, then the place.
    const rowsNow = [...list.querySelectorAll<HTMLElement>(ROW)];
    settleOwn(el, sc, list);
    const tops = rowsNow.map((r) => r.getBoundingClientRect().top);
    let h1 = sc.getBoundingClientRect().height;
    const moves: [HTMLElement, number][] = [];
    const entering: HTMLElement[] = [];
    let travel = 0;
    rowsNow.forEach((r, i) => {
      const old = f.tops.get(r.dataset.key!);
      if (old === undefined) {
        entering.push(r);
        return;
      }
      const d = old - tops[i]!;
      if (Math.abs(d) > 0.5) moves.push([r, d]);
      travel = Math.max(travel, Math.abs(d));
    });
    const top0 = parseFloat(el.style.top) || 0;
    place(el);
    // A list that hugs its options may have changed width: its height read again.
    if (latest.current.hug) h1 = sc.getBoundingClientRect().height;
    const top1 = parseFloat(el.style.top) || 0;
    // The marker's row moving: it goes, and comes back still where the row lands.
    if (
      shownKey.current &&
      (!rowEl(shownKey.current) ||
        moves.some(([r]) => r.dataset.key === shownKey.current))
    )
      hideMarker();
    travel = Math.max(travel, Math.abs(h1 - f.h), Math.abs(top1 - top0));
    const fadeIn = (delay: number) =>
      entering.forEach((r) =>
        r.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: motionTokens.duration[CONTENT_SWAP.in.duration] * k,
          delay,
          easing: bezier(CONTENT_SWAP.in.easing),
          fill: 'backwards',
        })
      );
    surface.syncShadow();
    if (reduced || travel < 0.5) {
      fadeIn(0);
      return;
    }
    const t = structureTiming(travel, timeScale);
    const easing = cubicBezier(t.ease);
    sc.style.overflowY = 'hidden';
    const { transaction } = animateLayout(
      el,
      sc,
      [{ blockSize: `${f.h}px` }, { blockSize: `${h1}px` }],
      { ms: t.ms, easing, reason: 'listbox-filter', reduced }
    );
    void transaction.finished.then(() => {
      sc.style.overflowY = '';
      surface.syncShadow();
    });
    if (Math.abs(top1 - top0) > 0.5)
      el.animate([{ top: `${top0}px` }, { top: `${top1}px` }], {
        duration: t.ms,
        easing,
      });
    moves.forEach(([r, d]) =>
      r.animate([{ translate: `0 ${d}px` }, { translate: '0 0' }], {
        duration: t.ms,
        easing,
      })
    );
    fadeIn(t.ms);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- after a commit only
  }, [renderedSig]);

  useEffect(() => () => window.clearTimeout(outTimer.current), []);

  /** The enabled option a target is in; -1 none (a leaving, disabled or non-option row). */
  const indexOf = (t: EventTarget | null) => {
    const r = (t as Element | null)?.closest?.<HTMLElement>(ROW);
    if (
      !r ||
      r.dataset.out != null ||
      r.getAttribute('aria-disabled') === 'true'
    )
      return -1;
    return latest.current.options.findIndex((o) => o.key === r.dataset.key);
  };

  /** Where the pointer rests over the list (client px), and the row it's on; null off the list. */
  const pointer = useRef<{ x: number; y: number; key: string | null } | null>(
    null
  );
  /** The enabled option under the resting pointer; -1 none. */
  const underPointer = () => {
    const at = pointer.current;
    return at ? indexOf(document.elementFromPoint(at.x, at.y)) : -1;
  };
  /** The pointer is on `key`'s row (null: none, or off the list): a row it was on, it left. */
  const pointerOn = (key: string | null) => {
    const was = pointer.current?.key ?? null;
    if (was !== null && was !== key) latest.current.onRowLeave?.(was);
  };

  // The active option, shown. While a content change runs, it waits: for
  // the leaving options to go, then for the layout move to land.
  const activeKey = p.options[p.active.index]?.key ?? null;
  const how = p.active.how;
  useLayoutEffect(() => {
    if (!open) return;
    // A change still to commit: the commit runs this again.
    if (pending) return;
    let live = true;
    // A key's move is kept in view, also once a change it waited for has landed.
    const keep = how === 'key' || how === 'repeat' || how === 'open';
    const apply = (cause: ListboxMoveCause | 'still') => {
      if (!live || outTimer.current) return;
      const list = listRef.current;
      if (list && inLayout(list)) {
        void afterLayout(list).then(() => {
          selRef.current?.measure();
          apply('still');
        });
        return;
      }
      // A reorder the pointer set off: the option under it is active once it lands.
      if (
        cause !== 'key' &&
        cause !== 'repeat' &&
        cause !== 'open' &&
        latest.current.followPointer
      ) {
        const i = underPointer();
        if (i >= 0 && i !== latest.current.active.index) {
          latest.current.onHover(i);
          return;
        }
      }
      const el = activeKey ? rowEl(activeKey) : null;
      if (!el) {
        if (shownKey.current) hideMarker();
        return;
      }
      if (keep) reveal(el);
      if (shownKey.current === activeKey && selRef.current?.shown()) {
        // On its row already; after a change it follows the row's new place, at once.
        if (cause === 'filter' || cause === 'still') highlight(el, 'still');
        return;
      }
      highlight(el, cause);
    };
    apply(how);
    return () => {
      live = false;
    };
    // `p.active` is a new object on every move, so a repeat of the same key still runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.active, renderedSig, open]);

  /* ── pointer ───────────────────────────────────────────────────────── */

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (
      e.pointerType === 'touch' ||
      surfaceRef.current?.hasAttribute('data-leaving')
    )
      return;
    const list = listRef.current;
    if (list) list.dataset.input = 'pointer';
    const on =
      (e.target as Element | null)?.closest?.<HTMLElement>(ROW)?.dataset.key ??
      null;
    pointerOn(on);
    pointer.current = { x: e.clientX, y: e.clientY, key: on };
    const i = indexOf(e.target);
    if (i < 0 || outTimer.current) return;
    const key = latest.current.options[i]!.key;
    const el = rowEl(key);
    // The pointer's move shows at once (a render later would lag the pointer).
    if (el && shownKey.current !== key && !inLayout(list))
      highlight(el, 'pointer');
    if (latest.current.active.index !== i) latest.current.onHover(i);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const list = listRef.current;
    if (indexOf(e.target) < 0 || e.button !== 0 || !list) return;
    // Held: the marker insets 1px (the kit's grab).
    list.dataset.grabbed = '';
    const up = () => {
      delete list.dataset.grabbed;
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  /* ── render ────────────────────────────────────────────────────────── */

  const iconPx = iconSizeFor(size);
  const multiple = !!p.multiple;
  return (
    <div
      ref={surfaceRef}
      className={[
        'cds-menu',
        `cds-menu--${style.variant}`,
        `cds-menu--${size}`,
        p.corners === 'full' && 'cds-menu--full',
        'cds-listbox',
        multiple && 'cds-listbox--multiple',
        p.className,
      ]
        .filter(Boolean)
        .join(' ')}
      // Focus stays on the trigger: a press here never takes it.
      onMouseDown={(e) => e.preventDefault()}>
      <span className="cds-menu__frame" {...SNAP_FRAME} />
      {/* The kit's Scroller (its pill, over the rows). Not a tab stop: the
          keys scroll it through the active option, from the trigger (axe's
          scrollable-region-focusable doesn't know that). */}
      <Scroller
        className="cds-listbox__scroller"
        viewportClassName="cds-listbox__viewport"
        viewportRef={scrollerRef}
        focusable={false}
        reduced={reduced}
        timeScale={timeScale}>
        <div
          ref={listRef}
          id={p.id}
          role="listbox"
          aria-labelledby={p.labelledBy}
          aria-label={p.labelledBy ? undefined : p.label}
          aria-multiselectable={multiple || undefined}
          className={[...style.classes, 'cds-menu__list']
            .filter(Boolean)
            .join(' ')}
          onPointerMove={onPointerMove}
          onPointerLeave={() => {
            pointerOn(null);
            pointer.current = null;
          }}
          onPointerDown={onPointerDown}
          onClick={(e) => {
            const i = indexOf(e.target);
            if (i >= 0) latest.current.onPick(i);
          }}>
          <SelectionMarker />
          {rows.flatMap((r) => {
            const out = !byKey.has(r.key);
            const outAttr = out ? { 'data-out': '' } : null;
            if (r.empty)
              return (
                <div
                  key={r.key}
                  data-row=""
                  data-key={r.key}
                  {...outAttr}
                  className="cds-listbox__empty"
                  role="presentation">
                  {r.content}
                </div>
              );
            const row = (
              <ListboxRow
                key={r.key}
                r={r}
                out={out}
                listId={p.id}
                multiple={multiple}
                iconPx={iconPx}
                timeScale={p.timeScale}
              />
            );
            if (!r.divider) return [row];
            return [
              row,
              <div
                key={r.key + DIVIDER}
                data-row=""
                data-key={r.key + DIVIDER}
                {...outAttr}
                className="cds-menu__divider cds-listbox__divider"
                role="presentation"
              />,
            ];
          })}
        </div>
      </Scroller>
    </div>
  );
}
