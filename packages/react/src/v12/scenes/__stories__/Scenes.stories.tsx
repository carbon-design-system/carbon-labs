/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Scenes: one component in a realistic host, for the behavior tier
// (tools/v12-scenes) to drive and sample frame by frame. Each story is a
// host; its arguments pick the component and what it takes, so one built
// Storybook serves every scenario through the address
// (`&args=subject:side-panel;size:2xl`). Right to left is the `dir` global,
// the themes are the theme global, and reduced motion is the browser's.

import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { spacing07 } from '@carbon/layout';
import { AppShell, Header } from '@carbon-labs/react-app-shell';
import type { AppShellNavRenderProps } from '@carbon-labs/react-app-shell';
import { Dashboard, Deploy, Settings } from '@carbon-labs/react-motion-icons';
import { Scroller } from '@carbon-labs/react-scroller';
import { SideNav, SideNavLink } from '@carbon-labs/react-side-nav';
import { useScene } from './scene';
import { partsOf, SUBJECTS } from './subjects';
import type { SceneArgs } from './subjects';

export default {
  title: 'V12/Scenes',
  // No docs page: a scene is a test host, not a component.
  tags: ['alpha', '!autodocs'],
  parameters: {
    layout: 'fullscreen',
    v12: {
      // Every motion here is a component's own, listed on its page.
      motion: [],
      reduced: {},
      states: ['closed', 'open'],
    },
  },
  argTypes: {
    subject: { control: 'select', options: SUBJECTS },
    frame: { control: 'text' },
    size: { control: 'text' },
    placement: { control: 'text' },
    at: { control: 'inline-radio', options: ['start', 'end'] },
    variant: { control: 'text' },
    open: { control: 'boolean' },
  },
  args: {
    subject: 'contextual-bar',
    frame: '',
    size: 'md',
    placement: '',
    at: 'start',
    variant: 'select',
    open: false,
  },
};

const text: CSSProperties = { margin: 0, maxInlineSize: '40rem' };
const PARAGRAPH =
  'The page goes on below. Each paragraph is a block of content that scrolls under anything docked above it, and nothing of it should show above a docked bar.';

/** The page's content: a heading, then enough to scroll. */
function Content({ count = 40 }: { count?: number }) {
  return (
    <div
      style={{ display: 'grid', gap: 16, paddingBlockStart: 16 }}
      data-scene-content="">
      <h1 style={{ margin: 0 }} data-scene-item="">
        A page
      </h1>
      {Array.from({ length: count }, (_, i) => (
        <p key={i} style={text} data-scene-item="">
          {PARAGRAPH}
        </p>
      ))}
    </div>
  );
}

/** The shells' nav: three links. */
function Nav({ shell }: { shell: AppShellNavRenderProps }) {
  return (
    <SideNav
      aria-label="Scene"
      collapsible={shell.collapsible}
      collapsed={shell.collapsed}
      onCollapsedChange={shell.onCollapsedChange}>
      <SideNavLink href="#overview" current renderIcon={Dashboard}>
        Overview
      </SideNavLink>
      <SideNavLink href="#deployments" renderIcon={Deploy}>
        Deployments
      </SideNavLink>
      <SideNavLink href="#settings" renderIcon={Settings}>
        Settings
      </SideNavLink>
    </SideNav>
  );
}

type Host = 'inset-shell' | 'flush-shell' | 'scroller' | 'page';

/** One host with its subject. */
function Scene({ host, args }: { host: Host; args: SceneArgs }) {
  const [state, set] = useScene({
    open: args.open,
    size: args.size,
    index: 0,
    toasts: 0,
  });
  const shell = host === 'inset-shell' || host === 'flush-shell';
  const parts = partsOf(args, state, set, shell);
  // No gap between the subject and the page: a subject that takes room
  // (an inline bar) brings its own, and one that comes and goes must not
  // add a gap of the host's at once.
  const page = (
    <div>
      {parts.lead}
      {parts.content && <Content />}
    </div>
  );
  let out: ReactNode;
  if (shell) {
    out = (
      <AppShell
        frame={host === 'inset-shell' ? 'inset' : 'flush'}
        header={<Header aria-label="Scene" name="Scene" product="Shell" />}
        nav={(n: AppShellNavRenderProps) => <Nav shell={n} />}
        panel={parts.panel}
        mainProps={{
          id: 'scene-main',
          style: { padding: spacing07 },
        }}>
        {page}
      </AppShell>
    );
  } else if (host === 'scroller') {
    out = (
      <div style={{ padding: spacing07 }}>
        <Scroller
          aria-label="Scene"
          data-scene-scroller=""
          style={{
            ['--cds-contextual-bar-top' as string]: '0px',
            blockSize: 480,
            maxInlineSize: '48rem',
            border: '1px solid var(--cds-border-subtle-01, #c6c6c6)',
          }}>
          <div style={{ padding: 16 }}>{page}</div>
        </Scroller>
      </div>
    );
  } else {
    out = (
      <div
        style={{
          ['--cds-contextual-bar-top' as string]: '0px',
          padding: spacing07,
          maxInlineSize: '48rem',
        }}>
        {page}
      </div>
    );
  }
  return (
    <div data-scene-host={host} data-scene-subject={args.subject}>
      {parts.wrap ? parts.wrap(out) : out}
    </div>
  );
}

/** An app shell with an inset workspace and a side nav; the page scrolls. */
export const InsetShell = {
  render: (args: SceneArgs) => <Scene host="inset-shell" args={args} />,
};

/** The same shell with a flush workspace. */
export const FlushShell = {
  render: (args: SceneArgs) => <Scene host="flush-shell" args={args} />,
};

/** A Scroller with long content: the Scroller scrolls, the page does not. */
export const InScroller = {
  render: (args: SceneArgs) => <Scene host="scroller" args={args} />,
};

/** A page that scrolls: the window is the scroller. */
export const PageScroll = {
  render: (args: SceneArgs) => <Scene host="page" args={args} />,
};
