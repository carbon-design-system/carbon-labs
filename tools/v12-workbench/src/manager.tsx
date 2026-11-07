/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The manager side of the add-on: the Motion and Explorations panels. The
// toolbar needs no manager code; Storybook draws the globals in `globals.ts`
// itself.

import React from 'react';
import { addons, types } from 'storybook/manager-api';
import { AddonPanel } from 'storybook/internal/components';
import { ADDON_ID, EXPLORATIONS_PANEL_ID, PANEL_ID } from './constants';
import { ExplorationsPanel } from './ExplorationsPanel';
import { MotionPanel } from './MotionPanel';

addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'Motion',
    match: ({ viewMode }) => viewMode === 'story',
    render: ({ active }) => (
      <AddonPanel active={!!active}>
        <MotionPanel />
      </AddonPanel>
    ),
  });
  addons.add(EXPLORATIONS_PANEL_ID, {
    type: types.PANEL,
    title: 'Explorations',
    match: ({ viewMode }) => viewMode === 'story',
    render: ({ active }) => (
      <AddonPanel active={!!active}>
        <ExplorationsPanel />
      </AddonPanel>
    ),
  });
});
