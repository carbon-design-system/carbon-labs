/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { parseOwners } from './owners.js';
import { getV12StorybookGroup } from './lane.js';

const CONFIG_FILE = '.carbon-labs-create.json';

export const DEFAULTS = {
  squad: 'carbon-squad',
  defaultOwners: [],
  defaultType: 'react',
  editorCommand: 'code',
  storybookGroup: 'Components',
};

/**
 * Reads .carbon-labs-create.json from repoRoot. Returns merged defaults if file is absent.
 * Throws on malformed JSON.
 */
export async function loadConfig(repoRoot) {
  const configPath = join(repoRoot, CONFIG_FILE);
  try {
    const raw = await readFile(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULTS,
      ...parsed,
      defaultOwners:
        typeof parsed.defaultOwners === 'string'
          ? parseOwners(parsed.defaultOwners)
          : Array.isArray(parsed.defaultOwners)
            ? parsed.defaultOwners
            : [],
    };
  } catch (err) {
    if (err.code === 'ENOENT') return { ...DEFAULTS };
    throw new Error(`Failed to parse ${configPath}: ${err.message}`);
  }
}

/**
 * Merges CLI flags with config values. Flags always win over config.
 * Config wins over hard-coded defaults.
 *
 * @param {object} flagOptions - raw commander options (undefined = not passed)
 * @param {object} config - result of loadConfig()
 */
export function mergeOptions(flagOptions, config) {
  const v12 = Boolean(flagOptions.v12);
  const owners =
    flagOptions.owners != null
      ? parseOwners(flagOptions.owners)
      : (config.defaultOwners ?? DEFAULTS.defaultOwners);

  return {
    type: flagOptions.type ?? config.defaultType ?? DEFAULTS.defaultType,
    owners,
    editorCommand: config.editorCommand ?? DEFAULTS.editorCommand,
    v12,
    // v12 stories are titled `V12/<Name>`. A --group nests under it
    // (`V12/<group>/<Name>`); the team config's group is not applied there.
    storybookGroup: v12
      ? getV12StorybookGroup({ v12, group: flagOptions.group })
      : (flagOptions.group ?? config.storybookGroup ?? DEFAULTS.storybookGroup),
    squad: config.squad ?? DEFAULTS.squad,
  };
}
