# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.14.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-contextual-bar%400.13.0...%40carbon-labs%2Freact-contextual-bar%400.14.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-contextual-bar





# [0.13.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-contextual-bar%400.12.0...%40carbon-labs%2Freact-contextual-bar%400.13.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-contextual-bar





# [0.12.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-contextual-bar%400.11.0...%40carbon-labs%2Freact-contextual-bar%400.12.0) (2026-11-11)

### Features

* **v12:** only the v12 themes, with v12 zones and surface tokens ([#1489](https://github.com/carbon-design-system/carbon-labs/issues/1489)) ([6d03269](https://github.com/carbon-design-system/carbon-labs/commit/6d03269f97e98a9b127da062fe9ee4642154c103)), closes [#f4f4f4](https://github.com/carbon-design-system/carbon-labs/issues/f4f4f4)


# [0.11.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-contextual-bar%400.10.0...%40carbon-labs%2Freact-contextual-bar%400.11.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-contextual-bar





# [0.10.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-contextual-bar%400.9.0...%40carbon-labs%2Freact-contextual-bar%400.10.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-contextual-bar





# [0.9.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-contextual-bar%400.8.0...%40carbon-labs%2Freact-contextual-bar%400.9.0) (2026-11-11)

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


# [0.8.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-contextual-bar%400.7.0...%40carbon-labs%2Freact-contextual-bar%400.8.0) (2026-11-11)

### Bug Fixes

* **react:** v12 surfaces grow from their cause in RTL and fold back ([#1485](https://github.com/carbon-design-system/carbon-labs/issues/1485)) ([d416820](https://github.com/carbon-design-system/carbon-labs/commit/d416820b62baf23869bf65ce41fe28d2dbf895f6))


# [0.7.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-contextual-bar%400.6.0...%40carbon-labs%2Freact-contextual-bar%400.7.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-contextual-bar





# [0.6.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-contextual-bar%400.5.0...%40carbon-labs%2Freact-contextual-bar%400.6.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-contextual-bar





# [0.5.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-contextual-bar%400.4.0...%40carbon-labs%2Freact-contextual-bar%400.5.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-contextual-bar





# [0.4.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-contextual-bar%400.3.0...%40carbon-labs%2Freact-contextual-bar%400.4.0) (2026-11-11)

### Features

* **v12-import:** a departures registry, and the marks it places ([#1477](https://github.com/carbon-design-system/carbon-labs/issues/1477)) ([da48f6d](https://github.com/carbon-design-system/carbon-labs/commit/da48f6d5c0f5a943110ff482d85e80800bde4ea1))


# [0.3.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-contextual-bar%400.2.0...%40carbon-labs%2Freact-contextual-bar%400.3.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-contextual-bar





# [0.2.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-contextual-bar%400.1.0...%40carbon-labs%2Freact-contextual-bar%400.2.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-contextual-bar





# 0.1.0 (2026-11-10)

### Features

* **react:** the v12 content, layouts, patterns and chat stack, waves 6-8 ([#1467](https://github.com/carbon-design-system/carbon-labs/issues/1467)) ([2176069](https://github.com/carbon-design-system/carbon-labs/commit/21760691f0e41a7e965193757f58e731e8174b57))
