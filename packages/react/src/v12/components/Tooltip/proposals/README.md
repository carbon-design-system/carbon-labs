# Tooltip — proposals that are not tokens

One line per `flag`, `icon`, `mixin` or `api` callout. Token proposals are in
`tokens.json`.

- `api: button-axes` — `IconButton` splits Button's old kinds into `kind` (the
  role), `variant` (outlined, tonal) and `frame` (ghost, none), so each prop
  says one thing.
- `api: variant-prop` — the color treatment is one `variant` prop (inverse,
  tonal, outlined, hero, neutral or filled), so color is never said by a role or
  a structure.
- `api: frame-prop` — what a component stands on is one `frame` prop (ghost,
  inset, flush, floating or line), so structure is never said by a kind or a
  color.
