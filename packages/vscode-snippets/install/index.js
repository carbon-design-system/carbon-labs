/**
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Removes any existing snippet files that contain the carbon-labs/code-snippets warning
 * @param {string} dest - The destination directory to check for existing snippets
 */
function removeExistingCarbonSnippets(dest) {
  if (!fs.existsSync(dest)) {
    return;
  }

  // Check for both old and new warning formats
  const warningTexts = [
    'WARNING: installed by @carbon-labs/vscode-snippets',
    'WARNING: installed by carbon-vscode-snippets',
  ];
  const files = fs.readdirSync(dest);

  files.forEach((file) => {
    if (file.endsWith('.code-snippets')) {
      const filePath = path.join(dest, file);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const hasWarning = warningTexts.some((warning) =>
          content.includes(warning)
        );
        if (hasWarning) {
          fs.unlinkSync(filePath);
          console.log('removed existing carbon snippet file: ' + file);
        }
      } catch (err) {
        console.error('error checking file: ' + file, err);
      }
    }
  });
}

/**
 * Copies VSCode snippets from the src folder to the .vscode folder
 * @param {string} src - The source directory containing snippet files
 * @param {string} dest - The destination .vscode directory
 */
function copySnippets(src, dest) {
  // files in src folder (flat structure)
  const files = fs.readdirSync(src);

  // if there are files check/create destination folder.
  if (files.length > 0) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
      console.log('created .vscode folder');
    }

    // Remove existing carbon snippet files before installing new ones
    removeExistingCarbonSnippets(dest);

    // copy files from src to dest
    files.forEach((file) => {
      const srcFile = path.join(src, file);
      const destFile = path.join(dest, file);

      fs.copyFileSync(srcFile, destFile);
      console.log('installed snippet file: ' + file);
    });
    console.log('installed all Carbon snippet files to .vscode/');
  }
}

/**
 * Main install function that copies Carbon snippet files to the project's .vscode folder
 */
export const install = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  // When installed as a package, src is a sibling of install directory
  const src = path.join(__dirname, '../src');
  // Use INIT_CWD when available (npm install), otherwise use current working directory
  const targetDir = process.env.INIT_CWD || process.cwd();
  const dest = path.join(targetDir, '.vscode');

  copySnippets(src, dest);
};
