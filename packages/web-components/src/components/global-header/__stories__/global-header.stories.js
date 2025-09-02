/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../components/global-header/global-header';
import { html } from 'lit';

/**
 * More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
 */
export default {
  title: 'Components/Global Header',
  component: 'clabs-global-header',
};

const headerPropsUnauthenticated = {
  brand: {
    company: 'IBM',
    product: 'Platform',
  },
  noAuthHeaderLinks: [
    {
      text: 'Docs',
      href: '/docs',
      carbonIcon: 'Document',
      arialLabel: 'Docs',
    },
    {
      href: '/login',
      text: 'Log in',
      carbonIcon: 'Login',
      arialLabel: 'Log in',
    },
  ],
};

/**
 * More on writing stories with args: https://storybook.js.org/docs/web-components/writing-stories/args
 *
 * @type {{args: {label: string}, render: (function(*): TemplateResult<1>)}}
 */
export const Default = {
  args: {
    headerProps: headerPropsUnauthenticated,
  },

  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: (args) =>
    html` <clabs-global-header
      .headerProps="${args.headerProps}"></clabs-global-header>`,
};
