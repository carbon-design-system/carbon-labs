/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
} from 'react';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { Button } from '@carbon-labs/react-button';
import { Checkbox } from '@carbon-labs/react-checkbox';
import { TextInput } from '@carbon-labs/react-text-input';
import { SidePanel } from '@carbon-labs/react-side-panel';
import { useFormFieldState } from '@carbon-labs/react-util';
import {
  FormLayout,
  FormRow,
  FormSection,
  SavingStatus,
  UnsavedChangesBar,
  useDirtyForm,
} from '../index';
import type {
  FormLayoutProps,
  FormLayoutSize,
  SavingStatusStatus,
} from '../index';
import mdx from './FormLayout.mdx';

const SIZES: FormLayoutSize[] = ['narrow', 'medium', 'wide', 'full'];
const SAVING_STATES: SavingStatusStatus[] = [
  'default',
  'in-progress',
  'success',
  'fail',
];

export default {
  title: 'V12/FormLayout',
  component: FormLayout,
  subcomponents: { FormSection, FormRow, UnsavedChangesBar, SavingStatus },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: ['none', 'save', 'save-swap', 'saving-status'],
      reduced: {
        save: 'shorter-clock',
        'save-swap': 'at-once',
        'saving-status': 'at-once',
      },
      states: ['rest', 'disabled', 'readOnly'],
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    as: { control: 'inline-radio', options: ['form', 'div'] },
    children: { control: false },
  },
};

const stage = { display: 'grid', gap: 24, paddingBlockEnd: 32 };
const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  id: string;
  label: string;
  helperText?: string;
};

/** A plain field that reads its section's state, as the kit's fields do. */
function Field({
  id,
  label,
  helperText,
  disabled,
  readOnly,
  ...input
}: FieldProps) {
  const state = useFormFieldState(disabled, readOnly);
  return (
    <TextInput
      id={id}
      labelText={label}
      helperText={helperText}
      {...input}
      disabled={state.disabled}
      readOnly={state.readOnly}
    />
  );
}

const submit = (e: React.FormEvent) => e.preventDefault();

/** Two sections: a title, a description and the fields under it. First and last name sit side by side in a row. */
export const Default = {
  args: {
    size: 'medium',
    as: 'form',
    disabled: false,
    readOnly: false,
  },
  render: (args: FormLayoutProps) => (
    <FormLayout {...args} aria-label="Workspace settings" onSubmit={submit}>
      <FormSection
        title="Workspace"
        description="The name and address people see when they join.">
        <Field
          id="form-layout-default-name"
          label="Workspace name"
          defaultValue="Harbor research"
        />
        <Field
          id="form-layout-default-address"
          label="Address"
          defaultValue="harbor-research"
          helperText="Letters, numbers and dashes"
        />
      </FormSection>
      <FormSection
        title="Contact"
        description="Where billing and security notices go.">
        <FormRow>
          <Field
            id="form-layout-default-first"
            label="First name"
            defaultValue="Sam"
          />
          <Field
            id="form-layout-default-last"
            label="Last name"
            defaultValue="Rivera"
          />
        </FormRow>
        <Field
          id="form-layout-default-email"
          label="Email"
          type="email"
          defaultValue="team@example.com"
        />
      </FormSection>
      <div>
        <Button type="submit">Save settings</Button>
      </div>
    </FormLayout>
  ),
};

/** The four sizes: the form at its widest. Narrow 320px, medium 640px, wide 960px, or full. */
export const Sizes = {
  render: function SizesStory() {
    const [size, setSize] = useState<FormLayoutSize>('medium');
    return (
      <div style={stage}>
        <div style={row} role="group" aria-label="Size">
          {SIZES.map((s) => (
            <Button
              size="sm"
              variant="outlined"
              key={s}
              aria-pressed={size === s}
              onClick={() => setSize(s)}>
              {s}
            </Button>
          ))}
        </div>
        <FormLayout size={size} aria-label="Shipping address" onSubmit={submit}>
          <FormSection title="Shipping address">
            <Field
              id="form-layout-sizes-street"
              label="Street"
              defaultValue="12 Harbor Road"
            />
            <FormRow>
              <Field
                id="form-layout-sizes-city"
                label="City"
                defaultValue="Bayside"
              />
              <Field
                id="form-layout-sizes-region"
                label="Region"
                defaultValue="North"
              />
              <Field
                id="form-layout-sizes-postal"
                label="Postal code"
                defaultValue="10001"
              />
            </FormRow>
          </FormSection>
        </FormLayout>
      </div>
    );
  },
};

const resizable = {
  boxSizing: 'border-box' as const,
  inlineSize: 640,
  minInlineSize: 240,
  maxInlineSize: '100%',
  padding: 16,
  overflow: 'auto',
  resize: 'horizontal' as const,
  border: '1px solid var(--cds-border-subtle-01, #c6c6c6)',
};

/** Rows put fields side by side from a 480px form, 16px apart. Drag the box's corner to narrow it: under 480px they stack, at once. */
export const Rows = {
  render: () => (
    <div style={resizable}>
      <FormLayout size="full" aria-label="New project" onSubmit={submit}>
        <FormSection title="New project">
          <FormRow>
            <Field
              id="form-layout-rows-name"
              label="Project name"
              defaultValue="Coastal survey"
            />
            <Field
              id="form-layout-rows-code"
              label="Code"
              defaultValue="CS-24"
            />
          </FormRow>
          <FormRow>
            <Field id="form-layout-rows-start" label="Start" type="date" />
            <Field id="form-layout-rows-end" label="End" type="date" />
            <Field
              id="form-layout-rows-budget"
              label="Budget"
              type="number"
              defaultValue="12000"
            />
          </FormRow>
          <FormRow columns={2}>
            <Field
              id="form-layout-rows-lead"
              label="Lead"
              defaultValue="Research team"
            />
          </FormRow>
        </FormSection>
      </FormLayout>
    </div>
  ),
};

/** A section's `disabled` or `readOnly` reaches every field in it. A disabled section is a disabled fieldset. */
export const SectionState = {
  render: () => (
    <FormLayout aria-label="Account" onSubmit={submit}>
      <FormSection title="Profile" description="You can change these.">
        <Field
          id="form-layout-state-name"
          label="Display name"
          defaultValue="Sam Rivera"
        />
      </FormSection>
      <FormSection
        title="Organization"
        description="Set by your administrator."
        disabled>
        <Field
          id="form-layout-state-org"
          label="Organization"
          defaultValue="Harbor research"
        />
        <Field id="form-layout-state-team" label="Team" defaultValue="Field" />
      </FormSection>
      <FormSection title="Account" description="Shown for reference." readOnly>
        <Field
          id="form-layout-state-id"
          label="Account number"
          defaultValue="100-2048"
        />
      </FormSection>
    </FormLayout>
  ),
};

const scrollBox = {
  display: 'flex',
  flexDirection: 'column' as const,
  blockSize: 480,
  overflow: 'auto',
  border: '1px solid var(--cds-border-subtle-01, #c6c6c6)',
};
const scrollContent = { padding: 32 };

const PROJECT = {
  name: 'Coastal survey',
  description: 'Field notes and survey results',
  email: 'team@example.com',
  region: 'North',
};

/** Change a field: the unsaved changes bar arrives at the bottom with the count. Discard asks first from three changes. Escape discards. */
export const UnsavedChanges = {
  render: function UnsavedChangesStory() {
    const form = useDirtyForm(PROJECT);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [failNext, setFailNext] = useState(false);
    const save = () => {
      const values = form.values;
      const fail = failNext;
      setError(undefined);
      setSaving(true);
      window.setTimeout(() => {
        setSaving(false);
        if (fail) {
          setFailNext(false);
          setError('Not saved. Check the connection and try again.');
        } else {
          form.commit(values);
        }
      }, 1200);
    };
    const discard = () => {
      setError(undefined);
      form.discard();
    };
    const text = (key: keyof typeof PROJECT) => ({
      value: form.values[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        form.set(key, e.target.value),
    });
    return (
      <div style={stage}>
        <Checkbox
          id="form-layout-fail-next"
          labelText="Fail the next save"
          checked={failNext}
          onChange={(_e, { checked }) => setFailNext(checked)}
        />
        <div style={scrollBox}>
          <div style={scrollContent}>
            <FormLayout aria-label="Project settings" onSubmit={submit}>
              <FormSection title="Project">
                <Field
                  id="form-layout-unsaved-name"
                  label="Name"
                  {...text('name')}
                />
                <Field
                  id="form-layout-unsaved-description"
                  label="Description"
                  {...text('description')}
                />
              </FormSection>
              <FormSection title="Contact">
                <FormRow>
                  <Field
                    id="form-layout-unsaved-email"
                    label="Email"
                    type="email"
                    {...text('email')}
                  />
                  <Field
                    id="form-layout-unsaved-region"
                    label="Region"
                    {...text('region')}
                  />
                </FormRow>
              </FormSection>
            </FormLayout>
          </div>
          <UnsavedChangesBar
            dirty={form.dirty}
            changes={form.changed.length}
            saving={saving}
            error={error}
            confirmDiscardFrom={3}
            onSave={save}
            onDiscard={discard}
          />
        </div>
      </div>
    );
  },
};

/** Type in the field: after a pause it saves. "Saving…" with the spinner, then "Saved" with the time, or an error with Retry. */
export const Autosave = {
  render: function AutosaveStory() {
    const [status, setStatus] = useState<SavingStatusStatus>('default');
    const [savedAt, setSavedAt] = useState<number | undefined>();
    const [fail, setFail] = useState(false);
    const failRef = useRef(fail);
    failRef.current = fail;
    const pause = useRef<number | undefined>(undefined);
    const run = useRef<number | undefined>(undefined);
    useEffect(
      () => () => {
        window.clearTimeout(pause.current);
        window.clearTimeout(run.current);
      },
      []
    );
    const save = () => {
      setStatus('in-progress');
      window.clearTimeout(run.current);
      run.current = window.setTimeout(() => {
        if (failRef.current) {
          setStatus('fail');
        } else {
          setStatus('success');
          setSavedAt(Date.now());
        }
      }, 1200);
    };
    return (
      <div style={stage}>
        <Checkbox
          id="form-layout-saves-fail"
          labelText="Saves fail"
          checked={fail}
          onChange={(_e, { checked }) => setFail(checked)}
        />
        <FormLayout size="narrow" aria-label="Notes" onSubmit={submit}>
          <FormSection title="Notes">
            <Field
              id="form-layout-autosave-notes"
              label="Summary"
              defaultValue="Three sites visited"
              onChange={() => {
                window.clearTimeout(pause.current);
                pause.current = window.setTimeout(save, 800);
              }}
            />
          </FormSection>
          <SavingStatus
            status={status}
            savedAt={savedAt}
            onRequestSave={save}
          />
        </FormLayout>
      </div>
    );
  },
};

/** The four statuses of SavingStatus. */
export const SavingStates = {
  render: () => (
    <div style={stage}>
      {SAVING_STATES.map((s) => (
        <div key={s} style={row}>
          <span style={{ minInlineSize: 96 }}>{s}</span>
          <SavingStatus
            status={s}
            defaultText="No changes yet"
            savedAt={new Date().setHours(9, 30, 0, 0)}
            onRequestSave={() => {}}
          />
        </div>
      ))}
    </div>
  ),
};

/** A form in a side panel: the layout fills the panel, and the panel's footer holds the actions. */
export const InSidePanel = {
  parameters: { layout: 'fullscreen' },
  render: function InSidePanelStory() {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const launcher = useRef<HTMLElement>(null);
    const close = () => setOpen(false);
    const send = () => {
      setBusy(true);
      window.setTimeout(() => {
        setBusy(false);
        setOpen(false);
      }, 1200);
    };
    return (
      <div style={{ minBlockSize: 480, padding: 32 }}>
        <Button
          size="sm"
          variant="outlined"
          ref={launcher}
          onClick={() => setOpen(true)}>
          Invite people
        </Button>
        <SidePanel
          open={open}
          size="md"
          title="Invite people"
          subtitle="They get an email with a link to join."
          launcherButtonRef={launcher}
          onRequestClose={close}
          actions={[
            { label: 'Cancel', onClick: close },
            {
              label: busy ? 'Sending' : 'Send invites',
              loading: busy,
              onClick: send,
            },
          ]}>
          <FormLayout size="full" aria-label="Invite people" onSubmit={submit}>
            <FormSection title="People">
              <Field
                id="form-layout-panel-emails"
                label="Email addresses"
                defaultValue="lee@example.com, kim@example.com"
                helperText="Separate them with commas"
              />
            </FormSection>
            <FormSection
              title="Access"
              description="What they can do once they join.">
              <FormRow>
                <Field
                  id="form-layout-panel-role"
                  label="Role"
                  defaultValue="Editor"
                />
                <Field
                  id="form-layout-panel-expires"
                  label="Invite expires"
                  type="date"
                />
              </FormRow>
            </FormSection>
          </FormLayout>
        </SidePanel>
      </div>
    );
  },
};
