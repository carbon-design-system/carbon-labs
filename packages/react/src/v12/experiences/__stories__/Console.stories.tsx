/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// An experience: a small cloud console built only from the v12 components,
// to review them together rather than one at a time. One app shell holds
// three pages (Overview, Deployments, Settings); the header opens the
// assistant beside the shell and the notifications panel; Deployments opens
// a deployment's details in the shell's panel and creates one in the create
// flow; Settings saves through the unsaved changes bar, and a toast says so.
// Each story starts on a different page of the same app.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ElementType, MouseEvent, ReactNode } from 'react';
import {
  Add,
  ChatBot,
  Dashboard,
  Deploy,
  Help,
  Settings as SettingsIcon,
} from '@carbon-labs/react-motion-icons';
import { AppShell, Header, Region } from '@carbon-labs/react-app-shell';
import { Button } from '@carbon-labs/react-button';
import type { AppShellNavRenderProps } from '@carbon-labs/react-app-shell';
import { SideNav, SideNavLink } from '@carbon-labs/react-side-nav';
import { IconButton } from '@carbon-labs/react-tooltip';
import { PageHeader } from '@carbon-labs/react-page-header';
import { Search } from '@carbon-labs/react-search';
import { DataTableReveal } from '@carbon-labs/react-data-table';
import type {
  DataTableColumn,
  DataTableRevealRow,
} from '@carbon-labs/react-data-table';
import { Pagination } from '@carbon-labs/react-pagination';
import { Tag } from '@carbon-labs/react-tag';
import { Link } from '@carbon-labs/react-link';
import { SidePanel } from '@carbon-labs/react-side-panel';
import {
  DescriptionList,
  DescriptionListItem,
} from '@carbon-labs/react-description-list';
import { StatusIndicator } from '@carbon-labs/react-status-indicator';
import type { StatusIndicatorKind } from '@carbon-labs/react-status-indicator';
import { ProgressBar } from '@carbon-labs/react-progress-bar';
import { ActivityFeed } from '@carbon-labs/react-activity-feed';
import type {
  ActivityEvent,
  ActivityFeedCategory,
} from '@carbon-labs/react-activity-feed';
import {
  ActionableNotification,
  ToastStack,
  useToasts,
} from '@carbon-labs/react-notification';
import {
  NotificationsBell,
  NotificationsPanel,
} from '@carbon-labs/react-notifications-panel';
import type { NotificationsPanelData } from '@carbon-labs/react-notifications-panel';
import { EmptyState } from '@carbon-labs/react-empty-state';
import {
  FormLayout,
  FormRow,
  FormSection,
  UnsavedChangesBar,
  useDirtyForm,
} from '@carbon-labs/react-form-layout';
import { TextInput } from '@carbon-labs/react-text-input';
import { Select, SelectItem } from '@carbon-labs/react-select';
import { NumberInput } from '@carbon-labs/react-number-input';
import { RadioButton, RadioButtonGroup } from '@carbon-labs/react-radio-button';
import { Toggle } from '@carbon-labs/react-toggle';
import { Checkbox } from '@carbon-labs/react-checkbox';
import { Assistant, CreateFlow } from '@carbon-labs/react-recipes';
import type { StepFlowStep } from '@carbon-labs/react-step-flow';
import type { ChatTurn, Suggestion } from '@carbon-labs/react-chat';

export default {
  title: 'V12/Experiences/Console',
  // No docs page: it would run every story's app at once.
  tags: ['alpha', '!autodocs'],
  parameters: {
    layout: 'fullscreen',
    v12: {
      // Every motion here is a component's own, listed on its page.
      motion: [],
      reduced: {},
      states: ['overview', 'deployments', 'settings', 'assistant-open'],
    },
  },
};

/* ── Data ─────────────────────────────────────────────────────────────── */

type Status = 'Running' | 'Deploying' | 'Stopped' | 'Failed';
const STATUSES: Status[] = ['Running', 'Deploying', 'Stopped', 'Failed'];
const STATUS_TAG: Record<Status, 'green' | 'blue' | 'gray' | 'red'> = {
  Running: 'green',
  Deploying: 'blue',
  Stopped: 'gray',
  Failed: 'red',
};
const STATUS_KIND: Record<Status, StatusIndicatorKind> = {
  Running: 'success',
  Deploying: 'pending',
  Stopped: 'paused',
  Failed: 'error',
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

interface Deployment {
  id: string;
  name: string;
  status: Status;
  region: string;
  team: string;
  replicas: number;
}

/** Most deployments run; these don't. The failures are the ones the feed and the notifications name. */
const STATUS_OF: Record<string, Status> = {
  'checkout-prod': 'Failed',
  'checkout-stage': 'Failed',
  'billing-stage': 'Failed',
  'catalog-prod': 'Deploying',
  'search-stage': 'Deploying',
  'export-stage': 'Stopped',
  'media-stage': 'Stopped',
};

const SEED: Deployment[] = SERVICES.flatMap((s, i) =>
  [0, 1].map((k) => ({
    id: `${s}-${k}`,
    name: `${s}-${k === 0 ? 'prod' : 'stage'}`,
    status: STATUS_OF[`${s}-${k === 0 ? 'prod' : 'stage'}`] ?? 'Running',
    region: REGIONS[(i + k) % REGIONS.length],
    team: TEAMS[i % TEAMS.length],
    replicas: k === 0 ? 3 : 1,
  }))
);

const COLUMNS: DataTableColumn[] = [
  { key: 'name', header: 'Name', width: '30%', minWidth: '10rem' },
  { key: 'status', header: 'Status', width: '20%', minWidth: '7rem' },
  { key: 'region', header: 'Region', width: '20%', minWidth: '6rem' },
  { key: 'team', header: 'Team', minWidth: '7rem' },
];

const MINUTE = 60_000;
const FEED_CATEGORIES: ActivityFeedCategory[] = [
  { id: 'deploys', label: 'Deploys' },
  { id: 'changes', label: 'Changes' },
];
const feed = (now: number): ActivityEvent[] => [
  {
    id: 'f1',
    actor: 'Avery Lane',
    action: 'deployed',
    object: 'checkout-prod',
    timestamp: now - 4 * MINUTE,
    category: 'deploys',
    kind: 'success',
  },
  {
    id: 'f2',
    actor: 'Jordan Pike',
    action: 'scaled',
    object: 'search-prod to 5 replicas',
    timestamp: now - 26 * MINUTE,
    category: 'changes',
  },
  {
    id: 'f3',
    actor: 'Riley Shore',
    action: 'rolled back',
    object: 'billing-stage',
    timestamp: now - 3 * 60 * MINUTE,
    category: 'deploys',
    kind: 'error',
  },
];

const notes = (now: number): NotificationsPanelData[] => [
  {
    id: 'n1',
    type: 'error',
    title: 'Deployment failed',
    description: 'billing-stage stopped after a missing secret.',
    timestamp: new Date(now - 6 * MINUTE),
    unread: true,
  },
  {
    id: 'n2',
    type: 'warning',
    title: 'Storage almost full',
    description: 'The shared volume is at 92% of its quota.',
    timestamp: new Date(now - 50 * MINUTE),
    unread: true,
  },
  {
    id: 'n3',
    type: 'success',
    title: 'Nightly build passed',
    description: 'Every check passed.',
    timestamp: new Date(now - 9 * 60 * MINUTE),
    unread: false,
  },
];

const SUGGESTIONS: Suggestion[] = [
  { text: 'Summarize', secondary: 'the failed deployments' },
  { text: 'Find', secondary: 'deployments without an owner' },
];

/** A reply that lands done, with the steps it took. */
const reply = (id: string, text: string): ChatTurn => ({
  id,
  role: 'assistant',
  chunks: [text],
  done: true,
  status: { status: 'done', startedAt: 0, endedAt: 2400 },
  steps: [
    {
      id: `${id}-1`,
      label: 'Read the deployments',
      doneLabel: 'Read the deployments',
      status: 'done',
      tool: true,
      startedAt: 0,
      endedAt: 900,
    },
    {
      id: `${id}-2`,
      label: 'Group the failures',
      doneLabel: 'Grouped the failures',
      status: 'done',
      startedAt: 900,
      endedAt: 2400,
    },
  ],
});

/** The sample loads' wait before the data lands, ms. Not motion: the machine's own time. */
const LOAD_MS = 900;
/** The sample save's wait, ms. Not motion: the machine's own time. */
const SAVE_MS = 1000;

/* ── Pages ────────────────────────────────────────────────────────────── */

type PageId = 'overview' | 'deployments' | 'settings';

const page: CSSProperties = {
  display: 'grid',
  gap: 24,
  padding: '0 0 32px',
  alignContent: 'start',
};
// In line with the page header's title.
const body: CSSProperties = { display: 'grid', gap: 16, padding: '0 16px' };
const cards: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
  gap: 16,
};
const big: CSSProperties = { margin: '8px 0 0', fontSize: 32, lineHeight: 1 };
const caption: CSSProperties = {
  margin: 0,
  color: 'var(--cds-text-secondary)',
};
const toolbar: CSSProperties = { maxInlineSize: '24rem' };

function OverviewView({
  deployments,
  go,
}: {
  deployments: Deployment[];
  go: (p: PageId) => void;
}) {
  const now = useMemo(() => Date.now(), []);
  const count = (s: Status) => deployments.filter((d) => d.status === s).length;
  const failed = count('Failed');
  return (
    <div style={page}>
      <PageHeader
        frame="ghost"
        title="Overview"
        subtitle="How your deployments are doing, and what changed."
      />
      <div style={body}>
        {failed > 0 && (
          <ActionableNotification
            inline
            kind="warning"
            title={`${failed} deployments failed`}
            subtitle="Each stopped on a missing secret."
            actionButtonLabel="Review them"
            onActionButtonClick={() => go('deployments')}
            hideCloseButton
          />
        )}
        <div style={cards}>
          {STATUSES.map((s) => (
            <Region key={s} surface="raised" padding="default">
              <StatusIndicator kind={STATUS_KIND[s]} label={s} size="sm" />
              <p style={big}>{count(s)}</p>
            </Region>
          ))}
        </div>
        <div style={{ ...cards, alignItems: 'start' }}>
          <Region surface="raised" padding="default">
            <div style={{ display: 'grid', gap: 16 }}>
              <ProgressBar
                label="Compute"
                helperText="62 of 100 cores"
                value={62}
                max={100}
              />
              <ProgressBar
                label="Storage"
                helperText="920 of 1,000 GB"
                value={92}
                max={100}
              />
            </div>
          </Region>
          {/* The feed stands on its own surface. */}
          <ActivityFeed
            events={feed(now)}
            categories={FEED_CATEGORIES}
            label="Activity"
            filterLabel="Filter by category"
            allLabel="All"
          />
        </div>
      </div>
    </div>
  );
}

function DeploymentsView({
  deployments,
  onOpen,
  onCreate,
  createRef,
}: {
  deployments: Deployment[];
  onOpen: (d: Deployment, from: HTMLElement) => void;
  onCreate: () => void;
  createRef: React.RefObject<HTMLElement>;
}) {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), LOAD_MS);
    return () => window.clearTimeout(t);
  }, []);
  const matching = useMemo(() => {
    const q = search.trim().toLowerCase();
    return deployments.filter((d) => d.name.toLowerCase().includes(q));
  }, [deployments, search]);
  const rows = useMemo<DataTableRevealRow[]>(
    () =>
      matching.slice((pageNo - 1) * pageSize, pageNo * pageSize).map((d) => ({
        id: d.id,
        name: d.name,
        status: d.status,
        region: d.region,
        team: d.team,
        cells: [
          <Link
            key="name"
            href={`#${d.id}`}
            onClick={(e: MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              onOpen(d, e.currentTarget);
            }}>
            {d.name}
          </Link>,
          <Tag key="status" type={STATUS_TAG[d.status]}>
            {d.status}
          </Tag>,
          d.region,
          d.team,
        ],
      })),
    [matching, pageNo, pageSize, onOpen]
  );
  return (
    <div style={page}>
      <PageHeader
        frame="ghost"
        title="Deployments"
        subtitle="Your apps, running in regions."
      />
      <div style={body}>
        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'end',
            flexWrap: 'wrap',
          }}>
          <div style={{ ...toolbar, flex: '1 1 16rem' }}>
            <Search
              id="console-search"
              labelText="Search deployments"
              placeholder="Search by name"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageNo(1);
              }}
            />
          </div>
          <Button ref={createRef} renderIcon={Add} onClick={onCreate}>
            Create deployment
          </Button>
        </div>
        {!loading && matching.length === 0 ? (
          <EmptyState
            kind="not-found"
            context="table"
            title="No results found"
            subtitle="Try different words, or clear the search."
            action={{ text: 'Clear search', onClick: () => setSearch('') }}
          />
        ) : (
          <DataTableReveal
            aria-label="Deployments"
            loading={loading}
            columns={COLUMNS}
            rows={loading ? null : rows}
            rowCount={pageSize}
            isSelectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            isSortable
          />
        )}
        {!loading && matching.length > 0 && (
          <Pagination
            totalItems={matching.length}
            page={pageNo}
            pageSize={pageSize}
            pageSizes={[8, 16, 24]}
            onChange={({ page: p, pageSize: s }) => {
              setPageNo(p);
              setPageSize(s);
            }}
          />
        )}
      </div>
    </div>
  );
}

interface Workspace extends Record<string, unknown> {
  name: string;
  address: string;
  region: string;
  replicas: number;
  access: string;
  alerts: boolean;
  summary: boolean;
}
const WORKSPACE: Workspace = {
  name: 'Harbor production',
  address: 'harbor-prod',
  region: 'East',
  replicas: 3,
  access: 'team',
  alerts: true,
  summary: false,
};

function SettingsView() {
  const form = useDirtyForm<Workspace>(WORKSPACE);
  const [saving, setSaving] = useState(false);
  const toasts = useToasts();
  const v = form.values;
  const save = () => {
    const values = form.values;
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      form.commit(values);
      toasts.show({
        kind: 'success',
        title: 'Settings saved',
        subtitle: 'New deployments use them.',
        timeout: 6000,
      });
    }, SAVE_MS);
  };
  return (
    <div style={page}>
      <PageHeader
        frame="ghost"
        title="Settings"
        subtitle="The workspace and the defaults new deployments take."
      />
      <div style={{ ...body, paddingBlockEnd: 96 }}>
        <FormLayout
          aria-label="Workspace settings"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}>
          <FormSection
            title="Workspace"
            description="The name and address people see when they join.">
            <TextInput
              id="console-name"
              labelText="Workspace name"
              value={v.name}
              onChange={(e) => form.set('name', e.target.value)}
            />
            <TextInput
              id="console-address"
              labelText="Address"
              helperText="Letters, numbers and dashes"
              value={v.address}
              onChange={(e) => form.set('address', e.target.value)}
            />
          </FormSection>
          <FormSection
            title="Defaults"
            description="What a new deployment starts with.">
            <FormRow>
              <Select
                id="console-region"
                labelText="Region"
                value={v.region}
                onChange={(e) => form.set('region', e.target.value)}>
                {REGIONS.map((r) => (
                  <SelectItem key={r} value={r} text={r} />
                ))}
              </Select>
              <NumberInput
                id="console-replicas"
                label="Replicas"
                min={1}
                max={12}
                value={v.replicas}
                onChange={(_e, { value }) =>
                  form.set('replicas', Number(value) || 1)
                }
              />
            </FormRow>
            <RadioButtonGroup
              name="console-access"
              legendText="Who can see new deployments"
              valueSelected={v.access}
              onChange={(value) => form.set('access', String(value))}>
              <RadioButton value="me" labelText="Only me" />
              <RadioButton value="team" labelText="My team" />
              <RadioButton value="everyone" labelText="Everyone" />
            </RadioButtonGroup>
          </FormSection>
          <FormSection title="Notifications">
            <Toggle
              id="console-alerts"
              labelText="Alerts when a deployment fails"
              labelA="Off"
              labelB="On"
              toggled={v.alerts}
              onToggle={(checked) => form.set('alerts', checked)}
            />
            <Checkbox
              id="console-summary"
              labelText="Email me a weekly summary"
              checked={v.summary}
              onChange={(_e, { checked }) => form.set('summary', checked)}
            />
          </FormSection>
        </FormLayout>
      </div>
      <UnsavedChangesBar
        dirty={form.dirty}
        changes={form.changed.length}
        saving={saving}
        confirmDiscardFrom={3}
        onSave={save}
        onDiscard={form.discard}
      />
    </div>
  );
}

/* ── The app ──────────────────────────────────────────────────────────── */

/** A 20px mark for the header's logo. */
function Logo() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3 3h6v6H3zM11 3h6v6h-6zM3 11h6v6H3zM11 11h6v6h-6z" />
    </svg>
  );
}

const NAV: { id: PageId; label: string; icon: ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Dashboard },
  { id: 'deployments', label: 'Deployments', icon: Deploy },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

let created = 0;

function Console({
  start,
  assistant = false,
}: {
  start: PageId;
  assistant?: boolean;
}) {
  const [current, setCurrent] = useState<PageId>(start);
  const [deployments, setDeployments] = useState<Deployment[]>(SEED);
  const [details, setDetails] = useState<Deployment | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: '', region: '' });
  const [askOpen, setAskOpen] = useState(assistant);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [notesOpen, setNotesOpen] = useState(false);
  const [noteData, setNoteData] = useState(() => notes(Date.now()));
  const [dnd, setDnd] = useState(false);
  const toasts = useToasts();

  const detailsFrom = useRef<HTMLElement | null>(null);
  const createLauncher = useRef<HTMLElement>(null);
  const askButton = useRef<HTMLButtonElement>(null);
  const bell = useRef<HTMLButtonElement>(null);
  const turn = useRef(0);

  const unread = noteData.filter((n) => n.unread).length;
  const openDetails = useMemo(
    () => (d: Deployment, from: HTMLElement) => {
      detailsFrom.current = from;
      setDetails(d);
    },
    []
  );

  const header = (
    <Header
      aria-label="Harbor Cloud"
      name="Harbor"
      product="Cloud"
      logo={<Logo />}
      href="#"
      actions={
        <>
          <IconButton
            ref={askButton}
            frame="ghost"
            size="lg"
            corners="full"
            label={askOpen ? 'Close the assistant' : 'Ask the assistant'}
            aria-expanded={askOpen}
            onClick={() => setAskOpen((o) => !o)}>
            <ChatBot size={20} />
          </IconButton>
          <IconButton
            ref={bell}
            frame="ghost"
            size="lg"
            corners="full"
            align="bottom"
            label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
            aria-expanded={notesOpen}
            onClick={() => setNotesOpen((o) => !o)}>
            <NotificationsBell count={unread} doNotDisturb={dnd} />
          </IconButton>
          <IconButton frame="ghost" size="lg" corners="full" label="Help">
            <Help size={20} />
          </IconButton>
        </>
      }
    />
  );

  const nav = (n: AppShellNavRenderProps) => (
    <SideNav
      aria-label="Console"
      collapsible={n.collapsible}
      collapsed={n.collapsed}
      onCollapsedChange={n.onCollapsedChange}>
      {NAV.map(({ id, label, icon }) => (
        <SideNavLink
          key={id}
          href={`#${id}`}
          current={id === current}
          renderIcon={icon}
          onClick={(e: MouseEvent) => {
            e.preventDefault();
            setCurrent(id);
            setDetails(null);
          }}>
          {label}
        </SideNavLink>
      ))}
    </SideNav>
  );

  const panel = (
    <SidePanel
      open={details !== null}
      size="sm"
      title={details?.name ?? ''}
      subtitle="Deployment"
      launcherButtonRef={detailsFrom}
      onRequestClose={() => setDetails(null)}>
      {details && (
        <div style={{ display: 'grid', gap: 16 }}>
          <StatusIndicator
            kind={STATUS_KIND[details.status]}
            label={details.status}
          />
          <DescriptionList aria-label="Deployment details" layout="stacked">
            <DescriptionListItem term="Name" copyable>
              {details.name}
            </DescriptionListItem>
            <DescriptionListItem term="Region">
              {details.region}
            </DescriptionListItem>
            <DescriptionListItem term="Team">
              {details.team}
            </DescriptionListItem>
            <DescriptionListItem term="Replicas">
              {String(details.replicas)}
            </DescriptionListItem>
          </DescriptionList>
        </div>
      )}
    </SidePanel>
  );

  const steps: StepFlowStep[] = [
    {
      id: 'name',
      title: 'Name',
      description: 'Name the deployment.',
      invalid: draft.name.trim() === '',
      content: ({ showErrors }) => (
        <TextInput
          id="console-create-name"
          labelText="Name"
          helperText="Letters, numbers and dashes"
          value={draft.name}
          invalid={showErrors && draft.name.trim() === ''}
          invalidText="Enter a name."
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
      ),
    },
    {
      id: 'region',
      title: 'Region',
      description: 'Choose where it runs.',
      invalid: draft.region === '',
      content: ({ showErrors }) => (
        <RadioButtonGroup
          name="console-create-region"
          legendText="Region"
          orientation="vertical"
          valueSelected={draft.region}
          invalid={showErrors && draft.region === ''}
          invalidText="Choose a region."
          onChange={(value) => setDraft({ ...draft, region: String(value) })}>
          {REGIONS.map((r) => (
            <RadioButton key={r} value={r} labelText={r} />
          ))}
        </RadioButtonGroup>
      ),
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Check it, then create it.',
      content: (
        <DescriptionList aria-label="New deployment" layout="stacked">
          <DescriptionListItem term="Name">
            {draft.name || 'Not set'}
          </DescriptionListItem>
          <DescriptionListItem term="Region">
            {draft.region || 'Not set'}
          </DescriptionListItem>
        </DescriptionList>
      ),
    },
  ];

  const send = (text: string) => {
    const i = ++turn.current;
    const failed = deployments.filter((d) => d.status === 'Failed');
    setTurns((t) => [
      ...t,
      { id: `u-${i}`, role: 'user', text },
      reply(
        `a-${i}`,
        `${failed.length} deployments failed: ${failed
          .slice(0, 3)
          .map((d) => d.name)
          .join(', ')}${failed.length > 3 ? ' and more' : ''}.`
      ),
    ]);
  };

  let main: ReactNode;
  if (current === 'overview') {
    main = <OverviewView deployments={deployments} go={setCurrent} />;
  } else if (current === 'deployments') {
    main = (
      <DeploymentsView
        deployments={deployments}
        onOpen={openDetails}
        onCreate={() => {
          setDraft({ name: '', region: '' });
          setCreating(true);
        }}
        createRef={createLauncher}
      />
    );
  } else {
    main = <SettingsView />;
  }

  return (
    <div style={{ blockSize: '100vh', display: 'grid' }}>
      <Assistant
        open={askOpen}
        onClose={() => setAskOpen(false)}
        launcherButtonRef={askButton}
        turns={turns}
        onSubmit={send}
        suggestions={SUGGESTIONS}
        onRate={() => {}}>
        <AppShell
          scope="container"
          frame="flush"
          headerPlacement="bar"
          header={header}
          nav={nav}
          panel={panel}>
          {main}
        </AppShell>
      </Assistant>
      <NotificationsPanel
        open={notesOpen}
        data={noteData.map((n) => ({
          ...n,
          onNotificationClick: () =>
            setNoteData((d) =>
              d.map((x) => (x.id === n.id ? { ...x, unread: false } : x))
            ),
        }))}
        triggerButtonRef={bell}
        onClickOutside={() => setNotesOpen(false)}
        onDismissSingleNotification={(n) =>
          setNoteData((d) => d.filter((x) => x.id !== n.id))
        }
        onDismissAllNotifications={() => setNoteData([])}
        onDoNotDisturbChange={setDnd}
        doNotDisturbDefaultToggled={dnd}
        onViewAllClick={() => {}}
        onSettingsClick={() => setCurrent('settings')}
      />
      <CreateFlow
        open={creating}
        onClose={() => setCreating(false)}
        title="Create a deployment"
        label="Deployments"
        launcherButtonRef={createLauncher}
        steps={steps}
        submitButtonText="Create"
        onSubmit={() => {
          const id = `new-${++created}`;
          const name = draft.name.trim();
          setDeployments((ds) => [
            {
              id,
              name,
              status: 'Deploying',
              region: draft.region,
              team: 'Platform',
              replicas: 1,
            },
            ...ds,
          ]);
          setCreating(false);
          toasts.show({
            kind: 'info',
            title: 'Deployment created',
            subtitle: `${name} is deploying in ${draft.region}.`,
            timeout: 6000,
          });
        }}
      />
    </div>
  );
}

const app = (start: PageId, assistant?: boolean) => () => (
  <ToastStack>
    <Console start={start} assistant={assistant} />
  </ToastStack>
);

/** Starts on Overview: the status counts, capacity and activity. A warning links to the failed deployments. */
export const OverviewPage = { render: app('overview') };

/** Starts on Deployments: search, select and sort; a name opens its details in the panel; Create deployment opens the create flow. */
export const DeploymentsPage = { render: app('deployments') };

/** Starts on Settings: change a field and the unsaved changes bar arrives; save, and a toast says so. */
export const SettingsPage = { render: app('settings') };

/** Deployments with the assistant open beside the shell. Ask about the failures. */
export const WithAssistant = {
  name: 'With the assistant',
  render: app('deployments', true),
};
