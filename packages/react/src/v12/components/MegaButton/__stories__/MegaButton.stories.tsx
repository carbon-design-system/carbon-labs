/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react-webpack5';
import { Button } from '@carbon/react';
import { Add, ArrowRight, Copy, Save, TrashCan } from '@carbon/icons-react';
import {
  MegaButton,
  megaButtonKinds,
  megaButtonSizes,
  type MegaButtonProps,
} from '../components/MegaButton';
import '../components/mega-button.scss';
import '../../KeyboardShortcut/components/keyboard-shortcut.scss';
import './MegaButton.stories.scss';
import proposals from '../proposals/tokens.json';
import mdx from './MegaButton.mdx';

type Theme = 'white' | 'g10' | 'g90' | 'g100';

/**
 * The proposed values, for one Carbon theme, as the custom properties the
 * stylesheet reads through get-var, scoped to one class. Without them the
 * component renders on stock Carbon (each get-var's fallback), which is what
 * the `proposals` control shows when it is off.
 *
 * @param {Theme} theme The Storybook theme.
 * @param {string} scope The class the values are scoped to.
 * @returns {string} A CSS rule with one custom property per proposed token.
 */
function proposedValues(theme: Theme, scope: string): string {
  const declarations = Object.entries(proposals['mega-button']).map(
    ([role, token]) => {
      const themes = (
        token as { $extensions: { 'carbon.themes': Record<Theme, string> } }
      ).$extensions['carbon.themes'];
      return `--cds-mega-button-${role}: ${themes[theme] ?? themes.white};`;
    }
  );
  return `.${scope} { ${declarations.join(' ')} }`;
}

const withProposals: Decorator = (Story, context) => {
  const theme = (context.globals.theme ?? 'white') as Theme;
  const on = context.args.proposals !== false;
  const scope = 'mega-button-story-proposals';
  return (
    <div className={on ? scope : undefined}>
      {on && <style>{proposedValues(theme, scope)}</style>}
      <Story />
    </div>
  );
};

const icons = { None: undefined, Add, ArrowRight, Copy, Save, TrashCan };

type StoryArgs = MegaButtonProps & {
  proposals?: boolean;
  icon?: keyof typeof icons;
};

const meta: Meta<StoryArgs> = {
  title: 'V12/MegaButton',
  tags: ['squad', 'incubating'],
  component: MegaButton,
  decorators: [withProposals],
  parameters: {
    docs: {
      page: mdx,
    },
  },
  args: {
    children: 'Button',
    kind: 'primary',
    size: 'lg',
    icon: 'Add',
    iconPosition: 'leading',
    keyCommand: ['mod', 's'],
    hasIconOnly: false,
    disabled: false,
    proposals: true,
  },
  argTypes: {
    children: { control: 'text' },
    className: { control: false },
    kind: { control: 'select', options: megaButtonKinds },
    size: { control: 'select', options: megaButtonSizes },
    icon: {
      control: 'select',
      options: Object.keys(icons),
      description: 'Story only: the icon passed as `renderIcon`.',
      table: { category: 'Story' },
    },
    renderIcon: { control: false },
    iconPosition: { control: 'inline-radio', options: ['leading', 'trailing'] },
    keyCommand: { control: 'object' },
    isSelected: { control: 'boolean' },
    tooltipAlignment: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    proposals: {
      control: 'boolean',
      description:
        'Story only: apply the proposed tokens (proposals/tokens.json) for the current theme. Off shows the component on stock Carbon.',
      table: { category: 'Story' },
    },
  },
  render: ({ icon, proposals: _proposals, ...args }) => (
    <MegaButton {...args} renderIcon={icon ? icons[icon] : undefined} />
  ),
};

export default meta;
type Story = StoryObj<StoryArgs>;

export const Default: Story = {};

export const IconOnly: Story = {
  args: { hasIconOnly: true, icon: 'Copy', children: 'Copy', size: 'lg' },
};

// Story layout only, from Carbon's spacing tokens in MegaButton.stories.scss.
const row = 'mega-button-story-row';

/**
 * Every kind at every size, at rest, selected and disabled, with an icon and a
 * key command. Hover, press and focus are pseudo-classes, so they are measured
 * by forcing them in the browser rather than drawn here.
 */
export const Matrix: Story = {
  render: ({ proposals: _proposals, icon: _icon, ...args }) => (
    <div>
      {megaButtonKinds.map((kind) => (
        <section key={kind} aria-label={kind}>
          {(['rest', 'selected', 'disabled'] as const).map((state) => (
            <div key={state} className={row}>
              {megaButtonSizes.map((size) => (
                <MegaButton
                  {...args}
                  key={size}
                  kind={kind}
                  size={size}
                  renderIcon={Add}
                  isSelected={state === 'selected' ? true : undefined}
                  disabled={state === 'disabled'}
                  data-state={state}>
                  {`${kind} ${size}`}
                </MegaButton>
              ))}
              {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
                <MegaButton
                  key={`icon-${size}`}
                  kind={kind}
                  size={size}
                  hasIconOnly
                  renderIcon={Add}
                  isSelected={state === 'selected' ? true : undefined}
                  disabled={state === 'disabled'}
                  data-state={state}>
                  Add
                </MegaButton>
              ))}
            </div>
          ))}
        </section>
      ))}
    </div>
  ),
};

/**
 * Beside Carbon's Button, for the review decision 7 asks for. Carbon's kind
 * names are the other way round: MegaButton's `secondary` (outline) sits next
 * to Carbon's `tertiary`, and its `tertiary` (tinted fill) next to Carbon's
 * `secondary`.
 */
export const BesideCarbonButton: Story = {
  render: ({ proposals: _proposals, icon: _icon, ...args }) => {
    const pairs = [
      ['primary', 'primary'],
      ['secondary', 'tertiary'],
      ['tertiary', 'secondary'],
      ['ghost', 'ghost'],
      ['danger', 'danger'],
      ['danger--secondary', 'danger--tertiary'],
    ] as const;
    return (
      <div>
        {pairs.map(([ours, carbons]) => (
          <div key={ours} className={row}>
            <MegaButton {...args} kind={ours} renderIcon={Add}>
              {`MegaButton ${ours}`}
            </MegaButton>
            <Button kind={carbons} size={args.size} renderIcon={Add}>
              {`Carbon ${carbons}`}
            </Button>
          </div>
        ))}
      </div>
    );
  },
};
