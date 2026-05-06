/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../index';
import { html } from 'lit';
import DragVertical from '@carbon/icons/es/drag--vertical/16.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';

export default {
  title: 'Components/Resizer',
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    '--resizer-thickness': {
      control: { type: 'range', min: 1, max: 16, step: 1 },
      description: 'Thickness of the resizer handle',
      table: {
        defaultValue: { summary: '4px' },
      },
    },
    '--resizer-grab-thickness': {
      control: { type: 'range', min: 0, max: 32, step: 1 },
      description: 'Additional grab area thickness',
      table: {
        defaultValue: { summary: '8px' },
      },
    },
    '--resizer-grab-color': {
      control: { type: 'boolean' },
      description:
        'Show grab area color (uses --cds-background-selected token)',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
  },
  args: {
    '--resizer-thickness': 4,
    '--resizer-grab-thickness': 8,
    '--resizer-grab-color': false,
  },
};

/**
 * Get common styles for stories
 * @param {object} args - Story arguments
 * @returns {TemplateResult} Style template
 */
const getStyles = (args) => html`
  <style>
    .container {
      width: 600px;
      height: 400px;
      --resizer-thickness: ${args['--resizer-thickness']}px;
      --resizer-grab-thickness: ${args['--resizer-grab-thickness']}px;
      --resizer-grab-color: ${args['--resizer-grab-color']
        ? 'var(--cds-background-selected)'
        : 'transparent'};
    }

    .nested-container {
      width: 800px;
      height: 600px;
      --resizer-thickness: ${args['--resizer-thickness']}px;
      --resizer-grab-thickness: ${args['--resizer-grab-thickness']}px;
      --resizer-grab-color: ${args['--resizer-grab-color']
        ? 'var(--cds-background-selected)'
        : 'transparent'};
    }

    .panel-content {
      padding: var(--cds-spacing-05);
      background: var(--cds-layer);
      height: 100%;
      overflow: auto;
    }
  </style>
`;

/**
 * Single panel no boundaries example
 * @param {object} args - Story arguments
 * @returns {TemplateResult} Story template
 */
export const SinglePanelNoBoundaries = (args) => {
  let initialHeight = 0;

  /**
   * Handle resize start event
   * @param {CustomEvent} e - Resize event
   */
  const handleResizeStart = (e) => {
    const panel = e.target.previousElementSibling;
    if (panel) {
      initialHeight = panel.offsetHeight;
      panel.style.transition = 'none';
    }
  };

  /**
   * Handle resize event
   * @param {CustomEvent} e - Resize event
   */
  const handleResize = (e) => {
    const panel = e.target.previousElementSibling;
    if (panel && e.detail.delta !== undefined) {
      const newHeight = initialHeight + e.detail.delta;
      panel.style.height = `${Math.max(48, newHeight)}px`;
    }
  };

  /**
   * Handle resize reset event (double-click)
   * @param {CustomEvent} e - Resize event
   */
  const handleReset = (e) => {
    const panel = e.target.previousElementSibling;
    if (panel) {
      panel.style.transition = 'height 180ms cubic-bezier(0.25, 0.9, 0.25, 1)';
      panel.style.height = '200px';
    }
  };

  return html`
    ${getStyles(args)}
    <style>
      .single-panel {
        display: flex;
        flex-direction: column;
        width: 600px;
        overflow: hidden;
        --resizer-thickness: ${args['--resizer-thickness']}px;
        --resizer-grab-thickness: ${args['--resizer-grab-thickness']}px;
        --resizer-grab-color: ${args['--resizer-grab-color']
          ? 'var(--cds-background-selected)'
          : 'transparent'};
      }

      .single-panel__panel {
        padding: var(--cds-spacing-05);
        background-color: var(--cds-layer);
        min-block-size: var(--cds-spacing-09);
        overflow: auto;
        height: 200px;
      }
    </style>
    <div class="single-panel">
      <div class="single-panel__panel">
        <h3>Single Panel (no boundaries)</h3>
        <p>
          This is a basic resizable panel that can be adjusted vertically using
          the resize handle below. The handle emits events that you can listen
          to for custom resize logic.
        </p>
      </div>
      <clabs-resizer-handle
        class="no-boundary-example-handle"
        @resize-start=${handleResizeStart}
        @resize-drag=${handleResize}
        @resize-reset=${handleReset}></clabs-resizer-handle>
    </div>
  `;
};

/**
 * Single panel bounded example
 * @param {object} args - Story arguments
 * @returns {TemplateResult} Story template
 */
export const SinglePanelBounded = (args) => {
  let initialHeight = 0;

  /**
   * Handle resize start event
   * @param {CustomEvent} e - Resize event
   */
  const handleResizeStart = (e) => {
    const panel = e.target.previousElementSibling;
    if (panel) {
      initialHeight = panel.offsetHeight;
      panel.style.transition = 'none';
    }
  };

  /**
   * Handle resize event with boundary constraints
   * @param {CustomEvent} e - Resize event
   */
  const handleResize = (e) => {
    const panel = e.target.previousElementSibling;
    const container = e.target.parentElement;
    if (panel && container && e.detail.delta !== undefined) {
      const containerHeight = container.offsetHeight;
      const newHeight = initialHeight + e.detail.delta;
      // Constrain between min height and container height
      const constrainedHeight = Math.max(
        48,
        Math.min(newHeight, containerHeight - 20)
      );
      panel.style.height = `${constrainedHeight}px`;
    }
  };

  /**
   * Handle resize reset event (double-click)
   * @param {CustomEvent} e - Resize event
   */
  const handleReset = (e) => {
    const panel = e.target.previousElementSibling;
    if (panel) {
      panel.style.transition = 'height 180ms cubic-bezier(0.25, 0.9, 0.25, 1)';
      panel.style.height = '200px';
    }
  };

  return html`
    ${getStyles(args)}
    <style>
      .single-panel-bounded {
        width: 600px;
        height: 400px;
        overflow: hidden;
        --resizer-thickness: ${args['--resizer-thickness']}px;
        --resizer-grab-thickness: ${args['--resizer-grab-thickness']}px;
        --resizer-grab-color: ${args['--resizer-grab-color']
          ? 'var(--cds-background-selected)'
          : 'transparent'};
      }

      .single-panel-bounded__container {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .single-panel-bounded__panel {
        padding: var(--cds-spacing-05);
        background-color: var(--cds-layer);
        min-block-size: var(--cds-spacing-09);
        overflow: auto;
        height: 200px;
      }
    </style>
    <div class="single-panel-bounded">
      <div class="single-panel-bounded__container">
        <div class="single-panel-bounded__panel">
          <h3>Single Panel (bounded)</h3>
          <p>
            This panel demonstrates how resizing can be constrained within fixed
            boundaries. The panel is contained within a 600x400 pixel container.
            The resize logic uses events to constrain the height.
          </p>
        </div>
        <clabs-resizer-handle
          @resize-start=${handleResizeStart}
          @resize-drag=${handleResize}
          @resize-reset=${handleReset}></clabs-resizer-handle>
      </div>
    </div>
  `;
};

/**
 * Single panel overlay example
 * @param {object} args - Story arguments
 * @returns {TemplateResult} Story template
 */
export const SinglePanelOverlay = (args) => {
  let initialHeight = 0;

  /**
   * Handle resize start event
   * @param {CustomEvent} e - Resize event
   */
  const handleResizeStart = (e) => {
    const panelContent = e.target.nextElementSibling;
    if (panelContent) {
      initialHeight = panelContent.offsetHeight;
      panelContent.style.transition = 'none';
    }
  };

  /**
   * Handle resize event for overlay panel
   * @param {CustomEvent} e - Resize event
   */
  const handleResize = (e) => {
    const panelContent = e.target.nextElementSibling;
    const container = e.target.closest('.single-panel-overlay');
    if (panelContent && container && e.detail.delta !== undefined) {
      const containerHeight = container.offsetHeight;
      // Invert delta because we're resizing from top
      const newHeight = initialHeight - e.detail.delta;
      // Constrain between min height and container height
      const constrainedHeight = Math.max(
        48,
        Math.min(newHeight, containerHeight - 20)
      );
      panelContent.style.height = `${constrainedHeight}px`;
    }
  };

  /**
   * Handle resize reset event (double-click)
   * @param {CustomEvent} e - Resize event
   */
  const handleReset = (e) => {
    const panelContent = e.target.nextElementSibling;
    if (panelContent) {
      panelContent.style.transition =
        'height 180ms cubic-bezier(0.25, 0.9, 0.25, 1)';
      panelContent.style.height = '200px';
    }
  };

  return html`
    ${getStyles(args)}
    <style>
      .single-panel-overlay {
        position: relative;
        width: 600px;
        height: 400px;
        overflow: hidden;
        --resizer-thickness: ${args['--resizer-thickness']}px;
        --resizer-grab-thickness: ${args['--resizer-grab-thickness']}px;
        --resizer-grab-color: ${args['--resizer-grab-color']
          ? 'var(--cds-background-selected)'
          : 'transparent'};
      }

      .single-panel-overlay__content {
        padding: var(--cds-spacing-05);
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
        padding: var(--cds-spacing-05);
        overflow: auto;
        height: 200px;
        min-block-size: var(--cds-spacing-09);
      }
    </style>
    <div class="single-panel-overlay">
      <div class="single-panel-overlay__content">
        <h3>Main Content</h3>
        <p>
          This is the main content area that remains fixed in the background.
        </p>
      </div>
      <div class="single-panel-overlay__panel">
        <clabs-resizer-handle
          @resize-start=${handleResizeStart}
          @resize-drag=${handleResize}
          @resize-reset=${handleReset}></clabs-resizer-handle>
        <div class="single-panel-overlay__panel-content">
          <h3>Overlay Panel</h3>
          <p>
            This sliding panel overlays the main content and can be resized from
            the top edge using event-driven resize logic.
          </p>
        </div>
      </div>
    </div>
  `;
};

/**
 * Two panels horizontal example
 * @param {object} args - Story arguments
 * @returns {TemplateResult} Story template
 */
export const TwoPanelsHorizontal = (args) => html`
  ${getStyles(args)}
  <div class="container">
    <clabs-resizer-grid axis="y">
      <clabs-resizer-panel slot="top">
        <div class="panel-content">
          <h3>Top Panel</h3>
          <p>Drag the handle below to resize. Double-click to reset.</p>
        </div>
      </clabs-resizer-panel>

      <clabs-resizer-handle slot="handle-vertical"></clabs-resizer-handle>

      <clabs-resizer-panel slot="bottom">
        <div class="panel-content">
          <h3>Bottom Panel</h3>
          <p>This panel adjusts automatically.</p>
        </div>
      </clabs-resizer-panel>
    </clabs-resizer-grid>
  </div>
`;

/**
 * Two panels vertical example
 * @param {object} args - Story arguments
 * @returns {TemplateResult} Story template
 */
export const TwoPanelsVertical = (args) => html`
  ${getStyles(args)}
  <div class="container">
    <clabs-resizer-grid axis="x">
      <clabs-resizer-panel slot="left">
        <div class="panel-content">
          <h3>Left Panel</h3>
          <p>Drag the handle to the right to resize. Double-click to reset.</p>
        </div>
      </clabs-resizer-panel>

      <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>

      <clabs-resizer-panel slot="right">
        <div class="panel-content">
          <h3>Right Panel</h3>
          <p>This panel adjusts automatically.</p>
        </div>
      </clabs-resizer-panel>
    </clabs-resizer-grid>
  </div>
`;

/**
 * Nested example
 * @param {object} args - Story arguments
 * @returns {TemplateResult} Story template
 */
export const Nested = (args) => html`
  ${getStyles(args)}
  <div class="nested-container">
    <clabs-resizer-grid axis="x">
      <clabs-resizer-panel slot="left">
        <div class="panel-content">
          <h3>Left Panel</h3>
          <p>This is a fixed left panel.</p>
        </div>
      </clabs-resizer-panel>

      <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>

      <clabs-resizer-panel slot="right">
        <clabs-resizer-grid axis="y">
          <clabs-resizer-panel slot="top">
            <div class="panel-content">
              <h3>Top Right Panel</h3>
              <p>Nested vertical resizer.</p>
            </div>
          </clabs-resizer-panel>

          <clabs-resizer-handle slot="handle-vertical"></clabs-resizer-handle>

          <clabs-resizer-panel slot="bottom">
            <div class="panel-content">
              <h3>Bottom Right Panel</h3>
              <p>Resize both horizontally and vertically.</p>
            </div>
          </clabs-resizer-panel>
        </clabs-resizer-grid>
      </clabs-resizer-panel>
    </clabs-resizer-grid>
  </div>
`;

/**
 * With pivot handle - demonstrates the pivot handle at the intersection of nested grids
 * @param {object} args - Story arguments
 * @returns {TemplateResult} Story template
 */
export const WithPivotHandle = (args) => {
  const reverse = args.reverse || false;

  // Shared inner grid template
  const innerGrid = html`
    <clabs-resizer-grid axis="y" class="inner-grid">
      <clabs-resizer-panel slot="top">
        <div class="panel-content">
          <h3>${reverse ? 'Top Left' : 'Top Right'} Panel</h3>
          <p>
            ${reverse
              ? 'This is the reverse layout - the nested grid is on the left side. The pivot handle appears at the intersection.'
              : 'Notice the pivot handle at the intersection - it allows you to resize both axes simultaneously.'}
          </p>
        </div>
      </clabs-resizer-panel>

      <clabs-resizer-handle slot="handle-vertical">
        <clabs-resizer-handle-pivot></clabs-resizer-handle-pivot>
      </clabs-resizer-handle>

      <clabs-resizer-panel slot="bottom">
        <div class="panel-content">
          <h3>${reverse ? 'Bottom Left' : 'Bottom Right'} Panel</h3>
          <p>
            The pivot handle
            ${reverse
              ? 'allows simultaneous resizing of both the horizontal and vertical axes'
              : 'appears at the corner where the two resizer handles meet'}.
          </p>
        </div>
      </clabs-resizer-panel>
    </clabs-resizer-grid>
  `;

  const simplePanel = html`
    <div class="panel-content">
      <h3>${reverse ? 'Right' : 'Left'} Panel</h3>
      <p>
        This is the ${reverse ? 'right' : 'left'} panel. Resize using the
        vertical handle.
      </p>
    </div>
  `;

  return html`
    ${getStyles(args)}
    <style>
      .pivot-container {
        width: 800px;
        height: 600px;
        --resizer-thickness: ${args['--resizer-thickness']}px;
        --resizer-grab-thickness: ${args['--resizer-grab-thickness']}px;
        --resizer-grab-color: ${args['--resizer-grab-color']
          ? 'var(--cds-background-selected)'
          : 'transparent'};
      }

      .outer-grid {
        --start-element-size: ${reverse ? '4fr' : '1fr'};
        --end-element-size: ${reverse ? '1fr' : '4fr'};
      }

      .inner-grid {
        --start-element-size: 3fr;
        --end-element-size: 1fr;
      }
    </style>
    <div class="pivot-container">
      <clabs-resizer-grid axis="x" class="outer-grid">
        <clabs-resizer-panel slot="left">
          ${reverse ? innerGrid : simplePanel}
        </clabs-resizer-panel>

        <clabs-resizer-handle slot="handle-horizontal"></clabs-resizer-handle>

        <clabs-resizer-panel slot="right">
          ${reverse ? simplePanel : innerGrid}
        </clabs-resizer-panel>
      </clabs-resizer-grid>
    </div>
  `;
};

WithPivotHandle.argTypes = {
  reverse: {
    control: { type: 'boolean' },
    description: 'Reverse the layout (nested grid on left instead of right)',
    table: {
      defaultValue: { summary: 'false' },
    },
  },
};

WithPivotHandle.args = {
  reverse: false,
};
/**
 * With custom handles example - demonstrates using SVG icons in the icon slot
 * @param {object} args - Story arguments
 * @returns {TemplateResult} Story template
 */
export const WithCustomHandles = (args) => {
  let initialHeight1 = 0;

  /**
   * Handle resize start for panel 1
   * @param {CustomEvent} e - Resize event
   */
  const handleResizeStart1 = (e) => {
    const panel = e.target.previousElementSibling;
    if (panel) {
      initialHeight1 = panel.offsetHeight;
      panel.style.transition = 'none';
    }
  };

  /**
   * Handle resize for panel 1
   * @param {CustomEvent} e - Resize event
   */
  const handleResize1 = (e) => {
    const panel = e.target.previousElementSibling;
    const container = e.target.parentElement;
    if (panel && container && e.detail.delta !== undefined) {
      const containerHeight = container.offsetHeight;
      const newHeight = initialHeight1 + e.detail.delta;
      const constrainedHeight = Math.max(
        48,
        Math.min(newHeight, containerHeight - 20)
      );
      panel.style.height = `${constrainedHeight}px`;
    }
  };

  /**
   * Handle resize reset for panel 1 (double-click)
   * @param {CustomEvent} e - Resize event
   */
  const handleReset1 = (e) => {
    const panel = e.target.previousElementSibling;
    if (panel) {
      panel.style.transition = 'height 180ms cubic-bezier(0.25, 0.9, 0.25, 1)';
      panel.style.height = '150px';
    }
  };

  return html`
    ${getStyles(args)}
    <style>
      .parent-container {
        display: flex;
        flex-wrap: wrap;
        gap: var(--cds-spacing-05);
      }

      .custom-handle-container {
        width: 400px;
        height: 300px;
        overflow: hidden;
        --resizer-thickness: ${args['--resizer-thickness']}px;
        --resizer-grab-thickness: ${args['--resizer-grab-thickness']}px;
        --resizer-grab-color: ${args['--resizer-grab-color']
          ? 'var(--cds-background-selected)'
          : 'transparent'};
      }

      .custom-handle-flex {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .custom-panel {
        padding: var(--cds-spacing-05);
        background-color: var(--cds-layer);
        min-block-size: var(--cds-spacing-09);
        overflow: auto;
        height: 150px;
      }

      .custom-icon {
        position: absolute;
      }

      /************* Handler 5: Arrow Transition on Hover *************/
      .custom-drag-handler-5 {
        width: var(--cds-spacing-04);
        height: var(--resizer-thickness);
        margin: auto;
        background: var(--cds-border-inverse);
        position: relative;
        transition: all 0.3s ease;
      }

      .custom-drag-handler-5::before,
      .custom-drag-handler-5::after {
        content: '';
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        border-left: var(--cds-spacing-02) solid transparent;
        border-right: var(--cds-spacing-02) solid transparent;
        transition: all 150ms ease;
      }

      .custom-drag-handler-5::before {
        bottom: 100%;
      }

      .custom-drag-handler-5::after {
        top: 100%;
      }

      clabs-resizer-handle.custom-resizer-5:hover .custom-drag-handler-5,
      clabs-resizer-handle.custom-resizer-5:focus .custom-drag-handler-5 {
        width: var(--cds-spacing-01);
        background: var(--cds-layer-selected-inverse);
      }

      clabs-resizer-handle.custom-resizer-5:hover
        .custom-drag-handler-5::before,
      clabs-resizer-handle.custom-resizer-5:focus
        .custom-drag-handler-5::before {
        border-bottom: var(--cds-spacing-02) solid
          var(--cds-layer-selected-inverse);
      }

      clabs-resizer-handle.custom-resizer-5:hover .custom-drag-handler-5::after,
      clabs-resizer-handle.custom-resizer-5:focus
        .custom-drag-handler-5::after {
        border-top: var(--cds-spacing-02) solid
          var(--cds-layer-selected-inverse);
      }

      /************* Handler 7: Static Arrow *************/
      .custom-drag-handler-7 {
        width: var(--cds-spacing-01);
        height: var(--resizer-thickness);
        top: 0;
        margin: auto;
        position: relative;
      }

      .custom-drag-handler-7::before,
      .custom-drag-handler-7::after {
        content: '';
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        border-left: var(--cds-spacing-02) solid transparent;
        border-right: var(--cds-spacing-02) solid transparent;
      }

      .custom-drag-handler-7::before {
        bottom: 100%;
        border-bottom: var(--cds-spacing-02) solid
          var(--cds-layer-selected-inverse);
      }

      .custom-drag-handler-7::after {
        top: 100%;
        border-top: var(--cds-spacing-02) solid
          var(--cds-layer-selected-inverse);
      }
    </style>

    <div class="parent-container">
      <!-- Handler 1: Drag icon -->
      <div class="custom-handle-container">
        <div class="custom-handle-flex">
          <div class="custom-panel">
            <h4>Drag Icon</h4>
            <p>Custom handle with a drag icon in the icon slot</p>
          </div>
          <clabs-resizer-handle
            @resize-start=${handleResizeStart1}
            @resize-drag=${handleResize1}
            @resize-reset=${handleReset1}>
            ${iconLoader(DragVertical, {
              slot: 'icon',
              class: 'custom-icon',
            })}
          </clabs-resizer-handle>
        </div>
      </div>

      <!-- Handler 5: Arrow Transition on Hover -->
      <div class="custom-handle-container">
        <div class="custom-handle-flex">
          <div class="custom-panel">
            <h4>Arrow Transition</h4>
            <p>Custom drag handle transitioning into an arrow</p>
          </div>
          <clabs-resizer-handle
            class="custom-resizer-5"
            @resize-start=${handleResizeStart1}
            @resize-drag=${handleResize1}
            @resize-reset=${handleReset1}>
            <div slot="icon" class="custom-drag-handler-5"></div>
          </clabs-resizer-handle>
        </div>
      </div>

      <!-- Handler 7: Static Arrow -->
      <div class="custom-handle-container">
        <div class="custom-handle-flex">
          <div class="custom-panel">
            <h4>Static Arrows</h4>
            <p>Custom drag handle with static arrows</p>
          </div>
          <clabs-resizer-handle
            class="custom-resizer-7"
            @resize-start=${handleResizeStart1}
            @resize-drag=${handleResize1}
            @resize-reset=${handleReset1}>
            <div slot="icon" class="custom-drag-handler-7"></div>
          </clabs-resizer-handle>
        </div>
      </div>
    </div>
  `;
};
