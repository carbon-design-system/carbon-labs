/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, type MouseEvent } from 'react';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { MenuItem, OverflowMenu } from '@carbon-labs/react-menu';
import { Button } from '@carbon-labs/react-button';
import { Checkbox } from '@carbon-labs/react-checkbox';
import { Breadcrumb, BreadcrumbItem, BreadcrumbSkeleton } from '../index';
import type { BreadcrumbProps } from '../index';
import mdx from './Breadcrumb.mdx';

export default {
  title: 'V12/Breadcrumb',
  component: Breadcrumb,
  subcomponents: { BreadcrumbItem, BreadcrumbSkeleton },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'rollover-link-form',
        'snap-floating',
        'list-reflow',
        'removal',
        'slash',
        'interruption',
      ],
      reduced: {
        'snap-floating': 'at-once',
      },
      states: ['rest', 'hover', 'press', 'focus', 'current'],
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    children: { control: false },
  },
};

/** Room below the trail, so an overflow menu is never clipped. */
const stage = { padding: '16px 16px 240px' };

/** Three levels and the current page. Hover a link for the rollover, press it for the release circle. */
export const Default = {
  args: {
    'aria-label': 'Breadcrumb',
    size: 'md',
    noTrailingSlash: false,
    timeScale: 1,
  },
  render: (args: BreadcrumbProps) => (
    <Breadcrumb {...args}>
      <BreadcrumbItem href="#">Home</BreadcrumbItem>
      <BreadcrumbItem href="#">Projects</BreadcrumbItem>
      <BreadcrumbItem href="#">Reports</BreadcrumbItem>
      <BreadcrumbItem isCurrentPage>Quarterly summary</BreadcrumbItem>
    </Breadcrumb>
  ),
};

/** The levels in the middle, collapsed into an OverflowMenu. */
export const WithOverflowMenu = {
  render: () => (
    <div style={stage}>
      <Breadcrumb>
        <BreadcrumbItem href="#">Home</BreadcrumbItem>
        <BreadcrumbItem>
          <OverflowMenu label="More levels">
            <MenuItem label="Projects" />
            <MenuItem label="Design" />
            <MenuItem label="Reports" />
          </OverflowMenu>
        </BreadcrumbItem>
        <BreadcrumbItem href="#">Archive</BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>Quarterly summary</BreadcrumbItem>
      </Breadcrumb>
    </div>
  ),
};

/** No slash after the last crumb. Toggle it to see the slash fade. */
export const NoTrailingSlash = {
  render: function NoTrailingSlashStory() {
    const [noSlash, setNoSlash] = useState(true);
    return (
      <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
        <Checkbox
          id="breadcrumb-story-no-slash"
          labelText="No trailing slash"
          checked={noSlash}
          onChange={(_e, { checked }) => setNoSlash(checked)}
        />
        <Breadcrumb noTrailingSlash={noSlash}>
          <BreadcrumbItem href="#">Home</BreadcrumbItem>
          <BreadcrumbItem href="#">Projects</BreadcrumbItem>
          <BreadcrumbItem href="#">Reports</BreadcrumbItem>
        </Breadcrumb>
      </div>
    );
  },
};

/** `md` (the default) and `sm`. */
export const Sizes = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {(['md', 'sm'] as const).map((size) => (
        <Breadcrumb key={size} size={size} aria-label={`Breadcrumb, ${size}`}>
          <BreadcrumbItem href="#">Home</BreadcrumbItem>
          <BreadcrumbItem href="#">Projects</BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>Size {size}</BreadcrumbItem>
        </Breadcrumb>
      ))}
    </div>
  ),
};

/** In a narrow container the crumbs wrap onto more lines; each crumb stays on one. */
export const NarrowContainer = {
  render: () => (
    <div
      style={{
        inlineSize: 240,
        border: '1px dashed currentColor',
        padding: 8,
      }}>
      <Breadcrumb>
        <BreadcrumbItem href="#">Home</BreadcrumbItem>
        <BreadcrumbItem href="#">Projects</BreadcrumbItem>
        <BreadcrumbItem href="#">Design system</BreadcrumbItem>
        <BreadcrumbItem href="#">Components</BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>Getting started</BreadcrumbItem>
      </Breadcrumb>
    </div>
  ),
};

const FOLDERS = ['Projects', 'Design', 'Reports', 'Archive', 'Drafts', 'Notes'];

/**
 * A trail that changes. Open a folder to add a level; pick a crumb to go back
 * up. Past four levels, the middle ones collapse into an overflow menu.
 */
export const ChangingTrail = {
  render: function ChangingTrailStory() {
    const [depth, setDepth] = useState(2);
    const path = ['Home', ...FOLDERS.slice(0, depth)];
    const go = (i: number) => setDepth(i);
    const link = (i: number) => (
      <BreadcrumbItem key={path[i]}>
        <a
          href={`#${String(path[i]).toLowerCase()}`}
          onClick={(e: MouseEvent) => {
            e.preventDefault();
            go(i);
          }}>
          {path[i]}
        </a>
      </BreadcrumbItem>
    );
    const last = path.length - 1;
    const current = (
      <BreadcrumbItem key={path[last]} isCurrentPage>
        {path[last]}
      </BreadcrumbItem>
    );
    const crumbs =
      path.length > 4
        ? [
            link(0),
            <BreadcrumbItem key="overflow">
              <OverflowMenu label="More levels">
                {path.slice(1, last - 1).map((name, j) => (
                  <MenuItem key={name} label={name} onClick={() => go(j + 1)} />
                ))}
              </OverflowMenu>
            </BreadcrumbItem>,
            link(last - 1),
            current,
          ]
        : [...path.slice(0, last).map((_, i) => link(i)), current];
    return (
      <div
        style={{ ...stage, display: 'grid', gap: 16, justifyItems: 'start' }}>
        <Button
          size="sm"
          variant="outlined"
          disabled={depth >= FOLDERS.length}
          onClick={() => setDepth((d) => d + 1)}>
          Open a folder
        </Button>
        <Breadcrumb>{crumbs}</Breadcrumb>
      </div>
    );
  },
};

/** Loading: the slashes, and a bar for each crumb. */
export const Skeleton = {
  render: () => <BreadcrumbSkeleton count={4} />,
};
