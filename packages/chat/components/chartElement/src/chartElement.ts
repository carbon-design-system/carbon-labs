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
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
import * as VegaEmbed from 'vega-embed';
//import { getTheme, getPalettes } from 'carbon-charts/themes'
const { stablePrefix: clabsPrefix } = settings;

// @ts-ignore
import styles from './chartElement.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class chartElement extends LitElement {
  static styles = styles;
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
  enableInspector;

  /**
   * Array of subelements parsed from API reply
   */
  @property({ type: String, attribute: 'theme', reflect: true })
  theme = 'dark';

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
  _errorMessage;

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
   * loading boolean to show skeleton and info about loading
   */
  @property({ type: Boolean, attribute: 'loading', reflect: true })
  loading;

  /**
   * visualizationSpec -  parsed object from content string
   */
  @state()
  _visualizationSpec;

  /** detect when component is rendered to process visualization specification object
   */
  firstUpdated() {
    if (this.hasAttribute('containerWidth')) {
      this.style.setProperty('--chat-chart-element-width', this.containerWidth);
    }

    if (this.hasAttribute('containerHeight')) {
      this.style.setProperty(
        '--chat-chart-element-height',
        this.containerHeight
      );
    }

    if (!this.loading) {
      if (this.content !== null) {
        this.generateUniqueId();
        try {
          this._visualizationSpec = this._prepareVisualization();
          this.requestUpdate();
        } catch (error) {
          this._invalid = false;
          this._errorMessage =
            'ERROR: Failed to parse Visualization Specification';
          this.requestUpdate();
        }
        this.requestUpdate();
      } else {
        this._errorMessage = "ERROR: No Schema provided in 'content' attribute";
        this.requestUpdate();
      }
    }
  }

  /**
   * Render visualization again when resizing or parameters updates
   * @param {Boolean} updateSpecification - flag to check if specification needs to be reprepared
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
      this._invalid = false;
      if (!this.loading) {
        this.generateUniqueId();
        try {
          this._visualizationSpec = this._prepareVisualization();
          this.requestUpdate();
        } catch (error) {
          //this._invalid = true;
          this._errorMessage =
            'ERROR: Failed to parse Visualization Specification';
          this.requestUpdate();
        }
      }
    }
    if (changedProperties.has('_visualizationSpec')) {
      this._renderedSVG = await this._displayVisualization();
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

    if (changedProperties.has('theme')) {
      this._visualizationSpec = this._prepareVisualization();
    }
  }

  /**
   * generateUniqueId - create random string to give the target visualization div
   */
  generateUniqueId() {
    const randomString: string = Math.random().toString(36).substr(2, 9);
    this._uniqueID = randomString;
  }

  /**
   * _buildLoader -  create html grid with fixed cell count for chart loader
   */
  _buildLoader() {
    const cells = new Array(100).fill(
      '<div class="' + clabsPrefix + '--chat-chart-loading-grid-cell"></div>'
    );
    return cells.join('');
  }

  /**
   * _displayVisualization - get unique tag and generate vega lite
   */
  async _displayVisualization() {
    const targetID = '#' + clabsPrefix + '--chat-embed-vis-' + this._uniqueID;
    const targetDiv = this.shadowRoot?.querySelector<HTMLElement>(targetID);
    if (!targetDiv) {
      return '';
    } else {
      try {
        //this._invalid = false;
        await VegaEmbed.default(targetDiv, this._visualizationSpec, {
          actions: this.enableInspector || false,
          hover: this.enableTooltip,
          tooltip: { theme: 'custom' }, //this._buildToolTip,
          renderer: 'svg',
        }).catch((error) => {
          console.log(error);
        });
      } catch (error) {
        this._errorMessage = 'ERROR: VegaEmbed failed to render';
        //this._invalid = true;
        this.requestUpdate();
      }
    }
    return '';
  }

  /**
   * custom tooltip creation in html
   */
  /*_buildToolTip(handler, event, item, value) {
    console.log(event)
    if(item){
      this._toolTipValue = JSON.stringify(value);
    }
  }*/

  /**
   * _resolveLayerConfigs - search through config and apply 'share' value to force sublayers into adopting core styles
   * @param {Object} config - vegalite styling object to be edited
   * @param {string} layerMode - mode to assign, whether to inherit or share configs from the parent
   **/
  _resolveLayerConfigs(config, layerMode) {
    let resolveValues: any = {};
    resolveValues = this._replaceInObject(config, layerMode);
    return resolveValues;
  }

  /**
   * _replaceInObject - subroutine of resolvelayers, searches through leafs of config JSON and edits values inside
   * @param {Object} object - child to be scanned and edited
   * @param {string} value - from parent to be sent in
   */
  _replaceInObject(object, value) {
    for (const key in object) {
      if (typeof object[key] === 'object' && object[key] !== null) {
        this._replaceInObject(object[key], value);
      } else {
        object[key] = value;
      }
    }
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
      //this._invalid = true;
      this.requestUpdate();
      return '';
    }

    if (!spec['repeat']) {
      spec.width = 'container';
      spec.height = 'container';
      spec.autosize = {
        type: 'fit',
        contains: 'padding',
      };
    } else {
      delete spec['height'];
      delete spec['width'];
      delete spec['autosize'];
    }

    let layeredSpec;
    let repeatedSpec;
    let plainSpec;
    let subChartWidth;
    let subChartHeight;
    if ('layer' in spec) {
      layeredSpec = this._prepareSpecification(spec, false, true);
      for (const [index, subSpec] of spec['layer'].entries()) {
        const tempSubSpec = this._prepareSpecification(subSpec, false, true);
        delete tempSubSpec['background'];
        delete tempSubSpec['padding'];
        layeredSpec['layer'][index] = tempSubSpec;
      }
    } else if (spec['repeat']) {
      const currentContainerWidth = this.clientWidth;
      const currentContainerHeight = this.clientHeight;
      /*
      const chartArea = this.shadowRoot?.querySelector(
        '.clabs--chat-chart-container'
      );
      if (chartArea instanceof HTMLElement) {
        currentContainerHeight=chartArea.style.height;
        currentContainerWidth=chartArea.style.width;
      }
      */

      repeatedSpec = this._prepareSpecification(
        JSON.parse(JSON.stringify(spec)),
        false,
        true
      );
      repeatedSpec['spec'] = this._prepareSpecification(
        JSON.parse(JSON.stringify(repeatedSpec['spec'])),
        true,
        false
      );
      if (currentContainerWidth) {
        let rowCount;
        let columnCount;
        if (Array.isArray(spec['repeat'])) {
          columnCount = spec.columns ? spec.columns : 1;
          rowCount = Math.ceil(spec['repeat'].length / columnCount);
        } else {
          if (spec['repeat']['row']) {
            rowCount = spec['repeat']['row'].length;
          }
          if (spec['repeat']['column']) {
            columnCount = spec['repeat']['column'].length;
          }
        }

        const paddingOffset = { vertical: 0, horizontal: 0 };
        if (spec['padding']) {
          paddingOffset['vertical'] =
            spec['padding']['top'] + spec['padding']['bottom'];
          paddingOffset['horizontal'] =
            spec['padding']['left'] + spec['padding']['right'];

          paddingOffset['vertical'] = paddingOffset['vertical']
            ? paddingOffset['vertical']
            : 36;
          paddingOffset['horizontal'] = paddingOffset['horizontal']
            ? paddingOffset['horizontal']
            : 36;
          paddingOffset['vertical'] = paddingOffset['vertical']
            ? paddingOffset['vertical'] * rowCount
            : 0;
          paddingOffset['horizontal'] = paddingOffset['horizontal']
            ? paddingOffset['horizontal'] * columnCount
            : 0;
        }
        /*if(spec['config']['padding']){
          paddingOffset['vertical'] = spec['padding']['config']['top'] + spec['padding']['config']['bottom']
          paddingOffset['horizontal'] = spec['padding']['config']['left'] + spec['padding']['config']['right']
        }*/
        subChartWidth =
          Math.floor(currentContainerWidth / columnCount) - 36 * columnCount;
        subChartHeight = Math.floor(currentContainerHeight / rowCount);
        /*if (paddingOffset['vertical']) {
          //subChartHeight -= paddingOffset['vertical'];
        }
        if (paddingOffset['horizontal']) {
          //subChartWidth -= paddingOffset['horizontal'];
        }*/
      }

      delete repeatedSpec['spec']['background'];
      delete repeatedSpec['spec']['padding'];

      repeatedSpec['spec'].autosize = {
        type: 'fit',
        contains: 'padding',
      };

      if (subChartWidth) {
        repeatedSpec['spec']['width'] = subChartWidth;
      }
      if (subChartHeight) {
        repeatedSpec['spec']['height'] = subChartHeight;
      }
    } else {
      if (!spec['data']) {
        plainSpec = {};
      } else {
        plainSpec = this._prepareSpecification(spec, true, true);
      }
    }

    let finalSpec;

    if ('layer' in spec) {
      finalSpec = layeredSpec;
    } else if (spec['repeat']) {
      finalSpec = repeatedSpec;
    } else {
      finalSpec = plainSpec;
    }

    /*if(finalSpec.config){
      finalSpec['resolve'] = this._resolveLayerConfigs(JSON.parse(JSON.stringify(finalSpec.config)), "shared");
    }*/

    return finalSpec;
  }

  /**
   * _prepareSpecification - edit Vega specific to change mark values and apply colors or rewrite config attribute
   * @param {object} spec - vega sepcification JSON
   * @param {boolean} editMarks - boolean to change mark values
   * @param {boolean} addConfig - boolean to edit config attribute of spec with Carbon styles
   */
  _prepareSpecification(spec, editMarks, addConfig) {
    let ordinalColors: string[] = [];
    let quantitativeColors: string[] = [];

    const darkOrdinalColors = [
      '#8a3ffc',
      '#33b1ff',
      '#007d79',
      '#ff7eb6',
      '#fa4d56',
      '#fff1f1',
      '#6fdc8c',
      '#4589ff',
      '#d12771',
      '#d2a106',
      '#08bdba',
      '#bae6ff',
      '#ba4e00',
      '#d4bbff',
    ];

    const lightOrdinalColors = [
      '#6929c4',
      '#1192e8',
      '#005d5d',
      '#9f1853',
      '#fa4d56',
      '#570408',
      '#198038',
      '#002d9c',
      '#ee538b',
      '#b28600',
      '#009d9a',
      '#012749',
      '#8a3800',
      '#a56eff',
    ];

    const sequentialScales = [
      [
        '#edf5ff',
        '#d0e2ff',
        '#a6c8ff',
        '#78a9ff',
        '#4589ff',
        '#0f62fe',
        '#0043ce',
        '#002d9c',
        '#001d6c',
        '#001141',
      ],
      [
        '#f6f2ff',
        '#e8daff',
        '#d4bbff',
        '#be95ff',
        '#a56eff',
        '#8a3ffc',
        '#6929c4',
        '#491d8b',
        '#31135e',
        '#1c0f30',
      ],
      [
        '#d9fbfb',
        '#9ef0f0',
        '#3ddbd9',
        '#08bdba',
        '#009d9a',
        '#007d79',
        '#005d5d',
        '#004144',
        '#022b30',
        '#081a1c',
      ],
    ];

    const colorGradients = [
      ['#001141', '#edf5ff'],
      ['#1c0f30', '#f6f2ff'],
      ['#1c0f30', '#e5f6ff'],
      ['#081a1c', '#d9fbfb'],
    ];

    let backgroundColor = '#0f0e0e';
    let gridColor = '#3d3d3d';
    let textColor = '#f4f4f4';
    let labelColor = '#c6c6c6';
    let axisColor = '#6f6f6f';
    let titleFont = 'IBM Plex Sans, sans-serif';
    let defaultFont = 'IBM Plex Sans Condensed, Arial, sans-serif';
    let gradientColorBottom = colorGradients[2][1];
    let gradientColorTop = colorGradients[2][0];
    let defaultColor = darkOrdinalColors[darkOrdinalColors.length - 1];

    ordinalColors = darkOrdinalColors;
    quantitativeColors = sequentialScales[2];

    if (this.theme == 'light') {
      backgroundColor = '#ffffff';
      gridColor = '#e0e0e0';
      textColor = '#161616';
      labelColor = '#777677';
      axisColor = '#8c8c8c';
      titleFont = 'IBM Plex Sans, sans-serif';
      defaultFont = 'IBM Plex Sans Condensed, Arial, sans-serif';
      gradientColorBottom = colorGradients[1][1];
      gradientColorTop = colorGradients[1][0];
      defaultColor = lightOrdinalColors[lightOrdinalColors.length - 1];

      ordinalColors = lightOrdinalColors;
      quantitativeColors = sequentialScales[1];
    }

    /*if (spec.data?.values?.length > 0) {
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
    }*/
    /*if(!spec['data']){
      this._errorMessage =
          'ERROR: Schema is missing "data" filed';
        this._invalid = true;
        this.requestUpdate();
        return '';
    }*/
    /*if(!spec['data'] && !spec['layer'] && !spec['repeat']){
      this._errorMessage =
          'ERROR: Schema "data" field is empty, missing: values or url or layers or file';
        this._invalid = true;
        this.requestUpdate();
        return '';
    }*/

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

      let titleOffset = -8;
      const defaultPadding = 18;

      if (spec.description && !spec.title) {
        spec.title = spec.description;
        delete spec['description'];
      }

      if (spec.title) {
        if (typeof spec.title === 'string') {
          spec.title = { text: spec.title };
        }
      }

      if (spec.encoding?.y?.axis?.label || spec.encoding?.y?.field) {
        titleOffset = 2;
        spec['padding'] = {
          left: defaultPadding,
          right: 24,
          top: defaultPadding,
          bottom: defaultPadding,
        };
      } else {
        spec['padding'] = {
          left: defaultPadding,
          right: defaultPadding,
          top: defaultPadding,
          bottom: defaultPadding,
        };
      }

      if (addConfig) {
        spec['config'] = {
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
          mark: { tooltip: this.enableTooltip },
          axisBottom: {
            domainColor: axisColor,
            labelColor: labelColor,
            titleColor: textColor,
            tickColor: backgroundColor,
            titlePadding: 12,
            titleFont: defaultFont,
          },
          axisTop: {
            domainColor: gridColor,
            labelColor: labelColor,
            titleColor: textColor,
            tickColor: backgroundColor,
            titlePadding: 10,
            titleFont: defaultFont,
          },
          axisLeft: {
            domainColor: axisColor,
            labelColor: labelColor,
            titleColor: textColor,
            tickColor: backgroundColor,
            titlePadding: 6,
            titleFont: defaultFont,
          },
          axisRight: {
            domainColor: gridColor,
            labelColor: labelColor,
            titleColor: textColor,
            tickColor: backgroundColor,
            titlePadding: 10,
            titleFont: defaultFont,
          },
          view: {
            stroke: gridColor,
          },
          arc: {
            stroke: gridColor,
            strokeWidth: 1,
          },
          bar: {
            discreteBandSize: 16,
          },
          title: {
            font: titleFont,
            color: textColor,
            anchor: 'start',
            fontWeight: 500,
            fontSize: 16,
            offset: 16,
            dx: titleOffset,
          },
          range: {
            heatmap: [gradientColorBottom, gradientColorTop],
            ramp: [gradientColorBottom, gradientColorTop],
            category: ordinalColors,
            ordinal: ordinalColors,
          },
          legend: {
            title: null,
            symbolType: 'square',
            orient: 'bottom',
            symbolOpacity: 1,
            direction: 'horizontal',
            titleColor: textColor,
            labelColor: labelColor,
            titleFont: defaultFont,
            labelFont: defaultFont,
            labelOffset: 4,
            titleFontSize: 11,
            labelFontSize: 12, //fillOpacity: 1,
            strokeWidth: 1, //fontWeight: 'bold',
            offset: 20,
            symbolSize: 160,
            gradientLength: 246,
            gradientThickness: 8,
            gradientLabelOffset: 8,
          },
        };
      }

      let isOrdinal: boolean;
      switch (chartType) {
        case 'bar':
          isOrdinal = false;
          break;
        case 'point':
          isOrdinal = false;
          /*spec['config']['point'] = {
            fillOpacity: 0.3,
            strokeWidth: 2,
            filled: true,
            strokeOpacity: 1.0,
            size: 100,
          };*/
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

          spec['config']['padding'] = {
            left: defaultPadding,
            right: defaultPadding,
            top: 128,
            bottom: 128,
          };
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
          //spec['config']['rect'] = { strokeColor: backgroundColor };
          break;
        case 'arc':
          if (spec['mark']) {
            //spec['mark']['labels'] = true;
            if (spec['mark']['innerRadius'] > 0) {
              //spec['mark']['innerRadius'] = Math.round(this.clientHeight*0.6*0.7);
              //spec['mark']['outerRadius'] = Math.round(this.clientHeight*0.6);
              spec['mark']['outerRadius'] = spec['mark']['innerRadius'] * 1.2;
            }
          }
          if (!spec['encoding']) {
            spec['encoding'] = {};
          }
          if (!spec['encoding']['value']) {
            spec['encoding']['value'] = {};
          }
          if (!spec['encoding']['value']['label']) {
            spec['encoding']['value']['label'] = {
              align: 'center',
              baseline: 'middle',
              fontSize: 12,
            };
          }
          isOrdinal = false;
          break;
        default:
          isOrdinal = false;
          break;
      }

      if (!isOrdinal) {
        colorScale = ordinalColors;
      } else {
        colorScale = quantitativeColors;
      }

      if (editMarks) {
        if (!spec.encoding) {
          spec.encoding = {};
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
    }

    return spec;
  }
}
