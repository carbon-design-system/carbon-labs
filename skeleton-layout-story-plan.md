# SkeletonLayout Story — Plan

## Overview

Expand the current `SkeletonLoader` component and Storybook story to showcase a richer
**SkeletonLayout** experience centred on the 4-up cards layout. The new story file follows the
structure of `Processing.stories.tsx` (named demo components per story, per-story descriptions,
and a companion `.mdx` doc page). The component itself will also be extended with the props
needed to power the new controls.

### Goals

- **Story**: New `SkeletonLoader.stories.tsx` modelled on the Processing story (named render
  functions, per-story descriptions). All variant switching is done via the Storybook Controls
  panel — no imperative buttons needed.
- **Component props**: Add `size` (`'default' | 'expressive'`) and expose the `layout` control
  more prominently as the primary visual differentiator.
- **Styling**: `expressive` variant uses larger type/panel block sizes; `default` keeps the
  current compact sizing. AI variant and `cornerRadius` already exist and simply need better
  story coverage.
- **MDX doc page**: Companion `SkeletonLoader.mdx` page following the Processing.mdx outline
  (overview canvas, component API controls table, example usages).
- **No animation changes** this iteration — motion refinement is a follow-up phase.

### Non-goals

- Changing `useSkeletonAnimation` timing or easing values.
- Adding new layout variants (hero, cards-3 are unchanged; cards-4 is the design focus).
- Changes to `themes.css` or `motion.css` tokens.
- An interactive-controls story with imperative buttons — Controls panel handles all toggling.
- A separate module CSS file for the stories — no custom buttons are needed.

---

## Sub-Task 1 — Extend `SkeletonLoaderProps` with `size`

**Status:** [x] done

### Intent

Add a `size` prop (`'default' | 'expressive'`) to the component's public API so the Storybook
Controls panel can switch between Carbon density modes. `expressive` increases the panel block
heights and text block widths to match the more generous Expressive type scale. `default` keeps
the existing compact sizing.

### Expected Outcomes

- `SkeletonLoader.types.ts` exports `SkeletonSize = 'default' | 'expressive'`.
- `SkeletonLoaderProps` has `size?: SkeletonSize` defaulting to `'default'`.
- Component passes a `size` CSS class (`.sizeDefault` / `.sizeExpressive`) to the root element.

### Todo List

1. In [`src/components/SkeletonLoader/SkeletonLoader.types.ts`](src/components/SkeletonLoader/SkeletonLoader.types.ts):
   - Add `export type SkeletonSize = 'default' | 'expressive';`
   - Add `size?: SkeletonSize;` to `SkeletonLoaderProps`.
2. In [`src/components/SkeletonLoader/SkeletonLoader.tsx`](src/components/SkeletonLoader/SkeletonLoader.tsx):
   - Destructure `size = 'default'` from props.
   - Pass `styles[`size${size[0].toUpperCase() + size.slice(1)}`]` (i.e. `styles.sizeDefault` /
     `styles.sizeExpressive`) as a `cx()` class on the root `<div>`.
3. In [`src/components/SkeletonLoader/SkeletonLoader.module.css`](src/components/SkeletonLoader/SkeletonLoader.module.css):
   - Add `.sizeExpressive` overrides for `.panelBlock`, `.panelBlockHero`, `.panelBlockSmall`,
     `.textBlock`, `.textBlockShort` — use ~20–25 % larger values (e.g. panelBlock: 18rem × 12rem,
     panelBlockSmall: 15rem × 12rem, textBlock: 12rem wide).
   - `.sizeDefault` class can be a no-op (values already correct at root level).

### Relevant Context

- [`src/components/SkeletonLoader/SkeletonLoader.types.ts`](src/components/SkeletonLoader/SkeletonLoader.types.ts)
- [`src/components/SkeletonLoader/SkeletonLoader.tsx`](src/components/SkeletonLoader/SkeletonLoader.tsx) — `cx()` already used for `aiVariant` and `cornerRadius`
- [`src/components/SkeletonLoader/SkeletonLoader.module.css`](src/components/SkeletonLoader/SkeletonLoader.module.css)

---

## Sub-Task 2 — Rewrite `SkeletonLoader.stories.tsx` following the Processing pattern

**Status:** [x] done

### Intent

Replace the flat export-per-story file with a Processing-style file that:
1. Uses named render-component functions (e.g. `Cards4DefaultDemo`, `Cards4AIDemo`) instead of
   plain arg objects, so each story clearly documents a fixed variant combination.
2. Sets `layout: 'fullscreen'` so skeleton layouts fill the canvas naturally.
3. Groups stories by variant combination: Default → AI → Rounded → Expressive → AI + Expressive.
4. Uses Storybook `args` on each story so the Controls panel can live-adjust all four dimensions
   from any story. No imperative buttons or module CSS needed.

### Expected Outcomes

- `src/stories/SkeletonLoader.stories.tsx` is replaced with the new file.
- No `SkeletonLoader.stories.module.css` needed.
- Five named stories using `render` + `args`: `Cards4Default`, `Cards4AI`, `Cards4Rounded`,
  `Cards4Expressive`, `Cards4AIExpressive`.
- `argTypes` covers `layout`, `aiVariant`, `cornerRadius`, `size` — all with descriptions and
  `table.defaultValue` summaries so the Controls panel is self-documenting.
- Each story sets its own fixed `args` (the preset combination it demonstrates) but the user can
  freely override any control in the panel.

### Todo List

1. Rewrite `src/stories/SkeletonLoader.stories.tsx`:
   - Import `SkeletonLoader` only (no module CSS, no `useState`).
   - Define `meta` with `title: 'Components/SkeletonLoader'`, `tags: []` (MDX owns docs),
     `parameters.layout: 'fullscreen'`, and the full `argTypes` map for `layout`, `aiVariant`,
     `cornerRadius`, `size`.
   - Write a named demo-component render function per story (e.g. `function Cards4DefaultDemo`)
     that accepts the story args and passes them straight to `<SkeletonLoader />`.
   - Set story `args` to the fixed preset: e.g. `Cards4Default` → `{ layout: 'cards-4',
     aiVariant: false, cornerRadius: false, size: 'default' }`.
   - Export all five stories.

### Relevant Context

- [`src/stories/Processing.stories.tsx`](src/stories/Processing.stories.tsx) — structural template
- [`src/stories/SkeletonLoader.stories.tsx`](src/stories/SkeletonLoader.stories.tsx) — file to replace
- `aiVariant`, `cornerRadius`, `size`, `layout` are the four controllable dimensions.

---

## Sub-Task 3 — Add companion `SkeletonLoader.mdx` doc page

**Status:** [x] done

### Intent

Add a companion MDX page that mirrors the Processing.mdx outline:
- Overview section with a `<Canvas>` of the default story.
- Component API controls table.
- Example usage code blocks for each variant combination.

### Expected Outcomes

- `src/stories/SkeletonLoader.mdx` file created.
- Page sections: Overview, Component API, Example usages (Default, AI, Rounded, Expressive, AI +
  Expressive).

### Todo List

1. Create `src/stories/SkeletonLoader.mdx`:
   - `import { Meta, Canvas, Controls } from '@storybook/addon-docs/blocks'`
   - `import * as Stories from './SkeletonLoader.stories'`
   - `<Meta of={Stories} />`
   - `# SkeletonLayout` heading with a brief description.
   - `## Overview` + `<Canvas of={Stories.Cards4Default} />`
   - Brief italicised caption.
   - `## Component API` + `<Controls of={Stories.Cards4Default} />`
   - `## Example usages` with JSX code blocks for each of the five named stories.

### Relevant Context

- [`src/stories/Processing.mdx`](src/stories/Processing.mdx) — structural template
- [`src/stories/SkeletonLoader.stories.tsx`](src/stories/SkeletonLoader.stories.tsx) — story exports
  that MDX will reference

---

## Sub-Task 4 — Validation

**Status:** [x] done

### Intent

Confirm that TypeScript compiles cleanly and Storybook builds without errors after the changes.

### Expected Outcomes

- `tsc --noEmit` reports no errors.
- `storybook build` or `storybook dev` starts without warnings about the new story file.
- All six stories are visible in the Storybook sidebar under `Components/SkeletonLoader`.
- The Interactive story's buttons correctly toggle all four dimensions live.

### Todo List

1. Run `npx tsc --noEmit` and fix any type errors.
2. Optionally run `npm run storybook` briefly to confirm story sidebar entries and canvas renders.

### Relevant Context

- `package.json` scripts — check for `"storybook"` and `"build-storybook"` entries.
