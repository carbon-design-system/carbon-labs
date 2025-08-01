/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { settings } from '@carbon-labs/utilities/es/settings/index.js';
const { stablePrefix: clabsPrefix } = settings;

import { LitElement } from 'lit';

import { property, state } from 'lit/decorators.js';
// @ts-ignore
import embed from 'vega-embed';
// @ts-ignore
import { VegaEmbedResult, EmbedOptions } from 'vega-embed';

// @ts-ignore
import styles from './chartElementV2.scss?inline';

/**
 * Default Chart class for Litelement extension
 */
export default class chartElementV2 extends LitElement {
  static styles = styles;
  /** The Vega-Lite spec as a JSON string. */
  @property({ attribute: 'content', type: String }) specStr = '';
  /** The Vega-Lite spec as an object */
  @property({ attribute: false }) specObj: any = null;
  /** Saved parsed Spec for events and undoing edits */
  @property({ attribute: false }) originalSpec: any = null;
  /** Main container width; CSS units or plain numbers. */
  @property({ attribute: 'container-width', type: String })
  containerWidth?: string;
  /** Main container height; CSS units or plain numbers. */
  @property({ attribute: 'container-height', type: String })
  containerHeight?: string;
  /** force zoom,select,brush, legend controls and hover if possible (force-deletes pre-appended events)*/
  @property({ attribute: 'enable-all-events', type: Boolean }) enableAllEvents =
    false;
  /** carbonification - forces carbon styling with themes and config upon the ingested spec*/
  @property({ attribute: 'enable-carbon-styling', type: Boolean })
  enableCarbonStyling = true;
  /** enable zoom interaction if possible*/
  @property({ attribute: 'enable-zoom', type: Boolean }) enableZoom = false;
  /** enable mutli-select interaction if possible*/
  @property({ attribute: 'enable-brush', type: Boolean }) enableBrush = false;
  /** enable single selection interaction if possible*/
  @property({ attribute: 'enable-selection', type: Boolean }) enableSelection =
    false;
  /** enable hover interaction if possible*/
  @property({ attribute: 'enable-hover', type: Boolean }) enableHover = false;
  /** enable legend filtering */
  @property({ attribute: 'enable-legend-selection', type: Boolean })
  enableLegendSelection = false;
  /** make tooltip default */
  @property({ attribute: 'enable-tooltip', type: Boolean }) enableTooltip =
    true;
  /** force the usage of baked-in vega theme for carbon instead of hand-made config system*/
  @property({ attribute: 'use-theme', type: String }) useTheme = '';
  /** make chart uninteractible png image (saves on memory and good for small spaces)*/
  @property({ attribute: 'thumbnail', type: Boolean }) thumbnailMode;
  /** enable streaming to let component know content is arriving token by token and is incomplete to avoid JSON parse error states*/
  @property({ attribute: 'streaming', type: Boolean }) streaming = false;
  /** enable hover state to let users know charts is selectable*/
  @property({ attribute: 'selectable', type: Boolean }) selectable = true;
  /** Track if chart is hovered upon for border interaction*/
  @state() private _hovered = false;
  /** Save if chart was selected and retain selection border*/
  @state() private _selected = false;
  /** Show modal for options */
  @state() private showModal = false;
  /** injectable css */
  @state() private tooltipCss;
  /** Modal mode to display spec */
  @state() private modalMode = null;
  /** SVG or Canvas switcher*/
  @state() private renderMethod = 'canvas';

  private _parentTheme: 'white' | 'g100' = 'white';
  private _view: any;
  private _error: string | null = null;
  private _loading = false;
  private _thumbSrc: string | null = null;
  private _uniqueID: string | null = null;
  private containerWidthString: string | null = null;
  private containerHeightString: string | null = null;
  private carbonSpec: any = null;
  private _visualizationSpec: any = null;

  private _themeConfig: any = {};

  private _eventBlacklist: Record<string, string[]> = {
    zoom: ['geoshape', 'geopath', 'geopoint', 'arc', 'group'],
    brush: [
      'geoshape',
      'geopath',
      'geopoint',
      'image',
      'arc',
      'trail',
      'group',
      'image',
      'rule',
      'tick',
    ],
    hover: [
      'boxplot',
      'errorbar',
      'errorband',
      'arc',
      'image',
      'trail',
      'rule',
      'tick',
    ],
    select: [
      'boxplot',
      'errorbar',
      'errorband',
      'geoshape',
      'trail',
      'image',
      'arc',
      'rule',
      'tick',
    ],
    legend: [],
  };

  /**
   * Event listener to check if parent visibility changed
   */
  private resizeObserver;

  /**
   * First update LIT function to pre-set behavior on creation
   */
  async firstUpdated() {
    const randomString: string = Math.random().toString(36).substr(2, 9);
    this._uniqueID = randomString;

    this._getTheme();
    if (this.enableAllEvents) {
      this.enableZoom = true;
      this.enableBrush = true;
      this.enableSelection = true;
      this.enableHover = true;
      this.enableLegendSelection = true;
    }

    this.resizeObserver = new ResizeObserver((_entries) => {
      //for (const entry of _entries) {
      //const boundingArea = entry.contextRect;
      this._resizeChart();
      //}
    });
    this.resizeObserver.observe(this);
    console.log(
      'hovered: ' +
        this._hovered +
        ' selected: ' +
        this._selected +
        ' error: ' +
        this._error +
        ' loading: ' +
        this._loading +
        ' showModal: ' +
        this.showModal +
        ' themeConfig: ' +
        this._themeConfig +
        ' thumbSrc: ' +
        this._thumbSrc
    );
    await this.updateComplete;
    this._renderSpec();
  }

  /**
   * updated - core LIT update function
   * @param {object} changedProperties - core internal property changes
   */
  updated(changedProperties) {
    super.updated(changedProperties);
    this._updateSCSS();

    if (this.enableAllEvents && changedProperties.has('enableEvents')) {
      this.enableZoom = true;
      this.enableBrush = true;
      this.enableSelection = true;
      this.enableHover = true;
      this.enableLegendSelection = true;
    }

    if (changedProperties.has('specStr') || changedProperties.has('specObj')) {
      try {
        this.originalSpec = this.specObj || JSON.parse(this.specStr || '{}');
      } catch {
        console.log('no spec provided');
      }
    }

    if (changedProperties.has('enableTooltip')) {
      this._updateTooltipStyle();
    }
    const watch = [
      'specStr',
      'specObj',
      'containerWidthString',
      'containerHeightString',
      'enableCarbonStyling',
      'enableZoom',
      'enableBrush',
      'enableSelection',
      'enableHover',
      'enableLegendSelection',
      'enableTooltip',
      'tooltipCss',
      'useTheme',
      'thumbnailMode',
      'streaming',
      'selectable',
    ];
    /*if (Array.from(changedProperties.keys()).some((k) => watch.includes(k))) {
      this._renderSpec();
    }*/
    if (watch.some((key) => changedProperties.has(key))) {
      this._renderSpec();
    }
  }

  /**
   * connectedCallback - internal LIT change event function
   */
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('mouseenter', () => {
      if (this.selectable) {
        this._hovered = true;
      }
    });
    this.addEventListener('mouseleave', () => {
      this._hovered = false;
    });
  }
  /**
   * invoked to remove chosen user even when not applicable to subchart leaf
   * @param {object} spec - current specification
   */
  /*private _autoDisableEvents(spec: any) {
    if (this.enableZoom && !this._supportsEvent(spec, 'zoom')) {
      this.enableZoom = false;
    }
    if (this.enableBrush && !this._supportsEvent(spec, 'brush')) {
      this.enableBrush = false;
    }
    if (this.enableHover && !this._supportsEvent(spec, 'hover')) {
      this.enableHover = false;
    }
    if (this.enableSelection && !this._supportsEvent(spec, 'select')) {
      this.enableSelection = false;
    }
  }*/

  /**
   * _updateSCSS - internal SCSS injection method
   */
  private _updateSCSS() {
    this.containerWidthString = this.containerWidth || 'auto';
    this.containerHeightString = this.containerHeight || '246px';
    this.style.setProperty(
      '--clabs-chart-element-width',
      this.containerWidthString
    );
    this.style.setProperty(
      '--clabs-chart-element-height',
      this.containerHeightString
    );
  }

  /**
   * _getTheme - find current theme by checking parent background color
   */
  private _getTheme() {
    if (this.parentElement instanceof HTMLElement) {
      const parentStyle = getComputedStyle(this.parentElement);
      const backgroundColor = parentStyle.getPropertyValue('--cds-background');
      const darkMode =
        backgroundColor.startsWith('#') &&
        parseInt(backgroundColor.replace('#', ''), 16) < 0xffffff / 2;
      this._parentTheme = darkMode ? 'g100' : 'white';
    }
  }

  /**
   * Injects or removes the user-provided tooltip CSS into document head.
   */
  private _updateTooltipStyle() {
    const styleId = 'vega-tooltip-style';
    let styleEl = document.head.querySelector(
      `#${styleId}`
    ) as HTMLStyleElement;
    if (this.enableTooltip && this.tooltipCss) {
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = this.tooltipCss;
    } else if (styleEl) {
      styleEl.remove();
    }
  }

  /**
   * applyAutosize - force vega autosizing when applicable
   * @param {object} spec - vegalite specification
   */
  /*private _applyAutosize(spec: any): any {
    spec.autosize = { type: 'fit-x', contains: 'padding' };
    delete spec.height;
    return spec;
  }*/

  /**
   * onClick- set behavior externally for vega click event
   * @param {object} event - click event from parent
   */
  /*private _onClick(event: MouseEvent) {
    if (!this.selectable) {
      return;
    }
    this._selected = true;
    this.dispatchEvent(
      new CustomEvent('on-chart-clicked', {
        detail: { spec: this.originalSpec },
      })
    );
    event.stopPropagation();
  }*/
  /**
   * core spec rendering function to apply to dom spec object
   */
  private async _renderSpec() {
    await this.updateComplete;
    this._loading = true;
    this._error = null;
    this._thumbSrc = null;
    this.requestUpdate();

    let spec: any;
    try {
      spec = this.specObj || JSON.parse(this.specStr || '{}');
    } catch (e: any) {
      if (this.streaming) {
        this.requestUpdate();
        return;
      }
      this._error = 'Invalid JSON spec: ' + e.message;
      this.dispatchEvent(
        new CustomEvent('chart-error', { detail: { error: e.message } })
      );
      this._loading = false;
      this.requestUpdate();
      return;
    }
    //this._autoDisableEvents(spec);

    // Apply theme config only if not using built-in theme
    if (this.enableCarbonStyling && !this.useTheme) {
      spec = this._applyThemeConfig(spec);
    }

    const reservedPadding = 40;
    const innerChartW = Math.max(0, this.clientWidth - 32);
    const innerChartH = Math.floor(
      Math.max(0, this.clientHeight - 32 - reservedPadding)
    );

    spec.config = spec.config || {};
    /*spec.config.legend = {
      ...(spec.config.legend || {}),
      orient: 'bottom',
      columns: Math.max(1, Math.floor(innerChartW / 100)),
      symbolType: 'square',
      symbolStrokeWidth: 0,
    };*/

    /**
     * setSubChartSize - internal chart sizing function
     * @param {object} node - subelement in vega chart
     * @param {number} w - parent width
     * @param {number} h - parent height
     */
    const setSubChartSize = (node: any, w: number, h: number) => {
      if (!node || typeof node !== 'object') {
        return;
      }
      delete node.params;
      const isSpec = 'mark' in node || 'encoding' in node;
      if (isSpec) {
        node.width = w;
        node.height = h;
        return;
      }

      if ('repeat' in node && node.spec) {
        let rows = Array.isArray(spec.repeat.row) ? spec.repeat.row.length : 1;
        const cols = spec.columns
          ? spec.columns
          : Array.isArray(spec.repeat.column)
          ? spec.repeat.column.length
          : 1;
        if (spec.columns) {
          rows = (rows % cols) + 1;
        }
        const childWidth = w / cols - 16 * cols;
        const childHeight = h / rows - 16 * rows;
        console.log(childWidth, childHeight);
        setSubChartSize(node.spec, childWidth, childHeight);
        node.spec.width = childWidth;
        node.spec.height = childHeight;
        console.log(node.spec);
      }

      if (Array.isArray(node.hconcat) || Array.isArray(node.concat)) {
        const arr = Array.isArray(node.hconcat) ? node.hconcat : node.concat;
        const count = arr.length;
        const cellW = w / count;
        const cellH = h;
        arr.forEach((child: any) => setSubChartSize(child, cellW, cellH));
        return;
      }
      if (Array.isArray(node.vconcat)) {
        const arr = node.vconcat;
        const cellW = w;
        const cellH = h / arr.length;
        arr.forEach((child: any) => setSubChartSize(child, cellW, cellH));
      }
      if (Array.isArray(node.layer)) {
        node.layer.forEach((child: any) => setSubChartSize(child, w, h));
      }
      if (node.facet && node.facet.spec) {
        const fSpec = node.facet;
        let cols = 1;
        let rows = 1;
        if (fSpec.column && Array.isArray(fSpec.column.field)) {
          cols = fSpec.column.field.length;
        }
        if (fSpec.row && Array.isArray(fSpec.row.field)) {
          rows = fSpec.row.field.length;
        }
        const cellH = h / rows;
        const cellW = w / cols;
        setSubChartSize(node.facet.spec, cellW, cellH);
        node.facet.spec.width = cellW;
        node.facet.spec.height = cellH;
        return;
      }

      /*[
        'layer',
        'hconcat',
        'vconcat',
        'concat',
        'spec',
        'facet',
        'repeat',
      ].forEach((k) => {
        if (Array.isArray(node[k])) {
          node[k].forEach((child: any) => setSubChartSize(child, w, h));
        } else if (k === 'facet' && node.facet?.spec) {
          setSubChartSize(node.facet.spec, w, h);
        } else if (k === 'repeat' && node.repeat?.spec) {
          setSubChartSize(node.repeat.spec, w, h);
        }
      });

      if (node.facet?.spec) {
        setSubChartSize(node.facet.spec);
      } else if (node.repeat && node.spec) {
        setSubChartSize(node.spec);
      }*/
    };
    const isComposed = [
      'layer',
      'hconcat',
      'vconcat',
      'concat',
      'facet',
      'repeat',
    ].some((k) => !!spec[k]);

    if (isComposed) {
      console.log(innerChartW, innerChartH);
      console.log(spec);
      setSubChartSize(spec, innerChartW, innerChartH);
      console.log(spec);
      spec.autosize = { type: 'fit', contains: 'padding' };
      delete spec.width;
      delete spec.height;
      console.log(spec);
      spec.height = innerChartH;
      spec.width = innerChartW;
    } else {
      console.log('SIZE: ' + innerChartW + ' ' + innerChartH);
      if (innerChartW > 0) {
        spec.width = innerChartW;
      }
      if (innerChartH > 0) {
        spec.height = innerChartW;
      }
      spec.autosize = { type: 'fit-x', contains: 'padding' };
      delete spec.width;
      delete spec.height;
      spec.height = innerChartH - 100;
      spec.width = innerChartW;
    }

    //spec = this._applyLegendPosition(this._cleanSelectionDefs(spec));
    if (!this.thumbnailMode) {
      spec = this._applyParamDefs(spec);
    }

    const container = this.shadowRoot?.querySelector(
      '#chart_' + this._uniqueID
    ) as HTMLElement;
    if (!container) {
      return;
    } else {
      container.innerHTML = '';
    }
    // Build embed options
    const opts: EmbedOptions = {
      renderer: 'canvas',
      actions: false,
      tooltip: this.enableTooltip,
      theme: this.useTheme || undefined,
    };
    if (this.thumbnailMode) {
      spec.width = 800;
      spec.height = 800;
    }

    //try {
    const embedResult: VegaEmbedResult = await embed(container, spec, opts);
    this._view = embedResult.view;
    this.originalSpec = spec;
    if (!this.thumbnailMode) {
      //this._attachSelectionListeners();
      this._attachParamListeners();
    }
    this.carbonSpec = spec;
    if (this.thumbnailMode) {
      await this._view
        .toImageURL('png')
        .then((_uri) => {
          this._thumbSrc = _uri;
          this._view.finalize();
          this.dispatchEvent(
            new CustomEvent('on-chart-thumbnail-generated', {
              detail: { image: _uri },
            })
          );
        })
        .catch((e) => {
          console.warn(e);
        });
    }

    this.dispatchEvent(
      new CustomEvent('chart-render-success', { detail: { spec } })
    );
    /*} catch (err: any) {
      this._error = 'Vega-Lite render error: ' + err.message;
      this.dispatchEvent(new CustomEvent('on-chart-error', { detail: { error: err.message } }));
    }*/

    this._loading = false;
    this.requestUpdate();
  }

  /** _applyThemeConfig - applying themes to correct sub configs
   * @param {object} spec - core specification
   */
  private _applyThemeConfig(spec: any): any {
    const baseConfig = this._getThemeConfigByParent();
    /**
     * mergeChartNode - sub vega element merging function
     * @param {object} node - vega node subelement
     */
    const mergeChartNode = (node: any) => {
      if (node == null || typeof node !== 'object') {
        return;
      }

      const isValidSpec =
        'mark' in node ||
        'encoding' in node ||
        'layer' in node ||
        'hconcat' in node ||
        'vconcat' in node ||
        'concat' in node ||
        'facet' in node ||
        'repeat' in node;
      if (isValidSpec) {
        node.config = { ...baseConfig, ...(node.config || {}) };
      }
      ['layer', 'hconcat', 'vconcat', 'concat', 'facet', 'repeat'].forEach(
        (k) => {
          if (Array.isArray(node[k])) {
            node[k].forEach((child: any) => mergeChartNode(child));
          } else if (k === 'facet' && node.facet?.spec) {
            mergeChartNode(node.facet.spec);
          }
        }
      );
    };
    mergeChartNode(spec);
    return spec;
  }

  /**
   * _getThemeConfigByParent - get system config object and place it in relevant vega subspecs
   */
  private _getThemeConfigByParent(): any {
    //if (this._parentTheme === 'dark') return { ...this._themeConfig, background: '#333', text: { color: '#fff' } };

    return this._prepareConfig(); //this._themeConfig;
  }

  /**
   * _prepareConfig - edit and force IBM Carbon styling onto current subelement
   */
  private _prepareConfig() {
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

    if (this._parentTheme == 'white') {
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

    //if (this.enableCarbonStyling) {
    /*let colorScale: any[] = [];

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
      }*/
    /*let titleOffset = -8;
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
      }*/
    const titleOffset = 2;
    const newConfig = {
      background: backgroundColor,
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
      line: { interpolate: 'monotone' },
      mark: { tooltip: this.enableTooltip },
      axisBottom: {
        domainColor: axisColor,
        labelColor: labelColor,
        titleColor: textColor,
        tickColor: backgroundColor,
        labelOverlap: 'greedy',
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
        labelOverlap: 'greedy',
        titleFont: defaultFont,
        titleFontWeight: 400,
      },
      axisLeft: {
        domainColor: axisColor,
        labelColor: labelColor,
        titleColor: textColor,
        labelOverlap: 'greedy',
        tickColor: backgroundColor,
        titlePadding: 4,
        titleFont: defaultFont,
        titleFontWeight: 400,
      },
      axisRight: {
        domainColor: gridColor,
        labelColor: labelColor,
        titleColor: textColor,
        labelOverlap: 'greedy',
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
        diverging: quantitativeColors,
      },
      legend: {
        direction: 'horizontal',
        symbolType: 'square',
        //labelLimit: { signal: 'max(100, width * 0.25)' },
        //columns: { signal: 'floor(width / 150)' },
        symbolSize: 256,
        //rowPadding: { signal: '12' },
        orient: 'bottom',
        symbolOpacity: 1,
        titleColor: labelColor,
        titlePadding: 16,
        labelColor: labelColor,
        titleFont: defaultFont,
        labelFont: defaultFont,
        labelOffset: 4,
        padding: 10,
        titleFontSize: 11,
        labelFontSize: 12, //fillOpacity: 1,
        strokeWidth: 1, //fontWeight: 'bold',
        offset: 20,
        gradientLength: { signal: 'width - 32' },
        gradientThickness: 16,
        gradientLabelOffset: 16,
      },
    };

    //custom submarks
    newConfig['boxplot'] = {
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
    newConfig['point'] = {
      fillOpacity: 1.0,
      size: 40,
      strokeOpacity: 1.0,
      strokeWidth: 1.0,
      filled: true,
    };
    newConfig['square'] = {
      fillOpacity: 1.0,
      size: 40,
      strokeOpacity: 1.0,
      strokeWidth: 1.0,
      filled: true,
    };

    newConfig['circle'] = {
      fillOpacity: 1.0,
      size: 40,
      strokeOpacity: 1.0,
      strokeWidth: 1.0,
      filled: true,
    };
    newConfig['bar'] = { discreteBandSize: 12 };

    newConfig['geoshape'] = {
      grid: false,
      range: {
        sequential: {
          scheme: [gradientColorBottom, gradientColorTop],
        },
      },
      color: backgroundColor,
      fillColor: backgroundColor,
    };

    newConfig['arc'] = {
      stroke: gridColor,
      strokeWidth: 1,
    };
    newConfig['text'] = {
      color: textColor,
    };

    /*let isOrdinal: boolean;
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
          //this._authorizeMultiSelection = false;
          break;
        case 'tick':
          isOrdinal = false;
          //this._authorizeMultiSelection = false;
          break;
        case 'line':
          if (spec['mark']) {
            spec['mark']['point'] = { filled: true };
          }
          isOrdinal = false;
          break;
        case 'text':
          isOrdinal = false;
          //this._authorizeMultiSelection = false;
          spec['encoding']['color'] = textColor;
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
          //this._authorizeSingleSelection = false;
          //this._authorizeMultiSelection = false;
          break;
        case 'area':
          isOrdinal = false;
          break;
        case 'rule':
          isOrdinal = false;
          //this._authorizeMultiSelection = false;
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

        //this._addInteractions(spec, 'point');
      }*/
    //}

    return newConfig;
  }

  /**
   * _cleanSelectionDefs - remove all external definitions that could cause conflicts if present
   * @param {object} spec - core specification
   */
  /*private _cleanSelectionDefs(spec: any): any {
    if (spec.selection) {
      const allowed = {
        zoom: this.enableZoom && this._supportsEvent(spec, 'zoom'),
        brush: this.enableBrush && this._supportsEvent(spec, 'brush'),
        select: this.enableSelection && this._supportsEvent(spec, 'select'),
        hover: this.enableHover && this._supportsEvent(spec, 'hover'),
        legend: this.enableLegendSelection,
      };
      const filteredSelections = {};
      for (const [k, v] of Object.entries(spec.selection)) {
        if (allowed[k]) filteredSelections[k] = v;
      }
      spec.selection = filteredSelections;

      if (spec.resolve?.selection) {
        const filteredResolvedSelections = {};
        for (const [k, v] of Object.entries(spec.resolve.selection)) {
          if (allowed[k]) filteredResolvedSelections[k] = v;
        }

        spec.resolve.selection = filteredResolvedSelections;
      }
    }
    return spec;
  }*/
  /**
   * _applySelectionDefs2 - old function to apply all new event definitions
   * @param {object} spec - core specification
   */
  // @ts-ignore
  private _applySelectionDefs2(spec: any): any {
    const defs: Record<string, any> = {};
    if (this.enableZoom && this._supportsEvent(spec, 'zoom')) {
      defs.zoom = {
        type: 'interval',
        on: '[mousedown[keydown.shift], window:mouseup] > window.mousemove!',
        translate:
          '[mousedown[keydown.shift, window:mouseup] > window.mousemove!',
        bind: 'scales',
      };
    }
    if (this.enableBrush && this._supportsEvent(spec, 'brush')) {
      defs.brush = {
        type: 'interval',
        on: '[mousedown, window:mouseup] > window.mousemove!',
      };
    }
    if (this.enableSelection && this._supportsEvent(spec, 'select')) {
      defs.select = { type: 'single', on: 'click', empty: 'none' };
    }
    if (this.enableHover && this._supportsEvent(spec, 'hover')) {
      defs.hover = { type: 'single', on: 'mouseover', empty: 'none' };
    }
    if (this.enableLegendSelection) {
      defs.legend = { type: 'multi', bind: 'legend' };
    }

    if (Object.keys(defs).length) {
      spec.selection = { ...(spec.selection || {}), ...defs };
      const composite = [
        'layer',
        'hconcat',
        'vconcat',
        'concat',
        'facet',
        'repeat',
      ].some((k) => !!spec[k]);

      if (composite) {
        const resolve = { ...(spec.resolve || {}) };

        const resolvedSelections = {};
        for (const k of Object.keys(defs)) {
          resolvedSelections[k] = 'union';
        }
        resolve.selection = resolvedSelections;
        resolve.scale = {
          ...(resolve.scale || {}),
          x: 'independent',
          y: 'independent',
        };
        spec.resolve = resolve;
      }
    }
    return spec;
  }

  /**
   * Check if legend
   * @param {object} node - vega subnode element
   */
  private _legendHeight(node: any): number {
    if (!node || typeof node !== 'object') {
      return 0;
    }
    const legendItemHeight = 28;
    const legendTitleHeight = 22;
    let maxLegendHeight = 0;
    if (node.encoding) {
      for (const key of Object.keys(node.encoding)) {
        const enc: any = node.encoding[key];
        if (
          enc &&
          typeof enc === 'object' &&
          'legend' in enc &&
          enc.legend !== null &&
          enc.legend !== false
        ) {
          let nValues = 0;
          const scale = enc.scale;
          const bin = enc.bin;
          const type = enc.type;
          const field = enc.field;
          if (scale && Array.isArray(scale.domain)) {
            nValues = scale.domain.length;
          } else if (bin || (type && type === 'quantitative')) {
            nValues = 5;
          } else if (node.data && Array.isArray(node.data.values) && field) {
            nValues = new Set(node.data.values.map((d: any) => d[field])).size;
          }
          if (!nValues) {
            nValues = 4;
          }
          const hasTitle = enc.legend && enc.legend.title;
          let _subLegendHeight = nValues * legendItemHeight;
          if (hasTitle) {
            _subLegendHeight += legendTitleHeight;
          }
        }
      }
    }

    for (const k of ['sepc', 'layer', 'hconcat', 'vconcat', 'concat']) {
      const v = node[k];
      if (Array.isArray(v)) {
        v.forEach((child) => {
          maxLegendHeight = Math.max(
            maxLegendHeight,
            this._legendHeight(child)
          );
        });
      } else if (v && typeof v === 'object') {
        maxLegendHeight = Math.max(maxLegendHeight, this._legendHeight(v));
      }
    }
    if (node.facet?.spec) {
      maxLegendHeight = Math.max(
        maxLegendHeight,
        this._legendHeight(node.facet.spec)
      );
    }
    if (node.repeat?.spec) {
      maxLegendHeight = Math.max(
        maxLegendHeight,
        this._legendHeight(node.repeat.spec)
      );
    }
    return maxLegendHeight;
  }

  /**
   * Recursively strips out any pre-existing `selection`, `params`,
   * `resolve.selection`, transforms, projections, and encoding conditions.
   * @param {object} node - vega subnode element
   */
  private _removeOldDefs(node: any): void {
    if (!node || typeof node !== 'object') {
      return;
    }
    delete node.selection;
    delete node.params;
    if (node.resolve?.selection) {
      delete node.resolve.selection;
    }
    /*if (Array.isArray(node.transform)) {
      node.transform = node.transform.filter((trans: any) => {
        !('param' in trans) && !('selection' in trans);
      });
      if (node.transform.length === 0) delete node.transform;
    }*/
    //if (node.projection) delete node.projection;
    if (node.encoding) {
      Object.values(node.encoding).forEach((enc: any) => {
        if (enc?.condition && 'condition' in enc) {
          delete enc.condition;
        }
      });
    }
    for (const k in node) {
      const v = node[k];
      if (Array.isArray(v)) {
        v.forEach((c) => this._removeOldDefs(c));
      } else if (v && typeof v === 'object') {
        this._removeOldDefs(v);
      }
    }
  }
  /*
  private _removeOldEvents(node:any){
    if(!node && typeof node !== 'object') return;
    delete node.selection;
    delete node.params;
    if(node.resolve && node.resolve.selection){
      delete node.resolve.selection;
    }
    for(const key in node){
      const val = node[key];
      if(Array.isArray(val)){
        val.forEach(el => this._removeOldEvents(el))
      }else if(val && typeof val === 'object'){
        this._removeOldEvents(val);
      }
    }
  }*/

  /**
   * _applyParamDefs - function to apply all parametric event definitions
   * @param {object} spec - core specification
   */
  private _applyParamDefs(spec: any): any {
    this._removeOldDefs(spec);
    const params: any[] = [];

    if (this.enableBrush && this._supportsEvent(spec, 'brush')) {
      params.push({
        name: 'brush',
        select: {
          type: 'interval',
          on: '[mousedown[!event.shiftKey], window:mouseup] > window.mousemove!',
        },
      });
    }
    if (this.enableZoom && this._supportsEvent(spec, 'zoom')) {
      params.push({
        name: 'zoom',
        select: {
          type: 'interval',
          on: '[mousedown[keydown.shift], window:mouseup] > window.mousemove!',
          bind: 'scales',
        },
      });
    }
    if (this.enableSelection && this._supportsEvent(spec, 'select')) {
      params.push({
        name: 'select',
        select: { type: 'point', on: 'click', clear: 'none' },
      });
    }
    if (this.enableHover && this._supportsEvent(spec, 'hover')) {
      params.push({
        name: 'hover',
        select: { type: 'point', on: 'mouseover', clear: 'none' },
      });
    }
    if (this.enableLegendSelection) {
      params.push({
        name: 'legend',
        select: { type: 'point', bind: 'legend' },
      });
    }
    if (params.length) {
      //spec.selection = { ...(spec.selection || {}), ...defs };
      spec.params = params; //[...(spec.params || []), ...params];
      const composite = [
        'layer',
        'hconcat',
        'vconcat',
        'concat',
        'facet',
        'repeat',
      ].some((k) => !!spec[k]);

      if (composite) {
        const resolve = spec.resolve || {};
        const resolvedParams = {};
        for (const p of params) {
          resolvedParams[p.name] = 'union';
        }
        resolve.selection = resolvedParams;
        resolve.scale = {
          ...(resolve.scale || {}),
          x: 'independent',
          y: 'independent',
        };
        spec.resolve = resolve;
      }
    }
    return spec;
  }

  /**
   * Attaches listeners for each defined param, dispatching
   * `vega-selection` events with name, value, and English summary.
   */
  private _attachParamListeners(): void {
    if (!this._view) {
      return;
    }
    const compositionTypes: string[] = [
      'zoom',
      'brush',
      'select',
      'hover',
      'legend',
    ];
    compositionTypes.forEach((name) => {
      const upperName = name.charAt(0).toUpperCase() + name.slice(1);
      const flag = `enable${upperName}`;
      if ((this as any)[flag] && this._supportsEvent(this.originalSpec, name)) {
        this._view.addSignalListener(name, (_: string, val: any) => {
          const eng = this._describeParam(name, val);
          this.dispatchEvent(
            new CustomEvent('vega-selection', {
              detail: { name, value: val, english: eng },
            })
          );
        });
      }
    });
  }

  /*
  private _applySelectionDefs(spec: any): any {
    const defs= [];
    if (this.enableZoom && this._supportsEvent(spec, 'zoom'))
      defs.push({"name":"zoom","selection":{
        type: 'interval',
        on: '[mousedown[keydown.shift], window:mouseup] > window.mousemove!',
        translate:
          '[mousedown[keydown.shift, window:mouseup] > window.mousemove!',
        bind: 'scales',
      }});
    if (this.enableBrush && this._supportsEvent(spec, 'brush'))
      defs.push({"name":"brush","selection":{
        type: 'interval',
        on: '[mousedown, window:mouseup] > window.mousemove!',
      }});
    if (this.enableSelection && this._supportsEvent(spec, 'select'))
      defs.push({"name":"select","selection":{ type: 'single', on: 'click', empty: 'none' }});
    if (this.enableHover && this._supportsEvent(spec, 'hover'))
      defs.push({"name":"hover","selection":{ type: 'single', on: 'mouseover', empty: 'none' }});
    if (this.enableLegendSelection)
      defs.push({"name":"legend","selection":{ type: 'multi', bind: 'legend' }});
    
    if (Object.keys(defs).length) {
      //spec.selection = { ...(spec.selection || {}), ...defs };
      spec.params = defs;
      const composite = [
        'layer',
        'hconcat',
        'vconcat',
        'concat',
        'facet',
        'repeat',
      ].some((k) => !!spec[k]);

      if (composite) {
        const resolve = { ...(spec.resolve || {}) };
        resolve.selection = Object.fromEntries(
          Object.keys(defs).map((k) => [k, 'union'])
        );
        resolve.scale = {
          ...(resolve.scale || {}),
          x: 'independent',
          y: 'independent',
        };
        spec.resolve = resolve;
      }
    }
    return spec;
  }*/

  /**
   * _applyLegendPosition - function to apply all legend definitions
   * @param {object} spec - core specification
   */
  // @ts-ignore
  private _applyLegendPosition(spec: any): any {
    /**
     * setLegend - apply legend system
     * @param {object} node - subelement
     */
    const setLegend = (node: any) => {
      if (node.encoding) {
        Object.values(node.encoding).forEach(
          (e: any) => e.legend && (e.legend.orient = 'bottom')
        );
      }
      if (node.config?.legend) {
        node.config.legend.orient = 'bottom';
      }
      ['layer', 'hconcat', 'vconcat', 'concat', 'facet', 'repeat'].forEach(
        (k) => {
          if (Array.isArray(node[k])) {
            node[k].forEach(setLegend);
          } else if (k === 'facet' && node.facet?.spec) {
            setLegend(node.facet.spec);
          }
        }
      );
    };
    setLegend(spec);
    return spec;
  }
  /**
   * _supportsEvent - check if event to be applied is suspported by subspec
   * @param {object} spec - core specification
   * @param {string} evt - event name
   */
  private _supportsEvent(spec: any, evt: string): boolean {
    if (evt === 'legend') {
      return true;
    }
    const marks = this._findUnitMarks(spec);
    const blacklist = this._eventBlacklist[evt] || [];
    return marks.every((m) => !blacklist.includes(m));
  }
  /**
   * _findUnitMarks - check if mark type supports and can be applied to
   * @param {object} spec - core specification
   * @param {string[]} marks - mark list
   */
  private _findUnitMarks(spec: any, marks: string[] = []): string[] {
    if (spec.mark) {
      const m = typeof spec.mark === 'string' ? spec.mark : spec.mark.type;
      marks.push(m);
    }
    ['layer', 'hconcat', 'vconcat', 'concat', 'facet', 'repeat'].forEach(
      (k) => {
        if (Array.isArray(spec[k])) {
          spec[k].forEach((c: any) => this._findUnitMarks(c, marks));
        } else if (k === 'facet' && spec.facet?.spec) {
          this._findUnitMarks(spec.facet.spec, marks);
        }
      }
    );
    return marks;
  }

  /**
   * Recursively processes spec: cleanup, theme merge, param injection,
   * legend config, and sizing for all composites/units.
   * @param {object} spec - vega spec
   * @param {number} w - sub width
   * @param {number} h - sub height
   */
  // @ts-ignore
  private _processSpec(spec: any, w: number, h: number): any {
    const cleaned = this._applyParamDefs(spec);

    /**
     * sizeNode - size subnode element
     * @param {object} node - vega node subspec
     * @param {number} W - sub width
     * @param {number} H - sub height
     */
    const sizeNode = (node: any, W: number, H: number) => {
      if (!node || typeof node !== 'object') {
        return;
      }
      if ('mark' in node || 'encoding' in node) {
        let finalHeight = H;
        finalHeight += this._legendHeight(node);
        node.width = W;
        node.height = finalHeight;
        return;
      }
      // repeat, hconcat, vconcat, layer, facet cases same as above...
      // (Use the same logic from _applyParamDefs snippet)
    };

    // Determine composite
    const isComposite = [
      'layer',
      'hconcat',
      'vconcat',
      'concat',
      'facet',
      'repeat',
    ].some((k) => !!cleaned[k]);

    // Apply sizing
    if (isComposite) {
      sizeNode(cleaned, w, h);
      cleaned.autosize = { type: 'fit', contains: 'padding' };
      delete cleaned.width;
      delete cleaned.height;
    } else {
      if (w > 0) {
        cleaned.width = w;
      }
      if (h > 0) {
        cleaned.height = h;
      }
      cleaned.autosize = { type: 'fit-x', contains: 'padding' };
      delete cleaned.height;
    }
    return cleaned;
  }

  /*
  private _attachParamListeners(): void {
    if (!this._view) return;
    ['zoom', 'brush', 'select', 'hover', 'legend'].forEach((evt) => {
      if (
        (this as any)[`enable${evt.charAt(0).toUpperCase() + evt.slice(1)}`] &&
        this._supportsEvent(this.originalSpec, evt)
      ) {
        try{
        this._view.addSignalListener(evt, (_: string, val: any) => {
          const readableDescription = this._describeSelection(evt, val);
          const selectionEvent = new CustomEvent('clabs-chart-vega-selection', {
              detail: { name: evt, value: val, english },
            })

          this.dispatchEvent(
           selectionEvent
          );
        });
        }catch(e){
          console.log(e.message)
        }
      }
    });
  }*/

  /**
   * _attachSelectionListeners - apply listeners for pre-selected purged subevents
   */
  // @ts-ignore
  private _attachSelectionListeners(): void {
    if (!this._view) {
      return;
    }
    ['zoom', 'brush', 'select', 'hover', 'legend'].forEach((evt) => {
      if (
        (this as any)[`enable${evt.charAt(0).toUpperCase() + evt.slice(1)}`] &&
        this._supportsEvent(this.originalSpec, evt)
      ) {
        try {
          this._view.addSignalListener(evt, (_: string, val: any) => {
            const english = this._describeSelection(evt, val);
            const selectionEvent = new CustomEvent(
              'clabs-chart-vega-selection',
              {
                detail: { name: evt, value: val, english },
              }
            );

            this.dispatchEvent(selectionEvent);
          });
        } catch (e: any) {
          console.log(e.message);
        }
      }
    });
  }

  /**
   * _describeSelection - return string when an event has occured, both selection(s) and a LLm readable string
   * @param {string} name - event name type
   * @param {object} value - array of selections
   */
  private _describeSelection(name: string, value: any): string {
    if (name === 'zoom' || name === 'brush') {
      const parts: string[] = [];
      if (value.x) {
        parts.push(`x between ${value.x[0]} and ${value.x[1]}`);
      }
      if (value.y) {
        parts.push(`y between ${value.y[0]} and ${value.y[1]}`);
      }
      return `Interval selection "${name}": ${parts.join(', ')}`;
    } else if (Array.isArray(value)) {
      return `Selection "${name}": ${value.length} items selected`;
    } else if (value.fields) {
      return `Selection "${name}": fields ${value.fields.join(', ')}`;
    }
    return `Selection "${name}": ${JSON.stringify(value)}`;
  }

  /**
   * _describeParam - return string when an event has occured, both selection(s) and a LLm readable string
   * @param {string} name - event name type
   * @param {object} value - array of selections
   */
  private _describeParam(name: string, value: any): string {
    if (name === 'zoom' || name === 'brush') {
      const parts: string[] = [];
      if (value.x) {
        parts.push(`x between ${value.x[0]} and ${value.x[1]}`);
      }
      if (value.y) {
        parts.push(`y between ${value.y[0]} and ${value.y[1]}`);
      }
      return `Interval selection "${name}": ${parts.join(', ')}`;
    } else if (Array.isArray(value)) {
      return `Selection "${name}": ${value.length} items selected`;
    } else if (value.fields) {
      return `Selection "${name}": fields ${value.fields.join(', ')}`;
    }
    return `Selection "${name}": ${JSON.stringify(value)}`;
  }

  /**
   * _resizeChart - core resizing trigger fucntion
   */
  private _resizeChart() {
    if (!this.thumbnailMode) {
      if (this._view) {
        try {
          //this._view.resize();
          //this._view.run();
          this._renderSpec();
        } catch {
          console.error('resize failed');
        }
      }
    }
  }
  /**
   * external fullscreen toggle event
   */
  // @ts-ignore
  private _toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.shadowRoot?.host.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  /**
   * _openEditorView -
   */
  /*private _exportPreSpec() {
    this.showModal = true;
    const vegaURL = 'https://vega.github.io/editor/';
    const openNewWindow = window?.open(vegaURL, '_blank');
    if (openNewWindow) {
      setTimeout(() => {
        const specPayload = this.specObj;
        const payload = {
          spec: JSON.stringify(specPayload, null, '\t'),
          mode: 'vega-lite',
        };

        openNewWindow.postMessage(payload, '*');
      }, 500);
    } else {
      console.log('window is undefined');
    }
  }*/

  /**
   * _openEditorView -
   */
  // @ts-ignore
  private _exportSpec() {
    this.showModal = true;
    const vegaURL = 'https://vega.github.io/editor/';
    const openNewWindow = window?.open(vegaURL, '_blank');
    if (openNewWindow) {
      setTimeout(() => {
        const specPayload = this.carbonSpec;
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
}
