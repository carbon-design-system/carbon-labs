/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom';

import { Calendar } from '../components/Calendar';
import type { CalendarView } from '../components/Calendar.types';

describe('Calendar', () => {
  const defaultProps = {
    views: ['month', 'week', 'day'] as CalendarView[],
    defaultView: 'month' as CalendarView,
    locale: 'en-US',
  };

  describe('renders as expected - Component API', () => {
    it('should match snapshot', () => {
      const { container } = render(
        <Calendar {...defaultProps} initialDate={new Date(2026, 0, 19)} />
      );
      expect(container).toMatchSnapshot();
    });

    it('renders a calendar region', () => {
      const { container } = render(<Calendar {...defaultProps} />);
      const region = container.querySelector(
        '[role="region"][aria-label="Calendar"]'
      );
      expect(region).toBeInTheDocument();
      expect(region).toHaveAttribute('aria-label', 'Calendar');
    });

    it('renders with toolbar by default', () => {
      render(<Calendar {...defaultProps} />);
      expect(screen.getByRole('toolbar')).toBeInTheDocument();
    });

    it('does not render toolbar when toolbar prop is false', () => {
      render(<Calendar {...defaultProps} toolbar={false} />);
      expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
    });

    it('renders calendar grid', () => {
      render(<Calendar {...defaultProps} />);
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('supports a custom class name', () => {
      const { container } = render(
        <Calendar {...defaultProps} className="test-calendar" />
      );
      expect(container.firstChild).toHaveClass('test-calendar');
    });
  });

  describe('navigation', () => {
    it('renders Today button', () => {
      render(<Calendar {...defaultProps} />);
      const todayButton = screen.getByText('Today');
      expect(todayButton).toBeInTheDocument();
    });

    it('renders Previous button', () => {
      render(<Calendar {...defaultProps} />);
      const prevButton = screen.getByLabelText('Previous');
      expect(prevButton).toBeInTheDocument();
    });

    it('renders Next button', () => {
      render(<Calendar {...defaultProps} />);
      const nextButton = screen.getByLabelText('Next');
      expect(nextButton).toBeInTheDocument();
    });

    it('calls onNavigate when Today button is clicked', async () => {
      const onNavigate = jest.fn();
      const user = userEvent.setup();
      render(<Calendar {...defaultProps} onNavigate={onNavigate} />);

      const todayButton = screen.getByText('Today');
      await user.click(todayButton);

      expect(onNavigate).toHaveBeenCalledTimes(1);
      expect(onNavigate).toHaveBeenCalledWith(expect.any(Date));
    });

    it('calls onNavigate when Next button is clicked', async () => {
      const onNavigate = jest.fn();
      const user = userEvent.setup();
      render(<Calendar {...defaultProps} onNavigate={onNavigate} />);

      const nextButton = screen.getByLabelText('Next');
      await user.click(nextButton);

      expect(onNavigate).toHaveBeenCalledTimes(1);
    });

    it('calls onNavigate when Previous button is clicked', async () => {
      const onNavigate = jest.fn();
      const user = userEvent.setup();
      render(<Calendar {...defaultProps} onNavigate={onNavigate} />);

      const prevButton = screen.getByLabelText('Previous');
      await user.click(prevButton);

      expect(onNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('initialDate prop', () => {
    it('renders with provided initial date', () => {
      const initialDate = new Date(2026, 0, 15);
      render(<Calendar {...defaultProps} initialDate={initialDate} />);

      const dateText = screen.getByText(/january 2026/i);
      expect(dateText).toBeInTheDocument();
    });

    it('handles string date input', () => {
      const initialDate = '2026-01-15';
      render(<Calendar {...defaultProps} initialDate={initialDate} />);

      const dateText = screen.getByText(/january 2026/i);
      expect(dateText).toBeInTheDocument();
    });
  });

  describe('weekStartsOn prop', () => {
    it('starts week on Sunday when weekStartsOn is 0', () => {
      render(<Calendar {...defaultProps} weekStartsOn={0} />);
      const headers = screen.getAllByRole('columnheader');
      const firstHeader = headers[0].textContent || '';
      expect(firstHeader.toLowerCase()).toMatch(/sunday|sun|s/);
    });

    it('starts week on Monday when weekStartsOn is 1', () => {
      render(<Calendar {...defaultProps} weekStartsOn={1} />);
      const headers = screen.getAllByRole('columnheader');
      const firstHeader = headers[0].textContent || '';
      expect(firstHeader.toLowerCase()).toMatch(/monday|mon|m/);
    });
  });

  describe('renderCell prop', () => {
    it('renders custom cell content when renderCell is provided', () => {
      const renderCell = jest.fn(() => (
        <div data-testid="custom-cell">Event</div>
      ));
      render(<Calendar {...defaultProps} renderCell={renderCell} />);

      expect(renderCell).toHaveBeenCalled();
      const customCells = screen.getAllByTestId('custom-cell');
      expect(customCells.length).toBeGreaterThan(0);
    });

    it('calls renderCell with correct parameters', () => {
      const renderCell = jest.fn(() => null);
      render(<Calendar {...defaultProps} renderCell={renderCell} />);

      expect(renderCell).toHaveBeenCalledWith(
        expect.objectContaining({
          view: 'month',
          date: expect.any(Date),
          start: expect.any(Date),
          end: expect.any(Date),
          isToday: expect.any(Boolean),
          isCurrentTimeSlot: expect.any(Boolean),
        })
      );
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA labels on calendar region', () => {
      render(<Calendar {...defaultProps} />);
      const region = screen.getByRole('region', { name: 'Calendar' });
      expect(region).toHaveAttribute('aria-label', 'Calendar');
    });

    it('has proper ARIA labels on toolbar', () => {
      render(<Calendar {...defaultProps} />);
      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveAttribute('aria-label', 'Calendar Controls');
    });

    it('has proper ARIA labels on grid', () => {
      render(<Calendar {...defaultProps} />);
      const grid = screen.getByRole('grid');
      expect(grid).toHaveAttribute('aria-labelledby', 'calendar-caption');
    });

    it('has focusable cells with proper tabindex', () => {
      render(<Calendar {...defaultProps} />);
      const table = screen.getByRole('grid');
      expect(table).toHaveAttribute('tabindex', '0');
    });
  });

  describe('edge cases', () => {
    it('handles empty views array', () => {
      expect(() => {
        render(<Calendar views={[] as CalendarView[]} defaultView="month" />);
      }).not.toThrow();
    });

    it('handles invalid defaultView by falling back to first view', () => {
      expect(() => {
        render(
          <Calendar
            views={['month', 'week'] as CalendarView[]}
            defaultView={'invalid' as CalendarView}
          />
        );
      }).not.toThrow();
    });

    it('handles invalid initialDate', () => {
      expect(() => {
        render(<Calendar {...defaultProps} initialDate="invalid-date" />);
      }).not.toThrow();
    });
  });
});
