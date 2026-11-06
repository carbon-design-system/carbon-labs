/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import type { StoryContext } from '@storybook/react';

export interface CompareOptions {
  /** The story on the left, by id (`v12-button--primary`). */
  before: string;
  /** The story on the right, by id. */
  after: string;
  /** The captions. */
  labels?: [string, string];
  /** Each frame's height, px. */
  height?: number;
}

const caption: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: 12,
  lineHeight: '16px',
  background: 'var(--cds-layer-01, #f4f4f4)',
  color: 'var(--cds-text-secondary, #525252)',
};

/**
 * The URL of a story in its own frame, carrying the current toolbar picks,
 * so both sides of a comparison run under the same theme, clock and
 * reduced-motion level.
 *
 * @param id The story id.
 * @param globals The current globals.
 * @returns The `iframe.html` URL, resolved against the current frame.
 */
export function storyFrameUrl(
  id: string,
  globals: Record<string, unknown>
): string {
  const url = new URL('iframe.html', window.location.href);
  url.search = '';
  url.searchParams.set('id', id);
  url.searchParams.set('viewMode', 'story');
  const picks = Object.entries(globals)
    .filter(([, v]) => ['string', 'number', 'boolean'].includes(typeof v))
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
  if (picks) url.searchParams.set('globals', picks);
  return url.toString();
}

interface CompareProps extends Required<CompareOptions> {
  globals: Record<string, unknown>;
}

/** Two stories side by side, each in its own frame. */
function Compare({ before, after, labels, height, globals }: CompareProps) {
  const sides: Array<[string, string]> = [
    [labels[0], before],
    [labels[1], after],
  ];
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 1,
        background: 'var(--cds-border-subtle-01, #e0e0e0)',
      }}>
      {sides.map(([text, id]) => (
        <figure key={id} style={{ margin: 0 }}>
          <figcaption style={caption}>
            {text} · <code>{id}</code>
          </figcaption>
          <iframe
            title={`${text}: ${id}`}
            src={storyFrameUrl(id, globals)}
            style={{ display: 'block', width: '100%', height, border: 0 }}
          />
        </figure>
      ))}
    </div>
  );
}

/**
 * A story that shows two stories side by side under the same toolbar picks:
 * a component before and after a motion change.
 *
 * ```ts
 * export const Compare = compareStory({
 *   before: 'v12-button--primary',
 *   after: 'v12-button--primary-on-the-seam',
 * });
 * ```
 *
 * @param options The two story ids, the captions and the height.
 * @returns The story.
 */
export function compareStory(options: CompareOptions) {
  const { before, after, labels = ['Before', 'After'], height = 320 } = options;
  return {
    render: (_args: unknown, context: StoryContext) => (
      <Compare
        before={before}
        after={after}
        labels={labels}
        height={height}
        globals={context.globals}
      />
    ),
    parameters: { layout: 'fullscreen', controls: { disable: true } },
  };
}
