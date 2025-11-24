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

export const ReferenceAnnotation = {
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
                The airship &quot;
                <TextHighlighter type="magenta" reference="OR">
                  The Leviathan
                </TextHighlighter>
                ,&quot; a magnificent vessel of gleaming chrome and polished
                mahogany, glided silently above the bustling metropolis of{' '}
                <TextHighlighter type="purple" reference="LO">
                  Neo-Atheria
                </TextHighlighter>
                .
              </p>
              <p>
                Within its opulent grand salon,{' '}
                <TextHighlighter type="blue" reference="PE">
                  Captain Amelia Croft
                </TextHighlighter>
                , a woman of sharp wit and steely resolve, surveyed the
                gathering of dignitaries. Among them were{' '}
                <TextHighlighter type="blue" reference="PE">
                  Lord Sterlingworth
                </TextHighlighter>
                , the eccentric inventor of the &quot;
                <TextHighlighter type="cyan" reference="TE">
                  Gravitation Nullifier
                </TextHighlighter>
                &quot;, a device that defied the very laws of physics, and{' '}
                <TextHighlighter type="blue" reference="PE">
                  Baroness Von Schatten
                </TextHighlighter>
                , a renowned archaeologist who had recently unearthed a cryptic
                artifact from the long-lost city of{' '}
                <TextHighlighter type="purple" reference="LO">
                  Atlantis
                </TextHighlighter>
                .
              </p>
              <p>
                The air crackled with anticipation as{' '}
                <TextHighlighter type="blue" reference="PE">
                  Professor Alistair Finch
                </TextHighlighter>
                , a renowned astrophysicist from the{' '}
                <TextHighlighter type="magenta" reference="OR">
                  University of Elysium
                </TextHighlighter>
                , prepared to unveil his groundbreaking theory on interstellar
                travel. The fate of humanity, it seemed, hung precariously in
                the balance, poised on the precipice of a new era of exploration
                and discovery.
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
                    Person <sup>PE</sup>
                  </ContainedListItem>
                  <ContainedListItem className="th-ref-entity th-ref-entity-magenta">
                    Organization <sup>OR</sup>
                  </ContainedListItem>
                  <ContainedListItem className="th-ref-entity th-ref-entity-purple">
                    Location <sup>LO</sup>
                  </ContainedListItem>
                  <ContainedListItem className="th-ref-entity th-ref-entity-teal">
                    Technology <sup>TE</sup>
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

/**
 *
 */
const DocumentHighlightingWithSourceComponent = () => {
  const [sourceOpen, setSourceOpen] = useState(false);
  return (
    <Grid fullWidth narrow className="th-doc">
      <Column lg={16} md={8} sm={4}>
        <Tile className="th-doc-wrapper">
          <h1>Text highlighters and annotations</h1>
          <p>
            Text highlighters and annotations serve several various purposes in
            website or web applications:
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
                highlight areas of interest, leave comments, or provide feedback
                for others to see.
              </p>
            </li>
            <li>
              <p>
                <strong>Personalization:</strong> Text highlighters and
                annotations allow users to personalize their experience by
                marking sections that are relevant or interesting to them. This
                customization can enhance user engagement and satisfaction.
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
                  Annotations can provide additional context or explanations for
                  content, while text highlighters can draw attention to
                  important information.
                </TextHighlighter>
                <Popover
                  open={sourceOpen}
                  onRequestClose={() => setSourceOpen(false)}>
                  <OperationalTag
                    size="sm"
                    text={
                      <>Source {sourceOpen ? <ChevronUp /> : <ChevronDown />}</>
                    }
                    renderIcon={ChevronUp}
                    onClick={() => {
                      setSourceOpen(!sourceOpen);
                    }}
                  />
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
                <strong>Content curation:</strong> In content-heavy websites or
                applications, text highlighters and annotations can help users
                curate and save relevant information for later reference. Users
                can highlight text or annotate it with tags, comments, or
                categorizations to organize their findings effectively.
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
};

export const DocumentHighlightingWithSource = {
  /**
   *
   */
  render: () => <DocumentHighlightingWithSourceComponent />,
};
