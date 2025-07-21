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
import { SideNav } from '../components/SideNav';
import { SideNavItems } from '../components/SideNavItems';
import { SideNavMenu } from '../components/SideNavMenu';
import { SideNavMenuItem } from '../components/SideNavMenuItem';
import { SideNavLink } from '../components/SideNavLink';
import { SideNavSlot } from '../components/SideNavSlot';

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
  },
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

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
      <SideNavDivider />
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Link
        </SideNavMenuItem>
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Link
        </SideNavMenuItem>
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Link
        </SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Link
        </SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Link
        </SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Link
        </SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Link
        </SideNavMenuItem>
      </SideNavMenu>
      <SideNavDivider />
      <SideNavLink renderIcon={Fade} href="http://www.carbondesignsystem.com">
        Link
      </SideNavLink>
      <SideNavLink renderIcon={Fade} href="http://www.carbondesignsystem.com">
        Link
      </SideNavLink>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Link
        </SideNavMenuItem>
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Link
        </SideNavMenuItem>
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Link
        </SideNavMenuItem>
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
        <SideNavDivider />
        <SideNavMenu renderIcon={Fade} title="Sub-menu level 2">
          <SideNavMenuItem href="http://www.carbondesignsystem.com">
            Item level 3
          </SideNavMenuItem>
        </SideNavMenu>
        <SideNavMenuItem
          renderIcon={Fade}
          href="http://www.carbondesignsystem.com">
          Item level 2
        </SideNavMenuItem>
        <SideNavMenuItem
          renderIcon={Fade}
          href="http://www.carbondesignsystem.com">
          Item level 2
        </SideNavMenuItem>
        <SideNavMenuItem
          renderIcon={Fade}
          href="http://www.carbondesignsystem.com">
          Item level 2
        </SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1" primary>
        <SideNavMenuItem
          renderIcon={Fade}
          href="http://www.carbondesignsystem.com">
          Item level 2
        </SideNavMenuItem>
      </SideNavMenu>
      <SideNavDivider />
      <SideNavLink renderIcon={Fade} href="http://www.carbondesignsystem.com">
        Link level 1
      </SideNavLink>
      <SideNavLink renderIcon={Fade} href="http://www.carbondesignsystem.com">
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
export const SideNavWithThirdLevel = () => (
  <SideNav
    isFixedNav
    expanded={true}
    isChildOfHeader={false}
    aria-label="Side navigation">
    <SideNavItems>
      <SideNavLink renderIcon={Add} href="http://www.carbondesignsystem.com">
        Link level 1
      </SideNavLink>
      <SideNavMenu
        defaultExpanded={true}
        renderIcon={Fade}
        title="Sub-menu level 1">
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Item level 2
        </SideNavMenuItem>
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Item level 2
        </SideNavMenuItem>
        <SideNavMenu title="Sub-menu level 2" defaultExpanded={true}>
          <SideNavMenuItem href="http://www.carbondesignsystem.com">
            Item level 3
          </SideNavMenuItem>
          <SideNavMenuItem href="http://www.carbondesignsystem.com">
            Item level 3
          </SideNavMenuItem>
          <SideNavMenu
            renderIcon={Fade}
            title="Sub-menu level 3"
            defaultExpanded={true}>
            <SideNavMenuItem href="http://www.carbondesignsystem.com">
              Item level 4
            </SideNavMenuItem>
            <SideNavMenuItem href="http://www.carbondesignsystem.com">
              Item level 4
            </SideNavMenuItem>
            <SideNavMenu
              renderIcon={Fade}
              title="Sub-menu level 4"
              defaultExpanded={true}>
              <SideNavMenuItem
                isActive
                href="http://www.carbondesignsystem.com">
                Item level 5
              </SideNavMenuItem>
              <SideNavMenuItem href="http://www.carbondesignsystem.com">
                Item level 5
              </SideNavMenuItem>
            </SideNavMenu>
          </SideNavMenu>
        </SideNavMenu>
      </SideNavMenu>
    </SideNavItems>
  </SideNav>
);
SideNavWithThirdLevel.storyName = 'With Third Level';

/**
 * Story for SideNav w/TreeView icons
 * @returns {React.ReactElement} The JSX for the story
 */
export const SideNavWithThirdLevelIcons = () => (
  <SideNav
    isFixedNav
    expanded={true}
    isChildOfHeader={false}
    aria-label="Side navigation">
    <SideNavItems>
      <SideNavLink renderIcon={Fade} href="http://www.carbondesignsystem.com">
        Link level 1
      </SideNavLink>
      <SideNavMenu
        defaultExpanded={true}
        renderIcon={Fade}
        title="Sub-menu level 1">
        <SideNavMenuItem
          renderIcon={Fade}
          href="http://www.carbondesignsystem.com">
          Item level 2
        </SideNavMenuItem>
        <SideNavMenuItem
          renderIcon={Fade}
          href="http://www.carbondesignsystem.com">
          Item level 2
        </SideNavMenuItem>
        <SideNavMenu
          renderIcon={Fade}
          title="Sub-menu level 2"
          defaultExpanded={true}>
          <SideNavMenuItem href="http://www.carbondesignsystem.com">
            Item level 3
          </SideNavMenuItem>
          <SideNavMenuItem href="http://www.carbondesignsystem.com">
            Item level 3
          </SideNavMenuItem>
          <SideNavMenu
            renderIcon={Fade}
            title="Sub-menu level 3"
            defaultExpanded={true}>
            <SideNavMenuItem href="http://www.carbondesignsystem.com">
              Item level 4
            </SideNavMenuItem>
            <SideNavMenuItem href="http://www.carbondesignsystem.com">
              Item level 4
            </SideNavMenuItem>
            <SideNavMenu
              renderIcon={Fade}
              title="Sub-menu level 4"
              defaultExpanded={true}>
              <SideNavMenuItem
                isActive
                href="http://www.carbondesignsystem.com">
                Item level 5
              </SideNavMenuItem>
              <SideNavMenuItem href="http://www.carbondesignsystem.com">
                Item level 5
              </SideNavMenuItem>
            </SideNavMenu>
          </SideNavMenu>
        </SideNavMenu>
      </SideNavMenu>
    </SideNavItems>
  </SideNav>
);
SideNavWithThirdLevelIcons.storyName = 'With Third Level Icons';

/**
 * Story for SideNav panel
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
      <SideNavDivider />
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Item level 2
        </SideNavMenuItem>
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Item level 2
        </SideNavMenuItem>
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Item level 2
        </SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Item level 2
        </SideNavMenuItem>
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Item level 2
        </SideNavMenuItem>
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Item level 2
        </SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Item level 2
        </SideNavMenuItem>
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Item level 2
        </SideNavMenuItem>
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Item level 2
        </SideNavMenuItem>
      </SideNavMenu>
      <SideNavMenu renderIcon={Fade} title="Sub-menu level 1">
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Item level 2
        </SideNavMenuItem>
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Item level 2
        </SideNavMenuItem>
        <SideNavMenuItem href="http://www.carbondesignsystem.com">
          Item level 2
        </SideNavMenuItem>
      </SideNavMenu>
      <SideNavDivider />
      <SideNavLink renderIcon={Fade} href="http://www.carbondesignsystem.com">
        Link
      </SideNavLink>
      <SideNavLink renderIcon={Fade} href="http://www.carbondesignsystem.com">
        Link
      </SideNavLink>
      <SideNavLink renderIcon={Fade} href="http://www.carbondesignsystem.com">
        Link
      </SideNavLink>
      <SideNavLink renderIcon={Fade} href="http://www.carbondesignsystem.com">
        Link
      </SideNavLink>
      <SideNavDivider />
      <SideNavLink renderIcon={Fade} href="http://www.carbondesignsystem.com">
        Link
      </SideNavLink>
      <SideNavLink renderIcon={Fade} href="http://www.carbondesignsystem.com">
        Link
      </SideNavLink>
    </SideNavItems>
  </SideNav>
);
