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

import AnimatedHeader from '../components/AnimatedHeader/AnimatedHeader';
import { headerTiles, workspaceData } from '../data';

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
          welcomeText="Welcome"
          userName="Drew"
          description="Connect, monitor, and manage data."
          buttonText="Manage data"
          buttonType="tertiary"
          buttonIcon="Launch"
          headerDropdown={false}
          productName="[Product name]"
          selectedWorkspace={workspaceData[0]}
          setSelectedWorkspace={() => {}}
          allWorkspaces={workspaceData}
          selectedTileGroup={headerTiles[0]}
          setSelectedTileGroup={() => {}}
          allTiles={headerTiles}
        />
      );
      expect(container).toMatchSnapshot();
    });
  });
});
