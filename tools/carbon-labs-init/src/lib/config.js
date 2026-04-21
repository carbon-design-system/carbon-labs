import { readFile } from 'fs/promises';
import { join } from 'path';
import { parseOwners } from './owners.js';

const CONFIG_FILE = '.carbon-labs-init.json';

export const DEFAULTS = {
  squad: 'carbon-squad',
  defaultOwners: [],
  defaultType: 'react',
  editorCommand: 'code',
  storybookGroup: 'Components',
};

/**
 * Reads .carbon-labs-init.json from repoRoot. Returns merged defaults if file is absent.
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
  const owners =
    flagOptions.owners != null
      ? parseOwners(flagOptions.owners)
      : config.defaultOwners ?? DEFAULTS.defaultOwners;

  return {
    type: flagOptions.type ?? config.defaultType ?? DEFAULTS.defaultType,
    owners,
    editorCommand: config.editorCommand ?? DEFAULTS.editorCommand,
    storybookGroup: flagOptions.group ?? config.storybookGroup ?? DEFAULTS.storybookGroup,
    squad: config.squad ?? DEFAULTS.squad,
  };
}
