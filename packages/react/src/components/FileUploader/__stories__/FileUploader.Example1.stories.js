/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState } from 'react';
import { Tile } from '@carbon/react';
import { Upload } from '@carbon/icons-react';
import { action } from 'storybook/actions';
import { FileUploaderButton } from '../components/FileUploaderButton';
import { CustomFileItem } from './customStoryComponents';
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
          maxWidth: `600px`,
          width: '100%',
          padding: '2rem',
        }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Size of buttons and items',
    },
    kind: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'ghost', 'danger'],
      description: 'Button kind for the upload button',
    },
    multiple: {
      control: 'boolean',
      description: 'Allow multiple file selection',
    },
  },

  args: {
    size: 'md',
    kind: 'tertiary',
    multiple: true,
  },
};

/**
 * Custom file renderer - Demonstrates rendering file items in a custom layout
 * using FileUploaderButton and CustomFileItem
 * @param {object} args - Story arguments
 * @returns {React.ReactElement} The rendered component
 */
export const Example1 = (args) => {
  const { storyMaxWidth: _storyMaxWidth, ...buttonProps } = args;
  const [files, setFiles] = useState([]);
  const buttonRef = useRef(null);
  const deleteButtonRefs = useRef({});

  /**
   * Handle file changes from FileUploaderButton
   * @param {React.ChangeEvent<HTMLInputElement>} event - The change event
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
   * @param {string} fileKey - Unique key for the file to delete
   */
  const handleDelete = (fileKey) => {
    const fileIndex = files.findIndex((f) => {
      const key = `${f.name}-${f.size}`;
      return key === fileKey;
    });

    const updatedFiles = files.filter((f) => {
      const key = `${f.name}-${f.size}`;
      return key !== fileKey;
    });
    setFiles(updatedFiles);

    // Update FileUploaderButton's internal state
    if (buttonRef.current) {
      buttonRef.current.setFiles(updatedFiles);
    }

    // Focus management after deletion
    setTimeout(() => {
      if (updatedFiles.length > 0) {
        // Focus the next item's delete button, or the previous one if we deleted the last item
        const nextIndex = Math.min(fileIndex, updatedFiles.length - 1);
        const nextFile = updatedFiles[nextIndex];
        const nextKey = `${nextFile.name}-${nextFile.size}`;
        deleteButtonRefs.current[nextKey]?.focus();
      } else {
        // If no files left, focus the upload button
        buttonRef.current?.focus();
      }
    }, 0);
  };

  return (
    <Tile
      style={{
        minHeight: '280px',
        display: 'flex',
        flexDirection: 'column',
      }}>
      <div style={{ flex: 1 }}>
        <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>
          Custom File View Example
        </h3>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--cds-text-secondary)',
          }}>
          This example demonstrates using FileUploaderButton directly and
          rendering file items in a custom layout. The file items are displayed
          in a horizontal scrollable layout with custom styling and icons.
        </p>
      </div>

      {files.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            overflowX: 'auto',
            padding: '0.5rem 0',
          }}>
          {files.map((file) => {
            const fileKey = `${file.name}-${file.size}`;
            return (
              <CustomFileItem
                key={fileKey}
                file={file}
                onDelete={handleDelete}
                deleteButtonRef={(el) => {
                  if (el) {
                    deleteButtonRefs.current[fileKey] = el;
                  } else {
                    delete deleteButtonRefs.current[fileKey];
                  }
                }}
              />
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
        <FileUploaderButton
          ref={buttonRef}
          {...buttonProps}
          accept=".jpg,.jpeg,.png,.pdf"
          name="files"
          helperText=""
          onChange={handleChange}
          hasIconOnly
          renderIcon={Upload}
          iconDescription="Upload files"
          buttonText="Add files"
        />
      </div>
    </Tile>
  );
};
