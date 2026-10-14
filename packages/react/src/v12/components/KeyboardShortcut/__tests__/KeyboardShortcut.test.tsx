/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { act, render, renderHook, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { KeyboardShortcut } from '../components/KeyboardShortcut';
import {
  defaultTranslateWithId,
  detectPlatform,
  resolveKey,
  translationIds,
  type KeyboardShortcutTranslationKey,
} from '../internal/keys';
import { useSyncExternalStoreFallback } from '../internal/usePlatform';

/** What a sighted user reads, in DOM order, without the hidden words. */
function visible(root: Element) {
  return Array.from(root.children)
    .filter((child) => child.getAttribute('aria-hidden') === 'true')
    .map((child) => child.textContent)
    .join('');
}

/** The key labels, one per inner <kbd>. */
function shownKeys(root: Element) {
  return Array.from(root.querySelectorAll(':scope > kbd')).map(
    (key) => key.textContent
  );
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
      expect(shownKeys(container.firstElementChild as Element)).toEqual([
        '⌘',
        'K',
      ]);
    });

    it('renders mod as Ctrl elsewhere', () => {
      const { container } = render(
        <KeyboardShortcut keys={['mod', 'shift', 'p']} platform="other" />
      );
      expect(shownKeys(container.firstElementChild as Element)).toEqual([
        'Ctrl',
        'Shift',
        'P',
      ]);
    });

    it.each([
      ['ctrl', '⌃', 'Control', 'Ctrl', 'Control'],
      ['Alt', '⌥', 'Option', 'Alt', 'Alt'],
      ['option', '⌥', 'Option', 'Alt', 'Alt'],
      ['shift', '⇧', 'Shift', 'Shift', 'Shift'],
      ['cmd', '⌘', 'Command', 'Win', 'Windows'],
      ['meta', '⌘', 'Command', 'Win', 'Windows'],
      ['enter', '↩', 'Return', 'Enter', 'Enter'],
      ['backspace', '⌫', 'Delete', 'Backspace', 'Backspace'],
      ['delete', '⌦', 'Forward delete', 'Del', 'Delete'],
      ['remove', '⌫', 'Delete', 'Del', 'Delete'],
      ['esc', '⎋', 'Escape', 'Esc', 'Escape'],
      ['tab', '⇥', 'Tab', 'Tab', 'Tab'],
      ['space', 'Space', 'Space', 'Space', 'Space'],
      ['ArrowLeft', '←', 'Left arrow', 'Left', 'Left arrow'],
      ['right', '→', 'Right arrow', 'Right', 'Right arrow'],
      ['up', '↑', 'Up arrow', 'Up', 'Up arrow'],
      ['pagedown', '⇟', 'Page down', 'PgDn', 'Page down'],
      ['f5', 'F5', 'F5', 'F5', 'F5'],
      [',', ',', 'Comma', ',', 'Comma'],
      ['/', '/', 'Slash', '/', 'Slash'],
      ['+', '+', 'Plus', '+', 'Plus'],
    ])(
      '%s: mac %s (%s), other %s (%s)',
      (token, macLabel, macName, label, name) => {
        expect(resolveKey(token, 'mac')).toMatchObject({
          label: macLabel,
          name: macName,
        });
        expect(resolveKey(token, 'other')).toMatchObject({ label, name });
      }
    );

    it('renders an unknown key as written and upper-cases one letter', () => {
      expect(resolveKey('PrintScreen', 'other')).toMatchObject({
        label: 'PrintScreen',
        name: 'PrintScreen',
      });
      expect(resolveKey('q', 'mac')).toMatchObject({ label: 'Q', name: 'Q' });
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
      expect(shownKeys(container.firstElementChild as Element)).toEqual([
        '⌘',
        'K',
      ]);
    });

    it('lets platform override detection', () => {
      setPlatform('MacIntel');
      const { container } = render(
        <KeyboardShortcut keys={['mod', 'K']} platform="other" />
      );
      expect(shownKeys(container.firstElementChild as Element)).toEqual([
        'Ctrl',
        'K',
      ]);
    });
  });

  describe('modifier order', () => {
    it.each([
      [['mod', 'shift', 'P']],
      [['shift', 'mod', 'P']],
      [['P', 'shift', 'mod']],
    ])('%j renders ⇧⌘P on macOS and Ctrl+Shift+P elsewhere', (keys) => {
      const mac = render(
        <KeyboardShortcut keys={keys} kind="plain" platform="mac" />
      );
      expect(visible(mac.container.firstElementChild as Element)).toBe('⇧⌘P');
      expect(screen.getByText('Shift Command P')).toBeInTheDocument();
      mac.unmount();
      const other = render(
        <KeyboardShortcut keys={keys} kind="plain" platform="other" />
      );
      expect(visible(other.container.firstElementChild as Element)).toBe(
        'Ctrl+Shift+P'
      );
      expect(screen.getByText('Control Shift P')).toBeInTheDocument();
      other.unmount();
    });

    it('orders all four modifiers ⌃⌥⇧⌘ and Ctrl+Alt+Shift+Win', () => {
      const keys = ['meta', 'shift', 'alt', 'ctrl', 'K'];
      expect(
        visible(
          render(<KeyboardShortcut keys={keys} kind="plain" platform="mac" />)
            .container.firstElementChild as Element
        )
      ).toBe('⌃⌥⇧⌘K');
      expect(
        visible(
          render(<KeyboardShortcut keys={keys} kind="plain" platform="other" />)
            .container.firstElementChild as Element
        )
      ).toBe('Ctrl+Alt+Shift+Win+K');
    });

    it('keeps non-modifier keys in the order written', () => {
      const { container } = render(
        <KeyboardShortcut keys={['K', 'shift', 'J']} platform="other" />
      );
      expect(shownKeys(container.firstElementChild as Element)).toEqual([
        'Shift',
        'K',
        'J',
      ]);
    });
  });

  describe('server rendering', () => {
    it('renders the non-mac words on the server and settles after hydration', async () => {
      setPlatform('MacIntel');
      const html = renderToString(<KeyboardShortcut keys={['mod', 'K']} />);
      expect(html).toContain('Ctrl');
      expect(html).not.toContain('⌘');

      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);
      const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
      await act(async () => {
        hydrateRoot(container, <KeyboardShortcut keys={['mod', 'K']} />);
      });
      expect(errors).not.toHaveBeenCalled();
      errors.mockRestore();
      expect(shownKeys(container.firstElementChild as Element)).toEqual([
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

  describe('the React 16/17 fallback', () => {
    it('starts at the server value and settles to the client value', () => {
      const values: string[] = [];
      const { result } = renderHook(() => {
        const value = useSyncExternalStoreFallback(
          () => () => {},
          () => 'mac',
          () => 'other'
        );
        values.push(value);
        return value;
      });
      expect(values[0]).toBe('other');
      expect(result.current).toBe('mac');
    });
  });

  describe('accessibility', () => {
    it('nests one <kbd> per key inside an outer <kbd>', () => {
      const { container } = render(
        <KeyboardShortcut keys={['mod', 'shift', 'P']} platform="other" />
      );
      const root = container.firstElementChild as Element;
      expect(root.tagName).toBe('KBD');
      const inner = root.querySelectorAll(':scope > kbd');
      expect(inner).toHaveLength(3);
      inner.forEach((key) =>
        expect(key).toHaveAttribute('aria-hidden', 'true')
      );
      expect(root).not.toHaveAttribute('aria-label');
    });

    it.each([
      ['mac', 'Search Shift Command P'],
      ['other', 'Search Control Shift P'],
    ] as const)(
      'computes the accessible name in words on %s',
      (platform, name) => {
        render(
          <button type="button">
            Search{' '}
            <KeyboardShortcut
              keys={['mod', 'shift', 'P']}
              platform={platform}
            />
          </button>
        );
        // getByRole's name is the computed accessible name (accname 1.2),
        // which leaves out the aria-hidden glyphs.
        expect(screen.getByRole('button', { name })).toBeInTheDocument();
      }
    );

    it('keeps key order in a right-to-left page', () => {
      const { container } = render(
        <div dir="rtl">
          <KeyboardShortcut keys={['shift', 'mod', 'P']} platform="mac" />
        </div>
      );
      const root = container.querySelector(
        'kbd.cds--keyboard-shortcut'
      ) as Element;
      // The DOM order is the platform order; the stylesheet isolates the
      // combination as left to right (measured in the browser).
      expect(shownKeys(root)).toEqual(['⇧', '⌘', 'P']);
      expect(screen.getByText('Shift Command P')).toBeInTheDocument();
    });
  });

  describe('translateWithId', () => {
    const german: Partial<Record<KeyboardShortcutTranslationKey, string>> = {
      'carbon.keyboard-shortcut.control.label': 'Strg',
      'carbon.keyboard-shortcut.control.name': 'Steuerung',
      'carbon.keyboard-shortcut.shift.label': 'Umschalt',
      'carbon.keyboard-shortcut.shift.name': 'Umschalttaste',
    };

    it('translates visible labels and spoken names separately', () => {
      const { container } = render(
        <KeyboardShortcut
          keys={['mod', 'shift', 'K']}
          kind="plain"
          platform="other"
          translateWithId={(id, args) =>
            german[id] ?? defaultTranslateWithId(id, args)
          }
        />
      );
      expect(visible(container.firstElementChild as Element)).toBe(
        'Strg+Umschalt+K'
      );
      expect(screen.getByText('Steuerung Umschalttaste K')).toBeInTheDocument();
    });

    it('is called with the platform and a namespaced id for label and name', () => {
      const translate = jest.fn(
        (id: KeyboardShortcutTranslationKey, args?: { platform: string }) =>
          `${id}@${args?.platform}`
      );
      render(
        <KeyboardShortcut
          keys={['mod']}
          platform="mac"
          translateWithId={translate}
        />
      );
      expect(translate).toHaveBeenCalledWith(
        'carbon.keyboard-shortcut.meta.label',
        { platform: 'mac' }
      );
      expect(translate).toHaveBeenCalledWith(
        'carbon.keyboard-shortcut.meta.name',
        { platform: 'mac' }
      );
    });

    it('lists a label and a name id for every key', () => {
      expect(translationIds).toContain(
        'carbon.keyboard-shortcut.backspace.name'
      );
      expect(
        translationIds.every((id) =>
          /^carbon\.keyboard-shortcut\.[a-z-]+\.(label|name)$/.test(id)
        )
      ).toBe(true);
      expect(
        defaultTranslateWithId('carbon.keyboard-shortcut.backspace.name', {
          platform: 'mac',
        })
      ).toBe('Delete');
      expect(
        defaultTranslateWithId('carbon.keyboard-shortcut.backspace.name', {
          platform: 'other',
        })
      ).toBe('Backspace');
    });
  });

  describe('kind', () => {
    it('is keycap by default, with no separator', () => {
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
      const root = container.firstElementChild as Element;
      expect(root).toHaveClass('cds--keyboard-shortcut--plain');
      const separators = root.querySelectorAll(
        '.cds--keyboard-shortcut__separator'
      );
      expect(separators).toHaveLength(1);
      expect(separators[0]).toHaveAttribute('aria-hidden', 'true');
      expect(visible(root)).toBe('Ctrl+K');
    });

    it('plain writes the Plus key as a word off macOS, never Ctrl++', () => {
      const other = render(
        <KeyboardShortcut keys={['mod', '+']} kind="plain" platform="other" />
      );
      expect(visible(other.container.firstElementChild as Element)).toBe(
        'Ctrl+Plus'
      );
      other.unmount();
      const mac = render(
        <KeyboardShortcut keys={['mod', '+']} kind="plain" platform="mac" />
      );
      expect(visible(mac.container.firstElementChild as Element)).toBe('⌘+');
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
