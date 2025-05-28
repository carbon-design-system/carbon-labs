/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import './storybook.scss';
import mdx from './WhatsNew.mdx';
import {
  PersonalizationInterstitial,
  WelcomeInterstitial,
} from './components/FirstTimeOrientation';
import { InterstitialScreen, pkg } from '@carbon/ibm-products';
import { Button } from '@carbon/react';
import { ContentWrapper } from './components/FirstTimeOrientation/ContentWrapper';

export default {
  title: 'Patterns/WhatsNew',

  parameters: {
    docs: {
      page: mdx,
    },
  },
};

export const FirstTimeOrientationStory = () => {
  const [showInterstitialModal, setShowInterstitialModal] = useState(true);

  const defaultProps = {
    headerTitle: 'Welcome to your sandbox, Jack!',
    interstitialAriaLabel: 'Interstitial Screen',
  };

  pkg.component.InterstitialScreen = true;

  return (
    <>
      <Button
        onClick={() => {
          setShowInterstitialModal(true);
        }}>
        Show Interstitial modal
      </Button>
      <InterstitialScreen
        isOpen={showInterstitialModal}
        onClose={() => {
          setShowInterstitialModal(false);
        }}
        interstitialAriaLabel={defaultProps.interstitialAriaLabel}
        isFullScreen={false}>
        <InterstitialScreen.Header
          headerTitle={defaultProps.headerTitle}></InterstitialScreen.Header>
        <InterstitialScreen.Body
          contentRenderer={() => {
            return (
              <>
                <ContentWrapper stepTitle="Welcome">
                  <WelcomeInterstitial />
                </ContentWrapper>
                <ContentWrapper stepTitle="Tailor your experience">
                  <PersonalizationInterstitial />
                </ContentWrapper>
              </>
            );
          }}
        />
        <InterstitialScreen.Footer />
      </InterstitialScreen>
    </>
  );
};
FirstTimeOrientationStory.storyName = 'First Time Orientation';
