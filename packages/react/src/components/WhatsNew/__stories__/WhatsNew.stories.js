/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useCallback, useRef, useState } from 'react';
import { Close, Gift, Launch, Notification } from '@carbon/react/icons';
import mdx from './WhatsNew.mdx';
import { usePrefix } from '@carbon-labs/utilities';
import {
  Toc,
  TocList,
  TocItem,
  TocSection,
  TocSections,
  View,
  ViewStack,
  Bubble,
  BubbleHeader,
} from '../index';
import { ScrollGradient, Tearsheet, pkg } from '@carbon/ibm-products'; //ScrollGradient, pkg
import {
  Button,
  ContentSwitcher,
  Heading,
  Link,
  Section,
  Switch,
  Tag,
} from '@carbon/react';
// import '@carbon/ibm-products/css/index.min.css';
import './storybook.scss';

pkg.component.ScrollGradient = true;

export default {
  title: 'Patterns/WhatsNew',
  component: 'WhatsNewPattern',
  subcomponents: {
    TocList,
    TocItem,
    TocSections,
    TocSection,
    Bubble,
    BubbleHeader,
    ViewStack,
    View,
  },
  parameters: {
    docs: {
      page: mdx,
      defaultName: 'Overview+',
    },
  },
};

/**
 * Default story for WhatsNew
 */
export const WhatsNewPattern = () => {
  /* ************************************* */
  // INTERNAL STATE
  const [contentIndex, setContentIndex] = useState(0);
  const [currentReleaseNotifications, setCurrentReleaseNotifications] =
    useState(0);
  const [totalReleaseNotifications, setTotalReleaseNotifications] = useState(0);
  const [shouldShowReleaseNotification, setShouldShowReleaseNotification] =
    useState(false);
  const [shouldShowAnnouncement, setShouldShowAnnouncement] = useState(false);
  /* ************************************* */
  // REFS
  const tocRef = useRef(null);
  const viewStackRef = useRef(null);
  const bodyRef = useRef(null);
  /* ************************************* */

  /* ************************************* */
  // CONSTANTS
  const labsPrefix = usePrefix();
  const prefix = `${labsPrefix}--whats-new`;
  /* ************************************* */

  /* ************************************* */
  // CALL BACKS
  const handleContentSwitch = useCallback((value) => {
    const cleanVal = value ? value : 0;
    setContentIndex(cleanVal);
  }, []);
  /* ************************************* */

  /* ************************************* */
  // EFFECTS
  /* ************************************* */

  return (
    <div ref={bodyRef} className="storyBody">
      {/* Storybook only control - todo:  */}
      <div className="controlHeader">
        <Button onClick={() => setShouldShowAnnouncement(true)}>
          Open What&apos;s New center
        </Button>

        <Button
          onClick={() => setShouldShowReleaseNotification((prev) => !prev)}>
          Toggle release notification
        </Button>
        <div className="iconBtnRight">
          <Button
            id="ExampleTarget"
            renderIcon={Notification}
            iconDescription="Example icon button"
            hasIconOnly
            tooltipAlignment="end"
            tooltipPosition="bottom"
          />
        </div>
      </div>
      {/* Tier 2 - release notification pattern */}
      <Bubble
        highContrast
        align="bottom-end"
        open={shouldShowReleaseNotification}
        target="#ExampleTarget">
        <BubbleHeader>
          <Button
            kind="ghost"
            size="sm"
            renderIcon={Close}
            iconDescription="Close"
            hasIconOnly
            onClick={() => {
              setShouldShowReleaseNotification(false);
            }}
          />
        </BubbleHeader>
        <ViewStack
          ref={viewStackRef}
          className={`${prefix}__wn_pattern__bubble_viewstack`}
          ariaLabel="Test view stack"
          viewAssistiveTranslator={(currentIndex, lastIndex) =>
            `Affichage de la vue ${currentIndex} sur ${lastIndex}`
          }
          onViewChangeEnd={({ currentIndex, lastIndex }) => {
            setCurrentReleaseNotifications(currentIndex + 1);
            setTotalReleaseNotifications(lastIndex + 1);
          }}>
          <View title="Example View 1">
            <ScrollGradient>
              <img
                alt=""
                className={`${prefix}__wn_pattern__bubble_viewstack-view-image`}
                src="https://assets.ibm.com/is/image/ibm/maas360-benefits-enhanced-security-threat-visibility:2x1?$674x337$&fmt=png-alpha"
              />
              <div
                className={`${prefix}__wn_pattern__bubble_viewstack-view-info`}>
                <Gift size={20} />
                <span>New!</span>
              </div>
              <div className={`${prefix}__wn_pattern__tag_container`}>
                <Tag
                  className="some-class"
                  size="md"
                  title="Clear filter"
                  type="purple">
                  Tag content
                </Tag>
              </div>
              <Heading
                className={`${prefix}__wn_pattern__bubble_viewstack-view-heading`}>
                Feature 1
              </Heading>
              <div
                className={`${prefix}__wn_pattern__bubble_viewstack-view-description`}>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Maecenas consequat, nulla in laoreet molestie, metus lectus
                  eleifend sem, eu malesuada ipsum arcu nec turpis.
                </p>
              </div>
              <div
                className={`${prefix}__wn_pattern__bubble_viewstack-view-buttons`}>
                <Button href="https://www.ibm.com" kind="ghost" size="sm">
                  Start using
                </Button>
              </div>
            </ScrollGradient>
          </View>
          <View title="Example View 2">
            <ScrollGradient>
              <img
                alt=""
                className={`${prefix}__wn_pattern__bubble_viewstack-view-image`}
                src="https://assets.ibm.com/is/image/ibm/maas360-benefits-enhanced-security-threat-visibility:2x1?$674x337$&fmt=png-alpha"
              />
              <div
                className={`${prefix}__wn_pattern__bubble_viewstack-view-info`}>
                <Gift size={20} />
                <span>New!</span>
              </div>
              <div className={`${prefix}__wn_pattern__tag_container`}>
                <Tag
                  className="some-class"
                  size="md"
                  title="Clear filter"
                  type="purple">
                  Tag content
                </Tag>
              </div>
              <Heading
                className={`${prefix}__wn_pattern__bubble_viewstack-view-heading`}>
                Feature 2
              </Heading>
              <div
                className={`${prefix}__wn_pattern__bubble_viewstack-view-description`}>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Maecenas consequat, nulla in laoreet molestie, metus lectus
                  eleifend sem, eu malesuada ipsum arcu nec turpis.
                </p>
              </div>
              <div
                className={`${prefix}__wn_pattern__bubble_viewstack-view-buttons`}>
                <Button href="https://www.ibm.com" kind="ghost" size="sm">
                  Start using
                </Button>
              </div>
            </ScrollGradient>
          </View>
        </ViewStack>
        <footer className={`${prefix}__wn_pattern__bubble_footer`}>
          <div className={`${prefix}__wn_pattern__bubble_progress`}>
            {currentReleaseNotifications}/{totalReleaseNotifications}
          </div>

          <Button
            disabled={currentReleaseNotifications === 1}
            size="sm"
            kind="ghost"
            onClick={() => {
              viewStackRef.current?.back();
            }}>
            Back
          </Button>
          {currentReleaseNotifications !== totalReleaseNotifications ? (
            <Button
              size="sm"
              kind="primary"
              onClick={() => {
                viewStackRef.current?.next();
              }}>
              Next
            </Button>
          ) : (
            <Button
              size="sm"
              kind="primary"
              onClick={() => {
                setShouldShowReleaseNotification(false);
              }}>
              Got it
            </Button>
          )}
        </footer>
      </Bubble>
      {/* Tier 1 - what's new center pattern */}
      <Toc ref={tocRef}>
        <Tearsheet
          selectorPrimaryFocus="#FeatureSwitcher"
          title="What's new"
          open={shouldShowAnnouncement}
          onClose={() => setShouldShowAnnouncement(false)}
          className={`${prefix}__wn_pattern__tearsheet`}
          closeIconDescription="Close the tearsheet"
          navigation={
            <div
              className={`${prefix}__wn_pattern__tearsheet_navigation_container`}>
              <ContentSwitcher
                id="FeatureSwitcher"
                className={`${prefix}__wn_pattern__tearsheet__contentswitcher`}
                size="md"
                selectedIndex={contentIndex}
                onChange={(val) => {
                  tocRef.current?.reset();
                  handleContentSwitch(val.index);
                }}>
                <Switch name="new" text="Latest highlights" />
                <Switch name="all" text="All features" />
              </ContentSwitcher>
              <Link
                className={`${prefix}__wn_pattern__tearsheet__link`}
                size="md"
                href="https://www.ibm.com"
                target="_blank"
                renderIcon={Launch}>
                View on Docs
              </Link>
            </div>
          }
          influencer={
            <div
              className={`${prefix}__wn_pattern__tearsheet_influencer_container`}>
              {contentIndex === 0 ? (
                <TocList>
                  <TocItem>Feature 1</TocItem>
                  <TocItem>Feature 2</TocItem>
                </TocList>
              ) : (
                <TocList>
                  <TocItem>Section 1</TocItem>
                  <TocItem>Section 2</TocItem>
                </TocList>
              )}
            </div>
          }>
          <div className={`${prefix}__wn_pattern__features`}>
            {contentIndex === 0 ? (
              <TocSections
                className={`${prefix}__wn_pattern__feature__sections`}
                threshold={0.2}>
                <TocSection
                  as="div"
                  className={`${prefix}__wn_pattern__feature__section`}>
                  <Section level={4}>
                    <img
                      className={`${prefix}__wn_pattern__feature__section_image`}
                      src="https://assets.ibm.com/is/image/ibm/fs6:2x1?$674x337$&fmt=png-alpha"
                      aria-label="Example image"
                    />
                    <div className={`${prefix}__wn_pattern__tag_container`}>
                      <Tag
                        className="some-class"
                        size="md"
                        title="Clear filter"
                        type="purple">
                        Tag content
                      </Tag>
                    </div>
                    <Heading
                      className={`${prefix}__wn_pattern__feature__section_heading`}>
                      Feature 1
                    </Heading>
                    <div
                      className={`${prefix}__wn_pattern__feature__section_body`}>
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Duis consequat rhoncus dolor non dapibus. Proin eu
                        tempus turpis. Aliquam ornare mi mi. Pellentesque ac
                        mattis diam.
                      </p>
                    </div>
                    <Button href="https://www.ibm.com" kind="tertiary">
                      Go Here
                    </Button>
                  </Section>
                </TocSection>
                <TocSection
                  as="div"
                  className={`${prefix}__wn_pattern__feature__section`}>
                  <Section level={4}>
                    <img
                      className={`${prefix}__wn_pattern__feature__section_image`}
                      src="https://assets.ibm.com/is/image/ibm/fs6:2x1?$674x337$&fmt=png-alpha"
                      aria-label="Example image"
                    />
                    <div className={`${prefix}__wn_pattern__tag_container`}>
                      <Tag
                        className="some-class"
                        size="md"
                        title="Clear filter"
                        type="purple">
                        Tag content
                      </Tag>
                    </div>
                    <Heading
                      className={`${prefix}__wn_pattern__feature__section_heading`}>
                      Feature 2
                    </Heading>
                    <div
                      className={`${prefix}__wn_pattern__feature__section_body`}>
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Duis consequat rhoncus dolor non dapibus. Proin eu
                        tempus turpis. Aliquam ornare mi mi. Pellentesque ac
                        mattis diam.
                      </p>
                    </div>
                    <Button href="https://www.ibm.com" kind="tertiary">
                      Go Here
                    </Button>
                  </Section>
                </TocSection>
              </TocSections>
            ) : (
              <TocSections
                className={`${prefix}__wn_pattern__feature__sections`}
                threshold={0.1}>
                <TocSection as="div">
                  <Section
                    level={3}
                    className={`${prefix}__wn_pattern__feature__section_group`}>
                    <Heading
                      className={`${prefix}__wn_pattern__feature__section_group_heading`}>
                      Section 1
                    </Heading>
                    <Section
                      className={`${prefix}__wn_pattern__feature__section`}>
                      <img
                        className={`${prefix}__wn_pattern__feature__section_image`}
                        src="https://assets.ibm.com/is/image/ibm/fs6:2x1?$674x337$&fmt=png-alpha"
                        aria-label="Example image"
                      />
                      <div className={`${prefix}__wn_pattern__tag_container`}>
                        <Tag
                          className="some-class"
                          size="md"
                          title="Clear filter"
                          type="purple">
                          Tag content
                        </Tag>
                      </div>
                      <Heading
                        className={`${prefix}__wn_pattern__feature__section_heading`}>
                        Section 1 - Feature 1
                      </Heading>
                      <div
                        className={`${prefix}__wn_pattern__feature__section_body`}>
                        <p>
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Duis consequat rhoncus dolor non dapibus. Proin
                          eu tempus turpis. Aliquam ornare mi mi. Pellentesque
                          ac mattis diam.
                        </p>
                      </div>
                      <Button href="https://www.ibm.com" kind="tertiary">
                        Go Here
                      </Button>
                    </Section>
                    <Section
                      className={`${prefix}__wn_pattern__feature__section`}>
                      <img
                        className={`${prefix}__wn_pattern__feature__section_image`}
                        src="https://assets.ibm.com/is/image/ibm/fs6:2x1?$674x337$&fmt=png-alpha"
                        aria-label="Example image"
                      />
                      <div className={`${prefix}__wn_pattern__tag_container`}>
                        <Tag
                          className="some-class"
                          size="md"
                          title="Clear filter"
                          type="purple">
                          Tag content
                        </Tag>
                      </div>
                      <Heading
                        className={`${prefix}__wn_pattern__feature__section_heading`}>
                        Section 1 - Feature 2
                      </Heading>
                      <div
                        className={`${prefix}__wn_pattern__feature__section_body`}>
                        <p>
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Duis consequat rhoncus dolor non dapibus. Proin
                          eu tempus turpis. Aliquam ornare mi mi. Pellentesque
                          ac mattis diam.
                        </p>
                      </div>
                      <Button href="https://www.ibm.com" kind="tertiary">
                        Go Here
                      </Button>
                    </Section>
                  </Section>
                </TocSection>
                <TocSection as="div">
                  <Section
                    level={3}
                    className={`${prefix}__wn_pattern__feature__section_group`}>
                    <Heading
                      className={`${prefix}__wn_pattern__feature__section_group_heading`}>
                      Section 2
                    </Heading>
                    <Section
                      className={`${prefix}__wn_pattern__feature__section`}>
                      <img
                        className={`${prefix}__wn_pattern__feature__section_image`}
                        src="https://assets.ibm.com/is/image/ibm/fs6:2x1?$674x337$&fmt=png-alpha"
                        aria-label="Example image"
                      />
                      <div className={`${prefix}__wn_pattern__tag_container`}>
                        <Tag
                          className="some-class"
                          size="md"
                          title="Clear filter"
                          type="purple">
                          Tag content
                        </Tag>
                      </div>
                      <Heading
                        className={`${prefix}__wn_pattern__feature__section_heading`}>
                        Section 2 - Feature 1
                      </Heading>
                      <div
                        className={`${prefix}__wn_pattern__feature__section_body`}>
                        <p>
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Duis consequat rhoncus dolor non dapibus. Proin
                          eu tempus turpis. Aliquam ornare mi mi. Pellentesque
                          ac mattis diam.
                        </p>
                      </div>
                      <Button href="https://www.ibm.com" kind="tertiary">
                        Go Here
                      </Button>
                    </Section>
                    <Section
                      className={`${prefix}__wn_pattern__feature__section`}>
                      <img
                        className={`${prefix}__wn_pattern__feature__section_image`}
                        src="https://assets.ibm.com/is/image/ibm/fs6:2x1?$674x337$&fmt=png-alpha"
                        aria-label="Example image"
                      />
                      <div className={`${prefix}__wn_pattern__tag_container`}>
                        <Tag
                          className="some-class"
                          size="md"
                          title="Clear filter"
                          type="purple">
                          Tag content
                        </Tag>
                      </div>
                      <Heading
                        className={`${prefix}__wn_pattern__feature__section_heading`}>
                        Section 2 - Feature 2
                      </Heading>
                      <div
                        className={`${prefix}__wn_pattern__feature__section_body`}>
                        <p>
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Duis consequat rhoncus dolor non dapibus. Proin
                          eu tempus turpis. Aliquam ornare mi mi. Pellentesque
                          ac mattis diam.
                        </p>
                      </div>
                      <Button href="https://www.ibm.com" kind="tertiary">
                        Go Here
                      </Button>
                    </Section>
                  </Section>
                </TocSection>
              </TocSections>
            )}
          </div>
        </Tearsheet>
      </Toc>
    </div>
  );
};
WhatsNewPattern.storyName = "What's new pattern";
