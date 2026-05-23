/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../components/file-uploader-button/file-uploader-button';
import { html } from 'lit';
import { action } from 'storybook/actions';

/**
 * More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
 */
export default {
  title: 'Components/File Uploader Button',
  tags: ['squad', 'incubating'],
  component: 'clabs-file-uploader-button',
  argTypes: {
    accept: {
      control: 'text',
      description: 'Comma-separated accepted file types',
      table: {
        category: 'Controls',
        defaultValue: { summary: '' },
      },
    },
    autofocus: {
      control: 'boolean',
      description: 'Autofocus the input on page load',
      table: {
        category: 'Controls',
        defaultValue: { summary: 'false' },
      },
    },
    capture: {
      control: 'text',
      description: 'Capture source hint for mobile devices',
      table: {
        category: 'Controls',
        defaultValue: { summary: '' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable file selection',
      table: {
        category: 'Controls',
        defaultValue: { summary: 'false' },
      },
    },
    form: {
      control: 'text',
      description: 'Associate the input with a form',
      table: {
        category: 'Controls',
        defaultValue: { summary: '' },
      },
    },
    name: {
      control: 'text',
      description: 'Input name for form submission',
      table: {
        category: 'Controls',
        defaultValue: { summary: '' },
      },
    },
    required: {
      control: 'boolean',
      description: 'Require a file before form submission',
      table: {
        category: 'Controls',
        defaultValue: { summary: 'false' },
      },
    },
    multiple: {
      control: 'boolean',
      description: 'Allow multiple file selection',
      table: {
        category: 'Controls',
        defaultValue: { summary: 'false' },
      },
    },
    webkitdirectory: {
      control: 'boolean',
      description: 'Enable directory selection in supporting browsers',
      table: {
        category: 'Controls',
        defaultValue: { summary: 'false' },
      },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label override for the input',
      table: {
        category: 'Accessibility',
        defaultValue: { summary: '' },
      },
    },
    buttonText: {
      control: 'text',
      description: 'Button text label',
      table: {
        category: 'Controls',
        defaultValue: { summary: 'Upload file' },
      },
    },
    kind: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'ghost', 'danger'],
      description: 'Button kind/variant',
      table: {
        category: 'Controls',
        defaultValue: { summary: 'primary' },
      },
    },
    dropContainer: {
      control: 'boolean',
      description: 'Render as a drop container instead of a button',
      table: {
        category: 'Controls',
        defaultValue: { summary: 'false' },
      },
    },
  },
};

/**
 * Default story
 */
export const Default = {
  args: {
    accept: '',
    autofocus: false,
    capture: '',
    disabled: false,
    form: '',
    name: '',
    required: false,
    multiple: false,
    webkitdirectory: false,
    ariaLabel: '',
    buttonText: 'Upload file',
    kind: 'primary',
    dropContainer: false,
  },

  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: (args) => {
    /**
     * Handle change event
     * @param {CustomEvent} e - The change event
     */
    const handleChange = (e) => {
      console.log('change event:', e);
      action('change')(e);
    };

    return html`
      <clabs-file-uploader-button
        accept=${args.accept}
        ?autofocus=${args.autofocus}
        capture=${args.capture}
        ?disabled=${args.disabled}
        form=${args.form}
        name=${args.name}
        ?required=${args.required}
        ?multiple=${args.multiple}
        ?webkitdirectory=${args.webkitdirectory}
        aria-label=${args.ariaLabel}
        button-text=${args.buttonText}
        kind=${args.kind}
        ?drop-container=${args.dropContainer}
        @change=${handleChange}>
      </clabs-file-uploader-button>
    `;
  },
};
