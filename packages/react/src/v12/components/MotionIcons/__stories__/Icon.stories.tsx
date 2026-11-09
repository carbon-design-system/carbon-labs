/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Motion Icons › Icon: one icon's page (IconPage.tsx). Deep-link an icon with
 * the `name` arg: `?path=/story/motion-icons-icon--icon&args=name:TrashCan`.
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ICON_PAGE_CSS, IconPage } from './IconPage';
import { WithWebComponents } from './statusControls';

const meta: Meta = {
  title: 'V12/Motion Icons/Icon',
  tags: ['alpha'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  args: { name: 'Copy' },
  decorators: [WithWebComponents],
};
export default meta;

export const Icon: StoryObj = {
  render: () => (
    <>
      <style>{ICON_PAGE_CSS}</style>
      <IconPage />
    </>
  ),
};
