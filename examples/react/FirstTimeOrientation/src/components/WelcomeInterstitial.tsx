/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { settings } from '@carbon-labs/utilities';
import { Column, FlexGrid, Row } from '@carbon/react';
import welcomeInterstitialImage from './assets/welcomeInterstitial.png';
import './styles/_firstTimeOrientation.scss';

const WelcomeInterstitial = () => {
  const prefix = settings.stablePrefix;
  return (
    <FlexGrid fullWidth className={`${prefix}__flexContainer`}>
      <Row>
        <Column sm={4} md={4} className={`${prefix}__contentColumn`}>
          <div className={`${prefix}__interstitialTextContainer`}>
            <h3>
              <span>Built to scale; made for the analyst</span>
            </h3>
            <p>
              Explore how to leverage search-based detection of your logs,
              respond to automatically correlated and investigated cases,
              advanced data source management, extended detection and response,
              and much more.
            </p>
          </div>
        </Column>
        <Column sm={4} md={4}>
          <img
            src={welcomeInterstitialImage}
            className={`${prefix}__interstitialImage`}
            alt="Welcome interstitial"
          />
        </Column>
      </Row>
    </FlexGrid>
  );
};

WelcomeInterstitial.displayName = 'WelcomeInterstitial';

export { WelcomeInterstitial };
