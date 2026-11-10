/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import type { ElementType } from 'react';
import { Menu, MenuItem, MenuItemGroup } from '@carbon-labs/react-menu';
import type { SelectionSize } from '@carbon-labs/react-selection-kit';

/* ============================================================================
 * The rail's group flyout: a Menu beside the group's icon, with the group's
 * links. Its own module, loaded on demand (`flyout.tsx`), so a nav that never
 * folds doesn't load the Menu.
 * ========================================================================== */

export interface FlyoutMenuProps {
  id: string;
  fly: {
    title: string;
    anchor: HTMLElement;
    pointer: { x: number; y: number } | null;
    place: {
      x: [number, number];
      y: [number, number];
      origin: { x: number; y: number };
    };
    entries: {
      key: string;
      entry: {
        label: string;
        Icon?: ElementType;
        current: boolean;
        disabled: boolean;
      };
      el: HTMLElement | null;
    }[];
  };
  open: boolean;
  onClose: () => void;
  size: SelectionSize;
  timeScale: number;
}

export function FlyoutMenu({
  id,
  fly,
  open,
  onClose,
  size,
  timeScale,
}: FlyoutMenuProps) {
  return (
    <Menu
      id={id}
      label={fly.title}
      open={open}
      onClose={onClose}
      anchor={fly.anchor}
      x={fly.place.x}
      y={fly.place.y}
      origin={fly.place.origin}
      initialFocus={fly.pointer ? 'menu' : 'first'}
      size={size}
      motion={{ timeScale }}>
      <MenuItemGroup label={fly.title}>
        {fly.entries.map(({ key, entry, el }) => (
          <MenuItem
            key={key}
            label={entry.label}
            renderIcon={entry.Icon}
            disabled={entry.disabled}
            className={entry.current ? 'sidenav-flyout__current' : undefined}
            // The row follows the group's own link (a router link, an
            // external one), which stays in the folded group.
            onClick={() => el?.click()}
          />
        ))}
      </MenuItemGroup>
    </Menu>
  );
}
