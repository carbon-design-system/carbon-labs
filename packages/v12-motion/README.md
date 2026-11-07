# @carbon-labs/v12-motion

The one place v12 components get motion from. It re-exports carbon-motion's
tokens, reduced-motion helpers, primitives and motion layer, and a Sass module
with Carbon's motion names at carbon-motion's values.

carbon-motion comes from npm: `@carbon-labs/motion-core` and
`@carbon-labs/motion-react`, in this package's `dependencies`. The package is
`private` and `draft`, so it is never published.

## Rule

v12 components import motion from this package only, never from
`@carbon-labs/motion-*`, `@carbon/motion` or `@carbon/styles/scss/motion`, and
never write a duration, an easing or a transition value.

## JavaScript

```ts
import {
  motionTokens,
  usePrefersReducedMotion,
  attachRollover,
} from '@carbon-labs/v12-motion';
```

`src/index.ts` lists every export with its source. The list grows with each
component that is carried over.

`@carbon-labs/v12-motion/selection` is carbon-motion's selection layer whole
(`src/selection.ts`), for a component that re-exports it with `export *`; from
the root that would re-export the whole seam.

## Sass

```scss
// before
@use '@carbon/styles/scss/motion' as *;
// after
@use '@carbon-labs/v12-motion/scss' as *;
```

The module gives `$duration-*`, `$easings`, `motion($name, $mode)` and
`surface($map)` with the same names as Carbon's, at carbon-motion's values. A
component that switches is retimed: each changed value is reviewed.

`@carbon-labs/v12-motion/scss/tokens` gives carbon-motion's generated tokens
under their own names, for shared styles (`@carbon-labs/v12-styles`).

## CSS

`@carbon-labs/v12-motion/tokens.css` is carbon-motion's runtime token layer:
every `--cds-motion-*` property the v12 stylesheets read. A page that shows v12
components loads it once; the v12 Storybook does, through the workbench.

## Scripts

- `yarn build`: type-checks the seam, emits `es/` (with `tokens.css`) and copies
  the Sass modules to `scss/`.
- `yarn test`: checks that the exports resolve and that the Sass module compiles
  to carbon-motion's values.

## Known gaps

- The Sass module forwards `@carbon-labs/motion-core/scss/carbon-names` and
  `generated/tokens` by their file paths in the package, because Sass load paths
  do not read package `exports`.
