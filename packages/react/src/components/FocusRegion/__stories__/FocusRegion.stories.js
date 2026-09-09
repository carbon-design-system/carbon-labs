/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import {
  Button,
  TextInput,
  Modal,
  Layer,
  Tile,
  Stack,
  Heading,
  Link,
  Form,
  Grid,
  Column
} from '@carbon/react';
import mdx from './FocusRegion.mdx';
import { FocusRegion, useFocusGroupModal } from '../';
import '../components/focus-region.scss';

export default {
  title: 'Components/FocusRegion',
  tags: ['squad', 'incubating'],
  component: FocusRegion,
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

/**
 * Basic example with three regions using Carbon Tiles
 */
export const Default = () => (
  <Grid>
    <Column lg={16} md={8} sm={4}>
      <Tile style={{ marginBottom: '1rem' }}>
        <Heading style={{ marginBottom: '0.5rem' }}>Instructions</Heading>
        <p>Press <kbd>F6</kbd> to navigate between regions. Press <kbd>Shift+F6</kbd> to navigate backwards.</p>
      </Tile>
    </Column>

    <Column lg={16} md={8} sm={4}>
      <FocusRegion id="header" role="banner" aria-label="Header" defaultFocus>
        <Tile style={{ marginBottom: '1rem' }}>
          <Heading style={{ marginBottom: '1rem' }}>Header Region</Heading>
          <Stack gap={5} orientation="horizontal">
            <Button>Home</Button>
            <Button>About</Button>
            <Button>Contact</Button>
          </Stack>
        </Tile>
      </FocusRegion>
    </Column>

    <Column lg={4} md={2} sm={4}>
      <FocusRegion id="sidebar" role="navigation" aria-label="Sidebar navigation" style={{ height: '100%' }}>
        <Tile style={{ marginBottom: '1rem', height: 'calc(100% - 1rem)' }}>
          <Heading style={{ marginBottom: '1rem' }}>Navigation</Heading>
          <Stack gap={4}>
            <Link href="#section1">Section 1</Link>
            <Link href="#section2">Section 2</Link>
            <Link href="#section3">Section 3</Link>
          </Stack>
        </Tile>
      </FocusRegion>
    </Column>

    <Column lg={12} md={6} sm={4}>
      <FocusRegion id="main" role="main" aria-label="Main content">
        <Tile style={{ marginBottom: '1rem' }}>
          <Layer>
            <Heading style={{ marginBottom: '1rem' }}>Main Content</Heading>
            <p style={{ marginBottom: '1rem' }}>This is the main content area. Tab through the elements normally.</p>
            <Form>
              <Stack gap={5}>
                <TextInput id="name" labelText="Name" placeholder="Enter your name" />
                <TextInput id="email" labelText="Email" placeholder="Enter your email" />
                <Button type="submit">Submit</Button>
              </Stack>
            </Form>
          </Layer>
        </Tile>
      </FocusRegion>
    </Column>

    <Column lg={16} md={8} sm={4}>
      <FocusRegion id="footer" role="contentinfo" aria-label="Footer">
        <Tile>
          <Heading style={{ marginBottom: '1rem' }}>Footer</Heading>
          <Stack gap={5} orientation="horizontal">
            <Button kind="ghost">Privacy Policy</Button>
            <Button kind="ghost">Terms of Service</Button>
          </Stack>
        </Tile>
      </FocusRegion>
    </Column>
  </Grid>
);

/**
 * Example with Carbon Modal
 */
export const WithModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { pushModal, popModal } = useFocusGroupModal();

  const openModal = () => {
    setIsModalOpen(true);
    pushModal('modal');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    popModal('modal');
  };

  return (
    <Grid>
      <Column lg={16} md={8} sm={4}>
        <Tile style={{ marginBottom: '1rem' }}>
          <Heading style={{ marginBottom: '0.5rem' }}>Instructions</Heading>
          <p>Press <kbd>F6</kbd> to navigate between regions. Open the modal to see how F6 navigation is restricted to modal regions. Carbon Modal handles focus trapping automatically.</p>
        </Tile>
      </Column>

      <Column lg={16} md={8} sm={4}>
        <FocusRegion id="page-header" role="banner" aria-label="Page header" defaultFocus>
          <Tile style={{ marginBottom: '1rem' }}>
            <Heading style={{ marginBottom: '0.5rem' }}>Page Header</Heading>
            <Button onClick={openModal}>Open Modal</Button>
          </Tile>
        </FocusRegion>
      </Column>

      <Column lg={16} md={8} sm={4}>
        <FocusRegion id="page-main" role="main" aria-label="Page content">
          <Tile style={{ marginBottom: '1rem' }}>
            <Layer>
              <Heading style={{ marginBottom: '0.5rem' }}>Page Content</Heading>
              <p>This content is accessible when no modal is open. Try tabbing - you can reach all elements.</p>
              <Form>
                <Stack gap={5}>
                  <TextInput id="field1" labelText="Field 1" />
                  <Button>Action</Button>
                </Stack>
              </Form>
            </Layer>
          </Tile>
        </FocusRegion>
      </Column>

      <Modal
        open={isModalOpen}
        onRequestClose={closeModal}
        modalHeading="Modal with Focus Regions"
        primaryButtonText="Save"
        secondaryButtonText="Cancel"
        onRequestSubmit={closeModal}
      >
        <p>
          Carbon Modal handles focus trapping. Press <kbd>F6</kbd> to navigate between regions within the modal.
        </p>

        <FocusRegion id="modal-form" groupId="modal" role="region" aria-label="Modal form">
          <Tile style={{ marginBottom: '1rem' }}>
            <Layer>
              <Heading style={{ marginBottom: '0.5rem' }}>Form Region</Heading>
              <Stack gap={5}>
                <TextInput id="modal-field1" labelText="Field 1" />
                <TextInput id="modal-field2" labelText="Field 2" />
              </Stack>
            </Layer>
          </Tile>
        </FocusRegion>

        <FocusRegion id="modal-options" groupId="modal" role="region" aria-label="Modal options">
          <Tile style={{ marginBottom: '1rem' }}>
            <Heading style={{ marginBottom: '0.5rem' }}>Options Region</Heading>
            <Stack gap={5} orientation="horizontal">
              <Button size="sm">Option 1</Button>
              <Button size="sm">Option 2</Button>
            </Stack>
          </Tile>
        </FocusRegion>
      </Modal>
    </Grid>
  );
};

/**
 * Example with disabled regions
 */
export const WithDisabledRegions = () => {
  const [sidebarEnabled, setSidebarEnabled] = useState(true);

  return (
    <Grid>
      <Column lg={16} md={8} sm={4}>
        <Tile style={{ marginBottom: '1rem' }}>
          <Heading style={{ marginBottom: '0.5rem' }}>Instructions</Heading>
          <p>Toggle the sidebar to see how disabled regions are skipped during F6 navigation.</p>
        </Tile>
      </Column>

      <Column lg={16} md={8} sm={4}>
        <FocusRegion id="controls" role="banner" aria-label="Controls" defaultFocus>
          <Tile style={{ marginBottom: '1rem' }}>
            <Heading style={{ marginBottom: '0.5rem' }}>Controls</Heading>
            <Button onClick={() => setSidebarEnabled(!sidebarEnabled)}>
              {sidebarEnabled ? 'Disable' : 'Enable'} Sidebar
            </Button>
          </Tile>
        </FocusRegion>
      </Column>

      <Column lg={4} md={2} sm={4}>
        <FocusRegion id="sidebar-toggle" role="navigation" aria-label="Sidebar" enabled={sidebarEnabled}>
          <Tile style={{ marginBottom: '1rem', opacity: sidebarEnabled ? 1 : 0.5 }}>
            <Heading style={{ marginBottom: '0.5rem' }}>Sidebar</Heading>
            <p>{sidebarEnabled ? 'Enabled' : 'Disabled'}</p>
            <Button disabled={!sidebarEnabled} kind="ghost">Link 1</Button>
          </Tile>
        </FocusRegion>
      </Column>

      <Column lg={12} md={6} sm={4}>
        <FocusRegion id="main-toggle" role="main" aria-label="Main content">
          <Tile style={{ marginBottom: '1rem' }}>
            <Heading style={{ marginBottom: '0.5rem' }}>Main Content</Heading>
            <p>This region is always enabled.</p>
            <Button>Action</Button>
          </Tile>
        </FocusRegion>
      </Column>
    </Grid>
  );
};

/**
 * Example showing focus location tracking
 */
export const FocusLocationTracking = () => (
  <Grid>
    <Column lg={16} md={8} sm={4}>
      <Tile style={{ marginBottom: '1rem' }}>
        <Heading style={{ marginBottom: '0.5rem' }}>Instructions</Heading>
        <p>Tab to different elements within a region, then press F6 to move to another region. When you F6 back, focus returns to the last element you focused in that region.</p>
      </Tile>
    </Column>

    <Column lg={16} md={8} sm={4}>
      <FocusRegion id="region1" role="region" aria-label="Region 1" defaultFocus>
        <Tile style={{ marginBottom: '1rem' }}>
          <Layer>
            <Heading style={{ marginBottom: '0.5rem' }}>Region 1</Heading>
            <Stack gap={5}>
              <Stack gap={5} orientation="horizontal">
                <Button>Button 1</Button>
                <Button>Button 2</Button>
                <Button>Button 3</Button>
              </Stack>
              <TextInput id="input1" labelText="Input 1" />
            </Stack>
          </Layer>
        </Tile>
      </FocusRegion>
    </Column>

    <Column lg={16} md={8} sm={4}>
      <FocusRegion id="region2" role="region" aria-label="Region 2">
        <Tile style={{ marginBottom: '1rem' }}>
          <Layer>
            <Heading style={{ marginBottom: '0.5rem' }}>Region 2</Heading>
            <Form>
              <Stack gap={5}>
                <TextInput id="input2" labelText="Input 2" />
                <TextInput id="input3" labelText="Input 3" />
                <Button type="submit">Submit</Button>
              </Stack>
            </Form>
          </Layer>
        </Tile>
      </FocusRegion>
    </Column>

    <Column lg={16} md={8} sm={4}>
      <FocusRegion id="region3" role="region" aria-label="Region 3">
        <Tile style={{ marginBottom: '1rem' }}>
          <Heading style={{ marginBottom: '0.5rem' }}>Region 3</Heading>
          <Stack gap={5} orientation="horizontal">
            <Link href="#link1">Link 1</Link>
            <Link href="#link2">Link 2</Link>
            <Link href="#link3">Link 3</Link>
          </Stack>
        </Tile>
      </FocusRegion>
    </Column>
  </Grid>
);
/**
 * Example with nested regions
 */
export const NestedRegions = () => (
  <Grid>
    <Column lg={16} md={8} sm={4}>
      <Tile style={{ marginBottom: '1rem' }}>
        <Heading style={{ marginBottom: '0.5rem' }}>Instructions</Heading>
        <p>This example demonstrates nested FocusRegions. The main content region contains a nested sidebar region. Press <kbd>F6</kbd> to navigate between the top-level regions (Header, Main Content, Footer). When inside the Main Content region, you can tab into the nested Sidebar region, but F6 navigation only moves between top-level regions.</p>
      </Tile>
    </Column>

    <Column lg={16} md={8} sm={4}>
      <FocusRegion id="nested-header" role="banner" aria-label="Header" defaultFocus>
        <Tile style={{ marginBottom: '1rem' }}>
          <Heading style={{ marginBottom: '1rem' }}>Header Region</Heading>
          <Stack gap={5} orientation="horizontal">
            <Button>Home</Button>
            <Button>About</Button>
            <Button>Contact</Button>
          </Stack>
        </Tile>
      </FocusRegion>
    </Column>

    <Column lg={16} md={8} sm={4}>
      <FocusRegion id="nested-main" role="main" aria-label="Main content with nested sidebar">
        <Tile style={{ marginBottom: '1rem' }}>
          <Layer>
            <Heading style={{ marginBottom: '1rem' }}>Main Content Region</Heading>
            <Grid condensed>
              <Column lg={12} md={6} sm={4}>
                <p style={{ marginBottom: '1rem' }}>This is the main content area. It contains a nested sidebar region to the right.</p>
                <Form>
                  <Stack gap={5}>
                    <TextInput id="nested-name" labelText="Name" placeholder="Enter your name" />
                    <TextInput id="nested-email" labelText="Email" placeholder="Enter your email" />
                    <Button type="submit">Submit</Button>
                  </Stack>
                </Form>
              </Column>
              
              <Column lg={4} md={2} sm={4}>
                <FocusRegion id="nested-sidebar" role="complementary" aria-label="Nested sidebar">
                  <Tile style={{ padding: '1rem', backgroundColor: 'var(--cds-layer-02)' }}>
                    <Heading style={{ marginBottom: '1rem', fontSize: '1rem' }}>Nested Sidebar</Heading>
                    <p style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>This is a nested region inside the main content. You can tab into it, but F6 skips it.</p>
                    <Stack gap={4}>
                      <Link href="#nested1">Nested Link 1</Link>
                      <Link href="#nested2">Nested Link 2</Link>
                      <Link href="#nested3">Nested Link 3</Link>
                    </Stack>
                  </Tile>
                </FocusRegion>
              </Column>
            </Grid>
          </Layer>
        </Tile>
      </FocusRegion>
    </Column>

    <Column lg={16} md={8} sm={4}>
      <FocusRegion id="nested-footer" role="contentinfo" aria-label="Footer">
        <Tile>
          <Heading style={{ marginBottom: '1rem' }}>Footer Region</Heading>
          <Stack gap={5} orientation="horizontal">
            <Button kind="ghost">Privacy Policy</Button>
            <Button kind="ghost">Terms of Service</Button>
            <Button kind="ghost">Contact Us</Button>
          </Stack>
        </Tile>
      </FocusRegion>
    </Column>
  </Grid>
);


/**
 * Example with navigation hint
 */
export const WithNavigationHint = () => {
  return (
    <Grid>
      <Column lg={16} md={8} sm={4}>
        <Tile style={{ marginBottom: '1rem' }}>
          <Heading style={{ marginBottom: '0.5rem' }}>Instructions</Heading>
          <p>Tab into a region to see the navigation hint. It will only appear when you use keyboard navigation (not mouse clicks).</p>
          <Button style={{ marginTop: '1rem' }}>Start here - Tab to enter first region</Button>
        </Tile>
      </Column>

      <Column lg={16} md={8} sm={4}>
        <FocusRegion
          id="header-hint"
          role="banner"
          aria-label="Header"
          showNavigationHint
        >
          <Tile style={{ marginBottom: '1rem' }}>
            <Heading style={{ marginBottom: '1rem' }}>Header with Navigation Hint</Heading>
            <Stack gap={5} orientation="horizontal">
              <Button>Home</Button>
              <Button>About</Button>
              <Button>Contact</Button>
            </Stack>
          </Tile>
        </FocusRegion>
      </Column>

      <Column lg={4} md={2} sm={4}>
        <FocusRegion
          id="sidebar-hint"
          role="navigation"
          aria-label="Sidebar navigation"
          showNavigationHint
        >
          <Tile style={{ marginBottom: '1rem', height: '100%' }}>
            <Heading style={{ marginBottom: '1rem' }}>Navigation</Heading>
            <Stack gap={4}>
              <Link href="#section1">Section 1</Link>
              <Link href="#section2">Section 2</Link>
              <Link href="#section3">Section 3</Link>
            </Stack>
          </Tile>
        </FocusRegion>
      </Column>

      <Column lg={12} md={6} sm={4}>
        <FocusRegion
          id="main-hint"
          role="main"
          aria-label="Main content"
          showNavigationHint
        >
          <Tile style={{ marginBottom: '1rem' }}>
            <Layer>
              <Heading style={{ marginBottom: '1rem' }}>Main Content</Heading>
              <p style={{ marginBottom: '1rem' }}>
                Try tabbing into different regions. The first time you focus into a region,
                you'll see a helpful hint about F6 navigation.
              </p>
              <Form>
                <Stack gap={5}>
                  <TextInput id="name-hint" labelText="Name" placeholder="Enter your name" />
                  <TextInput id="email-hint" labelText="Email" placeholder="Enter your email" />
                  <Button type="submit">Submit</Button>
                </Stack>
              </Form>
            </Layer>
          </Tile>
        </FocusRegion>
      </Column>

      <Column lg={16} md={8} sm={4}>
        <FocusRegion
          id="footer-hint"
          role="contentinfo"
          aria-label="Footer"
          showNavigationHint
        >
          <Tile>
            <Heading style={{ marginBottom: '1rem' }}>Footer</Heading>
            <Stack gap={5} orientation="horizontal">
              <Button kind="ghost">Privacy Policy</Button>
              <Button kind="ghost">Terms of Service</Button>
              <Button kind="ghost">Contact Us</Button>
            </Stack>
          </Tile>
        </FocusRegion>
      </Column>
    </Grid>
  );
};


