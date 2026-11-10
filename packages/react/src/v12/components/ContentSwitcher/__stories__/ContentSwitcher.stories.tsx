/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, type SVGProps } from 'react';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { Checkbox } from '@carbon/react';
import { ContentSwitcher, IconSwitch, Switch, SwitchPanels } from '../index';
import type { ContentSwitcherProps } from '../index';
import mdx from './ContentSwitcher.mdx';

export default {
  title: 'V12/ContentSwitcher',
  component: ContentSwitcher,
  subcomponents: { Switch, IconSwitch, SwitchPanels },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'glide',
        'press-and-reach',
        'drag',
        'hover',
        'tooltip',
        'content-swap',
        'container-resize',
        'loading',
      ],
      reduced: {
        glide: 'shorter-clock',
        tooltip: 'at-once',
        'content-swap': 'at-once',
        'container-resize': 'at-once',
      },
      states: ['rest', 'hover', 'pressed', 'selected', 'disabled', 'loading'],
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['inverse', 'tonal', 'outlined', 'hero'],
    },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    fit: { control: 'inline-radio', options: ['hug', 'fill'] },
    activation: { control: 'inline-radio', options: ['automatic', 'manual'] },
    corners: {
      control: 'inline-radio',
      options: ['rounded', 'full', 'square'],
    },
    interaction: { control: 'inline-radio', options: ['preview', 'lightness'] },
    outlinedFill: { control: 'inline-radio', options: ['subtle', 'raised'] },
    children: { control: false },
  },
};

const RANGES = [
  { name: 'day', text: 'Day' },
  { name: 'week', text: 'Week' },
  { name: 'month', text: 'Month' },
  { name: 'year', text: 'Year' },
];

/** A 16px glyph, as a component for `renderIcon`. */
const glyph = (d: string) =>
  function Glyph(props: SVGProps<SVGSVGElement>) {
    return (
      <svg
        width={16}
        height={16}
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
        {...props}>
        <path d={d} />
      </svg>
    );
  };

const ListIcon = glyph('M2 3.5h12v1H2zm0 4h12v1H2zm0 4h12v1H2z');
const GridIcon = glyph('M2 2h5v5H2zm7 0h5v5H9zM2 9h5v5H2zm7 0h5v5H9z');
const ChartIcon = glyph('M2 13h12v1H2zM3 8h2v4H3zm4-4h2v8H7zm4 2h2v6h-2z');

const column = {
  display: 'grid',
  gap: 24,
  justifyItems: 'start',
};

/** A time range, one picked. Press, slide or drag the selector to move it. */
export const Default = {
  args: {
    selectedIndex: 0,
    variant: 'inverse',
    size: 'md',
    fit: 'hug',
    activation: 'automatic',
  },
  render: (args: ContentSwitcherProps) => (
    <ContentSwitcher {...args} onChange={args.onChange ?? (() => {})}>
      {RANGES.map((r) => (
        <Switch key={r.name} name={r.name} text={r.text} />
      ))}
    </ContentSwitcher>
  ),
};

const VARIANTS = ['inverse', 'tonal', 'outlined', 'hero'] as const;

/** The four selector looks. */
export const Variants = {
  render: () => (
    <div style={column}>
      {VARIANTS.map((variant) => (
        <ContentSwitcher
          key={variant}
          aria-label={`Range, ${variant}`}
          variant={variant}
          selectedIndex={1}
          onChange={() => {}}>
          {RANGES.map((r) => (
            <Switch key={r.name} name={r.name} text={r.text} />
          ))}
        </ContentSwitcher>
      ))}
    </div>
  ),
};

const SIZES = ['xs', 'sm', 'md', 'lg'] as const;

/** xs, sm, md and lg; and `fit="fill"`, equal widths across the container. */
export const Sizes = {
  render: () => (
    <div style={column}>
      {SIZES.map((size) => (
        <ContentSwitcher
          key={size}
          aria-label={`Range, ${size}`}
          size={size}
          onChange={() => {}}>
          {RANGES.map((r) => (
            <Switch key={r.name} name={r.name} text={r.text} />
          ))}
        </ContentSwitcher>
      ))}
      <div style={{ inlineSize: 480 }}>
        <ContentSwitcher
          aria-label="Range, fill"
          fit="fill"
          onChange={() => {}}>
          {RANGES.map((r) => (
            <Switch key={r.name} name={r.name} text={r.text} />
          ))}
        </ContentSwitcher>
      </div>
    </div>
  ),
};

/** An icon before each label, and icon switches named by their tooltips. */
export const Icons = {
  render: () => (
    <div style={{ ...column, paddingBlockStart: 48 }}>
      <ContentSwitcher aria-label="View" onChange={() => {}}>
        <Switch name="list" text="List" renderIcon={ListIcon} />
        <Switch name="grid" text="Grid" renderIcon={GridIcon} />
        <Switch name="chart" text="Chart" renderIcon={ChartIcon} />
      </ContentSwitcher>
      <ContentSwitcher aria-label="View, icons only" onChange={() => {}}>
        <IconSwitch name="list" text="List view" renderIcon={ListIcon} />
        <IconSwitch name="grid" text="Grid view" renderIcon={GridIcon} />
        <IconSwitch name="chart" text="Chart view" renderIcon={ChartIcon} />
      </ContentSwitcher>
    </div>
  ),
};

/** A disabled switch, and one with a reason: the arrow keys still reach it, and it shows why. */
export const Disabled = {
  render: () => (
    <div style={{ ...column, paddingBlockStart: 48 }}>
      <ContentSwitcher aria-label="Range" onChange={() => {}}>
        <Switch name="day" text="Day" />
        <Switch name="week" text="Week" />
        <Switch name="month" text="Month" disabled />
        <Switch
          name="year"
          text="Year"
          disabled
          disabledReason="Not enough data for a year yet"
        />
      </ContentSwitcher>
    </div>
  ),
};

const REPORTS = [
  { name: 'summary', text: 'Summary', body: 'Spend this month, by service.' },
  {
    name: 'usage',
    text: 'Usage',
    body: 'Compute, storage and network use for each project, compared with last month. Projects over their budget are listed first.',
  },
  { name: 'alerts', text: 'Alerts', body: 'No alerts in the last 30 days.' },
];

/** Controlled, with `SwitchPanels`: the old panel goes, then the new one follows, the way the selector moved. */
export const Panels = {
  render: function PanelsStory() {
    const [selected, setSelected] = useState(0);
    return (
      <div style={{ display: 'grid', gap: 16, maxInlineSize: 480 }}>
        <ContentSwitcher
          aria-label="Report"
          selectedIndex={selected}
          onChange={({ index }) => index != null && setSelected(index)}>
          {REPORTS.map((r) => (
            <Switch key={r.name} name={r.name} text={r.text} />
          ))}
        </ContentSwitcher>
        <SwitchPanels selectedIndex={selected}>
          {REPORTS.map((r) => (
            <p key={r.name} style={{ margin: 0 }}>
              {r.body}
            </p>
          ))}
        </SwitchPanels>
        <p style={{ margin: 0 }}>Showing: {REPORTS[selected].text}</p>
      </div>
    );
  },
};

/** Switches that load: placeholder switches stand in until the switches arrive. */
export const Loading = {
  render: function LoadingStory() {
    const [loading, setLoading] = useState(true);
    return (
      <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
        <Checkbox
          id="content-switcher-story-loading"
          labelText="Loading"
          checked={loading}
          onChange={(_e, { checked }) => setLoading(checked)}
        />
        <ContentSwitcher
          aria-label="Range"
          selectedIndex={2}
          onChange={() => {}}
          loading={loading}
          skeletonCount={RANGES.length}
          skeletonLabels={RANGES.map((r) => r.text)}>
          {loading
            ? null
            : RANGES.map((r) => (
                <Switch key={r.name} name={r.name} text={r.text} />
              ))}
        </ContentSwitcher>
      </div>
    );
  },
};
