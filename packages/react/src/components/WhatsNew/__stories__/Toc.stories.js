/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Grid, Column } from '@carbon/react';

import {
  TocItem,
  TocList,
  TocSection,
  TocSections,
  TocActiveTracker,
} from '../index';

import mdx from './WhatsNew.mdx';
import './storybook.scss';

const meta = {
  component: TocSections,
  title: 'Patterns/WhatsNew',
  subcomponents: {
    TocList,
    TocItem,
    TocSections,
    TocSection,
    TocActiveTracker,
  },
  parameters: {
    docs: {
      page: mdx,
    },
  },
};
export default meta;

/**
 * Toc component story for WhatsNew - demonstrates a two-column layout
 * with table of contents navigation on the right and content sections on the left
 */
export const TocStory = () => {
  /* ************************************* */
  // CONSTANTS
  const longText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc et felis vitae dui iaculis condimentum ut at dui. Sed quis enim vulputate sem dignissim sagittis. Interdum et malesuada fames ac ante ipsum primis in faucibus. Phasellus bibendum scelerisque semper. Curabitur nec consectetur lacus, fringilla dignissim quam. Curabitur a venenatis ante. Aliquam varius egestas dolor. Etiam interdum, massa eget viverra cursus, mi velit blandit ligula, a vestibulum arcu risus at quam. Vivamus et magna sodales, tincidunt nisl a, interdum sapien. Vivamus convallis malesuada elit. Maecenas lacinia imperdiet metus sed semper. Proin sodales viverra convallis.

Praesent nec dapibus est. Mauris venenatis nulla id felis cursus tempor. Aenean bibendum id nisi ut mollis. Aliquam erat volutpat. Nullam egestas, tellus id bibendum iaculis, sem dui tincidunt arcu, eu laoreet nibh dolor vitae dui. Maecenas sodales mollis hendrerit. Integer pharetra fermentum lacus quis sollicitudin. Fusce consequat vitae velit a bibendum. Suspendisse diam ex, pulvinar a dictum ultrices, scelerisque ac erat. Sed lectus urna, imperdiet at turpis at, placerat laoreet arcu. Sed tortor nisl, pulvinar lobortis augue in, aliquet cursus nisi.`;

  const mediumText = `Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.`;
  /* ************************************* */

  return (
    <>
      <Grid fullWidth className="TocExampleLayout">
        {/* Left column: Content sections - 12/16 on lg+, 16/16 below lg */}
        <Column lg={12} md={8} sm={4} className="TocExampleContentColumn">
          <TocSections>
            <TocSection>
              <h2 id="introduction">Introduction</h2>
              <p>{longText}</p>
              <p>{mediumText}</p>
            </TocSection>

            <TocSection>
              <h2 id="getting-started">Getting Started</h2>
              <p>{longText}</p>
              <h3>Prerequisites</h3>
              <p>{mediumText}</p>
            </TocSection>

            <TocSection>
              <h2 id="installation">Installation</h2>
              <p>{mediumText}</p>
              <pre>
                <code>npm install @carbon/ibm-products</code>
              </pre>
              <p>{longText}</p>
            </TocSection>

            <TocSection>
              <h2 id="configuration">Configuration</h2>
              <p>{longText}</p>
              <h3>Basic Setup</h3>
              <p>{mediumText}</p>
            </TocSection>

            <TocSection>
              <h2 id="usage">Usage</h2>
              <p>{mediumText}</p>
              <p>{longText}</p>
              <h3>Examples</h3>
              <p>{mediumText}</p>
            </TocSection>

            <TocSection>
              <h2 id="api-reference">API Reference</h2>
              <p>{longText}</p>
              <h3>Components</h3>
              <p>{mediumText}</p>
              <h3>Props</h3>
              <p>{mediumText}</p>
            </TocSection>
          </TocSections>
        </Column>

        {/* Right column: Table of contents navigation - 4/16 on lg+, 0/16 below lg */}
        <Column lg={4} md={0} sm={0} className="TocExampleNavColumn">
          <TocList ariaLabel="Page sections">
            <TocItem href="#introduction">Introduction</TocItem>
            <TocItem href="#getting-started">Getting Started</TocItem>
            <TocItem href="#installation">Installation</TocItem>
            <TocItem href="#configuration">Configuration</TocItem>
            <TocItem href="#usage">Usage</TocItem>
            <TocItem href="#api-reference">API Reference</TocItem>
          </TocList>
        </Column>
      </Grid>
      {/* TocActiveTracker enables active state tracking via IntersectionObserver */}
      <TocActiveTracker />
    </>
  );
};
TocStory.storyName = 'Table of contents';
