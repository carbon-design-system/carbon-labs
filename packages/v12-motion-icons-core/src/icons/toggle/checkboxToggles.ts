/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Checkbox32 from '@carbon/icons/es/checkbox/32.js';
import CheckboxChecked32 from '@carbon/icons/es/checkbox--checked/32.js';
import CheckboxCheckedFilled32 from '@carbon/icons/es/checkbox--checked--filled/32.js';
import CheckboxIndeterminate32 from '@carbon/icons/es/checkbox--indeterminate/32.js';
import CheckboxIndeterminateFilled32 from '@carbon/icons/es/checkbox--indeterminate--filled/32.js';
import {
  carbonArt,
  fillThenClear,
  stateIcon,
  toggleIcon,
  variantToggle,
  TOGGLE_IN,
  TOGGLE_OUT,
  type CarbonIcon,
  type Frame,
  type StateIconProps,
  type StateSpec,
  type ToggleIconProps,
} from '../../engine';
import {
  CHECKBOX_REST,
  checkboxFilledShapes,
  checkboxOutlineShapes,
  checkboxStateFilled,
  checkboxStateOutline,
  type CheckboxFrame,
  type CheckboxState,
} from '../status/carbonInternals';
import { DRAW_IN, DRAW_OUT } from './checkToggles';

const CCheckbox = /* @__PURE__ */ carbonArt(Checkbox32);
const CCheckboxChecked = /* @__PURE__ */ carbonArt(CheckboxChecked32);
const CCheckboxCheckedFilled = /* @__PURE__ */ carbonArt(
  CheckboxCheckedFilled32
);
const CCheckboxIndeterminate = /* @__PURE__ */ carbonArt(
  CheckboxIndeterminate32
);
const CCheckboxIndeterminateFilled = /* @__PURE__ */ carbonArt(
  CheckboxIndeterminateFilled32
);

/**
 * Checkbox toggles, for Carbon's Checkbox component.
 *
 * - `CheckboxToggle`: checkbox ⇄ checkbox--checked--filled (what Carbon's
 *   Checkbox shows). The house disc fill (§7.7) via `fillThenClear`: a disc
 *   grows from the box's centre, clipped to its inside, in 160ms on the
 *   entrance ease, and the check becomes a knockout in it as the fill passes
 *   (as CheckmarkToggle's); to clear, a hole grows from the same
 *   centre in 120ms on the exit ease, taking the knockout with it.
 * - `CheckboxOutlineToggle`: checkbox ⇄ checkbox--checked. The check draws
 *   in from its short arm with CheckmarkOutlineToggle's strong ease-out
 *   (160ms), and unchecking wipes it away from the same end (120ms, exit
 *   ease), so it leaves the way it came rather than rewinding.
 *
 * Hover (either state) is the hover icons' own (carbonInternals.ts): the
 * box grows 2px on every side and the check grows 20% about its centre at
 * constant weight. Both ends are those icons' geometry exactly.
 */

export const CheckboxFilledToggleSpec = /* @__PURE__ */ toggleIcon<
  'unchecked' | 'checked'
>('CheckboxToggle', {
  states: ['unchecked', 'checked'],
  statics: [CCheckbox, CCheckboxCheckedFilled],
  geo: checkboxFilledShapes,
  change: fillThenClear,
});

export const CheckboxOutlineToggleSpec = /* @__PURE__ */ toggleIcon<
  'unchecked' | 'checked'
>('CheckboxToggle(outline)', {
  states: ['unchecked', 'checked'],
  statics: [CCheckbox, CCheckboxChecked],
  geo: checkboxOutlineShapes,
  change: (turningOn, fr, tween, repaint) => {
    // Mid-wipe: bring the wiped part back. Otherwise draw in.
    if (turningOn) {
      return fr.e > 0 ? tween('e', 0, DRAW_IN) : tween('p', 1, DRAW_IN);
    }
    return tween('e', fr.p, DRAW_OUT, () => {
      fr.p = 0;
      fr.e = 0;
      repaint();
    });
  },
});

// ── Three states: unchecked, indeterminate, checked ─────────────────────────
//
// One state icon per variant (makeStateIcon), rather than pairwise toggles,
// so a single component follows Carbon's Checkbox through all three states:
//
//   <CheckboxStateToggle value={checked ? 'checked' : indeterminate ? 'indeterminate' : 'unchecked'} />
//
// `value` controls it (every change animates); uncontrolled, `initial` sets
// the start and each click steps unchecked → indeterminate → checked →
// unchecked, reporting the next state through `onChange`. As a button
// (`asButton`), aria-pressed is false / "mixed" / true.
//
// Transitions (both variants, either direction):
// - unchecked ⇄ checked: exactly the two-state toggles above.
// - unchecked ⇄ indeterminate: as unchecked ⇄ checked with the bar. Filled:
//   the disc fill, the bar a knockout as it passes; cleared by the hole.
//   Outline: the bar grows out from its centre (160ms, the check's strong
//   ease-out) and retracts to its centre (120ms, exit ease).
// - indeterminate ⇄ checked: the match cut (Play ⇄ Pause): the bar or check
//   shrinks, cut at 6/15, the other appears small and grows to full; 160ms
//   both ways, since neither state is "off" (as Play ⇄ Pause and
//   Record ⇄ Stop). Filled, both are knockouts and the fill holds.
// - From mid-flight: a change reverses whatever is moving; if the other
//   glyph is wanted while one is still showing, it cuts across to it.
//
// Hover in every state is that state's icon's own: the box grows 2px a
// side, the check grows 20%, the bar reaches 2px each end.

// Linear progress: the match cut applies its own two-part easing.
const CUT = {
  duration: TOGGLE_IN.duration,
  ease: [0, 0, 1, 1] as unknown as typeof TOGGLE_IN.ease,
};
const STATES: readonly CheckboxState[] = [
  'unchecked',
  'indeterminate',
  'checked',
];

/* @__NO_SIDE_EFFECTS__ */
function checkboxStates(
  name: string,
  filled: boolean,
  statics: Record<CheckboxState, CarbonIcon>
) {
  const [IN, OUT] = filled ? [TOGGLE_IN, TOGGLE_OUT] : [DRAW_IN, DRAW_OUT];
  const geo = filled ? checkboxStateFilled : checkboxStateOutline;
  const change: StateSpec<CheckboxState>['change'] = (
    _prev,
    next,
    fr,
    tween,
    repaint
  ) => {
    const reset = () => {
      fr.p = 0;
      fr.e = 0;
      fr.k = Math.round(fr.k); // left mid-cut: settle the hidden glyph at full size
      repaint();
    };
    if (next === 'unchecked') {
      // The glyph leaves as in the two-state toggles: filled, the hole clears
      // the fill (or a part-grown fill shrinks back); outline, it's wiped from its start.
      if (filled) {
        return fr.p < 1 ? tween('p', 0, OUT) : tween('e', 1, OUT, reset);
      }
      return tween('e', fr.p, OUT, reset);
    }
    const k = next === 'checked' ? 1 : 0;
    const showing = filled ? fr.p > 0 && fr.e < 1 : fr.p - fr.e > 1e-6;
    if (!showing) {
      // From unchecked: the wanted glyph comes in as the fill (or draw) does.
      fr.p = 0;
      fr.e = 0;
      fr.k = k;
      return tween('p', 1, IN);
    }
    const runs = [];
    if (fr.k !== k) {
      runs.push(tween('k', k, CUT));
    }
    if (fr.e > 0) {
      runs.push(tween('e', 0, IN));
    } else if (fr.p < 1) {
      runs.push(tween('p', 1, IN));
    }
    return runs;
  };
  return stateIcon<CheckboxState>(name, {
    states: STATES,
    statics,
    rest: (s) => ({ ...CHECKBOX_REST[s] }),
    geo: (fr: Frame) =>
      geo({ h: fr.h, p: fr.p, e: fr.e, k: fr.k } as CheckboxFrame),
    change,
    pressed: (s) => (s === 'indeterminate' ? 'mixed' : s === 'checked'),
  });
}

/** Carbon's Checkbox: checkbox, checkbox--indeterminate--filled, checkbox--checked--filled. */
export const CheckboxStateFilledToggleSpec = /* @__PURE__ */ checkboxStates(
  'CheckboxStateToggle',
  true,
  {
    unchecked: CCheckbox,
    indeterminate: CCheckboxIndeterminateFilled,
    checked: CCheckboxCheckedFilled,
  }
);
/** The outline set: checkbox, checkbox--indeterminate, checkbox--checked. */
export const CheckboxStateOutlineToggleSpec = /* @__PURE__ */ checkboxStates(
  'CheckboxStateToggle(outline)',
  false,
  {
    unchecked: CCheckbox,
    indeterminate: CCheckboxIndeterminate,
    checked: CCheckboxChecked,
  }
);

// The public toggles. Carbon's Checkbox draws its checked and indeterminate
// marks filled, so these are filled unless `filled={false}` (the only toggles
// whose `filled` defaults to true).

/** Checkbox ⇄ checked: checkbox--checked--filled, or with `filled={false}` checkbox--checked. */
export const CheckboxToggleSpec = /* @__PURE__ */ variantToggle(
  'CheckboxToggle',
  (p: ToggleIconProps<'unchecked' | 'checked'>) =>
    p.filled === false ? CheckboxOutlineToggleSpec : CheckboxFilledToggleSpec
);
/**
 * Carbon's Checkbox through unchecked → indeterminate → checked: the filled
 * marks, or with `filled={false}` checkbox--indeterminate / checkbox--checked.
 */
export const CheckboxStateToggleSpec = /* @__PURE__ */ variantToggle(
  'CheckboxStateToggle',
  (p: StateIconProps<CheckboxState>) =>
    p.filled === false
      ? CheckboxStateOutlineToggleSpec
      : CheckboxStateFilledToggleSpec
);
