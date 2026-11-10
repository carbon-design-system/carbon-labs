/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useId,
  useRef,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import { usePrefersReducedMotion, useStagger } from '@carbon-labs/v12-motion';
import { Accordion, AccordionItem } from '@carbon-labs/react-accordion';
import { Button } from '@carbon-labs/react-button';
import { Checkbox, CheckboxGroup } from '@carbon-labs/react-checkbox';
import { useFilterPresence } from '@carbon-labs/react-contained-list';
import { DatePicker, DatePickerInput } from '@carbon-labs/react-date-picker-v2';
import { NumberInput } from '@carbon-labs/react-number-input';
import { RadioButton, RadioButtonGroup } from '@carbon-labs/react-radio-button';
import { RollText } from '@carbon-labs/react-roll-text';
import { Search } from '@carbon-labs/react-search';
import {
  SidePanel,
  type SidePanelAction,
  type SidePanelProps,
} from '@carbon-labs/react-side-panel';
import {
  checkedOf,
  countFilters,
  datesOf,
  isoDay,
  pickedOf,
  rangeOf,
  type FilterCheckboxSection,
  type FilterCounts,
  type FilterDateSection,
  type FilterNumberSection,
  type FilterOption,
  type FilterRadioSection,
  type FilterSection,
  type FilterValue,
  type FilterValues,
} from './filters';
import './filter-panel.scss';

/* ============================================================================
 * FilterPanel: the filters in full, on the kit's SidePanel.
 *
 *   sections   accordion items (the disclosure): checkboxes, radios, a number or a date range
 *   counts     each option's count rolls in place (RollText); the results line too
 *   search     a long option list filters on the list presence (out, move, in)
 *   apply      batch: a draft until Apply, Cancel drops it; instant: each change applies
 *   panel      the SidePanel's frames and motion, so a shell can push it beside main
 *   reduced    the parts' own: open or shut at once, counts change at once
 *
 * API: IBM Products' Datagrid filter panel (`updateMethod`, the action
 * labels), on SidePanel's props, plus sections, values, counts, resultCount.
 * ========================================================================== */

export type FilterUpdateMethod = 'batch' | 'instant';

export interface FilterPanelProps extends Omit<
  SidePanelProps,
  'children' | 'actions' | 'title'
> {
  /** The panel's title. Default "Filters". */
  title?: ReactNode;
  sections: readonly FilterSection[];
  /** The filters applied. */
  values: FilterValues;
  /** New values to apply: on Apply (batch), or on each change (instant). */
  onChange: (values: FilterValues) => void;
  /** `batch` (default): a draft applied by Apply. `instant`: each change applies. */
  updateMethod?: FilterUpdateMethod;
  /** Each option's count for the values the panel shows (the draft, in batch). */
  counts?: (values: FilterValues) => FilterCounts;
  /** How many items the values shown match: the results line, announced as it changes. */
  resultCount?: (values: FilterValues) => number;
  /** The results line's words. Default "N results". */
  resultLabel?: (count: number) => string;
  /** Default "Apply" (batch) or "Done" (instant). */
  primaryActionLabel?: string;
  /** Batch only. Default "Cancel". */
  secondaryActionLabel?: string;
  /** Default "Clear all". */
  clearAllLabel?: string;
  onApply?: (values: FilterValues) => void;
  onCancel?: () => void;
}

const defaultResultLabel = (n: number) =>
  n === 1 ? '1 result' : `${n} results`;
/** An option's control id, from the panel's own prefix. */
const optionId = (prefix: string, section: string, value: string) =>
  `${prefix}-${section}-${value}`.replace(/[^\w-]/g, '_');
const labelOf = (o: FilterOption) => o.label ?? o.value;
const sectionIds = (sections: readonly FilterSection[]) =>
  new Set(sections.map((s) => s.id));

interface SectionProps<S extends FilterSection> {
  section: S;
  values: FilterValues;
  counts: FilterCounts | undefined;
  set: (id: string, value: FilterValue | undefined) => void;
  prefix: string;
  timeScale: number;
}

/** An option's label: its text, and its count rolling in place. */
function OptionLabel({
  option,
  count,
  timeScale,
}: {
  option: FilterOption;
  count: number | undefined;
  timeScale: number;
}) {
  return (
    <span className="cds-filter-panel__option-label">
      <span className="cds-filter-panel__option-text">{labelOf(option)}</span>
      {count != null && (
        <span className="cds-filter-panel__count">
          <RollText text={String(count)} order={count} timeScale={timeScale} />
        </span>
      )}
    </span>
  );
}

function CheckboxSection({
  section: s,
  values,
  counts,
  set,
  prefix,
  timeScale,
}: SectionProps<FilterCheckboxSection>) {
  const checked = checkedOf(values, s.id);
  const [query, setQuery] = useState('');
  const searchable = s.options.length > (s.searchThreshold ?? 8);
  const q = query.trim().toLowerCase();
  const shown = q
    ? s.options.filter((o) => labelOf(o).toLowerCase().includes(q))
    : s.options;
  const rootRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const stagger = useStagger({ count: Math.max(1, shown.length), size: 32 });
  const items = shown.map((o) => (
    <div
      key={o.value}
      data-cds-key={o.value}
      className="cds-filter-panel__option">
      <Checkbox
        id={o.id ?? optionId(prefix, s.id, o.value)}
        labelText={
          <OptionLabel
            option={o}
            count={counts?.[s.id]?.[o.value] ?? o.count}
            timeScale={timeScale}
          />
        }
        checked={checked.includes(o.value)}
        onChange={(_, { checked: on }) => {
          // Kept in the options' order.
          const next = s.options
            .map((x) => x.value)
            .filter((v) => (v === o.value ? on : checked.includes(v)));
          set(s.id, next.length ? next : undefined);
        }}
        timeScale={timeScale}
      />
    </div>
  ));
  const present = useFilterPresence(rootRef, boxRef, items, {
    timeScale,
    reduced,
    staggerDelay: stagger.delay,
  });
  return (
    <div ref={rootRef} className="cds-filter-panel__section-body">
      {searchable && (
        <Search
          size="sm"
          labelText={`Search ${s.title}`}
          placeholder={`Search ${s.title.toLowerCase()}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="cds-filter-panel__search"
        />
      )}
      <CheckboxGroup legendText={s.title} className="cds-filter-panel__group">
        <div ref={boxRef} className="cds-filter-panel__options">
          {present}
        </div>
      </CheckboxGroup>
      {shown.length === 0 && (
        <p className="cds-filter-panel__none">No matches</p>
      )}
    </div>
  );
}

function RadioSection({
  section: s,
  values,
  counts,
  set,
  prefix,
  timeScale,
}: SectionProps<FilterRadioSection>) {
  return (
    <div className="cds-filter-panel__section-body">
      <RadioButtonGroup
        name={optionId(prefix, s.id, 'radio')}
        legendText={s.title}
        orientation="vertical"
        valueSelected={pickedOf(values, s.id)}
        onChange={(v) => set(s.id, String(v) || undefined)}
        className="cds-filter-panel__group"
        timeScale={timeScale}>
        {s.options.map((o) => (
          <RadioButton
            key={o.value}
            id={o.id ?? optionId(prefix, s.id, o.value)}
            value={o.value}
            labelText={
              <OptionLabel
                option={o}
                count={counts?.[s.id]?.[o.value] ?? o.count}
                timeScale={timeScale}
              />
            }
          />
        ))}
      </RadioButtonGroup>
    </div>
  );
}

function NumberSection({
  section: s,
  values,
  set,
  prefix,
}: SectionProps<FilterNumberSection>) {
  const range = rangeOf(values, s.id);
  const edge =
    (key: 'min' | 'max') =>
    (_: unknown, { value }: { value: number | string }) => {
      const n = value === '' ? undefined : Number(value);
      const next = {
        ...range,
        [key]: n != null && Number.isFinite(n) ? n : undefined,
      };
      set(s.id, next.min == null && next.max == null ? undefined : next);
    };
  const unit = s.unit ? ` (${s.unit})` : '';
  return (
    <div className="cds-filter-panel__section-body cds-filter-panel__range">
      {(['min', 'max'] as const).map((key) => (
        <NumberInput
          key={key}
          id={optionId(prefix, s.id, key)}
          size="sm"
          label={`${key === 'min' ? 'Minimum' : 'Maximum'}${unit}`}
          min={s.min}
          max={s.max}
          step={s.step}
          allowEmpty
          value={range[key] ?? ''}
          onChange={edge(key)}
        />
      ))}
    </div>
  );
}

/** `yyyy-mm-dd` as a local date. */
const dateOf = (iso: string | undefined) => {
  if (!iso) return undefined;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
};

function DateSection({
  section: s,
  values,
  set,
  prefix,
  timeScale,
}: SectionProps<FilterDateSection>) {
  const { start, end } = datesOf(values, s.id);
  const value = [dateOf(start), dateOf(end)].filter((d): d is Date => !!d);
  return (
    <div className="cds-filter-panel__section-body">
      <DatePicker
        datePickerType="range"
        value={value}
        timeScale={timeScale}
        onChange={(dates) => {
          const [a, b] = dates;
          set(
            s.id,
            a ? { start: isoDay(a), end: b ? isoDay(b) : undefined } : undefined
          );
        }}>
        <DatePickerInput
          id={optionId(prefix, s.id, 'start')}
          size="sm"
          labelText="From"
          placeholder="mm/dd/yyyy"
        />
        <DatePickerInput
          id={optionId(prefix, s.id, 'end')}
          size="sm"
          labelText="To"
          placeholder="mm/dd/yyyy"
        />
      </DatePicker>
    </div>
  );
}

function SectionBody(props: SectionProps<FilterSection>) {
  const { section } = props;
  if (section.type === 'checkbox')
    return <CheckboxSection {...props} section={section} />;
  if (section.type === 'radio')
    return <RadioSection {...props} section={section} />;
  if (section.type === 'number')
    return <NumberSection {...props} section={section} />;
  return <DateSection {...props} section={section} />;
}

export function FilterPanel({
  title = 'Filters',
  sections,
  values,
  onChange,
  updateMethod = 'batch',
  counts,
  resultCount,
  resultLabel = defaultResultLabel,
  primaryActionLabel,
  secondaryActionLabel = 'Cancel',
  clearAllLabel = 'Clear all',
  onApply,
  onCancel,
  onRequestClose,
  open,
  className,
  timeScale = 1,
  selectorPrimaryFocus = '.cds-filter-panel .cds-accordion__heading',
  ...panel
}: FilterPanelProps) {
  const batch = updateMethod === 'batch';
  const prefix = `cds-filter-${useId().replace(/[^\w]/g, '')}`;

  // Batch: a draft of the values, taken afresh on each open and whenever the
  // applied values change (a tag dismissed while the panel is open).
  const [draft, setDraft] = useState(values);
  const [seen, setSeen] = useState({ values, open });
  if (seen.values !== values || seen.open !== open) {
    setSeen({ values, open });
    if (seen.values !== values || open) setDraft(values);
  }
  const shown = batch ? draft : values;
  const commit = (next: FilterValues) =>
    batch ? setDraft(next) : onChange(next);
  const set = (id: string, value: FilterValue | undefined) => {
    const next: Record<string, FilterValue | undefined> = { ...shown };
    if (value === undefined) delete next[id];
    else next[id] = value;
    commit(next);
  };
  const clearAll = () => {
    const ids = sectionIds(sections);
    commit(
      Object.fromEntries(Object.entries(shown).filter(([k]) => !ids.has(k)))
    );
  };

  const optionCounts = counts?.(shown);
  const results = resultCount?.(shown);

  // Announced politely as it changes, not on the open.
  const [said, setSaid] = useState({ results, text: '' });
  if (said.results !== results)
    setSaid({
      results,
      text: open && results != null ? resultLabel(results) : '',
    });

  const close = (e: SyntheticEvent | Event) => onRequestClose?.(e);
  // Batch: closing any other way (the close button, Escape, the scrim) is a cancel.
  const cancel = (e: SyntheticEvent | Event) => {
    if (batch) {
      setDraft(values);
      onCancel?.();
    }
    close(e);
  };
  const actions: SidePanelAction[] = batch
    ? [
        {
          label: secondaryActionLabel,
          kind: 'secondary',
          onClick: cancel,
        },
        {
          label: primaryActionLabel ?? 'Apply',
          kind: 'primary',
          onClick: (e) => {
            onChange(draft);
            onApply?.(draft);
            close(e);
          },
        },
      ]
    : [
        {
          label: primaryActionLabel ?? 'Done',
          kind: 'primary',
          onClick: close,
        },
      ];

  const inUse = countFilters(sections, shown);
  return (
    <SidePanel
      {...panel}
      open={open}
      title={title}
      onRequestClose={cancel}
      actions={actions}
      timeScale={timeScale}
      selectorPrimaryFocus={selectorPrimaryFocus}
      className={['cds-filter-panel__panel', className]
        .filter(Boolean)
        .join(' ')}>
      {/* The panel's dialog is named by its title: the body takes no second name. */}
      <section className="cds-filter-panel" data-update-method={updateMethod}>
        <div className="cds-filter-panel__head">
          <span className="cds-filter-panel__results">
            {results != null ? (
              <RollText
                text={resultLabel(results)}
                order={results}
                timeScale={timeScale}
              />
            ) : (
              `${inUse || 'No'} ${inUse === 1 ? 'filter' : 'filters'}`
            )}
          </span>
          <Button
            frame="ghost"
            size="sm"
            timeScale={timeScale}
            onClick={clearAll}>
            {clearAllLabel}
          </Button>
        </div>
        <span
          className="cds-filter-panel__live"
          role="status"
          aria-live="polite">
          {said.text}
        </span>
        <Accordion className="cds-filter-panel__sections" timeScale={timeScale}>
          {sections.map((s, i) => (
            <AccordionItem key={s.id} title={s.title} open={s.open ?? i === 0}>
              <SectionBody
                section={s}
                values={shown}
                counts={optionCounts}
                set={set}
                prefix={prefix}
                timeScale={timeScale}
              />
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </SidePanel>
  );
}
