/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef } from 'react';

// import type { Meta, StoryObj } from '@storybook/react';

import { Toc, TocItem, TocList, TocSection, TocSections } from '../index';

import mdx from './WhatsNew.mdx';
// import '@carbon/ibm-products/css/index.min.css';
import './storybook.scss';

const meta = {
  component: Toc,
  title: 'Components/WhatsNew',
  subcomponents: {
    TocList,
    TocItem,
    TocSections,
    TocSection,
  },
  parameters: {
    docs: {
      page: mdx,
    },
  },
  //   argTypes: {
  //     children: {
  //       control: null,
  //       description: 'tacos',
  //     },
  //     // 'TocList.children': {
  //     //   control: null,
  //     //   description: 'tacos',
  //     // },
  //   },
};
export default meta;

/**
 * Toc component story for WhatsNew
 */
export const TocStory = () => {
  /* ************************************* */
  // INTERNAL STATE
  /* ************************************* */
  // REFS
  const bodyRef = useRef(null);
  const tocRef = useRef(null);
  /* ************************************* */

  /* ************************************* */
  // CONSTANTS
  const longText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc et felis vitae dui iaculis condimentum ut at dui. Sed quis enim vulputate sem dignissim sagittis. Interdum et malesuada fames ac ante ipsum primis in faucibus. Phasellus bibendum scelerisque semper. Curabitur nec consectetur lacus, fringilla dignissim quam. Curabitur a venenatis ante. Aliquam varius egestas dolor. Etiam interdum, massa eget viverra cursus, mi velit blandit ligula, a vestibulum arcu risus at quam. Vivamus et magna sodales, tincidunt nisl a, interdum sapien. Vivamus convallis malesuada elit. Maecenas lacinia imperdiet metus sed semper. Proin sodales viverra convallis.

Praesent nec dapibus est. Mauris venenatis nulla id felis cursus tempor. Aenean bibendum id nisi ut mollis. Aliquam erat volutpat. Nullam egestas, tellus id bibendum iaculis, sem dui tincidunt arcu, eu laoreet nibh dolor vitae dui. Maecenas sodales mollis hendrerit. Integer pharetra fermentum lacus quis sollicitudin. Fusce consequat vitae velit a bibendum. Suspendisse diam ex, pulvinar a dictum ultrices, scelerisque ac erat. Sed lectus urna, imperdiet at turpis at, placerat laoreet arcu. Sed tortor nisl, pulvinar lobortis augue in, aliquet cursus nisi.`;
  /* ************************************* */

  /* ************************************* */
  // CALL BACKS
  /* ************************************* */

  /* ************************************* */
  // EFFECTS
  /* ************************************* */

  return (
    <div ref={bodyRef} className="storyBody">
      <Toc ref={tocRef}>
        <div className="TocExampleLayout">
          <TocList>
            <TocItem>Section 1 marker</TocItem>
            <TocItem>Section 2 marker</TocItem>
            <TocItem>Section 3 marker</TocItem>
          </TocList>
          <div className="TocExampleContentColumn">
            <TocSections>
              <TocSection as="div">
                <h1>Section 1 (div element)</h1>
                <p>{longText}</p>
              </TocSection>
              <TocSection as="section">
                <h1>Section 2 (section element)</h1>
                <p>{longText}</p>
              </TocSection>
              <TocSection as="article">
                <h1>Section 3 - (article element)</h1>
                <p>{longText}</p>
              </TocSection>
            </TocSections>
          </div>
        </div>
      </Toc>
    </div>
  );
};
TocStory.storyName = 'Table of contents';
