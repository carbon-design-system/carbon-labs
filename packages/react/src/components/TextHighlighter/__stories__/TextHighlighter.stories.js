/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import mdx from './TextHighlighter.mdx';
import { TextHighlighter } from '../components/TextHighlighter';
import '../components/text-highlighter.scss';
import {
  Column,
  ContainedList,
  ContainedListItem,
  Grid,
  Link,
  OperationalTag,
  Popover,
  PopoverContent,
  StructuredListBody,
  StructuredListCell,
  StructuredListRow,
  StructuredListWrapper,
  Tag,
  Tile,
} from '@carbon/react';
import { ChevronDown, ChevronUp } from '@carbon/react/icons';
import './storybook.scss';

export default {
  title: 'Components/TextHighlighter',
  component: TextHighlighter,
  parameters: {
    docs: {
      page: mdx,
    },
    layout: 'centered',
  },
};

export const Default = {
  parameters: {
    controls: {
      exclude: ['children'],
    },
  },
  argTypes: {
    kind: {
      control: { type: 'radio' },
      options: ['mark', 'ins', 'del'],
      description: 'Specify the kind of highlighter.',
    },
    type: {
      control: { type: 'select' },
      options: [
        'default',
        'magenta',
        'purple',
        'blue',
        'cyan',
        'teal',
        'gray',
        'cool-gray',
        'warm-gray',
        'high-contrast',
      ],
      description:
        'Specify the type of highlighter. The "type" property only applies to the "mark" variant. The "ins" and "del" variants have their own pre-defined types.',
    },
    reference: {
      control: { type: 'text' },
      description:
        'Specify the reference. The "reference" property only applies to the "mark" variant. You can use symbol or max of 2 characters.',
    },
  },
  args: {
    kind: 'mark',
    type: 'default',
  },
  /**
   * Renders the template for Playground Storybook
   * @param {Object} args - arguments to be sent into the playbook
   * @param {string} args.kind - Specify the kind of highlighter
   * @param {string} args.type - Specify the type of highlighter. The "type" property only applies to the "mark" variant. The "ins" and "del" variants have their own pre-defined types
   * @param {string} args.reference - Specify the reference. The "reference" property only applies to the "mark" variant. You can use symbol or max of 2 characters
   */
  render: (args) => (
    <Grid>
      <Column lg={16} md={8} sm={4}>
        <p>
          Lorem ipsum dolor sit amet,{' '}
          <TextHighlighter {...args}>
            consectetur adipiscing elit
          </TextHighlighter>
          , sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
          nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur{' '}
          <TextHighlighter {...args}>
            sint occaecat cupidatat non proident
          </TextHighlighter>
          , sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </Column>
    </Grid>
  ),
};

export const VersionComparison = {
  /**
   * Renders the template for Playground Storybook
   */
  render: () => (
    <Grid className="th-compare">
      <Column lg={16} md={8} sm={4}>
        <Tile>
          <StructuredListWrapper isCondensed>
            <StructuredListBody>
              <StructuredListRow>
                <StructuredListCell className="th-compare-title">
                  <h6>
                    V3{' '}
                    <Tag type="blue" size="sm">
                      {'Active'}
                    </Tag>
                  </h6>
                </StructuredListCell>
                <StructuredListCell className="th-compare-title">
                  <h6>
                    V2{' '}
                    <Tag type="gray" size="sm">
                      {'Inactive'}
                    </Tag>
                  </h6>
                </StructuredListCell>
              </StructuredListRow>

              <StructuredListRow>
                <StructuredListCell>
                  <h6>Code</h6>A
                </StructuredListCell>
                <StructuredListCell>
                  <h6>Code</h6>A
                </StructuredListCell>
              </StructuredListRow>

              <StructuredListRow>
                <StructuredListCell>
                  <h6>Value</h6>
                  AGRICULTURE<TextHighlighter kind="ins">
                    ,
                  </TextHighlighter>{' '}
                  HUNTING{' '}
                  <TextHighlighter kind="ins">AND FORESTRY</TextHighlighter>
                </StructuredListCell>
                <StructuredListCell>
                  <h6>Value</h6>
                  AGRICULTURE <TextHighlighter kind="del">
                    AND
                  </TextHighlighter>{' '}
                  HUNTING
                </StructuredListCell>
              </StructuredListRow>

              <StructuredListRow>
                <StructuredListCell>
                  <h6>Description</h6>
                  The Agriculture, Forestry, Fishing and Hunting sector
                  comprises entities primarily engaged in{' '}
                  <TextHighlighter kind="ins">some</TextHighlighter> crops,
                  raising animals, harvesting timber, and harvesting fish{' '}
                  <TextHighlighter kind="ins">
                    and other animals
                  </TextHighlighter>
                  .
                </StructuredListCell>
                <StructuredListCell>
                  <h6>Description</h6>
                  The Agriculture, Forestry, Fishing and Hunting sector
                  comprises entities primarily engaged in{' '}
                  <TextHighlighter kind="del">growing</TextHighlighter> crops,
                  raising animals, harvesting timber, and harvesting fish.
                </StructuredListCell>
              </StructuredListRow>

              <StructuredListRow>
                <StructuredListCell>
                  <h6>Long description</h6>A farm may consist of a single tract
                  of land{' '}
                  <TextHighlighter kind="ins">
                    or a number of separate tracts
                  </TextHighlighter>
                  .
                </StructuredListCell>
                <StructuredListCell>
                  <h6>Long description</h6>A farm may consist of a single tract
                  of land.
                </StructuredListCell>
              </StructuredListRow>

              <StructuredListRow>
                <StructuredListCell>
                  <h6>ID</h6>
                  211
                </StructuredListCell>
                <StructuredListCell>
                  <h6>ID</h6>
                  211<TextHighlighter kind="del">B</TextHighlighter>
                </StructuredListCell>
              </StructuredListRow>

              <StructuredListRow>
                <StructuredListCell>
                  <h6>Parent values</h6>
                  A- Agriculture
                </StructuredListCell>
                <StructuredListCell>
                  <h6>Parent values</h6>
                  A- Agriculture
                </StructuredListCell>
              </StructuredListRow>
            </StructuredListBody>
          </StructuredListWrapper>
        </Tile>
      </Column>
    </Grid>
  ),
};

export const ReferenceAnotation = {
  /**
   * Renders the template for Playground Storybook
   */
  render: () => {
    return (
      <Grid fullWidth narrow className="th-ref">
        <Column lg={12}>
          <Tile>
            <div className="th-ref-header">
              <p>Note-title-2321</p>
              <p>12-Nov-2024</p>
            </div>

            <div className="th-ref-body">
              <p>
                In{' '}
                <TextHighlighter type="magenta" reference="EA">
                  2017
                </TextHighlighter>
                , the company reported{' '}
                <TextHighlighter type="purple" reference="VA">
                  $79.1 billion
                </TextHighlighter>{' '}
                in revenue and{' '}
                <TextHighlighter type="purple" reference="VA">
                  $5.8 billion
                </TextHighlighter>{' '}
                in income from continuing operations, which includes a one-time
                charge of{' '}
                <TextHighlighter type="purple" reference="VA">
                  $5.5 billion
                </TextHighlighter>{' '}
                associated with the enactment of U.S. tax reform.
              </p>
              <p>
                Operating (non-GAAP) earnings were{' '}
                <TextHighlighter type="purple" reference="VA">
                  $12.9 billion
                </TextHighlighter>{' '}
                , which excludes the one-time charge.
              </p>
              <p>
                Diluted earnings per share from continuing operations were{' '}
                <TextHighlighter type="purple" reference="VA">
                  $6.14
                </TextHighlighter>{' '}
                as reported and{' '}
                <TextHighlighter type="purple" reference="VA">
                  $13.80
                </TextHighlighter>{' '}
                on an operating (non-GAAP) basis.
              </p>
              <p>
                The company generated{' '}
                <TextHighlighter type="purple" reference="VA">
                  $16.7 billion
                </TextHighlighter>{' '}
                in cash from operations,{' '}
                <TextHighlighter type="purple" reference="VA">
                  $13.0 billion
                </TextHighlighter>{' '}
                in free cash flow and delivered shareholder returns of{' '}
                <TextHighlighter type="purple" reference="VA">
                  $9.8 billion
                </TextHighlighter>{' '}
                in gross common stock repurchases and dividends.
              </p>
              <p>
                Total{' '}
                <TextHighlighter type="purple" reference="VA">
                  consolidated
                </TextHighlighter>{' '}
                revenue in{' '}
                <TextHighlighter type="magenta" reference="EA">
                  2017
                </TextHighlighter>{' '}
                <TextHighlighter type="blue" reference="FI">
                  decreased
                </TextHighlighter>{' '}
                <TextHighlighter type="purple" reference="VA">
                  1.0 percent
                </TextHighlighter>{' '}
                as reported and{' '}
                <TextHighlighter type="purple" reference="VA">
                  1.3 percent
                </TextHighlighter>{' '}
                year to year adjusted for currency.
              </p>
              <p>
                The company returned to revenue{' '}
                <TextHighlighter type="blue" reference="FI">
                  growth
                </TextHighlighter>{' '}
                in the fourth quarter with an{' '}
                <TextHighlighter type="blue" reference="FI">
                  increase
                </TextHighlighter>{' '}
                of{' '}
                <TextHighlighter type="purple" reference="VA">
                  3.6 percent
                </TextHighlighter>{' '}
                as reported and{' '}
                <TextHighlighter type="purple" reference="VA">
                  0.9 percent
                </TextHighlighter>{' '}
                adjusted for currency.
              </p>
              <p>
                Year-to-year revenue performance improved{' '}
                <TextHighlighter type="blue" reference="FI">
                  sequentially
                </TextHighlighter>{' '}
                in the second half of{' '}
                <TextHighlighter type="magenta" reference="EA">
                  2017
                </TextHighlighter>{' '}
                compared to first-half performance.
              </p>
              <p>
                Contributors to the second-half{' '}
                <TextHighlighter type="blue" reference="FI">
                  improvement
                </TextHighlighter>{' '}
                included: momentum in{' '}
                <TextHighlighter type="teal" reference="PR">
                  cloud
                </TextHighlighter>{' '}
                and{' '}
                <TextHighlighter type="teal" reference="PR">
                  as-a-Service
                </TextHighlighter>{' '}
                offerings, strong{' '}
                <TextHighlighter type="teal" reference="PR">
                  Systems
                </TextHighlighter>{' '}
                <TextHighlighter type="blue" reference="FI">
                  growth
                </TextHighlighter>{' '}
                across{' '}
                <TextHighlighter type="teal" reference="PR">
                  IBM Z
                </TextHighlighter>
                ,{' '}
                <TextHighlighter type="teal" reference="PR">
                  Power
                </TextHighlighter>{' '}
                and{' '}
                <TextHighlighter type="teal" reference="PR">
                  Storage
                </TextHighlighter>
                , improved software transactional performance and improved{' '}
                <TextHighlighter type="blue" reference="FI">
                  growth
                </TextHighlighter>{' '}
                in Consulting.
              </p>
              <p>
                In{' '}
                <TextHighlighter type="magenta" reference="EA">
                  2017
                </TextHighlighter>
                , the company continued to deliver solid revenue{' '}
                <TextHighlighter type="blue" reference="FI">
                  growth
                </TextHighlighter>{' '}
                in its strategic{' '}
                <TextHighlighter type="teal" reference="PR">
                  imperatives
                </TextHighlighter>{' '}
                which generated{' '}
                <TextHighlighter type="purple" reference="VA">
                  $36.5 billion
                </TextHighlighter>{' '}
                of revenue and grew{' '}
                <TextHighlighter type="purple" reference="VA">
                  11 percent
                </TextHighlighter>{' '}
                as reported and adjusted for currency, with{' '}
                <TextHighlighter type="purple" reference="VA">
                  double-digit
                </TextHighlighter>{' '}
                <TextHighlighter type="blue" reference="FI">
                  growth
                </TextHighlighter>{' '}
                in{' '}
                <TextHighlighter type="teal" reference="PR">
                  cloud
                </TextHighlighter>
                ,{' '}
                <TextHighlighter type="teal" reference="PR">
                  security
                </TextHighlighter>{' '}
                and{' '}
                <TextHighlighter type="teal" reference="PR">
                  mobile
                </TextHighlighter>
                , as the company continues to build new products and offerings
                and continuously reinvent its platforms.
              </p>
              <p>
                These are not separate businesses, they are offerings across the
                segments that address opportunities in{' '}
                <TextHighlighter type="teal" reference="PR">
                  analytics
                </TextHighlighter>
                ,{' '}
                <TextHighlighter type="teal" reference="PR">
                  cloud
                </TextHighlighter>
                ,{' '}
                <TextHighlighter type="teal" reference="PR">
                  security
                </TextHighlighter>{' '}
                and{' '}
                <TextHighlighter type="teal" reference="PR">
                  mobile
                </TextHighlighter>{' '}
                .
              </p>
              <p>
                The company is embedding{' '}
                <TextHighlighter type="teal" reference="PR">
                  cloud
                </TextHighlighter>{' '}
                and{' '}
                <TextHighlighter type="teal" reference="PR">
                  cognitive
                </TextHighlighter>{' '}
                capabilities across the business and the strategic{' '}
                <TextHighlighter type="teal" reference="PR">
                  imperatives
                </TextHighlighter>{' '}
                reflect the progress being made in helping enterprise clients
                extract value from data and become{' '}
                <TextHighlighter type="teal" reference="PR">
                  digital
                </TextHighlighter>
                ? businesses.
              </p>
              <p>
                Strategic{' '}
                <TextHighlighter type="teal" reference="PR">
                  imperatives
                </TextHighlighter>{' '}
                growth in{' '}
                <TextHighlighter type="magenta" reference="EA">
                  2017
                </TextHighlighter>{' '}
                largely represented organic growth as the acquisitive content
                leveled on a year-to-year basis.
              </p>
              <p>
                Total{' '}
                <TextHighlighter type="teal" reference="PR">
                  Cloud
                </TextHighlighter>{' '}
                revenue of{' '}
                <TextHighlighter type="purple" reference="VA">
                  $17.0 billion
                </TextHighlighter>{' '}
                <TextHighlighter type="blue" reference="FI">
                  increased
                </TextHighlighter>{' '}
                <TextHighlighter type="purple" reference="VA">
                  24 percent
                </TextHighlighter>{' '}
                as reported and adjusted for currency, with{' '}
                <TextHighlighter type="teal" reference="PR">
                  as-a-Service
                </TextHighlighter>
                ? revenue up 31 percent as reported and adjusted for currency.
              </p>
              <p>
                The annual exit run rate for{' '}
                <TextHighlighter type="teal" reference="PR">
                  as-a-Service
                </TextHighlighter>
                ? revenue{' '}
                <TextHighlighter type="blue" reference="FI">
                  increased
                </TextHighlighter>{' '}
                to $10.3 billion in{' '}
                <TextHighlighter type="magenta" reference="EA">
                  2017
                </TextHighlighter>{' '}
                compared to{' '}
                <TextHighlighter type="purple" reference="VA">
                  $8.6 billion
                </TextHighlighter>{' '}
                in{' '}
                <TextHighlighter type="magenta" reference="EA">
                  2016
                </TextHighlighter>{' '}
                .
              </p>
              <p>
                <TextHighlighter type="teal" reference="PR">
                  Analytics
                </TextHighlighter>{' '}
                revenue of{' '}
                <TextHighlighter type="purple" reference="VA">
                  $20.6 billion
                </TextHighlighter>{' '}
                <TextHighlighter type="blue" reference="FI">
                  increased
                </TextHighlighter>{' '}
                <TextHighlighter type="purple" reference="VA">
                  6 percent
                </TextHighlighter>{' '}
                as reported and adjusted for currency.
              </p>
              <p>
                <TextHighlighter type="teal" reference="PR">
                  Mobile
                </TextHighlighter>{' '}
                revenue{' '}
                <TextHighlighter type="blue" reference="FI">
                  increased
                </TextHighlighter>{' '}
                <TextHighlighter type="purple" reference="VA">
                  19 percent
                </TextHighlighter>{' '}
                as reported and adjusted for currency and{' '}
                <TextHighlighter type="teal" reference="PR">
                  Security
                </TextHighlighter>{' '}
                revenue{' '}
                <TextHighlighter type="blue" reference="FI">
                  increased
                </TextHighlighter>{' '}
                <TextHighlighter type="purple" reference="VA">
                  55 percent
                </TextHighlighter>{' '}
                (
                <TextHighlighter type="purple" reference="VA">
                  54 percent
                </TextHighlighter>{' '}
                adjusted for currency), driven by security software{' '}
                <TextHighlighter type="teal" reference="PR">
                  solutions
                </TextHighlighter>{' '}
                and strong demand for the pervasive encryption capabilities in
                the new z14{' '}
                <TextHighlighter type="teal" reference="PR">
                  mainframe
                </TextHighlighter>
                .
              </p>
            </div>
          </Tile>
        </Column>
        <Column lg={4}>
          <Tile className="th-ref-right-panel">
            <div className="th-ref-right-panel-container">
              <div className="th-ref-right-panel-header">
                <h3>Entity types</h3>
                <p>
                  The legends and reference label for the entities are provided
                  below.
                </p>
              </div>
              <div className="th-ref-right-panel-body">
                <ContainedList title="" label="">
                  <ContainedListItem className="th-ref-entity th-ref-entity-blue">
                    Financial outcome <sup>FI</sup>
                  </ContainedListItem>
                  <ContainedListItem className="th-ref-entity th-ref-entity-magenta">
                    Earning period <sup>EA</sup>
                  </ContainedListItem>
                  <ContainedListItem className="th-ref-entity th-ref-entity-purple">
                    Value <sup>VA</sup>
                  </ContainedListItem>
                  <ContainedListItem className="th-ref-entity th-ref-entity-teal">
                    Product or service <sup>PR</sup>
                  </ContainedListItem>
                </ContainedList>
              </div>
            </div>
          </Tile>
        </Column>
      </Grid>
    );
  },
};

export const DocumentVersioning = {
  /**
   * Renders the template for Playground Storybook
   */
  render: () => (
    <Grid fullWidth narrow className="th-doc">
      <Column lg={16} md={8} sm={4}>
        <Tile className="th-doc-wrapper">
          <h1>
            Text highlighters{' '}
            <TextHighlighter kind={'ins'}>and annotations</TextHighlighter>
          </h1>
          <p>
            Text highlighters{' '}
            <TextHighlighter kind={'ins'}>and annotations</TextHighlighter>{' '}
            serve <TextHighlighter kind={'del'}>several</TextHighlighter>{' '}
            <TextHighlighter kind={'ins'}>various</TextHighlighter> purposes in
            website or web applications:
          </p>
          <p>
            <ol>
              <li>
                <strong>Enhanced readability:</strong> By allowing users to
                highlight or annotate text, websites and applications can
                improve readability and comprehension, especially for longer
                passages or complex content. Users can mark important points,
                make notes, or highlight key phrases, which can aid in
                understanding.
              </li>
              <li>
                <strong>Facilitating collaboration:</strong> In{' '}
                <TextHighlighter kind={'del'}>collaborative</TextHighlighter>{' '}
                environments such as educational platforms, research tools, or
                document sharing platforms, text highlighters and annotations
                enable users to collaborate more effectively. Users can
                highlight areas of interest, leave comments, or provide feedback
                for others to see.
              </li>
              <li>
                <strong>Personalization:</strong> Text highlighters{' '}
                <TextHighlighter kind={'ins'}>and annotations</TextHighlighter>{' '}
                allow users to personalize their experience by marking sections
                that are relevant or interesting to them. This customization can
                enhance user engagement and satisfaction.
              </li>
              <li>
                <strong>Studying and research:</strong> In educational or
                research contexts, text highlighters{' '}
                <TextHighlighter kind={'ins'}>and annotations</TextHighlighter>{' '}
                are invaluable tools for studying, analyzing, and synthesizing
                information. Users can mark important passages, jot down
                thoughts or questions, and organize their notes for future
                reference.
              </li>
              <li>
                <strong>Accessibility:</strong> Text highlighters{' '}
                <TextHighlighter kind={'ins'}>and annotations</TextHighlighter>{' '}
                can improve accessibility for users with disabilities, such as
                visual impairments or cognitive disabilities.{' '}
                <TextHighlighter kind={'ins'}>
                  Annotations can provide additional context or explanations for
                  content, while text highlighters can draw attention to
                  important information.
                </TextHighlighter>
              </li>
              <li>
                <strong>Content curation:</strong> In content-heavy websites or
                applications, text highlighters{' '}
                <TextHighlighter kind={'ins'}>and annotations</TextHighlighter>{' '}
                can help users curate and save relevant information for later
                reference. Users can highlight text or annotate it with tags,
                comments, or categorizations to organize their findings
                effectively.
              </li>
            </ol>
          </p>
          <p>
            Overall, text highlighters{' '}
            <TextHighlighter kind={'ins'}>and annotations</TextHighlighter>{' '}
            contribute to a richer and more interactive user experience,
            empowering users to engage with content in{' '}
            <TextHighlighter kind={'del'}>significant</TextHighlighter>{' '}
            <TextHighlighter kind={'ins'}>meaningful</TextHighlighter> ways and
            extract maximum value from it.
          </p>
        </Tile>
      </Column>
    </Grid>
  ),
};

export const DocumentHighlightingWithSource = {
  /**
   * Renders the template for Playground Storybook
   */
  render: function DocumentDemo() {
    const [sourceOpen, setSourceOpen] = useState(false);
    return (
      <Grid fullWidth narrow className="th-doc">
        <Column lg={16} md={8} sm={4}>
          <Tile className="th-doc-wrapper">
            <h1>Text highlighters and annotations</h1>
            <p>
              Text highlighters and annotations serve several various purposes
              in website or web applications:
            </p>
            <ol>
              <li>
                <p>
                  <strong>Enhanced readability:</strong> By allowing users to
                  highlight or annotate text, websites and applications can
                  improve readability and comprehension, especially for longer
                  passages or complex content. Users can mark important points,
                  make notes, or highlight key phrases, which can aid in
                  understanding.
                </p>
              </li>
              <li>
                <p>
                  <strong>Facilitating collaboration:</strong> In collaborative
                  environments such as educational platforms, research tools, or
                  document sharing platforms, text highlighters and annotations
                  enable users to collaborate more effectively. Users can
                  highlight areas of interest, leave comments, or provide
                  feedback for others to see.
                </p>
              </li>
              <li>
                <p>
                  <strong>Personalization:</strong> Text highlighters and
                  annotations allow users to personalize their experience by
                  marking sections that are relevant or interesting to them.
                  This customization can enhance user engagement and
                  satisfaction.
                </p>
              </li>
              <li>
                <p>
                  <strong>Studying and research:</strong> In educational or
                  research contexts, text highlighters and annotations are
                  invaluable tools for studying, analyzing, and synthesizing
                  information. Users can mark important passages, jot down
                  thoughts or questions, and organize their notes for future
                  reference.
                </p>
              </li>
              <li>
                <p>
                  <strong>Accessibility:</strong> Text highlighters and
                  annotations can improve accessibility for users with
                  disabilities, such as visual impairments or cognitive
                  disabilities.{' '}
                  <TextHighlighter kind="mark" type="purple">
                    Annotations can provide additional context or explanations
                    for content, while text highlighters can draw attention to
                    important information.
                  </TextHighlighter>
                  <Popover
                    open={sourceOpen}
                    onRequestClose={() => setSourceOpen(false)}>
                    <OperationalTag
                      size="sm"
                      text={
                        <>
                          Source {sourceOpen ? <ChevronUp /> : <ChevronDown />}
                        </>
                      }
                      onClick={() => {
                        setSourceOpen(!sourceOpen);
                      }}></OperationalTag>
                    <PopoverContent>
                      <span className="th-doc-source">
                        <Link href="#" target="_blank">
                          Source 1
                        </Link>
                        <Link href="#" target="_blank">
                          Source 2
                        </Link>
                        <Link href="#" target="_blank">
                          Source 3
                        </Link>
                      </span>
                    </PopoverContent>
                  </Popover>
                </p>
              </li>
              <li>
                <p>
                  <strong>Content curation:</strong> In content-heavy websites
                  or applications, text highlighters and annotations can help
                  users curate and save relevant information for later
                  reference. Users can highlight text or annotate it with tags,
                  comments, or categorizations to organize their findings
                  effectively.
                </p>
              </li>
            </ol>
            <p>
              Overall, text highlighters and annotations contribute to a richer
              and more interactive user experience, empowering users to engage
              with content in significant meaningful ways and extract maximum
              value from it.
            </p>
          </Tile>
        </Column>
      </Grid>
    );
  },
};
