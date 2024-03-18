/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { settings } from '@carbon/ai-utilities/es/settings/index.js';
import * as VegaEmbed from 'vega-embed';
const { stablePrefix: c4aiPrefix } = settings;

// @ts-ignore
import styles from './chartElement.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class chartElement extends LitElement {
  static styles = styles;
  /**
   * resizeObserver - resize watcher of parent
   **/
  private resizeObserver;

  /**
   * Array of subelements parsed from API reply
   */
  @property({ type: String, attribute: 'content', reflect: true })
  content;

  /**
   * invalid - if spec fails to render or is missing, an error will be displayed
   */
  @state()
  _invalid = false;

  /**
   * errorMessage - specifies error when debugging
   */
  @state()
  _errorMessage = 'ERROR: Failed to render Chart component';

  /**
   * uniqueID - unique ID egenrated in this component to target correct div when rendering
   */
  @state()
  _uniqueID;

  /**
   * _renderedSVG - SVG string produced from visulization engine
   */
  @state()
  _renderedSVG = '';

  /**
   * visualizationSpec -  parsed object from content string
   */
  @state()
  _visualizationSpec: VegaEmbed.VisualizationSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: 'Empty Specification',
    data: { "values": [] },
    mark: 'point',
    encoding: {},
  };

  /** detect when component is rendered to process visualization specification object
   */
  firstUpdated() {
    this.resizeObserver = new ResizeObserver(async () => {
      this._renderedSVG = await this._displayVisualization();
      this.requestUpdate();
    });
    this.resizeObserver.observe(this.parentElement);

    if (this.content !== null) {
      this.generateUniqueId();
      try {
        this._visualizationSpec = this._prepareVisualization();
        this.requestUpdate();
      } catch (error) {
        this._invalid = true;
        this._errorMessage =
          'ERROR: Failed to parse Visualization Specification';
        this.requestUpdate();
      }
      this.requestUpdate();
    } else {
      this._invalid = true;
      this._errorMessage = "ERROR: No Schema provided in 'content' attribute";
      this.requestUpdate();
    }
  }

  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  async updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('_visualizationSpec')) {
      if (this._visualizationSpec?.data?.["values"]?.length > 0) {
        this._renderedSVG = await this._displayVisualization();
        this.requestUpdate();
      }
    }
  }

  /** generateUniqueId - create random string to give the target visualization div
   */
  generateUniqueId() {
    const randomString: string = Math.random().toString(36).substr(2, 9);
    this._uniqueID = randomString;
  }

  /**
   * _displayVisualization - get unique tag and generate vega lite
   */
  async _displayVisualization() {
    const targetID = '#' + c4aiPrefix + '--chat-embed-vis-' + this._uniqueID;
    const targetDiv = this.shadowRoot?.querySelector<HTMLElement>(targetID);
    if (!targetDiv) {
      return '';
    } else {
      try {
        await VegaEmbed.default(targetDiv, this._visualizationSpec, {actions:false, renderer: 'svg'});
      } catch (error) {
        console.log('Error:', error);
      }
    }
    return '';
  }

  /**
   * prepareVisualization - Prepare and adapt Vega visualization spec to be more Carbon adjacent
   */
  _prepareVisualization() {
    let spec: any = {};
    try {
      spec = JSON.parse(this.content);
    } catch (e) {
      this._errorMessage = 'ERROR: JSON failed to parse specification';
      this._invalid = true;
      this.requestUpdate();
    }

    spec.width = 'container';
    spec.height = 'container';

    spec.padding = 20;

    const darkOrdinalColors = [
      '#893ffc',
      '#02bdba',
      '#b9e5ff',
      '#4589ff',
      '#fe7eb7',
    ];

     const darkQuantitativeColors = [
      '#ffffff',
      '#decaff',
      '#a36aff',
      '#5a23a7',
      '#1b1b1b'
    ];

    const backgroundColor = '#262626';
    const gridColor = '#393939';
    const textColor = '#f4f4f4';

    spec.background = backgroundColor;

    if (spec.encoding && spec.encoding.x) {
      if (!spec.encoding.x.axis) {
        spec.encoding.x.axis = {};
      }
      spec.encoding.x.axis.labelColor = textColor;
      spec.encoding.x.axis.titleColor = textColor;
      spec.encoding.x.axis.labelFont = 'IBM Plex Sans';
      spec.encoding.x.axis.labelFontSize = 12;
      spec.encoding.x.axis.tickColor = backgroundColor;
      spec.encoding.x.axis.tickSize = 5;
    }

    if (spec.encoding && spec.encoding.y) {
      if (!spec.encoding.y.axis) {
        spec.encoding.y.axis = {};
      }
      spec.encoding.y.axis.labelColor = textColor;
      spec.encoding.y.axis.titleColor = textColor;
      spec.encoding.y.axis.labelFont = 'IBM Plex Sans';
      spec.encoding.y.axis.labelFontSize = 12;
      spec.encoding.y.axis.tickColor = backgroundColor;
      spec.encoding.y.axis.tickSize = 5;
    }

    if(!spec.encoding){
      spec.encoding = {}
    }

    let colorScale = [];

    let chartType = '';
    console.log(spec.mark)
    if(typeof spec.mark === 'string') {
      chartType = spec.mark;
      spec.mark = {"type":chartType};
    } else if(typeof spec.mark === 'object' && 'type' in spec.mark) {
      chartType = spec.mark.type;
    }
    console.log(chartType);

    if (spec.mark) {
      if (spec.mark.fill) {
        spec.mark.fill = '#0f62fe';
      }
      if (spec.mark.stroke) {
        spec.mark.stroke = '#0f62fe';
      }
    } else {
      spec.mark = { fill: '#0f62fe', stroke: '#0f62fe' };
    }

    if (spec.title) {
      if (typeof spec.title === 'string') {
        spec.title = { text: spec.title };
      }
      spec.title.color = textColor;
      spec.title.anchor = 'start';
      spec.title.fontWeight = 'bold';
      spec.title.offset = 14;
      spec.title.encode = {
        update:{
          x:{"value":15},
          fontSize: {"value": 14},
          fontWeight: {"value":"bold"}
        }
      }
    }

    spec['config'] = {
      axis: {
        domainColor: gridColor,
        grid: true,
        gridColor: gridColor,
        titleFont: 'IBM Plex Sans',
        labelFont: 'IBM Plex Sans',
        titleFontSize: 10,
        topColor: gridColor,
        rightColor: gridColor,
        bottomColor: textColor,
        leftColor: gridColor,
      },
      view:{
        stroke: gridColor
      },
      bar:{
        discreteBandSize:10,
      },
      title:{
        font: 'IBM Plex Sans',
      },
      legend: {
        title: null,
        symbolType:"square",
        orient:"bottom",
        titleColor: textColor,
        labelColor: textColor,
        titleFont: 'IBM Plex Sans',
        labelFont: 'IBM Plex Sans',
        titleFontSize: 10,
      },
      text:{
        font: 'IBM Plex Sans',
      },
      tooltip: {
        background: textColor,
        color: '#FFFFFF',
        cornerRadius: 3,
        font: 'IBM Plex Sans',
        fontSize: 12,
        offset: [10, 10],
        zindex: 99,
      },
    };

    let isOrdinal:boolean;
    switch(chartType){
      case 'bar':
        isOrdinal = true;
        break;
      case 'circle':
        isOrdinal = false;
        break;
      case 'square':
        isOrdinal = false;
        break;
      case 'tick':
        isOrdinal = false;
        break;
      case 'line':
        isOrdinal = false;
        break;
      case 'area':
        isOrdinal = false;
        break;
      case 'point':
        isOrdinal = false;
        break;
      case 'rule':
        isOrdinal = false;
        break;
      case 'geoshape':
        isOrdinal = true;
        spec['config']['axis']['grid'] = false;
        break;
      case 'image':
        isOrdinal = false;
        break;
      case 'trail':
        isOrdinal = false;
        break;
      case 'rect':
        isOrdinal = true;
        spec['config']['axis']['grid'] = false;
        break;
      case 'arc':
        isOrdinal = false;
        break;
      default:
        isOrdinal = false;
        break;
    }

    if(isOrdinal){
      colorScale = darkQuantitativeColors;
    }else{
      colorScale = darkOrdinalColors;
    }

    if (spec.encoding.color) {
      if (spec.encoding.color.field) {
        spec.encoding.color.scale = { range: colorScale };
      } else if (spec.encoding.color.value) {
        spec.encoding.color.value = '#0f62fe';
      }
    } else {
      spec.encoding.color = {
        scale: { range: colorScale },
        value: '#0f62fe',
      };
    }
    return spec;
  }
}
