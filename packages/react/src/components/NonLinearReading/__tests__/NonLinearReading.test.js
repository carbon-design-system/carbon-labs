/**
 * @license
 *
 * Copyright IBM Corp. 2023, 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom';

import { NonLinearReading } from '../components/NonLinearReading';

jest.mock('../components/non-linear-reading.scss', () => ({}));

const blockClass = 'clabs--non-linear-reading';
const componentName = NonLinearReading.displayName;

const definition = 'This is the definition text.';
const keyword = 'correlation engine';
const className = 'test-class-name';
const dataTestId = 'non-linear-reading-test';

/**
 * Renders NonLinearReading with default definition and keyword
 * @param {object} props props to pass to the component
 * @returns {object} the render result
 */
const renderComponent = (props = {}) =>
  render(
    <NonLinearReading definition={definition} {...props}>
      {keyword}
    </NonLinearReading>
  );

describe(componentName, () => {
  it('renders children (keyword)', () => {
    renderComponent();
    expect(screen.getByText(keyword)).toBeInTheDocument();
  });

  it('applies className to the containing node', () => {
    renderComponent({ className });
    expect(document.querySelector(`.${className}`)).toBeInTheDocument();
  });

  it('adds additional props to the containing node', () => {
    renderComponent({ 'data-testid': dataTestId });
    expect(screen.getByTestId(dataTestId)).toBeInTheDocument();
  });

  it('forwards a ref to the containing node', () => {
    const ref = React.createRef();
    renderComponent({ ref });
    expect(ref.current).toHaveClass(blockClass);
  });

  it('renders the light theme class by default', () => {
    const { container } = renderComponent();
    expect(container.firstChild).toHaveClass(`${blockClass}__light`);
  });

  it('renders the dark theme class when theme="dark"', () => {
    const { container } = renderComponent({ theme: 'dark' });
    expect(container.firstChild).toHaveClass(`${blockClass}__dark`);
  });

  it('shows definition content when the keyword button is toggled open', async () => {
    const { container } = renderComponent();
    const button = container.querySelector('button');
    await act(() => userEvent.click(button));
    expect(screen.queryByText(definition)).toBeInTheDocument();
  });

  it('hides definition content when the keyword button is toggled closed', async () => {
    const { container } = renderComponent();
    const button = container.querySelector('button');
    // Open
    await act(() => userEvent.click(button));
    expect(screen.queryByText(definition)).toBeInTheDocument();
    // Close
    await act(() => userEvent.click(button));
    expect(screen.queryByText(definition)).not.toBeInTheDocument();
  });

  it('sets aria-expanded to false when closed', () => {
    const { container } = renderComponent();
    const button = container.querySelector('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('sets aria-expanded to true when open', async () => {
    const { container } = renderComponent();
    const button = container.querySelector('button');
    await act(() => userEvent.click(button));
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('wires aria-controls on the button to the body id', () => {
    const { container } = renderComponent();
    const button = container.querySelector('button');
    const body = container.querySelector(`.${blockClass}__body`);
    expect(button.getAttribute('aria-controls')).toBe(body.id);
  });
});
