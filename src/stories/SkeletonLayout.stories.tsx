/**
 * Copyright IBM Corp. 2025
 *
 * SkeletonLayout stories.
 */

import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SkeletonLayout, SkeletonBlock } from '../components/SkeletonLayout/SkeletonLayout';
import type { SkeletonLayoutProps } from '../components/SkeletonLayout/SkeletonLayout.types';
import { readDurationToken, readEasingToken } from '../hooks/useAnimation';
import s from './SkeletonLayout.stories.module.css';

const meta = {
  title: 'Components/SkeletonLayout',
  component: SkeletonLayout,
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Progressively-revealed skeleton placeholder for complex page layouts. Blocks animate in with a staggered fade and pulse continuously while content loads. Zone-level treatment (AI blue tint, rounded corners) is applied per layout variant rather than via global props.',
      },
    },
  },
  argTypes: {
    layout: {
      control: 'select',
      options: ['hero', 'cards-3', 'cards-4', 'full-page', 'mixed-page'],
      description: 'Layout variant to render',
      table: { defaultValue: { summary: "'hero'" } },
    },
    aiVariant: {
      control: 'boolean',
      description: 'Activates the AI blue-tint on all blocks (component-level override)',
      table: { defaultValue: { summary: 'false' } },
    },
    cornerRadius: {
      control: 'boolean',
      description: 'Apply 8 px corner radius to all blocks (component-level override)',
      table: { defaultValue: { summary: 'false' } },
    },
  },
} satisfies Meta<typeof SkeletonLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Timeline helpers ──────────────────────────────────────────────────────────

const PULSE_LOOPS = 2;

/**
 * Read the skeleton motion tokens from the document root and compute the
 * millisecond offsets needed to drive the full-page demo timeline.
 */
function readTimeline(blockCount: number) {
  const fadeIn  = readDurationToken('--cmw-skeleton-fade-in-duration',  750);
  const stagger = readDurationToken('--cmw-skeleton-stagger-step',       47);
  const loop    = readDurationToken('--cmw-skeleton-loop-duration',    1000);
  const reveal  = readDurationToken('--cmw-skeleton-reveal-duration',   200);
  const easing  = readEasingToken('--cmw-skeleton-easing', 'cubic-bezier(0.20,0.00,0.38,0.90)');
  const revealEasing = readEasingToken('--cmw-skeleton-reveal-easing', 'cubic-bezier(0.00,0.00,0.38,0.90)');

  // Time for all blocks to finish their initial fade-in
  const fadeInEnd = fadeIn + (blockCount - 1) * stagger;
  // Time for one complete pulse cycle across all blocks
  const cycleMs = loop + (blockCount - 1) * stagger;
  // Gap between loop iterations (matches scheduleLoop in useSkeletonAnimation)
  const loopGap = 500;

  return {
    fadeIn, stagger, loop, reveal, easing, revealEasing,
    // When to start the content reveal (after fade-in + N pulse loops)
    revealAt: fadeInEnd + cycleMs * PULSE_LOOPS + loopGap,
    // How long to hold full content before restarting
    holdMs: 3000,
    // Stagger between zone reveals (zones reveal in randomised order)
    zoneStagger: 220,
  };
}

// ── Zone names and their CSS class keys ───────────────────────────────────────
const ZONES = ['header', 'hero', 'cards', 'table'] as const;
type Zone = typeof ZONES[number];

/** Return the four zones in a random order — different each demo cycle. */
function shuffleZones(): Zone[] {
  const arr: Zone[] = [...ZONES];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Real content placeholders — Default layout ────────────────────────────────

function ContentHeader() {
  return (
    <header className={s.cHeader} data-content-zone="header">
      <nav className={s.cNavBar}>
        <span className={s.cNavLogo}>IBM Cloud</span>
        <ul className={s.cNavLinks}>
          <li>Dashboard</li>
          <li>Resources</li>
          <li>Catalog</li>
        </ul>
      </nav>
      <p className={s.cBreadcrumb}>Home / Resources / Overview</p>
    </header>
  );
}

function ContentHero() {
  return (
    <section className={s.cHero} data-content-zone="hero">
      <div className={s.cHeroText}>
        <h1 className={s.cHeroTitle}>Resource overview</h1>
        <p className={s.cHeroSub}>Updated 2 minutes ago</p>
      </div>
      <div className={s.cHeroPanel}>
        <span className={s.cHeroPanelLabel}>Chart area</span>
      </div>
    </section>
  );
}

const CARD_DATA = [
  { title: 'Active instances', body: 'Running workloads', value: '24' },
  { title: 'Storage used',     body: 'Across all regions', value: '1.4 TB' },
  { title: 'Avg. response',    body: 'Last 30 minutes',    value: '142 ms' },
  { title: 'Alerts',           body: 'Open incidents',     value: '3' },
];

function ContentCards() {
  return (
    <section className={s.cCards} data-content-zone="cards">
      {CARD_DATA.map((c) => (
        <article key={c.title} className={s.cCard}>
          <p className={s.cCardTitle}>{c.title}</p>
          <p className={s.cCardBody}>{c.body}</p>
          <p className={s.cCardValue}>{c.value}</p>
        </article>
      ))}
    </section>
  );
}

const TABLE_ROWS = [
  { name: 'us-south-prod-01', type: 'Compute',  status: 'Running' },
  { name: 'eu-de-prod-02',    type: 'Storage',  status: 'Running' },
  { name: 'ap-tok-dev-01',    type: 'Compute',  status: 'Stopped' },
];

function ContentTable() {
  return (
    <section className={s.cTable} data-content-zone="table">
      <div className={s.cTableHeader}>
        <span className={s.cTableHeaderCell}>Name</span>
        <span className={s.cTableHeaderCell}>Type</span>
        <span className={s.cTableHeaderCell}>Status</span>
      </div>
      {TABLE_ROWS.map((r) => (
        <div key={r.name} className={s.cTableRow}>
          <span className={s.cTableCell}>{r.name}</span>
          <span className={s.cTableCellMuted}>{r.type}</span>
          <span className={s.cTableCellMuted}>{r.status}</span>
        </div>
      ))}
    </section>
  );
}

// ── Real content placeholders — Mixed layout ──────────────────────────────────
// Hero uses AI-tinted surface; cards use rounded corners matching the skeleton.

function MixedContentHero() {
  return (
    <section className={s.cHero} data-content-zone="hero" data-content-ai="true">
      <div className={s.cHeroText}>
        <h1 className={s.cHeroTitle}>AI-generated summary</h1>
        <p className={s.cHeroSub}>Generated just now by watsonx</p>
      </div>
      <div className={s.cHeroPanel}>
        <span className={s.cHeroPanelLabel}>AI insight panel</span>
      </div>
    </section>
  );
}

function MixedContentCards() {
  return (
    <section className={s.cCards} data-content-zone="cards">
      {CARD_DATA.map((c) => (
        <article key={c.title} className={`${s.cCard} ${s.cCardRounded}`}>
          <p className={s.cCardTitle}>{c.title}</p>
          <p className={s.cCardBody}>{c.body}</p>
          <p className={s.cCardValue}>{c.value}</p>
        </article>
      ))}
    </section>
  );
}

// ── Full-page demo ────────────────────────────────────────────────────────────

interface DemoProps extends SkeletonLayoutProps {
  /** Slot for the hero content zone — lets MixedLayout swap in an AI version */
  heroContent?: React.ReactNode;
  /** Slot for the cards content zone — lets MixedLayout swap in rounded cards */
  cardsContent?: React.ReactNode;
}

function FullPageDemo({
  heroContent,
  cardsContent,
  ...args
}: DemoProps) {
  const [cycle, setCycle] = useState(0);
  const skeletonRef       = useRef<HTMLDivElement>(null);
  const contentRef        = useRef<HTMLDivElement>(null);
  const timersRef         = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  useEffect(() => {
    clearTimers();

    // Reset both layers to their initial visual state each cycle.
    const contentZones = contentRef.current
      ? Array.from(contentRef.current.querySelectorAll<HTMLElement>('[data-content-zone]'))
      : [];
    contentZones.forEach((el) => { el.style.opacity = '0'; });

    // Derive block count from the actual DOM so the timeline stays correct
    // if blocks are ever added or removed from the layout.
    const blockCount = skeletonRef.current
      ? skeletonRef.current.querySelectorAll('[data-skeleton-block]').length
      : 13;
    const tl = readTimeline(blockCount);

    // ── Reveal phase ─────────────────────────────────────────────────────
    const revealTimer = setTimeout(() => {
      const order = shuffleZones();

      order.forEach((zone, i) => {
        const t = setTimeout(() => {
          // Fade in the real content zone
          const contentEl = contentRef.current?.querySelector<HTMLElement>(
            `[data-content-zone="${zone}"]`,
          );
          if (contentEl) {
            contentEl.animate(
              [{ opacity: 0 }, { opacity: 1 }],
              { duration: tl.reveal, easing: tl.revealEasing, fill: 'forwards' },
            );
          }

          // Simultaneously fade out the matching skeleton zone.
          const skeletonZoneEl = skeletonRef.current?.querySelector<HTMLElement>(
            `[data-fp-zone="${zone}"]`,
          );
          if (skeletonZoneEl) {
            const currentOpacity = parseFloat(getComputedStyle(skeletonZoneEl).opacity);
            skeletonZoneEl.getAnimations({ subtree: true }).forEach((a) => a.cancel());
            skeletonZoneEl.animate(
              [{ opacity: currentOpacity }, { opacity: 0 }],
              { duration: tl.reveal, easing: tl.easing, fill: 'forwards' },
            );
          }
        }, i * tl.zoneStagger);
        timersRef.current.push(t);
      });
    }, tl.revealAt);

    timersRef.current.push(revealTimer);

    // ── Hold then restart ────────────────────────────────────────────────
    const allRevealedMs = tl.revealAt + (ZONES.length - 1) * tl.zoneStagger + tl.reveal;
    const restartTimer = setTimeout(() => {
      contentZones.forEach((el) => {
        el.animate(
          [{ opacity: 1 }, { opacity: 0 }],
          { duration: tl.reveal, easing: tl.easing, fill: 'forwards' },
        );
      });
      setTimeout(() => setCycle((c) => c + 1), tl.reveal + 80);
    }, allRevealedMs + tl.holdMs);

    timersRef.current.push(restartTimer);

    return clearTimers;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycle]);

  return (
    <div className={s.demoRoot}>
      {/* Single-cell grid — both layers share the same origin and width */}
      <div className={s.layerStack}>
        {/* Skeleton layer — cross-fades out per zone on reveal */}
        <div ref={skeletonRef} className={s.skeletonLayer}>
          <SkeletonLayout key={cycle} {...args} />
        </div>

        {/* Content layer — zones start at opacity 0 (set by JS on each cycle) */}
        <div className={s.contentLayer}>
          <div ref={contentRef} className={s.contentRoot}>
            <ContentHeader />
            {heroContent ?? <ContentHero />}
            {cardsContent ?? <ContentCards />}
            <ContentTable />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Custom layout skeleton ────────────────────────────────────────────────────
// A 2-column sidebar + main layout — demonstrates SkeletonBlock composition.
// The sidebar holds an AI-tinted panel (watsonx assistant preview);
// the main column holds a nav, hero title, 3 rounded metric cards, and a line.

function CustomSkeletonLayout() {
  return (
    <SkeletonLayout>
      {/* Outer wrapper mirrors the .clRoot CSS class defined below */}
      <div className={s.clRoot}>

        {/* ── Sidebar (AI zone) ──────────────────────── */}
        <div className={s.clSidebar} data-fp-zone="sidebar">
          <SkeletonBlock variant="title"   order={0} zone="sidebar" ai />
          <SkeletonBlock variant="line"    order={1} zone="sidebar" ai />
          <SkeletonBlock variant="line"    order={2} zone="sidebar" ai />
          <SkeletonBlock variant="line-short" order={3} zone="sidebar" ai />
          <SkeletonBlock variant="panel-sm" order={4} zone="sidebar" ai />
        </div>

        {/* ── Main column ────────────────────────────── */}
        <div className={s.clMain}>

          {/* nav zone */}
          <div data-fp-zone="nav">
            <SkeletonBlock variant="nav" order={5} zone="nav" />
          </div>

          {/* hero zone */}
          <div className={s.clHero} data-fp-zone="hero">
            <SkeletonBlock variant="title-lg" order={6} zone="hero" />
            <SkeletonBlock variant="line"     order={7} zone="hero" />
          </div>

          {/* cards zone — 3 rounded metric cards */}
          <div className={s.clCards} data-fp-zone="cards">
            <SkeletonBlock variant="card" order={8}  zone="cards" rounded />
            <SkeletonBlock variant="card" order={9}  zone="cards" rounded />
            <SkeletonBlock variant="card" order={10} zone="cards" rounded />
          </div>

          {/* footer line */}
          <div data-fp-zone="footer">
            <SkeletonBlock variant="line-short" order={11} zone="footer" />
          </div>

        </div>
      </div>
    </SkeletonLayout>
  );
}

// ── Custom layout zones ───────────────────────────────────────────────────────
// The cross-fade orchestration needs to know which zones exist.
const CUSTOM_ZONES = ['sidebar', 'nav', 'hero', 'cards', 'footer'] as const;
type CustomZone = typeof CUSTOM_ZONES[number];

function shuffleCustomZones(): CustomZone[] {
  const arr: CustomZone[] = [...CUSTOM_ZONES];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Custom layout real content ────────────────────────────────────────────────

function CustomContentSidebar() {
  return (
    <div className={s.clSidebar} data-content-zone="sidebar">
      <p className={s.clSidebarTitle}>Assistant</p>
      <p className={s.clSidebarLine}>Ready to help with your resources.</p>
      <p className={s.clSidebarLine}>Try: "Summarise this month's usage."</p>
      <p className={s.clSidebarMuted}>Powered by watsonx</p>
      <div className={s.clSidebarPanel} />
    </div>
  );
}

function CustomContentNav() {
  return (
    <div data-content-zone="nav">
      <nav className={s.cNavBar}>
        <span className={s.cNavLogo}>IBM Cloud</span>
        <ul className={s.cNavLinks}>
          <li>Dashboard</li>
          <li>Resources</li>
          <li>Catalog</li>
        </ul>
      </nav>
    </div>
  );
}

function CustomContentHero() {
  return (
    <div className={s.clHero} data-content-zone="hero">
      <h1 className={s.cHeroTitle}>Usage overview</h1>
      <p className={s.cHeroSub}>Last updated 3 minutes ago</p>
    </div>
  );
}

const METRIC_DATA = [
  { label: 'Compute hours',  value: '1,842' },
  { label: 'Storage (GB)',   value: '412'   },
  { label: 'API calls',      value: '98.3k' },
];

function CustomContentCards() {
  return (
    <div className={s.clCards} data-content-zone="cards">
      {METRIC_DATA.map((m) => (
        <article key={m.label} className={`${s.cCard} ${s.cCardRounded}`}>
          <p className={s.cCardTitle}>{m.label}</p>
          <p className={s.cCardValue}>{m.value}</p>
        </article>
      ))}
    </div>
  );
}

function CustomContentFooter() {
  return (
    <div data-content-zone="footer">
      <p className={s.clFooter}>Showing data for us-south region</p>
    </div>
  );
}

// ── Custom layout demo ────────────────────────────────────────────────────────

function CustomLayoutDemo() {
  const [cycle, setCycle]   = useState(0);
  const skeletonRef         = useRef<HTMLDivElement>(null);
  const contentRef          = useRef<HTMLDivElement>(null);
  const timersRef           = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  useEffect(() => {
    clearTimers();

    const contentZones = contentRef.current
      ? Array.from(contentRef.current.querySelectorAll<HTMLElement>('[data-content-zone]'))
      : [];
    contentZones.forEach((el) => { el.style.opacity = '0'; });

    const blockCount = skeletonRef.current
      ? skeletonRef.current.querySelectorAll('[data-skeleton-block]').length
      : 12;
    const tl = readTimeline(blockCount);

    const revealTimer = setTimeout(() => {
      const order = shuffleCustomZones();

      order.forEach((zone, i) => {
        const t = setTimeout(() => {
          const contentEl = contentRef.current?.querySelector<HTMLElement>(
            `[data-content-zone="${zone}"]`,
          );
          if (contentEl) {
            contentEl.animate(
              [{ opacity: 0 }, { opacity: 1 }],
              { duration: tl.reveal, easing: tl.revealEasing, fill: 'forwards' },
            );
          }

          const skeletonZoneEl = skeletonRef.current?.querySelector<HTMLElement>(
            `[data-fp-zone="${zone}"]`,
          );
          if (skeletonZoneEl) {
            const currentOpacity = parseFloat(getComputedStyle(skeletonZoneEl).opacity);
            skeletonZoneEl.getAnimations({ subtree: true }).forEach((a) => a.cancel());
            skeletonZoneEl.animate(
              [{ opacity: currentOpacity }, { opacity: 0 }],
              { duration: tl.reveal, easing: tl.easing, fill: 'forwards' },
            );
          }
        }, i * tl.zoneStagger);
        timersRef.current.push(t);
      });
    }, tl.revealAt);

    timersRef.current.push(revealTimer);

    const allRevealedMs = tl.revealAt + (CUSTOM_ZONES.length - 1) * tl.zoneStagger + tl.reveal;
    const restartTimer = setTimeout(() => {
      contentZones.forEach((el) => {
        el.animate(
          [{ opacity: 1 }, { opacity: 0 }],
          { duration: tl.reveal, easing: tl.easing, fill: 'forwards' },
        );
      });
      setTimeout(() => setCycle((c) => c + 1), tl.reveal + 80);
    }, allRevealedMs + tl.holdMs);

    timersRef.current.push(restartTimer);

    return clearTimers;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycle]);

  return (
    <div className={s.demoRoot}>
      <div className={s.layerStack}>
        <div ref={skeletonRef} className={s.skeletonLayer}>
          <CustomSkeletonLayout key={cycle} />
        </div>
        <div className={s.contentLayer}>
          <div ref={contentRef} className={s.clRoot}>
            <CustomContentSidebar />
            <div className={s.clMain}>
              <CustomContentNav />
              <CustomContentHero />
              <CustomContentCards />
              <CustomContentFooter />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Stories ───────────────────────────────────────────────────────────────────

export const DefaultLayout: Story = {
  name: 'Default layout',
  render: (args) => <FullPageDemo {...args} layout="full-page" />,
  args: { layout: 'full-page', aiVariant: false, cornerRadius: false },
  parameters: {
    docs: {
      description: {
        story:
          'Full-page skeleton — header, hero, 4-up cards, data table — all using the standard neutral block treatment. The skeleton cascades in twice, then each content zone fades in with a randomised stagger. All colour and motion values are driven by `--cmw-*` tokens.',
      },
    },
  },
};

export const CustomLayout: Story = {
  name: 'Custom layout (SkeletonBlock)',
  render: () => <CustomLayoutDemo />,
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates `SkeletonBlock` composition for an arbitrary 2-column sidebar + main layout — a shape none of the built-in variants support. The sidebar uses AI blue-tinted blocks; the 3 metric cards use 8 px rounded corners. No layout-specific code exists in `SkeletonLayout.tsx` — the page shape, spacing, and zone names are entirely defined here in the story.\n\n```tsx\n<SkeletonLayout>\n  <div className="my-layout">\n    <div data-fp-zone="sidebar">\n      <SkeletonBlock variant="title"    order={0} zone="sidebar" ai />\n      <SkeletonBlock variant="panel-sm" order={4} zone="sidebar" ai />\n    </div>\n    <div data-fp-zone="cards">\n      <SkeletonBlock variant="card" order={8}  zone="cards" rounded />\n      <SkeletonBlock variant="card" order={9}  zone="cards" rounded />\n      <SkeletonBlock variant="card" order={10} zone="cards" rounded />\n    </div>\n  </div>\n</SkeletonLayout>\n```',
      },
    },
  },
};

export const MixedLayout: Story = {
  name: 'Mixed layout',
  render: (args) => (
    <FullPageDemo
      {...args}
      layout="mixed-page"
      heroContent={<MixedContentHero />}
      cardsContent={<MixedContentCards />}
    />
  ),
  args: { layout: 'mixed-page', aiVariant: false, cornerRadius: false },
  parameters: {
    docs: {
      description: {
        story:
          'Mixed-treatment layout: the hero zone uses AI blue-tinted skeleton blocks (`--cmw-skeleton-ai-bg` / `--cmw-skeleton-ai-element`) to signal an AI-generated section, while the 4-up cards zone uses 8 px rounded corners to match a rounded card surface. Header and table zones remain in the default neutral treatment. Zone-level variants are driven by `data-zone-ai` and `data-zone-rounded` attributes in the DOM rather than by component props.',
      },
    },
  },
};
