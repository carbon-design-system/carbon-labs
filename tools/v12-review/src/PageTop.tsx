/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// A page's header: the kit's PageHeader, ghost, as the shell's pages have
// it, sticking at the top of the shell's workspace as the page scrolls: under
// the bar and the inset workspace's gutter, or the bar alone where the
// workspace is flush (compact), read from the shell's own layout.

import React, { useLayoutEffect, useState } from 'react';
import { PageHeader } from '@carbon-labs/react-page-header';
import type { PageHeaderProps } from '@carbon-labs/react-page-header';

/** The workspace's top on the page, px: where the shell lays it out, again whenever it resizes. */
function useWorkspaceTop() {
  const [top, setTop] = useState(0);
  useLayoutEffect(() => {
    const workspace = document
      .querySelector('.v12r-main')
      ?.closest<HTMLElement>('.cds-app-shell__workspace');
    if (!workspace) {
      return;
    }
    const measure = () =>
      setTop(
        Math.round(workspace.getBoundingClientRect().top + window.scrollY)
      );
    measure();
    // A size class lays the workspace out again (flush at compact): it resizes.
    const ro = new ResizeObserver(measure);
    ro.observe(workspace);
    return () => ro.disconnect();
  }, []);
  return top;
}

export function PageTop(props: PageHeaderProps) {
  const top = useWorkspaceTop();
  return <PageHeader frame="ghost" pageHeaderOffset={top} {...props} />;
}
