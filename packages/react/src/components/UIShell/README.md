# @carbon-labs/react-ui-shell

![npm version](https://img.shields.io/npm/v/@carbon-labs/react-ui-shell)
![License](https://img.shields.io/github/license/carbon-design-system/carbon-labs)

The `@carbon-labs/react-ui-shell` package extends UI Shell components from
`@carbon/react`, providing additional enhancements while maintaining
compatibility.

## 📦 Getting started

To install `@carbon-labs/react-ui-shell` in your project, you will need to run
the following command using [npm](https://www.npmjs.com/):

```bash
npm install -S @carbon-labs/react-ui-shell @carbon/react
```

If you prefer [Yarn](https://yarnpkg.com/en/), use the following command
instead:

```bash
yarn add @carbon-labs/react-ui-shell @carbon/react
```

## ⚡ Usage

To use this package you will need to import components from both `@carbon/react`
and `@carbon-labs/react-ui-shell`o compose the UI Shell. The following
components are provided by `@carbon-labs/react-ui-shell`:

- `SideNav`
- `SideNavItems`
- `SideNavMenu`
- `SideNavMenuItem`
- `HeaderPanel`

```jsx
import { SideNav } from '@carbon-labs/react-ui-shell/es/index';
import { Header } from '@carbon/react';

function MyComponent() {
  return (
    <Header>
      <SideNav>...</SideNav>>
    </Header>
  );
}
```

### SCSS

Import the styles from `@carbon/react` and `@carbon-labs/react-ui-shell` in your
stylesheet:

```scss
@use '@carbon/react' with (
  $font-path: '@ibm/plex'
);
@use '@carbon-labs/react-ui-shell/scss/ui-shell';
```

### Storybook

You can explore the available components, see different configuration options,
and learn how to compose them in
[Storybook](https://labs.carbondesignsystem.com/?path=/docs/react_components-uishell--overview).

## 🙌 Contributing

Want to contribute to `@carbon-labs`? Read through the Carbon Labs
[contribution section](https://pages.github.ibm.com/carbon/ibm-products/contributing/carbon-labs/#carbon-labs-in-code)
before diving into our developer guide:

- [Developer Guide](https://github.com/carbon-design-system/carbon-labs/blob/main/docs/developing.md)

## 📖 Changelog

See the latest updates and version history in the
[changelog](https://github.com/carbon-design-system/carbon-labs/blob/main/packages/react/src/components/UIShell/CHANGELOG.md).

## 📝 License

Licensed under the
[Apache 2.0 License](https://github.com/carbon-design-system/carbon-labs/blob/main/LICENSE).

## <picture><source height="20" width="20" media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/ibm-telemetry/telemetry-js/main/docs/images/ibm-telemetry-dark.svg"><source height="20" width="20" media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/ibm-telemetry/telemetry-js/main/docs/images/ibm-telemetry-light.svg"><img height="20" width="20" alt="IBM Telemetry" src="https://raw.githubusercontent.com/ibm-telemetry/telemetry-js/main/docs/images/ibm-telemetry-light.svg"></picture> IBM Telemetry

This package uses IBM Telemetry to collect de-identified and anonymized metrics
data. By installing this package as a dependency you are agreeing to telemetry
collection. To opt out, see
[Opting out of IBM Telemetry data collection](https://github.com/ibm-telemetry/telemetry-js/tree/main#opting-out-of-ibm-telemetry-data-collection).
For more information on the data being collected, please see the
[IBM Telemetry documentation](https://github.com/ibm-telemetry/telemetry-js/tree/main#ibm-telemetry-collection-basics).
