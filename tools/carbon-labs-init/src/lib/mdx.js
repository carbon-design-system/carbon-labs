import { readFile, writeFile, access } from 'fs/promises';
import { join } from 'path';

const OWNER_PLACEHOLDER = 'FILL THIS LINE';
const STORIES_EXTENSIONS = ['.stories.js', '.stories.jsx', '.stories.tsx'];

/**
 * Injects the maintainer block and problem-statement into the generated MDX,
 * and tags the stories file so it groups under "Squad" in the Storybook sidebar.
 *
 * Safe to call on a freshly generated component directory.
 *
 * @param {object} opts
 * @param {string} opts.componentDir - absolute path to the component folder
 * @param {string} opts.componentName - cased component name (e.g. "MyButton")
 * @param {string[]} opts.owners - normalized @handle list
 * @param {string} [opts.problemStatement] - if provided, injected as real text;
 *   otherwise a TODO scaffold is inserted for the author to fill in
 * @param {string} [opts.storybookGroup] - Storybook sidebar group, e.g. "Components"
 */
export async function injectMdxMetadata({ componentDir, componentName, owners, problemStatement, storybookGroup = 'Components' }) {
  await Promise.all([
    injectMdxFile({ componentDir, componentName, owners, problemStatement }),
    injectStoriesFile({ componentDir, componentName, storybookGroup }),
  ]);
}

async function injectMdxFile({ componentDir, componentName, owners, problemStatement }) {
  const mdxPath = join(componentDir, '__stories__', `${componentName}.mdx`);
  let content = await readFile(mdxPath, 'utf8');

  // ── 1. Owner placeholder ───────────────────────────────────────────────
  if (owners.length > 0 && content.includes(OWNER_PLACEHOLDER)) {
    content = content.replace(OWNER_PLACEHOLDER, owners.join(', '));
  }

  // ── 2. Problem-statement ──────────────────────────────────────────────
  // Inserted immediately after the "## Overview" heading.
  // Only inject once — idempotent if the file is processed again.
  const SCAFFOLD_MARKER = '{/* carbon-labs-init:problem-statement */}';
  if (!content.includes(SCAFFOLD_MARKER)) {
    const body = problemStatement
      ? `> **Problem statement:** ${problemStatement}\n`
      : `{/*\n` +
        ` * TODO: Replace this block with a concise problem statement.\n` +
        ` *\n` +
        ` * Answer:\n` +
        ` *   - What gap does this component fill?\n` +
        ` *   - What user need does it address?\n` +
        ` *   - Which existing Carbon component is the nearest neighbor (if any)?\n` +
        ` */}\n` +
        `> **Problem statement:** _Describe the gap this component fills (edit or delete this line)._\n`;

    const scaffold = `\n${SCAFFOLD_MARKER}\n${body}`;

    content = content.replace(
      /^(## Overview)$/m,
      `$1\n${scaffold}`
    );
  }

  await writeFile(mdxPath, content, 'utf8');
}

async function injectStoriesFile({ componentDir, componentName, storybookGroup }) {
  const storiesDir = join(componentDir, '__stories__');

  // Find whichever extension the generator produced
  let storiesPath = null;
  for (const ext of STORIES_EXTENSIONS) {
    const candidate = join(storiesDir, `${componentName}${ext}`);
    try {
      await access(candidate);
      storiesPath = candidate;
      break;
    } catch {
      // try next
    }
  }

  if (!storiesPath) return; // generator may not have produced a stories file yet

  let content = await readFile(storiesPath, 'utf8');

  // ── 1. Set/replace Storybook group in title ───────────────────────────
  // Replaces whatever group the generator used (Components/) with the
  // configured storybookGroup. Idempotent — re-running with the same
  // group value is a no-op.
  content = content.replace(
    /(title:\s*['"])[^/'"]+\//,
    `$1${storybookGroup}/`
  );

  // ── 2. Add tags if not already present ────────────────────────────────
  // Inserts after the title line inside the default export object.
  if (!content.includes("tags:")) {
    content = content.replace(
      /(title:\s*['"][^'"]+['"],?)\n/,
      `$1\n  tags: ['squad', 'incubating'],\n`
    );
  }

  await writeFile(storiesPath, content, 'utf8');
}
