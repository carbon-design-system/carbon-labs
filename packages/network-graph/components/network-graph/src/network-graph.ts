/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import ForceGraph2D, { GraphData } from 'force-graph';
import { CustomLinks, CustomNode } from '../defs';

/**
 * Graph component to render graph based on nodes and links
 */
export class NetworkGraph extends LitElement {
  @property({ attribute: 'label', type: String })
  label = '';

  @property({ attribute: 'width', type: Number })
  canvasWidth = 1280;

  @property({ attribute: 'height', type: Number })
  canvasHeight = 720;

  @property({ attribute: 'min-zoom', type: Number })
  minimumZoom = 1;

  @property({ attribute: 'max-zoom', type: Number })
  maximumZoom = 1000;

  @property({ attribute: 'background', type: String })
  canvasBgColor = 'transparent';

  @property({ attribute: 'link-color', type: String })
  linkColor = '#fff';

  @property({ attribute: 'border-accent-color', type: String })
  borderAccent = '#F1C21B';

  @property({ attribute: 'link-width', type: Number })
  linkWidth = 1;

  @property({ attribute: 'node-text-color', type: String })
  nodeTextColor = '#fff';

  @property({ attribute: 'node-bg-color', type: String })
  nodeColor = '#262626';

  @property({ attribute: 'text-size', type: Number })
  textSize = 12;

  @property({ attribute: 'nodeDrag', type: Function })
  nodeDrag;

  @property({ attribute: 'isNodeDraggable', type: Boolean })
  isNodeDraggable = true;

  @property({ attribute: 'isPanInteraction', type: Boolean })
  isPanInteraction = true;

  @property({ attribute: 'isZoomInteraction', type: Boolean })
  isZoomInteraction = true;

  @property({ attribute: 'isPointerInteraction', type: Boolean })
  isPointerInteraction = true;

  @property() data = {} as GraphData;

  /**
   * Lifecycles Method used to render nodes and links for the graph network on canvas
   */
  firstUpdated() {
    if (this.data && this.shadowRoot?.getElementById('graph-container')) {
      const graph = ForceGraph2D();
      console.log("Hello")
      graph(this.shadowRoot.getElementById('graph-container') as HTMLElement)
        .nodeLabel('id')
        .graphData(this.data)
        .width(this.canvasWidth)
        .height(this.canvasHeight)
        .minZoom(this.minimumZoom)
        .maxZoom(this.maximumZoom)
        .backgroundColor(this.canvasBgColor)
        .enableNodeDrag(this.isNodeDraggable)
        .enablePanInteraction(this.isPanInteraction)
        .enableZoomInteraction(this.isZoomInteraction)
        .enablePointerInteraction(this.isPointerInteraction)
        .onNodeClick((node) => {
          const event = new CustomEvent('on-node-click', {
            detail: node,
          });

          this.dispatchEvent(event);
        })
        .onNodeRightClick((node) => {
          const event = new CustomEvent('on-node-right-click', {
            detail: node,
          });

          this.dispatchEvent(event);
        })
        .onNodeDrag(this.nodeDrag)
        .onNodeHover((node, prevNode) => {
          const event = new CustomEvent('on-node-hover', {
            detail: { node, prevNode },
          });

          this.dispatchEvent(event);
        })
        .linkCanvasObject((actualLink, ctx, globalScale) => {
          const link = actualLink as CustomLinks;
          ctx.strokeStyle = this.linkColor;
          ctx.lineWidth = this.linkWidth / globalScale;

          if (link.source && link.target) {
            ctx.beginPath();
            ctx.moveTo(link.source.x, link.source.y);
            ctx.lineTo(link.target.x, link.target.y);
            ctx.stroke();
          }
        })
        .nodeColor('red')
        .nodeCanvasObject((actualNode, ctx, globalScale) => {
          const node = actualNode as CustomNode;
          const label = node.id as string;
          const fontSize = this.textSize / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(
            (n) => n + fontSize * 0.8
          ); // some padding

          const widthWithPadding = bckgDimensions[0];
          const heightWithPadding = bckgDimensions[1];

          //   Node Background
          ctx.fillStyle = node.bgColor || this.nodeColor;
          ctx.fillRect(
            node.x - widthWithPadding / 2,
            node.y - heightWithPadding / 2,
            widthWithPadding,
            heightWithPadding
          );

          //   Node Border
          ctx.strokeStyle = '#525252';
          ctx.lineWidth = 2 / globalScale;

          ctx.strokeRect(
            node.x - widthWithPadding / 2,
            node.y - heightWithPadding / 2,
            widthWithPadding,
            heightWithPadding
          );

          //   Node Left Border
          ctx.fillStyle = node.borderAccent || this.borderAccent;
          ctx.lineWidth = 4 / globalScale;
          ctx.fillRect(
            node.x - widthWithPadding / 2,
            node.y - heightWithPadding / 2,
            2 / globalScale,
            heightWithPadding
          );

          //   Node Text
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = node.color || this.nodeTextColor;
          ctx.fillText(label, node.x, node.y);
          //   node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
        });
    }
  }
}
