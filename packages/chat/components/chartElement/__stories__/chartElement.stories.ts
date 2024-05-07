/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../chartElement';
import { html } from 'lit';

// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
export default {
  title: 'Components/Chat/Chart',
};

const defaultArgs = {
  content:
    '{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"IBM stock price over time.","data":{"values":[{"symbol":"IBM","date":"Jan 1 2000","price":100.52},{"symbol":"IBM","date":"Feb 1 2000","price":92.11},{"symbol":"IBM","date":"Mar 1 2000","price":106.11},{"symbol":"IBM","date":"Apr 1 2000","price":99.95},{"symbol":"IBM","date":"May 1 2000","price":96.31},{"symbol":"IBM","date":"Jun 1 2000","price":98.33},{"symbol":"IBM","date":"Jul 1 2000","price":100.74},{"symbol":"IBM","date":"Aug 1 2000","price":118.62},{"symbol":"IBM","date":"Sep 1 2000","price":101.19},{"symbol":"IBM","date":"Oct 1 2000","price":88.5},{"symbol":"IBM","date":"Nov 1 2000","price":84.12},{"symbol":"IBM","date":"Dec 1 2000","price":76.47},{"symbol":"IBM","date":"Jan 1 2001","price":100.76},{"symbol":"IBM","date":"Feb 1 2001","price":89.98},{"symbol":"IBM","date":"Mar 1 2001","price":86.63},{"symbol":"IBM","date":"Apr 1 2001","price":103.7},{"symbol":"IBM","date":"May 1 2001","price":100.82},{"symbol":"IBM","date":"Jun 1 2001","price":102.35},{"symbol":"IBM","date":"Jul 1 2001","price":94.87},{"symbol":"IBM","date":"Aug 1 2001","price":90.25},{"symbol":"IBM","date":"Sep 1 2001","price":82.82},{"symbol":"IBM","date":"Oct 1 2001","price":97.58},{"symbol":"IBM","date":"Nov 1 2001","price":104.5},{"symbol":"IBM","date":"Dec 1 2001","price":109.36},{"symbol":"IBM","date":"Jan 1 2002","price":97.54},{"symbol":"IBM","date":"Feb 1 2002","price":88.82},{"symbol":"IBM","date":"Mar 1 2002","price":94.15},{"symbol":"IBM","date":"Apr 1 2002","price":75.82},{"symbol":"IBM","date":"May 1 2002","price":72.97},{"symbol":"IBM","date":"Jun 1 2002","price":65.31},{"symbol":"IBM","date":"Jul 1 2002","price":63.86},{"symbol":"IBM","date":"Aug 1 2002","price":68.52},{"symbol":"IBM","date":"Sep 1 2002","price":53.01},{"symbol":"IBM","date":"Oct 1 2002","price":71.76},{"symbol":"IBM","date":"Nov 1 2002","price":79.16},{"symbol":"IBM","date":"Dec 1 2002","price":70.58},{"symbol":"IBM","date":"Jan 1 2003","price":71.22},{"symbol":"IBM","date":"Feb 1 2003","price":71.13},{"symbol":"IBM","date":"Mar 1 2003","price":71.57},{"symbol":"IBM","date":"Apr 1 2003","price":77.47},{"symbol":"IBM","date":"May 1 2003","price":80.48},{"symbol":"IBM","date":"Jun 1 2003","price":75.42},{"symbol":"IBM","date":"Jul 1 2003","price":74.28},{"symbol":"IBM","date":"Aug 1 2003","price":75.12},{"symbol":"IBM","date":"Sep 1 2003","price":80.91},{"symbol":"IBM","date":"Oct 1 2003","price":81.96},{"symbol":"IBM","date":"Nov 1 2003","price":83.08},{"symbol":"IBM","date":"Dec 1 2003","price":85.05},{"symbol":"IBM","date":"Jan 1 2004","price":91.06},{"symbol":"IBM","date":"Feb 1 2004","price":88.7},{"symbol":"IBM","date":"Mar 1 2004","price":84.41},{"symbol":"IBM","date":"Apr 1 2004","price":81.04},{"symbol":"IBM","date":"May 1 2004","price":81.59},{"symbol":"IBM","date":"Jun 1 2004","price":81.19},{"symbol":"IBM","date":"Jul 1 2004","price":80.19},{"symbol":"IBM","date":"Aug 1 2004","price":78.17},{"symbol":"IBM","date":"Sep 1 2004","price":79.13},{"symbol":"IBM","date":"Oct 1 2004","price":82.84},{"symbol":"IBM","date":"Nov 1 2004","price":87.15},{"symbol":"IBM","date":"Dec 1 2004","price":91.16},{"symbol":"IBM","date":"Jan 1 2005","price":86.39},{"symbol":"IBM","date":"Feb 1 2005","price":85.78},{"symbol":"IBM","date":"Mar 1 2005","price":84.66},{"symbol":"IBM","date":"Apr 1 2005","price":70.77},{"symbol":"IBM","date":"May 1 2005","price":70.18},{"symbol":"IBM","date":"Jun 1 2005","price":68.93},{"symbol":"IBM","date":"Jul 1 2005","price":77.53},{"symbol":"IBM","date":"Aug 1 2005","price":75.07},{"symbol":"IBM","date":"Sep 1 2005","price":74.7},{"symbol":"IBM","date":"Oct 1 2005","price":76.25},{"symbol":"IBM","date":"Nov 1 2005","price":82.98},{"symbol":"IBM","date":"Dec 1 2005","price":76.73},{"symbol":"IBM","date":"Jan 1 2006","price":75.89},{"symbol":"IBM","date":"Feb 1 2006","price":75.09},{"symbol":"IBM","date":"Mar 1 2006","price":77.17},{"symbol":"IBM","date":"Apr 1 2006","price":77.05},{"symbol":"IBM","date":"May 1 2006","price":75.04},{"symbol":"IBM","date":"Jun 1 2006","price":72.15},{"symbol":"IBM","date":"Jul 1 2006","price":72.7},{"symbol":"IBM","date":"Aug 1 2006","price":76.35},{"symbol":"IBM","date":"Sep 1 2006","price":77.26},{"symbol":"IBM","date":"Oct 1 2006","price":87.06},{"symbol":"IBM","date":"Nov 1 2006","price":86.95},{"symbol":"IBM","date":"Dec 1 2006","price":91.9},{"symbol":"IBM","date":"Jan 1 2007","price":93.79},{"symbol":"IBM","date":"Feb 1 2007","price":88.18},{"symbol":"IBM","date":"Mar 1 2007","price":89.44},{"symbol":"IBM","date":"Apr 1 2007","price":96.98},{"symbol":"IBM","date":"May 1 2007","price":101.54},{"symbol":"IBM","date":"Jun 1 2007","price":100.25},{"symbol":"IBM","date":"Jul 1 2007","price":105.4},{"symbol":"IBM","date":"Aug 1 2007","price":111.54},{"symbol":"IBM","date":"Sep 1 2007","price":112.6},{"symbol":"IBM","date":"Oct 1 2007","price":111},{"symbol":"IBM","date":"Nov 1 2007","price":100.9},{"symbol":"IBM","date":"Dec 1 2007","price":103.7},{"symbol":"IBM","date":"Jan 1 2008","price":102.75},{"symbol":"IBM","date":"Feb 1 2008","price":109.64},{"symbol":"IBM","date":"Mar 1 2008","price":110.87},{"symbol":"IBM","date":"Apr 1 2008","price":116.23},{"symbol":"IBM","date":"May 1 2008","price":125.14},{"symbol":"IBM","date":"Jun 1 2008","price":114.6},{"symbol":"IBM","date":"Jul 1 2008","price":123.74},{"symbol":"IBM","date":"Aug 1 2008","price":118.16},{"symbol":"IBM","date":"Sep 1 2008","price":113.53},{"symbol":"IBM","date":"Oct 1 2008","price":90.24},{"symbol":"IBM","date":"Nov 1 2008","price":79.65},{"symbol":"IBM","date":"Dec 1 2008","price":82.15},{"symbol":"IBM","date":"Jan 1 2009","price":89.46},{"symbol":"IBM","date":"Feb 1 2009","price":90.32},{"symbol":"IBM","date":"Mar 1 2009","price":95.09},{"symbol":"IBM","date":"Apr 1 2009","price":101.29},{"symbol":"IBM","date":"May 1 2009","price":104.85},{"symbol":"IBM","date":"Jun 1 2009","price":103.01},{"symbol":"IBM","date":"Jul 1 2009","price":116.34},{"symbol":"IBM","date":"Aug 1 2009","price":117},{"symbol":"IBM","date":"Sep 1 2009","price":118.55},{"symbol":"IBM","date":"Oct 1 2009","price":119.54},{"symbol":"IBM","date":"Nov 1 2009","price":125.79},{"symbol":"IBM","date":"Dec 1 2009","price":130.32},{"symbol":"IBM","date":"Jan 1 2010","price":121.85},{"symbol":"IBM","date":"Feb 1 2010","price":127.16},{"symbol":"IBM","date":"Mar 1 2010","price":125.55}]},"transform":[{"filter":"datum.symbol===\'IBM\'"}],"mark":{"type":"area","line":{"color":"darkgreen"},"color":{"x1":1,"y1":1,"x2":1,"y2":0,"gradient":"linear","stops":[{"offset":0,"color":"white"},{"offset":1,"color":"darkgreen"}]}},"encoding":{"x":{"field":"date","type":"temporal"},"y":{"field":"price","type":"quantitative"}}}',
  carbonify: true,
  containerHeight: '300px',
  containerWidth: '100%',
  chartTheme: 'dark',
  renderMethod: 'canvas',
  loading: true,
  enableZooming: false,
  enableTooltip: true,
  disableOptions: false,
  disableEditor: false,
  disableCodeInspector: false,
  disableExport: false,
  disableFullscreen: false,
};

const controls = {
  content: {
    control: { type: 'text' },
    default: '',
    description: 'content - Specification string including data.values',
  },
  carbonify: {
    control: { type: 'boolean' },
    default: true,
    description: 'carbonify - Enable post-hoc carbon charts styling',
  },
  containerHeight: {
    control: { type: 'text' },
    default: '246px',
    description: 'container-height - Must be valid CSS',
  },
  containerWidth: {
    control: { type: 'text' },
    default: '100%',
    description: 'container-width - Must be valid CSS',
  },
  chartTheme: {
    control: { type: 'select' },
    default: 'light',
    description: 'theme - Chart color theme',
    options: ['light', 'dark'],
  },
  renderMethod: {
    control: { type: 'select' },
    default: 'canvas',
    description: 'canvas - Chart rendering mode',
    options: ['canvas', 'svg'],
  },
  loading: {
    control: { type: 'boolean' },
    default: true,
    description: 'loading - enabled by default until spec is displayed',
  },
  enableZooming: {
    control: { type: 'boolean' },
    default: false,
    description: 'enable-zooming - Enable zooming in charts',
  },
  enableTooltip: {
    control: { type: 'boolean' },
    default: false,
    description: 'enable-tooltip - Enable tooltip in charts',
  },
  disableOptions: {
    control: { type: 'boolean' },
    default: false,
    description: 'disable-options - Hide button in options',
  },
  disableEditor: {
    control: { type: 'boolean' },
    default: false,
    description: 'disable-editor - Hide button in options',
  },
  disableFullscreen: {
    control: { type: 'boolean' },
    default: false,
    description: 'disable-fullscreen - Hide button in options',
  },
  disableCodeInspector: {
    control: { type: 'boolean' },
    default: false,
    description: 'disable-code-inspector - Hide button in options',
  },
  disableExport: {
    control: { type: 'boolean' },
    default: false,
    description: 'disable-export - Hide button in options',
  },
};

export const Default = {
  /**
   * Renders the template for Showcase Storybook
   * @returns {TemplateResult<1>}
   */
  render: () => html` <clabs-chat-chart
    content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"IBM stock price over time.","data":{"values":[{"symbol":"IBM","date":"Jan 1 2000","price":100.52},{"symbol":"IBM","date":"Feb 1 2000","price":92.11},{"symbol":"IBM","date":"Mar 1 2000","price":106.11},{"symbol":"IBM","date":"Apr 1 2000","price":99.95},{"symbol":"IBM","date":"May 1 2000","price":96.31},{"symbol":"IBM","date":"Jun 1 2000","price":98.33},{"symbol":"IBM","date":"Jul 1 2000","price":100.74},{"symbol":"IBM","date":"Aug 1 2000","price":118.62},{"symbol":"IBM","date":"Sep 1 2000","price":101.19},{"symbol":"IBM","date":"Oct 1 2000","price":88.5},{"symbol":"IBM","date":"Nov 1 2000","price":84.12},{"symbol":"IBM","date":"Dec 1 2000","price":76.47},{"symbol":"IBM","date":"Jan 1 2001","price":100.76},{"symbol":"IBM","date":"Feb 1 2001","price":89.98},{"symbol":"IBM","date":"Mar 1 2001","price":86.63},{"symbol":"IBM","date":"Apr 1 2001","price":103.7},{"symbol":"IBM","date":"May 1 2001","price":100.82},{"symbol":"IBM","date":"Jun 1 2001","price":102.35},{"symbol":"IBM","date":"Jul 1 2001","price":94.87},{"symbol":"IBM","date":"Aug 1 2001","price":90.25},{"symbol":"IBM","date":"Sep 1 2001","price":82.82},{"symbol":"IBM","date":"Oct 1 2001","price":97.58},{"symbol":"IBM","date":"Nov 1 2001","price":104.5},{"symbol":"IBM","date":"Dec 1 2001","price":109.36},{"symbol":"IBM","date":"Jan 1 2002","price":97.54},{"symbol":"IBM","date":"Feb 1 2002","price":88.82},{"symbol":"IBM","date":"Mar 1 2002","price":94.15},{"symbol":"IBM","date":"Apr 1 2002","price":75.82},{"symbol":"IBM","date":"May 1 2002","price":72.97},{"symbol":"IBM","date":"Jun 1 2002","price":65.31},{"symbol":"IBM","date":"Jul 1 2002","price":63.86},{"symbol":"IBM","date":"Aug 1 2002","price":68.52},{"symbol":"IBM","date":"Sep 1 2002","price":53.01},{"symbol":"IBM","date":"Oct 1 2002","price":71.76},{"symbol":"IBM","date":"Nov 1 2002","price":79.16},{"symbol":"IBM","date":"Dec 1 2002","price":70.58},{"symbol":"IBM","date":"Jan 1 2003","price":71.22},{"symbol":"IBM","date":"Feb 1 2003","price":71.13},{"symbol":"IBM","date":"Mar 1 2003","price":71.57},{"symbol":"IBM","date":"Apr 1 2003","price":77.47},{"symbol":"IBM","date":"May 1 2003","price":80.48},{"symbol":"IBM","date":"Jun 1 2003","price":75.42},{"symbol":"IBM","date":"Jul 1 2003","price":74.28},{"symbol":"IBM","date":"Aug 1 2003","price":75.12},{"symbol":"IBM","date":"Sep 1 2003","price":80.91},{"symbol":"IBM","date":"Oct 1 2003","price":81.96},{"symbol":"IBM","date":"Nov 1 2003","price":83.08},{"symbol":"IBM","date":"Dec 1 2003","price":85.05},{"symbol":"IBM","date":"Jan 1 2004","price":91.06},{"symbol":"IBM","date":"Feb 1 2004","price":88.7},{"symbol":"IBM","date":"Mar 1 2004","price":84.41},{"symbol":"IBM","date":"Apr 1 2004","price":81.04},{"symbol":"IBM","date":"May 1 2004","price":81.59},{"symbol":"IBM","date":"Jun 1 2004","price":81.19},{"symbol":"IBM","date":"Jul 1 2004","price":80.19},{"symbol":"IBM","date":"Aug 1 2004","price":78.17},{"symbol":"IBM","date":"Sep 1 2004","price":79.13},{"symbol":"IBM","date":"Oct 1 2004","price":82.84},{"symbol":"IBM","date":"Nov 1 2004","price":87.15},{"symbol":"IBM","date":"Dec 1 2004","price":91.16},{"symbol":"IBM","date":"Jan 1 2005","price":86.39},{"symbol":"IBM","date":"Feb 1 2005","price":85.78},{"symbol":"IBM","date":"Mar 1 2005","price":84.66},{"symbol":"IBM","date":"Apr 1 2005","price":70.77},{"symbol":"IBM","date":"May 1 2005","price":70.18},{"symbol":"IBM","date":"Jun 1 2005","price":68.93},{"symbol":"IBM","date":"Jul 1 2005","price":77.53},{"symbol":"IBM","date":"Aug 1 2005","price":75.07},{"symbol":"IBM","date":"Sep 1 2005","price":74.7},{"symbol":"IBM","date":"Oct 1 2005","price":76.25},{"symbol":"IBM","date":"Nov 1 2005","price":82.98},{"symbol":"IBM","date":"Dec 1 2005","price":76.73},{"symbol":"IBM","date":"Jan 1 2006","price":75.89},{"symbol":"IBM","date":"Feb 1 2006","price":75.09},{"symbol":"IBM","date":"Mar 1 2006","price":77.17},{"symbol":"IBM","date":"Apr 1 2006","price":77.05},{"symbol":"IBM","date":"May 1 2006","price":75.04},{"symbol":"IBM","date":"Jun 1 2006","price":72.15},{"symbol":"IBM","date":"Jul 1 2006","price":72.7},{"symbol":"IBM","date":"Aug 1 2006","price":76.35},{"symbol":"IBM","date":"Sep 1 2006","price":77.26},{"symbol":"IBM","date":"Oct 1 2006","price":87.06},{"symbol":"IBM","date":"Nov 1 2006","price":86.95},{"symbol":"IBM","date":"Dec 1 2006","price":91.9},{"symbol":"IBM","date":"Jan 1 2007","price":93.79},{"symbol":"IBM","date":"Feb 1 2007","price":88.18},{"symbol":"IBM","date":"Mar 1 2007","price":89.44},{"symbol":"IBM","date":"Apr 1 2007","price":96.98},{"symbol":"IBM","date":"May 1 2007","price":101.54},{"symbol":"IBM","date":"Jun 1 2007","price":100.25},{"symbol":"IBM","date":"Jul 1 2007","price":105.4},{"symbol":"IBM","date":"Aug 1 2007","price":111.54},{"symbol":"IBM","date":"Sep 1 2007","price":112.6},{"symbol":"IBM","date":"Oct 1 2007","price":111},{"symbol":"IBM","date":"Nov 1 2007","price":100.9},{"symbol":"IBM","date":"Dec 1 2007","price":103.7},{"symbol":"IBM","date":"Jan 1 2008","price":102.75},{"symbol":"IBM","date":"Feb 1 2008","price":109.64},{"symbol":"IBM","date":"Mar 1 2008","price":110.87},{"symbol":"IBM","date":"Apr 1 2008","price":116.23},{"symbol":"IBM","date":"May 1 2008","price":125.14},{"symbol":"IBM","date":"Jun 1 2008","price":114.6},{"symbol":"IBM","date":"Jul 1 2008","price":123.74},{"symbol":"IBM","date":"Aug 1 2008","price":118.16},{"symbol":"IBM","date":"Sep 1 2008","price":113.53},{"symbol":"IBM","date":"Oct 1 2008","price":90.24},{"symbol":"IBM","date":"Nov 1 2008","price":79.65},{"symbol":"IBM","date":"Dec 1 2008","price":82.15},{"symbol":"IBM","date":"Jan 1 2009","price":89.46},{"symbol":"IBM","date":"Feb 1 2009","price":90.32},{"symbol":"IBM","date":"Mar 1 2009","price":95.09},{"symbol":"IBM","date":"Apr 1 2009","price":101.29},{"symbol":"IBM","date":"May 1 2009","price":104.85},{"symbol":"IBM","date":"Jun 1 2009","price":103.01},{"symbol":"IBM","date":"Jul 1 2009","price":116.34},{"symbol":"IBM","date":"Aug 1 2009","price":117},{"symbol":"IBM","date":"Sep 1 2009","price":118.55},{"symbol":"IBM","date":"Oct 1 2009","price":119.54},{"symbol":"IBM","date":"Nov 1 2009","price":125.79},{"symbol":"IBM","date":"Dec 1 2009","price":130.32},{"symbol":"IBM","date":"Jan 1 2010","price":121.85},{"symbol":"IBM","date":"Feb 1 2010","price":127.16},{"symbol":"IBM","date":"Mar 1 2010","price":125.55}]},"transform":[{"filter":"datum.symbol===\'IBM\'"}],"mark":{"type":"area","line":{"color":"darkgreen"},"color":{"x1":1,"y1":1,"x2":1,"y2":0,"gradient":"linear","stops":[{"offset":0,"color":"white"},{"offset":1,"color":"darkgreen"}]}},"encoding":{"x":{"field":"date","type":"temporal"},"y":{"field":"price","type":"quantitative"}}}'}">
  </clabs-chat-chart>`,
};

export const Showcase = {
  argTypes: controls,
  args: defaultArgs,
  parameters: {
    controls: {
      expanded: true,
    },
    layout: 'fullscreen',
  },
  /**
   * Renders the template for Showcase Storybook
   * @param {Object} args - arguments to be sent into the playbook
   * @param {string} args.chartTheme - theme for charts
   * @returns {TemplateResult<1>}
   */
  render: ({ chartTheme }) => html` <h3>Single layer Charts:</h3>
    <br />
    <h4>Box Plot</h4>
    <br />
    <clabs-chat-chart
      theme="${chartTheme}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Boxplot example with random data","data":{"values":[{"group":"Group A","value":34},{"group":"Group A","value":28},{"group":"Group A","value":55},{"group":"Group B","value":91},{"group":"Group B","value":81},{"group":"Group B","value":67},{"group":"Group C","value":45},{"group":"Group C","value":66},{"group":"Group C","value":73},{"group":"Group D","value":28},{"group":"Group D","value":35},{"group":"Group D","value":56},{"group":"Group E","value":12},{"group":"Group E","value":45},{"group":"Group E","value":99}]},"mark":"boxplot","encoding":{"y":{"field":"group","type":"nominal"},"x":{"field":"value","type":"quantitative"}}}'}"
      container-height="400px">
    </clabs-chat-chart>
    <br />
    <h4>Line Chart</h4>
    <br />
    <clabs-chat-chart
      theme="${chartTheme}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"IBM stock price over time","data":{"values":[{"symbol":"IBM","date":"Jan 1 2000","price":100.52},{"symbol":"IBM","date":"Feb 1 2000","price":92.11},{"symbol":"IBM","date":"Mar 1 2000","price":106.11},{"symbol":"IBM","date":"Apr 1 2000","price":99.95},{"symbol":"IBM","date":"May 1 2000","price":96.31},{"symbol":"IBM","date":"Jun 1 2000","price":98.33},{"symbol":"IBM","date":"Jul 1 2000","price":100.74},{"symbol":"IBM","date":"Aug 1 2000","price":118.62},{"symbol":"IBM","date":"Sep 1 2000","price":101.19},{"symbol":"IBM","date":"Oct 1 2000","price":88.5},{"symbol":"IBM","date":"Nov 1 2000","price":84.12},{"symbol":"IBM","date":"Dec 1 2000","price":76.47},{"symbol":"IBM","date":"Jan 1 2001","price":100.76},{"symbol":"IBM","date":"Feb 1 2001","price":89.98},{"symbol":"IBM","date":"Mar 1 2001","price":86.63},{"symbol":"IBM","date":"Apr 1 2001","price":103.7},{"symbol":"IBM","date":"May 1 2001","price":100.82},{"symbol":"IBM","date":"Jun 1 2001","price":102.35},{"symbol":"IBM","date":"Jul 1 2001","price":94.87},{"symbol":"IBM","date":"Aug 1 2001","price":90.25},{"symbol":"IBM","date":"Sep 1 2001","price":82.82},{"symbol":"IBM","date":"Oct 1 2001","price":97.58},{"symbol":"IBM","date":"Nov 1 2001","price":104.5},{"symbol":"IBM","date":"Dec 1 2001","price":109.36},{"symbol":"IBM","date":"Jan 1 2002","price":97.54},{"symbol":"IBM","date":"Feb 1 2002","price":88.82},{"symbol":"IBM","date":"Mar 1 2002","price":94.15},{"symbol":"IBM","date":"Apr 1 2002","price":75.82},{"symbol":"IBM","date":"May 1 2002","price":72.97},{"symbol":"IBM","date":"Jun 1 2002","price":65.31},{"symbol":"IBM","date":"Jul 1 2002","price":63.86},{"symbol":"IBM","date":"Aug 1 2002","price":68.52},{"symbol":"IBM","date":"Sep 1 2002","price":53.01},{"symbol":"IBM","date":"Oct 1 2002","price":71.76},{"symbol":"IBM","date":"Nov 1 2002","price":79.16},{"symbol":"IBM","date":"Dec 1 2002","price":70.58},{"symbol":"IBM","date":"Jan 1 2003","price":71.22},{"symbol":"IBM","date":"Feb 1 2003","price":71.13},{"symbol":"IBM","date":"Mar 1 2003","price":71.57},{"symbol":"IBM","date":"Apr 1 2003","price":77.47},{"symbol":"IBM","date":"May 1 2003","price":80.48},{"symbol":"IBM","date":"Jun 1 2003","price":75.42},{"symbol":"IBM","date":"Jul 1 2003","price":74.28},{"symbol":"IBM","date":"Aug 1 2003","price":75.12},{"symbol":"IBM","date":"Sep 1 2003","price":80.91},{"symbol":"IBM","date":"Oct 1 2003","price":81.96},{"symbol":"IBM","date":"Nov 1 2003","price":83.08},{"symbol":"IBM","date":"Dec 1 2003","price":85.05},{"symbol":"IBM","date":"Jan 1 2004","price":91.06},{"symbol":"IBM","date":"Feb 1 2004","price":88.7},{"symbol":"IBM","date":"Mar 1 2004","price":84.41},{"symbol":"IBM","date":"Apr 1 2004","price":81.04},{"symbol":"IBM","date":"May 1 2004","price":81.59},{"symbol":"IBM","date":"Jun 1 2004","price":81.19},{"symbol":"IBM","date":"Jul 1 2004","price":80.19},{"symbol":"IBM","date":"Aug 1 2004","price":78.17},{"symbol":"IBM","date":"Sep 1 2004","price":79.13},{"symbol":"IBM","date":"Oct 1 2004","price":82.84},{"symbol":"IBM","date":"Nov 1 2004","price":87.15},{"symbol":"IBM","date":"Dec 1 2004","price":91.16},{"symbol":"IBM","date":"Jan 1 2005","price":86.39},{"symbol":"IBM","date":"Feb 1 2005","price":85.78},{"symbol":"IBM","date":"Mar 1 2005","price":84.66},{"symbol":"IBM","date":"Apr 1 2005","price":70.77},{"symbol":"IBM","date":"May 1 2005","price":70.18},{"symbol":"IBM","date":"Jun 1 2005","price":68.93},{"symbol":"IBM","date":"Jul 1 2005","price":77.53},{"symbol":"IBM","date":"Aug 1 2005","price":75.07},{"symbol":"IBM","date":"Sep 1 2005","price":74.7},{"symbol":"IBM","date":"Oct 1 2005","price":76.25},{"symbol":"IBM","date":"Nov 1 2005","price":82.98},{"symbol":"IBM","date":"Dec 1 2005","price":76.73},{"symbol":"IBM","date":"Jan 1 2006","price":75.89},{"symbol":"IBM","date":"Feb 1 2006","price":75.09},{"symbol":"IBM","date":"Mar 1 2006","price":77.17},{"symbol":"IBM","date":"Apr 1 2006","price":77.05},{"symbol":"IBM","date":"May 1 2006","price":75.04},{"symbol":"IBM","date":"Jun 1 2006","price":72.15},{"symbol":"IBM","date":"Jul 1 2006","price":72.7},{"symbol":"IBM","date":"Aug 1 2006","price":76.35},{"symbol":"IBM","date":"Sep 1 2006","price":77.26},{"symbol":"IBM","date":"Oct 1 2006","price":87.06},{"symbol":"IBM","date":"Nov 1 2006","price":86.95},{"symbol":"IBM","date":"Dec 1 2006","price":91.9},{"symbol":"IBM","date":"Jan 1 2007","price":93.79},{"symbol":"IBM","date":"Feb 1 2007","price":88.18},{"symbol":"IBM","date":"Mar 1 2007","price":89.44},{"symbol":"IBM","date":"Apr 1 2007","price":96.98},{"symbol":"IBM","date":"May 1 2007","price":101.54},{"symbol":"IBM","date":"Jun 1 2007","price":100.25},{"symbol":"IBM","date":"Jul 1 2007","price":105.4},{"symbol":"IBM","date":"Aug 1 2007","price":111.54},{"symbol":"IBM","date":"Sep 1 2007","price":112.6},{"symbol":"IBM","date":"Oct 1 2007","price":111},{"symbol":"IBM","date":"Nov 1 2007","price":100.9},{"symbol":"IBM","date":"Dec 1 2007","price":103.7},{"symbol":"IBM","date":"Jan 1 2008","price":102.75},{"symbol":"IBM","date":"Feb 1 2008","price":109.64},{"symbol":"IBM","date":"Mar 1 2008","price":110.87},{"symbol":"IBM","date":"Apr 1 2008","price":116.23},{"symbol":"IBM","date":"May 1 2008","price":125.14},{"symbol":"IBM","date":"Jun 1 2008","price":114.6},{"symbol":"IBM","date":"Jul 1 2008","price":123.74},{"symbol":"IBM","date":"Aug 1 2008","price":118.16},{"symbol":"IBM","date":"Sep 1 2008","price":113.53},{"symbol":"IBM","date":"Oct 1 2008","price":90.24},{"symbol":"IBM","date":"Nov 1 2008","price":79.65},{"symbol":"IBM","date":"Dec 1 2008","price":82.15},{"symbol":"IBM","date":"Jan 1 2009","price":89.46},{"symbol":"IBM","date":"Feb 1 2009","price":90.32},{"symbol":"IBM","date":"Mar 1 2009","price":95.09},{"symbol":"IBM","date":"Apr 1 2009","price":101.29},{"symbol":"IBM","date":"May 1 2009","price":104.85},{"symbol":"IBM","date":"Jun 1 2009","price":103.01},{"symbol":"IBM","date":"Jul 1 2009","price":116.34},{"symbol":"IBM","date":"Aug 1 2009","price":117},{"symbol":"IBM","date":"Sep 1 2009","price":118.55},{"symbol":"IBM","date":"Oct 1 2009","price":119.54},{"symbol":"IBM","date":"Nov 1 2009","price":125.79},{"symbol":"IBM","date":"Dec 1 2009","price":130.32},{"symbol":"IBM","date":"Jan 1 2010","price":121.85},{"symbol":"IBM","date":"Feb 1 2010","price":127.16},{"symbol":"IBM","date":"Mar 1 2010","price":125.55}]},"transform":[{"filter":"datum.symbol===\'IBM\'"}],"mark":{"type":"area","line":{"color":"darkgreen"},"color":{"x1":1,"y1":1,"x2":1,"y2":0,"gradient":"linear","stops":[{"offset":0,"color":"white"},{"offset":1,"color":"darkgreen"}]}},"encoding":{"x":{"field":"date","type":"temporal"},"y":{"field":"price","type":"quantitative"}}}'}"
      container-height="300px">
    </clabs-chat-chart>
    <br />
    <h4>Bar Chart</h4>
    <br />
    <clabs-chat-chart
      theme="${chartTheme}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"A simple bar chart with embedded data","data":{"values":[{"x axis value":"A","y axis value":28000},{"x axis value":"B","y axis value":55000},{"x axis value":"C","y axis value":43000},{"x axis value":"D","y axis value":91000},{"x axis value":"E","y axis value":81000},{"x axis value":"F","y axis value":53000},{"x axis value":"G","y axis value":19000},{"x axis value":"H","y axis value":87000},{"x axis value":"I","y axis value":52000}]},"mark":"bar","encoding":{"x":{"field":"x axis value","type":"nominal","axis":{"labelAngle":0}},"y":{"field":"y axis value","type":"quantitative"}}}'}"
      container-height="350px">
    </clabs-chat-chart>
    <br />
    <h4>Horizontal Multi Bar Chart</h4>
    <br />
    <clabs-chat-chart
      theme="${chartTheme}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/barley.json"},"mark":"bar","encoding":{"x":{"aggregate":"sum","field":"yield"},"y":{"field":"variety"},"color":{"field":"site"}}}'}"
      container-height="350px">
    </clabs-chat-chart>
    <br />
    <h4>Pie Chart</h4>
    <br />
    <clabs-chat-chart
      theme="${chartTheme}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"Pie chart example","data":{"values":[{"category":"A","value":18},{"category":"B","value":10},{"category":"C","value":2}]},"mark":{"type":"arc","innerRadius":0},"encoding":{"theta":{"field":"value","type":"quantitative"},"color":{"field":"category","type":"nominal"}}}'}"
      container-height="300px">
    </clabs-chat-chart>
    <br />
    <h4>Donut Chart</h4>
    <br />
    <clabs-chat-chart
      theme="${chartTheme}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"A simple donut chart with embedded data.","data":{"values":[{"category":1,"value":4},{"category":2,"value":6},{"category":3,"value":10},{"category":4,"value":3},{"category":5,"value":7},{"category":6,"value":8}]},"mark":{"type":"arc","innerRadius":50},"encoding":{"theta":{"field":"value","type":"quantitative"},"color":{"field":"category","type":"nominal"}}}'}"
      container-height="300px">
    </clabs-chat-chart>
    <br />
    <h4>Heatmap</h4>
    <br />
    <clabs-chat-chart
      theme="${chartTheme}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","data":{"url":"https://vega.github.io/vega-lite/data/seattle-weather.csv"},"title":"Daily Max Temperatures (C) in Cleveland, OH","config":{"view":{"strokeWidth":0,"step":13},"axis":{"domain":false}},"mark":"rect","encoding":{"x":{"field":"date","timeUnit":"date","type":"ordinal","title":"Day","axis":{"labelAngle":0,"format":"%e"}},"y":{"field":"date","timeUnit":"month","type":"ordinal","title":"Month"},"color":{"field":"temp_max","aggregate":"max","type":"quantitative","legend":{"title":null}}}}'}"
      container-height="400px">
    </clabs-chat-chart>
    <br />
    <h4>Scatter Plot</h4>
    <br />
    <clabs-chat-chart
      theme="${chartTheme}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"A scatterplot showing body mass and flipper lengths of penguins.","data":{"url":"https://vega.github.io/vega-lite/examples/data/penguins.json"},"mark":"point","encoding":{"x":{"field":"Flipper Length (mm)","type":"quantitative","scale":{"zero":false}},"y":{"field":"Body Mass (g)","type":"quantitative","scale":{"zero":false}},"color":{"field":"Species","type":"nominal"}}}'}"
      container-height="400px">
    </clabs-chat-chart>
    <br />
    <h4>Bubble Plot</h4>
    <br />
    <clabs-chat-chart
      theme="${chartTheme}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Deaths by natural disasters","data":{"url":"https://vega.github.io/vega-lite/examples/data/disasters.csv"},"width":600,"height":400,"transform":[{"filter":"datum.Entity !== \'All natural disasters\'"}],"mark":{"type":"circle","opacity":0.8,"stroke":"black","strokeWidth":1},"encoding":{"x":{"field":"Year","type":"temporal","axis":{"grid":false}},"y":{"field":"Entity","type":"nominal","axis":{"title":""}},"size":{"field":"Deaths","type":"quantitative","title":"Annual Global Deaths","legend":{"clipHeight":30},"scale":{"rangeMax":5000}},"color":{"field":"Entity","type":"nominal","legend":null}}}'}"
      container-height="500px">
    </clabs-chat-chart>
    <br />
    <h4>Gradiented Map</h4>
    <br />
    <clabs-chat-chart
      theme="${chartTheme}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","title":"US Unemployment by county","data":{"url":"https://vega.github.io/editor/data/us-10m.json","format":{"type":"topojson","feature":"counties"}},"transform":[{"lookup":"id","from":{"data":{"url":"https://vega.github.io/editor/data/unemployment.tsv"},"key":"id","fields":["rate"]}}],"projection":{"type":"albersUsa"},"mark":"geoshape","encoding":{"color":{"field":"rate","type":"quantitative"}}}'}"
      container-height="500px">
    </clabs-chat-chart>
    <br />
    <h4>Orthographic world map</h4>
    <br />
    <clabs-chat-chart
      theme="${chartTheme}"
      content="${'{"$schema": "https://vega.github.io/schema/vega-lite/v5.json","width": 500,"height": 300,"params": [{"name": "projection","value": "orthographic"}],"data": {"url": "https://vega.github.io/vega-lite/examples/data/world-110m.json","format": {"type": "topojson", "feature": "countries"}},"projection": {"type": {"expr": "projection"}},"mark": {"type": "geoshape", "fill": "lightgray", "stroke": "gray"}}'}"
      container-height="450px">
    </clabs-chat-chart>
    <br />
    <br />
    <h3>Repeating layer Charts:</h3>
    <br />
    <h4>Interactive multi-scatter plot</h4>
    <br />
    <clabs-chat-chart
      theme="${chartTheme}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":{"row":["Horsepower","Acceleration","Miles_per_Gallon"],"column":["Miles_per_Gallon","Acceleration","Horsepower"]},"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"point","params":[{"name":"brush","select":{"type":"interval","resolve":"union","on":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","translate":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![event.shiftKey]"}},{"name":"grid","select":{"type":"interval","resolve":"global","translate":"[pointerdown[!event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![!event.shiftKey]"},"bind":"scales"}],"encoding":{"x":{"field":{"repeat":"column"},"type":"quantitative"},"y":{"field":{"repeat":"row"},"type":"quantitative","axis":{"minExtent":30}},"color":{"condition":{"param":"brush","field":"Origin","type":"nominal"},"value":"grey"}}}}'}"
      container-height="650px">
    </clabs-chat-chart>
    <br />
    <h4>Multi histogram</h4>
    <br />
    <clabs-chat-chart
      theme="${chartTheme}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":["Horsepower","Miles_per_Gallon","Acceleration","Displacement"],"columns":2,"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"bar","encoding":{"x":{"field":{"repeat":"repeat"},"bin":true},"y":{"aggregate":"count"},"color":{"field":"Origin"}}}}'}"
      container-height="400px">
    </clabs-chat-chart>
    <br />
    <br />
    <h3>Multi-layer charts:</h3>
    <br />
    <h4>Map + lines</h4>
    <br />
    <clabs-chat-chart
      theme="${chartTheme}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":700,"height":500,"view":{"stroke":"transparent"},"layer":[{"data":{"url":"https://vega.github.io/vega-lite/examples/data/londonBoroughs.json","format":{"type":"topojson","feature":"boroughs"}},"mark":{"type":"geoshape","stroke":"white","strokeWidth":2},"encoding":{"color":{"value":"#eee"}}},{"data":{"url":"https://vega.github.io/vega-lite/examples/data/londonCentroids.json","format":{"type":"json"}},"transform":[{"calculate":"indexof (datum.name, \' \') > 0  ? substring(datum.name,0,indexof(datum.name, \' \')) : datum.name","as":"bLabel"}],"mark":"text","encoding":{"longitude":{"field":"cx","type":"quantitative"},"latitude":{"field":"cy","type":"quantitative"},"text":{"field":"bLabel","type":"nominal"},"size":{"value":8},"opacity":{"value":0.6}}},{"data":{"url":"https://vega.github.io/vega-lite/examples/data/londonTubeLines.json","format":{"type":"topojson","feature":"line"}},"mark":{"type":"geoshape","filled":false,"strokeWidth":2},"encoding":{"color":{"field":"id","type":"nominal","legend":{"title":null,"orient":"bottom-right","offset":0},"scale":{"domain":["Bakerloo","Central","Circle","District","DLR","Hammersmith & City","Jubilee","Metropolitan","Northern","Piccadilly","Victoria","Waterloo & City"],"range":["rgb(137,78,36)","rgb(220,36,30)","rgb(255,206,0)","rgb(1,114,41)","rgb(0,175,173)","rgb(215,153,175)","rgb(106,114,120)","rgb(114,17,84)","rgb(0,0,0)","rgb(0,24,168)","rgb(0,160,226)","rgb(106,187,170)"]}}}}]}'}"
      container-height="450px">
    </clabs-chat-chart>
    <br />
    <h4>Parallel Coordinates</h4>
    <br />
    <clabs-chat-chart
      theme="${chartTheme}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Parallel coordinates example","data":{"url":"https://vega.github.io/vega-lite/examples/data/penguins.json"},"width":600,"height":300,"transform":[{"filter":"datum[\'Beak Length (mm)\']"},{"window":[{"op":"count","as":"index"}]},{"fold":["Beak Length (mm)","Beak Depth (mm)","Flipper Length (mm)","Body Mass (g)"]},{"joinaggregate":[{"op":"min","field":"value","as":"min"},{"op":"max","field":"value","as":"max"}],"groupby":["key"]},{"calculate":"(datum.value - datum.min) / (datum.max-datum.min)","as":"norm_val"},{"calculate":"(datum.min + datum.max) / 2","as":"mid"}],"layer":[{"mark":{"type":"rule","color":"#ccc"},"encoding":{"detail":{"aggregate":"count"},"x":{"field":"key"}}},{"mark":"line","encoding":{"color":{"type":"nominal","field":"Species"},"detail":{"type":"nominal","field":"index"},"opacity":{"value":0.3},"x":{"type":"nominal","field":"key"},"y":{"type":"quantitative","field":"norm_val","axis":null},"tooltip":[{"type":"quantitative","field":"Beak Length (mm)"},{"type":"quantitative","field":"Beak Depth (mm)"},{"type":"quantitative","field":"Flipper Length (mm)"},{"type":"quantitative","field":"Body Mass (g)"}]}},{"encoding":{"x":{"type":"nominal","field":"key"},"y":{"value":0}},"layer":[{"mark":{"type":"text","style":"label"},"encoding":{"text":{"aggregate":"max","field":"max"}}},{"mark":{"type":"tick","style":"tick","size":8,"color":"#ccc"}}]},{"encoding":{"x":{"type":"nominal","field":"key"},"y":{"value":150}},"layer":[{"mark":{"type":"text","style":"label"},"encoding":{"text":{"aggregate":"min","field":"mid"}}},{"mark":{"type":"tick","style":"tick","size":8,"color":"#ccc"}}]},{"encoding":{"x":{"type":"nominal","field":"key"},"y":{"value":300}},"layer":[{"mark":{"type":"text","style":"label"},"encoding":{"text":{"aggregate":"min","field":"min"}}},{"mark":{"type":"tick","style":"tick","size":8,"color":"#ccc"}}]}],"config":{"axisX":{"domain":false,"labelAngle":0,"tickColor":"#ccc","title":null},"view":{"stroke":null},"style":{"label":{"baseline":"middle","align":"right","dx":-5},"tick":{"orient":"horizontal"}}}}'}"
      container-height="500px">
    </clabs-chat-chart>
    <br />
    <br />
    <h4>30 day rolling average</h4>
    <clabs-chat-chart
      theme="${chartTheme}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Plot showing a 30 day rolling average with raw values in the background.","width":400,"height":300,"data":{"url":"https://vega.github.io/vega-lite/data/seattle-weather.csv"},"transform":[{"window":[{"field":"temp_max","op":"mean","as":"rolling_mean"}],"frame":[-15,15]}],"encoding":{"x":{"field":"date","type":"temporal","title":"Date"},"y":{"type":"quantitative","axis":{"title":"Max Temperature and Rolling Mean"}}},"layer":[{"mark":{"type":"point","opacity":0.3},"encoding":{"y":{"field":"temp_max","title":"Max Temperature"}}},{"mark":{"type":"line","color":"red","size":3},"encoding":{"y":{"field":"rolling_mean","title":"Rolling Mean of Max Temperature"}}}]}'}"
      container-height="350px">
    </clabs-chat-chart>
    <br />
    <h4>Candle stick chart</h4>
    <br />
    <clabs-chat-chart
      theme="${chartTheme}"
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":400,"description":"A candlestick chart","data":{"url":"https://vega.github.io/vega-lite/examples/data/ohlc.json"},"encoding":{"x":{"field":"date","type":"temporal","title":"Date in 2009","axis":{"format":"%m/%d","labelAngle":-45,"title":"Date in 2009"}},"y":{"type":"quantitative","scale":{"zero":false},"axis":{"title":"Price"}},"color":{"condition":{"test":"datum.open < datum.close","value":"#06982d"},"value":"#ae1325"}},"layer":[{"mark":"rule","encoding":{"y":{"field":"low"},"y2":{"field":"high"}}},{"mark":"bar","encoding":{"y":{"field":"open"},"y2":{"field":"close"}}}]}'}"
      container-height="350px">
    </clabs-chat-chart>
    <br />`,
};

export const RepeatingLayerCharts = {
  /**
   * Renders the template for Showcase Storybook
   * @returns {TemplateResult<1>}
   */
  render: () => html` <h4>Interactive multi-scatter plot</h4>
    <br />
    <clabs-chat-chart
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":{"row":["Horsepower","Acceleration","Miles_per_Gallon"],"column":["Miles_per_Gallon","Acceleration","Horsepower"]},"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"point","params":[{"name":"brush","select":{"type":"interval","resolve":"union","on":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","translate":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![event.shiftKey]"}},{"name":"grid","select":{"type":"interval","resolve":"global","translate":"[pointerdown[!event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![!event.shiftKey]"},"bind":"scales"}],"encoding":{"x":{"field":{"repeat":"column"},"type":"quantitative"},"y":{"field":{"repeat":"row"},"type":"quantitative","axis":{"minExtent":30}},"color":{"condition":{"param":"brush","field":"Origin","type":"nominal"},"value":"grey"}}}}'}"
      container-height="450px"
      container-width="600px">
    </clabs-chat-chart>
    <br />
    <clabs-chat-chart
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":{"row":["Horsepower","Acceleration","Miles_per_Gallon"],"column":["Miles_per_Gallon","Acceleration","Horsepower"]},"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"point","params":[{"name":"brush","select":{"type":"interval","resolve":"union","on":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","translate":"[pointerdown[event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![event.shiftKey]"}},{"name":"grid","select":{"type":"interval","resolve":"global","translate":"[pointerdown[!event.shiftKey], window:pointerup] > window:pointermove!","zoom":"wheel![!event.shiftKey]"},"bind":"scales"}],"encoding":{"x":{"field":{"repeat":"column"},"type":"quantitative"},"y":{"field":{"repeat":"row"},"type":"quantitative","axis":{"minExtent":30}},"color":{"condition":{"param":"brush","field":"Origin","type":"nominal"},"value":"grey"}}}}'}"
      container-height="950px">
    </clabs-chat-chart>
    <br />
    <br />
    <h4>Multi histogram</h4>
    <br />
    <clabs-chat-chart
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":["Horsepower","Miles_per_Gallon","Acceleration","Displacement"],"columns":2,"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"bar","encoding":{"x":{"field":{"repeat":"repeat"},"bin":true},"y":{"aggregate":"count"},"color":{"field":"Origin"}}}}'}"
      container-height="450px"
      container-width="800px">
    </clabs-chat-chart>
    <br />
    <clabs-chat-chart
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":["Horsepower","Miles_per_Gallon","Acceleration","Displacement"],"columns":2,"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"bar","encoding":{"x":{"field":{"repeat":"repeat"},"bin":true},"y":{"aggregate":"count"},"color":{"field":"Origin"}}}}'}"
      container-height="600px"
      container-width="400px">
    </clabs-chat-chart>
    <br />
    <clabs-chat-chart
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","repeat":["Horsepower","Miles_per_Gallon","Acceleration","Displacement"],"columns":2,"spec":{"data":{"url":"https://vega.github.io/vega-lite/examples/data/cars.json"},"mark":"bar","encoding":{"x":{"field":{"repeat":"repeat"},"bin":true},"y":{"aggregate":"count"},"color":{"field":"Origin"}}}}'}"
      container-height="1000px">
    </clabs-chat-chart>
    <br />`,
};

export const MultiLayerCharts = {
  /**
   * Renders the template for Showcase Storybook
   * @returns {TemplateResult<1>}
   */
  render: () => html`
    <h4>Map + lines</h4>
    <br />
    <clabs-chat-chart
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":700,"height":500,"view":{"stroke":"transparent"},"layer":[{"data":{"url":"https://vega.github.io/vega-lite/examples/data/londonBoroughs.json","format":{"type":"topojson","feature":"boroughs"}},"mark":{"type":"geoshape","stroke":"white","strokeWidth":2},"encoding":{"color":{"value":"#eee"}}},{"data":{"url":"https://vega.github.io/vega-lite/examples/data/londonCentroids.json","format":{"type":"json"}},"transform":[{"calculate":"indexof (datum.name, \' \') > 0  ? substring(datum.name,0,indexof(datum.name, \' \')) : datum.name","as":"bLabel"}],"mark":"text","encoding":{"longitude":{"field":"cx","type":"quantitative"},"latitude":{"field":"cy","type":"quantitative"},"text":{"field":"bLabel","type":"nominal"},"size":{"value":8},"opacity":{"value":0.6}}},{"data":{"url":"https://vega.github.io/vega-lite/examples/data/londonTubeLines.json","format":{"type":"topojson","feature":"line"}},"mark":{"type":"geoshape","filled":false,"strokeWidth":2},"encoding":{"color":{"field":"id","type":"nominal","legend":{"title":null,"orient":"bottom-right","offset":0},"scale":{"domain":["Bakerloo","Central","Circle","District","DLR","Hammersmith & City","Jubilee","Metropolitan","Northern","Piccadilly","Victoria","Waterloo & City"],"range":["rgb(137,78,36)","rgb(220,36,30)","rgb(255,206,0)","rgb(1,114,41)","rgb(0,175,173)","rgb(215,153,175)","rgb(106,114,120)","rgb(114,17,84)","rgb(0,0,0)","rgb(0,24,168)","rgb(0,160,226)","rgb(106,187,170)"]}}}}]}'}"
      container-height="450px">
    </clabs-chat-chart>
    <br />
    <h4>Parallel Coordinates</h4>
    <br />
    <clabs-chat-chart
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Parallel coordinates example","data":{"url":"https://vega.github.io/vega-lite/examples/data/penguins.json"},"width":600,"height":300,"transform":[{"filter":"datum[\'Beak Length (mm)\']"},{"window":[{"op":"count","as":"index"}]},{"fold":["Beak Length (mm)","Beak Depth (mm)","Flipper Length (mm)","Body Mass (g)"]},{"joinaggregate":[{"op":"min","field":"value","as":"min"},{"op":"max","field":"value","as":"max"}],"groupby":["key"]},{"calculate":"(datum.value - datum.min) / (datum.max-datum.min)","as":"norm_val"},{"calculate":"(datum.min + datum.max) / 2","as":"mid"}],"layer":[{"mark":{"type":"rule","color":"#ccc"},"encoding":{"detail":{"aggregate":"count"},"x":{"field":"key"}}},{"mark":"line","encoding":{"color":{"type":"nominal","field":"Species"},"detail":{"type":"nominal","field":"index"},"opacity":{"value":0.3},"x":{"type":"nominal","field":"key"},"y":{"type":"quantitative","field":"norm_val","axis":null},"tooltip":[{"type":"quantitative","field":"Beak Length (mm)"},{"type":"quantitative","field":"Beak Depth (mm)"},{"type":"quantitative","field":"Flipper Length (mm)"},{"type":"quantitative","field":"Body Mass (g)"}]}},{"encoding":{"x":{"type":"nominal","field":"key"},"y":{"value":0}},"layer":[{"mark":{"type":"text","style":"label"},"encoding":{"text":{"aggregate":"max","field":"max"}}},{"mark":{"type":"tick","style":"tick","size":8,"color":"#ccc"}}]},{"encoding":{"x":{"type":"nominal","field":"key"},"y":{"value":150}},"layer":[{"mark":{"type":"text","style":"label"},"encoding":{"text":{"aggregate":"min","field":"mid"}}},{"mark":{"type":"tick","style":"tick","size":8,"color":"#ccc"}}]},{"encoding":{"x":{"type":"nominal","field":"key"},"y":{"value":300}},"layer":[{"mark":{"type":"text","style":"label"},"encoding":{"text":{"aggregate":"min","field":"min"}}},{"mark":{"type":"tick","style":"tick","size":8,"color":"#ccc"}}]}],"config":{"axisX":{"domain":false,"labelAngle":0,"tickColor":"#ccc","title":null},"view":{"stroke":null},"style":{"label":{"baseline":"middle","align":"right","dx":-5},"tick":{"orient":"horizontal"}}}}'}"
      container-height="500px">
    </clabs-chat-chart>
    <br />
    <h4>Candle stick chart</h4>
    <br />
    <clabs-chat-chart
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","width":400,"description":"A candlestick chart","data":{"url":"https://vega.github.io/vega-lite/examples/data/ohlc.json"},"encoding":{"x":{"field":"date","type":"temporal","title":"Date in 2009","axis":{"format":"%m/%d","labelAngle":-45,"title":"Date in 2009"}},"y":{"type":"quantitative","scale":{"zero":false},"axis":{"title":"Price"}},"color":{"condition":{"test":"datum.open < datum.close","value":"#06982d"},"value":"#ae1325"}},"layer":[{"mark":"rule","encoding":{"y":{"field":"low"},"y2":{"field":"high"}}},{"mark":"bar","encoding":{"y":{"field":"open"},"y2":{"field":"close"}}}]}'}"
      container-height="350px">
    </clabs-chat-chart>
    <br />
    <h4>30 day rolling average</h4>
    <br />
    <clabs-chat-chart
      content="${'{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","description":"Plot showing a 30 day rolling average with raw values in the background.","width":400,"height":300,"data":{"url":"https://vega.github.io/vega-lite/data/seattle-weather.csv"},"transform":[{"window":[{"field":"temp_max","op":"mean","as":"rolling_mean"}],"frame":[-15,15]}],"encoding":{"x":{"field":"date","type":"temporal","title":"Date"},"y":{"type":"quantitative","axis":{"title":"Max Temperature and Rolling Mean"}}},"layer":[{"mark":{"type":"point","opacity":0.3},"encoding":{"y":{"field":"temp_max","title":"Max Temperature"}}},{"mark":{"type":"line","color":"red","size":3},"encoding":{"y":{"field":"rolling_mean","title":"Rolling Mean of Max Temperature"}}}]}'}"
      container-height="350px">
    </clabs-chat-chart>
    <br />
  `,
};

export const Playground = {
  argTypes: controls,
  args: defaultArgs,
  parameters: {
    controls: {
      expanded: true,
    },
    layout: 'fullscreen',
  },
  /**
   * Renders the template for Playground Storybook
   * @param {Object} args - arguments to be sent into the playbook
   * @param {string} args.content - vega specification as a string
   * @param {boolean} args.carbonify - enable post-hoc carbon charts styling
   * @param {string} args.containerHeight - CSS string for container height
   * @param {string} args.containerWidth - CSS string for container width
   * @param {boolean} args.chartTheme - string to apply theme
   * @param {boolean} args.renderMethod - string to pick rendering
   * @param {boolean} args.loading - boolean to disable loading animation
   * @param {boolean} args.enableZooming - boolean to enable chart zooming
   * @param {boolean} args.enableTooltip - boolean to enable tooltip in chart
   * @param {boolean} args.disableOptions - hide option buttons
   * @param {boolean} args.disableEditor - hide edit button
   * @param {boolean} args.disableCodeInspector - hide inspector button
   * @param {boolean} args.disableExport - hide export button
   * @param {boolean} args.disableFullscreen - hide fullscreen button
   * @returns {TemplateResult<1>}
   */
  render: ({
    content,
    carbonify,
    containerHeight,
    containerWidth,
    chartTheme,
    renderMethod,
    loading,
    enableZooming,
    enableTooltip,
    disableOptions,
    disableEditor,
    disableCodeInspector,
    disableExport,
    disableFullscreen,
  }) => html`
    <clabs-chat-chart
      content="${content}"
      ?carbonify="${carbonify}"
      container-height="${containerHeight}"
      container-width="${containerWidth}"
      theme="${chartTheme}"
      render-method="${renderMethod}"
      ?loading="${loading}"
      ?enable-zooming="${enableZooming}"
      ?enable-tooltip="${enableTooltip}"
      ?disable-options="${disableOptions}"
      ?disable-editor="${disableEditor}"
      ?disable-code-inspector="${disableCodeInspector}"
      ?disable-export="${disableExport}"
      ?disable-fullscreen="${disableFullscreen}">
    </clabs-chat-chart>
  `,
};

export const ChartSkeleton = {
  /**
   * Renders the template for Showcase Storybook
   * @returns {TemplateResult<1>}
   */
  render: () => html` <clabs-chat-chart theme="dark" carbonify>
  </clabs-chat-chart>`,
};

export const ChartError = {
  /**
   * Renders the template for Showcase Storybook
   * @returns {TemplateResult<1>}
   */
  render: () => html` <clabs-chat-chart content="${'{}'}"> </clabs-chat-chart>`,
};
