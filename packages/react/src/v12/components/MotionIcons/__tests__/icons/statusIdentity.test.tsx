/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * The status-capable icons with no status (and Download and Upload, which
 * take none) are exactly the plain icons without the
 * status layer: the same geometry at every
 * hover frame and size, and the same painted SVG at rest (animated and
 * static). The snapshot hashes were recorded from the committed icons
 * (9f005ac) before any of them took a status, as the toggle consolidation
 * proved its aliases.
 */
import React from 'react';
import { createHash } from 'node:crypto';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as Lib from '../../index';
import { STATUS_ICONS } from '../../icons/statusIcons';

const NAMES = [
  'Download',
  'Renew',
  'Copy',
  'Settings',
  'Save',
  'Upload',
  'Document',
  'Export',
  'Send',
  'Share',
  'Folder',
  'DocumentImport',
  'DocumentExport',
  'DataBase',
  'Printer',
  'CloudUpload',
  'CloudDownload',
  'UserAvatar',
  'User',
  'Notification',
  'Chat',
  'Calendar',
  'Email',
  'ShoppingCart',
  // The status checkmarks: hashes recorded from main (f21cefc), before they took a status.
  'CheckmarkOutline',
  'CheckmarkFilled',
  'InProgress',
  'Incomplete',
  // Activity: hashes recorded from main (8e7156177), before it took a status.
  'Activity',
] as const;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LIB = Lib as unknown as Record<
  string,
  React.ComponentType<any> & {
    geo?: (f: Record<string, number>, size?: number) => unknown;
  }
>;
const SIZES = [16, 20, 24, 32] as const;
const H = Array.from({ length: 21 }, (_, i) => i / 20);
const hash = (v: unknown) =>
  createHash('sha256')
    .update(typeof v === 'string' ? v : JSON.stringify(v))
    .digest('hex')
    .slice(0, 16);

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});
afterEach(cleanup);

function painted(el: React.ReactElement) {
  const { container, unmount } = render(el);
  const html = container.innerHTML.replace(/«[^»]*»|:r[0-9a-z]+:/g, '#id');
  unmount();
  return html;
}

describe('no status: the icons as they were', () => {
  it.each(NAMES)(
    '%s: the same geometry at every hover frame, entering and leaving, at every size',
    (name) => {
      const geo = LIB[name].geo;
      if (!geo) return; // Notification has no frame geometry: its painted SVG is checked below
      const frames: Record<string, string> = {};
      for (const size of SIZES) {
        frames[size] = hash(
          H.flatMap((h) => [
            geo({ h, entering: 1 }, size),
            geo({ h, entering: 0 }, size),
          ])
        );
      }
      expect(frames).toMatchSnapshot();
    }
  );

  it.each(NAMES)(
    '%s: the same painted SVG at rest, animated and static, at every size',
    (name) => {
      const Icon = LIB[name];
      const out: Record<string, string> = {};
      for (const size of SIZES) {
        for (const animated of [true, false])
          out[`${size} ${animated ? 'animated' : 'static'}`] = hash(
            painted(<Icon size={size} animated={animated} />)
          );
      }
      expect(out).toMatchSnapshot();
    }
  );

  it.each(NAMES.filter((n) => n in STATUS_ICONS))(
    '%s: renders the plain icon itself, hovered too',
    (name) => {
      const Icon = LIB[name];
      const Plain = (
        STATUS_ICONS as unknown as Record<
          string,
          {
            status: {
              plain: React.ComponentType<{ size?: number; animated?: boolean }>;
            };
          }
        >
      )[name].status.plain;
      for (const size of SIZES) {
        const a = render(<Icon size={size} animated />);
        const b = render(<Plain size={size} animated />);
        fireEvent.mouseEnter(a.container.querySelector('svg')!);
        fireEvent.mouseEnter(b.container.querySelector('svg')!);
        expect(a.container.innerHTML).toBe(b.container.innerHTML);
        a.unmount();
        b.unmount();
      }
    }
  );
});
