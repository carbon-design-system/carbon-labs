/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type Ref,
} from 'react';
import { playCue, type CueSeverity, easingCss } from '@carbon-labs/v12-motion';
import {
  CheckmarkFilled,
  CircleDash,
  ErrorFilled,
  InformationFilled,
  InformationSquareFilled,
  PauseOutlineFilled,
  UnknownFilled,
  WarningAltFilled,
  WarningFilled,
  type MotionIconHandle,
  type ProcessStatus,
} from '@carbon-labs/react-motion-icons';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import { Spinner, spinnerMs, type SpinnerVariant } from './Spinner';
import { playHandoffIn, playHandoffOut } from './statusHandoff';
import './feedback.scss';

/* ============================================================================
 * The status mark — one mark per status, used by every feedback component
 * (a notification's icon first; next a field's validation icon and a
 * progress step's mark). Its icons are motion-icons.
 *
 *   beat      once its surface has landed, the mark plays its own motion
 *             once — the icon's motion-icons animation is the arrival's beat
 *   action    `icon`: a status-capable motion-icon (Save, CloudUpload,
 *             Renew …) in place of the kind's mark. It arrives plain and
 *             takes its status on the beat — the cut opens and the check,
 *             the spinner or the warning draws in (motion-icons' status
 *             layer): an alert whose icon loads in with its action.
 *             `pending` spins until the kind changes, then morphs in place
 *   change    a change of kind: a kind mark match-cuts to the new one and
 *             pops (motion-core `playCue`, severity-scaled, never a loop);
 *             an action icon morphs its status mark in place
 *   pending   `kind="pending"`: the kit's one Spinner (feedback/Spinner.tsx),
 *             neutral (`$icon-primary`), or `variant="hero"`: `--cds-hero-loader` (the
 *             kit's brand; `$interactive` with no brand).
 *             One mark from pending to its status (feedback rule 2), changing
 *             in place by the status hand-off (statusHandoff.ts),
 *             out then in, with no fades: the spinner shrinks
 *             4px, still turning (`fast-01`); then the status disc grows from
 *             4px under its size (`fast-02`); then success's check or error's
 *             slash draws on along its path (`fast-02`). The draw is the
 *             beat. Warning and info grow the same way, their glyph already
 *             in. Back to pending: the mark fades out (`fast-02`), then the
 *             spinner draws on (`moderate-01`). Changed mid-way, it turns
 *             round from where it is. Leaving the mark altogether (none) is
 *             the host's: InlineLoading fades its slot
 *   from      a mark mounted in another mark's place arrives as it would
 *             from that kind: a ProgressRing's ring, once shrunk, mounts its
 *             status mark `from="pending"`, so the disc grows and the glyph
 *             draws on (the hand-off's in)
 *   reduced  no beat; the mark is simply there (principle 4)
 * ========================================================================== */

export type FeedbackKind =
  | 'error'
  | 'info'
  | 'info-square'
  | 'success'
  | 'warning'
  | 'warning-alt';
/** A process's states with no severity: grey, told apart by their shapes. */
export type NeutralStatusKind = 'not-started' | 'paused' | 'unknown';
/** A status mark's kinds: the feedback kinds, the neutral ones, and pending (the spinner). */
export type StatusMarkKind = FeedbackKind | NeutralStatusKind | 'pending';

export const KIND_ICON = {
  error: ErrorFilled,
  success: CheckmarkFilled,
  warning: WarningFilled,
  'warning-alt': WarningAltFilled,
  info: InformationFilled,
  'info-square': InformationSquareFilled,
} as const;

export const NEUTRAL_ICON = {
  'not-started': CircleDash,
  paused: PauseOutlineFilled,
  unknown: UnknownFilled,
} as const;

/** A status-capable motion-icon (Save, CloudUpload, Renew, Send …). */
export type ActionIcon = ComponentType<{
  size?: 16 | 20 | 24 | 32;
  status?: ProcessStatus;
  tone?: boolean;
  'aria-label'?: string;
  ref?: Ref<MotionIconHandle>;
}>;

/** The cue's severity for a kind; the neutral kinds (and pending) have none, so no cue. */
export function severityOf(kind: StatusMarkKind): CueSeverity | null {
  if (kind === 'error') return 'error';
  if (kind === 'warning' || kind === 'warning-alt') return 'warning';
  if (kind === 'success') return 'success';
  if (kind === 'info' || kind === 'info-square') return 'info';
  return null;
}

/** The action icon's status for a kind (info has none: the icon alone says it). */
function statusOf(
  kind: StatusMarkKind,
  pending: boolean
): ProcessStatus | undefined {
  if (pending || kind === 'pending') return 'pending';
  if (kind === 'error') return 'error';
  if (kind === 'warning' || kind === 'warning-alt') return 'warning';
  if (kind === 'success') return 'success';
  return undefined;
}

export interface StatusMarkProps {
  /** The status. `pending` is the spinner; changing from it morphs in place. */
  kind: StatusMarkKind;
  /** The icon's accessible name (v11's `statusIconDescription`). Default `"<kind> icon"`. */
  description?: string;
  size?: MarkSize;
  /**
   * The mark this one takes the place of, as it mounts: it arrives as it would
   * from that kind. A ProgressRing's ring, once shrunk, mounts its status mark
   * `from="pending"`, so the disc grows and the check or slash draws on (the
   * status hand-off's in). Default: none, it is there from the start.
   */
  from?: StatusMarkKind;
  /** Play the beat after this many ms (the surface's own snap). `null`: it is there from the start — no beat. */
  arriveAfter?: number | null;
  /** An action icon in place of the kind's mark (not with `kind="pending"`). */
  icon?: ActionIcon;
  /** With `icon`: the action is under way (the icon's spinner). */
  pending?: boolean;
  // @carbon-proposal api: variant-prop — The colour treatment is one `variant` prop (inverse, tonal, outlined, hero, neutral or filled), so colour is never said by a role or a structure. TBD
  /** The pending spinner's `neutral` (default) or `hero` (the kit's brand, IBM blue by default). The status kinds keep their colours. */
  variant?: SpinnerVariant;
  className?: string;
}

type MarkSize = 16 | 20 | 24 | 32;
type Pt = [number, number];

/**
 * The status glyphs' centrelines at rest, per size, on the 32-unit box, in
 * the order they're drawn, and the knocked-out line's width. They are the
 * motion-icons drawings: success is CheckmarkFilled (`FILLED_CHECK`,
 * icons/status/states.ts), short arm first; error is ErrorFilled's slash
 * (`ERROR_ART`'s filled glyph: a band on the top-left → bottom-right
 * diagonal, `half` each way from the centre), from the top left. The draw-on
 * covers the glyph in the disc's colour and uncovers it along this line, so
 * where it lands is the icon itself.
 */
const CHECK_LINE: Record<MarkSize, { pts: Pt[]; w: number }> = {
  16: {
    pts: [
      [9.5, 15.8],
      [14, 20.3],
      [22.9, 11.6],
    ],
    w: 2.408,
  },
  20: {
    pts: [
      [9.6, 15.68],
      [13.92, 20],
      [22.4, 11.52],
    ],
    w: 2.263,
  },
  24: {
    pts: [
      [9.5333, 15.7333],
      [13.9333, 20.1333],
      [22.6, 11.6667],
    ],
    w: 2.36,
  },
  32: {
    pts: [
      [9.7953, 15.7954],
      [14, 20],
      [22.2079, 11.793],
    ],
    w: 2.25,
  },
};
const slashLine = (half: number, w: number) => {
  const a = half * Math.SQRT1_2;
  return {
    pts: [
      [16 - a, 16 - a],
      [16 + a, 16 + a],
    ] as Pt[],
    w,
  };
};
const SLASH_LINE: Record<MarkSize, { pts: Pt[]; w: number }> = {
  16: slashLine(8.768, 2.263),
  20: slashLine(9.051, 2.263),
  24: slashLine(9.24, 2.263),
  32: slashLine(8.8, 2.2),
};
/** The status discs' radius per size, on the 32-unit box (CheckmarkFilled's and ErrorFilled's, which match). */
const DISC_R: Record<MarkSize, number> = {
  16: 14,
  20: 14.4,
  24: 14.6667,
  32: 14,
};

const pathLength = (pts: Pt[]) =>
  pts
    .slice(1)
    .reduce((n, p, i) => n + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

/** The glyph a status draws on as it arrives from pending: success's check, error's slash. */
const drawnGlyph = (kind: StatusMarkKind) =>
  kind === 'success' ? CHECK_LINE : kind === 'error' ? SLASH_LINE : null;

/** The cover: the glyph's line, a little wider and a little longer each end, so no seam shows. Its glyph's length too, px. */
function coverPath(kind: StatusMarkKind, size: MarkSize) {
  const line = drawnGlyph(kind)?.[size];
  if (!line) return null;
  const { pts: g } = line;
  const out = (a: Pt, b: Pt, by: number): Pt => {
    const l = Math.hypot(a[0] - b[0], a[1] - b[1]);
    return [a[0] + ((a[0] - b[0]) / l) * by, a[1] + ((a[1] - b[1]) / l) * by];
  };
  const pts = [
    out(g[0], g[1], 0.8),
    ...g.slice(1, -1),
    out(g[g.length - 1], g[g.length - 2], 0.8),
  ];
  return {
    d: `M${pts.map((p) => p.map((v) => v.toFixed(3)).join(' ')).join('L')}`,
    len: pathLength(pts),
    w: line.w + 1,
    drawPx: (pathLength(g) * size) / 32,
  };
}

const curve = (name: 'entrance-productive' | 'exit-productive') =>
  easingCss(name);

export function StatusMark({
  kind,
  description,
  size = 20,
  from,
  arriveAfter = null,
  icon: Action,
  pending = false,
  variant = 'neutral',
  className,
}: StatusMarkProps) {
  const { reduced, timeScale } = useFeedbackMotion();
  const markRef = useRef<HTMLSpanElement>(null);
  const iconRef = useRef<MotionIconHandle>(null);
  const coverRef = useRef<SVGPathElement>(null);
  const prev = useRef<StatusMarkKind | null>(from ?? null);
  // An action icon arrives plain and takes its status on the beat.
  const [landed, setLanded] = useState(arriveAfter == null || reduced);
  // The kind on show: it trails `kind` while the spinner shrinks out, or while a mark fades out to pending.
  const [shown, setShown] = useState<StatusMarkKind>(kind);
  const [drawing, setDrawing] = useState(false);
  const latest = useRef(kind);
  /** A mark fading out to pending. */
  const leaving = useRef<Animation | null>(null);
  /** The spinner shrinking out to a status (the hand-off's out). */
  const shrinking = useRef<Animation[] | null>(null);
  /** The status's arrival (the hand-off's in). */
  const arriving = useRef<Animation[]>([]);
  const faded = useRef<Animation | null>(null);
  // Between two marks (neither pending), the new one is shown at once, and match-cuts.
  // Under reduced motion every change is: the new mark is simply there, its glyph drawn.
  if (
    shown !== kind &&
    (reduced || (shown !== 'pending' && kind !== 'pending'))
  )
    setShown(kind);
  // Pending → success or error: the glyph arrives covered, and draws on (the arrival, below).
  const [was, setWas] = useState<StatusMarkKind>(from ?? shown);
  if (was !== shown) {
    setWas(shown);
    setDrawing(
      was === 'pending' && drawnGlyph(shown) !== null && !reduced && !Action
    );
  }

  useEffect(() => {
    if (landed) return;
    const t = setTimeout(
      () => {
        setLanded(true);
        if (!Action) void iconRef.current?.play();
      },
      (arriveAfter ?? 0) * timeScale
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on arrival
  }, []);

  // A change of kind: to and from pending, out then in.
  useLayoutEffect(() => {
    latest.current = kind;
    if (Action) return;
    const mark = markRef.current;
    if (kind === 'pending') {
      const out = shrinking.current;
      if (out) {
        // Back before the spinner had gone: the shrink turns round.
        shrinking.current = null;
        out.forEach((a) => {
          a.reverse();
          a.finished.then(
            () => a.cancel(),
            () => {}
          );
        });
        return;
      }
      if (shown === 'pending' || reduced || !mark) return;
      // The mark fades out, then the spinner draws on.
      leaving.current?.cancel();
      const fade = mark.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: spinnerMs('fast-02', timeScale),
        easing: curve('exit-productive'),
        fill: 'forwards',
      });
      leaving.current = fade;
      fade.finished.then(
        () => {
          if (leaving.current !== fade) return;
          leaving.current = null;
          // Held at 0 until the spinner has taken its place (the arrival effect lets it go).
          faded.current = fade;
          setShown('pending');
        },
        () => {}
      );
      return;
    }
    if (leaving.current) {
      // Back before it had gone: the fade turns round.
      const fade = leaving.current;
      leaving.current = null;
      fade.reverse();
      fade.finished.then(
        () => fade.cancel(),
        () => {}
      );
      return;
    }
    if (shown !== 'pending' || shrinking.current) return;
    // The hand-off's out: the spinner shrinks 4px, opaque and still turning; then the status takes its place.
    const svg = mark?.querySelector<SVGSVGElement>('.cds-spinner');
    const out = svg ? playHandoffOut(svg, { timeScale, reduced }) : [];
    if (!out.length) {
      // Nothing to shrink: the status at once.
      setShown(kind);
      return;
    }
    shrinking.current = out;
    out[0].finished.then(
      () => {
        if (shrinking.current !== out) return;
        shrinking.current = null;
        setShown(latest.current);
      },
      () => {}
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- on a change of kind
  }, [kind]);

  // A mark arrives: from the spinner (the hand-off's in), or from another mark (the match cut).
  useLayoutEffect(() => {
    const was = prev.current;
    prev.current = shown;
    faded.current?.cancel();
    faded.current = null;
    // (Strict mode runs this twice on mount; the second run is no change, and leaves the arrival be.)
    if (was === shown) return;
    arriving.current.forEach((a) => a.cancel());
    arriving.current = [];
    if (was === null || Action || shown === 'pending') return;
    const mark = markRef.current;
    if (was !== 'pending') {
      const severity = severityOf(shown);
      if (severity)
        playCue(mark, severity, { reduced, timeScale, landed: false });
      return;
    }
    if (reduced || !mark) return;
    // The disc, opaque, grows from 4px under its size; then success's check or error's slash draws on. The draw is the beat.
    const glyph = coverPath(shown, size);
    const cover = glyph ? coverRef.current : null;
    const anims = playHandoffIn(mark, cover, {
      diameter: (2 * DISC_R[size] * size) / 32,
      drawPx: glyph?.drawPx ?? 0,
      coverLength: glyph?.len ?? 0,
      timeScale,
      reduced,
    });
    arriving.current = anims;
    if (!cover) return;
    const draw = anims[anims.length - 1];
    if (anims.length < 2 || !draw) {
      // Nothing to draw: the glyph at once.
      setDrawing(false);
      return;
    }
    draw.finished.then(
      () => arriving.current === anims && setDrawing(false),
      () => {}
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- on a change of the mark shown
  }, [shown]);

  const label = description ?? `${kind} icon`;
  const cover = drawing ? coverPath(shown, size) : null;
  let glyph;
  if (Action) {
    glyph = (
      <Action
        ref={iconRef}
        size={size}
        tone
        status={landed ? statusOf(kind, pending) : undefined}
        aria-label={label}
      />
    );
  } else if (shown === 'pending') {
    // It turns until the status takes its place: the hand-off shrinks it, turning, rather than closing its arc.
    glyph = <Spinner size={size} variant={variant} description={label} />;
  } else {
    const Icon =
      shown in NEUTRAL_ICON
        ? NEUTRAL_ICON[shown as NeutralStatusKind]
        : KIND_ICON[shown as FeedbackKind];
    glyph = <Icon ref={iconRef} size={size} aria-label={label} />;
  }
  return (
    <span
      className={[
        'fb-mark',
        `fb-mark--${Action ? kind : shown}`,
        Action ? 'fb-mark--action' : '',
        variant === 'hero' && 'fb-mark--hero',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ '--fb-mark-size': `${size}px` } as CSSProperties}
      data-mark={Action ? undefined : shown}>
      <span ref={markRef} className="fb-mark__icon">
        {glyph}
        {cover && (
          <svg
            className="fb-mark__draw"
            viewBox="0 0 32 32"
            width={size}
            height={size}
            aria-hidden="true">
            <path
              ref={coverRef}
              d={cover.d}
              strokeWidth={cover.w}
              strokeDasharray={`${cover.len} ${cover.len + 1}`}
            />
          </svg>
        )}
      </span>
    </span>
  );
}
