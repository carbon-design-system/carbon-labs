/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  forwardRef,
  useCallback,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type HTMLAttributes,
  type SyntheticEvent,
} from 'react';
import {
  FileUploaderButton,
  type FileUploaderButtonSize,
} from './FileUploaderButton';
import {
  FileUploaderItem,
  type FileUploaderItemSize,
  type FileUploaderItemStatus,
} from './FileUploaderItem';
import type { ButtonKind } from '@carbon-labs/react-button';
import './file-uploader.scss';

/* ============================================================================
 * FileUploader — Carbon v11's FileUploader: a title, a description, the
 * FileUploaderButton, and the files it has added
 * ============================================================================
 *
 * v11's API: `accept`, `buttonKind`, `buttonLabel`, `disabled`,
 * `filenameStatus` (every file's status), `iconDescription`,
 * `labelDescription`, `labelTitle`, `maxFileSize` (a larger file is passed
 * to `onAddFiles` flagged `invalidFileType` and not listed), `multiple`
 * (added to the list, a name already there skipped; otherwise the new file
 * replaces it), `name`, `onAddFiles`, `onChange` (the input's change), `onClick`
 * and `onDelete` (a file removed), `size`; the ref's `clearFiles()`.
 * Removing a file moves focus to the button (v11).
 *
 * In the kit, the files are FileUploaderItems, so they arrive on the
 * list's stagger, hand their status off in place, and close their place as
 * they go (FileUploaderItem, arrival.ts). Files are keyed by their own id,
 * so a removal closes that file's place, not the last one's.
 * ========================================================================== */

export interface FileUploaderProps extends HTMLAttributes<HTMLDivElement> {
  /** The types of files the input should receive. */
  accept?: string[];
  /** The `<FileUploaderButton>`'s kind. */
  buttonKind?: ButtonKind;
  /** The `<FileUploaderButton>`'s label. */
  buttonLabel?: string;
  className?: string;
  /** Specify whether file input is disabled. */
  disabled?: boolean;
  /** Every file's status. */
  filenameStatus: FileUploaderItemStatus;
  /** A description for the complete / close icon. */
  iconDescription?: string;
  /** The description text. */
  labelDescription?: string;
  /** The title text. */
  labelTitle?: string;
  /** Files larger than this (bytes) are marked invalid and not added. */
  maxFileSize?: number;
  /** Accept more than one file. */
  multiple?: boolean;
  /** A name for the underlying `<input>`. */
  name?: string;
  /** Called after files are added. */
  onAddFiles?: (
    event: SyntheticEvent<HTMLElement>,
    content: { addedFiles: Array<File & { invalidFileType?: boolean }> }
  ) => void;
  /** Called each time the input changes. */
  onChange?: (event: SyntheticEvent<HTMLElement>) => void;
  /** Called when a file is removed (after `onDelete`). */
  onClick?: (event: SyntheticEvent<HTMLElement>) => void;
  /** Called when a file is removed. */
  onDelete?: (event: SyntheticEvent<HTMLElement>) => void;
  /** The button's and the files' size. */
  size?: FileUploaderButtonSize;
}

export interface FileUploaderHandle {
  /** Clear the files. */
  clearFiles: () => void;
}

interface FileItem {
  uuid: string;
  name: string;
}

function itemSizeOf(
  size: FileUploaderButtonSize | undefined
): FileUploaderItemSize {
  if (size === 'sm' || size === 'small') return 'sm';
  if (size === 'md' || size === 'field') return 'md';
  return 'lg';
}

let nextFile = 0;

export const FileUploader = forwardRef<FileUploaderHandle, FileUploaderProps>(
  function FileUploader(
    {
      accept,
      buttonKind,
      buttonLabel,
      className,
      disabled = false,
      filenameStatus,
      iconDescription,
      labelDescription,
      labelTitle,
      maxFileSize,
      multiple = false,
      name,
      onAddFiles,
      onChange,
      onClick,
      onDelete,
      size,
      ...other
    },
    ref
  ) {
    const descriptionId = useId();
    const [files, setFiles] = useState<FileItem[]>([]);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleChange = useCallback(
      (evt: ChangeEvent<HTMLInputElement>) => {
        evt.stopPropagation();
        const incoming = Array.from(evt.target.files ?? []) as Array<
          File & { invalidFileType?: boolean }
        >;
        const chosen = multiple ? incoming : incoming.slice(0, 1);
        const validated = chosen.map((file) => {
          if (maxFileSize && file.size > maxFileSize)
            file.invalidFileType = true;
          return file;
        });
        onAddFiles?.(evt, { addedFiles: validated });
        const valid = validated.filter((f) => !f.invalidFileType);
        if (!valid.length) return;
        const fresh = valid.map((f) => ({
          uuid: `file-${++nextFile}`,
          name: f.name,
        }));
        setFiles((current) => {
          if (!multiple) return fresh;
          const names = new Set(current.map((f) => f.name));
          return [
            ...current,
            ...fresh.filter((f) => !names.has(f.name) && names.add(f.name)),
          ];
        });
        onChange?.(evt);
      },
      [maxFileSize, multiple, onAddFiles, onChange]
    );

    const remove = (evt: SyntheticEvent<HTMLElement>, uuid: string) => {
      if (filenameStatus !== 'edit') return;
      evt.stopPropagation();
      setFiles((current) => current.filter((f) => f.uuid !== uuid));
      onDelete?.(evt);
      onClick?.(evt);
      buttonRef.current?.focus();
    };

    useImperativeHandle(ref, () => ({ clearFiles: () => setFiles([]) }), []);

    const itemSize = itemSizeOf(size);
    return (
      <div
        {...other}
        className={['cds-file-uploader', className].filter(Boolean).join(' ')}>
        {labelTitle ? (
          <h3
            className={[
              'cds-file__label',
              disabled && 'cds-file__label--disabled',
            ]
              .filter(Boolean)
              .join(' ')}>
            {labelTitle}
          </h3>
        ) : null}
        <p
          id={descriptionId}
          className={[
            'cds-file__label-description',
            disabled && 'cds-file__label-description--disabled',
          ]
            .filter(Boolean)
            .join(' ')}>
          {labelDescription}
        </p>
        <FileUploaderButton
          ref={buttonRef}
          disabled={disabled}
          labelText={buttonLabel}
          multiple={multiple}
          buttonKind={buttonKind}
          onChange={handleChange}
          disableLabelChanges
          accept={accept}
          name={name}
          size={size}
          aria-describedby={descriptionId}
        />
        <div className="cds-file__container">
          {files.map((file) => (
            <FileUploaderItem
              key={file.uuid}
              uuid={file.uuid}
              name={file.name}
              status={filenameStatus}
              iconDescription={iconDescription}
              size={itemSize}
              disabled={disabled}
              onDelete={(evt) => remove(evt, file.uuid)}
            />
          ))}
        </div>
      </div>
    );
  }
);
FileUploader.displayName = 'FileUploader';
