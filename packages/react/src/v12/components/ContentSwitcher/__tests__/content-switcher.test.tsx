/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { setReducedMotion } from '../../../vitest.dom';
import { ContentSwitcher, IconSwitch, Switch } from '../index';

setReducedMotion(true);

const switcher = (
  props: Partial<React.ComponentProps<typeof ContentSwitcher>> = {}
) => (
  <ContentSwitcher onChange={() => {}} {...props}>
    <Switch name="one" text="One" />
    <Switch name="two" text="Two" />
    <Switch name="three" text="Three" disabled />
    <Switch name="four" text="Four" />
  </ContentSwitcher>
);

const sw = (name: string) => screen.getByRole('tab', { name });

describe('ContentSwitcher roles', () => {
  it('is a tablist of tabs, the first selected', () => {
    render(switcher());
    expect(screen.getByRole('tablist')).toBeTruthy();
    expect(screen.getAllByRole('tab')).toHaveLength(4);
    expect(sw('One')).toHaveAttribute('aria-selected', 'true');
    expect(sw('Two')).toHaveAttribute('aria-selected', 'false');
  });

  it('follows `selectedIndex`', () => {
    const { rerender } = render(switcher({ selectedIndex: 0 }));
    rerender(switcher({ selectedIndex: 3 }));
    expect(sw('Four')).toHaveAttribute('aria-selected', 'true');
  });

  it('names an icon switch by its text, with no visible label', () => {
    render(
      <ContentSwitcher onChange={() => {}}>
        <IconSwitch name="a" text="Grid" renderIcon={() => <svg />} />
        <IconSwitch name="b" text="List" renderIcon={() => <svg />} />
      </ContentSwitcher>
    );
    expect(screen.getByRole('tab', { name: 'Grid' })).toBeTruthy();
  });

  it('points each switch at its panel: aria-controls one way, aria-labelledby the other', () => {
    render(
      <>
        <ContentSwitcher onChange={() => {}}>
          <Switch name="a" text="A" id="sw-a" aria-controls="panel-a" />
          <IconSwitch
            name="b"
            text="B"
            id="sw-b"
            aria-controls="panel-b"
            renderIcon={() => <svg />}
          />
        </ContentSwitcher>
        <div role="tabpanel" id="panel-a" aria-labelledby="sw-a">
          Panel A
        </div>
        <div role="tabpanel" id="panel-b" aria-labelledby="sw-b" hidden>
          Panel B
        </div>
      </>
    );
    for (const name of ['A', 'B']) {
      const panel = document.getElementById(
        sw(name).getAttribute('aria-controls')!
      )!;
      expect(panel).toHaveAttribute('role', 'tabpanel');
      expect(panel.getAttribute('aria-labelledby')).toBe(sw(name).id);
    }
  });

  it('gives a switch no `aria-controls` when it has no panel', () => {
    render(switcher());
    expect(sw('One')).not.toHaveAttribute('aria-controls');
  });
});

describe('ContentSwitcher roving tab stop', () => {
  it('only the selected switch is a tab stop, and the stop follows the selection', () => {
    render(switcher());
    expect(sw('One')).toHaveAttribute('tabindex', '0');
    expect(sw('Two')).toHaveAttribute('tabindex', '-1');
    fireEvent.click(sw('Two'));
    expect(sw('Two')).toHaveAttribute('tabindex', '0');
    expect(sw('One')).toHaveAttribute('tabindex', '-1');
  });
});

describe('ContentSwitcher automatic activation', () => {
  it('an arrow moves focus and selects, telling `onChange` the key, index, name and text', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(switcher({ onChange }));
    sw('One').focus();
    await user.keyboard('{ArrowRight}');
    expect(sw('Two')).toHaveFocus();
    expect(sw('Two')).toHaveAttribute('aria-selected', 'true');
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ index: 1, name: 'two', text: 'Two' })
    );
  });

  it('skips a disabled switch and wraps; Home and End reach the ends', async () => {
    const user = userEvent.setup();
    render(switcher({ selectedIndex: 1 }));
    sw('Two').focus();
    await user.keyboard('{ArrowRight}');
    expect(sw('Four')).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(sw('One')).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(sw('Four')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(sw('One')).toHaveFocus();
    await user.keyboard('{End}');
    expect(sw('Four')).toHaveFocus();
  });

  it('does not select a disabled switch on a click', () => {
    const onChange = vi.fn();
    render(switcher({ onChange }));
    fireEvent.click(sw('Three'));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('ContentSwitcher manual activation', () => {
  it('an arrow moves focus only; Enter selects', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(switcher({ activation: 'manual', onChange }));
    sw('One').focus();
    await user.keyboard('{ArrowRight}');
    expect(sw('Two')).toHaveFocus();
    expect(sw('Two')).toHaveAttribute('aria-selected', 'false');
    expect(onChange).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(sw('Two')).toHaveAttribute('aria-selected', 'true');
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe('ContentSwitcher disabled with a reason', () => {
  it('stays in the arrow keys’ path, and does not select', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ContentSwitcher onChange={onChange} activation="manual">
        <Switch name="a" text="A" />
        <Switch name="b" text="B" disabled disabledReason="Not yet" />
        <Switch name="c" text="C" />
      </ContentSwitcher>
    );
    sw('A').focus();
    await user.keyboard('{ArrowRight}');
    expect(sw('B')).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('ContentSwitcher right to left', () => {
  const rtl = (ui: React.ReactElement) => <div dir="rtl">{ui}</div>;

  it('ArrowLeft goes to the next switch, the way the row reads (ArrowRight to the previous)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(rtl(switcher({ onChange })));
    sw('One').focus();
    await user.keyboard('{ArrowLeft}');
    expect(sw('Two')).toHaveFocus();
    expect(sw('Two')).toHaveAttribute('aria-selected', 'true');
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ index: 1, key: 'ArrowLeft' })
    );
    await user.keyboard('{ArrowRight}');
    expect(sw('One')).toHaveFocus();
  });

  it('skips a disabled switch and wraps the way the row reads', async () => {
    const user = userEvent.setup();
    render(rtl(switcher({ selectedIndex: 1 })));
    sw('Two').focus();
    await user.keyboard('{ArrowLeft}');
    expect(sw('Four')).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(sw('One')).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(sw('Four')).toHaveFocus();
  });
});
