/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import {
  checkInstance,
  recipeProblems,
  type RecipeDef,
} from '../components/define';
import { resourceIndex } from '../components/resource-index';

describe('recipes', () => {
  it('the Resource index definition is whole', () => {
    expect(recipeProblems(resourceIndex as RecipeDef)).toEqual([]);
  });

  it('a definition that names an unknown region or state is caught', () => {
    const bad = {
      ...resourceIndex,
      states: ['loading', 'loaded'],
      transitions: [
        { from: 'loaded', to: 'nowhere', lead: 'sidebar', primitive: 'push' },
      ],
    } as unknown as RecipeDef;
    expect(recipeProblems(bad)).toEqual([
      'no "error" state',
      'a transition names an unknown state "nowhere"',
      'a transition names an unknown region "sidebar"',
    ]);
  });

  it('a generated screen with the right components passes', () => {
    const problems = checkInstance(
      {
        recipe: 'resource-index',
        state: 'loaded',
        slots: {
          pageHeader: {
            component: 'PageHeader',
            props: { title: 'Deployments' },
          },
          toolbar: [
            { component: 'Search' },
            { component: 'Button', props: { kind: 'primary' } },
          ],
          main: { component: 'DataTable' },
        },
      },
      [resourceIndex as RecipeDef]
    );
    expect(problems).toEqual([]);
  });

  it('a generated screen is held to what each slot accepts', () => {
    const problems = checkInstance(
      {
        recipe: 'resource-index',
        state: 'sideways',
        slots: {
          main: { component: 'Modal' },
          sidebar: { component: 'SideNav' },
        },
      },
      [resourceIndex as RecipeDef],
      new Set(['PageHeader', 'DataTable', 'Modal'])
    );
    expect(problems).toEqual([
      'no state "sideways"',
      'the required slot "pageHeader" is empty',
      `main doesn't take "Modal" (it takes DataTable, DataTableReveal, EmptyState)`,
      'no slot "sidebar"',
    ]);
  });
});
