/**
 * @license
 *
 * Copyright IBM Corp. 2023, 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Recursively extracts the plain text from a React node (or array of nodes).
 * @param {any} reactNode a React node, or an array of React nodes
 * @returns {string | undefined} the joined text content
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getComponentText = (reactNode: any): string | undefined => {
  const tmpChildren = reactNode?.props?.children || undefined;

  if (Array.isArray(reactNode)) {
    const joinedNodes: (string | undefined)[] = [];
    reactNode.forEach((node) => {
      if (typeof node === 'object') {
        joinedNodes.push(getComponentText(node));
      } else if (typeof node === 'string') {
        joinedNodes.push(node);
      }
    });
    return joinedNodes.join(' ');
  }
  if (tmpChildren === undefined) {
    if (typeof reactNode === 'string') {
      return reactNode;
    } else {
      return ' ';
    }
  }
  if (typeof tmpChildren === 'object') {
    return getComponentText(reactNode.props.children);
  }
  if (typeof tmpChildren === 'string') {
    return reactNode.props.children;
  }
};
