# @carbon-labs/react-whats-new

<!-- Uncomment when released -->
<!-- ![npm version](https://img.shields.io/npm/v/@carbon-labs/react-whats-new)
 -->

![License](https://img.shields.io/github/license/carbon-design-system/carbon-labs)

The `@carbon-labs/react-whats-new` package contains elements used in the "What's
New" pattern. The What's New pattern is comprised of the Carbon for IBM
Product's Tearsheet component, a few Carbon components and icons, along with the
components from this package. The following components are provided by
`@carbon-labs/react-whats-new`:

**Toc:**

- `Toc`
- `TocList`
- `TocItem`
- `TocSections`
- `TocSection`

**Bubble:**

- `Bubble`
- `BubbleHeader`

**ViewStack:**

- `ViewStack`
- `View`

## 📦 Getting started

To install `@carbon-labs/react-whats-new` in your project, you will need to run
the following command using [npm](https://www.npmjs.com/):

```bash
npm install -S @carbon/react @carbon/ibm-products @carbon-labs/react-whats-new
```

If you prefer [Yarn](https://yarnpkg.com/en/), use the following command
instead:

```bash
yarn add @carbon/react @carbon/ibm-products @carbon-labs/react-whats-new
```

## ⚡ Usage

To use this package you will need to import components from both
`@carbon/react`, `@carbon/ibm-products` and `@carbon-labs/react-whats-new` to
compose the What's New pattern.

```jsx
import React, { useCallback, useRef, useState } from 'react';

import {
  Toc,
  TocList,
  TocItem,
  TocSections,
  TocSection,
  Bubble,
  BubbleHeader,
  ViewStack,
  View,
} from '@carbon-labs/react-whats-new/es/index';
import { Tearsheet } from '@carbon/ibm-products';

function App() {
  return (
    <>
      {/* Tier 2 - release notification pattern */}
      <Bubble>
        <BubbleHeader>...</BubbleHeader>
        <ViewStack>
          <View>...</View>
        </ViewStack>
        ...
      </Bubble>

      {/* Tier 1 - what's new center pattern */}
      <Toc ref={tocRef}>
        <Tearsheet
          influencer={
            <TocList>
              <TocItem>Feature 1</TocItem>
              <TocItem>Feature 2</TocItem>
            </TocList>
          }>
          <TocSections threshold={0.2}>
            <TocSection as="div">...</TocSection>
            ...
          </TocSections>
        </Tearsheet>
      </Toc>
    </>
  );
}

export default App;
```

### SCSS

Import the styles from `@carbon/react`, `@carbon/ibm-products` and
`@carbon-labs/react-whats-new` in your stylesheet:

```scss
@use '@carbon/react' with (
  $font-path: '@ibm/plex'
);
@use '@carbon/ibm-products/scss/components/Tearsheet';
@use '@carbon-labs/react-whats-new/scss/whats-new';
```

### Storybook

You can explore the available components, see different configuration options,
and learn how to compose them in
[Storybook](https://labs.carbondesignsystem.com/?path=/docs/components-whatsnew--overview).

## 🙌 Contributing

Want to contribute to `@carbon-labs`? Read through the Carbon Labs
[contribution section](https://pages.github.ibm.com/carbon/ibm-products/contributing/carbon-labs/#carbon-labs-in-code)
before diving into our developer guide:

- [Developer Guide](https://github.com/carbon-design-system/carbon-labs/blob/main/docs/developing.md)

## 📖 Changelog

See the latest updates and version history in the
[changelog](https://github.com/carbon-design-system/carbon-labs/blob/main/packages/react/src/components/WhatsNew/CHANGELOG.md).

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
