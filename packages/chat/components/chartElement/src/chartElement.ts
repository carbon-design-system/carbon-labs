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
   * Stringified JSON object defining a Vega-lite V5 chart specification. Specifications must contain $schema, data and encoding
   */
  @property({ type: String, attribute: 'content', reflect: true })
  content;

  /**
   * Event listener to check if parent visibility changed
   */
  private intersectionObserver;

  /**
   * Event listener to check if component has resized
   */
  private resizeObserver;

  /**
   * Valid CSS string to define chart height, applied to chart container while specification is automatically set to height="container" to fill the parent container height
   */
  @property({ type: String, attribute: 'container-height', reflect: true })
  containerHeight = '300px';

  /**
   * Same as container-height, a CSS string to define the width, applied to chart container
   */
  @property({ type: String, attribute: 'container-width', reflect: true })
  containerWidth = '100%';

  /**
   * Extensively redefine the "config" field of the specification to apply Carbon Chart styling to chart defined in the specification (may override user-defined color/gradient/scale selections)
   */
  @property({ type: Boolean, attribute: 'carbonify', reflect: true })
  carbonify = true;

  /**
   * Render using "svg" (easier to inspect in the DOM) or "canvas" (better performance)
   */
  @property({ type: String, attribute: 'render-method' })
  renderMethod = 'canvas';

  /**
   * This value is either "dark" or "light" and displays the chart using Carbon Chart theme colors
   */
  @property({ type: String, attribute: 'theme' })
  theme = 'dark';

  /**
   * Disable all chart option buttons, supercedes all other individual button options
   */
  @property({ type: Boolean, attribute: 'disable-options' })
  disableOptions = false;

  /**
   * Disable fullscreen button
   */
  @property({ type: Boolean, attribute: 'disable-fullscreen' })
  disableFullscreen = false;

  /**
   * Disable image export button
   */
  @property({ type: Boolean, attribute: 'disable-export' })
  disableExport = false;

  /**
   * Disable code inspector button
   */
  @property({ type: Boolean, attribute: 'disable-code-inspector' })
  disableCodeInspector = false;

  /**
   * Disable editor button
   */
  @property({ type: Boolean, attribute: 'disable-editor' })
  disableEditor = false;

  /**
   * Enable tooltip in the chart component
   */
  @state()
  enableTooltip = true;

  /**
   * Enable user-zooming in the chart component
   */
  @property({ type: Boolean, attribute: 'enable-zooming' })
  enableZooming = false;

  /**
   * Enable filtering of data points when clicking legend
   */
  @property({ type: Boolean, attribute: 'enable-legend-filtering' })
  enableLegendFiltering = true;

  /**
   * Enable user-brush selection to fetch groups of elements to make targeted query
   */
  @property({ type: Boolean, attribute: 'enable-brushing' })
  enableBrushing = false;

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
   * Show a loading animation that fills the container. When providing a complete string, the chart will auto-render and this will be set to false. If streaming: raw json text data will be incrementally displayed here until complete and validated, then the chart is rendered
   */
  @property({ type: Boolean, attribute: 'loading' })
  chartLoading = true;

  /**
   * visualizationSpec -  parsed object from content string
   */
  @state()
  _visualizationSpec;

  /**
   * boolean to display fullscreen chart and code
   */
  @state()
  showModal = false;

  /**
   * modal mode value "code" or "fullscreen" to properly seperate HTML content rendered
   */
  @state()
  modalMode;

  /**
   * switchable HTML content to display code and chart in a modal
   */
  @state()
  modalContent;

  /**
   * tooltip value from tooltip event that targets the custom div in the component
   */
  @state()
  toolTipValues;

  /**
   * internal brush selection value
   */
  @state()
  _enableBrushSelection = false;

  /** detect when component is rendered to process visualization specification object
   */
  firstUpdated() {
    this.generateUniqueId();

    if (this.renderMethod !== 'svg' && this.renderMethod !== 'canvas') {
      this.renderMethod = 'canvas';
    }

    this.resizeObserver = new ResizeObserver(async () => {
      if (!this.chartLoading) {
        if (this._visualizationSpec?.repeat) {
          this._prepareVisualization();
        }
      }
      //this.requestUpdate();
    });
    this.resizeObserver.observe(this.parentElement);

    this.intersectionObserver = new IntersectionObserver(async () => {
      if (!this.chartLoading) {
        await this._displayVisualization();
      }
    });
    this.intersectionObserver.observe(this.parentElement);

    if (this.hasAttribute('container-width')) {
      this.style.setProperty('--chat-chart-element-width', this.containerWidth);
    }

    if (this.hasAttribute('container-height')) {
      this.style.setProperty(
        '--chat-chart-element-height',
        this.containerHeight
      );
    }

    if (this.content) {
      this._prepareVisualization();
    }
  }

  /**
   * Render visualization again when resizing or parameters updates
   * @param {Boolean} updateSpecification - flag to check if specification needs to be reprepared
   */
  async _reRenderVisualization(updateSpecification) {
    if (updateSpecification) {
      this._prepareVisualization();
    }
  }

  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  async updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('content')) {
      this._errorMessage = null;
      this.chartLoading = true;
      this._prepareVisualization();
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

    if (changedProperties.has('_visualizationSpec')) {
      this._errorMessage = null;
      const specificationFinalizedEvent = new CustomEvent(
        'on-specification-ready',
        {
          detail: { spec: this._visualizationSpec },
          bubbles: true,
          composed: true,
        }
      );
      this.dispatchEvent(specificationFinalizedEvent);
      await this._displayVisualization();
    }

    if (!this.chartLoading) {
      if (
        changedProperties.has('containerHeight') ||
        changedProperties.has('containerWidth') ||
        changedProperties.has('carbonify') ||
        changedProperties.has('theme') ||
        changedProperties.has('enableTooltip') ||
        changedProperties.has('enableZooming')
      ) {
        this._prepareVisualization();
      }
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
    //const targetID = '#' + clabsPrefix + '--chat-embed-vis-' + this._uniqueID;
    const targetID = '.' + clabsPrefix + '--chat-chart-container';
    const targetDiv = this.shadowRoot?.querySelector(targetID);
    if (targetDiv instanceof HTMLElement) {
      try {
        let renderMode = 'svg';
        if (this.renderMethod === 'canvas') {
          renderMode = 'canvas';
        }
        await VegaEmbed.default(targetDiv, this._visualizationSpec, {
          actions: false,
          hover: this.enableTooltip,
          tooltip: {
            /**
             * custom tooltip renderer for vega
             * @param {object} value - object containing speech result
             * @param {function} sanitize - sanitize html to present malicious attacks
             */
            formatTooltip: (value, sanitize) => {
              return this._toolTipBuilder(value, sanitize);
            },
          },
          renderer: renderMode as 'canvas' | 'svg',
        })
          .then(({ view }) => {
            if (this._enableBrushSelection) {
              try {
                view.addSignalListener('brush', (_, brush) => {
                  const data = view.data('brush_store');
                  console.log(data);
                  console.log(brush);
                });
              } catch (brushError) {
                console.log(brushError);
              }
            }
          })
          .catch((error) => {
            console.log(error);
            this._visualizationSpec = null;
            this.chartLoading = false;
            this._errorMessage = 'VEGA-LITE rendering error: ' + error;
          });
        this.chartLoading = false;
      } catch (error) {
        this._errorMessage = 'VEGA-LITE ERROR: VegaEmbed failed to render';
      }
    } else {
      this._errorMessage =
        'CARBON CHART ERROR: Failed to retrieve chart container div: ' +
        targetID;
    }
  }

  /**
   * internal vega tooltip dom generator
   * @param {object} value - column/value dictionary inside hovered data point
   * @param {function} _sanitize - santization function to previous mailicious HTML
   */
  _toolTipBuilder(value, _sanitize) {
    const tooltip = document.querySelector('#vg-tooltip-element');
    //tooltip.classList.add(clabsPrefix + '--chat-chart-tooltip-styles')
    //console.log(value)
    //this.toolTipValues = value
    //console.log(this.toolTipValues)
    if (tooltip instanceof HTMLElement) {
      let backgroundColor = '#161616';
      let textColor = '#f4f4f4';
      //let titleFont = 'IBM Plex Sans, sans-serif';
      const defaultFont = 'IBM Plex Sans Condensed, Arial, sans-serif';
      let gridColor = '#3d3d3d';
      if (this.theme === 'light') {
        backgroundColor = '#ffffff';
        textColor = '#161616';
        //labelColor = '#777677';
        gridColor = '#e0e0e0';
      }

      tooltip.style.color = textColor;
      //tooltip.style.border = '1px solid '+gridColor;
      tooltip.style.border = 'none';
      tooltip.style.padding = '0px';
      tooltip.style.borderRadius = '0px';
      tooltip.style.background = backgroundColor;
      tooltip.style.fontFamily = defaultFont;
      //tooltip.style.height = 'auto';
      //tooltip.style.

      let toolTipHTML =
        '<div style="background:' +
        backgroundColor +
        '; display: flex; flex-direction: column; align-items: start; height:auto; width:100%;">';
      let sectionBorder = '1px solid ' + gridColor;
      const entrySize = Object.keys(value).length;
      let entryCount = 0;
      for (const [key, dataValue] of Object.entries(value)) {
        if (entryCount >= entrySize - 1) {
          sectionBorder = 'none';
        }
        toolTipHTML +=
          '<div style="display: flex; justify-content: space-between; align-items: center; width:100%; border-bottom: ' +
          sectionBorder +
          '; padding:6px; box-sizing: border-box;">';
        toolTipHTML +=
          '<span style="text-align: left; flex:1;font-size:10px; white-space: nowrap;">' +
          key +
          '</span>';
        toolTipHTML +=
          '<span style="text-align: right; flex:1;font-size:12px; white-space: nowrap; padding-left:16px;">' +
          dataValue +
          '</span>';
        toolTipHTML += '</div>';
        entryCount++;
      }
      toolTipHTML += '</div>';
      return toolTipHTML;
    } else {
      return '';
    }
  }

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
   * _openEditorView -
   */
  _openEditorView() {
    const vegaURL = 'https://vega.github.io/editor/';
    const openNewWindow = window?.open(vegaURL, '_blank');
    if (openNewWindow) {
      setTimeout(() => {
        const payload = {
          spec: JSON.stringify(this._visualizationSpec, null, '\t'),
          mode: 'vega-lite',
        };

        openNewWindow.postMessage(payload, '*');
      }, 500);
    } else {
      console.log('window is undefined');
    }
  }

  /**
   * _openFullscreenView -
   */
  _openFullscreenView() {
    this.modalMode = 'fullscreen';
    window.setTimeout(async () => {
      this.showModal = true;
      const modalDiv = this.shadowRoot?.querySelector(
        '.' + clabsPrefix + '--chat-chart-modal-container'
      );
      if (modalDiv instanceof HTMLElement) {
        let renderMode = 'svg';
        if (this.renderMethod === 'canvas') {
          renderMode = 'canvas';
        }
        try {
          await VegaEmbed.default(modalDiv, this._visualizationSpec, {
            actions: false,
            hover: this.enableTooltip,
            tooltip: { formatTooltip: this._toolTipBuilder },
            renderer: renderMode as 'canvas' | 'svg',
          }).catch((error) => {
            console.log(error);
            //this._visualizationSpec = null;
            this._errorMessage = 'VEGA-LITE rendering error: ' + error;
            console.log(this._errorMessage);
            this.requestUpdate();
          });
        } catch (modalError) {
          console.log(modalError);
        }
      }
    }, 200);
  }

  /**
   * closeModal - invoked by modal subcomponent when close button is clicked inside
   */
  closeModal() {
    this.showModal = false;
    this.modalMode = null;
  }

  /**
   * _exportToImage - if canvas, get image object from data url and auto-download
   */
  _exportToImage() {
    window.setTimeout(async () => {
      const container = this.shadowRoot?.querySelector(
        '.' + clabsPrefix + '--chat-chart-container'
      );

      if (container instanceof HTMLElement) {
        const canvasDiv = container?.querySelector('canvas');
        if (canvasDiv instanceof HTMLElement) {
          const imageUrl = canvasDiv.toDataURL('image/png');
          const canvasDownloadLink = document.createElement('a');
          let exportedFileName = 'chart';
          if (this._visualizationSpec?.title?.text.trim()) {
            exportedFileName = this._visualizationSpec?.title?.text;
          }
          canvasDownloadLink.download = exportedFileName + '.png';
          canvasDownloadLink.href = imageUrl;
          canvasDownloadLink.click();
        }
      }
    }, 200);
  }

  /**
   * _openCodeView -
   */
  _openCodeView() {
    this.modalMode = 'code';
    window.setTimeout(async () => {
      this.showModal = true;

      const modalDiv = this.shadowRoot?.querySelector(
        '.' + clabsPrefix + '--chat-chart-modal-container'
      );
      if (modalDiv instanceof HTMLElement) {
        try {
          this.modalContent =
            "<clabs-chat-code content='" +
            JSON.stringify(this._visualizationSpec, null, '\t') +
            "'><clabs-chat-code>";
        } catch (modalError) {
          console.error(modalError);
        }
      }
    }, 200);
  }

  /**
   * prepareVisualization - Prepare and adapt Vega visualization spec to be more Carbon adjacent
   */
  _prepareVisualization() {
    let spec: any = {};
    try {
      spec = JSON.parse(this.content);
    } catch (e) {
      /*this._errorMessage =
        'CARBON CHART ERROR: JSON parse() failed, specification is not valid JSON';*/
      return '';
    }

    if (!spec['$schema']) {
      this._errorMessage =
        'CARBON CHART ERROR: JSON is valid but not a valid schema, missing "$schema" field';
      return '';
    }

    if (!spec['repeat']) {
      spec.width = 'container';
      spec.height = 'container';
    } else {
      delete spec['height'];
      delete spec['width'];
    }
    /*spec.autosize = {
      type: 'fit',
      resize:true,
      contains: 'padding',
    };*/
    delete spec['autosize'];

    let layeredSpec;
    let repeatedSpec;
    let plainSpec;
    let subChartWidth;
    let subChartHeight;
    if ('layer' in spec) {
      layeredSpec = this._prepareSpecification(spec, false, true, 0);
      /*for (const [index, subSpec] of spec['layer'].entries()) {
        const tempSubSpec = this._prepareSpecification(subSpec, true, false, index);
        delete tempSubSpec['background'];
        delete tempSubSpec['padding'];
        layeredSpec['layer'][index] = tempSubSpec;
      }*/
    } else if (spec['repeat']) {
      const currentContainerWidth = this.clientWidth;
      const currentContainerHeight = this.clientHeight;
      repeatedSpec = this._prepareSpecification(
        JSON.parse(JSON.stringify(spec)),
        false,
        true,
        0
      );
      repeatedSpec['spec'] = this._prepareSpecification(
        repeatedSpec['spec'],
        true,
        false,
        0
      );
      if (currentContainerWidth) {
        let rowCount;
        let columnCount;
        if (Array.isArray(repeatedSpec['repeat'])) {
          columnCount = repeatedSpec.columns ? repeatedSpec.columns : 1;
          rowCount = Math.ceil(repeatedSpec['repeat'].length / columnCount);
        } else {
          if (repeatedSpec['repeat']['row']) {
            rowCount = repeatedSpec['repeat']['row'].length;
          }
          if (repeatedSpec['repeat']['column']) {
            columnCount = repeatedSpec['repeat']['column'].length;
          }
        }

        const legendHeight = 16 * 3;

        const paddingOffset = { vertical: 0, horizontal: 0 };

        if (repeatedSpec['padding']) {
          paddingOffset['vertical'] =
            repeatedSpec['padding']['top'] + repeatedSpec['padding']['bottom'];
          paddingOffset['horizontal'] =
            repeatedSpec['padding']['left'] + repeatedSpec['padding']['right'];
        }

        if (Array.isArray(repeatedSpec['repeat'])) {
          //paddingOffset['horizontal']= paddingOffset['horizontal']columnCount;
        }

        //paddingOffset['horizontal'] = 120;
        const gapSize = 17;

        subChartWidth =
          (currentContainerWidth - 48 - (columnCount + 1) * gapSize) /
            columnCount -
          42;
        subChartHeight =
          (currentContainerHeight -
            48 -
            legendHeight -
            (rowCount + 1) * gapSize) /
            rowCount -
          42;
      }

      delete repeatedSpec['spec']['background'];
      delete repeatedSpec['spec']['padding'];

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
        //spec, editMarks, addConfig, layerIndex
        plainSpec = this._prepareSpecification(spec, true, true, 0);
      }

      if (this.enableZooming) {
        plainSpec.selection = plainSpec.selection || {};
        plainSpec.selection.grid = {
          type: 'interval',
          bind: 'scales',
        };
      }
    }

    let finalSpec;

    if (spec['layer']) {
      finalSpec = layeredSpec;
      //finalSpec['resolve'] = this._resolveLayerConfigs(JSON.parse(JSON.stringify(finalSpec.config)), "shared");
    } else if (spec['repeat']) {
      finalSpec = repeatedSpec;
    } else {
      finalSpec = plainSpec;
    }

    this._visualizationSpec = finalSpec;
    return '';
  }

  /**
   * _prepareSpecification - edit Vega specific to change mark values and apply colors or rewrite config attribute
   * @param {object} spec - vega sepcification JSON
   * @param {boolean} editMarks - boolean to change mark values
   * @param {boolean} addConfig - boolean to edit config attribute of spec with Carbon styles
   * @param {number} layerIndex - index of layer, enabled to switch default colors and handle z-indexing
   */
  _prepareSpecification(spec, editMarks, addConfig, layerIndex) {
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

    let backgroundColor = '#161616';
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
    quantitativeColors = sequentialScales[1];

    if (layerIndex) {
      quantitativeColors = sequentialScales[2];
      defaultColor =
        darkOrdinalColors[
          layerIndex < darkOrdinalColors.length
            ? layerIndex
            : layerIndex % darkOrdinalColors.length
        ];
    }

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

      if (layerIndex) {
        quantitativeColors = sequentialScales[2];
        defaultColor =
          lightOrdinalColors[
            layerIndex < lightOrdinalColors.length
              ? layerIndex
              : layerIndex % lightOrdinalColors.length
          ];
      }
    }

    /*if (spec.data?.values?.length > 0) {
      delete spec['data']['url'];
      delete spec['data']['format'];
      delete spec['data']['file'];
    } else {
      if (!spec.data?.url) {
        this._errorMessage =
          'ERROR: Schema is missing "values" and/or "url" in the "data" field';
        this.requestUpdate();
      }
    }*/
    /*if(!spec['data']){
      this._errorMessage =
          'ERROR: Schema is missing "data" filed';
        this.requestUpdate();
        return '';
    }*/
    /*if(!spec['data'] && !spec['layer'] && !spec['repeat']){
      this._errorMessage =
          'ERROR: Schema "data" field is empty, missing: values or url or layers or file';
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
      const defaultPadding = 24;

      if (spec.description && !spec.title) {
        spec.title = spec.description;
        delete spec['description'];
      }

      if (spec.title) {
        if (typeof spec.title === 'string') {
          spec.title = { text: spec.title };
        }
      } else if (addConfig && !this.disableOptions) {
        spec.title = { text: '   ' };
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
            titleFontWeight: 400,
          },
          axisTop: {
            domainColor: gridColor,
            labelColor: labelColor,
            titleColor: textColor,
            tickColor: backgroundColor,
            titlePadding: 10,
            titleFont: defaultFont,
            titleFontWeight: 400,
          },
          axisLeft: {
            domainColor: axisColor,
            labelColor: labelColor,
            titleColor: textColor,
            tickColor: backgroundColor,
            titlePadding: 6,
            titleFont: defaultFont,
            titleFontWeight: 400,
          },
          axisRight: {
            domainColor: gridColor,
            labelColor: labelColor,
            titleColor: textColor,
            tickColor: backgroundColor,
            titlePadding: 10,
            titleFont: defaultFont,
            titleFontWeight: 400,
          },
          view: {
            stroke: gridColor,
          },
          arc: {
            stroke: gridColor,
            strokeWidth: 1,
          },
          bar: {
            discreteBandSize: 12,
          },
          line: {
            interpolate: 'monotone',
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
            symbolBaseFillColor: null,
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
          this._enableBrushSelection = true;
          break;
        case 'scatter':
          isOrdinal = false;
          this._enableBrushSelection = true;
          break;
        case 'circle':
        case 'point':
          isOrdinal = false;
          this._enableBrushSelection = true;
          /*if(spec['config']){
          spec['config'][chartType] = {
            fillOpacity: 0.3,
            fill: backgroundColor,
            strokeWidth: 1,
            filled: true,
            strokeOpacity: 1.0,
          };
          }*/
          isOrdinal = false;
          this._enableBrushSelection = true;
          break;
        case 'square':
          isOrdinal = false;
          break;
        case 'tick':
          isOrdinal = false;
          break;
        case 'line':
          isOrdinal = false;
          this._enableBrushSelection = true;
          break;
        case 'text':
          isOrdinal = false;
          //spec['config']['text'] = { strokeColor: textColor };
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
          this._enableBrushSelection = true;
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
          spec['config']['rect'] = { stroke: backgroundColor };
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
        delete spec.encoding.color.legend;

        //if(chartType === "point"){
        /*if (spec.encoding) {
        spec.encoding = {
          ...spec.encoding,
          color:{
            ...spec.encoding.color,
            condition: {
              selction: {not: 'legend'},
              value: spec.encoding.color.field ? undefined : 'transparent'
            }
          },
          fill: {value: spec.encoding.color.field ? undefined : 'transparent'},
          stroke: {value: spec.encoding.color.field ? undefined : 'transparent'}
        }
      //}
      }*/
      }

      if (!this.enableBrushing) {
        this._enableBrushSelection = false;
      }

      if (this._enableBrushSelection) {
        spec['params'] = [
          {
            name: 'brush',
            select: { type: 'interval' },
          },
        ];
      }

      if (this.enableLegendFiltering) {
        if (spec.encoding?.color?.field) {
          const fieldName = spec.encoding?.color?.field;

          spec['params'] = [
            {
              name: 'hover',
              select: { type: chartType, on: 'mouseover', fields: [fieldName] },
              bind: 'legend',
            },
            {
              name: 'select',
              select: { type: chartType, toggle: true, fields: [fieldName] },
              bind: 'legend',
            },
            {
              name: 'brush',
              select: { type: 'interval' },
            },
          ];

          spec['params'] = [{ name: 'brush', select: { type: 'interval' } }];

          spec.selection = {
            LegendClicked: {
              type: 'single',
              fields: [spec.encoding.color.field],
              bind: 'legend',
              empty: false,
            },
          };
          if (chartType !== 'geoshape') {
            spec.transform = [
              {
                filter: { selection: 'LegendClicked' },
              },
            ];
          }
        }
      }
    }

    return spec;
  }
}
