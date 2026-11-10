/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import type { ElementType, MouseEvent, ReactNode } from 'react';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { Button } from '@carbon-labs/react-button';
import { Checkbox } from '@carbon-labs/react-checkbox';
import {
  Calendar,
  Folder,
  Help,
  Home,
  Report,
  Settings,
} from '@carbon-labs/react-motion-icons';
import { SideNav, SideNavGroup, SideNavLink } from '../index';
import type {
  SideNavCrossGroup,
  SideNavFrame,
  SideNavProps,
  SideNavSize,
} from '../index';
import mdx from './SideNav.mdx';

const FRAMES: SideNavFrame[] = ['inset', 'flush', 'ghost'];
const SIZES: SideNavSize[] = ['sm', 'md', 'lg'];
const CROSS: SideNavCrossGroup[] = ['jump', 'glide'];

export default {
  title: 'V12/SideNav',
  component: SideNav,
  // Typed as an element type: the memoised link names its inner row in its type.
  subcomponents: { SideNavGroup, SideNavLink: SideNavLink as ElementType },
  tags: ['alpha'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'glide',
        'jump',
        'landing',
        'pass',
        'group',
        'group-bar',
        'arrival',
        'rail',
        'ghost-container',
      ],
      reduced: {
        glide: 'shorter-clock',
        jump: 'at-once',
        group: 'shorter-clock',
        'group-bar': 'at-once',
        arrival: 'shorter-clock',
        rail: 'shorter-clock',
        'ghost-container': 'at-once',
      },
      states: ['current', 'disabled', 'open', 'shut', 'collapsed'],
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    variant: {
      control: 'inline-radio',
      options: ['inverse', 'tonal', 'outlined', 'hero'],
    },
    frame: { control: 'inline-radio', options: FRAMES },
    crossGroup: { control: 'inline-radio', options: CROSS },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    children: { control: false },
    motion: { control: false },
    filter: { control: false },
    collapsed: { control: false },
    defaultCollapsed: { control: false },
  },
};

interface Page {
  id: string;
  label: string;
  tag?: string;
  keywords?: string[];
  disabled?: boolean;
}

interface Entry {
  id: string;
  label: string;
  Icon: ElementType;
  /** A group's pages; a link has none. */
  pages?: Page[];
  external?: boolean;
}

const NAV: Entry[] = [
  { id: 'home', label: 'Home', Icon: Home },
  {
    id: 'projects',
    label: 'Projects',
    Icon: Folder,
    pages: [
      { id: 'active', label: 'Active projects' },
      { id: 'archived', label: 'Archived' },
      { id: 'templates', label: 'Templates', tag: 'New' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    Icon: Report,
    pages: [
      { id: 'usage', label: 'Usage' },
      { id: 'billing', label: 'Billing', keywords: ['invoices'] },
      { id: 'audit', label: 'Audit log', keywords: ['history'] },
      { id: 'forecast', label: 'Forecast', disabled: true },
    ],
  },
  { id: 'calendar', label: 'Calendar', Icon: Calendar },
  {
    id: 'settings',
    label: 'Settings',
    Icon: Settings,
    pages: [
      { id: 'profile', label: 'Profile' },
      { id: 'team', label: 'Team', keywords: ['members'] },
      { id: 'security', label: 'Security' },
    ],
  },
  { id: 'help', label: 'Help', Icon: Help, external: true },
];

const titleOf = (current: string) => {
  for (const e of NAV) {
    if (e.id === current) {
      return e.label;
    }
    const page = e.pages?.find((p) => p.id === current);
    if (page) {
      return page.label;
    }
  }
  return '';
};

/**
 * The nav's rows, as elements the nav reads directly (its filter and its
 * icon column read its children, so they aren't wrapped in a component).
 */
function rows(current: string, select: (id: string) => void): ReactNode[] {
  const link = (id: string) => ({
    href: `#${id}`,
    current: id === current,
    onClick: (e: MouseEvent) => {
      e.preventDefault();
      select(id);
    },
  });
  return NAV.map((e) =>
    e.pages ? (
      <SideNavGroup key={e.id} title={e.label} renderIcon={e.Icon}>
        {e.pages.map((p) => (
          <SideNavLink
            key={p.id}
            {...link(p.id)}
            tag={p.tag}
            keywords={p.keywords}
            disabled={p.disabled}>
            {p.label}
          </SideNavLink>
        ))}
      </SideNavGroup>
    ) : e.external ? (
      <SideNavLink
        key={e.id}
        href="#"
        external
        renderIcon={e.Icon}
        onClick={(ev: MouseEvent) => ev.preventDefault()}>
        {e.label}
      </SideNavLink>
    ) : (
      <SideNavLink key={e.id} {...link(e.id)} renderIcon={e.Icon}>
        {e.label}
      </SideNavLink>
    )
  );
}

const screen = {
  display: 'flex',
  boxSizing: 'border-box' as const,
  blockSize: '100vh',
  minBlockSize: 480,
  maxBlockSize: 720,
  background: 'var(--cds-background)',
};
const navColumn = {
  display: 'flex',
  flexShrink: 0,
  padding: 8,
};
/** A column of a fixed width, for a nav that doesn't fold. */
const fixedColumn = {
  ...navColumn,
  flexDirection: 'column' as const,
  inlineSize: 240,
};
const main = {
  display: 'grid',
  flex: 1,
  gap: 16,
  alignContent: 'start',
  justifyItems: 'start',
  padding: 32,
  minInlineSize: 0,
};
const text = { margin: 0, maxInlineSize: '36rem' };
const row = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

/** The page beside the nav: its title, and what the story offers. */
function Page({
  current,
  children,
}: {
  current: string;
  children?: ReactNode;
}) {
  return (
    <main style={main}>
      <h2 style={{ margin: 0 }}>{titleOf(current)}</h2>
      {children}
    </main>
  );
}

/**
 * The nav in a full-height frame. Choose a page: within a group the selector
 * glides; to another group it jumps. Fold it to a rail with the button or the
 * toggle at its foot; in the rail a group opens a flyout.
 */
export const Default = {
  args: {
    'aria-label': 'Main',
    variant: 'inverse',
    frame: 'inset',
    crossGroup: 'jump',
    still: false,
    expandOnHover: false,
    timeScale: 1,
  },
  render: function DefaultStory(args: SideNavProps) {
    const [current, setCurrent] = useState('usage');
    const [collapsed, setCollapsed] = useState(false);
    return (
      <div style={screen}>
        <div style={navColumn}>
          <SideNav
            {...args}
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}>
            {rows(current, setCurrent)}
          </SideNav>
        </div>
        <Page current={current}>
          <div style={row}>
            <Button
              size="sm"
              variant="outlined"
              aria-pressed={collapsed}
              onClick={() => setCollapsed((c) => !c)}>
              {collapsed ? 'Expand the nav' : 'Fold to a rail'}
            </Button>
            <Button
              size="sm"
              variant="outlined"
              onClick={() => setCurrent('home')}>
              Go to Home
            </Button>
            <Button
              size="sm"
              variant="outlined"
              onClick={() => setCurrent('team')}>
              Go to Team
            </Button>
          </div>
          <p style={text}>
            A page changed from outside moves the selector the same way. Shut
            the group that holds the current page: the selector leaves and a bar
            marks the group.
          </p>
        </Page>
      </div>
    );
  },
};

/** `frame`: an inset panel (default), a flush column, or ghost, where an open group is a container grown out of its header's hover. Ghost keeps one group open at a time; here its container casts the cast shadow. */
export const Frames = {
  render: function FramesStory() {
    const [current, setCurrent] = useState<Record<SideNavFrame, string>>({
      inset: 'active',
      flush: 'active',
      ghost: 'active',
    });
    return (
      <div style={{ ...screen, gap: 24, overflowX: 'auto' }}>
        {FRAMES.map((frame) => (
          <div key={frame} style={fixedColumn}>
            <p style={{ ...text, padding: '0 8px 8px', fontWeight: 600 }}>
              {frame}
            </p>
            <SideNav
              aria-label={`Main, ${frame}`}
              frame={frame}
              shadow={frame === 'ghost' ? true : undefined}>
              {rows(current[frame], (id) =>
                setCurrent((c) => ({ ...c, [frame]: id }))
              )}
            </SideNav>
          </div>
        ))}
      </div>
    );
  },
};

/** `crossGroup`: `jump` (default) goes out at the old page and comes in at the new one; `glide` travels there, not shown over the group headers it passes. */
export const CrossGroup = {
  render: function CrossGroupStory() {
    const [current, setCurrent] = useState<Record<SideNavCrossGroup, string>>({
      jump: 'archived',
      glide: 'archived',
    });
    return (
      <div style={{ ...screen, gap: 24 }}>
        {CROSS.map((crossGroup) => (
          <div key={crossGroup} style={fixedColumn}>
            <p style={{ ...text, padding: '0 8px 8px', fontWeight: 600 }}>
              {crossGroup}
            </p>
            <SideNav aria-label={`Main, ${crossGroup}`} crossGroup={crossGroup}>
              {NAV.filter((e) => e.pages).map((e) => (
                <SideNavGroup
                  key={e.id}
                  title={e.label}
                  renderIcon={e.Icon}
                  defaultOpen>
                  {(e.pages ?? []).map((p) => (
                    <SideNavLink
                      key={p.id}
                      href={`#${p.id}`}
                      current={p.id === current[crossGroup]}
                      disabled={p.disabled}
                      onClick={(ev: MouseEvent) => {
                        ev.preventDefault();
                        setCurrent((c) => ({ ...c, [crossGroup]: p.id }));
                      }}>
                      {p.label}
                    </SideNavLink>
                  ))}
                </SideNavGroup>
              ))}
            </SideNav>
          </div>
        ))}
      </div>
    );
  },
};

/** The rail: icons only, each row's label in a tooltip. A group opens a flyout menu of its pages. With `expandOnHover`, resting the pointer on the rail expands it over the page. */
export const Rail = {
  render: function RailStory() {
    const [current, setCurrent] = useState('billing');
    const [hover, setHover] = useState(true);
    return (
      <div style={screen}>
        <div style={navColumn}>
          <SideNav
            key={String(hover)}
            aria-label="Main"
            defaultCollapsed
            expandOnHover={hover}>
            {rows(current, setCurrent)}
          </SideNav>
        </div>
        <Page current={current}>
          <Checkbox
            id="side-nav-story-hover"
            labelText="Expand on hover"
            checked={hover}
            onChange={(_e, { checked }) => setHover(checked)}
          />
          <p style={text}>
            The page is in a group, so its group&apos;s icon carries the bar.
          </p>
        </Page>
      </div>
    );
  },
};

/** `filter`: a field pinned at the top narrows the nav to the matching pages, by label or keyword. Press `/` to focus it. While there is a query, the nav's changes snap. */
export const Filter = {
  render: function FilterStory() {
    const [current, setCurrent] = useState('profile');
    return (
      <div style={screen}>
        <div style={fixedColumn}>
          <SideNav aria-label="Main" filter={{ labelText: 'Filter pages' }}>
            {rows(current, setCurrent)}
          </SideNav>
        </div>
        <Page current={current}>
          <p style={text}>
            Try “invoices”, “members” or “history”: keywords match at the start
            of a word.
          </p>
        </Page>
      </div>
    );
  },
};

/** `size`: sm, md (default) and lg rows. */
export const Sizes = {
  render: function SizesStory() {
    const [current, setCurrent] = useState<Record<SideNavSize, string>>({
      sm: 'team',
      md: 'team',
      lg: 'team',
    });
    return (
      <div style={{ ...screen, gap: 24, overflowX: 'auto' }}>
        {SIZES.map((size) => (
          <div key={size} style={fixedColumn}>
            <p style={{ ...text, padding: '0 8px 8px', fontWeight: 600 }}>
              {size}
            </p>
            <SideNav aria-label={`Main, ${size}`} size={size}>
              {rows(current[size], (id) =>
                setCurrent((c) => ({ ...c, [size]: id }))
              )}
            </SideNav>
          </div>
        ))}
      </div>
    );
  },
};
