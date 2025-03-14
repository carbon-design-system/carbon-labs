/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import PropTypes from 'prop-types';
import React, { createContext, useEffect, useRef, useState } from 'react';

import { MdxComponent, NonScalarNode } from '../interfaces';
import { mediaQueries, useId, useMatchMedia } from '../utils';
import Select from './select';
import { TabList } from './tab-list';

interface TabContextInterface {
  setActiveTab(tab: number): void;
  activeTab: number;
  tabList: Array<HTMLButtonElement>;
}

const TabContext = createContext<TabContextInterface>({
  setActiveTab: () => undefined,
  activeTab: -1,
  tabList: [],
});

interface TabsProps {
  children: NonScalarNode;
}

/**
 * The `<Tabs>` and `<Tab>` components are used together to display and swap between content.
 */
export const Tabs: MdxComponent<TabsProps> = (props) => {
  const tabList = useRef([]);
  const [activeTab, setActiveTab] = useState(0);
  const isMd = useMatchMedia(mediaQueries.md);
  const id = useId('tabs');

  // clear tablist when unmounted (switching between Select and TabList)
  useEffect(() => () => {
    tabList.current = [];
  });

  return (
    <TabContext.Provider
      value={{ setActiveTab, activeTab, tabList: tabList.current }}>
      {isMd && <TabList _id={id}>{props.children}</TabList>}
      {!isMd && <Select _id={id}>{props.children}</Select>}
      {React.Children.map(props.children, (child, index) => {
        return React.cloneElement(child, {
          _id: `${id}__${index}`,
          active: activeTab === index,
          index,
        });
      })}
    </TabContext.Provider>
  );
};

Tabs.propTypes = {
  /** Provide tab children */
  children: PropTypes.array.isRequired,
};

Tabs.displayName = 'Tabs';

export { TabContext };
