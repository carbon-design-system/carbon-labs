# AnimatedHeader Carousel Feature Plan

## Top-Level Overview

Add a carousel control to the `AnimatedHeader` component that sits in the bottom-right area — in the same row as `HeaderAction` and the Collapse/Expand button. The carousel pages through sets of tiles (one `TileGroup` per page) and shows pagination dot indicators plus previous/next chevron buttons.

**Confirmed design decisions:**
- Carousel is a **separate `carouselConfig` prop** — not a third `headerActionConfig` type.
- Left-to-right render order: `[ headerActionConfig ] [ carouselConfig ] | [ Collapse ]`
- Dots are **clickable and keyboard accessible** (jump directly to a page).
- Carousel is **externally controlled** — consumer provides `currentPage` + `onPageChange` (like tabs), no internal state ownership in `AnimatedHeader`.
- Prev/next chevrons are **disabled** (not hidden) when at the first or last page — no looping.
- Both `carouselConfig` and `headerActionConfig` can be rendered simultaneously.

**Figma source nodes:**
- Page 1 (Journeys 1–4): `5602:20142`
- Page 2 (Journeys 5–8): `5602:20336`
- Label node: `5602:20273`

**What the Figma designs show:**

The bottom-right control bar contains (left to right):
1. `←` ChevronLeft ghost IconButton — disabled on first page
2. Two dot indicators — filled = active page, outline = inactive page, each clickable
3. `→` ChevronRight ghost IconButton — disabled on last page
4. Vertical separator line
5. Collapse / Expand button (already exists)

---

## Sub-Tasks

---

### Sub-Task 1 — Define `HeaderCarouselConfig` type and extend `AnimatedHeaderProps`

**Status:** [ ] pending

**Intent:**
Establish the TypeScript contract for the carousel feature. Creates a new `header-carousel.types.ts` file, extends `AnimatedHeaderProps` with `carouselConfig`, and extends `AriaLabels` with carousel-specific labels.

**Expected Outcomes:**
- A `HeaderCarouselConfig` type exported from the component package.
- `AnimatedHeaderProps` includes optional `carouselConfig?: HeaderCarouselConfig | null`, `currentPage?: number`, and `onPageChange?: (page: number) => void` fields.
- `AriaLabels` type extended with optional carousel aria label fields.
- `index.ts` exports the new type.

**Todo List:**
1. Create `packages/react/src/components/AnimatedHeader/components/HeaderCarousel/header-carousel.types.ts`.
2. Define `HeaderCarouselConfig`:
   ```ts
   export type HeaderCarouselConfig = {
     ariaLabel?: string;        // aria-label for the carousel control group
     prevButtonLabel?: string;  // aria-label for the prev chevron (default: 'Previous page')
     nextButtonLabel?: string;  // aria-label for the next chevron (default: 'Next page')
   };
   ```
3. Extend `AriaLabels` in `types.ts` with:
   - `carouselPrevButton?: string`
   - `carouselNextButton?: string`
   - `carouselDot?: string` — template string e.g. "Page {n}" for each dot aria-label
4. Add to `AnimatedHeaderProps` in `AnimatedHeader.tsx`:
   - `carouselConfig?: HeaderCarouselConfig | null`
   - `currentPage?: number` — 0-based, controlled by consumer
   - `onPageChange?: (page: number) => void` — fires when prev/next/dot is clicked
5. Export `HeaderCarouselConfig` from `index.ts`.

**Relevant Context:**
- [`header-action.types.ts`](packages/react/src/components/AnimatedHeader/components/HeaderAction/header-action.types.ts)
- [`types.ts`](packages/react/src/components/AnimatedHeader/components/AnimatedHeader/types.ts)
- [`AnimatedHeader.tsx`](packages/react/src/components/AnimatedHeader/components/AnimatedHeader/AnimatedHeader.tsx:36)
- [`index.ts`](packages/react/src/components/AnimatedHeader/index.ts)

---

### Sub-Task 2 — Build the `HeaderCarousel` component

**Status:** [ ] pending

**Intent:**
Implement the visual carousel control: prev chevron → clickable/keyboard-accessible dot indicators → next chevron. This component is **fully controlled** — it receives `currentPage`, `totalPages`, and callbacks. It owns no state.

**Expected Outcomes:**
- `HeaderCarousel` renders: ghost `IconButton` (ChevronLeft) → dot buttons → ghost `IconButton` (ChevronRight).
- Dots: filled circle = active, outline/muted = inactive (match Figma 8×8px spec).
- Prev `IconButton` is `disabled` when `currentPage === 0`.
- Next `IconButton` is `disabled` when `currentPage === totalPages - 1`.
- Each dot is a `<button>` with `aria-label="Page {n+1}"` and `aria-pressed={currentPage === i}` (or `aria-current="true"` for active).
- Dot `onClick` calls `onPageChange(i)`.
- Dots are keyboard-reachable (native `<button>` handles this automatically).
- A visually-hidden `<span aria-live="polite">` announces the current page to screen readers on change.
- Component sets `data-expanded={headerExpanded}` and `aria-hidden={!headerExpanded}` — matching the `HeaderAction` visibility pattern.

**Todo List:**
1. Create `packages/react/src/components/AnimatedHeader/components/HeaderCarousel/HeaderCarousel.tsx`.
2. Props interface:
   ```ts
   interface HeaderCarouselProps {
     currentPage: number;
     totalPages: number;
     onPageChange: (page: number) => void;
     headerExpanded: boolean;
     config: HeaderCarouselConfig;
     ariaLabels?: AriaLabels;
   }
   ```
3. Import `ChevronLeft`, `ChevronRight` from `@carbon/icons-react`.
4. Import `IconButton` from `@carbon/react`.
5. Render the control group inside `<div className="clabs--animated-header__carousel">`.
6. `data-expanded={headerExpanded}`, `aria-hidden={!headerExpanded}`.
7. Dot elements: map over `Array.from({ length: totalPages })`, render a `<button>` per dot with `aria-label`, `aria-pressed`, modifier class for active state.
8. Create `packages/react/src/components/AnimatedHeader/components/HeaderCarousel/header-carousel.scss` (styles defined in Sub-Task 4).

**Relevant Context:**
- [`HeaderAction.tsx`](packages/react/src/components/AnimatedHeader/components/HeaderAction/HeaderAction.tsx) — mirrors `aria-hidden` / `data-expanded` pattern.
- Figma node `5602:20261` — `Frame 2043683445`: pagination + separator + Collapse button.
- Figma node `5602:20263` — `Pagination` frame: ChevronLeft at x=16, dots at x=48 (two 8×8 circles, gap 16px), ChevronRight at x=88.
- Carbon `IconButton` ghost, size `lg`.

---

### Sub-Task 3 — Wire carousel into `AnimatedHeader` and integrate `HeaderCarousel`

**Status:** [ ] pending

**Intent:**
Accept `carouselConfig`, `currentPage`, and `onPageChange` in `AnimatedHeader`. Derive the active tile group from `currentPage` when carousel mode is active. Render `HeaderCarousel` in the correct position inside the button-collapse container.

**Expected Outcomes:**
- When `carouselConfig` is provided, `allTileGroups?.[currentPage]` is used as the displayed tile group.
- `onPageChange` is called with the new index when the user clicks prev, next, or a dot.
- When `carouselConfig` is absent, `selectedTileGroup` / `setSelectedTileGroup` work exactly as before.
- Render order in `__button-collapse--container`: `[headerActionConfig]` → `[HeaderCarousel]` → `[separator]` → `[Collapse button]`.
- Separator is only rendered when `carouselConfig` is present (it belongs to the carousel feature).
- `currentPage` defaults to `0` if not provided by the consumer.
- PropTypes entry added for `carouselConfig`, `currentPage`, `onPageChange`.

**Todo List:**
1. In `AnimatedHeader.tsx`, destructure `carouselConfig`, `currentPage = 0`, `onPageChange` from props.
2. Derive `activeTileGroup`:
   ```ts
   const activeTileGroup = carouselConfig
     ? allTileGroups?.[currentPage]
     : selectedTileGroup;
   ```
3. Replace `selectedTileGroup` usage in the tiles `Column` with `activeTileGroup`.
4. In `__button-collapse--container`:
   - Render `<HeaderAction>` first (if `headerActionConfig` present).
   - Then render `<HeaderCarousel>` (if `carouselConfig` present and `allTileGroups.length > 1`).
   - Then the separator `<div className="clabs--animated-header__carousel-separator">` (only when `carouselConfig` present).
   - Then the existing Collapse `<Button>`.
5. Pass `totalPages={allTileGroups?.length ?? 0}`, `currentPage`, `onPageChange`, `headerExpanded={isOpen}`, `config={carouselConfig}`, `ariaLabels` to `<HeaderCarousel>`.
6. Add PropTypes.

**Relevant Context:**
- [`AnimatedHeader.tsx`](packages/react/src/components/AnimatedHeader/components/AnimatedHeader/AnimatedHeader.tsx:156) — `activeTileGroup` usage in the tiles Column.
- [`AnimatedHeader.tsx`](packages/react/src/components/AnimatedHeader/components/AnimatedHeader/AnimatedHeader.tsx:205) — `__button-collapse--container` block.

---

### Sub-Task 4 — Style the carousel controls in SCSS

**Status:** [ ] pending

**Intent:**
Add SCSS rules for the carousel control group: dot buttons, separator line, spacing, responsive visibility, and reduced-motion support.

**Expected Outcomes:**
- Carousel dots are 8×8px circles.
- Active dot: filled `$icon-primary`. Inactive dot: `$icon-disabled` or border-only style.
- Dot `<button>` has no default browser button chrome (reset border, background, padding) — only the circle is visible.
- Separator line matches the Figma vertical `Line 3523` style.
- `[data-expanded='false']` on the carousel wrapper → `opacity: 0; pointer-events: none` (matches `HeaderAction` pattern).
- Carousel hidden at small breakpoints (width < 42rem), visible at medium and above.
- `@media (prefers-reduced-motion: reduce)` removes the dot fill transition.

**Todo List:**
1. Create `packages/react/src/components/AnimatedHeader/components/HeaderCarousel/header-carousel.scss`:
   - `.clabs--animated-header__carousel` — `display: flex; align-items: center;` — `[data-expanded='false']` → `opacity: 0; pointer-events: none; transition: opacity ...`.
   - `.clabs--animated-header__carousel-dots` — `display: flex; align-items: center; gap: 16px;` (gap matches Figma dot spacing).
   - `.clabs--animated-header__carousel-dot` — reset `<button>` styles; `inline-size: 8px; block-size: 8px; border-radius: 50%; background: $icon-disabled; transition: background ...`.
   - `.clabs--animated-header__carousel-dot--active` — `background: $icon-primary`.
   - `@media (prefers-reduced-motion: reduce)` — remove transitions.
2. In `animated-header.scss`:
   - Add `.clabs--animated-header__carousel-separator` rule: `inline-size: 1px; block-size: 24px; background: $border-subtle-01; align-self: center;`.
   - Add `.clabs--animated-header__carousel { display: none; }` to the small breakpoint block (width >= 20rem).
   - Add `.clabs--animated-header__carousel { display: flex; }` to the medium breakpoint block (width >= 42rem).
3. Import `header-carousel.scss` from `animated-header.scss` using `@use` or `@forward` — follow the same import pattern used for `header-action.scss`.

**Relevant Context:**
- [`animated-header.scss`](packages/react/src/components/AnimatedHeader/components/AnimatedHeader/animated-header.scss:437) — `__button-collapse--container`, breakpoint blocks at lines 486–560.
- [`header-action.scss`](packages/react/src/components/AnimatedHeader/components/HeaderAction/header-action.scss) — `data-expanded` CSS pattern reference.
- Figma: dots 8×8px, gap 16px between dots, separator is 1px wide 24px tall vertical line.

---

### Sub-Task 5 — Add a Storybook story for the carousel

**Status:** [ ] pending

**Intent:**
Provide a working Storybook story that demonstrates the externally-controlled carousel with two pages of journey tiles matching the Figma designs.

**Expected Outcomes:**
- A new `WithCarousel` story in `AnimatedHeader.stories.tsx`.
- Story uses `useArgs` to wire `currentPage` and `onPageChange` — fully interactive in Storybook.
- `allTileGroups` has 2 pages: page 1 (Journey 1–4), page 2 (Journey 5–8).
- Clicking prev/next/dots updates the displayed tile group.
- Prev chevron disabled on page 0, next chevron disabled on page 1.
- Story has appropriate title, tags and is linked to existing Storybook config.

**Todo List:**
1. Add carousel journey tile data to `__stories__/data/index.tsx`:
   - `carouselTileGroups: TileGroup[]` — two groups, 4 `glass` variant tiles each.
   - Page 1 tiles: "Journey 1 – Establish your business vocabulary", "Journey 2 – Enrich data with business context", "Journey 3 – Identify data quality issues", "Journey 4 – Create a data product".
   - Page 2 tiles: "Journey 5" through "Journey 8" with placeholder names matching Figma.
   - Each tile: `variant: 'glass'`, `href: '#'`, an `ArrowRight` icon, no subtitle (matching Figma card design).
2. Add `carouselConfig` export: `export const carouselConfig: HeaderCarouselConfig = {}` (uses all defaults).
3. Add `WithCarousel` story to `AnimatedHeader.stories.tsx`:
   - Args: `allTileGroups: carouselTileGroups`, `currentPage: 0`, `carouselConfig`, `description`, `userName`, `headerAnimation`.
   - Use `useArgs` to destructure `[{ currentPage }, updateArgs]`.
   - Pass `onPageChange={(page) => updateArgs({ currentPage: page })}`.
4. Import new data exports in the stories file.

**Relevant Context:**
- [`AnimatedHeader.stories.tsx`](packages/react/src/components/AnimatedHeader/__stories__/AnimatedHeader.stories.tsx)
- [`__stories__/data/index.tsx`](packages/react/src/components/AnimatedHeader/__stories__/data/index.tsx)
- Figma page 1 tiles: Journey 1–4 (node `5602:20142`). Page 2: Journey 5–8 (node `5602:20336`).

---

### Sub-Task 6 — Update exports and documentation

**Status:** [ ] pending

**Intent:**
Ensure `HeaderCarouselConfig` is exported from the package public surface and MDX documentation describes the new prop.

**Expected Outcomes:**
- `HeaderCarouselConfig` exported from `index.ts`.
- `AnimatedHeader.mdx` updated: remove "(coming soon)" carousel note, add `carouselConfig`, `currentPage`, `onPageChange` prop descriptions.
- PropTypes in `AnimatedHeader.tsx` include `carouselConfig`, `currentPage`, `onPageChange`.

**Todo List:**
1. Add `export type { HeaderCarouselConfig }` to `packages/react/src/components/AnimatedHeader/index.ts`.
2. Update `AnimatedHeader.mdx`:
   - Remove the "(coming soon)" note on carousel under `headerActionConfig`.
   - Add a `carouselConfig` section explaining the externally-controlled pattern.
   - Document that `currentPage` + `onPageChange` are used together (like a controlled tab).
3. Verify `animated-header.scss` imports `header-carousel.scss` (belt-and-suspenders check after Sub-Task 4).

**Relevant Context:**
- [`index.ts`](packages/react/src/components/AnimatedHeader/index.ts)
- [`AnimatedHeader.mdx`](packages/react/src/components/AnimatedHeader/__stories__/AnimatedHeader.mdx)
