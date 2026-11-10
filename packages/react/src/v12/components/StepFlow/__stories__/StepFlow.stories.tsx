/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { Select, SelectItem } from '@carbon-labs/react-select';
import { TextInput } from '@carbon-labs/react-text-input';
import { NumberInput } from '@carbon-labs/react-number-input';
import { Button } from '@carbon-labs/react-button';
import { PageHeader } from '@carbon-labs/react-page-header';
import { InlineNotification } from '@carbon-labs/react-notification';
import {
  DescriptionList,
  DescriptionListItem,
} from '@carbon-labs/react-description-list';
import { DataTableReveal } from '@carbon-labs/react-data-table';
import type {
  DataTableColumn,
  DataTableRevealRow,
} from '@carbon-labs/react-data-table';
import { Add } from '@carbon-labs/react-motion-icons';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { Tearsheet } from '@carbon-labs/react-tearsheet';
import {
  StepFlow,
  StepFlowActions,
  StepFlowBody,
  StepFlowProgress,
  stepFlowActions,
  useStepFlow,
} from '../index';
import type { StepFlowProps, StepFlowStep } from '../index';
import mdx from './StepFlow.mdx';

export default {
  title: 'V12/StepFlow',
  component: StepFlow,
  subcomponents: { StepFlowProgress, StepFlowBody, StepFlowActions },
  tags: ['alpha'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'content-movement-in-place',
        'height',
        'the-marker-s-glide-and-reach',
        'an-invalid-step',
      ],
      reduced: {
        'content-movement-in-place': 'at-once',
        height: 'at-once',
      },
      states: ['first', 'middle', 'last', 'invalid', 'submitting'],
    },
  },
  argTypes: {
    initialIndex: { control: { type: 'number', min: 0, max: 3 } },
    headingLevel: { control: 'inline-radio', options: [2, 3, 4] },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    steps: { control: false },
    announce: { control: false },
  },
};

/* ── "New project": one draft, kept by the story ─────────────────────── */

interface Draft {
  name: string;
  summary: string;
  access: string;
  region: string;
  size: number;
}

const START: Draft = {
  name: 'Northwind',
  summary: 'Monthly reports for the sales team.',
  access: 'team',
  region: 'us-east',
  size: 50,
};
const BLANK: Draft = { ...START, name: '', summary: '' };

interface Option {
  value: string;
  text: string;
}
const ACCESS: Option[] = [
  { value: 'me', text: 'Only me' },
  { value: 'team', text: 'My team' },
  { value: 'everyone', text: 'Everyone in the company' },
];
const REGIONS: Option[] = [
  { value: 'us-south', text: 'Dallas' },
  { value: 'us-east', text: 'Washington DC' },
  { value: 'eu-de', text: 'Frankfurt' },
  { value: 'eu-gb', text: 'London' },
  { value: 'jp-tok', text: 'Tokyo' },
  { value: 'au-syd', text: 'Sydney' },
];
const textOf = (list: Option[], value: string) =>
  list.find((o) => o.value === value)?.text ?? 'Not set';

const fields: CSSProperties = {
  display: 'grid',
  gap: 16,
  maxInlineSize: '28rem',
};
const note: CSSProperties = {
  margin: 0,
  color: 'var(--cds-text-secondary)',
};

/** Four steps on the story's draft. `id` keeps each story's fields apart. */
function makeSteps(
  id: string,
  d: Draft,
  set: (d: Draft) => void
): StepFlowStep[] {
  const nameMissing = d.name.trim() === '';
  return [
    {
      id: 'details',
      title: 'Details',
      description: 'Name the project and say what it is for.',
      invalid: nameMissing,
      content: ({ showErrors }) => (
        <div style={fields}>
          <TextInput
            id={`${id}-name`}
            labelText="Name"
            value={d.name}
            invalid={showErrors && nameMissing}
            invalidText="Enter a name."
            onChange={(e) => set({ ...d, name: e.target.value })}
          />
          <TextInput
            id={`${id}-summary`}
            labelText="Summary"
            helperText="Optional"
            value={d.summary}
            onChange={(e) => set({ ...d, summary: e.target.value })}
          />
        </div>
      ),
    },
    {
      id: 'access',
      title: 'Access',
      description: 'Choose who can open it.',
      content: (
        <div style={fields}>
          <Select
            id={`${id}-access`}
            labelText="Who can open it"
            value={d.access}
            onChange={(e) => set({ ...d, access: e.target.value })}>
            {ACCESS.map((o) => (
              <SelectItem key={o.value} value={o.value} text={o.text} />
            ))}
          </Select>
        </div>
      ),
    },
    {
      id: 'storage',
      title: 'Storage',
      description: 'Choose where the data is kept and how much room it has.',
      secondaryLabel: 'Optional',
      content: (
        <div style={fields}>
          <Select
            id={`${id}-region`}
            labelText="Region"
            value={d.region}
            onChange={(e) => set({ ...d, region: e.target.value })}>
            {REGIONS.map((o) => (
              <SelectItem key={o.value} value={o.value} text={o.text} />
            ))}
          </Select>
          <NumberInput
            id={`${id}-size`}
            label="Size in GB"
            min={10}
            max={1000}
            step={10}
            value={d.size}
            onChange={(_e, state) =>
              set({ ...d, size: Number(state?.value ?? d.size) })
            }
          />
          <p style={note}>
            The region can&rsquo;t change later. The size can grow at any time.
          </p>
        </div>
      ),
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Check your choices, then create the project.',
      content: (
        <DescriptionList aria-label="Your choices" layout="stacked">
          <DescriptionListItem term="Name">
            {d.name || 'Not set'}
          </DescriptionListItem>
          <DescriptionListItem term="Summary">
            {d.summary || 'None'}
          </DescriptionListItem>
          <DescriptionListItem term="Who can open it">
            {textOf(ACCESS, d.access)}
          </DescriptionListItem>
          <DescriptionListItem term="Region">
            {textOf(REGIONS, d.region)}
          </DescriptionListItem>
          <DescriptionListItem term="Size">{`${d.size} GB`}</DescriptionListItem>
        </DescriptionList>
      ),
    },
  ];
}

/* ── the page round the flow ─────────────────────────────────────────── */

const pageStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minBlockSize: '100vh',
};
const bodyStyle: CSSProperties = {
  display: 'grid',
  gap: 24,
  alignContent: 'start',
  padding: '0 32px 32px',
};

const BREADCRUMBS = [
  { key: 'projects', label: 'Projects', href: '#' },
  { key: 'new', label: 'New project', isCurrentPage: true },
];

function NewProjectPage({
  children,
  width = 720,
}: {
  children: ReactNode;
  width?: number;
}) {
  return (
    <div style={pageStyle}>
      <PageHeader
        frame="ghost"
        title="New project"
        subtitle="A place for your team's reports."
        breadcrumbs={BREADCRUMBS}
      />
      <div style={{ ...bodyStyle, maxInlineSize: width }}>{children}</div>
    </div>
  );
}

/** What the page shows once the project is made. */
function Created({ name, onAgain }: { name: string; onAgain: () => void }) {
  return (
    <div style={{ display: 'grid', gap: 16, maxInlineSize: '32rem' }}>
      <InlineNotification
        kind="success"
        title="Project created"
        subtitle={`${name} is ready. Your team can open it now.`}
        hideCloseButton
      />
      <Button
        size="sm"
        variant="outlined"
        style={{ justifySelf: 'start' }}
        onClick={onAgain}>
        Create another project
      </Button>
    </div>
  );
}

/** A draft, the flow's run (a new run starts it over) and whether it's done. */
function useNewProject(start: Draft) {
  const [draft, setDraft] = useState(start);
  const [run, setRun] = useState(0);
  const [done, setDone] = useState(false);
  return {
    draft,
    setDraft,
    run,
    done,
    finish: () => setDone(true),
    again: () => {
      setDraft(BLANK);
      setRun((r) => r + 1);
      setDone(false);
    },
  };
}

/** Fill in each step and press Next. Back keeps what you entered. The last step shows your choices before Create. */
export const Default = {
  args: {
    initialIndex: 0,
    vertical: false,
    headingLevel: 2,
    nextButtonText: 'Next',
    backButtonText: 'Back',
    submitButtonText: 'Create project',
    cancelButtonText: 'Cancel',
    showErrors: false,
    timeScale: 1,
  },
  render: (args: Omit<StepFlowProps, 'steps'>) => <NewProjectFlow {...args} />,
};

/** The Default story's flow, on its controls. */
function NewProjectFlow(args: Omit<StepFlowProps, 'steps'>) {
  const p = useNewProject(START);
  return (
    <NewProjectPage>
      {p.done ? (
        <Created name={p.draft.name} onAgain={p.again} />
      ) : (
        <StepFlow
          key={p.run}
          {...args}
          steps={makeSteps('step-flow-default', p.draft, p.setDraft)}
          onSubmit={p.finish}
        />
      )}
    </NewProjectPage>
  );
}

/** The name is required. Press Next with it empty: the step stays, shows the error, marks the step in the indicator and moves focus to the field. */
export const Validation = {
  render: function ValidationStory() {
    const p = useNewProject(BLANK);
    return (
      <NewProjectPage>
        {p.done ? (
          <Created name={p.draft.name} onAgain={p.again} />
        ) : (
          <StepFlow
            key={p.run}
            submitButtonText="Create project"
            steps={makeSteps('step-flow-validation', p.draft, p.setDraft)}
            onSubmit={p.finish}
          />
        )}
      </NewProjectPage>
    );
  },
};

/** The steps listed in a column beside the form. */
export const Vertical = {
  render: function VerticalStory() {
    const p = useNewProject(START);
    return (
      <NewProjectPage width={880}>
        {p.done ? (
          <Created name={p.draft.name} onAgain={p.again} />
        ) : (
          <StepFlow
            key={p.run}
            vertical
            submitButtonText="Create project"
            steps={makeSteps('step-flow-vertical', p.draft, p.setDraft)}
            onSubmit={p.finish}
          />
        )}
      </NewProjectPage>
    );
  },
};

/** Starts on the last step. Create shows it is working for a moment, and Back waits, then the project is made. */
export const Submitting = {
  render: function SubmittingStory() {
    const p = useNewProject(START);
    const [submitting, setSubmitting] = useState(false);
    const { finish } = p;
    useEffect(() => {
      if (!submitting) {
        return;
      }
      const t = window.setTimeout(() => {
        setSubmitting(false);
        finish();
      }, 1500);
      return () => window.clearTimeout(t);
    }, [submitting, finish]);
    return (
      <NewProjectPage>
        {p.done ? (
          <Created name={p.draft.name} onAgain={p.again} />
        ) : (
          <StepFlow
            key={p.run}
            initialIndex={p.run ? 0 : 3}
            steps={makeSteps('step-flow-submitting', p.draft, p.setDraft)}
            submitting={submitting}
            submitButtonText="Create project"
            onSubmit={() => setSubmitting(true)}
          />
        )}
      </NewProjectPage>
    );
  },
};

/** The same flow from its parts, for a layout of your own: `useStepFlow` holds the flow, and `StepFlowProgress`, `StepFlowBody` and `StepFlowActions` draw it. Here Cancel starts over. */
export const Parts = {
  render: function PartsStory() {
    const [draft, setDraft] = useState(START);
    const flow = useStepFlow({
      steps: makeSteps('step-flow-parts', draft, setDraft),
    });
    return (
      <div
        style={{ display: 'grid', gap: 24, padding: 32, maxInlineSize: 720 }}>
        <StepFlowProgress flow={flow} spaceEqually />
        <StepFlowBody flow={flow} />
        <StepFlowActions
          flow={flow}
          onCancel={() => {
            setDraft(START);
            flow.reset();
          }}
        />
      </div>
    );
  },
};

/* ── the flow in a tearsheet, from a projects page ───────────────────── */

interface Project {
  id: string;
  name: string;
  access: string;
  region: string;
}

const PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Quarterly review',
    access: 'everyone',
    region: 'us-south',
  },
  { id: 'p2', name: 'Field notes', access: 'team', region: 'eu-de' },
  { id: 'p3', name: 'Pricing study', access: 'me', region: 'us-east' },
];

const PROJECT_COLUMNS: DataTableColumn[] = [
  { key: 'name', header: 'Name', width: '40%', minWidth: '10rem' },
  { key: 'access', header: 'Who can open it', width: '30%', minWidth: '8rem' },
  { key: 'region', header: 'Region', minWidth: '6rem' },
];

const projectRow = (p: Project): DataTableRevealRow => ({
  id: p.id,
  name: p.name,
  access: textOf(ACCESS, p.access),
  region: textOf(REGIONS, p.region),
  cells: [p.name, textOf(ACCESS, p.access), textOf(REGIONS, p.region)],
});

/** Create project opens the flow in a tearsheet: the steps in a column, the form beside them, and the buttons in its footer. The new project joins the list. Each open starts from the first step. */
export const InTearsheet = {
  render: function InTearsheetStory() {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState(BLANK);
    const [projects, setProjects] = useState(PROJECTS);
    const launcher = useRef<HTMLElement | null>(null);
    const close = () => setOpen(false);
    const flow = useStepFlow({
      steps: makeSteps('step-flow-sheet', draft, setDraft),
      submitButtonText: 'Create project',
      onSubmit: () => {
        setProjects((list) => [
          { ...draft, id: `p${list.length + 1}` },
          ...list,
        ]);
        close();
      },
    });
    return (
      <div style={pageStyle}>
        <PageHeader
          frame="ghost"
          title="Projects"
          subtitle="Places for your team's reports."
          pageActions={[
            {
              key: 'create',
              label: 'Create project',
              renderIcon: Add,
              onClick: (e: MouseEvent<HTMLElement>) => {
                launcher.current = e.currentTarget;
                setDraft(BLANK);
                flow.reset();
                setOpen(true);
              },
            },
          ]}
        />
        <div style={bodyStyle}>
          <DataTableReveal
            aria-label="Projects"
            loading={false}
            columns={PROJECT_COLUMNS}
            rows={projects.map(projectRow)}
            rowCount={projects.length}
          />
        </div>
        <Tearsheet
          open={open}
          launcherButtonRef={launcher}
          title="Create a project"
          influencer={<StepFlowProgress flow={flow} vertical />}
          actions={stepFlowActions(flow, { onCancel: close })}
          onClose={close}>
          <StepFlowBody flow={flow} />
        </Tearsheet>
      </div>
    );
  },
};
