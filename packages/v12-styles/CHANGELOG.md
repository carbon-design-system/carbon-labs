# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.13.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-styles%400.12.0...%40carbon-labs%2Fv12-styles%400.13.0) (2026-11-12)

### Bug Fixes

* **react:** place v12 pieces a script positions from the left ([#1509](https://github.com/carbon-design-system/carbon-labs/issues/1509)) ([8549041](https://github.com/carbon-design-system/carbon-labs/commit/854904164a35b5e2fca0d92731f320ff68b3f745))


# [0.12.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-styles%400.11.0...%40carbon-labs%2Fv12-styles%400.12.0) (2026-11-12)

* feat(menu)!: move SplitButton into Menu as ComboButton (#1504) ([fd01143](https://github.com/carbon-design-system/carbon-labs/commit/fd0114342c8a5daadfba3b353a2582a012b90aa9)), closes [#1504](https://github.com/carbon-design-system/carbon-labs/issues/1504)

### BREAKING CHANGES

* the @carbon-labs/react-split-button package is removed.
  SplitButton is now ComboButton in @carbon-labs/react-menu, with no alias:
  SplitButtonProps, SplitButtonKinds, SplitButtonSizes, SplitButtonVariants
  and their types are ComboButton's, and its class is cds-combo-button.
  OverflowMenu's trigger is named by its tooltip (aria-labelledby) instead
  of aria-label.

  * chore(v12-menu): mark the variant props the departures registry lists

  Menu's variant-prop mark sat above corners after corners moved in; it
  now sits on variant. OverflowMenu's new variant prop gets its mark too.

  * chore(v12-import): list ComboButton's departures where it lives

  The registry named SplitButton, which is gone; its departure from
  Carbon's ComboButton is listed under the file in the menu package.

  * chore: regenerate the lane's generated files


# [0.11.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-styles%400.10.0...%40carbon-labs%2Fv12-styles%400.11.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/v12-styles





# [0.10.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-styles%400.9.0...%40carbon-labs%2Fv12-styles%400.10.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/v12-styles





# [0.9.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-styles%400.8.0...%40carbon-labs%2Fv12-styles%400.9.0) (2026-11-11)

### Features

* **v12:** only the v12 themes, with v12 zones and surface tokens ([#1489](https://github.com/carbon-design-system/carbon-labs/issues/1489)) ([6d03269](https://github.com/carbon-design-system/carbon-labs/commit/6d03269f97e98a9b127da062fe9ee4642154c103)), closes [#f4f4f4](https://github.com/carbon-design-system/carbon-labs/issues/f4f4f4)


# [0.8.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-styles%400.7.0...%40carbon-labs%2Fv12-styles%400.8.0) (2026-11-11)

### Bug Fixes

* **react:** v12 surfaces grow from their cause in RTL and fold back ([#1485](https://github.com/carbon-design-system/carbon-labs/issues/1485)) ([d416820](https://github.com/carbon-design-system/carbon-labs/commit/d416820b62baf23869bf65ce41fe28d2dbf895f6))


# [0.7.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-styles%400.6.0...%40carbon-labs%2Fv12-styles%400.7.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/v12-styles





# [0.6.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-styles%400.5.0...%40carbon-labs%2Fv12-styles%400.6.0) (2026-11-11)

### Features

* **v12-import:** make departures.json the only source of departures ([#1478](https://github.com/carbon-design-system/carbon-labs/issues/1478)) ([1829a50](https://github.com/carbon-design-system/carbon-labs/commit/1829a50bea3a61d21206ac435eecc40dad7ffe34))


# [0.5.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-styles%400.4.0...%40carbon-labs%2Fv12-styles%400.5.0) (2026-11-11)

### Features

* **v12-import:** a departures registry, and the marks it places ([#1477](https://github.com/carbon-design-system/carbon-labs/issues/1477)) ([da48f6d](https://github.com/carbon-design-system/carbon-labs/commit/da48f6d5c0f5a943110ff482d85e80800bde4ea1))


# [0.4.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-styles%400.3.0...%40carbon-labs%2Fv12-styles%400.4.0) (2026-11-11)

### Bug Fixes

* **v12:** right-to-left keys, refs, group status, Popover aliases, Card ([#1480](https://github.com/carbon-design-system/carbon-labs/issues/1480)) ([60a3ee4](https://github.com/carbon-design-system/carbon-labs/commit/60a3ee495eff11566bfa431020ff4393096eb220))


# [0.3.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-styles%400.2.0...%40carbon-labs%2Fv12-styles%400.3.0) (2026-11-11)

### Features

* **v12:** shared direction, roving and announcer helpers, style mixins ([#1479](https://github.com/carbon-design-system/carbon-labs/issues/1479)) ([f12c43a](https://github.com/carbon-design-system/carbon-labs/commit/f12c43a834b0eb88ad4840fd0af682c1e2188833))


# [0.2.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-styles%400.1.0...%40carbon-labs%2Fv12-styles%400.2.0) (2026-11-10)

### Features

* **react:** the v12 surfaces and selection, wave 3 ([#1461](https://github.com/carbon-design-system/carbon-labs/issues/1461)) ([c751d0a](https://github.com/carbon-design-system/carbon-labs/commit/c751d0a9926bdf8930581e2343df0a5c216f6028))


# 0.1.0 (2026-11-09)

### Features

* **v12-motion:** the v12 motion seam and shared styles ([#1452](https://github.com/carbon-design-system/carbon-labs/issues/1452)) ([47dedf1](https://github.com/carbon-design-system/carbon-labs/commit/47dedf17591c83c2417187229188aaed6d6add87))
