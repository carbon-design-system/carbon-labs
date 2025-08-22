/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
const { stablePrefix: clabsPrefix } = settings;
import mermaid from 'mermaid';

// @ts-ignore
import coreStyles from './diagramElement.scss?inline';

/**
 * Input component using search typeahead api
 */
export default class diagramElement extends LitElement {
  static styles = [
    coreStyles,
    css`
      g.cluster text.label {
        width: 100% !important;
        box-sizing: border-box !important;
        text-anchor: start !important;
        font-weight: bold !important;
        padding: 6px 12px !important;
      }
      p {
        color: #1b1b1b;
      }
      .G50 {
        background-color: $green-50;
        border: 2px solid $green-60;
      }

      .P50 {
        background-color: $purple-50;
        border: 2px solid $purple-60;
      }

      .B60 {
        background-color: $blue-60;
        border: 2px solid $blue-70;
      }

      .R50 {
        background-color: $red-50;
        border: 2px solid $red-60;
      }

      .M50 {
        background-color: $magenta-50;
        border: 2px solid $magenta-60;
      }

      .CG50 {
        background-color: $gray-50;
        border: 2px solid $gray-60;
      }

      .T50 {
        background-color: $teal-50;
        border: 2px solid $teal-60;
      }

      .T70 {
        background-color: $teal-70;
        border: 2px solid $teal-80;
      }

      .C50 {
        background-color: $cyan-50;
        border: 2px solid $cyan-60;
      }

      .CG60 {
        background-color: $gray-60;
        border: 2px solid $gray-70;
      }

      .B {
        background-color: $black;
        border: 2px solid $black;
      }

      .node.G50 rect,
      .node.G50 circle {
        fill: $green-50;
        stroke: $green-60;
      }

      .node.P50 rect,
      .node.P50 circle {
        fill: $purple-50;
        stroke: $purple-60;
      }

      .node.B60 rect,
      .node.B60 circle {
        fill: $blue-60;
        stroke: $blue-70;
      }

      .node.R50 rect,
      .node.R50 circle {
        fill: $red-50;
        stroke: $red-60;
      }

      .node.M50 rect,
      .node.M50 circle {
        fill: $magenta-50;
        stroke: $magenta-60;
      }

      .node.CG50 rect,
      .node.CG50 circle {
        fill: $gray-50;
        stroke: $gray-60;
      }

      .node.T50 rect,
      .node.T50 circle {
        fill: $teal-50;
        stroke: $teal-60;
      }

      .node.T70 rect,
      .node.T70 circle {
        fill: $teal-70;
        stroke: $teal-80;
      }

      .node.C50 rect,
      .node.C50 circle {
        fill: $cyan-50;
        stroke: $cyan-60;
      }

      .node.CG60 rect,
      .node.CG60 circle {
        fill: $gray-60;
        stroke: $gray-70;
      }

      .node.B rect,
      .node.B circle {
        fill: $black;
        stroke: $black;
      }

      path {
        stroke: #4c4c4c;
        stroke-width: 2px;
      }
      g.cluster#PublicNet > text.label {
        border-left: 5px solid #0f62fe !important;
      }
      g.cluster#IBMCloud > text.label {
        border-left: 5px solid #0f62fe !important;
      }
      g.cluster#Account > text.label {
        border-left: 5px solid #161616 !important;
      }
      g.cluster#RegionA > text.label {
        border-left: 5px solid #161616 !important;
      }
      g.cluster#VPC1 > text.label {
        border-left: 5px solid #0f62fe !important;
      }
      g.cluster#Zone1 > text.label {
        border-left: 5px solid #6f6f6f !important;
      }
      g.cluster#Subnet1 > text.label {
        border-left: 5px solid #42be65 !important;
      }
      g.cluster#SG1 > text.label {
        border-left: 5px solid #fa4d56 !important;
      }
      g.cluster#RG1 > text.label {
        border-left: 5px solid #6f6f6f !important;
      }
      g.cluster#Zone1VPN > text.label {
        border-left: 5px solid #6f6f6f !important;
      }
      g.cluster#Subnet2 > text.label {
        border-left: 5px solid #42be65 !important;
      }
      g.cluster#SG2 > text.label {
        border-left: 5px solid #fa4d56 !important;
      }
      g.cluster#IG1 > text.label {
        border-left: 5px solid #6f6f6f !important;
      }
      g.cluster#Zone2 > text.label {
        border-left: 5px solid #6f6f6f !important;
      }
      g.cluster#Subnet3 > text.label {
        border-left: 5px solid #42be65 !important;
      }
      g.cluster#Subnet4 > text.label {
        border-left: 5px solid #42be65 !important;
      }
      g.cluster#EnterpriseNet > text.label {
        border-left: 5px solid #0f62fe !important;
      }

      g.node foreignObject img {
        width: 48px !important;
        height: 48px !important;
      }

      g.node#User rect,
      g.node#User ellipse,
      g.node#Internet rect,
      g.node#Internet ellipse,
      g.node#VPN rect,
      g.node#VPN ellipse,
      g.node#PG1 rect,
      g.node#PG1 ellipse,
      g.node#VG1 rect,
      g.node#VG1 ellipse,
      g.node#VSI1 rect,
      g.node#VSI1 ellipse,
      g.node#VSI2 rect,
      g.node#VSI2 ellipse,
      g.node#VSI3 rect,
      g.node#VSI3 ellipse,
      g.node#VSI4 rect,
      g.node#VSI4 ellipse,
      g.node#PLB rect,
      g.node#PLB ellipse,
      g.node#PVTLB rect,
      g.node#PVTLB ellipse,
      g.node#EUD rect,
      g.node#EUD ellipse,
      g.node#EUSR rect,
      g.node#EUSR ellipse,
      g.node#EAPP rect,
      g.node#EAPP ellipse,
      g.node#EDATA rect,
      g.node#EDATA ellipse {
        fill: transparent !important;
        stroke: none !important;
      }
      .nodeLabel {
        display: block;
        width: 500px;
      }
    `,
  ];

  /**
   * Array of subelements parsed from API reply
   */
  @property({ type: String, attribute: 'definition' })
  definition;

  /**
   * Title to be displayed top-left
   */
  @property({ type: String, attribute: 'title' })
  title;

  /**
   * width - preassigned width from parent
   */
  @property({ type: Number, attribute: 'width' })
  width;

  /**
   * height - preassigned height from parent
   */
  @property({ type: Number, attribute: 'height' })
  height;

  /**
   * theme - specified by user or auto-generated from context
   */
  @property({ type: String, attribute: 'theme' })
  theme;

  /**
   * streaming - denotes if content is being streamed in and incomplete
   */
  @property({ type: Boolean, attribute: 'streaming' })
  streaming;

  /**
   * Thumbnail mode
   */
  @property({ type: Boolean, attribute: 'thumbnail-mode' })
  thumbNailMode;

  /**
   * Thumbnail mode
   */
  @property({ type: Boolean, attribute: 'architecture-diagram-mode' })
  archDiagramMode;

  /**
   * is the component hovered upon
   */
  @state()
  isHovered = false;

  /**
   * uniqueID - unique ID egenrated in this component to target correct div when rendering
   */
  @state()
  _uniqueID;

  /**
   * renderSuccessful - flag when a render operation has succeeded to begin post-hoc editing
   */
  @state()
  renderSuccessful = false;

  /**
   * loading - initial state to show loading icon until error or successful render occurs
   */
  @state()
  loading = true;

  @state()
  renderedSVG;

  @state()
  _diagramRenderer;

  @state()
  fullscreenMode;

  @state()
  prependStyling;

  @state()
  appendStyling;

  //private mutationObserver;

  /** detect when component is rendered to process visualization specification object
   */
  firstUpdated() {
    this.generateUniqueId();
    this._getTheme();
    const options: any = this._buildOptions();
    this._diagramRenderer = mermaid.initialize(options);

    if (this.width) {
      this.style.setProperty('--chat-diagram-width', this.width + 'px');
    }

    if (this.height) {
      this.style.setProperty('--chat-diagram-height', this.height + 'px');
    }

    /*this.mutationObserver = new MutationObserver(() => {
      this._getTheme();
    });
    this.mutationObserver.observe(this.parentElement, { childList: false });*/
  }

  /** _buildOptions
   * @param {String} mode - fullscreen, test or default
   */
  _buildOptions() {
    const mermaidClassDefs = `
classDef G50 fill:#24a148,stroke:#198038,stroke-width:2px;
classDef P50 fill:#a56eff,stroke:#8a3ffc,stroke-width:2px;
classDef R50 fill:#fa4d56,stroke:#da1e28,stroke-width:2px;
classDef CG50 fill:#A8A8A8,stroke:#8D8D8D,stroke-width:2px;
classDef B60 fill:#0f62fe,stroke:#0043ce,stroke-width:2px;
classDef M50 fill:#da1eeb,stroke:#a56eff,stroke-width:2px;
classDef B fill:#000000,stroke:#000000,stroke-width:2px;
classDef C50 fill:#00bfa5,stroke:#006f5f,stroke-width:2px;
classDef T50 fill:#00b8d9,stroke:#005d6b,stroke-width:2px;
classDef T70 fill:#007d9a,stroke:#005d6b,stroke-width:2px;
classDef CG60 fill:#697077,stroke:#4d5358,stroke-width:2px;
`;

    if (this.archDiagramMode) {
      this.prependStyling =
        '%%{init:{ flowChart:{ curve:"stepBefore", "htmlLabels":true,"useMaxWidth":true}}}%%\n';
      this.appendStyling = '\n' + mermaidClassDefs;
    } else {
      this.prependStyling = '';
      this.appendStyling = '';
    }
    /*const whiteTheme = {
      primaryColor: '#a6c8ff',
      primaryBorderColor: '#0f62fe',
      primaryTextColor: '#161616',
      secondaryColor: '#f4f4f4',
      secondaryBorderColor: '#e0e0e0',
      secondaryTextColor: '#525252',
      edgeColor: '#8d8d8d',
      edgeTextColor: '#525252',
      background: '#ffffff',
      nodeBackgroundColor: '#ffffff',
      nodeBorderColor: '#e0e0e0',
      nodeTextColor: '#161616',
      fontFamily: "'IBM Plex Sans', sans-serif",
      fontSize: '16px',
      textColor: '#161616',
      noteBkgColor: '#be95ff',
      noteBorderColor: '#e0e0e0',
      noteTextColor: '#161616',
    };

    const g100Theme = {
      primaryColor: '#4589ff',
      primaryBorderColor: '#0f62fe',
      primaryTextColor: '#f4f4f4',
      secondaryColor: '#262626',
      secondaryBorderColor: '#6f6f6f',
      secondaryTextColor: '#c6c6c6',
      edgeColor: '#a8a8a8',
      edgeTextColor: '#c6c6c6',
      background: '#161616',
      nodeBackgroundColor: '#161616',
      nodeBorderColor: '#6f6f6f',
      nodeTextColor: '#f4f4f4',
      fontFamily: "'IBM Plex Sans', sans-serif",
      fontSize: '16px',
      textColor: '#f4f4f4',
      noteBkgColor: '#8a3ffc',
      noteBorderColor: '#6f6f6f',
      noteTextColor: '#f4f4f4',
    };*/

    const whiteTheme = {
      // tell Mermaid this is a light theme
      darkMode: false,

      // general
      background: '#ffffff',
      //primaryColor: '#0f62fe',
      secondaryColor: '#393939',
      mainBkg: '#0f62fe',
      secondBkg: '#393939',
      lineColor: '#dcdcdc',
      border1: '#002d9c',
      border2: '#6f6f6f',
      arrowheadColor: '#dcdcdc',
      fontFamily: "'IBM Plex Sans', sans-serif",
      fontSize: '16px',

      // derived
      tertiaryColor: '#0f62fe',
      primaryBorderColor: '#002d9c',
      secondaryBorderColor: '#6f6f6f',
      tertiaryBorderColor: '#002d9c',
      primaryTextColor: '#ffffff',
      secondaryTextColor: '#ffffff',
      tertiaryTextColor: '#ffffff',
      textColor: '#161616',
      THEME_COLOR_LIMIT: 12,

      // flowchart
      nodeBkg: '#0f62fe',
      nodeBorder: '#002d9c',
      clusterBkg: '#f4f4f4',
      clusterBorder: '#393939',
      defaultLinkColor: '#dcdcdc',
      titleColor: '#161616',
      edgeLabelBackground: '#ffffff',

      // sequence
      actorBorder: '#002d9c',
      actorBkg: '#0f62fe',
      actorTextColor: '#ffffff',
      actorLineColor: '#002d9c',
      signalColor: '#161616',
      signalTextColor: '#161616',
      labelBoxBkgColor: '#0f62fe',
      labelBoxBorderColor: '#002d9c',
      labelTextColor: '#ffffff',
      loopTextColor: '#ffffff',
      noteBkgColor: '#da1e28',
      noteBorderColor: '#da1e28',
      noteTextColor: '#ffffff',
      activationBorderColor: '#393939',
      activationBkgColor: '#393939',
      sequenceNumberColor: '#dcdcdc',

      // Gantt
      sectionBkgColor: '#0f62fe',
      altSectionBkgColor: '#f3f3f3',
      sectionBkgColor2: '#0f62fe',
      excludeBkgColor: '#ffffff',
      taskBorderColor: '#002d9c',
      taskBkgColor: '#ffffff',
      taskTextLightColor: '#ffffff',
      taskTextColor: '#161616',
      taskTextDarkColor: '#000000',
      taskTextOutsideColor: '#161616',
      taskTextClickableColor: '#0f62fe',
      activeTaskBorderColor: '#002d9c',
      activeTaskBkgColor: '#0f62fe',
      gridColor: '#393939',
      doneTaskBkgColor: '#dcdcdc',
      doneTaskBorderColor: '#e0e0e0',
      critBorderColor: '#da1e28',
      critBkgColor: '#da1e28',
      todayLineColor: '#da1e28',
      vertLineColor: '#00bfff',

      // C4 context
      personBorder: '#002d9c',
      personBkg: '#0f62fe',

      // architecture
      archEdgeColor: '#dcdcdc',
      archEdgeArrowColor: '#dcdcdc',
      archEdgeWidth: '3',
      archGroupBorderColor: '#002d9c',
      archGroupBorderWidth: '2px',

      // state & error
      labelColor: '#161616',
      errorBkgColor: '#da1e28',
      errorTextColor: '#ffffff',
    };

    const g100Theme = {
      // dark mode on
      darkMode: true,

      // general
      background: '#161616',
      primaryColor: '#0f62fe',
      secondaryColor: '#393939',
      mainBkg: '#0f62fe',
      secondBkg: '#393939',
      lineColor: '#262626',
      border1: '#002d9c',
      border2: '#6f6f6f',
      arrowheadColor: '#262626',
      fontFamily: "'IBM Plex Sans', sans-serif",
      fontSize: '16px',

      // derived
      tertiaryColor: '#0f62fe',
      primaryBorderColor: '#002d9c',
      secondaryBorderColor: '#6f6f6f',
      tertiaryBorderColor: '#002d9c',
      primaryTextColor: '#ffffff',
      secondaryTextColor: '#ffffff',
      tertiaryTextColor: '#ffffff',
      textColor: '#f4f4f4',
      THEME_COLOR_LIMIT: 12,

      // flowchart
      nodeBkg: '#0f62fe',
      nodeBorder: '#002d9c',
      clusterBkg: '#0f62fe',
      clusterBorder: '#002d9c',
      defaultLinkColor: '#262626',
      titleColor: '#ffffff',
      edgeLabelBackground: '#161616',

      // sequence
      actorBorder: '#002d9c',
      actorBkg: '#0f62fe',
      actorTextColor: '#ffffff',
      actorLineColor: '#002d9c',
      signalColor: '#f4f4f4',
      signalTextColor: '#f4f4f4',
      labelBoxBkgColor: '#0f62fe',
      labelBoxBorderColor: '#002d9c',
      labelTextColor: '#ffffff',
      loopTextColor: '#ffffff',
      noteBkgColor: '#da1e28',
      noteBorderColor: '#da1e28',
      noteTextColor: '#ffffff',
      activationBorderColor: '#393939',
      activationBkgColor: '#393939',
      sequenceNumberColor: '#262626',

      // Gantt
      sectionBkgColor: '#0f62fe',
      altSectionBkgColor: '#262626',
      sectionBkgColor2: '#0f62fe',
      excludeBkgColor: '#161616',
      taskBorderColor: '#002d9c',
      taskBkgColor: '#161616',
      taskTextLightColor: '#ffffff',
      taskTextColor: '#f4f4f4',
      taskTextDarkColor: '#000000',
      taskTextOutsideColor: '#f4f4f4',
      taskTextClickableColor: '#0f62fe',
      activeTaskBorderColor: '#002d9c',
      activeTaskBkgColor: '#0f62fe',
      gridColor: '#393939',
      doneTaskBkgColor: '#262626',
      doneTaskBorderColor: '#3d3d3d',
      critBorderColor: '#da1e28',
      critBkgColor: '#da1e28',
      todayLineColor: '#da1e28',
      vertLineColor: '#00bfff',

      // C4 context
      personBorder: '#002d9c',
      personBkg: '#0f62fe',

      // architecture
      archEdgeColor: '#262626',
      archEdgeArrowColor: '#262626',
      archEdgeWidth: '3',
      archGroupBorderColor: '#002d9c',
      archGroupBorderWidth: '2px',

      // state & error
      labelColor: '#f4f4f4',
      errorBkgColor: '#da1e28',
      errorTextColor: '#ffffff',
    };
    const currentTheme = this.theme == 'light' ? whiteTheme : g100Theme;
    const mainTheme: any = 'default';
    return {
      startOnLoad: false,
      theme: mainTheme,
      suppressErrorRendering: true,
      themeVariables: currentTheme,
      flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'stepBefore' },
      sequenceDiagram: { useMaxWidth: true, htmlLabels: true },
    };
  }

  /**
   * generateUniqueId - create random string to give the target visualization div
   */
  generateUniqueId() {
    const randomString: string = Math.random().toString(36).substr(2, 9);
    this._uniqueID = randomString;
  }

  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  async updated(changedProperties) {
    if (changedProperties.has('_uniqueID')) {
      await this._prepareDiagram();
    }
    if (changedProperties.has('theme')) {
      await this._prepareDiagram();
    }
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
      this.theme = darkMode ? 'dark' : 'light';
    }
  }

  /**
   * _scrollStreamArea - scroll div to display latest token added
   */
  _scrollStreamArea() {
    const textArea = this.shadowRoot?.querySelector(
      '.clabs--chat-diagram-stream-text-content'
    );
    if (textArea instanceof HTMLElement) {
      textArea.scrollLeft = textArea.scrollWidth;
    }
  }

  /**
   * _openFullscreenView -
   */
  _openFullscreenView() {
    this.fullscreenMode = true;
    window.setTimeout(() => {
      this._prepareDiagram();
    }, 200);
  }

  /**
   * _openFullscreenView -
   */
  _closeFullscreenView() {
    this.fullscreenMode = false;
    //this._preparediagram("default");
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
   * Prepare diagram object for rendering from content string
   * @param {String} mode - which mode to render with smilesDrawer
   */
  async _prepareDiagram() {
    let diagramDef = this.definition.replace(/```/g, '');
    if (this.archDiagramMode) {
      diagramDef = diagramDef + this.appendStyling;
    }
    //const preID = clabsPrefix + '--chat-diagram-previz-id-' + this._uniqueID;
    const targetID =
      clabsPrefix + '--chat-diagram-container-id-' + this._uniqueID;

    const target = this.shadowRoot?.getElementById(targetID);
    //const preTarget = this.shadowRoot?.getElementById(preID);
    if (target instanceof HTMLElement) {
      try {
        //const type = mermaid.detectType(diagramDef);
        //await this._renderDiagram(type,diagramDef,targetID,target);
        const { svg } = await mermaid.render(targetID, diagramDef);
        this.renderedSVG = svg;
        //target.innerHTML = svg;

        //mermaid.run({nodes:[preTarget]})
      } catch (error) {
        console.log('type fail');
        console.error(error);
      }
    }
  }
}
