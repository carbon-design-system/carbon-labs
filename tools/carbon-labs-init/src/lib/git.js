import { simpleGit } from 'simple-git';
import { existsSync } from 'fs';
import { join } from 'path';

const UPSTREAM_REMOTE = 'upstream';
const UPSTREAM_URL = 'https://github.com/carbon-design-system/carbon-labs.git';

/**
 * Clones the fork if localPath doesn't exist, or fetches + rebases upstream/main
 * if it does. Returns a simple-git instance rooted at localPath.
 */
export async function cloneOrUpdate(cloneUrl, localPath) {
  const dotGit = join(localPath, '.git');

  if (!existsSync(dotGit)) {
    const git = simpleGit();
    await git.clone(cloneUrl, localPath);
    return simpleGit(localPath);
  }

  const git = simpleGit(localPath);

  const remotes = await git.getRemotes(true);
  const originRemote = remotes.find((r) => r.name === 'origin');
  if (!originRemote) {
    throw new Error(
      `"${localPath}" exists but has no "origin" remote. ` +
        'Delete the directory or fix the repo and try again.'
    );
  }

  await git.fetch('upstream').catch(() => {
    // upstream may not be set yet; ensureUpstream adds it below
  });

  await git.checkout('main');

  try {
    await git.pull('upstream', 'main', { '--rebase': null });
  } catch {
    // If upstream isn't configured yet we'll set it in ensureUpstream
    await git.pull('origin', 'main');
  }

  return git;
}

/**
 * Ensures the "upstream" remote points to carbon-design-system/carbon-labs.
 * Adds it if missing; corrects the URL if it's wrong.
 */
export async function ensureUpstream(git) {
  const remotes = await git.getRemotes(true);
  const existing = remotes.find((r) => r.name === UPSTREAM_REMOTE);

  if (!existing) {
    await git.addRemote(UPSTREAM_REMOTE, UPSTREAM_URL);
    return;
  }

  const currentUrl = existing.refs?.fetch || '';
  if (!currentUrl.includes('carbon-design-system/carbon-labs')) {
    await git.remote(['set-url', UPSTREAM_REMOTE, UPSTREAM_URL]);
  }
}

/**
 * Creates and checks out a new branch off main. Does not throw if the branch
 * already exists — it checks it out instead (idempotent for reruns).
 */
export async function createBranch(git, branchName) {
  const summary = await git.branchLocal();
  if (summary.all.includes(branchName)) {
    await git.checkout(branchName);
    return;
  }
  await git.checkoutLocalBranch(branchName);
}

/**
 * Stages all changes and makes a Conventional Commits scaffolding commit.
 */
export async function makeScaffoldCommit(git, componentName) {
  await git.add('.');
  await git.commit(`feat(${componentName}): scaffold component`);
}

/**
 * Reads .nvmrc from localPath and returns the Node version string, or null.
 */
export async function readNvmrc(localPath) {
  try {
    const { readFile } = await import('fs/promises');
    const content = await readFile(join(localPath, '.nvmrc'), 'utf8');
    return content.trim();
  } catch {
    return null;
  }
}
