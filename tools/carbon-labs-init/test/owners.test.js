import { describe, it, expect } from 'vitest';
import { parseOwners, mergeOwners } from '../src/lib/owners.js';

describe('parseOwners', () => {
  it('parses comma-separated handles', () =>
    expect(parseOwners('@alice,@bob')).toEqual(['@alice', '@bob']));

  it('adds @ prefix if missing', () =>
    expect(parseOwners('alice,bob')).toEqual(['@alice', '@bob']));

  it('normalises mixed @ usage', () =>
    expect(parseOwners('@alice,bob')).toEqual(['@alice', '@bob']));

  it('trims surrounding whitespace', () =>
    expect(parseOwners('  @alice , @bob  ')).toEqual(['@alice', '@bob']));

  it('handles empty string', () => expect(parseOwners('')).toEqual([]));
  it('handles null', () => expect(parseOwners(null)).toEqual([]));
  it('handles undefined', () => expect(parseOwners(undefined)).toEqual([]));

  it('deduplicates handles', () =>
    expect(parseOwners('@alice,@alice,@bob')).toEqual(['@alice', '@bob']));

  it('drops empty entries from trailing comma', () =>
    expect(parseOwners('@alice,')).toEqual(['@alice']));

  it('handles a single handle without comma', () =>
    expect(parseOwners('@alice')).toEqual(['@alice']));
});

describe('mergeOwners', () => {
  it('prefers flagOwners over configOwners', () =>
    expect(mergeOwners(['@flag'], ['@config'])).toEqual(['@flag']));

  it('falls back to configOwners when flagOwners is empty', () =>
    expect(mergeOwners([], ['@config'])).toEqual(['@config']));

  it('falls back to configOwners when flagOwners is null', () =>
    expect(mergeOwners(null, ['@config'])).toEqual(['@config']));

  it('returns [] when both are empty', () =>
    expect(mergeOwners([], [])).toEqual([]));

  it('returns [] when both are null/undefined', () =>
    expect(mergeOwners(null, null)).toEqual([]));
});
