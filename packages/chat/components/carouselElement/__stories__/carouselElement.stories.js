/**
 * @license
 *
 * Copyright IBM Corp. 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../carouselElement';
import { html } from 'lit';

// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
export default {
  title: 'Components/Chat/Carousel',
  tags: ['autodocs'],
};

const carouselExamples = [
  {
    name: 'urls',
    content:
      '["https://www.wikipedia.org","https://www.ibm.com","https://www.google.com","https://www.reddit.com","https://www.github.com","https://www.arxiv.org","https://www.archive.org","https://www.instagram.com"]',
  },
  {
    name: 'images',
    content:
      '["https://bouqs.com/blog/wp-content/uploads/2019/05/20_summer-cosmos.jpg","https://bouqs.com/blog/wp-content/uploads/2019/05/summer-dahlia.jpg","https://bouqs.com/blog/wp-content/uploads/2023/06/zinnia-gbcbfedd94_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/chrysanthemum-5668882_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/celosia-7299458_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/05/sunflower-fields.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/snapdragon-20809_1280.jpg","https://bouqs.com/blog/wp-content/uploads/2021/09/strawflower-362280_1280.jpg"]',
  },
  {
    name: 'files',
    content:
      '["https://vega.github.io/vega-lite/examples/data/disasters.csv","https://vega.github.io/editor/data/unemployment.tsv","https://vega.github.io/vega-lite/data/barley.json","https://vega.github.io/vega-lite/examples/data/ohlc.json","https://vega.github.io/vega-lite/examples/data/stocks.csv"]',
  },
  {
    name: 'videos',
    content:
      '["https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7d/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv.360p.webm","https://upload.wikimedia.org/wikipedia/commons/transcoded/6/6c/Polar_orbit.ogv/Polar_orbit.ogv.360p.vp9.webm","https://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/Paris_lockdown_-_Vimeo.webm/Paris_lockdown_-_Vimeo.webm.1080p.vp9.webm"]',
  },
  {
    name: 'sounds',
    content:
      '["https://upload.wikimedia.org/wikipedia/commons/f/f5/Giovanni_Giuseppe_Cambini_-_Quintet_No._1_in_Bb_major%2C_movement_2.ogg","https://upload.wikimedia.org/wikipedia/commons/2/20/Franz_Liszt_-_Second_Hungarian_Rhapsody.ogg","https://upload.wikimedia.org/wikipedia/commons/b/b6/Johann_Sebastian_Bach_-_Klavierkonzert_d-moll_-_3._Allegro.ogg","https://upload.wikimedia.org/wikipedia/commons/2/25/Schuberts_8th_Symphony%2C_2nd_movement_Andante_con_moto_in_E_major.ogg","https://upload.wikimedia.org/wikipedia/commons/b/b4/Wolfgang_Amadeus_Mozart_-_Klarinettenkonzert_A-Dur_-_1._Allegro.ogg"]',
  },
  {
    name: 'multi',
    content:
      '["https://bouqs.com/blog/wp-content/uploads/2019/05/20_summer-cosmos.jpg","https://vega.github.io/vega-lite/examples/data/disasters.csv","https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7d/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv/Apollo_11._Television_clip_of_Buzz_descending_the_ladder_and_stepping_onto_the_moon%2C_1094228.ogv.360p.webm","https://upload.wikimedia.org/wikipedia/commons/f/f5/Giovanni_Giuseppe_Cambini_-_Quintet_No._1_in_Bb_major%2C_movement_2.ogg"]',
  },
];

export const Default = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html` <div
    style="height:calc(100vh - 84px); overflow:hidden; display:flex;max-width:100%;width:100%;">
    <clabs-chat-carousel content="${carouselExamples[0].content}">
    </clabs-chat-carousel>
  </div>`,
};

export const Showcase = {
  /**
   * Renders the template for Storybook
   *
   * @returns {TemplateResult<1>}
   */
  render: () => html` <div
    style="height:calc(100vh - 84px); overflow-x:hidden;max-width:100%;width:100%;">
    ${carouselExamples.map(
      (example) =>
        html`
          <div style="width:100%">
            <h5>${example.name}</h5>
            <clabs-chat-carousel content="${example.content}">
            </clabs-chat-carousel>
          </div>
        `
    )}
  </div>`,
};
