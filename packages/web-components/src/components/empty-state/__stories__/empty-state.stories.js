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
      'Object for the link — this is only for Storybook and not a prop in the component.',
  },
  action: {
    control: 'object',
    description:
      'Object for the action button — this is only for Storybook and not a prop in the component',
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
      size=${args.size}>
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
