/**
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';

// Mock fs module
jest.unstable_mockModule('node:fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
  readFileSync: jest.fn(),
  unlinkSync: jest.fn(),
  mkdirSync: jest.fn(),
  copyFileSync: jest.fn(),
}));

describe('install script', () => {
  let install;
  let mockFs;
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(async () => {
    // Get mocked fs
    mockFs = await import('node:fs');

    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Import the module after mocking
    const installModule = await import('../install/index.js');
    install = installModule.install;
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('removeExistingCarbonSnippets', () => {
    it('should remove files with new warning text (@carbon-labs/vscode-snippets)', () => {
      const snippetFile = 'carbon-test.code-snippets';
      const fileContent = `/**
 * Copyright IBM Corp. 2025
 * WARNING: installed by @carbon-labs/vscode-snippets - local updates will be lost on package install
 */
{ "test": "snippet" }`;

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([snippetFile, 'other-file.json']);
      mockFs.readFileSync.mockReturnValue(fileContent);

      install();

      expect(mockFs.unlinkSync).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('removed existing carbon snippet file')
      );
    });

    it('should remove files with old warning text (carbon-vscode-snippets)', () => {
      const snippetFile = 'carbon-old.code-snippets';
      const fileContent = `{
  // WARNING: installed by carbon-vscode-snippets local updates will be lost on running package install
  "test": "snippet"
}`;

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([snippetFile]);
      mockFs.readFileSync.mockReturnValue(fileContent);

      install();

      expect(mockFs.unlinkSync).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('removed existing carbon snippet file')
      );
    });

    it('should not remove files without warning text', () => {
      const snippetFile = 'user-custom.code-snippets';
      const fileContent = '{ "custom": "snippet" }';

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([snippetFile]);
      mockFs.readFileSync.mockReturnValue(fileContent);

      install();

      expect(mockFs.unlinkSync).not.toHaveBeenCalled();
    });

    it('should only process .code-snippets files', () => {
      const snippetFile = 'carbon-test.code-snippets';
      const jsonFile = 'settings.json';
      const fileContent = 'WARNING: installed by @carbon-labs/vscode-snippets';

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([snippetFile, jsonFile]);
      mockFs.readFileSync.mockReturnValue(fileContent);

      install();

      expect(mockFs.readFileSync).toHaveBeenCalledTimes(1);
    });

    it('should handle read errors gracefully', () => {
      const snippetFile = 'carbon-test.code-snippets';
      const error = new Error('Permission denied');

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([snippetFile]);
      mockFs.readFileSync.mockImplementation(() => {
        throw error;
      });

      install();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'error checking file: ' + snippetFile,
        error
      );
      expect(mockFs.unlinkSync).not.toHaveBeenCalled();
    });

    it('should do nothing if destination directory does not exist', () => {
      mockFs.existsSync.mockImplementation((path) => {
        // Return false for .vscode directory, true for src directory
        return path.includes('/src');
      });

      install();

      expect(mockFs.unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('copySnippets', () => {
    it('should create .vscode directory if it does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      mockFs.readdirSync.mockReturnValue(['carbon-test.code-snippets']);

      install();

      expect(mockFs.mkdirSync).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('created .vscode folder')
      );
    });

    it('should copy all snippet files from src to .vscode', () => {
      const snippetFiles = [
        'carbon-general.code-snippets',
        'carbon-spacing.code-snippets',
        'carbon-typography.code-snippets',
      ];

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(snippetFiles);
      mockFs.readFileSync.mockReturnValue('no warning');

      install();

      expect(mockFs.copyFileSync).toHaveBeenCalledTimes(snippetFiles.length);
      snippetFiles.forEach((file) => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining(`installed snippet file: ${file}`)
        );
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('installed all Carbon snippet files')
      );
    });

    it('should not copy files if src directory is empty', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([]);

      install();

      expect(mockFs.copyFileSync).not.toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('installed snippet file')
      );
    });
  });

  describe('install function', () => {
    it('should use INIT_CWD environment variable when available', () => {
      const initCwd = '/custom/project/path';
      process.env.INIT_CWD = initCwd;

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['test.code-snippets']);
      mockFs.readFileSync.mockReturnValue('no warning');

      install();

      expect(mockFs.copyFileSync).toHaveBeenCalled();
      const copyCall = mockFs.copyFileSync.mock.calls[0];
      expect(copyCall[1]).toContain(`${initCwd}/.vscode`);

      delete process.env.INIT_CWD;
    });

    it('should use process.cwd() when INIT_CWD is not available', () => {
      delete process.env.INIT_CWD;
      const cwd = process.cwd();

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['test.code-snippets']);
      mockFs.readFileSync.mockReturnValue('no warning');

      install();

      expect(mockFs.copyFileSync).toHaveBeenCalled();
      const copyCall = mockFs.copyFileSync.mock.calls[0];
      expect(copyCall[1]).toContain(`${cwd}/.vscode`);
    });
  });

  describe('integration test', () => {
    it('should remove old snippets and install new ones', () => {
      const oldSnippet = 'carbon-old.code-snippets';
      const newSnippets = [
        'carbon-general.code-snippets',
        'carbon-spacing.code-snippets',
      ];

      // Mock for copySnippets - src directory
      mockFs.existsSync.mockReturnValueOnce(true); // src exists
      mockFs.readdirSync.mockReturnValueOnce(newSnippets); // src files

      // Mock for .vscode directory check in copySnippets
      mockFs.existsSync.mockReturnValueOnce(true); // .vscode exists

      // Mock for removeExistingCarbonSnippets (called from copySnippets)
      mockFs.existsSync.mockReturnValueOnce(true); // .vscode exists for removal
      mockFs.readdirSync.mockReturnValueOnce([oldSnippet]); // old files
      mockFs.readFileSync.mockReturnValueOnce(
        'WARNING: installed by carbon-vscode-snippets'
      );

      install();

      // Should remove old snippet
      expect(mockFs.unlinkSync).toHaveBeenCalledTimes(1);

      // Should copy new snippets
      expect(mockFs.copyFileSync).toHaveBeenCalledTimes(newSnippets.length);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('installed all Carbon snippet files')
      );
    });
  });
});
