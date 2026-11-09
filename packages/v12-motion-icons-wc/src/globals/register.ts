/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Registration, matching Carbon v12's pure exports
 * (`@carbon/web-components` 3.0.0-alpha, `es/globals/register.js`):
 *
 *   defineCustomElement(clazz, { name?, registry? })
 *
 *  - the tag defaults to the class's static `is`, the registry to the global
 *    `customElements`;
 *  - registering the same class under the same tag again is a no-op;
 *  - a tag already owned by another class keeps its first owner (warns);
 *  - a class already registered under another tag is registered as a fresh
 *    subclass (a registry entry needs a distinct constructor), which is
 *    returned.
 *
 * Nothing here runs at import: classes are exported unregistered, and only
 * the per-icon `index.ts` entry points (and `define-all.ts`) register.
 * (The warning is development-only; the first owner is kept in production too.)
 */
import { DEV } from '@carbon-labs/motion-icons-core/dev';
export const prefix = 'clabs-motion';

type Ctor = CustomElementConstructor & { is?: string };

export interface DefineOptions {
  name?: string;
  registry?: CustomElementRegistry;
}

export function defineCustomElement<T extends Ctor>(
  clazz: T,
  options: DefineOptions = {}
): T {
  const registry =
    options.registry ??
    (typeof customElements !== 'undefined' ? customElements : undefined);
  const name = options.name ?? clazz.is;
  if (!registry || !name) {
    return clazz;
  }
  const owner = registry.get(name);
  if (owner) {
    if (DEV && owner !== clazz && !(owner.prototype instanceof clazz)) {
      console.warn(
        `[motion-icons] <${name}> is already defined by another class; keeping the first.`
      );
    }
    return owner as T;
  }
  const taken =
    typeof registry.getName === 'function' ? registry.getName(clazz) : null;
  const ctor = taken
    ? (class extends (clazz as unknown as new () => HTMLElement) {} as unknown as T)
    : clazz;
  registry.define(name, ctor);
  return ctor;
}
