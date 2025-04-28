/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import mdx from './ResizeBar.mdx';
import { ResizeBar } from '../components/ResizeBar';
import '../components/resize-bar.scss';

export default {
  title: 'Components/ResizeBar',
  component: ResizeBar,
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

/**
 * Default story for ResizeBar
 */
// export const Default = () => <ResizeBar />;
export const SinglePanelNoBoundaries = () => (
  <>
    <style>
      {`
        .single-panel {
          display: flex;
          flex-direction: column;
          width: 600px;
        }

        .single-panel__panel {
          padding: 1rem;
          background-color: var(--cds-layer-01);
          min-block-size: 60px;
          overflow: auto;
          transition: all 150ms linear;
        }
      `}
    </style>
    <div className="single-panel">
      <div className="single-panel__panel">
        <h3 className="single-panel__panel-title">
          Single Panel (no boundaries)
        </h3>
        <p>
          This is a basic resizable panel that can be adjusted vertically using
          the resize handle below. The panel takes height according to the content, but can also be pre set.
        </p>
      </div>
      <ResizeBar orientation="horizontal" />
    </div>
  </>
);

export const SinglePanelBounded = () => (
  <>
    <style>{`
.single-panel-bounded {
	 width: 600px;
	 height: 400px;
}
 .single-panel-bounded__container {
	 height: 100%;
	 display: flex;
	 flex-direction: column;
}
 .single-panel-bounded__panel {
	 padding: 1rem;
	 background-color: var(--cds-layer-01);
	 min-block-size: 60px;
	 overflow: auto;
	 transition: all 150ms linear;
}
 `}</style>
    <div className="single-panel-bounded">
      <div className="single-panel-bounded__container">
        <div className="single-panel-bounded__panel">
          <h3 className="single-panel-bounded__panel-title">Single Panel (bounded)</h3>
          <p>
            This panel demonstrates how resizing can be constrained within fixed
            boundaries. The panel is contained within a 600x400 pixel container,
            ensuring that the resizing behavior remains within these defined
            limits.
          </p>
        </div>
        <ResizeBar orientation="horizontal" />
      </div>
    </div>
  </>
);

export const SinglePanelOverlay = () => (
  <>
    <style>{`
  .single-panel-overlay {
	 position: relative;
	 width: 600px;
	 height: 400px;
}
 .single-panel-overlay__content {
	 padding: 1rem;
	 height: 100%;
	 overflow: auto;
}
 .single-panel-overlay__panel {
	 position: absolute;
	 bottom: 0;
	 left: 0;
	 width: 100%;
	 max-height: 400px;
	 background-color: var(--cds-layer-01);
	 z-index: 1;
	 display: flex;
	 flex-direction: column;
}
 .single-panel-overlay__panel-content {
	 padding: 1rem;
	 overflow: auto;
	 height: 200px;
	 min-block-size: 60px;
	 transition: all 150ms linear;
}
 
  `}</style>
    <div className="single-panel-overlay">
      <div className="single-panel-overlay__content">
        <h3>Main Content</h3>
        <p>
          This is the main content area that remains fixed in the background. It
          demonstrates how content can be organized in layers, with the overlay
          panel providing additional context or controls when needed.
        </p>
      </div>
      <div className="single-panel-overlay__panel">
        <ResizeBar orientation="horizontal" />
        <div className="single-panel-overlay__panel-content">
          <h3 className="single-panel-overlay__panel-title">Overlay Panel</h3>
          <p>
            This sliding panel overlays the main content and can be resized from
            the top edge. It's useful for displaying additional information or
            controls while maintaining access to the main content above.
          </p>
        </div>
      </div>
    </div>
  </>
);

export const TwoPanelsHorizontal = () => (
  <>
    <style>{`
  .two-panels-horizontal {
	 display: flex;
	 flex-direction: column;
	 width: 600px;
	 height: 400px;
}
 .two-panels-horizontal__panel {
	 height: 100%;
	 background-color: var(--cds-layer-01);
	 padding: 1rem;
	 overflow: auto;
	 min-block-size: 48px;
	 transition: all 150ms linear;
}
 
  `}</style>
    <div className="two-panels-horizontal">
      <div className="two-panels-horizontal__panel">
        <h3 className="two-panels-horizontal__panel-title">Top Panel</h3>
        <p>
          The top panel in this vertically stacked layout can be adjusted using
          the horizontal resize handle below. This arrangement is particularly
          useful for interfaces that need to display different levels of
          information, such as a preview area above and details below.
        </p>
      </div>
      <ResizeBar orientation="horizontal" />
      <div className="two-panels-horizontal__panel">
        <h3 className="two-panels-horizontal__panel-title">Bottom Panel</h3>
        <p>
          The bottom panel adapts its size in response to the top panel's
          resizing, maintaining a fluid and responsive layout. This setup works
          well for scenarios like log viewers, console outputs, or supplementary
          information displays.
        </p>
      </div>
    </div>
  </>
);

export const TwoPanelsVertical = () => (
  <>
    <style>{`
  .two-panels-vertical {
	 display: flex;
	 width: 600px;
	 height: 400px;
}
 .two-panels-vertical__panel {
	 background-color: var(--cds-layer-01);
	 padding: 1rem;
	 overflow: auto;
	 min-inline-size: 48px;
	 transition: all 150ms linear;
}
 
  `}</style>
    <div className="two-panels-vertical">
      <div className="two-panels-vertical__panel">
        <h3 className="two-panels-vertical__panel-title">Left Panel</h3>
        <p>
          This panel forms the left section of a two-panel layout. The vertical
          resize handle between panels allows for horizontal adjustment, making
          it perfect for side-by-side content organization like navigation menus
          and main content areas.
        </p>
      </div>
      <ResizeBar orientation="vertical" />
      <div className="two-panels-vertical__panel">
        <h3 className="two-panels-vertical__panel-title">Right Panel</h3>
        <p>
          The right panel complements the left panel, creating a flexible
          workspace. This arrangement is ideal for applications requiring
          concurrent view of related content, such as code editors with preview
          panes or document comparison tools.
        </p>
      </div>
    </div>
  </>
);