/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
var __decorate = this && this.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import SmileDrawer from 'smiles-drawer';
import { settings } from '@carbon-labs/utilities/es/settings/index.js';
const {
  stablePrefix: clabsPrefix
} = settings;
// @ts-ignore
// @ts-ignore
import styles from "./molecularElement.css.js";
/**
 * Input component using search typeahead api
 */ /**
     * Input component using search typeahead api
     */
class molecularElement extends LitElement {
  constructor() {
    super(...arguments);
    /**
     * is the component hovered upon
     */
    this.isHovered = false;
    /**
     * invalid - if spec fails to render or is missing, an error will be displayed
     */
    this._invalid = false;
    /**
     * renderSuccessful - flag when a render operation has succeeded to begin post-hoc editing
     */
    this.renderSuccessful = false;
    /**
     * loading - initial state to show loading icon until error or successful render occurs
     */
    this.loading = true;
    /**
     * fullscreenMode - boolean to denote with fullscreen active
     */
    this.fullscreenMode = false;
    /**
     * scaling - zoom scaling value;
     */
    this._scaling = 1;
    /**
     * viewX - save offset to target zooming
     */
    this._viewX = 0;
    /**
     * viewY - save offset to target zooming
     */
    this._viewY = 0;
  }
  /** detect when component is rendered to process visualization specification object
   */
  firstUpdated() {
    this.generateUniqueId();
    if (this.width) {
      this.style.setProperty('--chat-molecule-width', this.width + 'px');
    }
    if (this.height) {
      this.style.setProperty('--chat-molecule-height', this.height + 'px');
    }
    this.molecularRenderer = new SmileDrawer.SmiDrawer(this._buildOptions('default'));
    this.temporaryMolecularRenderer = new SmileDrawer.SmiDrawer(this._buildOptions('default'));
    this.fullscreenMolecularRenderer = new SmileDrawer.SmiDrawer(this._buildOptions('fullscreen'));
    if (!this.theme) {
      this._getTheme();
    }
    if (!this.streaming) {
      window.setTimeout(() => {
        this._smilesContent = this.content;
        this._prepareMolecule('default');
      }, 200);
    }
  }
  /** _buildOptions
   * @param {String} mode - fullscreen, test or default
   */
  _buildOptions(mode) {
    let fontSizeLarge = 6;
    let fontSizeSmall = 3;
    let bondThickness = 0.7;
    let compactDrawing = false;
    let scale = null;
    let padding = 16;
    let bondSpacing = 0.18 * 10;
    const bondLength = 15;
    let atomVisualization = 'default';
    if (mode === 'fullscreen') {
      fontSizeLarge = 5;
      fontSizeSmall = 3;
      compactDrawing = false;
    } else if (this.thumbNailMode) {
      fontSizeLarge = 12;
      fontSizeSmall = 8;
      bondThickness = 1.2;
      bondSpacing = 0.18 * 15;
      compactDrawing = true;
      atomVisualization = 'balls';
      padding = 8;
      scale = 1;
    }
    const options = {
      scale: scale,
      compactDrawing: compactDrawing,
      fontSizeLarge: fontSizeLarge,
      fontSizeSmall: fontSizeSmall,
      bondThickness: bondThickness,
      padding: padding,
      bondLength: bondLength,
      shortBondLength: 0.7,
      bondSpacing: bondSpacing,
      atomVisualization: atomVisualization,
      isomeric: true,
      debug: false,
      terminalCarbons: true,
      explicitHydrogens: false,
      overlapSensitivity: 0.1,
      overlapResolutionIterations: this.streaming ? 1 : 10,
      experimental: false,
      themes: {
        dark: {
          C: '#c6c6c6',
          O: '#f45d56',
          N: '#33b1ff',
          F: '#42be65',
          CL: '#08bdba',
          BR: '#ff832b',
          I: '#be95ff',
          P: '#ff832b',
          S: '#fdd13a',
          B: '#f1c21b',
          SI: '#f1c21b',
          H: '#c6c6c6',
          BACKGROUND: '#161616',
          BONDS: '#3d3d3d'
        },
        light: {
          C: '#525252',
          O: '#da1e28',
          N: '#1192e8',
          F: '#24a148',
          CL: '#009d9a',
          BR: '#ba4e00',
          I: '#8a3ffc',
          P: '#db5b00',
          S: '#d6a602',
          B: '#c29800',
          SI: '#cca002',
          H: '#525252',
          BACKGROUND: '#f4f4f4',
          BONDS: '#e0e0e0'
        }
      }
    };
    return options;
  }
  /**
   * generateUniqueId - create random string to give the target visualization div
   */
  generateUniqueId() {
    const randomString = Math.random().toString(36).substr(2, 9);
    this._uniqueID = randomString;
  }
  /**
   * _handleFullScreenScroll - block scrolling beyond fullscreen
   * @param {event} event - scroll/wheel event
   */
  _handleFullScreenScroll(event) {
    event.preventDefault();
    event.stopPropagation();
  }
  /** updated - internal LIT function to detect updates to the DOM tree, used to auto update the specification attribute
   * @param {Object} changedProperties - returned inner DOM update object
   **/
  async updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('content')) {
      this._prepareMolecule('default');
    }
    if (changedProperties.has('_smilesContent')) {
      this._scrollStreamArea();
    }
    if (changedProperties.has('renderSuccessful')) {
      await this.checkPubChemAvailability();
      this._appendCustomStyles();
    }
  }
  /**
   * _getTheme - find current theme by checking parent background color
   */
  _getTheme() {
    if (this.parentElement instanceof HTMLElement) {
      const parentStyle = getComputedStyle(this.parentElement);
      const backgroundColor = parentStyle.getPropertyValue('--cds-background');
      const darkMode = backgroundColor.startsWith('#') && parseInt(backgroundColor.replace('#', ''), 16) < 0xffffff / 2;
      this.theme = darkMode ? 'dark' : 'light';
    }
  }
  /**
   * _zoomIn - zooming event on scroll to expand svg element
   * @param {event} event - mousewheel event
   */
  _zoomIn(event) {
    var _a;
    event.preventDefault();
    const zoomValue = 0.001;
    const minZoom = 0.5;
    const maxZoom = 3.0;
    const delta = Math.sign(event.deltaY) * zoomValue;
    const allSvg = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.getElementById('clabs--chat-molecule-' + this._uniqueID);
    if (allSvg instanceof SVGElement) {
      const mouseX = event.offsetX;
      const mouseY = event.offsetY;
      const newScale = Math.min(maxZoom, Math.max(this._scaling - delta, minZoom));
      this._viewX = mouseX - (mouseX - this._viewX) * (newScale / this._scaling);
      this._viewY = mouseY - (mouseY - this._viewY) * (newScale / this._scaling);
      this._scaling = newScale;
      //allSvg.setAttribute('transform','translate('+this._viewX+' '+this._viewY+') scale('+this._scaling+')');
      const subElements = allSvg.querySelectorAll('g');
      for (const subElement of subElements) {
        //allSvg.setAttribute('viewBox', viewX+' '+viewY+' '+newWidth+' '+newHeight);//translate('+viewX+' '+viewY+')
        subElement.setAttribute('transform', 'translate(' + this._viewY + ' ' + this._viewX + ') scale(' + this._scaling + ')');
      }
    }
  }
  /**
   * _appendCustomStyles - change smiles-drawer atom rendering
   */
  _appendCustomStyles() {
    var _a;
    //const enableTextStyling = false;
    //const enableCircleStyling = false;
    //const enableZooming = false;
    const shortenWedges = true;
    /*if(enableZooming){
           const moleculeContainer = this.shadowRoot?.getElementById(clabsPrefix+'--chat-molecule-container-id-'+ this._uniqueID);
      if(moleculeContainer instanceof HTMLElement){
        moleculeContainer.addEventListener('wheel',(e)=>this._zoomIn(e))
      }
         }*/
    if (shortenWedges) {
      const wedgeElements = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelectorAll('polygon');
      if (wedgeElements) {
        wedgeElements.forEach(wedge => {
          if (wedge instanceof SVGPolygonElement) {
            const pointsAttr = wedge.getAttribute('points');
            if (pointsAttr) {
              const points = pointsAttr.split(' ');
              const coords = points.map(point => point.split(',').map(Number));
              const shortenFactor = 0.75;
              const [x1, y1] = coords[0];
              let [x2, y2] = coords[1];
              let [x3, y3] = coords[2];
              x2 = x1 + (x2 - x1) * shortenFactor;
              y2 = y1 + (y2 - y1) * shortenFactor;
              x3 = x1 + (x3 - x1) * shortenFactor;
              y3 = y1 + (y3 - y1) * shortenFactor;
              wedge.setAttribute('points', x1 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ' + x3 + ',' + y3);
            }
          }
        });
      }
    }
    /*if(enableTextStyling){
      const textElements = this.shadowRoot?.querySelectorAll('text');
      if(textElements){
        textElements.forEach(text =>{
          if(text instanceof SVGTextElement){
      //text.style.fill = 'red';
      //text.style.textShadow = 'red'
      text.style.textShadow='0 0 5px rgba(255, 255, 255, 0.8)'
      //text.style.stroke = 'black';
      //text.style.strokeWidth = '3px';
      //text.style.background = 'none';
           const tspans = text?.querySelectorAll('tspan');
      tspans.forEach(tspan =>{
        if(tspan instanceof SVGTSpanElement){
        tspan.style.stroke='rgba(255, 255, 255)';
        tspan.style.fontWeight='900'
        //tspan.style.fill='white';
        tspan.style.strokeWidth='0.5px';
        //tspan.style.textShadow='0 0 5px rgba(255, 255, 255, 0.8)'
        }
      });
      }
           })
     }
    }
    if(enableCircleStyling){
    const mask = this.shadowRoot?.querySelector('mask');
    if(mask){
      const circles = mask?.querySelectorAll('circle');
      if(circles){
           circles.forEach(circle =>{
        if(circle instanceof SVGCircleElement){
        //circle.style.opacity='0';
        circle.setAttribute("r","3")
        }
      })
      }
    }
    }*/
  }
  /**
   * _scrollStreamArea - scroll div to display latest token added
   */
  _scrollStreamArea() {
    var _a;
    const textArea = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('.clabs--chat-molecule-stream-text-content');
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
      this._prepareMolecule('fullscreen');
    }, 200);
  }
  /**
   * _openFullscreenView -
   */
  _closeFullscreenView() {
    this.fullscreenMode = false;
    //this._prepareMolecule("default");
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
   * _openEditorView -
   */
  async _openEditorView() {
    if (this.pubChemUrl) {
      window === null || window === void 0 ? void 0 : window.open(this.pubChemUrl, '_blank');
    }
  }
  /**
   * _checkPubChemAvailability - make a call to see if smiles string is available
   */
  async checkPubChemAvailability() {
    try {
      const pubChemResponse = await fetch('https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/' + encodeURIComponent(this.content) + '/cids/JSON');
      const data = await pubChemResponse.json();
      if (data['IdentifierList'] && data['IdentifierList']['CID'] && data['IdentifierList']['CID'].length > 0) {
        const cid = data['IdentifierList']['CID'][0];
        if (cid) {
          this.pubChemUrl = 'https://pubchem.ncbi.nlm.nih.gov/compound/' + cid;
        }
      }
    } catch (pubChemError) {
      this.pubChemUrl = null;
    }
  }
  /**
   * _exportImage - if svg, get image object from svg and auto-download
   */
  _exportToImage() {
    window.setTimeout(async () => {
      var _a;
      const svgDiv = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('#' + clabsPrefix + '--chat-molecule-' + this._uniqueID);
      if (svgDiv instanceof SVGElement) {
        const svgData = new XMLSerializer().serializeToString(svgDiv);
        const tempCanvas = document.createElement('canvas');
        const context = tempCanvas.getContext('2d');
        const svgSize = svgDiv.getBoundingClientRect();
        tempCanvas.height = svgSize.height;
        tempCanvas.width = svgSize.width;
        const tempImage = new Image();
        /**
         * loading function when image is finalized and reqady to download
         */
        tempImage.onload = () => {
          context === null || context === void 0 ? void 0 : context.drawImage(tempImage, 0, 0);
          const imageData = tempCanvas.toDataURL('image/png');
          const canvasDownloadLink = document.createElement('a');
          const fileName = this.title ? this.title : 'molecule';
          canvasDownloadLink.download = fileName;
          canvasDownloadLink.href = imageData;
          canvasDownloadLink.click();
        };
        tempImage.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      }
    }, 200);
  }
  /**
   * Prepare molecular object for rendering from content string
   * @param {String} mode - which mode to render with smilesDrawer
   */
  _prepareMolecule(mode) {
    var _a, _b;
    this.loading = false;
    let targetID = 'clabs--chat-molecule-' + this._uniqueID;
    const testTargetID = 'clabs--chat-molecule-test-' + this._uniqueID;
    if (mode === 'fullscreen') {
      targetID = 'clabs--chat-molecule-fullscreen-' + this._uniqueID;
    }
    const canvas = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.getElementById(targetID);
    const testCanvas = (_b = this.shadowRoot) === null || _b === void 0 ? void 0 : _b.getElementById(testTargetID);
    const smilesString = this.content.replace(new RegExp('```', 'g'), '');
    this._smilesContent = smilesString;
    let renderTest = false;
    if (canvas instanceof SVGElement && testCanvas instanceof SVGElement) {
      try {
        this.temporaryMolecularRenderer.draw(smilesString, testCanvas, this.theme, () => {
          renderTest = true;
          this.renderSuccessful = true;
        }, () => {
          renderTest = false;
        });
      } catch (err) {
        renderTest = false;
      }
    }
    if (renderTest) {
      if (this.streaming) {
        if (!this.renderInProgress) {
          this.renderInProgress = true;
          this.renderInProgress = false;
        } else {
          return '';
        }
      }
      if (mode === 'fullscreen') {
        this.fullscreenMolecularRenderer.draw(smilesString, canvas, this.theme, () => {
          this.renderInProgress = false;
        }, () => {
          this.renderInProgress = false;
        });
      } else {
        this.molecularRenderer.draw(smilesString, canvas, this.theme, () => {
          this.renderInProgress = false;
        }, () => {
          this.renderInProgress = false;
        });
      }
      this.requestUpdate();
    }
    return '';
  }
}
molecularElement.styles = styles;
export default molecularElement;
__decorate([property({
  type: String,
  attribute: 'content',
  reflect: true
})], molecularElement.prototype, "content", void 0);
__decorate([property({
  type: String,
  attribute: 'title'
})], molecularElement.prototype, "title", void 0);
__decorate([property({
  type: Number,
  attribute: 'width'
})], molecularElement.prototype, "width", void 0);
__decorate([property({
  type: Number,
  attribute: 'height'
})], molecularElement.prototype, "height", void 0);
__decorate([property({
  type: String,
  attribute: 'theme'
})], molecularElement.prototype, "theme", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'streaming'
})], molecularElement.prototype, "streaming", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'disable-options'
})], molecularElement.prototype, "disableOptions", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'disable-fullscreen'
})], molecularElement.prototype, "disableFullscreen", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'disable-export'
})], molecularElement.prototype, "disableExport", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'thumbnail-mode'
})], molecularElement.prototype, "thumbNailMode", void 0);
__decorate([state()], molecularElement.prototype, "isHovered", void 0);
__decorate([property({
  type: Boolean,
  attribute: 'disable-code-inspector'
})], molecularElement.prototype, "disableCodeInspector", void 0);
__decorate([state()], molecularElement.prototype, "_uniqueID", void 0);
__decorate([state()], molecularElement.prototype, "_invalid", void 0);
__decorate([state()], molecularElement.prototype, "drawer", void 0);
__decorate([state()], molecularElement.prototype, "renderSuccessful", void 0);
__decorate([state()], molecularElement.prototype, "loading", void 0);
__decorate([state()], molecularElement.prototype, "fullscreenMode", void 0);
__decorate([state()], molecularElement.prototype, "_smilesContent", void 0);
__decorate([state()], molecularElement.prototype, "_scaling", void 0);
__decorate([state()], molecularElement.prototype, "_viewX", void 0);
__decorate([state()], molecularElement.prototype, "_viewY", void 0);
__decorate([state()], molecularElement.prototype, "pubChemUrl", void 0);
__decorate([state()], molecularElement.prototype, "renderInProgress", void 0);
//# sourceMappingURL=molecularElement.js.map
