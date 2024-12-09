import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom';

import { ExampleButton } from '../components/ExampleButton';
jest.mock('./button.scss', () => ({}));
describe('ExampleButton', () => {
  describe('renders as expected - Component API', () => {
    it('should match snapshot', () => {
      const { container } = render(<ExampleButton />);
      expect(container).toMatchSnapshot();
    });

    it('renders a button element', () => {
      render(<ExampleButton />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with default text "Button"', () => {
      render(<ExampleButton />);
      expect(screen.getByRole('button')).toHaveTextContent(/^Button$/);
    });

    it('supports a custom class name', () => {
      const { container } = render(<ExampleButton className="test" />);
      expect(container.firstChild).toHaveClass('test');
    });

    it('supports additional props', () => {
      render(<ExampleButton data-testid="test-button" />);
      expect(screen.getByRole('button')).toHaveAttribute(
        'data-testid',
        'test-button'
      );
    });

    it('supports disabled state', () => {
      render(<ExampleButton disabled />);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('behaves as expected', () => {
    it('calls onClick handler when clicked', async () => {
      const onClick = jest.fn();
      render(<ExampleButton onClick={onClick} />);

      expect(onClick).toHaveBeenCalledTimes(0);
      await userEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
