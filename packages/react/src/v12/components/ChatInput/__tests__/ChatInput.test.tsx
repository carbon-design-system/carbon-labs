/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {
  createEvent,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from '../components/ChatInput';
import { filterCommands } from '../components/CommandList';
import { lightnessOf } from '../internal/useInverseTheme';

const commands = [
  { id: 'summarize', name: 'summarize', description: 'Summarize the thread' },
  { id: 'search', name: 'search', description: 'Search connected sources' },
  { id: 'clear', name: 'clear', description: 'Start a new conversation' },
];

const prompt = () => screen.getByRole('textbox', { name: 'Ask anything' });
const box = () => prompt().closest('.cds--chat-input__box') as HTMLElement;

describe('ChatInput', () => {
  it('has the cds prefix, its layout and a custom class, and forwards a ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<ChatInput ref={ref} className="custom" />);
    expect(ref.current).toHaveClass(
      'cds--chat-input',
      'cds--chat-input--actions-below',
      'custom'
    );
  });

  it('sends the trimmed prompt on Enter and clears it', async () => {
    const onSubmit = jest.fn();
    render(<ChatInput onSubmit={onSubmit} />);
    await userEvent.type(prompt(), '  Hello  {Enter}');
    expect(onSubmit).toHaveBeenCalledWith('Hello');
    expect(prompt()).toHaveValue('');
  });

  it('breaks a line on Shift+Enter instead of sending', async () => {
    const onSubmit = jest.fn();
    render(<ChatInput onSubmit={onSubmit} />);
    await userEvent.type(prompt(), 'One{Shift>}{Enter}{/Shift}Two');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(prompt()).toHaveValue('One\nTwo');
  });

  it('sends on Mod+Enter only, when submitOn is mod-enter', async () => {
    const onSubmit = jest.fn();
    render(<ChatInput onSubmit={onSubmit} submitOn="mod-enter" />);
    await userEvent.type(prompt(), 'Hi{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.type(prompt(), '{Control>}{Enter}{/Control}');
    expect(onSubmit).toHaveBeenCalledWith('Hi');
  });

  it('never sends during an IME composition', () => {
    const onSubmit = jest.fn();
    render(<ChatInput onSubmit={onSubmit} defaultValue="にほん" />);
    fireEvent.keyDown(prompt(), { key: 'Enter', isComposing: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disables send until there is something to send, then makes it primary', async () => {
    render(<ChatInput />);
    const send = screen.getByRole('button', { name: 'Send' });
    expect(send).toBeDisabled();
    await userEvent.type(prompt(), 'x');
    expect(send).toBeEnabled();
    expect(send.className).toMatch(/primary/);
  });

  it('turns send into Stop while busy', async () => {
    const onStop = jest.fn();
    render(<ChatInput busy onStop={onStop} defaultValue="x" />);
    expect(screen.queryByRole('button', { name: 'Send' })).toBeNull();
    await userEvent.click(
      screen.getByRole('button', { name: 'Stop generating' })
    );
    expect(onStop).toHaveBeenCalled();
  });

  it('draws the focus ring for a keyboard arrival only', async () => {
    render(<ChatInput />);
    await userEvent.tab();
    expect(box()).toHaveClass('cds--chat-input__box--keyboard-focus');
    await userEvent.tab({ shift: true });
    expect(box()).not.toHaveClass('cds--chat-input__box--keyboard-focus');

    await userEvent.click(prompt());
    expect(box()).toHaveClass('cds--chat-input__box--active');
    expect(box()).not.toHaveClass('cds--chat-input__box--keyboard-focus');
  });

  it('grows the box when it holds files', () => {
    const { rerender } = render(<ChatInput />);
    expect(box()).not.toHaveClass('cds--chat-input__box--grown');
    rerender(<ChatInput attachments={<span>file</span>} />);
    expect(box()).toHaveClass('cds--chat-input__box--grown');
  });

  it('animates the files row: clipped while its height moves, never at rest', () => {
    const height = jest
      .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
      .mockReturnValue(0);
    const { container, rerender } = render(<ChatInput />);
    const row = container.querySelector(
      '.cds--chat-input__attachments'
    ) as HTMLElement;
    expect(row).toHaveStyle({ blockSize: '0px' });

    height.mockReturnValue(64);
    rerender(<ChatInput attachments={<span>file</span>} />);
    expect(row).toHaveStyle({ blockSize: '64px' });
    expect(row).toHaveClass('cds--chat-input__attachments--moving');

    // Chrome names the logical property by its physical one.
    // jsdom has no TransitionEvent, so the name is set on the event itself.
    const end = createEvent.transitionEnd(row);
    Object.defineProperty(end, 'propertyName', { value: 'height' });
    fireEvent(row, end);
    expect(row).not.toHaveClass('cds--chat-input__attachments--moving');
    height.mockRestore();
  });

  it('puts the actions inside the box for the inside layout', () => {
    render(<ChatInput actionsPlacement="inside" onSpeechToggle={jest.fn()} />);
    const group = screen.getByRole('group', { name: 'Chat input actions' });
    expect(box()).toContainElement(group);
    expect(group).toContainElement(
      screen.getByRole('button', { name: 'Send' })
    );
  });

  it('passes dropped and pasted files to onFilesAdded', () => {
    const onFilesAdded = jest.fn();
    render(<ChatInput onFilesAdded={onFilesAdded} />);
    const file = new File(['x'], 'a.txt', { type: 'text/plain' });
    fireEvent.drop(box(), { dataTransfer: { files: [file] } });
    expect(onFilesAdded).toHaveBeenLastCalledWith([file]);
    fireEvent.paste(prompt(), { clipboardData: { files: [file] } });
    expect(onFilesAdded).toHaveBeenCalledTimes(2);
  });

  it('toggles speech, marking the button selected', async () => {
    const onSpeechToggle = jest.fn();
    const { rerender } = render(<ChatInput onSpeechToggle={onSpeechToggle} />);
    await userEvent.click(screen.getByRole('button', { name: 'Voice input' }));
    expect(onSpeechToggle).toHaveBeenCalledWith(true);
    rerender(<ChatInput onSpeechToggle={onSpeechToggle} speechActive />);
    expect(screen.getByRole('button', { name: 'Voice input' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('shares one tooltip across the actions, moving it without a second delay', async () => {
    const { container } = render(
      <ChatInput onAddFile={jest.fn()} onSpeechToggle={jest.fn()} />
    );
    const add = screen.getByRole('button', { name: 'Add context' });
    const voice = screen.getByRole('button', { name: 'Voice input' });
    const openTips = () => container.querySelectorAll('.cds--popover--open');
    const tip = () =>
      container.querySelector('.cds--chat-input__tip .cds--popover-content');

    await userEvent.hover(add);
    await waitFor(() => expect(openTips()).toHaveLength(1));
    expect(tip()).toHaveTextContent('Add context');
    // Hidden from assistive technology: the button's own name says it.
    expect(tip()?.closest('[aria-hidden="true"]')).not.toBeNull();

    // Already open: it moves at once, and there is still only one.
    await userEvent.hover(voice);
    expect(openTips()).toHaveLength(1);
    expect(tip()).toHaveTextContent('Voice input');

    await userEvent.keyboard('{Escape}');
    voice.focus();
    await userEvent.keyboard('{Escape}');
    expect(openTips()).toHaveLength(0);
  });

  describe('/ commands', () => {
    it('opens on a slash with nothing active, and filters as you type', async () => {
      render(<ChatInput commands={commands} />);
      await userEvent.type(prompt(), '/');
      const list = screen.getByRole('listbox', { name: 'Commands' });
      expect(screen.getAllByRole('option')).toHaveLength(3);
      expect(prompt()).toHaveAttribute('aria-controls', list.id);
      expect(prompt()).not.toHaveAttribute('aria-activedescendant');

      await userEvent.type(prompt(), 'se');
      expect(
        screen.getAllByRole('option').map((option) => option.textContent)
      ).toEqual(['/searchSearch connected sources']);
    });

    it('moves with the arrows and chooses on Enter, keeping focus in the prompt', async () => {
      const onCommand = jest.fn();
      const onSubmit = jest.fn();
      render(
        <ChatInput
          commands={commands}
          onCommand={onCommand}
          onSubmit={onSubmit}
        />
      );
      await userEvent.type(prompt(), '/{ArrowDown}{ArrowDown}');
      const [, second] = screen.getAllByRole('option');
      expect(prompt()).toHaveAttribute('aria-activedescendant', second.id);
      expect(second).toHaveAttribute('aria-selected', 'true');
      await userEvent.keyboard('{Enter}');
      expect(onCommand).toHaveBeenCalledWith(commands[1]);
      expect(onSubmit).not.toHaveBeenCalled();
      expect(prompt()).toHaveFocus();
      expect(prompt()).toHaveValue('');
      expect(screen.queryByRole('listbox')).toBeNull();
    });

    it('wraps, and Escape closes and clears', async () => {
      render(<ChatInput commands={commands} />);
      await userEvent.type(prompt(), '/{ArrowUp}');
      const options = screen.getAllByRole('option');
      expect(options[2]).toHaveAttribute('aria-selected', 'true');
      await userEvent.keyboard('{Escape}');
      expect(screen.queryByRole('listbox')).toBeNull();
      expect(prompt()).toHaveValue('');
    });

    it('says when nothing matches', async () => {
      render(<ChatInput commands={commands} />);
      await userEvent.type(prompt(), '/zzz');
      expect(screen.getByRole('status')).toHaveTextContent(
        'No matching commands'
      );
    });

    it('ranks names that start with the query before other matches', () => {
      expect(filterCommands(commands, 'se').map((c) => c.id)).toEqual([
        'search',
      ]);
      expect(filterCommands(commands, 'thread').map((c) => c.id)).toEqual([
        'summarize',
      ]);
      expect(filterCommands(commands, '')).toBe(commands);
    });
  });

  describe('menus', () => {
    it('opens the context menu inverse, with its trigger expanded', async () => {
      const onToggleConnection = jest.fn();
      render(
        <ChatInput
          connections={[{ id: 'box', label: 'Box', enabled: false }]}
          onAddFile={jest.fn()}
          onToggleConnection={onToggleConnection}
        />
      );
      const trigger = screen.getByRole('button', { name: 'Add context' });
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
      await userEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      const menu = screen.getByRole('menu', { name: 'Add to context' });
      // jsdom has no theme, so the surface reads as light and the menu as g100.
      expect(menu.closest('.cds--g100')).not.toBeNull();
      expect(
        screen.getByRole('menuitem', { name: 'Upload a file' })
      ).toBeInTheDocument();
    });

    it('shows the model and mode as radio groups with the selection checked', async () => {
      render(
        <ChatInput
          models={[
            { id: 'a', label: 'Model A' },
            { id: 'b', label: 'Model B' },
          ]}
          selectedModelId="b"
          modes={[{ id: 'ask', label: 'Ask' }]}
          selectedModeId="ask"
        />
      );
      await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
      expect(screen.getByRole('group', { name: 'Model' })).toBeInTheDocument();
      expect(
        screen.getByRole('menuitemradio', { name: 'Model B' })
      ).toHaveAttribute('aria-checked', 'true');
      expect(
        screen.getByRole('menuitemradio', { name: 'Model A' })
      ).toHaveAttribute('aria-checked', 'false');
    });

    it('takes menuTheme over the measured surface', async () => {
      render(<ChatInput menuTheme="g10" onAddFile={jest.fn()} />);
      await userEvent.click(
        screen.getByRole('button', { name: 'Add context' })
      );
      expect(
        screen
          .getByRole('menu', { name: 'Add to context' })
          .closest('.cds--g10')
      ).not.toBeNull();
    });

    it('leaves out a menu with nothing in it', () => {
      render(<ChatInput />);
      expect(screen.queryByRole('button', { name: 'Add context' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Settings' })).toBeNull();
    });
  });

  it('reads the lightness of the colours Carbon themes emit', () => {
    expect(lightnessOf('oklch(16% 0.004 262deg)')).toBeCloseTo(0.16);
    expect(lightnessOf('oklch(0.97 0.004 262)')).toBeCloseTo(0.97);
    expect(lightnessOf('#ffffff')).toBeCloseTo(1);
    expect(lightnessOf('#161616')).toBeLessThan(0.5);
    expect(lightnessOf('rgb(0 0 0)')).toBeUndefined();
  });
});
