/**
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React, { useState, useCallback } from 'react';
import { keys, match } from '../internal/keyboard';
import { useWindowEvent } from '../internal/useEvent';

export interface HeaderContainerRenderProps {
  isSideNavExpanded: boolean;
  isSwitcherExpanded: boolean;
  onClickSideNavExpand: () => void;
  onClickSwitcherExpand: () => void;
}

export type HeaderContainerProps<P extends HeaderContainerRenderProps> = {
  isSideNavExpanded?: boolean;
  isSwitcherExpanded?: boolean;
  render: React.ComponentType<P>;
} & { [K in keyof Omit<P, keyof HeaderContainerRenderProps>]: P[K] };

export function HeaderContainer<P extends HeaderContainerRenderProps>({
  render: Children,
  isSideNavExpanded = false,
  isSwitcherExpanded = false,
  ...rest
}: HeaderContainerProps<P>) {
  const [isSideNavExpandedState, setIsSideNavExpandedState] =
    useState(isSideNavExpanded);
  const [isSwitcherExpandedState, setSwitcherExpandedState] =
    useState(isSwitcherExpanded);

  useWindowEvent('keydown', (event) => {
    if (match(event, keys.Escape)) {
      setIsSideNavExpandedState(false);
      setSwitcherExpandedState(false);
    }
  });

  const handleHeaderMenuButtonClick = useCallback(() => {
    setIsSideNavExpandedState(
      (prevIsSideNavExpanded) => !prevIsSideNavExpanded
    );
  }, [setIsSideNavExpandedState]);

  const handleSwitcherClick = useCallback(() => {
    setSwitcherExpandedState(
      (prevIsSwitcherExpanded) => !prevIsSwitcherExpanded
    );
  }, [setSwitcherExpandedState]);

  return (
    <Children
      {...(rest as any)}
      isSideNavExpanded={isSideNavExpandedState}
      isSwitcherExpanded={isSwitcherExpandedState}
      onClickSideNavExpand={handleHeaderMenuButtonClick}
      onClickSwitcherExpand={handleSwitcherClick}
    />
  );
}

HeaderContainer.propTypes = {
  /**
   * `true` if the side navigation is expanded.
   */
  isSideNavExpanded: PropTypes.bool,

  /**
   * `true` if the switcher is expanded.
   */
  isSwitcherExpanded: PropTypes.bool,

  /**
   * A function or a component that is invoked with `isSideNavExpanded` and `onClickSideNavExpand`.
   * The function or component can then use those properties to within the components it
   * returns, such as with the HeaderMenuButton and SideNav components. Additional props will also be passed
   * into this component for convenience.
   */
  render: PropTypes.elementType.isRequired,
};

HeaderContainer.displayName = 'HeaderContainer';

export default HeaderContainer;
