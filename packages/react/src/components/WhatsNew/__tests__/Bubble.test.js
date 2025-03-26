/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { Bubble, BubbleHeader } from '../index';

jest.mock('./whats-new.scss', () => ({}));

describe('Bubble', () => {
  const prefix = 'clabs--whats-new';
  beforeEach(() => {
    Element.prototype.scrollIntoView = jest.fn();
  });
  describe('renders as expected - Component API', () => {
    it('should match snapshot', async () => {
      const { container, getByTestId } = render(
        <div>
          <button
            type="button"
            id="TestTargetElement1"
            data-testid="TargetButton1">
            Target button
          </button>
          <Bubble
            data-testid="TestBubble"
            align="bottom"
            target="#TestTargetElement1"
            open={true}>
            <BubbleHeader data-testid="TestBubbleHeader"></BubbleHeader>
          </Bubble>
        </div>
      );

      await waitFor(() => {
        const bubbleElement = getByTestId('TestBubble');
        expect(container).toMatchSnapshot();
        expect(bubbleElement).toBeInTheDocument();
      });
    });

    it('renders children', () => {
      render(
        <div>
          <button
            type="button"
            id="TestTargetElement1"
            data-testid="TargetButton1">
            Target button
          </button>
          <Bubble
            data-testid="TestBubble"
            align="bottom"
            target="#TestTargetElement"
            open={true}>
            <BubbleHeader data-testid="TestBubbleHeader"></BubbleHeader>
            <div>BubbleTestText</div>
          </Bubble>
        </div>
      );
      const childElement = screen.getByText('BubbleTestText');
      expect(childElement).toBeInTheDocument();
    });

    it('applies a custom class', () => {
      const testClassName = 'testClassName9';
      const { getByTestId } = render(
        <div>
          <button
            type="button"
            id="TestTargetElement1"
            data-testid="TargetButton1">
            Target button
          </button>
          <Bubble
            className={testClassName}
            data-testid="TestBubble"
            align="bottom"
            target="#TestTargetElement"
            open={true}></Bubble>
        </div>
      );
      const bubbleElement = getByTestId('TestBubble');
      expect(bubbleElement).toHaveClass(testClassName);
    });

    it('can render without a dropshadow', () => {
      const { getByTestId } = render(
        <div>
          <button
            type="button"
            id="TestTargetElement1"
            data-testid="TargetButton1">
            Target button
          </button>
          <Bubble
            dropShadow={false}
            data-testid="TestBubble"
            align="bottom"
            target="#TestTargetElement"
            open={true}></Bubble>
        </div>
      );
      const bubbleElement = getByTestId('TestBubble');
      expect(bubbleElement).not.toHaveClass(`${prefix}__bubble-drop-shadow`);
    });

    it('can render in high contrast', () => {
      const { getByTestId } = render(
        <div>
          <button
            type="button"
            id="TestTargetElement1"
            data-testid="TargetButton1">
            Target button
          </button>
          <Bubble
            highContrast={true}
            data-testid="TestBubble"
            align="bottom"
            target="#TestTargetElement"
            open={true}></Bubble>
        </div>
      );
      const bubbleElement = getByTestId('TestBubble');
      expect(bubbleElement).toHaveClass(`${prefix}__bubble-high-contrast`);
    });

    it('should not render without a target', () => {
      render(
        <Bubble
          highContrast={true}
          data-testid="TestBubble"
          align="bottom"
          open={true}>
          BubbleTestText
        </Bubble>
      );
      const bubbleElement = screen.queryByText('BubbleTestText');
      expect(bubbleElement).not.toBeInTheDocument();
    });
    it('should not be visible with a malformed target', () => {
      render(
        <Bubble
          target="#DoesntExist"
          highContrast={true}
          data-testid="TestBubble"
          align="bottom"
          open={true}>
          BubbleTestText
        </Bubble>
      );
      const bubbleElement = screen.queryByText('BubbleTestText');
      expect(bubbleElement).toBeInTheDocument();
      expect(bubbleElement).toHaveClass(`${prefix}__bubble-hidden`);
    });
  });
  describe('BubbleHeader - Component API', () => {
    it('renders with additional props', () => {
      const { getByTestId } = render(
        <BubbleHeader data-testid="TestBubbleHeader"></BubbleHeader>
      );
      const bubbleHeaderElement = getByTestId('TestBubbleHeader');
      expect(bubbleHeaderElement).toBeInTheDocument();
    });

    it('applies a custom class', () => {
      const testClassName = 'testClassName44';
      const { getByTestId } = render(
        <BubbleHeader
          className={testClassName}
          data-testid="TestBubbleHeader"></BubbleHeader>
      );

      const bubbleHeaderElement = getByTestId('TestBubbleHeader');
      expect(bubbleHeaderElement).toHaveClass(testClassName);
    });

    it('renders children', () => {
      render(
        <BubbleHeader>
          <div>BubbleTestText</div>
        </BubbleHeader>
      );

      const childElement = screen.getByText('BubbleTestText');
      expect(childElement).toBeInTheDocument();
    });
  });
});
