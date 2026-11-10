/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import type { ElementType } from 'react';
import '@carbon-labs/react-selection-kit/scss/selection-kit.scss';
import { Code, Document, Folder, Image } from '@carbon-labs/react-motion-icons';
import { Button } from '@carbon-labs/react-button';
import { TreeNode, TreeView, TreeViewSkeleton } from '../index';
import type { TreeViewProps, TreeViewSize, TreeViewVariant } from '../index';
import mdx from './TreeView.mdx';

const SIZES: TreeViewSize[] = ['xs', 'sm', 'md', 'lg'];
const VARIANTS: TreeViewVariant[] = ['inverse', 'tonal', 'outlined', 'hero'];

export default {
  title: 'V12/TreeView',
  component: TreeView,
  subcomponents: { TreeNode, TreeViewSkeleton },
  tags: ['alpha'],
  parameters: {
    docs: {
      page: mdx,
    },
    v12: {
      motion: [
        'glide',
        'jump',
        'landing-hover',
        'press',
        'arrival-fold',
        'disclosure',
        'caret',
        'rollover',
      ],
      reduced: {
        jump: 'at-once',
        caret: 'at-once',
      },
      states: [
        'rest',
        'hover',
        'pressed',
        'focus',
        'selected',
        'expanded',
        'collapsed',
        'mixed',
        'disabled',
      ],
    },
  },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    size: { control: 'inline-radio', options: SIZES },
    label: { control: 'text' },
    selected: { control: false },
    active: { control: false },
    timeScale: { control: { type: 'range', min: 0.1, max: 4, step: 0.1 } },
  },
};

const panel = { maxInlineSize: 320 };

const row = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

interface Node {
  id: string;
  label: string;
  icon: ElementType;
  children?: Node[];
}

/** Three levels: folders, a folder in a folder, and files. */
const TREE: Node[] = [
  {
    id: 'documents',
    label: 'Documents',
    icon: Folder,
    children: [
      {
        id: 'reports',
        label: 'Reports',
        icon: Folder,
        children: [
          { id: 'first-quarter', label: 'First quarter', icon: Document },
          { id: 'second-quarter', label: 'Second quarter', icon: Document },
          { id: 'third-quarter', label: 'Third quarter', icon: Document },
        ],
      },
      { id: 'meeting-notes', label: 'Meeting notes', icon: Document },
      { id: 'project-plan', label: 'Project plan', icon: Document },
    ],
  },
  {
    id: 'images',
    label: 'Images',
    icon: Folder,
    children: [
      { id: 'logo', label: 'Logo', icon: Image },
      { id: 'banner', label: 'Banner', icon: Image },
      { id: 'photo', label: 'Team photo', icon: Image },
    ],
  },
  {
    id: 'source',
    label: 'Source',
    icon: Folder,
    children: [
      { id: 'app', label: 'App', icon: Code },
      { id: 'styles', label: 'Styles', icon: Code },
      {
        id: 'tests',
        label: 'Tests',
        icon: Folder,
        children: [
          { id: 'unit-tests', label: 'Unit tests', icon: Code },
          { id: 'page-tests', label: 'Page tests', icon: Code },
        ],
      },
    ],
  },
  { id: 'read-me', label: 'Read me', icon: Document },
];

const PARENTS = (function collect(nodes: Node[]): string[] {
  return nodes.flatMap((n) =>
    n.children ? [n.id, ...collect(n.children)] : []
  );
})(TREE);

interface RenderOptions {
  /** Show each node's icon. */
  icons?: boolean;
  /** Parents open at first. */
  openAtFirst?: readonly string[];
  /** Controlled: the parents that are open. */
  open?: ReadonlySet<string>;
  onToggle?: (id: string, isExpanded: boolean) => void;
  /** Nodes that can't be selected, opened or focused. */
  disabled?: readonly string[];
}

function renderNodes(nodes: Node[], o: RenderOptions = {}) {
  return nodes.map((n) => (
    <TreeNode
      key={n.id}
      id={n.id}
      label={n.label}
      renderIcon={o.icons ? n.icon : undefined}
      disabled={o.disabled?.includes(n.id)}
      {...(n.children
        ? o.open
          ? {
              isExpanded: o.open.has(n.id),
              onToggle: (_: unknown, info: { isExpanded?: boolean }) =>
                o.onToggle?.(n.id, info.isExpanded ?? false),
            }
          : { defaultIsExpanded: o.openAtFirst?.includes(n.id) }
        : null)}>
      {n.children ? renderNodes(n.children, o) : undefined}
    </TreeNode>
  ));
}

/** A tree three levels deep, one node selected. */
export const Default = {
  args: {
    label: 'Files',
    hideLabel: false,
    variant: 'inverse',
    multiselect: false,
    selected: ['second-quarter'],
    active: 'second-quarter',
    timeScale: 1,
  },
  render: (args: TreeViewProps) => (
    <div style={panel}>
      <TreeView {...args}>
        {renderNodes(TREE, { openAtFirst: ['documents', 'reports'] })}
      </TreeView>
    </div>
  ),
};

/** An icon before each label. A motion icon plays on its row's hover. */
export const WithIcons = {
  render: () => (
    <div style={panel}>
      <TreeView label="Files" selected={['logo']} active="logo">
        {renderNodes(TREE, { icons: true, openAtFirst: ['images', 'source'] })}
      </TreeView>
    </div>
  ),
};

/** The four selector styles, side by side. */
export const Variants = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
      {VARIANTS.map((variant) => (
        <div key={variant} style={{ inlineSize: 240 }}>
          <TreeView
            label={`Files, ${variant}`}
            variant={variant}
            selected={['first-quarter']}
            active="first-quarter">
            {renderNodes(TREE, { openAtFirst: ['documents', 'reports'] })}
          </TreeView>
        </div>
      ))}
    </div>
  ),
};

/** Row heights: xs 20, sm 26, md 32 (the default) and lg 40px. */
export const Sizes = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
      {SIZES.map((size) => (
        <div key={size} style={{ inlineSize: 240 }}>
          <TreeView
            label={`Size ${size}`}
            size={size}
            selected={['meeting-notes']}
            active="meeting-notes">
            {renderNodes(TREE, { icons: true, openAtFirst: ['documents'] })}
          </TreeView>
        </div>
      ))}
    </div>
  ),
};

/** `multiselect`: a checkbox on every row. A click on a row toggles it. A parent shows mixed when some of its nodes are checked. */
export const Multiselect = {
  render: () => (
    <div style={panel}>
      <TreeView
        label="Files to share"
        multiselect
        selected={['first-quarter', 'logo', 'banner']}>
        {renderNodes(TREE, {
          icons: true,
          openAtFirst: ['documents', 'reports', 'images'],
        })}
      </TreeView>
    </div>
  ),
};

/** Controlled expansion: Expand all and Collapse all set every parent at once, as one motion. */
export const ControlledExpansion = {
  render: function ControlledExpansionStory() {
    const [open, setOpen] = useState<ReadonlySet<string>>(
      () => new Set(['documents'])
    );
    const toggle = (id: string, isExpanded: boolean) =>
      setOpen((prev) => {
        const next = new Set(prev);
        if (isExpanded) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
    return (
      <div style={{ display: 'grid', gap: 16, ...panel }}>
        <div style={row}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setOpen(new Set(PARENTS))}>
            Expand all
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setOpen(new Set())}>
            Collapse all
          </Button>
        </div>
        <TreeView label="Files">
          {renderNodes(TREE, { icons: true, open, onToggle: toggle })}
        </TreeView>
      </div>
    );
  },
};

/** Disabled nodes: a parent and a file. They can't be selected, opened or focused, and take no hover. */
export const DisabledNodes = {
  render: () => (
    <div style={panel}>
      <TreeView label="Files" selected={['project-plan']} active="project-plan">
        {renderNodes(TREE, {
          icons: true,
          openAtFirst: ['documents'],
          disabled: ['meeting-notes', 'images'],
        })}
      </TreeView>
    </div>
  ),
};

/** TreeViewSkeleton: the rows and their indents drawn as themselves, each label a bar. */
export const Skeleton = {
  render: () => (
    <div style={panel}>
      <TreeViewSkeleton label="Files" count={4} />
    </div>
  ),
};
