/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import { Button, ButtonKinds } from '@carbon-labs/react-button';
import {
  FileUploader,
  FileUploaderButton,
  FileUploaderDropContainer,
  FileUploaderItem,
  FileUploaderSkeleton,
} from '../index';
import type {
  AddedFile,
  FileUploaderItemSize,
  FileUploaderItemStatus,
  FileUploaderProps,
} from '../index';
import mdx from './FileUploader.mdx';

const STATUSES: FileUploaderItemStatus[] = ['uploading', 'complete', 'edit'];
const SIZES: FileUploaderItemSize[] = ['sm', 'md', 'lg'];

export default {
  title: 'V12/FileUploader',
  component: FileUploader,
  subcomponents: {
    FileUploaderButton,
    FileUploaderDropContainer,
    FileUploaderItem,
    FileUploaderSkeleton,
  },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'disclosure',
        'error-disclosure',
        'arrival-stagger',
        'layout-transaction',
        'status-hand-off',
        'content-swap',
        'status-mark-beat',
        'rollover',
        'drag-over',
        'leaving',
        'label-roll',
      ],
      reduced: {
        disclosure: 'at-once',
        'error-disclosure': 'at-once',
        'arrival-stagger': 'at-once',
        'status-hand-off': 'at-once',
        'content-swap': 'at-once',
        'status-mark-beat': 'at-once',
        'drag-over': 'at-once',
        leaving: 'at-once',
        'label-roll': 'at-once',
      },
      states: STATUSES,
    },
  },
  argTypes: {
    filenameStatus: { control: 'inline-radio', options: STATUSES },
    size: { control: 'inline-radio', options: SIZES },
    buttonKind: { control: 'inline-radio', options: ButtonKinds },
    accept: { control: false },
  },
};

const column = { display: 'grid', gap: 16, maxInlineSize: 400 };

const row = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

/** Add files with the button: each opens its place in the list. `filenameStatus` sets every file's status. */
export const Default = {
  args: {
    labelTitle: 'Upload files',
    labelDescription: 'Max file size is 500 KB. Only .jpg and .png files.',
    buttonLabel: 'Add file',
    buttonKind: 'primary',
    size: 'md',
    filenameStatus: 'edit',
    iconDescription: 'Delete file',
    accept: ['.jpg', '.png'],
    maxFileSize: 500 * 1024,
    multiple: true,
    disabled: false,
  },
  render: (args: FileUploaderProps) => (
    <div style={column}>
      <FileUploader {...args} />
    </div>
  ),
};

interface Upload {
  uuid: string;
  name: string;
  status: FileUploaderItemStatus;
  /** Percent per tick; 0 for an unknown size (the Spinner). */
  rate: number;
  progress?: number;
  /** It fails once its progress reaches this. */
  failAt?: number;
  invalid?: boolean;
  errorSubject?: string;
  errorBody?: string;
  /** Ticks spent in the current step. */
  ticks: number;
}

/** Ticks a completed file holds its check before it can be removed. */
const HOLD = 6;
/** Ticks a file of unknown size takes. */
const UNKNOWN = 14;

/** One tick of every upload: progress moves on, then complete, then edit. */
function advance(list: Upload[]): Upload[] {
  if (!list.some((u) => u.status !== 'edit')) {
    return list;
  }
  return list.map((u) => {
    const ticks = u.ticks + 1;
    if (u.status === 'complete') {
      return ticks >= HOLD
        ? { ...u, status: 'edit', ticks: 0 }
        : { ...u, ticks };
    }
    if (u.status !== 'uploading') {
      return u;
    }
    if (!u.rate) {
      return ticks >= UNKNOWN
        ? { ...u, status: 'complete', ticks: 0 }
        : { ...u, ticks };
    }
    const progress = Math.min(100, (u.progress ?? 0) + u.rate);
    if (u.failAt != null && progress >= u.failAt) {
      return {
        ...u,
        progress: u.failAt,
        status: 'edit',
        invalid: true,
        errorSubject: 'Upload failed',
        errorBody: 'The connection was lost. Remove the file and try again.',
        ticks: 0,
      };
    }
    return progress >= 100
      ? { ...u, progress: 100, status: 'complete', ticks: 0 }
      : { ...u, progress, ticks };
  });
}

let nextUpload = 0;

function upload(
  name: string,
  opts: Partial<Pick<Upload, 'rate' | 'failAt'>> = {}
): Upload {
  return {
    uuid: `story-upload-${++nextUpload}`,
    name,
    status: 'uploading',
    rate: opts.rate ?? 9,
    progress: opts.rate === 0 ? undefined : 0,
    failAt: opts.failAt,
    ticks: 0,
  };
}

/** A file the drop zone flagged: listed at once with its error. */
function rejected(name: string, size: number): Upload {
  return {
    uuid: `story-upload-${++nextUpload}`,
    name,
    status: 'edit',
    rate: 0,
    invalid: true,
    errorSubject:
      size > 500 * 1024 ? 'File size exceeds limit' : 'Invalid file type',
    errorBody:
      size > 500 * 1024
        ? '500 KB max file size. Select a new file and try again.'
        : 'Only .jpg and .png files. Select a new file and try again.',
    ticks: 0,
  };
}

/**
 * The app keeps the list and renders an item per file. Uploads are
 * simulated: the ring fills, completes and hands off to its check, then the
 * remove button swaps in. Add several at once to see them open on a
 * stagger; Remove all closes them in order. A failed upload opens its
 * error under the name. Drag a file over the drop zone to see its ring.
 */
export const Uploads = {
  render: function UploadsStory() {
    const [uploads, setUploads] = useState<Upload[]>([]);
    useEffect(() => {
      const id = window.setInterval(() => setUploads(advance), 250);
      return () => window.clearInterval(id);
    }, []);
    const add = (...files: Upload[]) =>
      setUploads((list) => [...list, ...files]);
    const onAddFiles = (
      _: unknown,
      { addedFiles }: { addedFiles: AddedFile[] }
    ) =>
      add(
        ...addedFiles.map((f) =>
          f.invalidFileType ? rejected(f.name, f.size) : upload(f.name)
        )
      );
    return (
      <div style={column}>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => add(upload('site-photo.jpg'))}>
            Add a file
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() =>
              add(
                upload('floor-plan.png', { rate: 12 }),
                upload('cover-image.png', { rate: 7 }),
                upload('banner-wide.jpg', { rate: 5 })
              )
            }>
            Add three
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => add(upload('scan-0042.png', { rate: 0 }))}>
            Add one of unknown size
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => add(upload('large-render.png', { failAt: 60 }))}>
            Add one that fails
          </Button>
          <Button size="sm" variant="outlined" onClick={() => setUploads([])}>
            Remove all
          </Button>
        </div>
        <FileUploaderDropContainer
          labelText="Drag and drop files here or click to upload"
          accept={['image/jpeg', 'image/png']}
          maxFileSize={500 * 1024}
          multiple
          onAddFiles={onAddFiles}
        />
        <div className="cds-file__container">
          {uploads.map((u) => (
            <FileUploaderItem
              key={u.uuid}
              uuid={u.uuid}
              name={u.name}
              status={u.status}
              progress={u.progress}
              invalid={u.invalid}
              errorSubject={u.errorSubject}
              errorBody={u.errorBody}
              iconDescription={
                u.status === 'edit' ? 'Delete file' : 'Uploading file'
              }
              onDelete={(_, { uuid }) =>
                setUploads((list) => list.filter((x) => x.uuid !== uuid))
              }
            />
          ))}
        </div>
      </div>
    );
  },
};

type ItemState = 'spinner' | 'progress' | 'complete' | 'edit' | 'invalid';

/** One item, changed in place: the ring travels, hands off to its check, and swaps out for the remove button; Invalid opens the error. */
export const Item = {
  render: function ItemStory() {
    const [state, setState] = useState<ItemState>('progress');
    const [progress, setProgress] = useState(30);
    const status: FileUploaderItemStatus =
      state === 'complete'
        ? 'complete'
        : state === 'edit' || state === 'invalid'
          ? 'edit'
          : 'uploading';
    return (
      <div style={column}>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setState('spinner')}>
            Unknown size
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => {
              setState('progress');
              setProgress((p) => (p >= 90 ? 10 : p + 30));
            }}>
            Add progress
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => {
              setProgress(100);
              setState('complete');
            }}>
            Complete
          </Button>
          <Button size="sm" variant="outlined" onClick={() => setState('edit')}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setState('invalid')}>
            Invalid
          </Button>
        </div>
        <div className="cds-file__container">
          <FileUploaderItem
            arrive={false}
            name="project-brief.png"
            status={status}
            progress={state === 'spinner' ? undefined : progress}
            invalid={state === 'invalid'}
            errorSubject="File size exceeds limit"
            errorBody="500 KB max file size. Select a new file and try again."
            iconDescription={
              status === 'edit' ? 'Delete file' : 'Uploading file'
            }
          />
        </div>
      </div>
    );
  },
};

/** Every status at each size, there from the start (`arrive={false}`). A long name ends in an ellipsis and shows in a tooltip. */
export const Statuses = {
  render: () => (
    <div style={{ display: 'grid', gap: 32, maxInlineSize: 400 }}>
      {SIZES.map((size) => (
        <div key={size} className="cds-file__container">
          <FileUploaderItem
            arrive={false}
            size={size}
            name={`uploading-${size}.png`}
            status="uploading"
            progress={60}
          />
          <FileUploaderItem
            arrive={false}
            size={size}
            name={`unknown-size-${size}.png`}
            status="uploading"
          />
          <FileUploaderItem
            arrive={false}
            size={size}
            name={`complete-${size}.png`}
            status="complete"
            progress={100}
          />
          <FileUploaderItem
            arrive={false}
            size={size}
            name={`a-very-long-file-name-that-does-not-fit-in-its-row-${size}.png`}
            status="edit"
            iconDescription="Delete file"
          />
          <FileUploaderItem
            arrive={false}
            size={size}
            name={`invalid-${size}.png`}
            status="edit"
            invalid
            errorSubject="File size exceeds limit"
            errorBody="500 KB max file size. Select a new file and try again."
            iconDescription="Delete file"
          />
        </div>
      ))}
    </div>
  ),
};

/** The add button on its own. Choose files: its label rolls to the file's name, or "N files". */
export const AddButton = {
  name: 'FileUploaderButton',
  render: () => (
    <div style={row}>
      <FileUploaderButton labelText="Add files" multiple />
      <FileUploaderButton
        labelText="Add file"
        buttonKind="secondary"
        size="sm"
      />
      <FileUploaderButton labelText="Add file" disabled />
    </div>
  ),
};

/** The skeleton: the title, the description and the button as blocks, on the button's own box. */
export const Skeleton = {
  render: () => <FileUploaderSkeleton />,
};
