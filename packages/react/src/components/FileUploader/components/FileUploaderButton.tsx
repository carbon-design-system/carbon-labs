/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {
  useRef,
  ChangeEvent,
  forwardRef,
  useImperativeHandle,
  useState,
  useId,
} from 'react';
import { Button, ButtonProps } from '@carbon/react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';

export interface FileUploaderButtonProps extends Omit<
  ButtonProps<any>,
  'onClick'
> {
  /** Label text for the file input */
  labelText?: string;
  /** Button text */
  buttonText?: string;
  /** Button kind */
  kind?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
  /** Button size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Button renders as icon only variant */
  hasIconOnly?: boolean;
  /** Button renderIcon to render any carbon icon */
  renderIcon?: React.ComponentType<any>;
  /** Input accept attribute */
  accept?: string;
  /** Input multiple attribute */
  multiple?: boolean;
  /** Input and Button shared disabled prop */
  disabled?: boolean;
  /** Input callback onChange called when files are changed */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  /** Input name attribute - for form participation */
  name?: string;
  /** Helper text */
  helperText?: string;
}

export interface FileUploaderButtonHandle {
  /** Get the current FileList from the underlying input */
  getFiles: () => FileList | null;
  /** Set the new FileList to the underlying input */
  setFiles: (files: FileList | File[]) => void;
  /** Focus the button */
  focus: () => void;
}

/**
 * Convert FileList or File array to DataTransfer
 */
const createDataTransfer = (files: FileList | File[]): DataTransfer => {
  const dataTransfer = new DataTransfer();
  const fileArray = files instanceof FileList ? Array.from(files) : files;
  fileArray.forEach((file) => dataTransfer.items.add(file));
  return dataTransfer;
};

export const FileUploaderButton = forwardRef<
  FileUploaderButtonHandle,
  FileUploaderButtonProps
>(
  (
    {
      labelText,
      buttonText = 'Add files',
      accept = [],
      multiple = false,
      disabled = false,
      onChange,
      kind = 'primary',
      size = 'md',
      name,
      hasIconOnly = false,
      renderIcon,
      helperText,
      ...rest
    },
    ref
  ) => {
    const prefix = usePrefix();
    const inputRef = useRef<HTMLInputElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [fileCount, setFileCount] = useState(0);
    const [firstFileName, setFirstFileName] = useState<string>();
    const inputId = useId();

    // Compute selection text
    const selectionText =
      fileCount === 0
        ? ''
        : fileCount === 1 && firstFileName
          ? ` ${firstFileName} selected`
          : ` ${fileCount} selected`;

    // Compute button display text
    const displayText = `${buttonText}${fileCount > 0 ? ` (${fileCount})` : ''}`;
    const ariaLabel = `${buttonText}${selectionText}`;

    // Compute badge count for icon-only ghost buttons
    const badgeCount =
      kind === 'ghost' && size === 'lg' && hasIconOnly && fileCount > 0
        ? fileCount
        : undefined;

    useImperativeHandle(
      ref,
      () => ({
        getFiles: () => inputRef.current?.files || null,
        setFiles: (files: FileList | File[]) => {
          if (!inputRef.current) {
            return;
          }

          const dataTransfer = createDataTransfer(files);
          inputRef.current.files = dataTransfer.files;
          setFileCount(dataTransfer.files.length);
          setFirstFileName(dataTransfer.files[0]?.name);

          inputRef.current.dispatchEvent(
            new Event('change', { bubbles: true })
          );
        },
        focus: () => {
          buttonRef.current?.focus();
        },
      }),
      []
    );

    const handleButtonClick = () => {
      inputRef.current?.click();
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      setFileCount(files?.length || 0);
      setFirstFileName(files?.[0]?.name);
      onChange?.(event);
    };

    return (
      <div className={`${prefix}--file-uploader-button`}>
        {labelText && (
          <label
            className={`${prefix}--file-uploader-button__label`}
            htmlFor={inputId}>
            <span className={`${prefix}--file-uploader-button__label-text`}>
              {labelText}
            </span>
          </label>
        )}
        <div className={`${prefix}--file-uploader-button__wrapper`}>
          <Button
            ref={buttonRef}
            kind={kind}
            size={size}
            disabled={disabled}
            // @ts-ignore - badgeCount prop exists but not in current Button type definition
            badgeCount={badgeCount}
            autoAlign
            renderIcon={renderIcon}
            hasIconOnly={hasIconOnly}
            iconDescription={ariaLabel}
            onClick={handleButtonClick}
            aria-label={ariaLabel}
            {...rest}>
            {displayText}
          </Button>
          <input
            id={inputId}
            ref={inputRef}
            className={`${prefix}--file-uploader-button__input`}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            aria-label={!labelText ? buttonText : undefined}
            name={name}
            tabIndex={-1}
            onChange={handleInputChange}
          />
        </div>
        {helperText !== '' && (helperText || selectionText) && (
          <div className={`${prefix}--file-uploader-button__helper-text`}>
            {helperText || selectionText}
          </div>
        )}
      </div>
    );
  }
);

FileUploaderButton.displayName = 'FileUploaderButton';
