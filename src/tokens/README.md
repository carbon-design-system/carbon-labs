# `src/tokens/` — Carbon Motion Workshop token layer

## Overview

This directory defines the `--cmw-*` CSS custom property layer used by all
components in the Carbon Motion Workshop. It acts as a stable interface between
component code and the underlying Carbon Design System tokens, allowing the
workshop to diverge from Carbon v11 where Carbon v12 tokens don't yet exist.

---

## Files

| File | Purpose |
|------|---------|
| `index.css` | Base token definitions (`:root`) — the canonical values |
| `themes.css` | Per-theme overrides via `[data-carbon-theme]` selectors |
| `motion.css` | Duration, easing, and stagger tokens for all animation |

All three files are imported once in `src/index.css`, which is in turn
imported in both `.storybook/preview.tsx` and `src/main.tsx`.

---

## Naming convention

```
--cmw-{category}-{variant?}-{state?}
```

| Segment | Example | Meaning |
|---------|---------|---------|
| `cmw` | `--cmw-` | Carbon Motion Workshop namespace |
| category | `skeleton`, `switcher`, `avatar` | Component or concept |
| variant | `ai`, `track`, `fill` | Variant within a category |
| state | `hover`, `peak`, `trough` | Interactive or animation state |

Full examples:
- `--cmw-skeleton-opacity-peak`
- `--cmw-switcher-bg-selected`
- `--cmw-avatar-border-thinking`
- `--cmw-duration-fast-01`
- `--cmw-easing-entrance`

---

## Carbon v12 mapping

Most `--cmw-*` tokens resolve to a `--cds-*` custom property:

```css
--cmw-interactive: var(--cds-interactive, #0f62fe);
```

This means:
- When Carbon's CDS tokens are loaded (via `@carbon/styles`), `--cmw-*` tracks
  them automatically.
- The fallback value (`#0f62fe`) is used if CDS tokens are absent (e.g. isolated
  tests or environments without Carbon styles).

Tokens that have **no Carbon v12 equivalent yet** use raw values and are marked
with a `/* TODO: */` comment in the source. These are the primary candidates for
replacement once Carbon v12 ships the corresponding token.

---

## Per-theme overrides

Theme overrides are applied via `[data-carbon-theme]` attribute selectors in
`themes.css`. The Storybook background switcher sets `data-carbon-theme` on
`<html>` automatically via the decorator in `.storybook/preview.tsx`.

Supported theme values:
- `white` — IBM Carbon White
- `g10` — IBM Carbon Gray 10
- `g10-ai` — Custom AI tint on G10 (not a standard Carbon theme)
- `g90` — IBM Carbon Gray 90
- `g100` — IBM Carbon Gray 100

---

## Motion tokens

All animation durations and easing curves are in `motion.css`. Components must:

1. Read duration/easing values via `getComputedStyle` at runtime (not hard-code
   them in JS), so that the `prefers-reduced-motion` overrides take effect.
2. Check the `useReducedMotion` hook to skip loop scheduling when motion is
   reduced — collapsing the CSS duration to `0.01ms` stops CSS transitions but
   JS `setTimeout` loops must also be cancelled.

---

## Adding a new token

1. Add the base value in `index.css` under the relevant category comment block.
2. Add theme overrides in `themes.css` only if the value changes across themes.
3. If it's a motion token, add it to `motion.css` with a `prefers-reduced-motion`
   override that collapses the value to `0.01ms`.
4. Add a JSDoc/comment mapping it to its Carbon v12 equivalent or marking it as
   a custom token.
5. Update this README's mapping table if the token category is new.
