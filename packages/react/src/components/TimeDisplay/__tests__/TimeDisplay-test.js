/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render, screen, act } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { TimeDisplay } from '../components/TimeDisplay';

jest.mock('../components/time-display.scss', () => ({}));
jest.useFakeTimers();

const jobStart = new Date(Date.now() - 10000); // 10 seconds ago
const futureEnd = new Date(Date.now() + 10000); // 10 seconds from now

describe('TimeDisplay', () => {
  describe('renders as expected - Component API', () => {
    it('should match snapshot for count-up', () => {
      const { container } = render(
        <TimeDisplay mode="count-up" startTime={jobStart} label="Elapsed time" />
      );
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for duration', () => {
      const { container } = render(
        <TimeDisplay mode="duration" duration={3661} label="Total runtime" />
      );
      expect(container).toMatchSnapshot();
    });

    it('renders the label', () => {
      render(
        <TimeDisplay mode="duration" duration={3661} label="Total runtime" />
      );
      expect(screen.getByText('Total runtime')).toBeInTheDocument();
    });

    it('hides the label visually when hideLabel is true', () => {
      const { container } = render(
        <TimeDisplay
          mode="duration"
          duration={3661}
          label="Total runtime"
          hideLabel
        />
      );
      const label = container.querySelector('[class*="label--hidden"]');
      expect(label).toBeInTheDocument();
    });

    it('renders helper text', () => {
      render(
        <TimeDisplay
          mode="duration"
          duration={3661}
          label="Total runtime"
          helperText="Task completed successfully"
        />
      );
      expect(
        screen.getByText('Task completed successfully')
      ).toBeInTheDocument();
    });

    it('supports a custom className', () => {
      const { container } = render(
        <TimeDisplay
          mode="duration"
          duration={3661}
          label="Total runtime"
          className="custom-class"
        />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('forwards data-testid to the root element', () => {
      render(
        <TimeDisplay
          mode="duration"
          duration={3661}
          label="Total runtime"
          data-testid="time-display-test"
        />
      );
      expect(
        screen.getByTestId('time-display-test')
      ).toBeInTheDocument();
    });
  });

  describe('mode validation', () => {
    it('returns null when count-up mode is missing startTime', () => {
      const { container } = render(
        // @ts-expect-error intentional invalid props
        <TimeDisplay mode="count-up" label="Elapsed time" />
      );
      expect(container.firstChild).toBeNull();
    });

    it('returns null when count-down mode is missing endTime', () => {
      const { container } = render(
        // @ts-expect-error intentional invalid props
        <TimeDisplay mode="count-down" label="Time remaining" />
      );
      expect(container.firstChild).toBeNull();
    });

    it('returns null when duration mode is missing duration', () => {
      const { container } = render(
        // @ts-expect-error intentional invalid props
        <TimeDisplay mode="duration" label="Total runtime" />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('formats', () => {
    it('renders the split format by default', () => {
      const { container } = render(
        <TimeDisplay mode="duration" duration={3661} label="Total runtime" />
      );
      expect(
        container.querySelector('[class*="split-container"]')
      ).toBeInTheDocument();
    });

    it('renders the boxed format', () => {
      const { container } = render(
        <TimeDisplay
          mode="duration"
          duration={3661}
          label="Total runtime"
          format="boxed"
        />
      );
      expect(
        container.querySelector('[class*="boxed-container"]')
      ).toBeInTheDocument();
    });

    it('renders the colon format', () => {
      const { container } = render(
        <TimeDisplay
          mode="duration"
          duration={3661}
          label="Total runtime"
          format="colon"
        />
      );
      expect(
        container.querySelector('[class*="colon-container"]')
      ).toBeInTheDocument();
    });

    it('renders the inline format', () => {
      const { container } = render(
        <TimeDisplay
          mode="duration"
          duration={3661}
          label="Total runtime"
          format="inline"
        />
      );
      expect(
        container.querySelector('[class*="inline-container"]')
      ).toBeInTheDocument();
    });
  });

  describe('countdown completion', () => {
    it('renders completeLabel when countdown reaches zero', () => {
      const pastEnd = new Date(Date.now() - 1000); // already expired
      render(
        <TimeDisplay
          mode="count-down"
          endTime={pastEnd}
          label="Time remaining"
          completeLabel="Session expired"
        />
      );
      act(() => jest.advanceTimersByTime(2000));
      expect(screen.getByText('Session expired')).toBeInTheDocument();
    });

    it('calls onComplete callback once when countdown reaches zero', () => {
      const onComplete = jest.fn();
      const pastEnd = new Date(Date.now() - 1000);
      render(
        <TimeDisplay
          mode="count-down"
          endTime={pastEnd}
          label="Time remaining"
          onComplete={onComplete}
        />
      );
      act(() => jest.advanceTimersByTime(2000));
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });
});
