/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Checkbox } from '../components/Checkbox';
import { CheckboxGroup } from '../components/CheckboxGroup';

describe('CheckboxGroup', () => {
  it('is a fieldset with the kit group label, its checkboxes in one stack', () => {
    const markup = renderToStaticMarkup(
      <CheckboxGroup legendText="Send me" className="mine">
        <Checkbox id="a" labelText="Weekly summaries" />
        <Checkbox id="b" labelText="Security alerts" />
      </CheckboxGroup>
    );
    expect(markup).toMatch(
      /^<fieldset class="cds-checkbox-group cds-checkbox-group--vertical mine"/
    );
    expect(markup).toContain(
      '<legend class="cds-checkbox-group__legend">Send me</legend>'
    );
    expect(markup).toContain('<div class="cds-checkbox-group__boxes">');
    expect(markup.match(/cds-checkbox__row/g)).toHaveLength(2);
  });

  it('describes the group by its helper text, and disables every box with the fieldset', () => {
    const markup = renderToStaticMarkup(
      <CheckboxGroup
        legendText="Status"
        helperText="Pick any"
        orientation="horizontal"
        disabled>
        <Checkbox id="c" labelText="Running" />
      </CheckboxGroup>
    );
    expect(markup).toContain('cds-checkbox-group--horizontal');
    expect(markup).toContain(' disabled=""');
    const id = /aria-describedby="([^"]+)"/.exec(markup)?.[1];
    expect(id).toBeTruthy();
    expect(markup).toContain(`id="${id}"`);
    expect(markup).toContain('Pick any');
  });

  /** The `aria-invalid` and class of each checkbox in the markup, in order. */
  const boxes = (markup: string) =>
    [
      ...markup.matchAll(
        /<div class="cds-checkbox(?: ([^"]*))?"[\s\S]*?<input([^>]*)>/g
      ),
    ].map(([, cls, input]) => ({
      invalid: input.includes('aria-invalid="true"'),
      warn: !!cls?.includes('cds-checkbox--warn'),
    }));

  it('puts its invalid state on every checkbox that has none of its own, and says why under the group', () => {
    const markup = renderToStaticMarkup(
      <CheckboxGroup
        legendText="Send me"
        helperText="Pick one at least"
        invalid
        invalidText="Choose a kind of message">
        <Checkbox id="a" labelText="Weekly summaries" />
        <Checkbox id="b" labelText="Security alerts" invalid={false} />
      </CheckboxGroup>
    );
    expect(markup).toContain('cds-checkbox-group--invalid');
    expect(boxes(markup)).toEqual([
      { invalid: true, warn: false },
      { invalid: false, warn: false },
    ]);
    expect(markup).toContain('Choose a kind of message');
    const id = /<fieldset[^>]*aria-describedby="([^"]+)"/.exec(markup)?.[1];
    expect(id).toMatch(/-invalid$/);
    expect(markup).toContain(`id="${id}"`);
    // A checkbox with no message of its own points at none.
    expect(markup).not.toMatch(/<input[^>]*aria-describedby="a-invalid/);
  });

  it('puts its warning on the checkboxes, and invalid wins over warn', () => {
    const warned = renderToStaticMarkup(
      <CheckboxGroup legendText="Send me" warn warnText="Few people pick this">
        <Checkbox id="a" labelText="Weekly summaries" />
      </CheckboxGroup>
    );
    expect(warned).toContain('cds-checkbox-group--warn');
    expect(boxes(warned)).toEqual([{ invalid: false, warn: true }]);
    expect(warned).toContain('Few people pick this');

    const both = renderToStaticMarkup(
      <CheckboxGroup legendText="Send me" invalid warn>
        <Checkbox id="a" labelText="Weekly summaries" />
      </CheckboxGroup>
    );
    expect(boxes(both)).toEqual([{ invalid: true, warn: false }]);
  });

  it('shows no status while disabled or read-only', () => {
    const markup = renderToStaticMarkup(
      <CheckboxGroup legendText="Send me" invalid invalidText="Choose" readOnly>
        <Checkbox id="a" labelText="Weekly summaries" />
      </CheckboxGroup>
    );
    expect(markup).not.toContain('cds-checkbox-group--invalid');
    expect(boxes(markup)).toEqual([{ invalid: false, warn: false }]);
  });

  it('makes every checkbox that sets no read-only of its own read-only, and puts no aria-readonly on the fieldset', () => {
    const markup = renderToStaticMarkup(
      <CheckboxGroup legendText="Send me" readOnly>
        <Checkbox id="a" labelText="Weekly summaries" />
        <Checkbox id="b" labelText="Security alerts" readOnly={false} />
      </CheckboxGroup>
    );
    expect(markup).not.toMatch(/<fieldset[^>]*aria-readonly/);
    const readOnly = [...markup.matchAll(/<input([^>]*)>/g)].map(([, input]) =>
      input.includes('aria-readonly="true"')
    );
    expect(readOnly).toEqual([true, false]);

    const plain = renderToStaticMarkup(
      <CheckboxGroup legendText="Send me">
        <Checkbox id="a" labelText="Weekly summaries" />
      </CheckboxGroup>
    );
    expect(plain).not.toContain('aria-readonly');
  });
});
