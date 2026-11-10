/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import type { HTMLAttributes } from 'react';
import { ButtonSkeleton } from '@carbon-labs/react-button';
import { SkeletonText } from '@carbon-labs/react-feedback';
import './file-uploader.scss';

/* ============================================================================
 * FileUploaderSkeleton — Carbon v11's FileUploaderSkeleton: the title, the
 * description and the button as skeleton blocks (the kit's SkeletonText and
 * ButtonSkeleton, pulsing on the page's skeleton wave). The button block is
 * the default FileUploaderButton's own box ("Add file", md), so the
 * uploader that replaces it takes the same space.
 * ========================================================================== */

export interface FileUploaderSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function FileUploaderSkeleton({
  className,
  ...rest
}: FileUploaderSkeletonProps) {
  return (
    <div
      {...rest}
      className={['cds-file-uploader', 'cds-file-uploader--skeleton', className]
        .filter(Boolean)
        .join(' ')}
      aria-busy="true">
      <SkeletonText heading width="100px" />
      <SkeletonText width="225px" className="cds-file__label-description" />
      <ButtonSkeleton size="md" label="Add file" />
    </div>
  );
}
