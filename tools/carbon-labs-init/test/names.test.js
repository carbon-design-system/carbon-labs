import { describe, it, expect } from 'vitest';
import {
  toPascalCase,
  toParamCase,
  validateComponentName,
  applyNameCasing,
} from '../src/lib/names.js';

describe('toPascalCase', () => {
  it('converts kebab-case', () => expect(toPascalCase('my-button')).toBe('MyButton'));
  it('converts snake_case', () => expect(toPascalCase('my_button')).toBe('MyButton'));
  it('converts camelCase', () => expect(toPascalCase('myButton')).toBe('MyButton'));
  it('preserves PascalCase', () => expect(toPascalCase('MyButton')).toBe('MyButton'));
  it('handles single word', () => expect(toPascalCase('button')).toBe('Button'));
  it('handles multi-word kebab', () => expect(toPascalCase('data-table-toolbar')).toBe('DataTableToolbar'));
  it('handles mixed separators', () => expect(toPascalCase('data_table-toolbar')).toBe('DataTableToolbar'));
});

describe('toParamCase', () => {
  it('converts PascalCase', () => expect(toParamCase('MyButton')).toBe('my-button'));
  it('converts camelCase', () => expect(toParamCase('myButton')).toBe('my-button'));
  it('preserves kebab-case', () => expect(toParamCase('my-button')).toBe('my-button'));
  it('converts snake_case', () => expect(toParamCase('my_button')).toBe('my-button'));
  it('handles consecutive caps (acronyms)', () =>
    expect(toParamCase('CDNButton')).toBe('cdn-button'));
  it('handles mixed separators', () =>
    expect(toParamCase('data_Table-toolbar')).toBe('data-table-toolbar'));
  it('strips leading/trailing hyphens', () =>
    expect(toParamCase('-my-button-')).toBe('my-button'));
});

describe('validateComponentName', () => {
  it('accepts valid kebab-case names', () => expect(() => validateComponentName('my-button')).not.toThrow());
  it('accepts valid PascalCase names', () => expect(() => validateComponentName('MyButton')).not.toThrow());
  it('accepts single-word names', () => expect(() => validateComponentName('button')).not.toThrow());
  it('rejects empty string', () => expect(() => validateComponentName('')).toThrow());
  it('rejects null', () => expect(() => validateComponentName(null)).toThrow());
  it('rejects names starting with underscore', () =>
    expect(() => validateComponentName('_squad-button')).toThrow(/_squad/));
  it('rejects names with special characters', () =>
    expect(() => validateComponentName('my@button')).toThrow());
  it('rejects names starting with a number', () =>
    expect(() => validateComponentName('1button')).toThrow());
});

describe('applyNameCasing', () => {
  it('returns PascalCase for react', () => expect(applyNameCasing('my-button', 'react')).toBe('MyButton'));
  it('returns param-case for web-component', () =>
    expect(applyNameCasing('MyButton', 'web-component')).toBe('my-button'));
  it('defaults to PascalCase for unknown type', () =>
    expect(applyNameCasing('my-button', 'react')).toBe('MyButton'));
});
