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
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type KeyboardEventHandler,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import {
  motionTokens,
  selectionDuration,
  usePrefersReducedMotion,
  type SelectionMoveInfo,
  easingCss,
} from '@carbon-labs/v12-motion';
import {
  SELECTION_KIT_MOTION,
  resolveReach,
  stretchForLength,
  useLatest,
  useSelectionEngine,
  wallSquash,
  type SelectionMotion,
} from '@carbon-labs/react-selection-kit';
import {
  SkeletonPlaceholder,
  SkeletonText,
  useSkeletonReveal,
} from '@carbon-labs/react-feedback';
import { RollText } from '@carbon-labs/react-roll-text';
import {
  FieldMessage,
  TextInput,
  normalizeFieldProps,
  useLateStatus,
  type FieldStatus,
} from '@carbon-labs/react-text-input';
import {
  createDotField,
  DOT_BEHAVIORS,
  DOT_PHYSICS as FIELD_PHYSICS,
  type DotBehaviors,
  type DotField,
  type DotFieldOptions,
  type DotPhysics,
} from '@carbon-labs/v12-motion';
import { watchSurface } from './statusColor';
import { onThemeChange } from '@carbon-labs/react-util';
import { attachTwinkleWave, type TwinkleWave } from './twinkleWave';
import {
  useWithTimeScale,
  type SliderShape,
  type SliderVariant,
} from '@carbon-labs/react-props';
import './slider.scss';
import { useFormFieldState } from '@carbon-labs/react-util';

/* ============================================================================
 * Slider — Carbon's Slider (v11's API: one knob or two, the number fields), on
 * the selection family's motion. A step slider is this slider with `steps`.
 * ============================================================================
 *
 *   knob     motion-core `attachSelection`'s marker, resting on an invisible
 *            spot placed at the value (`.cds-slider__spot`, a CSS percentage, so
 *            a resize re-places it). A key or a click glides there (duration
 *            from the distance, the leading edge's stretch from the line's
 *            length); a held key's repeats move at once (the engine)
 *   hit      each knob's hit area is at least 24 × 24px, centered on its value
 *            (bigger than the knob, and covering it hovered); where a range's
 *            two overlap, the knob whose center is nearer takes the hover and
 *            the press
 *   states   the hover grows the knob 2px; a pointer press takes back 1px of
 *            it (1px above rest); a press with no hover (a key, a touch) insets
 *            it 1px. A drag is a press
 *   shapes   `knobShape`: a vertical pill (a stroke round a surface-colored
 *            center; one knob or two), or triangles with a stem (two)
 *   press    on the line: the knob reaches toward the pressed point; the
 *            release lands there
 *   drag     continuous: follows the pointer exactly and squashes against the
 *            ends (and the other knob); begun from a press, it glides to the
 *            pointer first. `snap`: the knob glides stop to stop as the pointer
 *            passes each halfway point, and with `sticky` (the default) only
 *            once it is a little past it, the same distance both ways, so a
 *            resting finger can't chatter between two stops; while it holds,
 *            the knob leans toward the pull, at most 3px
 *   fill     rides the knob's live center on every frame (the engine's CSS
 *            variables). Two knobs are two engines, the upper nested in the
 *            lower; the track aliases the lower's edges (`--cds-lo-*`) so the
 *            fill, inside the upper, reads both. `fillStyle`: on hover and
 *            press it steps toward the knob's contrast, grows thicker (on
 *            hover only, no press growth), or both.
 *            `status` colors it (a soft-edged wipe from the knob on a change;
 *            at once with reduced motion),
 *            solved for 3:1 against the surface it sits on (`statusColor.ts`);
 *            the knob looks the same with or without a status;
 *            `gradient` maps a ramp to the track that the fill reveals
 *   ticks    quiet marks along the line, at the steps or an interval. On
 *            the track shape they are dots, and targets: the hovered dot
 *            grows, and a press on it glides the knob there (continuous:
 *            within 12px of a dot; snapping: the nearest)
 *   reference a solid mark at a second value (the last set value, a
 *            baseline), as the duration bar drew it; hidden under the knob
 *   steps    `steps`: a few named stops (the step slider). The value is a
 *            step's index (onChange also passes the step); it snaps, shows its
 *            stops, and can show the steps'
 *            labels under the track (`stepLabels`) and the current one beside
 *            the label, rolling (`readout`, `RollText`)
 *   meeting  two knobs: triangles stop dead where their stems
 *            meet (no overdrag past it), the shared stem 2px taller; pills and circles push each other
 *            along. Pills are drawn as one goo layer (an SVG blur and alpha
 *            threshold): as they near they swell into one smooth blob, a
 *            lava lamp, with one even outline; circles overlapping fill their
 *            intersection with the joined pill's fill, Venn-style. On one
 *            value either becomes one pill (pills 2px wider than a knob,
 *            circles 4px; a circle becomes a pill knob: the surface inside a
 *            ring), with a line at the seam so both values read. Let go
 *            within 4px of each other, they snap together. Two thumbs still,
 *            to the keys and assistive tech
 *   ai knob  in AI mode (on the special step of an `ai` slider) the knob is a
 *            circle in the AI dot color inside a ring in the knob's own color,
 *            scaling in from its center, and back out on leaving
 *   shape    `line` (default): a thin line and a round knob. `track`: a 24px
 *            track the knob sits in (the step slider's look), its stops as
 *            dots that grow toward the pointer, `corners`, `base` (inset inside
 *            the slider's box, the default, or flush), and
 *            `ai`: the projection texture on the fill (carbon-motion's
 *            `dotField`), twinkling and shimmering; on the special step, in
 *            from the knob, out left to right (`twinkleWave.ts`).
 *            `knob`: the track's knob, stops and base, no fill
 *   fields   the kit's TextInput: sync, clamping and correction on blur or
 *            Enter; one message line under the slider (FieldMessage)
 *   ring     the keyboard's only (`data-input`): round the focused knob
 *   readonly a fixed value, not a control (not v11's read-only look): a
 *            bar to the value (or between two) on the slider's
 *            geometry, half its height, no knob, no stops, no hover; the
 *            value as text in the field's column; `role="meter"`. The `knob`
 *            shape: its base and no fill, a solid dot at the value
 *   loading  the knob's band is one skeleton block (the value is data); the
 *            line, labels and the fields' frames are real
 * ========================================================================== */

export type SliderHandlePosition = 'lower' | 'upper';
export type SliderStatus = 'none' | 'success' | 'warning' | 'error' | 'info';
export type SliderTranslationKey = 'carbon.slider.auto-correct-announcement';

/** One stop of a step slider (`steps`). */
export interface SliderStep {
  label?: ReactNode;
  /** The step's text for assistive tech, when `label` isn't a string. */
  valueText?: string;
  /** A special step: its dot and readout take the AI color (IBM blue). On an `ai` slider with more than two steps, the last by default. */
  special?: boolean;
}

/**
 * What `onChange` and `onRelease` are told. With `steps`, `value` is a step's
 * index (0…n − 1) and `step` is that step itself (`stepUpper` the upper
 * handle's, with two). Without `steps`, both are undefined.
 */
export interface SliderChangeData {
  value: number;
  valueUpper: number | undefined;
  /** With `steps`: the step at `value`. */
  step?: SliderStep;
  /** With `steps` and two handles: the step at `valueUpper`. */
  stepUpper?: SliderStep;
}

export interface SliderProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  | 'onChange'
  | 'onBlur'
  | 'value'
  | 'defaultValue'
  | 'size'
  | 'min'
  | 'max'
  | 'step'
  | 'type'
  | 'children'
> {
  /** The `<input>`'s aria-label (two handles: the lower knob's and input's). */
  ariaLabelInput?: string;
  /** Two handles: the upper knob's and input's aria-label. */
  unstable_ariaLabelInputUpper?: string;
  /** Accepted, as in v11 (which doesn't render them). */
  children?: ReactNode;
  /** On the wrapper. */
  className?: string;
  disabled?: boolean;
  /** Formats the min / max labels, `aria-valuetext` and the readout. With `steps`: the step's text. */
  formatLabel?: (value: number, label: string | undefined) => string;
  /** No number field: the value is shown beside the label (`readout`), and posted by a hidden input. Default with `steps`. */
  hideTextInput?: boolean;
  /** The knob's id (one handle); the inputs' ids derive from it. */
  id?: string;
  /** The number field's `type`. Default `number`. */
  inputType?: string;
  invalid?: boolean;
  invalidText?: ReactNode;
  labelText?: ReactNode;
  hideLabel?: boolean;
  /** Deprecated in v11 for `<Layer>`: the fields take `$field-02`. */
  light?: boolean;
  /** The number line's ends (v11 requires them). With `steps`: 0 and the last step's index, set for you. */
  min?: number;
  max?: number;
  maxLabel?: string;
  minLabel?: string;
  name?: string;
  unstable_nameUpper?: string;
  /** A number field lost focus. */
  onBlur?: (data: {
    value: string;
    handlePosition: SliderHandlePosition | undefined;
  }) => void;
  /** The value changed. With `steps`, `value` is the step's index and `step` the step (`SliderChangeData`). */
  onChange?: (data: SliderChangeData) => void;
  onInputKeyUp?: KeyboardEventHandler<HTMLInputElement>;
  /** A press or drag ended. */
  onRelease?: (data: SliderChangeData) => void;
  readOnly?: boolean;
  required?: boolean;
  /** The value's increment, for the pointer and the keys. Default 1. */
  step?: number;
  /** Shift + arrow and Page Up / Down move `step × stepMultiplier` (v11's code; its docs say `(max − min) / stepMultiplier`). Default 4; with `steps`, a quarter of them. */
  stepMultiplier?: number;
  translateWithId?: (
    id: SliderTranslationKey,
    args?: { correctedValue?: string }
  ) => string;
  /** The value (two handles: the lower one; with `steps`, a step's index). v11's: it seeds the slider and re-syncs it when it changes. */
  value: number;
  /** Two handles: the upper value. */
  unstable_valueUpper?: number;
  warn?: boolean;
  warnText?: ReactNode;

  /* ── Beyond Carbon's API ─────────────────────────────────────────────── */

  /** The knob: sm 10 · md 14 (default, v11's) · lg 18px. The fields follow (sm 32 · md 40 · lg 48). The `track` shape: 16 · 24 · 32px tall. */
  size?: 'sm' | 'md' | 'lg';
  /**
   * The knob moves in fixed increments: `true` at `step`, or a number (value units).
   * A drag glides it stop to stop as the pointer passes each halfway point; a
   * click lands on the nearest. Keys still move by `step`. Default off; on with `steps`.
   */
  snap?: boolean | number;
  /** Marks along the line: `true` at the snap increments (else each `step`), or every n value units. Hidden when closer than 4px. Default off; on with `steps`. On the `track` shape they are dots. */
  ticks?: boolean | number;
  /** The filled section's hover and press: `both` (default) steps toward the knob's color and is 3px on hover (2px at rest; a press keeps the hover's weight, it doesn't grow); `contrast` the color only; `thickness` the weight only. The `track` shape's plain fill doesn't step (a status still does). */
  fillStyle?: 'contrast' | 'thickness' | 'both';
  /**
   * Snapping: how far (px) past the halfway point the pointer must go before
   * the knob leaves its stop, each way (hysteresis). `true` (default): a
   * quarter of a stop's travel, at most 8px; `false`: at the halfway point.
   */
  sticky?: boolean | number;
  /** `round` (default), a vertical `pill` (one knob or two), or `triangle`s with a stem (two knobs only). The `track` shape's knob is round. */
  knobShape?: 'round' | 'triangle' | 'pill';
  /** The filled section in a support color (the knob is unchanged). A change wipes in from the knob along the fill, with a soft edge. */
  status?: SliderStatus;
  /** A ramp fixed to the track, revealed by the fill (a status overrides it). Decoration: the value must read without it. */
  gradient?: 'none' | 'red-green' | 'cold-warm';
  /** The slider's shape (as `knobShape` is the knob's). `line` (default): a thin line and a round knob. `track`: the knob sits in a 24px track (16 / 32 at sm / lg), filled up to it; the step slider's look. `knob`: the track's knob, stops and base with no fill, for an ordered choice where a fill would read as an amount. */
  shape?: SliderShape;
  /**
   * The treatment. `inverse` (default) or `hero`: the selection kit's hero,
   * the knob and the fill in the
   * kit's brand (`--cds-hero`: IBM blue, `$interactive`, unless `KitDefaults
   * brand` sets another hue), for the one emphasized control on a page. Not
   * with `ai` (its blue texture would vanish on a blue fill) or a status (the
   * fill is the status's).
   */
  variant?: SliderVariant;
  /** The `track` and `knob` shapes' base (the part behind the fill): `inset` (default) 2 / 3 / 4px inside the slider's box (sm / md / lg, the knob's own inset), concentric, so the fill and the knob stand proud of it; or `flush` with the box. */
  base?: 'flush' | 'inset';
  /** The `track` shape's corners: `full` (default), `rounded` (8px), `square`. */
  corners?: 'full' | 'rounded' | 'square';
  /** The `track` shape, one knob: the projection texture (an AI choice) on the fill, the knob its lens. Under reduced motion it holds still. */
  ai?: boolean;
  /** `ai`: the texture's behaviors, each a switch; omitted keys take `DOT_BEHAVIORS`. */
  dots?: Partial<DotBehaviors>;
  /** `ai`: the texture's spring dials; omitted keys take `DOT_PHYSICS`. */
  dotPhysics?: Partial<DotPhysics>;
  /** Step mode: a few named stops, a count (0…n − 1) or the steps; the value is a step's index, and `onChange` / `onRelease` also pass the step itself (`data.step`). Sets `min`, `max`, `snap`, `ticks` and `hideTextInput`. */
  steps?: number | SliderStep[];
  /** With `steps`: the steps' labels under the track, the current one primary. */
  stepLabels?: boolean;
  /** The value beside the label. Default: shown with `hideTextInput`, except with `steps`. With `steps` it is the step's label, rolling as it changes. */
  readout?: boolean;
  /** With `steps`, the readout's roll: `vertical` (default, up and down) or `horizontal` (left and right). */
  readoutDirection?: 'vertical' | 'horizontal';
  /**
   * A second value marked across the track with a solid line: the last set value,
   * or a baseline to compare against. Hidden while the knob is on it. One knob only.
   */
  reference?: number | null;
  /** The value is loading (the component loading standard). */
  loading?: boolean;
  /** The selection kit's motion dials (stretch, reach, drag, timeScale …). */
  motion?: Partial<SelectionMotion>;
  /** Slow motion: multiplies the durations. Default 1. Wins over `motion.timeScale`. */
  timeScale?: number;
  /** Called on every glide, for a readout of each move. */
  onMove?: (info: SelectionMoveInfo) => void;
}

const DEFAULT_TRANSLATIONS: Record<SliderTranslationKey, string> = {
  'carbon.slider.auto-correct-announcement':
    'The inputted value "{correctedValue}" was corrected to the nearest allowed digit.',
};
const defaultTranslate: NonNullable<SliderProps['translateWithId']> = (
  id,
  args
) =>
  DEFAULT_TRANSLATIONS[id].replace(
    '{correctedValue}',
    args?.correctedValue ?? ''
  );
const defaultFormatLabel = (value: number, label: string | undefined) =>
  `${value}${label ?? ''}`;
const textOf = (n: ReactNode): string =>
  typeof n === 'string' || typeof n === 'number' ? String(n) : '';

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
/** A drag starts past this many px. */
const DRAG_SLOP = 3;
const FIELD_SIZE = { sm: 'sm', md: 'md', lg: 'lg' } as const;
/** The knob's diameter (slider.scss), for the ticks' spacing before layout: the line's, the track's. */
const KNOB_PX = { sm: 10, md: 14, lg: 18 } as const;
const TRACK_KNOB_PX = { sm: 12, md: 18, lg: 24 } as const;
/** The `track` shape: the knob's inset from the track's edge (slider.scss `--sl-inset`). */
const TRACK_INSET = { sm: 2, md: 3, lg: 4 } as const;
/** `sticky: true`: a quarter of a stop's travel, at most this many px. */
const STICKY_MAX = 8;
/** Sticky snapping's lean: the most the knob leans toward the pull while it holds, px. */
const LEAN_MAX = 3;
/**
 * `ai`: how far the texture reaches from the knob before it has dissolved away, as a share of the
 * track's width (the field's default is 0.65). The field's `dissolveReach`; 1 is the longest
 * that still fades to nothing inside the track.
 */
const AI_REACH = 1;
/** `ai`: the texture's dials by default: the field's, reaching `AI_REACH`. */
export const DOT_PHYSICS: DotPhysics = {
  ...FIELD_PHYSICS,
  dissolveReach: AI_REACH,
};
/** A continuous track's stop dot is a target this far either side of its center, px (half of 24px). */
const DOT_REACH = 12;
/** Two pills' goo filter, by size: its blur (how early they start to join: about twice this, px, apart) and the stroke it erodes for the fill (the pill's `--_ring`). */
const GOO_BLUR = { sm: 2.4, md: 3, lg: 3.4 } as const;
const GOO_RING = { sm: 2, md: 3, lg: 3 } as const;
/** The goo's edges, anti-aliased after the threshold (a sub-pixel blur, px). */
const GOO_AA = 0.3;
/**
 * Two pills are filtered (the goo) only this close, gap px: `GOO_NEAR` blurs plus `GOO_SLACK`
 * (about 26px at md). The goo joins them from about twice the blur apart; the slack covers the
 * hover's growth, the merge and the lean, which move their edges without a value change.
 */
const GOO_NEAR = 6;
const GOO_SLACK = 8;
/** Pills and circles let go this close to each other (the gap between them, px) snap together and join. */
const JOIN_GAP = 4;
/** Two knobs' hit areas overlapping: the hover stays on its knob until the other is nearer by this much, px. */
const HOVER_HOLD = 4;

type Pair = { lower: number; upper: number | undefined };
interface Gesture {
  id: number;
  handle: SliderHandlePosition;
  mode: 'press' | 'grab' | 'drag';
  x0: number;
  /** The pointer's offset from the knob's center at the grab. */
  grabD: number;
  /** A drag begun from a press glides to the pointer first (until `catchBy`, or within 2px); then it follows exactly. */
  caught: boolean;
  catchBy: number;
  /** The value the release lands on. */
  value: number;
  /** The value when the gesture began. */
  start: number;
  /** A touch: its press has no hover, so the knob insets. */
  touch: boolean;
  /** Snapping: held at a wall by the squash. */
  walled: boolean;
  /** Two knobs on one value: which one the press took waits for the drag's first move (its direction). */
  undecided?: boolean;
  /** Two knobs: the grabbed one has met the other and pushes it along (the other yields). */
  pushing?: boolean;
}

export function Slider({
  ariaLabelInput,
  unstable_ariaLabelInputUpper: ariaLabelInputUpper,
  children,
  className,
  disabled: ownDisabled = false,
  formatLabel: formatLabelProp,
  hideTextInput: hideTextInputProp,
  id: idProp,
  inputType = 'number',
  invalid,
  invalidText,
  labelText,
  hideLabel = false,
  light = false,
  max: maxProp,
  maxLabel,
  min: minProp,
  minLabel,
  name,
  unstable_nameUpper: nameUpper,
  onBlur,
  onChange,
  onInputKeyUp,
  onRelease,
  readOnly: ownReadOnly = false,
  required,
  step: stepProp = 1,
  stepMultiplier: stepMultiplierProp = 4,
  translateWithId: t = defaultTranslate,
  value: valueProp,
  unstable_valueUpper: valueUpperProp,
  warn = false,
  warnText,
  size = 'md',
  snap: snapProp = false,
  ticks: ticksProp,
  fillStyle = 'both',
  sticky = true,
  knobShape = 'round',
  status = 'none',
  gradient = 'none',
  shape = 'line',
  variant,
  base = 'inset',
  corners = 'full',
  ai = false,
  dots: dotsProp,
  dotPhysics: physicsProp,
  steps,
  stepLabels = false,
  readout: readoutProp,
  readoutDirection = 'vertical',
  reference,
  loading = false,
  motion: motionProp,
  timeScale,
  onMove,
  ...rest
}: SliderProps) {
  // A FormSection's disabled and read-only reach every field in it.
  const { disabled, readOnly } = useFormFieldState(ownDisabled, ownReadOnly);
  const motion = useWithTimeScale(motionProp, timeScale);
  void children; // accepted, not rendered (v11)
  const autoId = useId();
  const id = idProp ?? `cds-slider-${autoId.replace(/:/g, '')}`;
  const labelId = `${id}-label`;
  const gooId = `cds-slider-goo-${autoId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const twoHandles = valueUpperProp !== undefined;
  /** The `knob` shape is the track's knob, stops and base, with no fill. */
  const hero = variant === 'hero';
  const track = shape !== 'line';
  const bare = shape === 'knob';

  /* ── step mode: a step's index on 0…n − 1, snapping, its stops shown ── */
  const stepList = useMemo<SliderStep[] | null>(
    () =>
      steps == null
        ? null
        : typeof steps === 'number'
          ? Array.from({ length: Math.max(1, steps) }, () => ({}))
          : steps,
    [steps]
  );
  const stepped = stepList !== null;
  const n = stepList?.length ?? 0;
  const min = stepped ? 0 : (minProp ?? 0);
  const max = stepped ? Math.max(0, n - 1) : (maxProp ?? 100);
  const step = stepped ? 1 : stepProp;
  const stepMultiplier = stepped
    ? Math.max(1, Math.round(n / 4))
    : stepMultiplierProp;
  const snap = stepped ? true : snapProp;
  const ticks = ticksProp ?? stepped;
  const hideTextInput = hideTextInputProp ?? stepped;
  const showReadout = readoutProp ?? (hideTextInput && !stepped);
  /** A step's text: its `valueText`, its label's text, or its index. */
  const stepText = (i: number) => {
    const s = stepList?.[i];
    return s?.valueText ?? (textOf(s?.label) || String(i));
  };
  const formatLabel =
    formatLabelProp ??
    (stepped ? (v: number) => stepText(v) : defaultFormatLabel);
  /** A special step: marked, or on an `ai` slider with more than two steps, the last. */
  const isSpecial = (i: number) =>
    !!stepList && (stepList[i]?.special ?? (ai && n > 2 && i === n - 1));
  const aiOn = ai && track && !bare && !twoHandles;
  /** Two knobs, by shape: triangles stop at each other; pills and circles meet and merge. */
  const triangles = !track && twoHandles && knobShape === 'triangle';
  const pills = !track && twoHandles && knobShape === 'pill';
  const circles = !track && twoHandles && knobShape === 'round';

  /* ── the values: v11's, seeded by the props and re-synced when they change ── */
  const [lower, setLower] = useState(valueProp);
  const [upper, setUpper] = useState(valueUpperProp);
  const [seen, setSeen] = useState([valueProp, valueUpperProp, min, max]);
  if (
    seen[0] !== valueProp ||
    seen[1] !== valueUpperProp ||
    seen[2] !== min ||
    seen[3] !== max
  ) {
    setSeen([valueProp, valueUpperProp, min, max]);
    setLower(valueProp);
    setUpper(valueUpperProp);
  }
  // The latest values for handlers between renders (a drag's moves).
  const vals = useRef<Pair>({ lower, upper });
  useLayoutEffect(() => {
    vals.current = { lower, upper };
  });

  /** The owner's data for a pair: the values, and with `steps` the steps themselves. */
  const changeData = (p: Pair): SliderChangeData =>
    stepList
      ? {
          value: p.lower,
          valueUpper: p.upper,
          step: stepList[p.lower],
          stepUpper: p.upper === undefined ? undefined : stepList[p.upper],
        }
      : { value: p.lower, valueUpper: p.upper };

  /** Set one handle's value and tell the owner, at once (v11 told it from an effect, which is what looped on fast keys). */
  const commit = (h: SliderHandlePosition, v: number): Pair => {
    const next =
      h === 'lower'
        ? { ...vals.current, lower: v }
        : { ...vals.current, upper: v };
    if (next.lower === vals.current.lower && next.upper === vals.current.upper)
      return next;
    vals.current = next;
    if (h === 'lower') setLower(v);
    else setUpper(v);
    onChange?.(changeData(next));
    return next;
  };

  /** Set both handles at once (a pushed knob moves with the one pushing it): one change for the owner. */
  const commitPair = (lo: number, hi: number): Pair => {
    const next = { lower: lo, upper: hi };
    if (next.lower === vals.current.lower && next.upper === vals.current.upper)
      return next;
    vals.current = next;
    setLower(lo);
    setUpper(hi);
    onChange?.(changeData(next));
    return next;
  };

  /* ── v11's arithmetic ── */
  const decimals = (step.toString().split('.')[1] ?? '').length;
  const fix = (v: number) => Number(v.toFixed(decimals));
  const frac = (v: number) =>
    max === min ? 0 : clamp((v - min) / (max - min), 0, 1);
  /** The value at a share of the track, on `by` (`step`; the last increment is `max`). */
  const quantize = (f: number, by = step) => {
    const count = Math.floor((max - min) / by) + 1;
    const i = Math.round(clamp(f, 0, 1) * (count - 1));
    return fix(i === count - 1 ? max : min + by * i);
  };
  /** The snap increment, or 0: continuous. */
  const inc =
    snap === true ? step : typeof snap === 'number' && snap > 0 ? snap : 0;
  /** Each handle stays its side of the other. */
  const bounds = (h: SliderHandlePosition): [number, number] =>
    !twoHandles
      ? [min, max]
      : h === 'lower'
        ? [min, vals.current.upper ?? max]
        : [vals.current.lower, max];
  const valueOf = (h: SliderHandlePosition) =>
    h === 'lower' ? vals.current.lower : (vals.current.upper ?? max);

  /* ── the engines: one per knob ── */
  const [length, setLength] = useState(300);
  const m: SelectionMotion = {
    ...SELECTION_KIT_MOTION,
    stretch: stretchForLength(length),
    ...motion,
  };
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  /** The track's geometry (`geom`), read once until the next render or resize. */
  const geomCache = useRef<{
    w: number;
    h: number;
    top: number;
    lo: number;
    hi: number;
  } | null>(null);
  const upperRootRef = useRef<HTMLDivElement>(null);
  const spot = {
    lower: useRef<HTMLSpanElement>(null),
    upper: useRef<HTMLSpanElement>(null),
  };
  const field = useRef<DotField | null>(null);
  const layoutKey = `${size}/${twoHandles}/${shape}`;
  /** Two pills: the goo filter's watch while a knob glides (`watchGoo`, below). */
  const gooWatch = useRef<(ms: number) => void>(() => {});
  // Every glide wakes the texture's springs (the knob is its lens), and the pills' goo.
  const onGlide = (info: SelectionMoveInfo) => {
    field.current?.wake(info.ms + 80);
    gooWatch.current(info.ms);
    onMove?.(info);
  };
  const sel = {
    lower: useSelectionEngine({
      rootRef: trackRef,
      itemSelector: '.cds-slider__spot--lower',
      motion: m,
      reduced,
      onMove: onGlide,
      getRest: () => spot.lower.current,
      layoutKey,
    }),
    upper: useSelectionEngine({
      rootRef: upperRootRef,
      itemSelector: '.cds-slider__spot--upper',
      motion: m,
      reduced,
      onMove: onGlide,
      getRest: () => spot.upper.current,
      layoutKey,
    }),
  };
  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      geomCache.current = null;
      setLength(el.offsetWidth);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const gesture = useRef<Gesture | null>(null);
  /** Glide a knob to rest on its value (no wrap: the engine reads an arrow's direction, and ↑ moves this knob right). */
  /** When the last glide lands (the join waits for it). */
  const glideEnd = useRef(0);
  const settle = (h: SliderHandlePosition) => {
    const s = sel[h].current;
    const el = spot[h].current;
    if (!s || !el) return;
    const ms = s.moveTo(el, { direction: undefined });
    glideEnd.current = Math.max(
      glideEnd.current,
      performance.now() + (ms || 0)
    );
  };
  // A change from anywhere glides there, except under a drag that places the knob itself: a
  // continuous one, or a snapping one held at a wall (squashed).
  const placesItself = (h: SliderHandlePosition) => {
    const g = gesture.current;
    return (
      g?.mode === 'drag' &&
      (g.handle === h || (!!g.pushing && !inc)) &&
      (!inc || g.walled)
    );
  };
  useLayoutEffect(() => {
    if (!placesItself('lower')) settle('lower');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lower, min, max]);
  useLayoutEffect(() => {
    if (!placesItself('upper')) settle('upper');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upper, min, max]);
  // Pills and circles on one value join once they have landed together: the join waits for the
  // glide that brings them there, so the knobs change shape where they meet, not while still apart
  // (no grey frame flashes between the two shapes).
  const together = (pills || circles) && lower === (upper ?? max);
  // Once joined they stay joined until they part: a knob pushing the other moves them together
  // value by value, and waiting for each value to land again would take the join off and put it
  // back on every move, restarting the merge, the ring and the seam each time.
  const [landed, setLanded] = useState(together);
  if (landed && !together) setLanded(false);
  useEffect(() => {
    if (!together || landed) return;
    const t = window.setTimeout(
      () => setLanded(true),
      Math.max(0, glideEnd.current - performance.now())
    );
    return () => window.clearTimeout(t);
  }, [together, landed]);
  const joined = together && landed;

  /* ── the pointer ── */
  const inert = disabled || readOnly || loading;
  /** The track's geometry: the knob's size and top, and the range of its center (the line's ends, or the track's less its inset). */
  // Read once and kept until the next render or resize: a drag's move asks for it half a dozen
  // times, after the engine has written the knob's place, and each read after a write would force
  // a style and layout pass.
  const geom = () => {
    if (geomCache.current) return geomCache.current;
    const tr = trackRef.current!;
    const s = spot.lower.current!;
    const w = s.offsetWidth;
    const inset = track ? TRACK_INSET[size] : 0;
    geomCache.current = {
      w,
      h: s.offsetHeight,
      top: s.offsetTop,
      lo: inset + w / 2,
      hi: tr.clientWidth - inset - w / 2,
    };
    return geomCache.current;
  };
  useLayoutEffect(() => {
    geomCache.current = null;
  });
  const toX = (clientX: number) => {
    const tr = trackRef.current!;
    const b = tr.getBoundingClientRect();
    const k =
      b.width && Math.abs(tr.offsetWidth - b.width) >= 1
        ? tr.offsetWidth / b.width
        : 1;
    return (clientX - b.left) * k - tr.clientLeft;
  };
  const centerOf = (v: number) => {
    const g = geom();
    return g.lo + frac(v) * (g.hi - g.lo);
  };
  /** The value at center `c`, on the snap increment when snapping. */
  const valueAt = (c: number) => {
    const g = geom();
    return quantize(g.hi > g.lo ? (c - g.lo) / (g.hi - g.lo) : 0, inc || step);
  };
  /** The knob at center `c`; past a wall it stops there and its trailing edge gives (the kit's squash). */
  const squashed = (c: number, a: number, b: number) => {
    const { w, h, top } = geom();
    const v = { t: top, b: top + h };
    return c < a
      ? { l: a - w / 2, r: a + w / 2 - wallSquash(a - c), ...v }
      : c > b
        ? { l: b - w / 2 + wallSquash(c - b), r: b + w / 2, ...v }
        : { l: c - w / 2, r: c + w / 2, ...v };
  };
  /** Where a knob's center may go: the track's ends, or the other knob. */
  const walls = (h: SliderHandlePosition): [number, number] => {
    const [a, b] = bounds(h);
    return [centerOf(a), centerOf(b)];
  };
  /** Snapping's hysteresis, px past the halfway point (`sticky`), under half a stop's travel. */
  const hold = () => {
    const pitch = Math.abs(centerOf(min + inc) - centerOf(min));
    const px =
      sticky === true
        ? Math.min(STICKY_MAX, pitch / 4)
        : typeof sticky === 'number'
          ? sticky
          : 0;
    return clamp(px, 0, pitch * 0.4);
  };
  /**
   * Sticky snapping's lean: while the knob holds its stop, it leans toward the pointer in
   * proportion to the pull, reaching `LEAN_MAX` (3px; at most half the hold, and under half the
   * knob, so the fill's end stays under it) just as the pull commits. Off under reduced motion.
   */
  const leanFor = (pull: number) => {
    const pitch = Math.abs(centerOf(min + inc) - centerOf(min));
    const k = hold();
    const most = Math.min(LEAN_MAX, k / 2, geom().w / 2 - 1);
    if (reduced || k <= 0 || most <= 0) return 0;
    return clamp((pull / (pitch / 2 + k)) * most, -most, most);
  };
  const lean = (h: SliderHandlePosition, px: number) =>
    trackRef.current?.style.setProperty(`--cds-slider-lean-${h}`, `${px}px`);
  const liveCenter = (h: SliderHandlePosition) => {
    const r = sel[h].current?.live();
    return r ? (r.l + r.r) / 2 : 0;
  };
  /** A part of the track: a knob (`knob--lower`) or an aim spot (`aim--upper`). */
  const part = (partName: string) =>
    trackRef.current?.querySelector<HTMLElement>(`.cds-slider__${partName}`) ??
    null;
  /** Put the handle's aim spot at center `c` (an element the engine can reach and glide to). */
  const aimAt = (h: SliderHandlePosition, c: number) => {
    const el = part(`aim--${h}`)!;
    el.style.insetInlineStart = `${c - geom().w / 2}px`;
    return el;
  };

  /* ── two pills: the goo filter only while they are near ──
   * An SVG filter on HTML is drawn again on every frame anything under it changes, a drag's
   * included, and the goo shows only where the pills nearly touch. So the layer is filtered only
   * while the pills are within `GOO_NEAR` blurs (plus `GOO_SLACK`) of each other, where they are
   * drawn now or where their values put them; apart, the pills are drawn in their own colors
   * (slider.scss), the same picture. While a knob glides or a drag runs, it is checked each frame. */
  const gooRef = useRef<HTMLSpanElement>(null);
  const gooUntil = useRef(0);
  const gooFrame = useRef(0);
  /** Sets `data-near`; returns where the knobs are drawn now (their edges), or '' unplaced. */
  const syncGoo = (): string => {
    const el = gooRef.current;
    if (!el || !trackRef.current || !spot.lower.current) return '';
    const w = geom().w;
    const gap = (a: number, b: number) => Math.abs(b - a) - w;
    let at = gap(
      centerOf(vals.current.lower),
      centerOf(vals.current.upper ?? max)
    );
    const lo = sel.lower.current?.live();
    const hi = sel.upper.current?.live();
    // Placed (an engine not yet placed reads 0 wide): where they are drawn now too.
    const placed = !!lo && !!hi && lo.r - lo.l > 0 && hi.r - hi.l > 0;
    if (placed) at = Math.min(at, gap((lo.l + lo.r) / 2, (hi.l + hi.r) / 2));
    const near = at <= GOO_NEAR * GOO_BLUR[size] + GOO_SLACK;
    if (near !== (el.dataset.near !== undefined)) {
      if (near) el.dataset.near = '';
      else delete el.dataset.near;
    }
    return placed ? `${lo.l} ${lo.r} ${hi.l} ${hi.r}` : '';
  };
  /** Checks the goo now, then every frame while the knobs move: a gesture, a glide's clock, or edges still changing. */
  const watchGoo = (ms = 0) => {
    if (!pills) return;
    gooUntil.current = Math.max(gooUntil.current, performance.now() + ms);
    let last = syncGoo();
    if (gooFrame.current) return;
    const tick = () => {
      gooFrame.current = 0;
      const now = syncGoo();
      const moving =
        !!gesture.current ||
        performance.now() < Math.max(gooUntil.current, glideEnd.current) ||
        now !== last;
      last = now;
      if (moving) gooFrame.current = requestAnimationFrame(tick);
    };
    gooFrame.current = requestAnimationFrame(tick);
  };
  useLayoutEffect(() => {
    gooWatch.current = watchGoo;
  });
  useLayoutEffect(() => {
    watchGoo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pills, lower, upper, min, max, length, size]);
  useEffect(
    () => () => {
      cancelAnimationFrame(gooFrame.current);
      gooFrame.current = 0;
    },
    []
  );

  /* ── the track shape's stop dots: a hover grows the nearest; a drag, each as the pointer nears it ── */
  const dotsAttend = track && !inert;
  const tickEls = () =>
    trackRef.current
      ? [...trackRef.current.querySelectorAll<HTMLElement>('.cds-slider__tick')]
      : [];
  /** Each dot's attention, 0–1 (`--cds-dot-t`: it grows 2px at 1). */
  const attend = (
    at: (center: number, i: number, centers: number[]) => number
  ) => {
    const els = tickEls();
    const cs = els.map((el) => centerOf(Number(el.dataset.value)));
    els.forEach((el, i) =>
      el.style.setProperty('--cds-dot-t', at(cs[i]!, i, cs).toFixed(3))
    );
  };
  /**
   * The stop dot a press at `x` takes. Snapping, the nearest (the press lands on a stop anyway).
   * Continuous, a dot is a target: the one within `DOT_REACH` of the pointer, and under half the
   * pitch; elsewhere, none, and the press lands where it is.
   */
  const dotAt = (x: number): number | null => {
    const vs = tickEls().map((el) => Number(el.dataset.value));
    if (!vs.length) return null;
    const cs = vs.map(centerOf);
    const best = cs.reduce(
      (b, v, j) => (Math.abs(x - v) < Math.abs(x - cs[b]!) ? j : b),
      0
    );
    if (inc) return vs[best]!;
    const pitch = cs.length > 1 ? Math.abs(cs[1]! - cs[0]!) : Infinity;
    return Math.abs(x - cs[best]!) <= Math.min(DOT_REACH, pitch / 2)
      ? vs[best]!
      : null;
  };
  /** The hover grows the dot a press would take (none, between a continuous track's targets). */
  const attendNearest = (x: number) => {
    const v = dotAt(x);
    attend((c) => (v !== null && Math.abs(c - centerOf(v)) < 0.5 ? 1 : 0));
  };
  const attendPull = (x: number) =>
    attend((c, i, cs) => {
      const gap = Math.abs((cs[1] ?? 0) - (cs[0] ?? 0)) || 1;
      return Math.pow(Math.max(0, 1 - Math.abs(x - c) / gap), 1.5);
    });
  /** While dragging, the stop the knob left is drawn as a short pill (`data-origin`). */
  const markOrigin = (v: number | null) =>
    tickEls().forEach((el) => {
      if (v !== null && Number(el.dataset.value) === v) el.dataset.origin = '';
      else delete el.dataset.origin;
    });

  /* ── the projection texture (`ai`): a wave from the knob's new place on a change (not the special step's: its dots burst in) ── */
  const landWave = (v: number) => {
    if (!aiOn || reduced || isSpecial(v)) return;
    field.current?.snap(centerOf(v), false);
  };

  const onWindow = useRef<(e: PointerEvent) => void>(() => {});
  // The gesture's moves and release, on the window (pointer capture would retarget the release):
  // listened for from the press to the release only (`listen`, `unlisten`), none at rest.
  const unlisten = useRef<(() => void) | null>(null);
  const listen = () => {
    if (unlisten.current) return;
    const relay = (e: PointerEvent) => onWindow.current(e);
    const types = ['pointermove', 'pointerup', 'pointercancel'] as const;
    types.forEach((type) => window.addEventListener(type, relay));
    unlisten.current = () =>
      types.forEach((type) => window.removeEventListener(type, relay));
  };
  useEffect(
    () => () => {
      unlisten.current?.();
      unlisten.current = null;
    },
    []
  );

  const end = () => {
    gesture.current = null;
    unlisten.current?.();
    unlisten.current = null;
    const tr = trackRef.current;
    if (tr) {
      delete tr.dataset.pressLower;
      delete tr.dataset.pressUpper;
      delete tr.dataset.pressed;
      delete tr.dataset.dragging;
      delete tr.dataset.active;
      tr.style.removeProperty('--cds-slider-lean-lower');
      tr.style.removeProperty('--cds-slider-lean-upper');
    }
    if (track) {
      attend(() => 0);
      markOrigin(null);
    }
  };

  /** Two knobs push each other along where they meet, except triangles. */
  const pushes = twoHandles && !triangles;
  /**
   * A drag's value for its knob. Two knobs: the grabbed one goes the track's whole length, and
   * where it meets the other it pushes it along (the other yields). They never swap: lower stays
   * lower.
   */
  const place = (g: Gesture, v: number): Pair => {
    // Triangles stop at the other's stem: one can't be dragged into the other (it stops where the
    // stems overlap).
    if (!pushes) return commit(g.handle, clamp(v, ...bounds(g.handle)));
    const lo = vals.current.lower;
    const hi = vals.current.upper ?? max;
    if (g.handle === 'lower') {
      g.pushing = v >= hi;
      return commitPair(v, Math.max(hi, v));
    }
    g.pushing = v <= lo;
    return commitPair(Math.min(lo, v), v);
  };

  useLayoutEffect(() => {
    onWindow.current = (e: PointerEvent) => {
      const g = gesture.current;
      if (!g || !sel[g.handle].current || e.pointerId !== g.id) return;
      const other: SliderHandlePosition =
        g.handle === 'lower' ? 'upper' : 'lower';
      if (e.type === 'pointercancel') {
        end();
        settle(g.handle);
        if (twoHandles) settle(other);
        return;
      }
      if (e.type === 'pointerup') {
        end();
        // Pills and circles let go within `JOIN_GAP` of each other snap together: the knob in hand
        // glides onto the other's value and they join.
        if (g.mode === 'drag' && (pills || circles)) {
          const ov = valueOf(other);
          const gap = Math.abs(centerOf(g.value) - centerOf(ov)) - geom().w;
          if (gap <= JOIN_GAP) g.value = ov;
        }
        const before = valueOf(g.handle);
        const next = g.mode === 'grab' ? vals.current : place(g, g.value);
        // Unchanged, the effect won't run: land here.
        if (g.mode === 'grab' || before === g.value) settle(g.handle);
        // A knob it pushed lands with it.
        if (g.mode === 'drag' && twoHandles) settle(other);
        // A drag's landing sends the texture's wave (not each stop it passes).
        if (g.mode === 'drag' && g.handle === 'lower' && next.lower !== g.start)
          landWave(next.lower);
        onRelease?.(changeData(next));
        return;
      }
      const x = toX(e.clientX);
      if (g.mode !== 'drag') {
        if (Math.abs(x - g.x0) <= DRAG_SLOP || !m.drag) return;
        const tr = trackRef.current!;
        // Two knobs on one value: the drag's direction says which one it took (the one free to go
        // that way), decided once; it never changes mid-drag.
        if (g.undecided) {
          const h: SliderHandlePosition = x > g.x0 ? 'upper' : 'lower';
          if (h !== g.handle) {
            delete tr.dataset[
              g.handle === 'lower' ? 'pressLower' : 'pressUpper'
            ];
            g.handle = h;
            g.start = valueOf(h);
            g.value = valueOf(h);
            g.grabD = g.x0 - liveCenter(h);
            tr.dataset.active = h;
            tr.dataset.hover = h;
          }
          g.undecided = false;
        }
        // A snapping drag holds the stop the knob is on (a grab) or the press reached for.
        if (g.mode === 'grab') g.value = valueOf(g.handle);
        g.caught = g.mode === 'grab';
        g.catchBy = Infinity;
        g.mode = 'drag';
        tr.dataset.dragging = '';
        // A drag is a press on the knob.
        tr.dataset[g.handle === 'lower' ? 'pressLower' : 'pressUpper'] = g.touch
          ? 'inset'
          : 'pointer';
        if (dotsAttend) markOrigin(g.start);
      }
      const s = sel[g.handle].current!;
      const pushed = g.handle === 'lower' ? 'upper' : 'lower';
      // Pushing knobs: the track's ends are the walls (the other knob yields). Otherwise the ends,
      // or the other knob (triangles stop where their stems meet).
      const [a, b] = pushes ? [centerOf(min), centerOf(max)] : walls(g.handle);
      // Triangles: the other knob is a hard stop, not a wall to squash against: past it the knob
      // doesn't move at all, not even its overdrag, so only the stems ever coincide. The track's ends still give.
      const c = !triangles
        ? x - g.grabD
        : g.handle === 'lower'
          ? Math.min(x - g.grabD, b)
          : Math.max(x - g.grabD, a);
      const at = clamp(c, a, b);
      if (dotsAttend) attendPull(at);
      if (inc) {
        // Snapping: the value is the increment nearest the pointer, and the knob glides there (the
        // value's effect) as the pointer passes each halfway point. Past a wall it squashes.
        const walled = c < a || c > b;
        const was = g.walled;
        g.walled = walled;
        if (walled) s.follow(squashed(c, a, b));
        else if (was) settle(g.handle);
        const next = clamp(valueAt(at), min, max);
        // Sticky: the pointer must be `hold` px past the halfway point before the knob leaves its stop
        // (nearer the next stop than the current one by twice that).
        const lead =
          Math.abs(at - centerOf(g.value)) - Math.abs(at - centerOf(next));
        if (lead >= 2 * hold()) g.value = next;
        place(g, g.value);
        // While it holds, the knob leans toward the pull (none at a wall: the squash shows it).
        lean(g.handle, walled ? 0 : leanFor(at - centerOf(g.value)));
        return;
      }
      if (
        !g.caught &&
        (performance.now() >= g.catchBy ||
          Math.abs(liveCenter(g.handle) - at) < 2)
      )
        g.caught = true;
      if (g.caught) s.follow(squashed(c, a, b));
      else {
        const ms = s.moveTo(aimAt(g.handle, at), { direction: undefined });
        if (g.catchBy === Infinity) g.catchBy = performance.now() + ms;
      }
      g.value = clamp(valueAt(at), min, max);
      const now = place(g, g.value);
      // The knob it pushes sits with it, under it.
      if (g.pushing) sel[pushed].current?.follow(squashed(c, a, b));
      // Pills and circles join and part on the frame the knobs meet and part: the knobs move here,
      // now, and the join waiting for React's render drew a frame of two knobs apart in the joined
      // look (or one on the other in the parted look) as they passed.
      if (pills || circles) {
        const on = now.lower === (now.upper ?? max);
        const root = rootRef.current;
        if (root && on !== (root.dataset.merged !== undefined)) {
          if (on) root.dataset.merged = 'true';
          else delete root.dataset.merged;
        }
        setLanded(on);
      }
    };
  });

  /** The knob at `x`: the one whose center is nearer; level (overlapping), the side the pointer is on. */
  const pick = (x: number): SliderHandlePosition => {
    if (!twoHandles) return 'lower';
    const dl = Math.abs(x - liveCenter('lower'));
    const du = Math.abs(x - liveCenter('upper'));
    if (Math.abs(dl - du) < 0.5)
      return x > liveCenter('upper') ? 'upper' : 'lower';
    return du < dl ? 'upper' : 'lower';
  };
  /** On a knob's hit area (`.cds-slider__hit`, at least 24 × 24px; slider.scss). */
  const onHit = (e: ReactPointerEvent) =>
    e.target instanceof Element && !!e.target.closest('.cds-slider__knob');

  /**
   * The hovered knob. Where two hit areas overlap it holds until the other knob is nearer by
   * `HOVER_HOLD`, so a pointer resting between them doesn't flip it (and fire both knobs' growth)
   * on every pixel.
   */
  const pickHover = (
    x: number,
    cur: string | undefined
  ): SliderHandlePosition => {
    const h = pick(x);
    if (!twoHandles || !cur || h === cur) return h;
    const dl = Math.abs(x - liveCenter('lower'));
    const du = Math.abs(x - liveCenter('upper'));
    return Math.abs(dl - du) < HOVER_HOLD ? (cur as SliderHandlePosition) : h;
  };

  // The hover is the hit area's, and where two overlap it is the knob a press would take. While a
  // knob is pressed or dragged, the hover stays on it: the other never answers.
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const tr = trackRef.current;
    if (!tr || e.pointerType === 'touch') return;
    const g = gesture.current;
    const h = g
      ? g.handle
      : !inert && onHit(e)
        ? pickHover(toX(e.clientX), tr.dataset.hover)
        : undefined;
    if (tr.dataset.hover !== h) {
      if (h) tr.dataset.hover = h;
      else delete tr.dataset.hover;
    }
    if (dotsAttend && !gesture.current) attendNearest(toX(e.clientX));
  };
  const onPointerLeave = () => {
    if (trackRef.current) delete trackRef.current.dataset.hover;
    if (track && !gesture.current) attend(() => 0);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || gesture.current || inert) return;
    const x = toX(e.clientX);
    // Which knob: on a hit area, or on the line, the nearer.
    const h = pick(x);
    const s = sel[h].current;
    if (!s) return;
    const live = s.live();
    const onKnob = onHit(e);
    const [a, b] = walls(h);
    const at = clamp(x, a, b);
    // On a hovered stop dot, the press takes the dot.
    const dot = dotsAttend && !onKnob ? dotAt(x) : null;
    const target = clamp(dot ?? valueAt(at), ...bounds(h));
    gesture.current = {
      id: e.pointerId,
      handle: h,
      mode: onKnob ? 'grab' : 'press',
      x0: x,
      grabD: onKnob ? x - (live.l + live.r) / 2 : 0,
      caught: onKnob,
      catchBy: Infinity,
      value: target,
      start: valueOf(h),
      touch: e.pointerType === 'touch',
      walled: false,
      // Two knobs on one value: which one waits for the drag's direction.
      undecided:
        twoHandles &&
        onKnob &&
        Math.abs(liveCenter('lower') - liveCenter('upper')) < 1,
    };
    listen();
    watchGoo();
    // The knob in hand is drawn on top of the other.
    trackRef.current!.dataset.active = h;
    // Any press steps the fill (`fillStyle`).
    trackRef.current!.dataset.pressed = '';
    // A press on the knob: under the pointer it returns from the hover's growth to rest; a touch insets it.
    if (onKnob)
      trackRef.current!.dataset[h === 'lower' ? 'pressLower' : 'pressUpper'] =
        e.pointerType === 'touch' ? 'inset' : 'pointer';
    else if (target !== valueOf(h)) {
      // The press answers at once: the knob's leading edge reaches toward where it will land (by one increment's travel: 'auto').
      const pitch = Math.abs(centerOf(min + (inc || step)) - centerOf(min));
      s.reach(
        aimAt(h, inc || dot !== null ? centerOf(target) : at),
        resolveReach(m.reach, pitch)
      );
    }
    part(`knob--${h}`)?.focus({ preventScroll: true });
    // A script focus can inherit "visible" from an earlier keyboard focus (the engine would call it the keyboard): it's the pointer.
    trackRef.current!.dataset.input = 'pointer';
  };

  /* ── the keys: v11's, and Home / End / Page Up / Down ── */
  const onKnobKeyDown =
    (h: SliderHandlePosition) => (e: KeyboardEvent<HTMLDivElement>) => {
      if (inert) return;
      const cur = valueOf(h);
      const [lo, hi] = bounds(h);
      const big = step * stepMultiplier;
      const k = e.key;
      let delta = 0;
      let to: number | null = null;
      if (k === 'ArrowRight' || k === 'ArrowUp')
        delta = e.shiftKey ? big : step;
      else if (k === 'ArrowLeft' || k === 'ArrowDown')
        delta = e.shiftKey ? -big : -step;
      else if (k === 'PageUp') delta = big;
      else if (k === 'PageDown') delta = -big;
      else if (k === 'Home') to = lo;
      else if (k === 'End') to = hi;
      else return;
      e.preventDefault();
      // A key presses the knob with no hover: it insets 1px until the key comes up.
      trackRef.current!.dataset[h === 'lower' ? 'pressLower' : 'pressUpper'] =
        'inset';
      // v11's calcValueForDelta: going up, from the current value rounded to the step.
      if (to === null)
        to = quantize(
          frac(fix((delta > 0 ? Math.round(cur / step) * step : cur) + delta))
        );
      commit(h, clamp(to, lo, hi));
    };

  const unpress = (h: SliderHandlePosition) => () => {
    const tr = trackRef.current;
    const key = h === 'lower' ? 'pressLower' : 'pressUpper';
    if (tr && tr.dataset[key] === 'inset' && !gesture.current)
      delete tr.dataset[key];
  };

  /* ── the number fields: v11's sync, clamping and correction ── */
  const [draft, setDraft] = useState<
    Partial<Record<SliderHandlePosition, string>>
  >({});
  const [bad, setBad] = useState<Record<SliderHandlePosition, boolean>>({
    lower: false,
    upper: false,
  });
  const [corrected, setCorrected] = useState<{
    value: string;
    handle: SliderHandlePosition;
  } | null>(null);
  const setDraftFor = (h: SliderHandlePosition, text: string | undefined) =>
    setDraft((d) => ({ ...d, [h]: text }));

  const onInputChange =
    (h: SliderHandlePosition) => (e: ChangeEvent<HTMLInputElement>) => {
      if (disabled || readOnly) return;
      setCorrected(null);
      const raw = e.target.value;
      const num = Number.parseFloat(raw);
      const [lo, hi] = bounds(h);
      // In range: it moves the knob as you type. Otherwise it waits for blur or Enter.
      if (!Number.isNaN(num) && num >= lo && num <= hi) {
        setDraftFor(h, undefined);
        setBad((b) => ({ ...b, [h]: false }));
        commit(h, fix(num));
      } else setDraftFor(h, raw);
    };
  const processInput = (h: SliderHandlePosition, raw: string) => {
    setCorrected(null);
    const num = Number.parseFloat(raw);
    if (Number.isNaN(num)) {
      setBad((b) => ({ ...b, [h]: true }));
      return;
    }
    const adjusted = clamp(num, ...bounds(h));
    if (adjusted !== num) setCorrected({ value: String(num), handle: h });
    setBad((b) => ({ ...b, [h]: false }));
    setDraftFor(h, undefined);
    commit(h, fix(adjusted));
  };
  const onInputBlur =
    (h: SliderHandlePosition) => (e: FocusEvent<HTMLInputElement>) => {
      late.onBlur();
      if (!disabled && !readOnly) processInput(h, e.target.value);
      onBlur?.({
        value: e.target.value,
        handlePosition: twoHandles ? h : undefined,
      });
    };
  const onInputKeyDown =
    (h: SliderHandlePosition) => (e: KeyboardEvent<HTMLInputElement>) => {
      if (!disabled && !readOnly && e.key === 'Enter')
        processInput(h, e.currentTarget.value);
    };

  /* ── status: v11's validity, TextInput's message conventions ── */
  // v11: an `invalid` prop overrides the fields' own validity.
  const invalidOf = (h: SliderHandlePosition) => invalid ?? bad[h];
  const norm = normalizeFieldProps({
    id,
    readOnly,
    disabled,
    invalid: invalidOf('lower') || (twoHandles && invalidOf('upper')),
    warn,
  });
  const correction =
    corrected && !disabled && !readOnly
      ? t('carbon.slider.auto-correct-announcement', {
          correctedValue: corrected.value,
        })
      : null;
  const fieldStatus: FieldStatus = norm.invalid
    ? 'error'
    : norm.warn || correction
      ? 'warn'
      : 'none';
  const late = useLateStatus(fieldStatus);
  const { phase, overlayRef, contentRef, overlayProps } =
    useSkeletonReveal(loading);
  const busy = phase === 'loading' || phase === 'unload';
  const shown: FieldStatus = busy ? 'none' : late.shown;
  const describedBy =
    shown === 'error' && invalidText
      ? norm.invalidId
      : shown === 'warn'
        ? norm.warnId
        : undefined;

  /* ── the status on the line: a change wipes in from the knob along the fill, a soft leading edge (slider.scss) ── */
  // `base` is what the fill shows; `wipes` the statuses coming in over it, newest last. A change
  // mid-wipe freezes the one under it where it is, and the new one wipes in over both.
  const [tone, setTone] = useState<{
    base: SliderStatus;
    wipes: { key: number; tone: SliderStatus }[];
    next: number;
  }>({ base: status, wipes: [], next: 0 });
  const top = tone.wipes.at(-1);
  const showing = (x: typeof tone) => x.wipes.at(-1)?.tone ?? x.base;
  // (Idempotent: a render may run twice before the update applies.)
  if (status !== showing(tone))
    setTone((x) =>
      status === showing(x)
        ? x
        : {
            ...x,
            wipes: [...x.wipes, { key: x.next, tone: status }],
            next: x.next + 1,
          }
    );
  const wipeEls = useRef(new Map<number, HTMLSpanElement>());
  const baseFillRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = top && wipeEls.current.get(top.key);
    const tr = trackRef.current;
    if (!top) return;
    const land = () => setTone((x) => ({ ...x, base: top.tone, wipes: [] }));
    // Nothing to wipe over (loading), or reduced motion: it simply lands, at once.
    if (!el || !tr || reduced) return land();
    // The clock: the selection timing for the distance the edge travels (the fill's length; a
    // range's two edges meet in the middle, so half of it), as a knob's glide over it.
    const span = twoHandles
      ? (liveCenter('upper') - liveCenter('lower')) / 2
      : liveCenter('lower') - geom().lo;
    const cs = getComputedStyle(tr);
    const token = selectionDuration(span);
    const ms =
      parseFloat(cs.getPropertyValue(`--cds-motion-duration-${token}`)) ||
      motionTokens.duration[token];
    const ease =
      cs.getPropertyValue('--cds-motion-easing-standard-productive').trim() ||
      easingCss('standard-productive');
    const a = el.animate(
      [{ '--cds-slider-wipe': 0 }, { '--cds-slider-wipe': 1 }],
      {
        duration: ms,
        easing: ease,
      }
    );
    a.onfinish = land;
    return () => {
      // Superseded: frozen where it is, under the next one.
      a.onfinish = null;
      a.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [top?.key]);
  // The base takes a landed status at once: its color transition (the hover and press step) would
  // otherwise fade it back from the old color, after the wipe had already shown the new one.
  useLayoutEffect(() => {
    const el = baseFillRef.current;
    if (!el) return;
    el.style.transition = 'none';
    void getComputedStyle(el).backgroundColor;
    el.style.transition = '';
  }, [tone.base]);
  const toneAttr = (x: SliderStatus | null) =>
    x && x !== 'none' ? x : undefined;

  /* ── the surface it sits on: the status fills' 3:1 and the pill's center follow it (statusColor.ts) ── */
  useLayoutEffect(
    () => (rootRef.current ? watchSurface(rootRef.current) : undefined),
    []
  );

  /* ── the projection texture (`ai`), on a canvas the size of the track; the fill's clip uncovers it ── */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** The dots' shimmer: since when they came (on the special step, and while they leave); null off it. */
  const twinkle = useRef<{ since: number } | null>(null);
  /** The dots' presence, drawn by the slider over the field (`twinkleWave.ts`). */
  const presence = useRef<TwinkleWave | null>(null);
  /** Whether the dots are there (or coming), and where they came to (the special step's center). */
  const dotsShown = useRef<{ on: boolean; x: number }>({ on: false, x: 0 });
  /** The dots leaving: the knob's place as they started (their lens holds still), and the timer that lets the field go of them. */
  const leaving = useRef<{
    knob: ReturnType<DotFieldOptions['knob']>;
    timer: number;
  } | null>(null);
  const stopLeaving = () => {
    if (leaving.current) window.clearTimeout(leaving.current.timer);
    leaving.current = null;
  };
  useEffect(() => stopLeaving, []);
  const dotsRef = useLatest(dotsProp);
  const physicsRef = useLatest(physicsProp);
  const texture = useLatest({
    corners,
    timeScale: m.timeScale,
    reduced,
    hasSpecial: !!stepList && n > 2 && stepList.some((_, i) => isSpecial(i)),
    knob: () => sel.lower.current?.live() ?? null,
    progress: () => {
      const g = geom();
      return g.hi > g.lo ? (liveCenter('lower') - g.lo) / (g.hi - g.lo) : 0;
    },
  });
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!aiOn || !canvas) return;
    const f = createDotField(canvas, {
      color: () => getComputedStyle(canvas).color,
      radius: () => {
        const hh = canvas.offsetHeight || 24;
        const c = texture.current.corners;
        return c === 'square'
          ? 0
          : c === 'rounded'
            ? Math.min(8, hh / 2)
            : hh / 2;
      },
      knob: () =>
        leaving.current ? leaving.current.knob : texture.current.knob(),
      progress: () => texture.current.progress(),
      hasSpecial: () => texture.current.hasSpecial,
      behaviors: () => ({ ...DOT_BEHAVIORS, ...dotsRef.current }),
      physics: () => ({ ...DOT_PHYSICS, ...physicsRef.current }),
      timeScale: () => texture.current.timeScale,
      reduced: () => texture.current.reduced,
    });
    // The dots' coming and going, and on top of the field's own twinkle a shimmer of every dot:
    // only while that twinkle runs (it keeps the field's loop going, on screen).
    const tw = attachTwinkleWave(canvas, {
      source: () => {
        const b = { ...DOT_BEHAVIORS, ...dotsRef.current };
        const t = texture.current;
        return b.twinkle && b.ramp && t.hasSpecial && !t.reduced
          ? twinkle.current
          : null;
      },
      timeScale: () => texture.current.timeScale,
    });
    presence.current = tw;
    field.current = f;
    f.layout();
    f.load();
    const ro = new ResizeObserver(() => f.layout());
    ro.observe(canvas);
    // It follows a theme change on the page's root (the canvas reads its color when it draws):
    // watched from the body, whose one ancestor is the root, so its own classes don't relayout it.
    const offTheme = onThemeChange(document.body, () => f.layout());
    return () => {
      ro.disconnect();
      offTheme();
      stopLeaving();
      tw.undo();
      f.destroy();
      field.current = null;
      presence.current = null;
    };
  }, [aiOn, size, corners, phase, texture, dotsRef, physicsRef]);
  // A change from anywhere (a key, a click) sends the wave; a drag sends it when it lands (above).
  const lastLower = useRef(lower);
  useLayoutEffect(() => {
    if (lastLower.current !== lower && gesture.current?.mode !== 'drag')
      landWave(lower);
    lastLower.current = lower;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lower]);
  // The dots follow the special step: in from the knob when it lands there, out left to right
  // otherwise. The field holds the state at once; `twinkleWave.ts` draws the change.
  const syncedField = useRef<DotField | null>(null);
  useLayoutEffect(() => {
    const f = field.current;
    const tw = presence.current;
    if (!f || !tw) return;
    const b = { ...DOT_BEHAVIORS, ...dotsProp };
    const animate =
      syncedField.current === f &&
      !reduced &&
      b.ramp &&
      texture.current.hasSpecial;
    syncedField.current = f;
    const on = isSpecial(lower);
    const x = centerOf(lower);
    const was = dotsShown.current;
    if (!animate) {
      stopLeaving();
      tw.present(on, x, true);
      f.setPresent(on, x, false);
    } else if (on && !was.on) {
      // Back mid-way out: the field still holds them, and each dot turns back from where it is.
      stopLeaving();
      f.setPresent(true, x, false);
      f.wake(tw.present(true, x));
    } else if (!on && was.on) {
      const ms = tw.present(false, was.x);
      leaving.current = {
        knob: texture.current.knob(),
        timer: window.setTimeout(() => {
          leaving.current = null;
          twinkle.current = null;
          field.current?.setPresent(false, was.x, false);
        }, ms),
      };
      f.wake(ms + 100);
    }
    dotsShown.current = { on, x: on ? x : was.x };
    // Its dots shimmer from when they came, until they have left.
    twinkle.current =
      on || leaving.current
        ? { since: twinkle.current?.since ?? performance.now() }
        : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lower, aiOn, size, corners, phase, reduced]);

  /* ── render ── */
  const handles: SliderHandlePosition[] = twoHandles
    ? ['lower', 'upper']
    : ['lower'];
  const valueNow = (h: SliderHandlePosition) =>
    h === 'lower' ? lower : (upper ?? max);
  const knobEl = (h: SliderHandlePosition) => (
    <div
      className={`cds-slider__knob cds-slider__knob--${h}`}
      data-selection-indicator={h === 'lower' ? '' : undefined}
      data-reveal=""
      role="slider"
      id={twoHandles ? undefined : id}
      tabIndex={disabled || loading ? undefined : 0}
      aria-valuemin={h === 'upper' ? lower : min}
      aria-valuemax={h === 'lower' && twoHandles ? (upper ?? max) : max}
      aria-valuenow={valueNow(h)}
      aria-valuetext={formatLabel(valueNow(h), undefined)}
      aria-labelledby={twoHandles || labelText == null ? undefined : labelId}
      aria-label={
        twoHandles
          ? h === 'lower'
            ? ariaLabelInput
            : ariaLabelInputUpper
          : undefined
      }
      aria-disabled={disabled || undefined}
      aria-readonly={readOnly || undefined}
      aria-invalid={norm.invalid || undefined}
      aria-describedby={describedBy}
      onKeyDown={onKnobKeyDown(h)}
      onKeyUp={unpress(h)}
      onBlur={unpress(h)}>
      <span className="cds-slider__hit" aria-hidden="true" />
    </div>
  );
  const spotEl = (h: SliderHandlePosition) => (
    <>
      <span
        ref={spot[h]}
        className={`cds-slider__spot cds-slider__spot--${h}`}
        style={{ ['--cds-slider-p' as string]: frac(valueNow(h)) }}
        aria-hidden="true"
      />
      <span
        className={`cds-slider__spot cds-slider__aim--${h}`}
        aria-hidden="true"
      />
    </>
  );

  const fieldFor = (h: SliderHandlePosition) => {
    const own = h === 'lower' ? name : nameUpper;
    const text = draft[h] ?? String(valueNow(h));
    if (hideTextInput)
      return (
        <input type="hidden" name={twoHandles ? own : name} value={text} />
      );
    const label = twoHandles
      ? ((h === 'lower' ? ariaLabelInput : ariaLabelInputUpper) ??
        (h === 'lower' ? 'Lower bound' : 'Upper bound'))
      : (ariaLabelInput ?? labelText ?? 'Value');
    return (
      <TextInput
        id={`${id}-${twoHandles ? `${h}-` : ''}input-for-slider`}
        className={`cds-slider__field cds-slider__field--${h}`}
        labelText={label}
        hideLabel
        size={FIELD_SIZE[size]}
        type={inputType}
        name={twoHandles ? own : name}
        value={text}
        min={min}
        max={max}
        step={step}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        light={light}
        invalid={invalidOf(h)}
        warn={warn || corrected?.handle === h}
        loading={loading}
        skeletonValue={formatLabel(max, undefined)}
        data-handle-position={twoHandles ? h : undefined}
        aria-describedby={describedBy}
        onChange={onInputChange(h)}
        onFocus={late.onFocus}
        onInput={late.onInput}
        onBlur={onInputBlur(h)}
        onKeyDown={onInputKeyDown(h)}
        onKeyUp={onInputKeyUp}
      />
    );
  };

  // Ticks: at the snap increments (else each step) or every `ticks` units; none closer than 4px.
  const tickBy = typeof ticks === 'number' && ticks > 0 ? ticks : inc || step;
  const tickCount =
    ticks && max > min ? Math.floor((max - min) / tickBy + 1e-9) + 1 : 0;
  const knobPx = track
    ? TRACK_KNOB_PX[size] + 2 * TRACK_INSET[size]
    : KNOB_PX[size];
  const tickValues =
    tickCount > 1 &&
    tickCount <= 201 &&
    (length - knobPx) / (tickCount - 1) >= 4
      ? Array.from({ length: tickCount }, (_, i) =>
          fix(min + i * tickBy)
        ).concat((max - min) % tickBy > 1e-9 ? [max] : [])
      : [];
  /** Under the fill: up to the knob, or between the knobs. */
  const passed = (v: number) =>
    twoHandles ? v >= lower && v <= (upper ?? max) : v <= lower;

  const readoutText = twoHandles
    ? `${formatLabel(lower, undefined)}–${formatLabel(upper ?? max, undefined)}`
    : formatLabel(lower, undefined);
  const rangeLabel = (v: number, label: string | undefined) => (
    <span className="cds-slider__range-label">{formatLabel(v, label)}</span>
  );
  // With steps, the step's label rolls through a clip as it changes (the special step's in the AI color).
  const readoutEl = busy ? (
    <span className="cds-slider__readout-slot">
      {formatLabel(max, undefined)}
      <SkeletonText lineHeight="100%" className="cds-slider__readout-bar" />
    </span>
  ) : stepped && !twoHandles ? (
    // The widest step's label keeps its room from the first render (stacked, unseen, in one cell
    // with the roll), so dragging never changes the readout's size.
    <span className="cds-slider__readout-room">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="cds-slider__readout-sizer" aria-hidden="true">
          {stepText(i)}
        </span>
      ))}
      <RollText
        className="cds-slider__roll"
        text={stepText(lower)}
        order={lower}
        tone={isSpecial(lower) ? 'ai' : undefined}
        direction={readoutDirection}
        timeScale={m.timeScale}
      />
    </span>
  ) : (
    readoutText
  );

  // Read only: a fixed value, not a control, unlike v11's read-only. A bar to the value on the
  // slider's geometry, no knob, no stops, nothing to press; the value as text in the field's
  // column; a meter to assistive tech. The value still posts with a form.
  if (readOnly) {
    const from = twoHandles ? frac(lower) : null;
    const to = twoHandles ? frac(upper ?? max) : frac(lower);
    return (
      <div
        ref={rootRef}
        className={[
          'cds-slider',
          `cds-slider--${size}`,
          track && 'cds-slider--track',
          bare && 'cds-slider--bare',
          bare && base === 'inset' && 'cds-slider--base-inset',
          hero && 'cds-slider--hero',
          stepped && 'cds-slider--steps',
          twoHandles ? 'cds-slider--range' : 'cds-slider--single',
          'cds-slider--readonly',
          className,
        ]
          .filter(Boolean)
          .join(' ')}>
        <div
          className={[
            'cds-slider__head',
            hideLabel && !showReadout && 'cds-field-visually-hidden',
          ]
            .filter(Boolean)
            .join(' ')}>
          {labelText != null && (
            <span
              id={labelId}
              className={[
                'cds-field-label',
                hideLabel && 'cds-field-visually-hidden',
              ]
                .filter(Boolean)
                .join(' ')}>
              {labelText}
            </span>
          )}
          {showReadout && (
            <span className="cds-slider__readout" aria-hidden="true">
              {readoutText}
            </span>
          )}
        </div>
        <div className="cds-slider__row">
          {!stepped && rangeLabel(min, minLabel)}
          <div className="cds-slider__bar">
            <div
              className="cds-slider__meter"
              role={twoHandles ? 'img' : 'meter'}
              aria-labelledby={labelText != null ? labelId : undefined}
              aria-label={
                twoHandles
                  ? `${textOf(labelText) || ariaLabelInput || 'Range'}: ${readoutText}`
                  : labelText == null
                    ? ariaLabelInput
                    : undefined
              }
              aria-valuemin={twoHandles ? undefined : min}
              aria-valuemax={twoHandles ? undefined : max}
              aria-valuenow={twoHandles ? undefined : lower}
              aria-valuetext={twoHandles ? undefined : readoutText}
              style={{
                ...(from === null
                  ? {}
                  : { ['--cds-slider-p0' as string]: from }),
                ['--cds-slider-p' as string]: to,
              }}>
              {/* The knob shape: no fill, a solid dot at each value. */}
              {bare ? (
                [from, to].map(
                  (p, i) =>
                    p !== null && (
                      <span
                        key={i}
                        className="cds-slider__meter-dot"
                        style={{ ['--cds-slider-p' as string]: p }}
                      />
                    )
                )
              ) : (
                <span
                  className="cds-slider__meter-fill"
                  data-from={from === null ? undefined : ''}
                />
              )}
              {reference != null && !twoHandles && reference !== lower && (
                <span
                  className="cds-slider__meter-reference"
                  data-passed={(!bare && reference < lower) || undefined}
                  style={{ ['--cds-slider-p' as string]: frac(reference) }}
                />
              )}
            </div>
            {stepList && stepLabels && (
              <div className="cds-slider__step-labels" aria-hidden="true">
                {stepList.map((st, i) => (
                  <span
                    key={i}
                    className="cds-slider__step-label"
                    data-current={i === lower || undefined}
                    style={{ ['--cds-slider-p' as string]: frac(i) }}>
                    {st.label ?? String(i)}
                  </span>
                ))}
              </div>
            )}
          </div>
          {!stepped && rangeLabel(max, maxLabel)}
          {!hideTextInput && (
            <span className="cds-slider__value" aria-hidden="true">
              {readoutText}
            </span>
          )}
        </div>
        <input type="hidden" name={name} value={String(lower)} />
        {twoHandles && (
          <input type="hidden" name={nameUpper} value={String(upper ?? max)} />
        )}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={[
        'cds-slider',
        `cds-slider--${size}`,
        `cds-slider--fill-${fillStyle}`,
        track && 'cds-slider--track',
        bare && 'cds-slider--bare',
        track && base === 'inset' && 'cds-slider--base-inset',
        track && corners !== 'full' && `cds-slider--${corners}`,
        stepped && 'cds-slider--steps',
        aiOn && 'cds-slider--ai',
        hero && !aiOn && 'cds-slider--hero',
        !track &&
          (knobShape === 'pill' || (twoHandles && knobShape === 'triangle')) &&
          `cds-slider--knob-${knobShape}`,
        gradient !== 'none' && `cds-slider--gradient-${gradient}`,
        twoHandles ? 'cds-slider--range' : 'cds-slider--single',
        disabled && 'cds-slider--disabled',
        readOnly && 'cds-slider--readonly',
        busy && 'cds-slider--loading',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={stepped ? { ['--cds-slider-n' as string]: n } : undefined}
      data-status={shown}
      data-tone={toneAttr(status)}
      // AI mode: the knob on the special step becomes the AI knob (slider.scss).
      data-ai-on={(aiOn && isSpecial(lower)) || undefined}
      // Pills and circles on one value are one pill (slider.scss).
      data-merged={joined || undefined}
      // Triangles on one value: the shared stem grows (slider.scss).
      data-joined={(triangles && lower === (upper ?? max)) || undefined}
      aria-busy={busy || undefined}>
      <div
        className={[
          'cds-slider__head',
          hideLabel && !showReadout && 'cds-field-visually-hidden',
        ]
          .filter(Boolean)
          .join(' ')}>
        {labelText != null && (
          <label
            id={labelId}
            htmlFor={twoHandles ? undefined : id}
            className={[
              'cds-field-label',
              hideLabel && 'cds-field-visually-hidden',
              disabled && 'cds-field-label--disabled',
            ]
              .filter(Boolean)
              .join(' ')}>
            {labelText}
          </label>
        )}
        {showReadout && (
          <span className="cds-slider__readout" aria-hidden="true">
            {readoutEl}
          </span>
        )}
      </div>
      <div className="cds-slider__row">
        {twoHandles && fieldFor('lower')}
        {!stepped && rangeLabel(min, minLabel)}
        <div className="cds-slider__bar">
          <div
            {...(rest as HTMLAttributes<HTMLDivElement>)}
            ref={(el) => {
              trackRef.current = el;
              contentRef.current = el;
            }}
            className="cds-slider__track"
            // The fill and the knobs read the engines' live edges off the two roots.
            data-selection-edges=""
            data-invalid={norm.invalid || undefined}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            onMouseDown={(e) => e.preventDefault()}>
            {tickValues.map((v) => (
              <span
                key={v}
                className="cds-slider__tick"
                data-value={v}
                data-passed={passed(v) || undefined}
                data-special={isSpecial(v) || undefined}
                style={{ ['--cds-slider-p' as string]: frac(v) }}
                aria-hidden="true"
              />
            ))}
            <span className="cds-slider__line" aria-hidden="true" />
            {reference != null &&
              !twoHandles &&
              reference !== lower &&
              phase !== 'loading' && (
                <span
                  className="cds-slider__reference"
                  data-passed={passed(reference) || undefined}
                  style={{ ['--cds-slider-p' as string]: frac(reference) }}
                  aria-hidden="true"
                />
              )}
            {spotEl('lower')}
            {phase !== 'loading' && knobEl('lower')}
            {/* The upper knob's engine, nested so the fill can read both knobs' edges. */}
            <div
              ref={upperRootRef}
              className="cds-slider__upper"
              data-selection-edges="">
              {twoHandles && spotEl('upper')}
              {phase !== 'loading' && (
                <span
                  ref={baseFillRef}
                  className="cds-slider__fill"
                  data-tone={toneAttr(tone.base)}
                  data-reveal=""
                  aria-hidden="true"
                />
              )}
              {phase !== 'loading' &&
                tone.wipes.map((w) => (
                  <span
                    key={w.key}
                    ref={(el) => {
                      if (el) wipeEls.current.set(w.key, el);
                      else wipeEls.current.delete(w.key);
                    }}
                    className="cds-slider__fill cds-slider__fill--wipe"
                    data-tone={toneAttr(w.tone)}
                    aria-hidden="true"
                  />
                ))}
              {aiOn && phase !== 'loading' && (
                <canvas
                  ref={canvasRef}
                  className="cds-slider__dots"
                  aria-hidden="true"
                />
              )}
              {twoHandles && phase !== 'loading' && knobEl('upper')}
              {/* Two pills: drawn as one goo layer, a smooth lava-lamp merge (slider.scss). */}
              {pills && phase !== 'loading' && (
                <>
                  <span
                    ref={gooRef}
                    className="cds-slider__goo"
                    aria-hidden="true"
                    style={
                      { '--cds-slider-goo': `url(#${gooId})` } as CSSProperties
                    }>
                    <span className="cds-slider__blob cds-slider__blob--lower" />
                    <span className="cds-slider__blob cds-slider__blob--upper" />
                  </span>
                  <svg
                    className="cds-slider__goo-defs"
                    aria-hidden="true"
                    focusable="false">
                    <filter
                      id={gooId}
                      x="-5%"
                      y="-50%"
                      width="110%"
                      height="200%"
                      colorInterpolationFilters="sRGB">
                      {/* The goo: the two pills' alpha, blurred and thresholded (steeply, so the
                          stroke stays even), one smooth union. */}
                      <feGaussianBlur
                        in="SourceAlpha"
                        stdDeviation={GOO_BLUR[size]}
                        result="blur"
                      />
                      <feColorMatrix
                        in="blur"
                        type="matrix"
                        values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 24 -12"
                        result="goo"
                      />
                      {/* The hard shape (the pills exactly, and the goo between them), and the
                          fill's neck: that shape less the stroke all round. */}
                      <feComposite
                        in="goo"
                        in2="SourceAlpha"
                        operator="arithmetic"
                        k2={1}
                        k3={1}
                        result="hard"
                      />
                      <feMorphology
                        in="hard"
                        operator="erode"
                        radius={GOO_RING[size]}
                        result="neckFill"
                      />
                      {/* The goo's own edges anti-aliased (a sub-pixel blur); the pills' edges are
                          already smooth, as the browser drew them. */}
                      <feGaussianBlur
                        in="goo"
                        stdDeviation={GOO_AA}
                        result="gooAA"
                      />
                      <feGaussianBlur
                        in="neckFill"
                        stdDeviation={GOO_AA}
                        result="neckFillAA"
                      />
                      <feComposite
                        in="gooAA"
                        in2="SourceAlpha"
                        operator="arithmetic"
                        k2={1}
                        k3={1}
                        result="shape"
                      />
                      <feColorMatrix
                        in="SourceGraphic"
                        type="matrix"
                        values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 1 0 0 0"
                        result="pillFill"
                      />
                      <feComposite
                        in="neckFillAA"
                        in2="pillFill"
                        operator="arithmetic"
                        k2={1}
                        k3={1}
                        result="inner"
                      />
                      <feFlood
                        style={{ floodColor: 'var(--_knob)' }}
                        result="ink"
                      />
                      <feComposite
                        in="ink"
                        in2="shape"
                        operator="in"
                        result="outline"
                      />
                      <feFlood
                        style={{ floodColor: 'var(--_surface)' }}
                        result="surface"
                      />
                      <feComposite
                        in="surface"
                        in2="inner"
                        operator="in"
                        result="fill"
                      />
                      <feMerge>
                        <feMergeNode in="outline" />
                        <feMergeNode in="fill" />
                      </feMerge>
                    </filter>
                  </svg>
                </>
              )}
              {/* Circles overlapping: their intersection, Venn-style (slider.scss). */}
              {circles && phase !== 'loading' && (
                <span className="cds-slider__lens" aria-hidden="true">
                  <span className="cds-slider__lens-in" />
                </span>
              )}
              {/* Joined: a line at the seam, so the two values still read (slider.scss). */}
              {(pills || circles) && phase !== 'loading' && (
                <span className="cds-slider__seam" aria-hidden="true" />
              )}
            </div>
            {phase !== 'loaded' && (
              <span
                ref={overlayRef as never}
                {...overlayProps}
                className="cds-slider__skeleton">
                <SkeletonPlaceholder className="cds-slider__skeleton-block" />
              </span>
            )}
          </div>
          {stepList && stepLabels && (
            <div className="cds-slider__step-labels" aria-hidden="true">
              {stepList.map((s, i) => (
                <span
                  key={i}
                  className="cds-slider__step-label"
                  data-current={i === lower || undefined}
                  style={{ ['--cds-slider-p' as string]: frac(i) }}>
                  {s.label ?? String(i)}
                </span>
              ))}
            </div>
          )}
        </div>
        {!stepped && rangeLabel(max, maxLabel)}
        {(twoHandles ? ['upper' as const] : handles).map((h) => (
          <span key={h} className="cds-slider__field-slot">
            {fieldFor(h)}
          </span>
        ))}
      </div>
      <FieldMessage
        status={shown}
        // The warning's text stays while it leaves, so the line fades out instead of vanishing at
        // once, and the next message has something to wait for.
        warnText={norm.warn ? warnText : (correction ?? warnText)}
        invalidText={invalidText}
        helperId={norm.helperId}
        warnId={norm.warnId}
        invalidId={norm.invalidId}
        disabled={norm.disabled}
      />
      {/* v11 announces a correction (role="alert"). */}
      <span className="cds-field-visually-hidden" role="alert">
        {correction}
      </span>
    </div>
  );
}
Slider.displayName = 'Slider';

export interface SliderSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** v11: the handle's aria-label. */
  ariaLabel?: string;
  /** v11: the upper handle's aria-label. */
  unstable_ariaLabelHandleUpper?: string;
  className?: string;
  hideLabel?: boolean;
  /** A range slider. */
  twoHandles?: boolean;
  /* The slider's layout props, so the skeleton is the slider's own layout. */
  labelText?: ReactNode;
  hideTextInput?: boolean;
  size?: SliderProps['size'];
  ticks?: SliderProps['ticks'];
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  formatLabel?: SliderProps['formatLabel'];
}

/**
 * v11's SliderSkeleton: the slider itself, loading. Unlike v11's, it keeps the
 * number fields (its frames, with a value bar), so it is the slider's size.
 */
export function SliderSkeleton({
  ariaLabel,
  unstable_ariaLabelHandleUpper,
  className,
  hideLabel = false,
  twoHandles = false,
  labelText,
  hideTextInput,
  size,
  ticks,
  min = 0,
  max = 100,
  minLabel,
  maxLabel,
  formatLabel,
  ...rest
}: SliderSkeletonProps) {
  return (
    <div
      {...rest}
      className={['cds-slider-skeleton', className].filter(Boolean).join(' ')}>
      <Slider
        loading
        labelText={
          labelText ??
          (hideLabel ? undefined : (
            <SkeletonText
              lineHeight="100%"
              width="6rem"
              className="cds-slider__label-bar"
            />
          ))
        }
        hideLabel={hideLabel}
        hideTextInput={hideTextInput}
        size={size}
        ticks={ticks}
        min={min}
        max={max}
        minLabel={minLabel}
        maxLabel={maxLabel}
        formatLabel={formatLabel}
        value={min}
        unstable_valueUpper={twoHandles ? max : undefined}
        ariaLabelInput={ariaLabel}
        unstable_ariaLabelInputUpper={unstable_ariaLabelHandleUpper}
      />
    </div>
  );
}
