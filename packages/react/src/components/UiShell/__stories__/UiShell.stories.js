/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import mdx from './UiShell.mdx';
import { SideNav } from '../components/SideNav';
import {
  // SideNav,
  SideNavItems,
  SideNavMenu,
  SideNavMenuItem,
  SideNavLink,
  SkipToContent,
  Header,
  HeaderName,
  Button,
  Modal,
  Content,
} from '@carbon/react';

/**
 * Story content
 * @param {boolean} useResponsiveOffset - `true` if the responsive offset should be used.
 * @returns {React.ReactElement} The JSX for the story
 */
const StoryContent = ({ useResponsiveOffset = true }) => {
  const [open, setOpen] = useState(false);
  const classNameFirstColumn = {
    'cds--col-lg-13': true,
    'cds--offset-lg-3': useResponsiveOffset,
  };
  const classnameString = Object.entries(classNameFirstColumn)
    .reduce((acc, [key, value]) => (value ? `${acc} ${key}` : acc), '')
    .trim();
  const content = (
    <div className="cds--grid">
      <div className="cds--row">
        <div className={classnameString}>
          <h2 style={{ margin: '0 0 30px' }}>Purpose and function</h2>
          <p>
            The shell is perhaps the most crucial piece of any UI built with
            <a href="www.carbondesignsystem.com"> Carbon</a>. It contains the
            shared navigation framework for the entire design system and ties
            the products in IBM’s portfolio together in a cohesive and elegant
            way. The shell is the home of the topmost navigation, where users
            can quickly and dependably gain their bearings and move between
            pages.
            <br />
            <br />
            The shell was designed with maximum flexibility built in, to serve
            the needs of a broad range of products and users. Adopting the shell
            ensures compliance with IBM design standards, simplifies development
            efforts, and provides great user experiences. All IBM products built
            with Carbon are required to use the shell’s header.
            <br />
            <br />
            To better understand the purpose and function of the UI shell,
            consider the “shell” of MacOS, which contains the Apple menu,
            top-level navigation, and universal, OS-level controls at the top of
            the screen, as well as a universal dock along the bottom or side of
            the screen. The Carbon UI shell is roughly analogous in function to
            these parts of the Mac UI. For example, the app switcher portion of
            the shell can be compared to the dock in MacOS.
          </p>
          <h2 style={{ margin: '30px 0' }}>Header responsive behavior</h2>
          <p>
            As a header scales down to fit smaller screen sizes, headers with
            persistent side nav menus should have the side nav collapse into
            “hamburger” menu. See the example to better understand responsive
            behavior of the header.
          </p>
          <h2 style={{ margin: '30px 0' }}>Secondary navigation</h2>
          <p>
            The side-nav contains secondary navigation and fits below the
            header. It can be configured to be either fixed-width or flexible,
            with only one level of nested items allowed. Both links and category
            lists can be used in the side-nav and may be mixed together. There
            are several configurations of the side-nav, but only one
            configuration should be used per product section. If tabs are needed
            on a page when using a side-nav, then the tabs are secondary in
            hierarchy to the side-nav.
          </p>
          <Button onClick={() => setOpen(true)}>Launch modal</Button>
          <Modal
            modalHeading="Add a custom domain"
            modalLabel="Account resources"
            primaryButtonText="Add"
            secondaryButtonText="Cancel"
            open={open}
            onRequestClose={() => setOpen(false)}>
            <p style={{ marginBottom: '1rem' }}>
              Custom domains direct requests for your apps in this Cloud Foundry
              organization to a URL that you own. A custom domain can be a
              shared domain, a shared subdomain, or a shared domain and host.
            </p>
          </Modal>
        </div>
      </div>
    </div>
  );
  const style = {
    height: '100%',
  };
  if (useResponsiveOffset) {
    style.margin = '0';
    style.width = '100%';
  }
  return (
    <Content id="main-content" style={style}>
      {content}
    </Content>
  );
};

export default {
  title: 'Components/UiShell',
  component: SideNav,
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
export const FixedSideNav = () => (
  <>
    <Header aria-label="IBM Platform Name">
      <SkipToContent />
      <HeaderName href="#" prefix="IBM">
        [Platform]
      </HeaderName>
    </Header>
    <SideNav
      isFixedNav
      expanded={true}
      isChildOfHeader={false}
      aria-label="Side navigation">
      <SideNavItems>
        <SideNavMenu title="L0 menu">
          <SideNavMenuItem href="https://www.carbondesignsystem.com/">
            L0 menu item
          </SideNavMenuItem>
          <SideNavMenuItem href="https://www.carbondesignsystem.com/">
            L0 menu item
          </SideNavMenuItem>
          <SideNavMenuItem href="https://www.carbondesignsystem.com/">
            L0 menu item
          </SideNavMenuItem>
        </SideNavMenu>
        <SideNavMenu title="L0 menu" isActive={true}>
          <SideNavMenuItem href="https://www.carbondesignsystem.com/">
            L0 menu item
          </SideNavMenuItem>
          <SideNavMenuItem
            aria-current="page"
            href="https://www.carbondesignsystem.com/">
            L0 menu item
          </SideNavMenuItem>
          <SideNavMenuItem href="https://www.carbondesignsystem.com/">
            L0 menu item
          </SideNavMenuItem>
        </SideNavMenu>
        <SideNavMenu title="L0 menu">
          <SideNavMenuItem href="https://www.carbondesignsystem.com/">
            L0 menu item
          </SideNavMenuItem>
          <SideNavMenuItem href="https://www.carbondesignsystem.com/">
            L0 menu item
          </SideNavMenuItem>
          <SideNavMenuItem href="https://www.carbondesignsystem.com/">
            L0 menu item
          </SideNavMenuItem>
        </SideNavMenu>
        <SideNavLink href="https://www.carbondesignsystem.com/">
          L0 link
        </SideNavLink>
        <SideNavLink href="https://www.carbondesignsystem.com/">
          L0 link
        </SideNavLink>
      </SideNavItems>
    </SideNav>
    <StoryContent useResponsiveOffset={false} />
  </>
);
