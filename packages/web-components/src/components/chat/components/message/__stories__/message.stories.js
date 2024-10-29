/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../message';
import { html } from 'lit';

// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
export default {
  title: 'Components/Chat/Message',
  tags: ['autodocs'],
};

const elements = [
  {
    content: 'Here is an image:',
    type: 'text',
  },
  {
    content:
      'https://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg',
    type: 'img',
  },
  {
    content: 'Here is a video:',
    type: 'text',
  },
  {
    content:
      'https://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/Paris_lockdown_-_Vimeo.webm/Paris_lockdown_-_Vimeo.webm.1080p.vp9.webm',
    type: 'video',
  },
  {
    content: 'Here is your code:',
    type: 'text',
  },
  {
    content:
      'from math import sqrt\n#prime function to check given number prime or not:\ndef Prime(number,itr):\n\t#base condition\n ....',
    type: 'code',
  },
];
export const Default = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html`
    <h4>With your own JSON message object:</h4>
    <h2></h2>
    <i>Using elements={your JSON} like so:</i>
    <br />
    <br />
    <clabs-chat-code
      max-height="123px"
      content="${JSON.stringify(elements, null, '\t')}"></clabs-chat-code>
    <h4>Result:</h4>
    <clabs-chat-message time-stamp="12:00" .elements="${elements}">
    </clabs-chat-message>
    <h2></h2>
    <h4>With the raw-text attribute:</h4>
    <h2></h2>
    <i>raw-text="Hello world"</i><br />
    <i>Only recommended for plain text responses</i>
    <h4>Result:</h4>
    <clabs-chat-message time-stamp="12:00" raw-text="hello world" origin="user">
    </clabs-chat-message>
    <h2></h2>
    <h4>With complex raw-text:</h4>
    <i
      >Uses auto-parsing to differentiate and render components, used in token
      streaming.</i
    ><br />
    <clabs-chat-code
      max-height="123px"
      content="${'<h2>Here you go:<h2>\n```code```\nhttp://site.com\nResulting file:\nhttp://www.site.org/file.csv\nWhat else do you need?'}"></clabs-chat-code>
    <h4>Result:</h4>
    <clabs-chat-message
      time-stamp="12:00"
      raw-text="${'<h2>Here you go:<h2>\n```code```\nhttp://site.com\nResulting file:\nhttp://www.site.org/file.csv\nWhat else do you need?'}"
      origin="user">
    </clabs-chat-message>
    <i> </i>
  `,
};
