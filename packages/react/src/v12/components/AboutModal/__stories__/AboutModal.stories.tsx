/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState } from 'react';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { Button } from '@carbon-labs/react-button';
import { AboutModal } from '../index';
import type { AboutModalInfo, AboutModalProps } from '../index';
import mdx from './AboutModal.mdx';

export default {
  title: 'V12/AboutModal',
  component: AboutModal,
  tags: ['alpha'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: mdx,
    },
    v12: {
      motion: ['the-modal-s-snap', 'content', 'tabs'],
      reduced: {
        'the-modal-s-snap': 'shorter-clock',
      },
      states: ['closed', 'open'],
    },
  },
  argTypes: {
    backdrop: { control: 'object' },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    open: { control: false },
    logo: { control: false },
    content: { control: false },
    links: { control: false },
    additionalInfo: { control: false },
    launcherButtonRef: { control: false },
  },
};

/** Room for the launcher. The modal itself covers the viewport. */
const stage = {
  display: 'flex',
  gap: 16,
  flexWrap: 'wrap' as const,
  alignItems: 'flex-start',
  padding: 32,
  minBlockSize: 320,
};

const text = { margin: 0 };

/** A made-up product mark. */
function Logo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true">
      <rect x="2" y="2" width="28" height="28" rx="6" fillOpacity="0.16" />
      <circle cx="16" cy="16" r="7" />
    </svg>
  );
}

const CONTENT = (
  <p style={text}>
    Version 4.2.0. Example Studio helps teams plan, build and track their work
    in one place.
  </p>
);

const COPYRIGHT = '© Example Corp. All rights reserved.';

const LINKS = [
  <a key="docs" className="cds--link" href="https://example.com/docs">
    Documentation
  </a>,
  <a key="notes" className="cds--link" href="https://example.com/notes">
    Release notes
  </a>,
  <a key="support" className="cds--link" href="https://example.com/support">
    Support
  </a>,
];

/** Press the button to open the modal. The close button, Escape or a press outside closes it. */
export const Default = {
  args: {
    title: 'Example Studio',
    copyrightText: COPYRIGHT,
    closeIconDescription: 'Close',
    shadow: false,
    timeScale: 1,
  },
  render: function DefaultStory(args: AboutModalProps) {
    const [open, setOpen] = useState(false);
    const launcher = useRef<HTMLElement>(null);
    return (
      <div style={stage}>
        <Button
          size="sm"
          variant="outlined"
          ref={launcher}
          onClick={() => setOpen(true)}>
          About this product
        </Button>
        <AboutModal
          {...args}
          open={open}
          launcherButtonRef={launcher}
          logo={<Logo />}
          content={CONTENT}
          onClose={() => {
            setOpen(false);
          }}
        />
      </div>
    );
  },
};

/** A row of links under the content. */
export const WithLinks = {
  render: function WithLinksStory() {
    const [open, setOpen] = useState(false);
    return (
      <div style={stage}>
        <Button size="sm" variant="outlined" onClick={() => setOpen(true)}>
          About this product
        </Button>
        <AboutModal
          open={open}
          title="Example Studio"
          logo={<Logo />}
          content={CONTENT}
          links={LINKS}
          copyrightText={COPYRIGHT}
          onClose={() => {
            setOpen(false);
          }}
        />
      </div>
    );
  },
};

const LEGAL = Array.from(
  { length: 6 },
  (_, i) =>
    `Clause ${i + 1}. The software is provided as is, without warranty of any kind. You may use it under the terms of the license that came with it.`
);

/** One additional information item shows as a block under the content. Long text scrolls with the body. */
export const LegalText = {
  render: function LegalTextStory() {
    const [open, setOpen] = useState(false);
    const info: AboutModalInfo[] = [
      {
        label: 'License',
        content: (
          <div style={{ display: 'grid', gap: 8 }}>
            {LEGAL.map((p) => (
              <p key={p} style={text}>
                {p}
              </p>
            ))}
          </div>
        ),
      },
    ];
    return (
      <div style={stage}>
        <Button size="sm" variant="outlined" onClick={() => setOpen(true)}>
          About this product
        </Button>
        <AboutModal
          open={open}
          title="Example Studio"
          logo={<Logo />}
          content={CONTENT}
          additionalInfo={info}
          copyrightText={COPYRIGHT}
          onClose={() => {
            setOpen(false);
          }}
        />
      </div>
    );
  },
};

const TABS: AboutModalInfo[] = [
  {
    label: 'Version',
    content: <p style={text}>Build 4.2.0. Server 3.8.1. Database schema 27.</p>,
  },
  {
    label: 'Licenses',
    content: (
      <p style={text}>
        This product includes open source components. Each one keeps its own
        license, listed in the notices file.
      </p>
    ),
  },
  {
    label: 'Support',
    content: (
      <p style={text}>
        Contact your administrator for help with your account. Include the
        version above in any request.
      </p>
    ),
  },
];

/** Several additional information items show as tabs. The marker glides between them and the panels swap out, then in. */
export const WithTabs = {
  render: function WithTabsStory() {
    const [open, setOpen] = useState(false);
    return (
      <div style={stage}>
        <Button size="sm" variant="outlined" onClick={() => setOpen(true)}>
          About this product
        </Button>
        <AboutModal
          open={open}
          title="Example Studio"
          logo={<Logo />}
          content={CONTENT}
          links={LINKS}
          additionalInfo={TABS}
          copyrightText={COPYRIGHT}
          onClose={() => {
            setOpen(false);
          }}
        />
      </div>
    );
  },
};
