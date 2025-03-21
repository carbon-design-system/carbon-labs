/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../components/empty-state/empty-state';
import { html } from 'lit';
import '@carbon/web-components/es/components/link/index.js';
import '@carbon/web-components/es/components/button/index.js';
import Add20 from '@carbon/web-components/es/icons/add/20';
import CustomIllustration from './__assets__/empty-state-bright-magnifying-glass.svg';

/**
 * More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
 */
export default {
  title: 'Components/Empty State',
  component: 'clabs-empty-state',
};

const argTypes = {
  title: {
    control: 'text',
    description: 'Empty state heading.',
  },
  subtitle: {
    control: 'text',
    description: 'Empty state subtext.',
  },

  size: {
    control: 'radio',
    description: 'Empty state size',
    options: ['sm', 'lg'],
  },
  link: {
    control: 'object',
    description:
      'Props for the link. Refer to the Carbon Components link documentation for full list of props.',
  },
  action: {
    control: 'object',
    description:
      'Props for the action button. Refer to the Carbon Components button documentation for full list of props.',
  },
  kind: {
    control: 'select',
    description: 'Determines which predefined illustration will be displayed',
    options: [
      'Error',
      'No data',
      'No tags',
      'Not found',
      'Notifications',
      'Unauthorized',
    ],
    mapping: {
      Error: 'error',
      'No data': 'noData',
      'No tags': 'noTags',
      'Not found': 'notFound',
      Notifications: 'notifications',
      Unauthorized: 'unauthorized',
    },
  },
  illustrationTheme: {
    control: 'radio',
    description:
      "Empty state illustration theme variations. To ensure you use the correct themed illustrations, you can conditionally specify light or dark based on your app's current theme value.",
    options: ['light', 'dark'],
  },
  illustration: {
    control: 'text',
    description:
      'Source for the illustration image if you choose to use your own custom image. Passing an illustration prop will supersede the kind option.',
  },
};

const defaultLinkProps = {
  href: 'https://www.carbondesignsystem.com',
  text: 'View documentation',
};

/**
 * Renders the template for Storybook
 *
 * @param {{ title: string, subtitle: string }} args - Object containing title and subtitle properties.
 * @returns {TemplateResult<1>}
 */
const renderTemplate = (args) => {
  return html`
    <clabs-empty-state
      .title=${args.title}
      .subtitle=${args.subtitle}
      size=${args.size}
      .kind=${args.kind}
      .illustrationTheme=${args.illustrationTheme}
      .illustration=${args.illustration}>
      ${args.action &&
      html`
        <cds-button kind=${args.action.kind} size="sm" slot="action"
          >${args.action.text} ${args.action.icon}</cds-button
        >
      `}
      ${args.link &&
      html`
        <cds-link href=${args.link.href} slot="link">
          ${args.link.text}
        </cds-link>
      `}
    </clabs-empty-state>
  `;
};

export const Default = {
  args: {
    title: 'Example EmptyState title',
    subtitle: 'Example subtitle',
    size: 'lg',
  },
  argTypes,
  render: renderTemplate,
};
export const WithCustomIllustration = {
  args: {
    title: 'Example EmptyState title',
    subtitle: 'Example subtitle',
    size: 'lg',
    kind: 'notFound',
    illustrationTheme: 'light',
    illustration: CustomIllustration,
  },
  argTypes,
  render: renderTemplate,
};
export const WithAction = {
  args: {
    title: 'Example EmptyState title',
    subtitle: 'Example subtitle',
    size: 'lg',
    action: {
      text: 'Create new',
      kind: 'tertiary',
    },
  },
  argTypes,
  render: renderTemplate,
};
export const WithActionIconButton = {
  args: {
    title: 'Example EmptyState title',
    subtitle: 'Example subtitle',
    size: 'lg',
    action: {
      text: 'Create new',
      kind: 'tertiary',
      icon: Add20({ slot: 'icon' }),
    },
  },
  argTypes,
  render: renderTemplate,
};
export const WithLink = {
  args: {
    title: 'Example EmptyState title',
    subtitle: 'Example subtitle',
    size: 'lg',
    link: defaultLinkProps,
  },
  argTypes,
  render: renderTemplate,
};
export const WithActionAndLink = {
  args: {
    title: 'Example EmptyState title',
    subtitle: 'Example subtitle',
    size: 'lg',
    link: defaultLinkProps,
    action: {
      text: 'Create new',
      kind: 'tertiary',
      icon: Add20({ slot: 'icon' }),
    },
  },
  argTypes,
  render: renderTemplate,
};
