/**
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React, { useState, useCallback, useLayoutEffect, useRef } from 'react';
import { keys, match } from '../internal/keyboard';
import { useWindowEvent } from '../internal/useEvent';
import { usePrefix } from '../internal/usePrefix';

export interface HeaderContainerRenderProps {
  isSideNavExpanded: boolean;
  isSwitcherExpanded: boolean;
  isProfileExpanded: boolean;
  onClickSideNavExpand: () => void;
  onClickSwitcherExpand: () => void;
  onClickProfileExpand: () => void;
  themeSetting: string;
}

export type HeaderContainerProps<P extends HeaderContainerRenderProps> = {
  isSideNavExpanded?: boolean;
  isSwitcherExpanded?: boolean;
  isProfileExpanded?: boolean;
  render: React.ComponentType<P>;
  themeSetting?: string;
} & { [K in keyof Omit<P, keyof HeaderContainerRenderProps>]: P[K] };

export function HeaderContainer<P extends HeaderContainerRenderProps>({
  render: Children,
  isSideNavExpanded = false,
  isSwitcherExpanded = false,
  isProfileExpanded = false,
  themeSetting, // <-- pass this in from the story
  ...rest
}: HeaderContainerProps<P>) {
  const prefix = usePrefix();

  const [isSideNavExpandedState, setIsSideNavExpandedState] =
    useState(isSideNavExpanded);
  const [isSwitcherExpandedState, setSwitcherExpandedState] =
    useState(isSwitcherExpanded);
  const [isProfileExpandedState, setIsProfileExpandedState] =
    useState(isProfileExpanded);

  useWindowEvent('keydown', (event) => {
    if (match(event, keys.Escape)) {
      setIsSideNavExpandedState(false);
      setSwitcherExpandedState(false);
      setIsProfileExpandedState(false); // close profile on ESC
    }
  });

  const handleHeaderMenuButtonClick = useCallback(() => {
    setIsSideNavExpandedState((prev) => !prev);
  }, []);

  const handleSwitcherClick = useCallback(() => {
    setSwitcherExpandedState((prev) => !prev);
  }, []);

  const handleProfileClick = useCallback((e) => {
    if (
      !(e.target as HTMLElement).classList.contains(
        `${prefix}--content-switcher-btn`
      )
    ) {
      setIsProfileExpandedState((prev) => !prev);
    }
  }, []);

  useLayoutEffect(() => {
    setTimeout(function () {
      (
        document.querySelector(
          `.${prefix}--profile .${prefix}--content-switcher--selected`
        ) as HTMLElement
      ).focus();
    });
  }, [themeSetting]);

  return (
    <Children
      {...(rest as any)}
      isSideNavExpanded={isSideNavExpandedState}
      isSwitcherExpanded={isSwitcherExpandedState}
      isProfileExpanded={isProfileExpandedState}
      onClickSideNavExpand={handleHeaderMenuButtonClick}
      onClickSwitcherExpand={handleSwitcherClick}
      onClickProfileExpand={handleProfileClick}
      themeSetting={themeSetting}
    />
  );
}

HeaderContainer.propTypes = {
  /**
   * `true` if the profile is expanded.
   */
  isProfileExpanded: PropTypes.bool,

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
