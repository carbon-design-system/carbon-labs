/**
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

const theme = create({
  base: 'dark',

  // Brand
  brandTitle: 'Motion Components',
  brandUrl: '/',
  brandImage: '/logo.svg',   // place your logo at public/logo.svg
  brandTarget: '_self',
});

addons.setConfig({
  theme,
});
