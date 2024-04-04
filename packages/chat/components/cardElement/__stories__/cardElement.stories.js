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
  title: 'Components/Chat/cardElement',
  tags: ['autodocs'],
};

const defaultCardElements = {
  title: 'United States',
  link: 'https://en.wikipedia.org/wiki/United_States',
  shortenedUrl: 'wikipedia.org',
  'image-url':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg/250px-Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg.png',
  description:
    'The United States of America (USA or U.S.A.), commonly known as the United States (US or U.S.) or America, is a country primarily located in North America, between Canada and Mexico. It is a federation of 50 states, a federal capital district (Washington, D.C.),',
};

export const Default = () => html`
  <c4ai--chat-card
    .cardElements=${defaultCardElements}
    type="url"
    content="https://en.wikipedia.org/wiki/Artificial_intelligence">
  </c4ai--chat-card>
`;

const playgroundExamples = {
  'Wikipedia: USA': {
    title: 'United States',
    link: 'https://en.wikipedia.org/wiki/United_States',
    shortenedUrl: 'wikipedia.org',
    'image-url':
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg/250px-Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg.png',
    description:
      'The United States of America (USA or U.S.A.), commonly known as the United States (US or U.S.) or America, is a country primarily located in North America, between Canada and Mexico. It is a federation of 50 states, a federal capital district (Washington, D.C.),',
  },
  Instagram: {
    title: 'Instagram',
    link: 'https://www.instagram.com',
    shortenedUrl: 'instagram.com',
    'image-url':
      'https://socialsharepreview.com/api/image-proxy?url=https%3A%2F%2Fstatic.cdninstagram.com%2Frsrc.php%2Fv3%2FyR%2Fr%2FhexDR1NOpRC.png',
    description:
      'Instagram: A simple, fun & creative way to capture, edit and share your pictures',
  },
  NYT: {
    title: 'The New York Times - Breaking News, US News, World News and Videos',
    link: 'https://www.nyt.com',
    shortenedUrl: 'nyt.com',
    'image-url':
      'https://socialsharepreview.com/api/image-proxy?url=https%3A%2F%2Fstatic01.nyt.com%2Fnewsgraphics%2Fimages%2Ficons%2FdefaultPromoCrop.png',
    description:
      'Live news, investigations, opinion, photos and video by the journalists of The New York T...',
  },
};

export const Playground = Default.bind();
Playground.argTypes = {
  cardElements: {
    control: 'select',
    options: Object.keys(playgroundExamples),
    mapping: playgroundExamples,
  },
  content: { control: 'text' },
};
Playground.args = {
  cardElements: 'Wikipedia: USA',
  content: 'Edit text',
};
