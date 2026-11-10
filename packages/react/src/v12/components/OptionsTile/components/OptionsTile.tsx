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
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { flushSync } from 'react-dom';
import {
  attachRollover,
  evaluateCurve,
  motionTokens,
  playContentSwap,
  snapFadeFor,
  type CubicBezier,
} from '@carbon-labs/v12-motion';
import { usePrefersReducedMotion } from '@carbon-labs/v12-motion';
import {
  ChevronDownUpToggle,
  Locked,
  WarningAltFilled,
  WarningFilled,
} from '@carbon-labs/react-motion-icons';
import {
  useDisclosureBody,
  useDisclosureMoves,
} from '@carbon-labs/react-disclosure';
import { HOLD_ID, tokenMs, transitionOf } from '@carbon-labs/react-disclosure';
import { usePreviousCommit } from '@carbon-labs/react-feedback';
import { KitDefaults } from '@carbon-labs/react-kit-defaults';
import { quietSteps } from '@carbon-labs/react-util';
import { Toggle } from '@carbon-labs/react-toggle';
import './options-tile.scss';
import { cx } from '@carbon-labs/react-util';
import { useReducedGetter } from '@carbon-labs/react-util';

/* ============================================================================
 * OptionsTile — Carbon for IBM Products' OptionsTile, prop for prop, on the
 * kit's tile: a tile for one group of
 * settings, with a summary of what they're set to, an optional switch that
 * turns the whole group on or off, and a body that opens to show the
 * settings themselves.
 *
 *   surface   the kit's tile: `--cds-surface`, 8px corners. The heading is a
 *             button (`aria-expanded`, `aria-controls`) holding the chevron,
 *             the title and the summary; the tile's quiet rollover behind
 *             it, flush (no growth past the tile, no press shrink)
 *   chevron   `ChevronDownUpToggle`, down shut, up open, at the start; the
 *             heading is its frame
 *   summary   under the title: `summary`, or a status in its place —
 *             `invalid` (WarningFilled + `invalidText`), else `warn`
 *             (WarningAltFilled + `warnText`), else `locked` (Locked +
 *             `lockedText`). Shut, it shows; open, the summary goes (the
 *             settings are in view) but a status stays
 *   switch    `enabled` defined: the kit's Toggle (sm, no state text),
 *             named by the title. `locked`: read-only. `onChange(value, id,
 *             event)` hears it
 *   motion    the kit's disclosure, one motion for the tile: the body opens
 *             as the summary's line shuts (a swap, one clock: the step of the
 *             longer travel, standard-productive), the content coming down
 *             8px from the opening's first frame and running one duration
 *             token past it (the axial rule); shut, the summary's line opens
 *             as the body shuts. The summary only fades, out then in: gone
 *             before anything moves over it, back once the heading has
 *             landed, each over fast-01. A summary whose text changes swaps
 *             out, then in (`playContentSwap`): in place, or, when the
 *             switch changed it, 8px the way its knob went
 *   divider   open, a hairline atop the body's sheet, held still by layout
 *             (`data-hold-edge`); the sheet runs to the tile's bottom over the
 *             heading's lower part, fading in and out at the motion's ends
 *   reduced   the disclosure at once, the content fading in on the reduced
 *             clock; the summary at once, its swap a snap
 *
 * IBM Products' props: `title`, `titleId`, `summary`, `open`, `onToggle`
 * (open state), `enabled`, `onChange` (the switch), `invalid` /
 * `invalidText`, `warn` / `warnText`, `locked` / `lockedText`, `size`
 * (`lg` 48px, default / `xl` 64px), `children`, `className`. The kit adds:
 * `timeScale` (multiplies the disclosure, the rollover, the summary swap and
 * the switch; when omitted, the disclosure reads the duration tokens' CSS
 * variables).
 * ========================================================================== */

export type OptionsTileSize = 'lg' | 'xl';

export interface OptionsTileProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title' | 'onChange' | 'onToggle'
> {
  /** The settings: shown when it's open. Without children it doesn't open. */
  children?: ReactNode;
  className?: string;
  /** Defined: the tile has a switch, on or off. Controlled. */
  enabled?: boolean;
  /** The settings are invalid: `invalidText` replaces the summary. */
  invalid?: boolean;
  invalidText?: ReactNode;
  /** The settings can't be changed: `lockedText` replaces the summary; the switch is read-only. */
  locked?: boolean;
  lockedText?: ReactNode;
  /** The switch changed: its new value, the switch's id, the event. */
  onChange?: (
    value: boolean,
    id: string,
    event: MouseEvent<HTMLButtonElement> | PointerEvent | null
  ) => void;
  /** The tile opened or shut (a click, Enter or Space), with its new state. */
  onToggle?: (open: boolean) => void;
  /** Open. Its initial state, and followed whenever it changes; the heading toggles it in between. */
  open?: boolean;
  /** The heading's height: `lg` 48px (default), `xl` 64px. */
  size?: OptionsTileSize;
  /** What the settings are set to, one line under the title. */
  summary?: ReactNode;
  /** The tile's title. */
  title: ReactNode;
  /** The title's id (the switch and the body are named by it). Default generated. */
  titleId?: string;
  /** The settings need attention: `warnText` replaces the summary. */
  warn?: boolean;
  warnText?: ReactNode;
  /** Multiplies the disclosure, rollover, summary swap and switch clocks. */
  timeScale?: number;
}

type Status = 'invalid' | 'warn' | 'locked' | null;

const STATUS_ICON = {
  invalid: WarningFilled,
  warn: WarningAltFilled,
  locked: Locked,
} as const;

/** A swap's key: what changed, so new words swap and the same words hold still. */
const keyOf = (status: Status, text: ReactNode) =>
  `${status ?? 'summary'}:${typeof text === 'string' || typeof text === 'number' ? text : ''}`;

export function OptionsTile({
  children,
  className,
  enabled,
  invalid = false,
  invalidText,
  locked = false,
  lockedText,
  onChange,
  onToggle,
  open: openProp = false,
  size = 'lg',
  summary,
  title,
  titleId: titleIdProp,
  warn = false,
  warnText,
  timeScale,
  ...rest
}: OptionsTileProps) {
  const scale = timeScale ?? 1;
  const uid = useId().replace(/:/g, '');
  const titleId = titleIdProp ?? `options-tile-title-${uid}`;
  const headingId = `options-tile-heading-${uid}`;
  const bodyId = `options-tile-body-${uid}`;
  const toggleId = `options-tile-toggle-${uid}`;
  const reduced = usePrefersReducedMotion();
  const expandable = children != null && children !== false;

  // IBM Products': the state starts at `open` and follows it when it
  // changes; the heading toggles it in between.
  const [isOpen, setIsOpen] = useState(openProp);
  const [seenProp, setSeenProp] = useState(openProp);
  if (seenProp !== openProp) {
    setSeenProp(openProp);
    setIsOpen(openProp);
  }
  const open = isOpen && expandable;
  // What the disclosure plays: opening waits for the summary to fade out
  // first, so nothing moves over its words while they show.
  const [shownOpen, setShownOpen] = useState(open);

  const status: Status = invalid
    ? 'invalid'
    : warn
      ? 'warn'
      : locked
        ? 'locked'
        : null;
  const statusText =
    status === 'invalid'
      ? invalidText
      : status === 'warn'
        ? warnText
        : status === 'locked'
          ? lockedText
          : null;
  // Open, the summary goes (the settings are in view); a status stays.
  const line = status ? statusText : shownOpen ? null : summary;
  const lineShown = line != null && line !== false && line !== '';

  // One motion for the tile: the body and the summary's line under the
  // tile's container (so tiles in one list that change in one commit are one
  // motion, as the ExpandableTile's).
  const tileRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLButtonElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const sheetMotion = useRef<Animation[]>([]);
  const moves = useDisclosureMoves(tileRef, {
    reason: open ? 'expand' : 'collapse',
    timeScale,
    onTimed: (clock, timing) => {
      const b = bodyRef.current;
      const heading = headingRef.current;
      const head = headRef.current;
      const opening = !!b?.hasAttribute('data-open');
      // From where a turned fade is, else from where the sheet rested.
      const turned = sheetMotion.current.splice(0);
      const tile = tileRef.current;
      const from =
        turned.length && tile
          ? Number(
              getComputedStyle(tile).getPropertyValue(
                '--cds-options-tile-sheet'
              )
            )
          : opening
            ? 0
            : 1;
      for (const a of turned) a.cancel();
      if (tile && b && heading && transitionOf(b, 'grid-template-rows'))
        sheetMotion.current = playSheet(
          tile,
          b,
          heading,
          opening,
          from,
          clock,
          timing.token,
          timeScale
        );
      // The ring's and focus ring's edge sits at the divider: the body's hold, copied once the disclosure starts it.
      queueMicrotask(() => {
        const hold = b?.getAnimations().find((a) => a.id === HOLD_ID);
        if (!hold || !head) return;
        const t = hold.effect!.getTiming();
        // `--cds-options-tile-under`: the heading reaches under the divider for as long as the hold runs.
        const frames = (hold.effect as KeyframeEffect)
          .getKeyframes()
          .map((k) => ({ ...k, '--cds-options-tile-under': '1' }));
        const copy = head.animate(frames, {
          duration: t.duration,
          easing: t.easing,
        });
        // In step with it: a turn can keep the hold already running.
        if (hold.startTime != null) copy.startTime = hold.startTime;
        sheetMotion.current.push(copy);
      });
    },
  });
  const lineRef = useRef<HTMLSpanElement>(null);
  const body = useDisclosureBody(bodyRef, shownOpen, moves, reduced);
  const lineBody = useDisclosureBody(lineRef, lineShown, moves, reduced);
  // The body's sheet: up while it's open or moving. The shut's fade and corners
  // hold until the commit that lowers it, then the state classes take over.
  const sheet = shownOpen || (!reduced && body.present);
  // A frame later: a turn passes through a commit with the body not yet moving, and the
  // fade's next start reads where it is.
  useLayoutEffect(() => {
    if (sheet) return;
    const id = requestAnimationFrame(() => {
      for (const a of sheetMotion.current.splice(0)) a.cancel();
    });
    return () => cancelAnimationFrame(id);
  }, [sheet]);

  // Opening: the summary fades out, then the line shuts and the body opens.
  // With nothing showing to fade (a status stays, a line still moving, reduced), at once.
  const fadeFirst =
    open && !shownOpen && !status && lineShown && lineBody.landed && !reduced;
  if (!open && shownOpen) setShownOpen(false);
  else if (open && !shownOpen && !fadeFirst) setShownOpen(true);
  // The words show only with the line open and landed: shutting, they fade in once the heading has.
  const wordsShown = lineShown && lineBody.landed && !fadeFirst;
  const lineContentRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    if (!fadeFirst) return;
    const fade = lineContentRef.current
      ? transitionOf(lineContentRef.current, 'opacity')
      : undefined;
    let live = true;
    const go = () => live && setShownOpen(true);
    if (!fade) {
      go();
      return;
    }
    // On the fade's own clock (fast-01, scaled), committed at once, so the move starts
    // on the frame it ends; its promise is the guard (a hidden tab runs no transitions).
    let timer = 0;
    fade.ready.then(
      () => {
        const end =
          Number(fade.startTime ?? 0) +
          Number(fade.effect?.getComputedTiming().duration ?? 0);
        if (live)
          timer = window.setTimeout(
            () => flushSync(go),
            Math.max(0, end - performance.now())
          );
      },
      () => {}
    );
    fade.finished.then(go, () => {});
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, [fadeFirst]);

  // The heading's rollover: the tiles' quiet steps, off the tile's surface.
  const rolloverReduced = useReducedGetter();
  useEffect(() => {
    const node = headRef.current;
    if (!node || !expandable) return;
    return attachRollover(node, {
      selector: '.cds-options-tile__heading',
      steps: quietSteps(),
      timeScale,
      reduced: rolloverReduced,
    });
  }, [expandable, timeScale, rolloverReduced]);

  // Shutting with focus inside the body: focus goes to the heading.
  useLayoutEffect(() => {
    if (!open && bodyRef.current?.contains(document.activeElement))
      headingRef.current?.focus();
  }, [open]);

  // When the switch changes it, the summary travels along x with the knob
  // (8px, the content movement standard); otherwise it swaps in place.
  const prevEnabled = usePreviousCommit(enabled);
  const toggleChanged = prevEnabled !== enabled && prevEnabled !== undefined;

  // What the line shows. Shown: its words. Shutting (the tile opening): the
  // words it last showed, held, so the line fades and closes over them (a
  // swap to nothing emptied the line before it could move, so the body
  // opened alone, not as one swap with the line). Shut and landed: nothing.
  const [held, setHeld] = useState<{ status: Status; text: ReactNode }>({
    status,
    text: line,
  });
  if (lineShown && (held.status !== status || held.text !== line))
    setHeld({ status, text: line });
  const shown = lineShown
    ? { status, text: line }
    : lineBody.landed
      ? { status: null, text: null }
      : held;
  const shownText =
    shown.text != null && shown.text !== false && shown.text !== '';

  const Icon = shown.status ? STATUS_ICON[shown.status] : null;
  const lineContent = shownText ? (
    <span
      className={cx(
        'cds-options-tile__summary',
        shown.status && `cds-options-tile__summary--${shown.status}`
      )}>
      {Icon ? (
        <Icon
          size={16}
          className="cds-options-tile__status-icon"
          aria-hidden="true"
        />
      ) : null}
      <span className="cds-options-tile__summary-text">{shown.text}</span>
    </span>
  ) : null;

  const titles = (
    <span className="cds-options-tile__titles">
      <span id={titleId} className="cds-options-tile__title">
        {title}
      </span>
      <span
        ref={lineRef}
        className="cds-disclosure__body cds-options-tile__line"
        data-shown={wordsShown || undefined}
        {...lineBody.bodyProps}>
        <span className="cds-disclosure__clip">
          <span ref={lineContentRef} className="cds-disclosure__content">
            <SwapSlot
              swapKey={shownText ? keyOf(shown.status, shown.text) : 'none'}
              reduced={reduced}
              timeScale={scale}
              axis={toggleChanged ? 'x' : 'y'}
              // The side the new words come from, inline: on, the knob went
              // to the end, so the new words come from the start.
              direction={enabled ? -1 : 1}
              distance={toggleChanged ? undefined : 0}>
              {lineContent}
            </SwapSlot>
          </span>
        </span>
      </span>
    </span>
  );

  return (
    <div
      {...rest}
      ref={tileRef}
      style={
        timeScale != null
          ? {
              ...rest.style,
              ['--cds-options-tile-fade' as string]: `${motionTokens.duration['fast-01'] * timeScale}ms`,
            }
          : rest.style
      }
      className={cx(
        'cds-options-tile',
        `cds-options-tile--${size}`,
        shownOpen && 'cds-options-tile--open',
        sheet && 'cds-options-tile--sheet',
        expandable && 'cds-options-tile--expandable',
        status && `cds-options-tile--${status}`,
        className
      )}>
      <div ref={headRef} className="cds-options-tile__header">
        {expandable ? (
          <button
            ref={headingRef}
            type="button"
            id={headingId}
            className="cds-options-tile__heading"
            // The switch over its end: a fill would take the track's step to about 1:1.
            data-rollover-surface={enabled !== undefined ? 'ring' : undefined}
            aria-expanded={open}
            aria-controls={bodyId}
            data-motion-icon-frame=""
            onClick={() => {
              const next = !isOpen;
              setIsOpen(next);
              onToggle?.(next);
            }}>
            <span className="cds-options-tile__chevron">
              <ChevronDownUpToggle
                size={16}
                toggled={open}
                disableToggle
                aria-hidden="true"
              />
            </span>
            {titles}
          </button>
        ) : (
          <div
            id={headingId}
            className="cds-options-tile__heading cds-options-tile__heading--static">
            {titles}
          </div>
        )}
        {enabled !== undefined ? (
          <div className="cds-options-tile__switch">
            <Toggle
              id={toggleId}
              size="sm"
              labelText={title}
              hideLabel
              labelA=""
              labelB=""
              toggled={enabled}
              readOnly={locked}
              motion={{ timeScale: scale }}
              onToggle={(value, id, event) => onChange?.(value, id, event)}
            />
          </div>
        ) : null}
      </div>
      {expandable ? (
        <div
          ref={bodyRef}
          id={bodyId}
          role="region"
          aria-labelledby={titleId}
          className="cds-disclosure__body cds-options-tile__body"
          data-hold-edge=""
          {...body.bodyProps}>
          <div className="cds-disclosure__clip">
            <div className="cds-disclosure__content cds-options-tile__content">
              <KitDefaults frame="ghost" containerCorners="rounded">
                {children}
              </KitDefaults>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
OptionsTile.displayName = 'OptionsTile';

/** The sheet's fade (`--cds-options-tile-sheet`, read by the sheet and the rings' edge) and the
 *  heading's corners (`cornersOver`); a turn fades on from where it is, at the same rate. */
function playSheet(
  tile: HTMLElement,
  body: HTMLElement,
  heading: HTMLElement,
  opening: boolean,
  from: number,
  clock: number,
  step: keyof typeof motionTokens.duration,
  timeScale: number | undefined
): Animation[] {
  // The fade's token from the motion's own step, never the slowed clock.
  const token = snapFadeFor(motionTokens.duration[step]);
  const fade = Math.min(
    clock / 2,
    timeScale != null
      ? motionTokens.duration[token] * timeScale
      : tokenMs(body, token)
  );
  const to = opening ? 1 : 0;
  const frames = [
    { '--cds-options-tile-sheet': String(from) },
    { '--cds-options-tile-sheet': String(to) },
  ];
  // Opening, at once. Shutting from a whole sheet, over the motion's last `fade`; from a part one
  // (an opening turned in its fade), at once, so it never steps back to whole first.
  const sheet = opening
    ? tile.animate(frames, { duration: fade * (1 - from), easing: 'linear' })
    : tile.animate(frames, {
        delay: from < 1 ? 0 : clock - fade,
        duration: fade * from,
        easing: 'linear',
        fill: 'forwards',
      });
  return [sheet, cornersOver(body, heading, opening, clock)];
}

/** The tile's corner radius, px. */
const RADIUS = 8;

/** The heading's lower corners, round as far as they're the tile's: 8px less the
 *  body under them, on the body's clock and curve, so they never snap. */
function cornersOver(
  body: HTMLElement,
  heading: HTMLElement,
  opening: boolean,
  clock: number
): Animation {
  const rows = transitionOf(body, 'grid-template-rows');
  const curve = /cubic-bezier\(([^)]+)\)/.exec(
    String(rows?.effect?.getTiming().easing ?? '')
  );
  const bez = (
    curve ? curve[1]!.split(',').map(Number) : [0, 0, 1, 1]
  ) as CubicBezier;
  const content = body.firstElementChild
    ?.firstElementChild as HTMLElement | null;
  const h0 = parseFloat(getComputedStyle(body).height) || 0;
  const h1 = opening && content ? content.offsetHeight : 0;
  const frames: Keyframe[] = [];
  for (let i = 0; i <= 48; i++) {
    const p = i / 48;
    const r = `${Math.min(RADIUS, Math.max(0, RADIUS - (h0 + (h1 - h0) * evaluateCurve(bez, p))))}px`;
    frames.push({ offset: p, borderEndStartRadius: r, borderEndEndRadius: r });
  }
  return heading.animate(frames, {
    duration: clock,
    easing: 'linear',
    fill: 'forwards',
  });
}

/* ── the summary's content swap ───────────────────────────────────────── */

interface Shown {
  key: string;
  node: ReactNode;
}

/**
 * A slot whose content swaps out, then in, when `swapKey` changes (`playContentSwap`). Along
 * x, `direction` is inline, so in RTL the words still follow the knob. The leaving content is
 * kept, over the new, until it's out; a change mid-swap turns each from where it is.
 */
function SwapSlot({
  swapKey,
  children,
  reduced,
  timeScale,
  axis = 'y',
  direction = 1,
  distance,
}: {
  swapKey: string;
  children: ReactNode;
  reduced: boolean;
  timeScale: number;
  axis?: 'x' | 'y';
  direction?: number;
  distance?: number;
}) {
  const [shown, setShown] = useState<Shown>({ key: swapKey, node: children });
  const [leaving, setLeaving] = useState<Shown | null>(null);
  if (swapKey !== shown.key) {
    setLeaving(shown.node ? shown : null);
    setShown({ key: swapKey, node: children });
  } else if (children !== shown.node) {
    setShown({ key: swapKey, node: children });
  }

  const inRef = useRef<HTMLSpanElement>(null);
  const outRef = useRef<HTMLSpanElement>(null);
  const first = useRef(true);
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const incoming = inRef.current;
    if (!incoming) return;
    // From nothing: the line is opening, and its own fade brings the words
    // in from its first frame (options-tile.scss), so no swap on top.
    if (!outRef.current) return;
    const rtl = axis === 'x' && getComputedStyle(incoming).direction === 'rtl';
    const swap = playContentSwap({
      out: outRef.current,
      in: incoming,
      axis,
      direction: rtl ? -direction : direction,
      distance,
      timeScale,
      reduced,
    });
    let live = true;
    const done = () => live && setLeaving(null);
    if (swap.outAnimation) swap.outAnimation.finished.then(done, () => {});
    else done();
    return () => {
      live = false;
    };
    // Per swap: a new key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown.key]);

  return (
    <span className="cds-options-tile__swap">
      {leaving ? (
        <span
          ref={outRef}
          key={`out-${leaving.key}`}
          className="cds-options-tile__swap-item"
          aria-hidden="true">
          {leaving.node}
        </span>
      ) : null}
      <span ref={inRef} key={shown.key} className="cds-options-tile__swap-item">
        {children}
      </span>
    </span>
  );
}
