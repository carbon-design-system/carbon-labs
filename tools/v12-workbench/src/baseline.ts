/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { motionTokens, staggerSteps, tokens } from '@carbon-labs/v12-motion';

// carbon-motion's values at 1x, read once at load, before any draft: the
// clock applies a draft that scales the live token objects, and the Motion
// panel shows the values a component ships with, not the slowed ones.

/** Every duration token, ms. */
export const BASE_DURATIONS: Readonly<Record<string, number>> = {
  ...motionTokens.duration,
};

/** Every easing token, as a cubic-bezier tuple. */
export const BASE_EASINGS: Readonly<Record<string, readonly number[]>> =
  Object.fromEntries(
    Object.entries(motionTokens.easing).map(([name, curve]) => [
      name,
      [...curve],
    ])
  );

/** Every stagger step, ms. */
export const BASE_STAGGER: Readonly<Record<string, number>> = {
  ...staggerSteps,
};

/** One entry of carbon-motion's token registry, the part the panel shows. */
export interface RegistryToken {
  name: string;
  type: string;
  value: unknown;
  css?: string;
  status: string;
  description?: string;
}

/** The registry: tokens, patterns, surfaces and springs by name. */
export const REGISTRY: Readonly<Record<string, RegistryToken>> =
  Object.fromEntries(
    Object.entries(tokens as unknown as Record<string, RegistryToken>).map(
      ([name, t]) => [
        name,
        {
          name: t.name,
          type: t.type,
          value: JSON.parse(JSON.stringify(t.value ?? null)),
          css: t.css,
          status: t.status,
          description: t.description,
        },
      ]
    )
  );
