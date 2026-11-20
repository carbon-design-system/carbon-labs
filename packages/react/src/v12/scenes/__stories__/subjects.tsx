/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The components a scene puts in its host. Each renders from the scene's
// state, so the behavior tier changes it through `window.__scene`; a subject
// a person drives (a tooltip's hover, a table's rows) is driven by its
// controls instead.

import React, { Fragment, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { Accordion, AccordionItem } from '@carbon-labs/react-accordion';
import { Button } from '@carbon-labs/react-button';
import { ContextualBar } from '@carbon-labs/react-contextual-bar';
import type { ContextualBarPlacement } from '@carbon-labs/react-contextual-bar';
import {
  DataTable,
  Table,
  TableBatchAction,
  TableBatchActions,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  TableHead,
  TableHeader,
  TableRow,
  TableSelectAll,
  TableSelectRow,
  TableToolbar,
} from '@carbon-labs/react-data-table';
import type {
  DataTableRenderProps,
  DataTableRow,
} from '@carbon-labs/react-data-table';
import { Menu, MenuItem, MenuItemDivider } from '@carbon-labs/react-menu';
import { Modal } from '@carbon-labs/react-modal';
import {
  Copy,
  Download,
  Edit,
  Share,
  TrashCan,
} from '@carbon-labs/react-motion-icons';
import { ToastStack, useToasts } from '@carbon-labs/react-notification';
import { Popover, PopoverContent } from '@carbon-labs/react-popover';
import { SidePanel } from '@carbon-labs/react-side-panel';
import type {
  SidePanelFrame,
  SidePanelPlacement,
  SidePanelSize,
} from '@carbon-labs/react-side-panel';
import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@carbon-labs/react-tabs';
import { Tearsheet } from '@carbon-labs/react-tearsheet';
import { Toggle } from '@carbon-labs/react-toggle';
import { IconButton } from '@carbon-labs/react-tooltip';
import type { SceneState } from './scene';

/** The components a scene can hold. */
export const SUBJECTS = [
  'contextual-bar',
  'side-panel',
  'modal',
  'tearsheet',
  'popover',
  'menu',
  'tooltip',
  'accordion',
  'tabs',
  'toasts',
  'data-table',
  'toggle',
] as const;
export type Subject = (typeof SUBJECTS)[number];

/** A scene's arguments: the subject, and what it takes. */
export interface SceneArgs {
  subject: Subject;
  /** The subject's `frame` (a side panel's), when it has one. */
  frame: string;
  /** The subject's first size (a side panel's). */
  size: string;
  /** The subject's placement: a side panel's edge, a contextual bar's placement, a popover's alignment. */
  placement: string;
  /** Where the subject's trigger sits on its row: `start` or `end`. */
  at: 'start' | 'end';
  /** A table's kind: `select` (its contextual bar) or `expand` (expandable rows). */
  variant: string;
  /** Open from the first frame. */
  open: boolean;
}

/** What a subject gives its host: what goes first in the page, and a panel for a shell. */
export interface SubjectParts {
  lead: ReactNode;
  panel?: React.ReactElement;
  /** Wraps the whole host (a toast stack). */
  wrap?: (children: ReactNode) => ReactNode;
  /** The page's content follows the lead. False for a subject that is the page. */
  content: boolean;
}

const row: CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  minBlockSize: 48,
};
const end: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginInlineStart: 'auto',
};
const text: CSSProperties = { margin: 0, maxInlineSize: '40rem' };

/** A row whose one control sits at its start or its end. */
function Edge({ at, children }: { at: 'start' | 'end'; children: ReactNode }) {
  return (
    <div
      style={{ ...row, justifyContent: at === 'end' ? 'flex-end' : 'start' }}>
      {children}
    </div>
  );
}

/** Fields for a panel's or a dialog's body. */
function Body({ children }: { children?: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <p style={text}>
        The page stays where it was while this is open. Its fields keep their
        values.
      </p>
      {children}
    </div>
  );
}

/** A popover held open by the scene, its trigger at the row's start or end. */
function ScenePopover({ state, args }: { state: SceneState; args: SceneArgs }) {
  return (
    <Edge at={args.at}>
      <Popover
        open={state.open}
        align={(args.placement || 'bottom') as 'bottom'}
        autoAlign>
        <Button size="sm" variant="outlined" data-scene-trigger="">
          Filters
        </Button>
        <PopoverContent>
          <span style={{ display: 'block', padding: 16, maxInlineSize: 240 }}>
            Show items updated in the last 30 days, from every team.
          </span>
        </PopoverContent>
      </Popover>
    </Edge>
  );
}

/** A menu held open by the scene, anchored to its button. */
function SceneMenu({
  state,
  set,
  args,
}: {
  state: SceneState;
  set: (patch: Partial<SceneState>) => void;
  args: SceneArgs;
}) {
  const [button, setButton] = useState<HTMLElement | null>(null);
  return (
    <Edge at={args.at}>
      <Button
        ref={setButton}
        size="sm"
        variant="outlined"
        aria-haspopup="menu"
        aria-expanded={state.open}
        data-scene-trigger=""
        onClick={() => set({ open: !state.open })}>
        Edit
      </Button>
      <Menu
        label="Edit"
        open={state.open}
        anchor={button}
        onClose={() => set({ open: false })}>
        <MenuItem label="Cut" />
        <MenuItem label="Copy" />
        <MenuItem label="Paste" />
        <MenuItemDivider />
        <MenuItem label="Rename" />
        <MenuItem label="Download" />
      </Menu>
    </Edge>
  );
}

/** A row of icon buttons, each with its tooltip: a pointer run along them is warm after the first. */
function SceneTooltips() {
  const icons = [
    ['Copy', Copy],
    ['Edit', Edit],
    ['Share', Share],
    ['Download', Download],
    ['Delete', TrashCan],
  ] as const;
  return (
    <div style={row} data-scene-tooltips="">
      {icons.map(([label, Icon]) => (
        <IconButton key={label} label={label} frame="ghost">
          <Icon />
        </IconButton>
      ))}
    </div>
  );
}

const SECTIONS = ['Summary', 'Details', 'Members', 'History'];

/** An accordion further down the page, its second item the scene's. */
function SceneAccordion({
  state,
  set,
}: {
  state: SceneState;
  set: (patch: Partial<SceneState>) => void;
}) {
  return (
    <Accordion>
      {SECTIONS.map((title, i) => (
        <AccordionItem
          key={title}
          title={title}
          open={i === 1 ? state.open : false}
          onHeadingClick={
            i === 1 ? ({ isOpen }) => set({ open: isOpen }) : undefined
          }>
          <p style={text}>
            {title} for the project: what it holds, who works on it, and what
            changed last. Open another section to read on.
          </p>
          <p style={text}>
            Each section keeps its place while another opens or shuts.
          </p>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

const TABS = ['Overview', 'Activity', 'Settings', 'Members'];

/** Tabs whose selection is the scene's. */
function SceneTabs({
  state,
  set,
}: {
  state: SceneState;
  set: (patch: Partial<SceneState>) => void;
}) {
  return (
    <Tabs
      selectedIndex={state.index}
      onChange={({ selectedIndex }: { selectedIndex: number }) =>
        set({ index: selectedIndex })
      }>
      <TabList aria-label="Project">
        {TABS.map((t) => (
          <Tab key={t}>{t}</Tab>
        ))}
      </TabList>
      <TabPanels>
        {TABS.map((t) => (
          <TabPanel key={t}>
            <p style={text}>
              {t}: what this part of the project shows. Each tab keeps its own
              place.
            </p>
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
}

const KINDS = ['info', 'success', 'warning', 'error'] as const;
/** The stack at the view's end corner, where a page places it. */
const TOAST_PLACE =
  '.scene-toasts{position:fixed;inset-block-end:16px;inset-inline-end:16px;z-index:9000}';

/** Shows a toast each time the scene asks for one more. */
function ToastDriver({ count }: { count: number }) {
  const toasts = useToasts();
  const shown = useRef(0);
  useEffect(() => {
    while (shown.current < count) {
      const n = shown.current++;
      toasts.show({
        kind: KINDS[n % KINDS.length],
        title: `Update ${n + 1}`,
        subtitle: 'The list is up to date.',
        timeout: 0,
      });
    }
  }, [count, toasts]);
  return null;
}

const HEADERS = [
  { key: 'name', header: 'Name' },
  { key: 'region', header: 'Region' },
  { key: 'status', header: 'Status' },
];
const ROWS = ['checkout', 'catalog', 'search', 'billing', 'accounts'].map(
  (name, i) => ({
    id: `r${i}`,
    name,
    region: ['North', 'South', 'East', 'West'][i % 4],
    status: ['Active', 'Stopped', 'Pending'][i % 3],
  })
);
type Row = (typeof ROWS)[number];
type RenderProps = DataTableRenderProps<Row, ReactNode[]>;

/** A table with selectable rows and its batch actions bar, or with expandable rows. */
function SceneTable({ variant }: { variant: string }) {
  if (variant === 'expand') {
    return (
      <DataTable rows={ROWS} headers={HEADERS}>
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getExpandHeaderProps,
          getExpandedRowProps,
          getTableProps,
        }: RenderProps) => (
          <TableContainer title="Resources">
            <Table {...getTableProps()} aria-label="Resources">
              <TableHead>
                <TableRow>
                  <TableExpandHeader {...getExpandHeaderProps()} />
                  {headers.map((header) => {
                    const { key, ...props } = getHeaderProps({ header });
                    return (
                      <TableHeader key={key} {...props}>
                        {header.header}
                      </TableHeader>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r: DataTableRow<ReactNode[]>) => {
                  const { key, ...props } = getRowProps({ row: r });
                  return (
                    <Fragment key={key}>
                      <TableExpandRow {...props}>
                        {r.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableExpandRow>
                      <TableExpandedRow
                        colSpan={headers.length + 1}
                        {...getExpandedRowProps({ row: r })}>
                        <p style={text}>
                          {String(r.cells[0]?.value)} runs in one network and
                          one storage pool.
                        </p>
                      </TableExpandedRow>
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    );
  }
  return (
    <DataTable rows={ROWS} headers={HEADERS}>
      {({
        rows,
        headers,
        getHeaderProps,
        getRowProps,
        getSelectionProps,
        getToolbarProps,
        getBatchActionProps,
        getTableProps,
        getTableContainerProps,
      }: RenderProps) => (
        <TableContainer title="Resources" {...getTableContainerProps()}>
          <TableToolbar {...getToolbarProps()} aria-label="Resource actions">
            <TableBatchActions {...getBatchActionProps()}>
              <TableBatchAction renderIcon={Download}>
                Download
              </TableBatchAction>
              <TableBatchAction renderIcon={TrashCan}>Delete</TableBatchAction>
            </TableBatchActions>
          </TableToolbar>
          <Table {...getTableProps()} aria-label="Resources">
            <TableHead>
              <TableRow>
                <TableSelectAll {...getSelectionProps()} />
                {headers.map((header) => {
                  const { key, ...props } = getHeaderProps({ header });
                  return (
                    <TableHeader key={key} {...props}>
                      {header.header}
                    </TableHeader>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r: DataTableRow<ReactNode[]>) => {
                const { key, ...props } = getRowProps({ row: r });
                return (
                  <TableRow key={key} {...props}>
                    <TableSelectRow {...getSelectionProps({ row: r })} />
                    {r.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DataTable>
  );
}

/**
 * A subject's parts for its host.
 *
 * @param args The scene's arguments.
 * @param state The scene's state.
 * @param set Changes the state.
 * @param shell The host is an app shell (a side panel goes in its panel slot).
 * @returns What the host places.
 */
export function partsOf(
  args: SceneArgs,
  state: SceneState,
  set: (patch: Partial<SceneState>) => void,
  shell: boolean
): SubjectParts {
  const close = () => set({ open: false });
  switch (args.subject) {
    case 'contextual-bar':
      return {
        content: true,
        lead: (
          <ContextualBar
            label="Selection"
            placement={(args.placement || 'inline') as ContextualBarPlacement}
            open={state.open}>
            <span>3 items selected</span>
            <span style={end}>
              <Button size="sm" frame="none" onClick={close}>
                Clear
              </Button>
            </span>
          </ContextualBar>
        ),
      };
    case 'side-panel': {
      const panel = (
        <SidePanel
          open={state.open}
          title="Filter results"
          subtitle="Narrow the list to what you need."
          size={(state.size || 'md') as SidePanelSize}
          placement={(args.placement || 'end') as SidePanelPlacement}
          frame={(args.frame || undefined) as SidePanelFrame | undefined}
          onRequestClose={close}
          closeIconDescription="Close"
          actions={[
            { label: 'Reset', onClick: close },
            { label: 'Apply', onClick: close },
          ]}>
          <Body />
        </SidePanel>
      );
      return shell
        ? { content: true, lead: null, panel }
        : { content: true, lead: panel };
    }
    case 'modal':
      return {
        content: true,
        lead: (
          <Modal
            open={state.open}
            modalLabel="Account"
            modalHeading="Rename this workspace"
            primaryButtonText="Rename"
            secondaryButtonText="Cancel"
            onRequestClose={close}
            onRequestSubmit={close}>
            <Body />
          </Modal>
        ),
      };
    case 'tearsheet':
      return {
        content: true,
        lead: (
          <Tearsheet
            open={state.open}
            label="Projects"
            title="Create a project"
            description="Name the project and choose where its data is kept."
            closeIconDescription="Close"
            onClose={close}
            actions={[
              { label: 'Cancel', onClick: close },
              { label: 'Create', onClick: close },
            ]}>
            <Body />
          </Tearsheet>
        ),
      };
    case 'popover':
      return {
        content: true,
        lead: <ScenePopover state={state} args={args} />,
      };
    case 'menu':
      return {
        content: true,
        lead: <SceneMenu state={state} set={set} args={args} />,
      };
    case 'tooltip':
      return { content: true, lead: <SceneTooltips /> };
    case 'accordion':
      return {
        content: true,
        lead: <SceneAccordion state={state} set={set} />,
      };
    case 'tabs':
      return { content: true, lead: <SceneTabs state={state} set={set} /> };
    case 'toasts':
      return {
        content: true,
        lead: <ToastDriver count={state.toasts} />,
        wrap: (children) => (
          <ToastStack stackClassName="scene-toasts">
            <style>{TOAST_PLACE}</style>
            {children}
          </ToastStack>
        ),
      };
    case 'data-table':
      return { content: true, lead: <SceneTable variant={args.variant} /> };
    case 'toggle':
      return {
        content: true,
        lead: (
          <Toggle
            id="scene-toggle"
            labelText="Notifications"
            labelA="Off"
            labelB="On"
            toggled={state.open}
            onToggle={(on: boolean) => set({ open: on })}
          />
        ),
      };
    default:
      return { content: true, lead: null };
  }
}
