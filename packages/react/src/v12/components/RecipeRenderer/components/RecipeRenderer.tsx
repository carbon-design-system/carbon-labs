/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  cloneElement,
  createElement,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {
  Column,
  Layer,
  Stack,
  Theme,
  usePrefix,
  useTheme,
} from '@carbon/react';
import { registry as defaultRegistry } from './registry';
import type { Recipe, RecipeEventDetail, RecipeNode } from './types';

type Raise = (event: string, args: unknown[]) => void;

/**
 * A recipe names a polarity relative to the page it is rendered on, so one
 * recipe is both the light screen and the dark one. Carbon's theme zone class
 * re-declares every token AND paints $background, so wrapping in <Theme> is
 * all a relative polarity needs — the same mechanism an absolute theme used,
 * with the name worked out at render time instead of written into the file.
 */
const DARK_THEMES = new Set(['g90', 'g100', 'dark', 'v12-dark']);

/** Which concrete Carbon theme a role means on this page. */
export function resolveTheme(
  role: 'page' | 'chrome',
  pageTheme: string | undefined
): 'white' | 'g100' {
  // Chrome does not follow the theme — it frames whatever does, and it is dark
  // in both polarities, as Carbon's own UI Shell header is. The contrast
  // between a dark shell and a light card is therefore a fact about the LIGHT
  // page only; on a dark page the card goes dark too and the shell is
  // unchanged. Naming it "inverse" instead produced the mirror image: a white
  // shell bar over a dark card, chrome as the brightest thing on the screen.
  if (role === 'chrome') {
    return 'g100';
  }
  // The lightest theme of the polarity: on white the raised card is $layer-01,
  // the lightest gray, and what sits on it (the composer, the user's bubble,
  // a menu) is the white rung above it with a rule. g10 would draw the card
  // white and leave those nowhere to stand.
  // "page" is the page's own polarity, resolved to a concrete theme rather
  // than passed through, because a page may be on a theme Carbon's <Theme>
  // does not accept as a prop (v12-dark warns), and the field has to work
  // from inside the chrome.
  return DARK_THEMES.has(pageTheme ?? '') ? 'g100' : 'white';
}

/** A recipe adds no styling. recipe-lint refuses these; the renderer drops them too. */
const REFUSED_PROPS = ['style', 'className'];

/**
 * "spacing-05" -> 5: the step Carbon's Stack takes for $spacing-05.
 */
export function spacingStep(token: string): number {
  const step = Number(/^spacing-(\d{2})$/.exec(token)?.[1]);
  if (!step) {
    throw new Error(`RecipeRenderer: "${token}" is not a Carbon spacing token`);
  }
  return step;
}

/** JSON props to React props: every { "$event": name } becomes a handler. */
function resolveProps(value: unknown, raise: Raise): unknown {
  if (Array.isArray(value)) {
    return value.map((v) => resolveProps(v, raise));
  }
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (typeof obj.$event === 'string') {
      const name = obj.$event;
      return (...args: unknown[]) => raise(name, args);
    }
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, resolveProps(v, raise)])
    );
  }
  return value;
}

interface Context {
  raise: Raise;
  prefix: string;
  registry: Record<string, ElementType>;
  /** The theme the page is on, read once at the root; relative themes resolve against it. */
  pageTheme: string | undefined;
}

function renderNode(node: RecipeNode, ctx: Context, key?: number): ReactNode {
  const Component = ctx.registry[node.component];
  if (!Component) {
    throw new Error(
      `RecipeRenderer: "${node.component}" is not in the registry (components/registry.ts)`
    );
  }
  const props = resolveProps(node.props ?? {}, ctx.raise) as Record<
    string,
    unknown
  >;
  REFUSED_PROPS.forEach((p) => delete props[p]);

  const children = node.children ?? [];
  children
    .filter((c) => c.slot)
    .forEach((c) => {
      props[c.slot as string] = renderNode(c, ctx);
    });
  const inline = children.filter((c) => !c.slot);
  let content = inline.length
    ? inline.map((c, i) => renderNode(c, ctx, i))
    : (props.children as ReactNode);
  delete props.children;
  if (node.gap && Component === Stack) {
    // A Stack takes the gap itself, keeping its own orientation.
    props.gap = spacingStep(node.gap);
  } else if (node.gap && inline.length) {
    content = <Stack gap={spacingStep(node.gap)}>{content}</Stack>;
  }

  // radius, fill and measure go on the component's OWN element, never a wrapper the way
  // padding does: a radius has to cut the surface the component paints, and a
  // wrapper that filled the screen would leave the painted surface inside it
  // the height of its content — which is the bug it was added to fix.
  const own = [
    !node.theme &&
      node.radius &&
      `${ctx.prefix}--recipe-renderer__radius--${node.radius}`,
    !node.theme &&
      node.surface &&
      `${ctx.prefix}--recipe-renderer__surface--${node.surface}`,
    node.fill && `${ctx.prefix}--recipe-renderer__fill--${node.fill}`,
    node.measure && `${ctx.prefix}--recipe-renderer__measure--${node.measure}`,
  ].filter(Boolean);
  if (own.length) {
    props.className = own.join(' ');
  }

  let element: ReactNode = createElement(Component, props, content);
  // Outermost of this node's wrappers: the polarity has to contain the
  // padding, the radius and the fill, or the surface it paints is inset from
  // the thing it is meant to be.
  if (node.theme) {
    // The Theme wrapper is a real element between this node and its parent, so
    // it has to carry the fill and the measure too — exactly as the padding
    // wrapper does. Without it the chain stops here: the card stopped filling
    // the shell and the transcript spilled past it.
    // The wrapper is the painted box when there is one: a theme zone paints
    // $background, so a surface and a radius on the element INSIDE it would
    // leave a square painted corner showing behind the rounded one. The
    // wrapper takes the paint and the radius; the node keeps its content.
    const themeClasses = [
      node.fill && `${ctx.prefix}--recipe-renderer__fill--${node.fill}`,
      node.measure &&
        `${ctx.prefix}--recipe-renderer__measure--${node.measure}`,
      node.radius && `${ctx.prefix}--recipe-renderer__radius--${node.radius}`,
      node.surface &&
        `${ctx.prefix}--recipe-renderer__surface--${node.surface}`,
    ].filter(Boolean);
    // A raised card is a layer, so what rests on it is the next one up:
    // Carbon's <Layer> moves the contextual $layer, $field and $border-subtle
    // a rung, the way Carbon stacks a tile on a tile. Without it a bubble or a
    // menu on the card took the card's own fill.
    if (node.surface === 'raised') {
      const layerClasses = [
        node.fill && `${ctx.prefix}--recipe-renderer__fill--${node.fill}`,
        node.measure &&
          `${ctx.prefix}--recipe-renderer__measure--${node.measure}`,
      ].filter(Boolean);
      element = (
        <Layer className={layerClasses.join(' ') || undefined}>{element}</Layer>
      );
    }
    element = (
      <Theme
        theme={resolveTheme(node.theme, ctx.pageTheme)}
        className={themeClasses.join(' ') || undefined}>
        {element}
      </Theme>
    );
  }
  if (node.padding || node.paddingBlock || node.paddingInline) {
    [node.padding, node.paddingBlock, node.paddingInline].forEach(
      (token) => token && spacingStep(token)
    );
    // The padding wrapper sits OUTSIDE the component, so a filling node needs
    // the fill class here too: otherwise this plain div stands between the
    // component and its parent and the chain stops at it. An axis given its
    // own token comes after the all-round one, so it wins on that axis.
    const padClasses = [
      node.padding &&
        `${ctx.prefix}--recipe-renderer__padding--${node.padding}`,
      node.paddingBlock &&
        `${ctx.prefix}--recipe-renderer__padding-block--${node.paddingBlock}`,
      node.paddingInline &&
        `${ctx.prefix}--recipe-renderer__padding-inline--${node.paddingInline}`,
      node.fill && `${ctx.prefix}--recipe-renderer__fill--${node.fill}`,
      node.measure &&
        `${ctx.prefix}--recipe-renderer__measure--${node.measure}`,
    ].filter(Boolean);
    element = <div className={padClasses.join(' ')}>{element}</div>;
  }
  if (node.grid) {
    element = <Column {...node.grid.span}>{element}</Column>;
  }
  // The key goes on the element itself, never on a Fragment around it: Carbon
  // parents that read their children (RadioButtonGroup, ProgressIndicator,
  // Tabs) clone them, and a clone of a Fragment reaches nothing.
  return key === undefined
    ? element
    : cloneElement(element as ReactElement, { key });
}

export interface RecipeRendererProps {
  /**
   * The recipe to render: a layout, widget or pattern-draft tree, or a flow
   */
  recipe: Recipe;

  /**
   * For a flow, the step to start on. Defaults to the first step
   */
  initialStep?: string;

  /**
   * Called with every event a recipe raises ({ "$event": name } in its props)
   */
  onEvent?: (event: string, detail: RecipeEventDetail) => void;

  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /**
   * The components a recipe may name. Defaults to the package registry
   */
  registry?: Record<string, ElementType>;
}

export const RecipeRenderer = forwardRef<HTMLDivElement, RecipeRendererProps>(
  function RecipeRenderer(
    { recipe, initialStep, onEvent, className, registry = defaultRegistry },
    ref
  ) {
    const prefix = usePrefix();
    // Read once, at the root: every relative theme in the tree is named
    // against the PAGE, not against the node above it, so nesting is
    // predictable — "page" inside an "inverse" returns to the page.
    const pageTheme = useTheme()?.theme;
    const first = initialStep ?? recipe.steps?.[0]?.id;
    const [stepId, setStepId] = useState(first);
    const moved = useRef(false);
    const stepRef = useRef<HTMLDivElement>(null);

    // A new recipe, or a new starting step, starts the flow again.
    useEffect(() => {
      moved.current = false;
      setStepId(first);
    }, [recipe, first]);

    // Moving to a step moves focus with it, so a keyboard user is not left
    // behind on a control that no longer exists.
    useEffect(() => {
      if (moved.current) {
        stepRef.current?.focus();
      }
    }, [stepId]);

    const step = recipe.steps?.find((s) => s.id === stepId);
    const raise = useCallback<Raise>(
      (event, args) => {
        onEvent?.(event, { recipe: recipe.name, step: step?.id, args });
        const target = step?.on?.[event];
        if (target) {
          moved.current = true;
          setStepId(target);
        }
      },
      [onEvent, recipe.name, step]
    );

    const ctx: Context = { raise, prefix, registry, pageTheme };
    let body: ReactNode = null;
    if (recipe.kind === 'flow') {
      if (!step) {
        throw new Error(
          `RecipeRenderer: flow "${recipe.name}" has no step "${stepId}"`
        );
      }
      body = (
        <div
          ref={stepRef}
          tabIndex={-1}
          className={`${prefix}--recipe-renderer__step`}
          data-step={step.id}>
          {renderNode(step.screen, ctx)}
        </div>
      );
    } else if (recipe.tree) {
      body = renderNode(recipe.tree, ctx);
    }

    return (
      <div
        ref={ref}
        className={cx(`${prefix}--recipe-renderer`, className)}
        data-recipe={recipe.name}>
        {body}
      </div>
    );
  }
);

RecipeRenderer.displayName = 'RecipeRenderer';

RecipeRenderer.propTypes = {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * For a flow, the step to start on. Defaults to the first step
   */
  initialStep: PropTypes.string,

  /**
   * Called with every event a recipe raises
   */
  onEvent: PropTypes.func,

  /**
   * The recipe to render
   */
  recipe: PropTypes.shape({
    name: PropTypes.string.isRequired,
    kind: PropTypes.oneOf(['layout', 'flow', 'widget', 'pattern-draft'])
      .isRequired,
  }).isRequired as PropTypes.Validator<Recipe>,

  /**
   * The components a recipe may name
   */
  registry: PropTypes.objectOf(
    PropTypes.elementType.isRequired
  ) as unknown as PropTypes.Validator<Record<string, ElementType>>,
};
