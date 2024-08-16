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
   * Enable debugger to inspect spec and show error messages in the component
   */
  @property({ type: Boolean, attribute: 'debug-mode' })
  debugMode = true;

  /**
   * Event listener to check if parent visibility changed
   */
  private intersectionObserver;

  /**
   * Event listener to check if parent visibility changed
   */
  private resizeObserver;

  /**
   * Valid CSS string to define chart height, applied to chart container while specification is automatically set to height="container" to fill the parent container height
   */
  @property({ type: String, attribute: 'container-height', reflect: true })
  containerHeight = '246px';

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
  theme = 'g100';

  /**
   * Disable all chart option buttons, supercedes all other individual button options
   */
  @property({ type: Boolean, attribute: 'disable-options' })
  disableOptions;

  /**
   * Disable fullscreen button
   */
  @property({ type: Boolean, attribute: 'disable-fullscreen' })
  disableFullscreen;

  /**
   * Disable image export button
   */
  @property({ type: Boolean, attribute: 'disable-export' })
  disableExport;

  /**
   * Disable code inspector button
   */
  @property({ type: Boolean, attribute: 'disable-code-inspector' })
  disableCodeInspector;

  /**
   * Disable editor button
   */
  @property({ type: Boolean, attribute: 'disable-editor' })
  disableEditor;

  /**
   * Thumbnail mode
   */
  @property({ type: Boolean, attribute: 'thumbnail' })
  thumbNail;

  /**
   * thumbnail image dataurl
   */
  @state()
  exportedImageURL;

  /**
   * Enable tooltip in the chart component
   */
  @state()
  enableTooltip = true;

  /**
   * Enable user-zooming in the chart component
   */
  @property({ type: Boolean, attribute: 'enable-zooming' })
  enableZooming;

  /**
   * Enable filtering of data points when clicking legend
   */
  @property({ type: Boolean, attribute: 'enable-legend-filtering' })
  enableLegendFiltering;

  /**
   * Enable user-brush selection to fetch groups of elements to make targeted query
   */
  @property({ type: Boolean, attribute: 'enable-multi-selections' })
  enableMultiSelections = true;

  /**
   * internal brush selection value
   */
  @state()
  _authorizeMultiSelection = false;

  /**
   * Enable user-brush selection to fetch groups of elements to make targeted query
   */
  @property({ type: Boolean, attribute: 'enable-single-selections' })
  enableSingleSelections = true;

  /**
   * internal hover/click selection value
   */
  @state()
  _authorizeSingleSelection = true;

  /**
   * errorMessage - specifies error when debugging
   */
  @state()
  _errorMessage;

  /**
   * warningMessage - underlying warning to be appended to error
   */
  @state()
  _warningMessage;

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
   * _previousSpec -  original parsed Specification from content
   */
  @state()
  _previousSpec;

  /**
   * _visualizationSpec -  parsed object from content string
   */
  @state()
  _visualizationSpec;

  /**
   * _brokenSpec -  specification causing errors
   */
  @state()
  _brokenSpec;

  /**
   * _editedSpec -  temporary spec for editing mode
   */
  @state()
  _editedSpec;

  /**
   * _editedContent - temporary string spec in editing mode
   */
  @state()
  _editedContent;

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
   * tooltip value from tooltip event that targets the custom div in the component
   */
  @state()
  toolTipValues;

  /**
   * streaming - flag to denote streaming is enabled
   */
  @property({ type: Boolean, attribute: 'streaming' })
  streaming;

  /**
   * editOriginalSpecification - choose whether to edit the inserted spec or the edited sped
   */
  @state()
  editOriginalSpecification = false;

  /**
   * chartResizing - flag to notify when chart is resizing
   */
  @state()
  chartResizing = false;

  /**
   * _resizeTimeout - timeout signature for resize calls
   */
  @state()
  _resizeTimeout;

  /**
   * isHovered - state to detect when core chart is hovered upon
   */
  @state()
  isHovered = false;

  /** detect when component is rendered to process visualization specification object
   */
  firstUpdated() {
    this.generateUniqueId();
    this._getTheme();

    if (this.thumbNail) {
      this.disableCodeInspector = true;
      this.disableEditor = true;
    }

    if (this.renderMethod !== 'svg' && this.renderMethod !== 'canvas') {
      this.renderMethod = 'canvas';
    }

    this.addEventListener('wheel', this._hideTooltip);

    this.intersectionObserver = new IntersectionObserver(async () => {
      if (!this.chartLoading) {
        await this._displayVisualization();
      }
    });
    this.intersectionObserver.observe(this);

    this.resizeObserver = new ResizeObserver(async () => {
      clearTimeout(this._resizeTimeout);
      this._resizeTimeout = await setTimeout(async () => {
        await this._handleResize();
      }, 200);
    });

    this.resizeObserver.observe(this);

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
      this._editedContent = this.content;
      this._prepareVisualization();
    }
  }

  /**
   * _handleResize - target resize on component itself
   */
  async _handleResize() {
    this.chartResizing = true;
    this.chartLoading = true;
    await this._displayVisualization();
  }

  /**
   * _getTheme - find current theme by checking parent background color
   */
  _getTheme() {
    if (this.parentElement instanceof HTMLElement) {
      const parentStyle = getComputedStyle(this.parentElement);
      const backgroundColor = parentStyle.getPropertyValue('--cds-background');
      const darkMode =
        backgroundColor.startsWith('#') &&
        parseInt(backgroundColor.replace('#', ''), 16) < 0xffffff / 2;
      this.theme = darkMode ? 'g100' : 'white';
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

  /** _findStructuralChanges - return all JSON changes as edit actions strings
   * @param {Object} originalJSON - source JSON pre-edit
   * @param {Object} updatedJSON - new spec post-edit
   */
  _findStructuralChanges(originalJSON, updatedJSON) {
    const userEdits: { path: string; previousValue: any; updatedValue: any }[] =
      [];
    const changes = {};

    /** _recursiveComparison
     * @param {string} path - current json path
     * @param {object} firstElement - subleaf to compare
     * @param {object} secondElement - next subleaf to compare
     */
    function _recursiveComparison(path, firstElement, secondElement) {
      if (firstElement === secondElement) {
        return;
      }
      if (
        firstElement === null ||
        secondElement === null ||
        typeof firstElement !== 'object' ||
        typeof secondElement !== 'object'
      ) {
        changes[path] = secondElement;
        userEdits.push({
          path: path,
          previousValue: firstElement,
          updatedValue: secondElement,
        });
        return;
      }
      const keys = new Set([
        ...Object.keys(firstElement),
        ...Object.keys(secondElement),
      ]);
      for (const key of keys) {
        const nextPath = path ? path + '.' + key : key;
        _recursiveComparison(nextPath, firstElement[key], secondElement[key]);
      }
    }
    _recursiveComparison('', originalJSON, updatedJSON);

    return { changeObject: changes, actions: userEdits };
  }

  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  async updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('content')) {
      this._editedContent = this.content;
      this._errorMessage = null;
      this.chartLoading = true;
      if (!this.streaming) {
        this._prepareVisualization();
      }
    }

    if (changedProperties.has('containerWidth')) {
      this.style.setProperty('--chat-chart-element-width', this.containerWidth);
      if (!this.chartLoading && this._visualizationSpec) {
        await this._displayVisualization();
      }
    }

    if (changedProperties.has('containerHeight')) {
      this.style.setProperty(
        '--chat-chart-element-height',
        this.containerHeight
      );
      if (!this.chartLoading && this._visualizationSpec) {
        await this._displayVisualization();
      }
    }

    if (changedProperties.has('_visualizationSpec')) {
      this._errorMessage = null;
      const specificationFinalizedEvent = new CustomEvent(
        'on-chart-specification-ready',
        {
          detail: {
            action: 'CHART: rendering successful',
            uniqueID: this._uniqueID,
            originalSpec: this.content,
            finalizedSpec: this._visualizationSpec,
          },
          bubbles: true,
          composed: true,
        }
      );
      this.dispatchEvent(specificationFinalizedEvent);
      await this._displayVisualization();
    }

    if (changedProperties.has('_errorMessage')) {
      if (this._errorMessage !== '') {
        const renderErrorEvent = new CustomEvent('on-chart-error', {
          detail: {
            action: 'CHART: error detected',
            uniqueID: this._uniqueID,
            message: this._errorMessage,
            content: this.content || 'unavailable',
            parsedSpec: this._visualizationSpec || 'unavailable',
          },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(renderErrorEvent);
      }
    }

    if (!this.chartLoading) {
      if (
        //changedProperties.has('containerHeight') ||
        //changedProperties.has('containerWidth') ||
        changedProperties.has('carbonify') ||
        changedProperties.has('theme') ||
        changedProperties.has('enableTooltip') ||
        changedProperties.has('enableZooming') ||
        changedProperties.has('enableMultiSelections') ||
        changedProperties.has('enableLegendFiltering')
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
   * @param {string} predefinedTarget - target div to initialize chart in
   */
  async _displayVisualization() {
    const targetID = this._getTargetRenderCanvasId();
    if (!this._editedSpec) {
      this._editedSpec = this._visualizationSpec;
    }

    const targetDiv = this.shadowRoot?.querySelector(targetID);
    const chosenSpec =
      this.modalMode !== 'edit' ? this._visualizationSpec : this._editedSpec;
    if (targetDiv instanceof HTMLElement) {
      //const currentHeight = this.shadowRoot.host.clientHeight;
      //const currentWidth = this.shadowRoot.host.clientWidth;

      //const padding = chosenSpec.padding;
      chosenSpec.height = 'container'; //currentHeight;// - (padding.top + padding.bottom)*2;
      chosenSpec.width = 'container'; // - (padding.right + padding.left)*2;

      chosenSpec.autosize = { resize: false };
      if (this.thumbNail) {
        chosenSpec.width = 400;
        chosenSpec.height = 300;
      }

      //chosenSpec.height = currentHeight - (padding.top + padding.bottom)*2;
      //chosenSpec.width =  currentWidth - (padding.right + padding.left)*2;
      //console.log("post: h - "+chosenSpec.height+", w - "+chosenSpec.width)

      try {
        let renderMode = 'svg';
        if (this.renderMethod === 'canvas') {
          renderMode = 'canvas';
        }
        await VegaEmbed.default(targetDiv, chosenSpec, {
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
            this._previousSpec = this._visualizationSpec;
            if (this._authorizeSingleSelection) {
              try {
                view.addSignalListener('picker', (_, value) => {
                  this._singleDataSelected(value);
                });
              } catch (selectError) {
                this._warningMessage = selectError;
              }
            }
            if (this._authorizeMultiSelection) {
              try {
                view.addSignalListener('brush', (_, brush) => {
                  this._multiDataSelected(brush);
                });
              } catch (brushError) {
                this._warningMessage = brushError;
              }
            }
            if (this.thumbNail) {
              setTimeout(() => {
                this._generateImage();
              }, 200);
            }
          })
          .catch(async (error) => {
            console.log(error.message);
            this._brokenSpec = this._visualizationSpec;
            this._visualizationSpec = null;
            if (this._previousSpec) {
              this.chartLoading = true;
              this._errorMessage = '';
              this._visualizationSpec = JSON.parse(
                JSON.stringify(this._previousSpec)
              );
              //await this._displayVisualization(mode);
            } else {
              this.chartLoading = false;
              this._errorMessage = 'RENDER ERROR: ' + error.message;
            }
          });
        this.chartLoading = false;
      } catch (error) {
        this._errorMessage = 'RENDER ERROR: failed to render';
      }
    } else {
      this._errorMessage =
        'CHART COMPONENT ERROR: Failed to retrieve chart container id: ' +
        targetID;
    }
  }

  /**
   * single data selection event to send to parent for processing
   * @param {object} data - selected points from view event
   */
  _singleDataSelected(data) {
    const singleSelectionEvent = new CustomEvent('on-chart-single-selection', {
      detail: {
        uniqueID: this._uniqueID,
        action: 'CHART: single data point selected',
        selection: [data],
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(singleSelectionEvent);
  }

  /**
   * _checkIfDate - check if date
   * @param {object} intervalValue - domain to check
   */
  _checkIfDate(intervalValue: string | number): string | null {
    let date: Date;

    if (typeof intervalValue === 'number') {
      if (!isNaN(intervalValue)) {
        if (Math.abs(intervalValue) > 1000000) {
          date = new Date(intervalValue);
        } else if (intervalValue % 1 !== 0) {
          return intervalValue.toFixed(3);
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else if (typeof intervalValue === 'string' && intervalValue.length > 8) {
      date = new Date(intervalValue);
      if (isNaN(date.getTime())) {
        return null;
      }
    } else {
      return null;
    }

    if (date instanceof Date && !isNaN(date.getTime())) {
      return date.toLocaleDateString();
    } else {
      return null;
    }
  }

  /**
   * _formatMultiSelection - convert any selection into a readable text format
   * @param {object} selection - dict of axis names and domains
   */
  _formatMultiSelection(selection) {
    const tooltipString: string[] = [];
    for (const domain of selection) {
      const values = domain.values;
      if (values.length === 2 && this._checkIfDate(values[0])) {
        const startDate = this._checkIfDate(values[0]);
        const endDate = this._checkIfDate(values[1]);
        if (startDate && endDate) {
          tooltipString.push(
            domain.field + ': ' + startDate + ' to ' + endDate
          );
        } else {
          tooltipString.push(
            domain.field + ': ' + values[0] + ' to ' + values[1]
          );
        }
      } else {
        tooltipString.push(
          domain.field +
            ': ' +
            values.slice(0, 5).join(', ') +
            (values.length - 5 > 0
              ? ' and ' + (values.length - 5) + ' more'
              : '')
        );
      }
    }
    return tooltipString;
  }

  /**
   * multi data selection event from brush to send to parent for processing
   * @param {object} data - selected points from view event
   */
  _multiDataSelected(data) {
    const selectionPayload: { field: string; values: object }[] = [];
    for (const field in data) {
      const selection: { field: string; values: object } = {
        field: field,
        values: data[field],
      };
      selectionPayload.push(selection);
    }

    const selectionSummary = this._formatMultiSelection(selectionPayload);

    const multiSelectionEvent = new CustomEvent('on-chart-multi-selection', {
      detail: {
        uniqueID: this._uniqueID,
        action: 'CHART: multiple data points selected',
        dataEvent: data,
        selections: selectionPayload,
        selectionTextArray: selectionSummary,
        selectionSummary: selectionSummary.join('\n'),
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(multiSelectionEvent);
  }

  /**
   * _hideTooltip - remove tooltip when scrolling
   */
  _hideTooltip() {
    const tooltip = document.querySelector('#vg-tooltip-element');
    if (tooltip instanceof HTMLElement) {
      tooltip.innerHTML = '';
    }
  }

  /**
   * internal vega tooltip dom generator
   * @param {object} value - column/value dictionary inside hovered data point
   * @param {function} _sanitize - santization function to previous mailicious HTML
   */
  _toolTipBuilder(value, _sanitize) {
    const tooltip = document.querySelector('#vg-tooltip-element');
    if (tooltip instanceof HTMLElement) {
      let backgroundColor = '#161616';
      let textColor = '#f4f4f4';
      //let titleFont = 'IBM Plex Sans, sans-serif';
      const defaultFont = 'IBM Plex Sans Condensed, Arial, sans-serif';
      let gridColor = '#3d3d3d';
      if (this.theme === 'white') {
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
    this.showModal = true;
    const vegaURL = 'https://vega.github.io/editor/';
    const openNewWindow = window?.open(vegaURL, '_blank');
    if (openNewWindow) {
      setTimeout(() => {
        const specPayload = this._visualizationSpec
          ? this._visualizationSpec
          : this._brokenSpec;
        const payload = {
          spec: JSON.stringify(specPayload, null, '\t'),
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
    this.showModal = true;
    this.modalMode = 'fullscreen';
    this._displayVisualization();
  }

  /**
   * closeModal - invoked by modal subcomponent when close button is clicked inside
   */
  closeModal() {
    this.showModal = false;
    this.modalMode = null;
    this._displayVisualization();
  }

  /**
   * _exportToImage - if canvas, get image object from data url and auto-download
   */
  _exportToImage() {
    if (this.renderMethod === 'svg') {
      this._exportSvgToImage();
    } else {
      window.setTimeout(async () => {
        const targetID = this._getTargetRenderCanvasId();
        const container = this.shadowRoot?.querySelector(targetID);

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
  }

  /**
   * _getTargetRenderCanvasId
   */
  _getTargetRenderCanvasId() {
    let targetID =
      '#' + clabsPrefix + '--chat-chart-embed-vis-' + this._uniqueID;

    if (this.modalMode === 'edit') {
      targetID =
        '#' + clabsPrefix + '--chat-chart-editor-embed-vis-' + this._uniqueID;
    }
    if (this.modalMode === 'fullscreen') {
      targetID =
        '#' +
        clabsPrefix +
        '--chat-chart-fullscreen-embed-vis-' +
        this._uniqueID;
    }
    return targetID;
  }

  /**
   * _generateImage - if canvas, get image object from data url and create img tag
   */
  _generateImage() {
    if (this.renderMethod === 'svg') {
      //this._exportSvgToImage()
    } else {
      window.setTimeout(async () => {
        const targetID = this._getTargetRenderCanvasId();
        const container = this.shadowRoot?.querySelector(targetID);

        if (container instanceof HTMLElement) {
          const canvasDiv = container?.querySelector('canvas');
          if (canvasDiv instanceof HTMLElement) {
            this.exportedImageURL = canvasDiv.toDataURL('image/png');
          }
        }
      }, 200);
    }
  }

  /**
   * _handleLiveRawEditorChange - handle live changes coming from code subelement being edited
   * @param {event} event - custom codelement live change event
   */
  _handleLiveRawEditorChange(event) {
    if (event?.detail?.newLineText) {
      const previousData = this._visualizationSpec.data;

      try {
        this.chartLoading = false;
        this._errorMessage = '';
        const newSpec: any = JSON.parse(event.detail.newLineText);
        newSpec.data = previousData;

        //this.content = JSON.stringify(newSpec);
        this._editedSpec = newSpec;
        //this._prepareVisualization(newSpec)
        this._prepareSpecification(newSpec, false, true, 0);
      } catch (error) {
        console.error(error);
        this.chartLoading = true;
        this._errorMessage = 'CHART COMPONENT ERROR: edited spec is invalid';
      }
    }
  }

  /**
   * _handleLiveCarbonEditorChange - handle live changes coming from code subelement being edited
   * @param {event} event - custom codelement live change event
   */
  _handleLiveCarbonEditorChange(event) {
    if (event?.detail?.newLineText) {
      const previousData = this._visualizationSpec.data;

      try {
        const newSpec: any = JSON.parse(event.detail.newLineText);
        newSpec['data'] = previousData;
        this.chartLoading = false;
        this._errorMessage = '';

        //this.content = JSON.stringify(newSpec);
        //this._prepareVisualization(newSpec)
        //this._prepareSpecification(newSpec, false, true, 0);
        this._prepareVisualization(newSpec);
        this._editedSpec = newSpec;

        window.setTimeout(async () => {
          await this._displayVisualization();
        }, 200);
      } catch (error) {
        console.error(error);
        this.chartLoading = true;
        this._errorMessage = 'CHART COMPONENT ERROR: edited spec is invalid';
      }
    }
  }

  /**
   * _handleModelEditorValidation -  event from code subcomponent
   * @param {event} event - custom event from chat code component
   */
  _handleCarbonEditorValidation(event) {
    if (event?.detail?.newLineText) {
      this._errorMessage = '';
      const previousData = this._visualizationSpec.data;
      try {
        this.modalMode = null;
        this.showModal = false;
        //this._visualizationSpec = JSON.parse(event.detail.newLineText);
        //this._visualizationSpec.data = previousData;

        const newSpec: any = JSON.parse(event.detail.newLineText);
        newSpec.data = previousData;

        const changes = this._findStructuralChanges(
          this._visualizationSpec,
          newSpec
        );

        const specificationEditedEvent = new CustomEvent(
          'on-chart-specification-edit-validation',
          {
            detail: {
              action: 'CHART: rendering successful',
              changes: changes,
              originalSpec: this._visualizationSpec,
              newSpec: newSpec,
            },
            bubbles: true,
            composed: true,
          }
        );

        this._visualizationSpec = newSpec;
        this.chartLoading = false;
        this._errorMessage = '';

        this.dispatchEvent(specificationEditedEvent);

        window.setTimeout(async () => {
          await this._displayVisualization();
        }, 200);
      } catch (error) {
        console.error(error);
        this._errorMessage = 'CHART COMPONENT ERROR: edited spec is invalid';
      }
    }
  }

  /**
   * _handleModelEditorValidation -  event from code subcomponent
   * @param {event} event - custom event from chat code component
   */
  _handleOriginalEditorValidation(event) {
    if (event?.detail?.newLineText) {
      const previousData = this._visualizationSpec.data;
      try {
        const newSpec: any = JSON.parse(event.detail.newLineText);
        newSpec.data = previousData;
        this._editedSpec = newSpec;

        this._prepareSpecification(JSON.stringify(newSpec), true, true, 0);

        window.setTimeout(async () => {
          await this._displayVisualization();
        }, 200);
      } catch (error) {
        console.error(error);
        this._errorMessage = 'CHART COMPONENT ERROR: edited spec is invalid';
      }
    }
  }

  /**
   * _openCodeView - open editor modal
   */
  _openCodeView() {
    this.modalMode = 'edit';
    this.showModal = true;
    this._displayVisualization();
  }

  /**
   * _showCarbonSpec - Code editor toggling to show post-hoc spec
   */
  _showCarbonSpec() {
    this.editOriginalSpecification = false;
  }

  /**
   * _showOriginalSpec - Code editor toggling to show original valid spec
   */
  _showOriginalSpec() {
    this.editOriginalSpecification = true;
  }

  /**
   * _handleMouseOut - see if component lost mouse content
   */
  _handleMouseOut() {
    this.isHovered = false;
  }

  /**
   * _handleMouseOut - see if component lost mouse content
   */
  _handleMouseOver() {
    this.isHovered = true;
  }

  /**
   * _exportSvgToImage - if svg, get image object from svg and auto-download
   */
  _exportSvgToImage() {
    window.setTimeout(async () => {
      const targetID = this._getTargetRenderCanvasId();
      const container = this.shadowRoot?.querySelector(targetID);
      if (container instanceof HTMLElement) {
        const svgDiv = container?.querySelector('svg');
        if (svgDiv instanceof SVGElement) {
          const svgData = new XMLSerializer().serializeToString(svgDiv);
          const tempCanvas = document.createElement('canvas');
          const context = tempCanvas.getContext('2d');
          const svgSize = svgDiv.getBoundingClientRect();
          tempCanvas.height = svgSize.height;
          tempCanvas.width = svgSize.width;

          const tempImage = new Image();
          /**
           * handles the onload event when image is done rendering
           */
          tempImage.onload = () => {
            context?.drawImage(tempImage, 0, 0);
            const imageData = tempCanvas.toDataURL('image/png');
            const canvasDownloadLink = document.createElement('a');
            let exportedFileName = 'chart';
            if (this._visualizationSpec?.title?.text.trim()) {
              exportedFileName = this._visualizationSpec?.title?.text;
            }
            canvasDownloadLink.download = exportedFileName + '.png';
            canvasDownloadLink.href = imageData;
            canvasDownloadLink.click();
          };
          tempImage.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        }
      }
    }, 200);
  }

  /**
   * _lightenSpec - remove any large data objects before rendering in code element
   * @param {Object} specification - spec JSON to be check and lightened
   */
  _lightenSpec(specification) {
    const newSpecification = JSON.parse(JSON.stringify(specification));
    if (newSpecification?.data?.values?.length > 20) {
      newSpecification.data = 'Dataset not rendered for performance';
      return newSpecification;
    } else {
      return newSpecification;
    }
  }

  /**
   * prepareVisualization - Prepare and adapt Vega visualization spec to be more Carbon adjacent
   * @param {object} premadeSpec - Vega specification sent in optionally when pre-parsed
   */
  _prepareVisualization(premadeSpec?: object) {
    let spec: any = {};
    if (!premadeSpec) {
      try {
        spec = JSON.parse(this.content);
      } catch (e) {
        this._errorMessage =
          'CARBON CHART ERROR: JSON parse() failed, specification is not valid JSON';
        return '';
      }
    } else {
      spec = JSON.parse(JSON.stringify(premadeSpec));
    }

    if (!spec['$schema']) {
      this._errorMessage =
        'CHART COMPONENT ERROR: JSON is valid but not a valid schema, missing "$schema" field';
      return '';
    }

    if (!spec['repeat']) {
      //spec.width = 'container';
      //spec.height = 'container';
    } else {
      delete spec['height'];
      delete spec['width'];
    }

    delete spec['height'];
    delete spec['width'];
    delete spec['autosize'];

    let layeredSpec;
    let repeatedSpec;
    let plainSpec;
    let subChartWidth;
    let subChartHeight;
    if ('layer' in spec) {
      layeredSpec = this._prepareSpecification(spec, false, true, 0);
      /*for (const [index, subSpec] of spec['layer'].entries()) {
        const tempSubSpec = this._prepareSpecification(JSON.parse(JSON.stringify(subSpec)), true, false, index+1);
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

    if (this.theme == 'white') {
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

    if (this.carbonify) {
      spec.background = backgroundColor;

      let colorScale: any[] = [];

      let chartType = '';
      if (typeof spec.mark === 'string') {
        chartType = spec.mark;
        spec.mark = { type: chartType };
      } else if (typeof spec.mark === 'object' && 'type' in spec.mark) {
        chartType = spec.mark.type;
      } else if (spec['spec']) {
        if (typeof spec.spec?.mark === 'string') {
          chartType = spec.spec?.mark;
          spec['spec'].mark = { type: chartType };
        } else {
          if (
            typeof spec['spec'].mark === 'object' &&
            'type' in spec['spec'].mark
          ) {
            chartType = spec['spec'].mark.type;
          }
        }
      }
      let titleOffset = -8;
      const defaultPadding = 16;

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

      if (spec?.encoding?.size?.legend) {
        spec.encoding.size.legend = null;
      }

      if (spec?.mark?.type === 'point') {
        spec.mark.type = 'circle';
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
            titlePadding: 4,
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
            anchor: 'start',
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

      this._authorizeSingleSelection = true;
      this._authorizeMultiSelection = true;
      let isOrdinal: boolean;
      switch (chartType) {
        case 'bar':
          isOrdinal = false;
          if (spec.config) {
            spec.config.bar = {
              discreteBandSize: 12,
            };
          }
          break;
        case 'scatter':
          isOrdinal = false;
          break;
        case 'circle':
        case 'point':
          isOrdinal = false;
          if (spec['config']) {
            spec['config'][chartType] = {
              fillOpacity: 1.0,
              size: 40,
              strokeOpacity: 1.0,
              strokeWidth: 1.0,
            };
          }
          isOrdinal = false;
          break;
        case 'square':
          isOrdinal = false;
          this._authorizeMultiSelection = false;
          break;
        case 'tick':
          isOrdinal = false;
          this._authorizeMultiSelection = false;
          break;
        case 'line':
          isOrdinal = false;
          spec.config.line = { interpolate: 'monotone' };
          break;
        case 'text':
          isOrdinal = false;
          this._authorizeMultiSelection = false;
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
          this._authorizeSingleSelection = false;
          this._authorizeMultiSelection = false;
          break;
        case 'area':
          isOrdinal = false;
          break;
        case 'rule':
          isOrdinal = false;
          this._authorizeMultiSelection = false;
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
          /*if(!spec['view']){
            spec['view'] = {"padding":{}}
          }
          spec['view']['padding'] = {
            top: 124,
            bottom: 124,
            left:0,
            right:0
          };*/
          this._authorizeMultiSelection = false;
          break;
        case 'image':
          isOrdinal = false;
          this._authorizeMultiSelection = false;
          break;
        case 'trail':
          isOrdinal = false;
          this._authorizeMultiSelection = false;
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
          spec.config.arc = {
            stroke: gridColor,
            strokeWidth: 1,
          };
          isOrdinal = false;
          this._authorizeMultiSelection = false;
          break;
        default:
          isOrdinal = false;
          this._authorizeMultiSelection = false;
          break;
      }

      this._authorizeSingleSelection =
        this._authorizeSingleSelection && this.enableSingleSelections;
      this._authorizeMultiSelection =
        this._authorizeMultiSelection && this.enableMultiSelections;

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

        this._addInteractions(spec, 'point');
      }
    }

    return spec;
  }
  /**
   * _addToEncoding - modify encoding values without calling an empty field or overwriting predefined values
   * @param {object} spec - specification JSON to edit
   * @param {string} field - encoding field name
   * @param {object} appendedValues - new styling/behavior to append
   */
  _addToEncoding(spec, field, appendedValues) {
    const currentData = spec.encoding[field] || {};
    const preExistingCondition = currentData.condition;
    const checkArray = Array.isArray(preExistingCondition);
    const mergeConditions = preExistingCondition
      ? checkArray
        ? preExistingCondition
        : [preExistingCondition]
      : [];
    spec.encoding[field] = {
      ...currentData,
      ...appendedValues,
      condition: mergeConditions,
    };
  }

  /**
   * _addInteractions - modify encoding, selection and signals to apply interactions (zoom, filtering, brush, hover, click)
   * @param {object} spec - specification JSON to edit
   * @param {string} chartType - mark found in spec denoting chart type to dictate/remove custom behavior
   */
  _addInteractions(spec, chartType) {
    if (!this.enableMultiSelections) {
      this._authorizeMultiSelection = false;
    }
    const params: { name: string; select: object }[] = [];
    const paramCombinations: {
      param: string;
      empty: boolean;
      value: number;
    }[] = [];

    if (this._authorizeSingleSelection) {
      const hoverInteraction: { name: string; select: object } = {
        name: 'hover',
        select: { type: chartType, on: 'mouseover', clear: 'mouseout' },
      };
      params.push(hoverInteraction);
      paramCombinations.push({ param: 'hover', empty: false, value: 1 });

      //this._addToEncoding(spec, "opacity", {condition: [{selection: "hover", value:1}]});
      const selectInteraction: { name: string; select: object } = {
        name: 'picker',
        select: { type: chartType, toggle: true },
      };
      params.push(selectInteraction);
      //this._addToEncoding(spec, "color", { condition: [{selection: "picker", value: "red"}]})
      paramCombinations.push({ param: 'picker', empty: false, value: 1 });
    }

    if (this._authorizeMultiSelection) {
      const brushInteraction: { name: string; select: object } = {
        name: 'brush',
        select: { type: 'interval' },
      };
      params.push(brushInteraction);
      paramCombinations.push({ param: 'brush', empty: false, value: 1 });
    }

    if (this.enableLegendFiltering) {
      if (spec.encoding?.color?.field) {
        const fieldName = spec.encoding?.color?.field;
        const legendInteraction: { name: string; select: object } = {
          name: 'legendFilter',
          //bind: { legend: 'color' },
          select: { type: chartType, fields: [fieldName] },
        };
        params.push(legendInteraction);
        //paramCombinations.push({param: "legendFilter", value:1})

        //this._addToEncoding(spec, "opacity", {condition: [{selection: "legendFilter",value:1}]})
      }
    }

    if (params.length > 0) {
      spec.params = spec.params || [];
      spec.params = [...spec.params, ...params];
    }

    //this._addToEncoding(spec, "opacity", {condition: conditions, value:0.3})

    if (paramCombinations.length > 0) {
      //const internalTesting = paramCombinations.map(param => `{"test": "`+param.param+`_isActive", "value": 1 }`).join(' || ')
      //const internalTesting = paramCombinations.map(param => param.param+`_isActive`).join(' || ')
      //console.log(interactionConditions)
      /*const conditions =
        (spec.encoding['opacity'] = {
          condition: paramCombinations,
          value: 0.6,
        });*/
      spec.encoding['opacity'] = {
        condition: paramCombinations,
        value: 0.85,
      };
      //this._addToEncoding(spec, "opacity", {condition: interactionConditions, value:0.3})
    } else {
      //spec.encoding["opacity"] = {value:1.0}
    }
  }
}
