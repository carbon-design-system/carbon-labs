import {
  Button,
  ButtonBaseProps,
  Dropdown,
  DropdownProps,
  SkeletonPlaceholder,
} from '@carbon/react';
import React, { useMemo } from 'react';
import { TileGroup } from '../AnimatedHeader/AnimatedHeader';
import { usePrefix } from '@carbon-labs/utilities/es/index.js';

export interface TasksControllerConfig {
  type: 'button' | 'dropdown';
  isLoading?: boolean;
  button?: {
    text: string;
    propsOverrides?: Partial<ButtonBaseProps>;
  };
  dropdown?: {
    propsOverrides?: Partial<
      Omit<DropdownProps<TileGroup>, 'id' | 'items' | 'selectedItem'>
    >;
  };
}

export type TasksControllerProps = {
  tasksControllerConfig?: TasksControllerConfig;
  isLoading?: boolean;
  allTileGroups?: TileGroup[];
  selectedTileGroup?: TileGroup;
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
  const { className: dropdownCustomClass, ...dropdownOverrideProps } =
    tasksControllerConfig?.dropdown?.propsOverrides || {};

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
      selectedItem: selectedTileGroup,
      setSelectedItem: setSelectedTileGroup,
      ...dropdownOverrideProps,
    };
  }, [
    allTileGroups,
    selectedTileGroup,
    setSelectedTileGroup,
    blockClass,
    dropdownCustomClass,
    dropdownOverrideProps,
  ]);

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
