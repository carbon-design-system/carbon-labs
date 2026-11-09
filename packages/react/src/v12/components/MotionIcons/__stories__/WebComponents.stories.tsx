/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Live web components (the package's source, registered per icon), rendered
 * by React as custom elements, in the behaviour pages' order: toggles with
 * their events, status icons, actions, hover icons; then the still drawings
 * and the generic element. Each behaviour's full gallery is the React one
 * (Motion Icons › Gallery: Toggle, Status, Action, Hover): the elements draw the same
 * frames (the parity suite checks it), so the examples show the binding,
 * not every icon again.
 */
import React, { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import '@carbon-labs/wc-motion-icons/icons/add';
import '@carbon-labs/wc-motion-icons/icons/search';
import '@carbon-labs/wc-motion-icons/icons/settings';
import '@carbon-labs/wc-motion-icons/icons/download';
import '@carbon-labs/wc-motion-icons/icons/bookmark-toggle';
import '@carbon-labs/wc-motion-icons/icons/play-pause-toggle';
import '@carbon-labs/wc-motion-icons/icons/menu-toggle';
import '@carbon-labs/wc-motion-icons/icons/copy-toggle';
import '@carbon-labs/wc-motion-icons/icons/progress-step';
import '@carbon-labs/wc-motion-icons/icons/skill-level-toggle';
import '@carbon-labs/wc-motion-icons/icons/checkbox-toggle';
import '@carbon-labs/wc-motion-icons/icons/save';
import '@carbon-labs/wc-motion-icons/icons/notification';
import '@carbon-labs/wc-motion-icons/icons/status-pip';
import '@carbon-labs/wc-motion-icons/icons/copy';
import '@carbon-labs/wc-motion-icons/icons/send';
import '@carbon-labs/wc-motion-icons/icons/trash-can';
import '@carbon-labs/wc-motion-icons/icons/renew';
import '@carbon-labs/wc-motion-icons/motion-icon';

const meta: Meta = {
  title: 'V12/Motion Icons/Web components/Examples',
  tags: ['alpha'],
};
export default meta;
type Story = StoryObj;

/** A custom element by tag (React 19 passes attributes through). */
const El = ({ tag, ...attrs }: { tag: string } & Record<string, unknown>) =>
  React.createElement(tag, attrs);
const row: React.CSSProperties = {
  display: 'flex',
  gap: 24,
  alignItems: 'center',
  flexWrap: 'wrap',
  color: 'var(--cds-icon-primary, #161616)',
};
const cell: React.CSSProperties = {
  display: 'grid',
  justifyItems: 'center',
  gap: 8,
  fontSize: 12,
};

function ToggleWithEvents() {
  const ref = useRef<HTMLElement>(null);
  const [log, setLog] = useState<string[]>([]);
  useEffect(() => {
    const el = ref.current!;
    const on = (e: Event) =>
      setLog((l) =>
        [`${e.type} ${JSON.stringify((e as CustomEvent).detail)}`, ...l].slice(
          0,
          6
        )
      );
    el.addEventListener('clabs-motion-icon-beingchanged', on);
    el.addEventListener('clabs-motion-icon-changed', on);
    return () => {
      el.removeEventListener('clabs-motion-icon-beingchanged', on);
      el.removeEventListener('clabs-motion-icon-changed', on);
    };
  }, []);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={row}>
        {React.createElement('clabs-motion-icon-bookmark-toggle', {
          ref,
          'as-button': '',
          'aria-label': 'Bookmark',
        })}
        <El tag="clabs-motion-icon-play-pause-toggle" />
        <El
          tag="clabs-motion-icon-play-pause-toggle"
          variant="outline"
          filled=""
        />
        <El tag="clabs-motion-icon-menu-toggle" />
        <El tag="clabs-motion-icon-copy-toggle" />
        <El tag="clabs-motion-icon-checkbox-toggle" />
        <El tag="clabs-motion-icon-checkbox-toggle" filled="false" />
        <El tag="clabs-motion-icon-skill-level-toggle" />
      </div>
      <pre style={{ fontSize: 12, margin: 0 }}>
        {log.join('\n') || 'Click the bookmark, or Tab to it and press Space.'}
      </pre>
    </div>
  );
}
export const Toggle: Story = { render: () => <ToggleWithEvents /> };

/** A progress step's icon, set by `value` (its clicks don't change it): each button sets every size to that state. */
function ProgressSteps() {
  const states = ['incomplete', 'current', 'complete', 'invalid'] as const;
  const [value, setValue] = useState<(typeof states)[number]>('incomplete');
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={row}>
        {[16, 20, 24, 32].map((size) => (
          <El
            key={size}
            tag="clabs-motion-icon-progress-step"
            size={String(size)}
            value={value}
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {states.map((s) => (
          <button
            key={s}
            type="button"
            className="cn-btn"
            aria-pressed={s === value}
            onClick={() => setValue(s)}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
export const ProgressStep: Story = { render: () => <ProgressSteps /> };

export const Status: Story = {
  render: () => (
    <div style={row}>
      <El tag="clabs-motion-icon-save" />
      <El tag="clabs-motion-icon-save" status="success" />
      <El tag="clabs-motion-icon-save" status="pending" />
      <El tag="clabs-motion-icon-save" status="error" tone="" />
      <El tag="clabs-motion-icon-notification" status="notification" />
      <El tag="clabs-motion-icon-notification" count="3" />
      <El tag="clabs-motion-icon-notification" count="12" tone="" />
      <El tag="clabs-motion-status-pip" count="7" />
    </div>
  ),
};

/** Five of the actions: `trigger()` on each, the hand-off and the loop as attributes. */
function Actions() {
  const tags = [
    'clabs-motion-icon-copy',
    'clabs-motion-icon-send',
    'clabs-motion-icon-trash-can',
    'clabs-motion-icon-notification',
    'clabs-motion-icon-renew',
  ];
  const [looping, setLooping] = useState(false);
  type Actor = HTMLElement & { trigger?: (o?: unknown) => Promise<void> };
  // The elements, found from the clicked button (no refs to keep in step).
  const actors = (e: React.MouseEvent) => [
    ...(e.currentTarget
      .closest('[data-actions]')
      ?.querySelectorAll<Actor>(tags.join(',')) ?? []),
  ];
  const ghost = 'cn-btn'; // The host Storybook's ghost button, where its stylesheet has one; plain elsewhere
  return (
    <div style={{ display: 'grid', gap: 12 }} data-actions="">
      <div style={row}>
        {tags.map((t) => (
          <div key={t} style={cell}>
            {React.createElement(t, {
              ...(t === 'clabs-motion-icon-renew'
                ? {
                    'action-then': 'success 1500',
                    ...(looping ? { loop: '' } : {}),
                  }
                : {}),
            })}
            <code>{`<${t}>`}</code>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          className={ghost}
          onClick={(e) => actors(e).forEach((el) => void el.trigger?.())}>
          el.trigger()
        </button>
        <button
          type="button"
          className={ghost}
          onClick={(e) =>
            void actors(e)[0]?.trigger?.({
              then: { status: 'success', for: 1500 },
            })
          }>
          copy: then success
        </button>
        <button
          type="button"
          className={ghost}
          onClick={() => setLooping((v) => !v)}>
          renew: {looping ? 'remove loop (hands off to success)' : 'set loop'}
        </button>
      </div>
    </div>
  );
}
export const Action: Story = { render: () => <Actions /> };

export const Hover: Story = {
  render: () => (
    <div style={row}>
      {[
        'clabs-motion-icon-add',
        'clabs-motion-icon-search',
        'clabs-motion-icon-settings',
        'clabs-motion-icon-download',
      ].map((t) => (
        <div key={t} style={cell}>
          <El tag={t} />
          <code>{`<${t}>`}</code>
        </div>
      ))}
      <div style={cell}>
        <El tag="clabs-motion-icon-settings" size="16" />
        <code>size="16"</code>
      </div>
    </div>
  ),
};

export const StillDrawings: Story = {
  name: 'animated="false" (Carbon\'s art)',
  render: () => (
    <div style={row}>
      <El tag="clabs-motion-icon-add" animated="false" />
      <El tag="clabs-motion-icon-settings" animated="false" />
      <El tag="clabs-motion-icon-bookmark-toggle" animated="false" value="on" />
      <El
        tag="clabs-motion-icon-play-pause-toggle"
        animated="false"
        value="pause"
      />
      <El tag="clabs-motion-icon-save" animated="false" status="success" />
    </div>
  ),
};

export const ByName: Story = {
  name: '<clabs-motion-icon name>',
  render: () => {
    function Picker() {
      const [name, setName] = useState('settings');
      return (
        <div style={row}>
          <select value={name} onChange={(e) => setName(e.target.value)}>
            {[
              'settings',
              'add',
              'search',
              'download',
              'bookmark-toggle',
              'save',
            ].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
          <El tag="clabs-motion-icon" name={name} size="32" />
        </div>
      );
    }
    return <Picker />;
  },
};
