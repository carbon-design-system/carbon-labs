/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { TagInput } from '../components/TagInput';
import '../components/tag-input.scss';
import './storybook.scss';
import {
  ClickableTile,
  DismissibleTag,
  Layer,
  Stack,
  ToastNotification,
} from '@carbon/react';

/**
 *
 * Interactive examples demonstrating advanced TagInput patterns and integrations.
 * These stories showcase real-world scenarios you might encounter when implementing
 * tag-based interfaces in your application.
 *
 * **Featured Examples:**
 * - **DynamicColors**: Conditional styling based on tag prefixes (error-, success-, etc.)
 * - **RandomColors**: Automatic color assignment from Carbon's color palette
 * - **WithUniformColor**: Consistent styling across all tags
 * - **WithDuplicateChecking**: Validation with toast notifications
 * - **WithSuggestions**: Autocomplete dropdown with keyboard navigation
 *
 */

export default {
  title: 'Components/TagInput/Examples',
  component: TagInput,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

// Available Carbon tag colors
const TAG_COLORS = [
  'red',
  'magenta',
  'purple',
  'blue',
  'cyan',
  'teal',
  'green',
  'gray',
  'cool-gray',
  'warm-gray',
];

// Example with dynamic color assignment based on prefix
export const DynamicColors = {
  /**
   * Render function for dynamic colors example
   * @param {object} args - Component props
   * @returns {React.ReactElement} Rendered component
   */
  render: function RenderDynamicColors(args) {
    const [tags, setTags] = useState(['error-001', 'success-001', 'info-001']);

    return (
      <Stack gap={'16px'}>
        <p className="story-description">
          Try typing tags with prefixes: <code>error-</code>,{' '}
          <code>warning-</code>, <code>success-</code>, or <code>info-</code>
        </p>
        <TagInput
          {...args}
          id="dynamic-colors"
          placeholder="Type error-xxx, success-xxx, etc."
          value={tags}
          onTagsChange={setTags}
          renderTag={(tag, index, onRemove) => {
            let type = 'gray';
            if (tag.startsWith('error')) {
              type = 'red';
            } else if (tag.startsWith('warning')) {
              type = 'magenta';
            } else if (tag.startsWith('success')) {
              type = 'green';
            } else if (tag.startsWith('info')) {
              type = 'blue';
            }

            return (
              <DismissibleTag
                id={`dynamic-colors-tag-${index}`}
                text={tag}
                type={type}
                size={args.size}
                onClose={onRemove}
              />
            );
          }}
        />
      </Stack>
    );
  },
  args: {
    size: 'md',
  },
};

// Example with random colors
export const RandomColors = {
  /**
   * Render function for random colors example
   * @param {object} args - Component props
   * @returns {React.ReactElement} Rendered component
   */
  render: function RenderRandomColors(args) {
    // Store tags with their assigned colors and unique IDs
    const [tagsWithColors, setTagsWithColors] = useState([
      {
        id: 1,
        text: 'Random1',
        color: TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)],
      },
      {
        id: 2,
        text: 'Random2',
        color: TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)],
      },
      {
        id: 3,
        text: 'Random3',
        color: TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)],
      },
    ]);

    // Track the next ID to use
    const [nextId, setNextId] = useState(4);

    // Extract just the text for the TagInput value
    const tagTexts = tagsWithColors.map((t) => t.text);

    /**
     * Handle tags change with color assignment
     * @param {string[]} newTags - New tags array
     */
    const handleTagsChange = (newTags) => {
      setTagsWithColors((prevTagsWithColors) => {
        // If a tag was added
        if (newTags.length > prevTagsWithColors.length) {
          const newTagText = newTags[newTags.length - 1];
          const randomColor =
            TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
          setNextId((prev) => prev + 1);
          return [
            ...prevTagsWithColors,
            { id: nextId, text: newTagText, color: randomColor },
          ];
        }
        // If a tag was removed
        else if (newTags.length < prevTagsWithColors.length) {
          // Find which tag was removed by comparing arrays
          const removedIndex = prevTagsWithColors.findIndex(
            (tagObj, idx) => tagObj.text !== newTags[idx]
          );
          return prevTagsWithColors.filter((_, idx) => idx !== removedIndex);
        }
        return prevTagsWithColors;
      });
    };

    return (
      <TagInput
        {...args}
        id="random-colors"
        placeholder="Each tag gets a random color"
        value={tagTexts}
        onTagsChange={handleTagsChange}
        renderTag={(tag, index, onRemove) => {
          const tagWithColor = tagsWithColors[index];

          return (
            <DismissibleTag
              id={`random-colors-tag-${tagWithColor?.id || index}`}
              text={tag}
              type={tagWithColor?.color || 'gray'}
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

// Example with uniform color for all tags
export const WithUniformColor = {
  /**
   * Render function for uniform color example
   * @param {object} args - Component props
   * @returns {React.ReactElement} Rendered component
   */
  render: function RenderWithUniformColor(args) {
    const [tags, setTags] = useState(['Tag1', 'Tag2', 'Tag3']);

    return (
      <Stack gap={'16px'}>
        <p className="story-description">
          All tags use the same color (blue) via the renderTag prop
        </p>
        <TagInput
          {...args}
          id="uniform-color"
          placeholder="Add tags with uniform color"
          value={tags}
          onTagsChange={setTags}
          renderTag={(tag, index, onRemove) => (
            <DismissibleTag
              id={`uniform-color-tag-${index}`}
              text={tag}
              type="blue"
              size={args.size}
              onClose={onRemove}
            />
          )}
        />
      </Stack>
    );
  },
  args: {
    size: 'md',
  },
};

// Example with duplicate checking and warning
export const WithDuplicateChecking = {
  /**
   * Render function for duplicate checking example
   * @param {object} args - Component props
   * @returns {React.ReactElement} Rendered component
   */
  render: function RenderWithDuplicateChecking(args) {
    const [tags, setTags] = useState(['React', 'TypeScript', 'Carbon']);
    const [notifications, setNotifications] = useState([]);

    /**
     * Handle tags change with duplicate checking
     * @param {string[]} newTags - New tags array
     */
    const handleTagsChange = (newTags) => {
      // Get the newly added tag (last item)
      const newTag = newTags[newTags.length - 1];

      // Check if this is an addition (not a removal)
      if (newTags.length > tags.length) {
        // Check for empty tags
        if (!newTag || newTag.trim() === '') {
          const newNotification = {
            id: Date.now(),
            message: 'Empty tags are not allowed!',
          };
          setNotifications((prev) => [...prev, newNotification]);
          return;
        }

        // Check for duplicates (case-insensitive)
        const existingTags = tags.map((tag) => tag.toLowerCase());

        if (existingTags.includes(newTag.toLowerCase())) {
          // Add new notification to the stack
          const newNotification = {
            id: Date.now(),
            message: `"${newTag}" already exists!`,
          };
          setNotifications((prev) => [...prev, newNotification]);

          // Don't update tags - reject the duplicate
          return;
        }
      }

      // Update tags
      setTags(newTags);
    };

    /**
     * Remove notification by ID
     * @param {number} id - Notification ID
     */
    const removeNotification = (id) => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    };

    return (
      <div>
        {/* Toast notification container - fixed to top-right with Carbon spacing */}
        <div className="toast-notification-container">
          {[...notifications].reverse().map((notification) => (
            <div key={notification.id} className="toast-notification-item">
              <ToastNotification
                kind="warning"
                title="Duplicate tag"
                subtitle={notification.message}
                caption=""
                timeout={3000}
                onClose={() => removeNotification(notification.id)}
              />
            </div>
          ))}
        </div>

        <Stack gap={'16px'}>
          <p className="story-description">
            Try adding duplicate tags - the component will show a warning toast
            and prevent duplicates. Duplicate checking is case-insensitive.
            Warnings auto-dismiss after 3 seconds. Multiple duplicate attempts
            will stack with proper spacing.
          </p>

          <TagInput
            {...args}
            id="duplicate-checking"
            placeholder="Try adding 'React' or 'TypeScript'"
            value={tags}
            onTagsChange={handleTagsChange}
          />

          <Layer withBackground className="story-info">
            <strong>Current Tags:</strong>
            <pre>{JSON.stringify(tags)}</pre>
          </Layer>
        </Stack>
      </div>
    );
  },
  args: {
    size: 'md',
  },
};

// Example with tag suggestions dropdown
export const WithSuggestions = {
  /**
   * Render function for suggestions example
   * @param {object} args - Component props
   * @returns {React.ReactElement} Rendered component
   */
  render: function RenderWithSuggestions(args) {
    const [tags, setTags] = useState(['React', 'TypeScript']);
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef(null);
    const inputFieldRef = useRef(null);
    const suggestionRefs = useRef([]);

    // Available suggestions as objects - memoized to prevent recreation on every render
    const suggestions = useMemo(
      () => [
        { id: '1', text: 'React' },
        { id: '2', text: 'TypeScript' },
        { id: '3', text: 'JavaScript' },
        { id: '4', text: 'Python' },
        { id: '5', text: 'Java' },
        { id: '6', text: 'Carbon' },
        { id: '7', text: 'Node.js' },
        { id: '8', text: 'Express' },
        { id: '9', text: 'MongoDB' },
        { id: '10', text: 'PostgreSQL' },
        { id: '11', text: 'GraphQL' },
        { id: '12', text: 'REST API' },
        { id: '13', text: 'Docker' },
        { id: '14', text: 'Kubernetes' },
        { id: '15', text: 'AWS' },
        { id: '16', text: 'Azure' },
        { id: '17', text: 'Google Cloud' },
        { id: '18', text: 'Redux' },
        { id: '19', text: 'Vue.js' },
        { id: '20', text: 'Angular' },
      ],
      []
    );

    // Filter suggestions based on input and exclude already added tags
    const filteredSuggestions = useMemo(() => {
      if (!inputValue) {
        return [];
      }
      return suggestions.filter(
        (suggestion) =>
          suggestion.text.toLowerCase().includes(inputValue.toLowerCase()) &&
          !tags.includes(suggestion.text)
      );
    }, [inputValue, tags, suggestions]);

    // Handle suggestion selection
    const selectSuggestion = useCallback(
      (suggestionText) => {
        if (suggestionText && !tags.includes(suggestionText)) {
          setTags([...tags, suggestionText]);
          setInputValue('');
          setShowSuggestions(false);
          setHighlightedIndex(-1);

          // Clear the actual input field value to prevent TagInput from adding it
          if (inputFieldRef.current) {
            inputFieldRef.current.value = '';
          }

          // Focus back to input field
          setTimeout(() => inputFieldRef.current?.focus(), 0);
        }
      },
      [tags]
    );

    // Handle keyboard navigation in suggestions
    const handleKeyDown = useCallback(
      (e) => {
        if (showSuggestions && filteredSuggestions.length > 0) {
          switch (e.key) {
            case 'ArrowDown':
              e.preventDefault();
              e.stopPropagation();
              setHighlightedIndex((prev) => {
                const newIndex =
                  prev < filteredSuggestions.length - 1 ? prev + 1 : 0;
                // Use browser's built-in scrollIntoView for overflow containers
                setTimeout(() => {
                  suggestionRefs.current[newIndex]?.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth',
                  });
                }, 0);
                return newIndex;
              });
              break;
            case 'ArrowUp':
              e.preventDefault();
              e.stopPropagation();
              setHighlightedIndex((prev) => {
                const newIndex =
                  prev > 0 ? prev - 1 : filteredSuggestions.length - 1;
                // Use browser's built-in scrollIntoView for overflow containers
                setTimeout(() => {
                  suggestionRefs.current[newIndex]?.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth',
                  });
                }, 0);
                return newIndex;
              });
              break;
            case 'Enter':
              if (highlightedIndex >= 0) {
                e.preventDefault();
                e.stopPropagation();
                selectSuggestion(filteredSuggestions[highlightedIndex].text);
              }
              break;
            case 'Escape':
              e.preventDefault();
              e.stopPropagation();
              setShowSuggestions(false);
              setHighlightedIndex(-1);
              break;
          }
        }
      },
      [showSuggestions, filteredSuggestions, highlightedIndex, selectSuggestion]
    );

    // Handle input changes
    const handleInputChange = useCallback((e) => {
      const value = e.target.value;
      setInputValue(value);
      setShowSuggestions(value.length > 0);
      setHighlightedIndex(-1);
    }, []);

    // Close suggestions when clicking outside
    useEffect(() => {
      /**
       * Handle click outside to close suggestions
       * @param {MouseEvent} event - Mouse event
       */
      const handleClickOutside = (event) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target)
        ) {
          setShowSuggestions(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Intercept the TagInput's input field to add our functionality
    useEffect(() => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const inputField = container.querySelector('input[type="text"]');
      if (!inputField) {
        return;
      }

      inputFieldRef.current = inputField;

      // Override input field behavior - use capture phase for priority
      /**
       * Handle input event
       * @param {Event} e - Input event
       */
      const handleInput = (e) => handleInputChange(e);
      /**
       * Handle keydown event
       * @param {KeyboardEvent} e - Keyboard event
       */
      const handleKey = (e) => handleKeyDown(e);

      inputField.addEventListener('input', handleInput);
      inputField.addEventListener('keydown', handleKey, true); // Capture phase

      return () => {
        inputField.removeEventListener('input', handleInput);
        inputField.removeEventListener('keydown', handleKey, true);
      };
    }, [handleInputChange, handleKeyDown]);

    return (
      <Stack gap={'16px'}>
        <p className="story-description">
          Start typing to see filtered suggestions. Use arrow keys to navigate,
          Enter to select, or Escape to close. You can also type custom values
          and press Enter to add them as tags.
        </p>

        <div ref={containerRef} className="with-suggestions-container">
          <TagInput
            id="tag-input-suggestions"
            placeholder="Type to search..."
            size={args.size}
            value={tags}
            onTagsChange={setTags}
          />

          {showSuggestions && filteredSuggestions.length > 0 && (
            <div
              className="tag-suggestions-dropdown"
              role="listbox"
              aria-label="Tag suggestions"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()} // Prevent input from losing focus
            >
              {filteredSuggestions.map((suggestion, index) => (
                <ClickableTile
                  key={suggestion.id}
                  ref={(el) => {
                    suggestionRefs.current[index] = el;
                  }}
                  className="tag-suggestion-item"
                  role="option"
                  aria-selected={index === highlightedIndex}
                  tabIndex={-1}
                  onClick={() => selectSuggestion(suggestion.text)}
                  onMouseDown={(e) => e.preventDefault()} // Prevent input from losing focus
                  onMouseEnter={() => setHighlightedIndex(index)}>
                  {suggestion.text}
                </ClickableTile>
              ))}
            </div>
          )}
        </div>

        <Layer withBackground className="story-info">
          <strong>Current Tags:</strong>
          <pre>{JSON.stringify(tags, null, 2)}</pre>
          <div>
            <strong>Available Suggestions:</strong>{' '}
            {suggestions.filter((s) => !tags.includes(s.text)).length}
          </div>
        </Layer>
      </Stack>
    );
  },
  args: {
    size: 'md',
  },
};
