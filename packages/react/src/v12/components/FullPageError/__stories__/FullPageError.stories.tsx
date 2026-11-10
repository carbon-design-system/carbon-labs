/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Button } from '@carbon/react';
import { FullPageError } from '../index';
import mdx from './FullPageError.mdx';

export default {
  title: 'V12/FullPageError',
  component: FullPageError,
  tags: ['alpha'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: mdx,
    },
    v12: {
      motion: ['arrow-draw', 'group-fades', 'content-swap'],
      reduced: {},
      states: ['arrive', 'swap'],
    },
  },
  argTypes: {
    kind: { control: 'inline-radio', options: ['custom', '403', '404'] },
  },
};

/** A 404: the label's arrow draws, then the error and the rest fade in. */
export const Default = {
  args: {
    kind: '404',
    label: 'Error 404',
    title: 'Page not found',
    description:
      'The page you are looking for may have moved, or it may never have existed.',
  },
};

/** A 403, with an action as its children. */
export const Forbidden = {
  args: {
    kind: '403',
    label: 'Error 403',
    title: 'Access denied',
    description: 'You do not have permission to view this page.',
    children: <Button>Request access</Button>,
  },
};

/** A new error on a mounted page swaps out, then in. */
export const Swap = {
  render: function SwapStory() {
    const [notFound, setNotFound] = useState(true);
    return (
      <div>
        <Button
          size="sm"
          kind="tertiary"
          onClick={() => setNotFound((v) => !v)}>
          Show {notFound ? '403' : '404'}
        </Button>
        {notFound ? (
          <FullPageError
            kind="404"
            label="Error 404"
            title="Page not found"
            description="The page you are looking for may have moved."
          />
        ) : (
          <FullPageError
            kind="403"
            label="Error 403"
            title="Access denied"
            description="You do not have permission to view this page."
          />
        )}
      </div>
    );
  },
};
