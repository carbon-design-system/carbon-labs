/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';
import { IconButton, TextInput } from '@carbon/react';
import { Close, WarningFilled, Edit, Save } from '@carbon/react/icons';
import classNames from 'classnames';

export type FileUploaderItemStatus = 'edit' | 'invalid';

export interface FileUploaderItemProps {
  /** File name */
  name: string;
  /** Upload status */
  status?: FileUploaderItemStatus;
  /** Error subject/title */
  errorSubject?: string;
  /** Error body/description */
  errorBody?: string;
  /** Callback when remove button is clicked */
  onDelete?: () => void;
  /** Callback when file name is edited */
  onEdit?: (newName: string) => void;
  /** Custom class name */
  className?: string;
  /** Unique identifier */
  uuid?: string;
  /** Size of the item */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export interface FileUploaderItemHandle {
  focusDeleteButton: () => void;
}

/**
 * Splits a file name into name and extension parts
 */
const getFileNameParts = (fullName: string) => {
  const lastDotIndex = fullName.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return { nameWithoutExt: fullName, extension: '' };
  }
  return {
    nameWithoutExt: fullName.substring(0, lastDotIndex),
    extension: fullName.substring(lastDotIndex),
  };
};

/**
 * FileUploaderItem component displays a file with edit and delete capabilities
 */
export const FileUploaderItem = forwardRef<
  FileUploaderItemHandle,
  FileUploaderItemProps
>(
  (
    {
      name,
      status = 'edit',
      errorSubject,
      errorBody,
      onDelete,
      onEdit,
      className,
      uuid,
      size = 'md',
    },
    ref
  ) => {
    const prefix = usePrefix();
    const { nameWithoutExt, extension } = getFileNameParts(name);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(nameWithoutExt);
    const deleteButtonRef = useRef<HTMLButtonElement>(null);
    const editButtonRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const isInvalid = status === 'invalid';

    useImperativeHandle(ref, () => ({
      focusDeleteButton: () => {
        deleteButtonRef.current?.focus();
      },
    }));

    const startEditing = () => {
      setEditValue(nameWithoutExt);
      setIsEditing(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    };

    const cancelEditing = () => {
      setEditValue(nameWithoutExt);
      setIsEditing(false);
    };

    const saveEdit = () => {
      const trimmedName = editValue.trim();
      if (onEdit && trimmedName) {
        onEdit(trimmedName + extension);
      }
      setIsEditing(false);
      setTimeout(() => {
        editButtonRef.current?.focus();
      }, 0);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditValue(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        saveEdit();
      } else if (e.key === 'Escape') {
        cancelEditing();
      }
    };

    const itemClasses = classNames(
      `${prefix}--file-uploader-item`,
      {
        [`${prefix}--file-uploader-item--invalid`]: isInvalid,
        [`${prefix}--file-uploader-item--editing`]: isEditing,
      },
      className
    );

    const hasError = isInvalid && (errorSubject || errorBody);

    return (
      <div className={itemClasses} data-uuid={uuid}>
        <div className={`${prefix}--file-uploader-item__details`}>
          {isEditing ? (
            <TextInput
              ref={inputRef}
              id={`file-name-input-${uuid}`}
              labelText=""
              hideLabel
              value={editValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className={`${prefix}--file-uploader-item__name-input`}
              size={size as 'xs' | 'sm' | 'md' | 'lg'}
            />
          ) : (
            <p className={`${prefix}--file-uploader-item__name`}>{name}</p>
          )}

          {isInvalid && (
            <WarningFilled
              className={`${prefix}--file-uploader-item__icon ${prefix}--file-uploader-item__icon--invalid`}
            />
          )}

          {onEdit && !isInvalid && (
            <IconButton
              ref={editButtonRef}
              kind="ghost"
              size={size as 'xs' | 'sm' | 'md' | 'lg'}
              label={isEditing ? 'Save' : 'Edit'}
              autoAlign
              align="bottom-end"
              onClick={isEditing ? saveEdit : startEditing}
              className={`${prefix}--file-uploader-item__edit`}>
              {isEditing ? <Save /> : <Edit />}
            </IconButton>
          )}

          {onDelete && (
            <IconButton
              ref={deleteButtonRef}
              kind="ghost"
              size={size as 'xs' | 'sm' | 'md' | 'lg'}
              label={`Remove ${name}`}
              autoAlign
              align="bottom-end"
              onClick={onDelete}
              className={`${prefix}--file-uploader-item__delete`}>
              <Close />
            </IconButton>
          )}
        </div>

        {hasError && (
          <div className={`${prefix}--file-uploader-item__error`}>
            {errorSubject && (
              <p className={`${prefix}--file-uploader-item__error-subject`}>
                {errorSubject}
              </p>
            )}
            {errorBody && (
              <p className={`${prefix}--file-uploader-item__error-body`}>
                {errorBody}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

FileUploaderItem.displayName = 'FileUploaderItem';
