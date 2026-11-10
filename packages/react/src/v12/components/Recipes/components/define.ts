/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * A recipe's typed definition: its regions, the
 * layout at each size class, its states and the motion between them. The
 * definition is the source of truth: the recipe's React component reads it,
 * its page documents it, and a generator's JSON instance is checked against
 * it (`checkInstance`), so a generated screen can only put the components a
 * region accepts where that region is.
 */

import {
  SIZE_CLASSES,
  type RegionCorners,
  type RegionSurface,
  type SizeClass,
} from '@carbon-labs/react-app-shell';

export type { RegionCorners, RegionSurface, SizeClass };

export type RegionRole =
  | 'header'
  | 'nav'
  | 'page-header'
  | 'main'
  | 'list'
  | 'detail'
  | 'aside'
  | 'panel'
  | 'bar'
  | 'footer';
import type { KitDensity } from '@carbon-labs/react-kit-defaults';

/** A recipe's density: the KitDefaults it sets for its screen. */
export type Density = KitDensity;

export interface RegionDef {
  role: RegionRole;
  /** The kit components the region takes, by name (a generator may use only these). */
  accepts: readonly string[];
  required?: boolean;
  surface?: RegionSurface;
  /** The Region's `corners`: `square` or `rounded` (its surface's step). Default the surface's. */
  corners?: RegionCorners;
  /** The region's own density, over the recipe's (a filter bar is compact). */
  density?: Density;
  scroll?: 'page' | 'self' | 'none';
  /** A pane's width, in px. */
  width?: { default: number; min?: number; max?: number };
  /** One line for the region's slot on the recipe's page. */
  note?: string;
}

/** Where a panel goes at a size class: beside main, over the page, or as a sheet. */
export type PanelMode = 'push' | 'over' | 'sheet';

export interface LayoutDef {
  /** The regions shown side by side as panes, left to right. */
  panes: readonly string[];
  panel?: PanelMode;
  /** Regions that fold away at this size, and into what. */
  fold?: Readonly<Record<string, 'menu' | 'panel' | 'hidden'>>;
}

/** The carbon-motion primitive a transition's lead region plays. */
export type TransitionPrimitive =
  | 'structure-reveal'
  | 'reflow'
  | 'content-swap'
  | 'push'
  | 'contextual-bar';

export interface TransitionDef {
  from: string;
  to: string;
  /** Why it happens, when `from` and `to` are the same state (a filter changes). */
  reason?: string;
  lead: string;
  primitive: TransitionPrimitive;
  holds?: readonly string[];
  follows?: readonly string[];
  defers?: readonly string[];
}

export interface RecipeDef<
  Slots extends string = string,
  States extends string = string,
> {
  id: string;
  title: string;
  /** When to use it, in a sentence: a team's (or a generator's) guide to picking it. */
  use: string;
  /** When not to, and what to use instead. */
  avoid: string;
  density: Density;
  regions: Readonly<Record<Slots, RegionDef>>;
  layouts: Readonly<Record<SizeClass, LayoutDef>>;
  states: readonly States[];
  transitions: readonly TransitionDef[];
}

/** The states every recipe has. A recipe can name `empty` by its own word. */
const REQUIRED_STATES = ['loading', 'loaded', 'error'] as const;

/**
 * A recipe's definition, checked once when it's defined: every layout and
 * transition names regions and states that exist, and the required states
 * are there. A mistake throws, so it shows the first time the module loads.
 */
export function defineRecipe<
  const Slots extends string,
  const States extends string,
>(def: RecipeDef<Slots, States>): RecipeDef<Slots, States> {
  const problems = recipeProblems(def as RecipeDef);
  if (problems.length) {
    throw new Error(`defineRecipe(${def.id}): ${problems.join('; ')}`);
  }
  return def;
}

/** What's wrong with a definition, or nothing. */
export function recipeProblems(def: RecipeDef): string[] {
  const out: string[] = [];
  const regions = new Set(Object.keys(def.regions));
  const states = new Set<string>(def.states);
  for (const s of REQUIRED_STATES) {
    if (!states.has(s)) {
      out.push(`no "${s}" state`);
    }
  }
  for (const size of SIZE_CLASSES) {
    const layout = def.layouts[size];
    if (!layout) {
      out.push(`no layout at ${size}`);
      continue;
    }
    for (const r of [...layout.panes, ...Object.keys(layout.fold ?? {})]) {
      if (!regions.has(r)) {
        out.push(`${size} names an unknown region "${r}"`);
      }
    }
  }
  for (const t of def.transitions) {
    for (const s of [t.from, t.to]) {
      if (!states.has(s)) {
        out.push(`a transition names an unknown state "${s}"`);
      }
    }
    for (const r of [
      t.lead,
      ...(t.holds ?? []),
      ...(t.follows ?? []),
      ...(t.defers ?? []),
    ]) {
      if (!regions.has(r)) {
        out.push(`a transition names an unknown region "${r}"`);
      }
    }
  }
  return out;
}

/** One slot of a generated screen: a kit component by name, and its props. */
export interface SlotInstance {
  component: string;
  props?: Record<string, unknown>;
  /** Several components in one slot (a toolbar's search, filters and actions). */
  children?: readonly SlotInstance[];
}

/** A generated screen: a recipe, filled. This is the JSON a generator emits. */
export interface RecipeInstance {
  recipe: string;
  state?: string;
  density?: Density;
  slots: Record<string, SlotInstance | readonly SlotInstance[]>;
}

/**
 * The JSON Schema (2020-12) of a recipe's instances, from its definition: the
 * contract a generator fills. Each slot takes only the components its region
 * accepts; props are left open here (the component catalog types them).
 */
export function instanceSchema(def: RecipeDef): Record<string, unknown> {
  const slot = (accepts: readonly string[]) => ({
    type: 'object',
    required: ['component'],
    properties: {
      component: { enum: [...accepts] },
      props: { type: 'object' },
      children: { type: 'array', items: { $ref: '#/$defs/anySlot' } },
    },
    additionalProperties: false,
  });
  const slots = Object.fromEntries(
    Object.entries<RegionDef>(def.regions).map(([name, region]) => [
      name,
      {
        description: region.note ?? region.role,
        oneOf: [
          slot(region.accepts),
          { type: 'array', items: slot(region.accepts), minItems: 1 },
        ],
      },
    ])
  );
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: `recipes/${def.id}.json`,
    title: def.title,
    description: `${def.use} Avoid: ${def.avoid}`,
    type: 'object',
    required: ['recipe', 'slots'],
    properties: {
      recipe: { const: def.id },
      state: { enum: [...def.states] },
      density: { enum: ['compact', 'default', 'spacious'] },
      slots: {
        type: 'object',
        properties: slots,
        required: Object.entries<RegionDef>(def.regions)
          .filter(([, r]) => r.required)
          .map(([n]) => n),
        additionalProperties: false,
      },
    },
    additionalProperties: false,
    $defs: {
      anySlot: {
        type: 'object',
        required: ['component'],
        properties: {
          component: { type: 'string' },
          props: { type: 'object' },
          children: { type: 'array', items: { $ref: '#/$defs/anySlot' } },
        },
      },
    },
  };
}

/**
 * What's wrong with a generated screen against its recipe, or nothing: an
 * unknown recipe, state or slot; a component a slot doesn't accept; a
 * required slot left empty; a component the catalog doesn't have.
 */
export function checkInstance(
  instance: RecipeInstance,
  recipes: readonly RecipeDef[],
  catalog?: ReadonlySet<string>
): string[] {
  const def = recipes.find((r) => r.id === instance.recipe);
  if (!def) {
    return [`no recipe "${instance.recipe}"`];
  }
  const out: string[] = [];
  if (instance.state && !def.states.includes(instance.state)) {
    out.push(`no state "${instance.state}"`);
  }
  for (const [slot, region] of Object.entries<RegionDef>(def.regions)) {
    if (region.required && !(slot in instance.slots)) {
      out.push(`the required slot "${slot}" is empty`);
    }
  }
  const visit = (
    slot: string,
    region: RegionDef,
    s: SlotInstance,
    top: boolean
  ) => {
    if (catalog && !catalog.has(s.component)) {
      out.push(`${slot}: the catalog has no "${s.component}"`);
    }
    if (top && !region.accepts.includes(s.component)) {
      out.push(
        `${slot} doesn't take "${s.component}" (it takes ${region.accepts.join(', ')})`
      );
    }
    for (const c of s.children ?? []) {
      visit(slot, region, c, false);
    }
  };
  for (const [slot, value] of Object.entries(instance.slots)) {
    const region = (def.regions as Record<string, RegionDef>)[slot];
    if (!region) {
      out.push(`no slot "${slot}"`);
      continue;
    }
    for (const s of ([] as SlotInstance[]).concat(
      value as SlotInstance | SlotInstance[]
    )) {
      visit(slot, region, s, true);
    }
  }
  return out;
}
