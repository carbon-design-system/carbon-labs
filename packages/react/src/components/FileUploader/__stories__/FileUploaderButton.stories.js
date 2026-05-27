/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Form, Button } from '@carbon/react';
import { action } from 'storybook/actions';
import { Upload, Link } from '@carbon/icons-react';
import mdx from './FileUploader.mdx';
import { FileUploaderButton } from '../components/FileUploaderButton';
import '../components/file-uploader-button.scss';

export default {
  title: 'Components/FileUploader',
  tags: ['squad', 'incubating'],
  component: FileUploaderButton,
  parameters: {
    docs: {
      page: mdx,
    },
  },
  argTypes: {
    labelText: {
      control: 'text',
      description: 'Label text for the file input',
      table: {
        category: 'Label',
      },
    },
    buttonText: {
      control: 'text',
      description: 'Button text',
      table: {
        category: 'Button',
      },
    },
    helperText: {
      control: 'text',
      description: 'Helper text below the button',
      table: {
        category: 'Label',
      },
    },
    kind: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'ghost', 'danger'],
      description: 'Button kind',
      table: {
        category: 'Button',
      },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Button size',
      table: {
        category: 'Button',
      },
    },
    hasIconOnly: {
      control: 'boolean',
      description: 'Render as icon-only button',
      table: {
        category: 'Button',
      },
    },
    renderIcon: {
      control: 'select',
      options: ['None', 'Upload', 'Link'],
      description: 'Icon component to render in the button',
      table: {
        category: 'Button',
      },
      mapping: {
        None: undefined,
        Upload: Upload,
        Link: Link,
      },
    },
    accept: {
      control: 'text',
      description: 'Accepted file types (comma-separated)',
      table: {
        category: 'Input',
      },
    },
    multiple: {
      control: 'boolean',
      description: 'Allow multiple file selection',
      table: {
        category: 'Input',
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button and input',
      table: {
        category: 'Input',
      },
    },
    name: {
      control: 'text',
      description: 'Input name attribute for form participation',
      table: {
        category: 'Input',
      },
    },
    onChange: {
      control: false,
      description: 'Callback fired when files are selected',
      table: {
        category: 'Input',
      },
    },
  },
  args: {
    labelText: 'Upload your files',
    buttonText: 'Add files',
    kind: 'primary',
    size: 'md',
    accept: '.jpg,.png,.pdf',
    multiple: false,
    disabled: false,
    hasIconOnly: false,
    renderIcon: 'Upload',
    helperText: undefined,
  },
};

/**
 * FileUploaderButton story component
 * @param {object} args - Story arguments
 * @returns {React.ReactElement} The rendered component
 */
const FileUploaderButtonStoryComponent = (args) => {
  /**
   * Handle file change event
   * @param {Event} event - File input change event
   */
  const handleChange = (event) => {
    const files = event.target.files;
    console.log('onChange', files);
    action('onChange')(Array.from(files));
  };

  /**
   * Handle form submit event
   * @param {Event} event - Form submit event
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const files = formData.getAll('files').filter((f) => f.size > 0);
    console.log('onSubmit', files);
    action('onSubmit')(files);
  };

  return (
    <Form onSubmit={handleSubmit} style={{ padding: '1rem' }}>
      <FileUploaderButton {...args} name="files" onChange={handleChange} />
      <Button
        type="submit"
        kind="primary"
        size="md"
        style={{ position: 'fixed', bottom: '1rem', right: '1rem' }}>
        Submit
      </Button>
    </Form>
  );
};

export const FileUploaderButtonStory = {
  name: 'FileUploaderButton',
  render: FileUploaderButtonStoryComponent,
};
