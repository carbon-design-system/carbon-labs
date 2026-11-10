/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import { ContentSwitcher, Switch } from '@carbon-labs/react-content-switcher';
import { PageHeader } from '@carbon-labs/react-page-header';
import { Tag } from '@carbon-labs/react-tag';
import type { CSSProperties, ReactNode } from 'react';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
// The parts' own style sheets, which the other folders' built entries leave out.
import '@carbon-labs/react-activity-feed/scss/activity-feed.scss';
import '@carbon-labs/react-button/scss/button.scss';
import '@carbon-labs/react-button/scss/button-shell.scss';
import '@carbon-labs/react-disclosure/scss/disclosure.scss';
import '@carbon-labs/react-feedback/scss/feedback.scss';
import '@carbon-labs/react-feedback/scss/spinner.scss';
import '@carbon-labs/react-jump-to/scss/jump-to.scss';
import '@carbon-labs/react-menu/scss/menu.scss';
import '@carbon-labs/react-notification/scss/notification.scss';
import '@carbon-labs/react-popover/scss/popover.scss';
import '@carbon-labs/react-processing-v2/scss/processing.scss';
import '@carbon-labs/react-scroller/scss/scroller.scss';
import '@carbon-labs/react-select-list/scss/select-list.scss';
import '@carbon-labs/react-shimmer-text/scss/shimmer-text.scss';
import '@carbon-labs/react-tag/scss/tag.scss';
import '@carbon-labs/react-tag-set/scss/tag-set.scss';
import '@carbon-labs/react-tooltip/scss/tooltip.scss';
import { motionTokens } from '@carbon-labs/v12-motion';
import {
  Add,
  ChatBot,
  Connect,
  NewTab,
  SettingsAdjust,
  SkillLevel,
} from '@carbon-labs/react-motion-icons';
import { IconButton } from '@carbon-labs/react-tooltip';
import { Popover, PopoverContent } from '@carbon-labs/react-popover';
import {
  MenuItem,
  MenuItemDivider,
  MenuItemSelectable,
} from '@carbon-labs/react-menu';
import {
  ChatActions,
  ChatDock,
  ChatMessage,
  ChatPane,
  ChatShell,
  ChatTranscript,
  ChatTurnNavigator,
  FileChips,
  FollowUpCard,
  PromptInput,
  StepList,
  Suggestions,
  TurnStatus,
  countSteps,
} from '../index';
import type {
  ChatCorners,
  ChatShellProps,
  ChatStep,
  ChatTurn,
  ChatVariant,
  ChipFile,
  PromptNoticeValue,
  Step,
  Suggestion,
  TurnStatusValue,
} from '../index';
import mdx from './Chat.mdx';

const VARIANTS: ChatVariant[] = ['inverse', 'tonal', 'outlined'];
const VARIANT_NAME: Record<ChatVariant, string> = {
  inverse: 'Inverse',
  tonal: 'Tonal',
  outlined: 'Outlined',
};
const CORNERS: ChatCorners[] = ['rounded', 'full', 'square'];

export default {
  title: 'V12/ChatShell',
  component: ChatShell,
  subcomponents: {
    ChatDock,
    ChatTranscript,
    ChatTurnNavigator,
    ChatMessage,
    ChatActions,
    PromptInput,
    FileChips,
    Suggestions,
    FollowUpCard,
    ChatPane,
    TurnStatus,
    StepList,
  },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'content-swap-in-a-layout-move',
        'arrival',
        'pinned-scroll',
        'streaming',
        'history',
        'send-to-stop',
        'width-move',
        'sideways-opening',
        'status',
        'rise',
        'jump-to-a-question',
        'marker',
        'selection',
      ],
      reduced: {
        'content-swap-in-a-layout-move': 'at-once',
        streaming: 'shorter-clock',
        history: 'at-once',
        'width-move': 'at-once',
        'sideways-opening': 'at-once',
        status: 'at-once',
        rise: 'at-once',
        'jump-to-a-question': 'at-once',
        marker: 'at-once',
      },
      // TODO reduced: arrival. The column's slide lands at once and a person's turn fades on the reduced clock; the doc gives no one behaviour for both.
      // TODO reduced: pinned-scroll. It keeps the reader's place rather than moving anything; the doc says nothing of it under reduced motion.
      // TODO reduced: send-to-stop. The arrow's out is at once and the square's in fades on the reduced clock; the doc gives no one behaviour for both.
      // TODO reduced: selection. The select list's own, and its doc states none.
      states: [
        'empty',
        'conversation',
        'working',
        'streaming',
        'generating',
        'stopped',
        'notice',
        'files',
        'follow-up',
        'disabled',
      ],
    },
  },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    corners: { control: 'inline-radio', options: CORNERS },
    column: { control: 'text' },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    header: { control: false },
    prompt: { control: false },
    above: { control: false },
    below: { control: false },
    rail: { control: false },
    nav: { control: false },
    aside: { control: false },
    overlay: { control: false },
    children: { control: false },
  },
};

/* ── sample content ───────────────────────────────────────────────────── */

const SUGGESTIONS: Suggestion[] = [
  { text: 'Summarize', secondary: 'the failed deployments this week' },
  { text: 'Find', secondary: 'services without an owner' },
  { text: 'Draft', secondary: 'a rollback plan for checkout' },
];

const MODELS = ['Deep 2', 'Deep 1', 'Balanced 2', 'Quick 2'];

const FILE_NAMES = [
  'deployments.csv',
  'incident-notes.md',
  'service-map.pdf',
  'error-budget.xlsx',
  'config-diff.txt',
];

type NoticeName = 'none' | 'info' | 'warning' | 'error';
const NOTICE_NAMES: NoticeName[] = ['none', 'info', 'warning', 'error'];
const NOTICES: Record<NoticeName, PromptNoticeValue | null> = {
  none: null,
  info: {
    kind: 'info',
    message: 'Connected to the deployments data.',
    action: { label: 'View data' },
  },
  warning: {
    kind: 'warning',
    message: 'Approaching this chat’s context limit.',
    action: { label: 'New chat' },
  },
  error: {
    kind: 'error',
    message: 'Couldn’t reach the connector.',
    action: { label: 'Retry' },
  },
};

/** The `+` menu: Menu rows as elements (the Menu reads them by type). */
const ADD_MENU = (
  <>
    <MenuItem label="Add data or files" renderIcon={Add} />
    <MenuItem label="Skills" renderIcon={SkillLevel} shortcut="⌘Y" />
    <MenuItem label="Connectors" renderIcon={Connect}>
      <MenuItemSelectable label="First connector" defaultSelected />
      <MenuItemSelectable label="Second connector" />
      <MenuItemDivider />
      <MenuItem label="Browse connectors" />
    </MenuItem>
  </>
);

interface Reply {
  /** Words in a question that pick this reply. */
  match: RegExp;
  sentences: string[];
  followUp?: { question: string; choices: string[] };
}

const REPLIES: Reply[] = [
  {
    match: /fail/i,
    sentences: [
      'Three deployments failed this week, all in checkout.',
      'Each one stopped on a missing secret after Tuesday’s config change.',
      'Everything else deployed cleanly.',
    ],
    followUp: {
      question: 'What should I do next?',
      choices: [
        'List the missing secrets',
        'Draft a rollback plan',
        'Open the config change',
      ],
    },
  },
  {
    match: /secret/i,
    sentences: [
      'Three secrets are missing in checkout.',
      'Two were renamed in the config change, and one was never copied to the West region.',
    ],
  },
  {
    match: /rollback|roll back/i,
    sentences: [
      'Roll checkout back to Monday’s release, then restore the two renamed secrets.',
      'Copy the third secret to West before you deploy again.',
      'The rollback takes about five minutes and needs no downtime.',
    ],
  },
  {
    match: /config|change/i,
    sentences: [
      'Tuesday’s change renamed two secrets and moved checkout to a new region.',
      'It passed review, but no deploy ran against it before it merged.',
    ],
  },
  {
    match: /owner/i,
    sentences: [
      'Two services have no owner: export and media.',
      'Both deploy from the shared config, so a failure there would reach no one.',
    ],
  },
  {
    match: /.*/,
    sentences: [
      'I looked at this week’s deployments.',
      'Ask me about failures, owners or the last config change.',
    ],
  },
];

/** The reply to a question: the first whose words it has. */
const replyTo = (text: string): Reply =>
  REPLIES.find((r) => r.match.test(text)) ?? REPLIES[REPLIES.length - 1];

/** The prompt's hint: what this sample can answer. */
const PLACEHOLDER = 'Ask about your deployments';

const STEPS_DONE: ChatStep[] = [
  {
    id: 'read',
    tool: true,
    label: 'Reading the deployments',
    doneLabel: 'Read the deployments',
    detail: '42 runs',
    status: 'done',
    startedAt: 0,
    endedAt: 900,
  },
  {
    id: 'group',
    label: 'Grouping the failures',
    doneLabel: 'Grouped the failures',
    status: 'done',
    startedAt: 900,
    endedAt: 2400,
  },
  {
    id: 'owners',
    tool: true,
    label: 'Checking the owners',
    doneLabel: 'Checked the owners',
    status: 'done',
    startedAt: 2400,
    endedAt: 4100,
  },
];

/** A settled conversation: a question and its finished reply, with its steps. */
const SETTLED: ChatTurn[] = [
  { id: 's-u', role: 'user', text: 'Which deployments failed this week?' },
  {
    id: 's-a',
    role: 'assistant',
    chunks: REPLIES[0].sentences,
    done: true,
    rating: 'up',
    status: { status: 'done', startedAt: 0, endedAt: 4200 },
    steps: STEPS_DONE,
  },
];

const QUESTIONS: [string, string[]][] = [
  [
    'Which deployments failed this week?',
    [
      'Three, all in checkout.',
      'Each one stopped on a missing secret after Tuesday’s config change.',
    ],
  ],
  [
    'What changed in Tuesday’s config?',
    [
      'It renamed two secrets and moved checkout to a new region.',
      'No deploy ran against it before it merged.',
    ],
  ],
  [
    'Which secrets are missing?',
    [
      'Two were renamed, and one was never copied to the West region.',
      'All three are used by the payment step.',
    ],
  ],
  [
    'Draft a note to the checkout team.\nKeep it short and lead with the fix.',
    [
      'Checkout failed three times this week on missing secrets.',
      'Fix: restore the two renamed secrets and copy the third to West.',
      'Then redeploy; no downtime is needed.',
    ],
  ],
  [
    'What else deploys from that config?',
    ['Catalog and search do, but neither uses the renamed secrets.'],
  ],
  [
    'Flag anything that could fail the same way.',
    [
      'Billing reads one secret by its old name.',
      'It will fail on its next deploy unless that name is updated.',
    ],
  ],
  [
    'Sum up the thread in a few lines.',
    [
      'Checkout failed on secrets the config change renamed or never copied.',
      'Restoring them and redeploying fixes it.',
      'Billing needs the same rename before its next deploy.',
    ],
  ],
];

/** A long settled conversation, for the turn navigator: a question every seven minutes. */
const longChat = (now: number): ChatTurn[] =>
  QUESTIONS.flatMap(([text, sentences], i): ChatTurn[] => [
    {
      id: `l-u${i}`,
      role: 'user',
      text,
      time: now - (QUESTIONS.length - i) * 7 * 60_000,
    },
    {
      id: `l-a${i}`,
      role: 'assistant',
      chunks: sentences,
      done: true,
      status: { status: 'done', startedAt: 0, endedAt: 4200 },
    },
  ]);

/* ── a scripted conversation ──────────────────────────────────────────── */

/** The fake machine's time on each stage before the first words, ms. Not motion: the machine's own time. */
const SCRIPT: { status: TurnStatusValue; label: string; ms: number }[] = [
  { status: 'thinking', label: 'Thinking…', ms: 1600 },
  { status: 'acting', label: 'Searching the deployments', ms: 2200 },
];

interface Card {
  key: string;
  question: string;
  choices: string[];
}

/**
 * Turns and a follow-up card: each reply runs the script's stages, then
 * streams a sentence at a time. Stop ends it where it is.
 */
function useScriptedChat(timeScale = 1) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [card, setCard] = useState<Card | null>(null);
  const timers = useRef<number[]>([]);
  const count = useRef(0);
  useEffect(() => {
    const all = timers;
    return () => all.current.forEach((t) => window.clearTimeout(t));
  }, []);
  const at = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  const patch = (id: string, f: (t: ChatTurn) => ChatTurn) =>
    setTurns((all) => all.map((x) => (x.id === id ? f(x) : x)));

  const send = (text: string) => {
    const t = text.trim();
    if (!t) {
      return;
    }
    const n = ++count.current;
    const id = `a${n}`;
    const reply = replyTo(t);
    setCard(null);
    setTurns((all) => [
      ...all,
      { id: `u${n}`, role: 'user', text: t, time: Date.now() },
      {
        id,
        role: 'assistant',
        chunks: [],
        done: false,
        status: {
          status: SCRIPT[0].status,
          label: SCRIPT[0].label,
          startedAt: performance.now(),
        },
      },
    ]);
    let ms = 0;
    SCRIPT.forEach((stage, i) => {
      if (i > 0) {
        at(ms, () =>
          patch(id, (x) => ({
            ...x,
            status: x.status && {
              ...x.status,
              status: stage.status,
              label: stage.label,
            },
          }))
        );
      }
      ms += stage.ms * timeScale;
    });
    at(ms, () => {
      const endedAt = performance.now();
      patch(id, (x) => ({
        ...x,
        status: x.status && { ...x.status, status: 'streaming', endedAt },
      }));
      const gap = motionTokens.duration['moderate-02'] * timeScale;
      reply.sentences.forEach((_, i) =>
        at(gap * i, () => {
          const done = i === reply.sentences.length - 1;
          patch(id, (x) => ({
            ...x,
            chunks: reply.sentences.slice(0, i + 1),
            done,
            status: x.status && {
              ...x.status,
              status: done ? 'done' : 'streaming',
            },
          }));
          if (done && reply.followUp) {
            setCard({ key: id, ...reply.followUp });
          }
        })
      );
    });
  };

  const stop = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    const endedAt = performance.now();
    setTurns((all) =>
      all.map((x) =>
        x.role === 'assistant' && !x.done
          ? {
              ...x,
              done: true,
              status: x.status && { ...x.status, status: 'stopped', endedAt },
            }
          : x
      )
    );
  };

  const rate = (turn: ChatTurn, rating: ChatTurn['rating']) =>
    patch(turn.id, (x) => ({ ...x, rating }));

  const generating = turns.some((t) => t.role === 'assistant' && !t.done);
  return { turns, card, setCard, send, stop, rate, generating };
}

/* ── layout ───────────────────────────────────────────────────────────── */

/** The chat's frame: the story's whole height on the page's background, for the shell to fill. */
const frame: CSSProperties = {
  display: 'flex',
  boxSizing: 'border-box',
  blockSize: '100vh',
  padding: 8,
  background: 'var(--cds-background)',
  color: 'var(--cds-text-primary)',
};
const fill: CSSProperties = { flex: '1 1 0', minInlineSize: 0 };
const stack: CSSProperties = {
  display: 'grid',
  gap: 24,
  maxInlineSize: '40rem',
  padding: 24,
};
const row: CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap',
};
const grid: CSSProperties = {
  display: 'grid',
  gap: 24,
  gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))',
  padding: 24,
};
const captionText: CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: 'var(--cds-text-secondary)',
};
/** The empty chat's greeting, a third of the way down. */
const greeting: CSSProperties = {
  display: 'grid',
  gap: 8,
  paddingBlockStart: 'clamp(24px, 22vh, 200px)',
};
const greetingTitle: CSSProperties = {
  margin: 0,
  fontSize: 28,
  lineHeight: 1.25,
  color: 'var(--cds-text-primary)',
};
const greetingText: CSSProperties = {
  margin: 0,
  color: 'var(--cds-text-secondary)',
};
const titleText: CSSProperties = {
  margin: 0,
  paddingInlineStart: 8,
  fontSize: 14,
  fontWeight: 600,
};
const page: CSSProperties = {
  display: 'grid',
  flex: '1 1 0',
  gap: 16,
  alignContent: 'start',
  justifyItems: 'start',
  minInlineSize: 0,
  padding: 24,
};

/** What an empty chat says. */
function Greeting() {
  return (
    <div style={greeting}>
      <p style={greetingTitle}>What can I help with?</p>
      <p style={greetingText}>
        Ask about this week’s deployments, or start from a suggestion.
      </p>
    </div>
  );
}

/** A part with a caption over it. */
function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <p style={captionText}>{label}</p>
      {children}
    </div>
  );
}

/** The time a still example started, ms on the page's clock: far enough back that its words and seconds show. */
function useShownSince(ago = 9000) {
  const [since] = useState(() => performance.now() - ago);
  return since;
}

/* ── stories ──────────────────────────────────────────────────────────── */

/* ── the demo: the whole chat shell in one product ────────────────────── */

/** The rollback's steps: one fails once and waits for Retry; one waits for approval. */
const ROLLBACK_RUN: Scripted[] = [
  {
    id: 'history',
    tool: true,
    label: 'Reading the checkout history',
    doneLabel: 'Read the checkout history',
    detail: '14 releases',
    ms: 1300,
  },
  {
    id: 'logs',
    tool: true,
    label: 'Searching the logs',
    doneLabel: 'Searched the logs',
    detail: '3 failures',
    ms: 1200,
    failsFirst: 'Couldn’t reach the log service',
  },
  {
    id: 'notify',
    asks: 'Tell the checkout team about the plan',
    label: 'Telling the checkout team',
    doneLabel: 'Told the checkout team',
    ms: 900,
  },
];

/** After this many questions the prompt warns that the chat is getting long. */
const LONG_CHAT = 5;

/**
 * The demo's conversation: the scripted chat, plus steps that run live for
 * the rollback (a failure to retry and an approval), files from the + menu,
 * and the prompt's notices.
 */
function useDemoChat() {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [card, setCard] = useState<Card | null>(null);
  const [files, setFiles] = useState<ChipFile[]>([]);
  const [notice, setNotice] = useState<PromptNoticeValue | null>(null);
  const timers = useRef<number[]>([]);
  const count = useRef(0);
  const attached = useRef(0);
  /** Each step's attempts so far, by turn and step. */
  const tries = useRef<Record<string, number>>({});
  useEffect(() => {
    const all = timers;
    return () => all.current.forEach((t) => window.clearTimeout(t));
  }, []);
  const at = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  const patch = (id: string, f: (t: ChatTurn) => ChatTurn) =>
    setTurns((all) => all.map((x) => (x.id === id ? f(x) : x)));
  const stage = (id: string, status: TurnStatusValue, label?: string) =>
    patch(id, (x) => ({
      ...x,
      status: x.status && { ...x.status, status, label },
    }));
  const putStep = (id: string, step: ChatStep) =>
    patch(id, (x) => {
      const steps = x.steps ?? [];
      const i = steps.findIndex((s) => s.id === step.id);
      return {
        ...x,
        steps:
          i < 0
            ? [...steps, step]
            : steps.map((s, k) => (k === i ? { ...s, ...step } : s)),
      };
    });

  /** The reply's words, a sentence at a time, then its follow-up. */
  const stream = (id: string, reply: Reply) => {
    patch(id, (x) => ({
      ...x,
      status: x.status && {
        ...x.status,
        status: 'streaming',
        endedAt: performance.now(),
      },
    }));
    const gap = motionTokens.duration['moderate-02'];
    reply.sentences.forEach((_, i) =>
      at(gap * i, () => {
        const done = i === reply.sentences.length - 1;
        patch(id, (x) => ({
          ...x,
          chunks: reply.sentences.slice(0, i + 1),
          done,
          status: x.status && {
            ...x.status,
            status: done ? 'done' : 'streaming',
          },
        }));
        if (done && reply.followUp) {
          setCard({ key: id, ...reply.followUp });
        }
      })
    );
  };

  /** One attempt at a step; a step that fails first waits for Retry. */
  const attempt = (id: string, reply: Reply, i: number, n: number) => {
    const step = ROLLBACK_RUN[i];
    tries.current[`${id}:${step.id}`] = n;
    stage(id, 'acting', step.label);
    putStep(id, {
      id: step.id,
      label: step.label,
      doneLabel: step.doneLabel,
      tool: step.tool,
      status: 'running',
      detail: undefined,
      error: undefined,
      startedAt: performance.now(),
      endedAt: undefined,
      attempts: n,
    });
    at(step.ms, () => {
      const endedAt = performance.now();
      if (step.failsFirst && n === 1) {
        putStep(id, {
          id: step.id,
          label: step.label,
          status: 'error',
          error: step.failsFirst,
          endedAt,
        });
        stage(id, 'acting', 'Waiting to retry');
        setNotice({
          id: `${id}-${step.id}`,
          kind: 'error',
          message: `${step.failsFirst}.`,
          action: {
            label: 'Retry',
            onClick: () => retry(id, step.id),
          },
        });
        return;
      }
      putStep(id, {
        id: step.id,
        label: step.label,
        status: 'done',
        detail: step.detail,
        endedAt,
      });
      run(id, reply, i + 1);
    });
  };

  /** The steps from `i`: each joins as it starts; one asks first. */
  const run = (id: string, reply: Reply, i: number) => {
    const step = ROLLBACK_RUN[i];
    if (!step) {
      stream(id, reply);
      return;
    }
    if (step.asks) {
      stage(id, 'waiting', 'Waiting for your approval');
      putStep(id, {
        id: step.id,
        label: step.asks,
        status: 'waiting',
        detail: 'Needs your approval',
      });
      return;
    }
    attempt(id, reply, i, 1);
  };

  const retry = (id: string, stepId: string) => {
    setNotice(null);
    const i = ROLLBACK_RUN.findIndex((s) => s.id === stepId);
    const n = (tries.current[`${id}:${stepId}`] ?? 1) + 1;
    attempt(id, ROLLBACK_REPLY, i, n);
  };

  const decide = (id: string, stepId: string, approve: boolean) => {
    const i = ROLLBACK_RUN.findIndex((s) => s.id === stepId);
    if (approve) {
      attempt(id, ROLLBACK_REPLY, i, 1);
      return;
    }
    putStep(id, {
      id: stepId,
      label: ROLLBACK_RUN[i].asks ?? ROLLBACK_RUN[i].label,
      status: 'cancelled',
      detail: 'Skipped',
      endedAt: performance.now(),
    });
    run(id, ROLLBACK_REPLY, i + 1);
  };

  const send = (text: string) => {
    const t = text.trim();
    if (!t) {
      return;
    }
    const n = ++count.current;
    const id = `a${n}`;
    const reply = replyTo(t);
    setCard(null);
    setFiles([]);
    setTurns((all) => [
      ...all,
      { id: `u${n}`, role: 'user', text: t, time: Date.now() },
      {
        id,
        role: 'assistant',
        chunks: [],
        done: false,
        status: {
          status: 'thinking',
          label: 'Thinking…',
          startedAt: performance.now(),
        },
      },
    ]);
    if (n === LONG_CHAT) {
      setNotice({
        id: 'long',
        kind: 'warning',
        message: 'This chat is getting long. A new chat answers faster.',
        action: { label: 'New chat', onClick: () => reset() },
      });
    }
    at(SCRIPT[0].ms, () => {
      if (reply === ROLLBACK_REPLY) {
        run(id, reply, 0);
        return;
      }
      stage(id, 'acting', SCRIPT[1].label);
      at(SCRIPT[1].ms, () => stream(id, reply));
    });
  };

  const stop = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    const endedAt = performance.now();
    setTurns((all) =>
      all.map((x) =>
        x.role === 'assistant' && !x.done
          ? {
              ...x,
              done: true,
              status: x.status && { ...x.status, status: 'stopped', endedAt },
            }
          : x
      )
    );
  };

  const reset = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    count.current = 0;
    setTurns([]);
    setCard(null);
    setFiles([]);
    setNotice(null);
  };

  const attach = () => {
    const k = attached.current++;
    setFiles((f) => [
      ...f,
      { id: `file-${k}`, name: FILE_NAMES[k % FILE_NAMES.length] },
    ]);
  };

  const rate = (turn: ChatTurn, rating: ChatTurn['rating']) =>
    patch(turn.id, (x) => ({ ...x, rating }));

  const generating = turns.some((t) => t.role === 'assistant' && !t.done);
  return {
    turns,
    card,
    setCard,
    files,
    setFiles,
    notice,
    setNotice,
    send,
    stop,
    reset,
    attach,
    rate,
    retry,
    decide,
    generating,
  };
}

/** The reply whose steps run live. */
const ROLLBACK_REPLY = REPLIES[2];

type Layout = 'full' | 'pane';

interface ChatView {
  layout: Layout;
  variant: ChatVariant;
}

/** The chat's View: where it sits and how it looks. */
function ChatViewMenu({
  view,
  onView,
}: {
  view: ChatView;
  onView: (next: Partial<ChatView>) => void;
}) {
  const [open, setOpen] = useState(false);
  // Each open mounts the switchers again (they measure their selected face as they mount).
  const [opened, setOpened] = useState(0);
  const choices: {
    key: keyof ChatView;
    label: string;
    options: [string, string][];
  }[] = [
    {
      key: 'layout',
      label: 'Layout',
      options: [
        ['full', 'Full screen'],
        ['pane', 'Beside a page'],
      ],
    },
    {
      key: 'variant',
      label: 'Look',
      options: VARIANTS.map((v) => [v, VARIANT_NAME[v]]),
    },
  ];
  return (
    <Popover
      open={open}
      align="bottom-end"
      autoAlign
      variant="outlined"
      onRequestClose={() => setOpen(false)}>
      <IconButton
        frame="ghost"
        size="md"
        corners="full"
        align="bottom-end"
        label="View"
        aria-expanded={open}
        onClick={() => {
          if (!open) {
            setOpened((n) => n + 1);
          }
          setOpen((o) => !o);
        }}>
        <SettingsAdjust size={16} />
      </IconButton>
      <PopoverContent>
        <div
          key={opened}
          role="group"
          aria-label="View"
          style={{ display: 'grid', gap: 16, padding: 16, inlineSize: 280 }}>
          {choices.map((c) => (
            <div key={c.key}>
              <p
                style={{ ...captionText, fontSize: 12, marginBlockEnd: 8 }}
                id={`chat-view-${c.key}`}>
                {c.label}
              </p>
              <ContentSwitcher
                aria-labelledby={`chat-view-${c.key}`}
                size="sm"
                selectedIndex={Math.max(
                  0,
                  c.options.findIndex(([v]) => v === view[c.key])
                )}
                onChange={({ index }) =>
                  onView({
                    [c.key]: c.options[index ?? 0][0],
                  } as Partial<ChatView>)
                }>
                {c.options.map(([value, text]) => (
                  <Switch key={value} name={value} text={text} />
                ))}
              </ContentSwitcher>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * The whole chat shell in one product. Start from a suggestion or ask your
 * own question: each reply shows its stages, then streams in, and Stop ends
 * it where it is. The first answer brings a follow-up question. Ask to draft
 * a rollback plan for steps that run live: one fails and waits for Retry,
 * one waits for your approval. Attach files from +, find earlier questions
 * from the header, and use View to put the chat beside a page or change its
 * look. New chat starts over.
 */
export const TryIt = {
  name: 'Try it',
  render: function TryItStory() {
    const chat = useDemoChat();
    const [view, setView] = useState<ChatView>({
      layout: 'full',
      variant: 'inverse',
    });
    const [paneOpen, setPaneOpen] = useState(true);
    const [inView, setInView] = useState(true);
    const field = useRef<HTMLTextAreaElement>(null);
    const send = (text: string) => {
      chat.send(text);
      field.current?.focus({ preventScroll: true });
    };
    const pane = view.layout === 'pane';
    const addMenu = (
      <>
        <MenuItem
          label="Add data or files"
          renderIcon={Add}
          onClick={chat.attach}
        />
        <MenuItem label="Connectors" renderIcon={Connect}>
          <MenuItemSelectable label="Deployments" defaultSelected />
          <MenuItemSelectable label="Logs" defaultSelected />
        </MenuItem>
      </>
    );
    const shell = (
      <ChatShell
        variant={view.variant}
        column={pane ? undefined : '40rem'}
        style={pane ? { flex: '1 1 auto' } : fill}
        header={
          <>
            <h3 style={titleText}>{pane ? 'Assistant' : 'Deployments chat'}</h3>
            <span
              style={{ display: 'flex', gap: 4, marginInlineStart: 'auto' }}>
              <ChatTurnNavigator />
              <IconButton
                frame="ghost"
                size="md"
                corners="full"
                align="bottom-end"
                label="New chat"
                onClick={chat.reset}>
                <NewTab size={16} />
              </IconButton>
              <ChatViewMenu
                view={view}
                onView={(next) => setView((v) => ({ ...v, ...next }))}
              />
            </span>
          </>
        }
        above={
          chat.card ? (
            <FollowUpCard
              key={chat.card.key}
              question={chat.card.question}
              choices={chat.card.choices}
              onChoose={(c) => send(c)}
              onOther={(t) => send(t)}
              onSkip={() => chat.setCard(null)}
              onClose={() => chat.setCard(null)}
            />
          ) : null
        }
        below={
          chat.turns.length === 0 ? (
            <Suggestions
              key="suggestions"
              items={SUGGESTIONS}
              onChoose={(s) =>
                send([s.text, s.secondary].filter(Boolean).join(' '))
              }
            />
          ) : null
        }
        prompt={
          <PromptInput
            fieldRef={field}
            placeholder={PLACEHOLDER}
            addMenu={addMenu}
            models={MODELS}
            defaultModel="Balanced 2"
            files={chat.files}
            onRemoveFile={(id) =>
              chat.setFiles((f) => f.filter((x) => x.id !== id))
            }
            notice={chat.notice}
            onCloseNotice={() => chat.setNotice(null)}
            generating={chat.generating}
            onStop={chat.stop}
            stopRing={!inView}
            onSubmit={send}
          />
        }>
        <ChatTranscript
          turns={chat.turns}
          onReplyInView={setInView}
          empty={<Greeting />}
          onRate={chat.rate}
          onRetryStep={(turn, step) => chat.retry(turn.id, step.id)}
          stepActions={(turn, step) =>
            step.status === 'waiting' ? (
              <>
                <Button
                  size="sm"
                  variant="outlined"
                  onClick={() => chat.decide(turn.id, step.id, true)}>
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outlined"
                  onClick={() => chat.decide(turn.id, step.id, false)}>
                  Skip
                </Button>
              </>
            ) : null
          }
        />
      </ChatShell>
    );
    if (!pane) {
      return <div style={frame}>{shell}</div>;
    }
    return (
      <div style={{ ...frame, padding: 0 }}>
        <main style={{ ...page, padding: '0 0 24px', gap: 8 }}>
          <PageHeader
            frame="ghost"
            title="Deployments"
            subtitle="Your apps, running in regions."
            pageActions={[
              {
                key: 'ask',
                label: paneOpen ? 'Close the assistant' : 'Ask the assistant',
                renderIcon: ChatBot,
                variant: 'outlined',
                onClick: () => setPaneOpen((o) => !o),
              },
            ]}
          />
          <ul
            style={{
              ...paneList,
              inlineSize: '100%',
              boxSizing: 'border-box',
            }}>
            {PANE_ROWS.map((r) => (
              <li key={r.name} style={paneRow}>
                <span>{r.name}</span>
                <Tag type={r.status === 'Failed' ? 'red' : 'green'}>
                  {r.status}
                </Tag>
                <span>{r.region}</span>
              </li>
            ))}
          </ul>
        </main>
        <ChatPane open={paneOpen} label="Assistant" size="28rem">
          {shell}
        </ChatPane>
      </div>
    );
  },
};

/**
 * A chat, start to finish. Pick a suggestion or ask about failures, secrets
 * or owners. The reply shows what it's doing, then streams in; Send turns
 * into Stop until it ends. After the first reply, a follow-up question
 * appears above the prompt.
 */
export const Default = {
  args: {
    variant: 'inverse',
    corners: 'rounded',
    column: '40rem',
    timeScale: 1,
  },
  render: function DefaultStory(args: ChatShellProps) {
    const chat = useScriptedChat(args.timeScale);
    const [files, setFiles] = useState<ChipFile[]>([]);
    const [inView, setInView] = useState(true);
    const field = useRef<HTMLTextAreaElement>(null);
    const send = (text: string) => {
      chat.send(text);
      setFiles([]);
      field.current?.focus({ preventScroll: true });
    };
    return (
      <div style={frame}>
        <ChatShell
          {...args}
          style={fill}
          header={
            <>
              <h3 style={titleText}>New chat</h3>
              <ChatTurnNavigator />
            </>
          }
          above={
            chat.card ? (
              <FollowUpCard
                key={chat.card.key}
                question={chat.card.question}
                choices={chat.card.choices}
                onChoose={(c) => send(c)}
                onOther={(t) => send(t)}
                onSkip={() => chat.setCard(null)}
                onClose={() => chat.setCard(null)}
              />
            ) : null
          }
          below={
            chat.turns.length === 0 ? (
              <Suggestions
                key="suggestions"
                items={SUGGESTIONS}
                onChoose={(s) =>
                  send([s.text, s.secondary].filter(Boolean).join(' '))
                }
              />
            ) : null
          }
          prompt={
            <PromptInput
              fieldRef={field}
              placeholder={PLACEHOLDER}
              addMenu={ADD_MENU}
              models={MODELS}
              defaultModel="Balanced 2"
              files={files}
              onRemoveFile={(id) =>
                setFiles((f) => f.filter((x) => x.id !== id))
              }
              generating={chat.generating}
              onStop={chat.stop}
              stopRing={!inView}
              onSubmit={send}
            />
          }>
          <ChatTranscript
            turns={chat.turns}
            onReplyInView={setInView}
            empty={<Greeting />}
            onRate={chat.rate}
          />
        </ChatShell>
      </div>
    );
  },
};

/**
 * A chat already under way. Earlier turns are there at once, with no
 * motion; ask something new and only its reply animates.
 */
export const Conversation = {
  render: function ConversationStory() {
    const chat = useScriptedChat();
    const turns = [...SETTLED, ...chat.turns];
    return (
      <div style={frame}>
        <ChatShell
          column="40rem"
          style={fill}
          prompt={
            <PromptInput
              placeholder={PLACEHOLDER}
              generating={chat.generating}
              onStop={chat.stop}
              onSubmit={chat.send}
            />
          }>
          <ChatTranscript turns={turns} onRate={chat.rate} />
        </ChatShell>
      </div>
    );
  },
};

/**
 * A long chat. The button at the header's end lists the questions; choose
 * one and the chat scrolls to it. In the chat, Alt with ↑ or ↓ steps from
 * question to question.
 */
export const Questions = {
  render: function QuestionsStory() {
    const [turns] = useState(() => longChat(Date.now()));
    return (
      <div style={frame}>
        <ChatShell
          column="40rem"
          style={fill}
          header={
            <>
              <h3 style={titleText}>Failed deployments</h3>
              <ChatTurnNavigator />
            </>
          }
          prompt={
            <PromptInput
              placeholder={PLACEHOLDER}
              models={MODELS}
              defaultModel="Balanced 2"
            />
          }>
          <ChatTranscript turns={turns} onRate={() => {}} />
        </ChatShell>
      </div>
    );
  },
};

const PANE_ROWS: {
  name: string;
  status: 'Running' | 'Failed';
  region: string;
}[] = [
  { name: 'checkout-prod', status: 'Failed', region: 'West' },
  { name: 'checkout-stage', status: 'Failed', region: 'West' },
  { name: 'catalog-prod', status: 'Running', region: 'East' },
  { name: 'search-prod', status: 'Running', region: 'North' },
  { name: 'billing-prod', status: 'Running', region: 'South' },
];
const paneList: CSSProperties = {
  display: 'grid',
  margin: 0,
  padding: '0 16px',
  listStyle: 'none',
};
const paneRow: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr auto 5rem',
  gap: 16,
  alignItems: 'center',
  minBlockSize: 48,
  borderBlockEnd: '1px solid var(--cds-border-subtle-01)',
};

/**
 * The assistant beside a page. Open and close it from the page header: the
 * page narrows to make room and keeps its place.
 */
export const Pane = {
  render: function PaneStory() {
    const [open, setOpen] = useState(true);
    const chat = useScriptedChat();
    return (
      <div style={{ ...frame, padding: 0 }}>
        <main style={{ ...page, padding: '0 0 24px', gap: 8 }}>
          <PageHeader
            frame="ghost"
            title="Deployments"
            subtitle="Your apps, running in regions."
            pageActions={[
              {
                key: 'ask',
                label: open ? 'Close the assistant' : 'Ask the assistant',
                renderIcon: ChatBot,
                variant: 'outlined',
                onClick: () => setOpen((o) => !o),
              },
            ]}
          />
          <ul
            style={{
              ...paneList,
              inlineSize: '100%',
              boxSizing: 'border-box',
            }}>
            {PANE_ROWS.map((r) => (
              <li key={r.name} style={paneRow}>
                <span>{r.name}</span>
                <Tag type={r.status === 'Failed' ? 'red' : 'green'}>
                  {r.status}
                </Tag>
                <span>{r.region}</span>
              </li>
            ))}
          </ul>
        </main>
        <ChatPane open={open} label="Assistant" size="26rem">
          <ChatShell
            style={{ flex: '1 1 auto' }}
            header={<h3 style={titleText}>Assistant</h3>}
            prompt={
              <PromptInput
                placeholder={PLACEHOLDER}
                generating={chat.generating}
                onStop={chat.stop}
                onSubmit={chat.send}
              />
            }
            below={
              chat.turns.length === 0 ? (
                <Suggestions
                  key="suggestions"
                  items={SUGGESTIONS}
                  onChoose={(s) =>
                    chat.send([s.text, s.secondary].filter(Boolean).join(' '))
                  }
                />
              ) : null
            }>
            <ChatTranscript
              turns={chat.turns}
              onRate={chat.rate}
              empty={<Greeting />}
            />
          </ChatShell>
        </ChatPane>
      </div>
    );
  },
};

/** The three looks for the person's messages and the other emphasized parts. */
export const Variants = {
  render: () => (
    <div style={grid}>
      {VARIANTS.map((variant) => (
        <Labelled key={variant} label={VARIANT_NAME[variant]}>
          <ChatShell
            variant={variant}
            label={`Chat, ${variant}`}
            style={{ blockSize: 480 }}
            prompt={
              <PromptInput
                defaultValue="Flag anything that could fail the same way."
                models={MODELS}
                defaultModel="Balanced 2"
              />
            }>
            <ChatTranscript turns={SETTLED} onRate={() => {}} />
          </ChatShell>
        </Labelled>
      ))}
    </div>
  ),
};

/**
 * The prompt alone. It grows as you type, and Enter sends. Its footer holds
 * the `+` menu, the model picker and the microphone; Send turns into Stop
 * while a reply is coming.
 */
export const Prompt = {
  render: function PromptStory() {
    const [sent, setSent] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const [listening, setListening] = useState(false);
    return (
      <div style={stack}>
        <PromptInput
          addMenu={ADD_MENU}
          models={MODELS}
          defaultModel="Balanced 2"
          listening={listening}
          onListeningChange={setListening}
          generating={generating}
          onStop={() => setGenerating(false)}
          onSubmit={(text) => {
            setSent(text);
            setGenerating(true);
          }}
        />
        <p style={captionText} role="status">
          {sent ? `Sent: ${sent}` : 'Nothing sent yet.'}
        </p>
        <Labelled label="Corners: rounded, full and square">
          <div style={{ display: 'grid', gap: 16 }}>
            {CORNERS.map((corners) => (
              <PromptInput
                key={corners}
                label={`Prompt, ${corners}`}
                corners={corners}
                defaultValue="Which deployments failed this week?"
              />
            ))}
          </div>
        </Labelled>
        <Labelled label="Disabled">
          <PromptInput label="Prompt, disabled" disabled models={MODELS} />
        </Labelled>
      </div>
    );
  },
};

/**
 * A notice docked to the prompt's top edge. Pick one: it rises from behind
 * the prompt, a new one replaces it in place, and it sinks when closed.
 */
export const Notice = {
  render: function NoticeStory() {
    const [notice, setNotice] = useState<NoticeName>('info');
    return (
      <div style={stack}>
        <ContentSwitcher
          aria-label="Notice"
          size="sm"
          selectedIndex={NOTICE_NAMES.indexOf(notice)}
          onChange={({ index }) => setNotice(NOTICE_NAMES[index ?? 0])}>
          {NOTICE_NAMES.map((n) => (
            <Switch key={n} name={n} text={n[0].toUpperCase() + n.slice(1)} />
          ))}
        </ContentSwitcher>
        <PromptInput
          models={MODELS}
          defaultModel="Balanced 2"
          notice={NOTICES[notice]}
          onCloseNotice={() => setNotice('none')}
        />
      </div>
    );
  },
};

/**
 * Attachments. A new file makes room for itself; remove one with its close
 * button or Delete, and the rest close the gap.
 */
export const Attachments = {
  render: function AttachmentsStory() {
    const [files, setFiles] = useState<ChipFile[]>([
      { id: 'f0', name: FILE_NAMES[0] },
      { id: 'f1', name: FILE_NAMES[1] },
    ]);
    const [next, setNext] = useState(2);
    const remove = (id: string) =>
      setFiles((f) => f.filter((x) => x.id !== id));
    return (
      <div style={stack}>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => {
              setFiles((f) => [
                ...f,
                { id: `f${next}`, name: FILE_NAMES[next % FILE_NAMES.length] },
              ]);
              setNext((n) => n + 1);
            }}>
            Attach a file
          </Button>
          <Button
            size="sm"
            variant="outlined"
            disabled={files.length === 0}
            onClick={() => setFiles([])}>
            Clear attachments
          </Button>
        </div>
        <Labelled label="In the prompt">
          <PromptInput files={files} onRemoveFile={remove} />
        </Labelled>
        <Labelled label="FileChips alone">
          <FileChips files={files} onRemove={remove} />
        </Labelled>
      </div>
    );
  },
};

/** Suggestions to start from. A choice is marked, then sent. */
export const PromptSuggestions = {
  render: function PromptSuggestionsStory() {
    const [chosen, setChosen] = useState<string | null>(null);
    return (
      <div style={stack}>
        <Suggestions
          items={SUGGESTIONS}
          onChoose={(s) =>
            setChosen([s.text, s.secondary].filter(Boolean).join(' '))
          }
        />
        <p style={captionText} role="status">
          {chosen ? `Chosen: ${chosen}` : 'Nothing chosen yet.'}
        </p>
      </div>
    );
  },
};

/** A follow-up question with numbered choices (press 1, 2 or 3) and a field for your own answer. */
export const FollowUp = {
  render: function FollowUpStory() {
    const [answer, setAnswer] = useState<string | null>(null);
    const [shown, setShown] = useState(true);
    return (
      <div style={stack}>
        {shown ? (
          <FollowUpCard
            question={REPLIES[0].followUp?.question}
            choices={REPLIES[0].followUp?.choices ?? []}
            onChoose={(c) => setAnswer(c)}
            onOther={(t) => setAnswer(t)}
            onSkip={() => setShown(false)}
            onClose={() => setShown(false)}
          />
        ) : (
          <Button
            size="sm"
            variant="outlined"
            style={{ justifySelf: 'start' }}
            onClick={() => setShown(true)}>
            Show the question again
          </Button>
        )}
        <p style={captionText} role="status">
          {answer ? `Answer: ${answer}` : 'No answer yet.'}
        </p>
      </div>
    );
  },
};

/** The stages of a reply's work, scripted: each one's state and words. */
const STATES: {
  status: TurnStatusValue;
  label?: string;
  ended?: number;
  error?: string;
}[] = [
  { status: 'thinking', label: 'Thinking…' },
  { status: 'acting', label: 'Searching the deployments' },
  { status: 'waiting', label: 'Waiting for your approval' },
  { status: 'done', ended: 6200 },
  { status: 'stopped', ended: 6200 },
  { status: 'error', ended: 6200, error: 'Couldn’t reach the deployments.' },
];

/**
 * The line above a reply that says what it's doing and for how long. When
 * the reply ends, it becomes a one-line summary that opens the reply's
 * steps. Start a turn to watch it.
 */
export const ReplyStatus = {
  parameters: {
    v12: {
      motion: [
        'arrival',
        'stage-words',
        'seconds',
        'mark',
        'summary',
        'error',
        'details',
        'one-working-element',
      ],
      reduced: {
        'stage-words': 'shorter-clock',
        mark: 'at-once',
        summary: 'shorter-clock',
        details: 'at-once',
      },
      // TODO reduced: arrival. The doc names the row's plain words, not how the row comes in.
      // TODO reduced: seconds. Their glide has no travel under reduced motion; the doc does not say whether it lands at once.
      // TODO reduced: error. The mark's hand-off to the error mark; the doc does not say.
      // TODO reduced: one-working-element. The mark shrinks out in its slot; the doc does not say.
      states: [
        'thinking',
        'acting',
        'waiting',
        'streaming',
        'done',
        'stopped',
        'error',
      ],
    },
  },
  render: function ReplyStatusStory() {
    const since = useShownSince();
    const chat = useScriptedChat();
    const latest = chat.turns[chat.turns.length - 1];
    return (
      <div style={stack}>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            disabled={chat.generating}
            onClick={() => chat.send('Which deployments failed this week?')}>
            Start a turn
          </Button>
          <Button
            size="sm"
            variant="outlined"
            disabled={!chat.generating}
            onClick={chat.stop}>
            Stop
          </Button>
        </div>
        {latest?.role === 'assistant' && latest.status ? (
          <ChatMessage
            role="assistant"
            chunks={latest.chunks}
            done={latest.done}
            status={<TurnStatus {...latest.status} />}
          />
        ) : (
          <p style={captionText}>Start a turn to see its status.</p>
        )}
        <Labelled label="Each state">
          <div style={{ display: 'grid', gap: 16 }}>
            {STATES.map((s) => (
              <TurnStatus
                key={s.status}
                status={s.status}
                label={s.label}
                startedAt={since}
                endedAt={s.ended != null ? since + s.ended : undefined}
                error={s.error}
                onRetry={() => {}}
              />
            ))}
          </div>
        </Labelled>
        <Labelled label="With its steps as details">
          <TurnStatus
            status="done"
            startedAt={since}
            endedAt={since + 4100}
            detail={countSteps(STEPS_DONE)}
            defaultExpanded>
            <StepList steps={STEPS_DONE} />
          </TurnStatus>
        </Labelled>
      </div>
    );
  },
};

/** The steps a reply takes, scripted: one fails once and waits for Retry; one waits for approval. */
interface Scripted {
  id: string;
  label: string;
  doneLabel: string;
  tool?: boolean;
  detail?: string;
  ms: number;
  failsFirst?: string;
  asks?: string;
}
const RUN: Scripted[] = [
  {
    id: 'read',
    tool: true,
    label: 'Reading the deployments',
    doneLabel: 'Read the deployments',
    detail: '42 runs',
    ms: 1400,
  },
  {
    id: 'logs',
    tool: true,
    label: 'Searching the logs',
    doneLabel: 'Searched the logs',
    ms: 1200,
    failsFirst: 'Couldn’t reach the log service',
  },
  {
    id: 'notify',
    asks: 'Notify the checkout team',
    label: 'Notifying the checkout team',
    doneLabel: 'Notified the checkout team',
    ms: 900,
  },
];

/** A scripted run of steps: each joins as it starts. */
function useRun() {
  const [steps, setSteps] = useState<Step[]>([]);
  const timers = useRef<number[]>([]);
  useEffect(() => {
    const all = timers;
    return () => all.current.forEach((t) => window.clearTimeout(t));
  }, []);
  const put = (id: string, f: (s: Step | undefined) => Step) =>
    setSteps((all) => {
      const i = all.findIndex((s) => s.id === id);
      return i < 0
        ? [...all, f(undefined)]
        : all.map((s, k) => (k === i ? f(s) : s));
    });
  const attempt = (i: number, n: number) => {
    const step = RUN[i];
    put(step.id, (s) => ({
      ...s,
      id: step.id,
      label: step.label,
      doneLabel: step.doneLabel,
      tool: step.tool,
      status: 'running',
      detail: undefined,
      error: undefined,
      startedAt: performance.now(),
      endedAt: undefined,
      attempts: n,
    }));
    timers.current.push(
      window.setTimeout(() => {
        const endedAt = performance.now();
        if (step.failsFirst && n === 1) {
          put(step.id, (s) => ({
            ...(s as Step),
            status: 'error',
            error: step.failsFirst,
            endedAt,
          }));
          return;
        }
        put(step.id, (s) => ({
          ...(s as Step),
          status: 'done',
          detail: step.detail,
          endedAt,
        }));
        from(i + 1);
      }, step.ms)
    );
  };
  const from = (i: number) => {
    const step = RUN[i];
    if (!step) {
      return;
    }
    if (step.asks) {
      put(step.id, () => ({
        id: step.id,
        label: step.asks as string,
        status: 'waiting',
        detail: 'Needs your approval',
      }));
      return;
    }
    attempt(i, 1);
  };
  const start = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setSteps([]);
    from(0);
  };
  const decide = (id: string, approve: boolean) => {
    const i = RUN.findIndex((s) => s.id === id);
    if (approve) {
      attempt(i, 1);
    } else {
      put(id, (s) => ({
        ...(s as Step),
        status: 'cancelled',
        detail: 'Skipped',
        endedAt: performance.now(),
      }));
      from(i + 1);
    }
  };
  const shown = steps.map(
    (s): Step => ({
      ...s,
      onRetry:
        s.status === 'error'
          ? () =>
              attempt(
                RUN.findIndex((r) => r.id === s.id),
                (s.attempts ?? 1) + 1
              )
          : undefined,
      actions:
        s.status === 'waiting' ? (
          <>
            <Button
              size="sm"
              variant="outlined"
              onClick={() => decide(s.id, true)}>
              Approve
            </Button>
            <Button
              size="sm"
              variant="outlined"
              onClick={() => decide(s.id, false)}>
              Skip
            </Button>
          </>
        ) : undefined,
    })
  );
  return { steps: shown, start };
}

/**
 * The steps a reply takes, as they happen. Run them: one fails and waits
 * for Retry, and one waits for your approval. Below, every status.
 */
export const ReplySteps = {
  parameters: {
    v12: {
      motion: [
        'status-hand-off',
        'wind-up',
        'words',
        'arrival',
        'stillness',
        'collapse',
        'one-working-element',
      ],
      reduced: {
        'status-hand-off': 'at-once',
        'wind-up': 'at-once',
        words: 'shorter-clock',
        arrival: 'at-once',
        stillness: 'at-once',
        collapse: 'at-once',
        'one-working-element': 'at-once',
      },
      states: ['queued', 'running', 'waiting', 'done', 'error', 'cancelled'],
    },
  },
  render: function ReplyStepsStory() {
    const since = useShownSince();
    const run = useRun();
    const all: Step[] = [
      { id: 'q', label: 'Write the summary', status: 'queued' },
      {
        id: 'r',
        label: 'Reading the deployments',
        status: 'running',
        tool: true,
      },
      {
        id: 'w',
        label: 'Notify the checkout team',
        status: 'waiting',
        detail: 'Needs your approval',
      },
      {
        id: 'd',
        label: 'Searching the logs',
        doneLabel: 'Searched the logs',
        status: 'done',
        tool: true,
        detail: '12 matches',
        startedAt: since,
        endedAt: since + 1240,
      },
      {
        id: 'e',
        label: 'Querying the config service',
        status: 'error',
        tool: true,
        error: 'Couldn’t reach the service',
        onRetry: () => {},
      },
      { id: 'c', label: 'Draft the rollback plan', status: 'cancelled' },
    ];
    return (
      <div style={stack}>
        <div style={row}>
          <Button size="sm" variant="outlined" onClick={run.start}>
            Run the steps
          </Button>
        </div>
        <StepList steps={run.steps} />
        <Labelled label="Every status">
          <StepList label="Every status" steps={all} />
        </Labelled>
        <Labelled label="Collapsible, with its counter line">
          <StepList
            label="Collapsible steps"
            steps={STEPS_DONE}
            collapsible
            autoCollapse={false}
          />
        </Labelled>
      </div>
    );
  },
};
