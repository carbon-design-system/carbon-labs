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
});
