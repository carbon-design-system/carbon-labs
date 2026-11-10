/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Region } from '@carbon-labs/react-app-shell';
import { KitDefaults } from '@carbon-labs/react-kit-defaults';
import { Accordion, AccordionItem } from '../components/Accordion';

describe('Accordion', () => {
  it('is square by default, rounds when corners="rounded" or inside a rounded Region/KitDefaults, and explicit corners win', () => {
    const item = <AccordionItem title="Section">Content</AccordionItem>;

    expect(renderToStaticMarkup(<Accordion>{item}</Accordion>)).not.toContain(
      'cds-accordion--rounded'
    );
    expect(
      renderToStaticMarkup(<Accordion corners="rounded">{item}</Accordion>)
    ).toContain('cds-accordion--rounded');
    expect(
      renderToStaticMarkup(
        <Region surface="quiet">
          <Accordion>{item}</Accordion>
        </Region>
      )
    ).toContain('cds-accordion--rounded');
    expect(
      renderToStaticMarkup(
        <Region surface="quiet">
          <Accordion corners="square">{item}</Accordion>
        </Region>
      )
    ).not.toContain('cds-accordion--rounded');
    expect(
      renderToStaticMarkup(
        <KitDefaults corners="rounded">
          <Accordion>{item}</Accordion>
        </KitDefaults>
      )
    ).toContain('cds-accordion--rounded');
  });

  it('applies size, the ghost frame, align and open classes', () => {
    const markup = renderToStaticMarkup(
      <Accordion size="lg" frame="ghost">
        <AccordionItem title="One" open>
          Body
        </AccordionItem>
      </Accordion>
    );
    expect(markup).toContain('cds-accordion--lg');
    expect(markup).toContain('cds-accordion--ghost');
    expect(markup).toContain('cds-accordion__item--active');

    const startAligned = renderToStaticMarkup(
      <Accordion align="start" disabled>
        <AccordionItem title="One" open>
          Body
        </AccordionItem>
      </Accordion>
    );
    expect(startAligned).toContain('cds-accordion--start');
    expect(startAligned).toContain('disabled=""');
  });
});
