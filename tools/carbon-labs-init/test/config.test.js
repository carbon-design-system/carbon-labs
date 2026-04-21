import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mergeOptions, DEFAULTS } from '../src/lib/config.js';

// loadConfig is tested with a real filesystem in a temp dir;
// mergeOptions covers the merge logic in isolation.

describe('mergeOptions — type priority', () => {
  it('uses flag type when provided', () => {
    const result = mergeOptions({ type: 'web-component' }, { defaultType: 'react' });
    expect(result.type).toBe('web-component');
  });

  it('falls back to config defaultType when flag is absent', () => {
    const result = mergeOptions({}, { defaultType: 'web-component' });
    expect(result.type).toBe('web-component');
  });

  it('falls back to hardcoded default when neither flag nor config set type', () => {
    const result = mergeOptions({}, {});
    expect(result.type).toBe(DEFAULTS.defaultType);
  });
});

describe('mergeOptions — owner priority', () => {
  it('uses flag owners when --owners is passed', () => {
    const result = mergeOptions(
      { owners: '@flag-user' },
      { defaultOwners: ['@config-user'] }
    );
    expect(result.owners).toEqual(['@flag-user']);
  });

  it('falls back to config defaultOwners when flag is absent', () => {
    const result = mergeOptions(
      { owners: undefined },
      { defaultOwners: ['@config-user'] }
    );
    expect(result.owners).toEqual(['@config-user']);
  });

  it('returns empty array when no owners provided anywhere', () => {
    const result = mergeOptions({}, {});
    expect(result.owners).toEqual([]);
  });

  it('parses comma-separated flag owners string', () => {
    const result = mergeOptions(
      { owners: '@alice,@bob' },
      { defaultOwners: [] }
    );
    expect(result.owners).toEqual(['@alice', '@bob']);
  });
});

describe('mergeOptions — editor command', () => {
  it('uses config editorCommand when set', () => {
    const result = mergeOptions({}, { editorCommand: 'vim' });
    expect(result.editorCommand).toBe('vim');
  });

  it('falls back to default editorCommand', () => {
    const result = mergeOptions({}, {});
    expect(result.editorCommand).toBe(DEFAULTS.editorCommand);
  });
});

describe('mergeOptions — storybookGroup', () => {
  it('uses --group flag over config', () => {
    const result = mergeOptions({ group: 'Labs' }, { storybookGroup: 'Squad' });
    expect(result.storybookGroup).toBe('Labs');
  });

  it('falls back to config storybookGroup', () => {
    const result = mergeOptions({}, { storybookGroup: 'Squad' });
    expect(result.storybookGroup).toBe('Squad');
  });

  it('defaults to Components', () => {
    const result = mergeOptions({}, {});
    expect(result.storybookGroup).toBe('Components');
  });
});

// ── loadConfig filesystem tests ────────────────────────────────────────────

import { loadConfig } from '../src/lib/config.js';
import { writeFile, mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('loadConfig', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'carbon-labs-init-test-'));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('returns defaults when no .carbon-labs-init.json present', async () => {
    const config = await loadConfig(tmpDir);
    expect(config).toMatchObject(DEFAULTS);
  });

  it('merges file values over defaults', async () => {
    await writeFile(
      join(tmpDir, '.carbon-labs-init.json'),
      JSON.stringify({ squad: 'my-squad', defaultType: 'web-component' })
    );
    const config = await loadConfig(tmpDir);
    expect(config.squad).toBe('my-squad');
    expect(config.defaultType).toBe('web-component');
    expect(config.editorCommand).toBe(DEFAULTS.editorCommand);
  });

  it('parses string defaultOwners', async () => {
    await writeFile(
      join(tmpDir, '.carbon-labs-init.json'),
      JSON.stringify({ defaultOwners: '@alice,@bob' })
    );
    const config = await loadConfig(tmpDir);
    expect(config.defaultOwners).toEqual(['@alice', '@bob']);
  });

  it('preserves array defaultOwners', async () => {
    await writeFile(
      join(tmpDir, '.carbon-labs-init.json'),
      JSON.stringify({ defaultOwners: ['@alice', '@bob'] })
    );
    const config = await loadConfig(tmpDir);
    expect(config.defaultOwners).toEqual(['@alice', '@bob']);
  });

  it('throws on malformed JSON', async () => {
    await writeFile(join(tmpDir, '.carbon-labs-init.json'), 'not json {{{');
    await expect(loadConfig(tmpDir)).rejects.toThrow(/Failed to parse/);
  });
});
