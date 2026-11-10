/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, type ReactNode } from 'react';
import { Button } from '@carbon-labs/react-button';
import { Checkbox } from '@carbon-labs/react-checkbox';
import { Search } from '@carbon-labs/react-search';
import { Select, SelectItem } from '@carbon-labs/react-select';
import { TextInput } from '@carbon-labs/react-text-input';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { ContextualBar } from '../index';
import type {
  ContextualBarPlacement,
  ContextualBarProps,
  ContextualBarVariant,
} from '../index';
import mdx from './ContextualBar.mdx';

type Kind = NonNullable<ContextualBarProps['kind']>;

const PLACEMENTS: ContextualBarPlacement[] = ['inline', 'overlay', 'toolbar'];
const VARIANTS: ContextualBarVariant[] = ['tonal', 'inverse'];
const KINDS: Kind[] = [
  'info',
  'info-square',
  'success',
  'warning',
  'warning-alt',
  'error',
];

export default {
  title: 'V12/ContextualBar',
  component: ContextualBar,
  subcomponents: {
    'ContextualBar.Count': ContextualBar.Count,
    'ContextualBar.Swap': ContextualBar.Swap,
  },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'one-ease',
        'snap-in',
        'fold-out',
        'content',
        'sliver-guard',
        'content-fade',
        'room',
        'dock-mask',
        'count',
        'swap',
        'stillness',
      ],
      reduced: {
        'one-ease': 'at-once',
        'snap-in': 'at-once',
        'fold-out': 'at-once',
        content: 'at-once',
        'content-fade': 'at-once',
        room: 'at-once',
        'dock-mask': 'at-once',
        count: 'at-once',
        swap: 'at-once',
      },
      states: ['closed', 'open'],
    },
  },
  argTypes: {
    placement: { control: 'inline-radio', options: PLACEMENTS },
    variant: { control: 'inline-radio', options: VARIANTS },
    kind: { control: 'select', options: KINDS },
    originBand: { control: { type: 'range', min: 0, max: 0.5, step: 0.05 } },
    shadow: { control: 'boolean' },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    open: { control: false },
    children: { control: false },
  },
};

const stage = { display: 'grid', gap: 16, maxInlineSize: '48rem' };
const controls = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap' as const,
  alignItems: 'center',
};
const text = { margin: 0, maxInlineSize: '40rem' };
/** A scrolling list with no global header above it: the dock sticks at its top. */
const scroller = {
  ['--cds-contextual-bar-top' as string]: '0px',
  position: 'relative' as const,
  overflowY: 'auto' as const,
  blockSize: 360,
  border: '1px solid var(--cds-border-subtle-01, #c6c6c6)',
};
const list = { margin: 0, padding: '0 16px 16px', listStyle: 'none' };
const listRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  minBlockSize: 48,
  borderBlockEnd: '1px solid var(--cds-border-subtle-01, #e0e0e0)',
};
/** A toolbar row: the line a `toolbar` bar lies over. */
const toolbarRow = {
  position: 'relative' as const,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  minBlockSize: 48,
  paddingInline: 16,
};
const group = { display: 'inline-flex', gap: 8, flexWrap: 'wrap' as const };

const FILES = [
  'Annual report',
  'Budget draft',
  'Field notes',
  'Meeting agenda',
  'Product brief',
  'Research plan',
  'Survey results',
  'Team roster',
  'Travel policy',
  'Supplier list',
  'Style guide',
  'Weekly summary',
];

/** Which rows are selected. */
function useSelection() {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  const clear = () => setSelected(new Set());
  return { selected, toggle, clear };
}

/** The rows, each with a checkbox. */
function Rows({
  id,
  selected,
  onToggle,
}: {
  id: string;
  selected: ReadonlySet<string>;
  onToggle: (name: string) => void;
}) {
  return (
    <ul style={list} aria-label="Files">
      {FILES.map((name, i) => (
        <li key={name} style={listRow}>
          <Checkbox
            id={`${id}-${i}`}
            labelText={name}
            checked={selected.has(name)}
            onChange={() => onToggle(name)}
          />
        </li>
      ))}
    </ul>
  );
}

/** What the bar shows for a selection: a rolling count, then one item's actions or many items'. */
function SelectionActions({
  count,
  onClear,
}: {
  count: number;
  onClear: () => void;
}) {
  return (
    <>
      <ContextualBar.Count
        value={count}
        label={(n) => (n === 1 ? 'item selected' : 'items selected')}
      />
      <ContextualBar.Swap swapKey={count === 1 ? 'one' : 'many'}>
        {count === 1 ? (
          <span style={group}>
            <Button size="sm" variant="outlined">
              Rename
            </Button>
            <Button size="sm" variant="outlined">
              Share
            </Button>
            <Button size="sm" variant="outlined">
              Delete
            </Button>
          </span>
        ) : (
          <span style={group}>
            <Button size="sm" variant="outlined">
              Share
            </Button>
            <Button size="sm" variant="outlined">
              Delete
            </Button>
          </span>
        )}
      </ContextualBar.Swap>
      <Button size="sm" variant="outlined" onClick={onClear}>
        Cancel
      </Button>
    </>
  );
}

/** The list's own toolbar: a search field and its actions. */
function ToolbarFields({ children }: { children?: ReactNode }) {
  return (
    <div style={toolbarRow}>
      <Search labelText="Search" placeholder="Search files" />
      <Button size="sm" variant="outlined">
        Filter
      </Button>
      <Button size="sm" variant="outlined">
        Upload
      </Button>
      {children}
    </div>
  );
}

/** Select rows to show the bar; clear them to fold it away. The count rolls, and the actions swap between one item and many. */
export const Default = {
  args: {
    label: 'Selection',
    placement: 'inline',
    variant: 'tonal',
    kind: 'info',
    originBand: 0.5,
    shadow: false,
    timeScale: 1,
  },
  render: function DefaultStory(args: ContextualBarProps) {
    const { selected, toggle, clear } = useSelection();
    const bar = (
      <ContextualBar {...args} open={selected.size > 0}>
        <SelectionActions count={selected.size} onClear={clear} />
      </ContextualBar>
    );
    const inToolbar = args.placement === 'toolbar';
    return (
      <div style={stage}>
        <div style={scroller}>
          <ToolbarFields>{inToolbar ? bar : null}</ToolbarFields>
          {inToolbar ? null : bar}
          <Rows
            id="contextual-bar-default"
            selected={selected}
            onToggle={toggle}
          />
        </div>
      </div>
    );
  },
};

/** Inline, the default: in the flow. Its room opens and the rows glide down; scroll and it stays docked over them. */
export const Inline = {
  render: function InlineStory() {
    const { selected, toggle, clear } = useSelection();
    return (
      <div style={stage}>
        <p style={text}>
          Scroll down, then select a row: the bar grows from the edge nearer the
          press.
        </p>
        <div style={scroller}>
          <ContextualBar label="Selection" open={selected.size > 0}>
            <SelectionActions count={selected.size} onClear={clear} />
          </ContextualBar>
          <Rows
            id="contextual-bar-inline"
            selected={selected}
            onToggle={toggle}
          />
        </div>
      </div>
    );
  },
};

/** `placement="overlay"`: a pill over the rows. It takes no room, so the rows never move. */
export const Overlay = {
  render: function OverlayStory() {
    const { selected, toggle, clear } = useSelection();
    return (
      <div style={stage}>
        <div style={scroller}>
          <ContextualBar
            label="Selection"
            placement="overlay"
            open={selected.size > 0}>
            <SelectionActions count={selected.size} onClear={clear} />
          </ContextualBar>
          <Rows
            id="contextual-bar-overlay"
            selected={selected}
            onToggle={toggle}
          />
        </div>
      </div>
    );
  },
};

/** `placement="toolbar"`: the bar takes the toolbar row's place while rows are selected, and the row's own fields hide. */
export const Toolbar = {
  render: function ToolbarStory() {
    const { selected, toggle, clear } = useSelection();
    return (
      <div style={stage}>
        <div style={scroller}>
          <ToolbarFields>
            <ContextualBar
              label="Selection"
              placement="toolbar"
              open={selected.size > 0}>
              <SelectionActions count={selected.size} onClear={clear} />
            </ContextualBar>
          </ToolbarFields>
          <Rows
            id="contextual-bar-toolbar"
            selected={selected}
            onToggle={toggle}
          />
        </div>
      </div>
    );
  },
};

/** Tonal and inverse, with each status. Show the bars, then change the status. */
export const Variants = {
  render: function VariantsStory() {
    const [open, setOpen] = useState(true);
    const [kind, setKind] = useState<Kind | null>('info');
    return (
      <div style={stage}>
        <div style={controls}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setOpen((o) => !o)}>
            {open ? 'Hide the bars' : 'Show the bars'}
          </Button>
        </div>
        <div style={controls} role="group" aria-label="Status">
          <Button
            size="sm"
            variant="outlined"
            aria-pressed={kind === null}
            onClick={() => setKind(null)}>
            No status
          </Button>
          {KINDS.map((k) => (
            <Button
              size="sm"
              variant="outlined"
              key={k}
              aria-pressed={kind === k}
              onClick={() => setKind(k)}>
              {k}
            </Button>
          ))}
        </div>
        {VARIANTS.map((variant) => (
          <div key={variant} style={{ display: 'grid', gap: 8 }}>
            <h3 style={{ margin: 0 }}>{variant}</h3>
            <ContextualBar
              label={`Status, ${variant}`}
              open={open}
              variant={variant}
              kind={kind}>
              <span>3 changes waiting for review</span>
              <span style={group}>
                <Button size="sm" variant="outlined">
                  Review
                </Button>
                <Button size="sm" variant="outlined">
                  Dismiss
                </Button>
              </span>
            </ContextualBar>
            <p style={text}>The page goes on below the bar.</p>
          </div>
        ))}
      </div>
    );
  },
};

const SAVED = { name: 'Northwind', region: 'East' };

/** Change a field to show the bar; save or discard to fold it away. */
export const UnsavedChanges = {
  render: function UnsavedChangesStory() {
    const [values, setValues] = useState(SAVED);
    const [last, setLast] = useState(SAVED);
    const dirty = values.name !== last.name || values.region !== last.region;
    return (
      <div style={stage}>
        <ContextualBar label="Unsaved changes" open={dirty}>
          <span>You have unsaved changes.</span>
          <span style={group}>
            <Button
              size="sm"
              variant="outlined"
              onClick={() => setValues(last)}>
              Discard
            </Button>
            <Button
              size="sm"
              variant="outlined"
              onClick={() => setLast(values)}>
              Save
            </Button>
          </span>
        </ContextualBar>
        <div style={{ display: 'grid', gap: 16, maxInlineSize: '24rem' }}>
          <TextInput
            id="contextual-bar-name"
            labelText="Name"
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
          />
          <Select
            id="contextual-bar-region"
            labelText="Region"
            value={values.region}
            onChange={(e) => setValues({ ...values, region: e.target.value })}>
            <SelectItem value="East" text="East" />
            <SelectItem value="West" text="West" />
            <SelectItem value="Central" text="Central" />
          </Select>
        </div>
      </div>
    );
  },
};
