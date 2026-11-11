# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.6.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-shimmer-text%400.5.0...%40carbon-labs%2Freact-shimmer-text%400.6.0) (2026-11-11)

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


# [0.5.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-shimmer-text%400.4.0...%40carbon-labs%2Freact-shimmer-text%400.5.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-shimmer-text





# [0.4.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-shimmer-text%400.3.0...%40carbon-labs%2Freact-shimmer-text%400.4.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-shimmer-text





# [0.3.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-shimmer-text%400.2.0...%40carbon-labs%2Freact-shimmer-text%400.3.0) (2026-11-10)

### Features

* **react:** the v12 content, layouts, patterns and chat stack, waves 6-8 ([#1467](https://github.com/carbon-design-system/carbon-labs/issues/1467)) ([2176069](https://github.com/carbon-design-system/carbon-labs/commit/21760691f0e41a7e965193757f58e731e8174b57))


# [0.2.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-shimmer-text%400.1.0...%40carbon-labs%2Freact-shimmer-text%400.2.0) (2026-11-10)

### Features

* **react:** the v12 controls, wave 4 ([#1462](https://github.com/carbon-design-system/carbon-labs/issues/1462)) ([0303db9](https://github.com/carbon-design-system/carbon-labs/commit/0303db98af6a4c1ac5338b777c4fec3dd8386f07))


# 0.1.0 (2026-11-10)

### Features

* **react:** the v12 foundations, wave 1 ([#1459](https://github.com/carbon-design-system/carbon-labs/issues/1459)) ([9c1bab9](https://github.com/carbon-design-system/carbon-labs/commit/9c1bab9e7588535b0fbd7aac6ee9f04dd81e34a2))
