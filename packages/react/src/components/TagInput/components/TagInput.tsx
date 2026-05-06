/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, DismissibleTag, TextInput } from '@carbon/react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';

/** Primary UI component for user interaction */

interface TagInputProps {
  id: string;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  /**
   * Array of tag strings (controlled component)
   * Parent component must manage this state
   *
   * @example
   * value={['tag1', 'tag2', 'tag3']}
   */
  value?: string[];
  /**
   * Callback fired when tags change
   * Receives the new array of tag strings
   *
   * @example
   * onTagsChange={(newTags) => setTags(newTags)}
   */
  onTagsChange?: (tags: string[]) => void;
  /**
   * Custom render function for tags
   * Provides complete control over tag rendering
   * Can use any Carbon tag component or custom elements
   *
   * @param tag - The tag string
   * @param index - The index of the tag in the array
   * @param onRemove - Callback to remove this tag
   * @returns React node to render
   *
   * @example
   * // Render with colors
   * renderTag={(tag, index, onRemove) => (
   *   <DismissibleTag
   *     key={`tag-${index}`}
   *     text={tag}
   *     type={tag.startsWith('error') ? 'red' : 'blue'}
   *     onClose={onRemove}
   *   />
   * )}
   */
  renderTag?: (
    tag: string,
    index: number,
    onRemove: () => void
  ) => React.ReactNode;
}

const KEYS = {
  ENTER: 13,
  BACKSPACE: 8,
  DELETE: 46,
  ARROW_LEFT: 37,
  ARROW_RIGHT: 39,
  ESCAPE: 27,
  HOME: 36,
  END: 35,
} as const;

const MIN_INPUT_WIDTH = 200;
const INPUT_PADDING = 32;
const FONT_STYLE = '14px "IBM Plex Sans", sans-serif';

/**
 * Calculate text width using canvas measurement
 */
const measureTextWidth = (text: string, font: string): number => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return MIN_INPUT_WIDTH;

  context.font = font;
  return context.measureText(text).width;
};

export const TagInput = ({
  id,
  placeholder = 'Type values and press enter key',
  size = 'md',
  value = [],
  onTagsChange,
  renderTag,
}: TagInputProps) => {
  const prefix = usePrefix();

  const tags = value;
  const inputRef = useRef<HTMLInputElement>(null);
  const tagRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [focusedTagIndex, setFocusedTagIndex] = useState<number | null>(null);

  // Update refs array when tags change
  useEffect(() => {
    tagRefs.current = tagRefs.current.slice(0, tags.length);
  }, [tags.length]);

  // Remove all buttons inside tag wrappers from tab order
  // This prevents the close button from being focused via Tab
  useEffect(() => {
    tagRefs.current.forEach((wrapper) => {
      if (wrapper) {
        const buttons = wrapper.querySelectorAll('button');
        buttons.forEach((button) => {
          button.setAttribute('tabindex', '-1');
        });
      }
    });
  }, [tags]);

  // Calculate input width based on placeholder
  const inputWidth = useMemo(() => {
    if (!placeholder) return MIN_INPUT_WIDTH;
    const textWidth = measureTextWidth(placeholder, FONT_STYLE);
    return Math.max(MIN_INPUT_WIDTH, textWidth + INPUT_PADDING);
  }, [placeholder]);

  // Notify parent of tag changes
  const updateTags = useCallback(
    (newTags: string[]) => {
      onTagsChange?.(newTags);
    },
    [onTagsChange]
  );

  // Add a new tag
  const addTag = useCallback(
    (inputValue: string) => {
      const trimmedValue = inputValue.trim();

      updateTags([...tags, trimmedValue]);
    },
    [tags, updateTags]
  );

  // Remove the last tag
  const removeLastTag = useCallback(() => {
    if (tags.length > 0) {
      updateTags(tags.slice(0, -1));
    }
  }, [tags, updateTags]);

  // Remove tag at specific index with smart focus management
  const removeTag = useCallback(
    (index: number) => {
      const newTags = tags.filter((_, i) => i !== index);
      updateTags(newTags);

      // Smart focus management after removal
      if (newTags.length === 0) {
        // No tags left, focus input
        inputRef.current?.focus();
        setFocusedTagIndex(null);
      } else if (index < newTags.length) {
        // Focus the tag that took this position
        setTimeout(() => {
          tagRefs.current[index]?.focus();
          setFocusedTagIndex(index);
        }, 0);
      } else {
        // Removed last tag, focus previous tag
        setTimeout(() => {
          tagRefs.current[newTags.length - 1]?.focus();
          setFocusedTagIndex(newTags.length - 1);
        }, 0);
      }
    },
    [tags, updateTags]
  );

  // Handle keyboard events on input field
  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const target = e.target as HTMLInputElement;
      const { value, selectionStart } = target;

      switch (e.keyCode) {
        case KEYS.ENTER:
          e.preventDefault();
          if (value.trim()) {
            addTag(value);
            target.value = '';
          }
          break;

        case KEYS.BACKSPACE:
          if (value === '') {
            removeLastTag();
          }
          break;

        case KEYS.ARROW_LEFT:
          // Move to last tag if cursor is at start and there are tags
          if (selectionStart === 0 && tags.length > 0) {
            e.preventDefault();
            const lastIndex = tags.length - 1;
            tagRefs.current[lastIndex]?.focus();
            setFocusedTagIndex(lastIndex);
          }
          break;

        case KEYS.HOME:
          // Move to first tag if input is empty
          if (value === '' && tags.length > 0) {
            e.preventDefault();
            tagRefs.current[0]?.focus();
            setFocusedTagIndex(0);
          }
          break;
      }
    },
    [addTag, removeLastTag, tags.length]
  );

  // Handle keyboard events on tag wrappers
  const handleTagKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>, index: number) => {
      switch (e.keyCode) {
        case KEYS.ARROW_LEFT:
          e.preventDefault();
          if (index > 0) {
            // Move to previous tag
            tagRefs.current[index - 1]?.focus();
            setFocusedTagIndex(index - 1);
          }
          break;

        case KEYS.ARROW_RIGHT:
          e.preventDefault();
          if (index < tags.length - 1) {
            // Move to next tag
            tagRefs.current[index + 1]?.focus();
            setFocusedTagIndex(index + 1);
          } else {
            // Last tag, return to input
            inputRef.current?.focus();
            setFocusedTagIndex(null);
          }
          break;

        case KEYS.BACKSPACE:
        case KEYS.DELETE:
          e.preventDefault();
          removeTag(index);
          break;

        case KEYS.ESCAPE:
          e.preventDefault();
          inputRef.current?.focus();
          setFocusedTagIndex(null);
          break;

        case KEYS.HOME:
          e.preventDefault();
          tagRefs.current[0]?.focus();
          setFocusedTagIndex(0);
          break;

        case KEYS.END:
          e.preventDefault();
          inputRef.current?.focus();
          setFocusedTagIndex(null);
          break;
      }
    },
    [tags.length, removeTag]
  );

  return (
    <div
      className={`${prefix}--tag-input__container`}
      role="listbox"
      aria-label="Tag list">
      {tags.map((tag, index) => {
        const handleRemove = () => removeTag(index);

        return (
          <div
            key={`${tag}-${index}`}
            ref={(el) => {
              tagRefs.current[index] = el;
            }}
            className={`${prefix}--tag-input__tag-wrapper`}
            tabIndex={-1}
            role="option"
            aria-label={`Tag: ${tag}. Press Delete or Backspace to remove, Arrow keys to navigate, Escape to return to input`}
            aria-selected={focusedTagIndex === index}
            onKeyDown={(e) => handleTagKeyDown(e, index)}
            onFocus={() => setFocusedTagIndex(index)}
            onBlur={() => setFocusedTagIndex(null)}>
            {renderTag ? (
              renderTag(tag, index, handleRemove)
            ) : (
              <DismissibleTag
                id={`${id}-tag-${index}`}
                text={tag}
                title="Remove tag"
                size={size}
                onClose={handleRemove}
              />
            )}
          </div>
        );
      })}
      <TextInput
        ref={inputRef}
        autoComplete="off"
        className={`${prefix}--tag-input__field`}
        id={id}
        placeholder={placeholder}
        onKeyDown={handleInputKeyDown}
        size={size}
        labelText=""
        style={{ '--input-width': `${inputWidth}px` } as React.CSSProperties}
      />
    </div>
  );
};
