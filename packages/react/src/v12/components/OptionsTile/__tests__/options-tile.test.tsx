/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Accordion, AccordionItem } from '@carbon-labs/react-accordion';
import {
  Tab,
  TabListVertical,
  TabPanel,
  TabPanels,
  TabsVertical,
} from '@carbon-labs/react-tabs';
import { OptionsTile } from '../components/OptionsTile';

describe('OptionsTile', () => {
  it('frames its body with ghost selection and rounded container corners by default, while explicit props win', () => {
    const markup = renderToStaticMarkup(
      <OptionsTile title="Network" open>
        <Accordion>
          <AccordionItem title="Advanced">Body</AccordionItem>
        </Accordion>
        <Accordion corners="square">
          <AccordionItem title="Square">Body</AccordionItem>
        </Accordion>
        <TabsVertical>
          <TabListVertical aria-label="Sections">
            <Tab>One</Tab>
          </TabListVertical>
          <TabPanels>
            <TabPanel>a</TabPanel>
          </TabPanels>
        </TabsVertical>
      </OptionsTile>
    );
    expect(markup).toContain('cds-accordion--rounded');
    expect(markup).toContain('vtabs__list--ghost');
  });

  it('hides the summary when open, but keeps status messages visible when open', () => {
    const shut = renderToStaticMarkup(
      <OptionsTile title="Backups" summary="Daily at 02:00">
        <div>Settings</div>
      </OptionsTile>
    );
    expect(shut).toContain('Daily at 02:00');

    const open = renderToStaticMarkup(
      <OptionsTile title="Backups" summary="Daily at 02:00" open>
        <div>Settings</div>
      </OptionsTile>
    );
    expect(open).not.toContain('Daily at 02:00');

    const openInvalid = renderToStaticMarkup(
      <OptionsTile
        title="Backups"
        summary="Daily at 02:00"
        invalid
        invalidText=" Certificate expired"
        open>
        <div>Settings</div>
      </OptionsTile>
    );
    expect(openInvalid).toContain('Certificate expired');
  });
});
