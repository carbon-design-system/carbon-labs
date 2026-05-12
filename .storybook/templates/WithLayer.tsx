/**
 * Copyright IBM Corp. 2019, 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Layer } from '@carbon/react';
import './WithLayer.scss';

export interface WithLayerProps {
  children: (layer: number) => React.ReactNode;
}

/**
 * Storybook template layer component for React stories
 * Demonstrates components in different layer contexts
 */
export const WithLayer: React.FC<WithLayerProps> = ({ children }) => {
  return (
    <>
      <div className="sb-with-layer-background">
        <div className="sb-with-layer-label">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M8.5 3L14 6.062v4.875L8.5 14 3 10.937V6.063L8.5 3zm0 1.5L4.5 6.75v2.5L8.5 12l4-2.75v-2.5L8.5 4.5z"/>
          </svg>
          $background
        </div>
        <div className="sb-with-layer-content">
          {children(0)}
          <Layer>
            <div className="sb-with-layer-layer">
              <div className="sb-with-layer-label">
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path d="M8.5 3L14 6.062v4.875L8.5 14 3 10.937V6.063L8.5 3zm0 1.5L4.5 6.75v2.5L8.5 12l4-2.75v-2.5L8.5 4.5z"/>
                </svg>
                $layer-01
              </div>
              <div className="sb-with-layer-content">
                {children(1)}
                <Layer>
                  <div className="sb-with-layer-layer">
                    <div className="sb-with-layer-label">
                      <svg width="16" height="16" viewBox="0 0 16 16">
                        <path d="M8.5 3L14 6.062v4.875L8.5 14 3 10.937V6.063L8.5 3zm0 1.5L4.5 6.75v2.5L8.5 12l4-2.75v-2.5L8.5 4.5z"/>
                      </svg>
                      $layer-02
                    </div>
                    <div className="sb-with-layer-content">
                      {children(2)}
                    </div>
                  </div>
                </Layer>
              </div>
            </div>
          </Layer>
        </div>
      </div>
    </>
  );
};
