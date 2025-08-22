/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../components/network-graph/network-graph';
import { html } from 'lit';
import { MiserableData } from './sampleData';
/**
 * More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
 */
export default {
  title: 'Generative A.I. Components/Network graph',
  component: 'clabs-network-graph',
};

/**
 * More on writing stories with args: https://storybook.js.org/docs/web-components/writing-stories/args
 *
 * @type {{args: {label: string}, render: (function(*): TemplateResult<1>)}}
 */
export const Default = {
  args: {
    width: 800,
    height: 800,
    background: '#161616',
    'link-color': '#262626',
    'link-width': 4,
    'node-text-color': '#f4f4f4',
    'node-border-accent-color': '#F1C21B',
    'text-size': 14,
    'node-bg-color': '#262626',
    'min-zoom': 1,
    'max-zoom': 1000,
    'particle-width': 4,
    'number-of-particle': 0,
    'particle-color': '#F1C21B',
    isNodeDraggable: true,
    isPanInteraction: true,
    isZoomInteraction: true,
    isPointerInteraction: true,
    data: {
      nodes: MiserableData.nodes.map((item) => ({
        id: item.id,
        group: item.group,
        tooltip: `${item.id} belongs to group ${item.group}`,
      })),
      links: MiserableData.links,
    },
    tooltipStyles: { color: '#262626', padding: '4px' },
  },

  /**
   * Renders the template for Storybook
   * @param {object} args Storybook arguments
   * @returns {TemplateResult<1>}
   */
  render: (args) =>
    html` <clabs-network-graph
      .tooltipStyles=${args.tooltipStyles}
      node-tooltip-label="tooltip"
      node-label="id"
      background=${args.background}
      .data=${args.data}
      min-zoom=${args['min-zoom']}
      max-zoom=${args['max-zoom']}
      link-color=${args['link-color']}
      link-width=${args['link-width']}
      node-text-color=${args['node-text-color']}
      text-size=${args['text-size']}
      node-bg-color=${args['node-bg-color']}
      node-border-accent-color=${args['node-border-accent-color']}
      width=${args.width}
      height=${args.height}
      particle-width=${args['particle-width']}
      number-of-particle=${args['number-of-particle']}
      particle-color=${args['particle-color']}
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
