/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../cardElement';
import { html } from 'lit';
import '@carbon/web-components/es/components/button/index.js';

// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
export default {
  title: 'Components/Core/Card',
  component: 'clabs-chat-card',
};

const defaultCardElements = {
  title: 'United States',
  link: 'https://en.wikipedia.org/wiki/United_States',
  shortenedUrl: 'wikipedia.org',
  imageUrl:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg/250px-Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg.png',
  description:
    'The United States of America (USA or U.S.A.), commonly known as the United States (US or U.S.) or America, is a country primarily located in North America, between Canada and Mexico. It is a federation of 50 states, a federal capital district (Washington, D.C.),',
};

export const Default = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html` <clabs-chat-card
    .cardElements=${defaultCardElements}
    type="url"
    content="https://en.wikipedia.org/wiki/Artificial_intelligence">
  </clabs-chat-card>`,
};

const defaultPlaygroundArgs = {
  type: 'url',
  autoGeneration: false,
  content: 'https://en.wikipedia.org/wiki/United_States',
  title: 'United States',
  link: 'https://en.wikipedia.org/wiki/United_States',
  shortenedUrl: 'wikipedia.org',
  imageUrl:
    'https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg',
  description:
    'The United States of America (USA or U.S.A.), commonly known as the United States (US or U.S.) or America, is a country primarily located in North America, between Canada and Mexico. It is a federation of 50 states, a federal capital district (Washington, D.C.),',
};

const playgroundControls = {
  type: {
    control: { type: 'select' },
    description: 'Card type',
    options: ['url', 'video', 'file'],
    table: { category: 'Card type' },
  },
  autoGeneration: {
    control: { type: 'boolean' },
    description:
      'Auto generate all from a single URL (video and url) or get file data',
    table: { category: 'Auto generate' },
  },
  content: {
    control: { type: 'text' },
    description: 'URL to auto generate',
    table: { category: 'Auto generate' },
  },
  apiURL: {
    control: { type: 'text' },
    description: 'API to fetch parameters:',
    table: { category: 'Auto generate' },
  },
  title: {
    control: { type: 'text' },
    description: 'Card title',
    table: { category: 'Manual input' },
  },
  description: {
    control: { type: 'text' },
    description: 'Card description',
    table: { category: 'Manual input' },
  },
  imageUrl: {
    control: { type: 'text' },
    description: 'Display image url',
    table: { category: 'Manual input' },
  },
  shortenedUrl: {
    control: { type: 'text' },
    description: 'Website title next to link',
    table: { category: 'Manual input' },
  },
  link: {
    control: { type: 'text' },
    description: 'http url to open new window',
    table: { category: 'Manual input' },
  },
};

export const Playground = {
  argTypes: playgroundControls,
  args: defaultPlaygroundArgs,
  parameters: {
    controls: {
      expanded: true,
    },
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'storybook-default',
    },
  },
  /**
   * Renders the template for Playground Storybook
   * @param {Object} args - arguments to be sent into the playbook
   * @param {string} args.type - card type
   * @param {string} args.autoGeneration - card autoGeneration flag
   * @param {string} args.content - content to generate from
   * @param {string} args.apiURL - url to query and receive data
   * @param {string} args.title - card title
   * @param {string} args.description - card description
   * @param {string} args.imageUrl - url to top display image
   * @param {string} args.shortenedUrl - shortened website name
   * @param {string} args.link - link to take users to
   */
  render: ({
    type,
    autoGeneration,
    content,
    apiURL,
    title,
    description,
    imageUrl,
    shortenedUrl,
    link,
  }) => html`
    ${autoGeneration
      ? html` <clabs-chat-card type="${type}" content="${content}" /> `
      : html`
          <clabs-chat-card
            type="${type}"
            .cardElements=${{
              title: title,
              description: description,
              imageUrl: imageUrl,
              shortenedUrl: shortenedUrl,
              link: link,
              apiURL: apiURL,
            }} />
        `}
  `,
};

const urlExamples = [
  {
    title: 'United States',
    link: 'https://en.wikipedia.org/wiki/United_States',
    shortenedUrl: 'wikipedia.org',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg/250px-Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg.png',
    description:
      'The United States of America (USA or U.S.A.), commonly known as the United States (US or U.S.) or America, is a country primarily located in North America, between Canada and Mexico. It is a federation of 50 states, a federal capital district (Washington, D.C.),',
  },
  {
    title: 'Instagram',
    link: 'https://www.instagram.com',
    shortenedUrl: 'instagram.com',
    imageUrl:
      'https://socialsharepreview.com/api/image-proxy?url=https%3A%2F%2Fstatic.cdninstagram.com%2Frsrc.php%2Fv3%2FyR%2Fr%2FhexDR1NOpRC.png',
    description:
      'Instagram: A simple, fun & creative way to capture, edit and share your pictures',
  },
  {
    title: 'The New York Times - Breaking News, US News, World News and Videos',
    link: 'https://www.nyt.com',
    shortenedUrl: 'nyt.com',
    imageUrl:
      'https://socialsharepreview.com/api/image-proxy?url=https%3A%2F%2Fstatic01.nyt.com%2Fnewsgraphics%2Fimages%2Ficons%2FdefaultPromoCrop.png',
    description:
      'Live news, investigations, opinion, photos and video by the journalists of The New York T...',
  },
];

const fileExamples = [
  {
    title: 'Arxiv_ai_papers.pdf',
    link: 'https://arxiv.org/pdf/2312.05688.pdf',
    shortenedUrl: 'arxiv.org',
  },
  {
    title: 'Airports.csv',
    link: 'https://github.com/vega/vega-datasets/blob/main/data/airports.csv',
    shortenedUrl: 'github.com/vega',
  },
  {
    title: 'A Literature Survey of Recent Advances in Chatbots',
    link: 'https://arxiv.org/pdf/2201.06657.pdf',
    shortenedUrl: 'arxiv.org',
  },
];

const audioExamples = [
  {
    title: 'Second Hungarian Rhapsody',
    description: 'By Franz Liszt',
    link: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Franz_Liszt_-_Second_Hungarian_Rhapsody.ogg',
  },
  {
    title: 'Quintet No. 1 in Bb major, movement 2',
    description: 'By Giovanni Giuseppe Cambini',
    link: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Giovanni_Giuseppe_Cambini_-_Quintet_No._1_in_Bb_major%2C_movement_2.ogg',
  },
  {
    title: 'Klavierkonzert d-moll- 3. Allegro',
    description: 'By Johann Sebastian Bach',
    link: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Johann_Sebastian_Bach_-_Klavierkonzert_d-moll_-_3._Allegro.ogg',
  },
];

export const Showcase = {
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'storybook-default',
    },
  },
  /**
   * Renders the template for Showcase Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html`
    <h4>URL Cards</h4>
    <br />
    <div style="display:inline-flex; gap:10px;">
      <clabs-chat-card .cardElements=${urlExamples[0]} type="url">
      </clabs-chat-card>
      <clabs-chat-card
        content="https://en.wikipedia.org/wiki/Apollo_11"
        type="url">
      </clabs-chat-card>
      <clabs-chat-card .cardElements=${urlExamples[2]} type="url">
      </clabs-chat-card>
    </div>
    <br />
    <br />
    <h4>Video Cards</h4>
    <br />
    <div style="display:inline-flex; gap:10px;">
      <clabs-chat-card
        content="https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7d/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv.360p.webm"
        type="video">
      </clabs-chat-card>

      <clabs-chat-card
        content="https://upload.wikimedia.org/wikipedia/commons/transcoded/6/6c/Polar_orbit.ogv/Polar_orbit.ogv.360p.vp9.webm"
        type="video">
      </clabs-chat-card>
      <clabs-chat-card
        content="https://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/Paris_lockdown_-_Vimeo.webm/Paris_lockdown_-_Vimeo.webm.1080p.vp9.webm"
        type="video">
      </clabs-chat-card>
    </div>
    <br />
    <br />
    <h4>File Cards</h4>
    <br />
    <div style="display:inline-flex; gap:10px;">
      <clabs-chat-card .cardElements=${fileExamples[0]} type="file">
      </clabs-chat-card>
      <clabs-chat-card .cardElements=${fileExamples[1]} type="file">
      </clabs-chat-card>
      <clabs-chat-card
        content="https://github.com/vega/vega-datasets/blob/main/data/co2-concentration.csv"
        type="file">
      </clabs-chat-card>
    </div>
    <br />
    <br />
    <h4>Audio Cards</h4>
    <br />
    <div style="display:inline-flex; gap:10px;">
      <clabs-chat-card .cardElements=${audioExamples[0]} type="audio">
      </clabs-chat-card>
      <clabs-chat-card .cardElements=${audioExamples[1]} type="audio">
      </clabs-chat-card>
      <clabs-chat-card .cardElements=${audioExamples[2]} type="audio">
      </clabs-chat-card>
    </div>
  `,
};
