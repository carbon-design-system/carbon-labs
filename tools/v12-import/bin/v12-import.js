#!/usr/bin/env node
/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// v12-import <id> --from <source repo> --ref <commit> [--dry-run] [--out <dir>]
//
// Brings one kit component into the v12 lane from a source commit: rewrites
// its imports, class prefix and license header, marks its departures, writes
// the lane package with its story and MDX, and records it in the manifest.
// It refuses to write on a leak, an import it can't map or a motion literal.
// With --styles it brings the kit's shared styles partials into the shared
// styles package instead, with the same rewrites and checks; with --package,
// a whole package from the source, its tree as it is.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { UsageError, planImport, writePlan } from '../src/importer.js';
import { printPackagePlan, printPlan, printStylesPlan } from '../src/report.js';
import { planPackage, writePackage } from '../src/packages.js';
import { planStyles, writeStyles } from '../src/styles.js';

const USAGE = `Usage: v12-import <id> --from <source repo> --ref <commit> [options]
       v12-import --styles <a,b> --from <source repo> --ref <commit> [options]
       v12-import --package <id> --from <source repo> --ref <commit> [options]

  <id>              the component's folder in the kit (button,
                    content-switcher), or a file at its root (props, for
                    props.ts)
  --styles <a,b>    instead: the kit's shared styles partials (rollover for
                    styles/_rollover.scss) and the partials they use, into
                    the shared styles package
  --package <id>    instead: a whole package the config lists
                    (motion-icons-core, motion-icons), its tree as it is
  --replace         with --package: replace the package already there
                    (a re-import)
  --from <dir>      the source repository
  --ref <commit>    the commit to read; the working tree is never read
  --dry-run         print the plan and write nothing
  --out <dir>       write the package to <dir>/<Name> (styles: <dir>/v12-styles)
                    and the manifest beside it
  --keep-going      with --out: write even with findings (still exits 1)
  --labs <dir>      the carbon-labs checkout (default: this one)
  --names <a,b>     more names that never go public
  --json            print the plan as JSON
  -h, --help        this help`;

/**
 * Runs the command.
 *
 * @param {string[]} argv The arguments.
 * @returns {number} The exit code.
 */
function main(argv) {
  let args;
  try {
    args = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        from: { type: 'string' },
        ref: { type: 'string' },
        'dry-run': { type: 'boolean', default: false },
        out: { type: 'string' },
        styles: { type: 'string' },
        package: { type: 'string' },
        replace: { type: 'boolean', default: false },
        'keep-going': { type: 'boolean', default: false },
        labs: { type: 'string' },
        names: { type: 'string' },
        json: { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
      },
    });
  } catch (err) {
    console.error(`${err.message}\n\n${USAGE}`);
    return 2;
  }
  const { values, positionals } = args;
  if (values.help) {
    console.log(USAGE);
    return 0;
  }
  const [id] = positionals;
  const styles = values.styles
    ?.split(',')
    .map((n) => n.trim())
    .filter(Boolean);
  const pkg = values.package;
  if (
    (styles ? id || !styles.length : pkg ? id : !id) ||
    (styles && pkg) ||
    !values.from ||
    !values.ref ||
    positionals.length > 1
  ) {
    console.error(USAGE);
    return 2;
  }
  if (values.replace && !pkg) {
    console.error('--replace is for --package only');
    return 2;
  }
  if (values['keep-going'] && !values.out) {
    console.error('--keep-going writes only with --out, never into the repo');
    return 2;
  }
  // Yarn runs workspace scripts in the package folder; paths are the caller's.
  const cwd = process.env.INIT_CWD ?? process.cwd();
  const here = path.dirname(fileURLToPath(import.meta.url));
  const labs = path.resolve(
    cwd,
    values.labs ?? path.join(here, '..', '..', '..')
  );
  const opts = {
    id: pkg ?? id,
    styles,
    from: path.resolve(cwd, values.from),
    ref: values.ref,
    labs,
    names: values.names ? values.names.split(',').map((n) => n.trim()) : [],
  };
  const out = values.out ? path.resolve(cwd, values.out) : undefined;
  let plan;
  try {
    plan = styles
      ? planStyles(opts)
      : pkg
        ? planPackage(opts)
        : planImport(opts);
  } catch (err) {
    if (err instanceof UsageError) {
      console.error(err.message);
      return 2;
    }
    throw err;
  }
  const refused = plan.findings.length > 0;
  const write = !values['dry-run'] && (!refused || values['keep-going']);
  let wrote = null;
  if (write) {
    try {
      wrote = styles
        ? writeStyles(plan, { labs, out })
        : pkg
          ? writePackage(plan, { labs, out, replace: values.replace })
          : writePlan(plan, { labs, out });
    } catch (err) {
      if (err instanceof UsageError) {
        console.error(err.message);
        return 1;
      }
      throw err;
    }
  }
  if (values.json) {
    const { outputs, ...rest } = plan;
    console.log(
      JSON.stringify(
        { ...rest, outputs: outputs.map((o) => o.path), wrote },
        null,
        2
      )
    );
  } else {
    (styles ? printStylesPlan : pkg ? printPackagePlan : printPlan)(plan, {
      dryRun: values['dry-run'],
      wrote,
      refused,
    });
  }
  return refused ? 1 : 0;
}

process.exitCode = main(process.argv.slice(2));
