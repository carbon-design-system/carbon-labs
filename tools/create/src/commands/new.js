/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { homedir } from 'os';
import { resolve, join } from 'path';
import { execa } from 'execa';
import { log, runStep } from '../utils/logger.js';
import { validateComponentName, applyNameCasing } from '../utils/names.js';
import { loadConfig, mergeOptions } from '../utils/config.js';
import {
  checkGitHubAuth,
  getOctokit,
  getGitHubUser,
  getOrCreateFork,
  buildPrUrl,
  UPSTREAM_URL,
} from '../utils/github.js';
import {
  cloneOrUpdate,
  ensureUpstream,
  createBranch,
  makeScaffoldCommit,
  findRepoRoot,
  readNvmrc,
} from '../utils/git.js';

const PACKAGE_DIR = {
  react: 'packages/react',
  'web-component': 'packages/web-components',
};

function expandPath(path) {
  return resolve(path.replace(/^~/, homedir()));
}

function getBranchName(componentName) {
  return `feat/${componentName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`;
}

async function resolveRepoPath(options, isDryRun) {
  if (!options.withGit) {
    if (options.path) {
      return { localPath: expandPath(options.path) };
    }

    return { localPath: (await findRepoRoot(process.cwd())) ?? process.cwd() };
  }

  const rawPath = options.path ?? '~/carbon-labs';
  const localPath = expandPath(rawPath);

  await runStep('Checking GitHub auth (gh CLI)', checkGitHubAuth, {
    dryRun: isDryRun,
  });

  let octokit;
  let username;

  if (!isDryRun) {
    octokit = await getOctokit();
    username = await getGitHubUser(octokit);
    log.info(`Authenticated as @${username}`);
  } else {
    username = '<your-github-username>';
  }

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

  let git;

  await runStep(
    `Clone / update local fork at ${localPath}`,
    async () => {
      git = await cloneOrUpdate(forkCloneUrl, localPath);
    },
    { dryRun: isDryRun }
  );

  await runStep(
    `Ensuring upstream remote -> ${UPSTREAM_URL}`,
    () => ensureUpstream(git),
    { dryRun: isDryRun }
  );

  return { localPath, git, username };
}

async function checkNodeVersion(localPath) {
  const nvmrcVersion = await readNvmrc(localPath);
  if (!nvmrcVersion) {
    return;
  }

  log.info(`.nvmrc specifies Node ${nvmrcVersion}`);
  const currentMajor = parseInt(process.version.slice(1));
  const requiredMajor = parseInt(nvmrcVersion);
  if (currentMajor === requiredMajor) {
    return;
  }

  try {
    // nvm is a shell function - it must be sourced.
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

export async function newCommand(componentName, options) {
  const isDryRun = Boolean(options.dryRun);
  if (isDryRun) {
    log.warn('Dry-run mode - no changes will be made to disk or GitHub.\n');
  }

  try {
    validateComponentName(componentName);
  } catch (err) {
    log.error(err.message);
    process.exit(1);
  }

  const { localPath, git, username } = await resolveRepoPath(options, isDryRun);
  log.info(`Carbon Labs repo path: ${localPath}`);

  if (!isDryRun) {
    await checkNodeVersion(localPath);
  }

  const repoConfig = isDryRun
    ? {}
    : await loadConfig(localPath).catch(() => ({}));
  const merged = mergeOptions(options, repoConfig);

  const componentType = merged.type;
  if (!PACKAGE_DIR[componentType]) {
    log.error(
      `Unknown component type "${componentType}". Use "react" or "web-component".`
    );
    process.exit(1);
  }

  const branchName = getBranchName(componentName);

  if (options.withGit) {
    await runStep(
      `Creating branch ${branchName}`,
      () => createBranch(git, branchName),
      { dryRun: isDryRun }
    );
  } else {
    log.info('Skipping Git operations. Pass --with-git to opt in.');
  }

  await runStep(
    'yarn install',
    () => execa('yarn', ['install'], { cwd: localPath, stdio: 'inherit' }),
    { dryRun: isDryRun }
  );

  await runStep(
    'yarn build',
    () => execa('yarn', ['build'], { cwd: localPath, stdio: 'inherit' }),
    { dryRun: isDryRun }
  );

  const packageDir = join(localPath, PACKAGE_DIR[componentType]);
  const packageRelativeDir = PACKAGE_DIR[componentType];
  const casedName = applyNameCasing(componentName, componentType);
  log.info(`Component: ${casedName}  (type: ${componentType})`);

  await runStep(
    `yarn generate ${casedName} in ${PACKAGE_DIR[componentType]}`,
    () =>
      execa('yarn', ['generate', casedName], {
        cwd: packageDir,
        stdio: 'inherit',
      }),
    { dryRun: isDryRun }
  );

  const scaffoldArgs = [
    'scaffold',
    '--name',
    casedName,
    '--type',
    componentType,
    '--group',
    merged.storybookGroup,
  ];

  if (merged.owners?.length) {
    scaffoldArgs.push('--owners', merged.owners.join(','));
  }

  await runStep(
    'yarn scaffold',
    () => execa('yarn', scaffoldArgs, { cwd: localPath, stdio: 'inherit' }),
    { dryRun: isDryRun }
  );

  const componentPath = join(packageDir, 'src', 'components', casedName);

  if (options.withGit) {
    await runStep(
      `git commit: feat(${casedName}): scaffold component`,
      () => makeScaffoldCommit(git, casedName),
      { dryRun: isDryRun }
    );
  }

  const editorCmd = merged.editorCommand ?? 'code';

  if (options.editor !== false) {
    await runStep(
      `Opening ${componentPath} in ${editorCmd}`,
      () =>
        execa(editorCmd, [componentPath], { stdio: 'ignore', detached: true }),
      { dryRun: isDryRun }
    );
  }

  if (options.storybook !== false && !isDryRun) {
    try {
      const storybookProc = execa('yarn', ['storybook'], {
        cwd: packageDir,
        stdio: 'ignore',
        detached: true,
      });
      storybookProc.unref();
      log.info('Storybook starting in background...');
    } catch {
      log.warn(
        'Failed to start Storybook automatically. Run `yarn storybook` manually.'
      );
    }
  } else if (options.storybook !== false && isDryRun) {
    log.info('[dry-run] Would spawn: yarn storybook');
  }

  log.blank();
  log.success('Scaffold complete!');
  log.blank();
  console.log('  Component folder : ' + componentPath);
  console.log('  Storybook path   : ' + packageRelativeDir);
  console.log(
    '  Storybook command: cd ' + packageRelativeDir + ' && yarn storybook'
  );
  if (options.withGit) {
    console.log('  Branch           : ' + branchName);
    console.log('  Draft PR URL     : ' + buildPrUrl(username, branchName));
  }
  if (merged.owners?.length) {
    console.log('  Owners           : ' + merged.owners.join(', '));
  }
  log.blank();
  console.log(
    '  Next steps:\n' +
      '    1. Fill in the problem statement in __stories__/' +
      casedName +
      '.mdx.\n' +
      '    2. Iterate on your component.\n' +
      '    3. Preview in Storybook with: cd ' +
      packageRelativeDir +
      ' && yarn storybook\n' +
      (options.withGit
        ? '    4. Push: git push -u origin ' + branchName + '\n'
        : '    4. Commit and push from your current branch.\n')
  );
  log.blank();
}
