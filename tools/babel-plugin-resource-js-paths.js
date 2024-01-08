/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import replaceExtension from 'replace-ext';

export default function resourceJSPaths(babel) {
  const t = babel.types;

  return {
    visitor: {
      ImportDeclaration(path, state) {
        const { node } = path;
        const { value: source } = node.source;
        if (/^\..*\.scss\?inline$/i.test(source)) {
          const declaration = t.cloneNode(node);
          declaration.source.value = `${replaceExtension(source, '.css.js')}`;
          path.replaceWith(declaration);
        }
      },
    },
  };
}
