import { Dropdown, DropdownProps, SkeletonPlaceholder } from '@carbon/react';
import { usePrefix } from '@carbon-labs/utilities/es/index.js';
import React, { useMemo } from 'react';

export interface Workspace {
  id: string;
  label: string;
}

export type WorkspaceSelectorConfig = {
  propsOverrides: Partial<
    Omit<
      DropdownProps<Workspace>,
      'id' | 'items' | 'selectedItem' | 'setSelectedWorkspace'
    >
  >;
  allWorkspaces: Workspace[];
  selectedWorkspace?: Workspace;
  setSelectedWorkspace: (e) => void;
  isLoading?: boolean;
};

export type WorkspaceSelectorProps = {
  workspaceSelectorConfig?: WorkspaceSelectorConfig;
  userName?: string;
  isLoading?: boolean;
};

const WorkspaceSelector = ({
  workspaceSelectorConfig,
  userName,
  isLoading,
}: WorkspaceSelectorProps) => {
  const { className: dropdownCustomClass, ...dropdownOverrideProps } =
    workspaceSelectorConfig?.propsOverrides || {};

  const prefix = usePrefix();
  const blockClass = `${prefix}--animated-header`;

  const dropdownProps: DropdownProps<Workspace> | null = useMemo(() => {
    if (!workspaceSelectorConfig?.allWorkspaces) {
      return null;
    }
    return {
      id: `${blockClass}__workspace`,
      className: `${blockClass}__workspace${
        dropdownCustomClass ? ` ${dropdownCustomClass}` : ''
      }`,
      size: 'sm',
      titleText: 'Label',
      label: `Open in: ${userName}'s workspace` || `Select a workspace`,
      hideLabel: true,
      type: 'inline',
      items: workspaceSelectorConfig?.allWorkspaces,
      selectedItem: workspaceSelectorConfig?.selectedWorkspace,
      setSelectedItem: workspaceSelectorConfig?.setSelectedWorkspace,
      ...dropdownOverrideProps,
    };
  }, [
    blockClass,
    dropdownCustomClass,
    dropdownOverrideProps,
    userName,
    workspaceSelectorConfig,
  ]);

  if (isLoading || workspaceSelectorConfig?.isLoading) {
    return (
      <SkeletonPlaceholder
        className={`${blockClass}__workspace-selector-skeleton`}
      />
    );
  }

  if (!dropdownProps) {
    return null;
  }

  return <Dropdown {...dropdownProps} />;
};

export default WorkspaceSelector;
