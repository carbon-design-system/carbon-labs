/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The docs snapshot: each row's docs page summary, the text a design
// component's description starts with, read from the page as the review
// app reads it.

import fs from 'node:fs';
import { toId } from 'storybook/internal/csf';
import { readPage } from '../../v12-review/scripts/content.js';
import { docsName, storyFilesOf } from './components.js';
import { readManifest, validateFigmaBlocks } from './manifest.js';
import { ModuleReader, readStoryFile, workspacePackages } from './stories.js';
import { SOURCES } from './config.js';
import { firstSentence } from './tokens.js';

/**
 * The docs snapshot.
 *
 * @param {string} root The repository's root.
 * @returns {Promise<object>} The snapshot.
 */
export async function buildDocs(root) {
  const rows = readManifest(root);
  const { blocks } = validateFigmaBlocks(rows);
  const reader = new ModuleReader(
    root,
    workspacePackages(root, SOURCES.components)
  );
  const docs = docsName(root);
  const items = [];
  for (const row of [...rows].sort((a, b) => (a.id < b.id ? -1 : 1))) {
    const block = blocks.get(row.id);
    if (!block || row.kind === 'styles' || !row.path) {
      continue;
    }
    const files = storyFilesOf(root, row.path);
    if (!files.mdx.length) {
      continue;
    }
    const title =
      files.stories.map((f) => readStoryFile(reader, f).title).find(Boolean) ??
      null;
    // The page named after the folder, else the first.
    const own =
      files.mdx.find((f) => f.endsWith(`/${row.path.split('/').pop()}.mdx`)) ??
      files.mdx[0];
    const page = readPage(fs.readFileSync(own, 'utf8'));
    const summary = page.summary.replace(/\s+/g, ' ').trim();
    items.push({
      key: block.key,
      id: row.id,
      title,
      name: page.title || null,
      status: row.labsStatus ?? null,
      docs: title ? toId(title, docs) : null,
      firstSentence: firstSentence(summary),
      summary,
      sections: page.sections.map((s) => s.title),
    });
  }
  return { schema: 'v12-figma/docs@1', side: 'code', items };
}
