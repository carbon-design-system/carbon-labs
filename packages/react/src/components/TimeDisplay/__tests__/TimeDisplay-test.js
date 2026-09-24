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
    let errorSpy;
    beforeEach(() => {
      errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterEach(() => errorSpy.mockRestore());

    it('returns null when count-up mode is missing startTime', () => {
      const { container } = render(
        // @ts-expect-error intentional invalid props
        <TimeDisplay mode="count-up" label="Elapsed time" />
      );
      expect(container.firstChild).toBeNull();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('count-up mode requires startTime')
      );
    });

    it('returns null when count-down mode is missing endTime', () => {
      const { container } = render(
        // @ts-expect-error intentional invalid props
        <TimeDisplay mode="count-down" label="Time remaining" />
      );
      expect(container.firstChild).toBeNull();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('count-down mode requires endTime')
      );
    });

    it('returns null when duration mode is missing duration', () => {
      const { container } = render(
        // @ts-expect-error intentional invalid props
        <TimeDisplay mode="duration" label="Total runtime" />
      );
      expect(container.firstChild).toBeNull();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('duration mode requires a duration value')
      );
    });

    it('returns null when units is empty', () => {
      const { container } = render(
        <TimeDisplay mode="duration" duration={3661} label="Total runtime" units={[]} />
      );
      expect(container.firstChild).toBeNull();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('units must contain at least one time unit')
      );
    });

    it('returns null when units contains an invalid value', () => {
      const { container } = render(
        // @ts-expect-error intentional invalid props
        <TimeDisplay mode="duration" duration={3661} label="Total runtime" units={['weeks']} />
      );
      expect(container.firstChild).toBeNull();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid unit "weeks"')
      );
    });

    it('returns null when startTime is a non-13-digit number', () => {
      const { container } = render(
        <TimeDisplay mode="count-up" label="Elapsed" startTime={1700000000} />
      );
      expect(container.firstChild).toBeNull();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('13-digit millisecond Unix timestamp')
      );
    });

    it('returns null when startTime is an invalid date string', () => {
      const { container } = render(
        <TimeDisplay mode="count-up" label="Elapsed" startTime="not-a-date" />
      );
      expect(container.firstChild).toBeNull();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('could not be parsed as a valid date')
      );
    });

    it('returns null when endTime is an invalid date string', () => {
      const { container } = render(
        <TimeDisplay mode="count-down" label="Remaining" endTime="invalid" />
      );
      expect(container.firstChild).toBeNull();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('could not be parsed as a valid date')
      );
    });
  });

  describe('suspicious prop warnings', () => {
    let warnSpy;
    beforeEach(() => {
      warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });
    afterEach(() => warnSpy.mockRestore());

    it('warns when units are in wrong canonical order', () => {
      render(
        <TimeDisplay
          mode="duration"
          duration={3661}
          label="Total runtime"
          units={['hours', 'seconds', 'minutes']}
        />
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('out of canonical order')
      );
    });

    it('warns when units contain duplicates', () => {
      render(
        <TimeDisplay
          mode="duration"
          duration={3661}
          label="Total runtime"
          units={['hours', 'hours', 'minutes']}
        />
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('duplicate entries')
      );
    });

    it('warns when startTime is in the future for count-up', () => {
      const futureStart = new Date(Date.now() + 60000);
      render(
        <TimeDisplay mode="count-up" label="Elapsed" startTime={futureStart} />
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('startTime is in the future')
      );
    });

    it('warns when endTime is already in the past for count-down', () => {
      const pastEnd = new Date(Date.now() - 60000);
      render(
        <TimeDisplay mode="count-down" label="Remaining" endTime={pastEnd} />
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('endTime is in the past')
      );
    });

    it('warns when duration is a decimal', () => {
      render(
        <TimeDisplay mode="duration" duration={3661.7} label="Total runtime" />
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('will be truncated')
      );
    });

    it('warns when duration is unusually large', () => {
      render(
        <TimeDisplay mode="duration" duration={400000000} label="Total runtime" />
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('unusually large')
      );
    });

    it('warns when format is an unknown string', () => {
      render(
        // @ts-expect-error intentional invalid props
        <TimeDisplay mode="duration" duration={3661} label="Total runtime" format="table" />
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown format "table"')
      );
    });

    it('warns when announcementMode is an unknown string', () => {
      render(
        // @ts-expect-error intentional invalid props
        <TimeDisplay mode="duration" duration={3661} label="Total runtime" announcementMode="always" />
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown announcementMode "always"')
      );
    });

    it('warns when thresholds are used with non-count-down mode', () => {
      render(
        <TimeDisplay
          mode="duration"
          duration={3661}
          label="Total runtime"
          thresholds={[{ value: 60, label: '1 minute' }]}
        />
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('thresholds only apply to count-down mode')
      );
    });

    it('warns when thresholds contain duplicate values', () => {
      const pastEnd = new Date(Date.now() - 1000);
      render(
        <TimeDisplay
          mode="count-down"
          endTime={pastEnd}
          label="Remaining"
          thresholds={[
            { value: 10, label: 'Ten' },
            { value: 10, label: 'Ten again' },
          ]}
        />
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('duplicate value entries')
      );
    });

    it('warns when completeLabel is used with count-up mode', () => {
      render(
        <TimeDisplay
          mode="count-up"
          startTime={jobStart}
          label="Elapsed"
          completeLabel="Done"
        />
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('completeLabel has no effect in "count-up" mode')
      );
    });

    it('warns when onComplete is used with count-up mode', () => {
      render(
        <TimeDisplay
          mode="count-up"
          startTime={jobStart}
          label="Elapsed"
          onComplete={() => {}}
        />
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('onComplete has no effect in "count-up" mode')
      );
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
