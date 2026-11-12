/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  useContext,
  useEffect,
  type CSSProperties,
  type RefObject,
} from 'react';
import { attachRollover } from '@carbon-labs/v12-motion';
import { quietSteps } from '@carbon-labs/react-util';
import './button.scss';
import './button-shell.scss';
import { TooltipMotionContext } from '@carbon-labs/v12-motion';
import { useReducedGetter } from '@carbon-labs/react-util';

/* ============================================================================
 * The button shell — one button shape divided into cells
 * ============================================================================
 *
 * One button shell divided into cells, rounded only at its outer corners.
 * Three components sit on it: ComboButton (two cells), MenuButton (one) and
 * ButtonGrid (many, wrapping into rows). Nothing grows or presses in. The
 * seams follow the kit's rule for a divided control: a 1px knockout on the filled
 * looks (primary, secondary), a 1px line in the outline's colour on the
 * outlined one (`variant="outlined"`) and the quiet 1px hairline on the
 * tonal one (`"tonal"`).
 *
 *   shell     `.cds-btn-shell`: the size, the look, the corner, the lines
 *             (the outline, the seam or the knockout per look,
 *             button-shell.scss)
 *   cell      `.cds-btn-cell`: a real <button> with the Button's look
 *             classes (`.cds-btn--primary` …, button.scss) for its colours,
 *             its own rollover surface (`@mixin rollover`), so the glow, the
 *             pressed colour and the release circle stay clipped to the cell
 *   cuts      which of a cell's sides lie on another cell (`--cut-*`, 1)
 *             rather than the shell's outside (0): `rowCuts` / `gridCuts`,
 *             in logical sides, so right-to-left follows. A cell rounds only
 *             the corners between two outside sides and draws the seam on its
 *             end and below sides
 *   focus     each cell its own keyboard-only ring (Button's), which follows
 *             its corners: round outside, square at the seam
 *   tonal     `variant="tonal"` (the `neutral` class, a quieter look; the
 *             Button has it too): tertiary's lines
 *             in the kit's standard surface (the side nav's panel fill and
 *             hairline), `$text-primary` labels, the quiet card hover
 *             toned to `$text-primary` (`quietSteps`)
 * ========================================================================== */

/** A shell's look, by the Button's class names (`resolveButtonLook`): the filled roles, outlined (`tertiary`), ghost and tonal (`neutral`). */
export const ShellLooks = [
  'primary',
  'secondary',
  'tertiary',
  'ghost',
  'neutral',
] as const;
export type ShellLook = (typeof ShellLooks)[number];
export type ShellCorners = 'full' | 'rounded' | 'square';

/** Which sides of a cell lie on another cell (true) rather than the shell's outside. */
export interface CellCuts {
  start: boolean;
  end: boolean;
  above: boolean;
  below: boolean;
}

/** A cell in a row of `n`: cut where it has a neighbour. */
export function rowCuts(i: number, n: number): CellCuts {
  return { start: i > 0, end: i < n - 1, above: false, below: false };
}

/** A cell `i` of `n` in a grid of `cols` columns, filled row by row (the last row may be short). */
export function gridCuts(i: number, n: number, cols: number): CellCuts {
  const c = Math.max(1, cols);
  const col = i % c;
  return {
    start: col > 0,
    end: col < c - 1 && i < n - 1,
    above: i >= c,
    below: i + c < n,
  };
}

/** The cuts as the custom properties the shell's styles read. */
export function cutStyle(c: CellCuts): CSSProperties {
  return {
    '--cut-start': c.start ? 1 : 0,
    '--cut-end': c.end ? 1 : 0,
    '--cut-above': c.above ? 1 : 0,
    '--cut-below': c.below ? 1 : 0,
  } as CSSProperties;
}

export function shellClasses(o: {
  look: ShellLook;
  size: string;
  corners?: ShellCorners;
  className?: string | false;
}): string {
  return [
    'cds-btn-shell',
    `cds-btn-shell--${o.size}`,
    `cds-btn-shell--${o.look}`,
    `cds-btn-shell--${o.corners ?? 'full'}`,
    o.className,
  ]
    .filter(Boolean)
    .join(' ');
}

export function cellClasses(o: {
  look: ShellLook;
  role: 'label' | 'chevron' | 'menu' | 'grid';
  disabled?: boolean;
  busy?: boolean;
  selected?: boolean;
  className?: string | false;
}): string {
  return [
    'cds-btn-cell',
    `cds-btn-cell--${o.role}`,
    // The Button's look: its colours, tone and focus offset (button.scss).
    `cds-btn--${o.look}`,
    o.disabled && 'cds-btn--disabled',
    o.busy && 'cds-btn-cell--busy',
    o.selected && 'cds-btn-cell--selected',
    o.className,
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * The rollover over every cell of a shell (or a grid of shells): one
 * `attachRollover` on the root, each `.cds-btn-cell` its own control, as the
 * Button's (hover glow, flat press, release circle; matched-lightness and
 * toned colours). Re-attached when `key` changes (a look's colours are
 * written per control). `quiet`: the quiet card hover's steps (neutral).
 */
export function useShellRollover(
  ref: RefObject<HTMLElement | null>,
  key: string,
  timeScale = 1,
  quiet = false
): void {
  const rolloverReduced = useReducedGetter(
    useContext(TooltipMotionContext).reduced
  );
  useEffect(() => {
    const root = ref.current;
    if (!root) {
      return;
    }
    const detach = attachRollover(root, {
      selector: '.cds-btn-cell',
      timeScale,
      steps: quiet ? quietSteps() : undefined,
      reduced: rolloverReduced,
    });
    return () => {
      detach();
      for (const el of root.querySelectorAll<HTMLElement>('.cds-btn-cell')) {
        el.style.removeProperty('--cds-motion-rollover-hover-color');
        el.style.removeProperty('--cds-motion-rollover-press-color');
        el.style.removeProperty('--cds-motion-rollover-color');
        el.style.removeProperty('--cds-motion-rollover-label');
      }
    };
  }, [ref, key, timeScale, quiet, rolloverReduced]);
}
