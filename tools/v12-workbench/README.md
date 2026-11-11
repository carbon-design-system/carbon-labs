# @carbon-labs/v12-workbench

The v12 workbench: a Storybook add-on for the v12 lane, for reviewing and
comparing components and their motion. It reads; it does not define. The package
is `private` and `draft`, so it is never published.

It is registered only in the v12 build of the React Storybook
(`STORYBOOK_INCLUDE_V12=true`); the standard Storybook does not load it.

## Toolbar

Six globals, drawn by Storybook's toolbar and applied by the add-on's decorator.

| Pick           | Values                               | What it does                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme          | v12 light, v12 dark                  | `data-carbon-theme` on `<html>` (the lane's styles switch on it; its own decorator reads the same global). The v12 themes only: v12 light is the default, and a v11 theme in an old address falls back to the v12 theme of its side (white and g10 to v12 light, g90 and g100 to v12 dark). The themes are built in the React Storybook's `.storybook/v12-themes`; Carbon's `GlobalTheme` is given white or g100, the theme each is built on. |
| Density        | compact, default, spacious           | `KitDefaults density` around the story: the one path. Default leaves each component's own size.                                                                                                                                                                                                                                                                                                                                               |
| Corners        | own, full, rounded, square           | `KitDefaults corners` around the story, as the kit's `corners` prop reads it. Own leaves each component's own corners.                                                                                                                                                                                                                                                                                                                        |
| Reduced motion | system, full, shorter clock, at once | `MotionProvider level` around the story, which `usePrefersReducedMotion` reads, plus `data-motion-level` on `<html>` for the tokens CSS, and `FeedbackMotion reduced`. System follows the operating system's setting; each other pick forces its level, full included, whatever the system prefers.                                                                                                                                           |
| Clock          | 1x, 0.25x, 0.1x                      | The draft layer scales every duration and stagger token live, so script-driven motion that reads `motionTokens` follows; each CSS transition and animation runs at that playback rate as it starts; `FeedbackMotion timeScale` for the feedback family. See `src/clock.ts`.                                                                                                                                                                   |
| Direction      | ltr, rtl                             | `dir` on `<html>`.                                                                                                                                                                                                                                                                                                                                                                                                                            |

Theme and direction are the lane's own globals; in the v12 build the lane's
preview leaves them to this add-on.

## Motion panel

Reads a story's `parameters.v12`:

```ts
parameters: {
  v12: {
    motion: ['content-swap', 'rollover'],
    reduced: { 'content-swap': 'at-once', rollover: 'at-once' },
    states: ['rest', 'hover', 'disabled'],
  },
},
```

For each item it lists the tokens and values the seam gives it: the seam's
constant of that name (`content-swap`, `skeleton-wave`, `loading`), the registry
token of that name, its `pattern-*` parameters and its family. The values are
read in the preview, from `@carbon-labs/v12-motion`, at 1x.

## Explorations panel

Lists the story's component's departures from Carbon, grouped by kind:

- **Explorations:** each `@carbon-explore` mark in the component's sources.
- **Proposals:** each `@carbon-proposal` mark, and each item of the component's
  `proposals/README.md`.

Each mark shows its text and its file and line, from
`packages/react/src/v12/components/`. A story whose component has none shows "No
explorations or proposals."

The panel cannot read source files, so it reads `src/explorations.json`, a map
from story title (`V12/Button`) to marks, each with its kind, file, line and
text. `scripts/explorations.js` writes it from the components; a story file's
`V12/` titles are its keys. After a change to a mark, run:

```sh
yarn workspace @carbon-labs/v12-workbench explorations
```

and commit the map. A test fails when the committed map is out of date.

## Matrix

```ts
import { matrixStory } from '@carbon-labs/v12-workbench';

export const Matrix = matrixStory(Button, {
  args: { children: 'Save' },
  states: ['rest', 'disabled'],
});
```

One canvas, a row per state and a column per theme and density: v12 light and
v12 dark, each cell a zone of its theme (`cds--v12-light`, `cds--v12-dark`, from
`.storybook/v12-themes`), by compact, default and spacious. A string state that
is a boolean prop (`disabled`, `readOnly`, `invalid`, `warn`, `open`,
`expanded`, `selected`, `checked`) sets it; any other only marks the cell with
`data-state`. An object state (`{ name, args }`) gives its args.

## Compare

```ts
import { compareStory } from '@carbon-labs/v12-workbench';

export const Compare = compareStory({
  before: 'v12-button--primary',
  after: 'v12-button--primary-on-the-seam',
});
```

Two stories side by side, each in its own frame, under the same toolbar picks.

## Scripts

- `yarn build`: type-checks the add-on.
- `yarn explorations`: writes the Explorations panel's map,
  `src/explorations.json`; `--check` writes nothing and fails when the map is
  out of date.
- `yarn test`: the clock's draft and undo, the panels' data, the compare frame's
  URL, and that the explorations map is up to date.

## Known gaps

- The clock cannot slow a duration a component reads once at module load.
- The Carbon v11 components a story also renders slow down only through their
  CSS; their script-driven motion does not read carbon-motion's tokens.
- Carbon v11 components a story also renders do not follow density or corners:
  only the kit reads `KitDefaults`.
