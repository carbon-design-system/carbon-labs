/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecipeRenderer, spacingStep } from '../components/RecipeRenderer';
import { registry } from '../components/registry';
import { recipes } from '../recipes';
import type { Recipe } from '../components/types';

const layout = (tree: Recipe['tree']): Recipe => ({
  name: 'test-layout',
  kind: 'layout',
  status: 'draft',
  description: 'test',
  meta: { intent: 'test', useWhen: ['test'] },
  tree,
});

describe('RecipeRenderer', () => {
  it('resolves every registry entry at the installed @carbon/react', () => {
    const missing = Object.entries(registry)
      .filter(([, c]) => !c)
      .map(([k]) => k);
    expect(missing).toEqual([]);
  });

  it.each(Object.keys(recipes))('renders the %s recipe', (name) => {
    const { container } = render(<RecipeRenderer recipe={recipes[name]} />);
    expect(container.firstChild).toHaveAttribute('data-recipe', name);
  });

  it('places grid nodes in Carbon columns and gaps in a Carbon Stack', () => {
    const { container } = render(
      <RecipeRenderer
        recipe={layout({
          component: '@carbon/react:Grid',
          children: [
            {
              component: '@carbon/react:Tile',
              grid: { span: { lg: 8 } },
              gap: 'spacing-05',
              padding: 'spacing-03',
              children: [
                {
                  component: '@carbon/react:Heading',
                  props: { children: 'A' },
                },
                {
                  component: '@carbon/react:Heading',
                  props: { children: 'B' },
                },
              ],
            },
          ],
        })}
      />
    );
    expect(container.querySelector('[class*="lg:col-span-8"]')).not.toBeNull();
    expect(container.querySelector('.cds--stack-scale-5')).not.toBeNull();
    expect(
      container.querySelector('.cds--recipe-renderer__padding--spacing-03')
    ).not.toBeNull();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('gives a Stack its own gap instead of nesting another', () => {
    const { container } = render(
      <RecipeRenderer
        recipe={layout({
          component: '@carbon/react:Stack',
          props: { orientation: 'horizontal' },
          gap: 'spacing-03',
          children: [
            { component: '@carbon/react:Tag', props: { children: 'A' } },
            { component: '@carbon/react:Tag', props: { children: 'B' } },
          ],
        })}
      />
    );
    const stacks = container.querySelectorAll('[class*="cds--stack-"]');
    expect(stacks).toHaveLength(1);
    expect(stacks[0]).toHaveClass(
      'cds--stack-horizontal',
      'cds--stack-scale-3'
    );
  });

  it('keeps children visible to Carbon parents that clone them', () => {
    render(
      <RecipeRenderer
        recipe={layout({
          component: '@carbon/react:RadioButtonGroup',
          props: { legendText: 'Often', name: 'often', defaultSelected: 'b' },
          children: [
            {
              component: '@carbon/react:RadioButton',
              props: { id: 'a', labelText: 'A', value: 'a' },
            },
            {
              component: '@carbon/react:RadioButton',
              props: { id: 'b', labelText: 'B', value: 'b' },
            },
          ],
        })}
      />
    );
    expect(screen.getByLabelText('B')).toBeChecked();
    expect(screen.getByLabelText('A')).not.toBeChecked();
  });

  it('renders a slot into the parent prop and drops style props', () => {
    render(
      <RecipeRenderer
        recipe={layout({
          component: '@carbon/react:TextInput',
          props: { id: 'f', labelText: 'Field', style: { color: 'red' } },
          children: [
            {
              component: '@carbon/react:Link',
              slot: 'helperText',
              props: { href: '#', children: 'Help' },
            },
          ],
        })}
      />
    );
    expect(screen.getByRole('link', { name: 'Help' })).toBeInTheDocument();
    expect(screen.getByLabelText('Field')).not.toHaveAttribute('style');
  });

  it('turns $event props into onEvent calls', async () => {
    const onEvent = jest.fn();
    render(
      <RecipeRenderer
        onEvent={onEvent}
        recipe={layout({
          component: '@carbon/react:Button',
          props: { children: 'Save', onClick: { $event: 'save' } },
        })}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onEvent).toHaveBeenCalledWith(
      'save',
      expect.objectContaining({ recipe: 'test-layout' })
    );
  });

  it('walks a flow one step at a time, backwards too, moving focus', async () => {
    const { container } = render(
      <RecipeRenderer recipe={recipes['create-topic']} />
    );
    const step = () =>
      container.querySelector('[data-step]')?.getAttribute('data-step');
    expect(step()).toBe('partition');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(step()).toBe('core-configuration');
    expect(container.querySelector('[data-step]')).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(step()).toBe('partition');
  });

  it('refuses a component the registry does not hold', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <RecipeRenderer
          recipe={layout({ component: '@carbon/react:NotAComponent' })}
        />
      )
    ).toThrow(/not in the registry/);
  });

  it('maps spacing tokens to Stack steps', () => {
    expect(spacingStep('spacing-05')).toBe(5);
    expect(() => spacingStep('16px')).toThrow();
  });
});
