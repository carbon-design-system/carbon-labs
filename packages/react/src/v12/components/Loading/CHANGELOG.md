# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.16.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-loading%400.15.0...%40carbon-labs%2Freact-loading%400.16.0) (2026-11-12)

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


# [0.15.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-loading%400.14.0...%40carbon-labs%2Freact-loading%400.15.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-loading





# [0.14.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-loading%400.13.0...%40carbon-labs%2Freact-loading%400.14.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-loading





# [0.13.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-loading%400.12.0...%40carbon-labs%2Freact-loading%400.13.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-loading





# [0.12.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-loading%400.11.0...%40carbon-labs%2Freact-loading%400.12.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-loading





# [0.11.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-loading%400.10.0...%40carbon-labs%2Freact-loading%400.11.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-loading





# [0.10.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-loading%400.9.0...%40carbon-labs%2Freact-loading%400.10.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-loading





# [0.9.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-loading%400.8.0...%40carbon-labs%2Freact-loading%400.9.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-loading





# [0.8.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-loading%400.7.0...%40carbon-labs%2Freact-loading%400.8.0) (2026-11-11)

### Features

* **v12-import:** a departures registry, and the marks it places ([#1477](https://github.com/carbon-design-system/carbon-labs/issues/1477)) ([da48f6d](https://github.com/carbon-design-system/carbon-labs/commit/da48f6d5c0f5a943110ff482d85e80800bde4ea1))


# [0.7.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-loading%400.6.0...%40carbon-labs%2Freact-loading%400.7.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-loading





# [0.6.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-loading%400.5.0...%40carbon-labs%2Freact-loading%400.6.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/react-loading





# [0.5.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-loading%400.4.0...%40carbon-labs%2Freact-loading%400.5.0) (2026-11-10)

### Features

* **react:** the v12 content, layouts, patterns and chat stack, waves 6-8 ([#1467](https://github.com/carbon-design-system/carbon-labs/issues/1467)) ([2176069](https://github.com/carbon-design-system/carbon-labs/commit/21760691f0e41a7e965193757f58e731e8174b57))


# [0.4.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-loading%400.3.0...%40carbon-labs%2Freact-loading%400.4.0) (2026-11-10)

**Note:** Version bump only for package @carbon-labs/react-loading





# [0.3.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-loading%400.2.0...%40carbon-labs%2Freact-loading%400.3.0) (2026-11-10)

### Features

* **react:** the v12 controls, wave 4 ([#1462](https://github.com/carbon-design-system/carbon-labs/issues/1462)) ([0303db9](https://github.com/carbon-design-system/carbon-labs/commit/0303db98af6a4c1ac5338b777c4fec3dd8386f07))


# [0.2.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Freact-loading%400.1.0...%40carbon-labs%2Freact-loading%400.2.0) (2026-11-10)

**Note:** Version bump only for package @carbon-labs/react-loading





# 0.1.0 (2026-11-10)

### Features

* **react:** the v12 feedback and loading, wave 2 ([#1460](https://github.com/carbon-design-system/carbon-labs/issues/1460)) ([080b1b2](https://github.com/carbon-design-system/carbon-labs/commit/080b1b27b08a747102e03405e923502ba5b657bb))
