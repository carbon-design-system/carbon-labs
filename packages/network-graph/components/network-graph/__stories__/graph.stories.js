/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../network-graph';
import { html } from 'lit';
import { MiserableData } from '../sampleData';
/**
 * More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
 */
export default {
  title: 'Components/Network graph/Network graph',
  tags: ['autodocs'],
};

/**
 * More on writing stories with args: https://storybook.js.org/docs/web-components/writing-stories/args
 *
 * @type {{args: {label: string}, render: (function(*): TemplateResult<1>)}}
 */
export const Default = {
  args: {
    label: 'Graph',
    width: 1000,
    height: 1000,
    background: '#161616',
    'link-color': '#262626',
    'link-width': 4,
    'node-text-color': '#f4f4f4',
    'border-accent-color': '#F1C21B',
    'text-size': 14,
    'node-bg-color': '#262626',
    'min-zoom': 1,
    'max-zoom': 1000,
    isNodeDraggable: true,
    isPanInteraction: true,
    isZoomInteraction: true,
    isPointerInteraction: true,
    graphData: MiserableData,
  },

  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: (args) =>
    html` <clabs-network-graph
      label="Graph"
      background=${args.background}
      .data=${args.graphData}
      .min-zoom=${args['min-zoom']}
      .max-zoom=${args['max-zoom']}
      link-color=${args['link-color']}
      link-width=${args['link-width']}
      node-text-color=${args['node-text-color']}
      text-size=${args['text-size']}
      node-bg-color=${args['node-bg-color']}
      border-accent-color=${args['border-accent-color']}
      width=${args.width}
      height=${args.height}
      .isNodeDraggable=${args.isNodeDraggable}
      .isPanInteraction=${args.isPanInteraction}
      .isZoomInteraction=${args.isZoomInteraction}
      .isPointerInteraction=${args.isPointerInteraction}
      @on-node-click=${(e) => console.log(e)}
      @on-node-right-click=${(e) => console.log(e)}
      @on-node-hover=${(e) => console.log(e)}
      .nodeDrag=${(node) => console.log(node)}>
    </clabs-network-graph>`,
};
