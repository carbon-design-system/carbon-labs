/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import type { ReactNode } from 'react';
import { SkeletonOf } from '@carbon-labs/react-feedback';
import { Tile, type TileProps } from './Tile';

/* ============================================================================
 * TileSkeleton: a tile, loading.
 *
 *   data      the whole tile is one block of its own box and corners: a
 *             block standing for a container. Its expected content
 *             (`children`) sizes it, unseen; without any, `minHeight`
 *
 * API: the Tile's props.
 * ========================================================================== */

export interface TileSkeletonProps extends Pick<
  TileProps,
  'className' | 'style'
> {
  /** The expected content, unseen: the tile is its size. */
  children?: ReactNode;
}

export function TileSkeleton({ children, style, ...rest }: TileSkeletonProps) {
  return (
    <SkeletonOf blocks=".cds-kit-tile">
      <Tile
        {...rest}
        style={children ? style : { minBlockSize: '8rem', ...style }}>
        {children}
      </Tile>
    </SkeletonOf>
  );
}
