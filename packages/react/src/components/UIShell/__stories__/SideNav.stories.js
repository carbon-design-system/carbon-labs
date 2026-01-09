/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import mdx from './SideNav.mdx';
import { SIDE_NAV_TYPE, SideNav } from '../components/SideNav';
import { SideNavItems } from '../components/SideNavItems';
import { SideNavMenu } from '../components/SideNavMenu';
import { SideNavMenuItem } from '../components/SideNavMenuItem';
import { SideNavLink } from '../components/SideNavLink';
import { SideNavSlot } from '../components/SideNavSlot';
import { SideNavTitle } from '../components/SideNavTitle';

import { SideNavDivider, Dropdown } from '@carbon/react';
import { Add, Fade, VirtualColumnKey } from '@carbon/icons-react';

import '../components/ui-shell.scss';

export default {
  title: 'Components/UIShell/SideNav',
  component: SideNav,
  subcomponents: {
    SideNav,
    SideNavItems,
    SideNavLink,
    SideNavMenu,
    SideNavMenuItem,
    SideNavSlot,
    SideNavTitle,
  },
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

// remove before merging

/**
 * Story for SideNav Bug Issue #633
 * @returns {React.ReactElement} The JSX for the story
 */
export const Test = () => (
  <SideNav
    hideOverlay
    aria-label="Side navigation"
    navType="panel"
    isRail
    isChildOfHeader={false}>
    <SideNavItems>
      <SideNavSlot renderIcon={VirtualColumnKey}>
        <Dropdown
          id="default"
          size="sm"
          itemToString={(item) => (item ? item.text : '')}
          items={[
            { text: 'Option 1' },
            { text: 'Option 2' },
            { text: 'Option 3' },
          ]}
          label="Choose an option"
          titleText="Choose an option"
          hideLabel
        />
      </SideNavSlot>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="#">Link</SideNavMenuItem>
        <SideNavMenuItem href="#">Link</SideNavMenuItem>
        <SideNavMenuItem href="#">Link</SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="#">Link</SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="#">Link</SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="#">Link</SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="#">Link</SideNavMenuItem>
      </SideNavMenu>
      <SideNavDivider />
      <SideNavLink renderIcon={Fade} href="#">
        Link
      </SideNavLink>
      <SideNavLink renderIcon={Fade} isActive href="#">
        Link
      </SideNavLink>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="#">Link</SideNavMenuItem>
        <SideNavMenuItem href="#">Link</SideNavMenuItem>
        <SideNavMenuItem href="#">Link</SideNavMenuItem>
      </SideNavMenu>
    </SideNavItems>
  </SideNav>
);

/**
 * Story for SideNav
 * @returns {React.ReactElement} The JSX for the story
 */
export const Default = () => (
  <SideNav
    isTreeview
    isFixedNav
    expanded
    isChildOfHeader={false}
    aria-label="Side navigation">
    <SideNavItems>
      <SideNavSlot renderIcon={VirtualColumnKey}>
        <Dropdown
          id="default"
          size="sm"
          itemToString={(item) => (item ? item.text : '')}
          items={[
            { text: 'Option 1' },
            { text: 'Option 2' },
            { text: 'Option 3' },
          ]}
          label="Choose an option"
          titleText="Choose an option"
          hideLabel
        />
      </SideNavSlot>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="#">Link</SideNavMenuItem>
        <SideNavMenuItem href="#">Link</SideNavMenuItem>
        <SideNavMenuItem href="#">Link</SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="#">Link</SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="#">Link</SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="#">Link</SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="#">Link</SideNavMenuItem>
      </SideNavMenu>
      <SideNavDivider />
      <SideNavLink renderIcon={Fade} href="#">
        Link
      </SideNavLink>
      <SideNavLink renderIcon={Fade} href="#">
        Link
      </SideNavLink>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="#">Link</SideNavMenuItem>
        <SideNavMenuItem href="#">Link</SideNavMenuItem>
        <SideNavMenuItem href="#">Link</SideNavMenuItem>
      </SideNavMenu>
    </SideNavItems>
  </SideNav>
);

/**
 * Story for SideNavDoublewide
 * @returns {React.ReactElement} The JSX for the story
 */
export const SideNavDoubleWideStory = () => (
  <SideNav
    isTreeview
    isFixedNav
    expanded
    isChildOfHeader={false}
    aria-label="Side navigation">
    <SideNavItems>
      <SideNavMenu
        renderIcon={Fade}
        title="Sub-menu level 1"
        primary
        defaultExpanded>
        <SideNavSlot>
          <Dropdown
            aria-label="Choose an option"
            id="default"
            size="sm"
            itemToString={(item) => (item ? item.text : '')}
            items={[
              { text: 'Option 1' },
              { text: 'Option 2' },
              { text: 'Option 3' },
            ]}
            label="Choose an option"
            titleText="Choose an option"
            hideLabel
          />
        </SideNavSlot>
        <SideNavMenu renderIcon={Fade} title="Sub-menu level 2">
          <SideNavMenuItem href="#">Item level 3</SideNavMenuItem>
        </SideNavMenu>
        <SideNavMenuItem renderIcon={Fade} href="#">
          Item level 2
        </SideNavMenuItem>
        <SideNavMenuItem renderIcon={Fade} href="#">
          Item level 2
        </SideNavMenuItem>
        <SideNavMenuItem renderIcon={Fade} href="#">
          Item level 2
        </SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1" primary>
        <SideNavMenuItem renderIcon={Fade} href="#">
          Item level 2
        </SideNavMenuItem>
      </SideNavMenu>
      <SideNavDivider />
      <SideNavLink renderIcon={Fade} href="#">
        Link level 1
      </SideNavLink>
      <SideNavLink renderIcon={Fade} href="#">
        Link level 1
      </SideNavLink>
    </SideNavItems>
  </SideNav>
);
SideNavDoubleWideStory.storyName = 'Double Wide';

/**
 * Story for SideNav w/TreeView
 * @returns {React.ReactElement} The JSX for the story
 */
export const SideNavWithFifthLevel = () => (
  <SideNav
    isFixedNav
    expanded={true}
    isChildOfHeader={false}
    aria-label="Side navigation">
    <SideNavItems>
      <SideNavLink renderIcon={Add} href="#">
        Link level 1
      </SideNavLink>
      <SideNavMenu
        defaultExpanded={true}
        renderIcon={Fade}
        title="Sub-menu level 1">
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
        <SideNavMenu title="Sub-menu level 2" defaultExpanded={true}>
          <SideNavMenuItem href="#">Item level 3</SideNavMenuItem>
          <SideNavMenuItem href="#">Item level 3</SideNavMenuItem>
          <SideNavMenu title="Sub-menu level 3" defaultExpanded={true}>
            <SideNavMenuItem href="#">Item level 4</SideNavMenuItem>
            <SideNavMenuItem href="#">Item level 4</SideNavMenuItem>
            <SideNavMenu title="Sub-menu level 4" defaultExpanded={true}>
              <SideNavMenuItem isActive href="#">
                Item level 5
              </SideNavMenuItem>
              <SideNavMenuItem href="#">Item level 5</SideNavMenuItem>
            </SideNavMenu>
          </SideNavMenu>
        </SideNavMenu>
      </SideNavMenu>
    </SideNavItems>
  </SideNav>
);
SideNavWithFifthLevel.storyName = 'With Fifth Level';

/**
 * Story for SideNav w/TreeView icons
 * @returns {React.ReactElement} The JSX for the story
 */
export const SideNavWithFifthLevelIcons = () => (
  <SideNav
    isFixedNav
    expanded={true}
    isChildOfHeader={false}
    aria-label="Side navigation">
    <SideNavItems>
      <SideNavLink renderIcon={Fade} href="#">
        Link level 1
      </SideNavLink>
      <SideNavMenu
        defaultExpanded={true}
        renderIcon={Fade}
        title="Sub-menu level 1">
        <SideNavMenuItem renderIcon={Fade} href="#">
          Item level 2
        </SideNavMenuItem>
        <SideNavMenuItem renderIcon={Fade} href="#">
          Item level 2
        </SideNavMenuItem>
        <SideNavMenu
          renderIcon={Fade}
          title="Sub-menu level 2"
          defaultExpanded={true}>
          <SideNavMenuItem href="#">Item level 3</SideNavMenuItem>
          <SideNavMenuItem href="#">Item level 3</SideNavMenuItem>
          <SideNavMenu title="Sub-menu level 3" defaultExpanded={true}>
            <SideNavMenuItem href="#">Item level 4</SideNavMenuItem>
            <SideNavMenuItem href="#">Item level 4</SideNavMenuItem>
            <SideNavMenu title="Sub-menu level 4" defaultExpanded={true}>
              <SideNavMenuItem isActive href="#">
                Item level 5
              </SideNavMenuItem>
              <SideNavMenuItem href="#">Item level 5</SideNavMenuItem>
            </SideNavMenu>
          </SideNavMenu>
        </SideNavMenu>
      </SideNavMenu>
    </SideNavItems>
  </SideNav>
);
SideNavWithFifthLevelIcons.storyName = 'With Fifth Level Icons';

/**
 * Story for SideNav rail
 * @returns {React.ReactElement} The JSX for the story
 */
export const Rail = () => (
  <SideNav
    isRail
    hideOverlay
    isChildOfHeader={false}
    aria-label="Product navigation">
    <SideNavItems>
      <SideNavSlot renderIcon={VirtualColumnKey}>
        <Dropdown
          aria-label="Choose an option"
          id="default"
          size="sm"
          itemToString={(item) => (item ? item.text : '')}
          items={[
            { text: 'Option 1' },
            { text: 'Option 2' },
            { text: 'Option 3' },
          ]}
          label="Choose an option"
          titleText="Choose an option"
          hideLabel
        />
      </SideNavSlot>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
      </SideNavMenu>
      <SideNavDivider />
      <SideNavLink renderIcon={Fade} href="#">
        Link
      </SideNavLink>
      <SideNavLink renderIcon={Fade} href="#">
        Link
      </SideNavLink>
      <SideNavLink renderIcon={Fade} href="#">
        Link
      </SideNavLink>
      <SideNavLink renderIcon={Fade} href="#">
        Link
      </SideNavLink>
      <SideNavDivider />
      <SideNavLink renderIcon={Fade} href="#">
        Link
      </SideNavLink>
      <SideNavLink renderIcon={Fade} href="#">
        Link
      </SideNavLink>
    </SideNavItems>
  </SideNav>
);

/**
 * Story for SideNav panel with flyouts
 * @returns {React.ReactElement} The JSX for the story
 */
export const RailPanel = () => (
  <SideNav
    navType={SIDE_NAV_TYPE.RAIL_PANEL}
    hideOverlay
    isChildOfHeader={false}
    aria-label="Product navigation">
    <SideNavItems>
      <SideNavSlot renderIcon={VirtualColumnKey}>
        <Dropdown
          aria-label="Choose an option"
          id="default"
          size="sm"
          itemToString={(item) => (item ? item.text : '')}
          items={[
            { text: 'Option 1' },
            { text: 'Option 2' },
            { text: 'Option 3' },
          ]}
          label="Choose an option"
          titleText="Choose an option"
          hideLabel
        />
      </SideNavSlot>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
        <SideNavMenuItem href="#">Item level 2</SideNavMenuItem>
      </SideNavMenu>
      <SideNavDivider />
      <SideNavLink renderIcon={Fade} href="#">
        Link
      </SideNavLink>
      <SideNavLink renderIcon={Fade} href="#">
        Link
      </SideNavLink>
      <SideNavLink renderIcon={Fade} href="#">
        Link
      </SideNavLink>
      <SideNavLink renderIcon={Fade} href="#">
        Link
      </SideNavLink>
      <SideNavDivider />
      <SideNavLink renderIcon={Fade} href="#">
        Link
      </SideNavLink>
      <SideNavLink renderIcon={Fade} href="#">
        Link
      </SideNavLink>
    </SideNavItems>
  </SideNav>
);
