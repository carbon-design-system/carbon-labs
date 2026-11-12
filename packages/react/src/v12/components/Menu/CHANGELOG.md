# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.18.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-menu%400.17.0...%40carbon-labs%2Freact-menu%400.18.0) (2026-11-12)

### Bug Fixes

* **menu:** declare the loading package ComboButton imports ([#1508](https://github.com/carbon-design-system/carbon-labs/issues/1508)) ([a916417](https://github.com/carbon-design-system/carbon-labs/commit/a9164171b1df515a90f8d91be736dabbda8bb172))


# [0.17.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-menu%400.16.0...%40carbon-labs%2Freact-menu%400.17.0) (2026-11-12)

**Note:** Version bump only for package @carbon-labs/react-menu





# [0.16.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-menu%400.15.0...%40carbon-labs%2Freact-menu%400.16.0) (2026-11-12)

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


# [0.15.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-menu%400.14.0...%40carbon-labs%2Freact-menu%400.15.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-menu





# [0.14.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-menu%400.13.0...%40carbon-labs%2Freact-menu%400.14.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-menu





# [0.13.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-menu%400.12.0...%40carbon-labs%2Freact-menu%400.13.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-menu





# [0.12.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-menu%400.11.0...%40carbon-labs%2Freact-menu%400.12.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-menu





# [0.11.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-menu%400.10.0...%40carbon-labs%2Freact-menu%400.11.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-menu





# [0.10.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-menu%400.9.0...%40carbon-labs%2Freact-menu%400.10.0) (2026-11-11)

### Bug Fixes

* **v12:** menu corners, tooltip spacing, pagination swap, reach, jumps, lists ([#1487](https://github.com/carbon-design-system/carbon-labs/issues/1487)) ([c9c9153](https://github.com/carbon-design-system/carbon-labs/commit/c9c91530f21ee611c717c97f4a8a73d9fccd6b9c))


# [0.9.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-menu%400.8.0...%40carbon-labs%2Freact-menu%400.9.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-menu





# [0.8.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-menu%400.7.0...%40carbon-labs%2Freact-menu%400.8.0) (2026-11-11)

### Bug Fixes

* **react:** v12 surfaces grow from their cause in RTL and fold back ([#1485](https://github.com/carbon-design-system/carbon-labs/issues/1485)) ([d416820](https://github.com/carbon-design-system/carbon-labs/commit/d416820b62baf23869bf65ce41fe28d2dbf895f6))


# [0.7.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-menu%400.6.0...%40carbon-labs%2Freact-menu%400.7.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-menu





# [0.6.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-menu%400.5.0...%40carbon-labs%2Freact-menu%400.6.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-menu





# [0.5.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-menu%400.4.0...%40carbon-labs%2Freact-menu%400.5.0) (2026-11-11)

### Features

* **v12-import:** a departures registry, and the marks it places ([#1477](https://github.com/carbon-design-system/carbon-labs/issues/1477)) ([da48f6d](https://github.com/carbon-design-system/carbon-labs/commit/da48f6d5c0f5a943110ff482d85e80800bde4ea1))


# [0.4.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-menu%400.3.0...%40carbon-labs%2Freact-menu%400.4.0) (2026-11-11)

### Bug Fixes

* **v12:** right-to-left keys, refs, group status, Popover aliases, Card ([#1480](https://github.com/carbon-design-system/carbon-labs/issues/1480)) ([60a3ee4](https://github.com/carbon-design-system/carbon-labs/commit/60a3ee495eff11566bfa431020ff4393096eb220))


# [0.3.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-menu%400.2.0...%40carbon-labs%2Freact-menu%400.3.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-menu





# [0.2.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-menu%400.1.0...%40carbon-labs%2Freact-menu%400.2.0) (2026-11-10)

### Features

* **react:** the v12 content, layouts, patterns and chat stack, waves 6-8 ([#1467](https://github.com/carbon-design-system/carbon-labs/issues/1467)) ([2176069](https://github.com/carbon-design-system/carbon-labs/commit/21760691f0e41a7e965193757f58e731e8174b57))


# 0.1.0 (2026-11-10)

### Features

* **react:** the v12 form controls and overlays, wave 5 ([#1465](https://github.com/carbon-design-system/carbon-labs/issues/1465)) ([87172a9](https://github.com/carbon-design-system/carbon-labs/commit/87172a9be29d16f668d211db2280f9fcf488eef4))
