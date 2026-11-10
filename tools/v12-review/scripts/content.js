/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Writes the review app's text: from each v12 component's docs page
// (`__stories__/<Name>.mdx`), its title, the paragraphs under the title (the
// summary) and each `##` section as Markdown, keyed by the component's story
// title (`V12/<Name>`), and what the folder has: tests, and the labs status
// its row in the manifest records. The app runs in the browser and cannot read the docs pages' text, so it reads
// this map. `--check` writes nothing and exits 1 when the committed map is
// out of date.

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

/** The repository's root. */
export const ROOT = resolve(HERE, '../../..');

/** Where the components are, from the root. */
export const COMPONENTS = 'packages/react/src/v12/components';

/** Where the map is written. */
export const CONTENT_PATH = resolve(HERE, '../src/content.json');

/** Sections the app draws from the stories themselves, or that only list the page. */
const LEFT_OUT = /^(props|table of contents)\b/i;

/** A line that is only links and separators: a row of links under a title. */
const LINK_ROW = /^\s*((\[[^\]]*\]\([^)]*\)|&nbsp;|\|)\s*)+$/;

/** A row of carbon-labs' owner block: who owns the component, its status. */
const OWNER_ROW =
  /^- \*\*(Initiative owner\(s\)|Status|Target library|Target library maintainer\(s\) \/ PR Reviewer\(s\)|Support channel):\*\*/;

/** An MDX comment on a line of its own, such as a table of contents' marker. */
const COMMENT = /^\s*\{\/\*(.*)\*\/\}\s*$/;

/**
 * One docs page's text: its title, its summary and its sections. JSX
 * (`<Canvas …/>`, `<ArgTypes …/>`), imports, `<Meta>`, MDX comments and the
 * blocks they mark, and the owner block under the title are dropped.
 *
 * @param {string} mdx the page's source
 * @returns {{ title: string, summary: string, sections: { title: string, text: string }[] }}
 */
export function readPage(mdx) {
  const lines = mdx.split('\n');
  let title = '';
  const summary = [];
  const sections = [];
  let current = null;
  let inJsx = false;
  let inOwner = false;
  let inComment = false;
  let block = null;
  for (const [i, line] of lines.entries()) {
    if (/^import\s/.test(line) || /^export\s/.test(line)) continue;
    // An MDX comment over several lines, such as a template's instructions.
    if (inComment || /^\s*\{\/\*(?!.*\*\/\}\s*$)/.test(line)) {
      inComment = !/\*\/\}\s*$/.test(line);
      continue;
    }
    // A generated block between two marker comments, such as a status report.
    const comment = COMMENT.exec(line);
    if (block) {
      if (comment && comment[1].trim() === `/${block}`) block = null;
      continue;
    }
    if (comment) {
      const name = comment[1].trim();
      const closes = (l) => COMMENT.exec(l)?.[1].trim() === `/${name}`;
      if (lines.slice(i + 1).some(closes)) block = name;
      continue;
    }
    // The owner block under the title is the package's, not the summary.
    if (
      !current &&
      (OWNER_ROW.test(line) || (inOwner && /^\s+\S/.test(line)))
    ) {
      inOwner = true;
      continue;
    }
    inOwner = false;
    // A JSX block: from a line opening with `<Capital` to its close.
    if (inJsx || /^\s*<[A-Z]/.test(line)) {
      inJsx = !/\/>\s*$|<\/[A-Z][\w.]*>\s*$/.test(line);
      continue;
    }
    const h1 = /^#\s+(.+)$/.exec(line);
    if (h1 && !title) {
      title = h1[1].trim();
      continue;
    }
    const h2 = /^##\s+(.+)$/.exec(line);
    if (h2) {
      current = { title: h2[1].trim(), lines: [] };
      sections.push(current);
      continue;
    }
    if (LINK_ROW.test(line)) continue;
    (current ? current.lines : summary).push(line);
  }
  const tidy = (list) =>
    list
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  // A page whose summary is only its row of links: its Overview says it.
  const overview = sections.find((s) => /^overview$/i.test(s.title));
  return {
    title,
    summary: tidy(summary) || (overview ? tidy(overview.lines) : ''),
    sections: sections
      .filter((s) => !LEFT_OUT.test(s.title))
      .map((s) => ({ title: s.title, text: tidy(s.lines) }))
      .filter((s) => s.text),
  };
}

/**
 * What a component's folder has, for the cards' tags.
 *
 * @param {string} folder the component's folder
 * @param {Map<string, { labsStatus?: string }>} manifest the manifest's items, by path
 * @param {string} path the folder from the root
 * @returns {{ tests: boolean, status: string | null }}
 */
export function factsOf(folder, manifest, path) {
  return {
    tests: hasTests(folder),
    status: manifest.get(path)?.labsStatus ?? null,
  };
}

/** A test file anywhere in the folder but its build output. */
function hasTests(folder) {
  return readdirSync(folder, { withFileTypes: true }).some((e) =>
    e.isDirectory()
      ? !/^(es|lib|node_modules|__stories__)$/.test(e.name) &&
        hasTests(join(folder, e.name))
      : /\.test\.[jt]sx?$/.test(e.name)
  );
}

/** Every component's text, by story title. */
export function buildContent(root = ROOT) {
  const dir = join(root, COMPONENTS);
  const manifestPath = join(root, 'v12.manifest.json');
  const manifest = new Map(
    existsSync(manifestPath)
      ? JSON.parse(readFileSync(manifestPath, 'utf8')).items.map((i) => [
          i.path,
          i,
        ])
      : []
  );
  const out = {};
  for (const name of readdirSync(dir).sort()) {
    const stories = join(dir, name, '__stories__');
    if (!existsSync(stories)) continue;
    const mdx = readdirSync(stories)
      .filter((f) => f.endsWith('.mdx'))
      .sort((a, b) =>
        a === `${name}.mdx` ? -1 : b === `${name}.mdx` ? 1 : 0
      )[0];
    if (!mdx) continue;
    out[`V12/${name}`] = {
      ...readPage(readFileSync(join(stories, mdx), 'utf8')),
      facts: factsOf(join(dir, name), manifest, `${COMPONENTS}/${name}`),
    };
  }
  return out;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const text = `${JSON.stringify(buildContent(), null, 2)}\n`;
  if (process.argv.includes('--check')) {
    const current = existsSync(CONTENT_PATH)
      ? readFileSync(CONTENT_PATH, 'utf8')
      : '';
    if (current !== text) {
      console.error(
        'tools/v12-review/src/content.json is out of date: run yarn workspace @carbon-labs/v12-review content'
      );
      process.exit(1);
    }
  } else {
    writeFileSync(CONTENT_PATH, text);
    console.log(`content: ${Object.keys(JSON.parse(text)).length} pages`);
  }
}
