<!-- Draft of the docs/migration/v12.md entry, moved into core at graduation. -->

### React KeyboardShortcut (preview)

`preview__KeyboardShortcut` displays a keyboard shortcut as a hint, mapped to
the platform: `keys={['mod', 'K']}` renders `⌘K` on macOS and `Ctrl+K` on
Windows and Linux, with an accessible name in words ("Command K"). It only
displays the shortcut; it never registers or listens for keys.

It is new, so nothing changes for existing code. Two things to review if you
adopt it:

- **Hand-typed shortcut strings.** Where `MenuItem`'s `shortcut` prop or your
  own markup carries `"⌘C"`, `KeyboardShortcut kind="plain"` matches its look
  and adds the platform mapping and the spoken name.
- **Server rendering.** With `platform="auto"`, a server render shows the
  Windows and Linux words and the browser switches to the Mac glyphs after
  hydration. Pass `platform` from the request's `User-Agent` to avoid the
  switch.
