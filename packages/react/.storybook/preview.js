import React, { useEffect } from 'react';
import { white, g10, g90, g100 } from '@carbon/themes';
import { breakpoints } from '@carbon/layout';
import { GlobalTheme, Theme } from '@carbon/react/es/components/Theme';
import { Layout } from '@carbon/react/es/components/Layout';
import { TextDirection } from '@carbon/react/es/components/Text';
import { DocsContainer, Unstyled } from '@storybook/blocks';
import '../src/components/MDXComponents/components/index.scss';
import './styles.scss';

import theme from './theme';

/**
 * Custom container to render Carbon MDX differently
 */
const Container = ({ children, ...props }) => {
  // MDX pages that aren't associated with a story
  // @TODO set prop types
  const isCarbonMdx =
    children?.type?.name === `MDXContent` &&
    !props?.context?.attachedCSFFiles.size;

  useEffect(() => {
    if (isCarbonMdx) {
      document.documentElement.classList.add('cds--mdx');
    } else {
      document.documentElement.classList.remove('cds--mdx');
    }
  }, [isCarbonMdx]);

  // Disable Storybook markdown styles and ignore global theme switchers
  if (isCarbonMdx) {
    return (
      <DocsContainer {...props}>
        <Unstyled>
          <Theme
            style={{
              paddingBottom: '2rem',
              paddingTop: '1px',
              marginTop: '-1px',
            }}
            theme="g10">
            {children}
          </Theme>
        </Unstyled>
      </DocsContainer>
    );
  }

  return <DocsContainer {...props}>{children}</DocsContainer>;
};

const devTools = {
  layoutSize: {
    description: "Set the layout context's size",
    defaultValue: false,
    toolbar: {
      title: 'dev :: unstable__Layout size',
      items: [
        {
          value: false,
          title: 'None',
        },
        'xs',
        'sm',
        'md',
        'lg',
        'xl',
        '2xl',
      ],
    },
  },
  layoutDensity: {
    description: "Set the layout context's density",
    defaultValue: false,
    toolbar: {
      title: 'dev :: unstable__Layout density',
      items: [
        {
          value: false,
          title: 'None',
        },
        'condensed',
        'normal',
      ],
    },
  },
};

export const globalTypes = {
  dir: {
    name: 'Text direction',
    description: 'Set the text direction for the story',
    defaultValue: 'ltr',
    toolbar: {
      icon: 'transfer',
      title: 'Text direction',
      items: [
        {
          right: '🔄',
          title: 'auto',
          value: 'auto',
        },
        {
          right: '➡️',
          title: 'left-to-right (ltr)',
          value: 'ltr',
        },
        {
          right: '⬅️',
          title: 'right-to-left (rtl)',
          value: 'rtl',
        },
      ],
    },
  },
  theme: {
    name: 'Theme',
    description: 'Set the global theme for displaying components',
    defaultValue: 'white',
    toolbar: {
      icon: 'paintbrush',
      items: ['white', 'g10', 'g90', 'g100'],
    },
  },
  ...(process.env.NODE_ENV === 'development' ? devTools : {}),
};

export const parameters = {
  backgrounds: {
    // https://storybook.js.org/docs/react/essentials/backgrounds#grid
    grid: {
      cellSize: 8,
      opacity: 0.5,
    },
    values: [
      {
        name: 'white',
        value: white.background,
      },
      {
        name: 'g10',
        value: g10.background,
      },
      {
        name: 'g90',
        value: g90.background,
      },
      {
        name: 'g100',
        value: g100.background,
      },
    ],
  },
  controls: {
    // https://storybook.js.org/docs/react/essentials/controls#show-full-documentation-for-each-property
    expanded: true,

    // https://storybook.js.org/docs/react/essentials/controls#specify-initial-preset-color-swatches
    // presetColors: [],

    // https://storybook.js.org/docs/react/essentials/controls#sorting-controls
    sort: 'alpha',

    hideNoControlsWarning: true,
  },
  darkMode: {
    current: 'light',
  },
  docs: {
    container: Container,
    theme,
  },
  // Small (<672)
  // Medium (672 - 1056px)
  // Large (1056 - 1312px)
  // X-Large (1312 - 1584px)
  // Max (>1584)
  viewport: {
    viewports: {
      sm: {
        name: 'Small',
        styles: {
          width: breakpoints.sm.width,
          height: '100%',
        },
      },
      md: {
        name: 'Medium',
        styles: {
          width: breakpoints.md.width,
          height: '100%',
        },
      },
      lg: {
        name: 'Large',
        styles: {
          width: breakpoints.lg.width,
          height: '100%',
        },
      },
      xlg: {
        name: 'X-Large',
        styles: {
          width: breakpoints.xlg.width,
          height: '100%',
        },
      },
      Max: {
        name: 'Max',
        styles: {
          width: breakpoints.max.width,
          height: '100%',
        },
      },
    },
  },
};

const decorators = [
  (Story, context) => {
    let { theme } = context.globals;
    const { layoutDensity, layoutSize, locale, dir } = context.globals;
    const [randomKey, setRandomKey] = React.useState(1);

    const isMarkdown = context?.kind?.startsWith('MDX Components');

    // Carbon MDX only supports the g10 theme
    if (isMarkdown) {
      theme = 'g10';
    }

    React.useEffect(() => {
      document.documentElement.setAttribute('data-carbon-theme', theme);
    }, [theme]);

    React.useLayoutEffect(() => {
      document.documentElement.lang = locale;
      document.documentElement.dir = dir;
      // Need to set random key to recalculate Popover coordinates
      setRandomKey(Math.floor(Math.random() * 10));
    }, [locale, dir]);

    return (
      <GlobalTheme theme={theme}>
        <Layout size={layoutSize || null} density={layoutDensity || null}>
          <TextDirection
            getTextDirection={(text) => {
              return dir;
            }}>
            <Theme theme={theme}>
              <Story key={randomKey} {...context} />
            </Theme>
          </TextDirection>
        </Layout>
      </GlobalTheme>
    );
  },
];

const preview = {
  parameters,
  decorators,
  globalTypes,
};

export default preview;
