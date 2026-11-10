/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import { CloudUpload } from '@carbon-labs/react-motion-icons';
import {
  ActionableNotification,
  Callout,
  InlineNotification,
  NotificationActionButton,
  NotificationButton,
  ToastNotification,
  ToastStack,
  useToasts,
} from '../index';
import type {
  FrontChange,
  InlineNotificationProps,
  NotificationCorners,
  NotificationKind,
  NotificationVariant,
} from '../index';
import mdx from './Notification.mdx';

const KINDS: NotificationKind[] = [
  'error',
  'info',
  'info-square',
  'success',
  'warning',
  'warning-alt',
];

const VARIANTS: NotificationVariant[] = ['outlined', 'inverse', 'tonal'];

const CORNERS: NotificationCorners[] = ['rounded', 'full', 'square'];

/** A status-capable motion icon, as the notification's action icon. */
const Upload = CloudUpload as unknown as NonNullable<
  InlineNotificationProps['icon']
>;

export default {
  title: 'V12/Notification',
  component: InlineNotification,
  subcomponents: {
    ToastNotification,
    ActionableNotification,
    Callout,
    ToastStack,
    NotificationButton,
    NotificationActionButton,
  },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'snap',
        'out',
        'cue',
        'content-swap',
        'duration-by-travel',
        'timer',
        'swipe',
        'stack',
        'swap',
        'deal',
        'count',
        'stillness',
        'rollover',
        'cast-shadow',
      ],
      reduced: {
        snap: 'at-once',
        out: 'at-once',
        cue: 'at-once',
        'content-swap': 'at-once',
        'duration-by-travel': 'at-once',
        stack: 'shorter-clock',
        swap: 'shorter-clock',
      },
      states: KINDS,
    },
  },
  argTypes: {
    kind: { control: 'select', options: KINDS },
    variant: { control: 'inline-radio', options: VARIANTS },
    corners: { control: 'inline-radio', options: CORNERS },
    role: { control: 'inline-radio', options: ['alert', 'log', 'status'] },
    from: { control: false },
    icon: { control: false },
  },
};

const column = { display: 'grid', gap: 16, maxInlineSize: 480 };

const row = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

/** An inline notification. It snaps in on mount; its close button folds it away. */
export const Default = {
  args: {
    kind: 'info',
    title: 'Update available',
    subtitle: 'Restart to install the latest version.',
    hideCloseButton: false,
    arrive: true,
  },
  render: (args: InlineNotificationProps) => (
    <div style={column}>
      <InlineNotification {...args} />
    </div>
  ),
};

/** The six kinds, part of the page from the start (`arrive={false}`). */
export const Kinds = {
  render: () => (
    <div style={column}>
      {KINDS.map((kind) => (
        <InlineNotification
          key={kind}
          kind={kind}
          arrive={false}
          title={kind}
          subtitle="The kind's mark and outline."
        />
      ))}
    </div>
  ),
};

/** The three styles, then the three corner modes. */
export const Variants = {
  render: () => (
    <div style={column}>
      {VARIANTS.map((variant) => (
        <InlineNotification
          key={variant}
          kind="warning"
          variant={variant}
          arrive={false}
          title={variant}
          subtitle="The same kind in each style."
        />
      ))}
      {CORNERS.map((corners) => (
        <ToastNotification
          key={corners}
          kind="success"
          corners={corners}
          arrive={false}
          title={`corners: ${corners}`}
        />
      ))}
    </div>
  ),
};

/** It opens its place as it arrives and closes it as it leaves; the text below follows. */
export const Inline = {
  render: function InlineStory() {
    const [key, setKey] = useState(0);
    return (
      <div style={column}>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setKey((k) => k + 1)}>
            Show again
          </Button>
        </div>
        <InlineNotification
          key={key}
          kind="warning"
          title="Storage almost full"
          subtitle="Free up space to keep syncing."
        />
        <p>This text moves as the notification opens and closes its place.</p>
      </div>
    );
  },
};

/** A toast on its own: a floating surface with a caption. */
export const Toast = {
  render: () => (
    <div style={column}>
      <ToastNotification
        kind="success"
        title="Report exported"
        subtitle="quarterly-report.csv is in your downloads."
        caption="Just now"
      />
    </div>
  ),
};

/** A timeout you can see: a ring round the close button, or a bar under the text. Hover pauses it. */
export const Timers = {
  render: function TimersStory() {
    const [key, setKey] = useState(0);
    return (
      <div style={column}>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setKey((k) => k + 1)}>
            Restart
          </Button>
        </div>
        <ToastNotification
          key={`ring-${key}`}
          kind="info"
          timeout={8000}
          timer="ring"
          title="Ring"
          subtitle="Closes in 8 seconds."
        />
        <ToastNotification
          key={`bar-${key}`}
          kind="info"
          timeout={8000}
          timer="bar"
          title="Bar"
          subtitle="Closes in 8 seconds."
        />
      </div>
    );
  },
};

/** With an action button, as a toast and inline. Here it does not take focus (`hasFocus={false}`). */
export const Actionable = {
  render: () => (
    <div style={column}>
      <ActionableNotification
        kind="error"
        title="Upload failed"
        subtitle="The connection was lost."
        actionButtonLabel="Try again"
        hasFocus={false}
      />
      <ActionableNotification
        inline
        kind="warning"
        title="Unsaved changes"
        subtitle="Save before you leave this page."
        actionButtonLabel="Save"
        hasFocus={false}
      />
    </div>
  ),
};

/** A callout: part of the page, with no close button. */
export const Callouts = {
  name: 'Callout',
  render: () => (
    <div style={column}>
      <Callout
        kind="info"
        title="Billing changes"
        subtitle="New rates apply from the next cycle."
        actionButtonLabel="Learn more"
      />
      <Callout
        kind="warning"
        title="Read only"
        subtitle="You can view this project but not change it."
      />
    </div>
  ),
};

/** An update in place: the words swap out, then in, and the action icon hands off to its status. */
export const UpdateInPlace = {
  render: function UpdateStory() {
    const [done, setDone] = useState(false);
    return (
      <div style={column}>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setDone((d) => !d)}>
            {done ? 'Upload again' : 'Finish upload'}
          </Button>
        </div>
        <InlineNotification
          kind={done ? 'success' : 'info'}
          icon={Upload}
          pending={!done}
          title={done ? 'Uploaded' : 'Uploading'}
          subtitle={
            done
              ? 'quarterly-report.csv is ready.'
              : 'quarterly-report.csv is being uploaded to the project. Keep this page open until it finishes.'
          }
        />
      </div>
    );
  },
};

let messages = 0;

function StackControls({ missed }: { missed: number }) {
  const toasts = useToasts();
  return (
    <div style={{ display: 'grid', gap: 16, maxInlineSize: 360 }}>
      <div style={row}>
        <Button
          size="sm"
          variant="outlined"
          onClick={() =>
            toasts.show({
              kind: 'info',
              title: 'Comment added',
              subtitle: 'A reply was posted to your comment.',
              timeout: 6000,
            })
          }>
          Show info
        </Button>
        <Button
          size="sm"
          variant="outlined"
          onClick={() =>
            toasts.show({
              kind: 'success',
              title: 'Saved',
              subtitle: 'Your changes are saved.',
              timeout: 6000,
            })
          }>
          Show success
        </Button>
        <Button
          size="sm"
          variant="outlined"
          onClick={() =>
            toasts.show({
              kind: 'error',
              role: 'alert',
              title: 'Sync failed',
              subtitle: 'Check your connection.',
            })
          }>
          Show error
        </Button>
        <Button
          size="sm"
          variant="outlined"
          onClick={() =>
            toasts.show({
              type: 'actionable',
              kind: 'warning',
              title: 'Session ending',
              subtitle: 'You will be signed out soon.',
              actionButtonLabel: 'Stay signed in',
            })
          }>
          Show actionable
        </Button>
      </div>
      <div style={row}>
        <Button
          size="sm"
          variant="outlined"
          onClick={(e) =>
            toasts.show(
              {
                kind: 'info',
                title: 'From the button',
                subtitle: 'It grows from the control that caused it.',
                timeout: 6000,
              },
              { from: e.currentTarget }
            )
          }>
          Show from this button
        </Button>
        <Button
          size="sm"
          variant="outlined"
          onClick={() => {
            ['First', 'Second', 'Third'].forEach((title) =>
              toasts.show({ kind: 'info', title, timeout: 6000 })
            );
          }}>
          Show three at once
        </Button>
        <Button
          size="sm"
          variant="outlined"
          onClick={() =>
            toasts.show({
              group: 'messages',
              kind: 'info',
              title: 'New message',
              subtitle: `Message ${++messages}`,
              timeout: 8000,
            })
          }>
          Add to a group
        </Button>
      </div>
      <div style={row}>
        <Button
          size="sm"
          variant="outlined"
          onClick={() =>
            toasts.show({
              id: 'deploy',
              kind: 'info',
              title: 'Deploying',
              subtitle: 'Building the site.',
            })
          }>
          Start deploy
        </Button>
        <Button
          size="sm"
          variant="outlined"
          onClick={() =>
            toasts.show({
              id: 'deploy',
              kind: 'success',
              title: 'Deployed',
              subtitle: 'The site is live.',
              timeout: 6000,
            })
          }>
          Finish deploy
        </Button>
        <Button
          size="sm"
          variant="outlined"
          onClick={() => toasts.close('deploy')}>
          Close deploy
        </Button>
      </div>
      <p>Missed: {missed}</p>
    </div>
  );
}

interface StackArgs {
  cap?: number;
  swipe?: boolean;
  frontChange?: FrontChange;
  shadow?: boolean;
  corners?: NotificationCorners;
}

/**
 * Toasts in a stack. Add a few: they gather into a deck, and hover or focus
 * opens it into a list and holds every timer. Close a toast, swipe it right,
 * or let it time out. A toast that times out or is pushed past the cap is
 * counted as missed.
 */
export const Stack = {
  name: 'Toast stack',
  args: { cap: 3, swipe: true, frontChange: 'swap', shadow: true },
  argTypes: {
    frontChange: { control: 'inline-radio', options: ['swap', 'snap'] },
    corners: { control: 'inline-radio', options: CORNERS },
  },
  render: function StackStory(args: StackArgs) {
    const [missed, setMissed] = useState(0);
    return (
      <div
        style={{
          display: 'flex',
          gap: 32,
          alignItems: 'flex-start',
          minBlockSize: 480,
        }}>
        <ToastStack {...args} onMissed={(t) => setMissed((m) => m + t.count)}>
          <StackControls missed={missed} />
        </ToastStack>
      </div>
    );
  },
};
