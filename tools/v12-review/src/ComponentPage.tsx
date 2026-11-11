/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// One component's page: its header (the title, the summary, a link to
// Storybook and a tab for each section), then each of its stories as a section
// (its name, the comment above it in its file, and the story itself), the
// first with its settings; then the docs page's own sections (Motion,
// Reduced motion and the rest), the motion items the stories declare, and
// the props. A story that opens over a page or fills one runs in a frame of
// its own; the rest run in the page, contained.

import React, { Component, useEffect, useMemo, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { composeStories } from '@storybook/react';
import { Button } from '@carbon-labs/react-button';
import { Select, SelectItem } from '@carbon-labs/react-select';
import { Toggle } from '@carbon-labs/react-toggle';
import { TextInput } from '@carbon-labs/react-text-input';
import { NumberInput } from '@carbon-labs/react-number-input';
import { Tab, TabList, Tabs } from '@carbon-labs/react-tabs';
import { Link } from '@carbon-labs/react-link';
import { Scroller } from '@carbon-labs/react-scroller';
import { storyFrameUrl } from '@carbon-labs/v12-workbench';
import type {
  V12Parameters,
  WorkbenchGlobals,
} from '@carbon-labs/v12-workbench';
import { FRAMED } from './categories';
import {
  controlsOf,
  hrefOf,
  propsOf,
  slugOf,
  storyDescription,
  storyTitle,
} from './model';
import type { Control, Entry, StoryFiles, StoryModule } from './model';
import { Blocks, Markdown, blocks, inline } from './markdown';
import { PageTop } from './PageTop';

/** A composed story: a component with what Storybook knows about it. */
type Composed = ComponentType<Record<string, unknown>> & {
  id?: string;
  storyName?: string;
  args?: Record<string, unknown>;
  argTypes?: Record<string, { control?: unknown; options?: unknown[] }>;
  parameters?: Record<string, unknown> & { layout?: string };
};

interface Loaded {
  meta: StoryModule['default'];
  stories: [string, Composed][];
}

/** Frames live at once: each holds a connection to the dev server. */
const LIVE_FRAMES = 2;
/** A frame's height: the window's, less the app's header and the story's title, never under 560px. */
const FRAME_SIZE = 'max(560px, calc(100vh - 200px))';

/** A story file's id prefix, as Storybook makes it from the title: `V12/ChatShell` → `v12-chatshell`. */
function prefixOf(title: unknown, name: string): string {
  return String(title ?? `V12/${name}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** A story's id, as Storybook names it. */
function idOf(prefix: string, exportName: string, story: Composed): string {
  return story.id ?? `${prefix}--${slugOf(exportName)}`;
}

/** Scrolls the page to a section: `props`, a story's or a docs section's anchor. */
function scrollToSection(anchor: string) {
  document.getElementById(`story-${anchor}`)?.scrollIntoView();
}

/** Storybook's page for a story or the docs, beside the app. */
function storybookHref(path: string): string {
  const url = new URL('./', window.location.href);
  url.search = `?path=${path}`;
  url.hash = '';
  return url.toString();
}

export function ComponentPage({
  entry,
  stories,
  picks,
  story,
}: {
  entry: Entry;
  stories: StoryFiles;
  picks: WorkbenchGlobals;
  story?: string;
}) {
  const [loaded, setLoaded] = useState<Loaded | 'failed' | null>(null);
  const [live, setLive] = useState<string[]>([]);

  useEffect(() => {
    let on = true;
    stories(entry.file).then(
      (mod) => {
        const composed = composeStories(
          mod as Parameters<typeof composeStories>[0]
        ) as unknown as Record<string, Composed>;
        // The file's own order (the bundler sorts a module's names).
        const order = (mod as { __namedExportsOrder?: string[] })
          .__namedExportsOrder;
        const names =
          order?.filter((n) => n in composed) ?? Object.keys(composed);
        // A story's own `name` (composing gives every story its export's).
        const named = (n: string) => {
          const raw = mod[n];
          // A function's `name` is its own, not the story's.
          const own =
            raw && typeof raw === 'object'
              ? (raw as { name?: unknown }).name
              : undefined;
          const story = composed[n];
          if (typeof own === 'string') story.storyName = own;
          return story;
        };
        if (on)
          setLoaded({
            meta: mod.default,
            stories: names.map((n) => [n, named(n)]),
          });
      },
      () => on && setLoaded('failed')
    );
    return () => {
      on = false;
    };
  }, [entry.file, stories]);

  // A link to one story scrolls to it once the page has its stories.
  useEffect(() => {
    if (!story || !loaded || loaded === 'failed') return;
    scrollToSection(story);
  }, [story, loaded]);

  const meta = loaded && loaded !== 'failed' ? loaded.meta : null;
  const props = useMemo(() => propsOf(meta?.component), [meta]);
  const v12 = (meta?.parameters as { v12?: V12Parameters } | undefined)?.v12;
  const sections = entry.text?.sections ?? [];
  const framed = FRAMED.has(entry.name);
  const prefix = prefixOf(meta?.title, entry.name);
  // A file with no docs page opens at its first story.
  const noDocs = ((meta?.tags as string[] | undefined) ?? []).includes(
    '!autodocs'
  );
  const first =
    loaded && loaded !== 'failed' && loaded.stories[0]
      ? idOf(prefix, loaded.stories[0][0], loaded.stories[0][1])
      : null;
  const storybookPath =
    noDocs && first ? `/story/${first}` : `/docs/${prefix}--overview`;

  // A tab for each section, as the page lays them out: the stories, the
  // docs page's sections, the props. A tab goes to its section's address;
  // the address's section is the selected tab (the first, at none).
  const tabs =
    loaded && loaded !== 'failed'
      ? [
          ...loaded.stories.map(([exp, s]) => ({
            anchor: slugOf(exp),
            label: storyTitle(exp, s.storyName),
          })),
          ...sections.map((s) => ({
            anchor: slugOf(s.title.replace(/\s+/g, '')),
            label: s.title,
          })),
          ...(props.length ? [{ anchor: 'props', label: 'Props' }] : []),
        ]
      : [];
  const selected = Math.max(
    0,
    tabs.findIndex((t) => t.anchor === story)
  );

  // The summary's first paragraph is the header's subtitle; the rest goes under it.
  const summary = blocks(entry.text?.summary ?? '');
  const [lead] = summary;
  const subtitle = lead?.kind === 'p' ? inline(lead.text) : undefined;
  const details = subtitle ? summary.slice(1) : summary;

  return (
    <div className="v12r-page">
      <PageTop
        title={entry.title}
        subtitle={subtitle}
        pageActions={
          <Link href={storybookHref(storybookPath)}>Open in Storybook</Link>
        }
        navigation={
          tabs.length ? (
            <Tabs
              selectedIndex={selected}
              onChange={({ selectedIndex }) => {
                window.location.hash = hrefOf({
                  page: 'component',
                  slug: entry.slug,
                  story: tabs[selectedIndex].anchor,
                });
              }}>
              <TabList aria-label="On this page" activation="manual">
                {tabs.map((t, i) => (
                  <Tab
                    key={t.anchor}
                    // The selected tab again: back to its section.
                    onClick={() => i === selected && scrollToSection(t.anchor)}>
                    {t.label}
                  </Tab>
                ))}
              </TabList>
            </Tabs>
          ) : undefined
        }>
        {details.length ? (
          <div className="v12r-header-text v12r-prose">
            <Blocks items={details} />
          </div>
        ) : null}
      </PageTop>

      <div className="v12r-page__body">
        {loaded === null ? (
          <p className="v12r-note">Loading the stories…</p>
        ) : null}
        {loaded === 'failed' ? (
          <p className="v12r-note">The stories didn’t load.</p>
        ) : null}

        {loaded && loaded !== 'failed'
          ? loaded.stories.map(([exp, s], i, all) => {
              const firstId = idOf(prefix, all[0][0], all[0][1]);
              const id = idOf(prefix, exp, s);
              return (
                <StorySection
                  key={exp}
                  anchor={slugOf(exp)}
                  title={storyTitle(exp, s.storyName)}
                  description={storyDescription(s.parameters)}
                  storybook={storybookHref(`/story/${id}`)}
                  fullScreen={
                    framed ? storyFrameUrl(id, { ...picks }) : undefined
                  }>
                  {framed ? (
                    <Framed
                      title={`${entry.title}: ${storyTitle(exp, s.storyName)}`}
                      src={storyFrameUrl(id, { ...picks })}
                      // The first one runs as the page opens; the others on request.
                      live={live.includes(id) || (!live.length && i === 0)}
                      onLoad={() =>
                        setLive((l) =>
                          [
                            ...(l.length ? l : [firstId]).filter(
                              (x) => x !== id
                            ),
                            id,
                          ].slice(-LIVE_FRAMES)
                        )
                      }
                    />
                  ) : (
                    <InPage
                      name={entry.name}
                      story={s}
                      settings={i === 0}
                      fullscreen={s.parameters?.layout === 'fullscreen'}
                    />
                  )}
                </StorySection>
              );
            })
          : null}

        {sections.map((s) => (
          <section
            key={s.title}
            id={`story-${slugOf(s.title.replace(/\s+/g, ''))}`}
            className="v12r-section">
            <h2 className="v12r-section__title">{s.title}</h2>
            <div className="v12r-prose">
              <Markdown text={s.text} />
            </div>
            {/^motion$/i.test(s.title) && v12?.motion?.length ? (
              <MotionItems v12={v12} />
            ) : null}
          </section>
        ))}

        {props.length ? (
          <section id="story-props" className="v12r-section">
            <h2 className="v12r-section__title">Props</h2>
            <PropsTable rows={props} />
          </section>
        ) : null}
      </div>
    </div>
  );
}

/* ── one story ──────────────────────────────────────────────────────────── */

function StorySection({
  anchor,
  title,
  description,
  storybook,
  fullScreen,
  children,
}: {
  anchor: string;
  title: string;
  description: string;
  storybook: string;
  /** The story alone, for a framed one: a tab of its own at the window's size. */
  fullScreen?: string;
  children: ReactNode;
}) {
  return (
    <section id={`story-${anchor}`} className="v12r-section">
      <div className="v12r-section__head">
        <h2 className="v12r-section__title">{title}</h2>
        <span className="v12r-section__links">
          {fullScreen ? (
            <Link size="sm" href={fullScreen} target="_blank" rel="noreferrer">
              Open full screen
            </Link>
          ) : null}
          <Link size="sm" href={storybook}>
            Storybook
          </Link>
        </span>
      </div>
      {description ? (
        <div className="v12r-section__text v12r-prose">
          <Markdown text={description} />
        </div>
      ) : null}
      {children}
    </section>
  );
}

/** A story that throws shows why, and the page goes on. */
class Contained extends Component<
  { name: string; children: ReactNode },
  { error: string | null }
> {
  state = { error: null as string | null };
  static getDerivedStateFromError(e: unknown) {
    return { error: String(e instanceof Error ? e.message : e) };
  }
  render() {
    return this.state.error ? (
      <p className="v12r-note">
        {this.props.name} didn’t render here: {this.state.error}
      </p>
    ) : (
      this.props.children
    );
  }
}

/** A story in the page, contained: what it fixes to the screen stays in its stage. The first one has its settings. */
function InPage({
  name,
  story: Story,
  settings,
  fullscreen,
}: {
  name: string;
  story: Composed;
  settings: boolean;
  fullscreen: boolean;
}) {
  const initial = Story.args ?? {};
  const controls = useMemo(
    () =>
      settings ? controlsOf(initial, (Story.argTypes ?? {}) as never) : [],
    // The story's own args and argTypes don't change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Story, settings]
  );
  const [args, setArgs] = useState<Record<string, unknown>>(initial);
  const [open, setOpen] = useState(false);
  const changed = JSON.stringify(args) !== JSON.stringify(initial);

  return (
    <div className={`v12r-story${open ? ' v12r-story--settings' : ''}`}>
      {controls.length ? (
        <div className="v12r-story__bar">
          <Button
            size="sm"
            variant="outlined"
            frame="ghost"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}>
            {open ? 'Hide settings' : 'Show settings'}
          </Button>
          {changed ? (
            <Button size="sm" frame="ghost" onClick={() => setArgs(initial)}>
              Reset
            </Button>
          ) : null}
        </div>
      ) : null}
      <div className="v12r-story__body">
        <div className={`v12r-stage${fullscreen ? ' v12r-stage--full' : ''}`}>
          <Contained name={name}>
            <Story {...args} />
          </Contained>
        </div>
        {open ? (
          <Settings
            controls={controls}
            args={args}
            onChange={(name, value) =>
              setArgs((a) => ({ ...a, [name]: value }))
            }
          />
        ) : null}
      </div>
    </div>
  );
}

/** A story in a frame of its own, loaded on request. */
function Framed({
  title,
  src,
  live,
  onLoad,
}: {
  title: string;
  src: string;
  live: boolean;
  onLoad: () => void;
}) {
  if (!live) {
    return (
      <div
        className="v12r-frame v12r-frame--idle"
        style={{ blockSize: FRAME_SIZE }}>
        <Button size="sm" variant="outlined" onClick={onLoad}>
          Load the example
        </Button>
        <span>
          It fills a screen, so it runs in a frame of its own. Two run at a
          time; open it full screen to try it at your window’s size.
        </span>
      </div>
    );
  }
  return (
    <iframe
      className="v12r-frame"
      title={title}
      src={src}
      style={{ blockSize: FRAME_SIZE }}
    />
  );
}

/* ── settings ───────────────────────────────────────────────────────────── */

function Settings({
  controls,
  args,
  onChange,
}: {
  controls: Control[];
  args: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
}) {
  return (
    <Scroller
      className="v12r-settings"
      viewportClassName="v12r-settings__body"
      viewportProps={{ role: 'group' }}
      aria-label="Settings">
      {controls.map((c) => {
        const id = `v12r-set-${c.name}`;
        if (c.kind === 'choice')
          return (
            <Select
              key={c.name}
              id={id}
              labelText={c.name}
              size="sm"
              value={String(args[c.name] ?? '')}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                onChange(c.name, e.target.value || undefined)
              }>
              {args[c.name] === undefined ? (
                <SelectItem value="" text="(default)" />
              ) : null}
              {c.options.map((o) => (
                <SelectItem key={o} value={o} text={o} />
              ))}
            </Select>
          );
        if (c.kind === 'boolean')
          return (
            <Toggle
              key={c.name}
              id={id}
              size="sm"
              labelText={c.name}
              toggled={!!args[c.name]}
              onToggle={(checked: boolean) => onChange(c.name, checked)}
            />
          );
        if (c.kind === 'number')
          return (
            <NumberInput
              key={c.name}
              id={id}
              size="sm"
              label={c.name}
              value={Number(args[c.name] ?? 0)}
              onChange={(_e: unknown, { value }: { value: number | string }) =>
                onChange(c.name, Number(value))
              }
            />
          );
        return (
          <TextInput
            key={c.name}
            id={id}
            size="sm"
            labelText={c.name}
            value={String(args[c.name] ?? '')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChange(c.name, e.target.value)
            }
          />
        );
      })}
    </Scroller>
  );
}

/* ── motion and props ───────────────────────────────────────────────────── */

const REDUCED: Record<string, string> = {
  'shorter-clock': 'Shorter clock',
  'at-once': 'At once',
  full: 'Full clock',
};

/** The motion items the stories declare, each with its reduced-motion behavior. */
function MotionItems({ v12 }: { v12: V12Parameters }) {
  return (
    <table className="v12r-table v12r-table--motion">
      <caption>
        The motion items it runs, by the names the motion seam gives them
      </caption>
      <thead>
        <tr>
          <th scope="col">Motion</th>
          <th scope="col">Reduced motion</th>
        </tr>
      </thead>
      <tbody>
        {(v12.motion ?? []).map((m) => (
          <tr key={m}>
            <td>
              <code>{m}</code>
            </td>
            <td>{REDUCED[v12.reduced?.[m] ?? ''] ?? 'Not set'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PropsTable({ rows }: { rows: ReturnType<typeof propsOf> }) {
  return (
    <Scroller axis="x" className="v12r-table-wrap">
      <table className="v12r-table">
        <thead>
          <tr>
            <th scope="col">Prop</th>
            <th scope="col">Type</th>
            <th scope="col">Default</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td>
                <code>{r.name}</code>
                {r.required ? (
                  <span className="v12r-required"> required</span>
                ) : null}
              </td>
              <td>
                <code className="v12r-type">{r.type}</code>
              </td>
              <td>{r.defaultValue ? <code>{r.defaultValue}</code> : null}</td>
              <td className="v12r-prose">{inline(r.description)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Scroller>
  );
}
