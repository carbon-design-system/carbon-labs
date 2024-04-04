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
   * CSS string for container height
   */
  @property({ type: String, attribute: 'container-height', reflect: true })
  containerHeight = '300px';

  /**
   * CSS string for container width
   */
  @property({ type: String, attribute: 'container-width', reflect: true })
  containerWidth = '100%';

  /**
   * Enable post-hoc carbon charts styling
   */
  @property({ type: Boolean, attribute: 'carbonify', reflect: true })
  carbonify = true;

  /**
   * Enable vega inspector to be shown
   */
  @property({ type: Boolean, attribute: 'enable-inspector', reflect: true })
  enableInspector = false;

  /**
   * invalid - if spec fails to render or is missing, an error will be displayed
   */
  @state()
  _invalid = false;

  /**
   * enableTooltip - show tooltip in charts by default
   */
  @state()
  enableTooltip = true;

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
    data: { values: [] },
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

  /**
   * Render visualization again when resizing or parameters updates
   */
  async reRenderVisualization(updateSpecification) {
    if (updateSpecification) {
      this._visualizationSpec = this._prepareVisualization();
    }
    this._renderedSVG = await this._displayVisualization();
    this.requestUpdate();
  }

  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  async updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('content')) {
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
    }
    if (changedProperties.has('_visualizationSpec')) {
      if (this._visualizationSpec?.data?.['values']?.length > 0) {
        this._renderedSVG = await this._displayVisualization();
        this.requestUpdate();
      }
    }
    if (changedProperties.has('containerWidth')) {
      this.style.setProperty('--chat-chart-element-width', this.containerWidth);
    }

    if (changedProperties.has('containerHeight')) {
      this.style.setProperty(
        '--chat-chart-element-height',
        this.containerHeight
      );
    }

    if (changedProperties.has('carbonify')) {
      this._visualizationSpec = this._prepareVisualization();
    }

    if (changedProperties.has('enableInspector')) {
      this._visualizationSpec = this._prepareVisualization();
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
        await VegaEmbed.default(targetDiv, this._visualizationSpec, {
          actions: this.enableInspector || false,
          hover: this.enableTooltip,
          renderer: 'svg',
        });
      } catch (error) {
        this._errorMessage = 'ERROR: VegaEmbed failed to render';
        this._invalid = true;
        this.requestUpdate();
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
      return '';
    }

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
      '#1b1b1b',
    ];

    const backgroundColor = '#262626';
    const gridColor = '#393939';
    const textColor = '#f4f4f4';
    const labelColor = '#c6c6c6';
    const axisColor = '#6f6f6f';
    const titleFont = 'IBM Plex Sans, sans-serif';
    const defaultFont = 'IBM Plex Sans Condensed, Arial, sans-serif';
    const gradientColorBottom = '#78A9FF';
    const gradientColorTop = '#EE5396';

    const defaultColor = '#0f62fe'; //darkOrdinalColors[0];

    console.log('chartElement: pre-styled spec:');
    console.log(spec);

    spec.width = 'container';
    spec.height = 'container';

    if (spec.data?.values) {
      delete spec['data']['url'];
      delete spec['data']['format'];
      delete spec['data']['file'];
    } else {
      if (!spec.data?.url) {
        this._errorMessage =
          'ERROR: Schema is missing "values" and/or "url" in the "data" field';
        this._invalid = true;
        this.requestUpdate();
      }
    }

    spec.padding = 20;

    if (this.carbonify) {
      spec.background = backgroundColor;

      let colorScale: any[] = [];

      let chartType = '';
      if (typeof spec.mark === 'string') {
        chartType = spec.mark;
        spec.mark = { type: chartType };
      } else if (typeof spec.mark === 'object' && 'type' in spec.mark) {
        chartType = spec.mark.type;
      }
      console.log('Chart type: ' + chartType);

      if (spec.mark) {
        if (spec.mark.fill) {
          spec.mark.fill = defaultColor;
        }
        if (spec.mark.stroke) {
          spec.mark.stroke = defaultColor;
        }
      } else {
        spec.mark = { fill: defaultColor, stroke: defaultColor };
      }

      if (spec.description && !spec.title) {
        spec.title = spec.description;
        delete spec['description'];
      }

      if (spec.title) {
        if (typeof spec.title === 'string') {
          spec.title = { text: spec.title };
        }
      }

      spec['config'] = {
        actions: this.enableInspector || false,
        font: defaultFont,
        axis: {
          domainColor: gridColor,
          grid: true,
          gridColor: gridColor,
          titleFontSize: 13,
          labelFontSize: 11,
          labelColor: labelColor,
          labelFont: defaultFont,
          titleFont: defaultFont,
        },
        axisX: {
          labelAngle: 0,
        },
        axisBottom: {
          domainColor: axisColor,
          labelColor: labelColor,
          titleColor: textColor,
          tickColor: backgroundColor,
          titlePadding: 14,
        },
        axisTop: {
          domainColor: gridColor,
          labelColor: labelColor,
          titleColor: textColor,
          tickColor: backgroundColor,
          titlePadding: 10,
        },
        axisLeft: {
          domainColor: axisColor,
          labelColor: labelColor,
          titleColor: textColor,
          tickColor: backgroundColor,
          titlePadding: 6,
        },
        axisRight: {
          domainColor: gridColor,
          labelColor: labelColor,
          titleColor: textColor,
          tickColor: backgroundColor,
          titlePadding: 10,
        },
        view: {
          stroke: gridColor,
        },
        arc: {
          stroke: gridColor,
          strokeWidth: 1.5,
        },
        bar: {
          discreteBandSize: 16,
        },
        point: {
          fillOpacity: 0.3,
          strokeWidth: 1,
          strokeOpacity: 1,
        },
        circle: {
          fillOpacity: 0.3,
          strokeWidth: 1,
          strokeOpacity: 1,
        },
        title: {
          font: titleFont,
          color: textColor,
          anchor: 'start',
          fontWeight: 500,
          fontSize: 16,
          offset: 24,
          x: 6,
          encode: {
            update: {
              x: { value: 18 },
              fontSize: { value: 16 },
              fontWeight: { value: 'bold' },
            },
          },
        },
        legend: {
          title: null,
          symbolType: 'square',
          orient: 'bottom',
          titleColor: textColor,
          labelColor: labelColor,
          titleFont: defaultFont,
          labelFont: defaultFont,
          //labelOffset: 20,
          titleFontSize: 11,
          fontWeight: 'bold',
          offset: 20,
          gradientLength: 300,
          gradientThickness: 8,
        },
      };

      if (this.enableTooltip) {
        spec['config']['tooltip'] = {
          enabled: true,
          background: backgroundColor,
          color: textColor,
          cornerRadius: 3,
          fontSize: 10,
          betweenFieldBorder: '1px solid ' + gridColor,
        };
      }

      let isOrdinal: boolean;
      switch (chartType) {
        case 'bar':
          isOrdinal = true;
          break;
        case 'point':
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
        case 'boxplot':
          isOrdinal = false;
          spec.config['boxplot'] = {
            box: {
              fill: defaultColor,
              fillOpacity: 0.3,
              stroke: defaultColor,
              strokeOpacity: 1,
            },
            median: {
              stroke: defaultColor,
              strokeWidth: 2,
            },
            outliers: {
              fill: 'white',
              fillOpacity: 1,
              stroke: 'yellow',
              strokeOpacity: 1,
            },
            rule: { stroke: defaultColor, strokeOpacity: 1, strokeWidth: 1 },
            ticks: { stroke: defaultColor, strokeOpacity: 1, strokeWidth: 1 },
          };
          break;
        case 'area':
          isOrdinal = false;
          break;
        case 'rule':
          isOrdinal = false;
          break;
        case 'geoshape':
          isOrdinal = true;
          spec['config']['axis']['grid'] = false;
          spec.config.range = spec.config.range || {};
          spec.config.range.sequential = spec.config.range.sequential || {};
          spec.config.range.sequential.scheme = [
            gradientColorBottom,
            gradientColorTop,
          ];
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
          spec['config']['rect'] = { stroke: backgroundColor };
          /*spec.config.range = spec.config.range || {};
          spec.config.range.sequential = spec.config.range.sequential || {};
          spec.config.range.sequential.scheme = [
            gradientColorBottom,
            gradientColorTop,
          ];*/
          break;
        case 'arc':
          isOrdinal = false;
          break;
        default:
          isOrdinal = false;
          break;
      }

      if (isOrdinal) {
        colorScale = darkQuantitativeColors;
      } else {
        colorScale = darkOrdinalColors;
      }

      if (spec.encoding.color) {
        if (spec.encoding.color.field) {
          spec.encoding.color.scale = { range: colorScale };
        } else if (spec.encoding.color.value) {
          spec.encoding.color.value = defaultColor;
        }
      } else {
        spec.encoding.color = {
          scale: { range: colorScale },
          value: defaultColor,
        };
      }
    }

    console.log('chartElement: post-styled spec:');
    console.log(spec);

    return spec;
  }
}
