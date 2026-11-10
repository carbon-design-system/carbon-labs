# Carbon v12 in Carbon Labs: architecture

This page describes how v12 work is organized in Carbon Labs: where it lives,
how it gets motion, how components arrive, and what is checked. It builds on
[v12 Storybook dual-build architecture](../v12-storybook-architecture.md) and
the existing v12 lane.

## What the v12 lane adds

The v12 lane already holds components at
`packages/{react,web-components}/src/v12/components/<Name>/`. This work adds the
shared pieces around it:

| Path                  | Purpose                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| `packages/v12-motion` | `@carbon-labs/v12-motion`, the single source of motion for v12 code                                          |
| `packages/v12-styles` | `@carbon-labs/v12-styles`, shared SCSS for surfaces, strokes, theme zones and density                        |
| `tools/v12-import`    | the import tool that brings a component in (see below)                                                       |
| `tools/v12-workbench` | a Storybook add-on for viewing and comparing v12 stories: theme, density, reduced motion, a matrix of states |
| `docs/v12/`           | this page, the motion contract and contributing notes                                                        |
| `v12.manifest.json`   | one row per v12 item: paths, status, the motion it uses, its source commit, or `carbon-labs` for its own     |

Each v12 component stays its own package, `@carbon-labs/react-<name>`, with
stories titled `V12/<Name>`.

## Motion

Every v12 component takes its motion from `@carbon-labs/v12-motion`.

- The package re-exports the public items of carbon-motion, Carbon's v12 motion
  library, and, as items are promoted, of `@carbon/motion`. A promotion changes
  one line in the package; components do not change.
- Components do not import carbon-motion, `@carbon/motion` or
  `@carbon/styles/scss/motion` directly, and do not write a duration, an easing
  or a transition value.
- A Sass module in the same package keeps the familiar `$duration-*` names and
  `motion()` function, so a component switches with one `@use` change. Values
  come from carbon-motion, so each switch is reviewed for changed timings.
- Every component declares a reduced-motion behavior for each motion it uses: a
  shorter clock, or at once. A story declares it and a test checks it.
- `@carbon-labs/v12-motion` depends on carbon-motion's published packages,
  `@carbon-labs/motion-core` and `@carbon-labs/motion-react`, and on nothing
  else of carbon-motion's.

[The motion contract](./motion-contract.md) lists every export, where it comes
from and which components use it.

## Packages stay private until usable

A merge to `main` publishes every changed package that is not private. So each
new v12 package starts with `"private": true` and `labs.status: draft`, and its
stories carry the `alpha` tag. Making a package publishable is its own pull
request, reviewed on its own.

## Prefix and frameworks

- The class prefix is `cds`, as in the existing v12 lane.
- React comes first. Web components follow per component, built on
  `@carbon-labs/primitives` for framework-free logic.

## How a component comes in

`yarn v12:import <name> --from <source> --ref <sha>` reads the component at a
recorded commit and:

1. rewrites imports to the Carbon Labs packages and to
   `@carbon-labs/v12-motion`;
2. rewrites the source prefix to `cds` and adds the license header;
3. marks departures from Carbon with `@carbon-explore` or `@carbon-proposal`;
4. writes `package.json` (private, `draft`), the story and the MDX page;
5. runs the checks below and refuses to write on a finding;
6. records the source commit in `v12.manifest.json`.

One pull request per component: `feat(v12-<name>): import <Name>`. There is no
long-lived integration branch. `--dry-run` previews the result.

A component comes in once. After that it is changed in the lane: the tool
refuses to import a component the manifest records, and `--out` writes one
elsewhere to compare.

## Checks

The `v12` job in CI runs, beside the repository's existing checks (`yarn build`,
`yarn ci-check`, `yarn storybook:build`, license headers, stylelint,
commitlint):

- `yarn v12:check`: a manifest row for every v12 component folder, so every
  check opens it; no internal references (hosts, file keys, tracker ids, dates
  in prose) in v12 code or docs; motion imported only from
  `@carbon-labs/v12-motion`; no literal duration, easing or transition value
  outside it; every v12 package private until its publishable pull request. A
  finding the tool's config records as known (each file named, with why) is a
  warning; any other finding fails the check. The same command reports, as
  warnings only until the lane moves onto what they ask for:
  - the motion rules: reduced motion read with `matchMedia` past the seam, a
    curve built by hand, a timer with a literal or padded delay, arithmetic on a
    duration token, a local helper named like a seam export, and a stylesheet
    transition or animation that moves something without the seam's clock
    function;
  - the prop vocabulary (`tools/v12-import/src/vocab.json`): the values each
    shared axis (`frame`, `variant`, `kind`, `size`, `corners`) takes, the
    banned names, and the props Carbon v11 deprecates, read from every component
    a folder exports with the TypeScript checker. Carbon v11's own names and
    values stay where its namesake component has them;
  - the departures: every entry in `packages/react/src/v12/departures.json` (the
    lane's departures from Carbon, one sentence each, with the Carbon behaviour
    it replaces and where it applies) has its `@carbon-explore` or
    `@carbon-proposal` marks, an API departure's on each declaration of its
    props; and every mark has an entry there, in `explorations.json`, or in its
    folder's `proposals/`. `yarn v12:departures --write` places the missing
    marks.

  A `// v12-allow <rule>: <why>` comment on the line, or the one above, allows
  one site (a timer's reason starts with `a11y`, `clock` or `hold`); the check
  counts them;

- `yarn v12:contract --check`: [the motion contract](./motion-contract.md) is
  current. It counts a folder or tool as a user of a seam export when it imports
  it from the seam or from a lane package that re-exports it;
- `yarn v12:catalog --check`: the component catalog (`docs/v12/catalog.json`) is
  current. It lists every v12 component package with its manifest status and
  motion, each component it exports and each prop as a JSON schema, read from
  the lane's sources with the TypeScript checker; a recipe or a generator names
  components and props from it. `yarn v12:catalog` writes it;
- `yarn v12:test`: every v12 package's tests;
- the v12 Storybook build.

Scene specs for states, reduced motion and timing, and accessibility checks,
come later.

## Where it is seen

The v12 Storybook is built on every merge to `main` and published with the rest
of Labs, including private packages and `alpha` stories:

- `https://labs.carbondesignsystem.com/v12/`
- `https://labs.carbondesignsystem.com/v12/react/`
- `https://labs.carbondesignsystem.com/v12/web-components/`
- one story: `/v12/react/?path=/story/v12-<name>--<story>`
