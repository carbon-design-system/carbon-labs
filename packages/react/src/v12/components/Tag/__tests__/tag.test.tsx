/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { KitDefaults } from '@carbon-labs/react-kit-defaults';
import { DismissibleTag } from '../components/DismissibleTag';
import { TAG_SNAP_SCALE } from '../components/tag-snap';

describe('TAG_SNAP_SCALE', () => {
  it('is set in px, from below: sm and md start 2px shorter, lg 3px (18px from 16, 20px from 18, 32px from 29)', () => {
    expect(18 * TAG_SNAP_SCALE.sm).toBeCloseTo(16, 6);
    expect(20 * TAG_SNAP_SCALE.md).toBeCloseTo(18, 6);
    expect(32 * TAG_SNAP_SCALE.lg).toBeCloseTo(29, 6);
    for (const s of Object.values(TAG_SNAP_SCALE)) expect(s).toBeLessThan(1);
  });
});

const noop = () => {};

describe('DismissibleTag', () => {
  it('is the Tag with its text and a close, the tag the close icon’s frame', () => {
    const html = renderToStaticMarkup(
      <DismissibleTag text="Status: Running" type="blue" onClose={noop} />
    );
    expect(html).toMatch(
      /class="cds-tag cds-tag--blue cds-tag--md cds-dismissible-tag"/
    );
    expect(html).toContain('data-motion-icon-frame=""');
    expect(html).toMatch(
      /class="cds-dismissible-tag__text" title="Status: Running">Status: Running</
    );
    expect(html).toMatch(
      /cds-icon-btn cds-icon-btn--ghost cds-icon-btn--xs cds-icon-btn--full cds-dismissible-tag__close/
    );
  });

  it('labels the close with v11’s title, described by the text', () => {
    const html = renderToStaticMarkup(
      <DismissibleTag text="eu-de" title="Remove filter" onClose={noop} />
    );
    expect(html).toContain('Remove filter');
    const textId = html.match(
      /id="([^"]+)" class="cds-dismissible-tag__text"/
    )?.[1];
    expect(textId).toBeTruthy();
    expect(html).toContain(`aria-describedby="${textId}"`);
  });

  it('disabled: the stepped-back tag and a disabled close', () => {
    const html = renderToStaticMarkup(
      <DismissibleTag text="Off" disabled onClose={noop} />
    );
    expect(html).toContain('cds-dismissible-tag--disabled');
    expect(html).toMatch(/<button[^>]*disabled=""/);
  });

  it('takes the provider’s size and corners, its close a circle on its glyph whatever the corners', () => {
    const html = renderToStaticMarkup(
      <KitDefaults density="spacious" corners="square">
        <DismissibleTag text="Wide" onClose={noop} />
      </KitDefaults>
    );
    expect(html).toMatch(/cds-tag--lg cds-tag--square cds-dismissible-tag/);
    expect(html).toMatch(/cds-icon-btn--full cds-dismissible-tag__close/);
  });
});
