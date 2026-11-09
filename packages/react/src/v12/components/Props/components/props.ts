/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** The kit's prop vocabulary: the shared types, and the resolutions beyond `a ?? b` as plain functions, testable without rendering. */
import { useMemo } from 'react';

/**
 * A component's `motion` dials with its top-level `timeScale` folded in: the
 * top-level prop wins over `motion.timeScale`, and leaves `motion` as it is
 * when it isn't given.
 */
export function withTimeScale<M extends { timeScale?: number }>(
  motion: M | undefined,
  timeScale: number | undefined
): M | undefined {
  if (timeScale === undefined) {
    return motion;
  }
  return { ...motion, timeScale } as M;
}

/** `withTimeScale`, kept stable across renders while its inputs are. */
export function useWithTimeScale<M extends { timeScale?: number }>(
  motion: M | undefined,
  timeScale: number | undefined
): M | undefined {
  return useMemo(() => withTimeScale(motion, timeScale), [motion, timeScale]);
}

/* ============================================================================
 * The three axes
 *
 *   frame    what a component stands on: its structure
 *   kind     its role or status (Carbon's): Button's primary · secondary ·
 *            danger, Notification's error · success …
 *   variant  its treatment: inverse · tonal · outlined · hero, and neutral
 *            where there's no selector (fields, loaders)
 *
 * One name per idea, no aliases.
 * ========================================================================== */

/**
 * What a component stands on. Each component takes the frames it has:
 *
 *   ghost     no surface of its own: the selector, hover and focus only
 *   inset     its own rounded surface, its content inset (the switcher's
 *             track, the select list, the side nav's panel)
 *   flush     fills its container edge to edge, square (the side nav's
 *             column, v11's)
 *   floating  raised over the page (menus, listboxes, popovers, flyouts)
 *   line      tabs only: the rule the selector rides
 */
export type Frame = 'ghost' | 'inset' | 'flush' | 'floating' | 'line';

/** Button's roles (`kind`, Carbon's): what the action is. */
export type ButtonRole = 'primary' | 'secondary' | 'danger';
/**
 * Button's treatments (`variant`): `filled` (default) the role's own solid
 * fill, v11's primary, secondary and danger; `outlined` v11's tertiary;
 * `tonal` the quiet fill (the standard surface, its hairline, a
 * `$text-primary` label). `filled` is the one word the kit adds for the
 * button (none of inverse · tonal · outlined · hero is the role's fill: a
 * secondary's gray stays dark on the dark themes, so it isn't inverse, and
 * primary's blue is Carbon's action colour, not the hero brand); it's named
 * here and in `BUTTON_DEFAULTS` only, so renaming it is a type-checked sweep.
 */
export type ButtonVariant = 'filled' | 'outlined' | 'tonal';
/**
 * Button's frames (`frame`): `inset` (default) its own rounded surface, the
 * label inset in it; `ghost` no surface of its own (v11's ghost); `none` no
 * box at all, the label alone (the link-blue text button).
 */
export type ButtonFrame = 'inset' | 'ghost' | 'none';

/**
 * Every axis's own default (the kit's standard). A component that wants a different default look changes that
 * one axis's default (CopyButton: `frame` ghost; ButtonGrid and EmptyState's
 * action: `variant` outlined); setting another axis never resets it.
 */
export const BUTTON_DEFAULTS = {
  kind: 'primary',
  variant: 'filled',
  frame: 'inset',
} as const satisfies Required<{
  kind: ButtonRole;
  variant: ButtonVariant;
  frame: ButtonFrame;
}>;

/** A button's role, treatment and frame: Button, IconButton, the button shell, and the action descriptors that make them. */
export interface ButtonLookProps {
  kind?: ButtonRole;
  variant?: ButtonVariant;
  frame?: ButtonFrame;
}

/**
 * The look a button draws, by v11's kind names (they stay its class names,
 * `.cds-btn--tertiary` …): the filled roles, `tertiary` and
 * `danger--tertiary` (outlined), `ghost` and `danger--ghost` (the ghost
 * frame), `neutral` (tonal) and `text` (no frame).
 */
export type ButtonLook =
  | ButtonRole
  | 'tertiary'
  | 'danger--tertiary'
  | 'ghost'
  | 'danger--ghost'
  | 'neutral'
  | 'text';

/**
 * A button's `kind`, `variant` and `frame`, each given or else its own
 * default (`defaults`: the kit's, or a component's with one axis changed),
 * to its look. The frame wins over the variant, and only danger keeps its
 * hue in another treatment or frame: an outlined or ghost primary or
 * secondary is v11's neutral tertiary or ghost, and tonal is always the
 * neutral quiet fill.
 */
export function resolveButtonLook(
  p: ButtonLookProps,
  defaults: ButtonLookProps = BUTTON_DEFAULTS
): ButtonLook {
  const kind = p.kind ?? defaults.kind ?? BUTTON_DEFAULTS.kind;
  const variant = p.variant ?? defaults.variant ?? BUTTON_DEFAULTS.variant;
  const frame = p.frame ?? defaults.frame ?? BUTTON_DEFAULTS.frame;
  const danger = kind === 'danger';
  if (frame === 'none') {
    return 'text';
  }
  if (frame === 'ghost') {
    return danger ? 'danger--ghost' : 'ghost';
  }
  if (variant === 'outlined') {
    return danger ? 'danger--tertiary' : 'tertiary';
  }
  if (variant === 'tonal') {
    return 'neutral';
  }
  return kind;
}

/** Slider's shapes (`shape`): a line, a track, or a knob alone. */
export type SliderShape = 'line' | 'track' | 'knob';
/** Slider's treatments (`variant`): `hero` is the blue. */
export type SliderVariant = 'inverse' | 'hero';

/** A field's treatments: `neutral` (default) or `hero`, the blue. */
export type FieldVariant = 'neutral' | 'hero';
/** A field's frames: `inset` (default) its fill and hairline; `ghost` neither at rest, the ladder kept. */
export type FieldFrame = 'inset' | 'ghost';

/** Toggle's treatments (`variant`): the neutral track's looks, `hero` (a blue on track) and `status` (a red off, a green on track). */
export type ToggleVariant =
  | 'inverse'
  | 'tonal'
  | 'outlined'
  | 'hero'
  | 'status';
/** Toggle's status dot (`mark`): `true` a gray dot, `'status'` red off and green on, `false` none. */
export type ToggleMark = boolean | 'status';

/** Toggle's `variant` and `mark`, to its look: `hero` and `status` color the
 * track, which never shows the dot; the rest are the neutral track's. */
export function resolveToggleLook(p: {
  variant?: ToggleVariant;
  mark?: ToggleMark;
}): {
  variant: 'inverse' | 'tonal' | 'outlined';
  track: 'neutral' | 'hero' | 'status';
  mark: 'none' | 'neutral' | 'status';
} {
  if (p.variant === 'hero' || p.variant === 'status') {
    return { variant: 'inverse', track: p.variant, mark: 'none' };
  }
  const mark =
    p.mark === false ? 'none' : p.mark === 'status' ? 'status' : 'neutral';
  return { variant: p.variant ?? 'inverse', track: 'neutral', mark };
}

/** Keyboard: arrows select (`automatic`) or move focus (`manual`). One word, `activation`, on Tabs, ContentSwitcher and the select list (v11's Tabs name; ContentSwitcher's `selectionMode` is gone). */
export type KeyboardMode = 'automatic' | 'manual';

/**
 * The icon size for a given field or control size: 20px at lg, 16px otherwise.
 * This is the kit's one rule (`--tf-icon`).
 */
export function iconSizeFor(size: string): 16 | 20 {
  return size === 'lg' ? 20 : 16;
}
