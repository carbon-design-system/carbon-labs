/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, type MouseEvent, type ReactNode } from 'react';
import { Slider } from '@carbon-labs/react-slider';
import { Button } from '@carbon-labs/react-button';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import {
  Download,
  Edit,
  Settings,
  Share,
} from '@carbon-labs/react-motion-icons';
import { PageHeader, PAGE_HEADER_FRAMES } from '../index';
import type {
  PageHeaderActionBarItem,
  PageHeaderBreadcrumb,
  PageHeaderPageAction,
  PageHeaderProps,
  PageHeaderTag,
} from '../index';
import mdx from './PageHeader.mdx';

export default {
  title: 'V12/PageHeader',
  component: PageHeader,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'collapse-and-expand',
        'title-swap',
        'details',
        'the-jump',
        'ghost-hairline',
        'soft-edge',
        'the-room-it-keeps',
        'no-fade',
      ],
      reduced: {
        'collapse-and-expand': 'at-once',
        'title-swap': 'at-once',
        details: 'at-once',
        'the-jump': 'at-once',
        'ghost-hairline': 'at-once',
        'the-room-it-keeps': 'at-once',
      },
      states: ['expanded', 'collapsed'],
    },
  },
  argTypes: {
    frame: { control: 'inline-radio', options: PAGE_HEADER_FRAMES },
    corners: { control: 'inline-radio', options: ['square', 'rounded'] },
    motion: { control: 'object' },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    breadcrumbs: { control: false },
    actionBarItems: { control: false },
    pageActions: { control: false },
    tags: { control: false },
    navigation: { control: false },
    children: { control: false },
    scrollContainer: { control: false },
    onCollapsedChange: { control: false },
  },
};

const stage = { display: 'grid', gap: 16 };
const controls = {
  display: 'flex',
  gap: 16,
  flexWrap: 'wrap' as const,
  alignItems: 'center',
};
const text = { margin: 0, maxInlineSize: '40rem' };
/** The scroll container the header sticks to and collapses with. */
const scroller = {
  position: 'relative' as const,
  overflowY: 'auto' as const,
  boxSizing: 'border-box' as const,
  blockSize: 520,
  border: '1px solid var(--cds-border-subtle-01, #c6c6c6)',
};
const body = { display: 'grid', gap: 16, padding: 16 };
const card = {
  padding: 16,
  border: '1px solid var(--cds-border-subtle-01, #e0e0e0)',
  borderRadius: 8,
};
const tabList = { display: 'flex', gap: 0, overflowX: 'auto' as const };
const tab = {
  padding: '12px 16px',
  border: 0,
  borderBlockEnd: '2px solid transparent',
  background: 'none',
  color: 'inherit',
  font: 'inherit',
  cursor: 'pointer',
};
const tabSelected = {
  ...tab,
  borderBlockEndColor: 'currentColor',
  fontWeight: 600,
};

/** A breadcrumb link that stays on the story. */
const stay = (e: MouseEvent<HTMLAnchorElement>) => e.preventDefault();

const BREADCRUMBS: PageHeaderBreadcrumb[] = [
  { key: 'home', label: 'Home', href: '#', onClick: stay },
  { key: 'projects', label: 'Projects', href: '#', onClick: stay },
  { key: 'review', label: 'Quarterly review', isCurrentPage: true },
];

const PAGE_ACTIONS: PageHeaderPageAction[] = [
  { key: 'archive', label: 'Archive', kind: 'secondary' },
  { key: 'publish', label: 'Publish' },
];

const ACTION_BAR: PageHeaderActionBarItem[] = [
  { key: 'edit', renderIcon: Edit, iconDescription: 'Edit' },
  { key: 'share', renderIcon: Share, iconDescription: 'Share' },
  { key: 'download', renderIcon: Download, iconDescription: 'Download' },
  { key: 'settings', renderIcon: Settings, iconDescription: 'Settings' },
];

const TAGS: PageHeaderTag[] = [
  { key: 'draft', label: 'Draft', type: 'gray' },
  { key: 'finance', label: 'Finance', type: 'blue' },
];

const TABS = ['Summary', 'Results', 'Notes', 'Activity'];

/** Plain tabs for the header's `navigation` row. */
function StoryTabs({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (tab: string) => void;
}) {
  return (
    <div role="tablist" aria-label="Sections" style={tabList}>
      {TABS.map((t) => (
        <button
          key={t}
          type="button"
          role="tab"
          aria-selected={t === selected}
          style={t === selected ? tabSelected : tab}
          onClick={() => onSelect(t)}>
          {t}
        </button>
      ))}
    </div>
  );
}

/** Enough content under the header to scroll it. */
function PageBody({ section }: { section: string }) {
  return (
    <div style={body} role="tabpanel" aria-label={section}>
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} style={card}>
          <h3 style={{ margin: '0 0 8px' }}>
            {section}, entry {i + 1}
          </h3>
          <p style={text}>
            Figures from every region, collected at the end of each week.
          </p>
        </div>
      ))}
    </div>
  );
}

/** A scrolling frame with the header at its top, its tabs and the content they select. */
function ScrollingPage({
  header,
  width,
}: {
  header: (navigation: ReactNode) => ReactNode;
  width?: number;
}) {
  const [section, setSection] = useState(TABS[0] ?? '');
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ ...scroller, inlineSize: width }}>
        {header(<StoryTabs selected={section} onSelect={setSection} />)}
        <PageBody section={section} />
      </div>
    </div>
  );
}

/** Scroll the frame: past 16px the header collapses to one row, and back at the top it expands. Nothing below it moves. */
export const Default = {
  args: {
    title: 'Quarterly review',
    subtitle: 'Results and notes for the current quarter.',
    breadcrumbs: BREADCRUMBS,
    pageActions: PAGE_ACTIONS,
    actionBarItems: ACTION_BAR,
    tags: TAGS,
    frame: 'flush',
    collapseHeader: false,
    hasCollapseHeaderToggle: false,
    pageHeaderOffset: 0,
    motion: { fade: true },
    timeScale: 1,
  },
  render: (args: PageHeaderProps) => (
    <ScrollingPage
      header={(navigation) => <PageHeader {...args} navigation={navigation} />}
    />
  ),
};

/** `frame="ghost"`: no surface of its own, on the ground it sits on. Collapsed, a hairline fades in under the compact row. */
export const Ghost = {
  render: () => (
    <ScrollingPage
      header={(navigation) => (
        <PageHeader
          frame="ghost"
          title="Quarterly review"
          subtitle="Results and notes for the current quarter."
          breadcrumbs={BREADCRUMBS}
          pageActions={PAGE_ACTIONS}
          actionBarItems={ACTION_BAR}
          tags={TAGS}
          navigation={navigation}
        />
      )}
    />
  ),
};

/** `hasCollapseHeaderToggle`: a button at the end of the action bar. A collapse from it keeps no room, so the content follows the header. */
export const CollapseToggle = {
  render: function CollapseToggleStory() {
    const [collapsed, setCollapsed] = useState(false);
    return (
      <div style={stage}>
        <p style={text}>
          The header is {collapsed ? 'collapsed' : 'expanded'}.
        </p>
        <ScrollingPage
          header={(navigation) => (
            <PageHeader
              title="Quarterly review"
              subtitle="Results and notes for the current quarter."
              breadcrumbs={BREADCRUMBS}
              pageActions={PAGE_ACTIONS}
              actionBarItems={ACTION_BAR}
              tags={TAGS}
              navigation={navigation}
              hasCollapseHeaderToggle
              onCollapsedChange={setCollapsed}
            />
          )}
        />
      </div>
    );
  },
};

/** `motion={{ fade: false }}`: the titles roll through a hard edge, and the slash comes and goes with no fade. */
export const NoFade = {
  render: () => (
    <ScrollingPage
      header={(navigation) => (
        <PageHeader
          motion={{ fade: false }}
          title="Quarterly review"
          subtitle="Results and notes for the current quarter."
          breadcrumbs={BREADCRUMBS}
          pageActions={PAGE_ACTIONS}
          actionBarItems={ACTION_BAR}
          tags={TAGS}
          navigation={navigation}
        />
      )}
    />
  ),
};

/** Change the frame's width. Below 672px the page actions go under the title. Where they don't fit, they fold into one menu button, and the bar's trailing items move to its overflow menu. */
export const Widths = {
  render: function WidthsStory() {
    const [width, setWidth] = useState(960);
    return (
      <div style={stage}>
        <div style={controls}>
          {[480, 720, 960].map((w) => (
            <Button
              size="sm"
              variant="outlined"
              key={w}
              aria-pressed={width === w}
              onClick={() => setWidth(w)}>
              {w}px
            </Button>
          ))}
          <div style={{ inlineSize: 320 }}>
            <Slider
              labelText="Width (px)"
              hideTextInput
              min={320}
              max={1200}
              step={8}
              value={width}
              onChange={({ value }) => setWidth(value)}
            />
          </div>
        </div>
        <ScrollingPage
          width={width}
          header={(navigation) => (
            <PageHeader
              title="Quarterly review for every region"
              subtitle="Results and notes for the current quarter."
              breadcrumbs={BREADCRUMBS}
              pageActions={[
                { key: 'export', label: 'Export', variant: 'outlined' },
                ...PAGE_ACTIONS,
              ]}
              actionBarItems={ACTION_BAR}
              tags={TAGS}
              navigation={navigation}
            />
          )}
        />
      </div>
    );
  },
};
