/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { TagInput } from '@carbon-labs/react-tag-input';
import { Button, Layer, Stack } from '@carbon/react';

function App() {
  const [tags, setTags] = useState(['Controlled', 'Component']);
  const [log, setLog] = useState([]);

  const handleTagsChange = (newTags: string[]): void => {
    setTags(newTags);
    setLog([...log, `Tags changed: ${JSON.stringify(newTags)}`]);
  };

  const addPredefinedTag = () => {
    setTags([...tags, `Tag ${tags.length + 1}`]);
  };

  const clearAllTags = () => {
    setTags([]);
  };

  return (
    <div>
      <Stack
        orientation="horizontal"
        gap={'8px'}
        style={{ marginBlockEnd: '16px' }}>
        <Button onClick={addPredefinedTag}>Add Predefined Tag</Button>

        <Button kind="danger" onClick={clearAllTags}>
          Clear All Tags
        </Button>
      </Stack>

      <Stack gap={'16px'}>
        <TagInput
          id="fully-controlled"
          placeholder="Type and press Enter"
          value={tags}
          onTagsChange={handleTagsChange}
        />

        <Layer withBackground style={{ padding: '16px' }}>
          <strong>Current Tags:</strong> {JSON.stringify(tags)}
          <div style={{ marginTop: '0.5rem' }}>
            <strong>Change Log:</strong>
            {log.map((entry, i) => (
              <div
                key={i}
                style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {entry}
              </div>
            ))}
          </div>
        </Layer>
      </Stack>
    </div>
  );
}

export default App;
