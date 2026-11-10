/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import { Button, type ButtonKind } from '@carbon-labs/react-button';
import { RollText } from '@carbon-labs/react-roll-text';
import type { NodeRef } from '@carbon-labs/react-util';
import './file-uploader.scss';

/* ============================================================================
 * FileUploaderButton — Carbon v11's FileUploaderButton: the kit's Button
 * opening a hidden file input
 * ============================================================================
 *
 * v11's API: `accept`, `buttonKind`, `disabled`, `disableLabelChanges`,
 * `id` (the input's), `labelText`, `multiple`, `name`, `onChange` (the
 * input's change event), `onClick`, `size` ('sm' | 'small' | 'md' |
 * 'field' | 'lg'), `innerRef` (the visually hidden label); `role` and the
 * deprecated `tabIndex` pass to the button. Enter and Space open the
 * picker; each open clears the input, so choosing the same file again
 * reports it again.
 *
 * It is the kit's Button (its rollover, pill and focus ring). Its
 * label changes to the chosen file's name or "N files" (unless
 * `disableLabelChanges`) through the kit's RollText, so only the parts that
 * change roll. The button also takes a ref (for focus).
 * ========================================================================== */

export type FileUploaderButtonSize = 'sm' | 'small' | 'md' | 'field' | 'lg';

export interface FileUploaderButtonProps extends Omit<
  HTMLAttributes<HTMLButtonElement>,
  'onChange' | 'tabIndex'
> {
  /** Specify the types of files that this input should be able to receive. */
  accept?: string[];
  /** Specify the type of underlying button. Default 'primary'. */
  buttonKind?: ButtonKind;
  className?: string;
  /** Don't change the label to the chosen file's name. */
  disableLabelChanges?: boolean;
  /** Specify whether file input is disabled. */
  disabled?: boolean;
  /** A unique id for the underlying `<input>`. */
  id?: string;
  /** The button's label. Default "Add file". */
  labelText?: ReactNode;
  /** Accept more than one file. */
  multiple?: boolean;
  /** A name for the underlying `<input>`. */
  name?: string;
  /** Called each time the `<input>`'s value changes. */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  /** Called each time the button is clicked. */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  role?: string;
  /** Default 'md'. */
  size?: FileUploaderButtonSize;
  /** @deprecated v11: it renders a button. */
  tabIndex?: number | string;
  /** v11: a ref to the visually hidden label. */
  innerRef?: NodeRef<HTMLLabelElement>;
}

/** v11's sizes onto the kit Button's. */
export function buttonSizeOf(
  size: FileUploaderButtonSize | undefined
): 'sm' | 'md' | 'lg' {
  if (size === 'sm' || size === 'small') return 'sm';
  if (size === 'lg') return 'lg';
  return 'md';
}

const noop = () => {};

export const FileUploaderButton = forwardRef<
  HTMLButtonElement,
  FileUploaderButtonProps
>(function FileUploaderButton(
  {
    accept,
    buttonKind = 'primary',
    className,
    disabled = false,
    disableLabelChanges = false,
    id,
    labelText: ownerLabelText = 'Add file',
    multiple = false,
    onChange = noop,
    onClick,
    name,
    size = 'md',
    innerRef,
    tabIndex,
    ...other
  },
  ref
) {
  const { timeScale } = useFeedbackMotion();
  const [labelText, setLabelText] = useState<ReactNode>(ownerLabelText);
  const [order, setOrder] = useState(0);
  const generatedId = useId();
  const inputId = id || generatedId;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLabelText(ownerLabelText);
  }, [ownerLabelText]);

  const open = () => {
    const input = inputRef.current;
    if (!input) return;
    input.value = '';
    input.click();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const length = files?.length ?? 0;
    if (files && !disableLabelChanges) {
      if (length > 1) setLabelText(`${length} files`);
      else if (length === 1) setLabelText(files[0]!.name);
      setOrder((o) => o + 1);
    }
    onChange(event);
  };

  const label =
    typeof labelText === 'string' ? (
      <RollText text={labelText} order={order} timeScale={timeScale} />
    ) : (
      labelText
    );

  return (
    <>
      <Button
        {...other}
        ref={ref as never}
        type="button"
        kind={buttonKind}
        size={buttonSizeOf(size)}
        disabled={disabled}
        className={['cds-file__button', className].filter(Boolean).join(' ')}
        tabIndex={tabIndex !== undefined ? Number(tabIndex) : undefined}
        onClick={(e: MouseEvent<HTMLButtonElement>) => {
          onClick?.(e);
          open();
        }}
        onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
          other.onKeyDown?.(e);
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open();
          }
        }}>
        {label}
      </Button>
      <label
        className="cds-file__visually-hidden"
        ref={innerRef}
        htmlFor={inputId}>
        <span>{labelText}</span>
      </label>
      <input
        className="cds-file__visually-hidden"
        ref={inputRef}
        id={inputId}
        disabled={disabled}
        type="file"
        tabIndex={-1}
        multiple={multiple}
        accept={accept?.toString()}
        name={name}
        onChange={handleChange}
      />
    </>
  );
});
FileUploaderButton.displayName = 'FileUploaderButton';
