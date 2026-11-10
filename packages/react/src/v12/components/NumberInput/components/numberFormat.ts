/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* NumberInput's `type="text"` parsing and formatting: v11's (it uses
 * @carbon/utilities' NumberParser and NumberFormatter), on `Intl.NumberFormat`
 * directly. A locale's group and decimal separators come from the formatter
 * itself; any Unicode digits are read as their values. */

/** The group and decimal separators `Intl.NumberFormat` uses for `locale`. */
export function separators(locale: string) {
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
  return {
    group: parts.find((p) => p.type === 'group')?.value ?? '',
    decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.',
  };
}

/** Unicode digit blocks: Arabic-Indic, Extended Arabic-Indic, Devanagari, Bengali, fullwidth. */
const DIGIT_BLOCKS = [0x0660, 0x06f0, 0x0966, 0x09e6, 0xff10];

/** Any Unicode digit as its ASCII digit; U+2212 (minus) as "-". */
function asciiDigits(input: string) {
  return Array.from(input)
    .map((ch) => {
      const code = ch.charCodeAt(0);
      for (const base of DIGIT_BLOCKS) {
        if (code >= base && code <= base + 9) {
          return String(code - base);
        }
      }
      return code === 0x2212 ? '-' : ch;
    })
    .join('');
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The number `input` names in `locale` (its group separators dropped), or NaN. "" is NaN. */
export function parseNumber(
  input: string,
  locale: string,
  options?: Intl.NumberFormatOptions
): number {
  const text = asciiDigits(String(input).trim());
  if (text === '') {
    return NaN;
  }
  const { group, decimal } = separators(locale);
  let s = text;
  // A currency symbol, a percent sign or a unit, from the format's own parts.
  if (options) {
    const literal = new Intl.NumberFormat(locale, options)
      .formatToParts(1)
      .filter(
        (p) =>
          !['integer', 'decimal', 'fraction', 'group', 'minusSign'].includes(
            p.type
          )
      )
      .map((p) => p.value.trim())
      .filter(Boolean);
    for (const l of literal) {
      s = s.split(l).join('');
    }
  }
  s = s.replace(/\s/g, ''); // `\s` includes the no-break spaces some locales group with.
  if (group.trim()) {
    s = s.replace(new RegExp(escape(group), 'g'), '');
  }
  if (decimal !== '.') {
    s = s.replace(new RegExp(escape(decimal), 'g'), '.');
  }
  if (!/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(s)) {
    return NaN;
  }
  let n = Number(s);
  if (options?.style === 'percent') {
    n /= 100;
  }
  return n;
}

/** `value` formatted for `locale`; NaN as "". */
export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions
) {
  return Number.isNaN(value)
    ? ''
    : new Intl.NumberFormat(locale, options).format(value);
}
