# Storybook Consumability Plan

## Overview

Make the Processing component Storybook page as consumable as (or better than) the
Carbon Labs Processing page at labs.carbondesignsystem.com, with the goal of eventual
submission to Carbon Labs.

Carbon Labs provides: a rich Overview narrative, light/dark visual demos, install/import
snippets, a Component API table with descriptions and defaults, and named copyable usage
examples. Our page currently has none of these — it opens directly to a bare auto-play
demo with no context, no install guidance, no prop descriptions in the Controls table,
and stale/missing JSDoc.

Scope: stories file, component types/JSDoc, and one new MDX overview page.
No animation logic changes.

**Decisions locked in:**
- Package name for import snippets: `@mike-olasov/motion-components`
- No Figma file yet — Figma section will describe what the component does and note
  that a Figma kit is coming
- The existing `Default` auto-play story is replaced by two named demo stories:
  1. `Loading` — load → loop → out (same as current auto-play)
  2. `Triangle` — load → loop → triggerTriangle → 1 s hold → out
- No bare `Loop` / `NoLoop` stories — the component is more capable than that framing

---

## Sub-Tasks

---

### 1. Fix type consistency — add `'wiggle'` to `ProcessingMode`

**Status:** [x] done

**Intent:**
The stories argTypes `options` list includes `'wiggle'` but `ProcessingMode` only has
four values. This causes a TypeScript/runtime mismatch and makes the Controls table
misleading. Wiggle is imperative-only so the mode effect does not need to handle it, but
the type should document it so consumers know it is a valid value.

**Expected Outcomes:**
- `ProcessingMode` includes `'wiggle'`
- The `useEffect` mode switch has a silent no-op for `'wiggle'` (imperative-only)
- `tsc --noEmit` passes

**Todo List:**
1. In `Processing.tsx` line 103, add `'wiggle'` to the `ProcessingMode` union
2. In the `useEffect` mode switch, confirm `'wiggle'` falls through without
   triggering any animation (it is a no-op — `triggerWiggle` is called imperatively)
3. Run `tsc --noEmit`

**Relevant Context:**
- `Processing.tsx` line 103: `export type ProcessingMode = 'loading' | 'triangle' | 'square' | 'out'`
- `Processing.stories.tsx` line 42: `options: ['loading', 'triangle', 'square', 'out', 'wiggle']`

---

### 2. Add JSDoc to `ProcessingProps` and fix `ProcessingHandle` JSDoc

**Status:** [x] done

**Intent:**
Storybook autodocs generates the Component API / Controls table from JSDoc on interface
fields. Without it the table shows blank descriptions and no defaults. This is the
single highest-impact change for consumability — it is what makes the Carbon Labs API
table useful.

**Expected Outcomes:**
- All four `ProcessingProps` fields have inline JSDoc with a description and `@defaultValue`
- All four `ProcessingHandle` methods have accurate, consistent JSDoc
  - `triggerOut` currently has no JSDoc
  - `triggerWiggle` still says "down 12px back to start" — stale from earlier iteration
  - `triggerTriangle` says "slide + arc formation" — should say "arc"
- `tsc --noEmit` passes

**Todo List:**
1. Add JSDoc to each `ProcessingProps` field:
   - `mode` — "Animation state. Controls which sequence runs on mount." + `@defaultValue 'loading'`
   - `loop` — "Whether the loading loop repeats indefinitely. Only applies in `loading` mode." + `@defaultValue true`
   - `label` — "Accessible label for the status region." + `@defaultValue 'Processing'`
   - `className` — "Additional CSS class applied to the root element."
2. `ProcessingHandle.triggerOut` — add JSDoc: "Shrink all visible dots to zero from their current positions."
3. `ProcessingHandle.triggerTriangle` — update to: "Arc the three dots into an equilateral triangle immediately. 50 ms left-to-right stagger."
4. `ProcessingHandle.triggerSquare` — update to: "Grow a fourth dot and arc all four into a square. 50 ms left-to-right stagger."
5. `ProcessingHandle.triggerWiggle` — update to: "Bob each dot up 6 px and back. 200 ms left-to-right stagger, 400 ms per dot."
6. Run `tsc --noEmit`

**Relevant Context:**
- `Processing.tsx` lines 105–120: `ProcessingProps` and `ProcessingHandle` interfaces

---

### 3. Wire `argTypes` defaults and expand descriptions

**Status:** [x] done

**Intent:**
Carbon Labs shows `Default: true` next to `loop` in the API table. Storybook renders
this from `argTypes[prop].table.defaultValue`. Currently none of our argTypes have
defaults wired, so the Controls table default column is blank.

**Expected Outcomes:**
- Controls table shows correct defaults: `mode: 'loading'`, `loop: true`, `label: 'Processing'`
- `mode` description names all five values with one-line explanations
- `tsc --noEmit` passes

**Todo List:**
1. Add `table: { defaultValue: { summary: ... } }` to `mode`, `loop`, and `label`
   argTypes entries
2. Expand `mode` description to document all five values inline
3. Run `tsc --noEmit`

**Relevant Context:**
- `Processing.stories.tsx` lines 39–53: `argTypes` block

---

### 4. Replace `Default` story with two named demo stories

**Status:** [x] done

**Intent:**
The current single auto-play story is replaced by two demos that showcase the full
range of the component. Carbon Labs named its stories by behaviour ("Linear Loop",
"Linear No Loop") — we do the same but with richer sequences that show the imperative
API in action. The `Interactive` story stays untouched.

**Expected Outcomes:**
- Sidebar shows: Overview (MDX) → Loading → Triangle → Interactive controls
- `Loading` story: load-in → 2 pulse loops → out → repeat (same as current `Default`)
- `Triangle` story: load-in → 2 pulse loops → `triggerTriangle()` → 1 s hold → `triggerOut()` → restart
- Each story has a `parameters.docs.description.story` string
- Old `Default` / `AutoPlayDemo` export removed
- `tsc --noEmit` passes

**Timing reference for `Triangle` story (all ms):**
- Load-in ends (last dot): `STAGGER*2 + LOAD_DUR` = 1400
- 2 loop cycles (last dot): `LOOP_DUR * 2` = 2000
- `triggerTriangle` fires at: 1400 + 2000 = 3400
- Triangle settles (last dot lands): `FORM_DUR + FORM_STAGGER*2` = 700 + 100 = 800 after trigger = 4200
- Hold for 1000 ms: `triggerOut` fires at 4200 + 1000 = 5200
- Out finishes + gap: 200 + 300 = 500 → restart at 5700

**Todo List:**
1. Remove `AutoPlayDemo` function and `Default` story export
2. Add `LoadingDemo` function: identical timing to old `AutoPlayDemo`
3. Add `export const Loading: Story` wrapping `LoadingDemo`, with story description
4. Add `TriangleDemo` function following the timing above
5. Add `export const Triangle: Story` wrapping `TriangleDemo`, with story description
6. Keep `Interactive` export unchanged
7. Run `tsc --noEmit`

**Relevant Context:**
- `Processing.stories.tsx` lines 85–119: current `AutoPlayDemo` + `Default`
- Constants in stories: `LOAD_IN_END`, `PULSE_CYCLES`, `OUT_SETTLE` — reuse/extend

---

### 5. Add `Processing.mdx` Overview page

**Status:** [x] done

**Intent:**
Carbon Labs' biggest advantage is the Overview page: it establishes what the component
is for, shows it in context, provides install/import snippets, and links to Figma.
Our autodocs page has none of this. An MDX page at the top of the sidebar section gives
the same first-impression quality.

**Expected Outcomes:**
- `src/stories/Processing.mdx` exists and renders as the first sidebar entry under
  `Components/Processing`, named "Overview"
- Page sections (in order):
  1. **Description** — one paragraph: what Processing is, when to use it
  2. **Live demo** — `<Canvas of={Stories.Loading} />` (auto-plays on load)
  3. **Getting started** — `yarn add @mike-olasov/motion-components` install snippet
  4. **JS import** — `import { Processing } from '@mike-olasov/motion-components'`
  5. **SCSS import** — `@use '@mike-olasov/motion-components/scss/processing'`
  6. **Component API** — `<Controls of={Stories.Loading} />` prop table
  7. **Figma** — short note that the Figma kit is in progress; describes what the
     component looks like in each theme (light/dark dot colour tokens)
  8. **Example usages** — three fenced code blocks:
     - Basic loop: `<Processing loop />`
     - Triangle formation: `<Processing mode="triangle" />`
     - Imperative handle: `useRef<ProcessingHandle>` + `triggerTriangle()` pattern
- `tsc --noEmit` and Storybook build pass

**Todo List:**
1. Create `src/stories/Processing.mdx`
2. Use Storybook 8 MDX format: `import { Meta, Canvas, Controls } from '@storybook/blocks'`
3. Import story exports: `import * as Stories from './Processing.stories'`
4. Set `<Meta of={Stories} />` (ties the MDX to the same component group, inherits theme)
5. Write Description section
6. Add `<Canvas of={Stories.Loading} />` live demo
7. Add Getting started, JS import, SCSS import as fenced code blocks
8. Add `<Controls of={Stories.Loading} />` for the prop table
9. Write Figma section (no link yet; describe light/dark appearance)
10. Add three Example usages code blocks
11. Confirm sidebar order and run Storybook build

**Relevant Context:**
- Carbon Labs page structure: description → demo → Figma → getting started →
  import → API table → example usages
- Storybook 8 MDX: `<Meta of={Stories} />` pattern (not `<Meta title="..." />`)
- `src/stories/` — co-locate MDX here
