# @carbon-labs/v12-styles

Shared styles for v12 components. The package is `private` and `draft`, so it is
never published.

## Sass

```scss
@use '@carbon-labs/v12-styles/scss' as *;

:root {
  @include motion-properties;
}
```

- The motion names from the seam: `$duration-*`, `$easings`, `motion()` and
  `surface()`, at carbon-motion's values.
- `motion-properties`: a mixin that emits carbon-motion's `--cds-motion-*`
  custom properties, one per generated token. It reads the seam's tokens module,
  so no value is written here.

### The kit's shared styles

Partials brought over from the kit with the import tool's `--styles` mode, each
its own module:

```scss
@use '@carbon-labs/v12-styles/scss/rollover' as *;
```

`anchor-inset`, `brand`, `corners`, `field-fill`, `ghost` (uses `rollover`),
`rollover`, `skeleton`, `surface`, `tertiary`, `text-pairs`, `tile-art`. They
read motion from the `--cds-motion-*` custom properties, so a page that uses
them loads `@carbon-labs/v12-motion/tokens.css`. The index does not forward
them.

## CSS

`yarn build` writes `es/motion-properties.css` (the custom properties on
`:root`), served at `@carbon-labs/v12-styles/css/motion-properties.css`.

## Scripts

- `yarn build`: copies the Sass modules to `scss/` and writes the CSS. Build
  `@carbon-labs/v12-motion` first.
- `yarn test`: checks the forwarded names, that the custom properties match
  carbon-motion's generated tokens CSS, and that each kit partial compiles,
  writes no duration or easing, and reads only tokens the token layer has.

## To do

These come with the departures registry: each value Carbon lacks is a marked
proposal.

- [ ] Surfaces: the standard panel fill and its hover
- [ ] Hairline: the standard stroke
- [ ] Theme zones: a subtree in another theme
- [ ] Density
