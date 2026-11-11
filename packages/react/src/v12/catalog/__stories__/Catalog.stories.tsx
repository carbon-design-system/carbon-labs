/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The catalog: every v12 component's Default story on one page, by category,
// so the set is reviewed together, under the toolbar's picks (theme,
// density, corners, reduced motion, clock, direction). The list comes from
// the Storybook index: a new component shows up by itself, under "Not yet
// sorted" until it is given a category below.
//
// Most stories render here, in the page, as each comes near the screen. The
// overlays and the whole-page components, which open over or fill a page,
// each run in a frame of their own, loaded on request and two at a time (in
// the dev server every frame holds a connection open, and the browser has
// six per host).

import React, {
  Component,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ComponentType, CSSProperties, ReactNode } from 'react';
import { composeStories } from '@storybook/react';
import { storyFrameUrl } from '@carbon-labs/v12-workbench';
import { Button } from '@carbon-labs/react-button';
import {
  CATEGORIES,
  FRAMED,
  LEFT_OUT,
} from '@carbon-labs/v12-review/categories';
import type { Category } from '@carbon-labs/v12-review/categories';

export default {
  title: 'V12/Catalog',
  // No docs page: it would load every category's frames at once.
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
    v12: { motion: [], reduced: {}, states: ['rest'] },
  },
};

const FRAME_PX = 520;
/** Frames live at once. */
const LIVE_FRAMES = 2;
/** A card's body's tallest; a taller story scrolls inside it. */
const MAX_PX = 480;

/** Each component's story module, loaded when its card first comes near. */
const storyModules = (
  require as unknown as {
    context: (
      dir: string,
      deep: boolean,
      re: RegExp,
      mode: 'lazy'
    ) => { keys(): string[]; (key: string): Promise<StoryModule> };
  }
).context(
  '../../components',
  true,
  /^\.\/[^/]+\/__stories__\/[^/]+\.stories\.tsx$/,
  'lazy'
);

type StoryModule = Parameters<typeof composeStories>[0];

/** An entry of Storybook's index. */
interface Entry {
  id: string;
  title: string;
  name: string;
  type: 'story' | 'docs';
}

/** A component in the catalog. */
interface Item {
  name: string;
  storyId: string;
  docsId?: string;
  stories: number;
}

/**
 * The module of a component's stories: `<Name>/__stories__/<Name>.stories.tsx`,
 * else the folder's first, else a `<Name>.stories.tsx` in another's folder.
 */
function moduleKey(name: string): string | undefined {
  const keys = storyModules.keys();
  const own = `./${name}/__stories__/${name}.stories.tsx`;
  return keys.includes(own)
    ? own
    : (keys.find((k) => k.startsWith(`./${name}/__stories__/`)) ??
        keys.find((k) => k.endsWith(`/__stories__/${name}.stories.tsx`)));
}

/** The index's components: each one's Default story (or its first), its docs and how many stories it has. */
function useCatalogIndex(): Map<string, Item> | null | 'failed' {
  const [items, setItems] = useState<Map<string, Item> | null | 'failed'>(null);
  useEffect(() => {
    let live = true;
    fetch(new URL('index.json', window.location.href).toString())
      .then((r) => r.json())
      .then((index: { entries: Record<string, Entry> }) => {
        const by = new Map<string, Entry[]>();
        for (const e of Object.values(index.entries)) {
          const m = /^V12\/([^/]+)$/.exec(e.title);
          if (!m || LEFT_OUT.has(m[1])) continue;
          by.set(m[1], [...(by.get(m[1]) ?? []), e]);
        }
        const out = new Map<string, Item>();
        for (const [name, entries] of by) {
          const stories = entries.filter((e) => e.type === 'story');
          const first = stories.find((e) => e.name === 'Default') ?? stories[0];
          if (!first) continue;
          out.set(name, {
            name,
            storyId: first.id,
            docsId: entries.find((e) => e.type === 'docs')?.id,
            stories: stories.length,
          });
        }
        if (live) setItems(out);
      })
      .catch(() => live && setItems('failed'));
    return () => {
      live = false;
    };
  }, []);
  return items;
}

/** A link that opens a story or docs page in the Storybook around the catalog. */
function managerHref(kind: 'story' | 'docs', id: string): string {
  const url = new URL('./', window.location.href);
  url.search = `?path=/${kind}/${id}`;
  return url.toString();
}

const S: Record<string, CSSProperties> = {
  page: {
    boxSizing: 'border-box',
    padding: '32px 32px 64px',
    background: 'var(--cds-background)',
    color: 'var(--cds-text-primary)',
    minBlockSize: '100vh',
  },
  intro: { margin: '0 0 8px', maxInlineSize: '44rem' },
  jump: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px 16px',
    margin: '0 0 32px',
    padding: 0,
    listStyle: 'none',
  },
  section: { margin: '0 0 48px' },
  heading: { margin: '0 0 4px', fontSize: 20, lineHeight: '28px' },
  summary: {
    margin: '0 0 16px',
    color: 'var(--cds-text-secondary)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 420px), 1fr))',
    gap: 16,
    alignItems: 'start',
  },
  card: {
    border: '1px solid var(--cds-border-subtle-01)',
    borderRadius: 8,
    overflow: 'hidden',
    background: 'var(--cds-layer-01)',
  },
  cardHead: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
    padding: '8px 12px',
    borderBlockEnd: '1px solid var(--cds-border-subtle-01)',
    fontSize: 14,
    lineHeight: '20px',
  },
  meta: { fontSize: 12, color: 'var(--cds-text-secondary)' },
  body: {
    // Contains what a story fixes to the screen, and scrolls a tall one.
    position: 'relative',
    transform: 'translateZ(0)',
    maxBlockSize: MAX_PX,
    overflow: 'auto',
    padding: 16,
    background: 'var(--cds-background)',
  },
  frame: { display: 'block', inlineSize: '100%', border: 0 },
  placeholder: {
    display: 'grid',
    placeContent: 'center',
    justifyItems: 'center',
    gap: 8,
    padding: 16,
    textAlign: 'center',
    color: 'var(--cds-text-secondary)',
    background: 'var(--cds-background)',
    fontSize: 12,
  },
  note: { margin: 0, fontSize: 12, color: 'var(--cds-text-secondary)' },
};

/** Keeps a story that throws to its own card. */
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
      <p style={S.note}>
        {this.props.name} didn’t render here: {this.state.error}
      </p>
    ) : (
      this.props.children
    );
  }
}

/** A component's Default story, composed with its own args and decorators, rendered in the page. */
function InPage({ item }: { item: Item }) {
  const [Story, setStory] = useState<ComponentType | null | 'none'>(null);
  useEffect(() => {
    let live = true;
    const key = moduleKey(item.name);
    if (!key) {
      setStory('none');
      return;
    }
    storyModules(key).then(
      (mod) => {
        const all = composeStories(mod) as Record<string, ComponentType>;
        const pick = all.Default ?? Object.values(all)[0];
        if (live) setStory(() => pick ?? 'none');
      },
      () => live && setStory('none')
    );
    return () => {
      live = false;
    };
  }, [item.name]);
  if (Story === null) return <p style={S.note}>Loading…</p>;
  if (Story === 'none')
    return <p style={S.note}>No stories file to compose; open its page.</p>;
  return (
    <Contained name={item.name}>
      <Story />
    </Contained>
  );
}

/** The frames live at once, newest last, and the call that loads one. */
const Frames = createContext<{ live: string[]; load: (name: string) => void }>({
  live: [],
  load: () => {},
});

/** A component's Default story in a frame of its own, carrying the toolbar's picks. */
function InFrame({
  item,
  globals,
}: {
  item: Item;
  globals: Record<string, unknown>;
}) {
  const { live, load } = useContext(Frames);
  if (!live.includes(item.name)) {
    return (
      <div style={{ ...S.placeholder, blockSize: FRAME_PX }}>
        <Button size="sm" variant="outlined" onClick={() => load(item.name)}>
          Load {item.name} here
        </Button>
        <span>
          It opens over or fills a page, so it runs in a frame; two at a time.
        </span>
      </div>
    );
  }
  return (
    <iframe
      title={`${item.name}: Default`}
      src={storyFrameUrl(item.storyId, globals)}
      style={{ ...S.frame, blockSize: FRAME_PX }}
    />
  );
}

/**
 * One component: its name (its docs), its story count (its stories) and its
 * Default story. In the page, it's mounted only near the screen, so the
 * catalog stays light; away from it, its last height holds its place.
 */
function Card({
  item,
  globals,
}: {
  item: Item;
  globals: Record<string, unknown>;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const framed = FRAMED.has(item.name);
  const [near, setNear] = useState(false);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (framed) return;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) setHeight(el.offsetHeight);
        setNear(e.isIntersecting);
      },
      { rootMargin: '600px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [framed]);

  return (
    <article style={S.card} aria-label={item.name}>
      <header style={S.cardHead}>
        <a
          href={managerHref(
            item.docsId ? 'docs' : 'story',
            item.docsId ?? item.storyId
          )}
          target="_top">
          {item.name}
        </a>
        <span style={S.meta}>
          <a href={managerHref('story', item.storyId)} target="_top">
            {item.stories === 1 ? '1 story' : `${item.stories} stories`}
          </a>
        </span>
      </header>
      {framed ? (
        <InFrame item={item} globals={globals} />
      ) : (
        <div
          ref={wrap}
          style={{
            ...S.body,
            blockSize: near ? undefined : (height ?? 160),
          }}>
          {near ? <InPage item={item} /> : null}
        </div>
      )}
    </article>
  );
}

function Catalog({
  only,
  globals,
}: {
  only?: string;
  globals: Record<string, unknown>;
}) {
  const index = useCatalogIndex();
  const [live, setLive] = useState<string[]>([]);
  const frames = useMemo(
    () => ({
      live,
      load: (name: string) =>
        setLive((l) =>
          [...l.filter((n) => n !== name), name].slice(-LIVE_FRAMES)
        ),
    }),
    [live]
  );
  const sections = useMemo(() => {
    if (!index || index === 'failed') return [];
    const placed = new Set(CATEGORIES.flatMap((c) => c.names));
    const unsorted = [...index.keys()].filter((n) => !placed.has(n)).sort();
    const all: Category[] = [
      ...CATEGORIES,
      ...(unsorted.length
        ? [
            {
              id: 'unsorted',
              title: 'Not yet sorted',
              summary: 'Components with no category in the catalog yet.',
              names: unsorted,
            },
          ]
        : []),
    ];
    return all
      .filter((c) => !only || c.id === only)
      .map((c) => ({
        ...c,
        items: c.names
          .map((n) => index.get(n))
          .filter((x): x is Item => Boolean(x)),
      }))
      .filter((c) => c.items.length);
  }, [index, only]);

  if (index === 'failed') {
    return (
      <div style={S.page}>
        <p style={S.intro}>The Storybook index couldn’t be read.</p>
      </div>
    );
  }
  if (!index) {
    return (
      <div style={S.page}>
        <p style={S.intro}>Reading the index…</p>
      </div>
    );
  }
  const count = sections.reduce((n, c) => n + c.items.length, 0);
  return (
    <Frames.Provider value={frames}>
      <div style={S.page}>
        <p style={S.intro}>
          {count} components, each in its Default story. The toolbar’s theme,
          density, corners, reduced motion, clock and direction apply to all of
          them. A name opens its docs; the story count opens its stories.
        </p>
        {!only && (
          <ul style={S.jump} aria-label="Categories">
            {sections.map((c) => (
              <li key={c.id}>
                <a href={`#catalog-${c.id}`}>
                  {c.title} ({c.items.length})
                </a>
              </li>
            ))}
          </ul>
        )}
        {sections.map((c) => (
          <section
            key={c.id}
            id={`catalog-${c.id}`}
            style={S.section}
            aria-labelledby={`catalog-${c.id}-title`}>
            <h2 id={`catalog-${c.id}-title`} style={S.heading}>
              {c.title}
            </h2>
            <p style={S.summary}>{c.summary}</p>
            <div style={S.grid}>
              {c.items.map((item) => (
                <Card key={item.name} item={item} globals={globals} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </Frames.Provider>
  );
}

type Ctx = { globals: Record<string, unknown> };
const category = (id?: string) => ({
  render: (_args: unknown, { globals }: Ctx) => (
    <Catalog only={id} globals={globals} />
  ),
});

/** Every component, by category. */
export const All = category();
export const Actions = category('actions');
export const Inputs = category('inputs');
export const SelectionAndNavigation = category('navigation');
export const Overlays = category('overlays');
export const ContainersAndLayout = category('containers');
export const DataDisplay = category('data');
export const FeedbackAndStatus = category('feedback');
export const ShellsAndPatterns = category('patterns');
export const MotionAndFoundations = category('foundations');
