/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, unsafeCSS } from 'lit';
import '@carbon/web-components/es/components/tag/index.js';
import styles from '../src/color-override.scss?inline';

/**
 * More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
 */
export default {
  title: 'Components/Color Override',
  argTypes: {
    color: {
      control: 'select',
      options: [
        'red',
        'blue',
        'green',
        'purple',
        'cyan',
        'magenta',
        'orange',
        'teal',
        'gray',
        'cool-gray',
        'warm-gray',
        'yellow',
      ],
      description: 'Select a color',
    },
    variation: {
      control: 'select',
      options: ['1', '2', '3', '4', '5', '6', '7'],
      description:
        'Select a color variation (White: 10-70, G10: 20-80, G90: 20-80, G100: 30-90)',
    },
    type: {
      control: 'select',
      options: [
        'red',
        'magenta',
        'purple',
        'blue',
        'cyan',
        'teal',
        'green',
        'gray',
        'cool-gray',
        'warm-gray',
        'high-contrast',
        'outline',
      ],
      description: 'Tag type/color variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Tag size',
    },
    filter: {
      control: 'boolean',
      description: 'Enable filter/dismissible tag',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the tag',
    },
    title: {
      control: 'text',
      description: 'Tag title/tooltip',
    },
  },
};

/**
 * Interactive story with color selection control
 */
export const InteractiveColorSelection = {
  args: {
    color: 'red',
    variation: '2',
    type: 'gray',
    size: 'md',
    filter: false,
    disabled: false,
    title: '',
  },
  /**
   * Render function for interactive color selection story
   * @param {object} args - Story arguments
   * @param {string} args.color - The selected color
   * @param {string} args.variation - The selected color variation
   * @param {string} args.type - The tag type
   * @param {string} args.size - The tag size
   * @param {boolean} args.filter - Whether the tag is filterable
   * @param {boolean} args.disabled - Whether the tag is disabled
   * @param {string} args.title - The tag title
   * @returns {TemplateResult} The rendered template
   */
  render: ({ color, variation, type, size, filter, disabled, title }) => {
    // Detect theme from document
    const theme =
      document.documentElement.getAttribute('storybook-carbon-theme') ||
      'white';

    // Map variation (1-7) to actual shade values per theme
    // White theme (lightest): 10-70
    const whiteShades = [10, 20, 30, 40, 50, 60, 70];
    // Gray 10 theme (light): 20-80
    const g10Shades = [20, 30, 40, 50, 60, 70, 80];
    // Gray 90 theme (dark): 20-80
    const g90Shades = [20, 30, 40, 50, 60, 70, 80];
    // Gray 100 theme (darkest): 30-90
    const g100Shades = [30, 40, 50, 60, 70, 80, 90];

    // Select appropriate shades based on theme
    let shades;
    if (theme === 'white') {
      shades = whiteShades;
    } else if (theme === 'g10') {
      shades = g10Shades;
    } else if (theme === 'g90') {
      shades = g90Shades;
    } else {
      // g100 or any other dark theme
      shades = g100Shades;
    }

    const shade = shades[parseInt(variation) - 1];

    const selectedColor = `${color}-${shade}`;

    return html`
      <style>
        ${unsafeCSS(styles)}
      </style>
      <div data-override="${selectedColor}">
        <cds-tag
          type="${type}"
          size="${size}"
          ?filter="${filter}"
          ?disabled="${disabled}"
          title="${title || selectedColor}">
          ${selectedColor} (${theme})
        </cds-tag>
      </div>
    `;
  },
};

/**
 * Display all color combinations categorized by color
 */
export const AllColorCombinations = {
  args: {
    type: 'gray',
    size: 'md',
    filter: false,
    disabled: false,
  },
  argTypes: {
    color: {
      table: { disable: true },
    },
    variation: {
      table: { disable: true },
    },
    type: {
      control: 'select',
      options: [
        'red',
        'magenta',
        'purple',
        'blue',
        'cyan',
        'teal',
        'green',
        'gray',
        'cool-gray',
        'warm-gray',
        'high-contrast',
        'outline',
      ],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    filter: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
  /**
   * Render function showing all color and variation combinations grouped by color
   * @param {object} args - Story arguments
   * @param {string} args.type - The tag type
   * @param {string} args.size - The tag size
   * @param {boolean} args.filter - Whether the tag is filterable
   * @param {boolean} args.disabled - Whether the tag is disabled
   * @returns {TemplateResult} The rendered template
   */
  render: ({ type, size, filter, disabled }) => {
    // Detect theme from document
    const theme =
      document.documentElement.getAttribute('storybook-carbon-theme') ||
      'white';

    // Define all colors
    const colors = [
      'red',
      'orange',
      'yellow',
      'green',
      'cyan',
      'teal',
      'blue',
      'purple',
      'magenta',
      'gray',
      'cool-gray',
      'warm-gray',
    ];

    // Map variation (1-7) to actual shade values per theme
    // White theme (lightest): 10-70
    const whiteShades = [10, 20, 30, 40, 50, 60, 70];
    // Gray 10 theme (light): 20-80
    const g10Shades = [20, 30, 40, 50, 60, 70, 80];
    // Gray 90 theme (dark): 20-80
    const g90Shades = [20, 30, 40, 50, 60, 70, 80];
    // Gray 100 theme (darkest): 30-90
    const g100Shades = [30, 40, 50, 60, 70, 80, 90];

    // Select appropriate shades based on theme
    let shades;
    if (theme === 'white') {
      shades = whiteShades;
    } else if (theme === 'g10') {
      shades = g10Shades;
    } else if (theme === 'g90') {
      shades = g90Shades;
    } else {
      // g100 or any other dark theme
      shades = g100Shades;
    }

    return html`
      <style>
        ${unsafeCSS(styles)} .shade-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          padding: 0.3rem 0;
        }
      </style>
      ${colors.map(
        (color) => html`
          <div class="shade-grid">
            ${shades.map(
              (shade) => html`
                <div data-override="${color}-${shade}">
                  <cds-tag
                    type="${type}"
                    size="${size}"
                    ?filter="${filter}"
                    ?disabled="${disabled}"
                    title="${color}-${shade}">
                    ${color}-${shade}
                  </cds-tag>
                </div>
              `
            )}
          </div>
        `
      )}
    `;
  },
};

/**
 * Display all tag type variants with a selected color override
 */
export const AllTagTypeVariants = {
  args: {
    color: 'blue',
    variation: '3',
    size: 'md',
  },
  argTypes: {
    color: {
      control: 'select',
      options: [
        'red',
        'blue',
        'green',
        'purple',
        'cyan',
        'magenta',
        'orange',
        'teal',
        'gray',
        'cool-gray',
        'warm-gray',
        'yellow',
      ],
    },
    variation: {
      control: 'select',
      options: ['1', '2', '3', '4', '5', '6', '7'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
  /**
   * Render function showing all tag type variants with the selected color override
   * @param {object} args - Story arguments
   * @param {string} args.color - The selected color
   * @param {string} args.variation - The selected color variation
   * @param {string} args.size - The tag size
   * @returns {TemplateResult} The rendered template
   */
  render: ({ color, variation, size }) => {
    // Detect theme from document
    const theme =
      document.documentElement.getAttribute('storybook-carbon-theme') ||
      'white';

    // Map variation (1-7) to actual shade values per theme
    const whiteShades = [10, 20, 30, 40, 50, 60, 70];
    const g10Shades = [20, 30, 40, 50, 60, 70, 80];
    const g90Shades = [20, 30, 40, 50, 60, 70, 80];
    const g100Shades = [30, 40, 50, 60, 70, 80, 90];

    let shades;
    if (theme === 'white') {
      shades = whiteShades;
    } else if (theme === 'g10') {
      shades = g10Shades;
    } else if (theme === 'g90') {
      shades = g90Shades;
    } else {
      shades = g100Shades;
    }

    const shade = shades[parseInt(variation) - 1];
    const selectedColor = `${color}-${shade}`;

    const tagTypes = [
      'red',
      'magenta',
      'purple',
      'blue',
      'cyan',
      'teal',
      'green',
      'gray',
      'cool-gray',
      'warm-gray',
      'high-contrast',
      'outline',
    ];

    return html`
      <style>
        ${unsafeCSS(styles)} .variants-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
        }
        .variant-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .variant-label {
          font-size: 0.75rem;
          color: var(--cds-text-secondary);
          text-transform: capitalize;
        }
      </style>
      <div data-override="${selectedColor}">
        <div class="variants-grid">
          ${tagTypes.map(
            (type) => html`
              <cds-tag type="${type}" size="${size}"> ${type} </cds-tag>
            `
          )}
          <cds-tag type="gray" size="${size}" filter> Filterable </cds-tag>
          <cds-tag type="gray" size="${size}" disabled> Disabled </cds-tag>
        </div>
      </div>
    `;
  },
};
