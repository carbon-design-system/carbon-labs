# ChatPanels — proposals that are not tokens

One line per `flag`, `icon`, `mixin` or `api` callout. Token proposals are in
`tokens.json`; ChatPanels has none.

- `api: chat-panel-toggle-icon-only` — the panel toggles in a surface's header
  are icon-only with a tooltip, each saying `aria-expanded` and naming its panel
  with `aria-controls`. Carbon's icon-only allow-list does not name panel
  toggles, so this proposes adding them to it, as feedback and Regenerate on a
  reply are proposed.
