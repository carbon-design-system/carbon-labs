# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.12.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-import%400.11.0...%40carbon-labs%2Fv12-import%400.12.0) (2026-11-12)

**Note:** Version bump only for package @carbon-labs/v12-import





# [0.11.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-import%400.10.0...%40carbon-labs%2Fv12-import%400.11.0) (2026-11-12)

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


# [0.10.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-import%400.9.0...%40carbon-labs%2Fv12-import%400.10.0) (2026-11-11)

**Note:** Version bump only for package @carbon-labs/v12-import





# [0.9.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-import%400.8.0...%40carbon-labs%2Fv12-import%400.9.0) (2026-11-11)

### Features

* **v12-import:** make departures.json the only source of departures ([#1478](https://github.com/carbon-design-system/carbon-labs/issues/1478)) ([1829a50](https://github.com/carbon-design-system/carbon-labs/commit/1829a50bea3a61d21206ac435eecc40dad7ffe34))


# [0.8.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-import%400.7.0...%40carbon-labs%2Fv12-import%400.8.0) (2026-11-11)

### Features

* **v12-import:** a departures registry, and the marks it places ([#1477](https://github.com/carbon-design-system/carbon-labs/issues/1477)) ([da48f6d](https://github.com/carbon-design-system/carbon-labs/commit/da48f6d5c0f5a943110ff482d85e80800bde4ea1))


# [0.7.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-import%400.6.0...%40carbon-labs%2Fv12-import%400.7.0) (2026-11-11)

### Features

* **v12-figma:** code snapshots for the design sync ([#1482](https://github.com/carbon-design-system/carbon-labs/issues/1482)) ([70cd785](https://github.com/carbon-design-system/carbon-labs/commit/70cd78518094563f5c495fbcc29a6ed822ab51cb))


# [0.6.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-import%400.5.0...%40carbon-labs%2Fv12-import%400.6.0) (2026-11-10)

### Features

* **v12-import:** a generated catalog of the v12 components ([#1472](https://github.com/carbon-design-system/carbon-labs/issues/1472)) ([2f96ab5](https://github.com/carbon-design-system/carbon-labs/commit/2f96ab5362686019ff3157ac3dba0b82cf1a61f4))


# [0.5.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-import%400.4.0...%40carbon-labs%2Fv12-import%400.5.0) (2026-11-10)

### Features

* **v12-import:** motion and vocabulary rules in the check, as warnings ([#1471](https://github.com/carbon-design-system/carbon-labs/issues/1471)) ([c880dcb](https://github.com/carbon-design-system/carbon-labs/commit/c880dcba8d75c494b0d604b337fa6e945a0230d5))


# [0.4.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-import%400.3.0...%40carbon-labs%2Fv12-import%400.4.0) (2026-11-10)

### Features

* **v12-import:** a manifest row for every v12 component folder ([#1470](https://github.com/carbon-design-system/carbon-labs/issues/1470)) ([ef52fdf](https://github.com/carbon-design-system/carbon-labs/commit/ef52fdf4c41e558b77b416f65da9c4a681a55d21))


# [0.3.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-import%400.2.0...%40carbon-labs%2Fv12-import%400.3.0) (2026-11-10)

### Features

* **react:** the v12 content, layouts, patterns and chat stack, waves 6-8 ([#1467](https://github.com/carbon-design-system/carbon-labs/issues/1467)) ([2176069](https://github.com/carbon-design-system/carbon-labs/commit/21760691f0e41a7e965193757f58e731e8174b57))


# [0.2.0](https://github.com/carbon-design-system/carbon-labs/compare/%40carbon-labs%2Fv12-import%400.1.0...%40carbon-labs%2Fv12-import%400.2.0) (2026-11-10)

### Features

* **v12-import:** a component comes in once, then the lane owns it ([#1463](https://github.com/carbon-design-system/carbon-labs/issues/1463)) ([1552caf](https://github.com/carbon-design-system/carbon-labs/commit/1552cafb19b57c967b3647f025cb3293a801aed3))


# 0.1.0 (2026-11-09)

### Features

* **v12-import:** the import tool, the manifest and a v12 CI job ([#1454](https://github.com/carbon-design-system/carbon-labs/issues/1454)) ([acc6feb](https://github.com/carbon-design-system/carbon-labs/commit/acc6feb357a09d38052d72d3abd10166bf108f60))
