/**
 * @license
 *
 * Copyright IBM Corp. 2023, 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { action } from 'storybook/actions';
import cx from 'classnames';
import mdx from './InlineTip.mdx';
import { InlineTip } from '../components/InlineTip';
import { InlineTipButton } from '../components/InlineTipButton';
import { InlineTipLink } from '../components/InlineTipLink';
import '../components/inline-tip.scss';
import './storybook.scss';
import InlineTipImage from './assets/inline-tip-image.png';

export default {
  title: 'Components/InlineTip',
  component: InlineTip,
  parameters: {
    layout: 'padded',
    docs: {
      page: mdx,
    },
  },
  argTypes: {
    action: {
      options: ['None', '<InlineTipButton>', '<InlineTipLink>'],
      control: { type: 'radio' },
    },
    renderMedia: {
      options: ['None', 'Render a static image'],
      control: { type: 'radio' },
    },
    narrow: {
      control: { type: null },
    },
  },
};

const defaultProps = {
  children: (
    <ul>
      <li>
        Use <b>case-specific</b> content that explains the concept or adds
        context.
      </li>
      <li>
        Use case-specific <i>content that</i> explains the concept or adds
        context.
      </li>
      <li>
        Use case-specific content that explains the concept or adds context.
      </li>
    </ul>
  ),
  closeIconDescription: 'Close',
  collapseButtonLabel: 'Read less',
  collapsible: false,
  action: 'None',
  expandButtonLabel: 'Read more',
  renderMedia: 'None',
  /** Logs the tertiary button click to the Actions panel. */
  onClick: () => {
    action(`Clicked the tertiary button`)();
  },
  /** Logs the close button click to the Actions panel. */
  onClose: () => {
    action(`Clicked the close button`)();
  },
  title: 'Use case-specific heading',
  withLeftGutter: false,
};

/**
 * Template for InlineTip
 * @param {object} args story args
 * @returns {React.ReactElement} the story
 */
const Template = (args) => {
  const { renderMedia, narrow, action: componentAction } = args;

  const selectedMedia = (function () {
    switch (renderMedia) {
      case 'Render a static image':
        return () => <img alt="" src={InlineTipImage} />;

      default:
        return null;
    }
  })();
  const selectedAction = (function () {
    switch (componentAction) {
      case '<InlineTipButton>':
        return (
          <InlineTipButton
            onClick={() => {
              action(`Clicked the action button`)();
            }}>
            Click me
          </InlineTipButton>
        );
      case '<InlineTipLink>':
        return (
          <InlineTipLink
            href="https://www.ibm.com"
            onClick={() => {
              action('Clicked the link')();
            }}
            target="_blank">
            Learn more
          </InlineTipLink>
        );
      default:
        return null;
    }
  })();

  return (
    <div
      className={cx(
        narrow ? 'storybook--inline-tip-narrow' : 'storybook--inline-tip-wide'
      )}>
      <InlineTip
        {...args}
        renderMedia={selectedMedia}
        action={selectedAction}
      />
    </div>
  );
};

/**
 * Default (wide) InlineTip
 */
export const Default = Template.bind({});
Default.args = {
  narrow: false,
  ...defaultProps,
};

/**
 * Narrow InlineTip
 */
export const Narrow = Template.bind({});
Narrow.args = {
  narrow: true,
  ...defaultProps,
};
