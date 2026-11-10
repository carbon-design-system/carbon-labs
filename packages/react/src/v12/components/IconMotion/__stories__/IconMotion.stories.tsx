/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { MotionProvider } from '@carbon-labs/v12-motion';
import { Add, Renew } from '@carbon-labs/react-motion-icons';
import { Button } from '@carbon-labs/react-button';
import { FollowKitMotion, useIconAnimated } from '../index';
import mdx from './IconMotion.mdx';

export default {
  title: 'V12/IconMotion',
  component: FollowKitMotion,
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [],
      reduced: {},
      states: ['rest', 'hover'],
    },
  },
  argTypes: {
    level: {
      control: 'inline-radio',
      options: ['full', 'reduced'],
      description: "The MotionProvider's level the icons follow.",
    },
  },
};

function Readout() {
  const animated = useIconAnimated();
  return <p>useIconAnimated(): {String(animated)}</p>;
}

/** Hover a button: under `full` its icon moves, under `reduced` it changes at once. */
export const Default = {
  args: { level: 'full' },
  render: ({ level }: { level: 'full' | 'reduced' }) => (
    <MotionProvider level={level} scope={false}>
      <FollowKitMotion>
        <div style={{ display: 'flex', gap: 16 }}>
          <Button
            frame="ghost"
            size="lg"
            hasIconOnly
            renderIcon={Add}
            iconDescription="Add"
          />
          <Button
            frame="ghost"
            size="lg"
            hasIconOnly
            renderIcon={Renew}
            iconDescription="Renew"
          />
        </div>
        <Readout />
      </FollowKitMotion>
    </MotionProvider>
  ),
};
