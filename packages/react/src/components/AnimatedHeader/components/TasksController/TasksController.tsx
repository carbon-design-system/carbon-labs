/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Button,
  ButtonBaseProps,
  Dropdown,
  DropdownProps,
  SkeletonPlaceholder,
} from '@carbon/react';
import React, { useMemo } from 'react';
import { TileGroup } from '../AnimatedHeader/types';
import { usePrefix } from '@carbon-labs/utilities/es/index.js';

export interface TasksControllerConfig {
  type: 'button' | 'dropdown' | null;
  isLoading?: boolean;
  button?: {
    text: string;
    propsOverrides?: Partial<ButtonBaseProps>;
  };
  dropdown?: {
    propsOverrides?: Partial<
      Omit<DropdownProps<TileGroup>, 'id' | 'items' | 'selectedItem'>
    >;
    ariaLabel?: string;
  };
}

export type TasksControllerProps = {
  tasksControllerConfig?: TasksControllerConfig | null;
  isLoading?: boolean;
  allTileGroups?: TileGroup[];
  selectedTileGroup?: TileGroup | null;
  setSelectedTileGroup: (e) => void;
};

const TasksController = ({
  tasksControllerConfig,
  isLoading,
  allTileGroups,
  selectedTileGroup,
  setSelectedTileGroup,
}: TasksControllerProps) => {
  const { className: buttonCustomClass, ...buttonOverrideProps } =
    tasksControllerConfig?.button?.propsOverrides || {};
  const {
    className: dropdownCustomClass,
    onChange: dropdownCustomOnChange,
    ...dropdownOverrideProps
  } = tasksControllerConfig?.dropdown?.propsOverrides || {};

  const prefix = usePrefix();
  const blockClass = `${prefix}--animated-header`;

  const dropdownProps: DropdownProps<TileGroup> | null = useMemo(() => {
    if (!allTileGroups?.length) {
      return null;
    }
    return {
      id: `${blockClass}__header-dropdown`,
      className: `${blockClass}__header-dropdown${
        dropdownCustomClass ? ` ${dropdownCustomClass}` : ''
      }`,
      size: 'md',
      titleText: 'Label',
      label: allTileGroups[0]?.label ?? '',
      hideLabel: true,
      type: 'inline',
      items: allTileGroups,
      selectedItem: selectedTileGroup ?? undefined,
      onChange: (e) => {
        setSelectedTileGroup?.(e);
        dropdownCustomOnChange?.(e);
      },
      'aria-label':
        tasksControllerConfig?.dropdown?.ariaLabel ?? 'Select a task group',
      ...dropdownOverrideProps,
    };
  }, [
    allTileGroups,
    blockClass,
    dropdownCustomClass,
    selectedTileGroup,
    tasksControllerConfig?.dropdown?.ariaLabel,
    dropdownOverrideProps,
    setSelectedTileGroup,
    dropdownCustomOnChange,
  ]);

  if (!tasksControllerConfig?.type) {
    return null;
  }

  if (isLoading || tasksControllerConfig?.isLoading) {
    return (
      <SkeletonPlaceholder
        className={`${blockClass}__task-controller-skeleton`}
      />
    );
  }

  // Button
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
