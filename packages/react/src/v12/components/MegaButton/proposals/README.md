# MegaButton — proposals that are not tokens

One line per `flag`, `icon`, `mixin` or `api` callout. Token proposals are in
`tokens.json`.

- `api: mega-button-kinds` — Carbon's `secondary` is the fill and its `tertiary`
  the outline; MegaButton swaps them on purpose (the outline reads better beside
  a neutral primary) and has two red kinds, `danger` and `danger--secondary`.
- `api: mega-button-key-command` — a visible key command on a button, shown with
  KeyboardShortcut and announced through `aria-keyshortcuts`. Carbon's Button
  has none.
- `api: mega-button-icon-position` — the one icon may lead or trail the label.
  Carbon's Button only trails it.
- `api: mega-button-danger-icon-only` — the two danger kinds are allowed
  icon-only. Carbon's IconButton has no danger kinds.
- `api: mega-button-hide-tooltip` — an icon-only button can leave out its own
  tooltip when its group draws one shared tooltip (ChatInput's actions), so
  neighbours never show two at once. The label still names it, through
  `aria-label`. Carbon's IconButton always draws its own.
