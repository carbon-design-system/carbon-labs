/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { injectMdxMetadata } from '../src/utils/mdx.js';
import { mkdtemp, rm, mkdir, writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const SAMPLE_MDX = `import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as ExampleButtonStories from './ExampleButton.stories';

<Meta isTemplate />

# ExampleButton

- **Initiative owner(s):** FILL THIS LINE
- **Status:** Draft
- **Target library:** TBD
- **Support channel:** \`#carbon-labs\`

## Overview

This is an example button component.
`;

const SAMPLE_STORIES = `import ExampleButtonDocs from './ExampleButton.mdx';
import { ExampleButton } from '../ExampleButton.js';

export default {
  title: 'Components/ExampleButton',
  component: ExampleButton,
  docs: { page: ExampleButtonDocs },
};

export const Default = () => <ExampleButton />;
`;

async function makeComponentDir(tmpDir, name) {
  const componentDir = join(tmpDir, name);
  const storiesDir = join(componentDir, '__stories__');
  await mkdir(storiesDir, { recursive: true });
  await writeFile(join(storiesDir, `${name}.mdx`), SAMPLE_MDX);
  await writeFile(join(storiesDir, `${name}.stories.js`), SAMPLE_STORIES);
  return componentDir;
}

describe('injectMdxMetadata', () => {
  let tmpDir;
  let componentDir;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'create-mdx-test-'));
    componentDir = await makeComponentDir(tmpDir, 'ExampleButton');
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  // ── MDX owner injection ────────────────────────────────────────────────

  it('replaces FILL THIS LINE with owner handles', async () => {
    await injectMdxMetadata({
      componentDir,
      componentName: 'ExampleButton',
      owners: ['@ajcase', '@bob'],
    });
    const content = await readFile(
      join(componentDir, '__stories__', 'ExampleButton.mdx'),
      'utf8'
    );
    expect(content).toContain('@ajcase, @bob');
    expect(content).not.toContain('FILL THIS LINE');
  });

  it('leaves owner line untouched when owners array is empty', async () => {
    await injectMdxMetadata({
      componentDir,
      componentName: 'ExampleButton',
      owners: [],
    });
    const content = await readFile(
      join(componentDir, '__stories__', 'ExampleButton.mdx'),
      'utf8'
    );
    expect(content).toContain('FILL THIS LINE');
  });

  // ── MDX problem-statement scaffold ────────────────────────────────────

  it('injects a problem-statement scaffold after ## Overview', async () => {
    await injectMdxMetadata({
      componentDir,
      componentName: 'ExampleButton',
      owners: ['@ajcase'],
    });
    const content = await readFile(
      join(componentDir, '__stories__', 'ExampleButton.mdx'),
      'utf8'
    );
    expect(content).toContain('carbon-labs-create:problem-statement');
    expect(content).toContain('Problem statement:');
    // Scaffold must appear after ## Overview
    const overviewIdx = content.indexOf('## Overview');
    const scaffoldIdx = content.indexOf('carbon-labs-create:problem-statement');
    expect(scaffoldIdx).toBeGreaterThan(overviewIdx);
  });

  it('is idempotent — does not duplicate the scaffold on second call', async () => {
    await injectMdxMetadata({
      componentDir,
      componentName: 'ExampleButton',
      owners: ['@ajcase'],
    });
    await injectMdxMetadata({
      componentDir,
      componentName: 'ExampleButton',
      owners: ['@ajcase'],
    });
    const content = await readFile(
      join(componentDir, '__stories__', 'ExampleButton.mdx'),
      'utf8'
    );
    const count = (content.match(/carbon-labs-create:problem-statement/g) || [])
      .length;
    expect(count).toBe(1);
  });

  // ── Stories file tagging ───────────────────────────────────────────────

  it('defaults the Storybook title group to Components/', async () => {
    await injectMdxMetadata({
      componentDir,
      componentName: 'ExampleButton',
      owners: ['@ajcase'],
    });
    const content = await readFile(
      join(componentDir, '__stories__', 'ExampleButton.stories.js'),
      'utf8'
    );
    expect(content).toContain("title: 'Components/ExampleButton'");
  });

  it('uses a custom storybookGroup when provided', async () => {
    await injectMdxMetadata({
      componentDir,
      componentName: 'ExampleButton',
      owners: ['@ajcase'],
      storybookGroup: 'Squad',
    });
    const content = await readFile(
      join(componentDir, '__stories__', 'ExampleButton.stories.js'),
      'utf8'
    );
    expect(content).toContain("title: 'Squad/ExampleButton'");
    expect(content).not.toContain("title: 'Components/ExampleButton'");
  });

  it('is idempotent when re-run with the same group', async () => {
    await injectMdxMetadata({
      componentDir,
      componentName: 'ExampleButton',
      owners: ['@ajcase'],
      storybookGroup: 'Labs',
    });
    await injectMdxMetadata({
      componentDir,
      componentName: 'ExampleButton',
      owners: ['@ajcase'],
      storybookGroup: 'Labs',
    });
    const content = await readFile(
      join(componentDir, '__stories__', 'ExampleButton.stories.js'),
      'utf8'
    );
    const count = (content.match(/title:/g) || []).length;
    expect(count).toBe(1);
    expect(content).toContain("title: 'Labs/ExampleButton'");
  });

  it("adds tags: ['squad', 'incubating'] to the stories default export", async () => {
    await injectMdxMetadata({
      componentDir,
      componentName: 'ExampleButton',
      owners: ['@ajcase'],
    });
    const content = await readFile(
      join(componentDir, '__stories__', 'ExampleButton.stories.js'),
      'utf8'
    );
    expect(content).toContain("tags: ['squad', 'incubating']");
  });

  it('does not duplicate tags on second call', async () => {
    await injectMdxMetadata({
      componentDir,
      componentName: 'ExampleButton',
      owners: ['@ajcase'],
    });
    await injectMdxMetadata({
      componentDir,
      componentName: 'ExampleButton',
      owners: ['@ajcase'],
    });
    const content = await readFile(
      join(componentDir, '__stories__', 'ExampleButton.stories.js'),
      'utf8'
    );
    const count = (content.match(/tags:/g) || []).length;
    expect(count).toBe(1);
  });

  it('handles missing stories file gracefully (no throw)', async () => {
    const emptyDir = join(tmpDir, 'Empty');
    await mkdir(join(emptyDir, '__stories__'), { recursive: true });
    await writeFile(join(emptyDir, '__stories__', 'Empty.mdx'), SAMPLE_MDX);
    // No stories file written — should not throw
    await expect(
      injectMdxMetadata({
        componentDir: emptyDir,
        componentName: 'Empty',
        owners: [],
      })
    ).resolves.not.toThrow();
  });
});
