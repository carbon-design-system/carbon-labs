/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import mdx from './TagInput.mdx';
import { TagInput } from '../components/TagInput';
import '../components/tag-input.scss';
import './storybook.scss';
import { Button, DismissibleTag, Layer, Stack } from '@carbon/react';

export default {
  title: 'Components/TagInput',
  component: TagInput,
  parameters: {
    docs: {
      page: mdx,
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

// Controlled component wrapper for Storybook
/**
 * Controlled TagInput wrapper component for Storybook stories
 * @param {object} args - Component props
 * @returns {React.ReactElement} Rendered component
 */
const ControlledTagInput = (args) => {
  const [tags, setTags] = useState(args.value || []);

  return (
    <TagInput
      {...args}
      value={tags}
      onTagsChange={(newTags) => {
        setTags(newTags);
        args.onTagsChange?.(newTags);
      }}
    />
  );
};

/**
 * Default story for TagInput
 */
export const Default = {
  render: ControlledTagInput,
  args: {
    id: 'tag-input-default',
    placeholder: 'Type values and press enter key',
    value: [],
    /**
     * Callback when tags change
     * @param {string[]} tags - Updated tags array
     */
    onTagsChange: (tags) => console.log('Tags updated:', tags),
  },
};

export const WithInitialTags = {
  render: ControlledTagInput,
  args: {
    id: 'tag-input-initial',
    placeholder: 'Add more tags',
    value: ['React', 'TypeScript', 'Carbon'],
    /**
     * Callback when tags change
     * @param {string[]} tags - Updated tags array
     */
    onTagsChange: (tags) => console.log('Tags updated:', tags),
  },
};

export const CustomPlaceholder = {
  render: ControlledTagInput,
  args: {
    id: 'tag-input-custom',
    placeholder: 'Enter skills (press Enter to add)',
    value: ['JavaScript', 'CSS'],
    /**
     * Callback when tags change
     * @param {string[]} tags - Updated tags array
     */
    onTagsChange: (tags) => console.log('Tags updated:', tags),
  },
};

// Example showing full control from parent
export const FullyControlled = {
  /**
   * Render function for fully controlled example
   * @param {object} args - Component props
   * @returns {React.ReactElement} Rendered component
   */
  render: function RenderFullyControlled(args) {
    const [tags, setTags] = useState(['Controlled', 'Component']);
    const [log, setLog] = useState([]);

    /**
     * Handle tags change
     * @param {string[]} newTags - New tags array
     */
    const handleTagsChange = (newTags) => {
      setTags(newTags);
      setLog([...log, `Tags changed: ${JSON.stringify(newTags)}`]);
    };

    /**
     *
     */
    const addPredefinedTag = () => {
      setTags([...tags, `Tag ${tags.length + 1}`]);
    };

    /**
     *
     */
    const clearAllTags = () => {
      setTags([]);
    };

    return (
      <div>
        <Stack
          orientation="horizontal"
          gap={'8px'}
          className="fully-controlled-buttons">
          <Button onClick={addPredefinedTag}>Add Predefined Tag</Button>

          <Button kind="danger" onClick={clearAllTags}>
            Clear All Tags
          </Button>
        </Stack>

        <Stack gap={'16px'}>
          <TagInput
            {...args}
            id="fully-controlled"
            placeholder="Type and press Enter"
            value={tags}
            onTagsChange={handleTagsChange}
          />

          <Layer withBackground className="story-info">
            <strong>Current Tags:</strong>
            <pre>{JSON.stringify(tags)}</pre>
            <div>
              <strong>Change Log:</strong>
              {log.map((entry, i) => (
                <div key={i}>{entry}</div>
              ))}
            </div>
          </Layer>
        </Stack>
      </div>
    );
  },
  args: {
    size: 'md',
  },
};

// Example with colored tags using renderTag
export const WithColors = {
  /**
   * Render function for colored tags example
   * @param {object} args - Component props
   * @returns {React.ReactElement} Rendered component
   */
  render: function RenderWithColors(args) {
    const [tags, setTags] = useState(['Error', 'Warning', 'Info', 'Success']);

    return (
      <TagInput
        {...args}
        id="colored-tags"
        placeholder="Add colored tags"
        value={tags}
        onTagsChange={setTags}
        renderTag={(tag, index, onRemove) => {
          let type = 'gray';
          if (tag === 'Error') {
            type = 'red';
          } else if (tag === 'Warning') {
            type = 'magenta';
          } else if (tag === 'Info') {
            type = 'blue';
          } else if (tag === 'Success') {
            type = 'green';
          }

          return (
            <DismissibleTag
              id={`colored-tags-tag-${index}`}
              text={tag}
              type={type}
              size={args.size}
              onClose={onRemove}
            />
          );
        }}
      />
    );
  },
  args: {
    size: 'md',
  },
};
