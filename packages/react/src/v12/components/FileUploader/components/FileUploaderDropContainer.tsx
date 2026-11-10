/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type Ref,
  type SyntheticEvent,
} from 'react';
import { attachRollover } from '@carbon-labs/v12-motion';
import { useFeedbackMotion } from '@carbon-labs/v12-motion';
import { mergeRefs } from '@carbon-labs/react-tooltip';
import './file-uploader.scss';
import { useReducedGetter } from '@carbon-labs/react-util';

/* ============================================================================
 * FileUploaderDropContainer — Carbon v11's FileUploaderDropContainer: a
 * drop zone that is also a button opening the file picker
 * ============================================================================
 *
 * v11's API and validation: `accept` (MIME types or extensions), `pattern`
 * (the extension's regex), `maxFileSize`, `multiple`, `name`, `id` (the
 * input's), `labelText` (default "Add file"), `disabled`, `onAddFiles(evt,
 * { addedFiles })` with an invalid file flagged `invalidFileType` (a file
 * of no accepted type, or over `maxFileSize`), `onClick`, `innerRef` (the
 * button). Folders dropped are skipped; one file unless `multiple`; Enter
 * and Space open the picker.
 *
 * The kit adds:
 *
 *   rest      a dashed hairline (`--cds-surface-rule`) round a transparent
 *             zone, 8px corners, the label in the link color
 *   hover     the kit's rollover: the glow under the pointer, the press and
 *             the release
 *   drag-over a file held over it: the rollover's hover glow follows the
 *             dragged file (its position written from each dragover, as the
 *             pointer's would be), and a 2px blue ring fades in inside the
 *             edge — in on fast-02, out on fast-01, as a hover. Leaving to a
 *             child of the zone doesn't end it
 *   reduced   the ring and the glow are there or gone at once
 * ========================================================================== */

export interface AddedFile extends File {
  invalidFileType?: boolean;
}

export interface FileUploaderDropContainerProps extends Omit<
  HTMLAttributes<HTMLButtonElement>,
  'tabIndex' | 'onClick'
> {
  /** The types of files this input should receive (MIME types or extensions). */
  accept?: string[];
  className?: string;
  /** Specify whether file input is disabled. */
  disabled?: boolean;
  /** A unique id for the underlying `<input>`. */
  id?: string;
  /** The label, read by screen readers too. Default "Add file". */
  labelText?: string;
  /** Files larger than this (bytes) are marked invalid. */
  maxFileSize?: number;
  /** Accept more than one file. */
  multiple?: boolean;
  /** A name for the underlying `<input>`. */
  name?: string;
  /** Called after files are added (picked or dropped). */
  onAddFiles?: (
    event: SyntheticEvent<HTMLElement>,
    content: { addedFiles: AddedFile[] }
  ) => void;
  /** Called when the button is clicked. */
  onClick?: () => void;
  /** A regex pattern for the file's extension. Default `.[0-9a-z]+$`. */
  pattern?: string;
  /** A ref to the button. */
  innerRef?: Ref<HTMLButtonElement>;
  /** @deprecated v11: it renders a button. */
  role?: string;
  /** @deprecated v11: it renders a button. */
  tabIndex?: number | string;
}

const noop = () => {};

export function FileUploaderDropContainer({
  accept = [],
  className,
  id,
  disabled = false,
  labelText = 'Add file',
  maxFileSize,
  multiple = false,
  name,
  onAddFiles = noop,
  onClick,
  pattern = '.[0-9a-z]+$',
  innerRef,
  tabIndex,
  ...rest
}: FileUploaderDropContainerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const generatedId = useId();
  const uid = id || generatedId;
  const [active, setActive] = useState(false);
  const { reduced, timeScale } = useFeedbackMotion();
  const rolloverReduced = useReducedGetter(reduced);

  // The rollover: hover glow, flat press, release circle.
  useEffect(() => {
    const el = buttonRef.current;
    if (!el || disabled) return;
    const detach = attachRollover(el, {
      selector: '.cds-file__drop',
      timeScale,
      reduced: rolloverReduced,
    });
    return () => {
      detach();
      el.style.removeProperty('--cds-motion-rollover-hover-color');
      el.style.removeProperty('--cds-motion-rollover-press-color');
      el.style.removeProperty('--cds-motion-rollover-color');
      el.style.removeProperty('--cds-motion-rollover-label');
    };
  }, [disabled, timeScale, rolloverReduced]);

  /** v11's validation: over the size limit, or not an accepted type, is invalid; no extension at all is dropped. */
  function validateFiles(transferred: AddedFile[]): AddedFile[] {
    const acceptedTypes = new Set(accept);
    return transferred.reduce<AddedFile[]>((acc, curr) => {
      const { name: fileName, type: mimeType = '' } = curr;
      const [ext] = fileName.match(new RegExp(pattern, 'i')) ?? [];
      if (maxFileSize && curr.size > maxFileSize) {
        curr.invalidFileType = true;
        return acc.concat([curr]);
      }
      if (!accept.length) return acc.concat([curr]);
      if (ext === undefined) return acc;
      if (acceptedTypes.has(mimeType) || acceptedTypes.has(ext.toLowerCase()))
        return acc.concat([curr]);
      curr.invalidFileType = true;
      return acc.concat([curr]);
    }, []);
  }

  const getAddedFiles = (files: AddedFile[]) =>
    files.length ? validateFiles(multiple ? files : [files[0]!]) : [];

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onAddFiles(event, {
      addedFiles: getAddedFiles([...(event.target.files ?? [])]),
    });
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    const items = [...(event.dataTransfer.items ?? [])];
    const files: AddedFile[] = items.length
      ? items.reduce<AddedFile[]>((acc, item) => {
          if (item.kind !== 'file') return acc;
          if (item.webkitGetAsEntry?.()?.isDirectory) return acc;
          const file = item.getAsFile();
          if (file) acc.push(file);
          return acc;
        }, [])
      : [...event.dataTransfer.files];
    const addedFiles = getAddedFiles(files);
    if (inputRef.current) {
      try {
        const dt = new DataTransfer();
        addedFiles.forEach((f) => dt.items.add(f));
        inputRef.current.files = dt.files;
      } catch {
        /* DataTransfer isn't constructible everywhere */
      }
    }
    onAddFiles(event, { addedFiles });
  };

  /** The drag's position, written where the rollover's pointer would be, so the glow follows the file. */
  const follow = (event: DragEvent<HTMLDivElement>) => {
    const el = buttonRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty(
      '--cds-motion-rollover-x',
      `${event.clientX - r.left}px`
    );
    el.style.setProperty(
      '--cds-motion-rollover-y',
      `${event.clientY - r.top}px`
    );
  };

  return (
    <div
      className="cds-file"
      onDragOver={(evt) => {
        evt.stopPropagation();
        evt.preventDefault();
        if (disabled) return;
        setActive(true);
        follow(evt);
        evt.dataTransfer.dropEffect = 'copy';
      }}
      onDragLeave={(evt) => {
        evt.stopPropagation();
        evt.preventDefault();
        if (disabled) return;
        // Into a child of the zone: still over it.
        if (
          evt.relatedTarget instanceof Node &&
          evt.currentTarget.contains(evt.relatedTarget)
        )
          return;
        setActive(false);
        evt.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(evt) => {
        evt.stopPropagation();
        evt.preventDefault();
        if (disabled) return;
        setActive(false);
        handleDrop(evt);
      }}>
      <button
        type="button"
        {...rest}
        ref={mergeRefs(buttonRef, innerRef)}
        disabled={disabled}
        tabIndex={tabIndex !== undefined ? Number(tabIndex) : undefined}
        data-drag-over={active || undefined}
        data-reduced={reduced || undefined}
        className={[
          'cds-file__drop',
          active && 'cds-file__drop--drag-over',
          disabled && 'cds-file__drop--disabled',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        onKeyDown={(evt: KeyboardEvent<HTMLButtonElement>) => {
          rest.onKeyDown?.(evt);
          if (evt.key === 'Enter' || evt.key === ' ') {
            evt.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={(evt: MouseEvent<HTMLButtonElement>) => {
          void evt;
          onClick?.();
          if (!disabled) inputRef.current?.click();
        }}>
        {labelText}
      </button>
      <label htmlFor={uid} className="cds-file__visually-hidden">
        {labelText}
      </label>
      <input
        type="file"
        id={uid}
        className="cds-file__visually-hidden"
        ref={inputRef}
        tabIndex={-1}
        disabled={disabled}
        accept={accept.join(',')}
        name={name}
        multiple={multiple}
        onChange={handleChange}
        onClick={(evt) => {
          (evt.target as HTMLInputElement).value = '';
        }}
      />
    </div>
  );
}
