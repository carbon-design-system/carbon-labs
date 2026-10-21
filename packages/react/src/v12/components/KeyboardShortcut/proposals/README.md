# Proposals — KeyboardShortcut

One line per non-token proposal. Each has an `@carbon-proposal` callout at its
use.

- api: menu-item-shortcut-node — widen `MenuItem`'s `shortcut?: string` to
  `string | ReactElement` (propTypes `oneOfType([string, element])`) so
  `KeyboardShortcut` can be its hint and the menu item is named "Copy Command
  C". `MenuItem` already renders `{shortcut}` in its `__shortcut` div, so
  nothing else changes. A separate core PR at graduation, with the human's OK.
  Callout: `__stories__/KeyboardShortcut.stories.tsx`. TBD

- mixin: keycap-slashed-zero — Carbon's type styles have no slashed-zero option;
  a keycap's `0` must not read as the letter `O`. The keycap sets
  `font-variant-numeric: slashed-zero` on top of `label-01`; where the font has
  no slashed zero the browser draws a plain zero, which is the fallback. At
  graduation: a `type-style` option or a `$slashed-zero` mixin in
  `@carbon/styles`, or removal. Callout: `components/keyboard-shortcut.scss`.
  TBD
