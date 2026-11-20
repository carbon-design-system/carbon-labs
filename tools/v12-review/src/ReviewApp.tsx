/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The review app: every v12 component in one app, built from the components
// themselves and driven by their stories. The shell is the kit's AppShell
// (inset workspace, ghost header, a ghost SideNav by category with its filter); a
// page, under its ghost PageHeader, is the home (every component by
// category, searchable) or one component (each of its stories, its
// settings, its motion and its props).
// The picks (theme, density, corners, motion, clock, direction) are
// the workbench's, applied by its WorkbenchFrame, and kept in this browser.
// The header and the nav stay dark (v12 dark); the theme pick, v12 light or
// v12 dark, is the workspace's, and the page's, so what the stories portal to
// the body follows it too.
// The fold toggle sits below the nav, at the foot of its column. Folded, the
// nav is a strip of a search button at its top and the toggle at its foot:
// the filter's field folds into the button, its magnifier moving to the
// button's place, size and color on the fold's clock (`--cds-nav-fold`,
// review.scss).

import React, {
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppShell, Header } from '@carbon-labs/react-app-shell';
import type { AppShellProps } from '@carbon-labs/react-app-shell';
import {
  SideNav,
  SideNavGroup,
  SideNavLink,
} from '@carbon-labs/react-side-nav';
import { ContentSwitcher, Switch } from '@carbon-labs/react-content-switcher';
import { IconButton } from '@carbon-labs/react-tooltip';
import {
  AsleepAwakeToggle,
  Carbon,
  Search,
  Settings as Gear,
} from '@carbon-labs/react-motion-icons';
import { Link } from '@carbon-labs/react-link';
import { WorkbenchFrame } from '@carbon-labs/v12-workbench';
import type { WorkbenchGlobals } from '@carbon-labs/v12-workbench';
import { entriesOf, groupsOf, hrefOf, usePicks, useRoute } from './model';
import type { Entry, StoryFiles } from './model';
import { Home } from './Home';
import { ComponentPage, loadStories } from './ComponentPage';
import { PageTop } from './PageTop';
import { PageSwap } from './PageSwap';
import { FloatingSettings, Settings } from './Settings';
import { useMarkFavicon } from './favicon';
import './review.scss';

export interface ReviewAppProps {
  /** The v12 story files, loaded on request (the bundler's context). */
  stories: StoryFiles;
}

/** Medium: the overlay, not a rail (the nav has no icons); larger, its fold hides it. */
const LAYOUT: AppShellProps['layout'] = { medium: { nav: 'overlay' } };

export function ReviewApp({ stories }: ReviewAppProps) {
  const entries = useMemo(() => entriesOf(stories), [stories]);
  const groups = useMemo(() => groupsOf(entries), [entries]);
  const route = useRoute();
  const [picks, setPicks] = usePicks();
  // The filter's text, kept while the overlay is shut and across size classes; and whether the strip's search
  // button asked for the field.
  const filter = useRef<FilterMemory>({ query: '', field: null });

  const bySlug = useMemo(
    () => new Map([...entries.values()].map((e) => [e.slug, e])),
    [entries]
  );
  const entry = route.page === 'component' ? bySlug.get(route.slug) : undefined;

  // A page's stories load as the page change begins, while the page shown goes out.
  useEffect(() => {
    if (entry) {
      loadStories(stories, entry.file).catch(() => {});
    }
  }, [entry, stories]);

  useEffect(() => {
    document.title = entry ? `${entry.title} · v12 review` : 'v12 review';
  }, [entry]);

  return (
    <WorkbenchFrame globals={picks}>
      <AppShell
        className="v12r-shell cds--v12-dark"
        scope="page"
        frame="inset"
        mainTheme={picks.theme === 'v12-dark' ? 'dark' : 'light'}
        layout={LAYOUT}
        foldTo="hide"
        foldToggle="foot"
        navStrip={({ unfold }) => (
          <IconButton
            frame="ghost"
            size="lg"
            corners="full"
            align="right"
            label="Filter pages"
            onClick={() => {
              unfold();
              // The nav is in view once the unfold has rendered.
              requestAnimationFrame(() =>
                filter.current.field?.focus({ preventScroll: true })
              );
            }}>
            <Search size={20} aria-hidden="true" />
          </IconButton>
        )}
        mainProps={{ id: 'main-content', className: 'v12r-main' }}
        header={<ReviewHeader picks={picks} onPicks={setPicks} />}
        nav={({ close }) => (
          <ReviewNav
            memory={filter}
            groups={groups}
            current={entry?.name ?? (route.page === 'home' ? 'home' : '')}
            onEscape={close}
          />
        )}>
        {/* A page's floating settings button: the app's, beside the swap, so it doesn't move with the page. */}
        <FloatingSettings theme={picks.theme}>
          <PageSwap
            id={route.page === 'home' ? 'home' : (entry?.name ?? 'not-found')}>
            {route.page === 'home' ? (
              <Home groups={groups} />
            ) : entry ? (
              <ComponentPage
                key={entry.name}
                entry={entry}
                stories={stories}
                picks={picks}
                story={route.story}
              />
            ) : (
              <div className="v12r-page">
                <PageTop
                  title="Not found"
                  subtitle={
                    <>
                      No component at this address.{' '}
                      <Link inline href="#/">
                        See them all
                      </Link>
                      .
                    </>
                  }
                />
              </div>
            )}
          </PageSwap>
        </FloatingSettings>
      </AppShell>
    </WorkbenchFrame>
  );
}

/* ── the header and its picks ───────────────────────────────────────────── */

const PICKS: {
  key: Exclude<keyof WorkbenchGlobals, 'theme'>;
  label: string;
  options: [string, string][];
}[] = [
  {
    key: 'density',
    label: 'Density',
    options: [
      ['compact', 'Compact'],
      ['default', 'Default'],
      ['spacious', 'Spacious'],
    ],
  },
  {
    key: 'corners',
    label: 'Corners',
    options: [
      ['default', 'Own'],
      ['full', 'Full'],
      ['rounded', 'Rounded'],
      ['square', 'Square'],
    ],
  },
  {
    key: 'reducedMotion',
    label: 'Motion',
    options: [
      ['system', 'System'],
      ['full', 'Full'],
      ['shorter-clock', 'Shorter'],
      ['at-once', 'At once'],
    ],
  },
  {
    key: 'clock',
    label: 'Clock',
    options: [
      ['1', '1x'],
      ['0.25', '0.25x'],
      ['0.1', '0.1x'],
    ],
  },
  {
    key: 'dir',
    label: 'Direction',
    options: [
      ['ltr', 'Left to right'],
      ['rtl', 'Right to left'],
    ],
  },
];

function ReviewHeader({
  picks,
  onPicks,
}: {
  picks: WorkbenchGlobals;
  onPicks: (next: Partial<WorkbenchGlobals>) => void;
}) {
  const mark = useRef<HTMLSpanElement>(null);
  useMarkFavicon(mark);
  return (
    <Header
      aria-label="v12 review"
      className="v12r-header"
      frame="ghost"
      href="#/"
      logo={
        <span ref={mark} className="v12r-mark">
          <Carbon size={20} aria-hidden="true" />
        </span>
      }
      name="Carbon"
      product="v12 review"
      actions={
        <>
          <Settings
            label="Density, corners, motion, clock and direction"
            title="Settings"
            detail="Every page"
            align="bottom-end"
            tooltipAlign="bottom-end"
            icon={<Gear size={20} aria-hidden="true" />}
            className="v12r-settings--picks">
            {PICKS.map((p) => (
              <div key={p.key} className="v12r-pick">
                <span className="v12r-pick__label" id={`v12r-pick-${p.key}`}>
                  {p.label}
                </span>
                <ContentSwitcher
                  aria-labelledby={`v12r-pick-${p.key}`}
                  size="sm"
                  selectedIndex={Math.max(
                    0,
                    p.options.findIndex(([v]) => v === picks[p.key])
                  )}
                  onChange={({ index }) =>
                    onPicks({
                      [p.key]: p.options[index ?? 0][0],
                    } as Partial<WorkbenchGlobals>)
                  }>
                  {p.options.map(([value, text]) => (
                    <Switch key={value} name={value} text={text} />
                  ))}
                </ContentSwitcher>
              </div>
            ))}
          </Settings>
          <IconButton
            frame="ghost"
            size="lg"
            corners="full"
            align="bottom-end"
            label={
              picks.theme === 'v12-light'
                ? 'Switch to v12 dark'
                : 'Switch to v12 light'
            }
            onClick={() =>
              onPicks({
                theme: picks.theme === 'v12-light' ? 'v12-dark' : 'v12-light',
              })
            }>
            <AsleepAwakeToggle
              size={20}
              toggled={picks.theme === 'v12-dark'}
              asButton={false}
            />
          </IconButton>
        </>
      }
    />
  );
}

/* ── the side nav ───────────────────────────────────────────────────────── */

/** The filter's text, and its field (the strip's search button focuses it). */
interface FilterMemory {
  query: string;
  field: HTMLInputElement | null;
}

/**
 * The filter's fold: where its magnifier goes as the nav folds, so it lands on
 * the strip's search button, the button at the strip's top, in line with the
 * toggle at its foot and its size (AppShell's strip). Written on the field as
 * `--v12r-fold-dx`, `-dy` (px) and `-scale`; review.scss moves the
 * magnifier's icon by them times the fold's progress. Measured from its slot,
 * which doesn't move: not while the column folds (`data-folding`, nothing it
 * measures moves) or is the strip (the field out of view), and again when
 * that ends.
 */
function useFilterFold(input: React.RefObject<HTMLInputElement | null>) {
  useLayoutEffect(() => {
    const search = input.current?.closest<HTMLElement>('.cds-search');
    const col = search?.closest<HTMLElement>('.cds-app-shell__nav-col');
    const slot = search?.querySelector<HTMLElement>('.cds-search__magnifier');
    const icon = slot?.querySelector('svg');
    const foot = col?.querySelector<HTMLElement>(
      ':scope > .cds-app-shell__nav-foot[data-fold-toggle]'
    );
    const toggle = foot?.querySelector<HTMLElement>('.cds-app-shell__fold');
    const toggleIcon = toggle?.querySelector('svg');
    if (!search || !col || !slot || !icon || !foot || !toggle || !toggleIcon)
      return;
    const place = () => {
      if (col.hasAttribute('data-folding') || !search.offsetWidth) {
        return;
      }
      const s = slot.getBoundingClientRect();
      const t = toggle.getBoundingClientRect();
      const c = col.getBoundingClientRect();
      const size = parseFloat(icon.getAttribute('width') ?? '') || 16;
      const pad = parseFloat(getComputedStyle(slot).paddingInlineStart) || 0;
      const rtl = getComputedStyle(slot).direction === 'rtl';
      // The icon's center, untransformed: its slot puts it `pad` in, centered down.
      const ox = rtl ? s.width - pad - size / 2 : pad + size / 2;
      const oy = s.height / 2;
      // The strip's search button: at its top, inset as the toggle is at the
      // foot's start (the strip's head and the foot share that inset), its size.
      const inset = parseFloat(getComputedStyle(foot).paddingInlineStart) || 0;
      const tx = t.left + t.width / 2;
      const ty = c.top + inset + t.height / 2;
      const to = parseFloat(toggleIcon.getAttribute('width') ?? '') || size;
      search.style.setProperty('--v12r-fold-dx', `${tx - (s.left + ox)}px`);
      search.style.setProperty('--v12r-fold-dy', `${ty - (s.top + oy)}px`);
      search.style.setProperty('--v12r-fold-scale', String(to / size));
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(search);
    ro.observe(col);
    // A direction change moves both ends without resizing the field; a fold's end lets it measure again.
    const mo = new MutationObserver(place);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir'],
    });
    mo.observe(col, { attributes: true, attributeFilter: ['data-folding'] });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [input]);
}

/**
 * The nav: drawn again only when what it shows changes (the shell renders on
 * each fold; the nav stays as it was).
 */
const ReviewNav = memo(function ReviewNav({
  memory,
  groups,
  current,
  onEscape,
}: {
  memory: React.MutableRefObject<FilterMemory>;
  groups: ReturnType<typeof groupsOf>;
  current: string;
  onEscape: () => void;
}) {
  const [query, setQuery] = useState(memory.current.query);
  const input = useRef<HTMLInputElement>(null);
  useFilterFold(input);
  // The field, for the strip's search button.
  useEffect(() => {
    const held = memory.current;
    held.field = input.current;
    return () => {
      held.field = null;
    };
  }, [memory]);
  const link = (e: Entry) => (
    <SideNavLink
      key={e.name}
      href={hrefOf({ page: 'component', slug: e.slug })}
      current={current === e.name}
      keywords={[e.name]}>
      {e.title}
    </SideNavLink>
  );
  return (
    <SideNav
      aria-label="Components"
      className="v12r-nav"
      frame="ghost"
      filter={{
        inputRef: input,
        value: query,
        onChange: (next: string) => {
          memory.current.query = next;
          setQuery(next);
        },
        onEscape,
      }}>
      <SideNavLink key="home" href="#/" current={current === 'home'}>
        All components
      </SideNavLink>
      {groups.map((g) => (
        <SideNavGroup key={g.id} title={g.title}>
          {g.entries.map(link)}
        </SideNavGroup>
      ))}
    </SideNav>
  );
});
