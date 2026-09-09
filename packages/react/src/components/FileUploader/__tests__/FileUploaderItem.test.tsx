/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { FileUploaderItem } from '../components/FileUploaderItem';

describe('FileUploaderItem', () => {
  const defaultProps = {
    name: 'test-file.txt',
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renders as expected - Component API', () => {
    it('should render with file name', () => {
      render(<FileUploaderItem {...defaultProps} />);
      expect(screen.getByText('test-file.txt')).toBeInTheDocument();
    });

    it('should render with edit status by default', () => {
      render(<FileUploaderItem {...defaultProps} />);
      expect(screen.getByText('test-file.txt')).toBeInTheDocument();
    });

    it('should render with invalid status', () => {
      render(<FileUploaderItem {...defaultProps} status="invalid" />);
      expect(screen.getByText('test-file.txt')).toBeInTheDocument();
      const item =
        screen.getByText('test-file.txt').parentElement?.parentElement;
      expect(item).toHaveClass('clabs--file-uploader-item--invalid');
    });

    it('should call onDelete when delete button is clicked', () => {
      render(<FileUploaderItem {...defaultProps} />);
      const deleteButton = screen.getByRole('button', {
        name: /remove test-file.txt/i,
      });
      fireEvent.click(deleteButton);
      expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
    });

    it('should display error subject when status is invalid', () => {
      const errorSubject = 'File upload failed';
      render(
        <FileUploaderItem
          {...defaultProps}
          status="invalid"
          errorSubject={errorSubject}
        />
      );
      expect(screen.getByText(errorSubject)).toBeInTheDocument();
    });

    it('should display error body when status is invalid', () => {
      const errorBody = 'The file size exceeds the maximum allowed.';
      render(
        <FileUploaderItem
          {...defaultProps}
          status="invalid"
          errorBody={errorBody}
        />
      );
      expect(screen.getByText(errorBody)).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const customClass = 'custom-file-item';
      render(<FileUploaderItem {...defaultProps} className={customClass} />);
      const item =
        screen.getByText('test-file.txt').parentElement?.parentElement;
      expect(item).toHaveClass(customClass);
    });

    it('should render with uuid data attribute', () => {
      const uuid = 'unique-id-123';
      render(<FileUploaderItem {...defaultProps} uuid={uuid} />);
      const item =
        screen.getByText('test-file.txt').parentElement?.parentElement;
      expect(item).toHaveAttribute('data-uuid', uuid);
    });
  });
});
