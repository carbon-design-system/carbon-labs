/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@carbon/react';
import { Jpg, Pdf, Png, TrashCan } from '@carbon/icons-react';
import './custom-story-components.scss';

/**
 * Get file extension icon component
 * @param {string} fileName - The file name to extract extension from
 * @returns {React.ComponentType|null} The icon component or null
 */
export const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return Pdf;
    case 'jpg':
    case 'jpeg':
      return Jpg;
    case 'png':
      return Png;
    default:
      return null;
  }
};

/**
 * Custom file item component with icon and delete button
 * @param {object} props - Component props
 * @param {File} props.file - The file object to render
 * @param {(key: string) => void} props.onDelete - Callback to delete a file by its key
 * @param {React.Ref} props.deleteButtonRef - Ref for the delete button
 * @returns {React.ReactElement} The rendered file item component
 */
export const CustomFileItem = ({ file, onDelete, deleteButtonRef }) => {
  const fileKey = `${file.name}-${file.size}`;
  const FileIcon = getFileIcon(file.name);

  return (
    <div className="custom-file-item">
      {FileIcon && <FileIcon size={24} className="custom-file-item__icon" />}
      <span className="custom-file-item__name" title={file.name}>
        {file.name}
      </span>
      <Button
        ref={deleteButtonRef}
        kind="danger--ghost"
        size="sm"
        hasIconOnly
        autoAlign
        iconDescription={`Remove ${file.name}`}
        renderIcon={TrashCan}
        onClick={() => onDelete(fileKey)}
      />
    </div>
  );
};

CustomFileItem.propTypes = {
  /**
   * Ref for the delete button
   */
  deleteButtonRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  /**
   * The file object to render
   */
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
  }).isRequired,
  /**
   * Callback to delete a file by its key
   */
  onDelete: PropTypes.func.isRequired,
};
