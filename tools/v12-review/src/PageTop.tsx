/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// A page's header: the kit's PageHeader, ghost, as the shell's pages have
// it, sticking at the top of the shell's inset workspace as the page scrolls.

import React from 'react';
import { PageHeader } from '@carbon-labs/react-page-header';
import type { PageHeaderProps } from '@carbon-labs/react-page-header';

/** The workspace's top, px: the shell's bar (48) and the workspace's gutter (16). */
const WORKSPACE_TOP = 64;

export function PageTop(props: PageHeaderProps) {
  return (
    <PageHeader frame="ghost" pageHeaderOffset={WORKSPACE_TOP} {...props} />
  );
}
