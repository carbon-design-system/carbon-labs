/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState } from 'react';
import type { CSSProperties, ElementType, MouseEvent, ReactNode } from 'react';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import {
  Add,
  Analytics,
  Calendar,
  Dashboard,
  Folder,
  Help,
  Notification,
  Search,
  Settings,
  SettingsAdjust,
  UserAvatar,
} from '@carbon-labs/react-motion-icons';
import { Popover, PopoverContent } from '@carbon-labs/react-popover';
import { IconButton } from '@carbon-labs/react-tooltip';
import { SidePanel } from '@carbon-labs/react-side-panel';
import {
  SideNav,
  SideNavGroup,
  SideNavLink,
} from '@carbon-labs/react-side-nav';
import { PageHeader } from '@carbon-labs/react-page-header';
import { DataTableReveal } from '@carbon-labs/react-data-table';
import type {
  DataTableColumn,
  DataTableRevealRow,
} from '@carbon-labs/react-data-table';
import { Link } from '@carbon-labs/react-link';
import { Tag } from '@carbon-labs/react-tag';
import {
  DescriptionList,
  DescriptionListItem,
} from '@carbon-labs/react-description-list';
import { EmptyState } from '@carbon-labs/react-empty-state';
import { ContentSwitcher, Switch } from '@carbon-labs/react-content-switcher';
import {
  AppShell,
  Header,
  NavOverlay,
  Region,
  SIZE_CLASSES,
  useAppShell,
} from '../index';
import type {
  AppShellNavRenderProps,
  AppShellProps,
  HeaderFrame,
  RegionSurface,
  SizeClass,
} from '../index';
import mdx from './AppShell.mdx';

type FoldTo = NonNullable<AppShellProps['foldTo']>;
type MainTheme = NonNullable<AppShellProps['mainTheme']>;

const FOLDS: FoldTo[] = ['rail', 'overlay', 'hide'];
const MAIN_THEMES: MainTheme[] = ['page', 'light', 'dark', 'inverse'];
const SURFACES: RegionSurface[] = ['page', 'quiet', 'raised'];

/** A frame width inside each size class: compact < 672, medium 672–1055, expanded 1056–1311, large ≥ 1312. */
const CLASS_WIDTH: Record<SizeClass, number> = {
  compact: 480,
  medium: 864,
  expanded: 1120,
  large: 1360,
};
const CLASS_NAME: Record<SizeClass, string> = {
  compact: 'Compact',
  medium: 'Medium',
  expanded: 'Expanded',
  large: 'Large',
};

export default {
  title: 'V12/AppShell',
  component: AppShell,
  subcomponents: { Header, NavOverlay, Region },
  tags: ['alpha'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'fold',
        'overlay-nav',
        'panel-push',
        'class-edge',
        'menu-button',
      ],
      reduced: {
        fold: 'at-once',
        'overlay-nav': 'shorter-clock',
        'panel-push': 'at-once',
        'class-edge': 'at-once',
        'menu-button': 'at-once',
      },
      states: ['compact', 'medium', 'expanded', 'large'],
    },
  },
  argTypes: {
    scope: { control: 'inline-radio', options: ['page', 'container'] },
    frame: { control: 'inline-radio', options: ['flush', 'inset'] },
    headerPlacement: { control: 'inline-radio', options: ['bar', 'nav'] },
    mainTheme: { control: 'inline-radio', options: MAIN_THEMES },
    chromeTheme: { control: 'inline-radio', options: MAIN_THEMES },
    foldToggle: {
      control: 'inline-radio',
      options: ['header', 'foot', 'nav'],
    },
    foldTo: { control: 'inline-radio', options: FOLDS },
    sizeClass: { control: 'select', options: SIZE_CLASSES },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    header: { control: false },
    nav: { control: false },
    children: { control: false },
    panel: { control: false },
    mainProps: { control: false },
    layout: { control: false },
    navStrip: { control: false },
    navCollapsed: { control: false },
  },
};

/* ── the product: Harbor Insights ─────────────────────────────────────── */

type PageId =
  | 'overview'
  | 'projects'
  | 'responses'
  | 'regions'
  | 'calendar'
  | 'settings';

type ProjectStatus = 'Collecting' | 'Analyzing' | 'Draft' | 'Closed';
const STATUS_TAG: Record<ProjectStatus, 'green' | 'blue' | 'gray' | 'purple'> =
  {
    Collecting: 'green',
    Analyzing: 'blue',
    Draft: 'gray',
    Closed: 'purple',
  };

interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  owner: string;
  responses: number;
  updated: string;
}

const PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Checkout survey',
    status: 'Collecting',
    owner: 'Avery Lane',
    responses: 128,
    updated: 'Today',
  },
  {
    id: 'p2',
    name: 'Onboarding interviews',
    status: 'Analyzing',
    owner: 'Jordan Pike',
    responses: 24,
    updated: 'Yesterday',
  },
  {
    id: 'p3',
    name: 'Pricing page test',
    status: 'Collecting',
    owner: 'Riley Shore',
    responses: 96,
    updated: '2 days ago',
  },
  {
    id: 'p4',
    name: 'Support satisfaction',
    status: 'Analyzing',
    owner: 'Avery Lane',
    responses: 64,
    updated: '3 days ago',
  },
  {
    id: 'p5',
    name: 'Mobile navigation study',
    status: 'Draft',
    owner: 'Sam Ortiz',
    responses: 0,
    updated: 'Last week',
  },
  {
    id: 'p6',
    name: 'Annual customer panel',
    status: 'Closed',
    owner: 'Jordan Pike',
    responses: 36,
    updated: 'Last month',
  },
];

const COLUMNS: DataTableColumn[] = [
  { key: 'name', header: 'Project', width: '34%', minWidth: '12rem' },
  { key: 'status', header: 'Status', width: '18%', minWidth: '7rem' },
  { key: 'owner', header: 'Owner', width: '22%', minWidth: '8rem' },
  { key: 'responses', header: 'Responses', minWidth: '6rem' },
];

/** A 20px mark for the header's logo. */
function Logo() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3 3h6v6H3zM11 3h6v6h-6zM3 11h6v6H3zM11 11h6v6h-6z" />
    </svg>
  );
}

/** The global actions: ghost lg IconButtons with `corners="full"`. */
function HeaderActions() {
  return (
    <>
      <IconButton
        frame="ghost"
        size="lg"
        corners="full"
        align="bottom-end"
        label="Search">
        <Search size={20} />
      </IconButton>
      <IconButton
        frame="ghost"
        size="lg"
        corners="full"
        align="bottom-end"
        label="Notifications">
        <Notification size={20} />
      </IconButton>
      <IconButton
        frame="ghost"
        size="lg"
        corners="full"
        align="bottom-end"
        label="Help">
        <Help size={20} />
      </IconButton>
      <IconButton
        frame="ghost"
        size="lg"
        corners="full"
        align="bottom-end"
        label="Profile">
        <UserAvatar size={20} />
      </IconButton>
    </>
  );
}

function HarborHeader({
  frame,
  theme,
  before,
}: {
  frame?: HeaderFrame;
  theme?: 'light' | 'dark';
  /** Actions before the global ones (the demo's View). */
  before?: ReactNode;
}) {
  return (
    <Header
      aria-label="Harbor Insights"
      name="Harbor"
      product="Insights"
      logo={<Logo />}
      href="#"
      frame={frame}
      theme={theme}
      actions={
        <>
          {before}
          <HeaderActions />
        </>
      }
    />
  );
}

const TOP: { id: PageId; label: string; icon: ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Dashboard },
  { id: 'projects', label: 'Projects', icon: Folder },
];
const REPORTS: { id: PageId; label: string }[] = [
  { id: 'responses', label: 'Responses' },
  { id: 'regions', label: 'Regions' },
];
const BOTTOM: { id: PageId; label: string; icon: ElementType }[] = [
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'settings', label: 'Settings', icon: Settings },
];
const TITLE: Record<PageId, string> = {
  overview: 'Overview',
  projects: 'Projects',
  responses: 'Responses',
  regions: 'Regions',
  calendar: 'Calendar',
  settings: 'Settings',
};

/** The app's nav: the v12 SideNav, as the shell's render function, so it can fold to a rail. */
function HarborNav({
  shell,
  current,
  go,
}: {
  shell: AppShellNavRenderProps;
  current: PageId;
  go: (page: PageId) => void;
}) {
  const link = (id: PageId, label: string, icon?: ElementType) => (
    <SideNavLink
      key={id}
      href={`#${id}`}
      current={id === current}
      renderIcon={icon}
      onClick={(e: MouseEvent) => {
        e.preventDefault();
        go(id);
        shell.close();
      }}>
      {label}
    </SideNavLink>
  );
  return (
    <SideNav
      aria-label="Harbor Insights"
      collapsible={shell.collapsible}
      collapsed={shell.collapsed}
      onCollapsedChange={shell.onCollapsedChange}>
      {TOP.map((i) => link(i.id, i.label, i.icon))}
      <SideNavGroup title="Reports" renderIcon={Analytics}>
        {REPORTS.map((i) => link(i.id, i.label))}
      </SideNavGroup>
      {BOTTOM.map((i) => link(i.id, i.label, i.icon))}
    </SideNav>
  );
}

const pageStyle: CSSProperties = {
  display: 'grid',
  gap: 24,
  alignContent: 'start',
  paddingBlockEnd: 32,
};
// In line with the page header's title.
const bodyStyle: CSSProperties = {
  display: 'grid',
  gap: 16,
  paddingInline: 16,
};
const tiles: CSSProperties = {
  display: 'grid',
  gap: 16,
  gridTemplateColumns: 'repeat(auto-fit, minmax(11rem, 1fr))',
};
const tileLabel: CSSProperties = {
  margin: 0,
  color: 'var(--cds-text-secondary)',
};
const tileValue: CSSProperties = {
  margin: '8px 0 0',
  fontSize: 32,
  lineHeight: 1,
};

function ProjectsTable({
  projects,
  onOpen,
}: {
  projects: Project[];
  onOpen: (p: Project, from: HTMLElement) => void;
}) {
  const rows: DataTableRevealRow[] = projects.map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    owner: p.owner,
    responses: p.responses,
    cells: [
      <Link
        key="name"
        href={`#${p.id}`}
        onClick={(e: MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();
          onOpen(p, e.currentTarget);
        }}>
        {p.name}
      </Link>,
      <Tag key="status" type={STATUS_TAG[p.status]}>
        {p.status}
      </Tag>,
      p.owner,
      String(p.responses),
    ],
  }));
  return (
    <DataTableReveal
      aria-label="Projects"
      loading={false}
      columns={COLUMNS}
      rows={rows}
      rowCount={projects.length}
      isSortable
    />
  );
}

function HarborPage({
  page,
  onOpen,
}: {
  page: PageId;
  onOpen: (p: Project, from: HTMLElement) => void;
}) {
  if (page === 'overview') {
    const collecting = PROJECTS.filter((p) => p.status === 'Collecting');
    const responses = PROJECTS.reduce((n, p) => n + p.responses, 0);
    return (
      <div style={pageStyle}>
        <PageHeader
          frame="ghost"
          title="Overview"
          subtitle="Your research this week."
        />
        <div style={bodyStyle}>
          <div style={tiles}>
            {[
              ['Projects collecting', String(collecting.length)],
              ['Responses', String(responses)],
              ['Response rate', '64%'],
            ].map(([label, value]) => (
              <Region key={label} surface="raised" padding="default">
                <p style={tileLabel}>{label}</p>
                <p style={tileValue}>{value}</p>
              </Region>
            ))}
          </div>
          <ProjectsTable projects={PROJECTS.slice(0, 4)} onOpen={onOpen} />
          <Region
            surface="quiet"
            padding="default"
            scroll="self"
            aria-label="Activity"
            style={{ maxBlockSize: 200 }}>
            <p style={{ ...tileLabel, marginBlockEnd: 8 }}>Activity</p>
            {ACTIVITY.map((e) => (
              <p key={e} style={{ ...note, marginBlockEnd: 8 }}>
                {e}
              </p>
            ))}
          </Region>
        </div>
      </div>
    );
  }
  if (page === 'projects') {
    return (
      <div style={pageStyle}>
        <PageHeader
          frame="ghost"
          title="Projects"
          subtitle="Every study, newest first."
          pageActions={[{ key: 'new', label: 'New project', renderIcon: Add }]}
        />
        <div style={bodyStyle}>
          <ProjectsTable projects={PROJECTS} onOpen={onOpen} />
        </div>
      </div>
    );
  }
  return (
    <div style={pageStyle}>
      <PageHeader frame="ghost" title={TITLE[page]} />
      <div style={bodyStyle}>
        <EmptyState
          kind="no-data"
          title={`No ${TITLE[page].toLowerCase()} yet`}
          subtitle="They show here once a project has responses."
        />
      </div>
    </div>
  );
}

/** A project's details, for the shell's panel. */
function ProjectDetails({ project }: { project: Project }) {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <Tag type={STATUS_TAG[project.status]}>{project.status}</Tag>
      </div>
      <DescriptionList aria-label="Project details" layout="stacked">
        <DescriptionListItem term="Owner">{project.owner}</DescriptionListItem>
        <DescriptionListItem term="Responses">
          {String(project.responses)}
        </DescriptionListItem>
        <DescriptionListItem term="Updated">
          {project.updated}
        </DescriptionListItem>
      </DescriptionList>
    </div>
  );
}

/**
 * The whole app in a shell: the page the nav selects, and a project's
 * details in the shell's panel. `shell` sets the shell's own props.
 */
function HarborApp({
  shell,
  header,
  start = 'overview',
}: {
  shell?: Partial<AppShellProps>;
  header?: ReactNode;
  start?: PageId;
}) {
  const [page, setPage] = useState<PageId>(start);
  const [open, setOpen] = useState<Project | null>(null);
  const from = useRef<HTMLElement | null>(null);
  return (
    <AppShell
      scope="container"
      {...shell}
      header={header ?? <HarborHeader />}
      nav={(n: AppShellNavRenderProps) => (
        <HarborNav
          shell={n}
          current={page}
          go={(p) => {
            setPage(p);
            setOpen(null);
          }}
        />
      )}
      panel={
        <SidePanel
          open={open !== null}
          size="sm"
          title={open?.name ?? ''}
          subtitle="Project"
          launcherButtonRef={from}
          onRequestClose={() => setOpen(null)}>
          {open && <ProjectDetails project={open} />}
        </SidePanel>
      }>
      <HarborPage
        page={page}
        onOpen={(p, el) => {
          from.current = el;
          setOpen(p);
        }}
      />
    </AppShell>
  );
}

/* ── the stories' own frame ───────────────────────────────────────────── */

/** The story's height, its controls on top and the shell filling the rest. */
const screen: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  blockSize: '100vh',
};
const bar: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 16,
  alignItems: 'center',
  padding: 16,
};
const note: CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: 'var(--cds-text-secondary)',
};

/** A frame of a set width, as tall as the story: the shell fills it and reads its class from its width. */
function Frame({ width, children }: { width?: number; children: ReactNode }) {
  return (
    <div style={{ flex: '1 1 0', minBlockSize: 0, overflowX: 'auto' }}>
      <div
        style={{
          position: 'relative',
          boxSizing: 'border-box',
          blockSize: '100%',
          inlineSize: width,
          maxInlineSize: width ? undefined : '100%',
          borderBlockStart: width
            ? '1px solid var(--cds-border-subtle-01)'
            : undefined,
          borderInlineEnd: width
            ? '1px solid var(--cds-border-subtle-01)'
            : undefined,
        }}>
        {children}
      </div>
    </div>
  );
}

/** Picks one size class: the frame takes a width inside it. */
function ClassSwitcher({
  value,
  onChange,
}: {
  value: SizeClass;
  onChange: (c: SizeClass) => void;
}) {
  return (
    <ContentSwitcher
      aria-label="Size class"
      size="sm"
      selectedIndex={SIZE_CLASSES.indexOf(value)}
      onChange={({ index }) => onChange(SIZE_CLASSES[index ?? 0])}>
      {SIZE_CLASSES.map((c) => (
        <Switch
          key={c}
          name={c}
          text={`${CLASS_NAME[c]}, ${CLASS_WIDTH[c]}px`}
        />
      ))}
    </ContentSwitcher>
  );
}

/** The class the shell is in now, read from the shell. */
const NAV_READS: Record<string, string> = {
  panel: 'the nav sits beside the page',
  rail: 'the nav is a rail of icons',
  overlay: 'the nav opens over the page',
};
const PANEL_READS: Record<string, string> = {
  push: 'a side panel pushes the page aside',
  over: 'a side panel opens over the page',
  sheet: 'a side panel rises as a sheet',
};

function ShellClass() {
  const shell = useAppShell();
  return shell ? (
    <span>
      {CLASS_NAME[shell.sizeClass]}:{' '}
      {NAV_READS[shell.navMode] ?? `the nav is ${shell.navMode}`}, and{' '}
      {PANEL_READS[shell.panelMode] ?? `the panel is ${shell.panelMode}`}.
    </span>
  ) : null;
}

/* ── stories ──────────────────────────────────────────────────────────── */

/* ── the demo: every part of the shell in one app ─────────────────────── */

type Width = 'fill' | SizeClass;
type HeaderLook = 'flush' | 'flush-light' | 'ghost';

interface View {
  width: Width;
  frame: 'inset' | 'flush';
  header: 'bar' | 'nav';
  look: HeaderLook;
  chrome: 'dark' | 'page';
  theme: MainTheme;
  foldTo: FoldTo;
}

const START_VIEW: View = {
  width: 'fill',
  frame: 'inset',
  header: 'bar',
  look: 'ghost',
  chrome: 'dark',
  theme: 'page',
  foldTo: 'rail',
};

/** The View menu's choices: each a key of View and its options in words. */
const VIEW_CHOICES: {
  key: keyof View;
  label: string;
  options: [string, string][];
}[] = [
  {
    key: 'width',
    label: 'Width',
    options: [
      ['fill', 'Fill'],
      ['large', 'Large'],
      ['expanded', 'Expanded'],
      ['medium', 'Medium'],
      ['compact', 'Compact'],
    ],
  },
  {
    key: 'frame',
    label: 'Workspace',
    options: [
      ['inset', 'Inset'],
      ['flush', 'Flush'],
    ],
  },
  {
    key: 'chrome',
    label: 'Header and nav theme',
    options: [
      ['dark', 'Dark'],
      ['page', 'Page'],
    ],
  },
  {
    key: 'theme',
    label: 'Workspace theme',
    options: [
      ['page', 'Page'],
      ['light', 'Light'],
      ['dark', 'Dark'],
      ['inverse', 'Inverse'],
    ],
  },
  {
    key: 'header',
    label: 'Header',
    options: [
      ['bar', 'Across the top'],
      ['nav', 'In the nav'],
    ],
  },
  {
    key: 'look',
    label: 'Header frame',
    options: [
      ['ghost', 'Ghost'],
      ['flush', 'Dark bar'],
      ['flush-light', 'Light bar'],
    ],
  },
  {
    key: 'foldTo',
    label: 'The nav folds to',
    options: [
      ['rail', 'A rail'],
      ['overlay', 'An overlay'],
      ['hide', 'Hidden'],
    ],
  },
];

const viewMenu: CSSProperties = {
  display: 'grid',
  gap: 16,
  boxSizing: 'border-box',
  padding: 16,
  inlineSize: 400,
};
const choiceLabel: CSSProperties = { ...note, fontSize: 12, marginBlockEnd: 8 };

/** View, in the header: how the shell is set up, and what it reads. */
function ViewMenu({
  view,
  onView,
  open,
  setOpen,
  opened,
  setOpened,
}: {
  view: View;
  onView: (next: Partial<View>) => void;
  /** Kept by the story: a change of the header's place mounts the menu again. */
  open: boolean;
  /** Each open mounts the switchers again (they measure their selected face as they mount). */
  opened: number;
  setOpened: (f: (n: number) => number) => void;
  setOpen: (open: boolean | ((o: boolean) => boolean)) => void;
}) {
  return (
    <Popover
      open={open}
      align="bottom-end"
      autoAlign
      variant="outlined"
      onRequestClose={() => setOpen(false)}>
      <IconButton
        frame="ghost"
        size="lg"
        corners="full"
        align="bottom-end"
        label="View"
        aria-expanded={open}
        onClick={() => {
          if (!open) {
            setOpened((n) => n + 1);
          }
          setOpen((o) => !o);
        }}>
        <SettingsAdjust size={20} />
      </IconButton>
      <PopoverContent>
        <div key={opened} style={viewMenu} role="group" aria-label="View">
          {VIEW_CHOICES.map((c) => (
            <div key={c.key}>
              <p style={choiceLabel} id={`harbor-view-${c.key}`}>
                {c.label}
              </p>
              <ContentSwitcher
                aria-labelledby={`harbor-view-${c.key}`}
                size="sm"
                selectedIndex={Math.max(
                  0,
                  c.options.findIndex(([v]) => v === view[c.key])
                )}
                onChange={({ index }) =>
                  onView({ [c.key]: c.options[index ?? 0][0] } as Partial<View>)
                }>
                {c.options.map(([value, text]) => (
                  <Switch key={value} name={value} text={text} />
                ))}
              </ContentSwitcher>
            </div>
          ))}
          <p style={{ ...note, margin: 0 }}>
            <ShellClass />
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * The whole shell in one app. Use the nav, open a project for its side
 * panel, and fold the nav from the foot of its column. View, in the header,
 * changes the rest: the app's width (each size class), the workspace's frame
 * and theme, where the header sits and how it looks, and what the nav folds
 * to. Open it full screen and resize the window to see the classes change
 * on their own.
 */
export const TryIt = {
  name: 'Try it',
  render: function TryItStory() {
    const [view, setView] = useState<View>(START_VIEW);
    const [menuOpen, setMenuOpen] = useState(false);
    const [opened, setOpened] = useState(0);
    const width = view.width === 'fill' ? undefined : CLASS_WIDTH[view.width];
    const header = (
      <HarborHeader
        frame={view.look === 'ghost' ? undefined : 'flush'}
        theme={view.look === 'flush-light' ? 'light' : undefined}
        before={
          <ViewMenu
            view={view}
            onView={(next) => setView((v) => ({ ...v, ...next }))}
            open={menuOpen}
            setOpen={setMenuOpen}
            opened={opened}
            setOpened={setOpened}
          />
        }
      />
    );
    return (
      <div style={screen}>
        <Frame width={width}>
          <HarborApp
            header={header}
            shell={{
              frame: view.frame,
              headerPlacement: view.header,
              chromeTheme: view.chrome,
              mainTheme: view.theme,
              foldTo: view.foldTo,
            }}
          />
        </Frame>
      </div>
    );
  },
};

/**
 * A product in the shell, at the size of its frame. Choose pages in the nav
 * and open a project for its details. Open it full screen and resize the
 * window: the nav folds to a rail at medium and becomes an overlay at
 * compact.
 */
export const Default = {
  args: {
    scope: 'container',
    frame: 'flush',
    headerPlacement: 'bar',
    mainTheme: 'page',
    chromeTheme: 'dark',
    foldTo: 'rail',
    navLabel: 'Navigation',
    windowScroller: true,
    timeScale: 1,
  },
  render: (args: AppShellProps) => (
    <div style={screen}>
      <HarborApp shell={args} />
    </div>
  ),
};

/**
 * The inset workspace: the page on a rounded surface, the header at the top
 * of the nav column and its actions at the column's foot.
 */
export const Workspace = {
  render: () => (
    <div style={screen}>
      <HarborApp shell={{ frame: 'inset', headerPlacement: 'nav' }} />
    </div>
  ),
};

/** The inset workspace in the opposite theme to the frame round it. */
export const InverseWorkspace = {
  name: 'Inverse workspace',
  render: () => (
    <div style={screen}>
      <HarborApp
        shell={{ frame: 'inset', headerPlacement: 'nav', mainTheme: 'inverse' }}
      />
    </div>
  ),
};

/**
 * The panel in each size class. Open a project, then change the class: the
 * same panel moves to its new place at once.
 */
export const Panel = {
  render: function PanelStory() {
    const [size, setSize] = useState<SizeClass>('expanded');
    return (
      <div style={screen}>
        <div style={bar}>
          <ClassSwitcher value={size} onChange={setSize} />
        </div>
        <Frame width={CLASS_WIDTH[size]}>
          <HarborApp start="projects" />
        </Frame>
      </div>
    );
  },
};

/** The same app in all four size classes, side by side. */
export const SizeClasses = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, padding: 16 }}>
      {SIZE_CLASSES.map((c) => (
        <div key={c} style={{ display: 'grid', gap: 8 }}>
          <p style={{ ...note, color: 'var(--cds-text-primary)' }}>
            {CLASS_NAME[c]}, {CLASS_WIDTH[c]}px
          </p>
          <div
            style={{
              position: 'relative',
              blockSize: 420,
              inlineSize: CLASS_WIDTH[c],
              border: '1px solid var(--cds-border-subtle-01)',
            }}>
            <HarborApp />
          </div>
        </div>
      ))}
    </div>
  ),
};

/**
 * Compact: the menu button opens the nav over the page. Escape, the dim or
 * a link closes it.
 */
export const OverlayNav = {
  name: 'Overlay nav',
  render: () => (
    <div style={screen}>
      <Frame width={400}>
        <HarborApp />
      </Frame>
    </div>
  ),
};

/** The fold toggle at the column's foot: to a rail, away to the overlay, or hidden to a strip. */
export const Fold = {
  render: function FoldStory() {
    const [foldTo, setFoldTo] = useState<FoldTo>('rail');
    return (
      <div style={screen}>
        <div style={bar}>
          <ContentSwitcher
            aria-label="Fold to"
            size="sm"
            selectedIndex={FOLDS.indexOf(foldTo)}
            onChange={({ index }) => setFoldTo(FOLDS[index ?? 0])}>
            <Switch name="rail" text="To a rail" />
            <Switch name="overlay" text="Away" />
            <Switch name="hide" text="To a strip" />
          </ContentSwitcher>
        </div>
        <Frame width={CLASS_WIDTH.expanded}>
          <HarborApp
            key={foldTo}
            shell={{
              foldTo,
              navStrip: ({ unfold }) => (
                <IconButton
                  frame="ghost"
                  size="lg"
                  corners="full"
                  align="right"
                  label="Show the nav"
                  onClick={unfold}>
                  <Dashboard size={20} />
                </IconButton>
              ),
            }}
          />
        </Frame>
      </div>
    );
  },
};

/** The size class the shell reads, and what it sets from it. */
export const SizeClassReadout = {
  name: 'What the shell reads',
  render: function ReadoutStory() {
    const [size, setSize] = useState<SizeClass>('medium');
    return (
      <div style={screen}>
        <div style={bar}>
          <ClassSwitcher value={size} onChange={setSize} />
        </div>
        <Frame width={CLASS_WIDTH[size]}>
          <AppShell
            scope="container"
            header={<HarborHeader />}
            nav={(n: AppShellNavRenderProps) => (
              <HarborNav shell={n} current="overview" go={() => {}} />
            )}>
            <div style={{ ...pageStyle, padding: 16 }}>
              <p style={{ ...note, color: 'var(--cds-text-primary)' }}>
                <ShellClass />
              </p>
            </div>
          </AppShell>
        </Frame>
      </div>
    );
  },
};

const headerFrames: { frame: HeaderFrame; theme?: 'light' | 'dark' }[] = [
  { frame: 'flush' },
  { frame: 'flush', theme: 'light' },
  { frame: 'ghost' },
];
const FRAME_NOTE: Record<string, string> = {
  flush: 'Flush: a bar, dark in every theme',
  'flush-light': 'Flush, light',
  ghost: 'Ghost: no bar, in the page’s theme',
};

/** The header alone, in each frame. */
export const HeaderFrames = {
  name: 'Header frames',
  render: () => (
    <div style={{ display: 'grid', gap: 24, padding: 16 }}>
      {headerFrames.map(({ frame, theme }) => {
        const key = theme ? `${frame}-${theme}` : frame;
        return (
          <div key={key} style={{ display: 'grid', gap: 8 }}>
            <p style={note}>{FRAME_NOTE[key]}</p>
            <Header
              aria-label={`Harbor Insights, ${key}`}
              name="Harbor"
              product="Insights"
              logo={<Logo />}
              href="#"
              frame={frame}
              theme={theme}
              actions={<HeaderActions />}
            />
          </div>
        );
      })}
    </div>
  ),
};

const ACTIVITY = [
  'Avery Lane closed the Annual customer panel.',
  'Checkout survey passed 120 responses.',
  'Jordan Pike shared Onboarding interviews.',
  'Riley Shore started the Pricing page test.',
  'Sam Ortiz drafted the Mobile navigation study.',
  'Support satisfaction moved to Analyzing.',
  'Checkout survey passed 100 responses.',
  'Avery Lane invited two people.',
];

/** Region: one area of a screen, on the page, quiet or raised, and one that scrolls on its own. */
export const Regions = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
        gridAutoRows: 200,
        padding: 16,
      }}>
      {SURFACES.map((s) => (
        <Region key={s} surface={s} padding="default">
          <p style={{ ...tileLabel, color: 'var(--cds-text-primary)' }}>
            {s[0].toUpperCase() + s.slice(1)}
          </p>
          <p style={note}>Its corners and hairline come from its surface.</p>
        </Region>
      ))}
      <Region
        surface="quiet"
        padding="default"
        scroll="self"
        aria-label="Activity">
        {ACTIVITY.map((e) => (
          <p key={e} style={{ ...note, marginBlockEnd: 8 }}>
            {e}
          </p>
        ))}
      </Region>
    </div>
  ),
};
