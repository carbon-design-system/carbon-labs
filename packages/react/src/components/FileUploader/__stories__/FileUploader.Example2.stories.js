/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useRef } from 'react';
import { Form, Button } from '@carbon/react';
import { action } from 'storybook/actions';
import { Upload, Link } from '@carbon/icons-react';
import mdx from './FileUploader.mdx';
import { FileUploaderButton } from '../components/FileUploaderButton';
import { FileUploaderItem } from '../components/FileUploaderItem';
import '../components/file-uploader-button.scss';
import '../components/file-uploader-item.scss';

export default {
  title: 'Components/FileUploader/Composable examples',
  tags: ['squad', 'incubating'],
  component: FileUploaderButton,
  decorators: [
    (Story) => (
      <div
        style={{
          maxWidth: `500px`,
          width: '100%',
          padding: '1rem',
        }}>
        <Story />
      </div>
    ),
  ],
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
    maxFileSize: {
      control: 'number',
      description: 'Maximum file size in bytes (default: 512KB)',
      table: {
        category: 'FileUploaderItem',
      },
    },
    errorSubject: {
      control: 'text',
      description: 'Error subject text for invalid files',
      table: {
        category: 'FileUploaderItem',
      },
    },
    errorBody: {
      control: 'text',
      description: 'Error body text for invalid files',
      table: {
        category: 'FileUploaderItem',
      },
    },
  },
  args: {
    labelText:
      'Max file size is 512kb. Supported file types are .jpg and .png.',
    buttonText: 'Add files',
    kind: 'primary',
    size: 'md',
    accept: '.jpg,.png,.pdf',
    multiple: false,
    disabled: false,
    hasIconOnly: false,
    renderIcon: 'Upload',
    name: 'files',
    helperText: '',
    maxFileSize: 512 * 1024, // 512KB in bytes
    errorSubject: 'File size exceeds limit',
    errorBody: '512kb max file size. Select a new file and try again.',
  },
};

/**
 * FileUploaderButton story component
 * @param {object} args - Story arguments
 * @returns {React.ReactElement} The rendered component
 */
const Template = (args) => {
  const [files, setFiles] = useState([]);
  const buttonRef = useRef(null);
  const fileIdCounter = useRef(0);
  const fileIds = useRef(new Map());
  const itemRefs = useRef(new Map());

  /**
   * Get or create a stable ID for a file
   * @param {File} file - File object
   * @returns {number} Stable ID
   */
  const getFileId = (file) => {
    if (!fileIds.current.has(file)) {
      fileIds.current.set(file, fileIdCounter.current++);
    }
    return fileIds.current.get(file);
  };

  /**
   * Handle file change event
   * @param {Event} event - File input change event
   */
  const handleChange = (event) => {
    const fileList = event.target.files;
    const filesArray = fileList ? Array.from(fileList) : [];
    setFiles(filesArray);
    console.log('onChange', filesArray);
    action('onChange')(filesArray);
  };

  /**
   * Handle file deletion
   * @param {number} fileId - Stable ID for the file to delete
   */
  const handleDelete = (fileId) => {
    const currentIndex = files.findIndex((f) => getFileId(f) === fileId);
    const updatedFiles = files.filter((f) => getFileId(f) !== fileId);
    setFiles(updatedFiles);

    // Update FileUploaderButton's internal state
    if (buttonRef.current) {
      buttonRef.current.setFiles(updatedFiles);
    }

    // Focus management: focus the next item's delete button, previous if last, or button if none left
    setTimeout(() => {
      if (updatedFiles.length > 0) {
        const nextIndex = Math.min(currentIndex, updatedFiles.length - 1);
        const nextFileId = getFileId(updatedFiles[nextIndex]);
        const nextItemRef = itemRefs.current.get(nextFileId);
        nextItemRef?.focusDeleteButton();
      } else {
        // No files left, focus the FileUploaderButton
        buttonRef.current?.focus();
      }
    }, 0);
  };

  /**
   * Handle file name edit
   * @param {number} fileId - Stable ID for the file to edit
   * @param {string} newName - New file name
   */
  const handleEdit = (fileId, newName) => {
    const updatedFiles = files.map((f) => {
      if (getFileId(f) === fileId) {
        // Create a new File object with the updated name
        const newFile = new File([f], newName, { type: f.type });
        // Transfer the stable ID to the new file object
        fileIds.current.set(newFile, fileId);
        return newFile;
      }
      return f;
    });
    setFiles(updatedFiles);
    console.log('onEdit', { fileId, newName, updatedFiles });
    action('onEdit')({ fileId, newName, updatedFiles });

    // Update FileUploaderButton's internal state
    if (buttonRef.current) {
      buttonRef.current.setFiles(updatedFiles);
    }
  };

  /**
   * Handle form submit event
   * @param {Event} event - Form submit event
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const submittedFiles = formData.getAll('files').filter((f) => f.size > 0);
    console.log('onSubmit', submittedFiles);
    action('onSubmit')(submittedFiles);
  };

  // Check if any file exceeds the max file size
  const hasInvalidFiles = files.some((file) => file.size >= args.maxFileSize);

  return (
    <Form onSubmit={handleSubmit} style={{ padding: '1rem' }}>
      <FileUploaderButton ref={buttonRef} {...args} onChange={handleChange} />

      {files.length > 0 && (
        <div
          style={{
            marginTop: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}>
          {files.map((file) => {
            const fileId = getFileId(file);
            return (
              <FileUploaderItem
                key={fileId}
                ref={(el) => {
                  if (el) {
                    itemRefs.current.set(fileId, el);
                  } else {
                    itemRefs.current.delete(fileId);
                  }
                }}
                name={file.name}
                status={file.size < args.maxFileSize ? 'edit' : 'invalid'}
                errorSubject={args.errorSubject}
                errorBody={args.errorBody}
                size={args.size}
                onDelete={() => handleDelete(fileId)}
                onEdit={(newName) => handleEdit(fileId, newName)}
              />
            );
          })}
        </div>
      )}

      <Button
        type="submit"
        kind="primary"
        size="md"
        disabled={hasInvalidFiles}
        style={{ position: 'fixed', bottom: '1rem', right: '1rem' }}>
        {hasInvalidFiles ? 'Please fix errors' : 'Submit'}
      </Button>
    </Form>
  );
};

export const Example2 = {
  render: Template,
};
