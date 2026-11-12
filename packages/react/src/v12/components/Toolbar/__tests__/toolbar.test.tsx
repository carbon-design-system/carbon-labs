/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { setReducedMotion } from '../../../vitest.dom';
import {
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarToggle,
  type ToolbarProps,
} from '../index';

setReducedMotion(true);

const NAMES = ['Cut', 'Copy', 'Bold', 'Paste'];

/**
 * A toolbar of four controls between two outside buttons, in a page running
 * `dir`. `off` names the controls that are disabled.
 */
function bar(
  props: Partial<ToolbarProps> = {},
  { dir = 'ltr', off = [] as string[] } = {}
) {
  const disabled = (name: string) => off.includes(name);
  return (
    <div dir={dir}>
      <button type="button">Before</button>
      <Toolbar aria-label="Editing" {...props}>
        <ToolbarButton label="Cut" disabled={disabled('Cut')} />
        <ToolbarButton label="Copy" disabled={disabled('Copy')} />
        <ToolbarDivider />
        <ToolbarToggle label="Bold" disabled={disabled('Bold')} />
        <ToolbarButton label="Paste" disabled={disabled('Paste')} />
      </Toolbar>
      <button type="button">After</button>
    </div>
  );
}

const toolbar = () => screen.getByRole('toolbar', { name: 'Editing' });
const control = (name: string) =>
  within(toolbar()).getByRole('button', { name });
const controls = () => NAMES.map(control);
/** The names of the controls Tab can reach. */
const tabStops = () =>
  controls()
    .filter((el) => el.tabIndex === 0)
    .map((el) => el.textContent);
const focused = () =>
  (document.activeElement as HTMLElement | null)?.textContent;

/** Focus on `name`, then each key in turn; returns the control focus ends on. */
async function keys(name: string, ...pressed: string[]) {
  const user = userEvent.setup();
  act(() => control(name).focus());
  for (const key of pressed) {
    await user.keyboard(`{${key}}`);
  }
  return focused();
}

describe('Toolbar: the tab stop', () => {
  it('is one control: the first to begin with, then the one focus was last on', async () => {
    render(bar());
    expect(controls().map((el) => el.tabIndex)).toEqual([0, -1, -1, -1]);

    expect(await keys('Cut', 'ArrowRight', 'ArrowRight')).toBe('Bold');
    expect(tabStops()).toEqual(['Bold']);
  });

  it('takes Tab in at that control and out past the rest', async () => {
    const user = userEvent.setup();
    render(bar());
    act(() => screen.getByRole('button', { name: 'Before' }).focus());
    await user.tab();
    expect(focused()).toBe('Cut');
    await user.keyboard('{ArrowRight}');
    await user.tab();
    expect(focused()).toBe('After');
    await user.tab({ shift: true });
    expect(focused()).toBe('Copy');
  });

  it('is never a disabled control', () => {
    render(bar({}, { off: ['Cut'] }));
    expect(tabStops()).toEqual(['Copy']);
  });
});

describe('Toolbar: a row’s arrows', () => {
  it('→ is the next control and ← the previous, left to right', async () => {
    render(bar());
    expect(toolbar()).toHaveAttribute('aria-orientation', 'horizontal');
    expect(await keys('Cut', 'ArrowRight')).toBe('Copy');
    expect(await keys('Copy', 'ArrowRight', 'ArrowRight')).toBe('Paste');
    expect(await keys('Paste', 'ArrowLeft')).toBe('Bold');
    expect(await keys('Bold', 'ArrowDown', 'ArrowUp')).toBe('Bold');
  });

  it('← is the next control and → the previous, right to left', async () => {
    render(bar({}, { dir: 'rtl' }));
    expect(await keys('Cut', 'ArrowLeft')).toBe('Copy');
    expect(await keys('Copy', 'ArrowLeft')).toBe('Bold');
    expect(await keys('Bold', 'ArrowRight', 'ArrowRight')).toBe('Cut');
  });

  it('stop at the ends, unless `wrap`', async () => {
    const { rerender } = render(bar());
    expect(await keys('Paste', 'ArrowRight')).toBe('Paste');
    expect(await keys('Cut', 'ArrowLeft')).toBe('Cut');

    rerender(bar({ wrap: true }));
    expect(await keys('Paste', 'ArrowRight')).toBe('Cut');
    expect(await keys('Cut', 'ArrowLeft')).toBe('Paste');
  });

  it('skip a disabled control', async () => {
    render(bar({}, { off: ['Copy', 'Paste'] }));
    expect(await keys('Cut', 'ArrowRight')).toBe('Bold');
    expect(await keys('Bold', 'ArrowLeft')).toBe('Cut');
    expect(await keys('Bold', 'ArrowRight')).toBe('Bold');
  });

  it('give way to a key the caller has handled', async () => {
    render(
      bar({ onKeyDown: (e) => e.key === 'ArrowRight' && e.preventDefault() })
    );
    expect(await keys('Cut', 'ArrowRight')).toBe('Cut');
    expect(await keys('Copy', 'ArrowLeft')).toBe('Cut');
  });
});

describe('Toolbar: Home and End', () => {
  it('go to the first and the last control, in either direction', async () => {
    const { unmount } = render(bar());
    expect(await keys('Copy', 'End')).toBe('Paste');
    expect(await keys('Bold', 'Home')).toBe('Cut');
    unmount();

    render(bar({}, { dir: 'rtl' }));
    expect(await keys('Copy', 'End')).toBe('Paste');
    expect(await keys('Bold', 'Home')).toBe('Cut');
  });

  it('go to the first and the last control that is not disabled', async () => {
    render(bar({}, { off: ['Cut', 'Paste'] }));
    expect(await keys('Bold', 'Home')).toBe('Copy');
    expect(await keys('Copy', 'End')).toBe('Bold');
  });
});

describe('Toolbar: a column', () => {
  it('moves on ↓ and ↑, and not on ← or →, whatever the direction', async () => {
    for (const dir of ['ltr', 'rtl']) {
      const { unmount } = render(bar({ orientation: 'vertical' }, { dir }));
      expect(toolbar()).toHaveAttribute('aria-orientation', 'vertical');
      expect(await keys('Cut', 'ArrowDown')).toBe('Copy');
      expect(await keys('Copy', 'ArrowDown')).toBe('Bold');
      expect(await keys('Bold', 'ArrowUp')).toBe('Copy');
      expect(await keys('Copy', 'ArrowLeft', 'ArrowRight')).toBe('Copy');
      unmount();
    }
  });
});

describe('Toolbar: its controls', () => {
  it('run a button’s `onClick`, flip a toggle’s pressed state, and keep the divider out of the stops', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onChange = vi.fn();
    render(
      <Toolbar aria-label="Editing">
        <ToolbarButton label="Cut" onClick={onClick} />
        <ToolbarDivider />
        <ToolbarToggle label="Bold" onChange={onChange} />
      </Toolbar>
    );
    await user.click(control('Cut'));
    expect(onClick).toHaveBeenCalledTimes(1);

    expect(control('Bold')).toHaveAttribute('aria-pressed', 'false');
    await user.click(control('Bold'));
    expect(control('Bold')).toHaveAttribute('aria-pressed', 'true');
    expect(onChange).toHaveBeenLastCalledWith(true);

    const divider = within(toolbar()).getByRole('separator');
    expect(divider).toHaveAttribute('aria-orientation', 'vertical');
    await user.keyboard('{ArrowLeft}');
    expect(control('Cut')).toHaveFocus();
  });
});
