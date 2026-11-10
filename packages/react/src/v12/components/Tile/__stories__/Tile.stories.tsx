/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { Checkbox } from '@carbon-labs/react-checkbox';
import {
  CloudUpload,
  Document,
  Folder,
  Launch,
  Settings,
} from '@carbon-labs/react-motion-icons';
import {
  ClickableTile,
  ExpandableTile,
  RadioTile,
  SelectableTile,
  Tile,
  TileAboveTheFoldContent,
  TileBelowTheFoldContent,
  TileGroup,
  TileSkeleton,
} from '../index';
import type {
  ClickableTileProps,
  ExpandableTileProps,
  TileProps,
} from '../index';
import mdx from './Tile.mdx';

export default {
  title: 'V12/Tile',
  component: Tile,
  subcomponents: {
    ClickableTile,
    SelectableTile,
    RadioTile,
    TileGroup,
    ExpandableTile,
    TileAboveTheFoldContent,
    TileBelowTheFoldContent,
    TileSkeleton,
  },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'hover-text-tile',
        'hover-tile-with-controls',
        'controls-inside',
        'corner-icon',
        'selection',
        'fold',
        'fold-content',
        'expandabletile-hover',
        'above-the-fold',
      ],
      reduced: {
        'hover-text-tile': 'at-once',
        'hover-tile-with-controls': 'at-once',
        'controls-inside': 'at-once',
        'corner-icon': 'at-once',
        selection: 'at-once',
        fold: 'at-once',
        'fold-content': 'shorter-clock',
        'expandabletile-hover': 'at-once',
        'above-the-fold': 'at-once',
      },
      states: [
        'rest',
        'hover',
        'pressed',
        'selected',
        'clicked',
        'disabled',
        'expanded',
      ],
    },
  },
};

const hoverSteps = {
  control: 'inline-radio',
  options: ['quiet', 'standard'],
};
const timeScale = { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } };

const grid = {
  display: 'grid',
  gap: 16,
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  maxInlineSize: 760,
};
const stack = { display: 'grid', gap: 16, maxInlineSize: 480 };
const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};
const title = { margin: 0, fontWeight: 600 };
const text = { margin: '4px 0 0' };

/** A plain tile: a surface for content. It has no hover, since it is not a control. */
export const Default = {
  args: {
    children: 'A surface that groups related content.',
  },
  render: (args: TileProps) => (
    <div style={{ maxInlineSize: 360 }}>
      <Tile {...args} />
    </div>
  ),
};

/** ClickableTile: a button with no `href`, a link with one. The hover is painted behind the content. The arrow plays on hover and focus. */
export const Clickable = {
  argTypes: { hoverSteps, timeScale },
  args: {
    hoverSteps: 'quiet',
    timeScale: 1,
    clicked: false,
    disabled: false,
  },
  render: (args: ClickableTileProps) => (
    <div style={grid}>
      <ClickableTile {...args} onClick={() => {}}>
        <p style={title}>Run a report</p>
        <p style={text}>A button tile: Enter or Space clicks it.</p>
      </ClickableTile>
      <ClickableTile {...args} href="#">
        <p style={title}>Project settings</p>
        <p style={text}>A link tile: it goes somewhere.</p>
      </ClickableTile>
      <ClickableTile {...args} href="#" footer={<span>Draft</span>}>
        <p style={title}>Quarterly plan</p>
        <p style={text}>
          `footer` puts content at the start of the icon&apos;s row.
        </p>
      </ClickableTile>
    </div>
  ),
};

/** `hoverSteps`: quiet, half the house steps, by default; standard, the house steps. */
export const HoverSteps = {
  render: () => (
    <div style={grid}>
      {(['quiet', 'standard'] as const).map((steps) => (
        <ClickableTile key={steps} hoverSteps={steps} onClick={() => {}}>
          <p style={title}>Hover steps, {steps}</p>
          <p style={text}>Hover and press to compare.</p>
        </ClickableTile>
      ))}
    </div>
  ),
};

/** `renderIcon`: another icon, or `null` for none. With `target="_blank"`, `rel` is `noopener`. `clicked` keeps a hairline in the selection color. */
export const Icons = {
  render: () => (
    <div style={grid}>
      <ClickableTile href="#" target="_blank" renderIcon={Launch}>
        <p style={title}>Open the guide</p>
        <p style={text}>Opens in a new tab.</p>
      </ClickableTile>
      <ClickableTile href="#" renderIcon={null}>
        <p style={title}>No icon</p>
        <p style={text}>`renderIcon` is null.</p>
      </ClickableTile>
      <ClickableTile href="#" clicked>
        <p style={title}>Clicked</p>
        <p style={text}>A lasting state.</p>
      </ClickableTile>
    </div>
  ),
};

const ART = [
  { icon: Folder, name: 'Files', note: 'Every file in the project.' },
  { icon: CloudUpload, name: 'Upload', note: 'Add files from your computer.' },
  { icon: Settings, name: 'Settings', note: 'Members, roles and access.' },
];

/** Art in the content: a clickable tile is the frame for the motion icons inside it, so they play on the tile's hover and focus too. */
export const WithArt = {
  render: () => (
    <div style={grid}>
      {ART.map(({ icon: Icon, name, note }) => (
        <ClickableTile key={name} href="#">
          <Icon size={32} />
          <p style={{ ...title, marginBlockStart: 16 }}>{name}</p>
          <p style={text}>{note}</p>
        </ClickableTile>
      ))}
    </div>
  ),
};

const PLANS = [
  { id: 'tile-plan-basic', name: 'Basic', note: 'For one person.' },
  { id: 'tile-plan-team', name: 'Team', note: 'For up to ten people.' },
  { id: 'tile-plan-company', name: 'Company', note: 'For the whole company.' },
];

/** SelectableTile, controlled: each tile holds a checkbox as its tab stop. A click on the tile, Space or Enter toggles it. Selected, a steady 2px ring. */
export const Selectable = {
  render: function SelectableStory() {
    const [chosen, setChosen] = useState<string[]>(['tile-plan-team']);
    return (
      <div style={stack}>
        <div style={grid}>
          {PLANS.map((plan) => (
            <SelectableTile
              key={plan.id}
              id={plan.id}
              selected={chosen.includes(plan.id)}
              onChange={(_, selected) =>
                setChosen((c) =>
                  selected ? [...c, plan.id] : c.filter((x) => x !== plan.id)
                )
              }>
              <p style={title}>{plan.name}</p>
              <p style={text}>{plan.note}</p>
            </SelectableTile>
          ))}
        </div>
        <div style={row}>
          <Button size="sm" variant="outlined" onClick={() => setChosen([])}>
            Clear
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setChosen(PLANS.map((p) => p.id))}>
            Select all
          </Button>
        </div>
        <p style={{ margin: 0 }}>
          Selected:{' '}
          {chosen.length
            ? PLANS.filter((p) => chosen.includes(p.id))
                .map((p) => p.name)
                .join(', ')
            : 'none'}
        </p>
      </div>
    );
  },
};

/** TileGroup and RadioTile: one of a set. One tab stop; the arrow keys move the choice. Each tile shows the radio's mark. */
export const RadioTiles = {
  render: function RadioTilesStory() {
    const [value, setValue] = useState<string | number>('monthly');
    return (
      <div style={stack}>
        <TileGroup
          name="tile-billing"
          legend="Billing"
          valueSelected={value}
          onChange={(v) => setValue(v)}>
          <RadioTile value="monthly">
            <p style={title}>Monthly</p>
            <p style={text}>Pay each month.</p>
          </RadioTile>
          <RadioTile value="yearly">
            <p style={title}>Yearly</p>
            <p style={text}>Pay once a year.</p>
          </RadioTile>
          <RadioTile value="custom" disabled>
            <p style={title}>Custom</p>
            <p style={text}>Not available on this plan.</p>
          </RadioTile>
        </TileGroup>
        <p style={{ margin: 0 }}>Chosen: {value}</p>
      </div>
    );
  },
};

/** Controls inside: the innermost control owns its hover and press, and a click on it never toggles the tile. A tile with controls hovers with a 1px ring and keeps its fill. */
export const ControlsInside = {
  render: function ControlsInsideStory() {
    const [selected, setSelected] = useState(false);
    const [previews, setPreviews] = useState(0);
    return (
      <div style={stack}>
        <SelectableTile
          id="tile-controls-inside"
          selected={selected}
          onChange={(_, s) => setSelected(s)}>
          <p style={title}>Annual report</p>
          <p style={text}>
            Click the tile to select it. The button is its own.
          </p>
          <div style={{ marginBlockStart: 16 }}>
            <Button
              size="sm"
              variant="outlined"
              onClick={() => setPreviews((n) => n + 1)}>
              Preview
            </Button>
          </div>
        </SelectableTile>
        <p style={{ margin: 0 }}>
          Selected: {selected ? 'yes' : 'no'}. Previews: {previews}.
        </p>
      </div>
    );
  },
};

/** ExpandableTile: the first part shows, the second opens below it. The fold pushes what is below once; the content comes 8px down into place. */
export const Expandable = {
  argTypes: {
    hoverSteps,
    timeScale,
    toggleArea: {
      control: 'inline-radio',
      options: ['tile', 'above-the-fold'],
    },
  },
  args: {
    toggleArea: 'tile',
    hoverSteps: 'quiet',
    timeScale: 1,
    tileCollapsedLabel: 'Show more',
    tileExpandedLabel: 'Show less',
  },
  render: (args: ExpandableTileProps) => (
    <div style={stack}>
      <ExpandableTile {...args}>
        <TileAboveTheFoldContent>
          <p style={title}>Storage</p>
          <p style={text}>60% of the space is in use.</p>
        </TileAboveTheFoldContent>
        <TileBelowTheFoldContent>
          <p style={{ margin: 0 }}>
            Documents take the most space, then images. Old versions are kept
            for thirty days, then removed.
          </p>
        </TileBelowTheFoldContent>
      </ExpandableTile>
      <p style={{ margin: 0 }}>Content below the tile moves with the fold.</p>
    </div>
  ),
};

/** Controlled: the buttons set `expanded`, and `onExpandedChange` keeps the state in step with the tile's own toggle. */
export const ExpandableControlled = {
  render: function ExpandableControlledStory() {
    const [open, setOpen] = useState(false);
    return (
      <div style={stack}>
        <div style={row}>
          <Button size="sm" variant="outlined" onClick={() => setOpen(true)}>
            Open
          </Button>
          <Button size="sm" variant="outlined" onClick={() => setOpen(false)}>
            Shut
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setOpen((o) => !o)}>
            Toggle
          </Button>
        </div>
        <ExpandableTile
          expanded={open}
          onExpandedChange={setOpen}
          tileCollapsedLabel="Show details"
          tileExpandedLabel="Hide details">
          <TileAboveTheFoldContent>
            <p style={title}>Order summary</p>
            <p style={text}>Three items.</p>
          </TileAboveTheFoldContent>
          <TileBelowTheFoldContent>
            <ul style={{ margin: 0, paddingInlineStart: 20 }}>
              <li>A notebook</li>
              <li>A set of pens</li>
              <li>A desk lamp</li>
            </ul>
          </TileBelowTheFoldContent>
        </ExpandableTile>
        <p style={{ margin: 0 }}>Open: {open ? 'yes' : 'no'}</p>
      </div>
    );
  },
};

const FOLDS = ['Usage', 'Members', 'Billing'];

/** Several tiles in one container that change in one commit move as one motion. */
export const ExpandAll = {
  render: function ExpandAllStory() {
    const [open, setOpen] = useState(false);
    return (
      <div style={stack}>
        <div style={row}>
          <Button size="sm" variant="outlined" onClick={() => setOpen(true)}>
            Expand all
          </Button>
          <Button size="sm" variant="outlined" onClick={() => setOpen(false)}>
            Collapse all
          </Button>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {FOLDS.map((name) => (
            <ExpandableTile key={name} expanded={open}>
              <TileAboveTheFoldContent>
                <p style={title}>{name}</p>
              </TileAboveTheFoldContent>
              <TileBelowTheFoldContent>
                <p style={{ margin: 0 }}>
                  More about {name.toLowerCase()} shows here when the tile is
                  open.
                </p>
              </TileBelowTheFoldContent>
            </ExpandableTile>
          ))}
        </div>
      </div>
    );
  },
};

/** `toggleArea="above-the-fold"`: only the top part and the toggle's row toggle it. The opened part holds controls, so a click there never shuts it. */
export const AboveTheFold = {
  render: () => (
    <div style={stack}>
      <ExpandableTile
        toggleArea="above-the-fold"
        tileCollapsedLabel="Show options"
        tileExpandedLabel="Hide options">
        <TileAboveTheFoldContent>
          <p style={title}>Notifications</p>
          <p style={text}>Choose what reaches you.</p>
        </TileAboveTheFoldContent>
        <TileBelowTheFoldContent>
          <div style={{ display: 'grid', gap: 8 }}>
            <Checkbox
              id="tile-above-mentions"
              labelText="Mentions"
              defaultChecked
            />
            <Checkbox id="tile-above-comments" labelText="Comments" />
            <Checkbox id="tile-above-updates" labelText="Weekly updates" />
          </div>
        </TileBelowTheFoldContent>
      </ExpandableTile>
    </div>
  ),
};

/** Disabled: no hover, the content dimmed. A disabled link tile keeps the link role. */
export const Disabled = {
  render: () => (
    <div style={grid}>
      <ClickableTile disabled onClick={() => {}}>
        <p style={title}>Button tile</p>
        <p style={text}>Disabled.</p>
      </ClickableTile>
      <ClickableTile href="#" disabled>
        <p style={title}>Link tile</p>
        <p style={text}>Disabled.</p>
      </ClickableTile>
      <SelectableTile id="tile-disabled-selectable" disabled>
        <p style={title}>Selectable</p>
        <p style={text}>Disabled.</p>
      </SelectableTile>
      <SelectableTile id="tile-disabled-selected" disabled selected>
        <p style={title}>Selected</p>
        <p style={text}>Disabled.</p>
      </SelectableTile>
      <RadioTile value="off" name="tile-disabled-radio" disabled checked>
        <p style={title}>Radio tile</p>
        <p style={text}>Disabled, chosen.</p>
      </RadioTile>
    </div>
  ),
};

/** TileSkeleton: the whole tile is one block. Its expected content sizes it, unseen. */
export const Skeleton = {
  render: () => (
    <div style={grid}>
      <TileSkeleton>
        <Document size={32} />
        <p style={{ ...title, marginBlockStart: 16 }}>Expected title</p>
        <p style={text}>Expected content, two lines long at this width.</p>
      </TileSkeleton>
      <TileSkeleton />
    </div>
  ),
};
