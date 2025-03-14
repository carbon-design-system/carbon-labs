/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import PropTypes from 'prop-types';
import React, {
  KeyboardEvent,
  ReactNode,
  useCallback,
  useContext,
} from 'react';

import { MdxComponent } from '../interfaces';
import { withPrefix } from '../utils';
import { TabContext } from './tabs';

interface TabProps {
  _id: string;
  active?: boolean | null;
  children: ReactNode;
  index: number;
  label: string;
  tab?: boolean | null;
}

export const Tab: MdxComponent<TabProps> = ({
  _id,
  label,
  active,
  index,
  tab,
  children,
}) => {
  const { setActiveTab, tabList } = useContext(TabContext);
  const buttonRef = useCallback((ref) => tabList.push(ref), [tabList]);

  const onKeyDown = (e: KeyboardEvent) => {
    let nextButton;
    switch (e.key) {
      case 'End':
        e.preventDefault();
        tabList[tabList.length - 1]?.focus();
        break;
      case 'Home':
        e.preventDefault();
        tabList[0]?.focus();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        nextButton = tabList[index - 1] || tabList[tabList.length - 1];
        nextButton?.focus();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextButton = tabList[index + 1] || tabList[0];
        nextButton?.focus();
        break;
      default:
    }
  };

  if (tab) {
    return (
      <li role="presentation">
        <button
          className={withPrefix('tab')}
          ref={buttonRef}
          onKeyDown={onKeyDown}
          onClick={() => setActiveTab(index)}
          onFocus={() => setActiveTab(index)}
          type="button"
          role="tab"
          id={`${_id}--tab`}
          tabIndex={!active ? -1 : 0}
          aria-selected={active || undefined}>
          {label}
        </button>
      </li>
    );
  }

  return (
    <section
      className={withPrefix('tab-panel')}
      hidden={!active}
      role="tabpanel"
      id={`${_id}--panel`}
      aria-labelledby={`${_id}--tab`}>
      {children}
    </section>
  );
};

Tab.propTypes = {
  /** tab id */
  _id: PropTypes.string.isRequired,
  /** Set active tab */
  active: PropTypes.bool,
  /** Provide the contents of the tab */
  children: PropTypes.node as unknown as React.Validator<React.ReactNode>,
  /** tab index */
  index: PropTypes.number.isRequired,
  /** Set tab label */
  label: PropTypes.string.isRequired,
  /** tab */
  tab: PropTypes.bool,
};

Tab.defaultProps = {
  _id: 'none',
  index: 0,
};
