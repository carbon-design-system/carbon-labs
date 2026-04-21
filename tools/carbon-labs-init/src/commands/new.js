import { homedir } from 'os';
import { resolve, join } from 'path';
import { execa } from 'execa';
import { log, runStep } from '../lib/logger.js';
import { injectMdxMetadata } from '../lib/mdx.js';
import { validateComponentName, applyNameCasing } from '../lib/names.js';
import { loadConfig, mergeOptions } from '../lib/config.js';
import {
  checkGitHubAuth,
  getOctokit,
  getGitHubUser,
  getOrCreateFork,
  buildPrUrl,
  UPSTREAM_URL,
} from '../lib/github.js';
import {
  cloneOrUpdate,
  ensureUpstream,
  createBranch,
  makeScaffoldCommit,
  readNvmrc,
} from '../lib/git.js';

const PACKAGE_DIR = {
  react: 'packages/react',
  'web-component': 'packages/web-components',
};

// Scoped build order extracted from the root yarn build script.
// We skip @carbon-labs/web-components when targeting react to avoid
// pre-existing upstream TS errors that don't affect the React package.
const BUILD_SCOPES = {
  react: [
    '@carbon-labs/utilities',
    '@carbon-labs/primitives',
    '@carbon-labs/vscode-snippets',
    '@carbon-labs/react',
  ],
  'web-component': [
    '@carbon-labs/utilities',
    '@carbon-labs/primitives',
    '@carbon-labs/vscode-snippets',
    '@carbon-labs/react',
    '@carbon-labs/web-components',
  ],
};

async function scopedBuild(localPath, componentType, { clean = false } = {}) {
  if (clean) {
    await execa('yarn', ['lerna', 'run', 'clean'], { cwd: localPath, stdio: 'inherit' });
  }
  const scopes = BUILD_SCOPES[componentType] ?? BUILD_SCOPES.react;
  for (const scope of scopes) {
    await execa('yarn', ['lerna', 'run', 'build', '--scope', scope], {
      cwd: localPath,
      stdio: 'inherit',
    });
  }
}

export async function newCommand(componentName, options) {
  const isDryRun = Boolean(options.dryRun);
  if (isDryRun) {
    log.warn('Dry-run mode — no changes will be made to disk or GitHub.\n');
  }

  // ── 0. Resolve local path ─────────────────────────────────────────────────
  const rawPath = options.path ?? '~/carbon-labs';
  const localPath = resolve(rawPath.replace(/^~/, homedir()));
  log.info(`Local repo path: ${localPath}`);

  // ── 1. Validate component name ────────────────────────────────────────────
  try {
    validateComponentName(componentName);
  } catch (err) {
    log.error(err.message);
    process.exit(1);
  }

  // ── 2. GitHub auth ────────────────────────────────────────────────────────
  await runStep('Checking GitHub auth (gh CLI)', checkGitHubAuth, { dryRun: isDryRun });

  let octokit;
  let username;

  if (!isDryRun) {
    octokit = await getOctokit();
    username = await getGitHubUser(octokit);
    log.info(`Authenticated as @${username}`);
  } else {
    username = '<your-github-username>';
  }

  // ── 3. Get or create fork ─────────────────────────────────────────────────
  let forkCloneUrl;

  await runStep(
    `Checking for fork of carbon-design-system/carbon-labs under @${username}`,
    async () => {
      const fork = await getOrCreateFork(octokit, username);
      forkCloneUrl = fork.cloneUrl;
      if (fork.existed) {
        log.info(`Using existing fork: ${fork.cloneUrl}`);
      } else {
        log.info(`Fork created: ${fork.cloneUrl}`);
      }
    },
    { dryRun: isDryRun }
  );

  if (isDryRun) {
    forkCloneUrl = `https://github.com/${username}/carbon-labs.git`;
  }

  // ── 4. Clone or update local fork ────────────────────────────────────────
  let git;

  await runStep(
    `Clone / update local fork at ${localPath}`,
    async () => {
      git = await cloneOrUpdate(forkCloneUrl, localPath);
    },
    { dryRun: isDryRun }
  );

  // ── 5. Ensure upstream remote ─────────────────────────────────────────────
  await runStep(
    `Ensuring upstream remote → ${UPSTREAM_URL}`,
    () => ensureUpstream(git),
    { dryRun: isDryRun }
  );

  // ── 6. Check .nvmrc ───────────────────────────────────────────────────────
  if (!isDryRun) {
    const nvmrcVersion = await readNvmrc(localPath);
    if (nvmrcVersion) {
      log.info(`.nvmrc specifies Node ${nvmrcVersion}`);
      const currentMajor = parseInt(process.version.slice(1));
      const requiredMajor = parseInt(nvmrcVersion);
      if (currentMajor !== requiredMajor) {
        try {
          // nvm is a shell function — must be sourced
          await execa('bash', ['-c', '. ~/.nvm/nvm.sh && nvm use'], {
            cwd: localPath,
            stdio: 'pipe',
          });
          log.success(`Switched to Node ${nvmrcVersion} via nvm`);
        } catch {
          log.warn(
            `Node ${nvmrcVersion} required (current: ${process.version}). ` +
              `The Labs generator may fail on other versions.\n  ` +
              `Fix: brew install node@${requiredMajor} && brew link node@${requiredMajor} --force --overwrite`
          );
        }
      }
    }
  }

  // ── 7–8. Validate type, install, scoped build ────────────────────────────
  const componentType = options.type ?? 'react';
  if (!PACKAGE_DIR[componentType]) {
    log.error(`Unknown component type "${componentType}". Use "react" or "web-component".`);
    process.exit(1);
  }

  await runStep(
    'yarn install',
    () => execa('yarn', ['install'], { cwd: localPath, stdio: 'inherit' }),
    { dryRun: isDryRun }
  );

  await runStep(
    `Building ${componentType} package chain`,
    () => scopedBuild(localPath, componentType),
    { dryRun: isDryRun }
  );

  const packageDir = join(localPath, PACKAGE_DIR[componentType]);
  const casedName = applyNameCasing(componentName, componentType);
  log.info(`Component: ${casedName}  (type: ${componentType})`);

  // ── 9. yarn generate ──────────────────────────────────────────────────────
  await runStep(
    `yarn generate ${casedName} in ${PACKAGE_DIR[componentType]}`,
    () => execa('yarn', ['generate', casedName], { cwd: packageDir, stdio: 'inherit' }),
    { dryRun: isDryRun }
  );

  // ── 10. Re-link workspace (install + scoped build, no clean) ─────────────
  await runStep(
    'Re-linking workspace',
    async () => {
      await execa('yarn', ['install'], { cwd: localPath, stdio: 'inherit' });
      await scopedBuild(localPath, componentType);
    },
    { dryRun: isDryRun }
  );

  // ── 11. Create feature branch ─────────────────────────────────────────────
  // Load config now that the repo is present
  const repoConfig = isDryRun ? {} : await loadConfig(localPath).catch(() => ({}));
  const merged = mergeOptions(options, repoConfig);

  const branchName = `feat/${componentName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`;

  await runStep(
    `Creating branch ${branchName}`,
    () => createBranch(git, branchName),
    { dryRun: isDryRun }
  );

  // ── 11b. MDX auto-fill ────────────────────────────────────────────────────
  const componentPath = join(packageDir, 'src', 'components', casedName);

  await runStep(
    `Injecting maintainer block and problem-statement scaffold into MDX`,
    () =>
      injectMdxMetadata({
        componentDir: componentPath,
        componentName: casedName,
        owners: merged.owners ?? [],
        storybookGroup: merged.storybookGroup,
      }),
    { dryRun: isDryRun }
  );

  // ── 12. Initial scaffolding commit ────────────────────────────────────────
  await runStep(
    `git commit: feat(${casedName}): scaffold component`,
    () => makeScaffoldCommit(git, casedName),
    { dryRun: isDryRun }
  );

  // ── 13. Open editor ───────────────────────────────────────────────────────
  const editorCmd = merged.editorCommand ?? 'code';

  if (options.editor !== false) {
    await runStep(
      `Opening ${componentPath} in ${editorCmd}`,
      () => execa(editorCmd, [componentPath], { stdio: 'ignore', detached: true }),
      { dryRun: isDryRun }
    );
  }

  // ── 14. Spawn Storybook (detached, non-blocking) ──────────────────────────
  if (options.storybook !== false && !isDryRun) {
    try {
      const storybookProc = execa('yarn', ['storybook'], {
        cwd: packageDir,
        stdio: 'ignore',
        detached: true,
      });
      storybookProc.unref();
      log.info('Storybook starting in background…');
    } catch {
      log.warn('Failed to start Storybook automatically. Run `yarn storybook` manually.');
    }
  } else if (isDryRun) {
    log.info('[dry-run] Would spawn: yarn storybook');
  }

  // ── 15. Print PR URL ──────────────────────────────────────────────────────
  const prUrl = buildPrUrl(username, branchName);

  log.blank();
  log.success('Scaffold complete!');
  log.blank();
  console.log('  Component folder : ' + componentPath);
  console.log('  Branch           : ' + branchName);
  if (merged.owners?.length) {
    console.log('  Owners           : ' + merged.owners.join(', '));
  }
  console.log('  Draft PR URL     : ' + prUrl);
  log.blank();
  console.log(
    '  Next steps:\n' +
      '    1. Fill in the problem-statement in __stories__/' + casedName + '.mdx\n' +
      '       (look for the TODO block — owners are already pre-filled).\n' +
      '    2. Iterate on your component.\n' +
      '    3. Push: git push -u origin ' + branchName + '\n' +
      '    4. Open the draft PR at the URL above.'
  );
  log.blank();
}
