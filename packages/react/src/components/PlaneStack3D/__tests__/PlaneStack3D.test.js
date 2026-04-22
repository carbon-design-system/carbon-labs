/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint-disable jsdoc/require-jsdoc, jsdoc/require-param, jsdoc/require-param-type, jsdoc/require-param-description, react/prop-types */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlaneStack3D from '../src/PlaneStack3D';

const mockSceneProps = [];

jest.mock('@react-three/fiber', () => ({
  /**
   *
   * @param root0
   * @param root0.children
   * @param root0.'aria-hidden'
   */
  Canvas: ({ children, 'aria-hidden': ariaHidden }) => (
    <div data-testid="r3f-canvas" aria-hidden={ariaHidden}>
      {children}
    </div>
  ),
}));

jest.mock('@react-three/drei', () => ({
  useProgress: jest.fn(() => ({ active: false })),
}));

jest.mock('../src/Scene', () => ({
  __esModule: true,
  /**
   *
   * @param props
   */
  default: (props) => {
    mockSceneProps.push(props);
    return <div data-testid="plane-stack-scene" />;
  },
}));

/**
 *
 */
class ResizeObserverMock {
  /**
   *
   */
  observe() {}
  /**
   *
   */
  disconnect() {}
}

describe('PlaneStack3D', () => {
  beforeAll(() => {
    window.ResizeObserver = ResizeObserverMock;
  });

  beforeEach(() => {
    mockSceneProps.length = 0;
  });

  it('renders the accessible plane stack region and 3D scene boundary', () => {
    render(
      <PlaneStack3D
        primaryLayer={[
          {
            id: 'service-1',
            label: 'Service',
            columnIndex: 0,
            size: 'sm',
          },
        ]}
      />
    );

    expect(
      screen.getByRole('region', { name: '3D tenant stacked plane' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Primary layer/ })).toBeVisible();
    expect(screen.getByTestId('r3f-canvas')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
    expect(screen.getByTestId('plane-stack-scene')).toBeInTheDocument();
  });

  it('renders accessibility controls for primary, core, and foundation layers', () => {
    render(
      <PlaneStack3D
        primaryLayer={[
          {
            id: 'service-1',
            label: 'Service',
            columnIndex: 0,
            size: 'sm',
          },
        ]}
        coreLayer={[
          {
            id: 'core-1',
            label: 'Core service',
            size: 'lg',
          },
        ]}
        foundationConfig={{
          id: 'foundation-1',
          label: 'Foundation',
          racks: [
            {
              id: 'rack-1',
              slots: 4,
              variant: 'open',
              status: 'green',
            },
          ],
        }}
      />
    );

    expect(screen.getByRole('button', { name: /Primary layer/ })).toBeVisible();
    expect(screen.getByRole('button', { name: /Core layer/ })).toBeVisible();
    expect(
      screen.getByRole('button', { name: /Foundation layer/ })
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Primary item 1 of 1: Service' })
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Core item 1 of 1: Core service' })
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Foundation item 1 of 1: Rack 1' })
    ).toBeVisible();
  });

  it('only renders accessibility controls for layers with data', () => {
    render(
      <PlaneStack3D
        primaryLayer={[
          {
            id: 'service-1',
            label: 'Service',
            columnIndex: 0,
            size: 'sm',
          },
        ]}
      />
    );

    expect(screen.getByRole('button', { name: /Primary layer/ })).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /Core layer/ })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Foundation layer/ })
    ).not.toBeInTheDocument();
  });

  it('passes skeleton loader rows to the 3D scene without adding a11y items', () => {
    render(
      <PlaneStack3D
        primaryLayer={[]}
        skeletonLoader
        lockColumnCount
        primaryColumnCount={4}
      />
    );

    const sceneProps = mockSceneProps.at(-1);
    const primaryRow = sceneProps.resolvedRows[0];

    expect(sceneProps.skeletonLoader).toBe(true);
    expect(sceneProps.primaryColumnCount).toBe(4);
    expect(primaryRow).toHaveLength(4);
    expect(primaryRow.every((column) => column[0].isLoadingScaffold)).toBe(
      true
    );
    expect(
      screen.queryByRole('button', { name: /Primary layer/ })
    ).not.toBeInTheDocument();
  });
});

// Made with Bob
