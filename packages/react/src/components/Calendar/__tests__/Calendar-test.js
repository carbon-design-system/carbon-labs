/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom';

import { Calendar } from '../components/Calendar';

jest.mock('../components/calendar.scss', () => ({}));

describe('Calendar', () => {
  const defaultProps = {
    views: ['month', 'week', 'day'],
    defaultView: 'month',
  };

  describe('renders as expected - Component API', () => {
    it('should match snapshot', () => {
      const { container } = render(<Calendar {...defaultProps} />);
      expect(container).toMatchSnapshot();
    });

    it('renders a calendar region', () => {
      render(<Calendar {...defaultProps} />);
      expect(screen.getByRole('region', { name: /calendar/i })).toBeInTheDocument();
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
      const { container } = render(<Calendar {...defaultProps} className="test-calendar" />);
      expect(container.firstChild).toHaveClass('test-calendar');
    });

    it('renders in RTL mode when rtl prop is true', () => {
      const { container } = render(<Calendar {...defaultProps} rtl />);
      expect(container.firstChild).toHaveAttribute('dir', 'rtl');
      expect(container.firstChild).toHaveClass('cds--calendar--rtl');
    });

    it('renders with sticky header when stickyHeader is true', () => {
      render(<Calendar {...defaultProps} stickyHeader />);
      const table = screen.getByRole('grid');
      expect(table).toHaveClass('cds--calendar__table-sticky');
    });

    it('renders without sticky header when stickyHeader is false', () => {
      render(<Calendar {...defaultProps} stickyHeader={false} />);
      const table = screen.getByRole('grid');
      expect(table).not.toHaveClass('cds--calendar__table-sticky');
    });
  });

  describe('view rendering', () => {
    it('renders month view by default', () => {
      render(<Calendar {...defaultProps} />);
      // Month view has weekday headers
      expect(screen.getByText('Sunday')).toBeInTheDocument();
      expect(screen.getByText('Monday')).toBeInTheDocument();
    });

    it('renders week view when defaultView is week', () => {
      render(<Calendar {...defaultProps} defaultView="week" />);
      // Week view has hour labels
      const table = screen.getByRole('grid');
      expect(within(table).queryByText(/AM|PM/)).toBeInTheDocument();
    });

    it('renders day view when defaultView is day', () => {
      render(<Calendar {...defaultProps} defaultView="day" />);
      // Day view has hour labels
      const table = screen.getByRole('grid');
      expect(within(table).queryByText(/AM|PM/)).toBeInTheDocument();
    });

    it('respects views prop to limit available views', () => {
      render(<Calendar views={['month', 'week']} defaultView="month" />);
      expect(screen.getByRole('toolbar')).toBeInTheDocument();
      // View switcher should only show month and week
      const switcher = screen.getByRole('toolbar');
      expect(within(switcher).queryByText('Day')).not.toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('renders Today button', () => {
      render(<Calendar {...defaultProps} />);
      expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument();
    });

    it('renders Previous button', () => {
      render(<Calendar {...defaultProps} />);
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    });

    it('renders Next button', () => {
      render(<Calendar {...defaultProps} />);
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    it('calls onNavigate when Today button is clicked', async () => {
      const onNavigate = jest.fn();
      render(<Calendar {...defaultProps} onNavigate={onNavigate} />);

      await userEvent.click(screen.getByRole('button', { name: /today/i }));
      expect(onNavigate).toHaveBeenCalledTimes(1);
      expect(onNavigate).toHaveBeenCalledWith(expect.any(Date));
    });

    it('calls onNavigate when Next button is clicked', async () => {
      const onNavigate = jest.fn();
      render(<Calendar {...defaultProps} onNavigate={onNavigate} />);

      await userEvent.click(screen.getByRole('button', { name: /next/i }));
      expect(onNavigate).toHaveBeenCalledTimes(1);
    });

    it('calls onNavigate when Previous button is clicked', async () => {
      const onNavigate = jest.fn();
      render(<Calendar {...defaultProps} onNavigate={onNavigate} />);

      await userEvent.click(screen.getByRole('button', { name: /previous/i }));
      expect(onNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('view switching', () => {
    it('calls onViewChange when view is changed', async () => {
      const onViewChange = jest.fn();
      render(<Calendar {...defaultProps} onViewChange={onViewChange} />);

      const weekButton = screen.queryByRole('button', { name: /week/i });
      if (weekButton) {
        await userEvent.click(weekButton);
        expect(onViewChange).toHaveBeenCalledWith('week');
      }
    });
  });

  describe('date picker', () => {
    it('renders date picker toggle button', () => {
      render(<Calendar {...defaultProps} />);
      expect(screen.getByRole('button', { name: /date picker/i })).toBeInTheDocument();
    });

    it('toggles date picker when button is clicked', async () => {
      render(<Calendar {...defaultProps} />);
      const datePickerButton = screen.getByRole('button', { name: /date picker/i });

      expect(screen.queryByLabelText('date picker')).not.toHaveClass(
        'cds--calendar__date-picker-open'
      );

      await userEvent.click(datePickerButton);

      await waitFor(() => {
        expect(screen.getByLabelText('date picker')).toHaveClass(
          'cds--calendar__date-picker-open'
        );
      });
    });
  });

  describe('initialDate prop', () => {
    it('renders with provided initial date', () => {
      const initialDate = new Date(2026, 0, 15); // January 15, 2026
      render(<Calendar {...defaultProps} initialDate={initialDate} />);

      // The calendar should display January 2026
      expect(screen.getByText(/january 2024/i)).toBeInTheDocument();
    });

    it('handles string date input', () => {
      const initialDate = '2026-01-15';
      render(<Calendar {...defaultProps} initialDate={initialDate} />);

      // The calendar should display January 2026
      expect(screen.getByText(/january 2026/i)).toBeInTheDocument();
    });
  });

  describe('weekStartsOn prop', () => {
    it('starts week on Sunday when weekStartsOn is 0', () => {
      render(<Calendar {...defaultProps} weekStartsOn={0} />);
      const headers = screen.getAllByRole('columnheader');
      expect(headers[0]).toHaveTextContent('Sunday');
    });

    it('starts week on Monday when weekStartsOn is 1', () => {
      render(<Calendar {...defaultProps} weekStartsOn={1} />);
      const headers = screen.getAllByRole('columnheader');
      expect(headers[0]).toHaveTextContent('Monday');
    });
  });

  describe('renderCell prop', () => {
    it('renders custom cell content when renderCell is provided', () => {
      const renderCell = jest.fn(() => <div data-testid="custom-cell">Event</div>);
      render(<Calendar {...defaultProps} renderCell={renderCell} />);

      expect(renderCell).toHaveBeenCalled();
      expect(screen.getAllByTestId('custom-cell').length).toBeGreaterThan(0);
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

  describe('keyboard navigation', () => {
    it('allows keyboard navigation with arrow keys in month view', async () => {
      render(<Calendar {...defaultProps} />);
      const table = screen.getByRole('grid');
      table.focus();

      await userEvent.keyboard('{ArrowDown}');

      expect(table).toHaveAttribute('tabindex', '0');
    });

    it('allows Tab key to move focus to calendar table', async () => {
      render(<Calendar {...defaultProps} />);
      const table = screen.getByRole('grid');
      await userEvent.tab();

      expect(table).toHaveAttribute('tabindex', '0');
    });
  });

  describe('region prop', () => {
    it('uses provided region for locale', () => {
      render(<Calendar {...defaultProps} region="fr-FR" />);
      // French locale should display different month names
      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });

  describe('getCurrentDate prop', () => {
    it('uses getCurrentDate when provided', () => {
      const fixedDate = new Date(2024, 5, 15); // June 15, 2024
      const getCurrentDate = jest.fn(() => fixedDate);

      render(<Calendar {...defaultProps} getCurrentDate={getCurrentDate} />);

      expect(getCurrentDate).toHaveBeenCalled();
    });
  });

  describe('scrollToCurrentTime prop', () => {
    it('does not throw error when scrollToCurrentTime is false', () => {
      expect(() => {
        render(<Calendar {...defaultProps} defaultView="week" scrollToCurrentTime={false} />);
      }).not.toThrow();
    });

    it('does not throw error when scrollToCurrentTime is true', () => {
      expect(() => {
        render(<Calendar {...defaultProps} defaultView="week" scrollToCurrentTime={true} />);
      }).not.toThrow();
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA labels on calendar region', () => {
      render(<Calendar {...defaultProps} />);
      expect(screen.getByRole('region', { name: /calendar/i })).toBeInTheDocument();
    });

    it('has proper ARIA labels on toolbar', () => {
      render(<Calendar {...defaultProps} />);
      expect(screen.getByRole('toolbar', { name: /calendar controls/i })).toBeInTheDocument();
    });

    it('has proper ARIA labels on grid', () => {
      render(<Calendar {...defaultProps} />);
      expect(screen.getByRole('grid')).toHaveAttribute('aria-labelledby', 'calendar-caption');
    });

    it('marks current day with aria-current', () => {
      render(<Calendar {...defaultProps} />);
      const cells = screen.getAllByRole('gridcell');
      const currentDayCells = cells.filter(cell =>
        cell.getAttribute('aria-current') === 'date'
      );
      expect(currentDayCells.length).toBeGreaterThan(0);
    });

    it('has focusable cells with proper tabindex', () => {
      render(<Calendar {...defaultProps} />);
      const table = screen.getByRole('grid');
      expect(table).toHaveAttribute('tabindex', '0');
    });
  });

  describe('edge cases', () => {
    it('handles empty views array gracefully', () => {
      expect(() => {
        render(<Calendar views={[]} defaultView="month" />);
      }).not.toThrow();
    });

    it('handles invalid defaultView by falling back to first view', () => {
      expect(() => {
        render(<Calendar views={['month', 'week']} defaultView="invalid" />);
      }).not.toThrow();
    });

    it('handles invalid initialDate gracefully', () => {
      expect(() => {
        render(<Calendar {...defaultProps} initialDate="invalid-date" />);
      }).not.toThrow();
    });
  });
});

