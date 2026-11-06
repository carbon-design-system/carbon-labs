/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Prints a plan for a person.

/**
 * A count table as one line per key.
 *
 * @param {Record<string, number>} counts The counts.
 * @returns {string[]} The lines.
 */
function countLines(counts) {
  const keys = Object.keys(counts).sort();
  return keys.length ? keys.map((k) => `    ${k}: ${counts[k]}`) : ['    none'];
}

/**
 * Prints a shared styles plan: each partial, why it comes, its rewrites,
 * warnings and findings.
 *
 * @param {object} plan The plan.
 * @param {object} o What happened.
 * @param {boolean} o.dryRun Whether this was a dry run.
 * @param {{ dir: string, manifest: string } | null} o.wrote Where it wrote, if it did.
 * @param {boolean} o.refused Whether findings refuse the write.
 */
export function printStylesPlan(plan, { dryRun, wrote, refused }) {
  const lines = [
    `Import shared styles from ${plan.source.repo} @ ${plan.source.ref.slice(0, 12)}`,
    `  into ${plan.target}`,
    '',
    `Partials (${plan.partials.length}):`,
    ...plan.partials.map(
      (p) =>
        `    ${p.to}  ← ${p.from}${p.pulledBy ? `  (used by ${p.pulledBy})` : ''}`
    ),
    '',
    'Rewrites:',
    '  imports',
    ...countLines(plan.rewrites.imports),
    '  class prefix',
    ...countLines(plan.rewrites.prefix),
    '  license header',
    ...countLines(plan.rewrites.license),
    '  motion token fallbacks (equal to the token)',
    ...countLines(plan.rewrites.tokenFallbacks),
    '',
    `Warnings (${plan.warnings.length}):`,
    ...plan.warnings.map((w) => `    ${w}`),
    '',
    `Findings (${plan.findings.length}):`,
    ...plan.findings.map((f) => `    ${f.kind}  ${f.where}  ${f.detail}`),
    '',
  ];
  if (dryRun) {
    lines.push(
      refused
        ? 'Dry run: it would refuse to write.'
        : 'Dry run: nothing written.'
    );
  } else if (wrote) {
    lines.push(
      `${refused ? 'Wrote despite findings (--keep-going)' : 'Wrote'} ${wrote.dir}`,
      `Recorded ${wrote.manifest}`
    );
  } else {
    lines.push('Refused: nothing written.');
  }
  console.log(lines.join('\n'));
}

/**
 * Prints a whole package's plan: what travels, its rewrites, dependencies,
 * warnings and findings.
 *
 * @param {object} plan The plan.
 * @param {object} o What happened.
 * @param {boolean} o.dryRun Whether this was a dry run.
 * @param {{ dir: string, manifest: string } | null} o.wrote Where it wrote, if it did.
 * @param {boolean} o.refused Whether findings refuse the write.
 */
export function printPackagePlan(plan, { dryRun, wrote, refused }) {
  const lines = [
    `Import ${plan.source.path} from ${plan.source.repo} @ ${plan.source.ref.slice(0, 12)}`,
    `  as ${plan.name}, into ${plan.target}`,
    '',
    `Files: ${plan.files} travel, ${plan.skipped.length} left out`,
    ...plan.skipped.map((s) => `    left out: ${s}`),
    '',
    'Rewrites:',
    '  imports',
    ...countLines(plan.rewrites.imports),
    '  license header',
    ...countLines(plan.rewrites.license),
    '',
    'Dependencies:',
    `  lane packages: ${plan.dependencies.packages.join(', ') || 'none'}`,
    `  external: ${plan.dependencies.external.join(', ') || 'none'}`,
    `  tests: ${plan.dependencies.test.join(', ') || 'none'}`,
    '',
    `Warnings (${plan.warnings.length}):`,
    ...plan.warnings.map((w) => `    ${w}`),
    '',
    `Findings (${plan.findings.length}):`,
    ...plan.findings.map((f) => `    ${f.kind}  ${f.where}  ${f.detail}`),
    '',
  ];
  if (dryRun) {
    lines.push(
      refused
        ? 'Dry run: it would refuse to write.'
        : 'Dry run: nothing written.'
    );
  } else if (wrote) {
    lines.push(
      `${refused ? 'Wrote despite findings (--keep-going)' : 'Wrote'} ${wrote.dir}`,
      `Recorded ${wrote.manifest}`
    );
  } else {
    lines.push('Refused: nothing written.');
  }
  console.log(lines.join('\n'));
}

/**
 * Prints the plan: files, rewrites, marks, dependencies, the story's
 * parameters, the doc, warnings and findings.
 *
 * @param {object} plan The plan.
 * @param {object} o What happened.
 * @param {boolean} o.dryRun Whether this was a dry run.
 * @param {{ dir: string, manifest: string } | null} o.wrote Where it wrote, if it did.
 * @param {boolean} o.refused Whether findings refuse the write.
 */
export function printPlan(plan, { dryRun, wrote, refused }) {
  const lines = [];
  /**
   * Adds lines.
   *
   * @param {...string} l The lines.
   */
  function push(...l) {
    lines.push(...l);
  }
  push(
    `Import ${plan.id} from ${plan.source.repo} @ ${plan.source.ref.slice(0, 12)}`,
    `  into ${plan.target}`,
    '',
    `Files (${plan.outputs.length}):`,
    ...plan.outputs.map((o) => {
      const f = plan.files.find((x) => x.to === o.path);
      return `    ${o.path}${f ? `  ← ${f.from}` : '  (generated)'}`;
    })
  );
  if (plan.skipped.length) {
    push(`  skipped: ${plan.skipped.join(', ')}`);
  }
  if (plan.indexAdded?.length) {
    push(
      '',
      `Index additions (${plan.indexAdded.length}, names other kit folders take from its files):`,
      ...plan.indexAdded.map(
        (a) =>
          `    ${a.type ? 'type ' : ''}${a.name}  ← ${a.file}: ${a.usedBy.join(', ')}`
      )
    );
  }
  if (plan.testsWaiting.length) {
    push(
      '',
      `Tests waiting (${plan.testsWaiting.length}, held back until their kit folders are in the lane):`,
      ...plan.testsWaiting.map(
        (t) =>
          `    ${t.file}  ← ${t.from}: waiting on ${t.waitingOn.join(', ')}`
      )
    );
  }
  push(
    '',
    'Rewrites:',
    '  imports',
    ...countLines(plan.rewrites.imports),
    '  class prefix',
    ...countLines(plan.rewrites.prefix),
    '  license header',
    ...countLines(plan.rewrites.license),
    '  motion token fallbacks (equal to the token)',
    ...countLines(plan.rewrites.tokenFallbacks ?? {}),
    '',
    `Marks: ${plan.marks.placed.length} placed, ${plan.marks.unplaced.length} not placed, ${plan.marks.proposals.length} API proposals`,
    ...plan.marks.placed.map(
      (m) =>
        `    ${m.file}:${m.line}  ${m.name}${m.line === m.stated ? '' : ` (ledger says line ${m.stated})`}`
    ),
    ...plan.marks.unplaced.map(
      (m) => `    not placed: ${m.name} (${m.place}): ${m.reason}`
    ),
    ...plan.marks.proposals.map((p) => `    proposals/README.md: ${p}`),
    '',
    'Dependencies:',
    '  kit (import these first)',
    ...(plan.dependencies.kit.length
      ? plan.dependencies.kit.map(
          (d) =>
            `    ${d.package} ← ${d.source}${d.inLane ? ' (in the lane)' : ''}${d.testOnly ? ' (tests only)' : ''}: ${d.symbols.join(', ') || '(whole module)'}`
        )
      : ['    none']),
    `  shared styles: ${plan.dependencies.styles.join(', ') || 'none'}`,
    `  external: ${plan.dependencies.external.join(', ') || 'none'}`,
    `  motion used: ${plan.motion.join(', ') || 'none'}`,
    '  seam additions needed',
    ...(plan.dependencies.seamGaps.length
      ? plan.dependencies.seamGaps.map(
          (g) => `    ${g.typeOnly ? 'type ' : ''}${g.name} from ${g.from}`
        )
      : ['    none']),
    '',
    'Story parameters.v12:',
    `    motion: ${plan.story.motion.join(', ') || 'none'}`,
    `    reduced: ${
      Object.entries(plan.story.reduced)
        .map(([k, v]) => `${k} ${v}`)
        .join(', ') || 'none'
    }`,
    ...plan.story.todo.map((t) => `    TODO ${t}`)
  );
  if (plan.doc) {
    push(
      '',
      'Doc:',
      `    kept: ${plan.doc.kept.join(', ')}`,
      ...plan.doc.dropped.map((d) => `    dropped: ${d.heading} (${d.why})`),
      ...plan.doc.pointersRemoved.map((p) => `    removed: "${p}"`),
      `    links to repo files flattened: ${plan.doc.linksFlattened}`
    );
  }
  push(
    '',
    `Warnings (${plan.warnings.length}):`,
    ...plan.warnings.map((w) => `    ${w}`)
  );
  push(
    '',
    `Findings (${plan.findings.length}):`,
    ...plan.findings.map((f) => `    ${f.kind}  ${f.where}  ${f.detail}`),
    ''
  );
  if (dryRun) {
    push(
      refused
        ? 'Dry run: it would refuse to write.'
        : 'Dry run: nothing written.'
    );
  } else if (wrote) {
    push(
      `${refused ? 'Wrote despite findings (--keep-going)' : 'Wrote'} ${wrote.dir}`,
      `Recorded ${wrote.manifest}`
    );
  } else {
    push('Refused: nothing written.');
  }
  console.log(lines.join('\n'));
}
