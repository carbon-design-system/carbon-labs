/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * A recipe, as recipe.schema.json describes it. The schema is the authority;
 * recipe-lint holds every recipe to it before anything renders.
 */
export type SpacingToken = `spacing-${string}`;

export type RadiusToken = `border-radius-${string}`;

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xlg' | 'max';

export interface RecipeNode {
  /** "<package>:<Export>", looked up in the registry */
  component: string;
  /** JSON props; { "$event": "<name>" } becomes a handler */
  props?: Record<string, unknown>;
  /** Render into the parent's prop of this name instead of its children */
  slot?: string;
  /** Place in a Carbon Column of the parent Grid */
  grid?: { span: Partial<Record<Breakpoint, number>> };
  /** Space between children, through Carbon's Stack */
  gap?: SpacingToken;
  /** Space inside, as a Carbon spacing token */
  padding?: SpacingToken;
  /** Space above and below, over padding on the block axis */
  paddingBlock?: SpacingToken;
  /** Space at the start and end, over padding on the inline axis */
  paddingInline?: SpacingToken;
  /** Corner radius, as a Carbon border-radius token, on the component's own element */
  radius?: RadiusToken;
  /** Fill the screen ("viewport"), the node above ("parent"), or absorb the overflow ("scroll") */
  fill?: 'viewport' | 'parent' | 'scroll';
  /** Cap at a named reading measure and centre, on the component's own element */
  measure?: 'reading';
  /** A polarity named by role: the page's own, or the shell's "chrome" */
  theme?: 'page' | 'chrome';
  /** The rung it rests on inside its polarity: the canvas, or a card one step up */
  surface?: 'base' | 'raised';
  children?: RecipeNode[];
}

export interface RecipeStep {
  id: string;
  screen: RecipeNode;
  /** event name -> the id of the step it moves to */
  on?: Record<string, string>;
}

export interface RecipeMeta {
  intent: string;
  useWhen: string[];
  preferInstead?: { when: string; use: string; because: string }[];
}

export interface Recipe {
  $schema?: string;
  name: string;
  kind: 'layout' | 'flow' | 'widget' | 'pattern-draft';
  status: 'draft' | 'preview';
  description: string;
  meta: RecipeMeta;
  tree?: RecipeNode;
  steps?: RecipeStep[];
}

export interface RecipeEventDetail {
  /** The recipe that raised it */
  recipe: string;
  /** The flow step it was raised on, if any */
  step?: string;
  /** Whatever the component passed its handler */
  args: unknown[];
}
