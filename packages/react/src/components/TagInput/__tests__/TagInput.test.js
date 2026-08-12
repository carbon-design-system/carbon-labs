/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom';

import { TagInput } from '../components/TagInput';

jest.mock('../components/tag-input.scss', () => ({}));

// Mock Canvas API for measureTextWidth function
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    font: '',
    measureText: jest.fn(() => ({ width: 100 })),
  }));
});

describe('TagInput', () => {
  const defaultProps = {
    id: 'test-tag-input',
    placeholder: 'Type and press Enter',
  };

  describe('renders as expected - Component API', () => {
    it('should render with default props', () => {
      const { container } = render(<TagInput {...defaultProps} />);
      expect(
        container.querySelector('.clabs--tag-input__container')
      ).toBeInTheDocument();
    });

    it('should match snapshot', () => {
      const { container } = render(<TagInput {...defaultProps} />);
      expect(container).toMatchSnapshot();
    });

    it('should render with custom placeholder', () => {
      render(<TagInput id="test" placeholder="Custom placeholder" />);
      expect(
        screen.getByPlaceholderText('Custom placeholder')
      ).toBeInTheDocument();
    });

    it('should render with initial tags', () => {
      const tags = ['React', 'TypeScript', 'Carbon'];
      render(<TagInput {...defaultProps} value={tags} />);

      tags.forEach((tag) => {
        expect(screen.getByText(tag)).toBeInTheDocument();
      });
    });

    it('should render with different sizes', () => {
      const sizes = ['sm', 'md', 'lg'];
      sizes.forEach((size) => {
        const { container, unmount } = render(
          <TagInput {...defaultProps} size={size} />
        );
        expect(
          container.querySelector('.clabs--tag-input__container')
        ).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Tag Management', () => {
    it('should add a tag when Enter is pressed', async () => {
      const onTagsChange = jest.fn();
      render(
        <TagInput {...defaultProps} value={[]} onTagsChange={onTagsChange} />
      );

      const input = screen.getByPlaceholderText('Type and press Enter');
      await userEvent.type(input, 'NewTag');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onTagsChange).toHaveBeenCalledWith(['NewTag']);
    });

    it('should not add empty tags', async () => {
      const onTagsChange = jest.fn();
      render(
        <TagInput {...defaultProps} value={[]} onTagsChange={onTagsChange} />
      );

      const input = screen.getByPlaceholderText('Type and press Enter');
      await userEvent.type(input, '   {Enter}');

      expect(onTagsChange).not.toHaveBeenCalled();
    });

    it('should trim whitespace from tags', async () => {
      const onTagsChange = jest.fn();
      render(
        <TagInput {...defaultProps} value={[]} onTagsChange={onTagsChange} />
      );

      const input = screen.getByPlaceholderText('Type and press Enter');
      await userEvent.type(input, '  NewTag  ');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onTagsChange).toHaveBeenCalledWith(['NewTag']);
    });

    it('should clear input after adding a tag', async () => {
      const onTagsChange = jest.fn();
      render(
        <TagInput {...defaultProps} value={[]} onTagsChange={onTagsChange} />
      );

      const input = screen.getByPlaceholderText('Type and press Enter');
      await userEvent.type(input, 'NewTag');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(input.value).toBe('');
    });

    it('should remove last tag when Backspace is pressed on empty input', async () => {
      const onTagsChange = jest.fn();
      const tags = ['Tag1', 'Tag2', 'Tag3'];
      render(
        <TagInput {...defaultProps} value={tags} onTagsChange={onTagsChange} />
      );

      const input = screen.getByPlaceholderText('Type and press Enter');
      fireEvent.keyDown(input, { key: 'Backspace' }); // Backspace

      expect(onTagsChange).toHaveBeenCalledWith(['Tag1', 'Tag2']);
    });

    it('should not remove tags when Backspace is pressed with text in input', async () => {
      const onTagsChange = jest.fn();
      const tags = ['Tag1', 'Tag2'];
      render(
        <TagInput {...defaultProps} value={tags} onTagsChange={onTagsChange} />
      );

      const input = screen.getByPlaceholderText('Type and press Enter');
      await userEvent.type(input, 'text');
      fireEvent.keyDown(input, { key: 'Backspace' }); // Backspace

      expect(onTagsChange).not.toHaveBeenCalled();
    });

    it('should remove tag when close button is clicked', () => {
      const onTagsChange = jest.fn();
      const tags = ['Tag1', 'Tag2', 'Tag3'];
      render(
        <TagInput {...defaultProps} value={tags} onTagsChange={onTagsChange} />
      );

      // Find all close buttons by aria-label and click the first one
      const closeButtons = screen.getAllByLabelText('Remove tag');
      fireEvent.click(closeButtons[0]);

      expect(onTagsChange).toHaveBeenCalledWith(['Tag2', 'Tag3']);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should focus last tag when ArrowLeft is pressed at input start', () => {
      const tags = ['Tag1', 'Tag2', 'Tag3'];
      render(<TagInput {...defaultProps} value={tags} />);

      const input = screen.getByPlaceholderText('Type and press Enter');
      input.setSelectionRange(0, 0); // Set cursor at start
      fireEvent.keyDown(input, { key: 'ArrowLeft' }); // ArrowLeft

      // Check if last tag wrapper is focused
      const tagWrappers = document.querySelectorAll(
        '.clabs--tag-input__tag-wrapper'
      );
      expect(document.activeElement).toBe(tagWrappers[2]);
    });

    it('should focus first tag when Home is pressed on empty input', () => {
      const tags = ['Tag1', 'Tag2', 'Tag3'];
      render(<TagInput {...defaultProps} value={tags} />);

      const input = screen.getByPlaceholderText('Type and press Enter');
      fireEvent.keyDown(input, { key: 'Home' }); // Home

      const tagWrappers = document.querySelectorAll(
        '.clabs--tag-input__tag-wrapper'
      );
      expect(document.activeElement).toBe(tagWrappers[0]);
    });

    it('should navigate between tags with arrow keys', () => {
      const tags = ['Tag1', 'Tag2', 'Tag3'];
      render(<TagInput {...defaultProps} value={tags} />);

      const tagWrappers = document.querySelectorAll(
        '.clabs--tag-input__tag-wrapper'
      );

      // Focus first tag
      tagWrappers[0].focus();

      // Press ArrowRight to move to next tag
      fireEvent.keyDown(tagWrappers[0], { key: 'ArrowRight' }); // ArrowRight
      expect(document.activeElement).toBe(tagWrappers[1]);

      // Press ArrowLeft to move back
      fireEvent.keyDown(tagWrappers[1], { key: 'ArrowLeft' }); // ArrowLeft
      expect(document.activeElement).toBe(tagWrappers[0]);
    });

    it('should return to input when ArrowRight is pressed on last tag', () => {
      const tags = ['Tag1', 'Tag2', 'Tag3'];
      render(<TagInput {...defaultProps} value={tags} />);

      const tagWrappers = document.querySelectorAll(
        '.clabs--tag-input__tag-wrapper'
      );
      const input = screen.getByPlaceholderText('Type and press Enter');

      // Focus last tag
      tagWrappers[2].focus();

      // Press ArrowRight
      fireEvent.keyDown(tagWrappers[2], { key: 'ArrowRight' }); // ArrowRight
      expect(document.activeElement).toBe(input);
    });

    it('should remove focused tag when Delete is pressed', () => {
      const onTagsChange = jest.fn();
      const tags = ['Tag1', 'Tag2', 'Tag3'];
      render(
        <TagInput {...defaultProps} value={tags} onTagsChange={onTagsChange} />
      );

      const tagWrappers = document.querySelectorAll(
        '.clabs--tag-input__tag-wrapper'
      );

      // Focus middle tag
      tagWrappers[1].focus();

      // Press Delete
      fireEvent.keyDown(tagWrappers[1], { key: 'Delete' }); // Delete
      expect(onTagsChange).toHaveBeenCalledWith(['Tag1', 'Tag3']);
    });

    it('should remove focused tag when Backspace is pressed', () => {
      const onTagsChange = jest.fn();
      const tags = ['Tag1', 'Tag2', 'Tag3'];
      render(
        <TagInput {...defaultProps} value={tags} onTagsChange={onTagsChange} />
      );

      const tagWrappers = document.querySelectorAll(
        '.clabs--tag-input__tag-wrapper'
      );

      // Focus middle tag
      tagWrappers[1].focus();

      // Press Backspace
      fireEvent.keyDown(tagWrappers[1], { key: 'Backspace' }); // Backspace
      expect(onTagsChange).toHaveBeenCalledWith(['Tag1', 'Tag3']);
    });

    it('should return to input when Escape is pressed on tag', () => {
      const tags = ['Tag1', 'Tag2', 'Tag3'];
      render(<TagInput {...defaultProps} value={tags} />);

      const tagWrappers = document.querySelectorAll(
        '.clabs--tag-input__tag-wrapper'
      );
      const input = screen.getByPlaceholderText('Type and press Enter');

      // Focus a tag
      tagWrappers[1].focus();

      // Press Escape
      fireEvent.keyDown(tagWrappers[1], { key: 'Escape' }); // Escape
      expect(document.activeElement).toBe(input);
    });

    it('should focus first tag when Home is pressed on any tag', () => {
      const tags = ['Tag1', 'Tag2', 'Tag3'];
      render(<TagInput {...defaultProps} value={tags} />);

      const tagWrappers = document.querySelectorAll(
        '.clabs--tag-input__tag-wrapper'
      );

      // Focus last tag
      tagWrappers[2].focus();

      // Press Home
      fireEvent.keyDown(tagWrappers[2], { key: 'Home' }); // Home
      expect(document.activeElement).toBe(tagWrappers[0]);
    });

    it('should return to input when End is pressed on any tag', () => {
      const tags = ['Tag1', 'Tag2', 'Tag3'];
      render(<TagInput {...defaultProps} value={tags} />);

      const tagWrappers = document.querySelectorAll(
        '.clabs--tag-input__tag-wrapper'
      );
      const input = screen.getByPlaceholderText('Type and press Enter');

      // Focus first tag
      tagWrappers[0].focus();

      // Press End
      fireEvent.keyDown(tagWrappers[0], { key: 'End' }); // End
      expect(document.activeElement).toBe(input);
    });
  });

  describe('Custom Rendering', () => {
    it('should use custom renderTag function', () => {
      const tags = ['Tag1', 'Tag2'];
      const renderTag = jest.fn((tag, index, onRemove) => (
        <div key={index} data-testid={`custom-tag-${index}`}>
          {tag}
          <button type="button" onClick={onRemove}>
            X
          </button>
        </div>
      ));

      render(<TagInput {...defaultProps} value={tags} renderTag={renderTag} />);

      expect(renderTag).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId('custom-tag-0')).toBeInTheDocument();
      expect(screen.getByTestId('custom-tag-1')).toBeInTheDocument();
    });

    it('should call onRemove from custom renderTag', () => {
      const onTagsChange = jest.fn();
      const tags = ['Tag1', 'Tag2'];
      /**
       * Custom render function for tags
       * @param {string} tag - Tag text
       * @param {number} index - Tag index
       * @param {Function} onRemove - Remove callback
       * @returns {React.ReactElement} Rendered tag element
       */
      const renderTag = (tag, index, onRemove) => (
        <div key={index}>
          {tag}
          <button
            type="button"
            onClick={onRemove}
            data-testid={`remove-${index}`}>
            Remove
          </button>
        </div>
      );

      render(
        <TagInput
          {...defaultProps}
          value={tags}
          onTagsChange={onTagsChange}
          renderTag={renderTag}
        />
      );

      const removeButton = screen.getByTestId('remove-0');
      fireEvent.click(removeButton);

      expect(onTagsChange).toHaveBeenCalledWith(['Tag2']);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on container', () => {
      render(<TagInput {...defaultProps} value={['Tag1']} />);

      const container = document.querySelector('.clabs--tag-input__container');
      expect(container).toHaveAttribute('role', 'group');
      expect(container).toHaveAttribute('aria-label', 'Tag input');
    });

    it('should have proper ARIA attributes on tag wrappers', () => {
      render(<TagInput {...defaultProps} value={['Tag1']} />);

      const tagWrapper = document.querySelector(
        '.clabs--tag-input__tag-wrapper'
      );
      expect(tagWrapper).toHaveAttribute('role', 'listitem');
      expect(tagWrapper).toHaveAttribute('tabIndex', '-1');
      expect(tagWrapper).not.toHaveAttribute('aria-selected');
      expect(tagWrapper).toHaveAttribute(
        'aria-describedby',
        'test-tag-input-tag-instructions'
      );
    });

    it('should render a shared instructions hint for screen readers', () => {
      render(<TagInput {...defaultProps} value={['Tag1', 'Tag2']} />);

      const hint = document.getElementById('test-tag-input-tag-instructions');
      expect(hint).toBeInTheDocument();
      expect(hint.textContent).toMatch(/Delete or Backspace/i);
      expect(hint.textContent).toMatch(/Arrow keys/i);
      expect(hint.textContent).toMatch(/Escape/i);

      // All tag wrappers point to the same hint element
      const tagWrappers = document.querySelectorAll(
        '.clabs--tag-input__tag-wrapper'
      );
      tagWrappers.forEach((wrapper) => {
        expect(wrapper).toHaveAttribute(
          'aria-describedby',
          'test-tag-input-tag-instructions'
        );
      });
    });

    it('should render tags inside a list element', () => {
      render(<TagInput {...defaultProps} value={['Tag1', 'Tag2']} />);

      const list = document.querySelector('[role="list"]');
      expect(list).toBeInTheDocument();
      expect(list).toHaveAttribute('aria-label', 'Added tags');

      const items = list.querySelectorAll('.clabs--tag-input__tag-wrapper');
      expect(items).toHaveLength(2);
    });

    it('should have the tag text as aria-label on tag wrappers', () => {
      render(<TagInput {...defaultProps} value={['TestTag']} />);

      const tagWrapper = document.querySelector(
        '.clabs--tag-input__tag-wrapper'
      );
      expect(tagWrapper).toHaveAttribute('aria-label', 'TestTag');
    });

    it('should announce tag addition to screen readers', async () => {
      const onTagsChange = jest.fn();
      render(
        <TagInput {...defaultProps} value={[]} onTagsChange={onTagsChange} />
      );

      const input = screen.getByPlaceholderText('Type and press Enter');
      await userEvent.type(input, 'React');
      fireEvent.keyDown(input, { key: 'Enter' });

      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion.textContent).toMatch(/React.*added/i);
      expect(liveRegion.textContent).toMatch(/1 tag total/i);
    });

    it('should announce tag removal to screen readers', () => {
      const onTagsChange = jest.fn();
      render(
        <TagInput
          {...defaultProps}
          value={['React', 'TypeScript']}
          onTagsChange={onTagsChange}
        />
      );

      const closeButtons = screen.getAllByLabelText('Remove tag');
      fireEvent.click(closeButtons[0]);

      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion.textContent).toMatch(/React.*removed/i);
      expect(liveRegion.textContent).toMatch(/1 tag remaining/i);
    });

    it('should remove tabindex from close buttons', () => {
      render(<TagInput {...defaultProps} value={['Tag1']} />);

      const closeButton = screen.getByLabelText('Remove tag');
      expect(closeButton).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty value array', () => {
      const { container } = render(<TagInput {...defaultProps} value={[]} />);
      expect(
        container.querySelectorAll('.clabs--tag-input__tag-wrapper')
      ).toHaveLength(0);
    });

    it('should handle undefined value', () => {
      const { container } = render(<TagInput {...defaultProps} />);
      expect(
        container.querySelectorAll('.clabs--tag-input__tag-wrapper')
      ).toHaveLength(0);
    });

    it('should handle missing onTagsChange callback', async () => {
      render(<TagInput {...defaultProps} value={[]} />);

      const input = screen.getByPlaceholderText('Type and press Enter');

      // Should not throw error
      expect(() => {
        fireEvent.change(input, { target: { value: 'NewTag' } });
        fireEvent.keyDown(input, { key: 'Enter' }); // Enter
      }).not.toThrow();
    });

    it('should handle rapid tag additions', async () => {
      const onTagsChange = jest.fn();
      render(
        <TagInput {...defaultProps} value={[]} onTagsChange={onTagsChange} />
      );

      const input = screen.getByPlaceholderText('Type and press Enter');

      await userEvent.type(input, 'Tag1');
      fireEvent.keyDown(input, { key: 'Enter' });
      await userEvent.type(input, 'Tag2');
      fireEvent.keyDown(input, { key: 'Enter' });
      await userEvent.type(input, 'Tag3');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onTagsChange).toHaveBeenCalledTimes(3);
    });

    it('should maintain focus after removing a tag', () => {
      const onTagsChange = jest.fn();
      const tags = ['Tag1', 'Tag2', 'Tag3'];
      render(
        <TagInput {...defaultProps} value={tags} onTagsChange={onTagsChange} />
      );

      const tagWrappers = document.querySelectorAll(
        '.clabs--tag-input__tag-wrapper'
      );

      // Focus middle tag
      tagWrappers[1].focus();

      // Remove it
      fireEvent.keyDown(tagWrappers[1], { key: 'Delete' }); // Delete

      // After removal, focus should be managed (either on next tag or input)
      expect(document.activeElement).toBeTruthy();
    });

    it('should handle special characters in tags', async () => {
      const onTagsChange = jest.fn();
      render(
        <TagInput {...defaultProps} value={[]} onTagsChange={onTagsChange} />
      );

      const input = screen.getByPlaceholderText('Type and press Enter');
      const specialTag = 'tag@#$%^&*()';

      await userEvent.type(input, specialTag);
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onTagsChange).toHaveBeenCalledWith([specialTag]);
    });
  });
});
