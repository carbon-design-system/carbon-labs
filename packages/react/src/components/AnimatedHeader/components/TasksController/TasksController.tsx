/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useMemo } from 'react';
import {
  Button,
  ButtonBaseProps,
  Dropdown,
  DropdownProps,
  SkeletonPlaceholder,
  ContentSwitcher,
  Switch,
  type ContentSwitcherProps,
} from '@carbon/react';
import { usePrefix } from '@carbon-labs/utilities/es/index.js';
import { TileGroup } from '../AnimatedHeader/types';

export interface TasksControllerConfig {
  type: 'button' | 'dropdown' | 'switcher' | null;
  isLoading?: boolean;

  button?: {
    text: string;
    propsOverrides?: Partial<ButtonBaseProps>;
  };

  dropdown?: {
    propsOverrides?: Partial<
      Omit<DropdownProps<TileGroup>, 'id' | 'items' | 'selectedItem'>
    >;
    label?: string;
    ariaLabel?: string;
  };

  switcher?: {
    visibleCount?: 2 | 3; // default 2
    propsOverrides?: Partial<
      Omit<ContentSwitcherProps, 'onChange' | 'selectedIndex'>
    >;
    ariaLabel?: string;
  };
}

export type TasksControllerProps = {
  tasksControllerConfig?: TasksControllerConfig | null;
  isLoading?: boolean;
  allTileGroups?: TileGroup[];
  selectedTileGroup?: TileGroup | null;
  setSelectedTileGroup?: (
    group: TileGroup | { selectedItem: TileGroup }
  ) => void;
};

const TasksController = ({
  tasksControllerConfig,
  isLoading,
  allTileGroups,
  selectedTileGroup,
  setSelectedTileGroup,
}: TasksControllerProps) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--animated-header`;

  /** Button overrides */
  const { className: buttonCustomClass, ...buttonOverrideProps } =
    tasksControllerConfig?.button?.propsOverrides || {};

  /** Dropdown overrides */
  const {
    className: dropdownCustomClass,
    onChange: dropdownCustomOnChange,
    ...dropdownOverrideProps
  } = tasksControllerConfig?.dropdown?.propsOverrides || {};

  /** Switcher overrides */
  const { className: switcherCustomClass, ...switcherOverrideProps } =
    tasksControllerConfig?.switcher?.propsOverrides || {};

  /** Early outs */
  if (!tasksControllerConfig?.type) return null;

  if (isLoading || tasksControllerConfig?.isLoading) {
    return (
      <SkeletonPlaceholder
        className={`${blockClass}__task-controller-skeleton`}
      />
    );
  }

  /** Button mode */
  if (
    tasksControllerConfig?.type === 'button' &&
    tasksControllerConfig?.button?.text
  ) {
    return (
      <Button
        className={`${blockClass}__button${
          buttonCustomClass ? ` ${buttonCustomClass}` : ''
        }`}
        {...buttonOverrideProps}>
        {tasksControllerConfig.button.text}
      </Button>
    );
  }

  /** Build Dropdown props (uses top-level list/selection/setter) */
  const dropdownProps: DropdownProps<TileGroup> | null = useMemo(() => {
    if (!allTileGroups?.length) return null;

    return {
      id: `${blockClass}__header-dropdown`,
      className: `${blockClass}__header-dropdown${
        dropdownCustomClass ? ` ${dropdownCustomClass}` : ''
      }`,
      size: 'md',
      titleText: 'Label',
      label:
        tasksControllerConfig?.dropdown?.label ?? allTileGroups[0]?.label ?? '',
      hideLabel: true,
      type: 'inline',
      items: allTileGroups,
      selectedItem: selectedTileGroup ?? undefined,
      onChange: (e: { selectedItem: TileGroup | null }) => {
        if (e.selectedItem) {
          setSelectedTileGroup?.({ selectedItem: e.selectedItem });
        }
        dropdownCustomOnChange?.(e);
      },
      'aria-label':
        tasksControllerConfig?.dropdown?.ariaLabel ?? 'Select a task group',
      ...dropdownOverrideProps,
    };
  }, [
    allTileGroups,
    selectedTileGroup,
    setSelectedTileGroup,
    blockClass,
    dropdownCustomClass,
    dropdownOverrideProps,
    dropdownCustomOnChange,
    tasksControllerConfig?.dropdown?.label,
    tasksControllerConfig?.dropdown?.ariaLabel,
  ]);

  /** Content Switcher mode (explicit 2 or 3; default 2) */
  if (tasksControllerConfig?.type === 'switcher') {
    if (!allTileGroups?.length) return null;

    const count = tasksControllerConfig?.switcher?.visibleCount === 3 ? 3 : 2;
    const visible = allTileGroups.slice(0, count);
    if (visible.length < 2) return null;

    const selectedIndex = Math.max(
      0,
      visible.findIndex(
        (g) =>
          g === selectedTileGroup ||
          (g as any).id === (selectedTileGroup as any)?.id ||
          (g as any).tileId === (selectedTileGroup as any)?.tileId
      )
    );

    return (
      <div className={`${blockClass}__header-switcher--container`}>
        <ContentSwitcher
          aria-label={
            tasksControllerConfig?.switcher?.ariaLabel ?? 'Select a task group'
          }
          className={`${blockClass}__header-switcher${
            switcherCustomClass ? ` ${switcherCustomClass}` : ''
          }`}
          size="md"
          selectedIndex={Number.isFinite(selectedIndex) ? selectedIndex : 0}
          onChange={({ index = 0 }: { index?: number }) => {
            const next = visible[index] ?? visible[0];
            setSelectedTileGroup?.({ selectedItem: next });
          }}
          lowContrast
          {...switcherOverrideProps}>
          {visible.map((group) => {
            const id =
              (group as any).id ?? (group as any).tileId ?? group.label;
            return (
              <Switch key={id} name={id}>
                {group.label}
              </Switch>
            );
          })}
        </ContentSwitcher>
      </div>
    );
  }

  /** Dropdown mode */
  if (tasksControllerConfig?.type === 'dropdown' && dropdownProps) {
    return (
      <div className={`${blockClass}__header-dropdown--container`}>
        <Dropdown {...dropdownProps} />
      </div>
    );
  }

  return null;
};

export default TasksController;
