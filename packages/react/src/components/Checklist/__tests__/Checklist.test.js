/**
 * @license
 *
 * Copyright IBM Corp. 2023, 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { Checklist } from '../components/Checklist';

jest.mock('../components/checklist.scss', () => ({}));

const blockClass = 'clabs--checklist';
const componentName = Checklist.displayName;

// values to use
const className = 'test-class-name';
const dataTestId = 'checklist-test';
const list1itemCallbackFn = jest.fn();
const taskLists = [
  {
    title: 'List 1 title',
    tasks: [
      {
        kind: 'checked',
        label: 'Checked task with callback',
        onClick: list1itemCallbackFn,
      },
      {
        kind: 'checked',
        label: 'Checked task without callback',
      },
    ],
  },
  {
    title: 'List 2 title',
    tasks: [
      {
        kind: 'unchecked',
        label: 'Unchecked task with callback',
        onClick: jest.fn(),
      },
      {
        kind: 'unchecked',
        label: 'Unchecked task without callback',
      },
    ],
  },
  {
    title: 'List 3 title',
    tasks: [
      {
        kind: 'indeterminate',
        label: 'indeterminate task with callback',
        onClick: jest.fn(),
      },
      {
        kind: 'indeterminate',
        label: 'indeterminate task without callback',
      },
    ],
  },
  {
    title: 'List 4 title',
    tasks: [
      {
        kind: 'disabled',
        label: 'disabled task with callback',
        onClick: jest.fn(),
      },
      {
        kind: 'disabled',
        label: 'disabled task without callback',
      },
    ],
  },
  {
    title: 'List 5 title',
    tasks: [
      {
        kind: 'error',
        label: 'error task with callback',
        onClick: jest.fn(),
      },
      {
        kind: 'error',
        label: 'error task without callback',
      },
    ],
  },
];

// calculate some values based on taskLists
const allTasks = taskLists.map((obj) => obj.tasks).flat();
const numTasks = allTasks.length;
const numTasksCompleted = allTasks.filter(
  (task) => task.kind === 'checked'
).length;
// std properties to use
const chartValue = numTasksCompleted / numTasks;
const chartLabel = `${parseInt(chartValue * 100)}% complete`;
const title = 'Get started checklist';
const viewAllLabel = `View all (${numTasks})`;

/**
 * Render a Checklist with default values and any other required props
 * @param {object} props additional props for the Checklist
 * @returns {object} the render result
 */
const renderComponent = ({ ...rest } = {}) =>
  render(<Checklist {...{ taskLists, ...rest }} />);

describe(componentName, () => {
  it('renders a component Checklist', () => {
    // <aside> elements have an *implicit* role, and do not req. an *assigned* role.
    renderComponent();
    expect(document.querySelector('aside')).toHaveClass(blockClass);
  });

  it('renders a title', () => {
    renderComponent({ title });
    screen.getByText(title);
  });

  it('does not render the chart and chart label if `chartLabel` is defined and `chartValue` is not', () => {
    renderComponent({ chartLabel });
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.queryByText(chartLabel)).toBeNull();
  });

  it('does not render the chart and chart label if `chartValue` is defined and `chartLabel` is not', () => {
    renderComponent({ chartValue });
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.queryByText(chartLabel)).toBeNull();
  });

  it('renders the chart and chart label if `chartLabel` and `chartValue` are both defined', () => {
    renderComponent({ chartLabel, chartValue });
    expect(screen.getByRole('img')).toHaveClass(`${blockClass}__chart`);
    screen.getByText(chartLabel);
  });

  it('renders a toggle', async () => {
    const { click } = userEvent;
    const onToggleFn = jest.fn();
    const checklistToggleAriaLabel = 'My checklist toggle';
    renderComponent({
      enableToggle: true,
      title,
      onToggle: onToggleFn,
      checklistToggleAriaLabel,
    });

    expect(screen.getByLabelText(checklistToggleAriaLabel)).toBeDefined();
    const enableToggleButton = screen.getByLabelText(checklistToggleAriaLabel);
    await act(() => click(enableToggleButton));
    // onToggle is called initially because the component defaults to being open which
    // causes onToggle to be called. Then we click it again in this test, causing
    // onToggle to be called 2 times
    expect(onToggleFn).toHaveBeenCalledTimes(2);
  });

  it('renders a "view all" button', () => {
    renderComponent({ viewAllLabel });
    screen.getByText(viewAllLabel);
  });

  it('applies className to the containing node', () => {
    renderComponent({ className });
    expect(document.querySelector('aside')).toHaveClass(className);
  });

  it('adds additional props to the containing node', () => {
    renderComponent({ ['data-testid']: dataTestId });
    screen.getByTestId(dataTestId);
  });

  it('forwards a ref to an appropriate node', () => {
    const ref = React.createRef();
    renderComponent({ ref });
    expect(ref.current).toHaveClass(blockClass);
  });

  it('should click the view all button', async () => {
    const { click } = userEvent;
    const viewAllLabel = 'View all';
    const onClickViewAllFn = jest.fn();
    renderComponent({ onClickViewAll: onClickViewAllFn, viewAllLabel });

    const viewAllButton = screen.getByText(viewAllLabel).closest('button');
    await click(viewAllButton);
    expect(onClickViewAllFn).toHaveBeenCalledTimes(1);
  });

  it('should call list item onClick handler', async () => {
    const { click } = userEvent;
    renderComponent();
    const taskItemWithCallback = screen
      .getByText('Checked task with callback')
      .closest('button');
    await click(taskItemWithCallback);
    expect(list1itemCallbackFn).toHaveBeenCalledTimes(1);
  });

  it('should expand/collapse while clicking on checklist header button ', async () => {
    renderComponent({
      title: 'Checklist header',
      viewAllLabel: `View all (10)`,
    });

    const buttonEle = screen.getAllByRole('button');
    const toggleButton = buttonEle.find(
      (btn) => btn.getAttribute('aria-label') === 'Checklist toggle'
    );
    // checking if the checklist is expanded
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('View all (10)')).toBeVisible();

    // collapsing checklist
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

    // expand back on second click
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('View all (10)')).toBeVisible();
  });

  it('should call checklist with checked, unchecked,indeterminate, disabled and error state', async () => {
    renderComponent();
    const checkedElement = screen
      .getByTitle('List 1 title')
      .nextElementSibling?.querySelector('li > span');
    expect(checkedElement).toBeInViewport;
    expect(checkedElement).toHaveClass(`${blockClass}__icon--checked`);

    const uncheckedElement = screen
      .getByTitle('List 2 title')
      .nextElementSibling?.querySelector('li > span');
    expect(uncheckedElement).toBeInViewport;
    expect(uncheckedElement).toHaveClass(`${blockClass}__icon--unchecked`);

    const indeterminateElement = screen
      .getByTitle('List 3 title')
      .nextElementSibling?.querySelector('li > span');
    expect(indeterminateElement).toBeInViewport;
    expect(indeterminateElement).toHaveClass(
      `${blockClass}__icon--indeterminate`
    );

    const disabledElement = screen
      .getByTitle('List 4 title')
      .nextElementSibling?.querySelector('li > span');
    expect(disabledElement).toBeInViewport;
    expect(disabledElement).toHaveClass(`${blockClass}__icon--disabled`);

    const errorElement = screen
      .getByTitle('List 5 title')
      .nextElementSibling?.querySelector('li > span');
    expect(errorElement).toBeInViewport;
    expect(errorElement).toHaveClass(`${blockClass}__icon--error`);
  });

  it('renders the chart when `chartValue` is 0', () => {
    renderComponent({ chartLabel, chartValue: 0 });
    expect(screen.getByRole('img')).toHaveClass(`${blockClass}__chart`);
    screen.getByText(chartLabel);
  });

  it('renders the chart as a circle', () => {
    renderComponent({ chartLabel, chartValue: 0.5 });
    expect(screen.getByRole('img').style.borderRadius).toBe('50%');
  });

  it('applies the theme class to the task icons', () => {
    renderComponent({ theme: 'dark' });
    expect(document.querySelector(`.${blockClass}__icon`)).toHaveClass(
      `${blockClass}__icon__dark`
    );
  });

  it('renders the toggle `aria-controls` pointing at the list container', () => {
    renderComponent({ title });
    const toggle = screen.getByLabelText('Checklist toggle');
    const controlsId = toggle.getAttribute('aria-controls');
    expect(document.getElementById(controlsId)).toHaveClass(
      `${blockClass}__content-outer`
    );
  });

  it('does not render the toggle when `enableToggle` is false', () => {
    renderComponent({ title, enableToggle: false });
    expect(screen.queryByLabelText('Checklist toggle')).toBeNull();
  });

  it('renders closed when `open` is false', () => {
    renderComponent({ title, open: false });
    expect(document.querySelector('aside')).toHaveClass(
      `${blockClass}__closed`
    );
    expect(screen.getByLabelText('Checklist toggle')).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });
});
