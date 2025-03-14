/**
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { create } from '@storybook/theming';
import {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  P,
  OL,
  UL,
  LI,
  Link,
  Blockquote,
  PageTable,
  Code,
} from '../src/components/MDXComponents';

/**
 * @see https://storybook.js.org/docs/react/configure/theming
 */
export default create({
  base: 'light',

  // Typography
  fontBase: "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif",
  fontCode:
    "'IBM Plex Mono', Menlo, 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', Courier, monospace",

  brandTitle: `@carbon-labs React`,
  brandUrl:
    'https://github.com/carbon-design-system/carbon-labs/tree/main/packages/react',
});

export const MarkdownTheme = create({
  base: 'light',

  // Typography
  fontBase: "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif",
  fontCode:
    "'IBM Plex Mono', Menlo, 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', Courier, monospace",

  brandTitle: `@carbon-labs React`,
  brandUrl:
    'https://github.com/carbon-design-system/carbon-labs/tree/main/packages/react',
  components: {
    h1: H1,
    h2: H2,
    h3: H3,
    h4: H4,
    h5: H5,
    h6: H6,
    p: P,
    ol: OL,
    ul: UL,
    li: LI,
    a: Link,
    blockquote: Blockquote,
    table: PageTable,
    pre: Code,
  },
});
