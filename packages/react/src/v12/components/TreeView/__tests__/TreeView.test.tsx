/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { TreeNode, TreeView } from '../index';

// jsdom runs no Web Animations and loads no fonts: the tree's motion gets
// finished stand-ins.
beforeAll(() => {
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { ready: Promise.resolve(), load: () => Promise.resolve([]) },
  });
  const finished = {
    finished: Promise.resolve(),
    ready: Promise.resolve(),
    cancel() {},
    finish() {},
    pause() {},
    play() {},
    commitStyles() {},
    addEventListener() {},
    removeEventListener() {},
    onfinish: null,
  };
  Element.prototype.getAnimations = () => [];
  Element.prototype.animate = () => finished as unknown as Animation;
});

/** A tree with one parent, in a page running `dir`. */
function tree(dir: 'ltr' | 'rtl') {
  render(
    <div dir={dir}>
      <TreeView label="Files">
        <TreeNode id="docs" label="Documents">
          <TreeNode id="cv" label="Resume" />
        </TreeNode>
      </TreeView>
    </div>
  );
  const parent = screen.getAllByRole('treeitem')[0]!;
  return parent;
}

const press = (node: HTMLElement, key: string) =>
  fireEvent.keyDown(node.querySelector('.cds-tree__row') ?? node, { key });

describe('TreeView keys by direction', () => {
  it('opens with the right arrow and closes with the left, left to right', () => {
    const parent = tree('ltr');
    press(parent, 'ArrowRight');
    expect(parent).toHaveAttribute('aria-expanded', 'true');
    press(parent, 'ArrowLeft');
    expect(parent).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens with the left arrow and closes with the right, right to left', () => {
    const parent = tree('rtl');
    press(parent, 'ArrowRight');
    expect(parent).toHaveAttribute('aria-expanded', 'false');
    press(parent, 'ArrowLeft');
    expect(parent).toHaveAttribute('aria-expanded', 'true');
    press(parent, 'ArrowRight');
    expect(parent).toHaveAttribute('aria-expanded', 'false');
  });
});
