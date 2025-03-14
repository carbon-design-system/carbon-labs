/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useCallback, useRef, useState } from 'react';
import { PlayingCard } from './components/PlayingCard';
import { ViewStack, View } from '../index';
import mdx from './WhatsNew.mdx';
import './storybook.scss';

export default {
  title: 'Components/WhatsNew',
  component: ViewStack,
  subcomponents: {
    View,
  },
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

/**
 * ViewStack component story for WhatsNew
 */
export const ViewStackStory = () => {
  /* ************************************* */
  // INTERNAL STATE
  const [currentViewIndex, setCurrentViewIndex] = useState(-1);
  const [lastViewIndex, setLastViewIndex] = useState(-1);
  const [totalViews, setTotalViews] = useState(-1);
  const [viewStackHistory, setViewStackHistory] = useState([]);
  /* ************************************* */
  // REFS
  const bodyRef = useRef(null);
  const viewStackExampleRef = useRef(null);
  /* ************************************* */

  /* ************************************* */
  // CONSTANTS

  /* ************************************* */

  /* ************************************* */
  // CALL BACKS
  const handleViewStackUpdate = useCallback(
    ({ currentIndex, lastIndex, totalViews, historyStack }) => {
      setCurrentViewIndex(currentIndex);
      setLastViewIndex(lastIndex);
      setTotalViews(totalViews);
      setViewStackHistory(historyStack);
    },
    []
  );
  /* ************************************* */

  /* ************************************* */
  // EFFECTS
  /* ************************************* */

  return (
    <div ref={bodyRef} className="storyBody">
      <div className="ViewStackStoryExample">
        <div className="ViewStackStoryHistory">
          <div className="ViewStackStoryHistoryRow">{`Current Index: ${currentViewIndex}`}</div>
          <div className="ViewStackStoryHistoryRow">{`Last Index: ${lastViewIndex}`}</div>
          <div className="ViewStackStoryHistoryRow">{`Total Views: ${totalViews}`}</div>
          <label
            className="ViewStackStoryHistoryEntriesLabel"
            htmlFor="historyContainer">
            History:
          </label>
          <ol
            name="historyContainer"
            className="ViewStackStoryHistoryEntries"
            type="1">
            {viewStackHistory &&
              viewStackHistory.map((el, idx) => (
                <li key={idx} className="ViewStackStoryHistoryEntry">
                  {`[${idx}] - id: ${el.id}, title: ${el.title}`}
                </li>
              ))}
          </ol>
        </div>
        <ViewStack
          className="PlayingCardViewStack"
          onViewChangeEnd={handleViewStackUpdate}
          ref={viewStackExampleRef}>
          <View title="Card 2">
            <PlayingCard label="2" />
          </View>

          <View title="Card 3">
            <PlayingCard label="3" />
          </View>
          <View title="Card 4">
            <PlayingCard label="4" />
          </View>
          <View title="Card 5">
            <PlayingCard label="5" />
          </View>
          <View title="Card 6">
            <PlayingCard label="6" />
          </View>
          <View title="Card 7">
            <PlayingCard label="7" />
          </View>
          <View title="Card 8">
            <PlayingCard label="8" />
          </View>
          <View title="Card 9">
            <PlayingCard label="9" />
          </View>
          <View title="Card 10">
            <PlayingCard label="10" />
          </View>
          <View title="Jack">
            <PlayingCard label="J" />
          </View>
          <View title="Queen">
            <PlayingCard label="Q" />
          </View>
          <View title="King">
            <PlayingCard label="K" />
          </View>
          <View title="Ace">
            <PlayingCard label="A" />
          </View>
        </ViewStack>
        <div className="ViewStackStoryControls">
          <button
            type="button"
            onClick={() => viewStackExampleRef.current?.pushViewIndex(0)}>
            Card 2
          </button>
          <button
            type="button"
            onClick={() => viewStackExampleRef.current?.pushViewIndex(1)}>
            Card 3
          </button>
          <button
            type="button"
            onClick={() => viewStackExampleRef.current?.pushViewIndex(2)}>
            Card 4
          </button>
          <button
            type="button"
            onClick={() => viewStackExampleRef.current?.pushViewIndex(3)}>
            Card 5
          </button>
          <button
            type="button"
            onClick={() => viewStackExampleRef.current?.pushViewIndex(4)}>
            Card 6
          </button>
          <button
            type="button"
            onClick={() => viewStackExampleRef.current?.pushViewIndex(5)}>
            Card 7
          </button>
          <button
            type="button"
            onClick={() => viewStackExampleRef.current?.pushViewIndex(6)}>
            Card 8
          </button>
          <button
            type="button"
            onClick={() => viewStackExampleRef.current?.pushViewIndex(7)}>
            Card 9
          </button>
          <button
            type="button"
            onClick={() => viewStackExampleRef.current?.pushViewIndex(8)}>
            Card 10
          </button>
          <button
            type="button"
            onClick={() => viewStackExampleRef.current?.pushViewIndex(9)}>
            Jack
          </button>
          <button
            type="button"
            onClick={() => viewStackExampleRef.current?.pushViewIndex(10)}>
            Queen
          </button>
          <button
            type="button"
            onClick={() => viewStackExampleRef.current?.pushViewIndex(11)}>
            King
          </button>
          <button
            type="button"
            onClick={() => viewStackExampleRef.current?.pushViewIndex(12)}>
            Ace
          </button>
          <button
            type="button"
            disabled={currentViewIndex === lastViewIndex}
            onClick={() => viewStackExampleRef.current?.next()}>
            Increment
          </button>
          <button
            type="button"
            disabled={viewStackHistory.length === 1}
            onClick={() => viewStackExampleRef.current?.back()}>
            Back
          </button>
          <button
            type="button"
            disabled={viewStackHistory.length === 1}
            onClick={() => viewStackExampleRef.current?.home()}>
            Home
          </button>
        </div>
      </div>
    </div>
  );
};
ViewStackStory.storyName = 'ViewStack';
