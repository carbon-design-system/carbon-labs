# Proposals — KeyboardShortcut

One line per non-token proposal. Each has an `@carbon-proposal` callout at its
use.

- api: menu-item-shortcut-node — widen `MenuItem`'s `shortcut?: string` to
  `string | ReactElement` (propTypes `oneOfType([string, element])`) so
  `KeyboardShortcut` can be its hint and the menu item is named "Copy Command
  C". `MenuItem` already renders `{shortcut}` in its `__shortcut` div, so
  nothing else changes. A separate core PR at graduation, with the human's OK.
  Callout: `__stories__/KeyboardShortcut.stories.tsx`. TBD
