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
import 'smiles-drawer';

// @ts-ignore
import styles from './molecularElement.scss?inline';
/**
 * Input component using search typeahead api
 */
export default class molecularElement extends LitElement {
  static styles = styles;
  /**
   * Array of subelements parsed from API reply
   */
  @property({ type: String, attribute: 'content', reflect: true })
  content;

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
   * uniqueID - unique ID egenrated in this component to target correct div when rendering
   */
  @state()
  _uniqueID;

  /**
   * invalid - if spec fails to render or is missing, an error will be displayed
   */
  @state()
  _invalid = false;

  /**
   * drawer - drawing function for molecule
   */
  @state()
  drawer;

  /**
   * smilesContent -  content string to render
   */
  @state()
  _smilesContent;

  /**
   * SmilesDrawer rendering object that targets the visible inner SVG
   */
  private molecularRenderer: any;

  /**
   * SmilesDrawer rendering test object that targets an invisible test object, used to check if content is valid
   */
  private temporaryMolecularRenderer: any;

  /**
   * renderInProgress - render state while streaming to avoid over-rendering
   */
  @state()
  renderInProgress;

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

    const options = {
      bondThickness: 0.5,
      bondLength: 15,
      shortBondLength: 0.85,
      bondSpacing: 0.18 * 15,
      atomVisualization: 'default',
      isomeric: true,
      debug: false,
      terminalCarbons: true,
      explicitHydrogens: false,
      overlapSensitivity: 0.42,
      overlapResolutionIterations: 3,
      compactDrawing: true,
      fontSizeLarge: 5,
      fontSizeSmall: 3,
      padding: 0.0,
      experimental: false,
      themes: {
        dark: {
          C: '#f4f4f4',
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
          H: '#f4f4f4',
          BACKGROUND: '#161616',
          BONDS: '#3d3d3d',
        },
        light: {
          C: '#121619',
          O: '#fa4d56',
          N: '#33b1ff',
          F: '#42be65',
          CL: '#08bdba',
          BR: '#ff832b',
          I: '#be95ff',
          P: '#ff932b',
          S: '#fdd13a',
          B: '#f1c21b',
          SI: '#f1c21b',
          H: '#121619',
          BACKGROUND: '#f4f4f4',
          BONDS: '#e0e0e0',
        },
      },
    };
    this.molecularRenderer = new SmiDrawer(options);
    this.temporaryMolecularRenderer = new SmiDrawer(options);
    if (!this.theme) {
      this._getTheme();
    }
    if (!this.streaming) {
      window.setTimeout(() => {
        this._smilesContent = this.content;
        this._prepareMolecule();
      }, 500);
    }
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
    super.updated(changedProperties);
    if (changedProperties.has('content')) {
      this._prepareMolecule();
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
   * Prepare molecular object for rendering from content string
   */
  _prepareMolecule() {
    const targetID = 'clabs-chat-molecule-' + this._uniqueID;
    const testTargetID = 'clabs-chat-molecule-test-' + this._uniqueID;
    const canvas = this.shadowRoot?.getElementById(targetID);
    const testCanvas = this.shadowRoot?.getElementById(testTargetID);
    const smilesString = this.content.replace(new RegExp('```', 'g'), '');
    this._smilesContent = smilesString;
    let renderTest = false;
    if (canvas instanceof SVGElement && testCanvas instanceof SVGElement) {
      try {
        //this.temporaryMolecularRenderer.innerHTML = "";
        //canvas.innerHTML = '';
        this.temporaryMolecularRenderer.draw(
          smilesString,
          testCanvas,
          this.theme,
          () => {
            renderTest = true;
          },
          () => {
            renderTest = false;
          }
        );
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
      this.molecularRenderer.draw(
        smilesString,
        canvas,
        this.theme,
        () => {
          this.renderInProgress = false;
        },
        () => {
          this.renderInProgress = false;
        }
      );
      this.requestUpdate();
    }
    return '';
  }
}
