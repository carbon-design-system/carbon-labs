/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import { Select, SelectItem } from '@carbon-labs/react-select';
import { TextInput } from '@carbon-labs/react-text-input';
import {
  ComposedModal,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalSwap,
} from '../index';
import type {
  ModalBackdrop,
  ModalLoadingStatus,
  ModalProps,
  ModalSize,
} from '../index';
import mdx from './Modal.mdx';

const SIZES: ModalSize[] = ['xs', 'sm', 'md', 'lg'];

export default {
  title: 'V12/Modal',
  component: Modal,
  subcomponents: {
    ComposedModal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalSwap,
  },
  tags: ['alpha'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'overlay',
        'snap-arrival',
        'cursor-origin',
        'pull-back',
        'page-recede-and-blur',
        'content-swap',
        'cast-shadow',
      ],
      reduced: {
        overlay: 'shorter-clock',
        'snap-arrival': 'shorter-clock',
        'pull-back': 'shorter-clock',
        'page-recede-and-blur': 'at-once',
        'content-swap': 'at-once',
      },
      states: ['closed', 'open', 'loading'],
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    loadingStatus: {
      control: 'inline-radio',
      options: ['inactive', 'active', 'finished', 'error'],
    },
    backdrop: { control: 'object' },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    open: { control: false },
    children: { control: false },
    launcherButtonRef: { control: false },
    secondaryButtons: { control: false },
    selectorsFloatingMenus: { control: false },
    decorator: { control: false },
    slug: { control: false },
  },
};

/** Room for the launchers. The modal itself covers the viewport. */
const stage = {
  display: 'flex',
  gap: 16,
  flexWrap: 'wrap' as const,
  alignItems: 'flex-start',
  padding: 32,
  minBlockSize: 320,
};

const text = { margin: 0 };

/** Press the button to open the modal; it grows from the press. Escape, the close button or Cancel closes it. */
export const Default = {
  args: {
    modalLabel: 'Account',
    modalHeading: 'Rename this workspace',
    primaryButtonText: 'Rename',
    secondaryButtonText: 'Cancel',
    size: 'md',
    danger: false,
    passiveModal: false,
    shadow: false,
    timeScale: 1,
  },
  render: function DefaultStory(args: ModalProps) {
    const [open, setOpen] = useState(false);
    const launcher = useRef<HTMLElement>(null);
    return (
      <div style={stage}>
        <Button
          size="sm"
          variant="outlined"
          ref={launcher}
          onClick={() => setOpen(true)}>
          Open modal
        </Button>
        <Modal
          {...args}
          open={open}
          launcherButtonRef={launcher}
          onRequestClose={() => setOpen(false)}
          onRequestSubmit={() => setOpen(false)}>
          <p style={text}>
            The new name shows everywhere the workspace is listed. Links to it
            keep working.
          </p>
        </Modal>
      </div>
    );
  },
};

/** The four sizes. Each button opens the modal at its size. */
export const Sizes = {
  render: function SizesStory() {
    const [open, setOpen] = useState(false);
    const [size, setSize] = useState<ModalSize>('md');
    return (
      <div style={stage}>
        {SIZES.map((s) => (
          <Button
            size="sm"
            variant="outlined"
            key={s}
            onClick={() => {
              setSize(s);
              setOpen(true);
            }}>
            Open {s}
          </Button>
        ))}
        <Modal
          open={open}
          size={size}
          modalLabel={`Size ${size}`}
          modalHeading="Invite people"
          primaryButtonText="Send invites"
          secondaryButtonText="Cancel"
          onRequestClose={() => setOpen(false)}
          onRequestSubmit={() => setOpen(false)}>
          <p style={text}>
            People you invite get an email with a link to join. They can see
            every project in the workspace.
          </p>
        </Modal>
      </div>
    );
  },
};

/** No footer: an informational modal. The close button, Escape or a press outside closes it. */
export const Passive = {
  render: function PassiveStory() {
    const [open, setOpen] = useState(false);
    return (
      <div style={stage}>
        <Button size="sm" variant="outlined" onClick={() => setOpen(true)}>
          Open passive modal
        </Button>
        <Modal
          open={open}
          passiveModal
          size="sm"
          modalHeading="You are offline"
          onRequestClose={() => setOpen(false)}>
          <p style={text}>
            Changes are saved on this device and sync when you reconnect.
          </p>
        </Modal>
      </div>
    );
  },
};

/** A danger modal: the primary button is a danger button, and focus starts on Cancel. */
export const Danger = {
  render: function DangerStory() {
    const [open, setOpen] = useState(false);
    return (
      <div style={stage}>
        <Button size="sm" variant="outlined" onClick={() => setOpen(true)}>
          Delete files
        </Button>
        <Modal
          open={open}
          danger
          size="sm"
          modalLabel="Files"
          modalHeading="Delete 3 files?"
          primaryButtonText="Delete"
          secondaryButtonText="Cancel"
          dangerDescription="Deletes the files permanently"
          onRequestClose={() => setOpen(false)}
          onRequestSubmit={() => setOpen(false)}>
          <p style={text}>This cannot be undone.</p>
        </Modal>
      </div>
    );
  },
};

/** A form. Submit shows the primary button's loading status, then the modal closes. */
export const WithForm = {
  render: function WithFormStory() {
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<ModalLoadingStatus>('inactive');
    useEffect(() => {
      if (status !== 'active') {
        return;
      }
      const t = window.setTimeout(() => setStatus('finished'), 1200);
      return () => window.clearTimeout(t);
    }, [status]);
    return (
      <div style={stage}>
        <Button
          size="sm"
          variant="outlined"
          onClick={() => {
            setStatus('inactive');
            setOpen(true);
          }}>
          Add member
        </Button>
        <Modal
          open={open}
          modalLabel="Team"
          modalHeading="Add a member"
          primaryButtonText="Add"
          secondaryButtonText="Cancel"
          selectorPrimaryFocus="#modal-story-email"
          shouldSubmitOnEnter
          loadingStatus={status}
          loadingDescription={status === 'finished' ? 'Added' : 'Adding…'}
          onLoadingSuccess={() => setOpen(false)}
          onRequestClose={() => setOpen(false)}
          onRequestSubmit={() => setStatus('active')}>
          <div style={{ display: 'grid', gap: 16 }}>
            <TextInput
              id="modal-story-email"
              labelText="Email"
              type="email"
              defaultValue="ada@example.com"
            />
            <Select
              id="modal-story-role"
              labelText="Role"
              defaultValue="editor">
              <SelectItem value="viewer" text="Viewer" />
              <SelectItem value="editor" text="Editor" />
              <SelectItem value="admin" text="Admin" />
            </Select>
          </div>
        </Modal>
      </div>
    );
  },
};

const PARAGRAPHS = Array.from(
  { length: 12 },
  (_, i) =>
    `Section ${i + 1}. The service is provided as is. You keep the rights to what you upload, and you can export or delete it at any time. We keep backups for thirty days after you delete a project.`
);

/** A long body scrolls inside the modal. It is a focusable region, and a soft edge shows there is more. */
export const LongContent = {
  render: function LongContentStory() {
    const [open, setOpen] = useState(false);
    return (
      <div style={stage}>
        <Button size="sm" variant="outlined" onClick={() => setOpen(true)}>
          Read terms
        </Button>
        <Modal
          open={open}
          hasScrollingContent
          modalHeading="Terms of use"
          primaryButtonText="Accept"
          secondaryButtonText="Decline"
          onRequestClose={() => setOpen(false)}
          onRequestSubmit={() => setOpen(false)}>
          <div style={{ display: 'grid', gap: 16 }}>
            {PARAGRAPHS.map((p) => (
              <p key={p} style={text}>
                {p}
              </p>
            ))}
          </div>
        </Modal>
      </div>
    );
  },
};

const STEPS = [
  {
    title: 'Name the project',
    body: 'Pick a name people will recognize. You can change it later.',
  },
  {
    title: 'Choose a region',
    body: 'Data stays in the region you choose. Pick the one closest to your users.',
  },
  {
    title: 'Review',
    body: 'Everything is ready. Create the project to start adding members and data.',
  },
];

/** ComposedModal with its parts. Next swaps the body's content, out then in, and the modal re-centres. */
export const Composed = {
  render: function ComposedStory() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0);
    const last = step === STEPS.length - 1;
    return (
      <div style={stage}>
        <Button
          size="sm"
          variant="outlined"
          onClick={() => {
            setStep(0);
            setOpen(true);
          }}>
          Create project
        </Button>
        <ComposedModal open={open} size="sm" onClose={() => setOpen(false)}>
          <ModalHeader
            label={`Step ${step + 1} of ${STEPS.length}`}
            title="Create a project"
          />
          <ModalBody swapKey={step}>
            <h3 style={{ margin: '0 0 8px' }}>{STEPS[step].title}</h3>
            <p style={text}>{STEPS[step].body}</p>
          </ModalBody>
          <ModalFooter
            primaryButtonText={last ? 'Create' : 'Next'}
            secondaryButtonText="Cancel"
            onRequestSubmit={() =>
              last ? setOpen(false) : setStep((s) => s + 1)
            }
          />
        </ComposedModal>
      </div>
    );
  },
};

const BACKDROPS: { name: string; backdrop: ModalBackdrop | false }[] = [
  { name: 'Scale and blur', backdrop: { scale: true, blur: 'even' } },
  { name: 'Blur only', backdrop: { scale: false } },
  { name: 'Scale only', backdrop: { blur: false } },
  { name: 'Dim only', backdrop: false },
];

/** What happens to the page behind: by default it draws back and blurs; either can be left out. */
export const Backdrop = {
  render: function BackdropStory() {
    const [open, setOpen] = useState(false);
    const [choice, setChoice] = useState(0);
    return (
      <div style={stage}>
        {BACKDROPS.map((b, i) => (
          <Button
            size="sm"
            variant="outlined"
            key={b.name}
            onClick={() => {
              setChoice(i);
              setOpen(true);
            }}>
            {b.name}
          </Button>
        ))}
        <Modal
          open={open}
          passiveModal
          size="sm"
          backdrop={BACKDROPS[choice].backdrop}
          modalHeading={BACKDROPS[choice].name}
          onRequestClose={() => setOpen(false)}>
          <p style={text}>Look at the page behind the modal.</p>
        </Modal>
      </div>
    );
  },
};
