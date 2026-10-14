<!-- Draft of the docs/migration/v12.md entry, moved into core at graduation. -->

### React KeyboardShortcut (preview)

`preview__KeyboardShortcut` displays a keyboard shortcut as a hint, mapped to
the platform: `keys={['mod', 'K']}` renders `⌘K` on macOS and `Ctrl+K` on
Windows and Linux, with an accessible name in words ("Command K"). Modifiers are
shown in platform order (`⇧⌘P`, `Ctrl+Shift+P`) whatever order they are written
in. It only displays the shortcut; it never registers or listens for keys.

It is new, so nothing changes for existing code. Things to review if you adopt
it:

- **Hand-typed shortcut strings.** Where `MenuItem`'s `shortcut` prop or your
  own markup carries `"⌘C"`, `KeyboardShortcut kind="plain"` matches its look
  and adds the platform mapping and the spoken name.
- **Server rendering.** With `platform="auto"`, a server render shows the
  Windows and Linux words and the browser switches to the Mac glyphs after
  hydration. Pass `platform` from the request's `User-Agent` to avoid the
  switch.
- **React 16 and 17.** These have no `useSyncExternalStore`, so detection
  settles after mount even in a client-only app: a Mac shows `Ctrl` for one
  frame before `⌘`. React 18 and later read the platform on the first render.
  Pass `platform` to avoid it on any version.
- **Translation.** `translateWithId` receives
  `carbon.keyboard-shortcut.<key>.label` (what the key shows) and
  `carbon.keyboard-shortcut.<key>.name` (its spoken name) with `{ platform }`.
