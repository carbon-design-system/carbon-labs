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
  STATUS_INDICATOR_KINDS,
  STATUS_INDICATOR_MARK,
  StatusIndicator,
} from '../components/StatusIndicator';

describe('StatusIndicator', () => {
  it('is a mark and a label, the mark hidden (the label names the status), the root a motion-icon frame', () => {
    const html = renderToStaticMarkup(
      <StatusIndicator kind="success" label="Succeeded" />
    );
    expect(html).toMatch(
      /^<span class="cds-status-indicator cds-status-indicator--md cds-status-indicator--success" data-kind="success" data-motion-icon-frame="">/
    );
    expect(html).toMatch(
      /<span class="cds-status-indicator__mark" aria-hidden="true"><span class="fb-mark fb-mark--success"/
    );
    expect(html).toContain(
      '<span class="cds-status-indicator__face" data-face="in">Succeeded</span>'
    );
  });

  it('gives every kind a mark of its own shape', () => {
    const marks = STATUS_INDICATOR_KINDS.map((k) => STATUS_INDICATOR_MARK[k]);
    expect(new Set(marks).size).toBe(STATUS_INDICATOR_KINDS.length);
    for (const kind of STATUS_INDICATOR_KINDS) {
      const html = renderToStaticMarkup(
        <StatusIndicator kind={kind} label={kind} />
      );
      expect(html).toContain(`fb-mark--${STATUS_INDICATOR_MARK[kind]}`);
      expect(html).toContain('<svg');
    }
  });

  it('sizes its mark with its type: sm and md 16px, lg 20px', () => {
    expect(
      renderToStaticMarkup(
        <StatusIndicator kind="error" label="Failed" size="sm" />
      )
    ).toContain('--fb-mark-size:16px');
    expect(
      renderToStaticMarkup(<StatusIndicator kind="error" label="Failed" />)
    ).toContain('--fb-mark-size:16px');
    expect(
      renderToStaticMarkup(
        <StatusIndicator kind="error" label="Failed" size="lg" />
      )
    ).toContain('--fb-mark-size:20px');
  });

  it('pending is the spinner, neutral or hero', () => {
    expect(
      renderToStaticMarkup(<StatusIndicator kind="pending" label="Running" />)
    ).toContain('cds-spinner');
    expect(
      renderToStaticMarkup(
        <StatusIndicator kind="pending" label="Running" variant="hero" />
      )
    ).toContain('fb-mark--hero');
  });

  it('labels: every label held, hidden, so the slot is the widest one’s width', () => {
    const html = renderToStaticMarkup(
      <StatusIndicator
        kind="paused"
        label="Paused"
        labels={['Running', 'Paused', 'Not started']}
      />
    );
    expect(
      html.match(/cds-status-indicator__reserve" aria-hidden="true"/g)
    ).toHaveLength(3);
    expect(html).toContain('>Not started</span>');
  });

  it('passes other attributes to the root', () => {
    const html = renderToStaticMarkup(
      <StatusIndicator kind="info" label="Queued" id="job-4" title="Job 4" />
    );
    expect(html).toContain('id="job-4"');
    expect(html).toContain('title="Job 4"');
  });
});
