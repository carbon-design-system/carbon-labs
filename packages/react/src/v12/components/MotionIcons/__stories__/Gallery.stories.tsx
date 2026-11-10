/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Motion Icons › Gallery: the five behaviours on one page (GalleryPage.tsx),
 * switched in place by the content switcher at the top. Open it on a
 * behaviour with the `behaviour` arg:
 * `?path=/story/motion-icons-gallery--gallery&args=behaviour:Action`.
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { GalleryPage, PAGE_ARGS } from './GalleryPage';
import { WithWebComponents } from './statusControls';
import { WithV12Controls } from './host';

const meta: Meta = {
  title: 'V12/Motion Icons/Gallery',
  tags: ['alpha'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  args: PAGE_ARGS,
  // The accessibility check runs on demand here (its panel's Run): run after
  // every arg change, a switch or a search, it walked every mounted card
  // (thousands of nodes once Hover is open), 1s of main thread each time.
  globals: { a11y: { manual: true } },
  decorators: [WithWebComponents, WithV12Controls],
};
export default meta;

export const Gallery: StoryObj = { render: () => <GalleryPage /> };
