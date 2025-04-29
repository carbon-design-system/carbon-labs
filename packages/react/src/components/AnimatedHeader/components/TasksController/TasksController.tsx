import {
  Button,
  ButtonBaseProps,
  Dropdown,
  DropdownProps,
  SkeletonPlaceholder,
  usePrefix,
} from '@carbon/react';
import React, { useMemo } from 'react';
import { TileGroup } from '../AnimatedHeader/AnimatedHeader';

export interface TasksControllerConfig {
  type: 'button' | 'dropdown';
  button?: {
    text: string;
    propsOverrides?: Partial<ButtonBaseProps>;
  };
  dropdown?: {
    allTileGroups?: TileGroup[];
    selectedTileGroup?: TileGroup;
    setSelectedTileGroup: (e) => void;
    propsOverrides?: Partial<
      Omit<DropdownProps<TileGroup>, 'id' | 'items' | 'selectedItem'>
    >;
  };
}

export type TasksControllerProps = {
  tasksControllerConfig?: TasksControllerConfig;
  isLoading?: boolean;
};

const TasksController = ({
  tasksControllerConfig,
  isLoading,
}: TasksControllerProps) => {
  const { className: buttonCustomClass, ...buttonOverrideProps } =
    tasksControllerConfig?.button?.propsOverrides || {};
  const { className: dropdownCustomClass, ...dropdownOverrideProps } =
    tasksControllerConfig?.dropdown?.propsOverrides || {};

  const prefix = usePrefix();
  const blockClass = `${prefix}--animated-header`;

  const dropdownProps: DropdownProps<TileGroup> | null = useMemo(() => {
    if (!tasksControllerConfig?.dropdown?.allTileGroups) {
      return null;
    }
    return {
      id: `${blockClass}__header-dropdown`,
      className: `${blockClass}__header-dropdown${
        dropdownCustomClass ? ` ${dropdownCustomClass}` : ''
      }`,
      size: 'md',
      titleText: 'Label',
      label: tasksControllerConfig.dropdown.allTileGroups[0].label ?? '',
      hideLabel: true,
      type: 'inline',
      items: tasksControllerConfig.dropdown.allTileGroups,
      selectedItem: tasksControllerConfig.dropdown.selectedTileGroup,
      setSelectedItem: tasksControllerConfig.dropdown.setSelectedTileGroup,
      ...dropdownOverrideProps,
    };
  }, [
    blockClass,
    dropdownCustomClass,
    dropdownOverrideProps,
    tasksControllerConfig?.dropdown,
  ]);

  if (isLoading) {
    return <SkeletonPlaceholder />;
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
