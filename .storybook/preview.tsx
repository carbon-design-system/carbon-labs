/**
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect } from 'react';
import { breakpoints } from '@carbon/layout';
import { white, g10, g90, g100 } from '@carbon/themes';

import '../src/index.css';
import './preview.css';

import type { Preview, Decorator } from '@storybook/react';

// Controls that are hidden across all stories
const GLOBAL_EXCLUDED_CONTROLS: Array<string | RegExp> = [
  'className',
  'children',
  'as',
  'ref',
  /^(?:on[A-Z]\w*)$/,
];

export const argTypesEnhancers = [
  (context: { argTypes?: Record<string, unknown>; name?: string }) => {
    const current = (context.argTypes ?? {}) as Record<
      string,
      { table?: { disable?: boolean } }
    >;
    const next = { ...current };

    // Don't hide args on the overview/meta page — show them for docs
    if (context?.name === '__meta') return current;

    const strings = new Set<string>();
    const regexes: RegExp[] = [];
    for (const p of GLOBAL_EXCLUDED_CONTROLS) {
      if (typeof p === 'string') strings.add(p);
      else if (p instanceof RegExp) regexes.push(p);
    }

    const disable = (name: string) => {
      const prev = next[name] ?? {};
      next[name] = { ...prev, table: { ...(prev.table ?? {}), disable: true } };
    };

    strings.forEach((name) => {
      if (name in next) disable(name);
    });
    if (regexes.length) {
      Object.keys(next).forEach((name) => {
        if (strings.has(name)) return;
        if (regexes.some((re) => re.test(name))) disable(name);
      });
    }

    return next;
  },
];

const themeDecorator: Decorator = (Story, context) => {
  const backgroundValue = context.globals.backgrounds?.value as
    | string
    | undefined;

  useEffect(() => {
    let theme = 'system';

    if (
      backgroundValue === white.background ||
      backgroundValue === 'white'
    ) {
      theme = 'white';
    } else if (
      backgroundValue === g10.background ||
      backgroundValue === 'g10'
    ) {
      theme = 'g10';
    } else if (
      backgroundValue === g90.background ||
      backgroundValue === 'g90'
    ) {
      theme = 'g90';
    } else if (
      backgroundValue === g100.background ||
      backgroundValue === 'g100'
    ) {
      theme = 'g100';
    } else if (
      backgroundValue === 'transparent' ||
      backgroundValue === 'system' ||
      !backgroundValue
    ) {
      theme = 'system';
    }

    // Apply the Carbon class-based theme tokens (e.g. .cds--g90) so that
    // --cds-* custom properties update correctly — Carbon's stylesheet scopes
    // token overrides under class selectors, not data attributes.
    const CDS_THEME_CLASSES = ['cds--white', 'cds--g10', 'cds--g90', 'cds--g100'];
    CDS_THEME_CLASSES.forEach(c => document.documentElement.classList.remove(c));
    if (theme !== 'system') {
      document.documentElement.setAttribute('data-carbon-theme', theme);
      document.documentElement.classList.add(`cds--${theme}`);
    } else {
      document.documentElement.removeAttribute('data-carbon-theme');
    }

    const themeMapping =
      theme === 'white' || theme === 'g10'
        ? 'light'
        : theme === 'g90' || theme === 'g100'
          ? 'dark'
          : 'system';

    document.documentElement.setAttribute('data-theme-setting', themeMapping);
  }, [backgroundValue]);

  return React.createElement(Story);
};

const preview: Preview = {
  parameters: {
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      sort: 'alpha',
      hideNoControlsWarning: true,
    },
    viewport: {
      options: {
        sm: {
          name: 'Small',
          styles: { width: breakpoints.sm.width, height: '100%' },
        },
        md: {
          name: 'Medium',
          styles: { width: breakpoints.md.width, height: '100%' },
        },
        lg: {
          name: 'Large',
          styles: { width: breakpoints.lg.width, height: '100%' },
        },
        xlg: {
          name: 'X-Large',
          styles: { width: breakpoints.xlg.width, height: '100%' },
        },
        Max: {
          name: 'Max',
          styles: { width: breakpoints.max.width, height: '100%' },
        },
      },
    },
    backgrounds: {
      grid: { cellSize: 8, opacity: 0.5 },
      options: {
        white: { name: 'white', value: white.background },
        g10: { name: 'g10', value: g10.background },
        g90: { name: 'g90', value: g90.background },
        g100: { name: 'g100', value: g100.background },
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'html_lang_exists', enabled: false },
          { id: 'page_title_exists', enabled: false },
          { id: 'skip_main_exists', enabled: false },
          { id: 'html_skipnav_exists', enabled: false },
          { id: 'aria_content_in_landmark', enabled: false },
          { id: 'aria_child_tabbable', enabled: false },
        ],
      },
    },
  },
  decorators: [themeDecorator],
};

export default preview;
