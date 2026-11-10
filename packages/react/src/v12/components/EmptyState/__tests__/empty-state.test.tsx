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
import {
  EmptyState,
  EmptyStateKinds,
  resolveEmptyStateContext,
} from '../components/EmptyState';

describe('EmptyState context', () => {
  it('is its own when given, else what it sits on', () => {
    expect(resolveEmptyStateContext('tile', 'ghost')).toBe('tile');
    expect(resolveEmptyStateContext(undefined, 'ghost')).toBe('panel');
    expect(resolveEmptyStateContext(undefined, 'inset')).toBe('page');
    expect(resolveEmptyStateContext(undefined, undefined)).toBe('page');
  });

  it('defaults from the surrounding framed surface', () => {
    const alone = renderToStaticMarkup(<EmptyState title="Nothing" />);
    expect(alone).toContain('cds-empty-state--page');
    expect(alone).toContain('cds-empty-state--lg');
    expect(alone).toContain('<h2');

    const framed = renderToStaticMarkup(
      <KitDefaults frame="ghost">
        <EmptyState title="Nothing" context="table" />
      </KitDefaults>
    );
    expect(framed).toContain('cds-empty-state--table');
  });
});

describe('EmptyState illustrations', () => {
  it('each kind draws one inline SVG, decorative, with no colour of its own', () => {
    for (const kind of EmptyStateKinds) {
      const html = renderToStaticMarkup(
        <EmptyState kind={kind} title="Nothing" />
      );
      expect(html.match(/<svg/g)?.length, kind).toBe(1);
      expect(html).toContain(`cds-empty-state-art--${kind}`);
      expect(html).toContain('aria-hidden="true"');
      expect(html).not.toContain('<img');
      expect(html).not.toMatch(/#[0-9a-f]{3,6}\b|rgb\(|(?:fill|stroke)="/i);
    }
  });

  it('your own illustration takes the kind’s place; no kind, no drawing', () => {
    const own = renderToStaticMarkup(
      <EmptyState kind="no-data" illustration="/x.svg" title="Nothing" />
    );
    expect(own).toContain('<img');
    expect(own).not.toContain('cds-empty-state-art');
    expect(renderToStaticMarkup(<EmptyState title="Nothing" />)).not.toContain(
      '<svg'
    );
  });
});
