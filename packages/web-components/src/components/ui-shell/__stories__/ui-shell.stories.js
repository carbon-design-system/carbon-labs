/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../index';

import '@carbon/web-components/es/components/ui-shell/index.js';
import '@carbon/web-components/es/components/modal/index.js';
import { html } from 'lit';
import Fade16 from '@carbon/web-components/es/icons/fade/16';
import Search20 from '@carbon/web-components/es/icons/search/20';
import Notification20 from '@carbon/web-components/es/icons/notification/20';
import SwitcherIcon20 from '@carbon/web-components/es/icons/switcher/20';
import contentStyles from '@carbon/styles/scss/components/ui-shell/content/_content.scss?inline';
import {
  SIDE_NAV_COLLAPSE_MODE,
  SIDE_NAV_USAGE_MODE,
} from '../components/side-nav/defs';
import styles from './ui-shell-story.scss?inline';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';

const { prefix: cdsPrefix } = settings;

/**
 * More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
 */
export default {
  title: 'Components/Ui Shell',
  component: 'clabs-ui-shell',
};

const linksHref = 'https://www.carbondesignsystem.com/';

/**
 * StoryContent component renders the main content for the UI shell story.
 * It includes descriptions and examples of the UI shell's purpose, function,
 * responsive behavior, and secondary navigation.
 *
 * @param {Object} props - The properties object.
 * @param {boolean} [props.useResponsiveOffset=true] - Determines whether to use responsive offset for the content.
 * @returns {TemplateResult} The HTML template for the story content.
 */
const StoryContent = ({ useResponsiveOffset = true }) => {
  /**
   * Toggles the modal
   */
  const toggleButton = () => {
    document.querySelector(`${cdsPrefix}-modal`)?.toggleAttribute('open');
  };
  return html`
    <style type="text/css">
      ${contentStyles.cssText}
    </style>
    <main
      class="${cdsPrefix}--content ${cdsPrefix}-ce-demo-devenv--ui-shell-content">
      <div class="${cdsPrefix}--grid">
        <div class="${cdsPrefix}--row">
          <div
            class="${`${cdsPrefix}--col-lg-13 ${cdsPrefix}--offset-lg-3`}"
            style="${!useResponsiveOffset ? `margin-left: 16rem;` : ''}">
            <h2 style="margin: 0 0 30px">Purpose and function</h2>
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
              the needs of a broad range of products and users. Adopting the
              shell ensures compliance with IBM design standards, simplifies
              development efforts, and provides great user experiences. All IBM
              products built with Carbon are required to use the shell’s header.
              <br />
              <br />
              To better understand the purpose and function of the UI shell,
              consider the “shell” of MacOS, which contains the Apple menu,
              top-level navigation, and universal, OS-level controls at the top
              of the screen, as well as a universal dock along the bottom or
              side of the screen. The Carbon UI shell is roughly analogous in
              function to these parts of the Mac UI. For example, the app
              switcher portion of the shell can be compared to the dock in
              MacOS.
            </p>
            <h2 style="margin: 30px 0px">Header responsive behavior</h2>
            <p>
              As a header scales down to fit smaller screen sizes, headers with
              persistent side nav menus should have the side nav collapse into
              “hamburger” menu. See the example to better understand responsive
              behavior of the header.
            </p>
            <h2 style="margin: 30px 0px">Secondary navigation</h2>
            <p>
              The side-nav contains secondary navigation and fits below the
              header. It can be configured to be either fixed-width or flexible,
              with only one level of nested items allowed. Both links and
              category lists can be used in the side-nav and may be mixed
              together. There are several configurations of the side-nav, but
              only one configuration should be used per product section. If tabs
              are needed on a page when using a side-nav, then the tabs are
              secondary in hierarchy to the side-nav.
            </p>
            <cds-modal>
              <cds-modal-header>
                <cds-modal-close-button></cds-modal-close-button>
                <cds-modal-label>Account resources</cds-modal-label>
                <cds-modal-heading>Add a custom domain</cds-modal-heading>
              </cds-modal-header>
              <cds-modal-body>
                <cds-modal-body-content description>
                  Custom domains direct requests for your apps in this Cloud
                  Foundry organization to a URL that you own. A custom domain
                  can be a shared domain, a shared subdomain, or a shared domain
                  and host.
                </cds-modal-body-content>
              </cds-modal-body>
              <cds-modal-footer>
                <cds-modal-footer-button kind="secondary" data-modal-close
                  >Cancel</cds-modal-footer-button
                >
                <cds-modal-footer-button>Add</cds-modal-footer-button>
              </cds-modal-footer>
            </cds-modal>
            <cds-button @click="${toggleButton}">Launch modal</cds-button>
          </div>
        </div>
      </div>
    </main>
  `;
};

export const FixedSideNav = {
  name: 'Fixed SideNav',
  /**
   * Renders the template for Storybook
   * @returns {TemplateResult<1>}
   */
  render: () => {
    const result = html`
      <style>
        ${styles}
      </style>
      <clabs-side-nav
        is-not-child-of-header
        usage-mode="${SIDE_NAV_USAGE_MODE.REGULAR}"
        aria-label="Side navigation"
        collapse-mode="${SIDE_NAV_COLLAPSE_MODE.FIXED}"
        expanded>
        <clabs-side-nav-items>
          <clabs-side-nav-menu title="L0 menu">
            <clabs-side-nav-menu-item href="${linksHref}">
              L0 menu item
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item href="${linksHref}">
              L0 menu item
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item href="${linksHref}">
              L0 menu item
            </clabs-side-nav-menu-item>
          </clabs-side-nav-menu>
          <clabs-side-nav-menu title="L0 menu">
            <clabs-side-nav-menu-item href="${linksHref}">
              L0 menu item
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item
              active
              aria-current="page"
              href="${linksHref}">
              L0 menu item
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item href="${linksHref}">
              L0 menu item
            </clabs-side-nav-menu-item>
          </clabs-side-nav-menu>
          <clabs-side-nav-menu title="L0 menu">
            <clabs-side-nav-menu-item href="${linksHref}">
              L0 menu item
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item href="${linksHref}">
              L0 menu item
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item href="${linksHref}">
              L0 menu item
            </clabs-side-nav-menu-item>
          </clabs-side-nav-menu>
          <clabs-side-nav-link href="javascript:void(0)"
            >L0 link</clabs-side-nav-link
          >
          <clabs-side-nav-link href="javascript:void(0)"
            >L0 link</clabs-side-nav-link
          >
        </clabs-side-nav-items>
      </clabs-side-nav>
      ${StoryContent({ useResponsiveOffset: false })}
    `;
    result.hasMainTag = true;
    return result;
  },
};

export const FixedSideNavDivider = {
  name: 'Fixed SideNav w/Divider',
  /**
   * Renders the template for Storybook
   * @returns {TemplateResult<1>}
   */
  render: () => {
    const result = html`
      <style>
        ${styles}
      </style>
      <clabs-side-nav
        is-not-child-of-header
        aria-label="Side navigation"
        collapse-mode="${SIDE_NAV_COLLAPSE_MODE.FIXED}"
        expanded>
        <clabs-side-nav-items>
          <clabs-side-nav-menu title="L0 menu">
            <clabs-side-nav-menu-item href="${linksHref}">
              L0 menu item
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item href="${linksHref}">
              L0 menu item
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item href="${linksHref}">
              L0 menu item
            </clabs-side-nav-menu-item>
          </clabs-side-nav-menu>
          <clabs-side-nav-menu title="L0 menu">
            <clabs-side-nav-menu-item href="${linksHref}">
              L0 menu item
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item
              active
              aria-current="page"
              href="${linksHref}">
              L0 menu item
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item href="${linksHref}">
              L0 menu item
            </clabs-side-nav-menu-item>
          </clabs-side-nav-menu>
          <clabs-side-nav-menu title="L0 menu">
            <clabs-side-nav-menu-item href="${linksHref}">
              L0 menu item
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item href="${linksHref}">
              L0 menu item
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item href="${linksHref}">
              L0 menu item
            </clabs-side-nav-menu-item>
          </clabs-side-nav-menu>
          <clabs-side-nav-divider></clabs-side-nav-divider>
          <clabs-side-nav-link href="javascript:void(0)"
            >L0 link</clabs-side-nav-link
          >
          <clabs-side-nav-link href="javascript:void(0)"
            >L0 link</clabs-side-nav-link
          >
        </clabs-side-nav-items>
      </clabs-side-nav>
      ${StoryContent({ useResponsiveOffset: false })}
    `;
    result.hasMainTag = true;
    return result;
  },
};

export const FixedSideNavIcons = {
  name: 'Fixed SideNav w/ Icons',
  /**
   * Renders the template for Storybook
   * @returns {TemplateResult<1>}
   */
  render: () => {
    const result = html`
      <style>
        ${styles}
      </style>
      <clabs-side-nav
        is-not-child-of-header
        aria-label="Side navigation"
        collapse-mode="${SIDE_NAV_COLLAPSE_MODE.FIXED}"
        expanded>
        <clabs-side-nav-items>
          <clabs-side-nav-menu title="Category title">
            ${Fade16({ slot: 'title-icon' })}
            <clabs-side-nav-menu-item href="${linksHref}">
              Link
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item href="${linksHref}">
              Link
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item href="${linksHref}">
              Link
            </clabs-side-nav-menu-item>
          </clabs-side-nav-menu>
          <clabs-side-nav-menu title="Category title">
            ${Fade16({ slot: 'title-icon' })}
            <clabs-side-nav-menu-item href="${linksHref}">
              Link
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item
              active
              aria-current="page"
              href="${linksHref}">
              Link
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item href="${linksHref}">
              Link
            </clabs-side-nav-menu-item>
          </clabs-side-nav-menu>
          <clabs-side-nav-menu title="Category title">
            ${Fade16({ slot: 'title-icon' })}
            <clabs-side-nav-menu-item href="${linksHref}">
              Link
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item href="${linksHref}">
              Link
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item href="${linksHref}">
              Link
            </clabs-side-nav-menu-item>
          </clabs-side-nav-menu>
          <clabs-side-nav-link href="javascript:void(0)"
            >${Fade16({ slot: 'title-icon' })}Link</clabs-side-nav-link
          >
          <clabs-side-nav-link href="javascript:void(0)"
            >${Fade16({ slot: 'title-icon' })}Link</clabs-side-nav-link
          >
        </clabs-side-nav-items>
      </clabs-side-nav>
      ${StoryContent({ useResponsiveOffset: false })}
    `;
    result.hasMainTag = true;
    return result;
  },
};

export const HeaderBase = {
  /**
   * Renders the template for Storybook
   * @returns {TemplateResult<1>}
   */
  render: () =>
    html` <style>
        ${styles}
      </style>
      <clabs-header aria-label="IBM Platform Name">
        <clabs-header-name href="javascript:void 0" prefix="IBM"
          >[Platform]</clabs-header-name
        >
      </clabs-header>`,
};

export const HeaderBaseWActions = {
  name: 'Header Base w/ Actions',
  /**
   * Renders the template for Storybook
   * @returns {TemplateResult<1>}
   */
  render: () =>
    html` <style>
        ${styles}
      </style>
      <clabs-header aria-label="IBM Platform Name">
        <clabs-header-name href="javascript:void 0" prefix="IBM"
          >[Platform]</clabs-header-name
        >
        <div class="${cdsPrefix}--header__global">
          <clabs-header-global-action aria-label="Search" tooltip-text="Search">
            ${Search20({ slot: 'icon' })}
          </clabs-header-global-action>
          <clabs-header-global-action
            aria-label="Notification"
            tooltip-text="Notification">
            ${Notification20({ slot: 'icon' })}
          </clabs-header-global-action>
          <clabs-header-global-action
            aria-label="App Switcher"
            tooltip-text="App Switcher"
            tooltip-alignment="right">
            ${SwitcherIcon20({ slot: 'icon' })}
          </clabs-header-global-action>
        </div>
      </clabs-header>`,
};

export const HeaderBaseWActionsRightPanel = {
  name: 'Header Base w/ Actions and Right Panel',
  /**
   * Renders the template for Storybook
   * @returns {TemplateResult<1>}
   */
  render: () =>
    html` <style>
        ${styles}
      </style>
      <clabs-header aria-label="IBM Platform Name">
        <clabs-header-name href="javascript:void 0" prefix="IBM"
          >[Platform]</clabs-header-name
        >
        <div class="${cdsPrefix}--header__global">
          <clabs-header-global-action aria-label="Search" tooltip-text="Search">
            ${Search20({ slot: 'icon' })}
          </clabs-header-global-action>
          <clabs-header-global-action
            panel-id="notification-panel"
            aria-label="Notification"
            tooltip-text="Notification">
            ${Notification20({ slot: 'icon' })}
          </clabs-header-global-action>
          <clabs-header-global-action
            aria-label="App Switcher"
            tooltip-text="App Switcher"
            tooltip-alignment="right">
            ${SwitcherIcon20({ slot: 'icon' })}
          </clabs-header-global-action>
        </div>
        <clabs-header-panel
          id="notification-panel"
          expanded
          aria-label="Header Panel"></clabs-header-panel>
      </clabs-header>`,
};

export const HeaderBaseWActionsSwitcher = {
  name: 'Header Base w/ Actions and Switcher',
  /**
   * Renders the template for Storybook
   * @returns {TemplateResult<1>}
   */
  render: () =>
    html` <style>
        ${styles}
      </style>
      <clabs-header aria-label="IBM Platform Name">
        <clabs-header-name href="javascript:void 0" prefix="IBM"
          >[Platform]</clabs-header-name
        >
        <div class="${cdsPrefix}--header__global">
          <clabs-header-global-action aria-label="Search" tooltip-text="Search">
            ${Search20({ slot: 'icon' })}
          </clabs-header-global-action>
          <clabs-header-global-action
            aria-label="Notification"
            tooltip-text="Notification">
            ${Notification20({ slot: 'icon' })}
          </clabs-header-global-action>
          <clabs-header-global-action
            button-label-active="Close switcher"
            button-label-inactive="Open switcher"
            tooltip-text="Open switcher"
            panel-id="switcher-panel"
            tooltip-alignment="right">
            ${SwitcherIcon20({ slot: 'icon' })}
          </clabs-header-global-action>
        </div>
        <clabs-header-panel id="switcher-panel" aria-label="Header Panel">
          <clabs-switcher aria-label="Switcher Container">
            <clabs-switcher-item aria-label="Link 1" href="#"
              >Link 1</clabs-switcher-item
            >
            <clabs-switcher-divider></clabs-switcher-divider>
            <clabs-switcher-item aria-label="Link 2" href="#"
              >Link 2</clabs-switcher-item
            >
            <clabs-switcher-item aria-label="Link 3" href="#"
              >Link 3</clabs-switcher-item
            >
            <clabs-switcher-item aria-label="Link 4" href="#"
              >Link 4</clabs-switcher-item
            >
            <clabs-switcher-item aria-label="Link 5" href="#"
              >Link 5</clabs-switcher-item
            >
            <clabs-switcher-divider></clabs-switcher-divider>
            <clabs-switcher-item aria-label="Link 6" href="#"
              >Link 6</clabs-switcher-item
            >
          </clabs-switcher>
        </clabs-header-panel>
      </clabs-header>
      ${StoryContent({ useResponsiveOffset: true })}`,
};

export const HeaderBaseWNavigationActionsAndSideNav = {
  name: 'Header Base w/ Navigation, Actions and SideNav',
  /**
   * Renders the template for Storybook
   * @returns {TemplateResult<1>}
   */
  render: () =>
    html` <style>
        ${styles}
      </style>
      <clabs-header aria-label="IBM Platform Name">
        <clabs-header-menu-button
          button-label-active="Close menu"
          button-label-inactive="Open menu"></clabs-header-menu-button>
        <clabs-header-name href="javascript:void 0" prefix="IBM"
          >[Platform]</clabs-header-name
        >
        <clabs-header-nav menu-bar-label="IBM [Platform]">
          <clabs-header-nav-item href="javascript:void 0"
            >Link 1</clabs-header-nav-item
          >
          <clabs-header-nav-item href="javascript:void 0"
            >Link 2</clabs-header-nav-item
          >
          <clabs-header-nav-item href="javascript:void 0"
            >Link 3</clabs-header-nav-item
          >
          <clabs-header-menu menu-label="Link 4" trigger-content="Link 4">
            <clabs-header-menu-item href="javascript:void 0"
              >Sub-link 1</clabs-header-menu-item
            >
            <clabs-header-menu-item href="javascript:void 0"
              >Sub-link 2</clabs-header-menu-item
            >
            <clabs-header-menu-item href="javascript:void 0"
              >Sub-link 3</clabs-header-menu-item
            >
          </clabs-header-menu>
        </clabs-header-nav>
        <div class="${cdsPrefix}--header__global">
          <clabs-header-global-action aria-label="Search" tooltip-text="Search">
            ${Search20({ slot: 'icon' })}
          </clabs-header-global-action>
          <clabs-header-global-action
            aria-label="Notification"
            tooltip-text="Notification">
            ${Notification20({ slot: 'icon' })}
          </clabs-header-global-action>
          <clabs-header-global-action
            aria-label="App Switcher"
            tooltip-text="App Switcher"
            tooltip-alignment="right">
            ${SwitcherIcon20({ slot: 'icon' })}
          </clabs-header-global-action>
        </div>
        <clabs-side-nav
          aria-label="Side navigation"
          collapse-mode="${SIDE_NAV_COLLAPSE_MODE.RESPONSIVE}">
          <clabs-side-nav-items>
            <clabs-header-side-nav-items has-divider>
              <clabs-side-nav-link href="javascript:void(0)">
                Link 1
              </clabs-side-nav-link>
              <clabs-side-nav-link href="javascript:void(0)">
                Link 2
              </clabs-side-nav-link>
              <clabs-side-nav-link href="javascript:void(0)">
                Link 3
              </clabs-side-nav-link>
              <clabs-side-nav-menu title="Link 4">
                <clabs-side-nav-menu-item href="${linksHref}">
                  Sub-link 1
                </clabs-side-nav-menu-item>
                <clabs-side-nav-menu-item href="${linksHref}">
                  Sub-link 2
                </clabs-side-nav-menu-item>
                <clabs-side-nav-menu-item href="${linksHref}">
                  Sub-link 3
                </clabs-side-nav-menu-item>
              </clabs-side-nav-menu>
            </clabs-header-side-nav-items>
            <clabs-side-nav-menu title="Category title">
              ${Fade16({ slot: 'title-icon' })}
              <clabs-side-nav-menu-item href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
              <clabs-side-nav-menu-item href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
              <clabs-side-nav-menu-item href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
            </clabs-side-nav-menu>
            <clabs-side-nav-menu title="Category title">
              ${Fade16({ slot: 'title-icon' })}
              <clabs-side-nav-menu-item href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
              <clabs-side-nav-menu-item aria-current="page" href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
              <clabs-side-nav-menu-item href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
            </clabs-side-nav-menu>
            <clabs-side-nav-menu title="Category title">
              ${Fade16({ slot: 'title-icon' })}
              <clabs-side-nav-menu-item href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
              <clabs-side-nav-menu-item active href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
              <clabs-side-nav-menu-item href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
            </clabs-side-nav-menu>
            <clabs-side-nav-link href="javascript:void(0)"
              >${Fade16({ slot: 'title-icon' })}Link</clabs-side-nav-link
            >
            <clabs-side-nav-link href="javascript:void(0)"
              >${Fade16({ slot: 'title-icon' })}Link</clabs-side-nav-link
            >
          </clabs-side-nav-items>
        </clabs-side-nav>
      </clabs-header>
      ${StoryContent({ useResponsiveOffset: true })}`,
};

export const HeaderBaseWNavigationActions = {
  name: 'Header Base w/ Navigation and Actions',
  /**
   * Renders the template for Storybook
   * @returns {TemplateResult<1>}
   */
  render: () =>
    html` <style>
        ${styles}
      </style>
      <clabs-header aria-label="IBM Platform Name">
        <clabs-header-menu-button
          button-label-active="Close menu"
          button-label-inactive="Open menu"></clabs-header-menu-button>
        <clabs-header-name href="javascript:void 0" prefix="IBM"
          >[Platform]</clabs-header-name
        >
        <clabs-header-nav menu-bar-label="IBM [Platform]">
          <clabs-header-nav-item href="javascript:void 0"
            >Link 1</clabs-header-nav-item
          >
          <clabs-header-nav-item href="javascript:void 0"
            >Link 2</clabs-header-nav-item
          >
          <clabs-header-nav-item href="javascript:void 0"
            >Link 3</clabs-header-nav-item
          >
          <clabs-header-menu
            is-active
            menu-label="Link 4"
            trigger-content="Link 4">
            <clabs-header-menu-item href="javascript:void 0"
              >Sub-link 1</clabs-header-menu-item
            >
            <clabs-header-menu-item href="javascript:void 0"
              >Sub-link 2</clabs-header-menu-item
            >
            <clabs-header-menu-item href="javascript:void 0"
              >Sub-link 3</clabs-header-menu-item
            >
          </clabs-header-menu>
        </clabs-header-nav>
        <div class="${cdsPrefix}--header__global">
          <clabs-header-global-action aria-label="Search" tooltip-text="Search">
            ${Search20({ slot: 'icon' })}
          </clabs-header-global-action>
          <clabs-header-global-action
            aria-label="Notification"
            tooltip-text="Notification">
            ${Notification20({ slot: 'icon' })}
          </clabs-header-global-action>
          <clabs-header-global-action
            aria-label="App Switcher"
            tooltip-text="App Switcher"
            tooltip-alignment="right">
            ${SwitcherIcon20({ slot: 'icon' })}
          </clabs-header-global-action>
        </div>
        <clabs-side-nav
          is-not-persistent
          aria-label="Side navigation"
          collapse-mode="${SIDE_NAV_COLLAPSE_MODE.RESPONSIVE}">
          <clabs-side-nav-items>
            <clabs-side-nav-link href="javascript:void(0)">
              Link 1
            </clabs-side-nav-link>
            <clabs-side-nav-link href="javascript:void(0)">
              Link 2
            </clabs-side-nav-link>
            <clabs-side-nav-link href="javascript:void(0)">
              Link 3
            </clabs-side-nav-link>
            <clabs-side-nav-menu title="Link 4">
              <clabs-side-nav-menu-item href="${linksHref}">
                Sub-link 1
              </clabs-side-nav-menu-item>
              <clabs-side-nav-menu-item href="${linksHref}">
                Sub-link 2
              </clabs-side-nav-menu-item>
              <clabs-side-nav-menu-item href="${linksHref}">
                Sub-link 3
              </clabs-side-nav-menu-item>
            </clabs-side-nav-menu>
          </clabs-side-nav-items>
        </clabs-side-nav>
      </clabs-header>`,
};

export const HeaderBaseWNavigation = {
  name: 'Header Base w/ Navigation',
  /**
   * Renders the template for Storybook
   * @returns {TemplateResult<1>}
   */
  render: () =>
    html` <style>
        ${styles}
      </style>
      <clabs-header aria-label="IBM Platform Name">
        <clabs-header-menu-button
          button-label-active="Close menu"
          button-label-inactive="Open menu"></clabs-header-menu-button>
        <clabs-header-name href="javascript:void 0" prefix="IBM"
          >[Platform]</clabs-header-name
        >
        <clabs-header-nav menu-bar-label="IBM [Platform]">
          <clabs-header-nav-item href="javascript:void 0"
            >Link 1</clabs-header-nav-item
          >
          <clabs-header-nav-item href="javascript:void 0"
            >Link 2</clabs-header-nav-item
          >
          <clabs-header-nav-item href="javascript:void 0"
            >Link 3</clabs-header-nav-item
          >
          <clabs-header-menu menu-label="Link 4" trigger-content="Link 4">
            <clabs-header-menu-item href="javascript:void 0"
              >Sub-link 1</clabs-header-menu-item
            >
            <clabs-header-menu-item is-active href="javascript:void 0"
              >Sub-link 2</clabs-header-menu-item
            >
            <clabs-header-menu-item href="javascript:void 0"
              >Sub-link 3</clabs-header-menu-item
            >
          </clabs-header-menu>
        </clabs-header-nav>
        <clabs-side-nav
          is-not-persistent
          aria-label="Side navigation"
          collapse-mode="${SIDE_NAV_COLLAPSE_MODE.RESPONSIVE}">
          <clabs-side-nav-items>
            <clabs-side-nav-link href="javascript:void(0)">
              Link 1
            </clabs-side-nav-link>
            <clabs-side-nav-link href="javascript:void(0)">
              Link 2
            </clabs-side-nav-link>
            <clabs-side-nav-link href="javascript:void(0)">
              Link 3
            </clabs-side-nav-link>
            <clabs-side-nav-menu title="Link 4">
              <clabs-side-nav-menu-item href="${linksHref}">
                Sub-link 1
              </clabs-side-nav-menu-item>
              <clabs-side-nav-menu-item href="${linksHref}">
                Sub-link 2
              </clabs-side-nav-menu-item>
              <clabs-side-nav-menu-item href="${linksHref}">
                Sub-link 3
              </clabs-side-nav-menu-item>
            </clabs-side-nav-menu>
          </clabs-side-nav-items>
        </clabs-side-nav>
      </clabs-header>`,
};

export const HeaderBaseWSideNav = {
  name: 'Header Base w/ SideNav',
  /**
   * Renders the template for Storybook
   * @returns {TemplateResult<1>}
   */
  render: () => {
    const result = html`
      <style>
        ${styles}
      </style>
      <clabs-header aria-label="IBM Platform Name">
        <clabs-header-menu-button
          button-label-active="Close menu"
          button-label-inactive="Open menu"></clabs-header-menu-button>
        <clabs-header-name href="javascript:void 0" prefix="IBM"
          >[Platform]</clabs-header-name
        >
        <clabs-side-nav
          aria-label="Side navigation"
          collapse-mode="${SIDE_NAV_COLLAPSE_MODE.RESPONSIVE}">
          <clabs-side-nav-items>
            <clabs-side-nav-menu title="Category title">
              ${Fade16({ slot: 'title-icon' })}
              <clabs-side-nav-menu-item href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
              <clabs-side-nav-menu-item href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
              <clabs-side-nav-menu-item href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
            </clabs-side-nav-menu>
            <clabs-side-nav-menu title="Category title">
              ${Fade16({ slot: 'title-icon' })}
              <clabs-side-nav-menu-item href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
              <clabs-side-nav-menu-item
                active
                aria-current="page"
                href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
              <clabs-side-nav-menu-item href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
            </clabs-side-nav-menu>
            <clabs-side-nav-menu title="Category title">
              ${Fade16({ slot: 'title-icon' })}
              <clabs-side-nav-menu-item href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
              <clabs-side-nav-menu-item href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
              <clabs-side-nav-menu-item href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
            </clabs-side-nav-menu>
            <clabs-side-nav-link href="javascript:void(0)"
              >${Fade16({ slot: 'title-icon' })}Link</clabs-side-nav-link
            >
            <clabs-side-nav-link href="javascript:void(0)"
              >${Fade16({ slot: 'title-icon' })}Link</clabs-side-nav-link
            >
          </clabs-side-nav-items>
        </clabs-side-nav>
      </clabs-header>
      ${StoryContent({ useResponsiveOffset: true })}
    `;
    result.hasMainTag = true;
    return result;
  },
};

export const HeaderBaseWSkipToContent = {
  name: 'Header Base w/ SkipToContent',
  /**
   * Renders the template for Storybook
   * @returns {TemplateResult<1>}
   */
  render: () =>
    html` <style>
        ${styles}
      </style>
      <clabs-header aria-label="IBM Platform Name">
        <cds-skip-to-content></cds-skip-to-content>
        <clabs-header-name href="javascript:void 0" prefix="IBM"
          >[Platform]</clabs-header-name
        >
        <div class="${cdsPrefix}--header__global">
          <clabs-header-global-action aria-label="Search" tooltip-text="Search">
            ${Search20({ slot: 'icon' })}
          </clabs-header-global-action>
          <clabs-header-global-action
            aria-label="Notification"
            tooltip-text="Notification">
            ${Notification20({ slot: 'icon' })}
          </clabs-header-global-action>
          <clabs-header-global-action
            aria-label="App Switcher"
            tooltip-text="App Switcher"
            tooltip-alignment="right">
            ${SwitcherIcon20({ slot: 'icon' })}
          </clabs-header-global-action>
        </div>
      </clabs-header>
      ${StoryContent({ useResponsiveOffset: true })}`,
};

export const SideNavRail = {
  name: 'SideNav Rail',
  /**
   * Renders the template for Storybook
   * @returns {TemplateResult<1>}
   */
  render: () =>
    html` <style>
        ${styles}
      </style>
      <clabs-side-nav
        aria-label="Side navigation"
        collapse-mode="${SIDE_NAV_COLLAPSE_MODE.RAIL}">
        <clabs-side-nav-items>
          <clabs-side-nav-menu title="Category title">
            ${Fade16({ slot: 'title-icon' })}
            <clabs-side-nav-menu-item href="${linksHref}">
              Link
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item
              active
              aria-current="page"
              href="${linksHref}">
              Link
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item href="${linksHref}">
              Link
            </clabs-side-nav-menu-item>
          </clabs-side-nav-menu>
          <clabs-side-nav-menu title="Category title">
            ${Fade16({ slot: 'title-icon' })}
            <clabs-side-nav-menu-item href="${linksHref}">
              Link
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item href="${linksHref}">
              Link
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item href="${linksHref}">
              Link
            </clabs-side-nav-menu-item>
          </clabs-side-nav-menu>
          <clabs-side-nav-menu title="Category title">
            ${Fade16({ slot: 'title-icon' })}
            <clabs-side-nav-menu-item href="${linksHref}">
              Link
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item href="${linksHref}">
              Link
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item href="${linksHref}">
              Link
            </clabs-side-nav-menu-item>
          </clabs-side-nav-menu>
          <clabs-side-nav-link href="javascript:void(0)"
            >${Fade16({ slot: 'title-icon' })}Link</clabs-side-nav-link
          >
          <clabs-side-nav-link href="javascript:void(0)"
            >${Fade16({ slot: 'title-icon' })}Link</clabs-side-nav-link
          >
        </clabs-side-nav-items>
      </clabs-side-nav>
      ${StoryContent({ useResponsiveOffset: true })}`,
};

export const SideNavRailWHeader = {
  name: 'SideNav Rail w/ Header',
  /**
   * Renders the template for Storybook
   * @returns {TemplateResult<1>}
   */
  render: () =>
    html` <style>
        ${styles}
      </style>
      <clabs-header aria-label="IBM Platform Name">
        <clabs-header-menu-button
          button-label-active="Close menu"
          button-label-inactive="Open menu"></clabs-header-menu-button>
        <clabs-header-name href="javascript:void 0" prefix="IBM"
          >[Platform]</clabs-header-name
        >
        <clabs-header-nav menu-bar-label="IBM [Platform]">
          <clabs-header-nav-item href="javascript:void 0"
            >Link 1</clabs-header-nav-item
          >
          <clabs-header-nav-item href="javascript:void 0"
            >Link 2</clabs-header-nav-item
          >
          <clabs-header-nav-item href="javascript:void 0"
            >Link 3</clabs-header-nav-item
          >
          <clabs-header-menu menu-label="Link 4" trigger-content="Link 4">
            <clabs-header-menu-item href="javascript:void 0"
              >Sub-link 1</clabs-header-menu-item
            >
            <clabs-header-menu-item href="javascript:void 0"
              >Sub-link 2</clabs-header-menu-item
            >
            <clabs-header-menu-item href="javascript:void 0"
              >Sub-link 3</clabs-header-menu-item
            >
          </clabs-header-menu>
        </clabs-header-nav>
        <div class="${cdsPrefix}--header__global">
          <clabs-header-global-action aria-label="Search" tooltip-text="Search">
            ${Search20({ slot: 'icon' })}
          </clabs-header-global-action>
          <clabs-header-global-action
            aria-label="Notification"
            tooltip-text="Notification">
            ${Notification20({ slot: 'icon' })}
          </clabs-header-global-action>
          <clabs-header-global-action
            aria-label="App Switcher"
            tooltip-text="App Switcher"
            tooltip-alignment="right">
            ${SwitcherIcon20({ slot: 'icon' })}
          </clabs-header-global-action>
        </div>
        <clabs-side-nav
          aria-label="Side navigation"
          collapse-mode="${SIDE_NAV_COLLAPSE_MODE.RAIL}">
          <clabs-side-nav-items>
            <clabs-side-nav-menu title="Category title">
              ${Fade16({ slot: 'title-icon' })}
              <clabs-side-nav-menu-item href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
              <clabs-side-nav-menu-item
                active
                aria-current="page"
                href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
              <clabs-side-nav-menu-item href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
            </clabs-side-nav-menu>
            <clabs-side-nav-menu title="Category title">
              ${Fade16({ slot: 'title-icon' })}
              <clabs-side-nav-menu-item href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
              <clabs-side-nav-menu-item href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
              <clabs-side-nav-menu-item href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
            </clabs-side-nav-menu>
            <clabs-side-nav-menu title="Category title">
              ${Fade16({ slot: 'title-icon' })}
              <clabs-side-nav-menu-item href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
              <clabs-side-nav-menu-item href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
              <clabs-side-nav-menu-item href="${linksHref}">
                Link
              </clabs-side-nav-menu-item>
            </clabs-side-nav-menu>
            <clabs-side-nav-link href="javascript:void(0)"
              >${Fade16({ slot: 'title-icon' })}Link</clabs-side-nav-link
            >
            <clabs-side-nav-link href="javascript:void(0)"
              >${Fade16({ slot: 'title-icon' })}Link</clabs-side-nav-link
            >
          </clabs-side-nav-items>
        </clabs-side-nav>
      </clabs-header>
      ${StoryContent({ useResponsiveOffset: true })}`,
};

export const SideNavWLargeSideNavItems = {
  name: 'SideNav w/ large side nav items',
  /**
   * Renders the template for Storybook
   * @returns {TemplateResult<1>}
   */
  render: () => {
    const result = html`
      <style>
        ${styles}
      </style>
      <clabs-side-nav
        is-not-child-of-header
        aria-label="Side navigation"
        collapse-mode="${SIDE_NAV_COLLAPSE_MODE.FIXED}"
        expanded>
        <clabs-side-nav-items>
          <clabs-side-nav-menu large title="Large menu">
            <clabs-side-nav-menu-item href="${linksHref}">
              Menu 1
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item href="${linksHref}">
              Menu 2
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item href="${linksHref}">
              Menu 3
            </clabs-side-nav-menu-item>
          </clabs-side-nav-menu>
          <clabs-side-nav-link large href="javascript:void(0)"
            >Large link</clabs-side-nav-link
          >
          <clabs-side-nav-menu large title="Large menu w/icon"
            >${Fade16({ slot: 'title-icon' })}
            <clabs-side-nav-menu-item href="${linksHref}">
              Menu 1
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item href="${linksHref}">
              Menu 2
            </clabs-side-nav-menu-item>
            <clabs-side-nav-menu-item href="${linksHref}">
              Menu 3
            </clabs-side-nav-menu-item>
          </clabs-side-nav-menu>
          <clabs-side-nav-link large href="javascript:void(0)">
            ${Fade16({ slot: 'title-icon' })} Large link
            w/icon</clabs-side-nav-link
          >
        </clabs-side-nav-items>
      </clabs-side-nav>
      ${StoryContent({ useResponsiveOffset: true })}
    `;
    result.hasMainTag = true;
    return result;
  },
};
