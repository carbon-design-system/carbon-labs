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
// The header and the nav stay dark; the theme pick is the workspace's, and
// the page's, so what the stories portal to the body follows it too.
// Folded, the nav is a strip of its toggle and a search button: the filter's
// field folds into the button, its magnifier moving to the button's place,
// size and color on the fold's clock (`--cds-nav-fold`, review.scss).

import React, {
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
  SettingsAdjust,
} from '@carbon-labs/react-motion-icons';
import { Popover, PopoverContent } from '@carbon-labs/react-popover';
import { Link } from '@carbon-labs/react-link';
import { WorkbenchFrame } from '@carbon-labs/v12-workbench';
import type { WorkbenchGlobals } from '@carbon-labs/v12-workbench';
import { entriesOf, groupsOf, hrefOf, usePicks, useRoute } from './model';
import type { Entry, StoryFiles } from './model';
import { Home } from './Home';
import { ComponentPage } from './ComponentPage';
import { PageTop } from './PageTop';
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

  const entry =
    route.page === 'component'
      ? [...entries.values()].find((e) => e.slug === route.slug)
      : undefined;

  useEffect(() => {
    document.title = entry ? `${entry.title} · v12 review` : 'v12 review';
  }, [entry]);

  // A new page starts at the top, before its header reads the scroll.
  useLayoutEffect(() => {
    window.scrollTo({ top: 0 });
  }, [route.page, entry?.name]);

  return (
    <WorkbenchFrame globals={picks}>
      <AppShell
        className="v12r-shell cds--g100"
        scope="page"
        frame="inset"
        mainTheme={picks.theme === 'g100' ? 'dark' : 'light'}
        layout={LAYOUT}
        foldTo="hide"
        foldToggle="header"
        navStrip={({ unfold }) => (
          <IconButton
            frame="ghost"
            size="lg"
            corners="full"
            align="right"
            label="Filter pages"
            onClick={() => {
              remembered.focus = true;
              unfold();
            }}>
            <Search size={20} aria-hidden="true" />
          </IconButton>
        )}
        mainProps={{ id: 'main-content', className: 'v12r-main' }}
        header={<ReviewHeader picks={picks} onPicks={setPicks} />}
        nav={({ close }) => (
          <ReviewNav
            groups={groups}
            current={entry?.name ?? (route.page === 'home' ? 'home' : '')}
            onEscape={close}
          />
        )}>
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
  const [open, setOpen] = useState(false);
  const mark = useRef<HTMLSpanElement>(null);
  useMarkFavicon(mark);
  // Each open mounts the switchers again: the selection measures its
  // selected face's width as it mounts, and a closed popover has none.
  const [opened, setOpened] = useState(0);
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
          <Popover
            open={open}
            align="bottom-end"
            variant="outlined"
            onRequestClose={() => setOpen(false)}>
            <IconButton
              frame="ghost"
              size="lg"
              corners="full"
              align="bottom-end"
              label="Density, corners, motion, clock and direction"
              aria-expanded={open}
              onClick={() => {
                if (!open) {
                  setOpened((n) => n + 1);
                }
                setOpen((o) => !o);
              }}>
              <SettingsAdjust size={20} aria-hidden="true" />
            </IconButton>
            <PopoverContent>
              <div
                key={opened}
                className="v12r-picks"
                role="group"
                aria-label="Picks">
                {PICKS.map((p) => (
                  <div key={p.key} className="v12r-pick">
                    <span
                      className="v12r-pick__label"
                      id={`v12r-pick-${p.key}`}>
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
              </div>
            </PopoverContent>
          </Popover>
          <IconButton
            frame="ghost"
            size="lg"
            corners="full"
            align="bottom-end"
            label={
              picks.theme === 'white'
                ? 'Switch to dark theme'
                : 'Switch to light theme'
            }
            onClick={() =>
              onPicks({ theme: picks.theme === 'white' ? 'g100' : 'white' })
            }>
            <AsleepAwakeToggle
              size={20}
              toggled={picks.theme === 'g100'}
              asButton={false}
            />
          </IconButton>
        </>
      }
    />
  );
}

/* ── the side nav ───────────────────────────────────────────────────────── */

/** The filter's text, kept while the overlay is shut, across size classes and folds; and whether the strip's
 *  search button asked for the field. */
const remembered = { query: '', focus: false };

/**
 * The filter's fold: where its magnifier goes as the nav folds, so it lands on
 * the strip's search button, the button under the toggle and its size
 * (AppShell's strip). Written on the field as `--v12r-fold-dx`, `-dy` (px)
 * and `-scale`; review.scss moves the magnifier's icon by them times the
 * fold's progress. Measured from its slot, which doesn't move.
 */
function useFilterFold(input: React.RefObject<HTMLInputElement | null>) {
  useLayoutEffect(() => {
    const search = input.current?.closest<HTMLElement>('.cds-search');
    const col = search?.closest('.cds-app-shell__nav-col');
    const slot = search?.querySelector<HTMLElement>('.cds-search__magnifier');
    const icon = slot?.querySelector('svg');
    const toggle = col?.querySelector<HTMLElement>(
      ':scope > .cds-app-shell__nav-head .cds-app-shell__fold'
    );
    const toggleIcon = toggle?.querySelector('svg');
    if (!search || !slot || !icon || !toggle || !toggleIcon) return;
    const place = () => {
      const s = slot.getBoundingClientRect();
      const t = toggle.getBoundingClientRect();
      const size = parseFloat(icon.getAttribute('width') ?? '') || 16;
      const pad = parseFloat(getComputedStyle(slot).paddingInlineStart) || 0;
      const rtl = getComputedStyle(slot).direction === 'rtl';
      // The icon's centre, untransformed: its slot puts it `pad` in, centred down.
      const ox = rtl ? s.width - pad - size / 2 : pad + size / 2;
      const oy = s.height / 2;
      // The strip's search button: under the toggle, its size, in line with it.
      const tx = t.left + t.width / 2;
      const ty = t.top + t.height * 1.5;
      const to = parseFloat(toggleIcon.getAttribute('width') ?? '') || size;
      search.style.setProperty('--v12r-fold-dx', `${tx - (s.left + ox)}px`);
      search.style.setProperty('--v12r-fold-dy', `${ty - (s.top + oy)}px`);
      search.style.setProperty('--v12r-fold-scale', String(to / size));
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(search);
    return () => ro.disconnect();
  }, [input]);
}

function ReviewNav({
  groups,
  current,
  onEscape,
}: {
  groups: ReturnType<typeof groupsOf>;
  current: string;
  onEscape: () => void;
}) {
  const [query, setQuery] = useState(remembered.query);
  const input = useRef<HTMLInputElement>(null);
  useFilterFold(input);
  // Opened from the strip's search button: the field takes focus as the nav opens.
  useEffect(() => {
    if (!remembered.focus) return;
    remembered.focus = false;
    input.current?.focus({ preventScroll: true });
  }, []);
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
          remembered.query = next;
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
}
