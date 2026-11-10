/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import {
  Analytics,
  ArrowRight,
  Bookmark,
  Download,
  Edit,
  Rocket,
  Share,
} from '@carbon-labs/react-motion-icons';
import { Card, CardSkeleton, ExpressiveCard, ProductiveCard } from '../index';
import type {
  CardActionIcon,
  CardClickZone,
  CardOverflowAction,
  CardProps,
} from '../index';
import mdx from './Card.mdx';

const PLACEMENTS = ['top', 'bottom'];
const FRAMES = ['inset', 'ghost'];
const ZONES: CardClickZone[] = ['one', 'two', 'three'];

export default {
  title: 'V12/Card',
  component: Card,
  subcomponents: { ProductiveCard, ExpressiveCard, CardSkeleton },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'rollover-text-card',
        'rollover-card-with-controls',
        'controls-inside',
        'cast-shadow',
        'snap',
        'motion-icons',
      ],
      reduced: {
        'rollover-text-card': 'at-once',
        'rollover-card-with-controls': 'at-once',
        'controls-inside': 'at-once',
        'cast-shadow': 'at-once',
      },
      states: ['rest', 'hover', 'pressed', 'focus'],
    },
  },
  argTypes: {
    actionsPlacement: { control: 'inline-radio', options: PLACEMENTS },
    primaryButtonPlacement: { control: 'inline-radio', options: PLACEMENTS },
    primaryButtonFrame: { control: 'inline-radio', options: FRAMES },
    secondaryButtonFrame: { control: 'inline-radio', options: FRAMES },
    clickZone: { control: 'inline-radio', options: ZONES },
    mediaPosition: { control: 'inline-radio', options: ['top', 'start'] },
    titleSize: { control: 'inline-radio', options: ['default', 'large'] },
    hoverSteps: { control: 'inline-radio', options: ['quiet', 'standard'] },
    shadow: { control: 'boolean' },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    actionIcons: { control: false },
    overflowActions: { control: false },
    media: { control: false },
    pictogram: { control: false },
    primaryButtonIcon: { control: false },
    secondaryButtonIcon: { control: false },
    children: { control: false },
    decorator: { control: false },
    slug: { control: false },
  },
};

const grid = {
  display: 'grid',
  gap: 16,
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  maxInlineSize: 880,
};
const stack = { display: 'grid', gap: 16, maxInlineSize: 880 };
const text = { margin: 0 };

/** A made-up picture: soft shapes on a tinted field. */
const ART = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">' +
    '<rect width="320" height="180" fill="#d0e2ff"/>' +
    '<circle cx="90" cy="120" r="70" fill="#a6c8ff"/>' +
    '<circle cx="230" cy="60" r="48" fill="#78a9ff"/>' +
    '<rect x="150" y="110" width="140" height="40" rx="20" fill="#4589ff"/>' +
    '</svg>'
)}`;

const media = (
  <img src={ART} alt="" style={{ aspectRatio: '16 / 9', objectFit: 'cover' }} />
);

const ACTION_ICONS: CardActionIcon[] = [
  { id: 'edit', icon: Edit, iconDescription: 'Edit' },
  { id: 'share', icon: Share, iconDescription: 'Share' },
];

const OVERFLOW: CardOverflowAction[] = [
  { id: 'rename', itemText: 'Rename' },
  { id: 'duplicate', itemText: 'Duplicate' },
  { id: 'archive', itemText: 'Archive', disabled: true },
  { id: 'delete', itemText: 'Delete', isDelete: true },
];

/** A card without `onClick`: a plain surface, with no hover. Its buttons are its controls. */
export const Default = {
  args: {
    label: 'Report',
    title: 'Monthly usage',
    description: 'How much of each resource the team used this month.',
    primaryButtonText: 'Open',
    secondaryButtonText: 'Share',
    actionsPlacement: 'bottom',
    primaryButtonFrame: 'inset',
    secondaryButtonFrame: 'inset',
    hoverSteps: 'quiet',
    shadow: false,
    timeScale: 1,
  },
  render: (args: CardProps) => (
    <div style={{ maxInlineSize: 360 }}>
      <Card {...args}>
        <p style={text}>Storage is at 60%. Compute is at 35%.</p>
      </Card>
    </div>
  ),
};

/** With `onClick` the card is a control: one tab stop, Enter or Space clicks it. The hover is painted behind the content and the surface grows 1px; a press insets it 1px. */
export const Clickable = {
  render: function ClickableStory() {
    const [clicks, setClicks] = useState(0);
    return (
      <div style={stack}>
        <div style={grid}>
          {(['quiet', 'standard'] as const).map((steps) => (
            <Card
              key={steps}
              hoverSteps={steps}
              label="Project"
              title={`Hover steps, ${steps}`}
              description="Hover and press the card."
              onClick={() => setClicks((n) => n + 1)}
            />
          ))}
        </div>
        <p style={text}>Clicks: {clicks}</p>
      </div>
    );
  },
};

/** Action icons and an overflow menu inside a clickable card. Over a control, the card goes to rest, and a click on a control never clicks the card. */
export const WithControls = {
  render: function WithControlsStory() {
    const [last, setLast] = useState('nothing');
    return (
      <div style={stack}>
        <div style={grid}>
          <Card
            label="Dataset"
            title="Sales by region"
            description="Updated every hour."
            onClick={() => setLast('the card')}
            actionIcons={[
              {
                id: 'download',
                icon: Download,
                iconDescription: 'Download',
                onClick: () => setLast('Download'),
              },
              {
                id: 'bookmark',
                icon: Bookmark,
                iconDescription: 'Bookmark',
                onClick: () => setLast('Bookmark'),
              },
            ]}
            overflowActions={OVERFLOW.map((a) => ({
              ...a,
              onClick: () => setLast(a.itemText),
            }))}
          />
          <Card
            label="Dataset"
            title="Orders this week"
            description="The buttons answer their own presses."
            onClick={() => setLast('the second card')}
            primaryButtonText="View"
            onPrimaryButtonClick={() => setLast('View')}
            secondaryButtonText="Export"
            onSecondaryButtonClick={() => setLast('Export')}
          />
        </div>
        <p style={text}>Last pressed: {last}</p>
      </div>
    );
  },
};

/** `shadow` turns on the cast shadow on a clickable card. It is lit from the pointer, and a press draws it in. */
export const CastShadow = {
  render: () => (
    <div style={grid}>
      <Card
        shadow
        label="Workspace"
        title="Design reviews"
        description="Move the pointer over the card."
        onClick={() => {}}
      />
      <Card
        shadow
        label="Workspace"
        title="Release notes"
        description="Tab to the card to focus it."
        onClick={() => {}}
        actionIcons={ACTION_ICONS}
      />
    </div>
  ),
};

/** ProductiveCard: dense, for product UI. The actions sit at the top and the primary button is ghost. `primaryButtonPlacement="top"` puts it in the header. */
export const Productive = {
  render: () => (
    <div style={grid}>
      <ProductiveCard
        label="Service"
        title="Queue health"
        description="Messages waiting in each queue."
        actionIcons={ACTION_ICONS}
        overflowActions={OVERFLOW}
        primaryButtonText="Details"
        primaryButtonIcon={ArrowRight}>
        <p style={text}>Twelve messages are waiting.</p>
      </ProductiveCard>
      <ProductiveCard
        titleSize="large"
        label="Service"
        title="Uptime"
        description="The last thirty days."
        primaryButtonPlacement="top"
        primaryButtonText="Open"
        overflowActions={OVERFLOW}>
        <p style={text}>99.9% across every region.</p>
      </ProductiveCard>
    </div>
  ),
};

/** ProductiveCard's `clickZone`: one, the whole card; two, the header and body; three, the header. Outside the zone a click does nothing and the hover goes to rest. */
export const ClickZones = {
  render: function ClickZonesStory() {
    const [last, setLast] = useState('none');
    return (
      <div style={stack}>
        <div style={grid}>
          {ZONES.map((zone) => (
            <ProductiveCard
              key={zone}
              clickZone={zone}
              label={`Zone ${zone}`}
              title="Build pipeline"
              description="The header is the title block."
              onClick={() => setLast(zone)}
              secondaryButtonText="Logs">
              <p style={text}>The body is this line.</p>
            </ProductiveCard>
          ))}
        </div>
        <p style={text}>Last card clicked: zone {last}</p>
      </div>
    );
  },
};

/** ExpressiveCard: media to the card's edge, or a pictogram above the title. The actions sit at the bottom. */
export const Expressive = {
  render: () => (
    <div style={grid}>
      <ExpressiveCard
        media={media}
        label="Guide"
        title="Getting started"
        description="Set up a project in a few minutes."
        primaryButtonText="Read"
        actionIcons={ACTION_ICONS}
      />
      <ExpressiveCard
        pictogram={Rocket}
        label="Guide"
        title="Launch a service"
        description="From an empty project to a running service."
        primaryButtonText="Start"
        onClick={() => {}}
      />
      <ExpressiveCard
        pictogram={Analytics}
        title="Read the numbers"
        description="A pictogram, with no buttons."
        onClick={() => {}}
      />
    </div>
  ),
};

/** `mediaPosition="start"`: the media beside the content. Right to left mirrors it. */
export const MediaStart = {
  render: () => (
    <div style={{ maxInlineSize: 560 }}>
      <ExpressiveCard
        media={media}
        mediaPosition="start"
        label="Article"
        title="Plan a migration"
        description="Move a workload in small steps, one service at a time."
        secondaryButtonText="Save"
        primaryButtonText="Read"
      />
    </div>
  ),
};

/** `actionsPlacement`: the action icons and the overflow menu at the top or the bottom. */
export const ActionsPlacement = {
  render: () => (
    <div style={grid}>
      {(['top', 'bottom'] as const).map((placement) => (
        <Card
          key={placement}
          actionsPlacement={placement}
          label="Placement"
          title={`Actions at the ${placement}`}
          description="Each action is its own control."
          actionIcons={ACTION_ICONS}
          overflowActions={OVERFLOW}
        />
      ))}
    </div>
  ),
};

/** CardSkeleton: a card, loading. Its text props are the expected text; the label and title are bars, the description a block, the media a block. */
export const Skeleton = {
  render: () => (
    <div style={grid}>
      <CardSkeleton
        label="Report"
        title="Monthly usage"
        description="How much of each resource the team used this month."
        primaryButtonText="Open"
      />
      <CardSkeleton
        media={media}
        title="Getting started"
        description="Set up a project in a few minutes."
      />
    </div>
  ),
};
