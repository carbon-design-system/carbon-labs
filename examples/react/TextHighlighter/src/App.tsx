/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { TextHighlighter } from '@carbon-labs/react-text-highlighter';
import './index.scss';

function App() {
  return (
    <div className="app-wrapper">
      <h3>Mark variant</h3>
      <br />
      <p>
        When conducting a comprehensive literature review, users can leverage
        color coding to quickly categorize notes and identify themes.
      </p>
      <p>
        For example, all key definitions can be highlighted in{' '}
        <TextHighlighter kind="mark">yellow</TextHighlighter> , making them easy
        to spot across the document. Simultaneously, any areas requiring further
        research or follow-up can be marked using a completely different shade,
        such as{' '}
        <TextHighlighter kind="mark" type="magenta">
          magenta
        </TextHighlighter>
        ,{' '}
        <TextHighlighter kind="mark" type="purple">
          purple
        </TextHighlighter>
        ,{' '}
        <TextHighlighter kind="mark" type="blue">
          blue
        </TextHighlighter>
        ,{' '}
        <TextHighlighter kind="mark" type="cyan">
          cyan
        </TextHighlighter>
        ,{' '}
        <TextHighlighter kind="mark" type="teal">
          teal
        </TextHighlighter>
        ,{' '}
        <TextHighlighter kind="mark" type="gray">
          gray
        </TextHighlighter>
        ,{' '}
        <TextHighlighter kind="mark" type="cool-gray">
          cool-gray
        </TextHighlighter>
        ,{' '}
        <TextHighlighter kind="mark" type="warm-gray">
          warm-gray
        </TextHighlighter>
        ,
        <TextHighlighter kind="mark" type="high-contrast">
          high-contrast
        </TextHighlighter>
        . This demonstrates how the Mark variant allows variety of different
        colors.
      </p>
      <br />
      <h3>Comparison variant (Ins & Del)</h3>
      <br />
      <p>
        The TextHighlighter component helps users visually track changes within
        a document. It supports both{' '}
        <TextHighlighter kind="del">basic text emphasis</TextHighlighter>{' '}
        <TextHighlighter kind="ins">
          advanced document versioning
        </TextHighlighter>{' '}
        by using inserted and deleted variants. With the{' '}
        <TextHighlighter kind="ins">“Ins” variant</TextHighlighter>, newly added
        content can be clearly highlighted, while the{' '}
        <TextHighlighter kind="del">“highlight” style</TextHighlighter>{' '}
        <TextHighlighter kind="ins">“Del” variant</TextHighlighter> marks
        removed or outdated sections.
      </p>

      <p>
        This makes the component ideal for{' '}
        <TextHighlighter kind="del">simple note taking</TextHighlighter>{' '}
        <TextHighlighter kind="ins">
          collaborative editing, content reviews, and change tracking
        </TextHighlighter>
        . The clean design and customizable styles ensure that edits are{' '}
        <TextHighlighter kind="ins">
          easy to read and contextually meaningful
        </TextHighlighter>
        , improving the overall clarity of document comparisons.
      </p>
    </div>
  );
}

export default App;
