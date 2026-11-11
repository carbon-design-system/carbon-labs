/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { createElement, Fragment, type ComponentType } from 'react';
import { Layer, ThemeContext } from '@carbon/react';
import { KitDefaults } from '@carbon-labs/react-kit-defaults';
import {
  DENSITIES,
  ZONE_THEMES,
  type Density,
  type ZoneTheme,
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
  /**
   * The themes across: v12 light and v12 dark, both by default. Each cell is
   * a zone of its theme (`cds--v12-light`, `cds--v12-dark`).
   */
  themes?: readonly ZoneTheme[];
  /** The densities across, under each theme; all three by default. */
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

const THEME_LABEL: Record<ZoneTheme, string> = {
  'v12-light': 'v12 light',
  'v12-dark': 'v12 dark',
};

/** What each v12 theme is to the kit (`data-cds-theme`), and the Carbon theme it is built on, for Carbon's context. */
const KIT: Record<ZoneTheme, 'light' | 'dark'> = {
  'v12-light': 'light',
  'v12-dark': 'dark',
};
const BASE: Record<ZoneTheme, 'white' | 'g100'> = {
  'v12-light': 'white',
  'v12-dark': 'g100',
};

/**
 * A cell: a zone of its v12 theme, as ThemeZone draws one. Its class sets the
 * theme's tokens on what it holds; Carbon's context and first layer are the
 * theme it is built on, since Carbon's `Theme` knows only its own.
 */
function Zone({
  theme,
  state,
  children,
}: {
  theme: ZoneTheme;
  state: string;
  children: React.ReactNode;
}) {
  const context = { theme: BASE[theme], isDark: KIT[theme] === 'dark' };
  return (
    <ThemeContext.Provider value={context}>
      <Layer
        level={0}
        className={`cds--${theme}`}
        data-theme-zone={KIT[theme]}
        data-cds-theme={KIT[theme]}
        data-state={state}
        style={{
          padding: 16,
          background: 'var(--cds-background)',
          color: 'var(--cds-text-primary)',
        }}>
        {children}
      </Layer>
    </ThemeContext.Provider>
  );
}

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
  themes: readonly ZoneTheme[];
  densities: readonly Density[];
}

/**
 * The grid: a row per state, a column per theme and density. Each cell is
 * its own v12 theme zone and kit density; the rest of the toolbar
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
            <Zone key={`${theme}-${density}`} theme={theme} state={state.name}>
              <KitDefaults
                density={density === 'default' ? undefined : density}>
                {createElement(component, { ...args, ...state.args } as P)}
              </KitDefaults>
            </Zone>
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
    themes = ZONE_THEMES,
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
