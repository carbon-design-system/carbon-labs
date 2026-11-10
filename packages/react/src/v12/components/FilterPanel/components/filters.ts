/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* ============================================================================
 * The filter panel's model: its sections, the values they hold, and the
 * filters in use those values make (one tag each). Pure, so a team can count
 * and filter its own rows with the same rules.
 * ========================================================================== */

/** One choice in a checkbox or radio section. */
export interface FilterOption {
  /** What the values hold. */
  value: string;
  /** What it shows. Default the value. */
  label?: string;
  /** The control's id. Default one of the panel's own. */
  id?: string;
  /** How many items it matches; a section's `counts` wins. */
  count?: number;
}

interface FilterSectionBase {
  /** The key in the values. */
  id: string;
  /** The section's heading, and its tags' prefix. */
  title: string;
  /** Open when the panel mounts. Default the first section only. */
  open?: boolean;
}

/** Any of its options: a checkbox each. */
export interface FilterCheckboxSection extends FilterSectionBase {
  type: 'checkbox';
  options: FilterOption[];
  /** More options than this shows a search over them. Default 8. */
  searchThreshold?: number;
}

/** One of its options. */
export interface FilterRadioSection extends FilterSectionBase {
  type: 'radio';
  options: FilterOption[];
}

/** A number range: a minimum, a maximum, or both. */
export interface FilterNumberSection extends FilterSectionBase {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  /** Shown after the numbers in its tag ("GB"). */
  unit?: string;
}

/** A date range, picked on the date picker. */
export interface FilterDateSection extends FilterSectionBase {
  type: 'date';
}

export type FilterSection =
  | FilterCheckboxSection
  | FilterRadioSection
  | FilterNumberSection
  | FilterDateSection;

export interface FilterRange {
  min?: number;
  max?: number;
}

/** Dates as `yyyy-mm-dd`. */
export interface FilterDateRange {
  start?: string;
  end?: string;
}

/** A section's value: the options checked, the option picked, or a range. */
export type FilterValue =
  | readonly string[]
  | string
  | FilterRange
  | FilterDateRange;

/** The values by section id. A section with none is absent. */
export type FilterValues = Readonly<Record<string, FilterValue | undefined>>;

/** Per section, per option value: how many items each option matches. */
export type FilterCounts = Readonly<
  Record<string, Readonly<Record<string, number>> | undefined>
>;

/** A filter in use: one tag in the summary. */
export interface FilterInUse {
  /** Unique across the panel: the section's id, and the option's value for a checkbox. */
  id: string;
  sectionId: string;
  label: string;
  /** The values with this one filter cleared. */
  clear: (values: FilterValues) => FilterValues;
}

const without = (values: FilterValues, id: string): FilterValues => {
  const next: Record<string, FilterValue | undefined> = { ...values };
  delete next[id];
  return next;
};

/** A section's checked options. */
export const checkedOf = (
  values: FilterValues,
  id: string
): readonly string[] => {
  const v = values[id];
  return Array.isArray(v) ? v : [];
};

/** A section's picked option, or ''. */
export const pickedOf = (values: FilterValues, id: string): string => {
  const v = values[id];
  return typeof v === 'string' ? v : '';
};

/** A section's range, or an empty one. */
export const rangeOf = (values: FilterValues, id: string): FilterRange => {
  const v = values[id];
  return v && typeof v === 'object' && !Array.isArray(v)
    ? (v as FilterRange)
    : {};
};

export const datesOf = (values: FilterValues, id: string): FilterDateRange => {
  const v = values[id];
  return v && typeof v === 'object' && !Array.isArray(v)
    ? (v as FilterDateRange)
    : {};
};

const labelOf = (section: { options: FilterOption[] }, value: string) =>
  section.options.find((o) => o.value === value)?.label ?? value;

/** "10–50 GB", "10 GB or more", "50 GB or less". */
export function rangeText({ min, max }: FilterRange, unit?: string): string {
  const u = unit ? ` ${unit}` : '';
  if (min != null && max != null) {
    return `${min}–${max}${u}`;
  }
  if (min != null) {
    return `${min}${u} or more`;
  }
  return `${max}${u} or less`;
}

const DATE = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});
const day = (iso: string) => DATE.format(new Date(`${iso}T00:00:00Z`));

/** "Oct 1, 2026 – Oct 20, 2026", "From Oct 1, 2026", "To Oct 20, 2026". */
export function dateText({ start, end }: FilterDateRange): string {
  if (start && end) {
    return `${day(start)} – ${day(end)}`;
  }
  if (start) {
    return `From ${day(start)}`;
  }
  return `To ${day(end!)}`;
}

/** A local date as `yyyy-mm-dd`. */
export function isoDay(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** The filters in use, in the sections' order: a checkbox section gives one per option checked. */
export function filtersInUse(
  sections: readonly FilterSection[],
  values: FilterValues
): FilterInUse[] {
  const out: FilterInUse[] = [];
  for (const s of sections) {
    if (s.type === 'checkbox') {
      const checked = checkedOf(values, s.id);
      // In the options' order, not the order they were checked in.
      for (const o of s.options) {
        if (!checked.includes(o.value)) {
          continue;
        }
        out.push({
          id: `${s.id}:${o.value}`,
          sectionId: s.id,
          label: `${s.title}: ${o.label ?? o.value}`,
          clear: (v) => {
            const rest = checkedOf(v, s.id).filter((x) => x !== o.value);
            return rest.length ? { ...v, [s.id]: rest } : without(v, s.id);
          },
        });
      }
    } else if (s.type === 'radio') {
      const picked = pickedOf(values, s.id);
      if (picked) {
        out.push({
          id: s.id,
          sectionId: s.id,
          label: `${s.title}: ${labelOf(s, picked)}`,
          clear: (v) => without(v, s.id),
        });
      }
    } else if (s.type === 'number') {
      const r = rangeOf(values, s.id);
      if (r.min != null || r.max != null) {
        out.push({
          id: s.id,
          sectionId: s.id,
          label: `${s.title}: ${rangeText(r, s.unit)}`,
          clear: (v) => without(v, s.id),
        });
      }
    } else {
      const r = datesOf(values, s.id);
      if (r.start || r.end) {
        out.push({
          id: s.id,
          sectionId: s.id,
          label: `${s.title}: ${dateText(r)}`,
          clear: (v) => without(v, s.id),
        });
      }
    }
  }
  return out;
}

/** How many filters are in use (the tags the summary shows). */
export const countFilters = (
  sections: readonly FilterSection[],
  values: FilterValues
) => filtersInUse(sections, values).length;

/** The same filters, whatever the order of a section's checked options. */
export function sameFilters(
  sections: readonly FilterSection[],
  a: FilterValues,
  b: FilterValues
): boolean {
  const ka = filtersInUse(sections, a).map((f) => f.label);
  const kb = filtersInUse(sections, b).map((f) => f.label);
  return ka.length === kb.length && ka.every((k, i) => k === kb[i]);
}

/** Whether a field passes a section: a string for options, a number or `yyyy-mm-dd` for ranges. */
export function passes(
  section: FilterSection,
  values: FilterValues,
  field: string | number | undefined
): boolean {
  if (section.type === 'checkbox') {
    const c = checkedOf(values, section.id);
    return !c.length || c.includes(String(field));
  }
  if (section.type === 'radio') {
    const p = pickedOf(values, section.id);
    return !p || p === String(field);
  }
  if (section.type === 'number') {
    const { min, max } = rangeOf(values, section.id);
    const n = Number(field);
    return (min == null || n >= min) && (max == null || n <= max);
  }
  // By day: an ISO datetime on the end day passes.
  const { start, end } = datesOf(values, section.id);
  const d = String(field).slice(0, 10);
  return (!start || d >= start.slice(0, 10)) && (!end || d <= end.slice(0, 10));
}

/** Each option counted against every other section, so a count is what checking it shows. */
export function facetCounts<T>(
  items: readonly T[],
  sections: readonly FilterSection[],
  values: FilterValues,
  get: (item: T, sectionId: string) => string | number | undefined
): Record<string, Record<string, number>> {
  const out = Object.create(null) as Record<string, Record<string, number>>;
  for (const s of sections) {
    if (s.type !== 'checkbox' && s.type !== 'radio') {
      continue;
    }
    const others = sections.filter((o) => o !== s);
    // A Map, so an option named like an object key ("constructor") counts as any other.
    const counts = new Map<string, number>(s.options.map((o) => [o.value, 0]));
    for (const item of items) {
      if (!others.every((o) => passes(o, values, get(item, o.id)))) {
        continue;
      }
      const v = String(get(item, s.id));
      const n = counts.get(v);
      if (n !== undefined) {
        counts.set(v, n + 1);
      }
    }
    out[s.id] = Object.assign(
      Object.create(null) as Record<string, number>,
      Object.fromEntries(counts)
    );
  }
  return out;
}

/** The items that pass every section. */
export function applyFilters<T>(
  items: readonly T[],
  sections: readonly FilterSection[],
  values: FilterValues,
  get: (item: T, sectionId: string) => string | number | undefined
): T[] {
  return items.filter((item) =>
    sections.every((s) => passes(s, values, get(item, s.id)))
  );
}
