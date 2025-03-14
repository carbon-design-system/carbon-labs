/*
 * Copyright IBM Corp. 2022, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Accordion } from './accordion';
import { AccordionItem } from '@carbon/react';

export default {
  title: 'MDX Components/Accordion',
  component: Accordion,
  subcomponents: { AccordionItem },
};

export const Default = (args) => (
  <Accordion {...args}>
    <AccordionItem title="Title 1">Content Section</AccordionItem>
    <AccordionItem title="Title 2">Content Section</AccordionItem>
    <AccordionItem title="Title 3">Content Section</AccordionItem>
  </Accordion>
);
