/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { execa } from 'execa';
import { Octokit } from '@octokit/rest';

const UPSTREAM_OWNER = 'carbon-design-system';
const UPSTREAM_REPO = 'carbon-labs';

/**
 * Verifies `gh` CLI is installed and the user is authenticated.
 * Throws a descriptive error if not.
 */
export async function checkGitHubAuth() {
  try {
    await execa('gh', ['auth', 'status'], { stdio: 'pipe' });
  } catch (err) {
    const output = err.stderr || err.stdout || '';
    if (
      output.includes('not logged in') ||
      output.includes('not authenticated')
    ) {
      throw new Error(
        'Not authenticated with GitHub. Run `gh auth login` and try again.'
      );
    }
    if (err.code === 'ENOENT') {
      throw new Error(
        '`gh` CLI not found. Install it from https://cli.github.com and run `gh auth login`.'
      );
    }
    // gh auth status exits non-zero even when authed in some versions — ignore
    if (!output.includes('Logged in')) {
      throw new Error(
        `GitHub auth check failed: ${
          output || err.message
        }. Run \`gh auth login\` and try again.`
      );
    }
  }
}

/**
 * Returns a token from `gh auth token` and a configured Octokit instance.
 */
export async function getOctokit() {
  let token;
  try {
    const result = await execa('gh', ['auth', 'token'], { stdio: 'pipe' });
    token = result.stdout.trim();
  } catch (err) {
    throw new Error(
      `Could not retrieve GitHub token: ${err.message}. Run \`gh auth login\`.`
    );
  }

  return new Octokit({ auth: token });
}

/**
 * Returns the authenticated GitHub username.
 */
export async function getGitHubUser(octokit) {
  const { data } = await octokit.rest.users.getAuthenticated();
  return data.login;
}

/**
 * Ensures the authenticated user has a fork of carbon-design-system/carbon-labs.
 * Creates one if it doesn't exist. Returns the fork's clone URL (HTTPS).
 *
 * Note: GitHub's fork API is async — the fork may not be ready for a few seconds
 * after creation, but that's fine because we clone immediately after.
 */
export async function getOrCreateFork(octokit, username) {
  // Check if the fork already exists
  try {
    const { data } = await octokit.rest.repos.get({
      owner: username,
      repo: UPSTREAM_REPO,
    });
    if (
      data.fork &&
      data.parent?.full_name === `${UPSTREAM_OWNER}/${UPSTREAM_REPO}`
    ) {
      return {
        cloneUrl: data.clone_url,
        sshUrl: data.ssh_url,
        existed: true,
      };
    }
  } catch (err) {
    if (err.status !== 404) throw err;
  }

  // Create the fork
  const { data } = await octokit.rest.repos.createFork({
    owner: UPSTREAM_OWNER,
    repo: UPSTREAM_REPO,
  });

  return {
    cloneUrl: data.clone_url,
    sshUrl: data.ssh_url,
    existed: false,
  };
}

export const UPSTREAM_URL = `https://github.com/${UPSTREAM_OWNER}/${UPSTREAM_REPO}.git`;

/**
 * Builds the compare URL for a future PR.
 */
export function buildPrUrl(username, branchName) {
  return `https://github.com/${UPSTREAM_OWNER}/${UPSTREAM_REPO}/compare/main...${username}:${UPSTREAM_REPO}:${branchName}`;
}
