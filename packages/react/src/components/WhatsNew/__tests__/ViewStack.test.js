/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render, act } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { ViewStack, View } from '../index';

jest.mock('./whats-new.scss', () => ({}));
describe('ViewStack', () => {
  const prefix = 'clabs--whats-new';
  describe('renders as expected - Component API', () => {
    it('should match snapshot', async () => {
      const { container, getByTestId } = render(
        <ViewStack data-testid="TestViewStack">
          <View></View>
        </ViewStack>
      );

      const viewStackElement = getByTestId('TestViewStack');
      expect(container).toMatchSnapshot();
      expect(viewStackElement).toBeInTheDocument();
    });

    it('First element should be active by default', () => {
      const testRef = React.createRef();
      const { getByTestId } = render(
        <ViewStack
          // eslint-disable-next-line react/forbid-component-props
          style={{ blockSize: 100 }}
          ref={testRef}
          data-testid="TestViewStack">
          <View data-testid="TestView1">
            <div>Slide 1</div>
          </View>
          <View data-testid="TestView2">
            <div>Slide 2</div>
          </View>
          <View data-testid="TestView3">
            <div>Slide 3</div>
          </View>
        </ViewStack>
      );
      const view1 = getByTestId('TestView1');
      const view2 = getByTestId('TestView2');
      const view3 = getByTestId('TestView3');

      expect(view1).toHaveClass(`${prefix}__view`);
      expect(view2).toHaveClass(`${prefix}__view`);
      expect(view3).toHaveClass(`${prefix}__view`);

      expect(view1).toHaveClass(`${prefix}__view-active`);
      expect(view2).not.toHaveClass(`${prefix}__view-active`);
      expect(view3).not.toHaveClass(`${prefix}__view-active`);
    });

    it('Should increment the view', () => {
      const testRef = React.createRef();
      const { getByTestId } = render(
        <ViewStack
          // eslint-disable-next-line react/forbid-component-props
          style={{ blockSize: 100 }}
          ref={testRef}
          data-testid="TestViewStack">
          <View data-testid="TestView1">
            <div>Slide 1</div>
          </View>
          <View data-testid="TestView2">
            <div>Slide 2</div>
          </View>
          <View data-testid="TestView3">
            <div>Slide 3</div>
          </View>
        </ViewStack>
      );
      const view1 = getByTestId('TestView1');
      const view2 = getByTestId('TestView2');
      const view3 = getByTestId('TestView3');

      expect(view1).toHaveClass(`${prefix}__view-active`);
      expect(view2).not.toHaveClass(`${prefix}__view-active`);
      expect(view3).not.toHaveClass(`${prefix}__view-active`);

      act(() => {
        testRef.current?.next();
      });

      expect(view1).toHaveClass(`${prefix}__view-in-stack`);
      expect(view2).toHaveClass(`${prefix}__view-active`);
      expect(view3).not.toHaveClass(`${prefix}__view-active`);
    });

    it('Should navigate forwards and backwards', () => {
      const testRef = React.createRef();
      const { getByTestId } = render(
        <ViewStack
          // eslint-disable-next-line react/forbid-component-props
          style={{ blockSize: 100 }}
          ref={testRef}
          data-testid="TestViewStack">
          <View data-testid="TestView1">
            <div>Slide 1</div>
          </View>
          <View data-testid="TestView2">
            <div>Slide 2</div>
          </View>
          <View data-testid="TestView3">
            <div>Slide 3</div>
          </View>
        </ViewStack>
      );
      const view1 = getByTestId('TestView1');
      const view2 = getByTestId('TestView2');
      const view3 = getByTestId('TestView3');

      expect(view1).toHaveClass(`${prefix}__view-active`);
      expect(view2).not.toHaveClass(`${prefix}__view-active`);
      expect(view3).not.toHaveClass(`${prefix}__view-active`);

      act(() => {
        testRef.current?.next();
      });

      expect(view1).toHaveClass(`${prefix}__view-in-stack`);
      expect(view2).toHaveClass(`${prefix}__view-active`);
      expect(view3).not.toHaveClass(`${prefix}__view-active`);

      act(() => {
        testRef.current?.back();
      });

      expect(view1).toHaveClass(`${prefix}__view-active`);
      expect(view2).not.toHaveClass(`${prefix}__view-active`);
      expect(view3).not.toHaveClass(`${prefix}__view-active`);
    });

    it('Should navigate to a specific view index', () => {
      const testRef = React.createRef();
      const { getByTestId } = render(
        <ViewStack
          // eslint-disable-next-line react/forbid-component-props
          style={{ blockSize: 100 }}
          ref={testRef}
          data-testid="TestViewStack">
          <View data-testid="TestView1">
            <div>Slide 1</div>
          </View>
          <View data-testid="TestView2">
            <div>Slide 2</div>
          </View>
          <View data-testid="TestView3">
            <div>Slide 3</div>
          </View>
        </ViewStack>
      );
      const view1 = getByTestId('TestView1');
      const view2 = getByTestId('TestView2');
      const view3 = getByTestId('TestView3');

      expect(view1).toHaveClass(`${prefix}__view-active`);
      expect(view2).not.toHaveClass(`${prefix}__view-active`);
      expect(view3).not.toHaveClass(`${prefix}__view-active`);

      act(() => {
        testRef.current?.pushViewIndex(2);
      });

      expect(view1).toHaveClass(`${prefix}__view-in-stack`);
      expect(view2).toHaveClass(`${prefix}__view`);
      expect(view3).toHaveClass(`${prefix}__view-active`);

      act(() => {
        testRef.current?.pushViewIndex(1);
      });

      expect(view1).toHaveClass(`${prefix}__view-in-stack`);
      expect(view2).toHaveClass(`${prefix}__view-active`);
      expect(view3).toHaveClass(`${prefix}__view-in-stack`);

      act(() => {
        testRef.current?.home();
      });

      expect(view1).toHaveClass(`${prefix}__view-active`);
      expect(view2).not.toHaveClass(`${prefix}__view-active`);
      expect(view2).not.toHaveClass(`${prefix}__view-in-stack`);
      expect(view3).not.toHaveClass(`${prefix}__view-active`);
      expect(view3).not.toHaveClass(`${prefix}__view-in-stack`);
    });
  });
});
