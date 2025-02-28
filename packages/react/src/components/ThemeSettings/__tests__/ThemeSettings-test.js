/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom';

import { ThemeSettings } from '../components/ThemeSettings';
import {
  ThemeMenuComplement,
  ThemeSetDropdown,
  ThemeSwitcher,
} from '../components';

jest.mock('./button.scss', () => ({}));
describe('ThemeSettings', () => {
  describe('renders as expected - Component API', () => {
    it('should match snapshot', () => {
      const { container } = render(
        <ThemeSettings>
          <ThemeSwitcher></ThemeSwitcher>
          <ThemeSetDropdown
            id="theme-dropdown"
            label="Theme set"
            titleText="Theme set"
            value="g10/g100"
          />
          <ThemeMenuComplement
            id="theme-menu-complement"
            labelText="Complement menu theme"
            checked={false}
          />
        </ThemeSettings>
      );
      expect(container).toMatchSnapshot();
    });

    it('should render a content switcher', () => {
      render(
        <ThemeSettings>
          <ThemeSwitcher></ThemeSwitcher>
        </ThemeSettings>
      );

      expect(screen.getAllByRole('tab')).toHaveLength(3);
    });

    it('should render a one theme set dropdown', () => {
      render(
        <ThemeSettings>
          <ThemeSetDropdown
            id="theme-dropdown"
            label="Theme set"
            titleText="Theme set"
            value="g10/g100"
          />
        </ThemeSettings>
      );

      expect(screen.getByRole('combobox'));
    });

    it('should render a one theme complement checkbox', () => {
      render(
        <ThemeSettings>
          <ThemeMenuComplement
            id="theme-menu-complement"
            labelText="Complement menu theme"
            checked={false}
          />
        </ThemeSettings>
      );

      expect(screen.getByRole('checkbox'));
    });
  });

  describe('behaves as expected', () => {
    it('should change theme setting', async () => {
      const onChange = jest.fn();

      render(
        <ThemeSettings>
          <ThemeSwitcher onChange={onChange} value="system"></ThemeSwitcher>
        </ThemeSettings>
      );

      const tabs = screen.getAllByRole('tab');
      await userEvent.click(tabs[0]);

      expect(onChange).toHaveBeenCalled();
      expect(onChange).toHaveBeenLastCalledWith('light');

      await userEvent.click(tabs[2]);
      expect(onChange).toHaveBeenLastCalledWith('dark');

      await userEvent.click(tabs[1]);
      expect(onChange).toHaveBeenLastCalledWith('system');
    });

    it('should change theme set dropdown', async () => {
      window.HTMLElement.prototype.scrollIntoView = function () {};

      const onChange = jest.fn();

      const { rerender } = render(
        <ThemeSettings>
          <ThemeSetDropdown
            id="theme-dropdown"
            label="Theme set"
            titleText="Theme set"
            value="g10/g100"
            onChange={onChange}
          />
        </ThemeSettings>
      );

      const combo = screen.getByRole('combobox');
      await userEvent.click(combo);
      await userEvent.click(screen.getByText('White / G90'));
      expect(onChange).toHaveBeenCalled();
      expect(onChange).toHaveBeenLastCalledWith('white/g90');

      await userEvent.click(combo);
      await userEvent.click(screen.getByText('White / G100'));
      expect(onChange).toHaveBeenCalled();
      expect(onChange).toHaveBeenLastCalledWith('white/g100');

      await userEvent.click(combo);
      await userEvent.click(screen.getByText('G10 / G90'));
      expect(onChange).toHaveBeenCalled();
      expect(onChange).toHaveBeenLastCalledWith('g10/g90');

      rerender(
        <ThemeSettings>
          <ThemeSetDropdown
            id="theme-dropdown"
            label="Theme set"
            titleText="Theme set"
            value="white/g100"
            onChange={onChange}
          />
        </ThemeSettings>
      );
      await userEvent.click(combo);
      await userEvent.click(screen.getByText('G10 / G100'));
      expect(onChange).toHaveBeenCalled();
      expect(onChange).toHaveBeenLastCalledWith('g10/g100');
    });

    it('should should change menu complement', async () => {
      const onChange = jest.fn();

      const { rerender } = render(
        <ThemeSettings>
          <ThemeMenuComplement
            id="theme-menu-complement"
            labelText="Complement menu theme"
            checked={false}
            onChange={onChange}
          />
        </ThemeSettings>
      );

      const check = screen.getByRole('checkbox');
      await userEvent.click(check);
      expect(onChange).toHaveBeenCalled();
      expect(onChange).toHaveBeenLastCalledWith(true);

      rerender(
        <ThemeSettings>
          <ThemeMenuComplement
            id="theme-menu-complement"
            labelText="Complement menu theme"
            checked={true}
            onChange={onChange}
          />
        </ThemeSettings>
      );

      await userEvent.click(check);
      expect(onChange).toHaveBeenLastCalledWith(false);
    });
  });
});
