/** @type { import('@storybook/web-components').Preview } */
import { html } from 'lit';
import '@carbon/web-components/es/components/skip-to-content/skip-to-content.js';
import containerStyles from './_container.scss?inline'; // eslint-disable-line import/first

export default {
  decorators: [
    (story) => html`
      <style>
        ${containerStyles}
      </style>
      <cds-skip-to-content href="#main-content"
        >Skip to main content</cds-skip-to-content
      >
      <div
        id="main-content"
        name="main-content"
        data-floating-menu-container
        data-modal-container
        role="main">
        ${story()}
      </div>
    `,
  ],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

// export default preview;
