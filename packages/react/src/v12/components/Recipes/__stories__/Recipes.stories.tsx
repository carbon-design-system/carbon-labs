/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RadioButton, RadioButtonGroup } from '@carbon-labs/react-radio-button';
import { TextInput } from '@carbon-labs/react-text-input';
import type { CSSProperties, ElementType, MouseEvent, ReactNode } from 'react';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
// The parts' own style sheets, which the other folders' built entries leave out.
import '@carbon-labs/react-activity-feed/scss/activity-feed.scss';
import '@carbon-labs/react-button/scss/button.scss';
import '@carbon-labs/react-button/scss/button-shell.scss';
import '@carbon-labs/react-disclosure/scss/disclosure.scss';
import '@carbon-labs/react-feedback/scss/feedback.scss';
import '@carbon-labs/react-feedback/scss/spinner.scss';
import '@carbon-labs/react-jump-to/scss/jump-to.scss';
import '@carbon-labs/react-menu/scss/menu.scss';
import '@carbon-labs/react-notification/scss/notification.scss';
import '@carbon-labs/react-popover/scss/popover.scss';
import '@carbon-labs/react-processing-v2/scss/processing.scss';
import '@carbon-labs/react-scroller/scss/scroller.scss';
import '@carbon-labs/react-select-list/scss/select-list.scss';
import '@carbon-labs/react-shimmer-text/scss/shimmer-text.scss';
import '@carbon-labs/react-tag/scss/tag.scss';
import '@carbon-labs/react-tag-set/scss/tag-set.scss';
import '@carbon-labs/react-tooltip/scss/tooltip.scss';
import '@carbon-labs/react-chat/scss/chat.scss';
import '@carbon-labs/react-chat/scss/chat-surface.scss';
import '@carbon-labs/react-chat/scss/step-list.scss';
import '@carbon-labs/react-chat/scss/turn-status.scss';
import '@carbon-labs/react-text-input/scss/text-input.scss';
import '@carbon-labs/react-text-input/scss/field.scss';
import '@carbon-labs/react-app-shell/scss/app-shell.scss';
import '@carbon-labs/react-side-nav/scss/side-nav.scss';
import '@carbon-labs/react-page-header/scss/page-header.scss';
import '@carbon-labs/react-search/scss/search.scss';
import '@carbon-labs/react-empty-state/scss/empty-state.scss';
import '@carbon-labs/react-pagination/scss/pagination.scss';
import '@carbon-labs/react-checkbox/scss/checkbox.scss';
import '@carbon-labs/react-data-table/scss/data-table.scss';
import '@carbon-labs/react-side-panel/scss/side-panel.scss';
import '@carbon-labs/react-tearsheet/scss/tearsheet.scss';
import '@carbon-labs/react-progress-indicator/scss/progress-indicator.scss';
import '@carbon-labs/react-step-flow/scss/step-flow.scss';
import { ContentSwitcher, Switch } from '@carbon-labs/react-content-switcher';
import {
  DescriptionList,
  DescriptionListItem,
} from '@carbon-labs/react-description-list';
import {
  Add,
  Dashboard,
  Deploy,
  Help,
  Notification,
  Renew,
  Settings,
} from '@carbon-labs/react-motion-icons';
import { IconButton } from '@carbon-labs/react-tooltip';
import { Header } from '@carbon-labs/react-app-shell';
import type { AppShellNavRenderProps } from '@carbon-labs/react-app-shell';
import { SideNav, SideNavLink } from '@carbon-labs/react-side-nav';
import { PageHeader } from '@carbon-labs/react-page-header';
import { Search } from '@carbon-labs/react-search';
import { EmptyState } from '@carbon-labs/react-empty-state';
import { Pagination } from '@carbon-labs/react-pagination';
import { Tag } from '@carbon-labs/react-tag';
import { DataTableReveal } from '@carbon-labs/react-data-table';
import type {
  DataTableColumn,
  DataTableRevealRow,
} from '@carbon-labs/react-data-table';
import type { StepFlowStep } from '@carbon-labs/react-step-flow';
import type { ChatTurn, ChipFile, Suggestion } from '@carbon-labs/react-chat';
import { Assistant, CreateFlow, ResourceIndex, resourceIndex } from '../index';
import type { ResourceIndexState } from '../index';
import mdx from './Recipes.mdx';

export default {
  title: 'V12/Recipes',
  component: Assistant,
  subcomponents: { ResourceIndex, CreateFlow },
  tags: ['alpha'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: mdx,
    },
    v12: {
      motion: [],
      reduced: {},
      // TODO the component has no doc: a recipe's motion is its parts', and no Motion table names it.
      states: [
        'empty',
        'conversation',
        'open',
        'closed',
        ...resourceIndex.states,
      ],
    },
  },
};

/** Every story fills the screen. */
const screen: CSSProperties = {
  position: 'relative',
  boxSizing: 'border-box',
  blockSize: '100vh',
  overflow: 'hidden',
  background: 'var(--cds-background)',
  color: 'var(--cds-text-primary)',
};
const scroll: CSSProperties = { blockSize: '100%', overflow: 'auto' };
const bodyStyle: CSSProperties = {
  display: 'grid',
  gap: 16,
  alignContent: 'start',
  padding: '0 32px 32px',
};

/* ── the deployments, shared by the recipes ──────────────────────────── */

type Status = 'Running' | 'Deploying' | 'Stopped' | 'Failed';
const STATUS_TAG: Record<Status, 'green' | 'blue' | 'gray' | 'red'> = {
  Running: 'green',
  Deploying: 'blue',
  Stopped: 'gray',
  Failed: 'red',
};
/** The deployments not running; the rest are. The assistant's replies name the same ones. */
const STATUS_OF: Record<string, Status> = {
  'checkout-prod': 'Failed',
  'checkout-stage': 'Failed',
  'billing-stage': 'Failed',
  'catalog-prod': 'Deploying',
  'search-stage': 'Deploying',
  'export-stage': 'Stopped',
  'media-stage': 'Stopped',
};
const REGIONS = ['East', 'West', 'North', 'South'];
const TEAMS = ['Platform', 'Payments', 'Content', 'Data'];
const SERVICES = [
  'checkout',
  'catalog',
  'search',
  'billing',
  'accounts',
  'reports',
  'gateway',
  'inventory',
  'notify',
  'media',
  'ledger',
  'export',
];
/** The services nobody owns yet. */
const UNOWNED = ['export', 'media'];

interface Deployment {
  id: string;
  name: string;
  status: Status;
  region: string;
  team: string;
}

const DEPLOYMENTS: Deployment[] = SERVICES.flatMap((s, i) =>
  [0, 1].map((k) => {
    const name = `${s}-${k === 0 ? 'prod' : 'stage'}`;
    return {
      id: `${s}-${k}`,
      name,
      status: STATUS_OF[name] ?? 'Running',
      region: REGIONS[(i + k) % REGIONS.length],
      team: UNOWNED.includes(s) ? 'No owner' : TEAMS[i % TEAMS.length],
    };
  })
);

const COLUMNS: DataTableColumn[] = [
  { key: 'name', header: 'Name', width: '30%', minWidth: '10rem' },
  { key: 'status', header: 'Status', width: '20%', minWidth: '7rem' },
  { key: 'region', header: 'Region', width: '20%', minWidth: '6rem' },
  { key: 'team', header: 'Team', minWidth: '7rem' },
];

const deploymentRow = (d: Deployment): DataTableRevealRow => ({
  id: d.id,
  name: d.name,
  status: d.status,
  region: d.region,
  team: d.team,
  cells: [
    d.name,
    <Tag key="status" type={STATUS_TAG[d.status]}>
      {d.status}
    </Tag>,
    d.region,
    d.team,
  ],
});

/* ── Assistant ────────────────────────────────────────────────────────── */

const SUGGESTIONS: Suggestion[] = [
  { text: 'Summarize', secondary: 'the failed deployments this week' },
  { text: 'Find', secondary: 'services without an owner' },
  { text: 'Draft', secondary: 'a rollback plan for checkout' },
];

interface Reply {
  match: RegExp;
  steps: [string, string][];
  chunks: string[];
}

/** The sample's answers, picked by the words of the question. The last one answers anything else. */
const REPLIES: Reply[] = [
  {
    match: /fail|broke|error|summar/i,
    steps: [
      ['Read the deployments', 'Read the deployments'],
      ['Group the failures', 'Grouped the failures'],
      ['Read the logs', 'Read the logs'],
    ],
    chunks: [
      'Three deployments failed this week: checkout-prod, checkout-stage and billing-stage.',
      'All three stopped on the same missing secret, the payment key, after Tuesday’s change to the secrets store.',
    ],
  },
  {
    match: /owner|own\b|nobody/i,
    steps: [
      ['Read the deployments', 'Read the deployments'],
      ['Check the owners', 'Checked the owners'],
    ],
    chunks: [
      'Two services have no owner: export and media.',
      'Their stage deployments are stopped. Assign a team to each, or archive them.',
    ],
  },
  {
    match: /roll ?back|revert|undo/i,
    steps: [
      ['Read the checkout history', 'Read the checkout history'],
      ['Find the last good build', 'Found the last good build'],
      ['Draft the plan', 'Drafted the plan'],
    ],
    chunks: [
      'Roll checkout back to build 4.12, the last one that ran.',
      'Redeploy it to checkout-stage first. Once it runs there, do the same for checkout-prod, then restore the payment key before the next deploy.',
    ],
  },
  {
    match: /./,
    steps: [['Read the deployments', 'Read the deployments']],
    chunks: [
      'I can answer questions about these deployments: what failed, who owns what, and how to roll back.',
      'Try asking about one of them by name.',
    ],
  },
];

const replyTo = (text: string) =>
  REPLIES.find((r) => r.match.test(text)) ?? REPLIES[REPLIES.length - 1];

/** A reply that lands done, with the steps it took. */
const reply = (id: string, text: string): ChatTurn => {
  const r = replyTo(text);
  const step = 1200;
  return {
    id,
    role: 'assistant',
    chunks: r.chunks,
    done: true,
    status: { status: 'done', startedAt: 0, endedAt: r.steps.length * step },
    steps: r.steps.map(([label, doneLabel], i) => ({
      id: `${id}-${i + 1}`,
      label,
      doneLabel,
      status: 'done',
      tool: i === 0,
      startedAt: i * step,
      endedAt: (i + 1) * step - 100,
    })),
  };
};

const FIRST_QUESTION = 'Which deployments failed this week?';
const CONVERSATION: ChatTurn[] = [
  { id: 'u1', role: 'user', text: FIRST_QUESTION },
  reply('a1', FIRST_QUESTION),
];

/** The sample retry's beat before its words land, ms. Not motion: the machine's own time. */
const RETRY_MS = 600;

function AssistantDemo({ start }: { start: 'empty' | 'conversation' }) {
  const [open, setOpen] = useState(true);
  const [turns, setTurns] = useState<ChatTurn[]>(
    start === 'conversation' ? CONVERSATION : []
  );
  const [files, setFiles] = useState<ChipFile[]>([]);
  const n = useRef(0);
  const launcher = useRef<HTMLElement | null>(null);
  const send = (text: string) => {
    const i = ++n.current;
    setTurns((t) => [
      ...t,
      { id: `u-${i}`, role: 'user', text },
      reply(`a-${i}`, text),
    ]);
    setFiles([]);
  };
  const retry = (t: ChatTurn) => {
    // A new run of the same reply: it thinks, then its words land again.
    const startedAt = performance.now();
    const set = (p: Partial<ChatTurn>) =>
      setTurns((ts) => ts.map((x) => (x.id === t.id ? { ...x, ...p } : x)));
    set({
      chunks: [],
      done: false,
      steps: undefined,
      status: { status: 'thinking', startedAt },
    });
    window.setTimeout(
      () =>
        set({
          chunks: t.chunks,
          done: true,
          status: { status: 'done', startedAt, endedAt: performance.now() },
        }),
      RETRY_MS
    );
  };
  return (
    <div style={screen}>
      <Assistant
        open={open}
        onClose={() => setOpen(false)}
        turns={turns}
        onSubmit={send}
        suggestions={SUGGESTIONS}
        placeholder="Ask about your deployments"
        files={files}
        onRemoveFile={(id) => setFiles((f) => f.filter((x) => x.id !== id))}
        launcherButtonRef={launcher}
        onRate={() => {}}
        onRetry={retry}>
        <div style={scroll}>
          <PageHeader
            frame="ghost"
            title="Deployments"
            subtitle="Your apps, running in regions."
            pageActions={[
              {
                key: 'assistant',
                label: open ? 'Hide assistant' : 'Ask the assistant',
                onClick: (e: MouseEvent<HTMLElement>) => {
                  launcher.current = e.currentTarget;
                  setOpen((o) => !o);
                },
              },
            ]}
          />
          <div style={bodyStyle}>
            <DataTableReveal
              aria-label="Deployments"
              loading={false}
              columns={COLUMNS}
              rows={DEPLOYMENTS.map(deploymentRow)}
              rowCount={DEPLOYMENTS.length}
              isSortable
            />
          </div>
        </div>
      </Assistant>
    </div>
  );
}

/**
 * An assistant beside the deployments page. Pick a suggestion or ask your
 * own question: the reply shows the steps it took, then its answer, and the
 * page stays in view, narrowed. Hide assistant gives the page its room back.
 */
export const AssistantEmpty = {
  parameters: { v12: { states: ['empty', 'open', 'closed'] } },
  render: () => <AssistantDemo start="empty" />,
};

/** The assistant with a question already answered. Retry runs the reply again; ask a follow-up below it. */
export const AssistantConversation = {
  parameters: { v12: { states: ['conversation', 'open', 'closed'] } },
  render: () => <AssistantDemo start="conversation" />,
};

/* ── ResourceIndex ────────────────────────────────────────────────────── */

/** The demo's nav: every top-level row has an icon, so it folds to a rail. */
function DemoNav({ nav }: { nav: AppShellNavRenderProps }) {
  const [page, setPage] = useState('deployments');
  const link = (id: string, label: string, icon: ElementType) => (
    <SideNavLink
      key={id}
      href={`#${id}`}
      current={id === page}
      renderIcon={icon}
      onClick={(e: MouseEvent) => {
        e.preventDefault();
        setPage(id);
      }}>
      {label}
    </SideNavLink>
  );
  return (
    <SideNav
      aria-label="Product"
      collapsible={nav.collapsible}
      collapsed={nav.collapsed}
      onCollapsedChange={nav.onCollapsedChange}>
      {link('overview', 'Overview', Dashboard)}
      {link('deployments', 'Deployments', Deploy)}
      {link('settings', 'Settings', Settings)}
    </SideNav>
  );
}

/** A 20px mark for the header's logo. */
function Logo() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3 3h6v6H3zM11 3h6v6h-6zM3 11h6v6H3zM11 11h6v6h-6z" />
    </svg>
  );
}

const HEADER = (
  <Header
    aria-label="Harbor Cloud"
    name="Harbor"
    product="Cloud"
    logo={<Logo />}
    href="#"
    actions={
      <>
        <IconButton
          frame="ghost"
          size="lg"
          corners="full"
          label="Notifications">
          <Notification size={20} />
        </IconButton>
        <IconButton frame="ghost" size="lg" corners="full" label="Help">
          <Help size={20} />
        </IconButton>
      </>
    }
  />
);

/** The states to try, in their own words. */
const STATE_NAME: Partial<Record<ResourceIndexState, string>> = {
  loading: 'Loading',
  'first-use': 'First use',
  loaded: 'Loaded',
  'filtered-empty': 'No results',
  error: 'Error',
};
const STATES = resourceIndex.states.filter((s) => s in STATE_NAME);

/** What main shows in each state: the table, or an empty state in its place. */
function mainFor(
  state: ResourceIndexState,
  rows: DataTableRevealRow[],
  selectedIds: string[],
  setSelectedIds: (ids: string[]) => void,
  setState: (s: ResourceIndexState) => void
): ReactNode {
  if (state === 'error') {
    return (
      <EmptyState
        kind="error"
        context="table"
        title="Deployments couldn’t be loaded"
        subtitle="Check your connection, then try again."
        action={{
          text: 'Try again',
          renderIcon: Renew,
          onClick: () => setState('loading'),
        }}
      />
    );
  }
  if (state === 'first-use') {
    return (
      <EmptyState
        kind="no-data"
        context="table"
        title="Start by creating a deployment"
        subtitle="A deployment runs your app in a region. Create one to see it here."
        action={{
          text: 'Create deployment',
          renderIcon: Add,
          onClick: () => setState('loaded'),
        }}
      />
    );
  }
  if (state === 'filtered-empty') {
    return (
      <EmptyState
        kind="not-found"
        context="table"
        title="No results found"
        subtitle="Try different words, or clear the search."
        action={{ text: 'Clear search', onClick: () => setState('loaded') }}
      />
    );
  }
  return (
    <DataTableReveal
      aria-label="Deployments"
      loading={state === 'loading'}
      columns={COLUMNS}
      rows={state === 'loading' ? null : rows}
      rowCount={8}
      isSelectable
      selectedIds={selectedIds}
      onSelectionChange={setSelectedIds}
      isSortable
    />
  );
}

/**
 * A deployments list in the app shell: search it, select rows, page through
 * it. The switcher above shows the page's other states: loading, before the
 * first deployment, a search with no results, and an error. Loading ends with
 * the rows fading in and the footer arriving with the last one.
 */
export const ResourceIndexStates = {
  parameters: { v12: { states: [...resourceIndex.states] } },
  render: function ResourceIndexStory() {
    const [state, setState] = useState<ResourceIndexState>('loaded');
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(8);
    const matching = useMemo(
      () =>
        DEPLOYMENTS.filter((d) =>
          d.name.toLowerCase().includes(search.trim().toLowerCase())
        ),
      [search]
    );
    const rows = useMemo<DataTableRevealRow[]>(
      () =>
        matching
          .slice((page - 1) * pageSize, page * pageSize)
          .map(deploymentRow),
      [matching, page, pageSize]
    );
    const nav = (n: AppShellNavRenderProps) => <DemoNav nav={n} />;
    // Each state as it would come about: no results is a search that
    // matches nothing, and the rest start from a clear search.
    const go = (s: ResourceIndexState) => {
      setSearch(s === 'filtered-empty' ? 'payroll' : '');
      setPage(1);
      setSelectedIds([]);
      setState(s);
    };
    // A load takes a moment, then the rows arrive.
    useEffect(() => {
      if (state !== 'loading') {
        return;
      }
      const t = window.setTimeout(() => setState('loaded'), LOAD_MS);
      return () => window.clearTimeout(t);
    }, [state]);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          blockSize: '100vh',
        }}>
        <div style={switcherRow}>
          <ContentSwitcher
            aria-label="Show the page"
            size="sm"
            selectedIndex={STATES.indexOf(state)}
            onChange={({ index }) => go(STATES[index ?? 0])}>
            {STATES.map((s) => (
              <Switch key={s} name={s} text={STATE_NAME[s] ?? s} />
            ))}
          </ContentSwitcher>
        </div>
        <div style={{ ...screen, flex: 1, blockSize: 'auto' }}>
          <ResourceIndex
            state={state}
            scope="container"
            header={HEADER}
            nav={nav}
            pageHeader={
              <PageHeader
                frame="ghost"
                title="Deployments"
                subtitle="Your apps, running in regions."
                pageActions={[
                  {
                    key: 'create',
                    label: 'Create deployment',
                    renderIcon: Add,
                  },
                ]}
              />
            }
            toolbar={
              <Search
                id="resource-index-search"
                labelText="Search deployments"
                placeholder="Search by name"
                value={search}
                onChange={(e) => {
                  const next = e.target.value;
                  setSearch(next);
                  setPage(1);
                  const any = DEPLOYMENTS.some((d) =>
                    d.name.toLowerCase().includes(next.trim().toLowerCase())
                  );
                  setState(any ? 'loaded' : 'filtered-empty');
                }}
              />
            }
            main={mainFor(state, rows, selectedIds, setSelectedIds, go)}
            footer={
              <Pagination
                totalItems={matching.length}
                page={page}
                pageSize={pageSize}
                pageSizes={[8, 16, 24]}
                onChange={({ page: p, pageSize: s }) => {
                  setPage(p);
                  setPageSize(s);
                }}
              />
            }
          />
        </div>
      </div>
    );
  },
};

/** The sample load's wait, ms. Not motion: the machine's own time. */
const LOAD_MS = 1500;

const switcherRow: CSSProperties = {
  padding: '12px 16px',
  borderBlockEnd: '1px solid var(--cds-border-subtle-01)',
};

/* ── CreateFlow ───────────────────────────────────────────────────────── */

const fields: CSSProperties = {
  display: 'grid',
  gap: 16,
  maxInlineSize: '28rem',
};

interface Project {
  name: string;
  access: string;
}
const EMPTY: Project = { name: '', access: '' };
const ACCESS = [
  { value: 'me', label: 'Only me' },
  { value: 'team', label: 'My team' },
  { value: 'everyone', label: 'Everyone' },
];
const accessOf = (value: string) =>
  ACCESS.find((a) => a.value === value)?.label ?? 'Not set';

/** "Create a project" in three steps, on the caller's values. */
function projectSteps(p: Project, set: (p: Project) => void): StepFlowStep[] {
  return [
    {
      id: 'details',
      title: 'Details',
      description: 'Name the project.',
      invalid: p.name.trim() === '',
      content: ({ showErrors }) => (
        <div style={fields}>
          <TextInput
            id="create-flow-name"
            labelText="Name"
            value={p.name}
            invalid={showErrors && p.name.trim() === ''}
            invalidText="Enter a name."
            onChange={(e) => set({ ...p, name: e.target.value })}
          />
        </div>
      ),
    },
    {
      id: 'access',
      title: 'Access',
      description: 'Choose who can see it.',
      invalid: p.access === '',
      content: ({ showErrors }) => (
        <div style={fields}>
          <RadioButtonGroup
            name="create-flow-access"
            legendText="Who can see it"
            valueSelected={p.access}
            onChange={(v) => set({ ...p, access: v as typeof p.access })}>
            {ACCESS.map((a) => (
              <RadioButton key={a.value} value={a.value} labelText={a.label} />
            ))}
          </RadioButtonGroup>
          {showErrors && p.access === '' && (
            <p style={{ margin: 0, color: 'var(--cds-text-error)' }}>
              Choose one.
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Check it, then create it.',
      content: (
        <DescriptionList aria-label="Your choices" layout="stacked">
          <DescriptionListItem term="Name">
            {p.name || 'Not set'}
          </DescriptionListItem>
          <DescriptionListItem term="Who can see it">
            {accessOf(p.access)}
          </DescriptionListItem>
        </DescriptionList>
      ),
    },
  ];
}

interface Made extends Project {
  id: string;
}
const MADE: Made[] = [
  { id: 'p1', name: 'Quarterly review', access: 'everyone' },
  { id: 'p2', name: 'Field notes', access: 'team' },
];
const PROJECT_COLUMNS: DataTableColumn[] = [
  { key: 'name', header: 'Name', width: '50%', minWidth: '10rem' },
  { key: 'access', header: 'Who can see it', minWidth: '8rem' },
];

/**
 * A projects page. Create project opens a tearsheet with the steps in a
 * column beside the form, and Cancel, Back and Next in its footer. The last
 * step shows your choices before Create, and the new project joins the list.
 * Each open starts on the first step.
 */
export const CreateFlowSheet = {
  parameters: { v12: { states: ['open', 'closed', 'invalid', 'review'] } },
  render: function CreateFlowStory() {
    const [open, setOpen] = useState(false);
    const [project, setProject] = useState<Project>(EMPTY);
    const [made, setMade] = useState<Made[]>(MADE);
    const launcher = useRef<HTMLElement | null>(null);
    return (
      <div style={{ ...screen, overflow: 'auto' }}>
        <PageHeader
          frame="ghost"
          title="Projects"
          subtitle="Places for your team's work."
          pageActions={[
            {
              key: 'create',
              label: 'Create project',
              renderIcon: Add,
              onClick: (e: MouseEvent<HTMLElement>) => {
                launcher.current = e.currentTarget;
                setProject(EMPTY);
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
            rows={made.map((m) => ({
              id: m.id,
              name: m.name,
              access: accessOf(m.access),
              cells: [m.name, accessOf(m.access)],
            }))}
            rowCount={made.length}
          />
        </div>
        <CreateFlow
          open={open}
          onClose={() => setOpen(false)}
          title="Create a project"
          label="Projects"
          launcherButtonRef={launcher}
          steps={projectSteps(project, setProject)}
          submitButtonText="Create"
          onSubmit={() => {
            setMade((m) => [{ ...project, id: `p${m.length + 1}` }, ...m]);
            setOpen(false);
          }}
        />
      </div>
    );
  },
};
