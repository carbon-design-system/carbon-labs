/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { render } from '@testing-library/react';
import 'jest-canvas-mock';
import '@testing-library/jest-dom';

import AnimatedHeader, {
  SelectedWorkspace,
} from '../components/AnimatedHeader/AnimatedHeader';
import { headerTiles, workspaceData, tasksConfigDropdown } from '../data';

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

jest.mock('./animated-header.scss', () => ({}));
describe('AnimatedHeader', () => {
  describe('renders as expected - Component API', () => {
    it('should match snapshot', () => {
      const { container } = render(
        <AnimatedHeader
          allTiles={headerTiles}
          allWorkspaces={workspaceData}
          description="Connect, monitor, and manage data."
          handleHeaderItemsToString={() => ''}
          handleWorkspaceItemsToString={() => ''}
          productName="[Product name]"
          selectedTileGroup={headerTiles[0]}
          selectedWorkspace={workspaceData[0]}
          renderWorkspaceSelectedItem={(item: SelectedWorkspace | null) =>
            item ? `Open in: ${item.label}` : ''
          }
          setSelectedTileGroup={() => {}}
          setSelectedWorkspace={() => {}}
          tasksConfig={tasksConfigDropdown}
          userName="Drew"
          welcomeText="Welcome"
          workspaceLabel="Open in: Drew's workspace"
        />
      );
      expect(container).toMatchSnapshot();
    });
  });
});
