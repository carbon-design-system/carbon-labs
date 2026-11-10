/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Motion Icons › Gallery (dev only: stories): one page for the four
 * behaviours, in this order: Toggle, Status, Action, Hover. The content switcher at the top switches the behaviour in place: nothing navigates and
 * nothing remounts but the behaviour's own content. The page reads:
 *
 *  1. the header, and the behaviour switcher;
 *  2. what the behaviour is and when to use it, and its API, React and web
 *     component side by side (behaviours.tsx);
 *  3. the toolbar: search, group, sizes (32 by default, all four, or another
 *     one), motion (animated, or still as under reduced motion), theme (when
 *     the host can switch it), and the behaviour's own page-wide controls
 *     (Status: tone);
 *  4. the cards, grouped (galleryKit.tsx).
 *
 * A switch: the selector glides (the host's content switcher, kept mounted
 * and controlled), the group resets (each behaviour has its own groups), the
 * search stays, and the behaviour's content (2 and 4) swaps in the switch's
 * direction, out then in (motion-core `playContentSwap`: the old content
 * moves 8px away and fades, then the new follows from 8px). A behaviour's content stays mounted once
 * visited, hidden, so switching back is instant and keeps its cards' state and
 * its lazily mounted sections.
 *
 * The behaviour, search, group, sizes and motion live in the host's URL
 * (Storybook: the story's args), so a page can be linked:
 * `?path=/story/motion-icons-gallery--gallery&args=behaviour:Action;q:copy`.
 */
import React, {
  memo,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Search } from '@carbon-labs/react-search';
import { Select, SelectItem } from '@carbon-labs/react-select';
import { playContentSwap } from '@carbon-labs/v12-motion';
import { inertProps } from '@carbon-labs/react-util';
import { MotionIconProvider } from '../context/MotionIconProvider';
import {
  ApiTable,
  KIT_CSS,
  PageOptions,
  SIZES,
  useApiOpen,
  type Size,
} from './galleryKit';
import { BEHAVIOURS, BEHAVIOUR_ORDER, type Behaviour } from './behaviours';
import {
  Field,
  Switcher,
  THEMES,
  ToneChips,
  useGalleryUI,
  type ToneChoice,
} from './statusControls';
import { TOGGLE_GROUPS, ToggleGallery } from './ToggleGallery';
import { STATUS_GROUPS, StatusGallery } from './StatusGallery';
import { ACTION_GROUPS, ActionGallery } from './ActionGallery';
import { HOVER_GROUPS, HoverGallery } from './HoverGallery';

/**
 * The page state the Gallery story declares as args, so Storybook keeps it in
 * the URL and restores it from a link (`&args=behaviour:Hover;q:arrow;sizes:all`).
 */
export const PAGE_ARGS = {
  behaviour: 'Toggle',
  q: '',
  group: '',
  sizes: '32',
  motion: 'animated',
};

export interface GalleryFilter {
  query: string;
  /** A group's name, or '' for every group. */
  group: string;
}

type Density = 'all' | `${Size}`;
const DENSITIES: readonly (readonly [Density, string])[] = [
  ['all', 'all'],
  ...SIZES.map((s) => [`${s}`, `${s}`] as const),
];

/** Page state kept in the host's URL; the setter writes it there too (debounced for typing). */
export function useUrlState(
  key: string,
  fallback: string
): [string, (v: string) => void] {
  const { urlState } = useGalleryUI();
  const [value, setValue] = useState(() => urlState?.get(key) ?? fallback);
  const timer = useRef<number>(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const set = (v: string) => {
    setValue(v);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => urlState?.set(key, v === fallback ? undefined : v),
      key === 'q' ? 400 : 0
    );
  };
  return [value, set];
}

/** The pages' opening line. The host names the page (Storybook's sidebar, the review app's heading). */
export function PageHeader({ lede }: { lede: React.ReactNode }) {
  return (
    <header className="mi-header">
      <p className="mi-header__lede">{lede}</p>
    </header>
  );
}

/** theme: white, g10, g90, g100 (when the host can switch it). */
export function ThemeField() {
  const { theme } = useGalleryUI();
  if (!theme) return null;
  return (
    <Field label="theme">
      <Switcher
        size="sm"
        label="theme"
        options={THEMES.map((t) => [t, t] as const)}
        value={theme.value}
        onChange={theme.onChange}
      />
    </Field>
  );
}

/** Each behaviour's groups and cards. */
const GALLERIES: Record<
  Behaviour,
  {
    groups: readonly string[];
    cards: (f: GalleryFilter, tone: ToneChoice) => React.ReactNode;
  }
> = {
  Toggle: { groups: TOGGLE_GROUPS, cards: (f) => <ToggleGallery {...f} /> },
  Status: {
    groups: STATUS_GROUPS,
    cards: (f, tone) => <StatusGallery {...f} tone={tone} />,
  },
  Action: { groups: ACTION_GROUPS, cards: (f) => <ActionGallery {...f} /> },
  Hover: { groups: HOVER_GROUPS, cards: (f) => <HoverGallery {...f} /> },
};

const isBehaviour = (b: string | undefined): b is Behaviour =>
  (BEHAVIOUR_ORDER as readonly string[]).includes(b ?? '');

/**
 * The page. Memoised: it reads its URL state once, as it mounts, and owns it
 * after, so the host's re-render on each URL write (Storybook re-renders the
 * story when an arg changes) stops here.
 */
export const GalleryPage = memo(function GalleryPage() {
  const { webComponents } = useGalleryUI();
  const [urlBehaviour, setUrlBehaviour] = useUrlState('behaviour', 'Toggle');
  const behaviour: Behaviour = isBehaviour(urlBehaviour)
    ? urlBehaviour
    : 'Toggle';
  const [query, setQuery] = useUrlState('q', '');
  const [group, setGroup] = useUrlState('group', '');
  const [density, setDensity] = useUrlState('sizes', '32');
  const [motion, setMotion] = useUrlState('motion', 'animated');
  const [tone, setTone] = useState<ToneChoice>(false);
  const [api, setApi] = useApiOpen();
  // The behaviours visited so far: their content stays mounted, hidden.
  const [visited, setVisited] = useState<readonly Behaviour[]>([behaviour]);
  // The switcher moves at once; the content follows in a render React can
  // interrupt, so a first visit's mount doesn't hold up the selector's glide.
  const shown = useDeferredValue(behaviour);
  const info = BEHAVIOURS[shown];
  const animated = motion !== 'still';
  const sizes = useMemo(
    () => ({
      sizes:
        density === 'all' ? SIZES : SIZES.filter((s) => `${s}` === density),
    }),
    [density]
  );
  // A behaviour mounts when it's shown (the deferred render), never hidden: its first sections mount on screen.
  if (!visited.includes(shown)) setVisited([...visited, shown]);
  const mounted = BEHAVIOUR_ORDER.filter(
    (b) => b === shown || visited.includes(b)
  );

  const switchTo = (b: Behaviour) => {
    if (b === behaviour) return;
    setUrlBehaviour(b);
    // Each behaviour has its own groups; the search carries over.
    if (group) setGroup('');
  };

  return (
    <div className="mi-page">
      <style>{KIT_CSS}</style>
      <PageHeader
        lede={`Carbon icons that move. At rest each one draws exactly like its Carbon icon. Pick a behavior to see what it does, and how to use it in React${webComponents ? ' or as a web component' : ''}.`}
      />

      <nav className="mi-behaviours" aria-label="Icon behavior">
        <Switcher
          size="md"
          label="Icon behavior"
          options={BEHAVIOUR_ORDER.map((b) => [b, b] as const)}
          value={behaviour}
          onChange={switchTo}
        />
      </nav>

      <SwapPanels
        keys={BEHAVIOUR_ORDER}
        active={shown}
        mounted={mounted}
        label={(b) => `${b}: what it is and its API`}>
        {(b) => (
          <>
            <div className="mi-intro">
              <p className="mi-intro__what">{BEHAVIOURS[b].what}</p>
              <p className="mi-intro__when">
                <strong>When to use it.</strong> {BEHAVIOURS[b].when}
              </p>
            </div>
            <ApiTable
              rows={BEHAVIOURS[b].api}
              caption={BEHAVIOURS[b].apiNote}
              open={api}
              onOpenChange={setApi}
            />
          </>
        )}
      </SwapPanels>

      <div className="mi-toolbar">
        <div className="mi-toolbar__search">
          <Search
            size="sm"
            labelText={`Search ${info.plural}`}
            placeholder={`Search ${info.plural} by name…`}
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
            onClear={() => setQuery('')}
          />
        </div>
        <div className="mi-toolbar__group">
          <Select
            id="mi-group"
            labelText="Group"
            hideLabel
            size="sm"
            value={group}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setGroup(e.target.value)
            }>
            <SelectItem value="" text="All groups" />
            {GALLERIES[shown].groups.map((g) => (
              <SelectItem key={g} value={g} text={g} />
            ))}
          </Select>
        </div>
        <div className="mi-toolbar__break" />
        <Field label="sizes">
          <Switcher
            size="sm"
            label="sizes"
            options={DENSITIES}
            value={density as Density}
            onChange={setDensity}
          />
        </Field>
        <Field label="motion">
          <Switcher
            size="sm"
            label="motion"
            options={
              [
                ['animated', 'animated'],
                ['still', 'still (reduced motion)'],
              ] as const
            }
            value={animated ? 'animated' : 'still'}
            onChange={setMotion}
          />
        </Field>
        <ThemeField />
        {shown === 'Status' && (
          <ToneChips value={tone} onChange={setTone} size="sm" />
        )}
      </div>

      <SwapPanels
        keys={BEHAVIOUR_ORDER}
        active={shown}
        mounted={mounted}
        label={(b) => `${b} icons`}>
        {(b) => (
          // `animated={false}` draws every icon as under prefers-reduced-motion: Carbon's art, still.
          <PageOptions.Provider value={sizes}>
            <MotionIconProvider animated={animated ? undefined : false}>
              {GALLERIES[b].cards(
                { query, group: b === shown ? group : '' },
                tone
              )}
            </MotionIconProvider>
          </PageOptions.Provider>
        )}
      </SwapPanels>
    </div>
  );
});

/** A panel's content, held as it is while the panel is hidden (a hidden Hover doesn't re-filter 600 cards per keystroke). */
const Held = memo(
  ({ children }: { children: React.ReactNode; held: boolean }) => (
    <>{children}</>
  ),
  (_, next) => next.held
);

const reducedMotion = () =>
  typeof matchMedia === 'function' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * One panel per key: the active one shown, the others mounted (`mounted`)
 * and put away (`data-off`: out of flow, `content-visibility: hidden`, which
 * keeps their rendering state so showing one again is cheap; inert). A change
 * of `active` is the content swap, out then in (motion-core
 * `playContentSwap`, as the content switcher's panels), along x in the
 * switch's direction. The container isn't animated: the page is as long
 * as the panel it shows (the leaving one overlaps it, out of flow, until it
 * has gone).
 */
function SwapPanels<K extends string>({
  keys,
  active,
  mounted,
  label,
  children,
}: {
  keys: readonly K[];
  active: K;
  mounted: readonly K[];
  label: (k: K) => string;
  children: (k: K) => React.ReactNode;
}) {
  const refs = useRef(new Map<K, HTMLDivElement>());
  const prev = useRef(active);

  useLayoutEffect(() => {
    const from = prev.current;
    prev.current = active;
    if (from === active) return;
    const inEl = refs.current.get(active);
    const outEl = refs.current.get(from);
    if (!inEl) return;
    delete inEl.dataset.leaving;
    // React has put the old panel away; it stays on screen, inert, for its exit.
    if (outEl) outEl.dataset.leaving = '';
    const swap = playContentSwap({
      out: outEl ?? null,
      in: inEl,
      direction: Math.sign(keys.indexOf(active) - keys.indexOf(from)) || 1,
      reduced: reducedMotion(),
    });
    const putAway = () => {
      if (outEl && prev.current !== from) delete outEl.dataset.leaving;
      swap.outAnimation?.cancel();
    };
    if (swap.outAnimation) swap.outAnimation.onfinish = putAway;
    else putAway();
  }, [active, keys]);

  return (
    <div className="mi-panels">
      {mounted.map((k) => (
        <div
          key={k}
          ref={(el) => {
            if (el) refs.current.set(k, el);
            else refs.current.delete(k);
          }}
          className="mi-panel"
          role="region"
          aria-label={label(k)}
          data-off={k !== active ? '' : undefined}
          aria-hidden={k !== active || undefined}
          {...inertProps(k !== active)}>
          <Held held={k !== active}>{children(k)}</Held>
        </div>
      ))}
    </div>
  );
}
