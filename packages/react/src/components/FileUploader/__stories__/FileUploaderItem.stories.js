/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { action } from 'storybook/actions';
import mdx from './FileUploader.mdx';
import { FileUploaderItem } from '../components/FileUploaderItem';
import '../components/file-uploader-item.scss';

export default {
  title: 'Components/FileUploader',
  tags: ['squad', 'incubating'],
  component: FileUploaderItem,
  parameters: {
    docs: {
      page: mdx,
    },
  },
  argTypes: {
    name: {
      control: 'text',
      description: 'File name',
    },
    status: {
      control: 'select',
      options: ['edit', 'invalid'],
      description: 'Upload status',
    },
    errorSubject: {
      control: 'text',
      description: 'Error subject/title to display',
    },
    errorBody: {
      control: 'text',
      description: 'Error body/description to display',
    },
    size: {
      control: 'select',
      // options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Size of the item',
    },
    uuid: {
      control: 'text',
      description: 'Unique identifier',
    },
    className: {
      control: 'text',
      description: 'Custom class name',
    },
    onDelete: {
      control: false,
      description: 'Callback when remove button is clicked',
    },
    onEdit: {
      control: false,
      description: 'Callback when file name is edited',
    },
  },
  args: {
    name: 'Screenshot 2026-05-25 at 12.22.44 PM.png',
    status: 'edit',
    errorSubject: 'File size exceeds limit',
    errorBody: '1 MB max file size. Select a new file and try again.',
    size: 'md',
    uuid: 'file-1',
    className: 'custom-class-name',
  },
};

/**
 * FileUploaderItem story component
 * @param {object} args - Story arguments
 * @returns {React.ReactElement} The rendered component
 */
const FileUploaderItemStoryComponent = (args) => {
  const [fileName, setFileName] = useState(args.name);

  /**
   * Handle delete event
   */
  const handleDelete = () => {
    console.log('onDelete', fileName);
    action('onDelete')(fileName);
  };

  /**
   * Handle edit event
   * @param {string} newName - The new file name
   */
  const handleEdit = (newName) => {
    console.log('onEdit', newName);
    action('onEdit')(newName);
    setFileName(newName);
  };

  return (
    <div style={{ maxWidth: '500px', padding: '1rem' }}>
      <FileUploaderItem
        {...args}
        name={fileName}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </div>
  );
};

export const FileUploaderItemStory = {
  name: 'FileUploaderItem',
  render: FileUploaderItemStoryComponent,
};
