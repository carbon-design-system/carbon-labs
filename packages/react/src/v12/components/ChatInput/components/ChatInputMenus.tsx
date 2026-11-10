/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, type ReactNode, type RefObject } from 'react';
import {
  Menu,
  MenuItem,
  MenuItemDivider,
  MenuItemRadioGroup,
  MenuItemSelectable,
  Theme,
  usePrefix,
} from '@carbon/react';
import { Connect, Upload } from '@carbon/icons-react';
import type { CarbonTheme } from '../internal/useInverseTheme';
import type {
  ChatInputConnection,
  ChatInputOption,
  ChatInputSetting,
} from './ChatInput';

interface InverseMenuProps {
  open: boolean;
  theme: CarbonTheme;
  triggerRef: RefObject<HTMLButtonElement | null>;
  label: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Carbon's Menu, rendered inverse. Carbon's Menu has no inverse mode, so it
 * portals into a host inside a `<Theme>` of the opposite theme, which is how
 * Carbon themes any subtree.
 *
 * The composer sits at the bottom of a view, so the menu opens above its
 * trigger. Carbon's Menu prefers below; a `y` range whose lower edge is out of
 * reach makes "below" impossible, and it still falls back to the best fit.
 */
function InverseMenu({
  open,
  theme,
  triggerRef,
  label,
  onClose,
  children,
}: InverseMenuProps) {
  const prefix = usePrefix();
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const rect = open ? triggerRef.current?.getBoundingClientRect() : undefined;
  // Carbon's Menu is position: fixed, and a transformed or contained ancestor
  // (Storybook's docs canvas, a product's animated panel) moves where fixed
  // 0,0 is. The host is a zero-size fixed box at 0,0, so its rect is that
  // origin, and the trigger's viewport rect is translated into it.
  const origin = open ? host?.getBoundingClientRect() : undefined;
  const dx = origin?.left ?? 0;
  const dy = origin?.top ?? 0;

  return (
    <Theme theme={theme} className={`${prefix}--chat-input__menu-host`}>
      <div ref={setHost} className={`${prefix}--chat-input__menu-anchor`} />
      {host && rect ? (
        <Menu
          open={open}
          label={label}
          target={host}
          size="sm"
          className={`${prefix}--chat-input__menu`}
          x={[rect.left - dx, rect.right - dx]}
          y={[rect.top - dy, rect.top - dy + window.innerHeight * 2]}
          onClose={() => {
            onClose();
            // Carbon returns focus to whatever had it when the menu opened,
            // which is the page when a click does not focus a button
            // (Safari). Focus the trigger once the menu has gone.
            requestAnimationFrame(() => triggerRef.current?.focus());
          }}>
          {children}
        </Menu>
      ) : null}
    </Theme>
  );
}

export interface ContextMenuProps {
  open: boolean;
  theme: CarbonTheme;
  triggerRef: RefObject<HTMLButtonElement | null>;
  connections: ChatInputConnection[];
  onAddFile?: () => void;
  onNewConnection?: () => void;
  onToggleConnection?: (id: string, enabled: boolean) => void;
  onClose: () => void;
}

/**
 * The `+` menu: what can be added to the model's context. A connection
 * changes what the model sees on every later turn, so it is a selectable row;
 * a file is attached to this turn only, so it is an action.
 */
export function ContextMenu({
  connections,
  onAddFile,
  onNewConnection,
  onToggleConnection,
  ...menu
}: ContextMenuProps) {
  return (
    <InverseMenu {...menu} label="Add to context">
      {connections.length > 0 ? (
        <MenuItem label="Connect to an application" renderIcon={Connect}>
          {connections.map((connection) => (
            <MenuItemSelectable
              key={connection.id}
              label={connection.label}
              selected={connection.enabled}
              disabled={Boolean(connection.unavailableReason)}
              title={connection.unavailableReason}
              onChange={(checked) =>
                onToggleConnection?.(connection.id, checked)
              }
            />
          ))}
          {onNewConnection ? <MenuItemDivider /> : null}
          {onNewConnection ? (
            <MenuItem label="New connection" onClick={onNewConnection} />
          ) : null}
        </MenuItem>
      ) : null}
      {onAddFile ? (
        <MenuItem
          label="Upload a file"
          renderIcon={Upload}
          onClick={onAddFile}
        />
      ) : null}
    </InverseMenu>
  );
}

export interface SettingsMenuProps {
  open: boolean;
  theme: CarbonTheme;
  triggerRef: RefObject<HTMLButtonElement | null>;
  models: ChatInputOption[];
  selectedModelId?: string;
  onModelChange?: (id: string) => void;
  modes: ChatInputOption[];
  selectedModeId?: string;
  onModeChange?: (id: string) => void;
  settings: ChatInputSetting[];
  onSettingChange?: (id: string, selected: boolean) => void;
  onClose: () => void;
}

const optionLabel = (option: unknown) => (option as ChatInputOption).label;

/**
 * Settings for the next turn. Model and agent mode are each one exclusive
 * choice, so they are radio groups; anything else is a selectable row.
 */
export function SettingsMenu({
  models,
  selectedModelId,
  onModelChange,
  modes,
  selectedModeId,
  onModeChange,
  settings,
  onSettingChange,
  ...menu
}: SettingsMenuProps) {
  // Each non-empty section, joined by Carbon's divider.
  const sections: ReactNode[] = [];
  if (models.length > 0) {
    sections.push(
      <MenuItemRadioGroup
        key="models"
        label="Model"
        items={models}
        itemToString={optionLabel}
        selectedItem={models.find((model) => model.id === selectedModelId)}
        onChange={(model) => onModelChange?.((model as ChatInputOption).id)}
      />
    );
  }
  if (modes.length > 0) {
    sections.push(
      <MenuItemRadioGroup
        key="modes"
        label="Agent mode"
        items={modes}
        itemToString={optionLabel}
        selectedItem={modes.find((mode) => mode.id === selectedModeId)}
        onChange={(mode) => onModeChange?.((mode as ChatInputOption).id)}
      />
    );
  }
  if (settings.length > 0) {
    sections.push(
      settings.map((setting) => (
        <MenuItemSelectable
          key={setting.id}
          label={setting.label}
          selected={setting.selected}
          onChange={(checked) => onSettingChange?.(setting.id, checked)}
        />
      ))
    );
  }

  return (
    <InverseMenu {...menu} label="Settings">
      {sections.map((section, index) => (
        <React.Fragment key={index}>
          {index > 0 ? <MenuItemDivider /> : null}
          {section}
        </React.Fragment>
      ))}
    </InverseMenu>
  );
}
