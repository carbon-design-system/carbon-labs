/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Writes es/motion-properties.css: carbon-motion's `--cds-motion-*` custom
// properties on `:root`, from the Sass module.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileString } from 'sass';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { css } = compileString(
  `@use 'motion-properties' as *;\n:root {\n  @include motion-properties;\n}\n`,
  {
    loadPaths: [
      path.join(root, 'scss'),
      path.resolve(root, '../../node_modules'),
    ],
  }
);

fs.mkdirSync(path.join(root, 'es'), { recursive: true });
fs.writeFileSync(path.join(root, 'es/motion-properties.css'), `${css}\n`);
