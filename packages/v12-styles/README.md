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

### Shared mixins

- `focus`: the focus ring. `focus-ring($inside)` is the declarations: 2px of
  `$text-primary` 2px outside the box, or, inside a filled control, 2px of
  `currentColor` 4px in; `Highlight` in forced colours. `focus-visible` puts it
  on `:focus-visible`, and `focus-within` on a wrapper whose control has it.
- `state`: `hover`, `active`, `disabled`, `invalid` and `warn`, each wrapping
  its rules. Disabled is `:is(:disabled, [aria-disabled='true'])`, and hover and
  active skip it; invalid reads `[aria-invalid='true']` and warn `[data-warn]`.
  `invalid(true)` and `warn(true)` style a wrapper whose control carries the
  state.
- `surface`: `hairline($line, $edge)`, the standard hairline. Round the box
  (`all`, the default) it is an inset box shadow; on one logical edge, a border.
  `$line` is `rule`, `divider` or `raised-rule`.

```scss
@use '@carbon-labs/v12-styles/scss/focus';
@use '@carbon-labs/v12-styles/scss/state';
@use '@carbon-labs/v12-styles/scss/surface';

.cds-thing {
  @include focus.focus-visible;
  @include surface.hairline;

  @include state.invalid {
    box-shadow: inset 0 0 0 2px var(--cds-support-error);
  }
}
```

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

These come with the departures ledger: each value Carbon lacks is a marked
proposal.

- [ ] Surfaces: the standard panel fill and its hover
- [x] Hairline: the standard stroke (`hairline`)
- [ ] Theme zones: a subtree in another theme
- [ ] Density
