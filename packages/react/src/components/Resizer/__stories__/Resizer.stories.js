// cspell:ignore resizer
/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef } from 'react';
import mdx from './Resizer.mdx';
import { Resizer } from '../components/Resizer';
import '../components/resizer.scss';
import { DragVertical } from '@carbon/react/icons';

export default {
  title: 'Components/Resizer',
  component: Resizer,
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

// eslint-disable-next-line jsdoc/require-jsdoc
export const SinglePanelNoBoundaries = () => (
  <>
    <style>
      {`
        .single-panel {
          display: flex;
          flex-direction: column;
          width: 600px;
          overflow: hidden;
        }

        .single-panel__panel {
          padding: 1rem;
          background-color: var(--cds-layer);
          min-block-size: 3rem;
          overflow: auto;
          transition: all 150ms linear;
        }

        .clabs__resizer--horizontal::before {
          content: "";
          height: calc(100% + 1rem);
          top: -0.5rem;
          width: 100%;
          position: absolute;
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
          the resize handle below. The panel takes height according to the
          content, but can also be pre set.
        </p>
      </div>
      <Resizer orientation="horizontal" />
    </div>
  </>
);

// eslint-disable-next-line jsdoc/require-jsdoc
export const SinglePanelBounded = () => {
  const panelRef = useRef(null);
  return (
    <>
      <style>{`
      .single-panel-bounded {
        width: 600px;
        height: 400px;
        overflow: hidden;
      }

      .single-panel-bounded__container {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .single-panel-bounded__panel {
        padding: 1rem;
        background-color: var(--cds-layer);
        min-block-size: 3rem;
        overflow: auto;
        transition: all 150ms linear;
      }

      .clabs__resizer--horizontal::before {
        content: "";
        height: calc(100% + 1rem);
        top: -0.5rem;
        width: 100%;
        position: absolute;
      }
    `}</style>
      <div className="single-panel-bounded">
        <div className="single-panel-bounded__container">
          <div className="single-panel-bounded__panel" ref={panelRef}>
            <h3 className="single-panel-bounded__panel-title">
              Single Panel (bounded)
            </h3>
            <p>
              This panel demonstrates how resizing can be constrained within
              fixed boundaries. The panel is contained within a 600x400 pixel
              container, ensuring that the resizing behavior remains within
              these defined limits.
            </p>
          </div>
          <Resizer
            orientation="horizontal"
            onResizeEnd={(_event, ref) =>
              ref.current.setAttribute(
                'aria-label',
                `top panel ${panelRef?.current?.style.height}`
              )
            } // for custom a11y announcements.
          />
        </div>
      </div>
    </>
  );
};

// eslint-disable-next-line jsdoc/require-jsdoc
export const SinglePanelOverlay = () => (
  <>
    <style>{`
      .single-panel-overlay {
        position: relative;
        width: 600px;
        height: 400px;
        overflow: hidden;
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
        background-color: var(--cds-layer);
        z-index: 1;
        display: flex;
        flex-direction: column;
      }

      .single-panel-overlay__panel-content {
        padding: 1rem;
        overflow: auto;
        height: 200px;
        min-block-size: 3rem;
        transition: all 150ms linear;
      }

      .clabs__resizer--horizontal::before {
        content: "";
        height: calc(100% + 1rem);
        top: -0.5rem;
        width: 100%;
        position: absolute;
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
        <Resizer orientation="horizontal" />
        <div className="single-panel-overlay__panel-content">
          <h3 className="single-panel-overlay__panel-title">Overlay Panel</h3>
          <p>
            This sliding panel overlays the main content and can be resized from
            the top edge. Its useful for displaying additional information or
            controls while maintaining access to the main content above.
          </p>
        </div>
      </div>
    </div>
  </>
);

// eslint-disable-next-line jsdoc/require-jsdoc
export const TwoPanelsHorizontal = () => (
  <>
    <style>{`
      .two-panels-horizontal {
        display: flex;
        flex-direction: column;
        width: 600px;
        height: 400px;
        overflow: hidden;
      }

      .two-panels-horizontal__panel {
        height: 100%;
        background-color: var(--cds-layer);
        padding: 1rem;
        overflow: auto;
        min-block-size: 48px;
        transition: all 150ms linear;
      }

      .clabs__resizer--horizontal::before {
        content: "";
        height: calc(100% + 1rem);
        top: -0.5rem;
        width: 100%;
        position: absolute;
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
      <Resizer orientation="horizontal" />
      <div className="two-panels-horizontal__panel">
        <h3 className="two-panels-horizontal__panel-title">Bottom Panel</h3>
        <p>
          The bottom panel adapts its size in response to the top panels
          resizing, maintaining a fluid and responsive layout. This setup works
          well for scenarios like log viewers, console outputs, or supplementary
          information displays.
        </p>
      </div>
    </div>
  </>
);

// eslint-disable-next-line jsdoc/require-jsdoc
export const TwoPanelsVertical = () => (
  <>
    <style>{`
      .two-panels-vertical {
        display: flex;
        width: 600px;
        height: 400px;
        overflow: hidden;
      }

      .two-panels-vertical__panel {
        background-color: var(--cds-layer);
        padding: 1rem;
        overflow: auto;
        min-inline-size: 48px;
        transition: all 150ms linear;
      }

      .clabs__resizer--vertical::before {
        content: "";
        height: 100%;
        left: -0.5rem;
        width: calc(100% + 1rem);
        position: absolute;
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
      <Resizer orientation="vertical" />
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

// eslint-disable-next-line jsdoc/require-jsdoc
export const FourPanels = () => (
  <>
    <style>{`
      .four-panels {
        display: flex;
        height: 400px;
        width: 600px;
      }

      .four-panels__column {
        overflow: auto;
        min-inline-size: 3rem;
        width: 50%;
        display: flex;
        flex-direction: column;
        transition: all 150ms linear;
      }

      .four-panels__panel {
        padding: 1rem;
        background-color: var(--cds-layer);
        overflow: auto;
        min-block-size: 3rem;
        height: 50%;
        transition: all 150ms linear;
      }

      .four-panels__panel--right-top {
        height: 40%;
      }

      .four-panels__panel--right-bottom {
        height: 60%;
      }

      .four-panels__panel-title {
        margin-top: 0;
      }

      .clabs__resizer--vertical::before {
        content: "";
        height: 100%;
        left: -0.5rem;
        width: calc(100% + 1rem);
        position: absolute;
      }

      .clabs__resizer--horizontal::before {
        content: "";
        height: calc(100% + 1rem);
        top: -0.5rem;
        width: 100%;
        position: absolute;
      }
    `}</style>
    <div className="four-panels">
      <div className="four-panels__column">
        <div className="four-panels__panel">
          <h3 className="four-panels__panel-title">Top Left Panel</h3>
          <p>
            Buttons are used to initialize an action, either in the background
            or foreground of an experience. There are several kinds of buttons.
            Primary buttons should be used for the principle call to action on
            the page.
          </p>
        </div>
        <Resizer orientation="horizontal" />
        <div className="four-panels__panel">
          <h3 className="four-panels__panel-title">Bottom Left Panel</h3>
          <p>
            Buttons are used to initialize an action, either in the background
            or foreground of an experience. There are several kinds of buttons.
            Primary buttons should be used for the principle call to action on
            the page.
          </p>
        </div>
      </div>
      <Resizer orientation="vertical" />
      <div className="four-panels__column">
        <div className="four-panels__panel four-panels__panel--right-top">
          <h3 className="four-panels__panel-title">Top Right Panel</h3>
          <p>
            Buttons are used to initialize an action, either in the background
            or foreground of an experience. There are several kinds of buttons.
            Primary buttons should be used for the principle call to action on
            the page.
          </p>
        </div>
        <Resizer orientation="horizontal" />
        <div className="four-panels__panel four-panels__panel--right-bottom">
          <h3 className="four-panels__panel-title">Bottom Right Panel</h3>
          <p>
            Buttons are used to initialize an action, either in the background
            or foreground of an experience. There are several kinds of buttons.
            Primary buttons should be used for the principle call to action on
            the page.
          </p>
        </div>
      </div>
    </div>
  </>
);

// eslint-disable-next-line jsdoc/require-jsdoc
export const TwoPanelsVerticalGrid = () => {
  // fully controlled example

  // eslint-disable-next-line jsdoc/require-jsdoc
  const clampFraction = (value) =>
    Math.max(0.0806723, Math.min(0.919328, value));

  // eslint-disable-next-line jsdoc/require-jsdoc
  const clampWidth = (width, totalWidth) =>
    Math.max(48, Math.min(totalWidth - 48, width));
  const containerRef = useRef(null);
  const startWidthRef = useRef(0);
  const currentFractionRef = useRef(0.5);
  const initialFraction = 0.5;

  // eslint-disable-next-line jsdoc/require-jsdoc
  const handleResize = (event, delta) => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    container.style.transition = event.type === 'keydown' ? '' : 'unset';
    const totalWidth = container.offsetWidth - 5;
    let newFraction = currentFractionRef.current;

    if (event.type === 'keydown') {
      const step = delta / totalWidth;
      newFraction = clampFraction(currentFractionRef.current + step);
    } else {
      const leftPanelWidth = container.firstElementChild?.clientWidth ?? 0;
      if (startWidthRef.current === 0) {
        startWidthRef.current = leftPanelWidth;
      }
      const newWidth = clampWidth(startWidthRef.current + delta, totalWidth);
      newFraction = newWidth / totalWidth;
    }

    currentFractionRef.current = newFraction;
    container.style.gridTemplateColumns = `${newFraction}fr auto ${
      1 - newFraction
    }fr`;
  };

  // eslint-disable-next-line jsdoc/require-jsdoc
  const handleResizeEnd = (event, _ref) => {
    const container = containerRef.current;
    container.style.transition = event.type === 'keydown' ? '' : 'unset';
    startWidthRef.current = 0;
  };

  // eslint-disable-next-line jsdoc/require-jsdoc
  const handleDoubleClick = (event) => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    container.style.transition = event.type !== 'keydown' ? '' : 'unset';
    currentFractionRef.current = initialFraction;
    container.style.gridTemplateColumns = `${initialFraction}fr auto ${
      1 - initialFraction
    }fr`;
  };

  return (
    <>
      <style>{`
        .two-panels-vertical-grid {
          display: grid;
          grid-template-columns: 0.5fr auto 0.5fr;
          width: 600px;
          height: 400px;
          transition: all 150ms linear;
        }

        .two-panels-vertical-grid__panel {
          background-color: var(--cds-layer);
          padding: 1rem;
          overflow: auto;
          min-inline-size: 48px;
        }

        .clabs__resizer--vertical::before {
          content: "";
          height: 100%;
          left: -0.5rem;
          width: calc(100% + 1rem);
          position: absolute;

        }
      `}</style>
      <div className="two-panels-vertical-grid" ref={containerRef}>
        <div className="two-panels-vertical-grid__panel">
          <h3>Left Panel</h3>
          <p>
            Buttons are used to initialize an action, either in the background
            or foreground of an experience. There are several kinds of buttons.
            Primary buttons should be used for the principle call to action on
            the page.
          </p>
        </div>

        <Resizer
          orientation="vertical"
          onResize={handleResize}
          onResizeEnd={handleResizeEnd}
          onDoubleClick={handleDoubleClick}
        />

        <div className="two-panels-vertical-grid__panel">
          <h3>Right Panel</h3>
          <p>
            Buttons are used to initialize an action, either in the background
            or foreground of an experience. There are several kinds of buttons.
            Primary buttons should be used for the principle call to action on
            the page.
          </p>
        </div>
      </div>
    </>
  );
};

// eslint-disable-next-line jsdoc/require-jsdoc
export const WithCustomHandles = () => {
  const panelRef = useRef(null);
  return (
    <>
      <style>{`
        .single-panel-bounded {
          width: 400px;
          height: 200px;
          overflow: hidden;
        }

        .single-panel-bounded__container {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .single-panel-bounded__panel {
          padding: 1rem;
          background-color: var(--cds-layer);
          min-block-size: 3rem;
          overflow: auto;
          transition: all 150ms linear;
        }

        .custom-drag-handler-1 {
          position: absolute;
          top: -6px;
          left: 50%;
          transform: translateX(-50%);
        }

        .custom-drag-handler-2 {
          position: absolute;
          transition: all 0.2s ease-out;
          display: none;
          top: -6px;
          left: 50%;
          transform: translateX(-50%);
        }

        .custom-resizer-2:hover .custom-drag-handler-2 {
          display: unset;
        }


        .custom-drag-handler-3 {
          position: absolute;
          top: 2px;
          left: 50%;
          transform: translateX(-50%);
        }

        .clabs__resizer--horizontal::before {
          content: "";
          height: calc(100% + 1rem);
          top: -0.5rem;
          width: 100%;
          position: absolute;
        }

        .line-1::before,
        .line-1::after {
          content: '';
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 0.5rem;
          height: 2px;
          background-color: transparent;
          transition: all 0.2s ease-out;
        }

        .line-1::before {
          top: 0;
        }

        .line-1::after {
          bottom: 0;
        }

        .line-2::before,
        .line-2::after {
          content: '';
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 1.5rem;
          height: 2px;
          background-color: transparent;
          transition: all 0.2s ease-out 0.1s;
        }

        .line-2::before {
          top: 0;
        }

        .line-2::after {
          bottom: 0;
        }

        /* Hover effects - trigger the animation */
        .custom-resizer-3:hover .line-1::before {
          top: -10px;
          background-color: var(--cds-border-interactive);
        }

        .custom-resizer-3:hover .line-1::after {
          bottom: -10px;
          background-color: var(--cds-border-interactive);
        }

        .custom-resizer-3:hover .line-2::before {
          top: -6px;
          background-color: var(--cds-border-interactive);
        }

        .custom-resizer-3:hover .line-2::after {
          bottom: -6px;
          background-color: var(--cds-border-interactive);
        }

        /* Hover effects - trigger the animation */
        .custom-resizer-4 .line-1::before {
          top: -8px;
          background-color: var(--cds-border-subtle);
        }

        .custom-resizer-4 .line-1::after {
          bottom: -8px;
          background-color: var(--cds-border-subtle);
        }

        .custom-resizer-4 .line-2::before {
          top: -4px;
          background-color: var(--cds-border-subtle);
        }

        .custom-resizer-4 .line-2::after {
          bottom: -4px;
          background-color: var(--cds-border-subtle);
        }
    `}</style>
      <div className="single-panel-bounded">
        <div className="single-panel-bounded__container">
          <div className="single-panel-bounded__panel" ref={panelRef}>
            <h3 className="single-panel-bounded__panel-title">
              Single Panel (bounded)
            </h3>
            <p>This panel demonstrates custom drag handle</p>
          </div>
          <Resizer orientation="horizontal">
            <DragVertical className="custom-drag-handler-1" />
          </Resizer>
        </div>
      </div>
      <br />
      <div className="single-panel-bounded">
        <div className="single-panel-bounded__container">
          <div className="single-panel-bounded__panel" ref={panelRef}>
            <h3 className="single-panel-bounded__panel-title">
              Single Panel (bounded)
            </h3>
            <p>This panel demonstrates custom drag handle on hover</p>
          </div>
          <Resizer orientation="horizontal" className="custom-resizer-2">
            <DragVertical className="custom-drag-handler-2" />
          </Resizer>
        </div>
      </div>
      <br />
      <div className="single-panel-bounded">
        <div className="single-panel-bounded__container">
          <div className="single-panel-bounded__panel" ref={panelRef}>
            <h3 className="single-panel-bounded__panel-title">
              Single Panel (bounded)
            </h3>
            <p>This panel demonstrates custom drag handle</p>
          </div>
          <Resizer orientation="horizontal" className="custom-resizer-3">
            <div className="custom-drag-handler-3">
              <div className="line-1"></div>
              <div className="line-2"></div>
            </div>
          </Resizer>
        </div>
      </div>
      <br />
      <div className="single-panel-bounded">
        <div className="single-panel-bounded__container">
          <div className="single-panel-bounded__panel" ref={panelRef}>
            <h3 className="single-panel-bounded__panel-title">
              Single Panel (bounded)
            </h3>
            <p>This panel demonstrates custom drag handle</p>
          </div>
          <Resizer orientation="horizontal" className="custom-resizer-4">
            <div className="custom-drag-handler-4">
              <div className="line-1"></div>
              <div className="line-2"></div>
            </div>
          </Resizer>
        </div>
      </div>
    </>
  );
};
