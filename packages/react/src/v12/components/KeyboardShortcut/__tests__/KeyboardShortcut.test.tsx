/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { KeyboardShortcut } from '../components/KeyboardShortcut';
import {
  defaultTranslations,
  detectPlatform,
  resolveKey,
} from '../internal/keys';

/** What a sighted user sees: the key labels, hidden words excluded. */
function shownKeys(root: HTMLElement) {
  return Array.from(
    root.querySelectorAll(':scope > .cds--keyboard-shortcut__key')
  ).map((key) => key.textContent);
}

/** The accessible name a screen reader is given, in words. */
function spokenName(root: HTMLElement) {
  return root.querySelector('.cds--keyboard-shortcut__label')?.textContent;
}

function setPlatform(value: string) {
  Object.defineProperty(window.navigator, 'platform', {
    value,
    configurable: true,
  });
}

describe('KeyboardShortcut', () => {
  const originalPlatform = window.navigator.platform;
  afterEach(() => setPlatform(originalPlatform));

  describe('mapping per platform', () => {
    it('renders mod as ⌘ on macOS, written together', () => {
      const { container } = render(
        <KeyboardShortcut keys={['mod', 'k']} platform="mac" />
      );
      const root = container.firstElementChild as HTMLElement;
      expect(shownKeys(root)).toEqual(['⌘', 'K']);
      expect(spokenName(root)).toBe('Command K');
    });

    it('renders mod as Ctrl elsewhere', () => {
      const { container } = render(
        <KeyboardShortcut keys={['mod', 'shift', 'p']} platform="other" />
      );
      const root = container.firstElementChild as HTMLElement;
      expect(shownKeys(root)).toEqual(['Ctrl', 'Shift', 'P']);
      expect(spokenName(root)).toBe('Control Shift P');
    });

    it.each([
      ['ctrl', '⌃', 'Control', 'Ctrl', 'Control'],
      ['Alt', '⌥', 'Option', 'Alt', 'Alt'],
      ['option', '⌥', 'Option', 'Alt', 'Alt'],
      ['shift', '⇧', 'Shift', 'Shift', 'Shift'],
      ['cmd', '⌘', 'Command', 'Meta', 'Meta'],
      ['enter', '↵', 'Return', 'Enter', 'Enter'],
      ['backspace', '⌫', 'Delete', 'Backspace', 'Backspace'],
      ['delete', '⌦', 'Forward Delete', 'Delete', 'Delete'],
      ['esc', '⎋', 'Escape', 'Esc', 'Escape'],
      ['tab', '⇥', 'Tab', 'Tab', 'Tab'],
      ['space', 'Space', 'Space', 'Space', 'Space'],
      ['ArrowLeft', '←', 'Left Arrow', 'Left', 'Left Arrow'],
      ['right', '→', 'Right Arrow', 'Right', 'Right Arrow'],
      ['up', '↑', 'Up Arrow', 'Up', 'Up Arrow'],
      ['pagedown', '⇟', 'Page Down', 'PgDn', 'Page Down'],
      ['f5', 'F5', 'F5', 'F5', 'F5'],
      [',', ',', 'Comma', ',', 'Comma'],
      ['/', '/', 'Slash', '/', 'Slash'],
    ])(
      '%s: mac %s (%s), other %s (%s)',
      (token, macLabel, macName, label, name) => {
        expect(resolveKey(token, 'mac')).toEqual({
          label: macLabel,
          name: macName,
        });
        expect(resolveKey(token, 'other')).toEqual({ label, name });
      }
    );

    it('renders an unknown key as written and upper-cases one letter', () => {
      expect(resolveKey('PrintScreen', 'other')).toEqual({
        label: 'PrintScreen',
        name: 'PrintScreen',
      });
      expect(resolveKey('q', 'mac')).toEqual({ label: 'Q', name: 'Q' });
    });

    it.each([
      ['MacIntel', 'mac'],
      ['iPhone', 'mac'],
      ['Win32', 'other'],
      ['Linux x86_64', 'other'],
    ])('detects %s as %s', (value, expected) => {
      expect(detectPlatform({ platform: value } as Navigator)).toBe(expected);
    });

    it('prefers userAgentData over navigator.platform', () => {
      const nav = {
        platform: 'Win32',
        userAgentData: { platform: 'macOS' },
      } as unknown as Navigator;
      expect(detectPlatform(nav)).toBe('mac');
    });

    it('detects the platform on the first client render', () => {
      setPlatform('MacIntel');
      const { container } = render(<KeyboardShortcut keys={['mod', 'K']} />);
      expect(shownKeys(container.firstElementChild as HTMLElement)).toEqual([
        '⌘',
        'K',
      ]);
    });

    it('lets platform override detection', () => {
      setPlatform('MacIntel');
      const { container } = render(
        <KeyboardShortcut keys={['mod', 'K']} platform="other" />
      );
      expect(shownKeys(container.firstElementChild as HTMLElement)).toEqual([
        'Ctrl',
        'K',
      ]);
    });
  });

  describe('server rendering', () => {
    it('renders the non-mac words on the server and settles after hydration', async () => {
      setPlatform('MacIntel');
      const html = renderToString(<KeyboardShortcut keys={['mod', 'K']} />);
      // The server snapshot, whatever the client's platform.
      expect(html).toContain('Ctrl');
      expect(html).not.toContain('⌘');

      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);
      const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
      await act(async () => {
        hydrateRoot(container, <KeyboardShortcut keys={['mod', 'K']} />);
      });
      // No hydration mismatch was reported…
      expect(errors).not.toHaveBeenCalled();
      errors.mockRestore();
      // …and the client's platform took over straight after.
      expect(shownKeys(container.firstElementChild as HTMLElement)).toEqual([
        '⌘',
        'K',
      ]);
      container.remove();
    });

    it('renders an explicit platform on the server', () => {
      const html = renderToString(
        <KeyboardShortcut keys={['mod', 'K']} platform="mac" />
      );
      expect(html).toContain('⌘');
    });
  });

  describe('accessibility', () => {
    it('nests one <kbd> per key inside an outer <kbd>', () => {
      const { container } = render(
        <KeyboardShortcut keys={['mod', 'shift', 'P']} platform="other" />
      );
      const root = container.firstElementChild as HTMLElement;
      expect(root.tagName).toBe('KBD');
      const inner = root.querySelectorAll(':scope > kbd');
      expect(inner).toHaveLength(3);
      inner.forEach((key) =>
        expect(key).toHaveAttribute('aria-hidden', 'true')
      );
    });

    it('names the whole shortcut in words with text, not aria-label', () => {
      const { container } = render(
        <KeyboardShortcut keys={['mod', 'K']} platform="mac" />
      );
      const root = container.firstElementChild as HTMLElement;
      expect(root).not.toHaveAttribute('aria-label');
      // The words are the only text assistive technology is not told to skip.
      expect(screen.getByText('Command K')).toBe(
        root.querySelector('.cds--keyboard-shortcut__label')
      );
    });

    it('becomes part of a parent name from content', () => {
      render(
        <button type="button">
          Search <KeyboardShortcut keys={['mod', 'K']} platform="mac" />
        </button>
      );
      expect(
        screen.getByRole('button', { name: 'Search Command K' })
      ).toBeInTheDocument();
    });

    it('translates the spoken names', () => {
      const { container } = render(
        <KeyboardShortcut
          keys={['mod', 'shift', 'K']}
          platform="other"
          translateWithId={(id) =>
            ({ control: 'Steuerung', shift: 'Umschalt' })[id as string] ??
            defaultTranslations[id]
          }
        />
      );
      expect(spokenName(container.firstElementChild as HTMLElement)).toBe(
        'Steuerung Umschalt K'
      );
    });
  });

  describe('kind', () => {
    it('is keycap by default', () => {
      const { container } = render(<KeyboardShortcut keys={['K']} />);
      expect(container.firstElementChild).toHaveClass(
        'cds--keyboard-shortcut',
        'cds--keyboard-shortcut--keycap'
      );
      expect(
        container.querySelector('.cds--keyboard-shortcut__separator')
      ).toBeNull();
    });

    it('plain joins keys with + off macOS', () => {
      const { container } = render(
        <KeyboardShortcut keys={['mod', 'K']} kind="plain" platform="other" />
      );
      const root = container.firstElementChild as HTMLElement;
      expect(root).toHaveClass('cds--keyboard-shortcut--plain');
      const separators = root.querySelectorAll(
        '.cds--keyboard-shortcut__separator'
      );
      expect(separators).toHaveLength(1);
      expect(separators[0]).toHaveAttribute('aria-hidden', 'true');
      // What a sighted user reads, in DOM order, without the hidden words.
      const visible = Array.from(root.children)
        .filter((child) => child.getAttribute('aria-hidden') === 'true')
        .map((child) => child.textContent)
        .join('');
      expect(visible).toBe('Ctrl+K');
    });

    it('plain writes keys together on macOS', () => {
      const { container } = render(
        <KeyboardShortcut keys={['mod', 'K']} kind="plain" platform="mac" />
      );
      expect(
        container.querySelector('.cds--keyboard-shortcut__separator')
      ).toBeNull();
    });
  });

  describe('props', () => {
    it('forwards a ref to the outer <kbd>', () => {
      const ref = React.createRef<HTMLElement>();
      render(<KeyboardShortcut ref={ref} keys={['K']} />);
      expect(ref.current?.tagName).toBe('KBD');
    });

    it('spreads className and other props onto the outer <kbd>', () => {
      render(
        <KeyboardShortcut keys={['K']} className="custom" data-testid="root" />
      );
      expect(screen.getByTestId('root')).toHaveClass('custom');
    });

    it('never listens for the keys it shows', () => {
      const add = jest.spyOn(document, 'addEventListener');
      const addWindow = jest.spyOn(window, 'addEventListener');
      render(<KeyboardShortcut keys={['mod', 'K']} />);
      const keyListeners = [...add.mock.calls, ...addWindow.mock.calls].filter(
        ([type]) => String(type).startsWith('key')
      );
      expect(keyListeners).toHaveLength(0);
      add.mockRestore();
      addWindow.mockRestore();
    });

    it('warns when keys is missing or not strings', () => {
      const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
      // @ts-expect-error -- keys is required
      render(<KeyboardShortcut />);
      // @ts-expect-error -- keys are strings
      render(<KeyboardShortcut keys={[1]} />);
      const messages = errors.mock.calls.map((call) => call.join(' '));
      expect(
        messages.some((m) => /required.*keys|keys.*required/i.test(m))
      ).toBe(true);
      expect(messages.some((m) => /Invalid prop `keys\[0\]`/.test(m))).toBe(
        true
      );
      errors.mockRestore();
    });

    it('warns on an unknown kind or platform', () => {
      const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
      // @ts-expect-error -- not a kind
      render(<KeyboardShortcut keys={['K']} kind="pill" />);
      // @ts-expect-error -- not a platform
      render(<KeyboardShortcut keys={['K']} platform="windows" />);
      const messages = errors.mock.calls.map((call) => call.join(' '));
      expect(messages.some((m) => /Invalid prop `kind`/.test(m))).toBe(true);
      expect(messages.some((m) => /Invalid prop `platform`/.test(m))).toBe(
        true
      );
      errors.mockRestore();
    });
  });
});
