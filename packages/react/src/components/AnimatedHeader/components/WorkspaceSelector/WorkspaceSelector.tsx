/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Dropdown, DropdownProps, SkeletonPlaceholder } from '@carbon/react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
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
  ariaLabel?: string;
  allWorkspaces: Workspace[];
  selectedWorkspace?: Workspace | null;
  setSelectedWorkspace: (e) => void;
  isLoading?: boolean;
};

export type WorkspaceSelectorProps = {
  workspaceSelectorConfig?: WorkspaceSelectorConfig | null;
  userName?: string;
  isLoading?: boolean;
};

const WorkspaceSelector = ({
  workspaceSelectorConfig,
  userName,
  isLoading,
}: WorkspaceSelectorProps) => {
  const {
    className: dropdownCustomClass,
    onChange: dropdownCustomOnChange,
    ...dropdownOverrideProps
  } = workspaceSelectorConfig?.propsOverrides || {};

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
      selectedItem: workspaceSelectorConfig?.selectedWorkspace ?? undefined,
      onChange: (e) => {
        workspaceSelectorConfig?.setSelectedWorkspace?.(e);
        dropdownCustomOnChange?.(e);
      },
      'aria-label': workspaceSelectorConfig?.ariaLabel ?? 'Select a workspace',
      ...dropdownOverrideProps,
    };
  }, [
    blockClass,
    dropdownCustomClass,
    dropdownOverrideProps,
    userName,
    workspaceSelectorConfig,
    dropdownCustomOnChange,
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
