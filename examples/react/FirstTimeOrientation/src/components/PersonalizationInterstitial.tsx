/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { settings } from '@carbon-labs/utilities';
import { Column, FlexGrid, Row, SelectableTag } from '@carbon/react';
import './styles/_firstTimeOrientation.scss';

const PersonalizationInterstitial = () => {
  const prefix = settings.stablePrefix;

  const tags = [
    {
      id: 1,
      text: 'Accelerate process with automation',
    },
    {
      id: 2,
      text: 'Proactively identify issues',
    },
    {
      id: 3,
      text: 'Accelerate response times',
    },
    {
      id: 4,
      text: 'Create rules with greater efficiency',
    },
    {
      id: 5,
      text: 'Query faster and monitor in real-time',
    },
    {
      id: 6,
      text: 'Stay ahead of emerging issues',
    },
    {
      id: 7,
      text: 'Take action with custom and built-in dashboards',
    },
  ];
  const [selectedTags, setSelectedTags] = useState([
    {
      id: 1,
    },
    {
      id: 4,
    },
    {
      id: 6,
    },
  ]);

  const handleChange = (tag, selected) => {
    const nextSelectedTags = selected
      ? [...selectedTags, tag]
      : selectedTags.filter((t) => t.id !== tag.id);

    console.log('Selected tags array: ', nextSelectedTags);
    setSelectedTags(nextSelectedTags);
  };
  return (
    <FlexGrid fullWidth className={`${prefix}__flexContainer`}>
      <Row>
        <Column className={`${prefix}__contentColumn`}>
          <div
            className={`${prefix}__interstitialTextContainer ${prefix}__firstTimeOrientation`}>
            <h4>What experiences interest you?</h4>
            <p>
              Personalize your experience by selecting all areas you want to
              explore.
            </p>
          </div>
          <div aria-label="Selectable tags" role="group">
            {tags.map((tag, index) => (
              <SelectableTag
                key={index}
                text={tag.text}
                selected={!!selectedTags.find((t) => t.id === tag.id)}
                onChange={(selected) => handleChange(tag, selected)}
                size="lg"
              />
            ))}
          </div>
        </Column>
      </Row>
    </FlexGrid>
  );
};

PersonalizationInterstitial.displayName = 'PersonalizationInterstitial';

export { PersonalizationInterstitial };
