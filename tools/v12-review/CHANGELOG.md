# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.20.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-review%400.19.0...%40carbon-labs%2Fv12-review%400.20.0) (2026-11-11)

### Bug Fixes

* **react:** mirror the v12 slider and toggle in right to left ([#1498](https://github.com/carbon-design-system/carbon-labs/issues/1498)) ([7dde0e1](https://github.com/carbon-design-system/carbon-labs/commit/7dde0e1bb169d192bdd772f41a7432c7cb1166aa))


# [0.19.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-review%400.18.0...%40carbon-labs%2Fv12-review%400.19.0) (2026-11-11)

### Bug Fixes

* **v12-review:** read the favicon's tones from the v12 zones ([#1497](https://github.com/carbon-design-system/carbon-labs/issues/1497)) ([04bf1c1](https://github.com/carbon-design-system/carbon-labs/commit/04bf1c17eda09a6ded13a8da4527b944f22a13da))


# [0.18.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-review%400.17.0...%40carbon-labs%2Fv12-review%400.18.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/v12-review





# [0.17.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-review%400.16.0...%40carbon-labs%2Fv12-review%400.17.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/v12-review





# [0.16.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-review%400.15.0...%40carbon-labs%2Fv12-review%400.16.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/v12-review





# [0.15.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-review%400.14.0...%40carbon-labs%2Fv12-review%400.15.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/v12-review





# [0.14.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-review%400.13.0...%40carbon-labs%2Fv12-review%400.14.0) (2026-11-11)

### Features

* **v12:** only the v12 themes, with v12 zones and surface tokens ([#1489](https://github.com/carbon-design-system/carbon-labs/issues/1489)) ([6d03269](https://github.com/carbon-design-system/carbon-labs/commit/6d03269f97e98a9b127da062fe9ee4642154c103)), closes [#f4f4f4](https://github.com/carbon-design-system/carbon-labs/issues/f4f4f4)


# [0.13.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-review%400.12.0...%40carbon-labs%2Fv12-review%400.13.0) (2026-11-11)

### Bug Fixes

* **v12:** tile hover and radio motion, tiles on the review home, lighter blur ([#1488](https://github.com/carbon-design-system/carbon-labs/issues/1488)) ([1e2bc5c](https://github.com/carbon-design-system/carbon-labs/commit/1e2bc5cb21e8ef27d1ab3449bc97aac389f3958c))


# [0.12.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-review%400.11.0...%40carbon-labs%2Fv12-review%400.12.0) (2026-11-11)

### Bug Fixes

* **v12:** menu corners, tooltip spacing, pagination swap, reach, jumps, lists ([#1487](https://github.com/carbon-design-system/carbon-labs/issues/1487)) ([c9c9153](https://github.com/carbon-design-system/carbon-labs/commit/c9c91530f21ee611c717c97f4a8a73d9fccd6b9c))


# [0.11.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-review%400.10.0...%40carbon-labs%2Fv12-review%400.11.0) (2026-11-11)

* fix(shimmer-text)!: one text layer; contextual bar corners (#1486) ([2de89c7](https://github.com/carbon-design-system/carbon-labs/commit/2de89c7b11d78b69ffdcd74d2ca68ac8f455012a)), closes [#1486](https://github.com/carbon-design-system/carbon-labs/issues/1486)

### BREAKING CHANGES

* removed `motion.weight` and `motion.weightAt`, and the
  exports `SHIMMER_WEIGHT_EM`, `shimmerStroke`, `solveShimmerRest`,
  `solveShimmerBand`, `ShimmerWeight` and `ShimmerWeightAt`, with
  `SHIMMER_TEXT.weight`, `restContrast` and `bandContrast`.

  * fix(contextual-bar): keep the inverse bar's corners round

  On inverse, the bar carries the opposite theme's class, and that class
  paints its element's background: a square box under the rounded
  surface. While the bar snaps, its clip rounds the box, so the corners
  looked right in motion and went square at rest. The bar now paints no
  background, and its fill is the surface's alone, on the corners the
  clip shares.

  The stories nest what the source page does: the selection's actions are
  a small toolbar of ghost icon buttons, and the status and unsaved-changes
  bars take text buttons. Outlined buttons took the bar's 2px corner step
  and read as boxes.

  * chore: regenerate the design sync's snapshots


# [0.10.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-review%400.9.0...%40carbon-labs%2Fv12-review%400.10.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/v12-review





# [0.9.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-review%400.8.0...%40carbon-labs%2Fv12-review%400.9.0) (2026-11-11)

### Bug Fixes

* **v12-review:** nav fold, mark, type and scrollers ([#1484](https://github.com/carbon-design-system/carbon-labs/issues/1484)) ([75a5b8b](https://github.com/carbon-design-system/carbon-labs/commit/75a5b8b12536e1f9562b7022514d3060859c3441))


# [0.8.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-review%400.7.0...%40carbon-labs%2Fv12-review%400.8.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/v12-review





# [0.7.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-review%400.6.0...%40carbon-labs%2Fv12-review%400.7.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/v12-review





# [0.6.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-review%400.5.0...%40carbon-labs%2Fv12-review%400.6.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/v12-review





# [0.5.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-review%400.4.0...%40carbon-labs%2Fv12-review%400.5.0) (2026-11-11)

### Bug Fixes

* **v12:** right-to-left keys, refs, group status, Popover aliases, Card ([#1480](https://github.com/carbon-design-system/carbon-labs/issues/1480)) ([60a3ee4](https://github.com/carbon-design-system/carbon-labs/commit/60a3ee495eff11566bfa431020ff4393096eb220))


# [0.4.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-review%400.3.0...%40carbon-labs%2Fv12-review%400.4.0) (2026-11-11)

### Features

* **v12:** shared direction, roving and announcer helpers, style mixins ([#1479](https://github.com/carbon-design-system/carbon-labs/issues/1479)) ([f12c43a](https://github.com/carbon-design-system/carbon-labs/commit/f12c43a834b0eb88ad4840fd0af682c1e2188833))


# [0.3.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-review%400.2.0...%40carbon-labs%2Fv12-review%400.3.0) (2026-11-11)

### Features

* **v12-workbench:** show what people see: system motion, kit density ([#1475](https://github.com/carbon-design-system/carbon-labs/issues/1475)) ([5dd351b](https://github.com/carbon-design-system/carbon-labs/commit/5dd351bd22f8cd01fb431f6c6a8bd6a8fc05a5f2))


# [0.2.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-review%400.1.0...%40carbon-labs%2Fv12-review%400.2.0) (2026-11-10)

### Features

* **v12-import:** a manifest row for every v12 component folder ([#1470](https://github.com/carbon-design-system/carbon-labs/issues/1470)) ([ef52fdf](https://github.com/carbon-design-system/carbon-labs/commit/ef52fdf4c41e558b77b416f65da9c4a681a55d21))


# 0.1.0 (2026-11-10)

### Features

* **react:** the v12 review app, catalog and console ([#1468](https://github.com/carbon-design-system/carbon-labs/issues/1468)) ([f81b7fc](https://github.com/carbon-design-system/carbon-labs/commit/f81b7fcc42309574a22ec6a8691ebf342f217542))
