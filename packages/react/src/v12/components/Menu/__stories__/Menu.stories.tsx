/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Button } from '@carbon-labs/react-button';
import React, { useEffect, useState } from 'react';
import { Checkbox } from '@carbon-labs/react-checkbox';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { useMenuTrigger } from '@carbon-labs/v12-motion';
import {
  Copy,
  Cut,
  Download,
  Edit,
  Export,
  Paste,
  Settings,
  Share,
  TrashCan,
} from '@carbon-labs/react-motion-icons';
import {
  ComboButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuItemDivider,
  MenuItemGroup,
  MenuItemRadioGroup,
  MenuItemSelectable,
  OverflowMenu,
} from '../index';
import type { ComboButtonProps, MenuAlignment, MenuProps } from '../index';
import mdx from './Menu.mdx';

const ALIGNMENTS: MenuAlignment[] = [
  'top',
  'top-start',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-end',
];

export default {
  title: 'V12/Menu',
  component: Menu,
  subcomponents: {
    MenuItem,
    MenuItemSelectable,
    MenuItemRadioGroup,
    MenuItemGroup,
    MenuItemDivider,
    MenuButton,
    OverflowMenu,
    ComboButton,
  },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'open',
        'content',
        'fade',
        'close',
        'highlight',
        'danger',
        'press',
        'submenu',
        'chevron',
        'tooltip',
        'hover',
        'press-and-release',
        'busy',
        'focus',
      ],
      reduced: {
        open: 'at-once',
        content: 'at-once',
        fade: 'at-once',
        close: 'at-once',
        highlight: 'shorter-clock',
        submenu: 'at-once',
        chevron: 'at-once',
        tooltip: 'at-once',
        hover: 'at-once',
        'press-and-release': 'at-once',
        busy: 'at-once',
      },
      states: ['closed', 'open', 'loading', 'disabled', 'busy'],
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['inverse', 'tonal', 'outlined', 'hero'],
    },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    corners: {
      control: 'inline-radio',
      options: ['rounded', 'full', 'square'],
    },
    menuAlignment: { control: 'select', options: ALIGNMENTS },
    initialFocus: {
      control: 'inline-radio',
      options: ['first', 'last', 'menu'],
    },
    outlinedFill: { control: 'inline-radio', options: ['subtle', 'raised'] },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    open: { control: false },
    anchor: { control: false },
    target: { control: false },
    origin: { control: false },
    x: { control: false },
    y: { control: false },
    motion: { control: false },
    mode: { control: false },
    children: { control: false },
  },
};

/** Room below and beside the triggers, so menus and submenus are never clipped. */
const stage = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  gap: 24,
  flexWrap: 'wrap' as const,
  padding: '32px 240px 320px',
};

/** A Menu on a plain trigger. Press it, or focus it and press Enter, Space or ↓. */
export const Default = {
  args: {
    label: 'Edit',
    variant: 'inverse',
    corners: 'rounded',
    menuAlignment: 'bottom-start',
    outline: true,
    shadow: false,
    exitFade: true,
    timeScale: 1,
  },
  render: function DefaultStory(args: MenuProps) {
    const { open, setOpen, button, setButton, origin, initialFocus, handlers } =
      useMenuTrigger({ openFrom: 'pointer', timeScale: args.timeScale });
    return (
      <div style={stage}>
        <Button
          ref={setButton}
          size="sm"
          variant="outlined"
          aria-haspopup="menu"
          aria-expanded={open}
          {...handlers}>
          Edit
        </Button>
        <Menu
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          anchor={button}
          origin={origin}
          initialFocus={initialFocus}>
          <MenuItem label="Cut" shortcut="⌘X" renderIcon={Cut} />
          <MenuItem label="Copy" shortcut="⌘C" renderIcon={Copy} />
          <MenuItem label="Paste" shortcut="⌘V" renderIcon={Paste} />
          <MenuItemDivider />
          <MenuItem label="Rename" renderIcon={Edit} />
          <MenuItem label="Download" renderIcon={Download} />
        </Menu>
      </div>
    );
  },
};

/** MenuButton: a labelled button that only opens a menu. Its chevron turns while the menu shows. */
export const WithMenuButton = {
  render: () => (
    <div style={stage}>
      <MenuButton label="Actions">
        <MenuItem label="Duplicate" />
        <MenuItem label="Move to folder" />
        <MenuItem label="Archive" />
      </MenuButton>
      <MenuButton label="Secondary" kind="secondary">
        <MenuItem label="Duplicate" />
        <MenuItem label="Move to folder" />
        <MenuItem label="Archive" />
      </MenuButton>
      <MenuButton label="Outlined" variant="outlined" menuVariant="outlined">
        <MenuItem label="Duplicate" />
        <MenuItem label="Move to folder" />
        <MenuItem label="Archive" />
      </MenuButton>
      <MenuButton label="Tonal" variant="tonal" menuVariant="tonal">
        <MenuItem label="Duplicate" />
        <MenuItem label="Move to folder" />
        <MenuItem label="Archive" />
      </MenuButton>
      <MenuButton label="Ghost" frame="ghost" size="md">
        <MenuItem label="Duplicate" />
        <MenuItem label="Move to folder" />
        <MenuItem label="Archive" />
      </MenuButton>
    </div>
  ),
};

/** OverflowMenu: an icon button that opens a menu. Its label is its tooltip. `flipped` aligns the menu's end with the trigger's. */
export const WithOverflowMenu = {
  render: () => (
    <div style={stage}>
      <OverflowMenu label="Row options">
        <MenuItem label="Open" />
        <MenuItem label="Rename" />
        <MenuItem label="Share" />
      </OverflowMenu>
      <OverflowMenu label="Row options, flipped" flipped>
        <MenuItem label="Open" />
        <MenuItem label="Rename" />
        <MenuItem label="Share" />
      </OverflowMenu>
      <OverflowMenu label="Settings" renderIcon={Settings} size="lg">
        <MenuItem label="Preferences" />
        <MenuItem label="Keyboard shortcuts" />
      </OverflowMenu>
    </div>
  ),
};

/** Corners: 8px by default, whatever the trigger's shape. `corners="full"` (or `KitDefaults corners="full"`) asks for the pill. */
export const Corners = {
  render: () => (
    <div style={stage}>
      <MenuButton label="Rounded (default)">
        <MenuItem label="Duplicate" />
        <MenuItem label="Move to folder" />
        <MenuItem label="Archive" />
      </MenuButton>
      <MenuButton label="Pill" corners="full">
        <MenuItem label="Duplicate" />
        <MenuItem label="Move to folder" />
        <MenuItem label="Archive" />
      </MenuButton>
      <MenuButton label="Square" corners="square">
        <MenuItem label="Duplicate" />
        <MenuItem label="Move to folder" />
        <MenuItem label="Archive" />
      </MenuButton>
    </div>
  ),
};

/** ComboButton: a primary action, and a chevron that opens a menu of related actions. ↓, Enter or Space on the chevron open the menu on its first row, ↑ on its last. */
export const WithComboButton = {
  args: {
    label: 'Save',
    kind: 'primary',
    variant: 'filled',
    size: 'lg',
    disabled: false,
    busy: false,
  },
  argTypes: {
    kind: { control: 'inline-radio', options: ['primary', 'secondary'] },
    variant: {
      control: 'inline-radio',
      options: ['filled', 'outlined', 'tonal'],
    },
  },
  render: (args: ComboButtonProps) => (
    <div style={stage}>
      <ComboButton {...args}>
        <MenuItem label="Save as draft" />
        <MenuItem label="Save and close" />
        <MenuItem label="Save a copy" />
      </ComboButton>
    </div>
  ),
};

/** ComboButton's looks: primary and secondary, filled, outlined and tonal. The seam between the cells follows the look. */
export const ComboButtonLooks = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      {(['primary', 'secondary'] as const).map((kind) => (
        <div key={kind} style={{ ...stage, padding: '16px 120px' }}>
          {(['filled', 'outlined', 'tonal'] as const).map((variant) => (
            <ComboButton
              key={variant}
              label="Save"
              kind={kind}
              variant={variant}
              size="md">
              <MenuItem label="Save as draft" />
              <MenuItem label="Save and close" />
            </ComboButton>
          ))}
        </div>
      ))}
    </div>
  ),
};

/** ComboButton's sizes: xs 24, sm 32, md 40 and lg 48. An xs button opens an sm menu. */
export const ComboButtonSizes = {
  render: () => (
    <div style={stage}>
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <ComboButton key={size} label="Save" size={size}>
          <MenuItem label="Save as draft" />
          <MenuItem label="Save and close" />
        </ComboButton>
      ))}
    </div>
  ),
};

/** Click Save: the action shows a spinner while it runs, and the chevron is disabled. */
export const ComboButtonBusy = {
  render: function ComboButtonBusyStory() {
    const [busy, setBusy] = useState(false);
    useEffect(() => {
      if (!busy) {
        return;
      }
      const t = window.setTimeout(() => setBusy(false), 1500);
      return () => window.clearTimeout(t);
    }, [busy]);
    return (
      <div style={stage}>
        <ComboButton label="Save" busy={busy} onClick={() => setBusy(true)}>
          <MenuItem label="Save as draft" />
          <MenuItem label="Save and close" />
          <MenuItem label="Save a copy" />
        </ComboButton>
      </div>
    );
  },
};

/** A MenuItem with MenuItems inside opens a submenu, one level deep: on hover, →, or Enter. ← and Escape go back. */
export const Submenu = {
  render: () => (
    <div style={stage}>
      <MenuButton label="File">
        <MenuItem label="New" shortcut="⌘N" />
        <MenuItem label="Open" shortcut="⌘O" />
        <MenuItem label="Export as" renderIcon={Export}>
          <MenuItem label="PDF" />
          <MenuItem label="CSV" />
          <MenuItem label="PNG" />
        </MenuItem>
        <MenuItem label="Share with" renderIcon={Share}>
          <MenuItem label="Team" />
          <MenuItem label="Organization" />
          <MenuItem label="Anyone with the link" />
        </MenuItem>
        <MenuItemDivider />
        <MenuItem label="Close" shortcut="⌘W" />
      </MenuButton>
    </div>
  ),
};

const ZOOMS = ['50%', '100%', '200%'];
const SORTS = ['Name', 'Date modified', 'Size'];

/** Checkbox rows and radio groups. The zoom rows take the keys 1 to 3 while the menu is open. */
export const Selectable = {
  render: function SelectableStory() {
    const [grid, setGrid] = useState(true);
    const [zoom, setZoom] = useState('100%');
    return (
      <div style={{ ...stage, flexDirection: 'column', alignItems: 'center' }}>
        <MenuButton label="View" kind="secondary">
          <MenuItemSelectable
            label="Show grid"
            selected={grid}
            onChange={setGrid}
          />
          <MenuItemSelectable label="Show rulers" defaultSelected={false} />
          <MenuItemDivider />
          <MenuItemRadioGroup
            label="Zoom"
            items={ZOOMS}
            selectedItem={zoom}
            onChange={setZoom}
            shortcuts
          />
          <MenuItemDivider />
          <MenuItemRadioGroup
            label="Sort by"
            items={SORTS}
            defaultSelectedItem="Name"
            mark="radio"
          />
        </MenuButton>
        <p style={{ margin: 0 }}>
          Grid {grid ? 'on' : 'off'}, zoom {zoom}
        </p>
      </div>
    );
  },
};

/** Groups with headings, dividers, and disabled rows. A disabled row with a reason stays reachable by keyboard and shows it in a tooltip. */
export const GroupsAndDividers = {
  render: () => (
    <div style={stage}>
      <OverflowMenu label="Document options">
        <MenuItemGroup label="Edit">
          <MenuItem label="Rename" renderIcon={Edit} />
          <MenuItem label="Duplicate" renderIcon={Copy} />
        </MenuItemGroup>
        <MenuItemDivider />
        <MenuItemGroup label="Share">
          <MenuItem label="Copy link" />
          <MenuItem
            label="Publish"
            disabled
            disabledReason="Only owners can publish"
          />
          <MenuItem label="Print" disabled />
        </MenuItemGroup>
      </OverflowMenu>
    </div>
  ),
};

/** A danger row: danger text, and the highlight takes the danger color. */
export const Danger = {
  render: () => (
    <div style={stage}>
      <OverflowMenu label="File options">
        <MenuItem label="Rename" renderIcon={Edit} />
        <MenuItem label="Download" renderIcon={Download} />
        <MenuItemDivider />
        <MenuItem
          label="Delete"
          kind="danger"
          dangerDescription="Deletes the file"
          renderIcon={TrashCan}
        />
      </OverflowMenu>
    </div>
  ),
};

/** A menu at a point: right-click the area, or focus it and press Shift+F10. A press anywhere else closes it. */
export const ContextMenu = {
  render: function ContextMenuStory() {
    const [open, setOpen] = useState(false);
    const [at, setAt] = useState({ x: 0, y: 0 });
    const [focus, setFocus] = useState<'first' | 'menu'>('menu');
    const show = (x: number, y: number, from: 'first' | 'menu') => {
      setAt({ x, y });
      setFocus(from);
      setOpen(true);
    };
    return (
      <div style={{ padding: '32px 32px 240px' }}>
        <button
          type="button"
          style={{
            display: 'grid',
            placeItems: 'center',
            inlineSize: '100%',
            blockSize: 240,
            border: '1px dashed currentColor',
            borderRadius: 8,
            background: 'none',
            color: 'inherit',
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            show(e.clientX, e.clientY, 'menu');
          }}
          onKeyDown={(e) => {
            if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
              e.preventDefault();
              const r = e.currentTarget.getBoundingClientRect();
              show(r.left + r.width / 2, r.top + r.height / 2, 'first');
            }
          }}>
          Right-click here
        </button>
        <Menu
          label="Canvas actions"
          open={open}
          x={at.x}
          y={at.y}
          initialFocus={focus}
          onClose={() => setOpen(false)}>
          <MenuItem label="Cut" shortcut="⌘X" />
          <MenuItem label="Copy" shortcut="⌘C" />
          <MenuItem label="Paste" shortcut="⌘V" />
          <MenuItemDivider />
          <MenuItem label="Select all" shortcut="⌘A" />
        </Menu>
      </div>
    );
  },
};

const VARIANTS = ['inverse', 'tonal', 'outlined', 'hero'] as const;

/** The four highlight looks, drawn in place with `inline`. Hover the rows, or tab in and use the arrows. */
export const Variants = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', padding: 32 }}>
      {VARIANTS.map((variant) => (
        <Menu key={variant} label={variant} variant={variant} inline>
          <MenuItem label="Cut" shortcut="⌘X" />
          <MenuItem label="Copy" shortcut="⌘C" />
          <MenuItem label="Paste" shortcut="⌘V" />
          <MenuItemDivider />
          <MenuItem label="Delete" kind="danger" />
        </Menu>
      ))}
    </div>
  ),
};

/** Placeholder rows while the items load. */
export const Loading = {
  render: function LoadingStory() {
    const [loading, setLoading] = useState(true);
    const rows = ['Production', 'Staging', 'Development'];
    return (
      <div style={{ ...stage, flexDirection: 'column', alignItems: 'center' }}>
        <Checkbox
          id="menu-loading"
          labelText="Loading"
          checked={loading}
          onChange={(_e, { checked }) => setLoading(checked)}
        />
        <MenuButton
          label="Environment"
          loading={loading}
          skeletonCount={rows.length}
          skeletonLabels={rows}>
          {loading ? null : rows.map((r) => <MenuItem key={r} label={r} />)}
        </MenuButton>
      </div>
    );
  },
};
