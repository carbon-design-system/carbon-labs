# v12 scenes

Two tiers on the built v12 Storybook, in Playwright's bundled Chromium:

- **load**: every story of the components a change touches loads with no console
  or page error, and each `Matrix` story renders in v12 light and v12 dark.
- **behaviors**: components driven in realistic hosts while every frame is
  sampled, then checked against the house motion rules.

Build the Storybook first
(`yarn workspace @carbon-labs/react storybook:build:v12`) and install the
browser once
(`yarn workspace @carbon-labs/v12-scenes playwright install chromium`; when that
build is missing, the behavior tier takes the newest Chromium Playwright has
installed).

## The behavior tier

```
yarn v12:scenes --behaviors                      # every scenario
yarn v12:scenes --behaviors --components SidePanel,Modal
yarn v12:scenes --behaviors --rotate 4 --base origin/main --out <dir>
yarn v12:scenes --behaviors --list               # the runs, without running
```

`--rotate n` takes the next n components in turn (the place is kept in
`results/behaviors-rotation.json`, or `--rotation <file>`) and every component
the commits since `--base` touched. `--load` runs the load tier as well;
`--themes light,dark` runs every scenario in those themes; `--workers`
(default 2) sets how many runs go at once.

It writes `<out>/behaviors.json` (default `results/behaviors`):

```
{ ref, startedAt, ms,
  runs: [{ component, host, args, theme, reduced, dir, scenario, ms,
           status: 'pass' | 'fail' | 'known', known?,
           violations: [{ invariant, frame, detail, known?, paint? }],
           evidence: [paths relative to <out>] }] }
```

A failed run leaves `evidence/<run>/samples.json` (every frame's boxes, the
actions' marks, the long frames) and `sheet.png`, the frames that broke a rule.
`frame` is a sample's index, or, with `paint`, a compositor frame's. The command
exits 1 when a run fails; `known` runs do not fail it.

### How a run works

The hosts are the `V12/Scenes` stories (`packages/react/src/v12/scenes`): an app
shell with an inset workspace and a side nav, the same flush, a Scroller of long
content, and a page the window scrolls. Their arguments pick the component
(`subject`) and what it takes (`frame`, `size`, `placement`, `at`, `variant`,
`open`); `window.__scene.set()` changes its state in the same task. Right to
left is the `dir` global, the theme the theme global, reduced motion the
browser's.

Each run opens its scene at 1440 by 900, two device pixels to the pixel, starts
the sampler (`src/sampler.js`) and plays the actions. Every animation frame the
sampler records the tracked boxes (less an `inset()` clip), their opacity with
their ancestors', transform, clip and mask, the scroll and the time, with the
browser's long animation frames. A scenario with `paint` also records the
compositor's frames, which show a scroll before the page's script has run for
it.

### Adding a scenario

Add an entry to `src/scenarios.js`:

```js
{
  id: 'tabs/select',               // <component>/<what>
  component: 'Tabs',               // the lane folder
  host: 'page-scroll',             // inset-shell, flush-shell, in-scroller, page-scroll
  args: { subject: 'tabs' },
  track: { marker: '.sel__indicator', list: '[role=tablist]' },
  actions: [{ do: 'set', name: 'select', state: { index: 2 } }],
  checks: [
    ['staysInside', { el: 'marker', container: 'list' }],
    ['continuous', { el: 'marker', edge: 'start', maxStep: 'auto' }],
  ],
  reducedChecks: [['reducedPath', { el: 'marker' }]],
}
```

- **Actions** (`src/behaviors.js`): `set` (a scene state), `turn` (there, and
  back at `at` of the way there's measured clock, 0.45 by default), `repeat`
  (states a third of a clock apart), `wheel` (steps, over a tracked box),
  `theme`, `hover` (along a selector's matches), `click`, `wait`. `setup` steps
  run before sampling: `scrollTo`, `set`, `click`.
- **Invariants** (`src/invariants.js`, pure, unit-tested): `gapHolds`,
  `continuous`, `nothingAbove`, `notCollapsed`, `arriveTogether`, `staysInside`,
  `wholePixels`, `noLongFrames`, `reducedPath`, `still`. Edges take `start` and
  `end`. Any check takes `from` and `until` (action names).
- **Known**: a behavior the lane does not have yet carries `known` (on the
  scenario, or on one check), in words that name the behavior. Its runs report
  `known` until they pass; then take the mark off.
- A new subject goes in the scene stories' `subjects.tsx`, rendering from the
  scene's state.
