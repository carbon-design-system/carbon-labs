/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * File metadata interface
 */
export interface FileMetadata {
  name: string;
  size: number;
}

/**
 * Utility functions for file handling
 */
export class FileUtils {
  /**
   * Create a file input element and trigger file selection
   * @param {boolean} multiple - Whether to allow multiple file selection
   * @param {(files: FileList) => void} onFilesSelected - Callback when files are selected
   */
  public static triggerFileSelection(
    multiple: boolean,
    onFilesSelected: (files: FileList) => void
  ): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = multiple;

    /**
     * Handle file input change event
     * @param {Event} e - File input change event
     */
    input.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        onFilesSelected(files);
      }
    };

    input.click();
  }

  /**
   * Convert FileList to array of file metadata
   * @param {FileList} files - The FileList to convert
   * @returns {FileMetadata[]} Array of file metadata
   */
  public static fileListToMetadata(files: FileList): FileMetadata[] {
    return Array.from(files).map((file) => ({
      name: file.name,
      size: file.size,
    }));
  }

  /**
   * Format file names as comma-separated string
   * @param {FileList} files - The FileList to format
   * @returns {string} Comma-separated file names
   */
  public static formatFileNames(files: FileList): string {
    return Array.from(files)
      .map((f) => f.name)
      .join(', ');
  }

  /**
   * Check if a file is an image based on its MIME type
   * @param {File} file - The file to check
   * @returns {boolean} True if the file is an image
   */
  public static isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  /**
   * Convert a File to a data URL
   * @param {File} file - The file to convert
   * @returns {Promise<string>} Promise that resolves to the data URL
   */
  public static fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      /**
       * Handle FileReader load event
       */
      reader.onload = () => resolve(reader.result as string);
      /**
       * Handle FileReader error event
       */
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
