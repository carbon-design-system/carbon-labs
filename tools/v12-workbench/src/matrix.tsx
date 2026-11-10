/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { createElement, Fragment, type ComponentType } from 'react';
import { Theme, unstable_Layout as Layout } from '@carbon/react';
import {
  DENSITIES,
  THEMES,
  type Density,
  type Theme as ThemeName,
} from './constants';

/** A state of the matrix: its name and the args that put the component in it. */
export interface MatrixState<P> {
  name: string;
  args?: Partial<P>;
}

export interface MatrixOptions<P> {
  /** The args every cell gets. */
  args?: Partial<P>;
  /**
   * The rows. A string names a state: one of `PROP_STATES` sets that boolean
   * prop; any other only marks the cell (`data-state`), for a style or a
   * spec to act on. An object gives the state's args itself.
   */
  states?: ReadonlyArray<string | MatrixState<P>>;
  /** The themes across; the lane's two by default. */
  themes?: readonly ThemeName[];
  /** The densities across, under each theme; both by default. */
  densities?: readonly Density[];
}

/** The states that are a boolean prop of most components. */
export const PROP_STATES = [
  'disabled',
  'readOnly',
  'invalid',
  'warn',
  'open',
  'expanded',
  'selected',
  'checked',
];

const THEME_LABEL: Record<ThemeName, string> = {
  white: 'White',
  g100: 'Gray 100',
};

const label: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: 12,
  lineHeight: '16px',
  background: 'var(--cds-layer-01, #f4f4f4)',
  color: 'var(--cds-text-secondary, #525252)',
};

/**
 * A state as given, or a string state resolved to its args.
 *
 * @param state The state.
 * @returns Its name and args.
 */
function toState<P>(state: string | MatrixState<P>): MatrixState<P> {
  if (typeof state !== 'string') return state;
  const args = PROP_STATES.includes(state) ? { [state]: true } : {};
  return { name: state, args: args as Partial<P> };
}

interface MatrixProps<P> {
  component: ComponentType<P>;
  args: Partial<P>;
  states: ReadonlyArray<MatrixState<P>>;
  themes: readonly ThemeName[];
  densities: readonly Density[];
}

/**
 * The grid: a row per state, a column per theme and density. Each cell is
 * its own Carbon theme zone and layout density; the rest of the toolbar
 * (reduced motion, clock, direction) applies to all of them.
 */
function Matrix<P extends object>({
  component,
  args,
  states,
  themes,
  densities,
}: MatrixProps<P>) {
  const columns = themes.flatMap((theme) =>
    densities.map((density) => ({ theme, density }))
  );
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `max-content repeat(${columns.length}, minmax(max-content, 1fr))`,
        gap: 1,
        background: 'var(--cds-border-subtle-01, #e0e0e0)',
      }}>
      <div style={label} />
      {columns.map(({ theme, density }) => (
        <div key={`${theme}-${density}`} style={label}>
          {THEME_LABEL[theme]} · {density}
        </div>
      ))}
      {states.map((state) => (
        <Fragment key={state.name}>
          <div style={label}>{state.name}</div>
          {columns.map(({ theme, density }) => (
            <Theme
              key={`${theme}-${density}`}
              theme={theme}
              data-density={density}
              data-state={state.name}
              style={{
                padding: 16,
                background: 'var(--cds-background)',
                color: 'var(--cds-text-primary)',
              }}>
              <Layout density={density === 'compact' ? 'condensed' : 'normal'}>
                {createElement(component, { ...args, ...state.args } as P)}
              </Layout>
            </Theme>
          ))}
        </Fragment>
      ))}
    </div>
  );
}

/**
 * A story that renders a component's states by theme by density on one
 * canvas, for review and for visual specs.
 *
 * ```ts
 * export const Matrix = matrixStory(Button, {
 *   args: { children: 'Save' },
 *   states: ['rest', 'disabled'],
 * });
 * ```
 *
 * @param component The component, or a render function taking its args.
 * @param options The args, states, themes and densities.
 * @returns The story.
 */
export function matrixStory<P extends object>(
  component: ComponentType<P>,
  options: MatrixOptions<P> = {}
) {
  const {
    args = {} as Partial<P>,
    states = ['rest'],
    themes = THEMES,
    densities = DENSITIES,
  } = options;
  const rows = states.map(toState);
  return {
    render: () => (
      <Matrix
        component={component}
        args={args}
        states={rows}
        themes={themes}
        densities={densities}
      />
    ),
    parameters: { layout: 'fullscreen', controls: { disable: true } },
  };
}
