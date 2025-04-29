/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState } from 'react';
import {
  Add,
  Close,
  Moon,
  Notification,
  WaveDirection,
} from '@carbon/react/icons';
// import mdx from './WhatsNew.mdx';

import { Bubble, BubbleHeader } from '../index';

import { Button } from '@carbon/react';
// import '@carbon/ibm-products/css/index.min.css';
import './storybook.scss';
import mdx from './WhatsNew.mdx';
export default {
  title: 'Components/WhatsNew',
  component: Bubble,
  subcomponents: {
    BubbleHeader,
  },
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

/**
 * Bubble component story for WhatsNew
 */
export const BubbleStory = () => {
  /* ************************************* */
  // INTERNAL STATE
  const [shouldShowBubble, setShouldShowBubble] = useState(false);
  const [currentTextExampleIndex, setCurrentTextExampleIndex] = useState(0);
  /* ************************************* */
  // REFS
  const bodyRef = useRef(null);
  /* ************************************* */

  /* ************************************* */
  // CONSTANTS
  const textExamples = [
    {
      target: '#ExampleTarget1',
      text: 'text 1 - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas consequat, nulla in laoreet molestie, metus lectus eleifend sem, eu malesuada ipsum arcu nec turpis.',
      align: 'bottom-start',
    },
    {
      target: '#ExampleTarget2',
      text: 'text 2 - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas consequat, nulla in laoreet molestie, metus lectus eleifend sem, eu malesuada ipsum arcu nec turpis.',
      align: 'bottom-end',
    },
    {
      target: '#ExampleTarget3',
      text: 'text 3 - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas consequat, nulla in laoreet molestie, metus lectus eleifend sem, eu malesuada ipsum arcu nec turpis.',
      align: 'right-start',
    },
    {
      target: '#ExampleTarget4',
      text: 'text 4 - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas consequat, nulla in laoreet molestie, metus lectus eleifend sem, eu malesuada ipsum arcu nec turpis.',
      align: 'top-end',
    },
  ];
  /* ************************************* */

  /* ************************************* */
  // CALL BACKS
  /* ************************************* */

  /* ************************************* */
  // EFFECTS
  /* ************************************* */

  return (
    <div ref={bodyRef} className="storyBody">
      <div className="controlHeader">
        <Button onClick={() => setShouldShowBubble((prev) => !prev)}>
          Toggle Bubble
        </Button>
        <Button
          disabled={!shouldShowBubble}
          onClick={() =>
            setCurrentTextExampleIndex((prev) =>
              prev + 1 < textExamples.length ? prev + 1 : 0
            )
          }>
          Move bubble
        </Button>
        <Button
          id="ExampleTarget1"
          renderIcon={Notification}
          iconDescription="Example icon button"
          hasIconOnly
        />
        <div className="iconBtnRight">
          <Button
            id="ExampleTarget2"
            renderIcon={Add}
            iconDescription="Example icon button 2"
            hasIconOnly
          />
        </div>
      </div>
      <Bubble
        highContrast
        align={textExamples[currentTextExampleIndex].align}
        open={shouldShowBubble}
        target={textExamples[currentTextExampleIndex].target}>
        <BubbleHeader>
          <Button
            kind="ghost"
            size="sm"
            renderIcon={Close}
            iconDescription="Close"
            hasIconOnly
            onClick={() => {
              setShouldShowBubble(false);
            }}
          />
        </BubbleHeader>
        <p className="BubbleExampleContent">
          {textExamples[currentTextExampleIndex].text}
        </p>
      </Bubble>
      <div className="iconBtnBody">
        <Button
          id="ExampleTarget3"
          renderIcon={WaveDirection}
          iconDescription="Example icon button 3"
          hasIconOnly
        />
      </div>
      <div className="iconBtnRightBottom">
        <Button
          id="ExampleTarget4"
          renderIcon={Moon}
          iconDescription="Example icon button 4"
          hasIconOnly
        />
      </div>
    </div>
  );
};
BubbleStory.storyName = 'Bubble';
