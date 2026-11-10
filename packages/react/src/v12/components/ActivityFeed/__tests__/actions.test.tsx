/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  ActivityFeed,
  type ActivityEvent,
  type ActivityEventAction,
} from '../components/ActivityFeed';

const event = (actions?: ActivityEventAction[]): ActivityEvent => ({
  id: 'e',
  actor: 'Ana Ruiz',
  action: 'asked for your review of',
  object: 'ledger-prod-1',
  timestamp: Date.now(),
  actions: actions as ActivityEvent['actions'],
});

const buttons = (html: string) =>
  html.match(/<button[^>]*cds-afeed__action[^>]*>/g) ?? [];

describe('ActivityFeed actions', () => {
  it('draws an event’s actions as small ghost buttons, at most two', () => {
    const three = [
      { text: 'Approve' },
      { text: 'Request changes' },
      { text: 'Dismiss' },
    ];
    const html = renderToStaticMarkup(<ActivityFeed events={[event(three)]} />);
    const found = buttons(html);
    expect(found).toHaveLength(2);
    for (const b of found) expect(b).toContain('cds-btn--ghost');
    expect(html).toContain('Request changes');
    expect(html).not.toContain('Dismiss');
    // Each is described by its event's line.
    const line = html.match(/<p class="cds-afeed__what" id="([^"]+)"/)![1];
    for (const b of found) expect(b).toContain(`aria-describedby="${line}"`);
  });

  it('draws none for an event that asks nothing', () => {
    const html = renderToStaticMarkup(<ActivityFeed events={[event()]} />);
    expect(html).not.toContain('cds-afeed__actions');
  });
});
