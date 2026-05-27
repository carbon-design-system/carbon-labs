/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { FileUploaderButton } from '../components/FileUploaderButton';

describe('FileUploaderButton', () => {
  describe('renders as expected - Component API', () => {
    it('should render with default props', () => {
      render(<FileUploaderButton />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render with custom label text', () => {
      const labelText = 'Upload files';
      render(<FileUploaderButton labelText={labelText} />);
      expect(screen.getByText(labelText)).toBeInTheDocument();
    });

    it('should render with custom button text', () => {
      const buttonText = 'Choose file';
      render(<FileUploaderButton buttonText={buttonText} />);
      expect(screen.getByText(buttonText)).toBeInTheDocument();
    });

    it('should be disabled when disabled prop is true', () => {
      render(<FileUploaderButton disabled />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should accept multiple files when multiple prop is true', () => {
      render(<FileUploaderButton multiple />);
      const input = document.querySelector('input[type="file"]');
      expect(input).toHaveAttribute('multiple');
    });

    it('should accept specific file types', () => {
      const accept = '.jpg,.png';
      render(<FileUploaderButton accept={accept} />);
      const input = document.querySelector('input[type="file"]');
      expect(input).toHaveAttribute('accept', accept);
    });
  });
});
