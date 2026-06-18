/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Converts any casing variant to PascalCase.
 * "my-button" | "my_button" | "myButton" -> "MyButton"
 */
export function toPascalCase(str) {
  return str
    .replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toUpperCase());
}

/**
 * Converts any casing variant to param-case (kebab-case).
 * "MyButton" | "my_button" | "myButton" -> "my-button"
 */
export function toParamCase(str) {
  return str
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/[-_\s]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/**
 * Throws a descriptive error if the name would produce an invalid param-case identifier.
 */
export function validateComponentName(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('Component name is required.');
  }

  const param = toParamCase(name);

  if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(param) && !/^[a-z]$/.test(param)) {
    throw new Error(
      `Invalid component name "${name}" (resolves to "${param}"). ` +
        'Names must start with a letter and contain only lowercase letters, numbers, and hyphens.'
    );
  }

  if (name.trimStart().startsWith('_')) {
    throw new Error(
      `Component name "${name}" must not start with "_" — that prefix is reserved for internal namespaces (e.g. _squad/).`
    );
  }

  return true;
}

/**
 * Applies the correct casing for a component type.
 * - react -> PascalCase
 * - web-component -> param-case
 */
export function applyNameCasing(name, type) {
  if (type === 'web-component') return toParamCase(name);
  return toPascalCase(name);
}
