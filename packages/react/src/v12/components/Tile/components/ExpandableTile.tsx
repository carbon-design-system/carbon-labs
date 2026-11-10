/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  Children,
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import {
  attachRollover,
  usePrefersReducedMotion,
} from '@carbon-labs/v12-motion';
import { ChevronDownUpToggle } from '@carbon-labs/react-motion-icons';
import { mergeRefs } from '@carbon-labs/v12-motion';
import {
  useDisclosureBody,
  useDisclosureMoves,
} from '@carbon-labs/react-disclosure';
import {
  fromNested,
  useTileRollover,
  type TileDecoratorProps,
  type TileHoverSteps,
} from './Tile';
import './tile.scss';
import { cx } from '@carbon-labs/react-util';
import { useReducedGetter } from '@carbon-labs/react-util';

/* ============================================================================
 * ExpandableTile, TileAboveTheFoldContent, TileBelowTheFoldContent —
 * Carbon v11's, on the tiles' standard (Tile.tsx): a tile that shows its
 * first part and opens to show the rest.
 *
 *   parts    the first child shows (above the fold), the second opens below
 *            it, as v11's; TileAboveTheFoldContent and TileBelowTheFoldContent
 *            are those two parts
 *   toggle   a button at the bottom end: the chevron (the side nav's and the
 *            table's disclosure, `ChevronDownUpToggle`, down shut, up open)
 *            and `tileCollapsedLabel` / `tileExpandedLabel` beside it. It is
 *            the tile's tab stop (Enter, Space), `aria-expanded` and
 *            `aria-controls` the fold; named by its label, else by
 *            `tileCollapsedIconText` / `tileExpandedIconText` ("Show more" /
 *            "Show less" by default). The kit's ring goes
 *            round the tile while it has focus
 *   pointer  `toggleArea` (a behavior prop for the product team) says which
 *            clicks toggle it:
 *              'tile' (default)  the tile's whole surface, the toggle
 *                                included (its own text control: the
 *                                rollover in its letters, hover, press and
 *                                release; pressing it toggles and the tile
 *                                keeps its hover)
 *              'above-the-fold'  the part above the fold and the toggle's
 *                                row; the opened part is the content's own
 *                                (`data-rollover-nested`): no press, no
 *                                toggle, so a card full of controls or text
 *                                to read stays open (v11's mode for tiles
 *                                with interactive content)
 *            Either way: the tiles' quiet rollover behind the content, its
 *            hover only (one quiet step: no press or release over a
 *            surface that grows), controls inside answer
 *            their own hover and presses (the tile at rest over them; its
 *            toggle is its own, `data-rollover-own`), and a drag that
 *            selects text isn't a click
 *   motion   the kit's disclosure (`../disclosure`, the one implementation
 *            of the expanding standards, shared with the Accordion and the
 *            data table's rows): the fold pushes what's
 *            below open, one layout transaction on the tile's container, so
 *            the rollovers and selectors in it hold and settle once. Its
 *            clock is the travel's step (`durationStepForDistance`: a
 *            24-120px fold, moderate-01), entrance productive; it shuts one
 *            step faster (`stepDown`), exit productive. Clipped, never
 *            scaled, through the soft edge (`min(16px, h, H - h)`: it grows
 *            over the first 16px and closes over the last, so nothing pops
 *            when the mask goes).
 *              open   the content moves with the opening, the way the body
 *                     grows: 8px (distance `sm`) DOWN into place from the
 *                     opening's first frame, settling just after it lands
 *              shut   the content doesn't move
 *            A toggle mid-move turns round from where the fold is, and the
 *            content resumes at once. Reduced motion: at once, the content
 *            fading in on the reduced clock. On the first paint: just there
 *   shut     the fold is inert: out of the tab order and the accessibility
 *            tree; focus inside it moves to the toggle as it shuts
 *
 * v11's props: `expanded` (sets it; the tile keeps its own state between),
 * `onClick` (before the toggle; `preventDefault` stops it), `onKeyUp` (on
 * the toggle), `tabIndex` (the toggle's), `id`, `tileCollapsedIconText`,
 * `tileExpandedIconText`, `tileCollapsedLabel`, `tileExpandedLabel`.
 * The kit adds `toggleArea`, `onExpandedChange(expanded)`, `hoverSteps`.
 * Accepted with no effect: `tileMaxHeight` and `tilePadding` (the fold is
 * measured), `decorator` / `slug` (no AI label), `light`,
 * `hasRoundedCorners`.
 * ========================================================================== */

/** Which clicks toggle an ExpandableTile. */
export type ExpandableTileToggleArea = 'tile' | 'above-the-fold';

export interface ExpandableTileProps
  extends
    Omit<HTMLAttributes<HTMLDivElement>, 'onClick' | 'onKeyUp'>,
    TileDecoratorProps {
  /** Two parts: above the fold (shown), below it (opens). */
  children?: ReactNode;
  /** Open. v11: the prop sets it; the tile keeps its own state between. */
  expanded?: boolean;
  id?: string;
  /** Called on a click that toggles it, before it does; `preventDefault()` keeps it as it is. */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /**
   * Called when the person opens or shuts it (a click, Enter
   * or Space), with the new state; not when the `expanded` prop changes it.
   */
  onExpandedChange?: (expanded: boolean) => void;
  /**
   * Which clicks toggle it. `tile` (default): anywhere on the
   * tile's own surface. `above-the-fold`: the part above the fold and the
   * toggle's row only; the opened part never shuts it (for tiles whose
   * opened part holds controls or text to select).
   */
  toggleArea?: ExpandableTileToggleArea;
  /** On the toggle. */
  onKeyUp?: (event: KeyboardEvent<HTMLElement>) => void;
  /** The toggle's. */
  tabIndex?: number;
  /** The toggle's name while shut, when it has no label. Default "Show more". */
  tileCollapsedIconText?: string;
  /** The toggle's name while open, when it has no label. Default "Show less". */
  tileExpandedIconText?: string;
  /** Shown beside the chevron while shut (e.g. "Show more"). */
  tileCollapsedLabel?: string;
  /** Shown beside the chevron while open (e.g. "Show less"). */
  tileExpandedLabel?: string;
  /** v11: the shut height. Accepted; no effect (the fold is measured). */
  tileMaxHeight?: number;
  /** v11: the shut padding. Accepted; no effect. */
  tilePadding?: number;
  /** The hover and press steps, `quiet` (default) or `standard`. */
  hoverSteps?: TileHoverSteps;
  /** Slow motion: multiplies the rollover's durations and the fold's. Default 1. */
  timeScale?: number;
}

/** A tile that opens to show more. */
export const ExpandableTile = forwardRef<HTMLDivElement, ExpandableTileProps>(
  function ExpandableTile(
    {
      className,
      children,
      expanded = false,
      onClick,
      onExpandedChange,
      toggleArea = 'tile',
      onKeyUp,
      tabIndex,
      tileCollapsedIconText = 'Show more',
      tileExpandedIconText = 'Show less',
      tileCollapsedLabel,
      tileExpandedLabel,
      tileMaxHeight: _maxHeight,
      tilePadding: _padding,
      hoverSteps,
      timeScale,
      decorator: _decorator,
      slug: _slug,
      light: _light,
      hasRoundedCorners: _round,
      ...rest
    },
    ref
  ) {
    const el = useRef<HTMLDivElement>(null);
    const fold = useRef<HTMLDivElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);
    const foldId = `cds-tile-fold-${useId()}`;
    // v11: the prop sets it; the tile keeps its own state between.
    const [open, setOpen] = useState(expanded);
    const [prev, setPrev] = useState(expanded);
    if (expanded !== prev) {
      setPrev(expanded);
      setOpen(expanded);
    }
    // The hover only: a click opens or shuts it, and the surface holds its
    // one quiet step through the fold's move, so expanding doesn't shift it.
    useTileRollover(el, false, hoverSteps, timeScale, undefined, false);
    useToggleRollover(el, timeScale);
    const body = useFold(fold, toggleRef, open, timeScale);

    const toggle = (e: MouseEvent<HTMLElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      setOpen(!open);
      onExpandedChange?.(!open);
    };
    const [above, below] = Children.toArray(children);
    const label = open ? tileExpandedLabel : tileCollapsedLabel;

    return (
      <div
        data-rollover-surface=""
        {...rest}
        ref={mergeRefs(ref, el)}
        data-motion-icon-frame=""
        className={cx(
          'cds-kit-tile',
          'cds-kit-tile--expandable',
          open && 'cds-kit-tile--expanded',
          toggleArea === 'above-the-fold' && 'cds-kit-tile--toggle-above',
          className
        )}
        onClick={(e) => {
          // The surface toggles it; its controls (the toggle too) answer their
          // own, and so does the opened part under `above-the-fold`.
          if (fromNested(e.currentTarget, e.target)) return;
          // A drag that selected text in it isn't a click on it.
          const sel = window.getSelection();
          if (
            sel &&
            !sel.isCollapsed &&
            e.currentTarget.contains(sel.anchorNode)
          )
            return;
          toggle(e);
        }}>
        <div className="cds-kit-tile__content">{above}</div>
        <div
          ref={fold}
          id={foldId}
          className="cds-disclosure__body cds-kit-tile__fold"
          {...body.bodyProps}
          // `above-the-fold`: the opened part answers its own presses (the
          // rollover's and the tile's nested rule).
          data-rollover-nested={
            toggleArea === 'above-the-fold' ? '' : undefined
          }>
          <div className="cds-disclosure__clip">
            <div className="cds-disclosure__content cds-kit-tile__content">
              {below}
            </div>
          </div>
        </div>
        <button
          ref={toggleRef}
          type="button"
          className="cds-kit-tile__toggle"
          // The tile's own action: the tile keeps its hover over it (styles/_rollover.scss).
          data-rollover-own=""
          aria-expanded={open}
          aria-controls={foldId}
          aria-label={
            label
              ? undefined
              : open
                ? tileExpandedIconText
                : tileCollapsedIconText
          }
          tabIndex={tabIndex}
          onClick={toggle}
          onKeyUp={onKeyUp}>
          {label ? (
            <span className="cds-kit-tile__toggle-label">{label}</span>
          ) : null}
          <ChevronDownUpToggle
            size={16}
            toggled={open}
            disableToggle
            aria-hidden="true"
          />
        </button>
      </div>
    );
  }
);

/**
 * The toggle's text rollover (tile.scss): hover, press and release in its
 * letters, the colors matched to its text. Its own control inside the tile,
 * so pressing it leaves the tile's press alone (the rollover's nested rule).
 */
function useToggleRollover(
  ref: React.RefObject<HTMLElement | null>,
  timeScale: number | undefined
) {
  const rolloverReduced = useReducedGetter();
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    return attachRollover(node, {
      selector: '.cds-kit-tile__toggle',
      timeScale,
      reduced: rolloverReduced,
    });
  }, [ref, timeScale, rolloverReduced]);
}

/** A fold's moves: under the tile's container, so a set of tiles moving in one commit is one motion. */
const containerOf = (body: HTMLElement) => {
  const tile = body.closest('.cds-kit-tile');
  return (tile?.parentElement ?? tile) as HTMLElement | null;
};

/**
 * The fold's motion, the kit's disclosure; shutting, focus inside it moves
 * to the toggle.
 */
function useFold(
  foldRef: React.RefObject<HTMLDivElement | null>,
  toggleRef: React.RefObject<HTMLButtonElement | null>,
  open: boolean,
  timeScale: number | undefined
) {
  const moves = useDisclosureMoves(containerOf, {
    reason: open ? 'expand' : 'collapse',
    timeScale,
  });
  const body = useDisclosureBody(
    foldRef,
    open,
    moves,
    usePrefersReducedMotion()
  );
  useLayoutEffect(() => {
    if (!open && foldRef.current?.contains(document.activeElement))
      toggleRef.current?.focus();
  }, [open, foldRef, toggleRef]);
  return body;
}

export interface TileAboveTheFoldContentProps {
  children?: ReactNode;
}

/** An ExpandableTile's first part: always shown. */
export const TileAboveTheFoldContent = forwardRef<
  HTMLDivElement,
  TileAboveTheFoldContentProps
>(function TileAboveTheFoldContent({ children }, ref) {
  return (
    <div ref={ref} className="cds-kit-tile__above">
      {children}
    </div>
  );
});

export interface TileBelowTheFoldContentProps {
  children?: ReactNode;
}

/** An ExpandableTile's second part: shown when it's open. */
export const TileBelowTheFoldContent = forwardRef<
  HTMLDivElement,
  TileBelowTheFoldContentProps
>(function TileBelowTheFoldContent({ children }, ref) {
  return (
    <div ref={ref} className="cds-kit-tile__below">
      {children}
    </div>
  );
});
