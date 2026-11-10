/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// What the review app knows, apart from drawing it: its routes, the picks it
// keeps, the stories it loads and what it reads from them (props, controls).

import { useEffect, useState } from 'react';
import { DEFAULT_GLOBALS, readGlobals } from '@carbon-labs/v12-workbench';
import type { WorkbenchGlobals } from '@carbon-labs/v12-workbench';
import { CATEGORIES, EXPERIENCES, LEFT_OUT } from './categories';
import type { Category } from './categories';
import content from './content.json';

/* ── the components ─────────────────────────────────────────────────────── */

/** A story module, as the bundler gives it. */
export type StoryModule = Record<string, unknown> & {
  default: Record<string, unknown>;
};

/** The story files, by path (`./<Name>/__stories__/<Name>.stories.tsx`), loaded on request. */
export interface StoryFiles {
  keys(): string[];
  (key: string): Promise<StoryModule>;
}

/** One docs page's text (scripts/content.js). */
export interface PageText {
  title: string;
  summary: string;
  sections: { title: string; text: string }[];
  /** What the folder has: tests, and its manifest row's labs status (null: none recorded). */
  facts?: { tests: boolean; status: string | null };
}

/** What a component has, for its card: the parts of the work that are there. */
export function tagsOf(text: PageText | undefined): string[] {
  if (!text) {
    return [];
  }
  const has = (re: RegExp) => text.sections.some((s) => re.test(s.title));
  return [
    has(/^motion$/i) && 'Motion',
    has(/^reduced motion$/i) && 'Reduced motion',
    has(/^(keyboard|accessibility)/i) && 'Accessibility',
    text.facts?.tests && 'Tests',
  ].filter((t): t is string => !!t);
}

/** A component in the app. */
export interface Entry {
  /** Its story title under V12/: `DatePickerV2`. */
  name: string;
  /** Its docs page's title: `Date picker`. */
  title: string;
  slug: string;
  file: string;
  text: PageText | undefined;
}

const TEXT = content as Record<string, PageText>;

/** `DatePickerV2` → `date-picker-v2`. */
export function slugOf(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/** The story file of a component: `<Name>/__stories__/<Name>.stories.tsx`, else the folder's first. */
export function fileOf(keys: string[], name: string): string | undefined {
  const own = `./${name}/__stories__/${name}.stories.tsx`;
  return keys.includes(own)
    ? own
    : keys.find((k) => k.startsWith(`./${name}/__stories__/`));
}

/** Every component with a story file, by name. */
export function entriesOf(files: StoryFiles): Map<string, Entry> {
  const keys = files.keys();
  const names = new Set(
    keys
      .map((k) => /^\.\/([^/]+)\/__stories__\//.exec(k)?.[1])
      .filter((n): n is string => !!n && !LEFT_OUT.has(n))
  );
  const out = new Map<string, Entry>();
  for (const name of [...names].sort()) {
    const file = fileOf(keys, name);
    if (!file) continue;
    const text = TEXT[`V12/${name}`] ?? EXPERIENCES[name];
    out.set(name, {
      name,
      title: text?.title || name,
      slug: slugOf(name),
      file,
      text,
    });
  }
  return out;
}

/** The categories with their components, and a last one for those no category lists. */
export function groupsOf(
  entries: Map<string, Entry>
): (Category & { entries: Entry[] })[] {
  const placed = new Set(CATEGORIES.flatMap((c) => c.names));
  const rest = [...entries.keys()].filter((n) => !placed.has(n));
  const all: Category[] = [
    ...CATEGORIES,
    ...(rest.length
      ? [
          {
            id: 'unsorted',
            title: 'Not yet sorted',
            summary: 'Components no category lists yet.',
            names: rest,
          },
        ]
      : []),
  ];
  return all
    .map((c) => ({
      ...c,
      entries: c.names
        .map((n) => entries.get(n))
        .filter((e): e is Entry => !!e),
    }))
    .filter((c) => c.entries.length);
}

/** The first sentence of a summary, with its Markdown marks left in but its links as text. */
export function firstSentence(text: string): string {
  // A link's text only: the sentence sits inside a card's own link. A quote
  // reads as its text.
  const flat = text
    .replace(/^>\s?/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  const end = /[.!?:](\s|$)/.exec(flat);
  if (!end) {
    return flat;
  }
  // A sentence that leads into a list ends there, as a sentence.
  const sentence = flat.slice(0, end.index + 1);
  return sentence.endsWith(':') ? `${sentence.slice(0, -1)}.` : sentence;
}

/* ── routes ─────────────────────────────────────────────────────────────── */

export type Route =
  | { page: 'home' }
  | { page: 'component'; slug: string; story?: string };

/** `#/components/button/kinds` → the Button page at its Kinds story. */
export function parseRoute(hash: string): Route {
  const m = /^#\/components\/([^/?#]+)(?:\/([^/?#]+))?/.exec(hash);
  return m ? { page: 'component', slug: m[1], story: m[2] } : { page: 'home' };
}

export function hrefOf(route: Route): string {
  return route.page === 'home'
    ? '#/'
    : `#/components/${route.slug}${route.story ? `/${route.story}` : ''}`;
}

/** The route, following the address. */
export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  useEffect(() => {
    const on = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

/* ── the picks ──────────────────────────────────────────────────────────── */

const PICKS_KEY = 'v12-review:picks';

/** The picks, kept for the next visit in this browser. */
export function usePicks(): [
  WorkbenchGlobals,
  (next: Partial<WorkbenchGlobals>) => void,
] {
  const [picks, setPicks] = useState<WorkbenchGlobals>(() => {
    try {
      const saved = window.localStorage.getItem(PICKS_KEY);
      return saved ? readGlobals(JSON.parse(saved)) : DEFAULT_GLOBALS;
    } catch {
      return DEFAULT_GLOBALS;
    }
  });
  const update = (next: Partial<WorkbenchGlobals>) =>
    setPicks((p) => {
      const merged = { ...p, ...next };
      try {
        window.localStorage.setItem(PICKS_KEY, JSON.stringify(merged));
      } catch {
        // Not kept: the picks still hold for this visit.
      }
      return merged;
    });
  return [picks, update];
}

/* ── what the stories carry ─────────────────────────────────────────────── */

/** A prop as the props table shows it. */
export interface PropRow {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description: string;
}

interface DocgenType {
  name?: string;
  raw?: string;
  value?: unknown;
  elements?: DocgenType[];
}

interface DocgenProp {
  type?: DocgenType;
  tsType?: DocgenType;
  required?: boolean;
  description?: string;
  defaultValue?: { value?: string } | null;
}

/** A type as a short string: the raw text if there is one, else its name. */
function typeText(t: DocgenType | undefined): string {
  if (!t) return '';
  if (t.raw) return t.raw;
  if (t.name === 'union' && t.elements)
    return t.elements.map(typeText).join(' | ');
  if (t.name === 'enum' && Array.isArray(t.value))
    return (t.value as { value: string }[]).map((v) => v.value).join(' | ');
  return t.name ?? '';
}

/**
 * The props of a component, from the docs information the build attaches to
 * it, required first and then by name.
 *
 * @param component the story file's `component`
 */
export function propsOf(component: unknown): PropRow[] {
  const info = (
    component as {
      __docgenInfo?: { props?: Record<string, DocgenProp> };
    } | null
  )?.__docgenInfo;
  if (!info?.props) return [];
  return Object.entries(info.props)
    .map(([name, p]) => ({
      name,
      type: typeText(p.tsType ?? p.type),
      required: !!p.required,
      defaultValue: p.defaultValue?.value ?? undefined,
      description: p.description ?? '',
    }))
    .sort(
      (a, b) =>
        Number(b.required) - Number(a.required) || a.name.localeCompare(b.name)
    );
}

/** One setting on a story: what kind of control, and its choices. */
export type Control =
  | { name: string; kind: 'choice'; options: string[] }
  | { name: string; kind: 'boolean' }
  | { name: string; kind: 'text' }
  | { name: string; kind: 'number' };

interface ArgType {
  control?: string | false | { type?: string };
  options?: unknown[];
}

/**
 * The settings a story offers: each arg it sets, and each prop its file gives
 * a control with choices. A function or an element has none.
 *
 * @param args the story's args
 * @param argTypes the story's and its file's argTypes
 */
export function controlsOf(
  args: Record<string, unknown>,
  argTypes: Record<string, ArgType>
): Control[] {
  const names = new Set([
    ...Object.keys(args),
    ...Object.entries(argTypes)
      .filter(([, t]) => t.options && t.control !== false)
      .map(([n]) => n),
  ]);
  const out: Control[] = [];
  for (const name of names) {
    const type = argTypes[name] ?? {};
    if (type.control === false) continue;
    const value = args[name];
    if (
      type.options?.length &&
      type.options.every((o) => typeof o === 'string')
    )
      out.push({ name, kind: 'choice', options: type.options as string[] });
    else if (typeof value === 'boolean') out.push({ name, kind: 'boolean' });
    else if (typeof value === 'number') out.push({ name, kind: 'number' });
    else if (typeof value === 'string') out.push({ name, kind: 'text' });
  }
  return out;
}

/** A story's own description: the comment above it in its file. */
export function storyDescription(parameters: unknown): string {
  const docs = (parameters as { docs?: { description?: { story?: string } } })
    ?.docs;
  return docs?.description?.story ?? '';
}

/** `SelectionAndNavigation` → `Selection and navigation`; a story's own name wins. */
export function storyTitle(exportName: string, storyName?: string): string {
  if (storyName && storyName !== exportName) return storyName;
  const words = exportName.replace(/([a-z0-9])([A-Z])/g, '$1 $2').split(' ');
  return [
    words[0],
    ...words.slice(1).map((w) => (/^[A-Z]{2,}/.test(w) ? w : w.toLowerCase())),
  ].join(' ');
}
