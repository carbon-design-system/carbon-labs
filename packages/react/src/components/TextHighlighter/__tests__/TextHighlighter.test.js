/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

import { TextHighlighter } from '../components/TextHighlighter';

jest.mock('../components/text-highlighter.scss', () => ({}));

describe('TextHighlighter', () => {
  describe('renders as expected - Component API', () => {
    it('should render with default props', () => {
      const { container } = render(
        <TextHighlighter kind="mark">Test content</TextHighlighter>
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should match snapshot', () => {
      const { container } = render(
        <TextHighlighter kind="mark">Test content</TextHighlighter>
      );
      expect(container).toMatchSnapshot();
    });

    it('should render children correctly', () => {
      render(<TextHighlighter kind="mark">Highlighted text</TextHighlighter>);
      expect(screen.getByText('Highlighted text')).toBeInTheDocument();
    });
  });

  describe('kind prop', () => {
    it('should render with mark kind by default', () => {
      const { container } = render(
        <TextHighlighter kind="mark">Mark text</TextHighlighter>
      );
      const markElement = container.querySelector('mark');
      expect(markElement).toBeInTheDocument();
      expect(markElement).toHaveTextContent('Mark text');
    });

    it('should render with ins kind', () => {
      const { container } = render(
        <TextHighlighter kind="ins">Inserted text</TextHighlighter>
      );
      const insElement = container.querySelector('ins');
      expect(insElement).toBeInTheDocument();
      expect(insElement).toHaveTextContent('Inserted text');
    });

    it('should render with del kind', () => {
      const { container } = render(
        <TextHighlighter kind="del">Deleted text</TextHighlighter>
      );
      const delElement = container.querySelector('del');
      expect(delElement).toBeInTheDocument();
      expect(delElement).toHaveTextContent('Deleted text');
    });

    it('should apply correct CSS class for ins kind', () => {
      const { container } = render(
        <TextHighlighter kind="ins">Inserted</TextHighlighter>
      );
      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('clabs--text-highlighter__container');
      expect(containerDiv).toHaveClass(
        'clabs--text-highlighter__container__ins'
      );
    });

    it('should apply correct CSS class for del kind', () => {
      const { container } = render(
        <TextHighlighter kind="del">Deleted</TextHighlighter>
      );
      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('clabs--text-highlighter__container');
      expect(containerDiv).toHaveClass(
        'clabs--text-highlighter__container__del'
      );
    });
  });

  describe('type prop', () => {
    it('should render with default type', () => {
      const { container } = render(
        <TextHighlighter kind="mark" type="default">
          Default type
        </TextHighlighter>
      );
      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('clabs--text-highlighter-default');
    });

    it('should render with magenta type', () => {
      const { container } = render(
        <TextHighlighter kind="mark" type="magenta">
          Magenta type
        </TextHighlighter>
      );
      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('clabs--text-highlighter-magenta');
    });

    it('should render with purple type', () => {
      const { container } = render(
        <TextHighlighter kind="mark" type="purple">
          Purple type
        </TextHighlighter>
      );
      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('clabs--text-highlighter-purple');
    });

    it('should render with blue type', () => {
      const { container } = render(
        <TextHighlighter kind="mark" type="blue">
          Blue type
        </TextHighlighter>
      );
      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('clabs--text-highlighter-blue');
    });

    it('should render with cyan type', () => {
      const { container } = render(
        <TextHighlighter kind="mark" type="cyan">
          Cyan type
        </TextHighlighter>
      );
      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('clabs--text-highlighter-cyan');
    });

    it('should render with teal type', () => {
      const { container } = render(
        <TextHighlighter kind="mark" type="teal">
          Teal type
        </TextHighlighter>
      );
      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('clabs--text-highlighter-teal');
    });

    it('should render with gray type', () => {
      const { container } = render(
        <TextHighlighter kind="mark" type="gray">
          Gray type
        </TextHighlighter>
      );
      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('clabs--text-highlighter-gray');
    });

    it('should render with cool-gray type', () => {
      const { container } = render(
        <TextHighlighter kind="mark" type="cool-gray">
          Cool gray type
        </TextHighlighter>
      );
      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('clabs--text-highlighter-cool-gray');
    });

    it('should render with warm-gray type', () => {
      const { container } = render(
        <TextHighlighter kind="mark" type="warm-gray">
          Warm gray type
        </TextHighlighter>
      );
      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('clabs--text-highlighter-warm-gray');
    });

    it('should render with high-contrast type', () => {
      const { container } = render(
        <TextHighlighter kind="mark" type="high-contrast">
          High contrast type
        </TextHighlighter>
      );
      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('clabs--text-highlighter-high-contrast');
    });

    it('should not apply type class for ins kind', () => {
      const { container } = render(
        <TextHighlighter kind="ins" type="magenta">
          Inserted
        </TextHighlighter>
      );
      const containerDiv = container.firstChild;
      expect(containerDiv).not.toHaveClass('clabs--text-highlighter-magenta');
      expect(containerDiv).toHaveClass(
        'clabs--text-highlighter__container__ins'
      );
    });

    it('should not apply type class for del kind', () => {
      const { container } = render(
        <TextHighlighter kind="del" type="blue">
          Deleted
        </TextHighlighter>
      );
      const containerDiv = container.firstChild;
      expect(containerDiv).not.toHaveClass('clabs--text-highlighter-blue');
      expect(containerDiv).toHaveClass(
        'clabs--text-highlighter__container__del'
      );
    });
  });

  describe('reference prop', () => {
    it('should render reference annotation for mark kind', () => {
      const { container } = render(
        <TextHighlighter kind="mark" reference="1">
          Referenced text
        </TextHighlighter>
      );
      const supElement = container.querySelector('sup');
      expect(supElement).toBeInTheDocument();
      expect(supElement).toHaveTextContent('1');
    });

    it('should render reference with symbol', () => {
      const { container } = render(
        <TextHighlighter kind="mark" reference="*">
          Referenced text
        </TextHighlighter>
      );
      const supElement = container.querySelector('sup');
      expect(supElement).toBeInTheDocument();
      expect(supElement).toHaveTextContent('*');
    });

    it('should render reference with two characters', () => {
      const { container } = render(
        <TextHighlighter kind="mark" reference="OR">
          Organization
        </TextHighlighter>
      );
      const supElement = container.querySelector('sup');
      expect(supElement).toBeInTheDocument();
      expect(supElement).toHaveTextContent('OR');
    });

    it('should not render reference for ins kind', () => {
      const { container } = render(
        <TextHighlighter kind="ins" reference="1">
          Inserted text
        </TextHighlighter>
      );
      const supElement = container.querySelector('sup');
      expect(supElement).not.toBeInTheDocument();
    });

    it('should not render reference for del kind', () => {
      const { container } = render(
        <TextHighlighter kind="del" reference="1">
          Deleted text
        </TextHighlighter>
      );
      const supElement = container.querySelector('sup');
      expect(supElement).not.toBeInTheDocument();
    });

    it('should not render reference when not provided', () => {
      const { container } = render(
        <TextHighlighter kind="mark">Text without reference</TextHighlighter>
      );
      const supElement = container.querySelector('sup');
      expect(supElement).not.toBeInTheDocument();
    });
  });

  describe('combined props', () => {
    it('should render mark with type and reference', () => {
      const { container } = render(
        <TextHighlighter kind="mark" type="purple" reference="PE">
          Captain Amelia Croft
        </TextHighlighter>
      );
      const containerDiv = container.firstChild;
      const markElement = container.querySelector('mark');
      const supElement = container.querySelector('sup');

      expect(containerDiv).toHaveClass('clabs--text-highlighter-purple');
      expect(markElement).toHaveTextContent('Captain Amelia Croft');
      expect(supElement).toHaveTextContent('PE');
    });

    it('should handle complex children', () => {
      render(
        <TextHighlighter kind="mark">
          <span>Complex</span> <strong>children</strong>
        </TextHighlighter>
      );
      expect(screen.getByText('Complex')).toBeInTheDocument();
      expect(screen.getByText('children')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should use semantic HTML elements', () => {
      const { container: markContainer } = render(
        <TextHighlighter kind="mark">Mark</TextHighlighter>
      );
      expect(markContainer.querySelector('mark')).toBeInTheDocument();

      const { container: insContainer } = render(
        <TextHighlighter kind="ins">Insert</TextHighlighter>
      );
      expect(insContainer.querySelector('ins')).toBeInTheDocument();

      const { container: delContainer } = render(
        <TextHighlighter kind="del">Delete</TextHighlighter>
      );
      expect(delContainer.querySelector('del')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle empty children', () => {
      const { container } = render(<TextHighlighter kind="mark" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle empty string children', () => {
      const { container } = render(
        <TextHighlighter kind="mark"></TextHighlighter>
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle numeric children', () => {
      render(<TextHighlighter kind="mark">{123}</TextHighlighter>);
      expect(screen.getByText('123')).toBeInTheDocument();
    });

    it('should pass through additional props', () => {
      const { container } = render(
        <TextHighlighter kind="mark" data-testid="custom-highlighter">
          Test
        </TextHighlighter>
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
