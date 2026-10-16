<!-- Draft of the docs/migration/v12.md entry, moved into core at graduation. -->

### React MegaButton (preview)

`preview__MegaButton` is one button for text, icon and text, and icon-only
content, with an optional key command shown on the button. It is new, so nothing
changes for existing code. Things to review if you adopt it in place of `Button`
or `IconButton`:

- **Kind names.** MegaButton's `secondary` is the outline and its `tertiary` a
  tinted fill; Carbon's `Button` names them the other way round. Map
  `Button kind="tertiary"` to `MegaButton kind="secondary"`, and
  `kind="secondary"` to `kind="tertiary"`. Carbon's `danger--tertiary` is
  `danger--secondary`; there is no `danger--ghost`.
- **Primary at rest.** A primary MegaButton rests in the text colour and turns
  blue on hover, press and selection. A screen that relied on a blue primary to
  stand out should check it still leads.
- **Icon position.** The one icon may lead (`iconPosition="leading"`) or trail
  (the default, as in `Button`).
- **Key command.** `keyCommand={['mod', 's']}` shows the chord with
  `KeyboardShortcut` and sets `aria-keyshortcuts`. It only displays the
  shortcut; bind the keys in the product.
- **Icon-only.** `hasIconOnly` with the label as `children`, which becomes the
  tooltip and the accessible name. Sizes `xs` to `lg`, as `IconButton`. Danger
  kinds are allowed.
- **No `href`.** A destination is a link; use Carbon's `Link`.
- **Inline padding** grows with size (12, 16, 20, 24px) where `Button`'s stays
  at 16px, so a MegaButton is wider than a `Button` with the same label at `md`
  and above.
