/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Select, SelectItem } from '@carbon-labs/react-select';
import { TextInput } from '@carbon-labs/react-text-input';
import { Button } from '@carbon-labs/react-button';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import {
  Download,
  Edit,
  Share,
  TrashCan,
} from '@carbon-labs/react-motion-icons';
import { SIDE_PANEL_FRAMES, SidePanel } from '../index';
import type {
  SidePanelExit,
  SidePanelFrame,
  SidePanelPlacement,
  SidePanelProps,
  SidePanelSize,
} from '../index';
import mdx from './SidePanel.mdx';

const SIZES: SidePanelSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
const PLACEMENTS: SidePanelPlacement[] = ['start', 'end'];
const EXITS: SidePanelExit[] = ['collapse', 'reversed'];

export default {
  title: 'V12/SidePanel',
  component: SidePanel,
  tags: ['alpha'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'snap-by-its-edge',
        'axial-timing',
        'snap-floating',
        'content-arrival',
        'collapse-exit',
        'push',
        'overlay',
        'step-swap',
        'condensed-title',
        'tooltip-hold',
      ],
      reduced: {
        'snap-by-its-edge': 'shorter-clock',
        'snap-floating': 'at-once',
        'content-arrival': 'at-once',
        push: 'at-once',
        overlay: 'shorter-clock',
        'step-swap': 'at-once',
      },
      states: ['closed', 'open'],
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    placement: { control: 'inline-radio', options: PLACEMENTS },
    frame: { control: 'inline-radio', options: SIDE_PANEL_FRAMES },
    scope: { control: 'inline-radio', options: ['page', 'container'] },
    exit: { control: 'inline-radio', options: EXITS },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    open: { control: false },
    children: { control: false },
    actions: { control: false },
    actionToolbarButtons: { control: false },
    currentStep: { control: false },
    launcherButtonRef: { control: false },
    selectorPageContent: { control: false },
    selectorPrimaryFocus: { control: false },
    decorator: { control: false },
    slug: { control: false },
  },
};

/** Room for the launchers. The panel itself is fixed to the viewport's side. */
const stage = { minBlockSize: 480 };

/** The page beside the panel; with `slideIn` its margin makes room. */
const page = {
  display: 'grid',
  gap: 16,
  alignContent: 'start',
  justifyItems: 'start',
  padding: 32,
};

const row = { display: 'flex', gap: 16, flexWrap: 'wrap' as const };
const text = { margin: 0, maxInlineSize: '40rem' };
const fields = { display: 'grid', gap: 16 };

/** A few form fields for the panel's body. */
function Filters({ id }: { id: string }) {
  return (
    <div style={fields}>
      <TextInput
        id={`${id}-name`}
        labelText="Name contains"
        defaultValue="report"
      />
      <Select id={`${id}-status`} labelText="Status" defaultValue="active">
        <SelectItem value="active" text="Active" />
        <SelectItem value="paused" text="Paused" />
        <SelectItem value="archived" text="Archived" />
      </Select>
      <TextInput id={`${id}-owner`} labelText="Owner" defaultValue="Anyone" />
    </div>
  );
}

/** Press the button to open the panel at the end of the page. The close button or Escape closes it. */
export const Default = {
  args: {
    title: 'Filter results',
    subtitle: 'Narrow the list to what you need.',
    labelText: 'Projects',
    size: 'md',
    placement: 'end',
    frame: 'flush',
    scope: 'page',
    exit: 'collapse',
    includeOverlay: false,
    slideIn: false,
    animateTitle: true,
    condensedActions: false,
    closeIconDescription: 'Close',
    timeScale: 1,
  },
  render: function DefaultStory(args: SidePanelProps) {
    const [open, setOpen] = useState(false);
    const launcher = useRef<HTMLElement>(null);
    const close = () => setOpen(false);
    return (
      <div style={stage}>
        <div id="side-panel-story-default" style={page}>
          <Button
            size="sm"
            variant="outlined"
            ref={launcher}
            onClick={() => setOpen(true)}>
            Open side panel
          </Button>
          <p style={text}>
            The list of projects stays on the page while the panel is open.
          </p>
        </div>
        <SidePanel
          {...args}
          open={open}
          launcherButtonRef={launcher}
          selectorPageContent="#side-panel-story-default"
          onRequestClose={close}
          actions={[
            { label: 'Reset', onClick: close },
            { label: 'Apply', onClick: close },
          ]}>
          <Filters id="side-panel-story-default" />
        </SidePanel>
      </div>
    );
  },
};

/** The two edges. `start` and `end` are logical, so right to left mirrors them. */
export const Placement = {
  render: function PlacementStory() {
    const [open, setOpen] = useState(false);
    const [placement, setPlacement] = useState<SidePanelPlacement>('end');
    return (
      <div style={stage}>
        <div style={page}>
          <div style={row}>
            {PLACEMENTS.map((p) => (
              <Button
                size="sm"
                variant="outlined"
                key={p}
                onClick={() => {
                  setPlacement(p);
                  setOpen(true);
                }}>
                Open at the {p}
              </Button>
            ))}
          </div>
        </div>
        <SidePanel
          open={open}
          placement={placement}
          size="sm"
          title="Details"
          subtitle={`Placed at the ${placement}.`}
          onRequestClose={() => setOpen(false)}>
          <p style={text}>
            The panel opens from the middle of the edge it is attached to.
          </p>
        </SidePanel>
      </div>
    );
  },
};

/** The six sizes: xs 16rem, sm 20rem, md 30rem, lg 40rem, xl 75% and 2xl 90%. */
export const Sizes = {
  render: function SizesStory() {
    const [open, setOpen] = useState(false);
    const [size, setSize] = useState<SidePanelSize>('md');
    return (
      <div style={stage}>
        <div style={page}>
          <div style={row}>
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
          </div>
        </div>
        <SidePanel
          open={open}
          size={size}
          title={`Size ${size}`}
          onRequestClose={() => setOpen(false)}>
          <p style={text}>
            The width comes from the size. The panel is never wider than what it
            sits in.
          </p>
        </SidePanel>
      </div>
    );
  },
};

/** The three frames. Flush is attached to the edge; inset sits 8px in; floating is raised over the page and opens from the press. */
export const Frames = {
  render: function FramesStory() {
    const [open, setOpen] = useState(false);
    const [frame, setFrame] = useState<SidePanelFrame>('flush');
    return (
      <div style={stage}>
        <div style={page}>
          <div style={row}>
            {SIDE_PANEL_FRAMES.map((f) => (
              <Button
                size="sm"
                variant="outlined"
                key={f}
                onClick={() => {
                  setFrame(f);
                  setOpen(true);
                }}>
                Open {f}
              </Button>
            ))}
          </div>
        </div>
        <SidePanel
          open={open}
          frame={frame}
          title={`Frame: ${frame}`}
          onRequestClose={() => setOpen(false)}>
          <Filters id="side-panel-story-frames" />
        </SidePanel>
      </div>
    );
  },
};

/** `includeOverlay` dims the page and keeps focus in the panel. A press on the dim closes it. */
export const Overlay = {
  render: function OverlayStory() {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);
    return (
      <div style={stage}>
        <div style={page}>
          <Button size="sm" variant="outlined" onClick={() => setOpen(true)}>
            Open with overlay
          </Button>
        </div>
        <SidePanel
          open={open}
          includeOverlay
          title="Edit project"
          onRequestClose={close}
          actions={[
            { label: 'Cancel', onClick: close },
            { label: 'Save', onClick: close },
          ]}>
          <Filters id="side-panel-story-overlay" />
        </SidePanel>
      </div>
    );
  },
};

const PAGE_TEXT = Array.from(
  { length: 4 },
  (_, i) =>
    `Paragraph ${i + 1}. This text belongs to the page. When the panel pushes it, the text wraps in the narrower space, and it comes back when the panel closes.`
);

/** `slideIn` pushes the page aside instead of covering it, for flush and inset panels. */
export const SlideIn = {
  render: function SlideInStory() {
    const [open, setOpen] = useState(false);
    const [frame, setFrame] = useState<SidePanelFrame>('flush');
    return (
      <div style={stage}>
        <div id="side-panel-story-slide-in" style={page}>
          <div style={row}>
            {(['flush', 'inset'] as SidePanelFrame[]).map((f) => (
              <Button
                size="sm"
                variant="outlined"
                key={f}
                onClick={() => {
                  setFrame(f);
                  setOpen(true);
                }}>
                Push with {f}
              </Button>
            ))}
          </div>
          {PAGE_TEXT.map((p) => (
            <p key={p} style={text}>
              {p}
            </p>
          ))}
        </div>
        <SidePanel
          open={open}
          slideIn
          selectorPageContent="#side-panel-story-slide-in"
          frame={frame}
          size="sm"
          title="Comments"
          onRequestClose={() => setOpen(false)}>
          <p style={text}>The page beside the panel makes room for it.</p>
        </SidePanel>
      </div>
    );
  },
};

/** A toolbar under the title and up to three footer actions. Publish shows the primary button busy, then the panel closes. */
export const WithActions = {
  render: function WithActionsStory() {
    const [open, setOpen] = useState(false);
    const [condensed, setCondensed] = useState(false);
    const [busy, setBusy] = useState(false);
    useEffect(() => {
      if (!busy) {
        return;
      }
      const t = window.setTimeout(() => {
        setBusy(false);
        setOpen(false);
      }, 1200);
      return () => window.clearTimeout(t);
    }, [busy]);
    const close = () => setOpen(false);
    return (
      <div style={stage}>
        <div style={page}>
          <div style={row}>
            <Button
              size="sm"
              variant="outlined"
              onClick={() => {
                setCondensed(false);
                setOpen(true);
              }}>
              Open with actions
            </Button>
            <Button
              size="sm"
              variant="outlined"
              onClick={() => {
                setCondensed(true);
                setOpen(true);
              }}>
              Open with condensed actions
            </Button>
          </div>
        </div>
        <SidePanel
          open={open}
          title="Quarterly summary"
          subtitle="Draft"
          condensedActions={condensed}
          onRequestClose={close}
          actionToolbarButtons={[
            { label: 'Edit', icon: Edit },
            { label: 'Share', icon: Share },
            { label: 'Download', icon: Download },
            { label: 'Delete', icon: TrashCan },
            { label: 'Duplicate' },
          ]}
          actions={[
            { label: 'Cancel', onClick: close },
            { label: 'Save draft', onClick: close },
            {
              label: busy ? 'Publishing' : 'Publish',
              loading: busy,
              onClick: () => setBusy(true),
            },
          ]}>
          <p style={text}>
            The summary collects the figures from every team. Publish it to
            share it with everyone in the workspace.
          </p>
        </SidePanel>
      </div>
    );
  },
};

const STEPS = [
  {
    title: 'Choose a source',
    body: 'Pick the data the report reads from. You can add more sources later.',
  },
  {
    title: 'Pick the columns',
    body: 'Choose which columns appear in the report and in what order.',
  },
  {
    title: 'Review',
    body: 'Everything is ready. Create the report to share it with your team.',
  },
];

/** Steps: a new `currentStep` swaps the body out, then in. Past the first step a back button shows. */
export const MultiStep = {
  render: function MultiStepStory() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0);
    const last = step === STEPS.length - 1;
    const close = () => setOpen(false);
    return (
      <div style={stage}>
        <div style={page}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => {
              setStep(0);
              setOpen(true);
            }}>
            Create a report
          </Button>
        </div>
        <SidePanel
          open={open}
          currentStep={step}
          labelText={`Step ${step + 1} of ${STEPS.length}`}
          title="Create a report"
          onNavigationBack={() => setStep((s) => Math.max(0, s - 1))}
          onRequestClose={close}
          actions={[
            { label: 'Cancel', onClick: close },
            {
              label: last ? 'Create' : 'Next',
              onClick: () => (last ? close() : setStep((s) => s + 1)),
            },
          ]}>
          <h3 style={{ margin: '0 0 8px' }}>{STEPS[step].title}</h3>
          <p style={text}>{STEPS[step].body}</p>
        </SidePanel>
      </div>
    );
  },
};

const ENTRIES = Array.from(
  { length: 16 },
  (_, i) =>
    `Entry ${i + 1}. A change was made to the project settings. The new values apply to every member, and the previous values are kept in the history.`
);

/** A long body scrolls. Once the title is under the top bar, the bar shows it, small. */
export const LongContent = {
  render: function LongContentStory() {
    const [open, setOpen] = useState(false);
    return (
      <div style={stage}>
        <div style={page}>
          <Button size="sm" variant="outlined" onClick={() => setOpen(true)}>
            Open activity
          </Button>
        </div>
        <SidePanel
          open={open}
          title="Activity"
          subtitle="Everything that changed in this project."
          onRequestClose={() => setOpen(false)}>
          <div style={fields}>
            {ENTRIES.map((e) => (
              <p key={e} style={text}>
                {e}
              </p>
            ))}
          </div>
        </SidePanel>
      </div>
    );
  },
};

/** The two exits. Collapse pulls the far edge back to the near one; reversed plays the entrance back. */
export const Exits = {
  render: function ExitsStory() {
    const [open, setOpen] = useState(false);
    const [exit, setExit] = useState<SidePanelExit>('collapse');
    return (
      <div style={stage}>
        <div style={page}>
          <div style={row}>
            {EXITS.map((x) => (
              <Button
                size="sm"
                variant="outlined"
                key={x}
                onClick={() => {
                  setExit(x);
                  setOpen(true);
                }}>
                Open, exit {x}
              </Button>
            ))}
          </div>
        </div>
        <SidePanel
          open={open}
          exit={exit}
          title={`Exit: ${exit}`}
          onRequestClose={() => setOpen(false)}>
          <p style={text}>Close the panel to see how it leaves.</p>
        </SidePanel>
      </div>
    );
  },
};

const container = {
  position: 'relative' as const,
  overflow: 'hidden',
  blockSize: 480,
  margin: 32,
  border: '1px solid currentColor',
};

/** `scope="container"` places the panel and its overlay inside a positioned container instead of the viewport. */
export const InContainer = {
  render: function InContainerStory() {
    const [open, setOpen] = useState(false);
    return (
      <div style={container}>
        <div style={page}>
          <Button size="sm" variant="outlined" onClick={() => setOpen(true)}>
            Open in container
          </Button>
        </div>
        <SidePanel
          open={open}
          scope="container"
          includeOverlay
          size="sm"
          title="Settings"
          onRequestClose={() => setOpen(false)}>
          <Filters id="side-panel-story-container" />
        </SidePanel>
      </div>
    );
  },
};
