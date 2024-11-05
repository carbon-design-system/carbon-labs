var __decorate = this && this.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
import ForceGraph2D from 'force-graph';
/**
 * Graph component to render graph based on nodes and links
 */
export class NetworkGraph extends LitElement {
  constructor() {
    super(...arguments);
    /**
     * Property name from the graph data which user wants to display as node label
     */
    this.nodeLabel = 'id';
    /**
     * Property name from the graph data which user wants to display as node tooltip label
     */
    this.nodeTooltipLabel = 'id';
    /**
     * Minimum zoom which can be done on graph
     */
    this.minimumZoom = 1;
    /**
     * Maximum zoom which can be done on graph
     */
    this.maximumZoom = 1000;
    /**
     * Background color for the canvas
     */
    this.canvasBgColor = 'transparent';
    /**
     * Link color for the graph link
     */
    this.linkColor = '#fff';
    /**
     * Left border color for the nodes (by default set to yellow)
     */
    this.borderAccent = '#F1C21B';
    /**
     * Link Width
     */
    this.linkWidth = 1;
    /**
     * Color of label text inside the node
     */
    this.nodeTextColor = '#fff';
    /**
     * Color of the nodes
     */
    this.nodeColor = '#262626';
    /**
     * Textsize of label text inside the node
     */
    this.textSize = 12;
    /**
     * Boolean to enable or disable dragging of nodes
     */
    this.isNodeDraggable = true;
    /**
     * Boolean to enable or disable Pan Interaction on canvas
     */
    this.isPanInteraction = true;
    /**
     * Boolean to enable or disable zoom-in or zoom-out on canvas
     */
    this.isZoomInteraction = true;
    /**
     * Boolean to enable or disable pointer interaction on canvas
     */
    this.isPointerInteraction = true;
    /**
     * Link Particle Width
     */
    this.particleWidth = 4;
    /**
     * Number of particles on link
     */
    this.numberOfParticles = 0;
    /**
     * particle color
     */
    this.particleColor = '#F1C21B';
    /**
     * Object to take graph data
     */
    this.data = null;
    /**
     * Object to take tooltip styling
     */
    this.tooltipStyles = null;
    /**
     * Boolean for enabling zoomToFit for canvas
     */
    this.zoomToFit = true;
  }
  /**
   * Lifecycles Method used to render nodes and links for the graph network on canvas
   */
  firstUpdated() {
    var _a, _b, _c, _d;
    const graphContainer = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.getElementById('graph-container');
    const parentHeight = (_b = graphContainer === null || graphContainer === void 0 ? void 0 : graphContainer.offsetParent) === null || _b === void 0 ? void 0 : _b.clientHeight;
    const parentWidth = (_c = graphContainer === null || graphContainer === void 0 ? void 0 : graphContainer.offsetParent) === null || _c === void 0 ? void 0 : _c.clientHeight;
    const canvasHeight = this.canvasHeight ? this.canvasHeight : parentHeight ? parentHeight : null;
    const canvasWidth = this.canvasWidth ? this.canvasWidth : parentWidth ? parentWidth : null;
    if (this.data && ((_d = this.shadowRoot) === null || _d === void 0 ? void 0 : _d.getElementById('graph-container'))) {
      const graph = ForceGraph2D();
      if (canvasWidth) {
        graph.width(canvasWidth);
      }
      if (canvasHeight) {
        graph.height(canvasHeight);
      }
      graph(this.shadowRoot.getElementById('graph-container')).nodeId(this.nodeLabel).nodeLabel(this.nodeTooltipLabel).graphData(this.data).minZoom(this.minimumZoom).maxZoom(this.maximumZoom).backgroundColor(this.canvasBgColor).enableNodeDrag(this.isNodeDraggable).enablePanInteraction(this.isPanInteraction).cooldownTicks(100).enableZoomInteraction(this.isZoomInteraction).enablePointerInteraction(this.isPointerInteraction).onNodeClick(node => {
        const event = new CustomEvent('on-node-click', {
          detail: node
        });
        this.dispatchEvent(event);
      }).onNodeRightClick(node => {
        const event = new CustomEvent('on-node-right-click', {
          detail: node
        });
        this.dispatchEvent(event);
      }).onNodeDrag(this.nodeDrag).onNodeHover((node, prevNode) => {
        var _a;
        const tooltip = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('.graph-tooltip');
        if (tooltip) {
          tooltip.style.position = 'absolute';
          tooltip.style.backgroundColor = '#fff';
          tooltip.style.padding = '8px';
          tooltip.style.color = '#000';
          if (this.tooltipStyles) {
            for (const [key, value] of Object.entries(this.tooltipStyles)) {
              tooltip.style[key] = value;
            }
          }
        }
        const event = new CustomEvent('on-node-hover', {
          detail: {
            node,
            prevNode
          }
        });
        this.dispatchEvent(event);
      }).linkCanvasObject((actualLink, ctx, globalScale) => {
        const link = actualLink;
        ctx.strokeStyle = this.linkColor;
        ctx.lineWidth = this.linkWidth / globalScale;
        if (link.source && link.target) {
          ctx.beginPath();
          ctx.moveTo(link.source.x, link.source.y);
          ctx.lineTo(link.target.x, link.target.y);
          ctx.stroke();
        }
      }).nodeColor('red').nodeCanvasObject((actualNode, ctx, globalScale) => {
        const node = actualNode;
        const label = node[this.nodeLabel];
        const fontSize = this.textSize / globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.8); // some padding
        const widthWithPadding = bckgDimensions[0];
        const heightWithPadding = bckgDimensions[1];
        //   Node Background
        ctx.fillStyle = node.bgColor || this.nodeColor;
        ctx.fillRect(node.x - widthWithPadding / 2, node.y - heightWithPadding / 2, widthWithPadding, heightWithPadding);
        //   Node Border
        ctx.strokeStyle = '#525252';
        ctx.lineWidth = 2 / globalScale;
        ctx.strokeRect(node.x - widthWithPadding / 2, node.y - heightWithPadding / 2, widthWithPadding, heightWithPadding);
        //   Node Left Border
        ctx.fillStyle = node.borderAccent || this.borderAccent;
        ctx.lineWidth = 4 / globalScale;
        ctx.fillRect(node.x - widthWithPadding / 2, node.y - heightWithPadding / 2, 2 / globalScale, heightWithPadding);
        //   Node Text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = node.color || this.nodeTextColor;
        ctx.fillText(label, node.x, node.y);
        node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
      }).nodePointerAreaPaint((actualNode, color, ctx) => {
        const node = actualNode;
        ctx.fillStyle = color;
        const bckgDimensions = node.__bckgDimensions;
        bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);
      });
      if (this.numberOfParticles) {
        graph.linkDirectionalParticles(this.numberOfParticles);
        if (this.particleWidth) {
          graph.linkDirectionalParticleWidth(this.particleWidth);
        }
        if (this.particleColor) {
          if (typeof this.particleColor === 'string') {
            graph.linkDirectionalParticleColor(() => this.particleColor);
          } else if (typeof this.particleColor === 'function') {
            graph.linkDirectionalParticleColor(this.particleColor);
          }
        }
      }
      if (this.zoomToFit) {
        graph.onEngineStop(() => graph.zoomToFit(400, 20));
      }
    }
  }
}
__decorate([property({
  attribute: 'node-label',
  type: String
})], NetworkGraph.prototype, "nodeLabel", void 0);
__decorate([property({
  attribute: 'node-tooltip-label',
  type: String
})], NetworkGraph.prototype, "nodeTooltipLabel", void 0);
__decorate([property({
  attribute: 'width',
  type: Number
})], NetworkGraph.prototype, "canvasWidth", void 0);
__decorate([property({
  attribute: 'height',
  type: Number
})], NetworkGraph.prototype, "canvasHeight", void 0);
__decorate([property({
  attribute: 'min-zoom',
  type: Number
})], NetworkGraph.prototype, "minimumZoom", void 0);
__decorate([property({
  attribute: 'max-zoom',
  type: Number
})], NetworkGraph.prototype, "maximumZoom", void 0);
__decorate([property({
  attribute: 'background',
  type: String
})], NetworkGraph.prototype, "canvasBgColor", void 0);
__decorate([property({
  attribute: 'link-color',
  type: String
})], NetworkGraph.prototype, "linkColor", void 0);
__decorate([property({
  attribute: 'node-border-accent-color',
  type: String
})], NetworkGraph.prototype, "borderAccent", void 0);
__decorate([property({
  attribute: 'link-width',
  type: Number
})], NetworkGraph.prototype, "linkWidth", void 0);
__decorate([property({
  attribute: 'node-text-color',
  type: String
})], NetworkGraph.prototype, "nodeTextColor", void 0);
__decorate([property({
  attribute: 'node-bg-color',
  type: String
})], NetworkGraph.prototype, "nodeColor", void 0);
__decorate([property({
  attribute: 'text-size',
  type: Number
})], NetworkGraph.prototype, "textSize", void 0);
__decorate([property({
  attribute: 'nodeDrag',
  type: Function
})], NetworkGraph.prototype, "nodeDrag", void 0);
__decorate([property({
  type: Boolean
})], NetworkGraph.prototype, "isNodeDraggable", void 0);
__decorate([property({
  type: Boolean
})], NetworkGraph.prototype, "isPanInteraction", void 0);
__decorate([property({
  type: Boolean
})], NetworkGraph.prototype, "isZoomInteraction", void 0);
__decorate([property({
  type: Boolean
})], NetworkGraph.prototype, "isPointerInteraction", void 0);
__decorate([property({
  attribute: 'particle-width',
  type: Number || Function
})], NetworkGraph.prototype, "particleWidth", void 0);
__decorate([property({
  attribute: 'number-of-particle',
  type: Number || Function
})], NetworkGraph.prototype, "numberOfParticles", void 0);
__decorate([property({
  attribute: 'particle-color',
  type: String || Function
})], NetworkGraph.prototype, "particleColor", void 0);
__decorate([property({
  attribute: 'data'
})], NetworkGraph.prototype, "data", void 0);
__decorate([property({
  attribute: 'tooltipStyles'
})], NetworkGraph.prototype, "tooltipStyles", void 0);
__decorate([property({
  type: Boolean
})], NetworkGraph.prototype, "zoomToFit", void 0);
//# sourceMappingURL=network-graph.js.map
