/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import {
  Activity,
  Chat,
  Email,
  Grid,
  Home,
  List,
  Notification,
  Settings,
  Table,
} from '@carbon-labs/react-motion-icons';
import {
  IconTab,
  Tab,
  TabList,
  TabListVertical,
  TabPanel,
  TabPanels,
  Tabs,
  TabsVertical,
} from '../index';
import type { TabListProps, TabsProps, TabsVerticalProps } from '../index';
import mdx from './Tabs.mdx';

export default {
  title: 'V12/Tabs',
  component: Tabs,
  subcomponents: {
    TabList,
    Tab,
    IconTab,
    TabPanels,
    TabPanel,
    TabsVertical,
    TabListVertical,
  },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'glide',
        'labels',
        'press',
        'drag',
        'landing',
        'tooltip',
        'panels',
        'panel-box',
        'close',
        'overflow',
      ],
      reduced: {
        glide: 'shorter-clock',
        tooltip: 'at-once',
        panels: 'at-once',
        'panel-box': 'at-once',
        close: 'at-once',
      },
      states: ['rest', 'hover', 'pressed', 'selected', 'disabled'],
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['inverse', 'tonal', 'outlined', 'hero'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
    corners: {
      control: 'inline-radio',
      options: ['rounded', 'full', 'square'],
    },
    interaction: { control: 'inline-radio', options: ['preview', 'lightness'] },
    outlinedFill: { control: 'inline-radio', options: ['subtle', 'raised'] },
    children: { control: false },
  },
};

const PAGES = [
  {
    name: 'Overview',
    body: 'Status, owner and the last deployment for this service.',
  },
  {
    name: 'Activity',
    body: 'The last ten changes, newest first. Each one names who made it and when, and links to what it changed.',
  },
  { name: 'Access', body: 'Who can view, edit and deploy this service.' },
  { name: 'Billing', body: 'Spend this month.', disabled: true },
  { name: 'Settings', body: 'Name, region and visibility.' },
];

type TabsStoryArgs = TabsProps &
  Pick<TabListProps, 'frame' | 'fit' | 'activation'>;

/** Line tabs over their panels. Billing is disabled. */
export const Default = {
  args: {
    defaultSelectedIndex: 0,
    variant: 'inverse',
    frame: 'line',
    fit: 'hug',
    activation: 'automatic',
  },
  argTypes: {
    frame: { control: 'inline-radio', options: ['line', 'inset'] },
    fit: { control: 'inline-radio', options: ['hug', 'fill'] },
    activation: { control: 'inline-radio', options: ['automatic', 'manual'] },
  },
  render: ({ frame, fit, activation, ...args }: TabsStoryArgs) => (
    <div style={{ maxInlineSize: 640 }}>
      <Tabs {...args}>
        <TabList
          aria-label="Service"
          frame={frame}
          fit={fit}
          activation={activation}>
          {PAGES.map((p) => (
            <Tab key={p.name} disabled={p.disabled}>
              {p.name}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {PAGES.map((p) => (
            <TabPanel key={p.name}>
              <p>{p.body}</p>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </div>
  ),
};

const VARIANTS = ['inverse', 'tonal', 'outlined', 'hero'] as const;

/** `frame="inset"`: the track and selector, in the four variants. Line tabs take inverse or hero. */
export const Inset = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, justifyItems: 'start' }}>
      {VARIANTS.map((variant) => (
        <Tabs key={variant} variant={variant} defaultSelectedIndex={1}>
          <TabList aria-label={`Service, ${variant}`} frame="inset">
            {PAGES.slice(0, 4).map((p) => (
              <Tab key={p.name}>{p.name}</Tab>
            ))}
          </TabList>
        </Tabs>
      ))}
    </div>
  ),
};

const SIZES = ['sm', 'md', 'lg', 'xl'] as const;

/** sm 32, md 40, lg 48 and xl 64px. */
export const Sizes = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, justifyItems: 'start' }}>
      {SIZES.map((size) => (
        <Tabs key={size} size={size}>
          <TabList aria-label={`Service, ${size}`}>
            {PAGES.slice(0, 4).map((p) => (
              <Tab key={p.name}>{p.name}</Tab>
            ))}
          </TabList>
        </Tabs>
      ))}
    </div>
  ),
};

/** Icons before the labels; icon tabs named by their tooltips, two with a dot for something new. */
export const Icons = {
  render: () => (
    <div style={{ display: 'grid', gap: 32, justifyItems: 'start' }}>
      <Tabs>
        <TabList aria-label="Workspace">
          <Tab renderIcon={Home}>Home</Tab>
          <Tab renderIcon={Activity}>Activity</Tab>
          <Tab renderIcon={Settings}>Settings</Tab>
        </TabList>
      </Tabs>
      <Tabs>
        <TabList aria-label="View" frame="inset">
          <IconTab label="Grid view">
            <Grid />
          </IconTab>
          <IconTab label="List view">
            <List />
          </IconTab>
          <IconTab label="Table view">
            <Table />
          </IconTab>
        </TabList>
      </Tabs>
      <Tabs>
        <TabList aria-label="Inbox">
          <IconTab label="Notifications">
            <Notification />
          </IconTab>
          <IconTab label="Chat, new messages" badgeIndicator>
            <Chat />
          </IconTab>
          <IconTab label="Email, new messages" badgeIndicator>
            <Email />
          </IconTab>
        </TabList>
      </Tabs>
    </div>
  ),
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** More tabs than fit: the list scrolls, with a scroll button at each end that has more. */
export const Overflow = {
  render: () => (
    <div style={{ maxInlineSize: 400 }}>
      <Tabs defaultSelectedIndex={5}>
        <TabList aria-label="Month">
          {MONTHS.map((m) => (
            <Tab key={m}>{m}</Tab>
          ))}
        </TabList>
      </Tabs>
    </div>
  ),
};

const FILES = ['README', 'index.ts', 'styles.scss', 'package.json', 'LICENSE'];

/** Controlled, with `dismissable`: close a tab with its × or Delete, and the selection moves on. */
export const Dismissable = {
  render: function DismissableStory() {
    const [tabs, setTabs] = useState(FILES);
    const [selected, setSelected] = useState(0);
    const close = (index: number) => {
      const next = tabs.filter((_, i) => i !== index);
      setTabs(next);
      setSelected((s) =>
        index < s ? s - 1 : Math.max(0, Math.min(s, next.length - 1))
      );
    };
    return (
      <div style={{ display: 'grid', gap: 16, maxInlineSize: 640 }}>
        <Tabs
          dismissable
          selectedIndex={selected}
          onChange={({ selectedIndex }) => setSelected(selectedIndex)}
          onTabCloseRequest={close}>
          <TabList aria-label="Open files">
            {tabs.map((name) => (
              <Tab key={name}>{name}</Tab>
            ))}
          </TabList>
          <TabPanels>
            {tabs.map((name) => (
              <TabPanel key={name}>
                <p>The contents of {name}.</p>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
        <div>
          <Button
            size="sm"
            variant="outlined"
            disabled={tabs.length === FILES.length}
            onClick={() => {
              setTabs(FILES);
              setSelected(0);
            }}>
            Reopen all
          </Button>
        </div>
      </div>
    );
  },
};

const SECTIONS = [
  {
    name: 'Profile',
    secondary: 'Name and photo',
    body: 'Your name and photo, as others see them.',
  },
  {
    name: 'Notifications',
    secondary: 'Email and in-app',
    body: 'Choose what to hear about, and where. Mentions and direct messages are on by default; everything else is off.',
  },
  {
    name: 'Security',
    secondary: 'Password and keys',
    body: 'Your password, two-step sign-in and API keys.',
  },
  {
    name: 'Billing',
    secondary: 'Plan and invoices',
    body: 'Your plan.',
    disabled: true,
  },
];

/** `TabsVertical`: the list on its side, a second line under each label, the panels beside it. */
export const Vertical = {
  args: { frame: 'inset', linePosition: 'start', size: 'xl' },
  argTypes: {
    frame: { control: 'inline-radio', options: ['inset', 'ghost', 'line'] },
    linePosition: { control: 'inline-radio', options: ['start', 'end'] },
  },
  render: (args: TabsVerticalProps) => (
    <div style={{ maxInlineSize: 720 }}>
      <TabsVertical {...args}>
        <TabListVertical aria-label="Account settings">
          {SECTIONS.map((s) => (
            <Tab
              key={s.name}
              secondaryLabel={s.secondary}
              disabled={s.disabled}>
              {s.name}
            </Tab>
          ))}
        </TabListVertical>
        <TabPanels>
          {SECTIONS.map((s) => (
            <TabPanel key={s.name}>
              <p>{s.body}</p>
            </TabPanel>
          ))}
        </TabPanels>
      </TabsVertical>
    </div>
  ),
};
