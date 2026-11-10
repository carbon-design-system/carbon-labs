/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState } from 'react';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { Button } from '@carbon-labs/react-button';
import { Select, SelectItem } from '@carbon-labs/react-select';
import { TextArea } from '@carbon-labs/react-text-area';
import { TextInput } from '@carbon-labs/react-text-input';
import { Download, Edit, Share } from '@carbon-labs/react-motion-icons';
import { Tearsheet, TearsheetNarrow } from '../index';
import type {
  TearsheetInfluencerPosition,
  TearsheetNarrowProps,
  TearsheetProps,
} from '../index';
import mdx from './Tearsheet.mdx';

const POSITIONS: TearsheetInfluencerPosition[] = ['start', 'end'];
const WIDTHS: NonNullable<TearsheetProps['influencerWidth']>[] = [
  'narrow',
  'wide',
];

export default {
  title: 'V12/Tearsheet',
  component: Tearsheet,
  subcomponents: {
    TearsheetNarrow:
      TearsheetNarrow as React.ComponentType<TearsheetNarrowProps>,
  },
  tags: ['alpha'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'snap-rise',
        'axial-timing',
        'collapse-exit',
        'content-arrival',
        'dim-and-blur',
        'page-recede',
        'stack-depth',
        'tooltip-hold',
      ],
      reduced: {
        'snap-rise': 'shorter-clock',
        'collapse-exit': 'shorter-clock',
        'content-arrival': 'at-once',
        'dim-and-blur': 'shorter-clock',
        'page-recede': 'at-once',
      },
      states: ['closed', 'open', 'stacked'],
    },
  },
  argTypes: {
    influencerPosition: { control: 'inline-radio', options: POSITIONS },
    influencerWidth: { control: 'inline-radio', options: WIDTHS },
    verticalPosition: { control: 'inline-radio', options: ['normal', 'lower'] },
    backdrop: { control: 'object' },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    open: { control: false },
    children: { control: false },
    actions: { control: false },
    headerActions: { control: false },
    influencer: { control: false },
    navigation: { control: false },
    launcherButtonRef: { control: false },
    portalTarget: { control: false },
    selectorPrimaryFocus: { control: false },
    selectorsFloatingMenus: { control: false },
    decorator: { control: false },
    slug: { control: false },
  },
};

/** The page behind the sheet: it draws back and blurs while a sheet is open. */
const page = {
  display: 'grid',
  gap: 16,
  alignContent: 'start',
  justifyItems: 'start',
  padding: 32,
  minBlockSize: 480,
};

const row = { display: 'flex', gap: 16, flexWrap: 'wrap' as const };
const text = { margin: 0, maxInlineSize: '40rem' };
const fields = { display: 'grid', gap: 16, maxInlineSize: '32rem' };

function PageText() {
  return (
    <p style={text}>
      The page stays where it is. A sheet rises over it, and it comes back as
      the sheet leaves.
    </p>
  );
}

/** A few form fields for the sheet's main area. */
function Fields({ id }: { id: string }) {
  return (
    <div style={fields}>
      <TextInput id={`${id}-name`} labelText="Name" defaultValue="Northwind" />
      <Select id={`${id}-region`} labelText="Region" defaultValue="east">
        <SelectItem value="east" text="East" />
        <SelectItem value="west" text="West" />
        <SelectItem value="central" text="Central" />
      </Select>
      <TextArea id={`${id}-notes`} labelText="Notes" rows={4} defaultValue="" />
    </div>
  );
}

const SECTIONS = ['General', 'Members', 'Access', 'Billing', 'Review'];

/** A list for the influencer column. */
function Sections() {
  return (
    <ul style={{ margin: 0, paddingInlineStart: 20, display: 'grid', gap: 8 }}>
      {SECTIONS.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ul>
  );
}

/** Press the button to open the sheet; it rises from the bottom edge. Escape, Cancel or Create closes it. */
export const Default = {
  args: {
    label: 'Projects',
    title: 'Create a project',
    description: 'Name the project and choose where its data is kept.',
    verticalPosition: 'normal',
    closeIconDescription: 'Close',
    warm: true,
    timeScale: 1,
  },
  render: function DefaultStory(args: TearsheetProps) {
    const [open, setOpen] = useState(false);
    const launcher = useRef<HTMLElement>(null);
    const close = () => setOpen(false);
    return (
      <div style={page}>
        <Button
          size="sm"
          variant="outlined"
          ref={launcher}
          onClick={() => setOpen(true)}>
          Open tearsheet
        </Button>
        <PageText />
        <Tearsheet
          {...args}
          open={open}
          launcherButtonRef={launcher}
          onClose={close}
          actions={[
            { label: 'Cancel', onClick: close },
            { label: 'Create', onClick: close },
          ]}>
          <Fields id="tearsheet-story-default" />
        </Tearsheet>
      </div>
    );
  },
};

/** `influencer`: a column beside the main area, at the start or the end, narrow or wide. It scrolls on its own. */
export const WithInfluencer = {
  render: function WithInfluencerStory() {
    const [open, setOpen] = useState(false);
    const [position, setPosition] =
      useState<TearsheetInfluencerPosition>('start');
    const [width, setWidth] = useState<'narrow' | 'wide'>('narrow');
    const close = () => setOpen(false);
    return (
      <div style={page}>
        <div style={row}>
          {POSITIONS.flatMap((p) =>
            WIDTHS.map((w) => (
              <Button
                size="sm"
                variant="outlined"
                key={`${p}-${w}`}
                onClick={() => {
                  setPosition(p);
                  setWidth(w);
                  setOpen(true);
                }}>
                Influencer at the {p}, {w}
              </Button>
            ))
          )}
        </div>
        <PageText />
        <Tearsheet
          open={open}
          title="Project settings"
          description={`The influencer sits at the ${position}.`}
          influencer={<Sections />}
          influencerPosition={position}
          influencerWidth={width}
          onClose={close}
          actions={[
            { label: 'Cancel', onClick: close },
            { label: 'Save', onClick: close },
          ]}>
          <Fields id="tearsheet-story-influencer" />
        </Tearsheet>
      </div>
    );
  },
};

/** `headerActions` beside the title. Their tooltips wait until the sheet and its content have landed. */
export const HeaderActions = {
  render: function HeaderActionsStory() {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);
    return (
      <div style={page}>
        <Button size="sm" variant="outlined" onClick={() => setOpen(true)}>
          Open with header actions
        </Button>
        <PageText />
        <Tearsheet
          open={open}
          label="Report"
          title="Quarterly summary"
          headerActions={
            <div style={{ display: 'flex', gap: 4 }}>
              <Button
                frame="ghost"
                hasIconOnly
                renderIcon={Edit}
                iconDescription="Edit"
              />
              <Button
                frame="ghost"
                hasIconOnly
                renderIcon={Share}
                iconDescription="Share"
              />
              <Button
                frame="ghost"
                hasIconOnly
                renderIcon={Download}
                iconDescription="Download"
              />
            </div>
          }
          hasCloseIcon
          onClose={close}
          actions={[{ label: 'Done', onClick: close }]}>
          <p style={text}>
            The summary collects the figures from every team. Hover an icon in
            the header to see its name.
          </p>
        </Tearsheet>
      </div>
    );
  },
};

/** No actions: a passive sheet. It has a close button, and a press outside closes it. */
export const Passive = {
  render: function PassiveStory() {
    const [open, setOpen] = useState(false);
    return (
      <div style={page}>
        <Button size="sm" variant="outlined" onClick={() => setOpen(true)}>
          Open passive tearsheet
        </Button>
        <PageText />
        <Tearsheet
          open={open}
          title="What changed"
          description="Read only."
          onClose={() => setOpen(false)}>
          <p style={text}>
            Three settings changed since the last visit. Nothing needs your
            attention.
          </p>
        </Tearsheet>
      </div>
    );
  },
};

/** A narrow sheet over another: the one below recedes, lifts, rounds its bottom corners and dims. Escape closes the top one only. */
export const Stacked = {
  render: function StackedStory() {
    const [first, setFirst] = useState(false);
    const [second, setSecond] = useState(false);
    const inner = useRef<HTMLElement>(null);
    const closeFirst = () => setFirst(false);
    const closeSecond = () => setSecond(false);
    return (
      <div style={page}>
        <Button size="sm" variant="outlined" onClick={() => setFirst(true)}>
          Open tearsheet
        </Button>
        <PageText />
        <Tearsheet
          open={first}
          title="Team"
          description="Everyone with access to the project."
          onClose={closeFirst}
          actions={[
            { label: 'Cancel', onClick: closeFirst },
            { label: 'Save', onClick: closeFirst },
          ]}>
          <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
            <p style={text}>Four members can edit this project.</p>
            <Button
              size="sm"
              variant="outlined"
              ref={inner}
              onClick={() => setSecond(true)}>
              Add a member
            </Button>
          </div>
        </Tearsheet>
        <TearsheetNarrow
          open={second}
          title="Add a member"
          launcherButtonRef={inner}
          onClose={closeSecond}
          actions={[
            { label: 'Cancel', onClick: closeSecond },
            { label: 'Add', onClick: closeSecond },
          ]}>
          <div style={fields}>
            <TextInput
              id="tearsheet-story-stack-email"
              labelText="Email"
              type="email"
              defaultValue="member@example.com"
            />
          </div>
        </TearsheetNarrow>
      </div>
    );
  },
};

/** TearsheetNarrow: a header and a main area, centred. It has no influencer, navigation or header actions. */
export const Narrow = {
  render: function NarrowStory() {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);
    return (
      <div style={page}>
        <Button size="sm" variant="outlined" onClick={() => setOpen(true)}>
          Open narrow tearsheet
        </Button>
        <PageText />
        <TearsheetNarrow
          open={open}
          label="Projects"
          title="Rename the project"
          onClose={close}
          actions={[
            { label: 'Cancel', onClick: close },
            { label: 'Rename', onClick: close },
          ]}>
          <TextInput
            id="tearsheet-story-narrow-name"
            labelText="Name"
            defaultValue="Northwind"
          />
        </TearsheetNarrow>
      </div>
    );
  },
};

/** `verticalPosition="lower"` starts the sheet further down the page. */
export const Lower = {
  render: function LowerStory() {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);
    return (
      <div style={page}>
        <Button size="sm" variant="outlined" onClick={() => setOpen(true)}>
          Open lower tearsheet
        </Button>
        <PageText />
        <Tearsheet
          open={open}
          verticalPosition="lower"
          title="Import data"
          onClose={close}
          actions={[
            { label: 'Cancel', onClick: close },
            { label: 'Import', onClick: close },
          ]}>
          <Fields id="tearsheet-story-lower" />
        </Tearsheet>
      </div>
    );
  },
};

const ENTRIES = Array.from(
  { length: 18 },
  (_, i) =>
    `Entry ${i + 1}. A setting changed on the project. The new value applies to every member, and the old one is kept in the history.`
);

/** A long main area scrolls inside the sheet, the header and the actions in place. */
export const LongContent = {
  render: function LongContentStory() {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);
    return (
      <div style={page}>
        <Button size="sm" variant="outlined" onClick={() => setOpen(true)}>
          Open activity
        </Button>
        <PageText />
        <Tearsheet
          open={open}
          title="Activity"
          description="Everything that changed in this project."
          influencer={<Sections />}
          onClose={close}
          actions={[{ label: 'Close', onClick: close }]}>
          <div style={{ display: 'grid', gap: 16 }}>
            {ENTRIES.map((e) => (
              <p key={e} style={text}>
                {e}
              </p>
            ))}
          </div>
        </Tearsheet>
      </div>
    );
  },
};

const BACKDROPS: { name: string; backdrop: TearsheetProps['backdrop'] }[] = [
  { name: 'Scale and blur', backdrop: { scale: true, blur: 'even' } },
  { name: 'Blur only', backdrop: { scale: false } },
  { name: 'Scale only', backdrop: { blur: false } },
  { name: 'Dim only', backdrop: false },
];

/** `backdrop`: by default the page draws back and blurs under the dim; either can be left out. */
export const Backdrop = {
  render: function BackdropStory() {
    const [open, setOpen] = useState(false);
    const [choice, setChoice] = useState(0);
    return (
      <div style={page}>
        <div style={row}>
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
        </div>
        <PageText />
        <Tearsheet
          open={open}
          backdrop={BACKDROPS[choice].backdrop}
          title={BACKDROPS[choice].name}
          onClose={() => setOpen(false)}>
          <p style={text}>Look at the page behind the sheet.</p>
        </Tearsheet>
      </div>
    );
  },
};
