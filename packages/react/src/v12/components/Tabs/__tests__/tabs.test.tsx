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
import {
  Tab,
  TabList,
  TabListVertical,
  TabPanel,
  TabPanels,
  Tabs,
  TabsVertical,
} from '../index';

setReducedMotion(true);

const tabs = (
  props: Partial<React.ComponentProps<typeof Tabs>> = {},
  list: Partial<React.ComponentProps<typeof TabList>> = {}
) => (
  <Tabs {...props}>
    <TabList aria-label="Sections" {...list}>
      <Tab>One</Tab>
      <Tab>Two</Tab>
      <Tab disabled>Three</Tab>
      <Tab>Four</Tab>
    </TabList>
    <TabPanels>
      <TabPanel>Panel one</TabPanel>
      <TabPanel>Panel two</TabPanel>
      <TabPanel>Panel three</TabPanel>
      <TabPanel>Panel four</TabPanel>
    </TabPanels>
  </Tabs>
);

const tab = (name: string) => screen.getByRole('tab', { name });

describe('Tabs roles', () => {
  it('is a tablist of tabs, named by its label, horizontal', () => {
    render(tabs());
    const list = screen.getByRole('tablist', { name: 'Sections' });
    expect(list).toHaveAttribute('aria-orientation', 'horizontal');
    expect(screen.getAllByRole('tab')).toHaveLength(4);
  });

  it('marks the first tab selected, and the others not', () => {
    render(tabs());
    expect(tab('One')).toHaveAttribute('aria-selected', 'true');
    expect(tab('Two')).toHaveAttribute('aria-selected', 'false');
  });

  it('joins each tab to its panel: aria-controls one way, aria-labelledby the other', () => {
    render(tabs());
    const controls = tab('One').getAttribute('aria-controls')!;
    const panel = document.getElementById(controls)!;
    expect(panel).toHaveAttribute('role', 'tabpanel');
    expect(panel.getAttribute('aria-labelledby')).toBe(tab('One').id);
  });

  it('starts on `defaultSelectedIndex`', () => {
    render(tabs({ defaultSelectedIndex: 1 }));
    expect(tab('Two')).toHaveAttribute('aria-selected', 'true');
  });
});

describe('Tabs roving tab stop', () => {
  it('only the selected tab is a tab stop', () => {
    render(tabs());
    expect(tab('One')).toHaveAttribute('tabindex', '0');
    expect(tab('Two')).toHaveAttribute('tabindex', '-1');
    expect(tab('Four')).toHaveAttribute('tabindex', '-1');
  });

  it('the stop follows the selection', () => {
    render(tabs());
    fireEvent.click(tab('Two'));
    expect(tab('Two')).toHaveAttribute('tabindex', '0');
    expect(tab('One')).toHaveAttribute('tabindex', '-1');
  });

  it('the selected panel is a tab stop too, so its content is reachable', () => {
    render(tabs());
    const panels = screen.getAllByRole('tabpanel', { hidden: true });
    expect(
      panels.filter((p) => p.getAttribute('tabindex') === '0')
    ).toHaveLength(1);
  });
});

describe('Tabs automatic activation', () => {
  it('an arrow moves focus and selects at once', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(tabs({ onChange }));
    tab('One').focus();
    await user.keyboard('{ArrowRight}');
    expect(tab('Two')).toHaveFocus();
    expect(tab('Two')).toHaveAttribute('aria-selected', 'true');
    expect(onChange).toHaveBeenCalledWith({ selectedIndex: 1 });
  });

  it('skips a disabled tab, and wraps at the ends', async () => {
    const user = userEvent.setup();
    render(tabs());
    tab('Two').focus();
    fireEvent.click(tab('Two'));
    await user.keyboard('{ArrowRight}');
    expect(tab('Four')).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(tab('One')).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(tab('Four')).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(tab('Two')).toHaveFocus();
  });

  it('Home and End go to the first and the last enabled tab', async () => {
    const user = userEvent.setup();
    render(tabs());
    tab('One').focus();
    await user.keyboard('{End}');
    expect(tab('Four')).toHaveFocus();
    expect(tab('Four')).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{Home}');
    expect(tab('One')).toHaveFocus();
  });

  it('a click selects, and does not select a disabled tab', () => {
    const onChange = vi.fn();
    render(tabs({ onChange }));
    fireEvent.click(tab('Three'));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(tab('Four'));
    expect(onChange).toHaveBeenCalledWith({ selectedIndex: 3 });
  });
});

describe('Tabs manual activation', () => {
  it('an arrow moves focus only; Enter and Space select', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(tabs({ onChange }, { activation: 'manual' }));
    tab('One').focus();
    await user.keyboard('{ArrowRight}');
    expect(tab('Two')).toHaveFocus();
    expect(tab('Two')).toHaveAttribute('aria-selected', 'false');
    expect(onChange).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(tab('Two')).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowRight}');
    await user.keyboard(' ');
    expect(tab('Four')).toHaveAttribute('aria-selected', 'true');
  });

  it('the tab stop stays on the selected tab while focus has moved', async () => {
    const user = userEvent.setup();
    render(tabs({}, { activation: 'manual' }));
    tab('One').focus();
    await user.keyboard('{ArrowRight}');
    expect(tab('One')).toHaveAttribute('tabindex', '0');
    expect(tab('Two')).toHaveAttribute('tabindex', '-1');
  });
});

describe('Tabs controlled', () => {
  it('follows `selectedIndex`', () => {
    const { rerender } = render(tabs({ selectedIndex: 0 }));
    rerender(tabs({ selectedIndex: 3 }));
    expect(tab('Four')).toHaveAttribute('aria-selected', 'true');
  });
});

describe('Tabs right to left', () => {
  const rtl = (ui: React.ReactElement) => <div dir="rtl">{ui}</div>;

  it('keeps its roles and its tab stop', () => {
    render(rtl(tabs()));
    expect(screen.getAllByRole('tab')).toHaveLength(4);
    expect(tab('One')).toHaveAttribute('tabindex', '0');
  });

  // The arrows do not mirror: ArrowRight is always next, so right to left it moves the wrong way.
  it.fails(
    'ArrowLeft goes to the next tab, the way the row reads (ArrowRight to the previous)',
    async () => {
      const user = userEvent.setup();
      render(rtl(tabs()));
      tab('One').focus();
      await user.keyboard('{ArrowLeft}');
      expect(tab('Two')).toHaveFocus();
      await user.keyboard('{ArrowRight}');
      expect(tab('One')).toHaveFocus();
    }
  );
});

describe('Tabs dismissable', () => {
  it('Delete on a tab asks to close it, by index', async () => {
    const user = userEvent.setup();
    const onTabCloseRequest = vi.fn();
    render(tabs({ dismissable: true, onTabCloseRequest }));
    tab('Two').focus();
    await user.keyboard('{Delete}');
    expect(onTabCloseRequest).toHaveBeenCalledWith(1);
  });
});

describe('TabsVertical', () => {
  const vertical = (
    <TabsVertical>
      <TabListVertical aria-label="Sections">
        <Tab>One</Tab>
        <Tab disabled>Two</Tab>
        <Tab>Three</Tab>
      </TabListVertical>
      <TabPanels>
        <TabPanel>Panel one</TabPanel>
        <TabPanel>Panel two</TabPanel>
        <TabPanel>Panel three</TabPanel>
      </TabPanels>
    </TabsVertical>
  );

  it('is a vertical tablist, with the same roving tab stop', () => {
    render(vertical);
    expect(screen.getByRole('tablist')).toHaveAttribute(
      'aria-orientation',
      'vertical'
    );
    expect(tab('One')).toHaveAttribute('tabindex', '0');
    expect(tab('Three')).toHaveAttribute('tabindex', '-1');
  });

  it('ArrowDown and ArrowUp move and select, skipping a disabled tab', async () => {
    const user = userEvent.setup();
    render(vertical);
    tab('One').focus();
    await user.keyboard('{ArrowDown}');
    expect(tab('Three')).toHaveFocus();
    expect(tab('Three')).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowUp}');
    expect(tab('One')).toHaveFocus();
  });
});
