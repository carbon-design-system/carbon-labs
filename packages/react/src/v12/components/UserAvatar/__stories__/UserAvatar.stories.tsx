/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Button } from '@carbon-labs/react-button';
import { UserAvatar, UserAvatarSkeleton } from '../index';
import type {
  UserAvatarBackgroundColor,
  UserAvatarProps,
  UserAvatarSize,
} from '../index';
import mdx from './UserAvatar.mdx';

const SIZES: UserAvatarSize[] = ['sm', 'md', 'lg', 'xl'];

const COLORS: UserAvatarBackgroundColor[] = [
  'order-1-cyan',
  'order-2-gray',
  'order-3-green',
  'order-4-magenta',
  'order-5-purple',
  'order-6-teal',
  'order-7-cyan',
  'order-8-gray',
  'order-9-green',
  'order-10-magenta',
  'order-11-purple',
  'order-12-teal',
];

const ALIGNMENTS: NonNullable<UserAvatarProps['tooltipAlignment']>[] = [
  'top',
  'top-start',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
  'right',
  'right-start',
  'right-end',
];

export default {
  title: 'V12/UserAvatar',
  component: UserAvatar,
  subcomponents: { UserAvatarSkeleton },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: ['tooltip', 'content-swap', 'stillness'],
      reduced: {
        tooltip: 'at-once',
        'content-swap': 'at-once',
      },
      states: ['initials', 'icon', 'image'],
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    backgroundColor: { control: 'select', options: COLORS },
    theme: { control: 'inline-radio', options: ['light', 'dark'] },
    tooltipAlignment: { control: 'select', options: ALIGNMENTS },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
    renderIcon: { control: false },
  },
};

/** An abstract picture as an inline SVG, so no real photo is needed. */
const picture = (sky: string, sun: string, land: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" fill="${sky}"/><circle cx="32" cy="16" r="7" fill="${sun}"/><path d="M0 38 16 22l12 12 8-8 12 12v10H0z" fill="${land}"/></svg>`
  )}`;

const PICTURE_A = picture('#a6c8ff', '#ffffff', '#0f62fe');
const PICTURE_B = picture('#a7f0ba', '#fff1f1', '#198038');

const row = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

/** One avatar: the initials of `name` in a coloured circle. */
export const Default = {
  args: {
    name: 'Sample User',
    size: 'md',
    backgroundColor: 'order-1-cyan',
    timeScale: 1,
  },
  render: (args: UserAvatarProps) => <UserAvatar {...args} />,
};

/** Pick a picture: the initials show until it loads, then swap to it, out then in. Switching to the other picture brings the initials back until it loads. */
export const ImageSwap = {
  args: { timeScale: 1 },
  render: function ImageSwapStory(args: UserAvatarProps) {
    const [image, setImage] = useState<string | undefined>(undefined);
    return (
      <div style={row}>
        <UserAvatar
          name="Sample User"
          size="xl"
          image={image}
          imageDescription="An abstract picture"
          timeScale={args.timeScale}
        />
        <Button
          size="sm"
          variant="outlined"
          onClick={() => setImage(PICTURE_A)}>
          Picture A
        </Button>
        <Button
          size="sm"
          variant="outlined"
          onClick={() => setImage(PICTURE_B)}>
          Picture B
        </Button>
        <Button
          size="sm"
          variant="outlined"
          onClick={() => setImage(undefined)}>
          No image
        </Button>
      </div>
    );
  },
};

/** sm 24, md 32, lg 40 and xl 48px: initials, the User icon with no name, and an image. */
export const Sizes = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={row}>
        {SIZES.map((size) => (
          <UserAvatar key={size} name="Sample User" size={size} />
        ))}
      </div>
      <div style={row}>
        {SIZES.map((size) => (
          <UserAvatar key={size} size={size} />
        ))}
      </div>
      <div style={row}>
        {SIZES.map((size) => (
          <UserAvatar
            key={size}
            name="Sample User"
            size={size}
            image={PICTURE_A}
            imageDescription="An abstract picture"
          />
        ))}
      </div>
    </div>
  ),
};

/** The twelve colours: orders 7 to 12 are the first six hues a grade deeper. */
export const Colors = {
  render: () => (
    <div style={row}>
      {COLORS.map((color, i) => (
        <UserAvatar
          key={color}
          name={i % 2 ? 'Sample User' : 'Example'}
          backgroundColor={color}
        />
      ))}
    </div>
  ),
};

/** With `tooltipText` each avatar is a tooltip trigger. Move along the row: the first tooltip snaps in, the next ones appear in place. */
export const WithTooltips = {
  render: () => (
    <div style={{ ...row, gap: 8, padding: '32px 32px 96px' }}>
      {COLORS.slice(0, 6).map((color, i) => (
        <UserAvatar
          key={color}
          name={`Member ${String.fromCharCode(65 + i)}`}
          backgroundColor={color}
          tooltipText={`Member ${String.fromCharCode(65 + i)}`}
        />
      ))}
    </div>
  ),
};

/** The loading state: one block of the avatar's own circle. */
export const Skeleton = {
  render: () => (
    <div style={row}>
      {SIZES.map((size) => (
        <UserAvatarSkeleton key={size} size={size} />
      ))}
    </div>
  ),
};
